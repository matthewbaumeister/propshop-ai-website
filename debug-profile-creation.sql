-- Debug script to see why profile creation is failing
-- Run this in your Supabase SQL Editor

-- Step 1: Check the table structure
SELECT 'Table structure for user_profiles:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Step 2: Check if there are any users in auth.users
SELECT 'Users in auth.users table:' as info;
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Step 3: Try to manually create a profile for the first user
-- This will show us exactly what's happening
SELECT 'Attempting to create profile manually:' as info;

-- First, let's see what we're trying to insert
SELECT 
    u.id as user_id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as first_name,
    'user' as role,
    'dark' as theme_preference
FROM auth.users u
LIMIT 1;

-- Step 4: Check if there are any constraints or triggers blocking the insert
SELECT 'Checking for constraints:' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'user_profiles';

-- Step 5: Check if there are any triggers
SELECT 'Checking for triggers:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_profiles';

-- Step 6: Try a simple insert to see what error we get
SELECT 'Testing simple insert:' as info;
-- This will show us the exact error if there is one
INSERT INTO user_profiles (
    user_id,
    first_name,
    role,
    theme_preference
) VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'test',
    'user',
    'dark'
) ON CONFLICT (user_id) DO NOTHING;
