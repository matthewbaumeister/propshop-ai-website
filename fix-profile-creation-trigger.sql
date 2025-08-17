-- Fix the profile creation trigger to work properly for ALL users
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing broken trigger and function
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

-- Step 2: Create a new, working profile creation function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
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
        COALESCE(NEW.raw_user_meta_data->>'first_name',
                 NEW.raw_user_meta_data->>'name', 
                 NEW.raw_user_meta_data->>'full_name', 
                 split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''), -- last_name from signup
        COALESCE(NEW.raw_user_meta_data->>'company', ''), -- company from signup
        'user', -- role
        '', -- phone (empty but not NULL)
        '', -- bio (empty but not NULL)
        FALSE, -- is_admin
        'dark', -- theme_preference
        TRUE, -- email_notifications
        FALSE, -- admin_notifications
        FALSE -- meeting_notifications
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
        TRUE, -- email_notifications
        FALSE, -- push_notifications
        FALSE, -- marketing_emails
        FALSE, -- two_factor_auth
        'en', -- language
        'UTC' -- timezone
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 3: Create the trigger that runs on new user signup
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Step 4: Test the function with existing users who don't have profiles
-- This will create profiles for any existing users who were missed
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
)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', 
             u.raw_user_meta_data->>'full_name', 
             split_part(u.email, '@', 1)) as first_name,
    '' as last_name,
    '' as company,
    'user' as role,
    '' as phone,
    '' as bio,
    FALSE as is_admin,
    'dark' as theme_preference,
    TRUE as email_notifications,
    FALSE as admin_notifications,
    FALSE as meeting_notifications
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 5: Create settings for existing users who don't have them
INSERT INTO user_settings (
    user_id,
    email_notifications,
    push_notifications,
    marketing_emails,
    two_factor_auth,
    language,
    timezone
)
SELECT 
    u.id,
    TRUE as email_notifications,
    FALSE as push_notifications,
    FALSE as marketing_emails,
    FALSE as two_factor_auth,
    'en' as language,
    'UTC' as timezone
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_settings us WHERE us.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 6: Verify everything is working
SELECT 'Verification - All users should now have profiles:' as info;
SELECT 
    u.email,
    CASE WHEN up.id IS NOT NULL THEN 'HAS PROFILE' ELSE 'MISSING PROFILE' END as profile_status,
    CASE WHEN us.id IS NOT NULL THEN 'HAS SETTINGS' ELSE 'MISSING SETTINGS' END as settings_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_settings us ON u.id = us.user_id
ORDER BY u.created_at DESC;

-- Step 7: Show the trigger is working
SELECT 'Trigger verification:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'create_user_profile_trigger';
