import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, Phone, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { label: 'Home',       href: '/#home' },
  { label: 'About',      href: '/#about' },
  { label: 'Services',   href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Projects',   href: '/#projects' },
  { label: 'Contact',    href: '/#contact' },
]

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const userMenuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      const sections = ['home','about','services','how-it-works','projects','contact']
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
    client:     '/client',
    contractor: '/contractor',
    admin:      '/admin',
  }[user?.role] || '/dashboard'

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500 ease-in-out
        ${scrolled
          ? 'bg-navy-mid/95 backdrop-blur-xl border-b border-gold/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'}
      `}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-18">

            {/* ── Logo — real crest mark, not a placeholder ── */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative w-10 h-11 flex-shrink-0">
                <svg viewBox="0 0 160 190" className="w-full h-full transition-transform duration-300 group-hover:-translate-y-0.5">
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
                <div className="font-black text-xl tracking-tight leading-none">
                  <span className="text-cream">ICON</span>
                  <span className="text-gold">BUILDERS</span>
                </div>
                <div className="text-[0.5rem] tracking-[0.2em] text-slate-soft uppercase leading-none mt-1">
                  AI-Powered Platform
                </div>
              </div>
            </Link>

            {/* ── Desktop Nav Links — more breathing room ── */}
            <div className="hidden lg:flex items-center gap-1.5">
              {NAV_LINKS.map((link) => {
                const id = link.href.replace('/#', '')
                const isActive = activeSection === id
                return (
                  <button
                    key={link.label}
                    onClick={() => scrollTo(link.href)}
                    className={`
                      relative px-4 py-2.5 text-sm font-medium rounded-lg
                      transition-all duration-200 group
                      ${isActive
                        ? 'text-gold'
                        : 'text-cream/70 hover:text-cream'}
                    `}
                  >
                    {link.label}
                    <span className={`
                      absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-gold
                      transition-all duration-300 rounded-full
                      ${isActive ? 'w-4' : 'w-0 group-hover:w-3'}
                    `} />
                  </button>
                )
              })}
            </div>

            {/* ── Right side actions — unified height/padding across all pills ── */}
            <div className="hidden lg:flex items-center gap-2.5">

              <Link
                to="/estimator"
                className="h-10 flex items-center px-4 text-sm font-semibold text-gold
                           border border-gold/30 rounded-lg
                           hover:bg-gold/10 hover:border-gold/60
                           transition-all duration-200"
              >
                Free Estimate
              </Link>

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="h-10 flex items-center gap-2 px-3.5 rounded-lg
                               bg-gold/10 border border-gold/20
                               hover:bg-gold/20 transition-all duration-200"
                  >
                    <div className="w-6.5 h-6.5 rounded-full bg-gold/20 border border-gold/40
                                    flex items-center justify-center
                                    text-gold text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-cream text-sm font-medium max-w-[80px] truncate">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gold transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48
                                    bg-navy-mid border border-gold/15 rounded-xl
                                    shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                                    overflow-hidden animate-scale-in">
                      <div className="px-4 py-3 border-b border-gold/10">
                        <p className="text-cream text-sm font-semibold truncate">{user?.name}</p>
                        <p className="text-slate-soft text-xs capitalize mt-0.5">{user?.role}</p>
                      </div>
                      <Link
                        to={dashboardLink}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-cream/80
                                   hover:text-gold hover:bg-gold/5 transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm
                                   text-red-400 hover:bg-red-400/5 transition-colors"
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="h-10 flex items-center px-5 rounded-lg text-sm font-bold
                             bg-gradient-to-r from-gold to-gold-light
                             text-navy shadow-gold
                             hover:shadow-gold-lg hover:-translate-y-0.5
                             transition-all duration-200"
                >
                  Login
                </Link>
              )}

              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 flex items-center gap-1.5 px-3.5 rounded-lg
                           bg-[#25D366]/10 border border-[#25D366]/20
                           text-[#25D366] text-sm font-medium
                           hover:bg-[#25D366]/20 transition-all duration-200"
              >
                <Phone size={13} />
                <span className="hidden xl:inline">WhatsApp</span>
              </a>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center
                         rounded-lg border border-gold/20 text-gold
                         hover:bg-gold/10 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div className={`
          lg:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
          bg-navy-mid/98 backdrop-blur-xl border-t border-gold/10
        `}>
          <div className="px-5 py-4 space-y-1">
            {NAV_LINKS.map((link) => {
              const id = link.href.replace('/#', '')
              const isActive = activeSection === id
              return (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-gold/10 text-gold border border-gold/20'
                      : 'text-cream/70 hover:text-cream hover:bg-white/5'}
                  `}
                >
                  {link.label}
                </button>
              )
            })}

            <div className="pt-3 border-t border-gold/10 flex flex-col gap-2">
              <Link
                to="/estimator"
                className="w-full py-3 rounded-lg text-center text-sm font-semibold
                           text-gold border border-gold/30 hover:bg-gold/10 transition-all"
              >
                Free Estimate
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={dashboardLink}
                    className="w-full py-3 rounded-lg text-center text-sm font-bold
                               bg-gradient-to-r from-gold to-gold-light text-navy"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 rounded-lg text-center text-sm text-red-400
                               border border-red-400/20 hover:bg-red-400/5 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="w-full py-3 rounded-lg text-center text-sm font-bold
                             bg-gradient-to-r from-gold to-gold-light text-navy
                             shadow-gold"
                >
                  Login
                </Link>
              )}
              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-lg text-center text-sm font-medium
                           text-[#25D366] border border-[#25D366]/20
                           hover:bg-[#25D366]/10 transition-all"
              >
                📱 Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </nav>

      {location.pathname !== '/' && <div className="h-18" />}
    </>
  )
}
