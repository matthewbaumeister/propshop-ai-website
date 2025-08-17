-- Test Profile Insert - This will show the exact error
-- Run this in your Supabase SQL Editor

-- First, let's see if the user exists
SELECT 'USER EXISTS:' as info, 
       id::text as user_id, 
       email, 
       created_at::text as created
FROM auth.users 
WHERE email = 'matt@make-ready-consulting.com';

-- Now let's try to insert a profile and see what error we get
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO test_user_id
    FROM auth.users 
    WHERE email = 'matt@make-ready-consulting.com';
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE '❌ No user found with email matt@make-ready-consulting.com';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Found user with ID: %', test_user_id;
    
    -- Try to insert a profile
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
    
    RAISE NOTICE '✅ SUCCESS: Profile insert worked!';
    
    -- Clean up
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    RAISE NOTICE '✅ SUCCESS: Profile cleanup worked!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: Profile insert failed!';
        RAISE NOTICE '❌ ERROR MESSAGE: %', SQLERRM;
        RAISE NOTICE '❌ ERROR CODE: %', SQLSTATE;
END $$;
