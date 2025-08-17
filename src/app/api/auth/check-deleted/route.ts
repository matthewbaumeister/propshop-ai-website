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

    // For now, let's simplify this and only check if the user is deleted in Supabase auth
    // If they can authenticate, they're not deleted
    // The profile deletion status might be causing issues with new accounts
    const isDeleted = user.deleted_at ? true : false
    
    console.log('Simplified deletion check:', {
      user_id: user.id,
      email: user.email,
      deleted_at: user.deleted_at,
      isDeleted: isDeleted
    })

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
