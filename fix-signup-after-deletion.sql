-- Fix for signup issues after account deletion
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the problematic deletion functions
DROP FUNCTION IF EXISTS remove_email_verification_and_delete_user(UUID);
DROP FUNCTION IF EXISTS admin_delete_user_completely(UUID);

-- Step 2: Create a better approach - mark user as deleted instead of removing them
-- This prevents signin while allowing new signups with same email
CREATE OR REPLACE FUNCTION mark_user_as_deleted(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get the user's email before marking as deleted
    SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
    
    IF user_email IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Mark user as deleted by setting a custom claim
    -- This will prevent them from signing in
    UPDATE auth.users 
    SET 
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        '{"deleted": true, "deleted_at": "' || NOW()::text || '", "deletion_reason": "user_requested"}'::jsonb,
        email_confirmed_at = NULL, -- Remove email verification
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
        'user_marked_deleted',
        NOW()
    );
    
    RAISE NOTICE 'User % (email: %) has been marked as deleted', user_uuid, user_email;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in mark_user_as_deleted: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_user_as_deleted(UUID) TO authenticated;

-- Step 4: Create a function to check if user is deleted during signin
CREATE OR REPLACE FUNCTION check_user_deletion_status(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_deleted BOOLEAN;
BEGIN
    -- Check if user is marked as deleted
    SELECT COALESCE((raw_user_meta_data->>'deleted')::boolean, false) INTO is_deleted
    FROM auth.users 
    WHERE id = user_uuid;
    
    RETURN is_deleted;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_deletion_status(UUID) TO authenticated;

-- Step 6: Create a function to clean up deleted user data for new signups
CREATE OR REPLACE FUNCTION cleanup_deleted_user_data(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_user_id UUID;
BEGIN
    -- Find the deleted user with this email
    SELECT id INTO deleted_user_id
    FROM auth.users 
    WHERE email = user_email 
        AND COALESCE((raw_user_meta_data->>'deleted')::boolean, false) = true;
    
    IF deleted_user_id IS NOT NULL THEN
        -- Permanently remove the deleted user's data to make room for new signup
        DELETE FROM user_profiles WHERE user_id = deleted_user_id;
        DELETE FROM user_settings WHERE user_id = deleted_user_id;
        
        -- Remove the deleted user from auth.users
        DELETE FROM auth.users WHERE id = deleted_user_id;
        
        RAISE NOTICE 'Cleaned up deleted user data for email: %', user_email;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in cleanup_deleted_user_data: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_deleted_user_data(TEXT) TO authenticated;

-- Step 8: Verify the functions were created
SELECT 'Functions created successfully!' as status,
       'These functions will:' as description,
       '1. mark_user_as_deleted: Mark user as deleted (prevents signin)' as action1,
       '2. check_user_deletion_status: Check if user is deleted' as action2,
       '3. cleanup_deleted_user_data: Clean up deleted user data for new signups' as action3;

-- Step 9: Show what these functions do
SELECT 
    routine_name,
    routine_type,
    data_type,
    security_type
FROM information_schema.routines 
WHERE routine_name IN ('mark_user_as_deleted', 'check_user_deletion_status', 'cleanup_deleted_user_data');
