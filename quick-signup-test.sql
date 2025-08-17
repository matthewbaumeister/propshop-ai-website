-- Quick test to identify signup failure point
-- Run this in your Supabase SQL Editor

-- Step 1: Check what happens when we try to create a user manually
SELECT 'Testing manual user creation simulation:' as info;

-- Step 2: Test if we can insert into user_profiles manually
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    insert_success BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE 'Testing with user ID: %', test_user_id;
    
    -- Try to insert a test profile
    BEGIN
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
        );
        
        insert_success := TRUE;
        RAISE NOTICE '✅ SUCCESS: Profile insert worked!';
        
        -- Clean up
        DELETE FROM user_profiles WHERE user_id = test_user_id;
        RAISE NOTICE '✅ SUCCESS: Profile cleanup worked!';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ ERROR: Profile insert failed: %', SQLERRM;
            RAISE NOTICE '❌ ERROR CODE: %', SQLSTATE;
    END;
    
    -- Try to insert user settings
    BEGIN
        INSERT INTO user_settings (
            user_id,
            email_notifications,
            push_notifications,
            marketing_emails,
            two_factor_auth,
            language,
            timezone
        ) VALUES (
            test_user_id,
            TRUE,
            FALSE,
            FALSE,
            FALSE,
            'en',
            'UTC'
        );
        
        RAISE NOTICE '✅ SUCCESS: Settings insert worked!';
        
        -- Clean up
        DELETE FROM user_settings WHERE user_id = test_user_id;
        RAISE NOTICE '✅ SUCCESS: Settings cleanup worked!';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ ERROR: Settings insert failed: %', SQLERRM;
            RAISE NOTICE '❌ ERROR CODE: %', SQLSTATE;
    END;
    
    -- Summary
    IF insert_success THEN
        RAISE NOTICE '🎉 SUMMARY: Manual inserts work fine - issue is likely with triggers or auth flow';
    ELSE
        RAISE NOTICE '💥 SUMMARY: Manual inserts fail - issue is with table structure or permissions';
    END IF;
    
END $$;

-- Step 3: Check if there are any triggers that might be interfering
SELECT 'Checking for problematic triggers:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    CASE 
        WHEN action_statement LIKE '%user_profiles%' THEN 'AFFECTS PROFILES'
        WHEN action_statement LIKE '%user_settings%' THEN 'AFFECTS SETTINGS'
        ELSE 'OTHER'
    END as impact
FROM information_schema.triggers
WHERE event_object_table = 'auth.users'
    AND action_statement IS NOT NULL;

-- Step 4: Check if the deletion functions we created exist
SELECT 'Checking deletion functions:' as info;
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM information_schema.routines
WHERE routine_name IN ('mark_user_as_deleted', 'check_user_deletion_status', 'cleanup_deleted_user_data')
UNION ALL
SELECT 'NO FUNCTIONS FOUND' as routine_name, 'N/A' as routine_type, 'MISSING' as status
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name IN ('mark_user_as_deleted', 'check_user_deletion_status', 'cleanup_deleted_user_data')
);
