-- Simple debug script - run each section separately
-- Copy and paste each section one at a time

-- SECTION 1: Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- SECTION 2: Check if users exist
SELECT COUNT(*) as user_count FROM auth.users;

-- SECTION 3: Check if profiles exist
SELECT COUNT(*) as profile_count FROM user_profiles;

-- SECTION 4: Check if settings exist
SELECT COUNT(*) as settings_count FROM user_settings;

-- SECTION 5: Look at one user
SELECT id, email, created_at 
FROM auth.users 
LIMIT 1;

-- SECTION 6: Look at one profile
SELECT * FROM user_profiles LIMIT 1;

-- SECTION 7: Try to see what's in the empty records
SELECT 
    id,
    user_id,
    first_name,
    role,
    created_at
FROM user_profiles 
WHERE first_name IS NULL OR first_name = '';
