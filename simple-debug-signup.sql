-- Simple debug script to identify signup database error
-- Run this in your Supabase SQL Editor

-- Step 1: Check if the tables exist
SELECT 'Table existence check:' as info;
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_name IN ('user_profiles', 'user_settings')
UNION ALL
SELECT 'auth.users' as table_name, 'EXISTS (built-in)' as status;

-- Step 2: Check if there are any triggers (this should always return something)
SELECT 'Trigger check:' as info;
SELECT 
    COALESCE(trigger_name, 'NO TRIGGERS') as trigger_name,
    COALESCE(event_manipulation, 'N/A') as event_type,
    COALESCE(event_object_table, 'N/A') as table_name
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 3: Check if there are any functions (this should always return something)
SELECT 'Function check:' as info;
SELECT 
    COALESCE(routine_name, 'NO FUNCTIONS') as function_name,
    COALESCE(routine_type, 'N/A') as function_type
FROM information_schema.routines
WHERE routine_name IN ('create_user_profile', 'handle_new_user_profile', 'handle_new_user')
UNION ALL
SELECT 'NO MATCHING FUNCTIONS' as function_name, 'N/A' as function_type
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name IN ('create_user_profile', 'handle_new_user_profile', 'handle_new_user')
);

-- Step 4: Check table structure (this should always return something)
SELECT 'Table structure check:' as info;
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name IN ('user_profiles', 'user_settings')
GROUP BY table_name
UNION ALL
SELECT 'NO TABLES FOUND' as table_name, 0 as column_count
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name IN ('user_profiles', 'user_settings')
);

-- Step 5: Check RLS policies (this should always return something)
SELECT 'RLS policy check:' as info;
SELECT 
    COALESCE(tablename, 'NO POLICIES') as table_name,
    COALESCE(policyname, 'N/A') as policy_name,
    COALESCE(cmd, 'N/A') as command
FROM pg_policies
WHERE tablename IN ('user_profiles', 'user_settings')
UNION ALL
SELECT 'NO POLICIES FOUND' as table_name, 'N/A' as policy_name, 'N/A' as command
WHERE NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename IN ('user_profiles', 'user_settings')
);

-- Step 6: Test basic table access
SELECT 'Basic access test:' as info;
SELECT 
    'user_profiles' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM user_profiles LIMIT 1) THEN 'CAN READ'
        ELSE 'CANNOT READ' 
    END as read_status
UNION ALL
SELECT 
    'user_settings' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM user_settings LIMIT 1) THEN 'CAN READ'
        ELSE 'CANNOT READ' 
    END as read_status;

-- Step 7: Check for any recent errors
SELECT 'Recent activity check:' as info;
SELECT 
    'Active connections' as info,
    COUNT(*) as count
FROM pg_stat_activity
WHERE state = 'active'
UNION ALL
SELECT 
    'Database size' as info,
    pg_size_pretty(pg_database_size(current_database())) as count;
