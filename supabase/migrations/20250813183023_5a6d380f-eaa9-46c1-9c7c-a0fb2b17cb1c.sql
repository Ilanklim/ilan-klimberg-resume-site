-- SECURITY FIX: Restrict document access to prevent unauthorized data exposure
-- Remove overly permissive direct table access and implement controlled access

-- Drop the overly permissive policy that allows any authenticated user to read all documents
DROP POLICY IF EXISTS "Authenticated users can read documents" ON public.documents;

-- Keep the admin policy for document management (create, update, delete)
-- Admins retain full access for content management
-- (This policy already exists and is properly secured)

-- Documents can now ONLY be accessed through:
-- 1. Admin users (for management)
-- 2. Secure functions like match_documents_secure() (for AI search)

-- The match_documents_secure function already has proper authentication checks
-- and controls what data is returned, making it safe for AI search functionality

-- Verify the security: regular users cannot directly query the documents table
-- but can use the AI search which goes through the secure function