-- Drop old tables and create simplified schema for external Gemini RAG
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;

-- Anonymous users tracked via localStorage-generated ID
CREATE TABLE IF NOT EXISTS public.users_anonymous (
  anon_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store user questions and RAG answers
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id TEXT NOT NULL REFERENCES public.users_anonymous(anon_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_anon_id ON public.questions(anon_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);

-- Enable RLS
ALTER TABLE public.users_anonymous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow anonymous inserts and reads
CREATE POLICY "Anyone can insert anonymous users"
ON public.users_anonymous
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view anonymous users"
ON public.users_anonymous
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can insert questions"
ON public.questions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view questions"
ON public.questions
FOR SELECT
TO anon, authenticated
USING (true);

-- Comments
COMMENT ON TABLE public.users_anonymous IS 'Anonymous users tracked via browser-generated UUIDs in localStorage';
COMMENT ON TABLE public.questions IS 'Questions and answers from Gemini RAG API';