-- Debug script to identify signup database error
-- Run this in your Supabase SQL Editor

-- Step 1: Check if there are any triggers that might be failing
SELECT 'Checking triggers on auth.users:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 2: Check if there are any functions that might be failing
SELECT 'Checking functions that might be failing:' as info;
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name IN ('create_user_profile', 'handle_new_user_profile', 'handle_new_user');

-- Step 3: Check if there are any constraints that might be blocking
SELECT 'Checking table constraints:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('user_profiles', 'user_settings', 'auth.users');

-- Step 4: Check if the tables exist and have the right structure
SELECT 'Checking table structure:' as info;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('user_profiles', 'user_settings')
ORDER BY table_name, ordinal_position;

-- Step 5: Check if there are any RLS policies that might be blocking
SELECT 'Checking RLS policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('user_profiles', 'user_settings');

-- Step 6: Check if there are any database errors in the logs
SELECT 'Checking for recent database errors:' as info;
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    query
FROM pg_stat_activity
WHERE state = 'active'
    AND query NOT LIKE '%pg_stat_activity%'
    AND query NOT LIKE '%information_schema%';

-- Step 7: Test if we can manually insert into the tables
SELECT 'Testing manual insert capability:' as info;
-- This will show us if there are any permission issues
SELECT 
    'user_profiles' as table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM user_profiles LIMIT 1
    ) THEN 'CAN READ' ELSE 'CANNOT READ' END as read_status,
    CASE WHEN EXISTS (
        SELECT 1 FROM user_profiles LIMIT 1
    ) THEN 'CAN ACCESS' ELSE 'CANNOT ACCESS' END as access_status
UNION ALL
SELECT 
    'user_settings' as table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM user_settings LIMIT 1
    ) THEN 'CAN READ' ELSE 'CANNOT READ' END as read_status,
    CASE WHEN EXISTS (
        SELECT 1 FROM user_settings LIMIT 1
    ) THEN 'CAN ACCESS' ELSE 'CANNOT ACCESS' END as access_status;
