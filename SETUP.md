# Prop Shop AI - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up the complete Prop Shop AI system with all the missing pieces implemented.

## 📋 Prerequisites

- Supabase account and project
- Node.js 18+ installed
- Git repository connected to Vercel

## 🗄️ Database Setup

### 1. Run the Complete Database Schema

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the entire contents of `database-schema.sql`**
4. **Click "Run"**

This will create:
- ✅ `user_profiles` table with all fields
- ✅ `meeting_requests` table for demo requests
- ✅ `proposals` table for future use
- ✅ `saved_searches` table for future use
- ✅ `opportunities` table for future use
- ✅ All RLS policies for security
- ✅ Triggers for timestamps
- ✅ Performance indexes

### 2. Verify Tables Created

After running the schema, you should see:
- `user_profiles` table in your Supabase dashboard
- `meeting_requests` table
- All other tables listed above

## 🔐 Authentication Setup

### 1. Environment Variables

Make sure these are set in your Vercel project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Test Authentication

1. **Sign up** a new user account
2. **Sign in** with the account
3. **Check the header** - should show user name/email
4. **Access dashboard** - should work without errors

## 👑 Admin Setup

### 1. Make a User Admin

Run this SQL in Supabase to make yourself an admin:

```sql
UPDATE user_profiles 
SET is_admin = TRUE, role = 'admin' 
WHERE user_id = 'your_user_id_here';
```

To find your user_id:
1. Go to Authentication > Users in Supabase
2. Copy your user ID
3. Replace 'your_user_id_here' in the SQL above

### 2. Test Admin Access

1. **Sign in** as the admin user
2. **Go to Profile** - should show admin section
3. **Access Admin Panel** - should show dashboard
4. **Check Meeting Requests** - should show all requests
5. **Check User Management** - should show all users

## 🧪 Testing the Complete System

### 1. Profile Management
- ✅ Edit personal information
- ✅ Save changes
- ✅ View admin settings (if admin)

### 2. Settings Management
- ✅ Change notification preferences
- ✅ Save settings
- ✅ View security options

### 3. Admin Dashboard
- ✅ View system overview
- ✅ Manage meeting requests
- ✅ Approve/reject requests
- ✅ View all users

### 4. Meeting Requests
- ✅ Submit demo requests
- ✅ Admin approval workflow
- ✅ Status tracking

## 🔧 Troubleshooting

### Common Issues:

1. **"Profile not found" errors**
   - Run the database schema again
   - Check if `user_profiles` table exists

2. **"Admin access required" errors**
   - Make sure user has `is_admin = TRUE` in database
   - Check RLS policies are working

3. **API endpoint errors**
   - Verify environment variables are set
   - Check Supabase service role key is correct

4. **Authentication issues**
   - Clear browser cache
   - Check Supabase auth settings
   - Verify RLS policies

## 📱 What's Now Working

### ✅ Complete Dashboard System
- Main dashboard with stats
- Profile management
- Settings configuration
- Admin panel with full functionality

### ✅ Authentication System
- User signup/signin
- Profile creation
- Admin role management
- Secure API endpoints

### ✅ Database Backend
- User profiles with all fields
- Meeting request management
- RLS security policies
- Performance optimization

### ✅ API Endpoints
- `/api/profile` - Profile management
- `/api/settings` - User settings
- `/api/check-admin` - Admin verification
- `/api/admin/meetings` - Meeting management
- `/api/admin/users` - User management

## 🚀 Next Steps

1. **Test all functionality** locally
2. **Deploy to Vercel** (should work automatically)
3. **Add sample data** if needed
4. **Customize styling** to match your brand
5. **Add more features** as needed

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify database tables exist
3. Check environment variables
4. Test authentication flow step by step

Your Prop Shop AI system is now complete with all missing pieces implemented! 🎉
