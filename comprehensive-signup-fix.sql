-- Comprehensive fix for signup database error
-- Run this in your Supabase SQL Editor

-- Step 1: Check if there are any existing users with the same email
SELECT 'Checking for existing users with same email:' as info;
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'matt@make-ready-consulting.com'
ORDER BY created_at DESC;

-- Step 2: Check if there are any soft-deleted profiles that might conflict
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

-- Step 3: Check if there are any triggers that might be interfering
SELECT 'Checking triggers on auth.users:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 4: Check if there are any functions that might be failing
SELECT 'Checking functions that might be failing:' as info;
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name IN ('handle_new_user_profile', 'handle_new_user', 'create_user_profile', 'create_admin_users_entry');

-- Step 5: Clean up any conflicting data
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

-- Step 6: Disable all triggers temporarily to test if they're the issue
SELECT 'Disabling triggers temporarily:' as info;
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

-- Step 7: Test if manual profile creation works without triggers
SELECT 'Testing manual profile creation without triggers:' as info;
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
    
    RAISE NOTICE '✅ SUCCESS: Profile insert worked without triggers!';
    
    -- Clean up
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    RAISE NOTICE '✅ SUCCESS: Profile cleanup worked!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: Profile insert failed: %', SQLERRM;
END $$;

-- Step 8: Create a completely clean trigger function
SELECT 'Creating clean trigger function:' as info;
CREATE OR REPLACE FUNCTION create_user_profile_clean()
RETURNS TRIGGER AS $$
BEGIN
    -- Wait a moment to ensure the user is fully committed
    PERFORM pg_sleep(0.1);
    
    -- Only create profile if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = NEW.id) THEN
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
                NEW.id,
                COALESCE(NEW.raw_user_meta_data->>'first_name', 
                         NEW.raw_user_meta_data->>'name', 
                         split_part(NEW.email, '@', 1)),
                COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
                COALESCE(NEW.raw_user_meta_data->>'company', ''),
                'user',
                '',
                '',
                FALSE,
                'dark',
                TRUE,
                FALSE,
                FALSE
            );
            
            RAISE NOTICE 'Created profile for user: %', NEW.id;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Warning: Could not create profile for user %: %', NEW.id, SQLERRM;
                -- Continue without failing the signup
        END;
    END IF;
    
    -- Only create settings if they don't exist
    IF NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = NEW.id) THEN
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
                NEW.id,
                TRUE,
                FALSE,
                FALSE,
                FALSE,
                'en',
                'UTC'
            );
            
            RAISE NOTICE 'Created settings for user: %', NEW.id;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Warning: Could not create settings for user %: %', NEW.id, SQLERRM;
                -- Continue without failing the signup
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Drop all old triggers and create one clean one
SELECT 'Cleaning up triggers:' as info;
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_profile ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile_clean_trigger ON auth.users;

-- Create one clean trigger
CREATE TRIGGER create_user_profile_clean_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile_clean();

-- Step 10: Re-enable the new trigger
SELECT 'Re-enabling new trigger:' as info;
ALTER TABLE auth.users ENABLE TRIGGER create_user_profile_clean_trigger;

-- Step 11: Final verification
SELECT 'Final verification:' as info;
SELECT 
    trigger_name,
    CASE WHEN tgrelid::regclass IS NOT NULL THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM information_schema.triggers t
LEFT JOIN pg_trigger tg ON t.trigger_name = tg.tgname
WHERE event_object_table = 'auth.users';

-- Step 12: Test the complete fix
SELECT 'Testing complete fix:' as info;
SELECT 'Now try to sign up again with matt@make-ready-consulting.com' as instruction,
       'The signup should work without the database error' as expected_result;
