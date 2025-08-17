-- Clean up old deleted records that are causing conflicts
-- This script will remove or reset deleted_at timestamps for old records

-- First, let's see what we're dealing with
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_records
FROM user_profiles
UNION ALL
SELECT 
    'user_settings' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_records
FROM user_settings;

-- Clean up user_profiles table
-- Remove deleted_at timestamps for old records (older than 1 day)
UPDATE user_profiles 
SET deleted_at = NULL 
WHERE deleted_at IS NOT NULL 
AND deleted_at < NOW() - INTERVAL '1 day';

-- Clean up user_settings table  
-- Remove deleted_at timestamps for old records (older than 1 day)
UPDATE user_settings 
SET deleted_at = NULL 
WHERE deleted_at IS NOT NULL 
AND deleted_at < NOW() - INTERVAL '1 day';

-- Alternative: If you want to completely remove old deleted records instead of just clearing the timestamp
-- Uncomment these lines if you prefer to delete them entirely:

-- DELETE FROM user_profiles WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '1 day';
-- DELETE FROM user_settings WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '1 day';

-- Show the results after cleanup
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_records
FROM user_profiles
UNION ALL
SELECT 
    'user_settings' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_records
FROM user_settings;
