-- Create the avatars bucket if it doesn't exist
-- This script should be run in the Supabase SQL Editor

-- First, check if the bucket exists
DO $$
BEGIN
  -- Check if the bucket exists
  IF NOT EXISTS (
    SELECT 1 
    FROM storage.buckets 
    WHERE name = 'avatars'
  ) THEN
    -- Create the bucket with public access
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true);
    
    -- Set bucket policies to allow public read access
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
    
    -- Allow authenticated users to upload files
    CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'avatars' AND 
      (auth.role() = 'authenticated')
    );
    
    -- Allow users to update their own files
    CREATE POLICY "Allow updates" ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'avatars' AND 
      (auth.role() = 'authenticated' AND auth.uid() = owner)
    );
    
    RAISE NOTICE 'Successfully created avatars bucket with public access';
  ELSE
    RAISE NOTICE 'Avatars bucket already exists';
  END IF;
END $$;
