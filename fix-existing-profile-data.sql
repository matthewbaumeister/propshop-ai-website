-- Fix existing profile data by reading from user_metadata
-- Run this in your Supabase SQL Editor

-- Step 1: Check what's in the user_metadata for your account
SELECT 'Checking user_metadata for your account:' as info;
SELECT 
    u.email,
    u.user_metadata,
    u.raw_user_meta_data
FROM auth.users u
WHERE u.email = 'matt@make-ready-consulting.com';

-- Step 2: Update your profile with the data from user_metadata
UPDATE user_profiles 
SET 
    first_name = COALESCE(
        (SELECT user_metadata->>'first_name' FROM auth.users WHERE email = 'matt@make-ready-consulting.com'),
        first_name
    ),
    last_name = COALESCE(
        (SELECT user_metadata->>'last_name' FROM auth.users WHERE email = 'matt@make-ready-consulting.com'),
        last_name
    ),
    company = COALESCE(
        (SELECT user_metadata->>'company' FROM auth.users WHERE email = 'matt@make-ready-consulting.com'),
        company
    ),
    role = COALESCE(
        (SELECT user_metadata->>'role' FROM auth.users WHERE email = 'matt@make-ready-consulting.com'),
        role
    ),
    phone = COALESCE(
        (SELECT user_metadata->>'phone' FROM auth.users WHERE email = 'matt@make-ready-consulting.com'),
        phone
    ),
    bio = COALESCE(
        (SELECT user_metadata->>'bio' FROM auth.users WHERE email = 'matt@make-ready-consulting.com'),
        bio
    )
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'matt@make-ready-consulting.com'
);

-- Step 3: Verify the update worked
SELECT 'After update - your profile data:' as info;
SELECT 
    up.*,
    u.email,
    u.user_metadata
FROM user_profiles up
JOIN auth.users u ON up.user_id = u.id
WHERE u.email = 'matt@make-ready-consulting.com';

-- Step 4: Also update the other user's profile
UPDATE user_profiles 
SET 
    first_name = COALESCE(
        (SELECT user_metadata->>'first_name' FROM auth.users WHERE email = 'matthewfrancisbaumeister@gmail.com'),
        first_name
    ),
    last_name = COALESCE(
        (SELECT user_metadata->>'last_name' FROM auth.users WHERE email = 'matthewfrancisbaumeister@gmail.com'),
        last_name
    ),
    company = COALESCE(
        (SELECT user_metadata->>'company' FROM auth.users WHERE email = 'matthewfrancisbaumeister@gmail.com'),
        company
    ),
    role = COALESCE(
        (SELECT user_metadata->>'role' FROM auth.users WHERE email = 'matthewfrancisbaumeister@gmail.com'),
        role
    ),
    phone = COALESCE(
        (SELECT user_metadata->>'phone' FROM auth.users WHERE email = 'matthewfrancisbaumeister@gmail.com'),
        phone
    ),
    bio = COALESCE(
        (SELECT user_metadata->>'bio' FROM auth.users WHERE email = 'matthewfrancisbaumeister@gmail.com'),
        bio
    )
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'matthewfrancisbaumeister@gmail.com'
);

-- Step 5: Verify both profiles are updated
SELECT 'Final verification - all profiles:' as info;
SELECT 
    u.email,
    up.first_name,
    up.last_name,
    up.company,
    up.role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email IN ('matt@make-ready-consulting.com', 'matthewfrancisbaumeister@gmail.com')
ORDER BY u.email;
