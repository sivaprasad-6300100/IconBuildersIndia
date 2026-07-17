import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, HardHat, FolderOpen, Bell,
  Settings, LogOut, Menu, X, TrendingUp, Wallet,
  CheckCircle2, ChevronRight,
  UserPlus, Eye, Trash2, Search, Filter, BarChart3,
  Building2, MessageSquare, ShieldCheck,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../services/api'
import toast from 'react-hot-toast'

// ── Mock data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Total Projects',  value: '24',   change: '+3 this month', icon: FolderOpen, color: '#60a5fa' },
  { label: 'Active Clients',  value: '18',   change: '+5 this month', icon: Users,      color: '#4ade80' },
  { label: 'Contractors',     value: '9',    change: '2 pending',     icon: HardHat,    color: '#c9a84c' },
  { label: 'Revenue (Month)', value: '₹42L', change: '+18% growth',   icon: Wallet,     color: '#a78bfa' },
]

const PROJECTS = [
  { id: 1, name: 'Kondapur Villa',         client: 'R. Mehta',       contractor: 'Sri Sai Const.', progress: 68,  status: 'Active',    budget: '₹28L'   },
  { id: 2, name: 'Gachibowli Apartments',  client: 'Skyline Realty', contractor: 'Build Pro',      progress: 42,  status: 'Active',    budget: '₹95L'   },
  { id: 3, name: 'Jubilee Hills Bungalow', client: 'A. Rao',         contractor: 'Sri Sai Const.', progress: 91,  status: 'Finishing', budget: '₹52L'   },
  { id: 4, name: 'Manikonda Plaza',        client: 'Vertex Corp',    contractor: 'Apex Builders',  progress: 15,  status: 'Planning',  budget: '₹1.8Cr' },
  { id: 5, name: 'Miyapur 2BHK',           client: 'S. Sharma',      contractor: 'HomeCraft',      progress: 100, status: 'Complete',  budget: '₹38L'   },
  { id: 6, name: 'HITEC City Office',      client: 'TechSpace Ltd',  contractor: 'Build Pro',      progress: 28,  status: 'Active',    budget: '₹3.1Cr' },
]

const INQUIRIES = [
  { id: 1, name: 'Priya Kapoor', phone: '99887 76655', type: 'New Construction', city: 'Hyderabad', plot: '1200 sqft', date: 'Jul 14', status: 'New' },
  { id: 2, name: 'Mohan Reddy',  phone: '88776 65544', type: 'Villa',            city: 'Bangalore',  plot: '2400 sqft', date: 'Jul 13', status: 'Called' },
  { id: 3, name: 'Lakshmi Devi', phone: '77665 54433', type: 'Renovation',       city: 'Hyderabad', plot: '800 sqft',  date: 'Jul 12', status: 'New' },
  { id: 4, name: 'Ravi Kumar',   phone: '66554 43322', type: 'Commercial',       city: 'Pune',      plot: '5000 sqft', date: 'Jul 11', status: 'Converted' },
  { id: 5, name: 'Sneha Patel',  phone: '55443 32211', type: 'Apartment',        city: 'Mumbai',    plot: '950 sqft',  date: 'Jul 10', status: 'Called' },
]

const REVENUE_DATA = [
  { month: 'Feb', revenue: 28 }, { month: 'Mar', revenue: 35 }, { month: 'Apr', revenue: 31 },
  { month: 'May', revenue: 42 }, { month: 'Jun', revenue: 38 }, { month: 'Jul', revenue: 42 },
]

const PROJECT_DATA = [
  { month: 'Feb', active: 14 }, { month: 'Mar', active: 16 }, { month: 'Apr', active: 19 },
  { month: 'May', active: 21 }, { month: 'Jun', active: 22 }, { month: 'Jul', active: 24 },
]

const NAV = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'projects',    label: 'Projects',    icon: FolderOpen },
  { id: 'clients',     label: 'Clients',     icon: Users },
  { id: 'contractors', label: 'Contractors', icon: HardHat },
  { id: 'inquiries',   label: 'Inquiries',   icon: MessageSquare },
  { id: 'analytics',   label: 'Analytics',   icon: BarChart3 },
  { id: 'settings',    label: 'Settings',    icon: Settings },
]

const STATUS_COLORS = {
  Active:    '#4ade80',
  Complete:  '#60a5fa',
  Planning:  '#94a3b8',
  Finishing: '#a78bfa',
  Pending:   '#fb923c',
  Inactive:  '#94a3b8',
  New:       '#c9a84c',
  Called:    '#60a5fa',
  Converted: '#4ade80',
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#8fa3b8'
  return (
    <span
      className="ap__badge"
      style={{ background: `${color}18`, borderColor: `${color}40`, color }}
    >
      {status}
    </span>
  )
}

// ── Overview ─────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <div className="ap__stack">
      <div className="ap__stats-grid">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="ap__stat-card"
          >
            <div className="ap__stat-top">
              <div className="ap__stat-icon" style={{ background: `${s.color}15` }}>
                <s.icon size={18} color={s.color} />
              </div>
              <TrendingUp size={13} color="#4ade8099" />
            </div>
            <div className="ap__stat-value">{s.value}</div>
            <div className="ap__stat-label">{s.label}</div>
            <div className="ap__stat-change">{s.change}</div>
          </motion.div>
        ))}
      </div>

      <div className="ap__charts-grid">
        <div className="ap__chart-card">
          <h3 className="ap__chart-title">Monthly Revenue (₹L)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={REVENUE_DATA} barSize={28}>
              <XAxis dataKey="month" tick={{ fill: '#5a7a9a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#0d2035', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#e8d5a3', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#c9a84c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="ap__chart-card">
          <h3 className="ap__chart-title">Active Projects Growth</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={PROJECT_DATA}>
              <XAxis dataKey="month" tick={{ fill: '#5a7a9a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#0d2035', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#e8d5a3', fontSize: 12 }} />
              <Line type="monotone" dataKey="active" stroke="#c9a84c" strokeWidth={2.5} dot={{ fill: '#c9a84c', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ap__card">
        <div className="ap__card-header">
          <h3 className="ap__card-title">Recent Projects</h3>
          <span className="ap__card-count">{PROJECTS.length} total</span>
        </div>
        <div className="ap__project-list">
          {PROJECTS.slice(0, 4).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="ap__project-row"
            >
              <div className="ap__project-icon">
                <Building2 size={14} color="#c9a84c" />
              </div>
              <div className="ap__project-info">
                <p className="ap__project-name">{p.name}</p>
                <p className="ap__project-sub">{p.client} · {p.contractor}</p>
              </div>
              <div className="ap__project-meta">
                <div className="ap__project-budget-wrap">
                  <div className="ap__project-budget">{p.budget}</div>
                  <div className="ap__project-pct">{p.progress}%</div>
                </div>
                <div className="ap__progress-track-sm">
                  <div className="ap__progress-fill-sm" style={{ width: `${p.progress}%` }} />
                </div>
                <StatusBadge status={p.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="ap__alert">
        <div className="ap__alert-left">
          <div className="ap__alert-icon">
            <Bell size={18} color="#c9a84c" />
          </div>
          <div>
            <p className="ap__alert-title">2 New Inquiries Today</p>
            <p className="ap__alert-sub">Priya Kapoor &amp; Lakshmi Devi are waiting</p>
          </div>
        </div>
        <button className="ap__alert-btn">
          View <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Projects Tab ──────────────────────────────────────────────────────────────
function ProjectsTab() {
  const [search, setSearch] = useState('')
  const filtered = PROJECTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="ap__stack">
      <div className="ap__toolbar">
        <div className="ap__search-wrap">
          <Search size={14} className="ap__search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="ap__search-input"
          />
        </div>
        <button className="ap__filter-btn">
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="ap__table-card">
        <div className="ap__table-scroll">
          <table className="ap__table">
            <thead>
              <tr>
                {['Project', 'Client', 'Contractor', 'Budget', 'Progress', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="ap__th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="ap__tr">
                  <td className="ap__td ap__td-name">{p.name}</td>
                  <td className="ap__td">{p.client}</td>
                  <td className="ap__td">{p.contractor}</td>
                  <td className="ap__td ap__td-gold">{p.budget}</td>
                  <td className="ap__td">
                    <div className="ap__progress-cell">
                      <div className="ap__progress-track-sm">
                        <div className="ap__progress-fill-sm" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="ap__progress-cell-text">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="ap__td"><StatusBadge status={p.status} /></td>
                  <td className="ap__td">
                    <div className="ap__row-actions">
                      <button className="ap__action-btn"><Eye size={13} /></button>
                      <button className="ap__action-btn ap__action-btn--danger"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Clients Tab ───────────────────────────────────────────────────────────────
function ClientsTab() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [clients, setClients] = useState([])
  const [fetched, setFetched] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  const fetchClients = async () => {
    try {
      const res = await api.get('/api/users/?role=client')
      setClients(res.data)
    } catch {}
    setFetched(true)
  }
  if (!fetched) fetchClients()

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Enter client name'); return }
    if (form.phone.length < 10) { toast.error('Enter valid 10-digit phone'); return }
    setLoading(true)
    try {
      const res = await api.post('/api/users/create-client/', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
      })
      setClients((prev) => [res.data.user, ...prev])
      setSuccess(true)
      toast.success(`Client ${form.name} created!`)
      setTimeout(() => {
        setSuccess(false)
        setShowModal(false)
        setForm({ name: '', phone: '', email: '' })
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.phone?.[0] || err.response?.data?.error || 'Failed to create client')
    } finally { setLoading(false) }
  }

  return (
    <div className="ap__stack">
      <div className="ap__toolbar">
        <div className="ap__search-wrap">
          <Search size={14} className="ap__search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="ap__search-input"
          />
        </div>
        <button onClick={() => setShowModal(true)} className="ap__btn-gold">
          <UserPlus size={14} /> Add Client
        </button>
      </div>

      <div className="ap__list-grid">
        {filtered.length === 0 && (
          <div className="ap__empty-card">
            <p>No clients yet. Click "Add Client" to create one.</p>
          </div>
        )}
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="ap__list-card">
            <div className="ap__list-avatar">{c.name[0].toUpperCase()}</div>
            <div className="ap__list-info">
              <p className="ap__list-name">{c.name}</p>
              <p className="ap__list-sub">{c.phone}</p>
            </div>
            <div className="ap__list-detail ap__list-detail--sm">
              <p className="ap__list-detail-label">Role</p>
              <p className="ap__list-detail-value">{c.role}</p>
            </div>
            <div className="ap__list-detail ap__list-detail--md">
              <p className="ap__list-detail-label">Joined</p>
              <p className="ap__list-detail-value">
                {new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="ap__row-actions">
              <StatusBadge status={c.is_active ? 'Active' : 'Inactive'} />
              <button className="ap__action-btn"><Eye size={13} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !loading && setShowModal(false)}
              className="ap__modal-overlay"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="ap__modal-wrap"
            >
              <div className="ap__modal">
                <button onClick={() => !loading && setShowModal(false)} className="ap__modal-close">
                  <X size={16} />
                </button>

                {success ? (
                  <div className="ap__modal-success">
                    <div className="ap__modal-success-icon"><CheckCircle2 size={30} color="#4ade80" /></div>
                    <h3 className="ap__modal-success-title">Client Created!</h3>
                    <p className="ap__modal-success-text">{form.name} can now login with OTP</p>
                  </div>
                ) : (
                  <>
                    <h2 className="ap__modal-title">Add New Client</h2>
                    <p className="ap__modal-sub">Client will login using phone + OTP</p>
                    <div className="ap__form-stack">
                      <div className="ap__form-group">
                        <label className="ap__form-label">Full Name *</label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Rajesh Mehta"
                          className="ap__form-input"
                        />
                      </div>
                      <div className="ap__form-group">
                        <label className="ap__form-label">Phone Number *</label>
                        <div className="ap__phone-row">
                          <div className="ap__phone-prefix">🇮🇳 +91</div>
                          <input
                            value={form.phone}
                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                            placeholder="10-digit mobile"
                            className="ap__form-input ap__form-input--flex"
                          />
                        </div>
                      </div>
                      <div className="ap__form-group">
                        <label className="ap__form-label">Email (optional)</label>
                        <input
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="client@email.com"
                          type="email"
                          className="ap__form-input"
                        />
                      </div>
                      <div className="ap__info-box">
                        <p>💡 Client can login at <span className="ap__info-highlight">iconbuilderindia.com/login</span> using phone + OTP</p>
                      </div>
                      <div className="ap__modal-actions">
                        <button onClick={() => setShowModal(false)} disabled={loading} className="ap__btn-cancel">Cancel</button>
                        <button
                          onClick={handleSubmit}
                          disabled={loading || !form.name || form.phone.length < 10}
                          className="ap__btn-submit"
                        >
                          {loading ? <><div className="ap__spinner" />Creating...</> : <><UserPlus size={14} />Create Client</>}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Contractors Tab ───────────────────────────────────────────────────────────
function ContractorsTab() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [contractors, setContractors] = useState([])
  const [fetched, setFetched] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  const fetchContractors = async () => {
    try {
      const res = await api.get('/api/users/?role=contractor')
      setContractors(res.data)
    } catch {}
    setFetched(true)
  }
  if (!fetched) fetchContractors()

  const filtered = contractors.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Enter contractor name'); return }
    if (form.phone.length < 10) { toast.error('Enter valid 10-digit phone'); return }
    setLoading(true)
    try {
      const res = await api.post('/api/users/create-contractor/', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
      })
      setContractors((prev) => [res.data.user, ...prev])
      setSuccess(true)
      toast.success(`Contractor ${form.name} created!`)
      setTimeout(() => {
        setSuccess(false)
        setShowModal(false)
        setForm({ name: '', phone: '', email: '' })
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.phone?.[0] || err.response?.data?.error || 'Failed to create contractor')
    } finally { setLoading(false) }
  }

  const toggleActive = async (contractor) => {
    try {
      if (contractor.is_active) {
        await api.delete(`/api/users/${contractor.id}/`)
        setContractors((prev) => prev.map((c) => (c.id === contractor.id ? { ...c, is_active: false } : c)))
        toast.success(`${contractor.name} deactivated`)
      } else {
        await api.put(`/api/users/${contractor.id}/`, { is_active: true })
        setContractors((prev) => prev.map((c) => (c.id === contractor.id ? { ...c, is_active: true } : c)))
        toast.success(`${contractor.name} approved`)
      }
    } catch {
      toast.error('Failed to update contractor')
    }
  }

  return (
    <div className="ap__stack">
      <div className="ap__toolbar">
        <div className="ap__search-wrap">
          <Search size={14} className="ap__search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contractors..."
            className="ap__search-input"
          />
        </div>
        <button onClick={() => setShowModal(true)} className="ap__btn-gold">
          <UserPlus size={14} /> Add Contractor
        </button>
      </div>

      <div className="ap__list-grid">
        {filtered.length === 0 && (
          <div className="ap__empty-card">
            <p>No contractors yet. Click "Add Contractor" to create one.</p>
          </div>
        )}
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="ap__list-card">
            <div className="ap__list-icon-box"><HardHat size={18} color="#c9a84c" /></div>
            <div className="ap__list-info">
              <p className="ap__list-name">{c.name}</p>
              <p className="ap__list-sub">{c.phone}</p>
            </div>
            <div className="ap__list-detail ap__list-detail--md">
              <p className="ap__list-detail-label">Joined</p>
              <p className="ap__list-detail-value">
                {new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="ap__row-actions">
              <StatusBadge status={c.is_active ? 'Active' : 'Pending'} />
              <button className="ap__action-btn"><Eye size={13} /></button>
              {!c.is_active && (
                <button onClick={() => toggleActive(c)} className="ap__approve-btn">
                  <ShieldCheck size={12} /> Approve
                </button>
              )}
              {c.is_active && (
                <button onClick={() => toggleActive(c)} className="ap__deactivate-btn">
                  Deactivate
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !loading && setShowModal(false)}
              className="ap__modal-overlay"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="ap__modal-wrap"
            >
              <div className="ap__modal">
                <button onClick={() => !loading && setShowModal(false)} className="ap__modal-close">
                  <X size={16} />
                </button>

                {success ? (
                  <div className="ap__modal-success">
                    <div className="ap__modal-success-icon"><CheckCircle2 size={30} color="#4ade80" /></div>
                    <h3 className="ap__modal-success-title">Contractor Created!</h3>
                    <p className="ap__modal-success-text">{form.name} can now login with OTP</p>
                  </div>
                ) : (
                  <>
                    <h2 className="ap__modal-title">Add New Contractor</h2>
                    <p className="ap__modal-sub">Contractor will login using phone + OTP</p>
                    <div className="ap__form-stack">
                      <div className="ap__form-group">
                        <label className="ap__form-label">Full Name / Company *</label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Sri Sai Constructions"
                          className="ap__form-input"
                        />
                      </div>
                      <div className="ap__form-group">
                        <label className="ap__form-label">Phone Number *</label>
                        <div className="ap__phone-row">
                          <div className="ap__phone-prefix">🇮🇳 +91</div>
                          <input
                            value={form.phone}
                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                            placeholder="10-digit mobile"
                            className="ap__form-input ap__form-input--flex"
                          />
                        </div>
                      </div>
                      <div className="ap__form-group">
                        <label className="ap__form-label">Email (optional)</label>
                        <input
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="contractor@email.com"
                          type="email"
                          className="ap__form-input"
                        />
                      </div>
                      <div className="ap__info-box">
                        <p>💡 Contractor can login at <span className="ap__info-highlight">iconbuilderindia.com/login</span> using phone + OTP</p>
                      </div>
                      <div className="ap__modal-actions">
                        <button onClick={() => setShowModal(false)} disabled={loading} className="ap__btn-cancel">Cancel</button>
                        <button
                          onClick={handleSubmit}
                          disabled={loading || !form.name || form.phone.length < 10}
                          className="ap__btn-submit"
                        >
                          {loading ? <><div className="ap__spinner" />Creating...</> : <><UserPlus size={14} />Create Contractor</>}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Inquiries Tab ─────────────────────────────────────────────────────────────
function InquiriesTab() {
  return (
    <div className="ap__stack">
      <div className="ap__inquiry-header">
        <h3 className="ap__section-title">Lead Inquiries</h3>
        <div className="ap__filter-pills">
          {['All', 'New', 'Called', 'Converted'].map((f) => (
            <button key={f} className="ap__filter-pill">{f}</button>
          ))}
        </div>
      </div>
      <div className="ap__stack ap__stack--tight">
        {INQUIRIES.map((inq, i) => (
          <motion.div key={inq.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="ap__inquiry-card">
            <div className="ap__inquiry-left">
              <div className="ap__inquiry-avatar">{inq.name[0]}</div>
              <div>
                <p className="ap__list-name">{inq.name}</p>
                <p className="ap__list-sub">{inq.phone} · {inq.city}</p>
                <div className="ap__inquiry-tags">
                  <span className="ap__tag">{inq.type}</span>
                  <span className="ap__tag">{inq.plot}</span>
                  <span className="ap__tag-muted">{inq.date}</span>
                </div>
              </div>
            </div>
            <div className="ap__row-actions">
              <StatusBadge status={inq.status} />
              <a href={`tel:${inq.phone}`} className="ap__call-btn">📞 Call</a>
              <a href={`https://wa.me/91${inq.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="ap__whatsapp-btn">
                WhatsApp
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const SUMMARY = [
    { label: 'Total Revenue',     value: '₹2.4Cr', sub: 'All time',         color: '#c9a84c' },
    { label: 'Avg Project Value', value: '₹48L',   sub: 'Per project',      color: '#60a5fa' },
    { label: 'Conversion Rate',   value: '34%',    sub: 'Inquiries→Client', color: '#4ade80' },
  ]

  const CATEGORY_SPLIT = [
    { label: 'Villas',     pct: 35, color: '#c9a84c' },
    { label: 'Apartments', pct: 28, color: '#60a5fa' },
    { label: 'Commercial', pct: 22, color: '#a78bfa' },
    { label: 'Renovation', pct: 15, color: '#4ade80' },
  ]

  return (
    <div className="ap__stack">
      <div className="ap__analytics-grid">
        {SUMMARY.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="ap__analytics-card">
            <div className="ap__analytics-value" style={{ color: s.color }}>{s.value}</div>
            <div className="ap__analytics-label">{s.label}</div>
            <div className="ap__analytics-sub">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="ap__card">
        <h3 className="ap__card-title ap__card-title--pad">Revenue Trend (₹ Lakhs)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={REVENUE_DATA} barSize={32}>
            <XAxis dataKey="month" tick={{ fill: '#5a7a9a', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5a7a9a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0d2035', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#e8d5a3', fontSize: 12 }} />
            <Bar dataKey="revenue" fill="#c9a84c" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="ap__bar-grid">
        {CATEGORY_SPLIT.map((p) => (
          <div key={p.label} className="ap__bar-card">
            <div className="ap__bar-row">
              <span className="ap__bar-label">{p.label}</span>
              <span className="ap__bar-pct" style={{ color: p.color }}>{p.pct}%</span>
            </div>
            <div className="ap__bar-track">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${p.pct}%` }}
                transition={{ duration: 1 }}
                className="ap__bar-fill"
                style={{ background: p.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab() {
  const FIELDS = [
    { label: 'Platform Name',   value: 'ReliaState',                type: 'text' },
    { label: 'Contact Email',   value: 'hello@iconbuilderindia.com', type: 'email' },
    { label: 'WhatsApp Number', value: '+91 98765 43210',            type: 'text' },
    { label: 'Domain',          value: 'iconbuilderindia.com',       type: 'text' },
  ]

  return (
    <div className="ap__card ap__settings-card">
      <h3 className="ap__settings-title">Platform Settings</h3>
      {FIELDS.map((s) => (
        <div key={s.label} className="ap__form-group">
          <label className="ap__form-label">{s.label}</label>
          <input defaultValue={s.value} type={s.type} className="ap__form-input" />
        </div>
      ))}
      <button className="ap__btn-gold ap__btn-gold--wide">Save Settings</button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout?.(); navigate('/login') }

  const TABS = {
    overview: <Overview />,
    projects: <ProjectsTab />,
    clients: <ClientsTab />,
    contractors: <ContractorsTab />,
    inquiries: <InquiriesTab />,
    analytics: <AnalyticsTab />,
    settings: <SettingsTab />,
  }

  return (
    <div className="ap__page">
      <style>{`
        .ap__page {
          min-height: 100vh;
          background: #0a1420;
          color: #e8d5a3;
          display: flex;
        }

        /* ── Sidebar ── */
        .ap__sidebar {
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
        .ap__sidebar--open { transform: translateX(0); }
        @media (min-width: 1024px) {
          .ap__sidebar { position: static; transform: translateX(0); }
        }

        .ap__sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ap__sidebar-logo {
          font-weight: 900;
          font-size: 1.25rem;
          text-decoration: none;
        }
        .ap__sidebar-logo-cream { color: #e8d5a3; }
        .ap__sidebar-logo-gold { color: #c9a84c; }
        .ap__sidebar-close {
          background: none;
          border: none;
          color: #8fa3b8;
          cursor: pointer;
          display: flex;
        }
        @media (min-width: 1024px) { .ap__sidebar-close { display: none; } }

        .ap__sidebar-user {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .ap__sidebar-avatar {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a84c;
          font-weight: 900;
          flex-shrink: 0;
        }
        .ap__sidebar-user-name { color: #e8d5a3; font-size: 0.875rem; font-weight: 600; margin: 0; }
        .ap__sidebar-user-role { color: #c9a84c; font-size: 0.75rem; font-weight: 500; margin: 0.1rem 0 0; }

        .ap__nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow-y: auto;
        }
        .ap__nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          background: none;
          border: 1px solid transparent;
          color: #8fa3b8;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          box-sizing: border-box;
        }
        .ap__nav-item:hover { background: rgba(255,255,255,0.05); color: #e8d5a3; }
        .ap__nav-item--active {
          background: rgba(201,168,76,0.12);
          color: #c9a84c;
          border-color: rgba(201,168,76,0.25);
        }
        .ap__nav-badge {
          margin-left: auto;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background: #c9a84c;
          color: #071422;
          font-size: 0.62rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ap__sidebar-footer {
          padding: 1rem 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .ap__logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          background: none;
          border: none;
          color: #8fa3b8;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .ap__logout-btn:hover { background: rgba(248,113,113,0.1); color: #f87171; }

        .ap__overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 30;
        }
        @media (min-width: 1024px) { .ap__overlay { display: none; } }

        /* ── Main ── */
        .ap__main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .ap__header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(10,20,32,0.9);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ap__header-left { display: flex; align-items: center; gap: 0.75rem; }
        .ap__menu-btn {
          background: none;
          border: none;
          color: #8fa3b8;
          cursor: pointer;
          display: flex;
        }
        @media (min-width: 1024px) { .ap__menu-btn { display: none; } }
        .ap__header-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0; }
        .ap__header-title { color: #e8d5a3; font-weight: 700; font-size: 1rem; margin: 0; text-transform: capitalize; }

        .ap__header-right { display: flex; align-items: center; gap: 0.75rem; }
        .ap__bell-btn {
          position: relative;
          background: none;
          border: none;
          color: #8fa3b8;
          cursor: pointer;
          display: flex;
          transition: color 0.2s ease;
        }
        .ap__bell-btn:hover { color: #c9a84c; }
        .ap__bell-dot {
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          background: #c9a84c;
          color: #071422;
          font-size: 0.55rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ap__avatar-sm {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a84c;
          font-weight: 900;
          font-size: 0.875rem;
        }

        .ap__content {
          flex: 1;
          padding: 1.25rem;
          overflow-y: auto;
        }
        @media (min-width: 640px) { .ap__content { padding: 1.5rem; } }
        .ap__content-inner { max-width: 72rem; margin: 0 auto; }

        /* ── Shared ── */
        .ap__stack { display: flex; flex-direction: column; gap: 1.5rem; }
        .ap__stack--tight { gap: 0.75rem; }

        .ap__badge {
          font-size: 0.68rem;
          padding: 0.15rem 0.65rem;
          border-radius: 9999px;
          border: 1px solid;
          font-weight: 700;
          white-space: nowrap;
        }

        .ap__card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          padding: 1.5rem;
        }
        .ap__card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .ap__card-title {
          color: #e8d5a3;
          font-weight: 700;
          font-size: 1rem;
          margin: 0;
        }
        .ap__card-title--pad { margin-bottom: 1rem; }
        .ap__card-count { color: #8fa3b8; font-size: 0.75rem; }

        .ap__section-title { color: #e8d5a3; font-weight: 700; font-size: 1rem; margin: 0; }

        /* ── Stat cards ── */
        .ap__stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 1280px) { .ap__stats-grid { grid-template-columns: repeat(4, 1fr); } }

        .ap__stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          padding: 1.15rem;
          transition: border-color 0.3s ease;
        }
        .ap__stat-card:hover { border-color: rgba(201,168,76,0.25); }
        .ap__stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .ap__stat-icon {
          width: 2.5rem; height: 2.5rem;
          border-radius: 0.75rem;
          display: flex; align-items: center; justify-content: center;
        }
        .ap__stat-value { color: #e8d5a3; font-weight: 900; font-size: 1.5rem; }
        .ap__stat-label { color: #8fa3b8; font-size: 0.75rem; margin-top: 0.15rem; }
        .ap__stat-change { color: #c9a84c; font-size: 0.68rem; margin-top: 0.4rem; font-weight: 600; }

        /* ── Charts ── */
        .ap__charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 1024px) { .ap__charts-grid { grid-template-columns: 1fr 1fr; } }
        .ap__chart-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          padding: 1.25rem;
        }
        .ap__chart-title { color: #e8d5a3; font-weight: 700; font-size: 0.875rem; margin: 0 0 1rem; }

        /* ── Project rows ── */
        .ap__project-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .ap__project-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.2s ease;
        }
        .ap__project-row:hover { border-color: rgba(201,168,76,0.15); background: rgba(255,255,255,0.015); }
        .ap__project-icon {
          width: 2rem; height: 2rem;
          border-radius: 0.5rem;
          background: rgba(201,168,76,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ap__project-info { flex: 1; min-width: 0; }
        .ap__project-name { color: #e8d5a3; font-size: 0.875rem; font-weight: 500; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ap__project-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0.1rem 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ap__project-meta { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .ap__project-budget-wrap { text-align: right; display: none; }
        @media (min-width: 640px) { .ap__project-budget-wrap { display: block; } }
        .ap__project-budget { color: #e8d5a3; font-size: 0.75rem; font-weight: 600; }
        .ap__project-pct { color: #8fa3b8; font-size: 0.72rem; }

        .ap__progress-track-sm {
          width: 4rem;
          height: 0.35rem;
          background: rgba(255,255,255,0.06);
          border-radius: 9999px;
          overflow: hidden;
          display: none;
        }
        @media (min-width: 640px) { .ap__progress-track-sm { display: block; } }
        .ap__progress-fill-sm {
          height: 100%;
          background: linear-gradient(to right, #c9a84c, #f0d080);
          border-radius: 9999px;
        }

        /* ── Alert ── */
        .ap__alert {
          background: rgba(201,168,76,0.04);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 1rem;
          padding: 1.15rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .ap__alert-left { display: flex; align-items: center; gap: 0.75rem; }
        .ap__alert-icon {
          width: 2.5rem; height: 2.5rem;
          border-radius: 0.75rem;
          background: rgba(201,168,76,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ap__alert-title { color: #e8d5a3; font-weight: 700; font-size: 0.875rem; margin: 0; }
        .ap__alert-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0.1rem 0 0; }
        .ap__alert-btn {
          background: none;
          border: none;
          color: #c9a84c;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
        }
        .ap__alert-btn:hover { text-decoration: underline; }

        /* ── Toolbar / search ── */
        .ap__toolbar { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .ap__search-wrap { position: relative; flex: 1; min-width: 200px; }
        .ap__search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #8fa3b8; pointer-events: none; }
        .ap__search-input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.25rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e8d5a3;
          font-size: 0.875rem;
          box-sizing: border-box;
        }
        .ap__search-input::placeholder { color: #55708a; }
        .ap__search-input:focus { outline: none; border-color: rgba(201,168,76,0.4); }

        .ap__filter-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: #8fa3b8;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ap__filter-btn:hover { border-color: rgba(201,168,76,0.25); color: #e8d5a3; }

        .ap__btn-gold {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.1rem;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          font-size: 0.875rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          white-space: nowrap;
        }
        .ap__btn-gold--wide { width: 100%; justify-content: center; }

        /* ── Table ── */
        .ap__table-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          overflow: hidden;
        }
        .ap__table-scroll { overflow-x: auto; }
        .ap__table { width: 100%; border-collapse: collapse; }
        .ap__th {
          text-align: left;
          padding: 0.85rem 1rem;
          font-size: 0.7rem;
          color: #8fa3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 700;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          white-space: nowrap;
        }
        .ap__tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s ease; }
        .ap__tr:hover { background: rgba(255,255,255,0.015); }
        .ap__td { padding: 0.85rem 1rem; font-size: 0.875rem; color: #8fa3b8; white-space: nowrap; }
        .ap__td-name { color: #e8d5a3; font-weight: 500; }
        .ap__td-gold { color: #c9a84c; font-weight: 600; }
        .ap__progress-cell { display: flex; align-items: center; gap: 0.5rem; }
        .ap__progress-cell .ap__progress-track-sm { display: block; }
        .ap__progress-cell-text { color: #8fa3b8; font-size: 0.75rem; }

        .ap__row-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .ap__action-btn {
          width: 1.75rem; height: 1.75rem;
          border-radius: 0.5rem;
          background: rgba(255,255,255,0.04);
          border: none;
          color: #8fa3b8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ap__action-btn:hover { background: rgba(201,168,76,0.12); color: #c9a84c; }
        .ap__action-btn--danger:hover { background: rgba(248,113,113,0.12); color: #f87171; }

        /* ── List cards (clients/contractors) ── */
        .ap__list-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .ap__empty-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem;
          padding: 2rem;
          text-align: center;
          color: #8fa3b8;
          font-size: 0.875rem;
        }
        .ap__list-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          transition: border-color 0.2s ease;
        }
        .ap__list-card:hover { border-color: rgba(201,168,76,0.15); }
        .ap__list-avatar {
          width: 2.5rem; height: 2.5rem;
          border-radius: 50%;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #c9a84c;
          font-weight: 900;
          flex-shrink: 0;
        }
        .ap__list-icon-box {
          width: 2.75rem; height: 2.75rem;
          border-radius: 0.75rem;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ap__list-info { flex: 1; min-width: 140px; }
        .ap__list-name { color: #e8d5a3; font-weight: 600; font-size: 0.875rem; margin: 0; }
        .ap__list-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0.15rem 0 0; }
        .ap__list-detail { display: none; }
        .ap__list-detail--sm { display: block; }
        .ap__list-detail--md { display: none; }
        @media (min-width: 640px) { .ap__list-detail--sm { display: block; } }
        @media (min-width: 768px) { .ap__list-detail--md { display: block; } }
        .ap__list-detail-label { color: #8fa3b8; font-size: 0.72rem; margin: 0; }
        .ap__list-detail-value { color: #e8d5a3; font-size: 0.875rem; font-weight: 500; margin: 0.1rem 0 0; text-transform: capitalize; }

        .ap__approve-btn {
          display: flex; align-items: center; gap: 0.3rem;
          padding: 0.35rem 0.75rem;
          border-radius: 0.5rem;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.25);
          color: #4ade80;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .ap__approve-btn:hover { background: rgba(74,222,128,0.2); }
        .ap__deactivate-btn {
          padding: 0.35rem 0.75rem;
          border-radius: 0.5rem;
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.25);
          color: #f87171;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .ap__deactivate-btn:hover { background: rgba(248,113,113,0.2); }

        /* ── Modal ── */
        .ap__modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 50;
          backdrop-filter: blur(4px);
        }
        .ap__modal-wrap {
          position: fixed; inset: 0;
          z-index: 50;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .ap__modal {
          width: 100%; max-width: 28rem;
          background: #0d1826;
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 1.25rem;
          padding: 1.5rem;
          position: relative;
          box-sizing: border-box;
        }
        .ap__modal-close {
          position: absolute;
          top: 1rem; right: 1rem;
          width: 2rem; height: 2rem;
          border-radius: 0.5rem;
          background: rgba(255,255,255,0.05);
          border: none;
          color: #8fa3b8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .ap__modal-close:hover { color: #f87171; }

        .ap__modal-success { padding: 1.5rem 0; text-align: center; }
        .ap__modal-success-icon {
          width: 4rem; height: 4rem;
          border-radius: 50%;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.25);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
        }
        .ap__modal-success-title { color: #e8d5a3; font-weight: 700; font-size: 1.15rem; margin: 0 0 0.3rem; }
        .ap__modal-success-text { color: #8fa3b8; font-size: 0.875rem; margin: 0; }

        .ap__modal-title { color: #e8d5a3; font-weight: 700; font-size: 1.15rem; margin: 0 0 0.25rem; }
        .ap__modal-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0 0 1.25rem; }

        .ap__form-stack { display: flex; flex-direction: column; gap: 1rem; }
        .ap__form-group { display: flex; flex-direction: column; }
        .ap__form-label { color: #8fa3b8; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.4rem; font-weight: 600; }
        .ap__form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e8d5a3;
          font-size: 0.875rem;
          font-family: inherit;
          box-sizing: border-box;
        }
        .ap__form-input::placeholder { color: #55708a; }
        .ap__form-input:focus { outline: none; border-color: rgba(201,168,76,0.4); }
        .ap__form-input--flex { flex: 1; }

        .ap__phone-row { display: flex; gap: 0.5rem; }
        .ap__phone-prefix {
          display: flex; align-items: center;
          padding: 0 0.75rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e8d5a3;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .ap__info-box {
          background: rgba(201,168,76,0.05);
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 0.75rem;
          padding: 0.75rem;
        }
        .ap__info-box p { color: #8fa3b8; font-size: 0.75rem; margin: 0; }
        .ap__info-highlight { color: #c9a84c; }

        .ap__modal-actions { display: flex; gap: 0.75rem; }
        .ap__btn-cancel {
          flex: 1;
          padding: 0.75rem;
          border-radius: 0.75rem;
          background: transparent;
          border: 1px solid rgba(232,213,163,0.2);
          color: #e8d5a3;
          font-size: 0.875rem;
          cursor: pointer;
        }
        .ap__btn-cancel:hover { border-color: rgba(201,168,76,0.4); }
        .ap__btn-submit {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          font-size: 0.875rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }
        .ap__btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .ap__spinner {
          width: 1rem; height: 1rem;
          border: 2px solid rgba(7,20,34,0.3);
          border-top-color: #071422;
          border-radius: 50%;
          animation: ap-spin 0.7s linear infinite;
        }
        @keyframes ap-spin { to { transform: rotate(360deg); } }

        /* ── Inquiries ── */
        .ap__inquiry-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
        .ap__filter-pills { display: flex; gap: 0.5rem; }
        .ap__filter-pill {
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          color: #8fa3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ap__filter-pill:hover { border-color: rgba(201,168,76,0.3); color: #c9a84c; }

        .ap__inquiry-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem;
          padding: 1rem;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          transition: border-color 0.2s ease;
        }
        .ap__inquiry-card:hover { border-color: rgba(201,168,76,0.15); }
        .ap__inquiry-left { display: flex; align-items: flex-start; gap: 0.75rem; }
        .ap__inquiry-avatar {
          width: 2.5rem; height: 2.5rem;
          border-radius: 50%;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.15);
          display: flex; align-items: center; justify-content: center;
          color: #c9a84c;
          font-weight: 900;
          flex-shrink: 0;
        }
        .ap__inquiry-tags { display: flex; gap: 0.5rem; margin-top: 0.4rem; flex-wrap: wrap; }
        .ap__tag {
          font-size: 0.68rem;
          padding: 0.15rem 0.55rem;
          border-radius: 9999px;
          background: rgba(255,255,255,0.05);
          color: #8fa3b8;
        }
        .ap__tag-muted { font-size: 0.68rem; color: #55708a; }

        .ap__call-btn {
          padding: 0.4rem 0.75rem;
          border-radius: 0.5rem;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.2);
          color: #4ade80;
          font-size: 0.72rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .ap__call-btn:hover { background: rgba(74,222,128,0.2); }
        .ap__whatsapp-btn {
          padding: 0.4rem 0.75rem;
          border-radius: 0.5rem;
          background: rgba(37,211,102,0.1);
          border: 1px solid rgba(37,211,102,0.2);
          color: #25D366;
          font-size: 0.72rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .ap__whatsapp-btn:hover { background: rgba(37,211,102,0.2); }

        /* ── Analytics ── */
        .ap__analytics-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 640px) { .ap__analytics-grid { grid-template-columns: repeat(3, 1fr); } }
        .ap__analytics-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          padding: 1.25rem;
          text-align: center;
        }
        .ap__analytics-value { font-weight: 900; font-size: 1.75rem; }
        .ap__analytics-label { color: #e8d5a3; font-weight: 600; font-size: 0.875rem; margin-top: 0.25rem; }
        .ap__analytics-sub { color: #8fa3b8; font-size: 0.75rem; margin-top: 0.15rem; }

        .ap__bar-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 640px) { .ap__bar-grid { grid-template-columns: 1fr 1fr; } }
        .ap__bar-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.85rem;
          padding: 1rem;
        }
        .ap__bar-row { display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.5rem; }
        .ap__bar-label { color: #e8d5a3; font-weight: 500; }
        .ap__bar-pct { font-weight: 700; }
        .ap__bar-track { height: 0.5rem; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden; }
        .ap__bar-fill { height: 100%; border-radius: 9999px; }

        /* ── Settings ── */
        .ap__settings-card { display: flex; flex-direction: column; gap: 1.25rem; }
        .ap__settings-title { color: #e8d5a3; font-weight: 700; font-size: 1.1rem; margin: 0; }

        /* ══════════════════════════════════════════
           MOBILE (≤640px)
           ══════════════════════════════════════════ */
        @media (max-width: 640px) {
          .ap__content { padding: 1rem; }
          .ap__header { padding: 0.85rem 1rem; }
          .ap__stat-card { padding: 0.9rem; }
          .ap__stat-value { font-size: 1.25rem; }
          .ap__card { padding: 1.1rem; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`ap__sidebar ${sidebarOpen ? 'ap__sidebar--open' : ''}`}>
        <div className="ap__sidebar-header">
          <Link to="/" className="ap__sidebar-logo">
            <span className="ap__sidebar-logo-cream">RELIA</span><span className="ap__sidebar-logo-gold">STATE</span>
          </Link>
          <button className="ap__sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="ap__sidebar-user">
          <div className="ap__sidebar-avatar">{(user?.name || 'A')[0]}</div>
          <div>
            <p className="ap__sidebar-user-name">{user?.name || 'Admin'}</p>
            <p className="ap__sidebar-user-role">Super Admin</p>
          </div>
        </div>

        <nav className="ap__nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
              className={`ap__nav-item ${activeTab === item.id ? 'ap__nav-item--active' : ''}`}
            >
              <item.icon size={17} />
              {item.label}
              {item.id === 'inquiries' && <span className="ap__nav-badge">2</span>}
            </button>
          ))}
        </nav>

        <div className="ap__sidebar-footer">
          <button onClick={handleLogout} className="ap__logout-btn">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="ap__overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="ap__main">
        <header className="ap__header">
          <div className="ap__header-left">
            <button className="ap__menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <p className="ap__header-sub">Admin Panel</p>
              <p className="ap__header-title">{activeTab}</p>
            </div>
          </div>
          <div className="ap__header-right">
            <button className="ap__bell-btn">
              <Bell size={19} />
              <span className="ap__bell-dot">5</span>
            </button>
            <div className="ap__avatar-sm">{(user?.name || 'A')[0]}</div>
          </div>
        </header>

        <main className="ap__content">
          <div className="ap__content-inner">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {TABS[activeTab]}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
