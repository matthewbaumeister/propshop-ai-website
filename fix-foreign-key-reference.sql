-- Fix Foreign Key Constraint Reference
-- Run this in your Supabase SQL Editor
-- This fixes the "users" table reference issue

-- Step 1: Check the current foreign key constraints
SELECT 'Current foreign key constraints:' as info;
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

-- Step 2: Check what tables exist
SELECT 'Available tables:' as info;
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_name IN ('users', 'auth.users', 'user_profiles', 'user_settings')
ORDER BY table_schema, table_name;

-- Step 3: Drop the problematic foreign key constraint
SELECT 'Dropping problematic foreign key constraint:' as info;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Step 4: Recreate the constraint with proper reference to auth.users
SELECT 'Recreating constraint with proper reference to auth.users:' as info;
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Step 5: Do the same for user_settings if needed
SELECT 'Fixing user_settings constraint:' as info;
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

ALTER TABLE user_settings 
ADD CONSTRAINT user_settings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Step 6: Verify the new constraints
SELECT 'Verifying new constraints:' as info;
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

-- Step 7: Test if the fix works
SELECT 'Testing the fix:' as info;
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    RAISE NOTICE 'Testing with user ID: %', test_user_id;
    
    -- Try to insert a test profile
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
        test_user_id,
        'Test',
        'User',
        'Test Company',
        'user',
        '',
        '',
        FALSE,
        'dark',
        TRUE,
        FALSE,
        FALSE
    );
    
    RAISE NOTICE '✅ SUCCESS: Profile insert worked with fixed constraint!';
    
    -- Clean up
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    RAISE NOTICE '✅ SUCCESS: Profile cleanup worked!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: Profile insert still failed: %', SQLERRM;
END $$;

-- Step 8: Show summary
SELECT 'Fix completed!' as status,
       'Foreign key constraints have been fixed to reference auth.users' as message,
       'Now try to sign up again - the database error should be gone!' as next_step;
