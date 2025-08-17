-- Array-Based Debug - Shows everything in one result without UNION ALL
-- Run this in your Supabase SQL Editor

-- This approach uses arrays to combine results without UNION ALL syntax

SELECT 
    unnest(ARRAY[
        'EXISTING TABLES',
        'USER_PROFILES CONTENT', 
        'USER_SETTINGS CONTENT',
        'AUTH.USERS CONTENT',
        'EXISTING FUNCTIONS',
        'EXISTING TRIGGERS',
        'EXISTING RLS POLICIES'
    ]) as section,
    
    CASE 
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'EXISTING TABLES' THEN
            (SELECT string_agg(table_name, ', ') FROM information_schema.tables 
             WHERE table_schema IN ('public', 'auth') 
             AND table_name IN ('user_profiles', 'user_settings', 'users'))
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'USER_PROFILES CONTENT' THEN
            (SELECT string_agg(COALESCE(first_name, 'No Name'), ', ') FROM user_profiles LIMIT 3)
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'USER_SETTINGS CONTENT' THEN
            (SELECT string_agg(COALESCE(theme_preference, 'No Theme'), ', ') FROM user_settings LIMIT 3)
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'AUTH.USERS CONTENT' THEN
            (SELECT string_agg(COALESCE(email, 'No Email'), ', ') FROM auth.users 
             WHERE email LIKE '%matt%' OR email LIKE '%make-ready%' LIMIT 3)
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'EXISTING FUNCTIONS' THEN
            (SELECT string_agg(routine_name, ', ') FROM information_schema.routines 
             WHERE routine_name LIKE '%profile%' OR routine_name LIKE '%user%' LIMIT 5)
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'EXISTING TRIGGERS' THEN
            (SELECT string_agg(trigger_name, ', ') FROM information_schema.triggers 
             WHERE event_object_table IN ('auth.users', 'users') LIMIT 5)
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'EXISTING RLS POLICIES' THEN
            (SELECT string_agg(policyname, ', ') FROM pg_policies 
             WHERE tablename IN ('user_profiles', 'user_settings') LIMIT 5)
    END as detail_1,
    
    CASE 
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'EXISTING TABLES' THEN
            (SELECT string_agg(table_schema, ', ') FROM information_schema.tables 
             WHERE table_schema IN ('public', 'auth') 
             AND table_name IN ('user_profiles', 'user_settings', 'users'))
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'USER_PROFILES CONTENT' THEN
            (SELECT string_agg(COALESCE(last_name, 'No Last Name'), ', ') FROM user_profiles LIMIT 3)
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'USER_SETTINGS CONTENT' THEN
            (SELECT string_agg(COALESCE(email_notifications::text, 'No Email Notifications'), ', ') FROM user_settings LIMIT 3)
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'AUTH.USERS CONTENT' THEN
            (SELECT string_agg(COALESCE(created_at::text, 'No Created At'), ', ') FROM auth.users 
             WHERE email LIKE '%matt%' OR email LIKE '%make-ready%' LIMIT 3)
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'EXISTING FUNCTIONS' THEN
            (SELECT string_agg(routine_type, ', ') FROM information_schema.routines 
             WHERE routine_name LIKE '%profile%' OR routine_name LIKE '%user%' LIMIT 5)
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'EXISTING TRIGGERS' THEN
            (SELECT string_agg(event_object_table, ', ') FROM information_schema.triggers 
             WHERE event_object_table IN ('auth.users', 'users') LIMIT 5)
        WHEN unnest(ARRAY[
            'EXISTING TABLES',
            'USER_PROFILES CONTENT', 
            'USER_SETTINGS CONTENT',
            'AUTH.USERS CONTENT',
            'EXISTING FUNCTIONS',
            'EXISTING TRIGGERS',
            'EXISTING RLS POLICIES'
        ]) = 'EXISTING RLS POLICIES' THEN
            (SELECT string_agg(cmd, ', ') FROM pg_policies 
             WHERE tablename IN ('user_profiles', 'user_settings') LIMIT 5)
    END as detail_2,
    
    NULL as detail_3

ORDER BY section;
