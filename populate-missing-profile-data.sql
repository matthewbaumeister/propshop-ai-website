-- Populate missing profile data with proper defaults
-- Run this in your Supabase SQL Editor

-- Step 1: See what data currently exists
SELECT 'Current profile data:' as info;
SELECT 
    id,
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
FROM user_profiles;

-- Step 2: Update profiles with missing data
UPDATE user_profiles 
SET 
    last_name = COALESCE(NULLIF(last_name, ''), ''),
    company = COALESCE(NULLIF(company, ''), ''),
    phone = COALESCE(NULLIF(phone, ''), ''),
    bio = COALESCE(NULLIF(bio, ''), ''),
    theme_preference = COALESCE(NULLIF(theme_preference, ''), 'dark'),
    email_notifications = COALESCE(email_notifications, TRUE),
    admin_notifications = COALESCE(admin_notifications, FALSE),
    meeting_notifications = COALESCE(meeting_notifications, FALSE)
WHERE 
    last_name IS NULL OR 
    last_name = '' OR 
    company IS NULL OR 
    company = '' OR 
    phone IS NULL OR 
    phone = '' OR 
    bio IS NULL OR 
    bio = '' OR 
    theme_preference IS NULL OR 
    theme_preference = '' OR
    email_notifications IS NULL OR
    admin_notifications IS NULL OR
    meeting_notifications IS NULL;

-- Step 3: Also populate user_settings if they exist
UPDATE user_settings 
SET 
    email_notifications = COALESCE(email_notifications, TRUE),
    push_notifications = COALESCE(push_notifications, FALSE),
    marketing_emails = COALESCE(marketing_emails, FALSE),
    two_factor_auth = COALESCE(two_factor_auth, FALSE),
    language = COALESCE(NULLIF(language, ''), 'en'),
    timezone = COALESCE(NULLIF(timezone, ''), 'UTC')
WHERE 
    email_notifications IS NULL OR
    push_notifications IS NULL OR
    marketing_emails IS NULL OR
    two_factor_auth IS NULL OR
    language IS NULL OR 
    language = '' OR 
    timezone IS NULL OR 
    timezone = '';

-- Step 4: Verify the updates
SELECT 'After updating - profile data:' as info;
SELECT 
    id,
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
FROM user_profiles;

SELECT 'After updating - settings data:' as info;
SELECT 
    id,
    user_id,
    email_notifications,
    push_notifications,
    marketing_emails,
    two_factor_auth,
    language,
    timezone
FROM user_settings;

-- Step 5: Show what was updated
SELECT 'Summary of updates:' as info;
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN last_name != '' THEN 1 END) as has_last_name,
    COUNT(CASE WHEN company != '' THEN 1 END) as has_company,
    COUNT(CASE WHEN phone != '' THEN 1 END) as has_phone,
    COUNT(CASE WHEN bio != '' THEN 1 END) as has_bio
FROM user_profiles;
