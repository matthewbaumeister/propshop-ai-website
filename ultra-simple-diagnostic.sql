-- Ultra Simple Diagnostic - This will definitely show results
-- Run this in your Supabase SQL Editor

-- 1. Check if user exists in auth.users
SELECT 'CHECKING USER IN AUTH.USERS:' as step;
SELECT 
    id::text as user_id,
    email,
    created_at::text as created,
    email_confirmed_at::text as email_confirmed
FROM auth.users 
WHERE email = 'matt@make-ready-consulting.com';

-- 2. Check if there are any triggers on auth.users
SELECT 'CHECKING TRIGGERS ON AUTH.USERS:' as step;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- 3. Check if there are any existing profiles
SELECT 'CHECKING EXISTING PROFILES:' as step;
SELECT 
    up.id::text as profile_id,
    up.user_id::text as user_id,
    up.first_name,
    up.last_name,
    up.company,
    up.deleted_at::text as deleted
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'matt@make-ready-consulting.com';

-- 4. Try a simple insert to see what happens
SELECT 'ATTEMPTING SIMPLE INSERT:' as step;
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
    au.id,
    'Matt',
    'Baumeister',
    'Make Ready Consulting',
    'user',
    '',
    '',
    FALSE,
    'dark',
    TRUE,
    FALSE,
    FALSE
FROM auth.users au
WHERE au.email = 'matt@make-ready-consulting.com'
RETURNING 
    id::text as profile_id,
    user_id::text as user_id,
    first_name,
    last_name,
    company;
