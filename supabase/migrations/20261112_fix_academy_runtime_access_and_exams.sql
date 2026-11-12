-- NovaLab Academy: restore parity between public app and verified database rules.
-- No auth accounts, lesson completions, XP ledger or existing exam attempts are removed.
CREATE OR REPLACE FUNCTION academy_private.lesson_in_main_path(p_lesson text,p_course text)
 RETURNS boolean LANGUAGE sql STABLE SET search_path TO ''
AS $path$
 SELECT p_course <> 'lua' OR p_lesson ~ '^lua-(0[1-9]|[12][0-9]|30)$'
  OR p_lesson ~ '^lua-path-[0-9]{3}$'
$path$;
REVOKE ALL ON FUNCTION academy_private.lesson_in_main_path(text,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION academy_private.lesson_in_main_path(text,text) TO authenticated;

CREATE OR REPLACE FUNCTION academy_private.project_examples(p_lessons text[])
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select case when (public.novalab_shop_enabled() and academy_private.current_tier() not in ('pro','ultimate','max')) or not academy_private.is_active() then '[]'::jsonb
 else coalesce(jsonb_agg(jsonb_build_object('lesson_id',li.id,'example',c.payload->>'example') order by v.ord),'[]'::jsonb) end
 from unnest(coalesce(p_lessons,array[]::text[])) with ordinality as v(id,ord)
 join public.ll_lesson_index li on li.id=v.id
 join public.ll_lesson_content c on c.lesson_id=li.id
 where auth.uid() is not null and academy_private.lesson_entitled(li.id)
 and exists(select 1 from academy_private.academy_course_visits vis where vis.user_id=auth.uid() and vis.lesson_id=li.id)
$function$
;

CREATE OR REPLACE FUNCTION public.academy_reference_get()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select case when academy_private.is_active() and (not public.novalab_shop_enabled() or academy_private.current_tier()='max')
 then coalesce(jsonb_object_agg(lang,payload),'{}'::jsonb)
 else '{}'::jsonb end from academy_private.academy_reference_library
$function$
;

CREATE OR REPLACE FUNCTION academy_private.service(p_action text, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare who uuid:=auth.uid(); admin_user boolean; beta boolean; tid uuid; cat text; target_tier text;
 msg text; r text; requested_status text; days_count integer; t academy_private.academy_tickets%rowtype;
begin
 if who is null or not academy_private.is_active() then raise exception 'Konto ist nicht aktiv'; end if;
 admin_user:=academy_private.is_admin();
 select beta_open into beta from academy_private.academy_settings where singleton=true;
 if p_action='list' then
  return jsonb_build_object('beta_open',coalesce(beta,true),
   'mine',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from
      (select id,category,tier,message,status,reply,created_at,updated_at,term_months,quoted_cents from academy_private.academy_tickets
       where user_id=who order by created_at desc limit 30) x),'[]'::jsonb),
   'admin',case when admin_user then coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from
      (select ticket_row.id,ticket_row.category,ticket_row.tier,ticket_row.message,ticket_row.status,ticket_row.reply,ticket_row.created_at,ticket_row.updated_at,ticket_row.term_months,ticket_row.quoted_cents,
              coalesce(p.username,p.display_name,'Mitglied') as username
       from academy_private.academy_tickets ticket_row join public.academy_profiles p on p.id=ticket_row.user_id
       order by case when ticket_row.status='open' then 0 else 1 end,ticket_row.created_at desc limit 100) x),'[]'::jsonb) else '[]'::jsonb end);
 elsif p_action='create' then
  cat:=p_payload->>'category';msg:=btrim(p_payload->>'message');target_tier:=p_payload->>'tier';
  if cat not in ('support','bug','beta','plan') or char_length(msg) not between 10 and 2000 then
   raise exception 'Kategorie oder Nachricht ungültig (10–2000 Zeichen)';end if;
  if cat='plan' and not public.novalab_shop_enabled() then raise exception 'Der Shop ist deaktiviert';end if;
  if cat in ('beta','plan') and not beta then raise exception 'Beta-Anfragen sind derzeit geschlossen';end if;
  if cat='plan' and target_tier not in ('pro','ultimate','max') then raise exception 'Tarif auswählen';end if;
  if (select count(*) from academy_private.academy_tickets where user_id=who and created_at>now()-interval '1 day')>=5 then
   raise exception 'Maximal fünf Anfragen pro 24 Stunden';end if;
  if cat='plan' and coalesce((p_payload->>'months')::integer,1) not in (1,3,12) then
   raise exception 'Laufzeit muss 1, 3 oder 12 Monate betragen'; end if;
  insert into academy_private.academy_tickets(user_id,category,tier,message,term_months,quoted_cents)
  values(who,cat,case when cat='plan' then target_tier else null end,msg,
   case when cat='plan' then coalesce((p_payload->>'months')::integer,1) end,
   case when cat='plan' then (academy_private.shop_quote(target_tier,coalesce((p_payload->>'months')::integer,1))->>'total_cents')::integer end)
  returning id into tid;
  return jsonb_build_object('ok',true,'id',tid,'months',case when cat='plan' then coalesce((p_payload->>'months')::integer,1) end);
 elsif p_action='set_beta' then
  if not admin_user then raise exception 'Nur Administratoren';end if;
  update academy_private.academy_settings set beta_open=(p_payload->>'enabled')::boolean,updated_at=now()
  where singleton=true returning beta_open into beta;
  return jsonb_build_object('ok',true,'beta_open',beta);
 elsif p_action='respond' then
  if not admin_user then raise exception 'Nur Administratoren';end if;
  tid:=(p_payload->>'id')::uuid;r:=btrim(coalesce(p_payload->>'reply',''));
  requested_status:=p_payload->>'status';
  if requested_status not in ('answered','closed','approved','rejected') or char_length(r)>2000 then
   raise exception 'Ungültige Antwort oder Status';end if;
  select * into t from academy_private.academy_tickets where id=tid for update;
  if not found then raise exception 'Anfrage nicht gefunden';end if;
  if requested_status='approved' then
   if t.category<>'plan' or t.tier not in ('pro','ultimate','max') then raise exception 'Nur Tarif-Anfragen können freigegeben werden';end if;
   if t.status='approved' then raise exception 'Bereits genehmigt';end if;
   days_count:=coalesce((p_payload->>'days')::integer,case when t.term_months in (1,3,12) then null else 30 end);
   if days_count is not null and days_count not between 1 and 3650 then raise exception 'Laufzeit: 1 bis 3650 Tage';end if;
   insert into public.academy_plans(user_id,tier,granted_by,expires_at,updated_at)
   values(t.user_id,t.tier,who,case when days_count is null then now()+make_interval(months=>t.term_months) else now()+make_interval(days=>days_count) end,now())
   on conflict(user_id) do update set tier=excluded.tier,expires_at=excluded.expires_at,
     granted_by=excluded.granted_by,updated_at=now();
   if r='' then r:='Deine Mitgliedschaft wurde für '||(case when days_count is null then t.term_months||' Monate' else days_count||' Tage' end)||' freigeschaltet.';end if;
  end if;
  update academy_private.academy_tickets set status=requested_status,reply=nullif(r,''),updated_at=now() where id=tid;
  return jsonb_build_object('ok',true,'status',requested_status);
 end if;
 raise exception 'Unbekannte Aktion';
end $function$
;

CREATE OR REPLACE FUNCTION public.novalab_set_shop_enabled(p_enabled boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
 if auth.uid() is null or not academy_private.session_verified() or not exists (
  select 1 from public.academy_profiles
  where id=auth.uid() and role='admin' and active=true and access_status='approved'
 ) then
  raise exception 'Administrator access required';
 end if;
 insert into public.novalab_platform_flags(key,enabled,updated_at)
 values ('shop',p_enabled,now())
 on conflict(key) do update set enabled=excluded.enabled,updated_at=now();
 return p_enabled;
end $function$
;

CREATE OR REPLACE FUNCTION public.academy_exam_start(p_course text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare who uuid:=auth.uid(); cap int;used int;needed int;completed int;answers jsonb;clean jsonb;attempt uuid;today date;
begin
 if not academy_private.is_active() then return jsonb_build_object('ok',false,'error','Konto nicht freigegeben');end if;
 if p_course is null or length(p_course)>120 or not academy_private.course_allowed(p_course) then
  return jsonb_build_object('ok',false,'reason','tier','error','Dieser Kurs ist für deine Mitgliedschaft nicht freigeschaltet');end if;
 select count(*) into needed from public.ll_lesson_index li
 where li.course_id=p_course and academy_private.lesson_entitled(li.id) and academy_private.lesson_in_main_path(li.id,li.course_id);
 select count(*) into completed from public.ll_lesson_index li
 where li.course_id=p_course and academy_private.lesson_entitled(li.id) and academy_private.lesson_in_main_path(li.id,li.course_id)
 and exists(select 1 from public.academy_progress pr where pr.user_id=who and pr.key='liverylab-v10'
 and pr.payload->'done' ? li.id);
 if needed=0 or completed<>needed then
  return jsonb_build_object('ok',false,'reason','incomplete','error','Schließe zuerst die freigeschalteten Lektionen ab');end if;
 perform pg_advisory_xact_lock(hashtextextended(who::text,191));
 today:=(now() at time zone 'Europe/Berlin')::date;
 cap:=academy_private.exam_limit();
 select count(*) into used from academy_private.academy_exam_attempts where user_id=who and usage_day=today;
 -- An unfinished exam can be resumed without charging another daily attempt.
 select id,questions into attempt,answers from academy_private.academy_exam_attempts
 where user_id=who and course_id=p_course and completed_at is null
   and started_at>now()-interval '3 hours'
 order by started_at desc limit 1 for update;
 if attempt is not null then
   select coalesce(jsonb_agg(jsonb_build_object('payload',jsonb_build_object(
     'quiz',q->'quiz','options',q->'options'))),'[]'::jsonb)
   into clean from jsonb_array_elements(answers) q;
   return jsonb_build_object('ok',true,'attempt_id',attempt,'resumed',true,
     'questions',clean,'limit',cap,'used',used,
     'remaining',case when cap<0 then -1 else greatest(0,cap-used) end);
 end if;
 if cap>=0 and used>=cap then return jsonb_build_object('ok',false,'reason','daily_limit','limit',cap,'used',used,'remaining',0,'error','Dein Tageslimit für Prüfungen ist erreicht');end if;
 select coalesce(jsonb_agg(jsonb_build_object('lesson_id',lesson_id,'quiz',payload->'quiz','options',payload->'options','correct',payload->'correct')),'[]'::jsonb)
 into answers
 from (select c.lesson_id,c.payload from public.ll_lesson_content c
  join public.ll_lesson_index li on li.id=c.lesson_id
  where li.course_id=p_course and academy_private.lesson_entitled(li.id) and academy_private.lesson_in_main_path(li.id,li.course_id)
  and jsonb_typeof(c.payload->'options')='array' and jsonb_array_length(c.payload->'options')>=2
  and c.payload ? 'correct'
  order by random() limit 20) question_source;
 if jsonb_array_length(answers)<1 then return jsonb_build_object('ok',false,'reason','empty','error','Für diesen Kurs fehlen Prüfungsfragen');end if;
 insert into academy_private.academy_exam_attempts(user_id,course_id,usage_day,questions)
 values(who,p_course,today,answers) returning id into attempt;
 select coalesce(jsonb_agg(jsonb_build_object('payload',jsonb_build_object('quiz',q->'quiz','options',q->'options'))),'[]'::jsonb)
 into clean from jsonb_array_elements(answers) q;
 return jsonb_build_object('ok',true,'attempt_id',attempt,'questions',clean,'limit',cap,'used',used+1,
 'remaining',case when cap<0 then -1 else greatest(0,cap-used-1) end);
end
$function$
;

CREATE OR REPLACE FUNCTION academy_private.exam_questions(p_course text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare ret jsonb; required_count int; completed_count int;
begin
 if not academy_private.is_active() or not academy_private.course_allowed(p_course) then
   raise exception 'Account or course not authorized';
 end if;
 select count(*) into required_count from public.ll_lesson_index
 where course_id=p_course and academy_private.lesson_entitled(id) and academy_private.lesson_in_main_path(id,p_course);
 select count(*) into completed_count from public.ll_lesson_index li
 where li.course_id=p_course and academy_private.lesson_entitled(li.id) and academy_private.lesson_in_main_path(li.id,li.course_id)
 and exists(
 select 1 from public.academy_progress pr
 where pr.user_id=auth.uid() and pr.key='liverylab-v10'
 and pr.payload->'done' ? li.id);
 if required_count<1 or required_count<>completed_count then
   raise exception 'Kurs bitte vor der Abschlussprüfung beenden';
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('lesson_id',lesson_id,
   'payload',jsonb_build_object('quiz',payload->'quiz','options',payload->'options','correct',payload->'correct'))),'[]'::jsonb)
 into ret
 from (select c.lesson_id,c.payload from public.ll_lesson_content c
 join public.ll_lesson_index li on li.id=c.lesson_id
 where li.course_id=p_course and academy_private.lesson_entitled(li.id) and academy_private.lesson_in_main_path(li.id,li.course_id)
 and jsonb_typeof(c.payload->'options')='array'
 and jsonb_array_length(c.payload->'options')>=2
 order by random() limit 20) questions;
 return ret;
end $function$
;
