-- Admin self-management v72: own XP balance, streak correction, subscription override and audit.
-- Protected by authenticated, verified administrator role and bound solely to auth.uid().
-- Completed lesson XP ledger is never altered, preserving one-time award guarantees.

CREATE TABLE IF NOT EXISTS academy_private.academy_admin_self_preferences(
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 xp_adjustment integer NOT NULL DEFAULT 0 CHECK (xp_adjustment BETWEEN -10000000 AND 10000000),
 tier_override text NULL CHECK (tier_override IN ('free','pro','ultimate','max')),
 plan_expires_at timestamptz NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE academy_private.academy_admin_self_preferences ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON academy_private.academy_admin_self_preferences FROM PUBLIC,anon,authenticated;

CREATE TABLE IF NOT EXISTS academy_private.academy_admin_self_audit(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 action text NOT NULL CHECK (action IN ('set_xp','set_streak','set_plan')),
 before_state jsonb NOT NULL DEFAULT '{}'::jsonb,
 after_state jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS academy_admin_self_audit_user_idx ON academy_private.academy_admin_self_audit(user_id,updated_at DESC);
ALTER TABLE academy_private.academy_admin_self_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON academy_private.academy_admin_self_audit FROM PUBLIC,anon,authenticated;

-- Preserve the existing default Max access for all administrators: only an
-- explicit self-management override can change the effective admin membership.
CREATE OR REPLACE FUNCTION academy_private.current_tier()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $fn$
 SELECT CASE WHEN academy_private.is_admin() THEN
  coalesce((SELECT CASE WHEN p.plan_expires_at IS NOT NULL AND p.plan_expires_at<=now() THEN 'free'
   ELSE p.tier_override END
   FROM academy_private.academy_admin_self_preferences p
   WHERE p.user_id=(SELECT auth.uid()) AND p.tier_override IS NOT NULL),'max')
 ELSE coalesce((SELECT CASE WHEN ap.expires_at IS NULL OR ap.expires_at>now() THEN ap.tier ELSE 'free' END
   FROM public.academy_plans ap WHERE ap.user_id=(SELECT auth.uid())),'free')
 END
$fn$;

-- An administrator selecting a lower own tier sees its real premium lesson
-- restrictions, while retaining the admin dashboard and administrative powers.
CREATE OR REPLACE FUNCTION academy_private.lesson_entitled(p_lesson text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $fn$
 SELECT EXISTS(SELECT 1 FROM public.ll_lesson_index li WHERE li.id=p_lesson
   AND academy_private.course_allowed(li.course_id)
   AND (li.required_plan='free'
     OR (li.required_plan='plus' AND academy_private.current_tier() IN ('pro','ultimate','max'))
     OR (li.required_plan='pro' AND academy_private.current_tier() IN ('ultimate','max'))))
$fn$;

CREATE OR REPLACE FUNCTION public.academy_admin_self(
 p_action text DEFAULT 'status',
 p_payload jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE
 who uuid := auth.uid();
 today date := (now() AT TIME ZONE 'Europe/Berlin')::date;
 existing academy_private.academy_admin_self_preferences%ROWTYPE;
 old_streak academy_private.academy_streak_summary%ROWTYPE;
 lesson_xp integer := 0;
 desired integer;
 best_value integer;
 duration_months integer;
 new_tier text;
 new_expires timestamptz;
 previous jsonb := '{}'::jsonb;
 changed jsonb := '{}'::jsonb;
 streak_data jsonb;
 log_items jsonb;
 claims_count integer;
 attempts_today integer;
 lesson_used_today integer;
BEGIN
 IF who IS NULL OR NOT academy_private.is_admin() THEN
  RAISE EXCEPTION 'Nur verifizierte Administratoren dürfen ihr eigenes Konto verwalten' USING ERRCODE='42501';
 END IF;
 IF p_action NOT IN ('status','set_xp','set_streak','set_plan') OR p_action IS NULL
 THEN RAISE EXCEPTION 'Unbekannte Admin-Aktion'; END IF;
 SELECT coalesce(sum(xp),0)::integer INTO lesson_xp
 FROM public.academy_lesson_xp_awards WHERE user_id=who;

 IF p_action <> 'status' THEN
  PERFORM pg_advisory_xact_lock(hashtextextended(who::text,440122));
  INSERT INTO academy_private.academy_admin_self_preferences(user_id) VALUES(who)
   ON CONFLICT(user_id) DO NOTHING;
  SELECT * INTO existing FROM academy_private.academy_admin_self_preferences WHERE user_id=who FOR UPDATE;

  IF p_action='set_xp' THEN
   IF jsonb_typeof(p_payload->'xp') IS DISTINCT FROM 'number'
      OR length(p_payload->>'xp')>10 THEN RAISE EXCEPTION 'XP müssen eine ganze Zahl sein'; END IF;
   IF (p_payload->>'xp')::numeric <> trunc((p_payload->>'xp')::numeric)
      OR (p_payload->>'xp')::numeric NOT BETWEEN 0 AND 10000000
   THEN RAISE EXCEPTION 'XP müssen zwischen 0 und 10.000.000 liegen'; END IF;
   desired := (p_payload->>'xp')::integer;
   previous:=jsonb_build_object('total_xp',greatest(0,lesson_xp+existing.xp_adjustment));
   UPDATE academy_private.academy_admin_self_preferences
   SET xp_adjustment=desired-lesson_xp,updated_at=now() WHERE user_id=who;
   changed:=jsonb_build_object('total_xp',desired);

  ELSIF p_action='set_streak' THEN
   IF jsonb_typeof(p_payload->'current') IS DISTINCT FROM 'number'
      OR jsonb_typeof(p_payload->'best') IS DISTINCT FROM 'number'
      OR length(p_payload->>'current')>5 OR length(p_payload->>'best')>5
   THEN RAISE EXCEPTION 'Streak-Werte müssen ganze Zahlen sein'; END IF;
   IF (p_payload->>'current')::numeric <> trunc((p_payload->>'current')::numeric)
      OR (p_payload->>'best')::numeric <> trunc((p_payload->>'best')::numeric)
      OR (p_payload->>'current')::numeric NOT BETWEEN 0 AND 5000
      OR (p_payload->>'best')::numeric NOT BETWEEN 0 AND 5000
      OR (p_payload->>'best')::numeric < (p_payload->>'current')::numeric
   THEN RAISE EXCEPTION 'Streak: aktuell und Rekord 0–5.000; Rekord mindestens so groß wie aktuell'; END IF;
   desired := (p_payload->>'current')::integer;
   best_value := (p_payload->>'best')::integer;
   SELECT * INTO old_streak FROM academy_private.academy_streak_summary WHERE user_id=who FOR UPDATE;
   previous:=jsonb_build_object('current',coalesce(old_streak.current_streak,0),
     'best',coalesce(old_streak.longest_streak,0));
   INSERT INTO academy_private.academy_streak_summary
     (user_id,current_streak,longest_streak,last_claim_day,last_claim_at)
   VALUES(who,desired,best_value,
     CASE WHEN old_streak.last_claim_day IS NULL OR old_streak.last_claim_day<today-1
      THEN CASE WHEN desired>0 THEN today ELSE old_streak.last_claim_day END
      ELSE old_streak.last_claim_day END,
     CASE WHEN old_streak.last_claim_day IS NULL OR old_streak.last_claim_day<today-1
      THEN CASE WHEN desired>0 THEN now() ELSE old_streak.last_claim_at END
      ELSE old_streak.last_claim_at END)
   ON CONFLICT(user_id) DO UPDATE SET current_streak=excluded.current_streak,
     longest_streak=excluded.longest_streak,last_claim_day=excluded.last_claim_day,
     last_claim_at=excluded.last_claim_at;
   INSERT INTO academy_private.academy_streak_stats(user_id,longest_streak)
    VALUES(who,best_value) ON CONFLICT(user_id) DO UPDATE SET longest_streak=excluded.longest_streak;
   changed:=jsonb_build_object('current',desired,'best',best_value);

  ELSIF p_action='set_plan' THEN
   new_tier:=p_payload->>'tier';
   IF new_tier NOT IN ('free','pro','ultimate','max') OR new_tier IS NULL
   THEN RAISE EXCEPTION 'Ungültiger Tarif'; END IF;
   IF jsonb_typeof(p_payload->'months') IS DISTINCT FROM 'number'
      OR length(p_payload->>'months')>2
   THEN RAISE EXCEPTION 'Bitte gültige Laufzeit auswählen'; END IF;
   duration_months:=(p_payload->>'months')::integer;
   IF duration_months NOT IN (0,1,3,12) THEN RAISE EXCEPTION 'Laufzeit: dauerhaft oder 1, 3, 12 Monate'; END IF;
   new_expires:=CASE WHEN duration_months=0 OR new_tier='free'
     THEN NULL ELSE now()+make_interval(months=>duration_months) END;
   previous:=jsonb_build_object('tier',coalesce(existing.tier_override,'max'),
     'expires_at',existing.plan_expires_at);
   UPDATE academy_private.academy_admin_self_preferences SET tier_override=new_tier,
     plan_expires_at=new_expires,updated_at=now() WHERE user_id=who;
   -- Keep standard plan storage synchronized for profile displays, but never
   -- write a different user's plan or alter admin role.
   INSERT INTO public.academy_plans(user_id,tier,granted_by,expires_at,updated_at)
   VALUES(who,new_tier,who,new_expires,now())
   ON CONFLICT(user_id) DO UPDATE SET tier=excluded.tier,granted_by=excluded.granted_by,
     expires_at=excluded.expires_at,updated_at=excluded.updated_at;
   changed:=jsonb_build_object('tier',new_tier,'months',duration_months,'expires_at',new_expires);
  END IF;

  INSERT INTO academy_private.academy_admin_self_audit(user_id,action,before_state,after_state)
   VALUES(who,p_action,previous,changed);
 END IF;

 SELECT coalesce(xp_adjustment,0),tier_override,plan_expires_at INTO
  existing.xp_adjustment,existing.tier_override,existing.plan_expires_at
 FROM academy_private.academy_admin_self_preferences WHERE user_id=who;

 streak_data:=public.academy_streak_status();
 SELECT count(*) INTO claims_count FROM academy_private.academy_streak_claims WHERE user_id=who;
 SELECT count(*) INTO attempts_today FROM academy_private.academy_exam_attempts
  WHERE user_id=who AND usage_day=today;
 SELECT count(*) INTO lesson_used_today FROM academy_private.academy_course_visits
  WHERE user_id=who AND usage_day=today;

 SELECT coalesce(jsonb_agg(to_jsonb(log_item) ORDER BY log_item.updated_at DESC),'[]'::jsonb)
 INTO log_items FROM (
  SELECT action,before_state,after_state,updated_at
  FROM academy_private.academy_admin_self_audit
  WHERE user_id=who ORDER BY updated_at DESC,id DESC LIMIT 12
 ) log_item;

 RETURN jsonb_build_object('ok',true,'tier',academy_private.current_tier(),
   'plan_override',existing.tier_override IS NOT NULL,
   'plan_expires_at',existing.plan_expires_at,
   'xp_lesson',lesson_xp,'xp_adjustment',coalesce(existing.xp_adjustment,0),
   'xp_total',greatest(0,lesson_xp+coalesce(existing.xp_adjustment,0)),
   'streak',streak_data,'streak_claims',claims_count,
   'exams_today',attempts_today,'stations_today',lesson_used_today,
   'changes',log_items);
END
$fn$;
REVOKE ALL ON FUNCTION public.academy_admin_self(text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.academy_admin_self(text,jsonb) TO authenticated;
