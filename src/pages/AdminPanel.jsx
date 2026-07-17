import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, HardHat, FolderOpen, Bell,
  Settings, LogOut, Menu, X, TrendingUp, Wallet,
  CheckCircle2, Clock, AlertCircle, ChevronRight,
  UserPlus, Eye, Trash2, Search, Filter, BarChart3,
  Building2, MessageSquare, ShieldCheck,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'

// ── Mock data ────────────────────────────────────────────────────────────────
const STATS = [
  { label:'Total Projects',   value:'24',    change:'+3 this month', icon:FolderOpen,  color:'text-blue-400'  },
  { label:'Active Clients',   value:'18',    change:'+5 this month', icon:Users,       color:'text-green-400' },
  { label:'Contractors',      value:'9',     change:'2 pending',     icon:HardHat,     color:'text-gold'      },
  { label:'Revenue (Month)',  value:'₹42L',  change:'+18% growth',   icon:Wallet,      color:'text-purple-400'},
]

const PROJECTS = [
  { id:1, name:'Kondapur Villa',        client:'R. Mehta',      contractor:'Sri Sai Const.',  progress:68, status:'Active',   budget:'₹28L'  },
  { id:2, name:'Gachibowli Apartments', client:'Skyline Realty',contractor:'Build Pro',       progress:42, status:'Active',   budget:'₹95L'  },
  { id:3, name:'Jubilee Hills Bungalow',client:'A. Rao',        contractor:'Sri Sai Const.',  progress:91, status:'Finishing',budget:'₹52L'  },
  { id:4, name:'Manikonda Plaza',       client:'Vertex Corp',   contractor:'Apex Builders',   progress:15, status:'Planning', budget:'₹1.8Cr'},
  { id:5, name:'Miyapur 2BHK',          client:'S. Sharma',     contractor:'HomeCraft',       progress:100,status:'Complete', budget:'₹38L'  },
  { id:6, name:'HITEC City Office',     client:'TechSpace Ltd', contractor:'Build Pro',       progress:28, status:'Active',   budget:'₹3.1Cr'},
]

const CLIENTS = [
  { id:1, name:'Rajesh Mehta',    phone:'98765 43210', project:'Kondapur Villa',        joined:'Mar 2026', status:'Active'   },
  { id:2, name:'Anita Rao',       phone:'87654 32109', project:'Jubilee Hills Bungalow',joined:'Feb 2026', status:'Active'   },
  { id:3, name:'Suresh Sharma',   phone:'76543 21098', project:'Miyapur 2BHK',          joined:'Jan 2026', status:'Complete' },
  { id:4, name:'TechSpace Ltd',   phone:'65432 10987', project:'HITEC City Office',     joined:'Apr 2026', status:'Active'   },
  { id:5, name:'Skyline Realty',  phone:'54321 09876', project:'Gachibowli Apartments', joined:'Mar 2026', status:'Active'   },
  { id:6, name:'Vertex Corp',     phone:'43210 98765', project:'Manikonda Plaza',       joined:'May 2026', status:'Planning' },
]

const CONTRACTORS = [
  { id:1, name:'Sri Sai Constructions', projects:3, rating:4.8, status:'Active',  phone:'91234 56789' },
  { id:2, name:'Build Pro Pvt Ltd',     projects:2, rating:4.6, status:'Active',  phone:'82345 67890' },
  { id:3, name:'Apex Builders',         projects:1, rating:4.3, status:'Active',  phone:'73456 78901' },
  { id:4, name:'HomeCraft India',       projects:1, rating:4.9, status:'Active',  phone:'64567 89012' },
  { id:5, name:'Urban Construct',       projects:0, rating:4.1, status:'Pending', phone:'55678 90123' },
]

const INQUIRIES = [
  { id:1, name:'Priya Kapoor',   phone:'99887 76655', type:'New Construction', city:'Hyderabad', plot:'1200 sqft', date:'Jul 14', status:'New'      },
  { id:2, name:'Mohan Reddy',    phone:'88776 65544', type:'Villa',            city:'Bangalore',  plot:'2400 sqft', date:'Jul 13', status:'Called'   },
  { id:3, name:'Lakshmi Devi',   phone:'77665 54433', type:'Renovation',       city:'Hyderabad', plot:'800 sqft',  date:'Jul 12', status:'New'      },
  { id:4, name:'Ravi Kumar',     phone:'66554 43322', type:'Commercial',       city:'Pune',      plot:'5000 sqft', date:'Jul 11', status:'Converted'},
  { id:5, name:'Sneha Patel',    phone:'55443 32211', type:'Apartment',        city:'Mumbai',    plot:'950 sqft',  date:'Jul 10', status:'Called'   },
]

const REVENUE_DATA = [
  { month:'Feb', revenue:28 },{ month:'Mar', revenue:35 },{ month:'Apr', revenue:31 },
  { month:'May', revenue:42 },{ month:'Jun', revenue:38 },{ month:'Jul', revenue:42 },
]

const PROJECT_DATA = [
  { month:'Feb', active:14 },{ month:'Mar', active:16 },{ month:'Apr', active:19 },
  { month:'May', active:21 },{ month:'Jun', active:22 },{ month:'Jul', active:24 },
]

const NAV = [
  { id:'overview',    label:'Overview',    icon:LayoutDashboard },
  { id:'projects',    label:'Projects',    icon:FolderOpen      },
  { id:'clients',     label:'Clients',     icon:Users           },
  { id:'contractors', label:'Contractors', icon:HardHat         },
  { id:'inquiries',   label:'Inquiries',   icon:MessageSquare   },
  { id:'analytics',   label:'Analytics',   icon:BarChart3       },
  { id:'settings',    label:'Settings',    icon:Settings        },
]

function fmt(v) { return typeof v==='number' ? (v>=10000000?`₹${(v/10000000).toFixed(1)}Cr`:v>=100000?`₹${(v/100000).toFixed(1)}L`:`₹${v.toLocaleString()}`) : v }

function StatusBadge({ status }) {
  const map = {
    Active:   'bg-green-400/10 text-green-400 border-green-400/20',
    Complete: 'bg-blue-400/10  text-blue-400  border-blue-400/20',
    Planning: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
    Finishing:'bg-purple-400/10 text-purple-400 border-purple-400/20',
    Pending:  'bg-orange-400/10 text-orange-400 border-orange-400/20',
    New:      'bg-gold/10 text-gold border-gold/20',
    Called:   'bg-blue-400/10 text-blue-400 border-blue-400/20',
    Converted:'bg-green-400/10 text-green-400 border-green-400/20',
  }
  return (
    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${map[status]||'bg-white/5 text-slate-soft border-white/10'}`}>
      {status}
    </span>
  )
}

// ── Overview ─────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
            className="glass border border-white/8 rounded-2xl p-5 hover:border-gold/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <s.icon size={18} className={s.color} />
              </div>
              <TrendingUp size={13} className="text-green-400 opacity-60" />
            </div>
            <div className="text-cream font-black text-2xl">{s.value}</div>
            <div className="text-slate-soft text-xs mt-0.5">{s.label}</div>
            <div className="text-gold text-[11px] mt-1.5 font-medium">{s.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass border border-white/8 rounded-2xl p-5">
          <h3 className="text-cream font-bold text-sm mb-4">Monthly Revenue (₹L)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={REVENUE_DATA} barSize={28}>
              <XAxis dataKey="month" tick={{ fill:'#5a7a9a', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background:'#0d2035', border:'1px solid rgba(201,168,76,0.2)', borderRadius:8, color:'#e8d5a3', fontSize:12 }} />
              <Bar dataKey="revenue" fill="#c9a84c" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass border border-white/8 rounded-2xl p-5">
          <h3 className="text-cream font-bold text-sm mb-4">Active Projects Growth</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={PROJECT_DATA}>
              <XAxis dataKey="month" tick={{ fill:'#5a7a9a', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background:'#0d2035', border:'1px solid rgba(201,168,76,0.2)', borderRadius:8, color:'#e8d5a3', fontSize:12 }} />
              <Line type="monotone" dataKey="active" stroke="#c9a84c" strokeWidth={2.5} dot={{ fill:'#c9a84c', r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent projects */}
      <div className="glass border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-cream font-bold">Recent Projects</h3>
          <span className="text-xs text-slate-soft">{PROJECTS.length} total</span>
        </div>
        <div className="space-y-3">
          {PROJECTS.slice(0,4).map((p,i) => (
            <motion.div key={p.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
              className="flex items-center gap-4 p-3 rounded-xl border border-white/5 hover:border-gold/15 hover:bg-white/2 transition-all">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Building2 size={14} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm font-medium truncate">{p.name}</p>
                <p className="text-slate-soft text-xs truncate">{p.client} · {p.contractor}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="hidden sm:block text-right">
                  <div className="text-xs text-cream font-semibold">{p.budget}</div>
                  <div className="text-xs text-slate-soft">{p.progress}%</div>
                </div>
                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" style={{ width:`${p.progress}%` }} />
                </div>
                <StatusBadge status={p.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New inquiries alert */}
      <div className="glass border border-gold/20 bg-gold/3 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center">
              <Bell size={18} className="text-gold" />
            </div>
            <div>
              <p className="text-cream font-bold text-sm">2 New Inquiries Today</p>
              <p className="text-slate-soft text-xs">Priya Kapoor & Lakshmi Devi are waiting</p>
            </div>
          </div>
          <button className="text-xs text-gold font-semibold flex items-center gap-1 hover:underline">
            View <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Projects Tab ──────────────────────────────────────────────────────────────
function ProjectsTab() {
  const [search, setSearch] = useState('')
  const filtered = PROJECTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-soft" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-soft text-sm hover:border-gold/20 hover:text-cream transition-all">
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="glass border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['Project','Client','Contractor','Budget','Progress','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-slate-soft uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p,i) => (
                <motion.tr key={p.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.05 }}
                  className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-cream text-sm font-medium">{p.name}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-soft text-sm">{p.client}</td>
                  <td className="px-4 py-3.5 text-slate-soft text-sm">{p.contractor}</td>
                  <td className="px-4 py-3.5 text-gold text-sm font-semibold">{p.budget}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" style={{ width:`${p.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-soft">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-all text-slate-soft">
                        <Eye size={13} />
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-400/10 hover:text-red-400 transition-all text-slate-soft">
                        <Trash2 size={13} />
                      </button>
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
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [clients, setClients]     = useState([])
  const [fetched, setFetched]     = useState(false)
  const [form, setForm] = useState({ name:'', phone:'', email:'' })

  const fetchClients = async () => {
    try {
      const res = await api.get('/api/users/?role=client')
      setClients(res.data)
    } catch {}
    setFetched(true)
  }
  if (!fetched) fetchClients()

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
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
      setClients(prev => [res.data.user, ...prev])
      setSuccess(true)
      toast.success(`Client ${form.name} created!`)
      setTimeout(() => {
        setSuccess(false)
        setShowModal(false)
        setForm({ name:'', phone:'', email:'' })
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.phone?.[0] || err.response?.data?.error || 'Failed to create client')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-soft" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-gold text-sm font-bold">
          <UserPlus size={14} /> Add Client
        </button>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="glass border border-white/8 rounded-xl p-8 text-center">
            <p className="text-slate-soft text-sm">No clients yet. Click "Add Client" to create one.</p>
          </div>
        )}
        {filtered.map((c,i) => (
          <motion.div key={c.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
            className="glass border border-white/8 rounded-xl p-4 flex flex-wrap gap-4 items-center hover:border-gold/15 transition-all">
            <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center text-gold font-black flex-shrink-0">
              {c.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-cream font-semibold text-sm">{c.name}</p>
              <p className="text-slate-soft text-xs mt-0.5">{c.phone}</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-slate-soft text-xs">Role</p>
              <p className="text-cream text-sm font-medium capitalize">{c.role}</p>
            </div>
            <div className="hidden md:block">
              <p className="text-slate-soft text-xs">Joined</p>
              <p className="text-cream text-sm">
                {new Date(c.created_at).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={c.is_active ? 'Active' : 'Inactive'} />
              <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-all text-slate-soft">
                <Eye size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => !loading && setShowModal(false)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md glass border border-gold/20 rounded-2xl p-6 relative">
                <button onClick={() => !loading && setShowModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-soft hover:text-red-400 transition-all">
                  <X size={16} />
                </button>

                {success ? (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/25 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={30} className="text-green-400" />
                    </div>
                    <h3 className="text-cream font-bold text-lg mb-1">Client Created!</h3>
                    <p className="text-slate-soft text-sm">{form.name} can now login with OTP</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-cream font-bold text-lg mb-1">Add New Client</h2>
                    <p className="text-slate-soft text-xs mb-5">Client will login using phone + OTP</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Full Name *</label>
                        <input name="name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                          placeholder="e.g. Rajesh Mehta"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Phone Number *</label>
                        <div className="flex gap-2">
                          <div className="flex items-center px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm flex-shrink-0">🇮🇳 +91</div>
                          <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))}
                            placeholder="10-digit mobile"
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Email (optional)</label>
                        <input name="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                          placeholder="client@email.com" type="email"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
                      </div>
                      <div className="bg-gold/5 border border-gold/15 rounded-xl p-3">
                        <p className="text-xs text-slate-soft">💡 Client can login at <span className="text-gold">iconbuilderindia.com/login</span> using phone + OTP</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setShowModal(false)} disabled={loading}
                          className="flex-1 py-3 rounded-xl btn-outline text-sm">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading || !form.name || form.phone.length < 10}
                          className="flex-1 py-3 rounded-xl btn-gold text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                          {loading ? <><div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Creating...</> : <><UserPlus size={14} />Create Client</>}
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

// ── Contractors Tab ───────────────────────────────────────────────────────────
function ContractorsTab() {
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [contractors, setContractors] = useState([])
  const [fetched, setFetched]     = useState(false)
  const [form, setForm] = useState({ name:'', phone:'', email:'' })

  const fetchContractors = async () => {
    try {
      const res = await api.get('/api/users/?role=contractor')
      setContractors(res.data)
    } catch {}
    setFetched(true)
  }
  if (!fetched) fetchContractors()

  const filtered = contractors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
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
      setContractors(prev => [res.data.user, ...prev])
      setSuccess(true)
      toast.success(`Contractor ${form.name} created!`)
      setTimeout(() => {
        setSuccess(false)
        setShowModal(false)
        setForm({ name:'', phone:'', email:'' })
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.phone?.[0] || err.response?.data?.error || 'Failed to create contractor')
    } finally { setLoading(false) }
  }

  const toggleActive = async (contractor) => {
    try {
      if (contractor.is_active) {
        await api.delete(`/api/users/${contractor.id}/`)
        setContractors(prev => prev.map(c => c.id === contractor.id ? { ...c, is_active: false } : c))
        toast.success(`${contractor.name} deactivated`)
      } else {
        await api.put(`/api/users/${contractor.id}/`, { is_active: true })
        setContractors(prev => prev.map(c => c.id === contractor.id ? { ...c, is_active: true } : c))
        toast.success(`${contractor.name} approved`)
      }
    } catch {
      toast.error('Failed to update contractor')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-soft" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contractors..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-gold text-sm font-bold">
          <UserPlus size={14} /> Add Contractor
        </button>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 && (
          <div className="glass border border-white/8 rounded-xl p-8 text-center">
            <p className="text-slate-soft text-sm">No contractors yet. Click "Add Contractor" to create one.</p>
          </div>
        )}
        {filtered.map((c,i) => (
          <motion.div key={c.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
            className="glass border border-white/8 rounded-xl p-5 flex flex-wrap gap-4 items-center hover:border-gold/15 transition-all">
            <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <HardHat size={18} className="text-gold" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <p className="text-cream font-bold text-sm">{c.name}</p>
              <p className="text-slate-soft text-xs mt-0.5">{c.phone}</p>
            </div>
            <div className="hidden md:block">
              <p className="text-slate-soft text-xs">Joined</p>
              <p className="text-cream text-sm">
                {new Date(c.created_at).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={c.is_active ? 'Active' : 'Pending'} />
              <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-all text-slate-soft">
                <Eye size={13} />
              </button>
              {!c.is_active && (
                <button onClick={() => toggleActive(c)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-400/10 text-green-400 text-xs font-semibold hover:bg-green-400/20 transition-all border border-green-400/20">
                  <ShieldCheck size={12} /> Approve
                </button>
              )}
              {c.is_active && (
                <button onClick={() => toggleActive(c)}
                  className="px-3 py-1 rounded-lg bg-red-400/10 text-red-400 text-xs font-semibold hover:bg-red-400/20 transition-all border border-red-400/20">
                  Deactivate
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Contractor Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => !loading && setShowModal(false)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md glass border border-gold/20 rounded-2xl p-6 relative">
                <button onClick={() => !loading && setShowModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-soft hover:text-red-400 transition-all">
                  <X size={16} />
                </button>

                {success ? (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/25 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={30} className="text-green-400" />
                    </div>
                    <h3 className="text-cream font-bold text-lg mb-1">Contractor Created!</h3>
                    <p className="text-slate-soft text-sm">{form.name} can now login with OTP</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-cream font-bold text-lg mb-1">Add New Contractor</h2>
                    <p className="text-slate-soft text-xs mb-5">Contractor will login using phone + OTP</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Full Name / Company *</label>
                        <input name="name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                          placeholder="e.g. Sri Sai Constructions"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Phone Number *</label>
                        <div className="flex gap-2">
                          <div className="flex items-center px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm flex-shrink-0">🇮🇳 +91</div>
                          <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))}
                            placeholder="10-digit mobile"
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Email (optional)</label>
                        <input name="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                          placeholder="contractor@email.com" type="email"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
                      </div>
                      <div className="bg-gold/5 border border-gold/15 rounded-xl p-3">
                        <p className="text-xs text-slate-soft">💡 Contractor can login at <span className="text-gold">iconbuilderindia.com/login</span> using phone + OTP</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setShowModal(false)} disabled={loading}
                          className="flex-1 py-3 rounded-xl btn-outline text-sm">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading || !form.name || form.phone.length < 10}
                          className="flex-1 py-3 rounded-xl btn-gold text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                          {loading ? <><div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Creating...</> : <><UserPlus size={14} />Create Contractor</>}
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-cream font-bold">Lead Inquiries</h3>
        <div className="flex gap-2">
          {['All','New','Called','Converted'].map(f => (
            <button key={f} className="px-3 py-1 rounded-full text-xs border border-white/10 text-slate-soft hover:border-gold/30 hover:text-gold transition-all">
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {INQUIRIES.map((inq,i) => (
          <motion.div key={inq.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
            className="glass border border-white/8 rounded-xl p-4 hover:border-gold/15 transition-all">
            <div className="flex flex-wrap gap-4 items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/15 flex items-center justify-center text-gold font-black flex-shrink-0">
                  {inq.name[0]}
                </div>
                <div>
                  <p className="text-cream font-semibold text-sm">{inq.name}</p>
                  <p className="text-slate-soft text-xs mt-0.5">{inq.phone} · {inq.city}</p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-soft">{inq.type}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-soft">{inq.plot}</span>
                    <span className="text-[11px] text-slate-muted">{inq.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={inq.status} />
                <a href={`tel:${inq.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-semibold hover:bg-green-400/20 transition-all">
                  📞 Call
                </a>
                <a href={`https://wa.me/91${inq.phone.replace(/\s/g,'')}`} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-all">
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab() {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label:'Total Revenue',     value:'₹2.4Cr', sub:'All time',        color:'text-gold'       },
          { label:'Avg Project Value', value:'₹48L',   sub:'Per project',     color:'text-blue-400'   },
          { label:'Conversion Rate',   value:'34%',    sub:'Inquiries→Client',color:'text-green-400'  },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
            className="glass border border-white/8 rounded-2xl p-5 text-center">
            <div className={`font-black text-3xl ${s.color}`}>{s.value}</div>
            <div className="text-cream font-semibold text-sm mt-1">{s.label}</div>
            <div className="text-slate-soft text-xs mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="glass border border-white/8 rounded-2xl p-6">
        <h3 className="text-cream font-bold mb-4">Revenue Trend (₹ Lakhs)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={REVENUE_DATA} barSize={32}>
            <XAxis dataKey="month" tick={{ fill:'#5a7a9a', fontSize:12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#5a7a9a', fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:'#0d2035', border:'1px solid rgba(201,168,76,0.2)', borderRadius:8, color:'#e8d5a3', fontSize:12 }} />
            <Bar dataKey="revenue" fill="#c9a84c" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label:'Villas',       pct:35, color:'bg-gold'        },
          { label:'Apartments',   pct:28, color:'bg-blue-400'    },
          { label:'Commercial',   pct:22, color:'bg-purple-400'  },
          { label:'Renovation',   pct:15, color:'bg-green-400'   },
        ].map(p => (
          <div key={p.label} className="glass border border-white/8 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-cream font-medium">{p.label}</span>
              <span className="text-gold font-bold">{p.pct}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width:0 }} animate={{ width:`${p.pct}%` }}
                transition={{ duration:1 }} className={`h-full ${p.color} rounded-full`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab() {
  return (
    <div className="glass border border-white/8 rounded-2xl p-6 space-y-5">
      <h3 className="text-cream font-bold text-lg">Platform Settings</h3>
      {[
        { label:'Platform Name',    value:'ReliaState',              type:'text' },
        { label:'Contact Email',    value:'hello@iconbuilderindia.com', type:'email' },
        { label:'WhatsApp Number',  value:'+91 98765 43210',         type:'text' },
        { label:'Domain',           value:'iconbuilderindia.com',    type:'text' },
      ].map(s => (
        <div key={s.label}>
          <label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">{s.label}</label>
          <input defaultValue={s.value} type={s.type}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm focus:outline-none focus:border-gold/40 transition-all" />
        </div>
      ))}
      <button className="px-6 py-3 rounded-xl btn-gold text-sm font-bold">Save Settings</button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [activeTab, setActiveTab]     = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout?.(); navigate('/login') }

  const TABS = {
    overview:    <Overview />,
    projects:    <ProjectsTab />,
    clients:     <ClientsTab />,
    contractors: <ContractorsTab />,
    inquiries:   <InquiriesTab />,
    analytics:   <AnalyticsTab />,
    settings:    <SettingsTab />,
  }

  return (
    <div className="min-h-screen bg-navy text-cream flex">

      {/* Sidebar */}
      <aside className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-navy-mid
                         border-r border-white/8 flex flex-col transition-transform duration-300
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <Link to="/" className="font-black text-xl">
            <span className="text-cream">RELIA</span><span className="text-gold">STATE</span>
          </Link>
          <button className="lg:hidden text-slate-soft" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-gold font-black">
              {(user?.name||'A')[0]}
            </div>
            <div>
              <p className="text-cream text-sm font-semibold">{user?.name||'Admin'}</p>
              <p className="text-gold text-xs font-medium">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                ${activeTab===item.id
                  ? 'bg-gold/12 text-gold border border-gold/25'
                  : 'text-slate-soft hover:bg-white/5 hover:text-cream border border-transparent'}`}>
              <item.icon size={17} />
              {item.label}
              {item.id==='inquiries' && (
                <span className="ml-auto w-5 h-5 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center">2</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/8">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-soft hover:bg-red-500/10 hover:text-red-400 transition-all">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-navy/90 backdrop-blur-md border-b border-white/8 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-soft" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <p className="text-xs text-slate-soft">Admin Panel</p>
              <p className="font-bold text-base text-cream capitalize">{activeTab}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-slate-soft hover:text-gold transition-colors">
              <Bell size={19} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-navy text-[9px] font-bold flex items-center justify-center">5</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-gold font-black text-sm">
              {(user?.name||'A')[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <motion.div key={activeTab} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
              {TABS[activeTab]}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
