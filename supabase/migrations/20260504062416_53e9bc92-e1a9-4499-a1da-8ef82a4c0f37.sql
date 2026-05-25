
-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('direct','group')),
  name TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_cp_user ON public.conversation_participants(user_id);
CREATE INDEX idx_cp_conv ON public.conversation_participants(conversation_id);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text','image','document','audio')),
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conv_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conv_id AND user_id = _user_id
  )
$$;

-- Conversations policies
CREATE POLICY "View own conversations" ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conversation_participant(id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Create conversations" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Admin update conversations" ON public.conversations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR created_by = auth.uid());
CREATE POLICY "Admin delete conversations" ON public.conversations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- Participants policies
CREATE POLICY "View participants of own conversations" ON public.conversation_participants FOR SELECT TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Add participants" ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(),'admin')
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid())
  );
CREATE POLICY "Update own participation" ON public.conversation_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete participants" ON public.conversation_participants FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- Messages policies
CREATE POLICY "View messages in own conversations" ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Send messages in own conversations" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (public.is_conversation_participant(conversation_id, auth.uid()) OR public.has_role(auth.uid(),'admin'))
  );
CREATE POLICY "Delete own messages or admin" ON public.messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Storage bucket for chat files
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files','chat-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated read chat-files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-files');
CREATE POLICY "Authenticated upload chat-files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner delete chat-files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create General group with all existing users
DO $$
DECLARE
  conv_id UUID;
  admin_id UUID;
BEGIN
  SELECT user_id INTO admin_id FROM public.user_roles WHERE role='admin' LIMIT 1;
  INSERT INTO public.conversations (type, name, created_by)
    VALUES ('group','General', admin_id) RETURNING id INTO conv_id;
  INSERT INTO public.conversation_participants (conversation_id, user_id)
    SELECT conv_id, id FROM public.profiles
    ON CONFLICT DO NOTHING;
END $$;
