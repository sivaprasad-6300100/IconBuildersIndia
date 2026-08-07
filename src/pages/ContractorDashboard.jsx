import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, HardHat, Wallet, User,
  LogOut, Bell, TrendingUp, Clock,
  ChevronRight, Camera, Menu, X, UploadCloud, Building2,
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const NAV = [
  { id: 'overview', label: 'Overview',     icon: LayoutDashboard },
  { id: 'projects', label: 'My Projects',  icon: HardHat },
  { id: 'payments', label: 'Payments',     icon: Wallet },
  { id: 'photos',   label: 'Site Photos',  icon: Camera },
  { id: 'profile',  label: 'Profile',      icon: User },
]

const STAGE_LABELS = {
  planning: 'Planning', in_progress: 'In Progress', on_hold: 'On Hold',
  completed: 'Completed', cancelled: 'Cancelled',
}
const STAGE_COLORS = {
  planning: '#8fa3b8', in_progress: '#c9a84c', on_hold: '#fb923c',
  completed: '#4ade80', cancelled: '#f87171',
}

function fmt(n) {
  const num = Number(n) || 0
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
  if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`
  return `₹${num.toLocaleString('en-IN')}`
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StageBadge({ status }) {
  const color = STAGE_COLORS[status] || '#8fa3b8'
  return (
    <span className="cn__badge" style={{ background: `${color}18`, borderColor: `${color}40`, color }}>
      {STAGE_LABELS[status] || status}
    </span>
  )
}

// ── Overview Tab ─────────────────────────────────────────────────────────────
function Overview({ projects, setTab }) {
  const active = projects.filter(p => p.status === 'in_progress' || p.status === 'planning')
  const totalPaid = projects.reduce((sum, p) => sum + Number(p.contractor_paid || 0), 0)
  const totalPending = projects.reduce((sum, p) => sum + (Number(p.contractor_fee || 0) - Number(p.contractor_paid || 0)), 0)
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + Number(p.progress_percent || 0), 0) / projects.length)
    : 0

  const STATS = [
    { label: 'Active Projects',      value: String(active.length),      icon: HardHat,     color: '#60a5fa' },
    { label: 'Total Received',       value: fmt(totalPaid),             icon: Wallet,      color: '#4ade80' },
    { label: 'Pending Balance',      value: fmt(totalPending),          icon: Clock,       color: '#c9a84c' },
    { label: 'Avg. Progress',        value: `${avgProgress}%`,          icon: TrendingUp,  color: '#a78bfa' },
  ]

  const recent = [...projects]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 4)

  return (
    <div className="cn__stack">
      <div className="cn__stats-grid">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} className="cn__stat-card">
            <div className="cn__stat-icon" style={{ background: `${s.color}15` }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div className="cn__stat-value">{s.value}</div>
            <div className="cn__stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="cn__card">
        <div className="cn__card-header">
          <h3 className="cn__card-title">Assigned Projects</h3>
          <button onClick={() => setTab('projects')} className="cn__card-link">
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="cn__stack cn__stack--tight">
          {recent.length === 0 && <p className="cn__empty-text">No projects assigned to you yet.</p>}
          {recent.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }} className="cn__project-row">
              <div className="cn__project-icon"><Building2 size={14} color="#c9a84c" /></div>
              <div className="cn__project-info">
                <p className="cn__project-name">{p.name}</p>
                <p className="cn__project-sub">{p.client_name || 'Client'}</p>
              </div>
              <div className="cn__project-meta">
                <div className="cn__progress-track-sm">
                  <div className="cn__progress-fill-sm" style={{ width: `${p.progress_percent || 0}%` }} />
                </div>
                <span className="cn__project-pct">{p.progress_percent || 0}%</span>
                <StageBadge status={p.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="cn__upload-card">
        <Camera size={22} color="#c9a84c" />
        <p className="cn__upload-title">Upload Site Photos</p>
        <p className="cn__upload-sub">Keep your clients updated with today's progress</p>
        <button onClick={() => setTab('photos')} className="cn__btn-gold cn__btn-gold--wide">
          <UploadCloud size={14} /> Upload Now
        </button>
      </div>
    </div>
  )
}

// ── Projects Tab ──────────────────────────────────────────────────────────────
function ProjectsTab({ projects, fetched }) {
  return (
    <div className="cn__card">
      <div className="cn__card-header">
        <h3 className="cn__card-title cn__card-title--lg">My Projects</h3>
        <span className="cn__card-count">{projects.length} total</span>
      </div>
      {fetched && projects.length === 0 && (
        <p className="cn__empty-text">No projects have been assigned to you yet. Contact your admin.</p>
      )}
      <div className="cn__stack cn__stack--tight">
        {projects.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }} className="cn__project-card">
            <div className="cn__project-card-top">
              <div>
                <p className="cn__project-name">{p.name}</p>
                <p className="cn__project-sub">{p.client_name || 'Client'} · {p.address || 'No address on file'}</p>
              </div>
              <StageBadge status={p.status} />
            </div>
            <div className="cn__progress-track">
              <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress_percent || 0}%` }}
                transition={{ duration: 0.8 }} className="cn__progress-fill" />
            </div>
            <div className="cn__project-card-footer">
              <span className="cn__project-pct">{p.progress_percent || 0}% complete</span>
              <span className="cn__project-due">Budget {fmt(p.contractor_fee)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Payments Tab (read-only for contractor) ──────────────────────────────────
function PaymentsTab({ projects, fetched }) {
  const totalBudget = projects.reduce((s, p) => s + Number(p.contractor_fee || 0), 0)
  const totalPaid   = projects.reduce((s, p) => s + Number(p.contractor_paid || 0), 0)
  const totalDue    = totalBudget - totalPaid

  return (
    <div className="cn__stack">
      <div className="cn__pay-summary-grid">
        {[
          { label: 'Total Contract Value', value: fmt(totalBudget), color: '#e8d5a3' },
          { label: 'Received',             value: fmt(totalPaid),   color: '#4ade80' },
          { label: 'Balance Due',          value: fmt(totalDue),    color: '#c9a84c' },
        ].map(s => (
          <div key={s.label} className="cn__pay-summary-card">
            <div className="cn__pay-summary-value" style={{ color: s.color }}>{s.value}</div>
            <div className="cn__pay-summary-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="cn__card">
        <h3 className="cn__card-title">Per-Project Breakdown</h3>
        {fetched && projects.length === 0 && <p className="cn__empty-text">No projects yet.</p>}
        <div className="cn__stack cn__stack--tight">
          {projects.map((p, i) => {
            const paid = Number(p.contractor_paid || 0)
            const due = Number(p.contractor_fee || 0) - paid
            return (
              <motion.div key={p.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }} className="cn__pay-row">
                <div className="cn__pay-left">
                  <div className="cn__pay-icon"><Wallet size={15} color="#c9a84c" /></div>
                  <div className="cn__pay-info">
                    <p className="cn__pay-name">{p.name}</p>
                    <p className="cn__pay-date">{fmt(paid)} received of {fmt(p.contractor_fee)}</p>
                  </div>
                </div>
                <div className="cn__pay-right">
                  <p className="cn__pay-amount">{fmt(due)}</p>
                  <span className="cn__pay-status">Balance Due</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Photos Tab (upload) ───────────────────────────────────────────────────────

function PhotosTab({ projects, fetched }) {
  const [uploadingId, setUploadingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [photosByProject, setPhotosByProject] = useState({})
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  const loadPhotos = async (projectId) => {
    setLoadingPhotos(true)
    try {
      const res = await api.get(`/api/photos/${projectId}/`)
      setPhotosByProject(prev => ({ ...prev, [projectId]: res.data }))
    } catch {
      toast.error('Could not load photos for this project')
    }
    setLoadingPhotos(false)
  }

  const toggleExpand = (projectId) => {
    if (expandedId === projectId) {
      setExpandedId(null)
      return
    }
    setExpandedId(projectId)
    if (!photosByProject[projectId]) loadPhotos(projectId)
  }

  const handleUpload = async (e, project) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingId(project.id)
    try {
      const uploads = Array.from(files).map((file) => {
        const data = new FormData()
        data.append('image', file)
        data.append('category', 'progress')
        return api.post(`/api/photos/${project.id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      })
      await Promise.all(uploads)
      toast.success(`Uploaded ${files.length} photo(s) to "${project.name}"`)
      setExpandedId(project.id)
      await loadPhotos(project.id)
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploadingId(null)
      e.target.value = ''
    }
  }

  return (
    <div className="cn__card">
      <h3 className="cn__card-title cn__card-title--lg">Upload Site Photos</h3>
      {fetched && projects.length === 0 && <p className="cn__empty-text">No projects assigned yet.</p>}
      <div className="cn__stack cn__stack--tight">
        {projects.map((p, i) => {
          const photos = photosByProject[p.id]
          const isExpanded = expandedId === p.id
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }} className="cn__list-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div className="cn__project-icon"><Building2 size={14} color="#c9a84c" /></div>
                <div className="cn__list-info">
                  <p className="cn__list-name">{p.name}</p>
                  <p className="cn__list-sub">{p.client_name || 'Client'}</p>
                </div>

                <button
                  onClick={() => toggleExpand(p.id)}
                  style={{ background: 'none', border: 'none', color: '#8fa3b8', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {isExpanded ? 'Hide photos' : `View photos${photos ? ` (${photos.length})` : ''}`}
                </button>

                <label className="cn__btn-gold" style={{ cursor: 'pointer' }}>
                  <UploadCloud size={13} />
                  {uploadingId === p.id ? 'Uploading...' : 'Upload'}
                  <input
                    type="file" accept="image/*" multiple hidden
                    disabled={uploadingId === p.id}
                    onChange={(e) => handleUpload(e, p)}
                  />
                </label>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '0.85rem', width: '100%' }}>
                  {loadingPhotos && !photos && (
                    <p className="cn__empty-text">Loading photos…</p>
                  )}
                  {photos && photos.length === 0 && (
                    <p className="cn__empty-text">No photos uploaded yet for this project.</p>
                  )}
                  {photos && photos.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                      gap: '0.5rem',
                    }}>
                      {photos.map(photo => (
                        <a key={photo.id} href={photo.image_url} target="_blank" rel="noreferrer">
                          <img
                            src={photo.image_url}
                            alt={photo.caption || 'Site photo'}
                            style={{
                              width: '100%', height: '90px', objectFit: 'cover',
                              borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
// ── Main Component ────────────────────────────────────────────────────────────
export default function ContractorDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [fetched, setFetched] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects/')
      setProjects(res.data)
    } catch {
      toast.error('Failed to load your projects')
    }
    setFetched(true)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleLogout = () => { logout?.(); navigate('/login') }

  const TABS = {
    overview: <Overview projects={projects} setTab={setActiveTab} />,
    projects: <ProjectsTab projects={projects} fetched={fetched} />,
    payments: <PaymentsTab projects={projects} fetched={fetched} />,
    photos:   <PhotosTab projects={projects} fetched={fetched} />,
    profile: (
      <div className="cn__profile-card">
        <div className="cn__profile-avatar">{(user?.name || 'C')[0]}</div>
        <p className="cn__profile-name">{user?.name || 'Contractor'}</p>
        <p className="cn__profile-phone">{user?.phone || ''}</p>
        <p className="cn__profile-role">{user?.role || 'contractor'}</p>
      </div>
    ),
  }

  return (
    <div className="cn__page">
      <style>{`
        * { box-sizing: border-box; }

        .cn__page {
          min-height: 100vh;
          background: #0a1420;
          color: #e8d5a3;
          display: flex;
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
        }

        .cn__empty-text { color: #8fa3b8; font-size: 0.85rem; padding: 0.5rem 0; }

        /* ── Sidebar ── */
        .cn__sidebar {
          position: fixed; z-index: 40; inset: 0 auto 0 0; width: 16rem;
          background: #0d1826; border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          transform: translateX(-100%); transition: transform 0.3s ease;
        }
        .cn__sidebar--open { transform: translateX(0); }
        @media (min-width: 1024px) { .cn__sidebar { position: static; transform: translateX(0); } }

        .cn__sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .cn__sidebar-logo { font-weight: 900; font-size: 1.25rem; text-decoration: none; white-space: nowrap; }
        .cn__sidebar-logo-cream { color: #e8d5a3; }
        .cn__sidebar-logo-gold { color: #c9a84c; }
        .cn__sidebar-close { background: none; border: none; color: #8fa3b8; cursor: pointer; display: flex; flex-shrink: 0; }
        @media (min-width: 1024px) { .cn__sidebar-close { display: none; } }

        .cn__sidebar-user {
          padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; gap: 0.75rem;
        }
        .cn__sidebar-avatar {
          width: 2.25rem; height: 2.25rem; border-radius: 50%;
          background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.25);
          display: flex; align-items: center; justify-content: center;
          color: #c9a84c; font-weight: 900; flex-shrink: 0;
        }
        .cn__sidebar-user-name { color: #e8d5a3; font-size: 0.875rem; font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cn__sidebar-user-role { color: #c9a84c; font-size: 0.75rem; font-weight: 500; margin: 0.1rem 0 0; text-transform: capitalize; }

        .cn__nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; overflow-y: auto; }
        .cn__nav-item {
          width: 100%; display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.875rem;
          background: none; border: 1px solid transparent; color: #8fa3b8;
          cursor: pointer; transition: all 0.2s ease; font-family: inherit;
        }
        .cn__nav-item:hover { background: rgba(255,255,255,0.05); color: #e8d5a3; }
        .cn__nav-item--active { background: rgba(201,168,76,0.12); color: #c9a84c; border-color: rgba(201,168,76,0.25); }

        .cn__sidebar-footer { padding: 1rem 0.75rem; border-top: 1px solid rgba(255,255,255,0.07); }
        .cn__logout-btn {
          width: 100%; display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.875rem;
          background: none; border: none; color: #8fa3b8; cursor: pointer;
          transition: all 0.2s ease; font-family: inherit;
        }
        .cn__logout-btn:hover { background: rgba(248,113,113,0.1); color: #f87171; }

        .cn__overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 30; }
        @media (min-width: 1024px) { .cn__overlay { display: none; } }

        /* ── Main ── */
        .cn__main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

        .cn__header {
          position: sticky; top: 0; z-index: 20;
          background: rgba(10,20,32,0.9); backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
        }
        .cn__header-left { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
        .cn__menu-btn { background: none; border: none; color: #8fa3b8; cursor: pointer; display: flex; flex-shrink: 0; }
        @media (min-width: 1024px) { .cn__menu-btn { display: none; } }
        .cn__header-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0; }
        .cn__header-title { color: #e8d5a3; font-weight: 700; font-size: 1rem; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .cn__header-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .cn__bell-btn { position: relative; background: none; border: none; color: #8fa3b8; cursor: pointer; display: flex; transition: color 0.2s ease; }
        .cn__bell-btn:hover { color: #c9a84c; }
        .cn__bell-dot { position: absolute; top: -0.2rem; right: -0.2rem; width: 0.5rem; height: 0.5rem; border-radius: 50%; background: #c9a84c; }
        .cn__avatar-sm {
          width: 2.25rem; height: 2.25rem; border-radius: 50%;
          background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.25);
          display: flex; align-items: center; justify-content: center;
          color: #c9a84c; font-weight: 900; font-size: 0.875rem; flex-shrink: 0;
        }

        .cn__content { flex: 1; padding: 1.25rem; overflow-y: auto; }
        @media (min-width: 640px) { .cn__content { padding: 1.5rem; } }
        .cn__content-inner { max-width: 60rem; margin: 0 auto; }

        /* ── Shared ── */
        .cn__stack { display: flex; flex-direction: column; gap: 1.5rem; }
        .cn__stack--tight { gap: 0.75rem; }

        .cn__badge {
          font-size: 0.68rem; padding: 0.15rem 0.65rem; border-radius: 9999px;
          border: 1px solid; font-weight: 700; white-space: nowrap; text-transform: capitalize;
        }

        .cn__card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem; padding: 1.5rem;
        }
        .cn__card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; gap: 0.75rem; flex-wrap: wrap; }
        .cn__card-title { color: #e8d5a3; font-weight: 700; font-size: 0.95rem; margin: 0; }
        .cn__card-title--lg { font-size: 1.05rem; margin-bottom: 0; }
        .cn__card-link {
          background: none; border: none; cursor: pointer; color: #c9a84c; font-size: 0.75rem;
          display: flex; align-items: center; gap: 0.25rem; flex-shrink: 0; white-space: nowrap;
        }
        .cn__card-link:hover { text-decoration: underline; }
        .cn__card-count { color: #8fa3b8; font-size: 0.75rem; flex-shrink: 0; }

        /* ── Stat cards ── */
        .cn__stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        @media (min-width: 640px) { .cn__stats-grid { grid-template-columns: repeat(4, 1fr); } }
        .cn__stat-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem; padding: 1.15rem; transition: border-color 0.2s ease;
        }
        .cn__stat-card:hover { border-color: rgba(201,168,76,0.2); }
        .cn__stat-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem; }
        .cn__stat-value { color: #e8d5a3; font-weight: 900; font-size: 1.4rem; }
        .cn__stat-label { color: #8fa3b8; font-size: 0.75rem; margin-top: 0.15rem; }

        /* ── Project rows (overview) ── */
        .cn__project-row {
          display: flex; align-items: center; gap: 1rem; padding: 0.75rem;
          border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s ease;
        }
        .cn__project-row:hover { border-color: rgba(201,168,76,0.15); background: rgba(255,255,255,0.015); }
        .cn__project-icon {
          width: 2rem; height: 2rem; border-radius: 0.5rem; background: rgba(201,168,76,0.1);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .cn__project-info { flex: 1; min-width: 0; }
        .cn__project-name { color: #e8d5a3; font-size: 0.875rem; font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cn__project-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0.15rem 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cn__project-meta { display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0; }
        .cn__project-pct { color: #8fa3b8; font-size: 0.72rem; white-space: nowrap; }
        .cn__project-due { color: #8fa3b8; font-size: 0.75rem; }

        .cn__progress-track-sm {
          width: 3.5rem; height: 0.35rem; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden; display: none;
        }
        @media (min-width: 640px) { .cn__progress-track-sm { display: block; } }
        .cn__progress-fill-sm { height: 100%; background: linear-gradient(to right, #c9a84c, #f0d080); border-radius: 9999px; }

        /* ── Project cards (Projects tab) ── */
        .cn__project-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem; padding: 1.1rem; transition: border-color 0.2s ease;
        }
        .cn__project-card:hover { border-color: rgba(201,168,76,0.2); }
        .cn__project-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.85rem; flex-wrap: wrap; }
        .cn__progress-track { height: 0.4rem; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden; margin-bottom: 0.6rem; }
        .cn__progress-fill { height: 100%; border-radius: 9999px; background: linear-gradient(to right, #c9a84c, #f0d080); }
        .cn__project-card-footer { display: flex; justify-content: space-between; font-size: 0.75rem; }

        /* ── Upload card ── */
        .cn__upload-card {
          background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.2);
          border-radius: 1rem; padding: 1.75rem; text-align: center;
        }
        .cn__upload-title { color: #e8d5a3; font-weight: 700; font-size: 0.95rem; margin: 0.75rem 0 0.25rem; }
        .cn__upload-sub { color: #8fa3b8; font-size: 0.8rem; margin: 0 0 1.1rem; }

        .cn__btn-gold {
          display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.1rem;
          border-radius: 0.75rem; background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422; font-size: 0.8rem; font-weight: 700; border: none; cursor: pointer; white-space: nowrap;
        }
        .cn__btn-gold--wide { width: 100%; justify-content: center; }

        /* ── Payments ── */
        .cn__pay-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .cn__pay-summary-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem; padding: 1rem; text-align: center;
        }
        .cn__pay-summary-value { font-weight: 900; font-size: 1.1rem; }
        .cn__pay-summary-label { color: #8fa3b8; font-size: 0.68rem; margin-top: 0.25rem; }

        .cn__pay-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.9rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.07);
          transition: border-color 0.2s ease; gap: 0.75rem; flex-wrap: wrap;
        }
        .cn__pay-row:hover { border-color: rgba(201,168,76,0.15); }
        .cn__pay-left { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
        .cn__pay-icon { width: 2rem; height: 2rem; border-radius: 50%; background: rgba(201,168,76,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cn__pay-info { min-width: 0; }
        .cn__pay-name { color: #e8d5a3; font-size: 0.875rem; font-weight: 500; margin: 0; }
        .cn__pay-date { color: #8fa3b8; font-size: 0.72rem; margin: 0.1rem 0 0; }
        .cn__pay-right { text-align: right; flex-shrink: 0; }
        .cn__pay-amount { color: #c9a84c; font-weight: 700; font-size: 0.875rem; margin: 0; }
        .cn__pay-status { color: #8fa3b8; font-size: 0.68rem; font-weight: 600; }

        /* ── List cards (Photos tab) ── */
        .cn__list-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem; padding: 1rem; display: flex; align-items: center; gap: 1rem;
          flex-wrap: wrap; transition: border-color 0.2s ease;
        }
        .cn__list-card:hover { border-color: rgba(201,168,76,0.15); }
        .cn__list-info { flex: 1; min-width: 140px; }
        .cn__list-name { color: #e8d5a3; font-weight: 600; font-size: 0.875rem; margin: 0; }
        .cn__list-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0.15rem 0 0; }

        /* ── Profile ── */
        .cn__profile-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem; padding: 2rem; text-align: center;
        }
        .cn__profile-avatar {
          width: 5rem; height: 5rem; border-radius: 50%;
          background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.25);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;
          font-size: 1.75rem; font-weight: 900; color: #c9a84c;
        }
        .cn__profile-name { color: #e8d5a3; font-weight: 700; font-size: 1.25rem; margin: 0; }
        .cn__profile-phone { color: #8fa3b8; font-size: 0.875rem; margin: 0.25rem 0 0; }
        .cn__profile-role { color: #c9a84c; font-size: 0.75rem; margin-top: 0.25rem; font-weight: 700; text-transform: capitalize; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .cn__content { padding: 1rem; }
          .cn__header { padding: 0.85rem 1rem; }
          .cn__card { padding: 1.1rem; }
          .cn__stat-card { padding: 0.9rem; }
          .cn__stat-value { font-size: 1.15rem; }
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside className={`cn__sidebar ${sidebarOpen ? 'cn__sidebar--open' : ''}`}>
        <div className="cn__sidebar-header">
          <Link to="/" className="cn__sidebar-logo">
            <span className="cn__sidebar-logo-cream">ICON</span><span className="cn__sidebar-logo-gold">BUILDERS</span>
          </Link>
          <button className="cn__sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="cn__sidebar-user">
          <div className="cn__sidebar-avatar">{(user?.name || 'C')[0]}</div>
          <div style={{ minWidth: 0 }}>
            <p className="cn__sidebar-user-name">{user?.name || 'Contractor'}</p>
            <p className="cn__sidebar-user-role">{user?.role || 'contractor'}</p>
          </div>
        </div>

        <nav className="cn__nav">
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
              className={`cn__nav-item ${activeTab === item.id ? 'cn__nav-item--active' : ''}`}>
              <item.icon size={17} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="cn__sidebar-footer">
          <button onClick={handleLogout} className="cn__logout-btn">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="cn__overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="cn__main">
        <header className="cn__header">
          <div className="cn__header-left">
            <button className="cn__menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <div style={{ minWidth: 0 }}>
              <p className="cn__header-sub">Welcome back,</p>
              <p className="cn__header-title">{user?.name || 'Contractor'}</p>
            </div>
          </div>
          <div className="cn__header-right">
            <button className="cn__bell-btn" aria-label="Notifications">
              <Bell size={19} />
              <span className="cn__bell-dot" />
            </button>
            <div className="cn__avatar-sm">{(user?.name || 'C')[0]}</div>
          </div>
        </header>

        <main className="cn__content">
          <div className="cn__content-inner">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                {TABS[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
} 