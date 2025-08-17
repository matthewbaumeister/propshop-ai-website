-- Fix Missing Trigger - Create automatic profile creation
-- Run this in your Supabase SQL Editor
-- This will create the missing trigger that automatically creates profiles during signup

-- Step 1: Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION create_user_profile_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile
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
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
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
    
    -- Create user settings
    INSERT INTO user_settings (
        user_id,
        theme_preference,
        email_notifications,
        admin_notifications,
        meeting_notifications
    ) VALUES (
        NEW.id,
        'dark',
        TRUE,
        FALSE,
        FALSE
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger on auth.users
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_trigger();

-- Step 3: Test the trigger by checking if it was created
SELECT 'TRIGGER CREATED:' as status;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 4: Verify the function exists
SELECT 'FUNCTION CREATED:' as status;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'create_user_profile_trigger';
