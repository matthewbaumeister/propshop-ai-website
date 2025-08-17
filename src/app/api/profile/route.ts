import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get the current user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from the database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // No profile found, create a default one
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            first_name: user.user_metadata?.name || user.user_metadata?.full_name || user.email!.split('@')[0],
            last_name: '',
            company: '',
            role: 'user',
            phone: '',
            bio: '',
            theme_preference: 'dark',
            email_notifications: true,
            admin_notifications: false,
            meeting_notifications: false
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating default profile:', createError)
          return NextResponse.json({ error: 'Failed to create default profile' }, { status: 500 })
        }

        // Profile created successfully

        return NextResponse.json(newProfile)
      } else {
        console.error('Error fetching profile:', profileError)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
      }
    }

    // Profile found successfully

    // Return the profile
    return NextResponse.json(profile)

  } catch (error) {
    console.error('Error in GET /api/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get the current user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    
    // Update user profile in the database
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        first_name: body.first_name,
        last_name: body.last_name,
        company: body.company,
        role: body.role,
        phone: body.phone,
        bio: body.bio,
        theme_preference: body.theme_preference || 'dark'
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Error in POST /api/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get the current user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mark user as deleted instead of completely removing them
    // This prevents signin while allowing new signups with same email
    const { data: deleteResult, error: deleteError } = await supabase
      .rpc('mark_user_as_deleted', { user_uuid: user.id })

    if (deleteError) {
      console.error('Error marking user as deleted:', deleteError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    // Sign out the user from Supabase Auth
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error('Error signing out user:', signOutError)
      // Continue even if sign out fails
    }

    // Return success response
    return NextResponse.json({ 
      message: 'Account deleted successfully. You will need to sign up again if you want to rejoin.'
    })

  } catch (error) {
    console.error('Error in DELETE /api/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
