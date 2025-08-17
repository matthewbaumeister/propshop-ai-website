-- Remove email verification when user deletes account
-- Run this in your Supabase SQL Editor

-- Step 1: Create a function to remove email verification and soft delete user
CREATE OR REPLACE FUNCTION remove_email_verification_and_delete_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get the user's email before deletion
    SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
    
    IF user_email IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Remove email verification by setting email_confirmed_at to NULL
    -- This will require them to re-verify if they rejoin
    UPDATE auth.users 
    SET 
        email_confirmed_at = NULL,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Soft delete user profile
    UPDATE user_profiles 
    SET 
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- Soft delete user settings
    UPDATE user_settings 
    SET 
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- Log the action for security purposes
    INSERT INTO auth.audit_log_entries (
        instance_id,
        id,
        user_id,
        event_type,
        created_at
    ) VALUES (
        (SELECT instance_id FROM auth.users WHERE id = user_uuid LIMIT 1),
        gen_random_uuid(),
        user_uuid,
        'user_deleted',
        NOW()
    );
    
    RAISE NOTICE 'User % (email: %) has been soft deleted and email verification removed', user_uuid, user_email;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in remove_email_verification_and_delete_user: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION remove_email_verification_and_delete_user(UUID) TO authenticated;

-- Step 3: Create a function to completely delete user from auth.users
-- This requires admin privileges, so we'll create it as a separate function
CREATE OR REPLACE FUNCTION admin_delete_user_completely(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get the user's email before deletion
    SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
    
    IF user_email IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- First run the soft delete function
    PERFORM remove_email_verification_and_delete_user(user_uuid);
    
    -- Then completely delete the user from auth.users
    -- This will prevent them from signing back in
    DELETE FROM auth.users WHERE id = user_uuid;
    
    RAISE NOTICE 'User % (email: %) has been completely deleted from auth.users', user_uuid, user_email;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in admin_delete_user_completely: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Grant execute permission to authenticated users for the admin function
GRANT EXECUTE ON FUNCTION admin_delete_user_completely(UUID) TO authenticated;

-- Step 5: Verify the functions were created
SELECT 
    routine_name,
    routine_type,
    data_type,
    security_type
FROM information_schema.routines 
WHERE routine_name IN ('remove_email_verification_and_delete_user', 'admin_delete_user_completely');

-- Step 6: Show what these functions do
SELECT 'Functions created successfully!' as status,
       'These functions will:' as description,
       '1. remove_email_verification_and_delete_user: Soft delete + remove email verification' as action1,
       '2. admin_delete_user_completely: Complete deletion + prevent re-signin' as action2,
       '3. Both require re-verification if user rejoins' as action3;
