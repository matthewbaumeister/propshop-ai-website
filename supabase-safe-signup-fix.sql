-- Supabase-safe fix for signup database error
-- Run this in your Supabase SQL Editor
-- This approach works within Supabase's security model

-- Step 1: Check what triggers exist on auth.users (read-only, should work)
SELECT 'Current triggers on auth.users:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 2: Check what functions exist that might be causing issues
SELECT 'Functions that might be causing issues:' as info;
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name IN ('handle_new_user_profile', 'handle_new_user', 'create_user_profile', 'create_admin_users_entry');

-- Step 3: Check for any existing users with the same email
SELECT 'Checking for existing users with same email:' as info;
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'matt@make-ready-consulting.com'
ORDER BY created_at DESC;

-- Step 4: Check for any soft-deleted profiles that might conflict
SELECT 'Checking for soft-deleted profiles:' as info;
SELECT 
    user_id,
    first_name,
    last_name,
    company,
    deleted_at
FROM user_profiles 
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC
LIMIT 5;

-- Step 5: Clean up any conflicting data in our tables
SELECT 'Cleaning up conflicting data:' as info;
DO $$
DECLARE
    conflicting_user_id UUID;
BEGIN
    -- Find any soft-deleted profiles for this email
    SELECT up.user_id INTO conflicting_user_id
    FROM user_profiles up
    JOIN auth.users u ON up.user_id = u.id
    WHERE u.email = 'matt@make-ready-consulting.com'
        AND up.deleted_at IS NOT NULL
    LIMIT 1;
    
    IF conflicting_user_id IS NOT NULL THEN
        -- Permanently remove the conflicting data
        DELETE FROM user_profiles WHERE user_id = conflicting_user_id;
        DELETE FROM user_settings WHERE user_id = conflicting_user_id;
        RAISE NOTICE 'Cleaned up conflicting data for user: %', conflicting_user_id;
    ELSE
        RAISE NOTICE 'No conflicting data found';
    END IF;
END $$;

-- Step 6: Test if manual profile creation works
SELECT 'Testing manual profile creation:' as info;
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    RAISE NOTICE 'Testing with user ID: %', test_user_id;
    
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
    );
    
    RAISE NOTICE '✅ SUCCESS: Profile insert worked!';
    
    -- Clean up
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    RAISE NOTICE '✅ SUCCESS: Profile cleanup worked!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: Profile insert failed: %', SQLERRM;
END $$;

-- Step 7: Create a function that can be called after successful signup
SELECT 'Creating post-signup profile function:' as info;
CREATE OR REPLACE FUNCTION ensure_user_profile_exists(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if profile exists
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
        
        RAISE NOTICE 'Created profile for user: %', user_uuid;
    END IF;
    
    -- Check if settings exist
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
        
        RAISE NOTICE 'Created settings for user: %', user_uuid;
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error ensuring profile exists: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Grant permissions
GRANT EXECUTE ON FUNCTION ensure_user_profile_exists(UUID) TO authenticated;

-- Step 9: Test the function
SELECT 'Testing the function:' as info;
SELECT ensure_user_profile_exists(gen_random_uuid()) as result;

-- Step 10: Create a function to handle signup data
SELECT 'Creating signup data handler:' as info;
CREATE OR REPLACE FUNCTION handle_signup_data(user_email TEXT, user_metadata JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Find the user by email
    SELECT id INTO user_uuid
    FROM auth.users 
    WHERE email = user_email
    LIMIT 1;
    
    IF user_uuid IS NULL THEN
        RAISE NOTICE 'User not found for email: %', user_email;
        RETURN FALSE;
    END IF;
    
    -- Update profile with signup data if it exists
    IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = user_uuid) THEN
        UPDATE user_profiles SET
            first_name = COALESCE(user_metadata->>'first_name', user_metadata->>'name', first_name),
            last_name = COALESCE(user_metadata->>'last_name', last_name),
            company = COALESCE(user_metadata->>'company', company),
            updated_at = NOW()
        WHERE user_id = user_uuid;
        
        RAISE NOTICE 'Updated profile for user: %', user_uuid;
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error handling signup data: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Grant permissions
GRANT EXECUTE ON FUNCTION handle_signup_data(TEXT, JSONB) TO authenticated;

-- Step 12: Show summary and next steps
SELECT 'Fix completed!' as status,
       'Since we cannot modify auth.users triggers directly,' as step1,
       'we have created functions that can be called after signup.' as step2,
       'The frontend should call these functions to ensure profiles exist.' as step3,
       'Try signing up again - if it succeeds, call ensure_user_profile_exists().' as step4;
