import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

    // Get user settings from the database
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError) {
      if (settingsError.code === 'PGRST116') {
        // No settings found, create default settings
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            email_notifications: true,
            push_notifications: false,
            marketing_emails: false,
            two_factor_auth: false,
            language: 'en',
            timezone: 'UTC',
            theme_preference: 'dark'
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating default settings:', createError)
          return NextResponse.json({ error: 'Failed to create default settings' }, { status: 500 })
        }

        // Return the newly created default settings
        return NextResponse.json({
          emailNotifications: newSettings.email_notifications,
          pushNotifications: newSettings.push_notifications,
          marketingEmails: newSettings.marketing_emails,
          twoFactorAuth: newSettings.two_factor_auth,
          language: newSettings.language,
          timezone: newSettings.timezone,
          themePreference: newSettings.theme_preference
        })
      } else {
        console.error('Error fetching settings:', settingsError)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
      }
    }

    // Check if account is soft deleted
    if (settings.deleted_at) {
      return NextResponse.json({ error: 'Account has been deleted' }, { status: 403 })
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
