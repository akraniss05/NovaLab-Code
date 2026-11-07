-- LiveryLab v26: private support, beta requests and precise vouchers.
create table if not exists academy_private.academy_settings (
  singleton boolean primary key default true check (singleton),
  beta_open boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into academy_private.academy_settings(singleton) values(true) on conflict do nothing;

create table if not exists academy_private.academy_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('support','bug','beta','plan')),
  tier text check (tier in ('pro','ultimate')),
  message text not null check (char_length(message) between 10 and 2000),
  status text not null default 'open' check (status in ('open','answered','closed','approved','rejected')),
  reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academy_tickets_user_date on academy_private.academy_tickets(user_id,created_at desc);
create index if not exists academy_tickets_status_date on academy_private.academy_tickets(status,created_at desc);
alter table academy_private.academy_settings enable row level security;
alter table academy_private.academy_tickets enable row level security;
revoke all on academy_private.academy_settings, academy_private.academy_tickets from public, anon, authenticated;

create or replace function academy_private.service(p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
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
      (select t.id,t.category,t.tier,t.message,t.status,t.reply,t.created_at,t.updated_at,
              coalesce(p.username,p.display_name,'Mitglied') as username
       from academy_private.academy_tickets t join public.academy_profiles p on p.id=t.user_id
       order by case when t.status='open' then 0 else 1 end,t.created_at desc limit 100) x),'[]'::jsonb) else '[]'::jsonb end);
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
end $$;
create or replace function public.academy_service(p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language sql security definer set search_path = '' as $$
 select academy_private.service(p_action,p_payload) $$;
revoke all on function public.academy_service(text,jsonb) from public,anon;
grant execute on function public.academy_service(text,jsonb) to authenticated;

alter table academy_private.academy_vouchers add column if not exists membership_seconds bigint;
alter table academy_private.academy_vouchers drop constraint if exists academy_vouchers_tier_check;
alter table academy_private.academy_vouchers add constraint academy_vouchers_tier_check
 check (tier in ('pro','ultimate','all'));
alter table academy_private.academy_vouchers add constraint academy_vouchers_membership_seconds_check
 check (membership_seconds is null or membership_seconds between 60 and 315360000);

create or replace function academy_private.voucher_create_flexible(
 p_kind text,p_tier text,p_percent integer,p_duration_value integer,p_duration_unit text,
 p_max_uses integer,p_valid_value integer,p_valid_unit text,p_custom_code text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare code_text text; duration_seconds bigint;valid_seconds bigint;created integer;
begin
 if not academy_private.is_admin() then raise exception 'Nur Administratoren';end if;
 if p_kind not in ('gift','discount') or p_tier not in ('pro','ultimate','all') or (p_tier='all' and p_kind<>'discount') then raise exception 'Typ oder Tarif ungültig';end if;
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
end $$;
create or replace function public.academy_voucher_create_flexible(
 p_kind text,p_tier text,p_percent integer,p_duration_value integer,p_duration_unit text,
 p_max_uses integer,p_valid_value integer,p_valid_unit text,p_custom_code text default null)
returns jsonb language sql security definer set search_path = '' as $$
 select academy_private.voucher_create_flexible(p_kind,p_tier,p_percent,p_duration_value,p_duration_unit,p_max_uses,p_valid_value,p_valid_unit,p_custom_code) $$;
revoke all on function public.academy_voucher_create_flexible(text,text,integer,integer,text,integer,integer,text,text) from public,anon;
grant execute on function public.academy_voucher_create_flexible(text,text,integer,integer,text,integer,integer,text,text) to authenticated;

create or replace function academy_private.voucher_apply(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
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
  if old_tier='ultimate' and (old_expires is null or old_expires>now()) and v.tier='pro' then
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
 original_cents:=case v.tier when 'pro' then 199 when 'ultimate' then 599 else 0 end;
 final_cents:=round(original_cents*(100-v.discount_percent)/100.0)::int;
 return jsonb_build_object('ok',true,'kind','discount','tier',v.tier,'percent',v.discount_percent,
   'original_cents',original_cents,'final_cents',final_cents,'message','Rabatt reserviert, keine Zahlung');
end $$;

create or replace function academy_private.voucher_status()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare who uuid:=auth.uid();cap integer;used_count integer;d date;tier_name text;expiry timestamptz;result jsonb;
begin
 if who is null or not academy_private.is_active() then raise exception 'Konto nicht aktiv';end if;
 cap:=academy_private.daily_limit();tier_name:=academy_private.current_tier();d:=(now() at time zone 'Europe/Berlin')::date;
 select count(*) into used_count from academy_private.academy_course_visits where user_id=who and usage_day=d;
 select ap.expires_at into expiry from public.academy_plans ap where ap.user_id=who;
 select jsonb_build_object('code',v.code,'tier',v.tier,'percent',v.discount_percent,
   'original_cents',case v.tier when 'pro' then 199 when 'ultimate' then 599 else 0 end,
   'final_cents',round((case v.tier when 'pro' then 199 when 'ultimate' then 599 else 0 end)*(100-v.discount_percent)/100.0)::integer)
 into result from academy_private.academy_voucher_claims cl join academy_private.academy_vouchers v on v.code=cl.code
 where cl.user_id=who and v.kind='discount' order by cl.claimed_at desc limit 1;
 return jsonb_build_object('tier',tier_name,'course_limit',academy_private.course_limit(),'daily_limit',cap,
   'used_today',used_count,'remaining_today',case when cap<0 then -1 else greatest(0,cap-used_count) end,
   'today',d,'expires_at',expiry,'discount',result);
end $$;

create or replace function academy_private.voucher_list()
returns jsonb language sql stable security definer set search_path = '' as $$
 select case when academy_private.is_admin() then
 coalesce(jsonb_agg(jsonb_build_object('code',v.code,'kind',v.kind,'tier',v.tier,'percent',v.discount_percent,
  'days',v.membership_days,'seconds',v.membership_seconds,'uses',v.uses,'max_uses',v.max_uses,
  'active',v.active,'expires_at',v.expires_at) order by v.created_at desc),'[]'::jsonb)
 else '[]'::jsonb end from academy_private.academy_vouchers v
 where v.deleted_at is null and v.expires_at>now() $$;
