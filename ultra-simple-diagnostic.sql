-- Ultra simple diagnostic script
-- Run this in your Supabase SQL Editor

-- Test 1: Basic table access
SELECT 'Test 1: Can we access tables?' as test_name;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
SELECT COUNT(*) as user_settings_count FROM user_settings;

-- Test 2: Check for triggers
SELECT 'Test 2: What triggers exist?' as test_name;
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'auth.users';

-- Test 3: Check for functions
SELECT 'Test 3: What functions exist?' as test_name;
SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%user%';

-- Test 4: Try to create a profile manually
SELECT 'Test 4: Manual profile creation test' as test_name;
INSERT INTO user_profiles (
    user_id,
    first_name,
    last_name,
    company,
    role,
    phone,
    bio,
    is_admin,
    theme_preference,
    email_notifications,
    admin_notifications,
    meeting_notifications
) VALUES (
    gen_random_uuid(),
    'Test',
    'User',
    'Test Company',
    'user',
    '',
    '',
    FALSE,
    'dark',
    TRUE,
    FALSE,
    FALSE
) RETURNING id, first_name;

-- Test 5: Clean up test data
SELECT 'Test 5: Cleanup test' as test_name;
DELETE FROM user_profiles WHERE first_name = 'Test' AND company = 'Test Company';
SELECT 'Cleanup completed' as status;
