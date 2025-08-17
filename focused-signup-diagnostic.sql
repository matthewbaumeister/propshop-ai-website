-- Focused Diagnostic for Signup Error
-- Run this in your Supabase SQL Editor
-- This will show the key information needed to fix the signup issue

-- 1. Check what triggers are active on auth.users
SELECT 'TRIGGERS ON AUTH.USERS:' as section;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- 2. Check what functions exist that might be called by triggers
SELECT 'FUNCTIONS THAT MIGHT BE CALLED:' as section;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%user%' 
   OR routine_name LIKE '%profile%'
   OR routine_name LIKE '%signup%'
   OR routine_name LIKE '%create%';

-- 3. Check RLS policies on user_profiles
SELECT 'RLS POLICIES ON USER_PROFILES:' as section;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 4. Check if we can manually insert a profile (this will show the exact error)
SELECT 'TESTING MANUAL PROFILE INSERT:' as section;
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a real user ID
    SELECT id INTO test_user_id
    FROM auth.users 
    WHERE email = 'matt@make-ready-consulting.com'
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE '❌ No user found with email matt@make-ready-consulting.com';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Found user with ID: %', test_user_id;
    
    -- Try to insert a profile
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
        test_user_id,
        'Matt',
        'Baumeister',
        'Make Ready Consulting',
        'user',
        '',
        '',
        FALSE,
        'dark',
        TRUE,
        FALSE,
        FALSE
    );
    
    RAISE NOTICE '✅ SUCCESS: Profile insert worked!';
    
    -- Clean up
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    RAISE NOTICE '✅ SUCCESS: Profile cleanup worked!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: Profile insert failed!';
        RAISE NOTICE '❌ ERROR MESSAGE: %', SQLERRM;
        RAISE NOTICE '❌ ERROR CODE: %', SQLSTATE;
        RAISE NOTICE '❌ ERROR DETAIL: %', SQLSTATE;
END $$;

-- 5. Check table structure to make sure all columns exist
SELECT 'USER_PROFILES TABLE STRUCTURE:' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 6. Check if there are any existing profiles for the test user
SELECT 'EXISTING PROFILES FOR TEST USER:' as section;
SELECT 
    up.*,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'matt@make-ready-consulting.com';
