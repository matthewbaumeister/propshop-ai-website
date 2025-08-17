-- Debug script to see what data is being captured during signup
-- Run this in your Supabase SQL Editor

-- Step 1: Check what's in the auth.users table for your account
SELECT 'Checking your user account data:' as info;
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data,
    user_metadata
FROM auth.users 
WHERE email = 'matt@make-ready-consulting.com' -- Replace with your actual email
ORDER BY created_at DESC;

-- Step 2: Check all recent users to see what metadata is being captured
SELECT 'Checking all recent users and their metadata:' as info;
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data,
    user_metadata
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: Check if your profile was created and what data it has
SELECT 'Checking your profile data:' as info;
SELECT 
    up.*,
    u.email,
    u.raw_user_meta_data,
    u.user_metadata
FROM user_profiles up
JOIN auth.users u ON up.user_id = u.id
WHERE u.email = 'matt@make-ready-consulting.com' -- Replace with your actual email
ORDER BY up.created_at DESC;

-- Step 4: Check if the trigger is working by looking at trigger logs
SELECT 'Checking if the profile creation trigger exists:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 5: Check the function that should be creating profiles
SELECT 'Checking the profile creation function:' as info;
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'create_user_profile';

-- Step 6: Test the function manually to see if it works
SELECT 'Testing the function manually:' as info;
-- This will show us what the function would insert for a new user
SELECT 
    'test_user_id' as user_id,
    'Test User' as first_name,
    '' as last_name,
    '' as company,
    'user' as role,
    '' as phone,
    '' as bio,
    FALSE as is_admin,
    'dark' as theme_preference,
    TRUE as email_notifications,
    FALSE as admin_notifications,
    FALSE as meeting_notifications;
