import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, HardHat, Wallet, Bell, User,
  LogOut, Menu, X, CheckCircle2, Clock, AlertCircle,
  ChevronRight, TrendingUp, Camera, MessageSquare, Download,
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const NAV = [
  { id:'overview',      label:'Overview',       icon:LayoutDashboard },
  { id:'milestones',    label:'Milestones',     icon:HardHat         },
  { id:'photos',        label:'Site Photos',    icon:Camera          },
  { id:'payments',      label:'Payments',       icon:Wallet          },
  { id:'notifications', label:'Notifications',  icon:Bell            },
  { id:'profile',       label:'Profile',        icon:User            },
]

const NOTIF_ICONS = { camera: Camera, check: CheckCircle2, wallet: Wallet, download: Download, bell: Bell }

function fmt(n) {
  const num = Number(n) || 0
  if (num>=10000000) return `₹${(num/10000000).toFixed(1)}Cr`
  if (num>=100000)   return `₹${(num/100000).toFixed(1)}L`
  return `₹${num.toLocaleString('en-IN')}`
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
}

// ── Overview Tab ─────────────────────────────────────────────────────────────
function Overview({ project, milestones, photos, setTab }) {
  const progress = project.progress_percent ?? 0

  return (
    <div className="cd__stack">

      {/* Project hero card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="cd__hero">
        <div className="cd__hero-glow" />
        <div className="cd__hero-top">
          <div className="cd__hero-top-left">
            <div className="cd__hero-label">Your Project</div>
            <h2 className="cd__hero-name">{project.name}</h2>
            <p className="cd__hero-sub">by {project.contractor_name || 'Contractor not assigned yet'}</p>
          </div>
          <div className="cd__status-badge">
            <span className="cd__status-dot" /> {project.status === 'in_progress' ? 'On Track' : project.status}
          </div>
        </div>

        <div className="cd__hero-body">
          <div className="cd__ring-wrap">
            <svg className="cd__ring-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
              <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#c9a84c" strokeWidth="10"
                strokeLinecap="round" strokeDasharray={`${2*Math.PI*40}`}
                initial={{ strokeDashoffset: 2*Math.PI*40 }}
                animate={{ strokeDashoffset: 2*Math.PI*40*(1-progress/100) }}
                transition={{ duration:1.5, ease:'easeOut' }}/>
            </svg>
            <div className="cd__ring-center">
              <span className="cd__ring-pct">{progress}%</span>
              <span className="cd__ring-label">Complete</span>
            </div>
          </div>

          <div className="cd__hero-stats">
            {[
              { label:'Start Date',   value:fmtDate(project.start_date) },
              { label:'End Date',     value:fmtDate(project.expected_end_date) },
              { label:'Total Budget', value:fmt(project.total_budget) },
              { label:'Spent So Far', value:fmt(project.amount_paid) },
            ].map(s => (
              <div key={s.label} className="cd__hero-stat">
                <div className="cd__hero-stat-label">{s.label}</div>
                <div className="cd__hero-stat-value">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="cd__quick-grid">
        {[
          { label:'Milestones Done',   value:`${milestones.filter(m=>m.status==='completed').length}/${milestones.length}`, icon:CheckCircle2, color:'#4ade80' },
          { label:'Photos Uploaded',   value:String(photos.length), icon:Camera,     color:'#c9a84c' },
          { label:'Budget Used',       value:`${project.total_budget ? Math.round((project.amount_paid/project.total_budget)*100) : 0}%`, icon:TrendingUp, color:'#60a5fa' },
          { label:'Days Remaining',    value:project.days_remaining ?? '—', icon:Clock, color:'#fb923c' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
            className="cd__quick-card">
            <s.icon size={18} color={s.color} className="cd__quick-icon" />
            <div className="cd__quick-value">{s.value}</div>
            <div className="cd__quick-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent milestones */}
      <div className="cd__card">
        <div className="cd__card-header">
          <h3 className="cd__card-title">Milestone Progress</h3>
          <button onClick={() => setTab('milestones')} className="cd__card-link">
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="cd__stack cd__stack--tight">
          {milestones.length === 0 && <p className="cd__empty-text">No milestones added yet.</p>}
          {milestones.slice(0,4).map((m,i) => {
            const done = m.status === 'completed'
            const active = m.status === 'in_progress'
            return (
              <motion.div key={m.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
                className={`cd__milestone-row ${active ? 'cd__milestone-row--active' : ''}`}>
                <div className={`cd__milestone-dot cd__milestone-dot--${done ? 'done' : active ? 'active' : 'pending'}`}>
                  {done
                    ? <CheckCircle2 size={14} color="#4ade80" />
                    : active
                      ? <div className="cd__pulse-dot" />
                      : <div className="cd__pulse-dot cd__pulse-dot--muted" />}
                </div>
                <div className="cd__milestone-info">
                  <div className={`cd__milestone-label ${done ? 'cd__milestone-label--done' : active ? 'cd__milestone-label--active' : ''}`}>
                    {m.title}
                  </div>
                </div>
                <div className={`cd__milestone-status cd__milestone-status--${done ? 'done' : active ? 'active' : 'pending'}`}>
                  {done ? 'Done' : active ? 'In Progress' : fmtDate(m.due_date)}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Recent photos */}
      <div className="cd__card">
        <div className="cd__card-header">
          <h3 className="cd__card-title">Recent Site Photos</h3>
          <button onClick={() => setTab('photos')} className="cd__card-link">
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="cd__photo-grid cd__photo-grid--3">
          {photos.length === 0 && <p className="cd__empty-text">No photos uploaded yet.</p>}
          {photos.slice(0,3).map((p,i) => (
            <motion.div key={p.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.08 }}
              className="cd__photo-card">
              <img src={p.image} alt={p.caption || 'Site photo'} className="cd__photo-img" />
              {p.caption && <div className="cd__photo-label">{p.caption}</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Milestones Tab ───────────────────────────────────────────────────────────
function Milestones({ milestones }) {
  return (
    <div className="cd__card">
      <h3 className="cd__card-title cd__card-title--lg">All Milestones</h3>
      {milestones.length === 0 && <p className="cd__empty-text">No milestones added yet.</p>}
      <div className="cd__timeline">
        <div className="cd__timeline-line" />
        <div className="cd__stack cd__stack--tight">
          {milestones.map((m,i) => {
            const done = m.status === 'completed'
            const active = m.status === 'in_progress'
            return (
              <motion.div key={m.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
                className="cd__timeline-item">
                <div className={`cd__timeline-node cd__timeline-node--${done ? 'done' : active ? 'active' : 'pending'}`}>
                  {done ? <CheckCircle2 size={14} color="#fff" /> :
                    active ? <div className="cd__pulse-dot cd__pulse-dot--navy" /> :
                    <span className="cd__timeline-num">{i+1}</span>}
                </div>
                <div className={`cd__timeline-content cd__timeline-content--${done ? 'done' : active ? 'active' : 'pending'}`}>
                  <div className="cd__timeline-row">
                    <div>
                      <p className={`cd__timeline-title ${done ? 'cd__timeline-title--done' : ''}`}>{m.title}</p>
                      <p className="cd__timeline-sub">
                        {done ? `Completed on ${fmtDate(m.completed_date)}` : active ? 'Currently in progress' : `Expected: ${fmtDate(m.due_date)}`}
                      </p>
                    </div>
                    <div className="cd__timeline-meta">
                      {m.photos_count > 0 && (
                        <span className="cd__timeline-photos">
                          <Camera size={11} /> {m.photos_count}
                        </span>
                      )}
                      <span className={`cd__timeline-badge cd__timeline-badge--${done ? 'done' : active ? 'active' : 'pending'}`}>
                        {done ? '✓ Complete' : active ? '⟳ Active' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Photos Tab ───────────────────────────────────────────────────────────────
function Photos({ photos }) {
  return (
    <div className="cd__card">
      <div className="cd__card-header">
        <h3 className="cd__card-title cd__card-title--lg">Site Photo Gallery</h3>
        <span className="cd__card-count">{photos.length} photos</span>
      </div>
      {photos.length === 0 && <p className="cd__empty-text">No photos uploaded yet. Check back after your contractor's next site visit.</p>}
      <div className="cd__photo-grid cd__photo-grid--responsive">
        {photos.map((p,i) => (
          <motion.div key={p.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.07 }}
            className="cd__photo-card cd__photo-card--lg">
            <img src={p.image} alt={p.caption || 'Site photo'} className="cd__photo-img" />
            {p.caption && <div className="cd__photo-label">{p.caption}</div>}
            <div className="cd__photo-date">{fmtDate(p.uploaded_at)}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Payments Tab ─────────────────────────────────────────────────────────────
function Payments({ project, payments }) {
  const paid    = payments.filter(p=>p.status==='Paid' || p.status==='paid').reduce((a,p)=>a+Number(p.amount),0)
  const pending = payments.filter(p=>p.status==='Pending' || p.status==='pending').reduce((a,p)=>a+Number(p.amount),0)

  return (
    <div className="cd__stack">
      <div className="cd__pay-summary-grid">
        {[
          { label:'Total Budget', value:fmt(project.total_budget), color:'#e8d5a3' },
          { label:'Paid',         value:fmt(paid),                 color:'#4ade80' },
          { label:'Pending',      value:fmt(pending),              color:'#c9a84c' },
        ].map(s => (
          <div key={s.label} className="cd__pay-summary-card">
            <div className="cd__pay-summary-value" style={{ color: s.color }}>{s.value}</div>
            <div className="cd__pay-summary-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="cd__budget-bar-wrap">
        <div className="cd__budget-bar-row">
          <span>Budget Used</span>
          <span className="cd__budget-bar-pct">{project.total_budget ? Math.round((paid/project.total_budget)*100) : 0}%</span>
        </div>
        <div className="cd__budget-track">
          <motion.div initial={{ width:0 }} animate={{ width:`${project.total_budget ? (paid/project.total_budget)*100 : 0}%` }}
            transition={{ duration:1.2 }} className="cd__budget-fill" />
        </div>
      </div>

      <div className="cd__card">
        <h3 className="cd__card-title">Payment History</h3>
        {payments.length === 0 && <p className="cd__empty-text">No payment records yet.</p>}
        <div className="cd__stack cd__stack--tight">
          {payments.map((p,i) => {
            const statusKey = (p.status || '').toLowerCase()
            return (
              <motion.div key={p.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
                className="cd__pay-row">
                <div className="cd__pay-left">
                  <div className={`cd__pay-icon cd__pay-icon--${statusKey}`}>
                    {statusKey==='paid'
                      ? <CheckCircle2 size={15} color="#4ade80" />
                      : statusKey==='pending'
                        ? <AlertCircle size={15} color="#c9a84c" />
                        : <Clock size={15} color="#8fa3b8" />}
                  </div>
                  <div className="cd__pay-info">
                    <p className="cd__pay-name">{p.label}</p>
                    <p className="cd__pay-date">{fmtDate(p.paid_date || p.due_date)}</p>
                  </div>
                </div>
                <div className="cd__pay-right">
                  <p className="cd__pay-amount">{fmt(p.amount)}</p>
                  <span className={`cd__pay-status cd__pay-status--${statusKey}`}>{p.status}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Notifications Tab ────────────────────────────────────────────────────────
function Notifications({ notifications }) {
  return (
    <div className="cd__card">
      <h3 className="cd__card-title cd__card-title--lg">Notifications</h3>
      {notifications.length === 0 && <p className="cd__empty-text">You're all caught up — no notifications yet.</p>}
      <div className="cd__stack cd__stack--tight">
        {notifications.map((n,i) => {
          const Icon = NOTIF_ICONS[n.icon] || Bell
          return (
            <motion.div key={n.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
              className={`cd__notif-row ${!n.is_read ? 'cd__notif-row--unread' : ''}`}>
              <div className={`cd__notif-icon ${!n.is_read ? 'cd__notif-icon--unread' : ''}`}>
                <Icon size={16} color={!n.is_read ? '#c9a84c' : '#8fa3b8'} />
              </div>
              <div className="cd__notif-content">
                <p className={`cd__notif-text ${!n.is_read ? 'cd__notif-text--unread' : ''}`}>{n.text}</p>
                <p className="cd__notif-time">{fmtDate(n.created_at)}</p>
              </div>
              {!n.is_read && <div className="cd__notif-dot" />}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [activeTab, setActiveTab]     = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // ── Real data state ──
  const [project, setProject]           = useState(null)
  const [milestones, setMilestones]     = useState([])
  const [photos, setPhotos]             = useState([])
  const [payments, setPayments]         = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]   = useState(0)
  const [fetched, setFetched]           = useState(false)
  const [notifFetched, setNotifFetched] = useState(false)
  const [loadError, setLoadError]       = useState(null)


  const fetchProject = async () => {
    try {
      const res = await api.get('/api/projects/mine/')
      setProject(res.data)
      setMilestones(res.data.milestones || [])
      setPhotos(res.data.site_photos || [])
      setPayments(res.data.payments || [])
    } catch (err) {
      if (err.response?.status === 404) {
        setLoadError('No project has been assigned to your account yet. Contact your admin.')
      } else {
        setLoadError('Failed to load your project. Please try again.')
        toast.error('Failed to load project data')
      }
    }
    setFetched(true)
  }

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/')
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unread_count)
    } catch {
      // fail silently — badge just won't show
    }
    setNotifFetched(true)
  }

  useEffect(() => {
    fetchProject()
    fetchNotifications()
  }, [])

  const markNotificationsRead = async () => {
    if (unreadCount === 0) return
    try {
      await api.post('/api/notifications/mark-read/', {})
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {
      // will retry next fetch
    }
  }

  const handleLogout = () => { logout?.(); navigate('/login') }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSidebarOpen(false)
    if (tabId === 'notifications') markNotificationsRead()
  }

  if (fetched && loadError) {
    return (
      <div className="cd__page cd__page--center">
        <style>{`.cd__page--center{align-items:center;justify-content:center;flex-direction:column;gap:1rem;text-align:center;padding:2rem;font-family:'Inter',system-ui,sans-serif;}`}</style>
        <p style={{ color:'#e8d5a3', fontSize:'1.1rem', fontWeight:700 }}>Unable to load your dashboard</p>
        <p style={{ color:'#8fa3b8', fontSize:'0.9rem', maxWidth:'24rem' }}>{loadError}</p>
        <button onClick={handleLogout} style={{ color:'#c9a84c', background:'none', border:'1px solid rgba(201,168,76,0.3)', padding:'0.6rem 1.2rem', borderRadius:'0.6rem', cursor:'pointer' }}>
          Logout
        </button>
      </div>
    )
  }

  if (!fetched || !project) {
    return (
      <div className="cd__page cd__page--center">
        <style>{`.cd__page--center{align-items:center;justify-content:center;font-family:'Inter',system-ui,sans-serif;color:#8fa3b8;}`}</style>
        Loading your project...
      </div>
    )
  }

  const TABS = {
    overview:      <Overview project={project} milestones={milestones} photos={photos} setTab={setActiveTab} />,
    milestones:    <Milestones milestones={milestones} />,
    photos:        <Photos photos={photos} />,
    payments:      <Payments project={project} payments={payments} />,
    notifications: <Notifications notifications={notifications} />,
    profile: (
      <div className="cd__profile-card">
        <div className="cd__profile-avatar">{(user?.name||'C')[0]}</div>
        <p className="cd__profile-name">{user?.name || 'Client User'}</p>
        <p className="cd__profile-phone">{user?.phone || ''}</p>
        <p className="cd__profile-role">{user?.role || 'client'}</p>
      </div>
    ),
  }

  return (
    <div className="cd__page">
      <style>{`
        * { box-sizing: border-box; }

        .cd__page {
          min-height: 100vh;
          background: #0a1420;
          color: #e8d5a3;
          display: flex;
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
        }

        .cd__empty-text { color: #8fa3b8; font-size: 0.85rem; padding: 0.5rem 0; }

        /* ── Sidebar ── */
        .cd__sidebar {
          position: fixed;
          z-index: 40;
          inset: 0 auto 0 0;
          width: 16rem;
          background: #0d1826;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        .cd__sidebar--open { transform: translateX(0); }
        @media (min-width: 1024px) {
          .cd__sidebar { position: static; transform: translateX(0); }
        }

        .cd__sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .cd__sidebar-logo { font-weight: 900; font-size: 1.25rem; text-decoration: none; white-space: nowrap; }
        .cd__sidebar-logo-cream { color: #e8d5a3; }
        .cd__sidebar-logo-gold { color: #c9a84c; }
        .cd__sidebar-close { background: none; border: none; color: #8fa3b8; cursor: pointer; display: flex; flex-shrink: 0; }
        @media (min-width: 1024px) { .cd__sidebar-close { display: none; } }

        .cd__sidebar-user {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; gap: 0.75rem;
        }
        .cd__sidebar-avatar {
          width: 2.25rem; height: 2.25rem;
          border-radius: 50%;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.25);
          display: flex; align-items: center; justify-content: center;
          color: #c9a84c; font-weight: 900; flex-shrink: 0;
        }
        .cd__sidebar-user-name { color: #e8d5a3; font-size: 0.875rem; font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cd__sidebar-user-role { color: #c9a84c; font-size: 0.75rem; font-weight: 500; margin: 0.1rem 0 0; text-transform: capitalize; }

        .cd__nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; overflow-y: auto; }
        .cd__nav-item {
          width: 100%;
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          background: none;
          border: 1px solid transparent;
          color: #8fa3b8;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .cd__nav-item:hover { background: rgba(255,255,255,0.05); color: #e8d5a3; }
        .cd__nav-item--active {
          background: rgba(201,168,76,0.12);
          color: #c9a84c;
          border-color: rgba(201,168,76,0.25);
        }
        .cd__nav-badge {
          margin-left: auto; flex-shrink: 0;
          width: 1.25rem; height: 1.25rem;
          border-radius: 50%;
          background: #c9a84c;
          color: #071422;
          font-size: 0.62rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        .cd__sidebar-footer { padding: 1rem 0.75rem; border-top: 1px solid rgba(255,255,255,0.07); }
        .cd__logout-btn {
          width: 100%;
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          background: none; border: none;
          color: #8fa3b8; cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .cd__logout-btn:hover { background: rgba(248,113,113,0.1); color: #f87171; }

        .cd__overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 30; }
        @media (min-width: 1024px) { .cd__overlay { display: none; } }

        /* ── Main ── */
        .cd__main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

        .cd__header {
          position: sticky; top: 0; z-index: 20;
          background: rgba(10,20,32,0.9);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 1rem 1.25rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 0.75rem;
        }
        .cd__header-left { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
        .cd__menu-btn { background: none; border: none; color: #8fa3b8; cursor: pointer; display: flex; flex-shrink: 0; }
        @media (min-width: 1024px) { .cd__menu-btn { display: none; } }
        .cd__header-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0; }
        .cd__header-title { color: #e8d5a3; font-weight: 700; font-size: 1rem; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .cd__header-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .cd__bell-btn {
          position: relative; background: none; border: none;
          color: #8fa3b8; cursor: pointer; display: flex;
          transition: color 0.2s ease;
        }
        .cd__bell-btn:hover { color: #c9a84c; }
        .cd__bell-dot {
          position: absolute; top: -0.3rem; right: -0.3rem;
          width: 1rem; height: 1rem;
          border-radius: 50%;
          background: #c9a84c; color: #071422;
          font-size: 0.55rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .cd__whatsapp-link {
          display: none;
          align-items: center; gap: 0.4rem;
          padding: 0.4rem 0.75rem;
          border-radius: 0.5rem;
          background: rgba(37,211,102,0.1);
          border: 1px solid rgba(37,211,102,0.2);
          color: #25D366;
          font-size: 0.75rem; font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.2s ease;
        }
        .cd__whatsapp-link:hover { background: rgba(37,211,102,0.2); }
        @media (min-width: 640px) { .cd__whatsapp-link { display: flex; } }

        .cd__content { flex: 1; padding: 1.25rem; overflow-y: auto; }
        @media (min-width: 640px) { .cd__content { padding: 1.5rem; } }
        .cd__content-inner { max-width: 56rem; margin: 0 auto; }

        /* ── Shared ── */
        .cd__stack { display: flex; flex-direction: column; gap: 1.5rem; }
        .cd__stack--tight { gap: 0.75rem; }

        .cd__card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          padding: 1.5rem;
        }
        .cd__card-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.25rem; gap: 0.75rem; flex-wrap: wrap;
        }
        .cd__card-title { color: #e8d5a3; font-weight: 700; font-size: 0.95rem; margin: 0 0 1rem; }
        .cd__card-title--lg { font-size: 1.05rem; }
        .cd__card-header .cd__card-title { margin: 0; }
        .cd__card-link {
          background: none; border: none; cursor: pointer;
          color: #c9a84c; font-size: 0.75rem;
          display: flex; align-items: center; gap: 0.25rem;
          flex-shrink: 0; white-space: nowrap;
        }
        .cd__card-link:hover { text-decoration: underline; }
        .cd__card-count { color: #8fa3b8; font-size: 0.75rem; flex-shrink: 0; }

        /* ── Hero ── */
        .cd__hero {
          background: linear-gradient(135deg, rgba(30,68,112,0.25), #0d1826);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 1.25rem;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .cd__hero-glow {
          position: absolute; top: -3rem; right: -3rem;
          width: 10rem; height: 10rem;
          background: rgba(201,168,76,0.06);
          border-radius: 9999px;
          filter: blur(48px);
          pointer-events: none;
        }
        .cd__hero-top {
          display: flex; flex-wrap: wrap; gap: 1rem;
          justify-content: space-between; align-items: flex-start;
          margin-bottom: 1.5rem; position: relative;
        }
        .cd__hero-top-left { min-width: 0; }
        .cd__hero-label { font-size: 0.7rem; color: #c9a84c; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.25rem; }
        .cd__hero-name { color: #e8d5a3; font-weight: 700; font-size: 1.25rem; margin: 0; }
        .cd__hero-sub { color: #8fa3b8; font-size: 0.875rem; margin: 0.25rem 0 0; }
        .cd__status-badge {
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.25);
          color: #4ade80;
          font-size: 0.72rem; font-weight: 700;
          display: flex; align-items: center; gap: 0.4rem;
          flex-shrink: 0; white-space: nowrap; text-transform: capitalize;
        }
        .cd__status-dot { width: 0.4rem; height: 0.4rem; border-radius: 50%; background: #4ade80; }

        .cd__hero-body { display: flex; flex-wrap: wrap; gap: 2rem; align-items: center; position: relative; }
        .cd__ring-wrap { position: relative; width: 7rem; height: 7rem; flex-shrink: 0; }
        .cd__ring-svg { width: 7rem; height: 7rem; transform: rotate(-90deg); }
        .cd__ring-center {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem;
        }
        .cd__ring-pct { color: #c9a84c; font-weight: 900; font-size: 1.5rem; line-height: 1; }
        .cd__ring-label { color: #8fa3b8; font-size: 0.65rem; line-height: 1; }

        .cd__hero-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; flex: 1; min-width: 200px; }
        .cd__hero-stat-label { color: #8fa3b8; font-size: 0.72rem; margin-bottom: 0.15rem; }
        .cd__hero-stat-value { color: #e8d5a3; font-weight: 700; font-size: 0.875rem; }

        /* ── Quick stats ── */
        .cd__quick-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        @media (min-width: 640px) { .cd__quick-grid { grid-template-columns: repeat(4, 1fr); } }
        .cd__quick-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem;
          padding: 1rem;
          transition: border-color 0.2s ease;
        }
        .cd__quick-card:hover { border-color: rgba(201,168,76,0.2); }
        .cd__quick-icon { margin-bottom: 0.5rem; }
        .cd__quick-value { color: #e8d5a3; font-weight: 900; font-size: 1.25rem; }
        .cd__quick-label { color: #8fa3b8; font-size: 0.72rem; margin-top: 0.15rem; }

        /* ── Milestone rows (overview) ── */
        .cd__milestone-row {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem; border-radius: 0.75rem;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .cd__milestone-row:hover { background: rgba(255,255,255,0.02); }
        .cd__milestone-row--active { background: rgba(201,168,76,0.06); border-color: rgba(201,168,76,0.2); }
        .cd__milestone-dot {
          width: 1.75rem; height: 1.75rem; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; border: 1px solid;
        }
        .cd__milestone-dot--done { background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.3); }
        .cd__milestone-dot--active { background: rgba(201,168,76,0.15); border-color: rgba(201,168,76,0.3); }
        .cd__milestone-dot--pending { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
        .cd__pulse-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: #c9a84c; animation: cd-pulse 1.6s ease-in-out infinite; }
        .cd__pulse-dot--muted { background: rgba(255,255,255,0.25); animation: none; }
        .cd__pulse-dot--navy { background: #0a1420; animation: cd-pulse 1.6s ease-in-out infinite; }
        @keyframes cd-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        .cd__milestone-info { flex: 1; min-width: 0; }
        .cd__milestone-label { color: #8fa3b8; font-size: 0.85rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cd__milestone-label--done { text-decoration: line-through; }
        .cd__milestone-label--active { color: #e8d5a3; }
        .cd__milestone-status { font-size: 0.75rem; font-weight: 700; flex-shrink: 0; white-space: nowrap; }
        .cd__milestone-status--done { color: #4ade80; }
        .cd__milestone-status--active { color: #c9a84c; }
        .cd__milestone-status--pending { color: #8fa3b8; }

        /* ── Photo grid ── */
        .cd__photo-grid { display: grid; gap: 0.75rem; }
        .cd__photo-grid--3 { grid-template-columns: repeat(3, 1fr); }
        .cd__photo-grid--responsive { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @media (min-width: 640px) { .cd__photo-grid--responsive { grid-template-columns: repeat(3, 1fr); } }

        .cd__photo-card {
          aspect-ratio: 1 / 1;
          border-radius: 0.85rem;
          background: #0d1826;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
          cursor: pointer;
          transition: all 0.2s ease;
          overflow: hidden;
          position: relative;
        }
        .cd__photo-card:hover { border-color: rgba(201,168,76,0.3); transform: translateY(-2px); }
        .cd__photo-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .cd__photo-label {
          position: relative; z-index: 1; width: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.75), transparent);
          color: #e8d5a3; font-size: 0.68rem; line-height: 1.25; padding: 0.6rem 0.5rem 0.35rem;
        }
        .cd__photo-date { position: relative; z-index: 1; color: #cbd5e1; font-size: 0.62rem; padding: 0 0.5rem 0.5rem; background: rgba(0,0,0,0.5); width: 100%; }

        /* ── Timeline (Milestones tab) ── */
        .cd__timeline { position: relative; }
        .cd__timeline-line { position: absolute; left: 0.85rem; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.1); }
        .cd__timeline-item { display: flex; gap: 1rem; align-items: flex-start; padding-left: 0.25rem; }
        .cd__timeline-node {
          width: 1.75rem; height: 1.75rem; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; position: relative; z-index: 1; margin-top: 0.1rem;
        }
        .cd__timeline-node--done { background: #4ade80; box-shadow: 0 0 12px rgba(74,222,128,0.4); }
        .cd__timeline-node--active { background: #c9a84c; box-shadow: 0 0 12px rgba(201,168,76,0.4); }
        .cd__timeline-node--pending { background: #0d1826; border: 1px solid rgba(255,255,255,0.15); }
        .cd__timeline-num { color: #8fa3b8; font-size: 0.72rem; font-weight: 700; }

        .cd__timeline-content { flex: 1; padding: 0.9rem; border-radius: 0.75rem; border: 1px solid; min-width: 0; }
        .cd__timeline-content--done { background: rgba(74,222,128,0.03); border-color: rgba(74,222,128,0.15); }
        .cd__timeline-content--active { background: rgba(201,168,76,0.06); border-color: rgba(201,168,76,0.2); }
        .cd__timeline-content--pending { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.07); }

        .cd__timeline-row { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: space-between; align-items: flex-start; }
        .cd__timeline-title { color: #e8d5a3; font-weight: 600; font-size: 0.875rem; margin: 0; }
        .cd__timeline-title--done { color: #8fa3b8; }
        .cd__timeline-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0.2rem 0 0; }
        .cd__timeline-meta { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .cd__timeline-photos { display: flex; align-items: center; gap: 0.25rem; color: #8fa3b8; font-size: 0.72rem; }
        .cd__timeline-badge {
          font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.65rem; border-radius: 9999px; white-space: nowrap;
        }
        .cd__timeline-badge--done { background: rgba(74,222,128,0.1); color: #4ade80; }
        .cd__timeline-badge--active { background: rgba(201,168,76,0.1); color: #c9a84c; }
        .cd__timeline-badge--pending { background: rgba(255,255,255,0.05); color: #8fa3b8; }

        /* ── Payments ── */
        .cd__pay-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .cd__pay-summary-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem;
          padding: 1rem;
          text-align: center;
        }
        .cd__pay-summary-value { font-weight: 900; font-size: 1.15rem; }
        .cd__pay-summary-label { color: #8fa3b8; font-size: 0.7rem; margin-top: 0.25rem; }

        .cd__budget-bar-wrap {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem;
          padding: 1.1rem;
        }
        .cd__budget-bar-row { display: flex; justify-content: space-between; color: #8fa3b8; font-size: 0.75rem; margin-bottom: 0.5rem; }
        .cd__budget-bar-pct { color: #c9a84c; font-weight: 700; }
        .cd__budget-track { height: 0.5rem; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden; }
        .cd__budget-fill { height: 100%; border-radius: 9999px; background: linear-gradient(to right, #c9a84c, #f0d080); }

        .cd__pay-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.9rem; border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.07);
          transition: border-color 0.2s ease;
          gap: 0.75rem; flex-wrap: wrap;
        }
        .cd__pay-row:hover { border-color: rgba(201,168,76,0.15); }
        .cd__pay-left { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
        .cd__pay-icon { width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cd__pay-icon--paid { background: rgba(74,222,128,0.1); }
        .cd__pay-icon--pending { background: rgba(201,168,76,0.1); }
        .cd__pay-icon--upcoming { background: rgba(255,255,255,0.05); }
        .cd__pay-info { min-width: 0; }
        .cd__pay-name { color: #e8d5a3; font-size: 0.875rem; font-weight: 500; margin: 0; }
        .cd__pay-date { color: #8fa3b8; font-size: 0.75rem; margin: 0.1rem 0 0; }
        .cd__pay-right { text-align: right; flex-shrink: 0; }
        .cd__pay-amount { color: #e8d5a3; font-weight: 700; font-size: 0.875rem; margin: 0; }
        .cd__pay-status { font-size: 0.7rem; font-weight: 700; text-transform: capitalize; }
        .cd__pay-status--paid { color: #4ade80; }
        .cd__pay-status--pending { color: #c9a84c; }
        .cd__pay-status--upcoming { color: #8fa3b8; }

        /* ── Notifications ── */
        .cd__notif-row {
          display: flex; align-items: flex-start; gap: 1rem;
          padding: 0.9rem; border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.2s ease;
        }
        .cd__notif-row--unread { background: rgba(201,168,76,0.04); border-color: rgba(201,168,76,0.15); }
        .cd__notif-row:hover { border-color: rgba(201,168,76,0.15); }
        .cd__notif-icon {
          width: 2.25rem; height: 2.25rem; border-radius: 0.65rem;
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cd__notif-icon--unread { background: rgba(201,168,76,0.15); }
        .cd__notif-content { flex: 1; min-width: 0; }
        .cd__notif-text { color: #8fa3b8; font-size: 0.85rem; line-height: 1.5; margin: 0; }
        .cd__notif-text--unread { color: #e8d5a3; }
        .cd__notif-time { color: #55708a; font-size: 0.72rem; margin: 0.25rem 0 0; }
        .cd__notif-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: #c9a84c; flex-shrink: 0; margin-top: 0.25rem; }

        /* ── Profile ── */
        .cd__profile-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
        }
        .cd__profile-avatar {
          width: 5rem; height: 5rem; border-radius: 50%;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.25);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.75rem; font-weight: 900; color: #c9a84c;
        }
        .cd__profile-name { color: #e8d5a3; font-weight: 700; font-size: 1.25rem; margin: 0; }
        .cd__profile-phone { color: #8fa3b8; font-size: 0.875rem; margin: 0.25rem 0 0; }
        .cd__profile-role { color: #c9a84c; font-size: 0.75rem; margin-top: 0.25rem; font-weight: 700; text-transform: capitalize; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .cd__content { padding: 1rem; }
          .cd__header { padding: 0.85rem 1rem; }
          .cd__card { padding: 1.1rem; }
          .cd__hero { padding: 1.1rem; }
          .cd__quick-card { padding: 0.8rem; }
          .cd__quick-value { font-size: 1.1rem; }
          .cd__photo-grid--3 { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside className={`cd__sidebar ${sidebarOpen ? 'cd__sidebar--open' : ''}`}>
        <div className="cd__sidebar-header">
          <Link to="/" className="cd__sidebar-logo">
            <span className="cd__sidebar-logo-cream">ICON</span><span className="cd__sidebar-logo-gold">BUILDERS</span>
          </Link>
          <button className="cd__sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="cd__sidebar-user">
          <div className="cd__sidebar-avatar">{(user?.name||'C')[0]}</div>
          <div style={{ minWidth: 0 }}>
            <p className="cd__sidebar-user-name">{user?.name||'Client User'}</p>
            <p className="cd__sidebar-user-role">{user?.role||'client'}</p>
          </div>
        </div>

        <nav className="cd__nav">
          {NAV.map(item => (
            <button key={item.id} onClick={() => handleTabChange(item.id)}
              className={`cd__nav-item ${activeTab===item.id ? 'cd__nav-item--active' : ''}`}>
              <item.icon size={17} /> {item.label}
              {item.id==='notifications' && unreadCount > 0 && (
                <span className="cd__nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="cd__sidebar-footer">
          <button onClick={handleLogout} className="cd__logout-btn">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="cd__overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="cd__main">
        <header className="cd__header">
          <div className="cd__header-left">
            <button className="cd__menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <div style={{ minWidth: 0 }}>
              <p className="cd__header-sub">Welcome back,</p>
              <p className="cd__header-title">{user?.name || 'Client'}</p>
            </div>
          </div>
          <div className="cd__header-right">
            <button onClick={() => handleTabChange('notifications')} className="cd__bell-btn" aria-label="Notifications">
              <Bell size={19} />
              {unreadCount > 0 && <span className="cd__bell-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}`} target="_blank" rel="noopener noreferrer"
              className="cd__whatsapp-link">
              <MessageSquare size={13} /> WhatsApp
            </a>
          </div>
        </header>

        <main className="cd__content">
          <div className="cd__content-inner">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration:0.25 }}>
                {TABS[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}