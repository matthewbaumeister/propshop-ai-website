-- Check Trigger Status - See what's actually happening
-- Run this in your Supabase SQL Editor

-- 1. Check what triggers exist on auth.users
SELECT 'TRIGGERS ON AUTH.USERS:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- 2. Check if our function exists
SELECT 'OUR FUNCTION EXISTS:' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'create_user_profile_on_signup';

-- 3. Check if there are any other triggers that might be interfering
SELECT 'ALL TRIGGERS IN DATABASE:' as info;
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation
FROM information_schema.triggers
ORDER BY event_object_table, trigger_name;

-- 4. Check if there are any constraints that might be failing
SELECT 'CONSTRAINTS ON USER_PROFILES:' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'user_profiles'
    AND tc.constraint_type IN ('CHECK', 'NOT NULL');

-- 5. Check if the user_profiles table has all required columns
SELECT 'USER_PROFILES TABLE STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
