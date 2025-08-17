-- REAL DEBUG - Show me what's actually in your database right now
-- Run this in your Supabase SQL Editor

-- 1. What tables actually exist?
SELECT 'EXISTING TABLES:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- 2. What's actually in user_profiles right now?
SELECT 'USER_PROFILES CONTENT:' as info;
SELECT * FROM user_profiles LIMIT 5;

-- 3. What's actually in user_settings right now?
SELECT 'USER_SETTINGS CONTENT:' as info;
SELECT * FROM user_settings LIMIT 5;

-- 4. What users exist in auth.users?
SELECT 'AUTH.USERS CONTENT:' as info;
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email LIKE '%matt%' OR email LIKE '%make-ready%'
LIMIT 5;

-- 5. What functions actually exist?
SELECT 'EXISTING FUNCTIONS:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%profile%' OR routine_name LIKE '%user%'
ORDER BY routine_name;

-- 6. What triggers actually exist?
SELECT 'EXISTING TRIGGERS:' as info;
SELECT trigger_name, event_object_table, event_manipulation
FROM information_schema.triggers
ORDER BY event_object_table, trigger_name;

-- 7. What RLS policies actually exist?
SELECT 'EXISTING RLS POLICIES:' as info;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
ORDER BY schemaname, tablename, policyname;
