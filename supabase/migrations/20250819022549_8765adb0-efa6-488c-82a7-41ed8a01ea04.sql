-- Migration to change embeddings from 1536 to 768 dimensions
-- Option A: Simple approach (re-ingest required)

BEGIN;

-- Drop ANN index that depends on dimension
DROP INDEX IF EXISTS documents_embedding_hnsw;

-- Clear old rows (we will re-ingest)
TRUNCATE TABLE public.documents;

-- Change column type from vector(1536) to vector(768)
ALTER TABLE public.documents
  ALTER COLUMN embedding TYPE vector(768);

-- Recreate ANN index (cosine)
CREATE INDEX IF NOT EXISTS documents_embedding_hnsw
  ON public.documents
  USING hnsw (embedding vector_cosine_ops);

-- Update retrieval function signature to 768
DROP FUNCTION IF EXISTS public.match_documents(vector, double precision, integer);

CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(768),
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Also update the secure version
DROP FUNCTION IF EXISTS public.match_documents_secure(vector, double precision, integer);

CREATE OR REPLACE FUNCTION public.match_documents_secure(
  query_embedding vector(768),
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Only allow authenticated users (will add proper auth checks later)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;

  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMIT;