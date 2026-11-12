-- Keep exam prerequisites consistent with a user-triggered reset.
-- Both the immutable XP award AND the currently completed lesson are required.
-- The user-editable progress JSON alone never unlocks previously unearned lessons.
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
 and exists(select 1 from public.academy_lesson_xp_awards award
  where award.user_id=who and award.lesson_id=li.id)
 and exists(select 1 from public.academy_progress pr
  where pr.user_id=who and pr.key='liverylab-v10'
    and jsonb_typeof(pr.payload->'done')='array' and pr.payload->'done' ? li.id);
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
