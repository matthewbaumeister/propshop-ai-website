-- Debug script to investigate account deletion and signup issues
-- Run this in your Supabase SQL Editor

-- Step 1: Check if there are any unique constraints that might prevent re-signup
SELECT 'Checking for unique constraints that might prevent re-signup:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_name IN ('user_profiles', 'user_settings', 'auth.users');

-- Step 2: Check if there are any triggers that might be interfering
SELECT 'Checking for triggers that might interfere with signup:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 3: Check if there are any foreign key constraints that might cause issues
SELECT 'Checking for foreign key constraints:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('user_profiles', 'user_settings');

-- Step 4: Check if there are any soft-deleted records that might conflict
SELECT 'Checking for soft-deleted records that might conflict:' as info;
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as soft_deleted_count
FROM user_profiles 
WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
    'user_settings' as table_name,
    COUNT(*) as soft_deleted_count
FROM user_settings 
WHERE deleted_at IS NOT NULL;

-- Step 5: Check if the deletion function exists and works
SELECT 'Checking if deletion functions exist:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type,
    security_type
FROM information_schema.routines 
WHERE routine_name IN ('remove_email_verification_and_delete_user', 'admin_delete_user_completely');

-- Step 6: Check for any database-level errors or locks
SELECT 'Checking for any active database processes:' as info;
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    query
FROM pg_stat_activity
WHERE state = 'active'
    AND query NOT LIKE '%pg_stat_activity%';

-- Step 7: Check if there are any RLS policies that might be blocking
SELECT 'Checking RLS policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('user_profiles', 'user_settings', 'auth.users');
