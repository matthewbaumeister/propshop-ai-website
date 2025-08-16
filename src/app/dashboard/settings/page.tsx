'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

interface ProfileData {
  first_name?: string
  last_name?: string
  company?: string
  role?: string
  phone?: string
  bio?: string
  theme_preference?: 'light' | 'dark'
  email_notifications?: boolean
  admin_notifications?: boolean
  meeting_notifications?: boolean
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData>({})
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    twoFactorAuth: false,
    language: 'en',
    timezone: 'UTC'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences' | 'security'>('profile')

  useEffect(() => {
    if (user) {
      loadProfile()
      loadSettings()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleProfileSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSaveMessage('Not authenticated')
        return
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        setSaveMessage('Profile updated successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Error updating profile')
      }
    } catch (error) {
      setSaveMessage('Error updating profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingsSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSaveMessage('Not authenticated')
        return
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setSaveMessage('Settings saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Error saving settings')
      }
    } catch (error) {
      setSaveMessage('Error saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSettingChange = (setting: keyof typeof settings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div>Please sign in to view your settings.</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      lineHeight: 1.6,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            height: '1px',
            width: '48px',
            background: 'linear-gradient(to right, #9AF23A, #2D5BFF)'
          }}></div>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#9AF23A',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            SETTINGS
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <Link href="/dashboard" style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.1,
              color: 'white',
              margin: 0
            }}>
              Account Settings
            </h1>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div style={{
            padding: '1rem',
            marginBottom: '2rem',
            background: saveMessage.includes('success') ? 'rgba(154, 242, 58, 0.1)' : 'rgba(255, 122, 41, 0.1)',
            border: `1px solid ${saveMessage.includes('success') ? 'rgba(154, 242, 58, 0.3)' : 'rgba(255, 122, 41, 0.3)'}`,
            borderRadius: '0.5rem',
            color: saveMessage.includes('success') ? '#9AF23A' : '#FF7A29'
          }}>
            {saveMessage}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '1rem'
        }}>
          {[
            { id: 'profile', label: 'Profile Information' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'preferences', label: 'Preferences' },
            { id: 'security', label: 'Security' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'profile' | 'notifications' | 'preferences' | 'security')}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeTab === tab.id ? 'rgba(154, 242, 58, 0.2)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'rgba(154, 242, 58, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '0.5rem',
                color: activeTab === tab.id ? '#9AF23A' : 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              Personal Information
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#9CA3AF'
                }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#9CA3AF'
                }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#9CA3AF'
                }}>
                  Company
                </label>
                <input
                  type="text"
                  value={profile.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#9CA3AF'
                }}>
                  Role
                </label>
                <input
                  type="text"
                  value={profile.role || ''}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter your role"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#9CA3AF'
                }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter your phone number"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#9CA3AF'
                }}>
                  Bio
                </label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>

            <button
              onClick={handleProfileSave}
              disabled={isSaving}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #2D5BFF, #9AF23A)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              Notification Preferences
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <h3 style={{ color: 'white', marginBottom: '0.25rem' }}>Email Notifications</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Receive important updates via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    accentColor: '#9AF23A'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <h3 style={{ color: 'white', marginBottom: '0.25rem' }}>Push Notifications</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Get real-time alerts in your browser</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    accentColor: '#9AF23A'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <h3 style={{ color: 'white', marginBottom: '0.25rem' }}>Marketing Emails</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Receive updates about new features and offers</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    accentColor: '#9AF23A'
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleSettingsSave}
              disabled={isSaving}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #2D5BFF, #9AF23A)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Notifications'}
            </button>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              User Preferences
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#9CA3AF'
                }}>
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#9CA3AF'
                }}>
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="CST">Central Time</option>
                  <option value="MST">Mountain Time</option>
                  <option value="PST">Pacific Time</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSettingsSave}
              disabled={isSaving}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #2D5BFF, #9AF23A)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              Security Settings
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <h3 style={{ color: 'white', marginBottom: '0.25rem' }}>Two-Factor Authentication</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Add an extra layer of security to your account</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    accentColor: '#9AF23A'
                  }}
                />
              </div>

              <div style={{
                padding: '1rem',
                background: 'rgba(255, 122, 41, 0.1)',
                border: '1px solid rgba(255, 122, 41, 0.3)',
                borderRadius: '0.5rem',
                color: '#FF7A29'
              }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Password Change</h4>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                  To change your password, please use the &quot;Forgot Password&quot; option on the sign-in page.
                </p>
              </div>
            </div>

            <button
              onClick={handleSettingsSave}
              disabled={isSaving}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #2D5BFF, #9AF23A)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Security Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
