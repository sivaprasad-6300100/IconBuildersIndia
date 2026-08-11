import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, HardHat, FolderOpen, Bell,
  Settings, LogOut, Menu, X, TrendingUp, Wallet,
  CheckCircle2, ChevronRight, ChevronLeft,
  UserPlus, Eye, Trash2, Search, BarChart3,
  Building2, MessageSquare, ShieldCheck,
  Image, UploadCloud, Pencil, AlertTriangle,
  Calculator, MapPin, Plus,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../services/api'
import toast from 'react-hot-toast'

// ── Constants ──────────────────────────────────────────────────────────────
const PAGE_SIZE = 6

const NAV = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'projects',    label: 'Projects',    icon: FolderOpen },
  { id: 'portfolio',   label: 'Portfolio',   icon: Image },
  { id: 'clients',     label: 'Clients',     icon: Users },
  { id: 'contractors', label: 'Contractors', icon: HardHat },
  { id: 'inquiries',   label: 'Inquiries',   icon: MessageSquare },
  { id: 'estimator',   label: 'Estimator',   icon: Calculator },
  { id: 'analytics',   label: 'Analytics',   icon: BarChart3 },
  { id: 'settings',    label: 'Settings',    icon: Settings },
]

const STATUS_COLORS = {
  Active:    '#4ade80',
  Complete:  '#60a5fa',
  Completed: '#4ade80',
  Planning:  '#94a3b8',
  Finishing: '#a78bfa',
  Pending:   '#fb923c',
  Inactive:  '#94a3b8',
  New:       '#c9a84c',
  Called:    '#60a5fa',
  Converted: '#4ade80',
  'In Progress': '#c9a84c',
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#8fa3b8'
  return (
    <span className="ap__badge" style={{ background: `${color}18`, borderColor: `${color}40`, color }}>
      {status}
    </span>
  )
}

// ── Reusable: Confirm Dialog (replaces native confirm()) ──────────────────────
function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="ap__modal-overlay"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="ap__modal-wrap"
          >
            <div className="ap__confirm-modal">
              <div className="ap__confirm-icon">
                <AlertTriangle size={20} color={danger ? '#f87171' : '#60a5fa'} />
              </div>
              <h3 className="ap__confirm-title">{title}</h3>
              {message && <p className="ap__confirm-text">{message}</p>}
              <div className="ap__modal-actions" style={{ marginTop: '1.25rem' }}>
                <button onClick={onCancel} className="ap__btn-cancel">Cancel</button>
                <button
                  onClick={onConfirm}
                  className="ap__btn-submit"
                  style={danger ? { background: 'linear-gradient(135deg, #f87171 0%, #fca5a5 100%)', color: '#450a0a' } : undefined}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Reusable: Pagination ───────────────────────────────────────────────────────
function Pagination({ page, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  if (totalPages <= 1) return null
  return (
    <div className="ap__pagination">
      <button className="ap__page-btn" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
        <ChevronLeft size={14} />
      </button>
      <span className="ap__page-info">Page {page} of {totalPages}</span>
      <button className="ap__page-btn" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ── Reusable: Bulk Action Bar ──────────────────────────────────────────────────
function BulkActionBar({ count, actions, onClear }) {
  if (count === 0) return null
  return (
    <div className="ap__bulk-bar">
      <span className="ap__bulk-count">{count} selected</span>
      <div className="ap__bulk-actions">
        {actions}
        <button onClick={onClear} className="ap__bulk-clear">Clear</button>
      </div>
    </div>
  )
}

// ── Overview ─────────────────────────────────────────────────────────────────
function Overview() {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [contractors, setContractors] = useState([])
  const [inquirySummary, setInquirySummary] = useState({ total: 0, new: 0 })
  const [fetched, setFetched] = useState(false)

  const fetchAll = async () => {
    try {
      const [projectsRes, clientsRes, contractorsRes, inquiriesRes] = await Promise.all([
        api.get('/api/projects/'),
        api.get('/api/users/?role=client'),
        api.get('/api/users/?role=contractor'),
        api.get('/api/inquiries/'),
      ])
      setProjects(projectsRes.data)
      setClients(clientsRes.data)
      setContractors(contractorsRes.data)
      setInquirySummary(inquiriesRes.data.summary)
    } catch {
      toast.error('Failed to load dashboard data')
    }
    setFetched(true)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const stats = [
    { label: 'Total Projects',  value: String(projects.length), icon: FolderOpen, color: '#60a5fa' },
    { label: 'Active Clients',  value: String(clients.length),  icon: Users,      color: '#4ade80' },
    { label: 'Contractors',     value: String(contractors.length), icon: HardHat, color: '#c9a84c' },
    { label: 'Total Budget',    value: `₹${projects.reduce((sum, p) => sum + Number(p.total_budget || 0), 0).toLocaleString('en-IN')}`, icon: Wallet, color: '#a78bfa' },
  ]

  const recentProjects = projects.slice(0, 4)

  return (
    <div className="ap__stack">
      <div className="ap__stats-grid">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="ap__stat-card">
            <div className="ap__stat-top">
              <div className="ap__stat-icon" style={{ background: `${s.color}15` }}>
                <s.icon size={18} color={s.color} />
              </div>
              <TrendingUp size={13} color="#4ade8099" />
            </div>
            <div className="ap__stat-value">{s.value}</div>
            <div className="ap__stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="ap__card">
        <div className="ap__card-header">
          <h3 className="ap__card-title">Recent Projects</h3>
          <span className="ap__card-count">{projects.length} total</span>
        </div>
        <div className="ap__project-list">
          {recentProjects.length === 0 && fetched && (
            <p style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>No projects yet.</p>
          )}
          {recentProjects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="ap__project-row">
              <div className="ap__project-icon">
                <Building2 size={14} color="#c9a84c" />
              </div>
              <div className="ap__project-info">
                <p className="ap__project-name">{p.name}</p>
                <p className="ap__project-sub">{p.client_name} · {p.contractor_name || 'Unassigned'}</p>
              </div>
              <div className="ap__project-meta">
                <div className="ap__project-budget-wrap">
                  <div className="ap__project-budget">₹{Number(p.total_budget).toLocaleString('en-IN')}</div>
                  <div className="ap__project-pct">{p.progress_percent}%</div>
                </div>
                <div className="ap__progress-track-sm">
                  <div className="ap__progress-fill-sm" style={{ width: `${p.progress_percent}%` }} />
                </div>
                <StatusBadge status={p.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {inquirySummary.new > 0 && (
        <div className="ap__alert">
          <div className="ap__alert-left">
            <div className="ap__alert-icon"><Bell size={18} color="#c9a84c" /></div>
            <div>
              <p className="ap__alert-title">{inquirySummary.new} New Inquiries</p>
              <p className="ap__alert-sub">Check the Inquiries tab for details</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Projects Tab ──────────────────────────────────────────────────────────────

const PROJECT_STATUS_LABELS = {
  planning: 'Planning',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const PROJECT_STATUS_COLORS = {
  planning: '#94a3b8',
  in_progress: '#c9a84c',
  on_hold: '#fb923c',
  completed: '#4ade80',
  cancelled: '#f87171',
}

function ProjectStatusBadge({ status }) {
  const color = PROJECT_STATUS_COLORS[status] || '#8fa3b8'
  return (
    <span className="ap__badge" style={{ background: `${color}18`, borderColor: `${color}40`, color }}>
      {PROJECT_STATUS_LABELS[status] || status}
    </span>
  )
}

function ProjectsTab() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [projects, setProjects] = useState([])
  const [fetched, setFetched] = useState(false)
  const [clients, setClients] = useState([])
  const [contractors, setContractors] = useState([])
  const [peopleFetched, setPeopleFetched] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editProject, setEditProject] = useState(null) // null = create mode, object = edit mode
  const [form, setForm] = useState({
    name: '', description: '', address: '', client: '', contractor: '',
    status: 'planning', total_budget: '', contractor_fee: '', start_date: '', expected_end_date: '',
  })

  const [detailProject, setDetailProject] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)


  const [showClientPaymentForm, setShowClientPaymentForm] = useState(false)
  const [showContractorPaymentForm, setShowContractorPaymentForm] = useState(false)
  const [clientPaymentForm, setClientPaymentForm] = useState({ amount: '', date: '', proof_image: null })
  const [contractorPaymentForm, setContractorPaymentForm] = useState({ amount: '', date: '', proof_image: null })
  const [submittingClientPayment, setSubmittingClientPayment] = useState(false)
  const [submittingContractorPayment, setSubmittingContractorPayment] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects/')
      setProjects(res.data)
    } catch {
      toast.error('Failed to load projects')
    }
    setFetched(true)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const fetchPeople = async () => {
    try {
      const [clientsRes, contractorsRes] = await Promise.all([
        api.get('/api/users/?role=client'),
        api.get('/api/users/?role=contractor'),
      ])
      setClients(clientsRes.data)
      setContractors(contractorsRes.data)
    } catch {
      toast.error('Failed to load clients/contractors')
    }
    setPeopleFetched(true)
  }

  const resetForm = () => setForm({
    name: '', description: '', address: '', client: '', contractor: '',
    status: 'planning', total_budget: '', start_date: '', expected_end_date: '',
    contractor_fee: '',
  })

  const openAddModal = () => {
    if (!peopleFetched) fetchPeople()
    resetForm()
    setEditProject(null)
    setShowModal(true)
  }

  // NOTE: assumes the project list/detail payload exposes raw `client` / `contractor`
  // id fields in addition to the display `client_name` / `contractor_name`. Adjust
  // the fallbacks below if your API only returns the *_name fields.
  const openEditModal = (project) => {
    if (!peopleFetched) fetchPeople()
    setForm({
      name: project.name || '',
      description: project.description || '',
      address: project.address || '',
      client: project.client ?? project.client_id ?? '',
      contractor: project.contractor ?? project.contractor_id ?? '',
      status: project.status || 'planning',
      total_budget: project.total_budget || '',
      contractor_fee: project.contractor_fee ?? '',
      start_date: project.start_date || '',
      expected_end_date: project.expected_end_date || '',
    })
    setEditProject(project)
    setShowModal(true)
  }

  const closeModal = () => {
    if (loading) return
    setShowModal(false)
    setEditProject(null)
  }

  const handleSubmitProject = async () => {
    if (!form.name.trim()) { toast.error('Enter a project name'); return }
    if (!form.client) { toast.error('Select a client'); return }
    if (!form.total_budget) { toast.error('Enter a budget'); return }

    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        client: form.client,
        contractor: form.contractor || null,
        status: form.status,
        total_budget: form.total_budget,
        contractor_fee: form.contractor_fee === '' ? null : Number(form.contractor_fee),
        start_date: form.start_date || null,
        expected_end_date: form.expected_end_date || null,
      }

      if (editProject) {
        const res = await api.patch(`/api/projects/${editProject.id}/`, payload)
        setProjects((prev) => prev.map((p) => (p.id === editProject.id ? res.data : p)))
        toast.success(`"${form.name}" project updated`)
      } else {
        const res = await api.post('/api/projects/', payload)
        setProjects((prev) => [res.data, ...prev])
        toast.success(`"${form.name}" project created`)
      }
      setShowModal(false)
      setEditProject(null)
      resetForm()
    } catch (err) {
      const data = err.response?.data
      const firstError = data?.detail
        || (data && Object.values(data)[0]?.[0])
        || `Failed to ${editProject ? 'update' : 'create'} project`
      toast.error(firstError)
    } finally {
      setLoading(false)
    }
  }

  const doDelete = async (project) => {
    try {
      await api.delete(`/api/projects/${project.id}/`)
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setConfirmDelete(null)
    }
  }

  const openDetail = async (project) => {
    setDetailLoading(true)
    // ADD — reset payment forms for the newly opened project
    setShowClientPaymentForm(false)
    setShowContractorPaymentForm(false)
    setClientPaymentForm({ amount: '', date: '', proof_image: null })
    setContractorPaymentForm({ amount: '', date: '', proof_image: null })
    try {
      const res = await api.get(`/api/projects/${project.id}/`)
      setDetailProject(res.data)
    } catch {
      toast.error('Failed to load project details')
    } finally {
      setDetailLoading(false)
    }
  }

  const updateMilestoneStatus = async (milestone, newStatus) => {
    try {
      const res = await api.patch(`/api/projects/milestones/${milestone.id}/`, { status: newStatus })
      setDetailProject((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) => (m.id === milestone.id ? res.data : m)),
      }))
      toast.success(`Milestone marked as ${newStatus.replace('_', ' ')}`)
    } catch {
      toast.error('Failed to update milestone')
    }
  }

  const submitClientPayment = async () => {
    if (!clientPaymentForm.amount || Number(clientPaymentForm.amount) <= 0) {
      toast.error('Enter a valid amount'); return
    }
    if (!clientPaymentForm.date) { toast.error('Select a date'); return }
    if (!clientPaymentForm.proof_image) { toast.error('Upload payment proof'); return }

    setSubmittingClientPayment(true)
    try {
      const data = new FormData()
      data.append('amount', clientPaymentForm.amount)
      data.append('date', clientPaymentForm.date)
      if (clientPaymentForm.proof_image) data.append('proof_image', clientPaymentForm.proof_image)

      const res = await api.post(`/api/projects/${detailProject.id}/client-payments/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDetailProject((prev) => ({
        ...prev,
        client_payments: [res.data, ...prev.client_payments],
      }))
      toast.success('Client payment logged')
      setClientPaymentForm({ amount: '', date: '', proof_image: null })
      setShowClientPaymentForm(false)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to log client payment')
    } finally {
      setSubmittingClientPayment(false)
    }
  }

  const submitContractorPayment = async () => {
    if (!contractorPaymentForm.amount || Number(contractorPaymentForm.amount) <= 0) {
      toast.error('Enter a valid amount'); return
    }
    if (!contractorPaymentForm.date) { toast.error('Select a date'); return }
    if (!contractorPaymentForm.proof_image) { toast.error('Upload payment proof'); return }

    setSubmittingContractorPayment(true)
    try {
      const data = new FormData()
      data.append('amount', contractorPaymentForm.amount)
      data.append('date', contractorPaymentForm.date)
      if (contractorPaymentForm.proof_image) data.append('proof_image', contractorPaymentForm.proof_image)

      const res = await api.post(`/api/projects/${detailProject.id}/contractor-payments/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDetailProject((prev) => ({
        ...prev,
        contractor_payments: [res.data, ...prev.contractor_payments],
      }))
      toast.success('Contractor payment logged')
      setContractorPaymentForm({ amount: '', date: '', proof_image: null })
      setShowContractorPaymentForm(false)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to log contractor payment')
    } finally {
      setSubmittingContractorPayment(false)
    }
  }

  const filtered = projects.filter((p) =>
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.client_name || '').toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'all' || p.status === statusFilter)
  )
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    if (page > totalPages) setPage(totalPages)
  }, [filtered.length])

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
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ap__filter-select">
          <option value="all">All Statuses</option>
          {Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button onClick={openAddModal} className="ap__btn-gold">
          <Building2 size={14} /> Add Project
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
              {filtered.length === 0 && fetched && (
                <tr><td className="ap__td" colSpan={7}>No projects found.</td></tr>
              )}
              {paginated.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="ap__tr">
                  <td className="ap__td ap__td-name">{p.name}</td>
                  <td className="ap__td">{p.client_name || '—'}</td>
                  <td className="ap__td">{p.contractor_name || '—'}</td>
                  <td className="ap__td ap__td-gold">₹{Number(p.total_budget).toLocaleString('en-IN')}</td>
                  <td className="ap__td">
                    <div className="ap__progress-cell">
                      <div className="ap__progress-track-sm">
                        <div className="ap__progress-fill-sm" style={{ width: `${p.progress_percent}%` }} />
                      </div>
                      <span className="ap__progress-cell-text">{p.progress_percent}%</span>
                    </div>
                  </td>
                  <td className="ap__td"><ProjectStatusBadge status={p.status} /></td>
                  <td className="ap__td">
                    <div className="ap__row-actions">
                      <button onClick={() => openEditModal(p)} className="ap__action-btn" title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => openDetail(p)} className="ap__action-btn" title="View"><Eye size={13} /></button>
                      <button onClick={() => setConfirmDelete(p)} className="ap__action-btn ap__action-btn--danger" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {/* Add / Edit Project Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={closeModal} className="ap__modal-close"><X size={16} /></button>
                <h2 className="ap__modal-title">{editProject ? 'Edit Project' : 'Add New Project'}</h2>
                <p className="ap__modal-sub">
                  {editProject ? 'Update details, reassign client/contractor, or change status' : 'Create an internal client job (separate from public Portfolio)'}
                </p>

                <div className="ap__form-stack">
                  <div className="ap__form-group">
                    <label className="ap__form-label">Project Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Kondapur Villa"
                      className="ap__form-input"
                    />
                  </div>

                  <div className="ap__form-group">
                    <label className="ap__form-label">Client *</label>
                    <select
                      value={form.client}
                      onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))}
                      className="ap__form-input"
                    >
                      <option value="">{peopleFetched ? 'Select a client' : 'Loading...'}</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                    </select>
                  </div>

                  <div className="ap__form-group">
                    <label className="ap__form-label">Contractor (optional — reassign anytime)</label>
                    <select
                      value={form.contractor}
                      onChange={(e) => setForm((p) => ({ ...p, contractor: e.target.value }))}
                      className="ap__form-input"
                    >
                      <option value="">Unassigned</option>
                      {contractors.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                    </select>
                  </div>

                  <div className="ap__form-group">
                    <label className="ap__form-label">Address</label>
                    <input
                      value={form.address}
                      onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Site address"
                      className="ap__form-input"
                    />
                  </div>


                  <div className="ap__phone-row">
                    <div className="ap__form-group" style={{ flex: 1 }}>
                      <label className="ap__form-label">Total Budget (₹) *</label>
                      <input
                        type="number"
                        value={form.total_budget}
                        onChange={(e) => setForm((p) => ({ ...p, total_budget: e.target.value }))}
                        placeholder="e.g. 2800000"
                        className="ap__form-input"
                      />
                    </div>
                    <div className="ap__form-group" style={{ flex: 1 }}>
                      <label className="ap__form-label">Contractor Fee (₹)</label>
                      <input
                        type="number"
                        value={form.contractor_fee}
                        onChange={(e) => setForm((p) => ({ ...p, contractor_fee: e.target.value }))}
                        placeholder="e.g. 500000"
                        className="ap__form-input"
                      />
                    </div>
                    <div className="ap__form-group" style={{ flex: 1 }}>
                      <label className="ap__form-label">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                        className="ap__form-input"
                      >
                        {Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="ap__phone-row">
                    <div className="ap__form-group" style={{ flex: 1 }}>
                      <label className="ap__form-label">Start Date</label>
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                        className="ap__form-input"
                      />
                    </div>
                    <div className="ap__form-group" style={{ flex: 1 }}>
                      <label className="ap__form-label">Expected End Date</label>
                      <input
                        type="date"
                        value={form.expected_end_date}
                        onChange={(e) => setForm((p) => ({ ...p, expected_end_date: e.target.value }))}
                        className="ap__form-input"
                      />
                    </div>
                  </div>

                  <div className="ap__form-group">
                    <label className="ap__form-label">Description</label>
                    <input
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Short project notes"
                      className="ap__form-input"
                    />
                  </div>

                  <div className="ap__modal-actions">
                    <button onClick={closeModal} disabled={loading} className="ap__btn-cancel">Cancel</button>
                    <button onClick={handleSubmitProject} disabled={loading} className="ap__btn-submit">
                      {loading
                        ? <><div className="ap__spinner" />{editProject ? 'Saving...' : 'Creating...'}</>
                        : editProject
                          ? <><Pencil size={14} />Save Changes</>
                          : <><Building2 size={14} />Create Project</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Project Detail Modal (with milestones) */}
      <AnimatePresence>
        {(detailProject || detailLoading) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailProject(null)} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal" style={{ maxWidth: '32rem' }}>
                <button onClick={() => setDetailProject(null)} className="ap__modal-close"><X size={16} /></button>

                {detailLoading && <p style={{ color: '#8fa3b8' }}>Loading...</p>}

                {detailProject && !detailLoading && (
                  <>
                    <h2 className="ap__modal-title">{detailProject.name}</h2>
                    <p className="ap__modal-sub">
                      {detailProject.client_name} · {detailProject.contractor_name || 'No contractor assigned'}
                    </p>


                    {(() => {
                      const clientTotalPaid = detailProject.client_payments.reduce((sum, p) => sum + Number(p.amount), 0)
                      const clientBalance = Number(detailProject.total_budget) - clientTotalPaid
                      const contractorFee = Number(detailProject.contractor_fee) || 0
                      const contractorTotalPaid = detailProject.contractor_payments.reduce((sum, p) => sum + Number(p.amount), 0)
                      const contractorBalance = contractorFee - contractorTotalPaid

                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                          <div style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '0.85rem', padding: '0.9rem' }}>
                            <p style={{ color: '#60a5fa', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.6rem' }}>Client Side</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>Total Budget</span>
                              <span style={{ color: '#e8d5a3', fontSize: '0.82rem', fontWeight: 600 }}>₹{Number(detailProject.total_budget).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>Paid</span>
                              <span style={{ color: '#4ade80', fontSize: '0.82rem', fontWeight: 600 }}>₹{clientTotalPaid.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                              <span style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>Balance Due</span>
                              <span style={{ color: clientBalance > 0 ? '#fb923c' : '#4ade80', fontSize: '0.85rem', fontWeight: 700 }}>₹{clientBalance.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '0.85rem', padding: '0.9rem' }}>
                            <p style={{ color: '#c9a84c', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.6rem' }}>Contractor Side</p>
                            {detailProject.contractor ? (
                              <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                  <span style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>Contractor Fee</span>
                                  <span style={{ color: '#e8d5a3', fontSize: '0.82rem', fontWeight: 600 }}>{contractorFee > 0 ? `₹${contractorFee.toLocaleString('en-IN')}` : 'Not set'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                  <span style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>Paid</span>
                                  <span style={{ color: '#4ade80', fontSize: '0.82rem', fontWeight: 600 }}>₹{contractorTotalPaid.toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                  <span style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>Balance Due</span>
                                  <span style={{ color: contractorBalance > 0 ? '#fb923c' : '#4ade80', fontSize: '0.85rem', fontWeight: 700 }}>{contractorFee > 0 ? `₹${contractorBalance.toLocaleString('en-IN')}` : '—'}</span>
                                </div>
                              </>
                            ) : (
                              <p style={{ color: '#8fa3b8', fontSize: '0.78rem', margin: 0 }}>No contractor assigned</p>
                            )}
                          </div>
                        </div>
                      )
                    })()}

                    {detailProject.description && (
                      <p style={{ color: '#8fa3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>{detailProject.description}</p>
                    )}

                    <h3 className="ap__card-title" style={{ marginBottom: '0.75rem' }}>
                      Milestones ({detailProject.milestones.length})
                    </h3>
                    <div className="ap__stack ap__stack--tight">
                      {detailProject.milestones.length === 0 && (
                        <p style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>No milestones added yet.</p>
                      )}
                      {detailProject.milestones.map((m) => (
                        <div key={m.id} className="ap__list-card" style={{ padding: '0.75rem' }}>
                          <div className="ap__list-info">
                            <p className="ap__list-name">{m.title}</p>
                            {m.due_date && <p className="ap__list-sub">Due {m.due_date}</p>}
                          </div>
                          <select
                            value={m.status}
                            onChange={(e) => updateMilestoneStatus(m, e.target.value)}
                            className="ap__filter-pill"
                            style={{ cursor: 'pointer' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="delayed">Delayed</option>
                          </select>
                        </div>
                      ))}
                    </div>
                    {/* ── Client Payments ── */}
                    <div style={{ marginTop: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <h3 className="ap__card-title">
                          Client Payments ({detailProject.client_payments.length})
                        </h3>
                        <button
                          onClick={() => setShowClientPaymentForm((v) => !v)}
                          className="ap__approve-btn"
                        >
                          {showClientPaymentForm ? 'Cancel' : '+ Log Client Payment'}
                        </button>
                      </div>
                    
                      {showClientPaymentForm && (
                        <div className="ap__list-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div className="ap__phone-row">
                            <div className="ap__form-group" style={{ flex: 1 }}>
                              <label className="ap__form-label">Amount (₹)</label>
                              <input
                                type="number"
                                value={clientPaymentForm.amount}
                                onChange={(e) => setClientPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                                placeholder="e.g. 500000"
                                className="ap__form-input"
                              />
                            </div>
                            <div className="ap__form-group" style={{ flex: 1 }}>
                              <label className="ap__form-label">Date</label>
                              <input
                                type="date"
                                value={clientPaymentForm.date}
                                onChange={(e) => setClientPaymentForm((p) => ({ ...p, date: e.target.value }))}
                                className="ap__form-input"
                              />
                            </div>
                          </div>
                          <div className="ap__form-group">
                            <label className="ap__form-label">Proof </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setClientPaymentForm((p) => ({ ...p, proof_image: e.target.files[0] || null }))}
                              className="ap__form-input"
                            />
                          </div>
                          <button
                            onClick={submitClientPayment}
                            disabled={submittingClientPayment}
                            className="ap__btn-submit"
                          >
                            {submittingClientPayment ? <><div className="ap__spinner" />Saving...</> : 'Save Payment'}
                          </button>
                        </div>
                      )}

                      <div className="ap__stack ap__stack--tight">
                        {detailProject.client_payments.length === 0 && !showClientPaymentForm && (
                          <p style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>No client payments logged yet.</p>
                        )}
                        {detailProject.client_payments.map((pmt) => (
                          <div key={pmt.id} className="ap__list-card" style={{ padding: '0.75rem' }}>
                            <div className="ap__list-info">
                              <p className="ap__list-name">₹{Number(pmt.amount).toLocaleString('en-IN')}</p>
                              <p className="ap__list-sub">{pmt.date}{pmt.logged_by_name ? ` · logged by ${pmt.logged_by_name}` : ''}</p>
                            </div>
                            {pmt.proof_image && (
                              <a href={pmt.proof_image} target="_blank" rel="noopener noreferrer" className="ap__action-btn" title="View proof">
                                <Eye size={13} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                      
                    {/* ── Contractor Payments ── */}
                    <div style={{ marginTop: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <h3 className="ap__card-title">
                          Contractor Payments ({detailProject.contractor_payments.length})
                        </h3>
                        <button
                          onClick={() => setShowContractorPaymentForm((v) => !v)}
                          className="ap__approve-btn"
                          disabled={!detailProject.contractor}
                          title={!detailProject.contractor ? 'Assign a contractor first' : undefined}
                        >
                          {showContractorPaymentForm ? 'Cancel' : '+ Log Contractor Payment'}
                        </button>
                      </div>
                      
                      {!detailProject.contractor && (
                        <p style={{ color: '#8fa3b8', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                          No contractor assigned to this project yet.
                        </p>
                      )}

                      {showContractorPaymentForm && (
                        <div className="ap__list-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div className="ap__phone-row">
                            <div className="ap__form-group" style={{ flex: 1 }}>
                              <label className="ap__form-label">Amount (₹)</label>
                              <input
                                type="number"
                                value={contractorPaymentForm.amount}
                                onChange={(e) => setContractorPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                                placeholder="e.g. 150000"
                                className="ap__form-input"
                              />
                            </div>
                            <div className="ap__form-group" style={{ flex: 1 }}>
                              <label className="ap__form-label">Date</label>
                              <input
                                type="date"
                                value={contractorPaymentForm.date}
                                onChange={(e) => setContractorPaymentForm((p) => ({ ...p, date: e.target.value }))}
                                className="ap__form-input"
                              />
                            </div>
                          </div>
                          <div className="ap__form-group">
                            <label className="ap__form-label">Proof </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setContractorPaymentForm((p) => ({ ...p, proof_image: e.target.files[0] || null }))}
                              className="ap__form-input"
                            />
                          </div>
                          <button
                            onClick={submitContractorPayment}
                            disabled={submittingContractorPayment}
                            className="ap__btn-submit"
                          >
                            {submittingContractorPayment ? <><div className="ap__spinner" />Saving...</> : 'Save Payment'}
                          </button>
                        </div>
                      )}

                      <div className="ap__stack ap__stack--tight">
                        {detailProject.contractor_payments.length === 0 && !showContractorPaymentForm && (
                          <p style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>No contractor payments logged yet.</p>
                        )}
                        {detailProject.contractor_payments.map((pmt) => (
                          <div key={pmt.id} className="ap__list-card" style={{ padding: '0.75rem' }}>
                            <div className="ap__list-info">
                              <p className="ap__list-name">₹{Number(pmt.amount).toLocaleString('en-IN')}</p>
                              <p className="ap__list-sub">{pmt.date}{pmt.logged_by_name ? ` · logged by ${pmt.logged_by_name}` : ''}</p>
                            </div>
                            {pmt.proof_image && (
                              <a href={pmt.proof_image} target="_blank" rel="noopener noreferrer" className="ap__action-btn" title="View proof">
                                <Eye size={13} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete "${confirmDelete?.name}"?`}
        message="This can be restored by an admin later."
        onConfirm={() => doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// ── Clients Tab ───────────────────────────────────────────────────────────────
function ClientsTab() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [clients, setClients] = useState([])
  const [fetched, setFetched] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [editClient, setEditClient] = useState(null)
  const [detailClient, setDetailClient] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const fetchClients = async () => {
    try {
      const res = await api.get('/api/users/?role=client')
      setClients(res.data)
    } catch {}
    setFetched(true)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    if (page > totalPages) setPage(totalPages)
  }, [filtered.length])

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const openAddModal = () => {
    setForm({ name: '', phone: '', email: '' })
    setEditClient(null)
    setShowModal(true)
  }

  const openEditModal = (c) => {
    setForm({ name: c.name, phone: c.phone, email: c.email || '' })
    setEditClient(c)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Enter client name'); return }
    if (form.phone.length < 10) { toast.error('Enter valid 10-digit phone'); return }
    setLoading(true)
    try {
      if (editClient) {
        await api.put(`/api/users/${editClient.id}/`, {
          name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined
        })
        await fetchClients()
        toast.success(`${form.name} updated`)
        setShowModal(false)
        setEditClient(null)
      } else {
        const res = await api.post('/api/users/create-client/', {
          name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined,
        })
        setClients((prev) => [res.data.user, ...prev])
        setSuccess(true)
        toast.success(`Client ${form.name} created!`)
        setTimeout(() => {
          setSuccess(false)
          setShowModal(false)
          setForm({ name: '', phone: '', email: '' })
        }, 2000)
      }
    } catch (err) {
      toast.error(err.response?.data?.phone?.[0] || err.response?.data?.error || 'Failed to save client')
    } finally { setLoading(false) }
  }

  const doDelete = async (client) => {
    try {
      await api.delete(`/api/users/${client.id}/`)
      setClients((prev) => prev.filter((c) => c.id !== client.id))
      toast.success(`${client.name} removed`)
    } catch {
      toast.error('Failed to remove client')
    } finally {
      setConfirmDelete(null)
    }
  }

  const bulkDelete = async () => {
    try {
      await Promise.all([...selectedIds].map((id) => api.delete(`/api/users/${id}/`)))
      setClients((prev) => prev.filter((c) => !selectedIds.has(c.id)))
      toast.success(`${selectedIds.size} client(s) removed`)
      setSelectedIds(new Set())
    } catch {
      toast.error('Some deletions failed')
    } finally {
      setConfirmBulkDelete(false)
    }
  }

  return (
    <div className="ap__stack">
      <div className="ap__toolbar">
        <div className="ap__search-wrap">
          <Search size={14} className="ap__search-icon" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." className="ap__search-input" />
        </div>
        <button onClick={openAddModal} className="ap__btn-gold">
          <UserPlus size={14} /> Add Client
        </button>
      </div>

      <BulkActionBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        actions={<button onClick={() => setConfirmBulkDelete(true)} className="ap__deactivate-btn">Delete Selected</button>}
      />

      <div className="ap__list-grid">
        {filtered.length === 0 && (
          <div className="ap__empty-card"><p>No clients yet. Click "Add Client" to create one.</p></div>
        )}
        {paginated.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="ap__list-card">
            <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="ap__checkbox" />
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
              <button onClick={() => openEditModal(c)} className="ap__action-btn" title="Edit"><Pencil size={13} /></button>
              <button onClick={() => setDetailClient(c)} className="ap__action-btn" title="View"><Eye size={13} /></button>
              <button onClick={() => setConfirmDelete(c)} className="ap__action-btn ap__action-btn--danger" title="Delete"><Trash2 size={13} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !loading && setShowModal(false)} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={() => !loading && setShowModal(false)} className="ap__modal-close"><X size={16} /></button>

                {success ? (
                  <div className="ap__modal-success">
                    <div className="ap__modal-success-icon"><CheckCircle2 size={30} color="#4ade80" /></div>
                    <h3 className="ap__modal-success-title">Client Created!</h3>
                    <p className="ap__modal-success-text">{form.name} can now login with OTP</p>
                  </div>
                ) : (
                  <>
                    <h2 className="ap__modal-title">{editClient ? 'Edit Client' : 'Add New Client'}</h2>
                    <p className="ap__modal-sub">{editClient ? 'Update this client\'s details' : 'Client will login using phone + OTP'}</p>
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
                      {!editClient && (
                        <div className="ap__info-box">
                          <p>💡 Client can login at <span className="ap__info-highlight">iconbuilderindia.com/login</span> using phone + OTP</p>
                        </div>
                      )}
                      <div className="ap__modal-actions">
                        <button onClick={() => setShowModal(false)} disabled={loading} className="ap__btn-cancel">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading || !form.name || form.phone.length < 10} className="ap__btn-submit">
                          {loading
                            ? <><div className="ap__spinner" />Saving...</>
                            : editClient ? <><Pencil size={14} />Save Changes</> : <><UserPlus size={14} />Create Client</>}
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

      {/* Detail Modal */}
      <AnimatePresence>
        {detailClient && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailClient(null)} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={() => setDetailClient(null)} className="ap__modal-close"><X size={16} /></button>
                <div className="ap__profile-avatar-lg">{detailClient.name[0].toUpperCase()}</div>
                <h2 className="ap__modal-title" style={{ textAlign: 'center' }}>{detailClient.name}</h2>
                <p className="ap__modal-sub" style={{ textAlign: 'center' }}>{detailClient.role}</p>
                <div className="ap__info-box" style={{ marginTop: '0.5rem' }}>
                  <p>Phone: {detailClient.phone}</p>
                  <p>Email: {detailClient.email || '—'}</p>
                  <p>Status: {detailClient.is_active ? 'Active' : 'Inactive'}</p>
                  <p>Joined: {new Date(detailClient.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Remove "${confirmDelete?.name}"?`}
        message="This client will lose access to their dashboard."
        onConfirm={() => doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Remove ${selectedIds.size} client(s)?`}
        message="This action cannot be undone from here."
        onConfirm={bulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  )
}

// ── Contractors Tab ───────────────────────────────────────────────────────────
function ContractorsTab() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [contractors, setContractors] = useState([])
  const [fetched, setFetched] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [editContractor, setEditContractor] = useState(null)
  const [detailContractor, setDetailContractor] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const fetchContractors = async () => {
    try {
      const res = await api.get('/api/users/?role=contractor')
      setContractors(res.data)
    } catch {}
    setFetched(true)
  }

  useEffect(() => {
    fetchContractors()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const filtered = contractors.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    if (page > totalPages) setPage(totalPages)
  }, [filtered.length])

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const openAddModal = () => {
    setForm({ name: '', phone: '', email: '' })
    setEditContractor(null)
    setShowModal(true)
  }

  const openEditModal = (c) => {
    setForm({ name: c.name, phone: c.phone, email: c.email || '' })
    setEditContractor(c)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Enter contractor name'); return }
    if (form.phone.length < 10) { toast.error('Enter valid 10-digit phone'); return }
    setLoading(true)
    try {
      if (editContractor) {
        await api.put(`/api/users/${editContractor.id}/`, {
          name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined,
        })
        await fetchContractors()
        toast.success(`${form.name} updated`)
        setShowModal(false)
        setEditContractor(null)
      } else {
        const res = await api.post('/api/users/create-contractor/', {
          name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined,
        })
        setContractors((prev) => [res.data.user, ...prev])
        setSuccess(true)
        toast.success(`Contractor ${form.name} created!`)
        setTimeout(() => {
          setSuccess(false)
          setShowModal(false)
          setForm({ name: '', phone: '', email: '' })
        }, 2000)
      }
    } catch (err) {
      toast.error(err.response?.data?.phone?.[0] || err.response?.data?.error || 'Failed to save contractor')
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

  const doDelete = async (contractor) => {
    try {
      await api.delete(`/api/users/${contractor.id}/`)
      setContractors((prev) => prev.filter((c) => c.id !== contractor.id))
      toast.success(`${contractor.name} removed`)
    } catch {
      toast.error('Failed to remove contractor')
    } finally {
      setConfirmDelete(null)
    }
  }

  const bulkApprove = async () => {
    try {
      await Promise.all([...selectedIds].map((id) => api.put(`/api/users/${id}/`, { is_active: true })))
      setContractors((prev) => prev.map((c) => (selectedIds.has(c.id) ? { ...c, is_active: true } : c)))
      toast.success(`${selectedIds.size} contractor(s) approved`)
      setSelectedIds(new Set())
    } catch {
      toast.error('Some approvals failed')
    }
  }

  const bulkDelete = async () => {
    try {
      await Promise.all([...selectedIds].map((id) => api.delete(`/api/users/${id}/`)))
      setContractors((prev) => prev.filter((c) => !selectedIds.has(c.id)))
      toast.success(`${selectedIds.size} contractor(s) removed`)
      setSelectedIds(new Set())
    } catch {
      toast.error('Some deletions failed')
    } finally {
      setConfirmBulkDelete(false)
    }
  }

  return (
    <div className="ap__stack">
      <div className="ap__toolbar">
        <div className="ap__search-wrap">
          <Search size={14} className="ap__search-icon" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contractors..." className="ap__search-input" />
        </div>
        <button onClick={openAddModal} className="ap__btn-gold">
          <UserPlus size={14} /> Add Contractor
        </button>
      </div>

      <BulkActionBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        actions={
          <>
            <button onClick={bulkApprove} className="ap__approve-btn">Approve Selected</button>
            <button onClick={() => setConfirmBulkDelete(true)} className="ap__deactivate-btn">Delete Selected</button>
          </>
        }
      />

      <div className="ap__list-grid">
        {filtered.length === 0 && (
          <div className="ap__empty-card"><p>No contractors yet. Click "Add Contractor" to create one.</p></div>
        )}
        {paginated.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="ap__list-card">
            <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="ap__checkbox" />
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
              <button onClick={() => openEditModal(c)} className="ap__action-btn" title="Edit"><Pencil size={13} /></button>
              <button onClick={() => setDetailContractor(c)} className="ap__action-btn" title="View"><Eye size={13} /></button>
              {!c.is_active && (
                <button onClick={() => toggleActive(c)} className="ap__approve-btn"><ShieldCheck size={12} /> Approve</button>
              )}
              {c.is_active && (
                <button onClick={() => toggleActive(c)} className="ap__deactivate-btn">Deactivate</button>
              )}
              <button onClick={() => setConfirmDelete(c)} className="ap__action-btn ap__action-btn--danger" title="Delete"><Trash2 size={13} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !loading && setShowModal(false)} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={() => !loading && setShowModal(false)} className="ap__modal-close"><X size={16} /></button>

                {success ? (
                  <div className="ap__modal-success">
                    <div className="ap__modal-success-icon"><CheckCircle2 size={30} color="#4ade80" /></div>
                    <h3 className="ap__modal-success-title">Contractor Created!</h3>
                    <p className="ap__modal-success-text">{form.name} can now login with OTP</p>
                  </div>
                ) : (
                  <>
                    <h2 className="ap__modal-title">{editContractor ? 'Edit Contractor' : 'Add New Contractor'}</h2>
                    <p className="ap__modal-sub">{editContractor ? 'Update this contractor\'s details' : 'Contractor will login using phone + OTP'}</p>
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
                      {!editContractor && (
                        <div className="ap__info-box">
                          <p>💡 Contractor can login at <span className="ap__info-highlight">iconbuilderindia.com/login</span> using phone + OTP</p>
                        </div>
                      )}
                      <div className="ap__modal-actions">
                        <button onClick={() => setShowModal(false)} disabled={loading} className="ap__btn-cancel">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading || !form.name || form.phone.length < 10} className="ap__btn-submit">
                          {loading
                            ? <><div className="ap__spinner" />Saving...</>
                            : editContractor ? <><Pencil size={14} />Save Changes</> : <><UserPlus size={14} />Create Contractor</>}
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

      {/* Detail Modal */}
      <AnimatePresence>
        {detailContractor && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailContractor(null)} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={() => setDetailContractor(null)} className="ap__modal-close"><X size={16} /></button>
                <div className="ap__profile-avatar-lg"><HardHat size={26} color="#c9a84c" /></div>
                <h2 className="ap__modal-title" style={{ textAlign: 'center' }}>{detailContractor.name}</h2>
                <p className="ap__modal-sub" style={{ textAlign: 'center' }}>{detailContractor.role}</p>
                <div className="ap__info-box" style={{ marginTop: '0.5rem' }}>
                  <p>Phone: {detailContractor.phone}</p>
                  <p>Email: {detailContractor.email || '—'}</p>
                  <p>Status: {detailContractor.is_active ? 'Active' : 'Pending Approval'}</p>
                  <p>Joined: {new Date(detailContractor.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Remove "${confirmDelete?.name}"?`}
        message="This contractor will lose access to their dashboard."
        onConfirm={() => doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Remove ${selectedIds.size} contractor(s)?`}
        message="This action cannot be undone from here."
        onConfirm={bulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  )
}

// ── Portfolio Tab (public showcase projects + gallery uploads) ───────────────
function PortfolioTab() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [fetched, setFetched] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  const [pendingTarget, setPendingTarget] = useState(null)
  const [pendingFiles, setPendingFiles] = useState(null)
  const [galleryPreview, setGalleryPreview] = useState([])
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const [form, setForm] = useState({
    title: '', category: 'Villa', location: 'Bangalore', beds: '',
    area: '', budget: '', status: 'Planning', progress: 0,
    description: '', cover_image: null,
  })

  const fetchItems = async () => {
    try {
      const res = await api.get('/api/portfolio/admin/')
      setItems(res.data)
    } catch {
      toast.error('Failed to load portfolio projects')
    }
    setFetched(true)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const filtered = items.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    if (page > totalPages) setPage(totalPages)
  }, [filtered.length])

  const resetForm = () => setForm({
    title: '', category: 'Villa', location: 'Bangalore', beds: '',
    area: '', budget: '', status: 'Planning', progress: 0,
    description: '', cover_image: null,
  })

  const openAddModal = () => {
    resetForm()
    setCoverPreview(null)
    setEditItem(null)
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setForm({
      title: item.title || '', category: item.category || 'Villa', location: item.location || 'Bangalore',
      beds: item.beds || '', area: item.area || '', budget: item.budget || '', status: item.status || 'Planning',
      progress: item.progress || 0, description: item.description || '', cover_image: null,
    })
    setCoverPreview(item.cover_image || null)
    setEditItem(item)
    setShowModal(true)
  }

  const closeModal = () => {
    if (loading) return
    setShowModal(false)
    setEditItem(null)
    setCoverPreview(null)
  }


  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const MAX_MB = 5
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Cover image is too large. Max size is ${MAX_MB}MB — this file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`)
      e.target.value = ''
      return
    }
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setForm((p) => ({ ...p, cover_image: file || null }))
    setCoverPreview(file ? URL.createObjectURL(file) : null)
    e.target.value = ''   // ADD THIS — allows re-selecting the same file later
  }

  const handleSubmitPortfolio = async () => {
    if (!form.title.trim()) { toast.error('Enter a project title'); return }
    if (!form.area.trim() || !form.budget.trim()) { toast.error('Enter area and budget'); return }

    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== '') data.append(key, value)
      })

      if (editItem) {
        const res = await api.patch(`/api/portfolio/admin/${editItem.id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setItems((prev) => prev.map((p) => (p.id === editItem.id ? res.data : p)))
        toast.success(`"${form.title}" updated`)
      } else {
        const res = await api.post('/api/portfolio/admin/', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setItems((prev) => [res.data, ...prev])
        toast.success(`"${form.title}" added to portfolio`)
      }
      setShowModal(false)
      setEditItem(null)
      resetForm()
    } catch (err) {
      const data = err.response?.data
      const firstError = data?.detail
        || (data && Object.values(data)[0]?.[0])
        || `Failed to ${editItem ? 'update' : 'create'} project`
      toast.error(firstError)
    } finally {
      setLoading(false)
    }
  }

  const doDelete = async (project) => {
    try {
      await api.delete(`/api/portfolio/admin/${project.id}/`)
      setItems((prev) => prev.filter((p) => p.id !== project.id))
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setConfirmDelete(null)
    }
  }

  const togglePublished = async (project) => {
    try {
      const res = await api.patch(`/api/portfolio/admin/${project.id}/`, { is_published: !project.is_published })
      setItems((prev) => prev.map((p) => (p.id === project.id ? res.data : p)))
    } catch {
      toast.error('Failed to update project')
    }
  }

  const selectGalleryFiles = (e, project) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const MAX_MB = 5
    const oversized = Array.from(files).filter((f) => f.size > MAX_MB * 1024 * 1024)
    if (oversized.length > 0) {
      toast.error(`${oversized.length} photo(s) exceed the ${MAX_MB}MB limit. Please resize and try again.`)
      e.target.value = ''
      return
    }
    setPendingTarget(project.id)
    setPendingFiles(files)
    setGalleryPreview(Array.from(files).slice(0, 5).map((f) => URL.createObjectURL(f)))
  }


  const cancelGalleryPreview = () => {
    galleryPreview.forEach(url => URL.revokeObjectURL(url))
    setPendingTarget(null)
    setPendingFiles(null)
    setGalleryPreview([])
  }

  const confirmBulkUpload = async (project) => {
    if (!pendingFiles || pendingFiles.length === 0) return
    setUploading(true)
    try {
      const data = new FormData()
      Array.from(pendingFiles).forEach((file) => data.append('images', file))
      const res = await api.post(`/api/portfolio/admin/${project.id}/upload-images/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setItems((prev) => prev.map((p) => (p.id === project.id ? { ...p, image_count: res.data.total_images } : p)))
      toast.success(`Uploaded ${res.data.uploaded} images to "${project.title}"`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      cancelGalleryPreview()
    }
  }

  return (
    <div className="ap__stack">
      <div className="ap__toolbar">
        <div className="ap__search-wrap">
          <Search size={14} className="ap__search-icon" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search portfolio projects..." className="ap__search-input" />
        </div>
        <button onClick={openAddModal} className="ap__btn-gold">
          <Image size={14} /> Add Project
        </button>
      </div>

      <div className="ap__list-grid">
        {filtered.length === 0 && (
          <div className="ap__empty-card"><p>No portfolio projects yet. Click "Add Project" to create one.</p></div>
        )}
        {paginated.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="ap__list-card">
            <div className="ap__list-icon-box">
              {p.cover_image
                ? <img src={p.cover_image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.6rem' }} />
                : <Image size={18} color="#c9a84c" />}
            </div>
            <div className="ap__list-info">
              <p className="ap__list-name">{p.title}</p>
              <p className="ap__list-sub">{p.category} · {p.location} · {p.image_count} photos</p>
            </div>
            <div className="ap__list-detail ap__list-detail--sm">
              <p className="ap__list-detail-label">Budget</p>
              <p className="ap__list-detail-value">{p.budget}</p>
            </div>
            <div className="ap__row-actions">
              <StatusBadge status={p.status} />
              <button onClick={() => openEditModal(p)} className="ap__action-btn" title="Edit"><Pencil size={13} /></button>
              <button
                onClick={() => togglePublished(p)}
                className={p.is_published ? 'ap__deactivate-btn' : 'ap__approve-btn'}
                title={p.is_published ? 'Unpublish from site' : 'Publish to site'}
              >
                {p.is_published ? 'Unpublish' : 'Publish'}
              </button>

              <label className="ap__approve-btn" style={{ cursor: 'pointer' }}>
                <UploadCloud size={12} />
                {uploading && pendingTarget === p.id ? 'Uploading...' : 'Upload Photos'}
                <input
                  type="file" accept="image/*" multiple hidden
                  disabled={uploading}
                  onChange={(e) => selectGalleryFiles(e, p)}
                />
              </label>

              <button onClick={() => setConfirmDelete(p)} className="ap__action-btn ap__action-btn--danger" title="Delete">
                <Trash2 size={13} />
              </button>
            </div>

            {pendingTarget === p.id && (
              <div className="ap__upload-preview">
                {galleryPreview.map((src, idx) => <img key={idx} src={src} className="ap__preview-thumb" alt="" />)}
                {pendingFiles && pendingFiles.length > 5 && <span className="ap__preview-more">+{pendingFiles.length - 5} more</span>}
                <button onClick={() => confirmBulkUpload(p)} disabled={uploading} className="ap__btn-gold" style={{ padding: '0.4rem 0.8rem' }}>
                  {uploading ? 'Uploading...' : `Confirm Upload (${pendingFiles?.length || 0})`}
                </button>
                <button onClick={cancelGalleryPreview} disabled={uploading} className="ap__btn-cancel" style={{ flex: 'none', padding: '0.4rem 0.8rem' }}>
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={closeModal} className="ap__modal-close"><X size={16} /></button>

                <h2 className="ap__modal-title">{editItem ? 'Edit Portfolio Project' : 'Add Portfolio Project'}</h2>
                <p className="ap__modal-sub">This shows up on the public "Our Projects" section</p>

                <div className="ap__form-stack">
                  <div className="ap__form-group">
                    <label className="ap__form-label">Project Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Luxury Villa — Hoskote Bangalore"
                      className="ap__form-input"
                    />
                  </div>

                  <div className="ap__form-group">
                    <label className="ap__form-label">Category *</label>
                    <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="ap__form-input">
                      <option value="Villa">Villa</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Row House">Row House</option>
                      <option value="Plot">Plot</option>
                      <option value="Commercial">Commercial</option>  
                      <option value="Real Images">Real Images</option>
                    </select>
                  </div>

                  <div className="ap__form-group">
                    <label className="ap__form-label">Location</label>
                    <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="ap__form-input" />
                  </div>

                  <div className="ap__phone-row">
                    <div className="ap__form-group" style={{ flex: 1 }}>
                      <label className="ap__form-label">Beds (optional)</label>
                      <input type="number" value={form.beds} onChange={(e) => setForm((p) => ({ ...p, beds: e.target.value }))} placeholder="e.g. 4" className="ap__form-input" />
                    </div>
                    <div className="ap__form-group" style={{ flex: 1 }}>
                      <label className="ap__form-label">Area *</label>
                      <input value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))} placeholder="e.g. 3200 sqft" className="ap__form-input" />
                    </div>
                  </div>

                  <div className="ap__phone-row">
                    <div className="ap__form-group" style={{ flex: 1 }}>
                      <label className="ap__form-label">Budget *</label>
                      <input value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))} placeholder="e.g. ₹1.8 Cr" className="ap__form-input" />
                    </div>
                    <div className="ap__form-group" style={{ flex: 1 }}>
                      <label className="ap__form-label">Status</label>
                      <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="ap__form-input">
                        <option value="Planning">Planning</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="ap__form-group">
                    <label className="ap__form-label">Description</label>
                    <input
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Short description shown on the card"
                      className="ap__form-input"
                    />
                  </div>

                  <div className="ap__form-group">
                    <label className="ap__form-label">Cover Image (shown on the card)</label>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="ap__form-input" />
                    {coverPreview && <img src={coverPreview} alt="Cover preview" className="ap__cover-preview" />}
                  </div>

                  {!editItem && (
                    <div className="ap__info-box">
                      <p>💡 After creating the project, use <span className="ap__info-highlight">"Upload Photos"</span> on its card to add the full 200-300 image gallery.</p>
                    </div>
                  )}

                  <div className="ap__modal-actions">
                    <button onClick={closeModal} disabled={loading} className="ap__btn-cancel">Cancel</button>
                    <button onClick={handleSubmitPortfolio} disabled={loading} className="ap__btn-submit">
                      {loading
                        ? <><div className="ap__spinner" />{editItem ? 'Saving...' : 'Creating...'}</>
                        : editItem ? <><Pencil size={14} />Save Changes</> : <><Image size={14} />Create Project</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete "${confirmDelete?.title}"?`}
        message="This removes the project and all its gallery images."
        onConfirm={() => doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// ── Inquiries Tab ─────────────────────────────────────────────────────────────
const INQUIRY_TYPE_LABELS = {
  new_construction: 'New Construction',
  renovation: 'Renovation',
  commercial: 'Commercial',
  interior: 'Interior Design',
  other: 'Other',
}

const INQUIRY_STATUS_LABELS = {
  new: 'New',
  called: 'Called',
  converted: 'Converted',
  closed: 'Closed',
}

function InquiriesTab() {
  const [inquiries, setInquiries] = useState([])
  const [summary, setSummary] = useState({ total: 0, new: 0, called: 0, converted: 0, closed: 0 })
  const [fetched, setFetched] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [updating, setUpdating] = useState(null)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const fetchInquiries = async (statusFilter) => {
    try {
      const params = statusFilter && statusFilter !== 'All' ? `?status=${statusFilter}` : ''
      const res = await api.get(`/api/inquiries/${params}`)
      setInquiries(res.data.inquiries)
      setSummary(res.data.summary)
    } catch {
      toast.error('Failed to load inquiries')
    }
    setFetched(true)
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [activeFilter])

  const handleFilterClick = (label) => {
    setActiveFilter(label)
    setFetched(false)
    const statusValue = label === 'All' ? null : label.toLowerCase()
    fetchInquiries(statusValue)
  }

  const updateStatus = async (inquiry, newStatus) => {
    setUpdating(inquiry.id)
    try {
      const res = await api.patch(`/api/inquiries/${inquiry.id}/status/`, { status: newStatus })
      setInquiries((prev) => prev.map((i) => (i.id === inquiry.id ? res.data.inquiry : i)))
      setSummary((prev) => ({
        ...prev,
        [inquiry.status]: Math.max(0, prev[inquiry.status] - 1),
        [newStatus]: (prev[newStatus] || 0) + 1,
      }))
      toast.success(`${inquiry.name} marked as ${INQUIRY_STATUS_LABELS[newStatus]}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const doDelete = async (inquiry) => {
    try {
      await api.delete(`/api/inquiries/${inquiry.id}/`)
      setInquiries((prev) => prev.filter((i) => i.id !== inquiry.id))
      setSummary((prev) => ({ ...prev, total: Math.max(0, prev.total - 1), [inquiry.status]: Math.max(0, prev[inquiry.status] - 1) }))
      toast.success('Inquiry deleted')
    } catch {
      toast.error('Failed to delete inquiry')
    } finally {
      setConfirmDelete(null)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const bulkDelete = async () => {
    try {
      const toDelete = inquiries.filter(i => selectedIds.has(i.id))
      await Promise.all(toDelete.map((i) => api.delete(`/api/inquiries/${i.id}/`)))
      setInquiries((prev) => prev.filter((i) => !selectedIds.has(i.id)))
      setSummary((prev) => {
        const next = { ...prev, total: Math.max(0, prev.total - toDelete.length) }
        toDelete.forEach(i => { next[i.status] = Math.max(0, (next[i.status] || 0) - 1) })
        return next
      })
      toast.success(`${toDelete.length} inquiries deleted`)
      setSelectedIds(new Set())
    } catch {
      toast.error('Some deletions failed')
    } finally {
      setConfirmBulkDelete(false)
    }
  }

  const paginated = inquiries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(inquiries.length / PAGE_SIZE))
    if (page > totalPages) setPage(totalPages)
  }, [inquiries.length])

  return (
    <div className="ap__stack">
      <div className="ap__inquiry-header">
        <h3 className="ap__section-title">Lead Inquiries ({summary.total})</h3>
        <div className="ap__filter-pills">
          {['All', 'New', 'Called', 'Converted', 'Closed'].map((f) => (
            <button
              key={f}
              onClick={() => handleFilterClick(f)}
              className="ap__filter-pill"
              style={activeFilter === f ? { borderColor: 'rgba(201,168,76,0.4)', color: '#c9a84c' } : undefined}
            >
              {f} {f !== 'All' && `(${summary[f.toLowerCase()] ?? 0})`}
            </button>
          ))}
        </div>
      </div>

      <BulkActionBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        actions={<button onClick={() => setConfirmBulkDelete(true)} className="ap__deactivate-btn">Delete Selected</button>}
      />

      {fetched && inquiries.length === 0 && (
        <div className="ap__empty-card"><p>No inquiries in this view yet.</p></div>
      )}

      <div className="ap__stack ap__stack--tight">
        {paginated.map((inq, i) => (
          <motion.div key={inq.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="ap__inquiry-card">
            <div className="ap__inquiry-left">
              <input type="checkbox" checked={selectedIds.has(inq.id)} onChange={() => toggleSelect(inq.id)} className="ap__checkbox" style={{ marginTop: '0.3rem' }} />
              <div className="ap__inquiry-avatar">{inq.name[0].toUpperCase()}</div>
              <div>
                <p className="ap__list-name">{inq.name}</p>
                <p className="ap__list-sub">{inq.phone}{inq.city ? ` · ${inq.city}` : ''}</p>
                <div className="ap__inquiry-tags">
                  <span className="ap__tag">{INQUIRY_TYPE_LABELS[inq.inquiry_type] || inq.inquiry_type}</span>
                  {inq.plot_size && <span className="ap__tag">{inq.plot_size} sqft</span>}
                  <span className="ap__tag-muted">
                    {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>
            <div className="ap__row-actions">
              <select
                value={inq.status}
                onChange={(e) => updateStatus(inq, e.target.value)}
                disabled={updating === inq.id}
                className="ap__filter-pill"
                style={{ cursor: 'pointer', paddingRight: '0.5rem' }}
              >
                {Object.entries(INQUIRY_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <a href={`tel:${inq.phone}`} className="ap__call-btn">📞 Call</a>
              <a href={`https://wa.me/91${inq.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="ap__whatsapp-btn">WhatsApp</a>
              <button onClick={() => setConfirmDelete(inq)} className="ap__action-btn ap__action-btn--danger"><Trash2 size={13} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <Pagination page={page} totalItems={inquiries.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete inquiry from "${confirmDelete?.name}"?`}
        onConfirm={() => doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${selectedIds.size} inquiries?`}
        onConfirm={bulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  )
}

// ── Estimator Tab (admin-managed cities, tiers, add-ons, construction types) ──

const EST_SUBTABS = [
  { id: 'cities', label: 'Cities & Rates' },
  { id: 'tiers', label: 'Quality Tiers' },
  { id: 'addons', label: 'Add-ons' },
  { id: 'types', label: 'Construction Types' },
  { id: 'floors', label: 'Floor Options' },
]

// Generic inline-edit row: click a value to edit it directly, Enter/blur saves.
function InlineNumber({ value, onSave, prefix = '₹', suffix = '' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)

  useEffect(() => { setVal(value) }, [value])

  const commit = () => {
    setEditing(false)
    if (Number(val) !== Number(value) && val !== '') onSave(Number(val))
    else setVal(value)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="ap__action-btn"
        style={{ width: 'auto', padding: '0.35rem 0.75rem', color: '#c9a84c', fontWeight: 700 }}
        title="Click to edit"
      >
        {prefix}{Number(value).toLocaleString('en-IN')}{suffix}
      </button>
    )
  }
  return (
    <input
      autoFocus
      type="number"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value); setEditing(false) } }}
      className="ap__form-input"
      style={{ width: '8rem', padding: '0.4rem 0.6rem' }}
    />
  )
}


function TierSpecsEditor({ tier, onClose }) {
  const [specs, setSpecs] = useState([])
  const [fetched, setFetched] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesFetched, setCategoriesFetched] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [itemLabel, setItemLabel] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchSpecs = async () => {
    try {
      const res = await api.get(`/api/estimator/admin/quality-tiers/${tier.id}/specs/`)
      setSpecs(res.data)
    } catch {
      toast.error('Failed to load tier items')
    }
    setFetched(true)
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/estimator/admin/spec-categories/')
      setCategories(res.data)
    } catch {
      toast.error('Failed to load categories')
    }
    setCategoriesFetched(true)
  }

  useEffect(() => {
    fetchSpecs()
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createCategory = async () => {
    if (!newCategoryName.trim()) { toast.error('Enter a category name'); return }
    setAddingCategory(true)
    try {
      const res = await api.post('/api/estimator/admin/spec-categories/', {
        name: newCategoryName.trim(), order: categories.length,
      })
      setCategories((prev) => [...prev, res.data])
      setSelectedCategory(String(res.data.id))
      setNewCategoryName('')
      toast.success(`Category "${res.data.name}" added`)
    } catch (err) {
      toast.error(err.response?.data?.name?.[0] || 'Failed to add category')
    } finally {
      setAddingCategory(false)
    }
  }

  const addSpec = async () => {
    if (!selectedCategory) { toast.error('Select a category'); return }
    if (!itemLabel.trim()) { toast.error('Enter an item'); return }
    setSaving(true)
    try {
      const res = await api.post(`/api/estimator/admin/quality-tiers/${tier.id}/specs/`, {
        category: Number(selectedCategory),
        item_label: itemLabel.trim(),
      })
      // Backend upserts on (tier, category) — replace if it already existed, else append
      setSpecs((prev) => {
        const exists = prev.some((s) => s.category_name === res.data.category_name)
        return exists
          ? prev.map((s) => (s.category_name === res.data.category_name ? res.data : s))
          : [...prev, res.data]
      })
      setItemLabel('')
      toast.success('Item saved')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  const removeSpec = async (specId) => {
    try {
      await api.delete(`/api/estimator/admin/tier-specs/${specId}/`)
      setSpecs((prev) => prev.filter((s) => s.id !== specId))
    } catch {
      toast.error('Failed to remove item')
    }
  }

  return (
    <div className="ap__list-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="ap__list-name">{tier.label} — Included Items</p>
        <button onClick={onClose} className="ap__action-btn"><X size={13} /></button>
      </div>

      {specs.length === 0 && fetched && (
        <p style={{ color: '#8fa3b8', fontSize: '0.8rem' }}>No items yet — add flooring, paint, fittings, etc.</p>
      )}
      {specs.map((s) => (
        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <span><span style={{ color: '#5f7285' }}>{s.category_name}</span> — <span style={{ color: '#e8d5a3' }}>{s.item_label}</span></span>
          <button onClick={() => removeSpec(s.id)} className="ap__action-btn ap__action-btn--danger"><Trash2 size={12} /></button>
        </div>
      ))}

      <div className="ap__phone-row">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="ap__form-input"
          style={{ flex: 1 }}
        >
          <option value="">{categoriesFetched ? 'Select category' : 'Loading...'}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input
          value={itemLabel}
          onChange={(e) => setItemLabel(e.target.value)}
          placeholder="Item (e.g. Vitrified tiles)"
          className="ap__form-input"
          style={{ flex: 1 }}
        />
        <button onClick={addSpec} disabled={saving} className="ap__btn-gold" style={{ padding: '0 0.9rem' }}>
          <Plus size={14} />
        </button>
      </div>

      <div className="ap__phone-row">
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category (e.g. Windows)"
          className="ap__form-input"
          style={{ flex: 1 }}
        />
        <button onClick={createCategory} disabled={addingCategory} className="ap__btn-cancel" style={{ flex: 'none', padding: '0 0.9rem' }}>
          + Category
        </button>
      </div>
    </div>
  )
}


// ── Cities & Rates ──────────────────────────────────────────────────────────
function EstimatorCitiesPanel() {
  const [cities, setCities] = useState([])
  const [fetched, setFetched] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editCity, setEditCity] = useState(null)
  const [form, setForm] = useState({ name: '', rate_per_sqft: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchCities = async () => {
    try {
      const res = await api.get('/api/estimator/admin/cities/')
      setCities(res.data)
    } catch {
      toast.error('Failed to load cities')
    }
    setFetched(true)
  }

  useEffect(() => { fetchCities() }, [])

  const openAdd = () => { setForm({ name: '', rate_per_sqft: '' }); setEditCity(null); setShowModal(true) }
  const openEdit = (c) => { setForm({ name: c.name, rate_per_sqft: c.rate_per_sqft }); setEditCity(c); setShowModal(true) }

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Enter a city name'); return }
    if (!form.rate_per_sqft) { toast.error('Enter a rate per sq.ft'); return }
    setLoading(true)
    try {
      if (editCity) {
        const res = await api.patch(`/api/estimator/admin/cities/${editCity.id}/`, {
          name: form.name.trim(), rate_per_sqft: Number(form.rate_per_sqft),
        })
        setCities((prev) => prev.map((c) => (c.id === editCity.id ? res.data : c)))
        toast.success(`${form.name} updated`)
      } else {
        const res = await api.post('/api/estimator/admin/cities/', {
          name: form.name.trim(), rate_per_sqft: Number(form.rate_per_sqft), is_active: true, order: cities.length,
        })
        setCities((prev) => [...prev, res.data])
        toast.success(`${form.name} added`)
      }
      setShowModal(false)
      setEditCity(null)
    } catch (err) {
      const msg = err.response?.data?.name?.[0]
        || err.response?.data?.detail
        || Object.values(err.response?.data || {})[0]?.[0]
        || 'Failed to save city'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const updateRate = async (city, newRate) => {
    try {
      const res = await api.patch(`/api/estimator/admin/cities/${city.id}/`, { rate_per_sqft: newRate })
      setCities((prev) => prev.map((c) => (c.id === city.id ? res.data : c)))
      toast.success(`${city.name} rate updated to ₹${newRate}/sq.ft`)
    } catch {
      toast.error('Failed to update rate')
    }
  }

  const toggleActive = async (city) => {
    try {
      const res = await api.patch(`/api/estimator/admin/cities/${city.id}/`, { is_active: !city.is_active })
      setCities((prev) => prev.map((c) => (c.id === city.id ? res.data : c)))
    } catch {
      toast.error('Failed to update city')
    }
  }

  const doDelete = async (city) => {
    try {
      await api.delete(`/api/estimator/admin/cities/${city.id}/`)
      setCities((prev) => prev.filter((c) => c.id !== city.id))
      toast.success(`${city.name} removed`)
    } catch {
      toast.error('Failed to remove city')
    } finally {
      setConfirmDelete(null)
    }
  }

  return (
    <div className="ap__stack ap__stack--tight">
      <div className="ap__toolbar">
        <p style={{ color: '#8fa3b8', fontSize: '0.8rem', margin: 0, flex: 1 }}>
          Click any rate to edit it inline. Changes apply to the public estimator immediately.
        </p>
        <button onClick={openAdd} className="ap__btn-gold"><MapPin size={14} /> Add City</button>
      </div>

      <div className="ap__list-grid">
        {fetched && cities.length === 0 && (
          <div className="ap__empty-card"><p>No cities yet. Click "Add City" to create one.</p></div>
        )}
        {cities.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="ap__list-card">
            <div className="ap__list-icon-box"><MapPin size={16} color="#c9a84c" /></div>
            <div className="ap__list-info">
              <p className="ap__list-name">{c.name}</p>
              <p className="ap__list-sub">Base construction rate</p>
            </div>
            <InlineNumber value={c.rate_per_sqft} suffix="/sq.ft" onSave={(v) => updateRate(c, v)} />
            <div className="ap__row-actions">
              <StatusBadge status={c.is_active ? 'Active' : 'Inactive'} />
              <button onClick={() => openEdit(c)} className="ap__action-btn" title="Edit name"><Pencil size={13} /></button>
              <button
                onClick={() => toggleActive(c)}
                className={c.is_active ? 'ap__deactivate-btn' : 'ap__approve-btn'}
              >
                {c.is_active ? 'Hide' : 'Show'}
              </button>
              <button onClick={() => setConfirmDelete(c)} className="ap__action-btn ap__action-btn--danger" title="Delete"><Trash2 size={13} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !loading && setShowModal(false)} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={() => !loading && setShowModal(false)} className="ap__modal-close"><X size={16} /></button>
                <h2 className="ap__modal-title">{editCity ? 'Edit City' : 'Add New City'}</h2>
                <p className="ap__modal-sub">Sets the base ₹/sq.ft rate the whole estimate is calculated from</p>
                <div className="ap__form-stack">
                  <div className="ap__form-group">
                    <label className="ap__form-label">City Name *</label>
                    <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Hyderabad" className="ap__form-input" />
                  </div>
                  <div className="ap__form-group">
                    <label className="ap__form-label">Rate per sq.ft (₹) *</label>
                    <input type="number" value={form.rate_per_sqft} onChange={(e) => setForm((p) => ({ ...p, rate_per_sqft: e.target.value }))} placeholder="e.g. 1800" className="ap__form-input" />
                  </div>
                  <div className="ap__modal-actions">
                    <button onClick={() => setShowModal(false)} disabled={loading} className="ap__btn-cancel">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="ap__btn-submit">
                      {loading ? <><div className="ap__spinner" />Saving...</> : editCity ? <><Pencil size={14} />Save Changes</> : <><Plus size={14} />Add City</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete "${confirmDelete?.name}"?`}
        message="This removes it from the estimator. Existing estimates already given to customers aren't affected."
        onConfirm={() => doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// ── Quality Tiers ────────────────────────────────────────────────────────────
function EstimatorTiersPanel() {
  const [tiers, setTiers] = useState([])
  const [fetched, setFetched] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editTier, setEditTier] = useState(null)
  const [form, setForm] = useState({ key: '', label: '', multiplier: '', description: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedTier, setExpandedTier] = useState(null)

  const fetchTiers = async () => {
    try {
      const res = await api.get('/api/estimator/admin/quality-tiers/')
      setTiers(res.data)
    } catch {
      toast.error('Failed to load quality tiers')
    }
    setFetched(true)
  }

  useEffect(() => { fetchTiers() }, [])

  const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

  const openAdd = () => { setForm({ key: '', label: '', multiplier: '', description: '' }); setEditTier(null); setShowModal(true) }
  const openEdit = (t) => { setForm({ key: t.key, label: t.label, multiplier: t.multiplier, description: t.description }); setEditTier(t); setShowModal(true) }

  const handleSubmit = async () => {
    if (!form.label.trim()) { toast.error('Enter a tier name'); return }
    if (!form.multiplier) { toast.error('Enter a multiplier'); return }
    const multiplierNum = Number(form.multiplier)
    if (isNaN(multiplierNum) || multiplierNum <= 0 || multiplierNum > 5) {
      toast.error('Multiplier should be between 0 and 5 (e.g. 1.30)')
      return
    }
    setLoading(true)
    try {
      const payload = { label: form.label.trim(), multiplier: Number(form.multiplier), description: form.description.trim() }
      if (editTier) {
        const res = await api.patch(`/api/estimator/admin/quality-tiers/${editTier.id}/`, payload)
        setTiers((prev) => prev.map((t) => (t.id === editTier.id ? res.data : t)))
        toast.success(`${form.label} updated`)
      } else {
        const res = await api.post('/api/estimator/admin/quality-tiers/', { ...payload, key: slugify(form.label), is_active: true, order: tiers.length })
        setTiers((prev) => [...prev, res.data])
        toast.success(`${form.label} added — open it in Django admin to set included items (flooring, paint, etc.)`)
      }
      setShowModal(false)
      setEditTier(null)
    } catch (err) {
      toast.error(err.response?.data?.key?.[0] || err.response?.data?.detail || 'Failed to save tier')
    } finally {
      setLoading(false)
    }
  }

  const doDelete = async (tier) => {
    try {
      await api.delete(`/api/estimator/admin/quality-tiers/${tier.id}/`)
      setTiers((prev) => prev.filter((t) => t.id !== tier.id))
      toast.success(`${tier.label} removed`)
    } catch {
      toast.error('Failed to remove tier')
    } finally {
      setConfirmDelete(null)
    }
  }

  return (
    <div className="ap__stack ap__stack--tight">
      <div className="ap__toolbar">
        <p style={{ color: '#8fa3b8', fontSize: '0.8rem', margin: 0, flex: 1 }}>
          Multiplier is applied on top of the city's base rate (1.30 = 30% more expensive). Included items per tier (flooring, paint...) are still managed in Django admin.
        </p>
        <button onClick={openAdd} className="ap__btn-gold"><Plus size={14} /> Add Tier</button>
      </div>

      <div className="ap__list-grid">
        {fetched && tiers.length === 0 && <div className="ap__empty-card"><p>No quality tiers yet.</p></div>}
        {tiers.map((t) => (
          <div key={t.id}>
            <div className="ap__list-card">
              <div className="ap__list-info">
                <p className="ap__list-name">{t.label} <span style={{ color: '#c9a84c' }}>×{t.multiplier}</span></p>
                <p className="ap__list-sub">{t.description || 'No description'}</p>
              </div>
              <div className="ap__row-actions">
                <button
                  onClick={() => setExpandedTier(expandedTier === t.id ? null : t.id)}
                  className="ap__approve-btn"
                >
                  {expandedTier === t.id ? 'Hide Items' : 'Manage Items'}
                </button>
                <button onClick={() => openEdit(t)} className="ap__action-btn" title="Edit"><Pencil size={13} /></button>
                <button onClick={() => setConfirmDelete(t)} className="ap__action-btn ap__action-btn--danger" title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
            {expandedTier === t.id && (
              <TierSpecsEditor tier={t} onClose={() => setExpandedTier(null)} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !loading && setShowModal(false)} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={() => !loading && setShowModal(false)} className="ap__modal-close"><X size={16} /></button>
                <h2 className="ap__modal-title">{editTier ? 'Edit Quality Tier' : 'Add Quality Tier'}</h2>
                <div className="ap__form-stack">
                  <div className="ap__form-group">
                    <label className="ap__form-label">Tier Name *</label>
                    <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="e.g. Premium" className="ap__form-input" />
                  </div>
                  <div className="ap__form-group">
                    <label className="ap__form-label">
                      Multiplier * <span style={{ color: '#5f7285', fontWeight: 400, textTransform: 'none' }}>(1.00 = same price as Basic, 1.30 = 30% more expensive)</span>
                    </label>
                    <input type="number" step="0.01" value={form.multiplier} onChange={(e) => setForm((p) => ({ ...p, multiplier: e.target.value }))} placeholder="e.g. 1.30 for 30% pricier" className="ap__form-input" />
                  </div>
                  <div className="ap__form-group">
                    <label className="ap__form-label">Description</label>
                    <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="e.g. Designer finish, modular interiors" className="ap__form-input" />
                  </div>
                  <div className="ap__modal-actions">
                    <button onClick={() => setShowModal(false)} disabled={loading} className="ap__btn-cancel">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="ap__btn-submit">
                      {loading ? <><div className="ap__spinner" />Saving...</> : editTier ? <><Pencil size={14} />Save Changes</> : <><Plus size={14} />Add Tier</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete "${confirmDelete?.label}"?`}
        message="Any tier spec items (flooring/paint/etc.) under this tier are deleted too."
        onConfirm={() => doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// ── Add-ons ───────────────────────────────────────────────────────────────────
function EstimatorAddOnsPanel() {
  const [addOns, setAddOns] = useState([])
  const [fetched, setFetched] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editAddOn, setEditAddOn] = useState(null)
  const [form, setForm] = useState({ label: '', pricingMode: 'flat', cost: '', cost_per_sqft: '', icon: 'sparkles' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchAddOns = async () => {
    try {
      const res = await api.get('/api/estimator/admin/add-ons/')
      setAddOns(res.data)
    } catch {
      toast.error('Failed to load add-ons')
    }
    setFetched(true)
  }

  useEffect(() => { fetchAddOns() }, [])

  const openAdd = () => { setForm({ label: '', pricingMode: 'flat', cost: '', cost_per_sqft: '', icon: 'sparkles' }); setEditAddOn(null); setShowModal(true) }
  const openEdit = (a) => {
    setForm({
      label: a.label,
      pricingMode: a.cost_per_sqft ? 'per_sqft' : 'flat',
      cost: a.cost || '',
      cost_per_sqft: a.cost_per_sqft || '',
      icon: a.icon,
    })
    setEditAddOn(a)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.label.trim()) { toast.error('Enter an add-on name'); return }
    const usingFlat = form.pricingMode === 'flat'
    if (usingFlat && !form.cost) { toast.error('Enter a flat cost'); return }
    if (!usingFlat && !form.cost_per_sqft) { toast.error('Enter a cost per sq.ft'); return }

    setLoading(true)
    try {
      const payload = {
        label: form.label.trim(),
        icon: form.icon,
        cost: usingFlat ? Number(form.cost) : null,
        cost_per_sqft: usingFlat ? null : Number(form.cost_per_sqft),
      }
      if (editAddOn) {
        const res = await api.patch(`/api/estimator/admin/add-ons/${editAddOn.id}/`, payload)
        setAddOns((prev) => prev.map((a) => (a.id === editAddOn.id ? res.data : a)))
        toast.success(`${form.label} updated`)
      } else {
        const res = await api.post('/api/estimator/admin/add-ons/', { ...payload, is_active: true, order: addOns.length })
        setAddOns((prev) => [...prev, res.data])
        toast.success(`${form.label} added`)
      }
      setShowModal(false)
      setEditAddOn(null)
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Failed to save add-on')
    } finally {
      setLoading(false)
    }
  }

  const doDelete = async (addOn) => {
    try {
      await api.delete(`/api/estimator/admin/add-ons/${addOn.id}/`)
      setAddOns((prev) => prev.filter((a) => a.id !== addOn.id))
      toast.success(`${addOn.label} removed`)
    } catch {
      toast.error('Failed to remove add-on')
    } finally {
      setConfirmDelete(null)
    }
  }

  return (
    <div className="ap__stack ap__stack--tight">
      <div className="ap__toolbar">
        <p style={{ color: '#8fa3b8', fontSize: '0.8rem', margin: 0, flex: 1 }}>
          Flat cost = fixed ₹ regardless of plot size. Cost per sq.ft scales with the project.
        </p>
        <button onClick={openAdd} className="ap__btn-gold"><Plus size={14} /> Add Add-on</button>
      </div>

      <div className="ap__list-grid">
        {fetched && addOns.length === 0 && <div className="ap__empty-card"><p>No add-ons yet.</p></div>}
        {addOns.map((a) => (
          <div key={a.id} className="ap__list-card">
            <div className="ap__list-info">
              <p className="ap__list-name">{a.label}</p>
              <p className="ap__list-sub">
                {a.cost_per_sqft ? `₹${a.cost_per_sqft}/sq.ft` : `₹${Number(a.cost).toLocaleString('en-IN')} flat`}
              </p>
            </div>
            <div className="ap__row-actions">
              <button onClick={() => openEdit(a)} className="ap__action-btn" title="Edit"><Pencil size={13} /></button>
              <button onClick={() => setConfirmDelete(a)} className="ap__action-btn ap__action-btn--danger" title="Delete"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !loading && setShowModal(false)} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={() => !loading && setShowModal(false)} className="ap__modal-close"><X size={16} /></button>
                <h2 className="ap__modal-title">{editAddOn ? 'Edit Add-on' : 'Add New Add-on'}</h2>
                <div className="ap__form-stack">
                  <div className="ap__form-group">
                    <label className="ap__form-label">Add-on Name *</label>
                    <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="e.g. Swimming Pool" className="ap__form-input" />
                  </div>
                  <div className="ap__form-group">
                    <label className="ap__form-label">Pricing Type</label>
                    <select value={form.pricingMode} onChange={(e) => setForm((p) => ({ ...p, pricingMode: e.target.value }))} className="ap__form-input">
                      <option value="flat">Flat cost (₹)</option>
                      <option value="per_sqft">Cost per sq.ft (₹)</option>
                    </select>
                  </div>
                  {form.pricingMode === 'flat' ? (
                    <div className="ap__form-group">
                      <label className="ap__form-label">Flat Cost (₹) *</label>
                      <input type="number" value={form.cost} onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))} placeholder="e.g. 800000" className="ap__form-input" />
                    </div>
                  ) : (
                    <div className="ap__form-group">
                      <label className="ap__form-label">Cost per sq.ft (₹) *</label>
                      <input type="number" value={form.cost_per_sqft} onChange={(e) => setForm((p) => ({ ...p, cost_per_sqft: e.target.value }))} placeholder="e.g. 350" className="ap__form-input" />
                    </div>
                  )}
                  <div className="ap__form-group">
                    <label className="ap__form-label">Icon</label>
                    <select value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} className="ap__form-input">
                      <option value="wrench">Wrench</option>
                      <option value="sparkles">Sparkles</option>
                    </select>
                  </div>
                  <div className="ap__modal-actions">
                    <button onClick={() => setShowModal(false)} disabled={loading} className="ap__btn-cancel">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="ap__btn-submit">
                      {loading ? <><div className="ap__spinner" />Saving...</> : editAddOn ? <><Pencil size={14} />Save Changes</> : <><Plus size={14} />Add</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete "${confirmDelete?.label}"?`}
        onConfirm={() => doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// ── Construction Types ────────────────────────────────────────────────────────
function EstimatorTypesPanel() {
  const [types, setTypes] = useState([])
  const [fetched, setFetched] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editType, setEditType] = useState(null)
  const [form, setForm] = useState({ label: '', adjustment_factor: '', icon: 'building' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchTypes = async () => {
    try {
      const res = await api.get('/api/estimator/admin/construction-types/')
      setTypes(res.data)
    } catch {
      toast.error('Failed to load construction types')
    }
    setFetched(true)
  }

  useEffect(() => { fetchTypes() }, [])

  const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

  const openAdd = () => { setForm({ label: '', adjustment_factor: '', icon: 'building' }); setEditType(null); setShowModal(true) }
  const openEdit = (t) => { setForm({ label: t.label, adjustment_factor: t.adjustment_factor, icon: t.icon }); setEditType(t); setShowModal(true) }

  const handleSubmit = async () => {
    if (!form.label.trim()) { toast.error('Enter a type name'); return }
    if (!form.adjustment_factor) { toast.error('Enter an adjustment factor'); return }
    const factorNum = Number(form.adjustment_factor)
    if (isNaN(factorNum) || factorNum <= 0 || factorNum > 5) {
      toast.error('Adjustment factor should be between 0 and 5 (e.g. 1.15)')
      return
    }
    setLoading(true)
    try {
      const payload = { label: form.label.trim(), adjustment_factor: Number(form.adjustment_factor), icon: form.icon }
      if (editType) {
        const res = await api.patch(`/api/estimator/admin/construction-types/${editType.id}/`, payload)
        setTypes((prev) => prev.map((t) => (t.id === editType.id ? res.data : t)))
        toast.success(`${form.label} updated`)
      } else {
        const res = await api.post('/api/estimator/admin/construction-types/', { ...payload, key: slugify(form.label), is_active: true, order: types.length })
        setTypes((prev) => [...prev, res.data])
        toast.success(`${form.label} added`)
      }
      setShowModal(false)
      setEditType(null)
    } catch (err) {
      toast.error(err.response?.data?.key?.[0] || err.response?.data?.detail || 'Failed to save type')
    } finally {
      setLoading(false)
    }
  }

  const doDelete = async (t) => {
    try {
      await api.delete(`/api/estimator/admin/construction-types/${t.id}/`)
      setTypes((prev) => prev.filter((x) => x.id !== t.id))
      toast.success(`${t.label} removed`)
    } catch {
      toast.error('Failed to remove type')
    } finally {
      setConfirmDelete(null)
    }
  }

  return (
    <div className="ap__stack ap__stack--tight">
      <div className="ap__toolbar">
        <p style={{ color: '#8fa3b8', fontSize: '0.8rem', margin: 0, flex: 1 }}>
          Adjustment factor: 1.00 = no change, 1.15 = 15% more expensive than standard residential.
        </p>
        <button onClick={openAdd} className="ap__btn-gold"><Plus size={14} /> Add Type</button>
      </div>

      <div className="ap__list-grid">
        {fetched && types.length === 0 && <div className="ap__empty-card"><p>No construction types yet.</p></div>}
        {types.map((t) => (
          <div key={t.id} className="ap__list-card">
            <div className="ap__list-info">
              <p className="ap__list-name">{t.label} <span style={{ color: '#c9a84c' }}>×{t.adjustment_factor}</span></p>
            </div>
            <div className="ap__row-actions">
              <button onClick={() => openEdit(t)} className="ap__action-btn" title="Edit"><Pencil size={13} /></button>
              <button onClick={() => setConfirmDelete(t)} className="ap__action-btn ap__action-btn--danger" title="Delete"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !loading && setShowModal(false)} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={() => !loading && setShowModal(false)} className="ap__modal-close"><X size={16} /></button>
                <h2 className="ap__modal-title">{editType ? 'Edit Construction Type' : 'Add Construction Type'}</h2>
                <div className="ap__form-stack">
                  <div className="ap__form-group">
                    <label className="ap__form-label">Type Name *</label>
                    <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="e.g. Villa" className="ap__form-input" />
                  </div>
                  <div className="ap__form-group">
                    <label className="ap__form-label">
                      Adjustment Factor * <span style={{ color: '#5f7285', fontWeight: 400, textTransform: 'none' }}>(1.00 = no change, 1.15 = 15% more expensive)</span>
                    </label>
                    <input type="number" step="0.01" value={form.adjustment_factor} onChange={(e) => setForm((p) => ({ ...p, adjustment_factor: e.target.value }))} placeholder="e.g. 1.15 for 15% pricier" className="ap__form-input" />
                  </div>
                  <div className="ap__form-group">
                    <label className="ap__form-label">Icon</label>
                    <select value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} className="ap__form-input">
                      <option value="home">Home</option>
                      <option value="building">Building</option>
                      <option value="layers">Layers</option>
                    </select>
                  </div>
                  <div className="ap__modal-actions">
                    <button onClick={() => setShowModal(false)} disabled={loading} className="ap__btn-cancel">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="ap__btn-submit">
                      {loading ? <><div className="ap__spinner" />Saving...</> : editType ? <><Pencil size={14} />Save Changes</> : <><Plus size={14} />Add</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete "${confirmDelete?.label}"?`}
        onConfirm={() => doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// ── Floor Options ─────────────────────────────────────────────────────────
function EstimatorFloorsPanel() {
  const [floorOptions, setFloorOptions] = useState([])
  const [fetched, setFetched] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editFloor, setEditFloor] = useState(null)
  const [form, setForm] = useState({ label: '', floor_count: '', multiplier: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchFloorOptions = async () => {
    try {
      const res = await api.get('/api/estimator/admin/floor-options/')
      setFloorOptions(res.data)
    } catch {
      toast.error('Failed to load floor options')
    }
    setFetched(true)
  }

  useEffect(() => { fetchFloorOptions() }, [])

  const openAdd = () => { setForm({ label: '', floor_count: '', multiplier: '' }); setEditFloor(null); setShowModal(true) }
  const openEdit = (f) => { setForm({ label: f.label, floor_count: f.floor_count, multiplier: f.multiplier }); setEditFloor(f); setShowModal(true) }

  const handleSubmit = async () => {
    if (!form.label.trim()) { toast.error('Enter a label'); return }
    if (!form.floor_count) { toast.error('Enter a floor count'); return }
    if (!form.multiplier) { toast.error('Enter a multiplier'); return }
    const multiplierNum = Number(form.multiplier)
    if (isNaN(multiplierNum) || multiplierNum <= 0 || multiplierNum > 5) {
      toast.error('Multiplier should be between 0 and 5 (e.g. 1.82)')
      return
    }
    setLoading(true)
    try {
      const payload = {
        label: form.label.trim(),
        floor_count: Number(form.floor_count),
        multiplier: Number(form.multiplier),
      }
      if (editFloor) {
        const res = await api.patch(`/api/estimator/admin/floor-options/${editFloor.id}/`, payload)
        setFloorOptions((prev) => prev.map((f) => (f.id === editFloor.id ? res.data : f)))
        toast.success(`${form.label} updated`)
      } else {
        const res = await api.post('/api/estimator/admin/floor-options/', { ...payload, is_active: true, order: floorOptions.length })
        setFloorOptions((prev) => [...prev, res.data])
        toast.success(`${form.label} added`)
      }
      setShowModal(false)
      setEditFloor(null)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save floor option')
    } finally {
      setLoading(false)
    }
  }

  const doDelete = async (f) => {
    try {
      await api.delete(`/api/estimator/admin/floor-options/${f.id}/`)
      setFloorOptions((prev) => prev.filter((x) => x.id !== f.id))
      toast.success(`${f.label} removed`)
    } catch {
      toast.error('Failed to remove floor option')
    } finally {
      setConfirmDelete(null)
    }
  }

  return (
    <div className="ap__stack ap__stack--tight">
      <div className="ap__toolbar">
        <p style={{ color: '#8fa3b8', fontSize: '0.8rem', margin: 0, flex: 1 }}>
          Multiplier is applied on top of city + tier cost. Floor count feeds the timeline formula too.
        </p>
        <button onClick={openAdd} className="ap__btn-gold"><Plus size={14} /> Add Floor Option</button>
      </div>

      <div className="ap__list-grid">
        {fetched && floorOptions.length === 0 && <div className="ap__empty-card"><p>No floor options yet.</p></div>}
        {floorOptions.map((f) => (
          <div key={f.id} className="ap__list-card">
            <div className="ap__list-info">
              <p className="ap__list-name">{f.label} <span style={{ color: '#c9a84c' }}>×{f.multiplier}</span></p>
              <p className="ap__list-sub">Floor count: {f.floor_count}</p>
            </div>
            <div className="ap__row-actions">
              <button onClick={() => openEdit(f)} className="ap__action-btn" title="Edit"><Pencil size={13} /></button>
              <button onClick={() => setConfirmDelete(f)} className="ap__action-btn ap__action-btn--danger" title="Delete"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !loading && setShowModal(false)} className="ap__modal-overlay" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ap__modal-wrap">
              <div className="ap__modal">
                <button onClick={() => !loading && setShowModal(false)} className="ap__modal-close"><X size={16} /></button>
                <h2 className="ap__modal-title">{editFloor ? 'Edit Floor Option' : 'Add Floor Option'}</h2>
                <div className="ap__form-stack">
                  <div className="ap__form-group">
                    <label className="ap__form-label">Label *</label>
                    <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="e.g. G+1" className="ap__form-input" />
                  </div>
                  <div className="ap__form-group">
                    <label className="ap__form-label">Floor Count *</label>
                    <input type="number" value={form.floor_count} onChange={(e) => setForm((p) => ({ ...p, floor_count: e.target.value }))} placeholder="e.g. 2" className="ap__form-input" />
                  </div>
                  <div className="ap__form-group">
                    <label className="ap__form-label">
                      Multiplier * <span style={{ color: '#5f7285', fontWeight: 400, textTransform: 'none' }}>(1.00 = ground floor only, 1.82 = 82% more for this many floors)</span>
                    </label>
                    <input type="number" step="0.01" value={form.multiplier} onChange={(e) => setForm((p) => ({ ...p, multiplier: e.target.value }))} placeholder="e.g. 1.82 for G+1" className="ap__form-input" />
                  </div>                  
                  <div className="ap__modal-actions">
                    <button onClick={() => setShowModal(false)} disabled={loading} className="ap__btn-cancel">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="ap__btn-submit">
                      {loading ? <><div className="ap__spinner" />Saving...</> : editFloor ? <><Pencil size={14} />Save Changes</> : <><Plus size={14} />Add</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete "${confirmDelete?.label}"?`}
        onConfirm={() => doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// ── Wrapper with sub-tab pills ────────────────────────────────────────────────
function EstimatorConfigTab() {
  const [subTab, setSubTab] = useState('cities')

  const PANELS = {
    cities: <EstimatorCitiesPanel />,
    tiers: <EstimatorTiersPanel />,
    addons: <EstimatorAddOnsPanel />,
    types: <EstimatorTypesPanel />,
    floors: <EstimatorFloorsPanel />,
  }

  return (
    <div className="ap__stack">
      <div className="ap__filter-pills">
        {EST_SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className="ap__filter-pill"
            style={subTab === t.id ? { borderColor: 'rgba(201,168,76,0.4)', color: '#c9a84c' } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>
      {PANELS[subTab]}
    </div>
  )
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState(null)
  const [fetched, setFetched] = useState(false)

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/projects/analytics/')
      setData(res.data)
    } catch {
      toast.error('Failed to load analytics')
    }
    setFetched(true)
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const formatINR = (value) => {
    if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`
    if (value >= 1e5) return `₹${(value / 1e5).toFixed(0)}L`
    return `₹${Number(value).toLocaleString('en-IN')}`
  }

  const CATEGORY_COLORS = ['#c9a84c', '#60a5fa', '#a78bfa', '#4ade80', '#fb923c']

  if (!fetched || !data) {
    return <p style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>Loading analytics...</p>
  }

  const SUMMARY = [
    { label: 'Total Revenue',     value: formatINR(data.summary.total_revenue),     sub: 'All time',          color: '#c9a84c' },
    { label: 'Avg Project Value', value: formatINR(data.summary.avg_project_value), sub: 'Per project',       color: '#60a5fa' },
    { label: 'Conversion Rate',   value: `${data.summary.conversion_rate}%`,        sub: 'Inquiries→Client',  color: '#4ade80' },
  ]

  const categorySplit = data.category_split.map((c, i) => ({ ...c, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))

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
        <h3 className="ap__card-title ap__card-title--pad">Revenue Trend — Bar (₹ Lakhs)</h3>
        {data.revenue_trend.length === 0 ? (
          <p style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>Not enough data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.revenue_trend} barSize={32}>
              <XAxis dataKey="month" tick={{ fill: '#5a7a9a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7a9a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d2035', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#e8d5a3', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#c9a84c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="ap__card">
        <h3 className="ap__card-title ap__card-title--pad">Revenue Trend — Line (₹ Lakhs)</h3>
        {data.revenue_trend.length === 0 ? (
          <p style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>Not enough data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.revenue_trend}>
              <XAxis dataKey="month" tick={{ fill: '#5a7a9a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7a9a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d2035', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#e8d5a3', fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2} dot={{ r: 3, fill: '#c9a84c' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="ap__bar-grid">
        {categorySplit.length === 0 && (
          <p style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>No portfolio categories yet.</p>
        )}
        {categorySplit.map((p) => (
          <div key={p.label} className="ap__bar-card">
            <div className="ap__bar-row">
              <span className="ap__bar-label">{p.label}</span>
              <span className="ap__bar-pct" style={{ color: p.color }}>{p.pct}%</span>
            </div>
            <div className="ap__bar-track">
              <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 1 }} className="ap__bar-fill" style={{ background: p.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab() {
  const [form, setForm] = useState(null)
  const [fetched, setFetched] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings/')
      setForm(res.data)
    } catch {
      toast.error('Failed to load settings')
    }
    setFetched(true)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/api/settings/', {
        platform_name: form.platform_name,
        contact_email: form.contact_email,
        whatsapp_number: form.whatsapp_number,
        domain: form.domain,
      })
      setForm(res.data)
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!fetched || !form) {
    return <p style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>Loading settings...</p>
  }

  const FIELDS = [
    { key: 'platform_name',   label: 'Platform Name',   type: 'text' },
    { key: 'contact_email',   label: 'Contact Email',   type: 'email' },
    { key: 'whatsapp_number', label: 'WhatsApp Number', type: 'text' },
    { key: 'domain',          label: 'Domain',          type: 'text' },
  ]

  return (
    <div className="ap__card ap__settings-card">
      <h3 className="ap__settings-title">Platform Settings</h3>
      {FIELDS.map((f) => (
        <div key={f.key} className="ap__form-group">
          <label className="ap__form-label">{f.label}</label>
          <input
            value={form[f.key] || ''}
            onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
            type={f.type}
            className="ap__form-input"
          />
        </div>
      ))}
      <button onClick={handleSave} disabled={saving} className="ap__btn-gold ap__btn-gold--wide">
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // ── Live inquiry count for bell + nav badge ──
  const [newInquiries, setNewInquiries] = useState(0)
  const [newInquiryIds, setNewInquiryIds] = useState([])
  const [badgeFetched, setBadgeFetched] = useState(false)

  const fetchInquiryBadge = async () => {
    try {
      const res = await api.get('/api/inquiries/?status=new')
      const unseenIds = res.data.inquiries.filter((i) => !i.viewed_at).map((i) => i.id)
      setNewInquiries(unseenIds.length)
      setNewInquiryIds(unseenIds)
    } catch {
      // fail silently — badge just won't show
    }
    setBadgeFetched(true)
  }

  useEffect(() => {
    fetchInquiryBadge()
  }, [])

  const markInquiriesSeen = async () => {
    if (newInquiryIds.length === 0) return
    try {
      await api.post('/api/inquiries/mark-viewed/', { ids: newInquiryIds })
      setNewInquiries(0)
      setNewInquiryIds([])
    } catch {
      // request failed — badge stays as-is, will retry on next fetch
    }
  }

  const handleLogout = () => { logout?.(); navigate('/login') }

  const TABS = {
    overview: <Overview />,
    projects: <ProjectsTab />,
    portfolio: <PortfolioTab />,
    clients: <ClientsTab />,
    contractors: <ContractorsTab />,
    inquiries: <InquiriesTab />,
    estimator: <EstimatorConfigTab />,
    analytics: <AnalyticsTab />,
    settings: <SettingsTab />,
  }

  return (
    <div className="ap__page">
      <style>{`
        .ap__page { min-height: 100vh; background: #0a1420; color: #e8d5a3; display: flex; }

        /* ── Sidebar ── */
        .ap__sidebar {
          position: fixed; z-index: 40; inset: 0 auto 0 0; width: 16rem;
          background: #0d1826; border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          transform: translateX(-100%); transition: transform 0.3s ease;
        }
        .ap__sidebar--open { transform: translateX(0); }
        @media (min-width: 1024px) { .ap__sidebar { position: static; transform: translateX(0); } }

        .ap__sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .ap__sidebar-logo { font-weight: 900; font-size: 1.25rem; text-decoration: none; }
        .ap__sidebar-logo-cream { color: #e8d5a3; }
        .ap__sidebar-logo-gold { color: #c9a84c; }
        .ap__sidebar-close { background: none; border: none; color: #8fa3b8; cursor: pointer; display: flex; }
        @media (min-width: 1024px) { .ap__sidebar-close { display: none; } }

        .ap__sidebar-user { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 0.75rem; }
        .ap__sidebar-avatar {
          width: 2.25rem; height: 2.25rem; border-radius: 50%; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.25);
          display: flex; align-items: center; justify-content: center; color: #c9a84c; font-weight: 900; flex-shrink: 0;
        }
        .ap__sidebar-user-name { color: #e8d5a3; font-size: 0.875rem; font-weight: 600; margin: 0; }
        .ap__sidebar-user-role { color: #c9a84c; font-size: 0.75rem; font-weight: 500; margin: 0.1rem 0 0; }

        .ap__nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; overflow-y: auto; }
        .ap__nav-item {
          width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.75rem;
          font-size: 0.875rem; background: none; border: 1px solid transparent; color: #8fa3b8; cursor: pointer;
          transition: all 0.2s ease; font-family: inherit; box-sizing: border-box;
        }
        .ap__nav-item:hover { background: rgba(255,255,255,0.05); color: #e8d5a3; }
        .ap__nav-item--active { background: rgba(201,168,76,0.12); color: #c9a84c; border-color: rgba(201,168,76,0.25); }
        .ap__nav-badge {
          margin-left: auto; width: 1.25rem; height: 1.25rem; border-radius: 50%; background: #c9a84c; color: #071422;
          font-size: 0.62rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
        }

        .ap__sidebar-footer { padding: 1rem 0.75rem; border-top: 1px solid rgba(255,255,255,0.07); }
        .ap__logout-btn {
          width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.75rem;
          font-size: 0.875rem; background: none; border: none; color: #8fa3b8; cursor: pointer; transition: all 0.2s ease; font-family: inherit;
        }
        .ap__logout-btn:hover { background: rgba(248,113,113,0.1); color: #f87171; }

        .ap__overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 30; }
        @media (min-width: 1024px) { .ap__overlay { display: none; } }

        /* ── Main ── */
        .ap__main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

        .ap__header {
          position: sticky; top: 0; z-index: 20; background: rgba(10,20,32,0.9); backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,0.07); padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between;
        }
        .ap__header-left { display: flex; align-items: center; gap: 0.75rem; }
        .ap__menu-btn { background: none; border: none; color: #8fa3b8; cursor: pointer; display: flex; }
        @media (min-width: 1024px) { .ap__menu-btn { display: none; } }
        .ap__header-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0; }
        .ap__header-title { color: #e8d5a3; font-weight: 700; font-size: 1rem; margin: 0; text-transform: capitalize; }

        .ap__header-right { display: flex; align-items: center; gap: 0.75rem; }
        .ap__bell-btn { position: relative; background: none; border: none; color: #8fa3b8; cursor: pointer; display: flex; transition: color 0.2s ease; }
        .ap__bell-btn:hover { color: #c9a84c; }
        .ap__bell-dot {
          position: absolute; top: -0.25rem; right: -0.25rem; width: 1rem; height: 1rem; border-radius: 50%; background: #c9a84c;
          color: #071422; font-size: 0.55rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
        }
        .ap__bell-loading { position: absolute; top: -0.2rem; right: -0.2rem; width: 0.6rem; height: 0.6rem; border-radius: 50%; background: #8fa3b8; animation: ap-pulse-dot 1.2s ease-in-out infinite; }
        @keyframes ap-pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .ap__avatar-sm {
          width: 2.25rem; height: 2.25rem; border-radius: 50%; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.25);
          display: flex; align-items: center; justify-content: center; color: #c9a84c; font-weight: 900; font-size: 0.875rem;
        }

        .ap__content { flex: 1; padding: 1.25rem; overflow-y: auto; }
        @media (min-width: 640px) { .ap__content { padding: 1.5rem; } }
        .ap__content-inner { max-width: 72rem; margin: 0 auto; }

        /* ── Shared ── */
        .ap__stack { display: flex; flex-direction: column; gap: 1.5rem; }
        .ap__stack--tight { gap: 0.75rem; }

        .ap__badge { font-size: 0.68rem; padding: 0.15rem 0.65rem; border-radius: 9999px; border: 1px solid; font-weight: 700; white-space: nowrap; }

        .ap__card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 1rem; padding: 1.5rem; }
        .ap__card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .ap__card-title { color: #e8d5a3; font-weight: 700; font-size: 1rem; margin: 0; }
        .ap__card-title--pad { margin-bottom: 1rem; }
        .ap__card-count { color: #8fa3b8; font-size: 0.75rem; }

        .ap__section-title { color: #e8d5a3; font-weight: 700; font-size: 1rem; margin: 0; }

        /* ── Stat cards ── */
        .ap__stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @media (min-width: 1280px) { .ap__stats-grid { grid-template-columns: repeat(4, 1fr); } }
        .ap__stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 1rem; padding: 1.15rem; transition: border-color 0.3s ease; }
        .ap__stat-card:hover { border-color: rgba(201,168,76,0.25); }
        .ap__stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .ap__stat-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
        .ap__stat-value { color: #e8d5a3; font-weight: 900; font-size: 1.5rem; }
        .ap__stat-label { color: #8fa3b8; font-size: 0.75rem; margin-top: 0.15rem; }

        /* ── Project rows ── */
        .ap__project-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .ap__project-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s ease; }
        .ap__project-row:hover { border-color: rgba(201,168,76,0.15); background: rgba(255,255,255,0.015); }
        .ap__project-icon { width: 2rem; height: 2rem; border-radius: 0.5rem; background: rgba(201,168,76,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ap__project-info { flex: 1; min-width: 0; }
        .ap__project-name { color: #e8d5a3; font-size: 0.875rem; font-weight: 500; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ap__project-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0.1rem 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ap__project-meta { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .ap__project-budget-wrap { text-align: right; display: none; }
        @media (min-width: 640px) { .ap__project-budget-wrap { display: block; } }
        .ap__project-budget { color: #e8d5a3; font-size: 0.75rem; font-weight: 600; }
        .ap__project-pct { color: #8fa3b8; font-size: 0.72rem; }

        .ap__progress-track-sm { width: 4rem; height: 0.35rem; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden; display: none; }
        @media (min-width: 640px) { .ap__progress-track-sm { display: block; } }
        .ap__progress-fill-sm { height: 100%; background: linear-gradient(to right, #c9a84c, #f0d080); border-radius: 9999px; }

        /* ── Alert ── */
        .ap__alert { background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.2); border-radius: 1rem; padding: 1.15rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .ap__alert-left { display: flex; align-items: center; gap: 0.75rem; }
        .ap__alert-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: rgba(201,168,76,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ap__alert-title { color: #e8d5a3; font-weight: 700; font-size: 0.875rem; margin: 0; }
        .ap__alert-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0.1rem 0 0; }

        /* ── Toolbar / search ── */
        .ap__toolbar { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .ap__search-wrap { position: relative; flex: 1; min-width: 200px; }
        .ap__search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #8fa3b8; pointer-events: none; }
        .ap__search-input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.25rem; border-radius: 0.75rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e8d5a3; font-size: 0.875rem; box-sizing: border-box; }
        .ap__search-input::placeholder { color: #55708a; }
        .ap__search-input:focus { outline: none; border-color: rgba(201,168,76,0.4); }

        .ap__filter-select { padding: 0.65rem 1rem; border-radius: 0.75rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e8d5a3; font-size: 0.85rem; cursor: pointer; }

        .ap__btn-gold {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.1rem; border-radius: 0.75rem;
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%); color: #071422; font-size: 0.875rem; font-weight: 700; border: none; cursor: pointer; white-space: nowrap;
        }
        .ap__btn-gold--wide { width: 100%; justify-content: center; }

        /* ── Table ── */
        .ap__table-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 1rem; overflow: hidden; }
        .ap__table-scroll { overflow-x: auto; }
        .ap__table { width: 100%; border-collapse: collapse; }
        .ap__th { text-align: left; padding: 0.85rem 1rem; font-size: 0.7rem; color: #8fa3b8; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
        .ap__tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s ease; }
        .ap__tr:hover { background: rgba(255,255,255,0.015); }
        .ap__td { padding: 0.85rem 1rem; font-size: 0.875rem; color: #8fa3b8; white-space: nowrap; }
        .ap__td-name { color: #e8d5a3; font-weight: 500; }
        .ap__td-gold { color: #c9a84c; font-weight: 600; }
        .ap__progress-cell { display: flex; align-items: center; gap: 0.5rem; }
        .ap__progress-cell .ap__progress-track-sm { display: block; }
        .ap__progress-cell-text { color: #8fa3b8; font-size: 0.75rem; }

        .ap__row-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; flex-wrap: wrap; }
        .ap__action-btn {
          width: 1.75rem; height: 1.75rem; border-radius: 0.5rem; background: rgba(255,255,255,0.04); border: none; color: #8fa3b8;
          display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;
        }
        .ap__action-btn:hover { background: rgba(201,168,76,0.12); color: #c9a84c; }
        .ap__action-btn--danger:hover { background: rgba(248,113,113,0.12); color: #f87171; }

        /* ── List cards ── */
        .ap__list-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .ap__empty-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.85rem; padding: 2rem; text-align: center; color: #8fa3b8; font-size: 0.875rem; }
        .ap__list-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.85rem; padding: 1rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; transition: border-color 0.2s ease; }
        .ap__list-card:hover { border-color: rgba(201,168,76,0.15); }
        .ap__list-avatar { width: 2.5rem; height: 2.5rem; border-radius: 50%; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.2); display: flex; align-items: center; justify-content: center; color: #c9a84c; font-weight: 900; flex-shrink: 0; }
        .ap__list-icon-box { width: 2.75rem; height: 2.75rem; border-radius: 0.75rem; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
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

        .ap__approve-btn { display: flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.75rem; border-radius: 0.5rem; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25); color: #4ade80; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: background 0.2s ease; }
        .ap__approve-btn:hover { background: rgba(74,222,128,0.2); }
        .ap__deactivate-btn { padding: 0.35rem 0.75rem; border-radius: 0.5rem; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); color: #f87171; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: background 0.2s ease; }
        .ap__deactivate-btn:hover { background: rgba(248,113,113,0.2); }

        /* ── Modal ── */
        .ap__modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 50; backdrop-filter: blur(4px); }
        .ap__modal-wrap { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .ap__modal { width: 100%; max-width: 28rem; background: #0d1826; border: 1px solid rgba(201,168,76,0.2); border-radius: 1.25rem; padding: 1.5rem; position: relative; box-sizing: border-box; max-height: 90vh; overflow-y: auto; }
        .ap__modal-close { position: absolute; top: 1rem; right: 1rem; width: 2rem; height: 2rem; border-radius: 0.5rem; background: rgba(255,255,255,0.05); border: none; color: #8fa3b8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: color 0.2s ease; }
        .ap__modal-close:hover { color: #f87171; }

        .ap__modal-success { padding: 1.5rem 0; text-align: center; }
        .ap__modal-success-icon { width: 4rem; height: 4rem; border-radius: 50%; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
        .ap__modal-success-title { color: #e8d5a3; font-weight: 700; font-size: 1.15rem; margin: 0 0 0.3rem; }
        .ap__modal-success-text { color: #8fa3b8; font-size: 0.875rem; margin: 0; }

        .ap__modal-title { color: #e8d5a3; font-weight: 700; font-size: 1.15rem; margin: 0 0 0.25rem; }
        .ap__modal-sub { color: #8fa3b8; font-size: 0.75rem; margin: 0 0 1.25rem; }

        .ap__form-stack { display: flex; flex-direction: column; gap: 1rem; }
        .ap__form-group { display: flex; flex-direction: column; }
        .ap__form-label { color: #8fa3b8; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.4rem; font-weight: 600; }
        .ap__form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e8d5a3; font-size: 0.875rem; font-family: inherit; box-sizing: border-box; }
        .ap__form-input::placeholder { color: #55708a; }
        .ap__form-input:focus { outline: none; border-color: rgba(201,168,76,0.4); }
        .ap__form-input--flex { flex: 1; }

        .ap__phone-row { display: flex; gap: 0.5rem; }
        .ap__phone-prefix { display: flex; align-items: center; padding: 0 0.75rem; border-radius: 0.75rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e8d5a3; font-size: 0.875rem; flex-shrink: 0; }

        .ap__info-box { background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.15); border-radius: 0.75rem; padding: 0.75rem; }
        .ap__info-box p { color: #8fa3b8; font-size: 0.75rem; margin: 0.15rem 0; }
        .ap__info-highlight { color: #c9a84c; }

        .ap__modal-actions { display: flex; gap: 0.75rem; }
        .ap__btn-cancel { flex: 1; padding: 0.75rem; border-radius: 0.75rem; background: transparent; border: 1px solid rgba(232,213,163,0.2); color: #e8d5a3; font-size: 0.875rem; cursor: pointer; }
        .ap__btn-cancel:hover { border-color: rgba(201,168,76,0.4); }
        .ap__btn-submit { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; border-radius: 0.75rem; background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%); color: #071422; font-size: 0.875rem; font-weight: 700; border: none; cursor: pointer; }
        .ap__btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .ap__spinner { width: 1rem; height: 1rem; border: 2px solid rgba(7,20,34,0.3); border-top-color: #071422; border-radius: 50%; animation: ap-spin 0.7s linear infinite; }
        @keyframes ap-spin { to { transform: rotate(360deg); } }

        /* ── Confirm dialog ── */
        .ap__confirm-modal { width: 100%; max-width: 22rem; background: #0d1826; border: 1px solid rgba(248,113,113,0.2); border-radius: 1.25rem; padding: 1.5rem; text-align: center; }
        .ap__confirm-icon { width: 3rem; height: 3rem; border-radius: 50%; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
        .ap__confirm-title { color: #e8d5a3; font-weight: 700; font-size: 1.05rem; margin: 0; }
        .ap__confirm-text { color: #8fa3b8; font-size: 0.8rem; margin: 0.5rem 0 0; }

        /* ── Pagination ── */
        .ap__pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding-top: 0.5rem; }
        .ap__page-btn { width: 2rem; height: 2rem; border-radius: 0.5rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #8fa3b8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
        .ap__page-btn:hover:not(:disabled) { border-color: rgba(201,168,76,0.3); color: #c9a84c; }
        .ap__page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .ap__page-info { color: #8fa3b8; font-size: 0.78rem; }

        /* ── Bulk action bar ── */
        .ap__bulk-bar { display: flex; align-items: center; justify-content: space-between; background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.2); border-radius: 0.75rem; padding: 0.65rem 1rem; gap: 0.75rem; flex-wrap: wrap; }
        .ap__bulk-count { color: #c9a84c; font-size: 0.8rem; font-weight: 700; }
        .ap__bulk-actions { display: flex; align-items: center; gap: 0.5rem; }
        .ap__bulk-clear { background: none; border: none; color: #8fa3b8; font-size: 0.75rem; cursor: pointer; text-decoration: underline; }

        /* ── Checkbox ── */
        .ap__checkbox { width: 1rem; height: 1rem; accent-color: #c9a84c; cursor: pointer; flex-shrink: 0; }

        /* ── Image previews ── */
        .ap__cover-preview { width: 100%; max-height: 8rem; object-fit: cover; border-radius: 0.75rem; margin-top: 0.5rem; border: 1px solid rgba(255,255,255,0.1); }
        .ap__upload-preview { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; width: 100%; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.1); }
        .ap__preview-thumb { width: 2.5rem; height: 2.5rem; object-fit: cover; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.15); }
        .ap__preview-more { color: #8fa3b8; font-size: 0.7rem; }

        /* ── Profile avatar (detail modals) ── */
        .ap__profile-avatar-lg { width: 4rem; height: 4rem; border-radius: 50%; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.25); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem; font-weight: 900; color: #c9a84c; }

        /* ── Inquiries ── */
        .ap__inquiry-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
        .ap__filter-pills { display: flex; gap: 0.5rem; }
        .ap__filter-pill { padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.72rem; background: none; border: 1px solid rgba(255,255,255,0.1); color: #8fa3b8; cursor: pointer; transition: all 0.2s ease; }
        .ap__filter-pill:hover { border-color: rgba(201,168,76,0.3); color: #c9a84c; }

        .ap__inquiry-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.85rem; padding: 1rem; display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; transition: border-color 0.2s ease; }
        .ap__inquiry-card:hover { border-color: rgba(201,168,76,0.15); }
        .ap__inquiry-left { display: flex; align-items: flex-start; gap: 0.75rem; }
        .ap__inquiry-avatar { width: 2.5rem; height: 2.5rem; border-radius: 50%; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.15); display: flex; align-items: center; justify-content: center; color: #c9a84c; font-weight: 900; flex-shrink: 0; }
        .ap__inquiry-tags { display: flex; gap: 0.5rem; margin-top: 0.4rem; flex-wrap: wrap; }
        .ap__tag { font-size: 0.68rem; padding: 0.15rem 0.55rem; border-radius: 9999px; background: rgba(255,255,255,0.05); color: #8fa3b8; }
        .ap__tag-muted { font-size: 0.68rem; color: #55708a; }

        .ap__call-btn { padding: 0.4rem 0.75rem; border-radius: 0.5rem; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2); color: #4ade80; font-size: 0.72rem; font-weight: 700; text-decoration: none; transition: background 0.2s ease; }
        .ap__call-btn:hover { background: rgba(74,222,128,0.2); }
        .ap__whatsapp-btn { padding: 0.4rem 0.75rem; border-radius: 0.5rem; background: rgba(37,211,102,0.1); border: 1px solid rgba(37,211,102,0.2); color: #25D366; font-size: 0.72rem; font-weight: 700; text-decoration: none; transition: background 0.2s ease; }
        .ap__whatsapp-btn:hover { background: rgba(37,211,102,0.2); }

        /* ── Analytics ── */
        .ap__analytics-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 640px) { .ap__analytics-grid { grid-template-columns: repeat(3, 1fr); } }
        .ap__analytics-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 1rem; padding: 1.25rem; text-align: center; }
        .ap__analytics-value { font-weight: 900; font-size: 1.75rem; }
        .ap__analytics-label { color: #e8d5a3; font-weight: 600; font-size: 0.875rem; margin-top: 0.25rem; }
        .ap__analytics-sub { color: #8fa3b8; font-size: 0.75rem; margin-top: 0.15rem; }

        .ap__bar-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 640px) { .ap__bar-grid { grid-template-columns: 1fr 1fr; } }
        .ap__bar-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.85rem; padding: 1rem; }
        .ap__bar-row { display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.5rem; }
        .ap__bar-label { color: #e8d5a3; font-weight: 500; }
        .ap__bar-pct { font-weight: 700; }
        .ap__bar-track { height: 0.5rem; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden; }
        .ap__bar-fill { height: 100%; border-radius: 9999px; }

        /* ── Settings ── */
        .ap__settings-card { display: flex; flex-direction: column; gap: 1.25rem; }
        .ap__settings-title { color: #e8d5a3; font-weight: 700; font-size: 1.1rem; margin: 0; }

        /* ── Mobile ── */
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
            <span className="ap__sidebar-logo-cream">ICON</span><span className="ap__sidebar-logo-gold">BUILDERS</span>
          </Link>
          <button className="ap__sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
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
              onClick={() => {
                setActiveTab(item.id); setSidebarOpen(false)
                if (item.id === 'inquiries') markInquiriesSeen()
              }}
              className={`ap__nav-item ${activeTab === item.id ? 'ap__nav-item--active' : ''}`}
            >
              <item.icon size={17} />
              {item.label}
              {item.id === 'inquiries' && newInquiries > 0 && (
                <span className="ap__nav-badge">{newInquiries > 9 ? '9+' : newInquiries}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ap__sidebar-footer">
          <button onClick={handleLogout} className="ap__logout-btn"><LogOut size={17} /> Logout</button>
        </div>
      </aside>

      {sidebarOpen && <div className="ap__overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="ap__main">
        <header className="ap__header">
          <div className="ap__header-left">
            <button className="ap__menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
            <div>
              <p className="ap__header-sub">Admin Panel</p>
              <p className="ap__header-title">{activeTab}</p>
            </div>
          </div>
          <div className="ap__header-right">
            <button className="ap__bell-btn" onClick={() => { setActiveTab('inquiries'); markInquiriesSeen() }}>
              <Bell size={19} />
              {!badgeFetched ? (
                <span className="ap__bell-loading" />
              ) : newInquiries > 0 ? (
                <span className="ap__bell-dot">{newInquiries > 9 ? '9+' : newInquiries}</span>
              ) : null}
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