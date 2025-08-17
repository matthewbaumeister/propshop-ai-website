import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, reason } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // For now, just log the inactivity logout
    // In production, you could integrate with SendGrid or another email service
    console.log(`User ${email} logged out due to inactivity`)
    
    // TODO: Implement email notification via SendGrid or similar service
    // The email template is ready above, just need to integrate with proper email service

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in inactivity logout notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
