"use client"

import Link from "next/link"

export function Header() {
  return (
    <header>
      <div className="container">
        <Link href="/" className="logo">
          <div className="logo-icon">PS</div>
          <span className="logo-text">Prop Shop AI</span>
        </Link>

        <nav>
          <Link href="/solutions">Solutions</Link>
          <Link href="/capture">Capture</Link>
          <Link href="/proposals">Proposals</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/about">About</Link>
        </nav>

        <div className="header-buttons">
          <a href="/contact" className="btn btn-ghost">Contact</a>
          <a href="/book-demo" className="btn btn-primary">Book a Demo →</a>
        </div>
      </div>
    </header>
  )
}
