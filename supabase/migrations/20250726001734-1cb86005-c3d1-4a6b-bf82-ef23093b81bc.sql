-- Update chats table schema for anonymous users with rate limiting
DROP TABLE IF EXISTS public.chats CASCADE;

CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on chats table
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous users
CREATE POLICY "Users can view their own chats"
ON public.chats
FOR SELECT
TO anon, authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats"
ON public.chats
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.uid() = user_id);

-- Create function to count daily queries for rate limiting
CREATE OR REPLACE FUNCTION public.get_daily_query_count(target_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Return count of queries made today by the user
  RETURN (
    SELECT COUNT(*)
    FROM public.chats
    WHERE user_id = target_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day'
  );
END;
$$;

-- Create function to check if user can make another query
CREATE OR REPLACE FUNCTION public.can_make_query(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN public.get_daily_query_count(target_user_id) < 10;
END;
$$;