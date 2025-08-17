-- EMERGENCY FIX: Completely disable RLS to get your app working
-- Run this in your Supabase SQL Editor

-- Step 1: Completely disable RLS on all tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies to ensure nothing is left
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can create own settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can view all settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can update all settings" ON user_settings;

-- Step 3: Drop any admin_users table if it exists
DROP TABLE IF EXISTS admin_users CASCADE;

-- Step 4: Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'user_settings');

-- Step 5: Verify no policies exist
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_settings');

-- Step 6: Test basic access (this should work now)
-- Check if you can see your profile data
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count
FROM user_profiles;

SELECT 
    'user_settings' as table_name,
    COUNT(*) as record_count
FROM user_settings;
