alter table academy_private.academy_settings
 add column if not exists shop_discount_percent integer not null default 0
 check (shop_discount_percent between 0 and 90);

create or replace function public.academy_shop_discount(p_percent integer default null)
returns integer language plpgsql security definer set search_path = '' as $$
declare result integer;
begin
 if p_percent is not null then
  if not academy_private.is_admin() then raise exception 'Nur Administratoren';end if;
  if p_percent not between 0 and 90 then raise exception 'Rabatt: 0 bis 90 Prozent';end if;
  update academy_private.academy_settings
    set shop_discount_percent=p_percent,updated_at=now() where singleton=true;
 end if;
 select shop_discount_percent into result from academy_private.academy_settings where singleton=true;
 return coalesce(result,0);
end $$;
revoke all on function public.academy_shop_discount(integer) from public;
grant execute on function public.academy_shop_discount(integer) to anon,authenticated;
