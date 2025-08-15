"use client"

import Link from 'next/link'

export function Header() {
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
        </div>
      </div>
    </header>
  )
}
