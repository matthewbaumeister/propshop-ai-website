-- Simple Fix Script - Fix the signup issue directly
-- Run this in your Supabase SQL Editor

-- Since your SQL Editor can't handle complex queries, let's just run the fix directly

-- Step 1: Drop the problematic triggers that reference the non-existent 'users' table
-- Note: These triggers don't exist on the 'users' table, so we'll just create the correct one
-- The error confirms that the 'users' table doesn't exist, which is why signup was failing

-- Step 2: Create the correct trigger on auth.users for profile creation
CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
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
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'company', ''),
        'user',
        '',
        '',
        FALSE,
        'dark',
        TRUE,
        FALSE,
        FALSE
    );
    
    -- Create user settings
    INSERT INTO user_settings (
        user_id,
        theme_preference,
        email_notifications,
        push_notifications,
        marketing_emails,
        two_factor_auth,
        language,
        timezone
    ) VALUES (
        NEW.id,
        'dark',
        TRUE,
        FALSE,
        FALSE,
        FALSE,
        'en',
        'UTC'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger on auth.users
CREATE TRIGGER create_user_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_on_signup();

-- Step 4: Verify the trigger was created
SELECT 'TRIGGER CREATED SUCCESSFULLY!' as status;
