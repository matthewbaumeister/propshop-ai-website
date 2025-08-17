-- Ultra simple debug script - no complex syntax
-- Run this in your Supabase SQL Editor

-- Test 1: Check if tables exist
SELECT 'Test 1: Table existence' as test_name;
SELECT table_name FROM information_schema.tables WHERE table_name IN ('user_profiles', 'user_settings');

-- Test 2: Check if we can read from tables
SELECT 'Test 2: Table access' as test_name;
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles
UNION ALL
SELECT 'user_settings' as table_name, COUNT(*) as row_count FROM user_settings;

-- Test 3: Check for triggers
SELECT 'Test 3: Triggers' as test_name;
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'auth.users';

-- Test 4: Check for functions
SELECT 'Test 4: Functions' as test_name;
SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%user%';

-- Test 5: Check table columns
SELECT 'Test 5: Table structure' as test_name;
SELECT table_name, column_name FROM information_schema.columns 
WHERE table_name IN ('user_profiles', 'user_settings') 
ORDER BY table_name, ordinal_position;
