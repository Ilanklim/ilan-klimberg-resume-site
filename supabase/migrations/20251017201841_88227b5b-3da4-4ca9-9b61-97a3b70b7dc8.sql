-- Add embeddings table for RAG vector search
CREATE TABLE IF NOT EXISTS public.embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON public.embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read embeddings (for RAG search)
CREATE POLICY "Anyone can view embeddings"
ON public.embeddings
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can insert/update embeddings
CREATE POLICY "Only admins can insert embeddings"
ON public.embeddings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Recreate match function for vector similarity search
CREATE OR REPLACE FUNCTION public.match_embeddings(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.content,
    e.metadata,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.embeddings e
  WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON TABLE public.embeddings IS 'Vector embeddings for RAG similarity search';
COMMENT ON FUNCTION public.match_embeddings IS 'Find similar embeddings using cosine similarity';