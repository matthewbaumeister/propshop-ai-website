-- Debug script to see exactly what data is being captured during signup
-- Run this in your Supabase SQL Editor

-- Step 1: Check the raw metadata for your users
SELECT 'Raw metadata from your users:' as info;
SELECT 
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE email IN ('matt@make-ready-consulting.com', 'matthewfrancisbaumeister@gmail.com')
ORDER BY created_at DESC;

-- Step 2: Check what the trigger function is actually receiving
SELECT 'Testing what the trigger function would receive:' as info;
SELECT 
    'Sample user data' as info,
    '{"first_name": "test", "last_name": "test", "company": "test"}'::jsonb as sample_metadata;

-- Step 3: Test the COALESCE logic manually
SELECT 'Testing COALESCE logic manually:' as info;
SELECT 
    COALESCE(
        '{"first_name": "John", "last_name": "Doe", "company": "ACME"}'::jsonb->>'first_name',
        '{"first_name": "John", "last_name": "Doe", "company": "ACME"}'::jsonb->>'name',
        '{"first_name": "John", "last_name": "Doe", "company": "ACME"}'::jsonb->>'full_name',
        'fallback'
    ) as first_name_result,
    
    COALESCE(
        '{"first_name": "John", "last_name": "Doe", "company": "ACME"}'::jsonb->>'last_name',
        ''
    ) as last_name_result,
    
    COALESCE(
        '{"first_name": "John", "last_name": "Doe", "company": "ACME"}'::jsonb->>'company',
        ''
    ) as company_result;

-- Step 4: Check if there are any recent auth events (if table exists)
SELECT 'Checking if audit log table exists:' as info;
SELECT 
    table_name,
    column_name
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name LIKE '%audit%' 
OR table_name LIKE '%log%';

-- Step 5: Show the current trigger function definition
SELECT 'Current trigger function:' as info;
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'create_user_profile';
