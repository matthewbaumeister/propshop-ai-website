-- Migration script to add soft delete functionality
-- Run this in your Supabase SQL editor

-- Add deleted_at column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to user_settings table  
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster queries on deleted accounts
CREATE INDEX IF NOT EXISTS idx_user_profiles_deleted_at ON user_profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_user_settings_deleted_at ON user_settings(deleted_at);

-- Update RLS policies to exclude deleted accounts
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles 
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Update user_settings policies
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
CREATE POLICY "Users can view their own settings" ON user_settings 
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings" ON user_settings 
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Create function to soft delete a user account
CREATE OR REPLACE FUNCTION soft_delete_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Mark profile as deleted
  UPDATE user_profiles 
  SET deleted_at = NOW() 
  WHERE user_id = user_uuid;
  
  -- Mark settings as deleted  
  UPDATE user_settings 
  SET deleted_at = NOW() 
  WHERE user_id = user_uuid;
  
  -- Return true if any rows were affected
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is deleted
CREATE OR REPLACE FUNCTION is_user_deleted(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = user_uuid AND deleted_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
