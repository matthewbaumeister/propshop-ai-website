# Database Setup Guide for Prop Shop AI

This guide will help you set up your Supabase database to fix the profile loading issues.

## Step 1: Run the Database Migrations

Go to your Supabase dashboard and open the SQL Editor. Run these scripts in order:

### 1. Add deleted_at column to user_profiles
```sql
-- Run this first
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
```

### 2. Create user_settings table
```sql
-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    two_factor_auth BOOLEAN DEFAULT FALSE,
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

### 3. Update RLS Policies
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Recreate RLS policies with deleted_at handling
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND is_admin = TRUE AND deleted_at IS NULL
        )
    );

CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND is_admin = TRUE AND deleted_at IS NULL
        )
    );
```

### 4. Create RLS Policies for user_settings
```sql
-- Create RLS policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all settings" ON user_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND is_admin = TRUE AND deleted_at IS NULL
        )
    );

CREATE POLICY "Admins can update all settings" ON user_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND is_admin = TRUE AND deleted_at IS NULL
        )
    );
```

### 5. Create Triggers and Functions
```sql
-- Create trigger for updated_at timestamp on user_settings
CREATE TRIGGER IF NOT EXISTS update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically create user settings when user signs up
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
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
        TRUE,
        FALSE,
        FALSE,
        FALSE,
        'en',
        'UTC'
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new users
DROP TRIGGER IF EXISTS create_user_settings_trigger ON auth.users;
CREATE TRIGGER create_user_settings_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_settings();
```

### 6. Create Indexes and Grant Permissions
```sql
-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Grant permissions
GRANT ALL ON user_settings TO anon, authenticated;
```

## Step 2: Verify the Setup

Run this query to verify everything is set up correctly:

```sql
-- Check if columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_profiles', 'user_settings')
ORDER BY table_name, ordinal_position;

-- Check if policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_settings');
```

## Step 3: Test the Setup

1. **Refresh your browser** and go to the settings page
2. **Check the console** - you should no longer see 403 errors
3. **Your profile should load automatically** with your user information
4. **Settings should also load** from the new user_settings table

## Troubleshooting

If you still see errors:

1. **Check the console** for specific error messages
2. **Verify all SQL scripts ran successfully** in Supabase
3. **Make sure your environment variables** are set correctly
4. **Check that RLS is enabled** on both tables
5. **Verify the policies** are created correctly

## What This Fixes

- ✅ Adds missing `deleted_at` column for soft deletes
- ✅ Creates the missing `user_settings` table
- ✅ Fixes RLS policies to properly handle authentication
- ✅ Ensures profile loading works without 403 errors
- ✅ Provides fallback profile creation when needed
- ✅ Maintains security while allowing proper access

After running these migrations, your user profile settings should load automatically without any errors!
