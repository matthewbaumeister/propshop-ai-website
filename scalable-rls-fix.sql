-- Scalable RLS fix that avoids recursion while maintaining admin access
-- Run this in your Supabase SQL Editor

-- First, create a separate admin lookup table to avoid recursion
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE,
    admin_level TEXT DEFAULT 'admin' CHECK (admin_level IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create simple policies for admin_users
CREATE POLICY "Users can view own admin status" ON admin_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_admin = TRUE
        )
    );

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can create own settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can view all settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can update all settings" ON user_settings;

-- Create scalable, non-recursive policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies that check the separate admin_users table (no recursion!)
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_admin = TRUE
        )
    );

-- Create scalable policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies for user_settings (no recursion!)
CREATE POLICY "Admins can view all settings" ON user_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update all settings" ON user_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_admin = TRUE
        )
    );

-- Create trigger for updated_at timestamp on admin_users
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically create admin_users entry when user signs up
CREATE OR REPLACE FUNCTION create_admin_users_entry()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO admin_users (
        user_id,
        is_admin,
        admin_level
    ) VALUES (
        NEW.id,
        FALSE, -- Default to non-admin
        'admin'
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new users
DROP TRIGGER IF EXISTS create_admin_users_trigger ON auth.users;
CREATE TRIGGER create_admin_users_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_admin_users_entry();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_admin ON admin_users(is_admin);

-- Grant permissions
GRANT ALL ON admin_users TO anon, authenticated;

-- Insert yourself as an admin (replace 'your-user-id' with your actual user ID)
-- You can find your user ID in the auth.users table or from your profile
-- INSERT INTO admin_users (user_id, is_admin, admin_level) VALUES ('your-user-id', TRUE, 'admin');

-- Verify the policies were created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_settings', 'admin_users')
ORDER BY tablename, policyname;
