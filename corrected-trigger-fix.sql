-- COMPLETELY CORRECTED profile creation trigger
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing triggers and functions to start fresh
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_user_settings_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS create_user_settings();

-- Step 2: Create a new, working profile creation function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Debug: Log what we're receiving
    RAISE NOTICE 'Creating profile for user: % with metadata: %', NEW.id, NEW.raw_user_meta_data;
    
    -- Insert complete profile data with all fields populated
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
        COALESCE(NEW.user_metadata->>'first_name',
                 NEW.raw_user_meta_data->>'first_name',
                 NEW.user_metadata->>'name',
                 NEW.raw_user_meta_data->>'name', 
                 NEW.user_metadata->>'full_name',
                 NEW.raw_user_meta_data->>'full_name', 
                 split_part(NEW.email, '@', 1)),
        COALESCE(NEW.user_metadata->>'last_name', NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.user_metadata->>'company', NEW.raw_user_meta_data->>'company', ''),
        COALESCE(NEW.user_metadata->>'role', NEW.raw_user_meta_data->>'role', 'user'),
        COALESCE(NEW.user_metadata->>'phone', NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.user_metadata->>'bio', NEW.raw_user_meta_data->>'bio', ''),
        FALSE,
        COALESCE(NEW.user_metadata->>'theme_preference', NEW.raw_user_meta_data->>'theme_preference', 'dark'),
        COALESCE(NEW.user_metadata->>'email_notifications', NEW.raw_user_meta_data->>'email_notifications', 'true')::boolean,
        FALSE,
        FALSE
    );
    
    -- Also create user settings
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
    
    RAISE NOTICE 'Profile and settings created successfully for user: %', NEW.id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 3: Create the trigger that runs on new user signup
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Step 4: Verify the trigger was created
SELECT 'Trigger verification:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'create_user_profile_trigger';

-- Step 5: Test the function manually to see if it works
SELECT 'Testing function manually:' as info;
SELECT 
    'test_user_id' as user_id,
    'Test User' as first_name,
    'Test Last' as last_name,
    'Test Company' as company,
    'user' as role,
    '' as phone,
    '' as bio,
    FALSE as is_admin,
    'dark' as theme_preference,
    TRUE as email_notifications,
    FALSE as admin_notifications,
    FALSE as meeting_notifications;

-- Step 6: Check current users and their metadata
SELECT 'Current users and their metadata:' as info;
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- Step 7: Check if profiles exist for current users
SELECT 'Current profile status:' as info;
SELECT 
    u.email,
    CASE WHEN up.id IS NOT NULL THEN 'HAS PROFILE' ELSE 'MISSING PROFILE' END as profile_status,
    CASE WHEN us.id IS NOT NULL THEN 'HAS SETTINGS' ELSE 'MISSING SETTINGS' END as settings_status,
    up.first_name,
    up.last_name,
    up.company
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_settings us ON u.id = us.user_id
ORDER BY u.created_at DESC;
