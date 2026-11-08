-- LiveryLab Academy v1.5: course-wide difficulty 1 through 5.
-- Independent of course.level; preserves the existing 52 IDs, plans, progress and RLS.
ALTER TABLE public.ll_courses ADD COLUMN IF NOT EXISTS difficulty smallint NOT NULL DEFAULT 3;
ALTER TABLE public.ll_courses DROP CONSTRAINT IF EXISTS ll_courses_difficulty_range;
ALTER TABLE public.ll_courses ADD CONSTRAINT ll_courses_difficulty_range CHECK(difficulty BETWEEN 1 AND 5);
UPDATE public.ll_courses SET difficulty=CASE
  WHEN id IN ('coding-basics','html','json') THEN 1
  WHEN id IN ('bash','blender-fundamentals','css','dart','git','lua','php','powershell','python','ruby') THEN 2
  WHEN id IN ('api','blender-animation','browsergames','csharp','docker','fivem','go','java','javascript','julia','kotlin','nodejs','perl','r','react','sql','swift','typescript') THEN 3
  WHEN id IN ('blender-fivem-assets','c','elixir','esx','nui','ox','proskills','python-pro-lab','qbcore','scala','testing','webapps') THEN 4
  WHEN id IN ('blender-technical','cpp','fivemadmin','fullstack-pro-lab','haskell','lua-masterlab','rust','security','zig') THEN 5
  ELSE difficulty END;
