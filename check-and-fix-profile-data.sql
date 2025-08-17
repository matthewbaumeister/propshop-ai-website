-- Check and fix profile data after disabling RLS
-- Run this in your Supabase SQL Editor

-- Step 1: Check what data currently exists
SELECT 'Current user_profiles data:' as info;
SELECT * FROM user_profiles;

SELECT 'Current user_settings data:' as info;
SELECT * FROM user_settings;

-- Step 2: Check all users and their profile status
SELECT 'Checking all users and their profile status:' as info;
SELECT 
    u.id as user_id,
    u.email,
    u.raw_user_meta_data,
    CASE WHEN up.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as profile_status,
    CASE WHEN us.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as settings_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_settings us ON u.id = us.user_id
ORDER BY u.created_at DESC;

-- Step 3: Create profile data for ALL users who don't have profiles
INSERT INTO user_profiles (
    user_id,
    first_name,
    last_name,
    company,
    role,
    phone,
    bio,
    theme_preference,
    email_notifications,
    admin_notifications,
    meeting_notifications
)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as first_name,
    '' as last_name,
    '' as company,
    'user' as role,
    '' as phone,
    '' as bio,
    'dark' as theme_preference,
    TRUE as email_notifications,
    FALSE as admin_notifications,
    FALSE as meeting_notifications
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = u.id
);

-- Step 4: Create settings data for ALL users who don't have settings
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
);

-- Step 5: Verify the data was created
SELECT 'After creating data - user_profiles:' as info;
SELECT * FROM user_profiles;

SELECT 'After creating data - user_settings:' as info;
SELECT * FROM user_settings;

-- Step 6: Check all profile data that was created
SELECT 'All profile data after creation:' as info;
SELECT 
    up.*,
    us.email_notifications,
    us.push_notifications,
    us.marketing_emails,
    us.two_factor_auth,
    us.language,
    us.timezone
FROM user_profiles up
LEFT JOIN user_settings us ON up.user_id = us.user_id
ORDER BY up.created_at DESC;
