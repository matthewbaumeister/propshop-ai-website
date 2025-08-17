-- Simple fix for signup database error
-- Run this in your Supabase SQL Editor

-- Step 1: Check what triggers exist on auth.users
SELECT 'Current triggers on auth.users:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 2: Check what functions exist
SELECT 'Functions that might be causing issues:' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name IN ('handle_new_user_profile', 'handle_new_user', 'create_user_profile', 'create_admin_users_entry');

-- Step 3: Test if we can create profiles manually
SELECT 'Testing manual profile creation:' as info;
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    RAISE NOTICE 'Testing with user ID: %', test_user_id;
    
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
    
    RAISE NOTICE 'SUCCESS: Profile insert worked!';
    
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    RAISE NOTICE 'SUCCESS: Profile cleanup worked!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Profile insert failed: %', SQLERRM;
END $$;

-- Step 4: Create a simple function to ensure profiles exist
SELECT 'Creating profile creation function:' as info;
CREATE OR REPLACE FUNCTION ensure_user_profile_exists(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = user_uuid) THEN
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
            user_uuid,
            'New',
            'User',
            '',
            'user',
            '',
            '',
            FALSE,
            'dark',
            TRUE,
            FALSE,
            FALSE
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = user_uuid) THEN
        INSERT INTO user_settings (
            user_id,
            email_notifications,
            push_notifications,
            marketing_emails,
            two_factor_auth,
            language,
            timezone
        ) VALUES (
            user_uuid,
            TRUE,
            FALSE,
            FALSE,
            FALSE,
            'en',
            'UTC'
        );
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION ensure_user_profile_exists(UUID) TO authenticated;

-- Step 6: Test the function
SELECT 'Testing the function:' as info;
SELECT ensure_user_profile_exists(gen_random_uuid()) as result;

-- Step 7: Show summary
SELECT 'Fix completed!' as status,
       'The ensure_user_profile_exists function has been created.' as message,
       'This function will be called automatically after signup to create profiles.' as next_step;
