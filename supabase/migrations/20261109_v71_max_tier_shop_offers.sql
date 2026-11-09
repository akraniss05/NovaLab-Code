-- Max is the only unlimited tier. 12-month subscriptions include a 5% annual discount.
-- Quotes and manual support requests never charge or auto-activate an account.
ALTER TABLE public.academy_plans DROP CONSTRAINT academy_plans_tier_check;
ALTER TABLE public.academy_plans ADD CONSTRAINT academy_plans_tier_check CHECK(tier in ('free','pro','ultimate','max'));
ALTER TABLE academy_private.academy_tickets DROP CONSTRAINT academy_tickets_tier_check;
ALTER TABLE academy_private.academy_tickets ADD CONSTRAINT academy_tickets_tier_check CHECK(tier in ('pro','ultimate','max'));
ALTER TABLE academy_private.academy_vouchers DROP CONSTRAINT academy_vouchers_tier_check;
ALTER TABLE academy_private.academy_vouchers ADD CONSTRAINT academy_vouchers_tier_check CHECK(tier in ('pro','ultimate','max','all'));
ALTER TABLE academy_private.academy_tickets ADD COLUMN IF NOT EXISTS term_months integer CHECK(term_months IS NULL OR term_months IN (1,3,12));
ALTER TABLE academy_private.academy_tickets ADD COLUMN IF NOT EXISTS quoted_cents integer CHECK(quoted_cents IS NULL OR quoted_cents>=0);
CREATE TABLE IF NOT EXISTS academy_private.academy_shop_offers(
 tier text NOT NULL CHECK(tier in ('pro','ultimate','max')),
 months integer NOT NULL CHECK(months in (1,3,12)),
 promo_percent integer NOT NULL DEFAULT 0 CHECK(promo_percent between 0 and 90),
 updated_at timestamptz NOT NULL DEFAULT now(),
 updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 PRIMARY KEY(tier,months)
);
INSERT INTO academy_private.academy_shop_offers(tier,months,promo_percent)
SELECT tiers.tier,terms.months,0 FROM (VALUES ('pro'),('ultimate'),('max')) tiers(tier)
CROSS JOIN (VALUES(1),(3),(12)) terms(months) ON CONFLICT (tier,months) DO NOTHING;
REVOKE ALL ON academy_private.academy_shop_offers FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION academy_private.shop_quote(p_tier text,p_months integer)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $q$
 SELECT jsonb_build_object('tier',tier,'months',months,'monthly_cents',price,
  'base_cents',price*months,'year_discount_percent',CASE WHEN months=12 THEN 5 ELSE 0 END,
  'annual_cents',round(price*months*(CASE WHEN months=12 THEN 0.95 ELSE 1 END))::integer,
  'promo_percent',promo_percent,
  'total_cents',round(round(price*months*(CASE WHEN months=12 THEN 0.95 ELSE 1 END))*(100-promo_percent)/100.0)::integer)
 FROM (SELECT o.tier,o.months,o.promo_percent,
   CASE o.tier WHEN 'pro' THEN 199 WHEN 'ultimate' THEN 599 WHEN 'max' THEN 1199 END price
  FROM academy_private.academy_shop_offers o WHERE o.tier=p_tier AND o.months=p_months) offers
$q$;
REVOKE ALL ON FUNCTION academy_private.shop_quote(text,integer) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.academy_shop_offers(p_tier text DEFAULT NULL,p_months integer DEFAULT NULL,p_percent integer DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $q$
DECLARE offers jsonb;
BEGIN
 IF NOT academy_private.is_active() THEN RAISE EXCEPTION 'Aktives Konto erforderlich'; END IF;
 IF p_percent IS NOT NULL THEN
  IF NOT academy_private.is_admin() THEN RAISE EXCEPTION 'Nur Administratoren'; END IF;
  IF p_tier NOT IN ('pro','ultimate','max') OR p_months NOT IN (1,3,12) OR p_percent NOT BETWEEN 0 AND 90
   THEN RAISE EXCEPTION 'Ungültiger Tarif, Laufzeit oder Rabatt'; END IF;
  UPDATE academy_private.academy_shop_offers SET promo_percent=p_percent,updated_at=now(),updated_by=auth.uid()
  WHERE tier=p_tier AND months=p_months;
 ELSIF p_tier IS NOT NULL OR p_months IS NOT NULL THEN RAISE EXCEPTION 'Ungültige Shop-Aktion'; END IF;
 SELECT coalesce(jsonb_agg(academy_private.shop_quote(tier,months) ORDER BY tier,months),'[]'::jsonb)
 INTO offers FROM academy_private.academy_shop_offers;
 RETURN offers;
END $q$;
REVOKE ALL ON FUNCTION public.academy_shop_offers(text,integer,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.academy_shop_offers(text,integer,integer) TO authenticated;
CREATE OR REPLACE FUNCTION academy_private.current_tier()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select case
 when academy_private.is_admin() then 'max'
 else coalesce((
   select case when ap.expires_at is null or ap.expires_at>now() then ap.tier else 'free' end
   from public.academy_plans ap where ap.user_id=auth.uid()
 ),'free') end $function$;

CREATE OR REPLACE FUNCTION academy_private.course_limit()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select case academy_private.current_tier() when 'max' then 2147483647 when 'ultimate' then 30 when 'pro' then 20 else 10 end $function$;

CREATE OR REPLACE FUNCTION academy_private.daily_limit()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select case academy_private.current_tier() when 'max' then -1 when 'ultimate' then 15 when 'pro' then 10 else 5 end $function$;

CREATE OR REPLACE FUNCTION academy_private.exam_limit()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select case academy_private.current_tier()
 when 'free' then 2 when 'pro' then 4 when 'ultimate' then 8 else -1 end
$function$;

CREATE OR REPLACE FUNCTION academy_private.course_allowed(p_course text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select case when academy_private.current_tier()='max'
 then exists(select 1 from public.ll_courses where id=p_course)
 else exists(select 1 from academy_private.academy_course_catalog cc
 where cc.course_id=p_course and cc.course_rank<=academy_private.course_limit())
 end
$function$;

CREATE OR REPLACE FUNCTION academy_private.lesson_entitled(p_lesson text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select exists(select 1 from public.ll_lesson_index li
 where li.id=p_lesson and academy_private.course_allowed(li.course_id)
 and (academy_private.is_admin() or li.required_plan='free'
  or (li.required_plan='plus' and academy_private.current_tier() in ('pro','ultimate','max'))
  or (li.required_plan='pro' and academy_private.current_tier() in ('ultimate','max')))) $function$;

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
end $function$;

CREATE OR REPLACE FUNCTION academy_private.voucher_create_flexible(p_kind text, p_tier text, p_percent integer, p_duration_value integer, p_duration_unit text, p_max_uses integer, p_valid_value integer, p_valid_unit text, p_custom_code text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare code_text text; duration_seconds bigint;valid_seconds bigint;created integer;
begin
 if not academy_private.is_admin() then raise exception 'Nur Administratoren';end if;
 if p_kind not in ('gift','discount') or p_tier not in ('pro','ultimate','max','all') or (p_tier='all' and p_kind<>'discount') then raise exception 'Typ oder Tarif ungültig';end if;
 if p_duration_unit not in ('minute','day','year') or p_valid_unit not in ('minute','day','year') then raise exception 'Zeiteinheit ungültig';end if;
 if p_duration_value not between 1 and 10000 or p_valid_value not between 1 and 10000 or p_max_uses not between 1 and 1000 then raise exception 'Werte außerhalb des erlaubten Bereichs';end if;
 duration_seconds:=p_duration_value::bigint * case p_duration_unit when 'minute' then 60 when 'day' then 86400 else 31536000 end;
 valid_seconds:=p_valid_value::bigint * case p_valid_unit when 'minute' then 60 when 'day' then 86400 else 31536000 end;
 if duration_seconds>315360000 or valid_seconds>315360000 then raise exception 'Maximal zehn Jahre';end if;
 if p_kind='discount' and p_percent not between 1 and 90 then raise exception 'Rabatt: 1 bis 90 Prozent';end if;
 code_text:=upper(btrim(coalesce(p_custom_code,'')));
 if code_text='' then code_text:='LL-'||upper(encode(extensions.gen_random_bytes(9),'hex'));end if;
 if length(code_text) not between 3 and 64 or code_text !~ '^[A-Z0-9][A-Z0-9-]*$' then raise exception 'Ungültiger Gutscheincode';end if;
 insert into academy_private.academy_vouchers(code,kind,tier,discount_percent,membership_days,membership_seconds,max_uses,expires_at,created_by)
 values(code_text,p_kind,p_tier,case when p_kind='discount' then p_percent end,
  case when p_kind='gift' then 1 end,case when p_kind='gift' then duration_seconds end,
  p_max_uses,now()+make_interval(secs=>valid_seconds::double precision),auth.uid())
 on conflict(code) do nothing;
 get diagnostics created=row_count;
 if created<>1 then return jsonb_build_object('ok',false,'error','Code schon vergeben');end if;
 return jsonb_build_object('ok',true,'code',code_text,'expires_at',now()+make_interval(secs=>valid_seconds::double precision));
end $function$;

CREATE OR REPLACE FUNCTION academy_private.voucher_apply(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v academy_private.academy_vouchers%rowtype;who uuid:=auth.uid();
 old_tier text;old_expires timestamptz;expires_new timestamptz;original_cents integer;final_cents integer;
begin
 if who is null or not academy_private.is_active() then raise exception 'Konto ist nicht aktiv';end if;
 if p_code is null or length(trim(p_code)) not between 3 and 64 or trim(p_code) !~* '^[a-z0-9-]+$' then raise exception 'Ungültiger Gutscheincode';end if;
 select * into v from academy_private.academy_vouchers where code=upper(trim(p_code)) for update;
 if not found or not v.active or v.deleted_at is not null or v.expires_at<=now() or v.uses>=v.max_uses then
  return jsonb_build_object('ok',false,'error','Code ungültig, abgelaufen oder aufgebraucht');end if;
 if exists(select 1 from academy_private.academy_voucher_claims where code=v.code and user_id=who) then
  return jsonb_build_object('ok',false,'error','Diesen Code hast du bereits eingelöst');end if;
 if v.kind='gift' then
  select tier,expires_at into old_tier,old_expires from public.academy_plans where user_id=who for update;
  if (case old_tier when 'max' then 3 when 'ultimate' then 2 when 'pro' then 1 else 0 end) > (case v.tier when 'max' then 3 when 'ultimate' then 2 when 'pro' then 1 else 0 end) and (old_expires is null or old_expires>now()) then
   return jsonb_build_object('ok',false,'error','Du hast bereits einen höheren Tarif');end if;
  if old_tier=v.tier and old_expires is null then
   return jsonb_build_object('ok',false,'error','Deine Mitgliedschaft ist dauerhaft freigeschaltet');end if;
  expires_new:=greatest(now(),case when old_tier=v.tier then old_expires else null end)
    +make_interval(secs=>coalesce(v.membership_seconds,v.membership_days::bigint*86400)::double precision);
  insert into public.academy_plans(user_id,tier,granted_by,expires_at,updated_at)
  values(who,v.tier,v.created_by,expires_new,now()) on conflict(user_id) do update set
    tier=excluded.tier,expires_at=excluded.expires_at,granted_by=excluded.granted_by,updated_at=now();
 end if;
 insert into academy_private.academy_voucher_claims(code,user_id) values(v.code,who);
 update academy_private.academy_vouchers set uses=uses+1 where code=v.code;
 if v.kind='gift' then return jsonb_build_object('ok',true,'kind','gift','tier',v.tier,'expires_at',expires_new);end if;
 original_cents:=case v.tier when 'pro' then 199 when 'ultimate' then 599 when 'max' then 1199 else 0 end;
 final_cents:=round(original_cents*(100-v.discount_percent)/100.0)::int;
 return jsonb_build_object('ok',true,'kind','discount','tier',v.tier,'percent',v.discount_percent,
   'original_cents',original_cents,'final_cents',final_cents,'message','Rabatt reserviert, keine Zahlung');
end $function$;

CREATE OR REPLACE FUNCTION academy_private.voucher_status()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare who uuid:=auth.uid();cap integer;used_count integer;d date;tier_name text;expiry timestamptz;result jsonb;
begin
 if who is null or not academy_private.is_active() then raise exception 'Konto nicht aktiv';end if;
 cap:=academy_private.daily_limit();tier_name:=academy_private.current_tier();d:=(now() at time zone 'Europe/Berlin')::date;
 select count(*) into used_count from academy_private.academy_course_visits where user_id=who and usage_day=d;
 select ap.expires_at into expiry from public.academy_plans ap where ap.user_id=who;
 select jsonb_build_object('code',v.code,'tier',v.tier,'percent',v.discount_percent,
   'original_cents',case v.tier when 'pro' then 199 when 'ultimate' then 599 when 'max' then 1199 else 0 end,
   'final_cents',round((case v.tier when 'pro' then 199 when 'ultimate' then 599 when 'max' then 1199 else 0 end)*(100-v.discount_percent)/100.0)::integer)
 into result from academy_private.academy_voucher_claims cl join academy_private.academy_vouchers v on v.code=cl.code
 where cl.user_id=who and v.kind='discount' order by cl.claimed_at desc limit 1;
 return jsonb_build_object('tier',tier_name,'course_limit',academy_private.course_limit(),'daily_limit',cap,
   'used_today',used_count,'remaining_today',case when cap<0 then -1 else greatest(0,cap-used_count) end,
   'today',d,'expires_at',expiry,'discount',result);
end $function$;

-- Other old tier gates must recognize Max or require Max only for full access.
CREATE OR REPLACE FUNCTION academy_private.consume_tool(p_feature text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare who uuid;level text;
begin
 who:=auth.uid();
 if who is null or not academy_private.is_active() then raise exception 'Account not active';end if;
 if p_feature not in ('music_wav','music_multitrack','music_advanced_fx','music_midi','code_run','code_export','code_advanced','studio3d_export','studio3d_advanced','video_export','video_advanced') then raise exception 'Unknown feature';end if;
 select coalesce((select tier from public.academy_plans where user_id=who),'free') into level;
 return jsonb_build_object('allowed',level='max','tier',level,'feature',p_feature,'remaining',case when level='max' then -1 else 0 end,'limit',case when level='max' then -1 else 0 end,'ultimate_only',level<>'max');
end $function$;

CREATE OR REPLACE FUNCTION academy_private.project_examples(p_lessons text[])
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select case when academy_private.current_tier() not in ('pro','ultimate','max') or not academy_private.is_active() then '[]'::jsonb
 else coalesce(jsonb_agg(jsonb_build_object('lesson_id',li.id,'example',c.payload->>'example') order by v.ord),'[]'::jsonb) end
 from unnest(coalesce(p_lessons,array[]::text[])) with ordinality as v(id,ord)
 join public.ll_lesson_index li on li.id=v.id
 join public.ll_lesson_content c on c.lesson_id=li.id
 where auth.uid() is not null and academy_private.lesson_entitled(li.id)
 and exists(select 1 from academy_private.academy_course_visits vis where vis.user_id=auth.uid() and vis.lesson_id=li.id)
$function$;

CREATE OR REPLACE FUNCTION academy_private.voucher_create(p_kind text, p_tier text, p_percent integer, p_membership_days integer, p_max_uses integer, p_valid_days integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare new_code text;
begin
 if not academy_private.is_admin() then raise exception 'Only admins can create vouchers';end if;
 if p_kind not in ('gift','discount') or p_tier not in ('pro','ultimate','max') then raise exception 'Ungültiger Gutscheintyp';end if;
 if p_max_uses not between 1 and 1000 or p_valid_days not between 1 and 365 then raise exception 'Ungültige Gültigkeit oder Nutzungszahl';end if;
 if p_kind='gift' and (p_membership_days is null or p_membership_days not between 1 and 365) then raise exception 'Eine kostenlose Mitgliedschaft braucht 1 bis 365 Tage Laufzeit';end if;
 if p_kind='discount' and (p_percent is null or p_percent not between 1 and 90) then raise exception 'Rabatt muss zwischen 1 und 90 Prozent liegen';end if;
 new_code:='LL-'||upper(encode(extensions.gen_random_bytes(9),'hex'));
 insert into academy_private.academy_vouchers(code,kind,tier,discount_percent,membership_days,max_uses,expires_at,created_by)
 values(new_code,p_kind,p_tier,case when p_kind='discount' then p_percent else null end,
  case when p_kind='gift' then p_membership_days else null end,p_max_uses,now()+make_interval(days=>p_valid_days),auth.uid());
 return jsonb_build_object('ok',true,'code',new_code,'kind',p_kind,'tier',p_tier,'max_uses',p_max_uses);
end
$function$;

CREATE OR REPLACE FUNCTION academy_private.voucher_create_custom(p_kind text, p_tier text, p_percent integer, p_membership_days integer, p_max_uses integer, p_valid_days integer, p_custom_code text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare code_text text; created integer;
begin
 if not academy_private.is_admin() then raise exception 'Nur Administratoren können Gutscheine erstellen';end if;
 if p_custom_code is null or btrim(p_custom_code)='' then
   return academy_private.voucher_create(p_kind,p_tier,p_percent,p_membership_days,p_max_uses,p_valid_days);
 end if;
 code_text:=upper(btrim(p_custom_code));
 if length(code_text) not between 3 and 64 or code_text !~ '^[A-Z0-9][A-Z0-9-]*$' then
  return jsonb_build_object('ok',false,'error','3 bis 64 Buchstaben, Zahlen oder Bindestriche, ohne Leerzeichen.');
 end if;
 if p_kind not in ('gift','discount') or p_tier not in ('pro','ultimate','max')
 then raise exception 'Ungültiger Gutscheintyp oder Tarif';end if;
 if p_max_uses not between 1 and 1000 or p_valid_days not between 1 and 365
 then raise exception 'Ungültige Nutzung oder Gültigkeit';end if;
 if p_kind='gift' and (p_membership_days is null or p_membership_days not between 1 and 365)
 then raise exception 'Eine Gratis-Mitgliedschaft benötigt 1 bis 365 Tage';end if;
 if p_kind='discount' and (p_percent is null or p_percent not between 1 and 90)
 then raise exception 'Rabatt muss zwischen 1 und 90 Prozent liegen';end if;
 insert into academy_private.academy_vouchers(code,kind,tier,discount_percent,membership_days,max_uses,expires_at,created_by)
 values(code_text,p_kind,p_tier,case when p_kind='discount' then p_percent else null end,
 case when p_kind='gift' then p_membership_days else null end,
 p_max_uses,now()+make_interval(days=>p_valid_days),auth.uid())
 on conflict(code) do nothing;
 get diagnostics created=row_count;
 if created<>1 then return jsonb_build_object('ok',false,'error','Dieser Gutscheincode ist schon vergeben.');end if;
 return jsonb_build_object('ok',true,'code',code_text,'kind',p_kind,'tier',p_tier,'max_uses',p_max_uses);
end $function$;

CREATE OR REPLACE FUNCTION public.academy_reference_get()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select case when academy_private.is_active() and academy_private.current_tier()='max'
 then coalesce(jsonb_object_agg(lang,payload),'{}'::jsonb)
 else '{}'::jsonb end from academy_private.academy_reference_library
$function$;
