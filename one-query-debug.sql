-- One Query Debug - Shows everything in one result
-- Run this in your Supabase SQL Editor

SELECT 
    'EXISTING TABLES' as section,
    table_schema as detail_1,
    table_name as detail_2,
    table_type as detail_3
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
    AND table_name IN ('user_profiles', 'user_settings', 'users', 'auth.users')
ORDER BY table_schema, table_name

UNION ALL

SELECT 
    'USER_PROFILES CONTENT' as section,
    COALESCE(id::text, 'No ID') as detail_1,
    COALESCE(user_id::text, 'No User ID') as detail_2,
    COALESCE(first_name, 'No First Name') as detail_3
FROM user_profiles 
LIMIT 3

UNION ALL

SELECT 
    'USER_SETTINGS CONTENT' as section,
    COALESCE(id::text, 'No ID') as detail_1,
    COALESCE(user_id::text, 'No User ID') as detail_2,
    COALESCE(theme_preference, 'No Theme') as detail_3
FROM user_settings 
LIMIT 3

UNION ALL

SELECT 
    'AUTH.USERS CONTENT' as section,
    COALESCE(id::text, 'No ID') as detail_1,
    COALESCE(email, 'No Email') as detail_2,
    COALESCE(created_at::text, 'No Created At') as detail_3
FROM auth.users 
WHERE email LIKE '%matt%' OR email LIKE '%make-ready%'
LIMIT 3

UNION ALL

SELECT 
    'EXISTING FUNCTIONS' as section,
    routine_name as detail_1,
    routine_type as detail_2,
    NULL as detail_3
FROM information_schema.routines 
WHERE routine_name LIKE '%profile%' OR routine_name LIKE '%user%'
LIMIT 5

UNION ALL

SELECT 
    'EXISTING TRIGGERS' as section,
    trigger_name as detail_1,
    event_object_table as detail_2,
    event_manipulation as detail_3
FROM information_schema.triggers
WHERE event_object_table IN ('auth.users', 'users')
LIMIT 5

UNION ALL

SELECT 
    'EXISTING RLS POLICIES' as section,
    tablename as detail_1,
    policyname as detail_2,
    cmd as detail_3
FROM pg_policies
WHERE tablename IN ('user_profiles', 'user_settings')
LIMIT 5

ORDER BY section;
