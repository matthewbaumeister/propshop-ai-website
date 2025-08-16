import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user settings from the database
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError) {
      console.error('Error fetching settings:', settingsError)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Return the settings
    return NextResponse.json({
      emailNotifications: settings.email_notifications,
      pushNotifications: settings.push_notifications,
      marketingEmails: settings.marketing_emails,
      twoFactorAuth: settings.two_factor_auth,
      language: settings.language,
      timezone: settings.timezone,
      themePreference: settings.theme_preference
    })

  } catch (error) {
    console.error('Error in GET /api/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    
    // Validate the input
    const {
      emailNotifications,
      pushNotifications,
      marketingEmails,
      twoFactorAuth,
      language,
      timezone,
      themePreference
    } = body

    // Update user settings in the database
    const { data: updatedSettings, error: updateError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        marketing_emails: marketingEmails,
        two_factor_auth: twoFactorAuth,
        language: language || 'en',
        timezone: timezone || 'UTC',
        theme_preference: themePreference || 'dark'
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (updateError) {
      console.error('Error updating settings:', updateError)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: {
        emailNotifications: updatedSettings.email_notifications,
        pushNotifications: updatedSettings.push_notifications,
        marketingEmails: updatedSettings.marketing_emails,
        twoFactorAuth: updatedSettings.two_factor_auth,
        language: updatedSettings.language,
        timezone: updatedSettings.timezone,
        themePreference: updatedSettings.theme_preference
      }
    })

  } catch (error) {
    console.error('Error in POST /api/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
