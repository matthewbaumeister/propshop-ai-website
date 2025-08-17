-- Working auto-update trigger that handles existing profiles
-- Run this in your Supabase SQL Editor

-- Step 1: Drop existing triggers and functions
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS update_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_user_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS update_user_profile();
DROP FUNCTION IF EXISTS handle_user_profile();

-- Step 2: Create a simple function that handles profile creation
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
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'company', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'bio', ''),
        FALSE,
        'dark',
        TRUE,
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

-- Step 3: Create the trigger for new users
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

-- Step 5: Manually update existing profiles with their metadata
SELECT 'Updating existing profiles with their metadata:' as info;
UPDATE user_profiles 
SET 
    first_name = COALESCE(
        (SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE id = user_profiles.user_id),
        first_name
    ),
    last_name = COALESCE(
        (SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE id = user_profiles.user_id),
        last_name
    ),
    company = COALESCE(
        (SELECT raw_user_meta_data->>'company' FROM auth.users WHERE id = user_profiles.user_id),
        company
    ),
    role = COALESCE(
        (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = user_profiles.user_id),
        role
    ),
    phone = COALESCE(
        (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = user_profiles.user_id),
        phone
    ),
    bio = COALESCE(
        (SELECT raw_user_meta_data->>'bio' FROM auth.users WHERE id = user_profiles.user_id),
        bio
    ),
    updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('matt@make-ready-consulting.com', 'matthewfrancisbaumeister@gmail.com')
);

-- Step 6: Verify the updates worked
SELECT 'Verification - Profiles should now be updated:' as info;
SELECT 
    u.email,
    up.first_name,
    up.last_name,
    up.company,
    up.role,
    up.updated_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email IN ('matt@make-ready-consulting.com', 'matthewfrancisbaumeister@gmail.com')
ORDER BY u.email;
