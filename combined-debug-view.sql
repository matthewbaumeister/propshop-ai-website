-- Combined Debug View - Shows everything in one result set
-- Run this in your Supabase SQL Editor

-- This combines all debug info into one view so you can see everything

SELECT 'EXISTING TABLES' as section, 
       table_schema as detail_1, 
       table_name as detail_2, 
       table_type as detail_3, 
       NULL as detail_4
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name

UNION ALL

SELECT 'USER_PROFILES CONTENT' as section,
       COALESCE(id::text, 'No ID') as detail_1,
       COALESCE(user_id::text, 'No User ID') as detail_2,
       COALESCE(first_name, 'No First Name') as detail_3,
       COALESCE(last_name, 'No Last Name') as detail_4
FROM user_profiles 
LIMIT 5

UNION ALL

SELECT 'USER_SETTINGS CONTENT' as section,
       COALESCE(id::text, 'No ID') as detail_1,
       COALESCE(user_id::text, 'No User ID') as detail_2,
       COALESCE(theme_preference, 'No Theme') as detail_3,
       COALESCE(email_notifications::text, 'No Email Notifications') as detail_4
FROM user_settings 
LIMIT 5

UNION ALL

SELECT 'AUTH.USERS CONTENT' as section,
       COALESCE(id::text, 'No ID') as detail_1,
       COALESCE(email, 'No Email') as detail_2,
       COALESCE(created_at::text, 'No Created At') as detail_3,
       COALESCE(email_confirmed_at::text, 'No Email Confirmed') as detail_4
FROM auth.users 
WHERE email LIKE '%matt%' OR email LIKE '%make-ready%'
LIMIT 5

UNION ALL

SELECT 'EXISTING FUNCTIONS' as section,
       routine_name as detail_1,
       routine_type as detail_2,
       NULL as detail_3,
       NULL as detail_4
FROM information_schema.routines 
WHERE routine_name LIKE '%profile%' OR routine_name LIKE '%user%'

UNION ALL

SELECT 'EXISTING TRIGGERS' as section,
       trigger_name as detail_1,
       event_object_table as detail_2,
       event_manipulation as detail_3,
       NULL as detail_4
FROM information_schema.triggers

UNION ALL

SELECT 'EXISTING RLS POLICIES' as section,
       tablename as detail_1,
       policyname as detail_2,
       cmd as detail_3,
       NULL as detail_4
FROM pg_policies

ORDER BY section;
