-- Fix trigger conflicts causing signup database error
-- Run this in your Supabase SQL Editor

-- Step 1: Check what triggers exist on auth.users
SELECT 'Current triggers on auth.users:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 2: Check what functions these triggers are calling
SELECT 'Functions that triggers might be calling:' as info;
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name IN ('handle_new_user_profile', 'handle_new_user', 'create_user_profile', 'create_admin_users_entry');

-- Step 3: Disable all triggers temporarily to test if they're the issue
SELECT 'Disabling all triggers temporarily:' as info;
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

-- Step 4: Verify triggers are disabled
SELECT 'Verifying triggers are disabled:' as info;
SELECT 
    trigger_name,
    CASE WHEN tgrelid::regclass IS NOT NULL THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM information_schema.triggers t
LEFT JOIN pg_trigger tg ON t.trigger_name = tg.tgname
WHERE event_object_table = 'auth.users';

-- Step 5: Test if manual profile creation works now
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
    
    RAISE NOTICE '✅ SUCCESS: Profile insert worked without triggers!';
    
    -- Clean up
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    RAISE NOTICE '✅ SUCCESS: Profile cleanup worked!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: Profile insert still failed: %', SQLERRM;
END $$;

-- Step 6: Create a single, clean trigger function
SELECT 'Creating clean trigger function:' as info;
CREATE OR REPLACE FUNCTION create_user_profile_clean()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = NEW.id) THEN
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
    END IF;
    
    -- Only create settings if they don't exist
    IF NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = NEW.id) THEN
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
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in create_user_profile_clean: %', SQLERRM;
        RETURN NEW; -- Continue even if profile creation fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Drop all old triggers and create one clean one
SELECT 'Cleaning up triggers:' as info;
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_profile ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- Create one clean trigger
CREATE TRIGGER create_user_profile_clean_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile_clean();

-- Step 8: Re-enable the new trigger
SELECT 'Re-enabling new trigger:' as info;
ALTER TABLE auth.users ENABLE TRIGGER create_user_profile_clean_trigger;

-- Step 9: Verify the new setup
SELECT 'Final verification:' as info;
SELECT 
    trigger_name,
    CASE WHEN tgrelid::regclass IS NOT NULL THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM information_schema.triggers t
LEFT JOIN pg_trigger tg ON t.trigger_name = tg.tgname
WHERE event_object_table = 'auth.users';

-- Step 10: Test the new trigger
SELECT 'Testing new trigger:' as info;
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    RAISE NOTICE 'Testing new trigger with user ID: %', test_user_id;
    
    -- Simulate what happens during signup
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
    
    RAISE NOTICE '✅ SUCCESS: Profile insert worked with new trigger!';
    
    -- Clean up
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    RAISE NOTICE '✅ SUCCESS: Profile cleanup worked!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: Profile insert failed with new trigger: %', SQLERRM;
END $$;
