"use client"

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export function Header() {
  const { user, signOut, loading } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  // Debug: Log user state
  console.log('Header - User state:', user, 'Loading:', loading)

  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="brand no-underline">
          <div className="logo-icon" style={{
            background: 'none !important',
            backgroundImage: 'none !important',
            backgroundSize: 'auto !important'
          }}>
            <img 
              src="/arrow-wall-new.svg" 
              alt="PropShop AI Logo" 
              className="w-24 h-24"
            />
          </div>
          <span 
            className="logo-text text-white no-underline" 
            style={{ marginLeft: '0.25rem' }}
          >
            Prop Shop AI
          </span>
        </Link>

        <nav className="nav">
          <div className="dropdown">
            <Link href="/solutions" className="nav-link">Solutions</Link>
            <ul className="dropdown-menu">
              <li><Link href="/small-business-success-hub" className="dropdown-link">PS.AI Small Business</Link></li>
              <li><Link href="/products/search" className="dropdown-link">PS.AI Search</Link></li>
              <li><Link href="/products/compliance" className="dropdown-link">PS.AI Compliance</Link></li>
              <li><Link href="/products/market-research" className="dropdown-link">PS.AI Market Research</Link></li>
              <li><Link href="/products/write" className="dropdown-link">PS.AI Write</Link></li>
            </ul>
          </div>
          <Link href="/publications" className="nav-link">Publications</Link>
          <Link href="/resources" className="nav-link">Resources</Link>
          <Link href="/about" className="nav-link">About</Link>
        </nav>

        <div className="header-buttons">
          <Link href="/contact" className="btn btn-ghost">Contact</Link>
          <Link href="/book-demo" className="btn btn-primary">
            Book a Demo →
          </Link>
          
          {/* Debug display - temporary */}
          {loading && (
            <div style={{ color: '#9AF23A', fontSize: '0.75rem', padding: '0.5rem' }}>
              Loading auth...
            </div>
          )}
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2D5BFF, #9AF23A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                {user.name || user.email}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0',
                  minWidth: '200px',
                  backdropFilter: 'blur(10px)',
                  zIndex: 1000
                }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ fontWeight: 600, color: 'white' }}>{user.name || 'User'}</div>
                    <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>{user.email}</div>
                  </div>
                  
                  <Link href="/dashboard" className="block" style={{
                    padding: '0.5rem 1rem',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'background 0.2s ease'
                  }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    Dashboard
                  </Link>
                  
                  <Link href="/dashboard/profile" className="block" style={{
                    padding: '0.5rem 1rem',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'background 0.2s ease'
                  }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    Profile
                  </Link>
                  
                  <Link href="/dashboard/settings" className="block" style={{
                    padding: '0.5rem 1rem',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'background 0.2s ease'
                  }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    Settings
                  </Link>
                  
                  <button 
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 1rem',
                      color: 'white',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 122, 41, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin" className="btn btn-ghost">Sign In</Link>
              <Link href="/auth/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
