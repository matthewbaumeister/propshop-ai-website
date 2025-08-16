import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch all meeting requests
    const { data: meetings, error: meetingsError } = await supabase
      .from('meeting_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError)
      return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 })
    }

    return NextResponse.json(meetings || [])
  } catch (error) {
    console.error('Admin meetings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
