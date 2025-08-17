-- Supabase-Safe Profile Creation Fix
-- Run this in your Supabase SQL Editor
-- This creates an RPC function that can be called from the frontend after signup

-- Step 1: Create a function to handle profile creation after signup
CREATE OR REPLACE FUNCTION create_user_profile_after_signup(
    user_email TEXT,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    company TEXT DEFAULT ''
)
RETURNS JSON AS $$
DECLARE
    user_uuid UUID;
    profile_id UUID;
    settings_id UUID;
    result JSON;
BEGIN
    -- Get the user ID from the email
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found',
            'email', user_email
        );
    END IF;
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = user_uuid) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Profile already exists',
            'user_id', user_uuid
        );
    END IF;
    
    -- Create user profile
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
        user_uuid,
        COALESCE(first_name, ''),
        COALESCE(last_name, ''),
        COALESCE(company, ''),
        'user',
        '',
        '',
        FALSE,
        'dark',
        TRUE,
        FALSE,
        FALSE
    ) RETURNING id INTO profile_id;
    
    -- Create user settings
    INSERT INTO user_settings (
        user_id,
        theme_preference,
        email_notifications,
        admin_notifications,
        meeting_notifications
    ) VALUES (
        user_uuid,
        'dark',
        TRUE,
        FALSE,
        FALSE
    ) RETURNING id INTO settings_id;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'user_id', user_uuid,
        'profile_id', profile_id,
        'settings_id', settings_id,
        'message', 'Profile and settings created successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE,
            'user_id', user_uuid
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile_after_signup(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Step 3: Test the function with existing user
SELECT 'TESTING FUNCTION:' as status;
SELECT create_user_profile_after_signup(
    'matt@make-ready-consulting.com',
    'Matt',
    'Baumeister',
    'Make Ready Consulting'
);

-- Step 4: Verify the function exists
SELECT 'FUNCTION CREATED:' as status;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'create_user_profile_after_signup';
