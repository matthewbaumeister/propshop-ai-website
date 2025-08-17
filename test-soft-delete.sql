-- Test script to verify soft delete migration
-- Run this in Supabase SQL Editor to check if everything is set up correctly

-- Check if deleted_at columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'deleted_at';

SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_settings' AND column_name = 'deleted_at';

-- Check if soft_delete_user function exists
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_name = 'soft_delete_user';

-- Check if is_user_deleted function exists
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_name = 'is_user_deleted';

-- Check current RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_settings');

-- Check if there are any existing deleted accounts
SELECT 
  user_id, 
  deleted_at 
FROM user_profiles 
WHERE deleted_at IS NOT NULL;

-- Test the soft_delete_user function with a dummy UUID
SELECT soft_delete_user('00000000-0000-0000-0000-000000000000');
-- Run this in Supabase SQL Editor to check if everything is set up correctly

-- Check if deleted_at columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'deleted_at';

SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_settings' AND column_name = 'deleted_at';

-- Check if soft_delete_user function exists
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_name = 'soft_delete_user';

-- Check if is_user_deleted function exists
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_name = 'is_user_deleted';

-- Check current RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_settings');

-- Check if there are any existing deleted accounts
SELECT 
  user_id, 
  deleted_at 
FROM user_profiles 
WHERE deleted_at IS NOT NULL;

-- Test the soft_delete_user function with a dummy UUID
SELECT soft_delete_user('00000000-0000-0000-0000-000000000000');
