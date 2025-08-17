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
  const [originalProfile, setOriginalProfile] = useState<ProfileData>({})
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    twoFactorAuth: false,
    language: 'en',
    timezone: 'UTC'
  })
  const [originalSettings, setOriginalSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    twoFactorAuth: false,
    language: 'en',
    timezone: 'UTC'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error'>('success')
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences' | 'security'>('profile')
  
  // 2FA Setup Modal State
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFASetupStep, setTwoFASetupStep] = useState<'qr' | 'verify'>('qr')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [is2FASetupLoading, setIs2FASetupLoading] = useState(false)

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
        setOriginalProfile(data) // Store original values for change detection
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
        setOriginalSettings(data) // Store original values for change detection
      } else {
        console.error('Failed to load settings:', response.status)
        // Set default settings if none exist
        const defaultSettings = {
          emailNotifications: true,
          pushNotifications: false,
          marketingEmails: false,
          twoFactorAuth: false,
          language: 'en',
          timezone: 'UTC'
        }
        setSettings(defaultSettings)
        setOriginalSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      // Set default settings on error
      const defaultSettings = {
        emailNotifications: true,
        pushNotifications: false,
        marketingEmails: false,
        twoFactorAuth: false,
        language: 'en',
        timezone: 'UTC'
      }
      setSettings(defaultSettings)
      setOriginalSettings(defaultSettings)
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
        setSaveMessageType('success')
        setSaveMessage('Profile updated successfully!')
        setOriginalProfile(profile) // Reset original values after successful save
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessageType('error')
        setSaveMessage('Error updating profile')
      }
    } catch (error) {
      setSaveMessageType('error')
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
        setSaveMessageType('success')
        setSaveMessage('Settings saved successfully!')
        setOriginalSettings(settings) // Reset original values after successful save
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessageType('error')
        setSaveMessage('Error saving settings')
      }
    } catch (error) {
      setSaveMessageType('error')
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

  // Check if profile has changes
  const hasProfileChanges = () => {
    return Object.keys(profile).some(key => {
      const field = key as keyof ProfileData
      return profile[field] !== originalProfile[field]
    })
  }

  // Check if settings have changes
  const hasSettingsChanges = () => {
    return Object.keys(settings).some(key => {
      const field = key as keyof typeof settings
      return settings[field] !== originalSettings[field]
    })
  }

  // Check if current tab has changes
  const hasCurrentTabChanges = () => {
    switch (activeTab) {
      case 'profile':
        return hasProfileChanges()
      case 'notifications':
      case 'preferences':
      case 'security':
        return hasSettingsChanges()
      default:
        return false
    }
  }

  // 2FA Setup Functions
  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled) {
      // Enable 2FA - show setup modal
      setShow2FAModal(true)
      setTwoFASetupStep('qr')
      await generate2FAQRCode()
    } else {
      // Disable 2FA
      const newSettings = { ...settings, twoFactorAuth: false }
      setSettings(newSettings)
    }
  }

  const generate2FAQRCode = async () => {
    setIs2FASetupLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // This would call your backend to generate a 2FA secret and QR code
      // For now, we'll simulate it with a placeholder
      setQrCodeUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZtaWxseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjJGQSBRUiBDb2RlPC90ZXh0Pjwvc3ZnPg==')
      setIs2FASetupLoading(false)
    } catch (error) {
      console.error('Error generating 2FA QR code:', error)
      setIs2FASetupLoading(false)
    }
  }

  const verify2FACode = async () => {
    if (!verificationCode || verificationCode.length !== 6) return
    
    setIs2FASetupLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // This would call your backend to verify the 2FA code
      // For now, we'll simulate success
      setTimeout(() => {
        const newSettings = { ...settings, twoFactorAuth: true }
        setSettings(newSettings)
        setShow2FAModal(false)
        setVerificationCode('')
        setTwoFASetupStep('qr')
        setIs2FASetupLoading(false)
        setSaveMessageType('success')
        setSaveMessage('Two-factor authentication enabled successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      }, 1000)
    } catch (error) {
      console.error('Error verifying 2FA code:', error)
      setIs2FASetupLoading(false)
    }
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
            background: saveMessageType === 'success' ? 'rgba(154, 242, 58, 0.1)' : 'rgba(255, 122, 41, 0.1)',
            border: `1px solid ${saveMessageType === 'success' ? 'rgba(154, 242, 58, 0.3)' : 'rgba(255, 122, 41, 0.3)'}`,
            borderRadius: '0.5rem',
            color: saveMessageType === 'success' ? '#9AF23A' : '#FF7A29',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {saveMessageType === 'success' ? (
              <span style={{ fontSize: '1.25rem' }}>✅</span>
            ) : (
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            )}
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
              disabled={isSaving || !hasProfileChanges()}
              style={{
                padding: '0.75rem 2rem',
                background: hasProfileChanges() ? 'linear-gradient(135deg, #2D5BFF, #9AF23A)' : 'rgba(128, 128, 128, 0.3)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: (isSaving || !hasProfileChanges()) ? 'not-allowed' : 'pointer',
                opacity: (isSaving || !hasProfileChanges()) ? 0.6 : 1,
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
              disabled={isSaving || !hasSettingsChanges()}
              style={{
                padding: '0.75rem 2rem',
                background: hasSettingsChanges() ? 'linear-gradient(135deg, #2D5BFF, #9AF23A)' : 'rgba(128, 128, 128, 0.3)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: (isSaving || !hasSettingsChanges()) ? 'not-allowed' : 'pointer',
                opacity: (isSaving || !hasSettingsChanges()) ? 0.6 : 1,
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
              disabled={isSaving || !hasSettingsChanges()}
              style={{
                padding: '0.75rem 2rem',
                background: hasSettingsChanges() ? 'linear-gradient(135deg, #2D5BFF, #9AF23A)' : 'rgba(128, 128, 128, 0.3)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: (isSaving || !hasSettingsChanges()) ? 'not-allowed' : 'pointer',
                opacity: (isSaving || !hasSettingsChanges()) ? 0.6 : 1,
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
                  onChange={(e) => handle2FAToggle(e.target.checked)}
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
                  <h3 style={{ color: 'white', marginBottom: '0.25rem' }}>Session Management</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Manage active sessions and device access</p>
                </div>
                <button
                  onClick={() => {
                    // This would typically open a modal or navigate to session management
                    alert('Session management feature coming soon!')
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(45, 91, 255, 0.2)',
                    border: '1px solid rgba(45, 91, 255, 0.4)',
                    borderRadius: '0.25rem',
                    color: '#2D5BFF',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  Manage Sessions
                </button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255, 122, 41, 0.1)',
                border: '1px solid rgba(255, 122, 41, 0.3)',
                borderRadius: '0.5rem',
                color: '#FF7A29'
              }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Password Change</h4>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    Update your account password for enhanced security
                  </p>
                </div>
                <button
                  onClick={() => {
                    // This would typically open a password change modal or navigate to password change page
                    alert('Password change feature coming soon!')
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 122, 41, 0.2)',
                    border: '1px solid rgba(255, 122, 41, 0.4)',
                    borderRadius: '0.25rem',
                    color: '#FF7A29',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  Change Password
                </button>
              </div>
            </div>

            <button
              onClick={handleSettingsSave}
              disabled={isSaving || !hasSettingsChanges()}
              style={{
                padding: '0.75rem 2rem',
                background: hasSettingsChanges() ? 'linear-gradient(135deg, #2D5BFF, #9AF23A)' : 'rgba(128, 128, 128, 0.3)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: (isSaving || !hasSettingsChanges()) ? 'not-allowed' : 'pointer',
                opacity: (isSaving || !hasSettingsChanges()) ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Security Settings'}
            </button>
          </div>
        )}

        {/* 2FA Setup Modal */}
        {show2FAModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'rgba(11, 18, 32, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white',
                  margin: 0
                }}>
                  Set Up Two-Factor Authentication
                </h2>
                <button
                  onClick={() => setShow2FAModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  ×
                </button>
              </div>

              {twoFASetupStep === 'qr' && (
                <div>
                  <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    {is2FASetupLoading ? (
                      <div style={{
                        width: '200px',
                        height: '200px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9CA3AF'
                      }}>
                        Loading QR Code...
                      </div>
                    ) : (
                      <img 
                        src={qrCodeUrl} 
                        alt="2FA QR Code" 
                        style={{
                          width: '200px',
                          height: '200px',
                          borderRadius: '0.5rem'
                        }}
                      />
                    )}
                  </div>

                  <div style={{
                    background: 'rgba(154, 242, 58, 0.1)',
                    border: '1px solid rgba(154, 242, 58, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ color: '#9AF23A', marginBottom: '0.5rem' }}>Setup Instructions:</h4>
                    <ol style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: 0, paddingLeft: '1rem' }}>
                      <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                      <li>Scan the QR code above</li>
                      <li>Enter the 6-digit code from your app</li>
                    </ol>
                  </div>

                  <button
                    onClick={() => setTwoFASetupStep('verify')}
                    disabled={is2FASetupLoading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #2D5BFF, #9AF23A)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: is2FASetupLoading ? 'not-allowed' : 'pointer',
                      opacity: is2FASetupLoading ? 0.6 : 1
                    }}
                  >
                    I've Scanned the QR Code
                  </button>
                </div>
              )}

              {twoFASetupStep === 'verify' && (
                <div>
                  <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>
                    Enter the 6-digit verification code from your authenticator app
                  </p>
                  
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '1.25rem',
                      textAlign: 'center',
                      letterSpacing: '0.5rem',
                      marginBottom: '1.5rem'
                    }}
                    maxLength={6}
                  />

                  <div style={{
                    display: 'flex',
                    gap: '1rem'
                  }}>
                    <button
                      onClick={() => setTwoFASetupStep('qr')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={verify2FACode}
                      disabled={verificationCode.length !== 6 || is2FASetupLoading}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, #2D5BFF, #9AF23A)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: (verificationCode.length !== 6 || is2FASetupLoading) ? 'not-allowed' : 'pointer',
                        opacity: (verificationCode.length !== 6 || is2FASetupLoading) ? 0.6 : 1
                      }}
                    >
                      {is2FASetupLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
