-- LiveryLab Academy v49 · private, per-ticket two-way conversation
-- Existing support tickets, user accounts, approvals and replies are preserved.
CREATE TABLE IF NOT EXISTS academy_private.academy_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES academy_private.academy_tickets(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('member','admin')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS academy_ticket_messages_ticket_date_idx
 ON academy_private.academy_ticket_messages(ticket_id,created_at,id);
ALTER TABLE academy_private.academy_ticket_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON academy_private.academy_ticket_messages FROM PUBLIC,anon,authenticated;
-- Messages are not directly accessible through the public Data API.
-- Old tickets are backfilled once, never replacing the original message/reply.
INSERT INTO academy_private.academy_ticket_messages(ticket_id,sender_id,sender_role,body,created_at)
SELECT t.id,t.user_id,'member',t.message,t.created_at
FROM academy_private.academy_tickets t
WHERE btrim(coalesce(t.message,''))<>''
AND NOT EXISTS(
 SELECT 1 FROM academy_private.academy_ticket_messages m
 WHERE m.ticket_id=t.id AND m.sender_role='member' AND m.body=t.message
);
INSERT INTO academy_private.academy_ticket_messages(ticket_id,sender_id,sender_role,body,created_at)
SELECT t.id,NULL,'admin',t.reply,t.updated_at
FROM academy_private.academy_tickets t
WHERE btrim(coalesce(t.reply,''))<>''
AND NOT EXISTS(
 SELECT 1 FROM academy_private.academy_ticket_messages m
 WHERE m.ticket_id=t.id AND m.sender_role='admin' AND m.body=t.reply
);
CREATE OR REPLACE FUNCTION academy_private.archive_ticket_legacy()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $trigger$
BEGIN
 IF TG_OP='INSERT' THEN
  INSERT INTO academy_private.academy_ticket_messages(ticket_id,sender_id,sender_role,body,created_at)
  VALUES(NEW.id,NEW.user_id,'member',NEW.message,NEW.created_at);
 ELSIF NEW.reply IS DISTINCT FROM OLD.reply AND btrim(coalesce(NEW.reply,''))<>'' THEN
  INSERT INTO academy_private.academy_ticket_messages(ticket_id,sender_id,sender_role,body,created_at)
  VALUES(NEW.id,auth.uid(),'admin',NEW.reply,NEW.updated_at);
 END IF;
 RETURN NEW;
END;
$trigger$;
DROP TRIGGER IF EXISTS academy_ticket_archive_on_insert ON academy_private.academy_tickets;
CREATE TRIGGER academy_ticket_archive_on_insert
 AFTER INSERT ON academy_private.academy_tickets FOR EACH ROW
 EXECUTE FUNCTION academy_private.archive_ticket_legacy();
DROP TRIGGER IF EXISTS academy_ticket_archive_on_reply ON academy_private.academy_tickets;
CREATE TRIGGER academy_ticket_archive_on_reply
 AFTER UPDATE OF reply ON academy_private.academy_tickets FOR EACH ROW
 WHEN (NEW.reply IS DISTINCT FROM OLD.reply)
 EXECUTE FUNCTION academy_private.archive_ticket_legacy();
REVOKE ALL ON FUNCTION academy_private.archive_ticket_legacy() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION academy_private.ticket_chat(
 p_action text,p_ticket uuid,p_body text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $chat$
DECLARE
 who uuid:=auth.uid();
 staff boolean;
 ticket academy_private.academy_tickets%ROWTYPE;
 message_text text;
 message_id uuid;
 history jsonb;
BEGIN
 IF who IS NULL OR NOT academy_private.is_active() THEN
  RAISE EXCEPTION 'Aktives Konto erforderlich';
 END IF;
 staff:=academy_private.is_admin();
 IF p_action NOT IN ('thread','send') OR p_ticket IS NULL THEN
  RAISE EXCEPTION 'Ungültige Support-Aktion';
 END IF;
 SELECT * INTO ticket FROM academy_private.academy_tickets WHERE id=p_ticket;
 IF NOT FOUND OR (NOT staff AND ticket.user_id<>who) THEN
  RAISE EXCEPTION 'Ticket nicht gefunden oder keine Berechtigung';
 END IF;
 IF p_action='send' THEN
  message_text:=btrim(coalesce(p_body,''));
  IF length(message_text) NOT BETWEEN 1 AND 2000 THEN
   RAISE EXCEPTION 'Nachricht muss 1 bis 2000 Zeichen haben';
  END IF;
  INSERT INTO academy_private.academy_ticket_messages(ticket_id,sender_id,sender_role,body)
  VALUES(ticket.id,who,CASE WHEN staff THEN 'admin' ELSE 'member' END,message_text)
  RETURNING id INTO message_id;
  -- Reopen a resolved conversation on a new member message, but never
  -- reset "approved": doing so would allow a second plan approval.
  UPDATE academy_private.academy_tickets
  SET status=CASE
    WHEN NOT staff AND status IN ('answered','closed','rejected') THEN 'open'
    WHEN staff AND status='open' THEN 'answered'
    ELSE status END,
    updated_at=now()
  WHERE id=ticket.id;
 END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id',m.id,'role',m.sender_role,'body',m.body,'at',m.created_at
  ) ORDER BY m.created_at,m.id),'[]'::jsonb) INTO history
 FROM (
  SELECT id,sender_role,body,created_at FROM academy_private.academy_ticket_messages
  WHERE ticket_id=ticket.id ORDER BY created_at DESC,id DESC LIMIT 200
 ) m;
 RETURN jsonb_build_object(
  'ok',true,'id',ticket.id,'ticket_id',ticket.id,
  'messages',history,
  'status',(SELECT status FROM academy_private.academy_tickets WHERE id=ticket.id),
  'sent_id',message_id
 );
END;
$chat$;
REVOKE ALL ON FUNCTION academy_private.ticket_chat(text,uuid,text) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.academy_ticket_chat(
 p_action text,p_ticket uuid,p_body text DEFAULT NULL)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=''
AS $rpc$
 SELECT academy_private.ticket_chat(p_action,p_ticket,p_body)
$rpc$;
REVOKE ALL ON FUNCTION public.academy_ticket_chat(text,uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.academy_ticket_chat(text,uuid,text) TO authenticated;
