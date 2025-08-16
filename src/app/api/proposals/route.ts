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

    // Get user's proposals
    const { data: proposals, error: proposalsError } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (proposalsError) {
      console.error('Error fetching proposals:', proposalsError)
      return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
    }

    return NextResponse.json(proposals || [])
  } catch (error) {
    console.error('Proposals API error:', error)
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

    // Create new proposal
    const { data: proposal, error: createError } = await supabase
      .from('proposals')
      .insert({
        user_id: user.id,
        title: body.title,
        description: body.description,
        status: body.status || 'draft',
        contract_value: body.contract_value,
        agency: body.agency,
        submission_deadline: body.submission_deadline
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating proposal:', createError)
      return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
    }

    return NextResponse.json(proposal)
  } catch (error) {
    console.error('Proposals API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
