-- Test script to temporarily disable triggers and test basic signup
-- Run this in your Supabase SQL Editor

-- Step 1: Check what triggers exist that might be causing issues
SELECT 'Current triggers on auth.users:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 2: Temporarily disable all triggers on auth.users to test if they're the issue
SELECT 'Disabling triggers temporarily for testing:' as info;
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'auth.users'
    LOOP
        EXECUTE 'ALTER TABLE auth.users DISABLE TRIGGER ' || trigger_record.trigger_name;
        RAISE NOTICE 'Disabled trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- Step 3: Verify triggers are disabled
SELECT 'Verifying triggers are disabled:' as info;
SELECT 
    trigger_name,
    CASE WHEN tgrelid::regclass IS NOT NULL THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM information_schema.triggers t
LEFT JOIN pg_trigger tg ON t.trigger_name = tg.tgname
WHERE event_object_table = 'auth.users';

-- Step 4: Test if we can manually create a profile (this simulates what the trigger should do)
SELECT 'Testing manual profile creation:' as info;
-- This will help us see if the issue is with the trigger or the table structure
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    insert_result RECORD;
BEGIN
    -- Try to insert a test profile
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
    ) RETURNING * INTO insert_result;
    
    RAISE NOTICE 'Successfully created test profile: %', insert_result;
    
    -- Clean up the test data
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    RAISE NOTICE 'Test profile cleaned up successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating test profile: %', SQLERRM;
END $$;

-- Step 5: Re-enable triggers (important!)
SELECT 'Re-enabling triggers:' as info;
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'auth.users'
    LOOP
        EXECUTE 'ALTER TABLE auth.users ENABLE TRIGGER ' || trigger_record.trigger_name;
        RAISE NOTICE 'Re-enabled trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- Step 6: Final verification
SELECT 'Final trigger status:' as info;
SELECT 
    trigger_name,
    CASE WHEN tgrelid::regclass IS NOT NULL THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM information_schema.triggers t
LEFT JOIN pg_trigger tg ON t.trigger_name = tg.tgname
WHERE event_object_table = 'auth.users';
