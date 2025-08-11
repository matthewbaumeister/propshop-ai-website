

export function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="badge">
          The Procurement Intelligence and Compliance Platform
        </div>

        <h1>
          Where innovation meets
          <br />
          <span>compliance.</span>
        </h1>

        <p>
          Find, win, and deliver government contracts — without the gatekeepers. 
          The procurement intelligence platform that levels the playing field for challengers and incumbents alike.
        </p>

        <div className="hero-buttons">
          <a href="/book-demo" className="btn btn-primary btn-lg">
            Book a Demo →
          </a>
          <a href="#" className="btn btn-outline btn-lg">
            See How It Works
          </a>
        </div>
      </div>

      {/* Proof Row */}
      <div className="proof-row">
        <div className="container">
          <p className="proof-label">
            Trusted by innovators, primes, and government agencies
          </p>
          <div className="proof-items">
            <div className="proof-item">SDVOSB</div>
            <div className="proof-item">8(a)</div>
            <div className="proof-item">WOSB</div>
            <div className="proof-item">HUBZone</div>
            <div className="proof-item">VOSB</div>
            <div className="proof-item">EDWOSB</div>
            <div className="proof-item">SBA</div>
            <div className="proof-item">Primes</div>
            <div className="proof-item">Startups</div>
            <div className="proof-item">Fortune 500</div>
            <div className="proof-item">DoD</div>
            <div className="proof-item">Federal</div>
          </div>
        </div>
      </div>

      {/* How It Works (3 Steps) */}
      <div className="container">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">01</div>
            <h3>Search & Discover</h3>
            <p>
              Real-time intelligence on opportunities and competitors with advanced search filters and AI-powered matching.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">02</div>
            <h3>Assemble & Comply</h3>
            <p>
              Pre-built templates with compliance baked in that pass first review and reduce submission time by 70%.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">03</div>
            <h3>Submit & Compete</h3>
            <p>
              Government-ready deliverables without prime control or gatekeepers. Direct access to decision-makers.
            </p>
          </div>
        </div>
      </div>

      {/* Impact Statement */}
      <div className="quote-section">
        <div className="container">
          <div className="quote-container">
            <blockquote className="quote">
              The most capable vendor should win — not the one with the most lobbyists.
            </blockquote>
            <p className="quote-attribution">
              — Prop Shop AI Vision Statement
            </p>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="bg-decoration">
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
      </div>
    </section>
  )
}
