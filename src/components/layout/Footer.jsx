import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react'

const LINKS = {
  Platform: [['Home', '/'], ['Cost Estimator', '/estimator'], ['Login', '/login']],
  Services: [['New Construction', '/#services'], ['Renovation', '/#services'], ['Commercial', '/#services'], ['Interior Design', '/#services']],
  Company:  [['About Us', '/#about'], ['Our Projects', '/#projects'], ['How It Works', '/#how-it-works'], ['Contact', '/#contact']],
}

const CONTACT_LINES = [
  [Phone, '+91 98765 43210'],
  [Mail, 'hello@iconbuilderindia.com'],
  [MapPin, 'Hyderabad, Telangana, India'],
]

const SOCIALS = [
  [Instagram, 'Instagram'],
  [Youtube, 'YouTube'],
  [Linkedin, 'LinkedIn'],
  [Twitter, 'Twitter'],
]

export default function Footer() {
  const year = new Date().getFullYear()
  const scrollTo = (href) => {
    if (href.startsWith('/#')) document.getElementById(href.replace('/#', ''))?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="ftr">
      <style>{`
        .ftr {
          position: relative;
          z-index: 20;
          background: rgba(13, 24, 38, 0.55);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          border-top: 1px solid rgba(201,168,76,0.1);
        }

        .ftr__main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 4rem 1.5rem;
        }

        .ftr__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        @media (min-width: 768px) {
          .ftr__grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .ftr__grid { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2.5rem; }
        }

        /* ── Brand column ── */
        .ftr__brand-link {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          text-decoration: none;
        }

        .ftr__logo {
          position: relative;
          width: 2.25rem;
          height: 2.25rem;
          flex-shrink: 0;
        }
        .ftr__logo-bg {
          position: absolute;
          inset: 0;
          background: rgba(201,168,76,0.2);
          border-radius: 0.5rem;
          transform: rotate(45deg);
          transition: transform 0.3s ease;
        }
        .ftr__brand-link:hover .ftr__logo-bg { transform: rotate(12deg); }
        .ftr__logo-letter {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a84c;
          font-weight: 900;
          font-size: 0.9rem;
        }

        .ftr__brand-name {
          font-weight: 900;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .ftr__brand-name-1 { color: #e8d5a3; }
        .ftr__brand-name-2 { color: #c9a84c; }
        .ftr__brand-sub {
          font-size: 0.5rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8fa3b8;
          margin-top: 0.15rem;
        }

        .ftr__desc {
          color: #8fa3b8;
          font-size: 0.875rem;
          line-height: 1.7;
          max-width: 20rem;
          margin: 0 0 1.5rem;
        }

        .ftr__contact-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .ftr__contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #8fa3b8;
        }

        .ftr__socials {
          display: flex;
          gap: 0.5rem;
        }
        .ftr__social-btn {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8fa3b8;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .ftr__social-btn:hover {
          color: #c9a84c;
          border-color: rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.05);
        }

        /* ── Link columns ── */
        .ftr__col-title {
          color: #e8d5a3;
          font-weight: 700;
          font-size: 0.875rem;
          margin: 0 0 1rem;
        }
        .ftr__col-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .ftr__col-link {
          background: none;
          border: none;
          padding: 0;
          color: #8fa3b8;
          font-size: 0.875rem;
          text-decoration: none;
          cursor: pointer;
          display: inline-block;
          transition: color 0.2s ease, transform 0.2s ease;
          font-family: inherit;
        }
        .ftr__col-link:hover {
          color: #c9a84c;
          transform: translateX(3px);
        }

        /* ── Bottom bar ── */
        .ftr__bottom {
          border-top: 1px solid rgba(201,168,76,0.08);
        }
        .ftr__bottom-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }
        @media (min-width: 640px) {
          .ftr__bottom-inner { flex-direction: row; }
        }
        .ftr__copyright,
        .ftr__made-in {
          color: #8fa3b8;
          font-size: 0.75rem;
          margin: 0;
          text-align: center;
        }
        .ftr__legal {
          display: flex;
          gap: 1.25rem;
        }
        .ftr__legal-link {
          color: #8fa3b8;
          font-size: 0.75rem;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .ftr__legal-link:hover { color: #c9a84c; }

        /* ══════════════════════════════════════════
           MOBILE (≤640px)
           ══════════════════════════════════════════ */
        @media (max-width: 640px) {
          .ftr__main { padding: 3rem 1.25rem; }
          .ftr__grid { gap: 2rem; }
          .ftr__desc { max-width: none; font-size: 0.82rem; }
          .ftr__brand-name { font-size: 1.1rem; }
        }
      `}</style>

      <div className="ftr__main">
        <div className="ftr__grid">

          {/* Brand */}
          <div>
            <Link to="/" className="ftr__brand-link">
              <div className="ftr__logo">
                <div className="ftr__logo-bg" />
                <div className="ftr__logo-letter">R</div>
              </div>
              <div>
                <div className="ftr__brand-name">
                  <span className="ftr__brand-name-1">RELIA</span>
                  <span className="ftr__brand-name-2">STATE</span>
                </div>
                <div className="ftr__brand-sub">AI-Powered Platform</div>
              </div>
            </Link>

            <p className="ftr__desc">
              India's first AI-powered construction management platform. Building trust
              through transparency, technology, and timely delivery.
            </p>

            <div className="ftr__contact-list">
              {CONTACT_LINES.map(([Icon, value]) => (
                <div key={value} className="ftr__contact-item">
                  <Icon size={13} color="#c9a84c99" />
                  <span>{value}</span>
                </div>
              ))}
            </div>

            <div className="ftr__socials">
              {SOCIALS.map(([Icon, label]) => (
                <a key={label} href="#" aria-label={label} className="ftr__social-btn">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="ftr__col-title">{title}</h4>
              <ul className="ftr__col-list">
                {links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('/#') ? (
                      <button onClick={() => scrollTo(href)} className="ftr__col-link">
                        {label}
                      </button>
                    ) : (
                      <Link to={href} className="ftr__col-link">
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="ftr__bottom">
        <div className="ftr__bottom-inner">
          <p className="ftr__copyright">© {year} ReliaState — iconbuilderindia.com. All rights reserved.</p>
          <div className="ftr__legal">
            <a href="#" className="ftr__legal-link">Privacy Policy</a>
            <a href="#" className="ftr__legal-link">Terms of Service</a>
          </div>
          <p className="ftr__made-in">Built By Developer Siva Prasad</p>
        </div>
      </div>
    </footer>
  )
}