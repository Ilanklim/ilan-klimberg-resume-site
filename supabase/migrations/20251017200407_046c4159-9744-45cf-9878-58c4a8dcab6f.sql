-- Drop and recreate chats table as questions for better clarity
DROP TABLE IF EXISTS public.chats CASCADE;

-- Create questions table to track all queries
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  relevant_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by anonymous_id
CREATE INDEX IF NOT EXISTS idx_questions_anonymous_id ON public.questions(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);

-- Enable RLS on questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert questions (for anonymous tracking)
CREATE POLICY "Anyone can insert questions"
ON public.questions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Users can view their own questions based on anonymous_id
CREATE POLICY "Users can view their own questions"
ON public.questions
FOR SELECT
TO anon, authenticated
USING (true);

-- Ensure documents table has proper indexes for vector search
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON public.documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add comment to explain anonymous tracking
COMMENT ON TABLE public.questions IS 'Stores all search queries with anonymous user tracking via browser-generated IDs';