-- EMERGENCY SECURITY LOCKDOWN: Enable RLS on all tables
-- This will immediately prevent unauthorized access to data

-- Enable Row Level Security on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on chats table  
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create default-deny policies for documents (admin-only for now)
CREATE POLICY "Block all access to documents" 
ON public.documents 
FOR ALL 
USING (false);

-- Create default-deny policies for chats (will update after auth is implemented)
CREATE POLICY "Block all access to chats" 
ON public.chats 
FOR ALL 
USING (false);

-- Create a secure function to match documents (replaces the current unsafe one)
CREATE OR REPLACE FUNCTION public.match_documents_secure(
  query_embedding vector,
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 5
)
RETURNS TABLE(id uuid, content text, metadata jsonb, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow authenticated users (will add proper auth checks later)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;

  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;