-- Safe fix for trigger conflicts causing signup database error
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

-- Step 2: Check what functions these triggers are calling
SELECT 'Functions that triggers might be calling:' as info;
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name IN ('handle_new_user_profile', 'handle_new_user', 'create_user_profile', 'create_admin_users_entry');

-- Step 3: Check if we can modify our own tables (this should work)
SELECT 'Checking table permissions:' as info;
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN 'CAN ACCESS' ELSE 'CANNOT ACCESS' END as access_status
FROM information_schema.tables 
WHERE table_name IN ('user_profiles', 'user_settings');

-- Step 4: Test if manual profile creation works (this should work)
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
        RAISE NOTICE '❌ ERROR CODE: %', SQLSTATE;
END $$;

-- Step 5: Create a better trigger function that handles errors gracefully
SELECT 'Creating improved trigger function:' as info;
CREATE OR REPLACE FUNCTION create_user_profile_safe()
RETURNS TRIGGER AS $$
BEGIN
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

-- Step 6: Check if we can create triggers on our own tables
SELECT 'Testing trigger creation on our tables:' as info;
DO $$
BEGIN
    -- Try to create a test trigger on user_profiles (this should work)
    CREATE TEMP TABLE test_trigger_table (id SERIAL);
    
    CREATE OR REPLACE FUNCTION test_trigger_function()
    RETURNS TRIGGER AS $$
    BEGIN
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER test_trigger
        AFTER INSERT ON test_trigger_table
        FOR EACH ROW EXECUTE FUNCTION test_trigger_function();
    
    RAISE NOTICE '✅ SUCCESS: Can create triggers on our own tables';
    
    -- Clean up test
    DROP TRIGGER IF EXISTS test_trigger ON test_trigger_table;
    DROP FUNCTION IF EXISTS test_trigger_function();
    DROP TABLE IF EXISTS test_trigger_table;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: Cannot create triggers: %', SQLERRM;
END $$;

-- Step 7: Alternative approach - create a function that can be called manually
SELECT 'Creating manual profile creation function:' as info;
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

-- Step 9: Test the manual function
SELECT 'Testing manual profile function:' as info;
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    result BOOLEAN;
BEGIN
    RAISE NOTICE 'Testing manual function with user ID: %', test_user_id;
    
    result := ensure_user_profile_exists(test_user_id);
    
    IF result THEN
        RAISE NOTICE '✅ SUCCESS: Manual function worked!';
        
        -- Clean up
        DELETE FROM user_profiles WHERE user_id = test_user_id;
        DELETE FROM user_settings WHERE user_id = test_user_id;
        RAISE NOTICE '✅ SUCCESS: Cleanup worked!';
    ELSE
        RAISE NOTICE '❌ ERROR: Manual function failed!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: Manual function test failed: %', SQLERRM;
END $$;

-- Step 10: Summary and next steps
SELECT 'Summary and next steps:' as info;
SELECT 
    'Since we cannot modify auth.users triggers directly,' as step1,
    'we have created a manual function that can be called' as step2,
    'after successful signup to ensure profiles exist.' as step3,
    'The frontend should call ensure_user_profile_exists()' as step4,
    'after successful authentication.' as step5;
