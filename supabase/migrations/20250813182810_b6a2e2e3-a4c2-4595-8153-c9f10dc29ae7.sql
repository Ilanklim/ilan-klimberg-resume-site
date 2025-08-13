-- Fix document access security issue
-- Update RLS policies to allow authenticated users to read documents for AI search
-- while maintaining security by restricting write access to admins only

-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Admin users can manage documents" ON public.documents;

-- Create separate policies for read and write access
-- Allow all authenticated users (including anonymous) to read documents for AI search
CREATE POLICY "Authenticated users can read documents" 
ON public.documents 
FOR SELECT 
TO authenticated
USING (true);

-- Only allow admin users to insert, update, and delete documents
CREATE POLICY "Admin users can manage documents" 
ON public.documents 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update the API to use the secure document matching function
-- The match_documents_secure function already exists and is properly secured