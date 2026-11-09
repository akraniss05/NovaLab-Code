-- Fix support inbox query: the PL/pgSQL record variable `t` shadows the table alias `t`.
-- Only replace the function; do not modify existing tickets, messages or grants.
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
      (select id,category,tier,message,status,reply,created_at,updated_at from academy_private.academy_tickets
       where user_id=who order by created_at desc limit 30) x),'[]'::jsonb),
   'admin',case when admin_user then coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from
      (select ticket_row.id,ticket_row.category,ticket_row.tier,ticket_row.message,ticket_row.status,ticket_row.reply,ticket_row.created_at,ticket_row.updated_at,
              coalesce(p.username,p.display_name,'Mitglied') as username
       from academy_private.academy_tickets ticket_row join public.academy_profiles p on p.id=ticket_row.user_id
       order by case when ticket_row.status='open' then 0 else 1 end,ticket_row.created_at desc limit 100) x),'[]'::jsonb) else '[]'::jsonb end);
 elsif p_action='create' then
  cat:=p_payload->>'category';msg:=btrim(p_payload->>'message');target_tier:=p_payload->>'tier';
  if cat not in ('support','bug','beta','plan') or char_length(msg) not between 10 and 2000 then
   raise exception 'Kategorie oder Nachricht ungültig (10–2000 Zeichen)';end if;
  if cat in ('beta','plan') and not beta then raise exception 'Beta-Anfragen sind derzeit geschlossen';end if;
  if cat='plan' and target_tier not in ('pro','ultimate') then raise exception 'Tarif auswählen';end if;
  if (select count(*) from academy_private.academy_tickets where user_id=who and created_at>now()-interval '1 day')>=5 then
   raise exception 'Maximal fünf Anfragen pro 24 Stunden';end if;
  insert into academy_private.academy_tickets(user_id,category,tier,message)
  values(who,cat,case when cat='plan' then target_tier else null end,msg) returning id into tid;
  return jsonb_build_object('ok',true,'id',tid);
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
   if t.category<>'plan' or t.tier not in ('pro','ultimate') then raise exception 'Nur Tarif-Anfragen können freigegeben werden';end if;
   if t.status='approved' then raise exception 'Bereits genehmigt';end if;
   days_count:=coalesce((p_payload->>'days')::integer,30);
   if days_count not between 1 and 3650 then raise exception 'Laufzeit: 1 bis 3650 Tage';end if;
   insert into public.academy_plans(user_id,tier,granted_by,expires_at,updated_at)
   values(t.user_id,t.tier,who,now()+make_interval(days=>days_count),now())
   on conflict(user_id) do update set tier=excluded.tier,expires_at=excluded.expires_at,
     granted_by=excluded.granted_by,updated_at=now();
   if r='' then r:='Deine Mitgliedschaft wurde für '||days_count||' Tage freigeschaltet.';end if;
  end if;
  update academy_private.academy_tickets set status=requested_status,reply=nullif(r,''),updated_at=now() where id=tid;
  return jsonb_build_object('ok',true,'status',requested_status);
 end if;
 raise exception 'Unbekannte Aktion';
end $function$;
