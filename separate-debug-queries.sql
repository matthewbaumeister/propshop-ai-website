-- Separate Debug Queries - Run each section separately
-- Copy and paste each section one at a time in your Supabase SQL Editor

-- SECTION 1: What tables exist?
SELECT 'EXISTING TABLES' as info, 
       table_schema as detail_1, 
       table_name as detail_2, 
       table_type as detail_3
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- SECTION 2: What's in user_profiles?
SELECT 'USER_PROFILES CONTENT' as info;
SELECT * FROM user_profiles LIMIT 5;

-- SECTION 3: What's in user_settings?
SELECT 'USER_SETTINGS CONTENT' as info;
SELECT * FROM user_settings LIMIT 5;

-- SECTION 4: What users exist?
SELECT 'AUTH.USERS CONTENT' as info;
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email LIKE '%matt%' OR email LIKE '%make-ready%'
LIMIT 5;

-- SECTION 5: What functions exist?
SELECT 'EXISTING FUNCTIONS' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%profile%' OR routine_name LIKE '%user%'
ORDER BY routine_name;

-- SECTION 6: What triggers exist?
SELECT 'EXISTING TRIGGERS' as info;
SELECT trigger_name, event_object_table, event_manipulation
FROM information_schema.triggers
ORDER BY event_object_table, trigger_name;

-- SECTION 7: What RLS policies exist?
SELECT 'EXISTING RLS POLICIES' as info;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
ORDER BY schemaname, tablename, policyname;
