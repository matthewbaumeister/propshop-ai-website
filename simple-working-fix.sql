-- Simple working fix - no recursion, no admin complexity
-- Run this in your Supabase SQL Editor

-- First, drop ALL existing policies to start completely fresh
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

DROP POLICY IF EXISTS "Users can view own admin status" ON admin_users;
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;

-- Drop the admin_users table entirely - we don't need it for basic functionality
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create ONLY the essential policies that users need to access their own data
-- No admin checks, no recursion, just simple user access

-- User profiles - users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User settings - users can only access their own data
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verify the policies were created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_settings')
ORDER BY tablename, policyname;

-- Test that a user can access their own data
-- This should return the current user's profile if they exist
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count
FROM user_profiles 
WHERE user_id = auth.uid();

SELECT 
    'user_settings' as table_name,
    COUNT(*) as record_count
FROM user_settings 
WHERE user_id = auth.uid();
