import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, Phone, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { label: 'Home',         href: '/#home' },
  { label: 'About',        href: '/#about' },
  { label: 'Services',     href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Projects',     href: '/#projects' },
  { label: 'Contact',      href: '/#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const userMenuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      const sections = ['home', 'about', 'services', 'how-it-works', 'projects', 'contact']
      for (const id of sections.reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const scrollTo = (href) => {
    const id = href.replace('/#', '')
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileOpen(false)
  }

  const dashboardLink = {
    client: '/client',
    contractor: '/contractor',
    admin: '/admin',
  }[user?.role] || '/dashboard'

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <>
      <style>{`
        .nb {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          transition: all 0.4s ease;
          background: transparent;
        }
        .nb--scrolled {
          background: rgba(13, 24, 38, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(201,168,76,0.1);
          box-shadow: 0 4px 30px rgba(0,0,0,0.4);
        }

        .nb__inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }
        @media (min-width: 640px)  { .nb__inner { padding: 0 2rem; } }
        @media (min-width: 1024px) { .nb__inner { padding: 0 2.5rem; } }

        .nb__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 4.5rem;
        }

        /* ── Logo ── */
        .nb__brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
          text-decoration: none;
        }
        .nb__logo {
          position: relative;
          width: 2.5rem;
          height: 2.75rem;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .nb__brand:hover .nb__logo { transform: translateY(-2px); }

        .nb__brand-text {
          font-weight: 900;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .nb__brand-cream { color: #e8d5a3; }
        .nb__brand-gold { color: #c9a84c; }
        .nb__brand-sub {
          font-size: 0.5rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8fa3b8;
          line-height: 1;
          margin-top: 0.25rem;
        }

        /* ── Desktop nav links ── */
        .nb__links {
          display: none;
          align-items: center;
          gap: 0.375rem;
        }
        @media (min-width: 1024px) { .nb__links { display: flex; } }

        .nb__link {
          position: relative;
          padding: 0.6rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(232,213,163,0.7);
          transition: color 0.2s ease;
          font-family: inherit;
        }
        .nb__link:hover { color: #e8d5a3; }
        .nb__link--active { color: #c9a84c; }

        .nb__link-underline {
          position: absolute;
          bottom: 0.25rem;
          left: 50%;
          transform: translateX(-50%);
          height: 2px;
          width: 0;
          background: #c9a84c;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }
        .nb__link:hover .nb__link-underline { width: 0.75rem; }
        .nb__link--active .nb__link-underline { width: 1rem; }

        /* ── Right side actions ── */
        .nb__actions {
          display: none;
          align-items: center;
          gap: 0.65rem;
        }
        @media (min-width: 1024px) { .nb__actions { display: flex; } }

        .nb__estimate {
          height: 2.5rem;
          display: flex;
          align-items: center;
          padding: 0 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 0.5rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .nb__estimate:hover {
          background: rgba(201,168,76,0.1);
          border-color: rgba(201,168,76,0.6);
        }

        .nb__login {
          height: 2.5rem;
          display: flex;
          align-items: center;
          padding: 0 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          text-decoration: none;
          box-shadow: 0 0 16px rgba(201,168,76,0.25);
          transition: all 0.2s ease;
        }
        .nb__login:hover {
          box-shadow: 0 0 24px rgba(201,168,76,0.4);
          transform: translateY(-2px);
        }

        .nb__whatsapp {
          height: 2.5rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0 0.85rem;
          border-radius: 0.5rem;
          background: rgba(37,211,102,0.1);
          border: 1px solid rgba(37,211,102,0.2);
          color: #25D366;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .nb__whatsapp:hover { background: rgba(37,211,102,0.2); }
        .nb__whatsapp-label { display: none; }
        @media (min-width: 1280px) { .nb__whatsapp-label { display: inline; } }

        /* ── User menu ── */
        .nb__user-wrap { position: relative; }
        .nb__user-btn {
          height: 2.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 0.85rem;
          border-radius: 0.5rem;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.2);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .nb__user-btn:hover { background: rgba(201,168,76,0.2); }

        .nb__user-avatar {
          width: 1.6rem;
          height: 1.6rem;
          border-radius: 50%;
          background: rgba(201,168,76,0.2);
          border: 1px solid rgba(201,168,76,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a84c;
          font-size: 0.7rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .nb__user-name {
          color: #e8d5a3;
          font-size: 0.875rem;
          font-weight: 500;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .nb__chevron {
          color: #c9a84c;
          transition: transform 0.2s ease;
        }
        .nb__chevron--open { transform: rotate(180deg); }

        .nb__dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 0.5rem);
          width: 12rem;
          background: #0d1826;
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 0.85rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          overflow: hidden;
          animation: nb-scale-in 0.15s ease-out;
        }
        @keyframes nb-scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .nb__dropdown-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(201,168,76,0.1);
        }
        .nb__dropdown-name {
          color: #e8d5a3;
          font-size: 0.875rem;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin: 0;
        }
        .nb__dropdown-role {
          color: #8fa3b8;
          font-size: 0.75rem;
          text-transform: capitalize;
          margin: 0.15rem 0 0;
        }

        .nb__dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: rgba(232,213,163,0.8);
          background: none;
          border: none;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          box-sizing: border-box;
        }
        .nb__dropdown-item:hover {
          color: #c9a84c;
          background: rgba(201,168,76,0.05);
        }
        .nb__dropdown-item--danger { color: #f87171; }
        .nb__dropdown-item--danger:hover { background: rgba(248,113,113,0.05); }

        /* ── Mobile hamburger ── */
        .nb__burger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(201,168,76,0.2);
          background: none;
          color: #c9a84c;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .nb__burger:hover { background: rgba(201,168,76,0.1); }
        @media (min-width: 1024px) { .nb__burger { display: none; } }

        /* ── Mobile menu ── */
        .nb__mobile {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: all 0.3s ease;
          background: rgba(13, 24, 38, 0.98);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(201,168,76,0.1);
        }
        .nb__mobile--open {
          max-height: 600px;
          opacity: 1;
        }
        @media (min-width: 1024px) { .nb__mobile { display: none; } }

        .nb__mobile-inner {
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nb__mobile-link {
          width: 100%;
          text-align: left;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(232,213,163,0.7);
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .nb__mobile-link:hover { color: #e8d5a3; background: rgba(255,255,255,0.05); }
        .nb__mobile-link--active {
          background: rgba(201,168,76,0.1);
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.2);
        }

        .nb__mobile-actions {
          padding-top: 0.75rem;
          margin-top: 0.5rem;
          border-top: 1px solid rgba(201,168,76,0.1);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nb__mobile-btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          text-align: center;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          box-sizing: border-box;
          cursor: pointer;
          border: none;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .nb__mobile-btn--outline {
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.3);
          background: transparent;
        }
        .nb__mobile-btn--outline:hover { background: rgba(201,168,76,0.1); }
        .nb__mobile-btn--gold {
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          font-weight: 700;
        }
        .nb__mobile-btn--danger {
          color: #f87171;
          border: 1px solid rgba(248,113,113,0.2);
          background: transparent;
        }
        .nb__mobile-btn--danger:hover { background: rgba(248,113,113,0.05); }
        .nb__mobile-btn--whatsapp {
          color: #25D366;
          border: 1px solid rgba(37,211,102,0.2);
          background: transparent;
        }
        .nb__mobile-btn--whatsapp:hover { background: rgba(37,211,102,0.1); }

        .nb__spacer { height: 4.5rem; }
      `}</style>

      <nav className={`nb ${scrolled ? 'nb--scrolled' : ''}`}>
        <div className="nb__inner">
          <div className="nb__row">

            {/* Logo */}
            <Link to="/" className="nb__brand">
              <div className="nb__logo">
                <svg viewBox="0 0 160 190" width="100%" height="100%">
                  <defs>
                    <linearGradient id="nav-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f0d080" />
                      <stop offset="50%" stopColor="#c9a227" />
                      <stop offset="100%" stopColor="#9c7c1e" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(5, 12)">
                    <path
                      d="M15,25 Q15,10 30,10 L110,10 Q125,10 125,25 L125,85 Q125,125 70,158 Q15,125 15,85 Z"
                      fill="#0a0e1a" stroke="url(#nav-gold)" strokeWidth="1.75"
                    />
                    <path
                      d="M22,29 Q22,18 33,18 L107,18 Q118,18 118,29 L118,82 Q118,116 70,147 Q22,116 22,82 Z"
                      fill="none" stroke="#c9a227" strokeOpacity="0.45" strokeWidth="1"
                    />
                    <rect x="65" y="1" width="10" height="10" rx="1" transform="rotate(45 70 6)" fill="url(#nav-gold)" />
                    <text
                      x="70" y="98" textAnchor="middle"
                      fontFamily="Georgia, serif" fontSize="52" fontWeight="500"
                      fill="url(#nav-gold)" letterSpacing="-4"
                    >
                      IB
                    </text>
                    <line x1="40" y1="112" x2="100" y2="112" stroke="#c9a227" strokeOpacity="0.5" strokeWidth="1" />
                  </g>
                </svg>
              </div>
              <div>
                <div className="nb__brand-text">
                  <span className="nb__brand-cream">ICON</span>
                  <span className="nb__brand-gold">BUILDERS</span>
                </div>
                <div className="nb__brand-sub">AI-Powered Platform</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="nb__links">
              {NAV_LINKS.map((link) => {
                const id = link.href.replace('/#', '')
                const isActive = activeSection === id
                return (
                  <button
                    key={link.label}
                    onClick={() => scrollTo(link.href)}
                    className={`nb__link ${isActive ? 'nb__link--active' : ''}`}
                  >
                    {link.label}
                    <span className="nb__link-underline" />
                  </button>
                )
              })}
            </div>

            {/* Right side actions */}
            <div className="nb__actions">
              <Link to="/estimator" className="nb__estimate">
                Free Estimate
              </Link>

              {isAuthenticated ? (
                <div className="nb__user-wrap" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="nb__user-btn">
                    <div className="nb__user-avatar">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="nb__user-name">{user?.name || 'User'}</span>
                    <ChevronDown size={14} className={`nb__chevron ${userMenuOpen ? 'nb__chevron--open' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="nb__dropdown">
                      <div className="nb__dropdown-header">
                        <p className="nb__dropdown-name">{user?.name}</p>
                        <p className="nb__dropdown-role">{user?.role}</p>
                      </div>
                      <Link
                        to={dashboardLink}
                        onClick={() => setUserMenuOpen(false)}
                        className="nb__dropdown-item"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                      <button onClick={handleLogout} className="nb__dropdown-item nb__dropdown-item--danger">
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="nb__login">
                  Login
                </Link>
              )}

              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="nb__whatsapp"
              >
                <Phone size={13} />
                <span className="nb__whatsapp-label">WhatsApp</span>
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="nb__burger"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`nb__mobile ${mobileOpen ? 'nb__mobile--open' : ''}`}>
          <div className="nb__mobile-inner">
            {NAV_LINKS.map((link) => {
              const id = link.href.replace('/#', '')
              const isActive = activeSection === id
              return (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className={`nb__mobile-link ${isActive ? 'nb__mobile-link--active' : ''}`}
                >
                  {link.label}
                </button>
              )
            })}

            <div className="nb__mobile-actions">
              <Link to="/estimator" className="nb__mobile-btn nb__mobile-btn--outline">
                Free Estimate
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to={dashboardLink} className="nb__mobile-btn nb__mobile-btn--gold">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="nb__mobile-btn nb__mobile-btn--danger">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="nb__mobile-btn nb__mobile-btn--gold">
                  Login
                </Link>
              )}

              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="nb__mobile-btn nb__mobile-btn--whatsapp"
              >
                📱 Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </nav>

      {location.pathname !== '/' && <div className="nb__spacer" />}
    </>
  )
}