-- Deep Diagnostic for Persistent Signup Error
-- Run this in your Supabase SQL Editor
-- This will identify what's still failing after the foreign key fix

-- Step 1: Check if the foreign key fix actually worked
SELECT 'Step 1: Verifying foreign key fix:' as info;
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

-- Step 2: Check what triggers are still active on auth.users
SELECT 'Step 2: Active triggers on auth.users:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Step 3: Check what functions these triggers are calling
SELECT 'Step 3: Functions called by triggers:' as info;
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name IN ('handle_new_user_profile', 'handle_new_user', 'create_user_profile', 'create_admin_users_entry');

-- Step 4: Check if there are any RLS policies blocking inserts
SELECT 'Step 4: RLS policies on user_profiles:' as info;
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

-- Step 5: Check table permissions and ownership
SELECT 'Step 5: Table permissions:' as info;
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables
WHERE table_name IN ('user_profiles', 'user_settings', 'auth.users')
ORDER BY table_schema, table_name;

-- Step 6: Check if there are any check constraints
SELECT 'Step 6: Check constraints:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('user_profiles', 'user_settings')
    AND tc.constraint_type = 'CHECK';

-- Step 7: Test if we can manually create a profile with a real user ID
SELECT 'Step 7: Testing with real user ID:' as info;
DO $$
DECLARE
    real_user_id UUID;
BEGIN
    -- Get a real user ID from auth.users
    SELECT id INTO real_user_id
    FROM auth.users 
    WHERE email = 'matt@make-ready-consulting.com'
    LIMIT 1;
    
    IF real_user_id IS NULL THEN
        RAISE NOTICE 'No user found with email matt@make-ready-consulting.com';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Testing with real user ID: %', real_user_id;
    
    -- Try to insert a profile for this real user
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
        real_user_id,
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
    );
    
    RAISE NOTICE '✅ SUCCESS: Profile insert worked for real user!';
    
    -- Clean up
    DELETE FROM user_profiles WHERE user_id = real_user_id;
    RAISE NOTICE '✅ SUCCESS: Profile cleanup worked!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: Profile insert failed: %', SQLERRM;
        RAISE NOTICE '❌ ERROR CODE: %', SQLSTATE;
END $$;

-- Step 8: Check if there are any database-level errors or locks
SELECT 'Step 8: Database activity check:' as info;
SELECT 
    'Active connections' as info,
    COUNT(*)::text as count
FROM pg_stat_activity
WHERE state = 'active'
UNION ALL
SELECT 
    'Database size' as info,
    pg_size_pretty(pg_database_size(current_database())) as count;

-- Step 9: Check for any recent errors in the database
SELECT 'Step 9: Recent database errors:' as info;
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE state = 'active'
    AND query NOT LIKE '%pg_stat_activity%'
    AND query NOT LIKE '%information_schema%'
ORDER BY query_start DESC
LIMIT 5;

-- Step 10: Summary and next steps
SELECT 'Diagnostic completed!' as status,
       'Check the results above to identify what is still failing' as message,
       'The foreign key fix worked, so the issue is likely with triggers, RLS, or permissions' as analysis;
