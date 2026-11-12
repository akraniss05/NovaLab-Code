-- Index frequently joined foreign keys in the Academy only.
-- No rows, ownership rules or existing indexes are modified.
CREATE INDEX IF NOT EXISTS academy_exam_attempts_course_lookup_idx ON academy_private.academy_exam_attempts (course_id);
CREATE INDEX IF NOT EXISTS academy_exam_awards_course_lookup_idx ON academy_private.academy_exam_awards (course_id);
CREATE INDEX IF NOT EXISTS academy_friendships_recipient_lookup_idx ON academy_private.academy_friendships (addressee);
CREATE INDEX IF NOT EXISTS academy_quiz_receipts_lesson_lookup_idx ON academy_private.academy_lesson_quiz_receipts (lesson_id);
CREATE INDEX IF NOT EXISTS academy_ticket_messages_sender_lookup_idx ON academy_private.academy_ticket_messages (sender_id);
CREATE INDEX IF NOT EXISTS academy_vouchers_creator_lookup_idx ON academy_private.academy_vouchers (created_by);
CREATE INDEX IF NOT EXISTS academy_lesson_notes_lesson_lookup_idx ON public.academy_lesson_notes (lesson_id);
CREATE INDEX IF NOT EXISTS academy_xp_awards_lesson_lookup_idx ON public.academy_lesson_xp_awards (lesson_id);
