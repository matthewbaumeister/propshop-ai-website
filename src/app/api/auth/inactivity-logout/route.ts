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

    // Send inactivity notification email via Supabase
    const { error } = await supabase.auth.admin.sendRawEmail({
      to: email,
      subject: 'Prop Shop AI - Session Timeout Notification',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2D5BFF; margin: 0; font-size: 24px;">Prop Shop AI</h1>
            <p style="color: #6B7280; margin: 10px 0 0 0; font-size: 16px;">Procurement intelligence for the challengers</p>
          </div>
          
          <div style="background: #F9FAFB; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 20px;">Session Timeout Notification</h2>
            
            <p style="color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
              Hello,
            </p>
            
            <p style="color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
              For security reasons, your Prop Shop AI session has been automatically terminated due to 30 minutes of inactivity.
            </p>
            
            <p style="color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
              This is a standard security measure to protect your account and ensure that sensitive procurement information remains secure.
            </p>
            
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400E; margin: 0; font-size: 14px; font-weight: 500;">
                <strong>Security Tip:</strong> Always sign out of your account when you're done, especially on shared or public computers.
              </p>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://prop-shop.ai/auth/signin" 
               style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #2D5BFF, #9AF23A); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Sign In Again
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
            <p style="color: #9CA3AF; margin: 0; font-size: 14px;">
              If you have any questions about this notification, please contact our support team.
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <p style="color: #9CA3AF; margin: 0; font-size: 12px;">
              Prop Shop AI — Where innovation meets compliance
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Error sending inactivity notification email:', error)
      // Don't fail the logout process if email fails
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in inactivity logout notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
