-- Scalable solution: Auto-update existing profiles when metadata changes
-- Run this in your Supabase SQL Editor

-- Step 1: Drop existing triggers and functions
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS update_user_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS update_user_profile();

-- Step 2: Create a comprehensive function that handles both creation and updates
CREATE OR REPLACE FUNCTION handle_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Debug: Log what we're receiving
    RAISE NOTICE 'Handling profile for user: % with metadata: %', NEW.id, NEW.user_metadata;
    
    -- Try to update existing profile first
    UPDATE user_profiles 
    SET 
        first_name = COALESCE(NEW.user_metadata->>'first_name', NEW.raw_user_meta_data->>'first_name', first_name),
        last_name = COALESCE(NEW.user_metadata->>'last_name', NEW.raw_user_meta_data->>'last_name', last_name),
        company = COALESCE(NEW.user_metadata->>'company', NEW.raw_user_meta_data->>'company', company),
        role = COALESCE(NEW.user_metadata->>'role', NEW.raw_user_meta_data->>'role', role),
        phone = COALESCE(NEW.user_metadata->>'phone', NEW.raw_user_meta_data->>'phone', phone),
        bio = COALESCE(NEW.user_metadata->>'bio', NEW.raw_user_meta_data->>'bio', bio),
        theme_preference = COALESCE(NEW.user_metadata->>'theme_preference', NEW.raw_user_meta_data->>'theme_preference', theme_preference),
        email_notifications = COALESCE(
            (NEW.user_metadata->>'email_notifications')::boolean, 
            (NEW.raw_user_meta_data->>'email_notifications')::boolean, 
            email_notifications
        ),
        updated_at = NOW()
    WHERE user_id = NEW.id;
    
    -- If no profile exists, create one
    IF NOT FOUND THEN
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
            COALESCE(NEW.user_metadata->>'first_name', NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.user_metadata->>'last_name', NEW.raw_user_meta_data->>'last_name', ''),
            COALESCE(NEW.user_metadata->>'company', NEW.raw_user_meta_data->>'company', ''),
            COALESCE(NEW.user_metadata->>'role', NEW.raw_user_meta_data->>'role', 'user'),
            COALESCE(NEW.user_metadata->>'phone', NEW.raw_user_meta_data->>'phone', ''),
            COALESCE(NEW.user_metadata->>'bio', NEW.raw_user_meta_data->>'bio', ''),
            FALSE,
            COALESCE(NEW.user_metadata->>'theme_preference', NEW.raw_user_meta_data->>'theme_preference', 'dark'),
            COALESCE(
                (NEW.user_metadata->>'email_notifications')::boolean, 
                (NEW.raw_user_meta_data->>'email_notifications')::boolean, 
                TRUE
            ),
            FALSE,
            FALSE
        );
        
        RAISE NOTICE 'Created new profile for user: %', NEW.id;
    ELSE
        RAISE NOTICE 'Updated existing profile for user: %', NEW.id;
    END IF;
    
    -- Handle user settings (create if doesn't exist)
    INSERT INTO user_settings (
        user_id,
        email_notifications,
        push_notifications,
        marketing_emails,
        two_factor_auth,
        language,
        timezone
    ) VALUES (
        NEW.id,
        COALESCE(
            (NEW.user_metadata->>'email_notifications')::boolean, 
            (NEW.raw_user_meta_data->>'email_notifications')::boolean, 
            TRUE
        ),
        FALSE,
        FALSE,
        FALSE,
        'en',
        'UTC'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email_notifications = COALESCE(
            (NEW.user_metadata->>'email_notifications')::boolean, 
            (NEW.raw_user_meta_data->>'email_notifications')::boolean, 
            user_settings.email_notifications
        ),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 3: Create trigger that runs on INSERT and UPDATE
CREATE TRIGGER handle_user_profile_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_user_profile();

-- Step 4: Verify the trigger was created
SELECT 'Trigger verification:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'handle_user_profile_trigger';

-- Step 5: Test the function by manually triggering it for existing users
-- This will populate existing profiles with their metadata
SELECT 'Manually triggering profile update for existing users:' as info;
SELECT handle_user_profile() FROM auth.users WHERE email = 'matt@make-ready-consulting.com';

-- Step 6: Verify the automatic update worked
SELECT 'Verification - Profile should now be updated:' as info;
SELECT 
    u.email,
    up.first_name,
    up.last_name,
    up.company,
    up.role,
    up.updated_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'matt@make-ready-consulting.com';
