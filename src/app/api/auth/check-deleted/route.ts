import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error listing users:', userError)
      return NextResponse.json({ error: 'Failed to check user status' }, { status: 500 })
    }

    const user = users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ deleted: false, exists: false })
    }

    // Debug: Log user object to see available fields
    console.log('User object from auth.admin.listUsers:', {
      id: user.id,
      email: user.email,
      deleted_at: user.deleted_at,
      confirmed_at: user.confirmed_at,
      email_confirmed_at: user.email_confirmed_at
    })

    // Check if user profile is soft deleted
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('deleted_at')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileError)
      return NextResponse.json({ error: 'Failed to check user status' }, { status: 500 })
    }

    // Check if user is deleted in auth.users or if profile is soft deleted
    // Note: Supabase might use different field names for deletion status
    const isDeleted = user.deleted_at || profile?.deleted_at ? true : false

    return NextResponse.json({ 
      deleted: isDeleted, 
      exists: true,
      message: isDeleted ? 'Account has been deleted' : 'Account is active'
    })

  } catch (error) {
    console.error('Error in POST /api/auth/check-deleted:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
