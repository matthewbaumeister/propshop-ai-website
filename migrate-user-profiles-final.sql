-- Final Migration script to create user_profiles table
-- Run this in your Supabase SQL editor
-- This script creates the user_profiles table that the profile API expects

-- Check if user_profiles table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        -- Create User Profiles Table
        CREATE TABLE user_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          company VARCHAR(200),
          role VARCHAR(100),
          phone VARCHAR(20),
          bio TEXT,
          is_admin BOOLEAN DEFAULT false,
          theme_preference VARCHAR(10) DEFAULT 'dark',
          email_notifications BOOLEAN DEFAULT true,
          admin_notifications BOOLEAN DEFAULT false,
          meeting_notifications BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
        
        -- Enable Row Level Security
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'user_profiles table created successfully';
    ELSE
        RAISE NOTICE 'user_profiles table already exists';
    END IF;
END $$;

-- Drop existing policies if they exist (safe operation)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Drop existing trigger if it exists (safe operation)
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- Create function to automatically create user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name, company, role, phone, bio, is_admin, theme_preference, email_notifications, admin_notifications, meeting_notifications)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    '',
    '',
    'user',
    '',
    '',
    false,
    'dark',
    true,
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Drop existing trigger if it exists (safe operation)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Create trigger to automatically update updated_at (using existing function)
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default profiles for existing users
INSERT INTO user_profiles (user_id, first_name, last_name, company, role, phone, bio, is_admin, theme_preference, email_notifications, admin_notifications, meeting_notifications)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  '',
  '',
  'user',
  '',
  '',
  false,
  'dark',
  true,
  false,
  false
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Success message
SELECT 'User profiles table and policies created successfully!' as status;
