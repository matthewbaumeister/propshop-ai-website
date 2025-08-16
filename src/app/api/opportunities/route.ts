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

    // Get user's opportunities
    const { data: opportunities, error: opportunitiesError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (opportunitiesError) {
      console.error('Error fetching opportunities:', opportunitiesError)
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
    }

    return NextResponse.json(opportunities || [])
  } catch (error) {
    console.error('Opportunities API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Create new opportunity
    const { data: opportunity, error: createError } = await supabase
      .from('opportunities')
      .insert({
        user_id: user.id,
        title: body.title,
        description: body.description,
        agency: body.agency,
        contract_value: body.contract_value,
        submission_deadline: body.submission_deadline,
        status: body.status || 'active'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating opportunity:', createError)
      return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
    }

    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('Opportunities API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
