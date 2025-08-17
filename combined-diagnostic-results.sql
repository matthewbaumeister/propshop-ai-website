-- Combined Diagnostic Results for Signup Error
-- Run this in your Supabase SQL Editor
-- This combines all results into one view so you can see everything

-- 1. Triggers on auth.users
SELECT 'TRIGGERS ON AUTH.USERS' as section,
       trigger_name as detail_1,
       event_manipulation as detail_2,
       action_statement as detail_3,
       NULL as detail_4
FROM information_schema.triggers
WHERE event_object_table = 'auth.users'

UNION ALL

-- 2. Functions that might be called
SELECT 
    'FUNCTIONS FOR USER/PROFILE' as section,
    routine_name as detail_1,
    routine_type as detail_2,
    NULL as detail_3,
    NULL as detail_4
FROM information_schema.routines
WHERE routine_name LIKE '%user%' 
   OR routine_name LIKE '%profile%'
   OR routine_name LIKE '%signup%'
   OR routine_name LIKE '%create%'

UNION ALL

-- 3. RLS policies on user_profiles
SELECT 
    'RLS POLICIES ON USER_PROFILES' as section,
    policyname as detail_1,
    permissive::text as detail_2,
    cmd as detail_3,
    COALESCE(qual, 'No condition') as detail_4
FROM pg_policies
WHERE tablename = 'user_profiles'

UNION ALL

-- 4. Table structure
SELECT 
    'USER_PROFILES TABLE STRUCTURE' as section,
    column_name as detail_1,
    data_type as detail_2,
    is_nullable as detail_3,
    COALESCE(column_default, 'No default') as detail_4
FROM information_schema.columns
WHERE table_name = 'user_profiles'

UNION ALL

-- 5. Existing profiles for test user
SELECT 
    'EXISTING PROFILES FOR TEST USER' as section,
    COALESCE(up.user_id::text, 'No profile found') as detail_1,
    COALESCE(up.first_name, 'N/A') as detail_2,
    COALESCE(up.last_name, 'N/A') as detail_3,
    COALESCE(au.email, 'N/A') as detail_4
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email = 'matt@make-ready-consulting.com'

UNION ALL

-- 6. Check if user exists in auth.users
SELECT 
    'USER IN AUTH.USERS' as section,
    COALESCE(id::text, 'User not found') as detail_1,
    COALESCE(email, 'N/A') as detail_2,
    COALESCE(created_at::text, 'N/A') as detail_3,
    COALESCE(email_confirmed_at::text, 'N/A') as detail_4
FROM auth.users
WHERE email = 'matt@make-ready-consulting.com'

ORDER BY 
    CASE section
        WHEN 'TRIGGERS ON AUTH.USERS' THEN 1
        WHEN 'FUNCTIONS FOR USER/PROFILE' THEN 2
        WHEN 'RLS POLICIES ON USER_PROFILES' THEN 3
        WHEN 'USER_PROFILES TABLE STRUCTURE' THEN 4
        WHEN 'USER IN AUTH.USERS' THEN 5
        WHEN 'EXISTING PROFILES FOR TEST USER' THEN 6
        ELSE 7
    END;
