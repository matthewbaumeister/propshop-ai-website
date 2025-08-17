-- Final Migration script to create user_settings table
-- Run this in your Supabase SQL editor
-- This script ONLY creates what's needed without touching existing functions

-- Check if user_settings table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        -- Create User Settings Table
        CREATE TABLE user_settings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          email_notifications BOOLEAN DEFAULT true,
          push_notifications BOOLEAN DEFAULT false,
          marketing_emails BOOLEAN DEFAULT false,
          two_factor_auth BOOLEAN DEFAULT false,
          language VARCHAR(10) DEFAULT 'en',
          timezone VARCHAR(50) DEFAULT 'UTC',
          theme_preference VARCHAR(10) DEFAULT 'dark',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
        
        -- Enable Row Level Security
        ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'user_settings table created successfully';
    ELSE
        RAISE NOTICE 'user_settings table already exists';
    END IF;
END $$;

-- Drop existing policies if they exist (safe operation)
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

-- Create RLS policies
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Drop existing trigger if it exists (safe operation)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create function to automatically create user settings when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user settings
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Drop existing trigger if it exists (safe operation)
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;

-- Create trigger to automatically update updated_at (using existing function)
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings for existing users (only if they don't have settings)
INSERT INTO user_settings (user_id, email_notifications, push_notifications, marketing_emails, two_factor_auth, language, timezone, theme_preference)
SELECT id, true, false, false, false, 'en', 'UTC', 'dark'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- Success message
SELECT 'User settings table and policies created successfully!' as status;
