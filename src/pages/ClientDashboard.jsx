import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, HardHat, Wallet, Image, Bell, User,
  LogOut, Menu, X, CheckCircle2, Clock, AlertCircle,
  ChevronRight, TrendingUp, Camera, MessageSquare, Download,
} from 'lucide-react'

// ── Mock data ────────────────────────────────────────────────────────────────
const PROJECT = {
  name: 'Kondapur Villa — Phase 2',
  contractor: 'Sri Sai Constructions',
  startDate: 'Mar 15, 2026',
  endDate: 'Sep 30, 2026',
  budget: 2800000,
  spent: 1640000,
  progress: 68,
}

const MILESTONES = [
  { id:1, label:'Foundation & Plinth',     done:true,  date:'Apr 10', photos:12 },
  { id:2, label:'Ground Floor Structure',  done:true,  date:'May 22', photos:18 },
  { id:3, label:'First Floor Slab',        done:true,  date:'Jun 18', photos:9  },
  { id:4, label:'Brickwork & Walls',       done:false, date:'Aug 05', photos:4, active:true },
  { id:5, label:'Electrical & Plumbing',   done:false, date:'Aug 28', photos:0  },
  { id:6, label:'Plastering & Flooring',   done:false, date:'Sep 10', photos:0  },
  { id:7, label:'Final Finishing & Paint', done:false, date:'Sep 28', photos:0  },
]

const PHOTOS = [
  { id:1, label:'Foundation Work',    date:'Apr 10', emoji:'🏗' },
  { id:2, label:'Column Casting',     date:'Apr 28', emoji:'🧱' },
  { id:3, label:'Ground Floor Slab',  date:'May 22', emoji:'⚒️' },
  { id:4, label:'First Floor Walls',  date:'Jun 05', emoji:'🏠' },
  { id:5, label:'First Floor Slab',   date:'Jun 18', emoji:'🏢' },
  { id:6, label:'Brickwork Started',  date:'Jul 10', emoji:'🧱' },
]

const PAYMENTS = [
  { id:1, label:'Advance Payment',     amount:560000, date:'Mar 15', status:'Paid'    },
  { id:2, label:'Foundation Complete', amount:420000, date:'Apr 12', status:'Paid'    },
  { id:3, label:'Structure Complete',  amount:420000, date:'Jun 20', status:'Paid'    },
  { id:4, label:'Brickwork Complete',  amount:420000, date:'Aug 06', status:'Pending' },
  { id:5, label:'Finishing Stage',     amount:560000, date:'Sep 12', status:'Upcoming'},
]

const NOTIFICATIONS = [
  { id:1, text:'Brickwork progress photo uploaded by contractor',   time:'2 hours ago',  icon: Camera,       unread:true  },
  { id:2, text:'Milestone: First Floor Slab marked as complete',    time:'Jun 18',       icon: CheckCircle2, unread:true  },
  { id:3, text:'Payment of ₹4.2L confirmed for Structure stage',    time:'Jun 20',       icon: Wallet,       unread:false },
  { id:4, text:'Weekly progress report is ready to download',       time:'Jul 07',       icon: Download,     unread:false },
]

const NAV = [
  { id:'overview',      label:'Overview',       icon:LayoutDashboard },
  { id:'milestones',    label:'Milestones',     icon:HardHat         },
  { id:'photos',        label:'Site Photos',    icon:Camera          },
  { id:'payments',      label:'Payments',       icon:Wallet          },
  { id:'notifications', label:'Notifications',  icon:Bell            },
  { id:'profile',       label:'Profile',        icon:User            },
]

function fmt(n) {
  if (n>=10000000) return `₹${(n/10000000).toFixed(1)}Cr`
  if (n>=100000)   return `₹${(n/100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

// ── Overview Tab ─────────────────────────────────────────────────────────────
function Overview({ setTab }) {
  return (
    <div className="space-y-6">

      {/* Project hero card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="bg-gradient-to-br from-navy-light/40 to-navy-mid border border-gold/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-gold/5 rounded-full blur-3xl" />
        <div className="flex flex-wrap gap-4 justify-between items-start mb-6">
          <div>
            <div className="text-xs text-gold uppercase tracking-widest mb-1">Your Project</div>
            <h2 className="text-cream font-bold text-xl">{PROJECT.name}</h2>
            <p className="text-slate-soft text-sm mt-1">by {PROJECT.contractor}</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/25 text-green-400 text-xs font-bold flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> On Track
          </div>
        </div>

        {/* Big progress circle */}
        <div className="flex flex-wrap gap-8 items-center">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
              <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#c9a84c" strokeWidth="10"
                strokeLinecap="round" strokeDasharray={`${2*Math.PI*40}`}
                initial={{ strokeDashoffset: 2*Math.PI*40 }}
                animate={{ strokeDashoffset: 2*Math.PI*40*(1-PROJECT.progress/100) }}
                transition={{ duration:1.5, ease:'easeOut' }}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-gold font-black text-2xl">{PROJECT.progress}%</span>
              <span className="text-slate-soft text-[10px]">Complete</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 min-w-[200px]">
            {[
              { label:'Start Date',   value:PROJECT.startDate },
              { label:'End Date',     value:PROJECT.endDate   },
              { label:'Total Budget', value:fmt(PROJECT.budget)},
              { label:'Spent So Far', value:fmt(PROJECT.spent) },
            ].map(s => (
              <div key={s.label}>
                <div className="text-slate-soft text-xs mb-0.5">{s.label}</div>
                <div className="text-cream font-bold text-sm">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Milestones Done',   value:'3/7',    icon:CheckCircle2, color:'text-green-400' },
          { label:'Photos Uploaded',   value:'43',     icon:Camera,       color:'text-gold'      },
          { label:'Budget Used',       value:'58%',    icon:TrendingUp,   color:'text-blue-400'  },
          { label:'Days Remaining',    value:'76',     icon:Clock,        color:'text-orange-400'},
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
            className="glass border border-white/8 rounded-xl p-4 hover:border-gold/20 transition-all">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className="text-cream font-black text-xl">{s.value}</div>
            <div className="text-slate-soft text-xs mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent milestones */}
      <div className="glass border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-cream font-bold">Milestone Progress</h3>
          <button onClick={() => setTab('milestones')} className="text-xs text-gold flex items-center gap-1 hover:underline">
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="space-y-3">
          {MILESTONES.slice(0,4).map((m,i) => (
            <motion.div key={m.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all
                ${m.active ? 'bg-gold/8 border border-gold/20' : 'border border-transparent hover:bg-white/3'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                ${m.done ? 'bg-green-400/15 border border-green-400/30' :
                  m.active ? 'bg-gold/15 border border-gold/30' :
                  'bg-white/5 border border-white/10'}`}>
                {m.done
                  ? <CheckCircle2 size={14} className="text-green-400" />
                  : m.active
                    ? <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                    : <div className="w-2 h-2 rounded-full bg-white/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${m.done ? 'text-slate-soft line-through' : m.active ? 'text-cream' : 'text-slate-soft'}`}>
                  {m.label}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-xs font-semibold ${m.done ? 'text-green-400' : m.active ? 'text-gold' : 'text-slate-soft'}`}>
                  {m.done ? 'Done' : m.active ? 'In Progress' : m.date}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent photos */}
      <div className="glass border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cream font-bold">Recent Site Photos</h3>
          <button onClick={() => setTab('photos')} className="text-xs text-gold flex items-center gap-1 hover:underline">
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {PHOTOS.slice(0,3).map((p,i) => (
            <motion.div key={p.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.08 }}
              className="aspect-square rounded-xl bg-gradient-to-br from-navy-light to-navy-mid
                         border border-white/8 flex flex-col items-center justify-center gap-2
                         hover:border-gold/25 transition-all cursor-pointer group">
              <div className="text-3xl group-hover:scale-110 transition-transform">{p.emoji}</div>
              <div className="text-[10px] text-slate-soft text-center px-2 leading-tight">{p.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Milestones Tab ───────────────────────────────────────────────────────────
function Milestones() {
  return (
    <div className="glass border border-white/8 rounded-2xl p-6">
      <h3 className="text-cream font-bold text-lg mb-6">All Milestones</h3>
      <div className="relative">
        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-white/10" />
        <div className="space-y-4">
          {MILESTONES.map((m,i) => (
            <motion.div key={m.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
              className="flex gap-4 items-start pl-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 mt-0.5
                ${m.done ? 'bg-green-400 shadow-[0_0_12px_rgba(74,171,104,0.4)]' :
                  m.active ? 'bg-gold shadow-gold' : 'bg-navy-mid border border-white/15'}`}>
                {m.done ? <CheckCircle2 size={14} className="text-white" /> :
                  m.active ? <div className="w-2.5 h-2.5 rounded-full bg-navy animate-pulse" /> :
                  <span className="text-slate-soft text-xs font-bold">{i+1}</span>}
              </div>
              <div className={`flex-1 p-4 rounded-xl border transition-all
                ${m.done ? 'bg-green-400/4 border-green-400/15' :
                  m.active ? 'bg-gold/8 border-gold/20' :
                  'bg-white/3 border-white/8'}`}>
                <div className="flex flex-wrap gap-3 justify-between items-start">
                  <div>
                    <p className={`font-semibold text-sm ${m.done ? 'text-slate-soft' : 'text-cream'}`}>{m.label}</p>
                    <p className="text-xs text-slate-soft mt-0.5">
                      {m.done ? `Completed on ${m.date}` : m.active ? 'Currently in progress' : `Expected: ${m.date}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.photos > 0 && (
                      <span className="flex items-center gap-1 text-xs text-slate-soft">
                        <Camera size={11} /> {m.photos}
                      </span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                      ${m.done ? 'bg-green-400/10 text-green-400' :
                        m.active ? 'bg-gold/10 text-gold' :
                        'bg-white/5 text-slate-soft'}`}>
                      {m.done ? '✓ Complete' : m.active ? '⟳ Active' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Photos Tab ───────────────────────────────────────────────────────────────
function Photos() {
  return (
    <div className="glass border border-white/8 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-cream font-bold text-lg">Site Photo Gallery</h3>
        <span className="text-slate-soft text-xs">{PHOTOS.length} photos</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {PHOTOS.map((p,i) => (
          <motion.div key={p.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.07 }}
            className="aspect-square rounded-xl bg-gradient-to-br from-navy-light to-navy-mid
                       border border-white/8 flex flex-col items-center justify-center gap-2
                       hover:border-gold/30 hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="text-4xl group-hover:scale-110 transition-transform">{p.emoji}</div>
            <div className="text-xs text-slate-soft text-center px-2">{p.label}</div>
            <div className="text-[10px] text-slate-muted">{p.date}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Payments Tab ─────────────────────────────────────────────────────────────
function Payments() {
  const paid   = PAYMENTS.filter(p=>p.status==='Paid').reduce((a,p)=>a+p.amount,0)
  const pending = PAYMENTS.filter(p=>p.status==='Pending').reduce((a,p)=>a+p.amount,0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Total Budget',  value:fmt(PROJECT.budget),       color:'text-cream'       },
          { label:'Paid',          value:fmt(paid),                 color:'text-green-400'   },
          { label:'Pending',       value:fmt(pending),              color:'text-gold'        },
        ].map(s => (
          <div key={s.label} className="glass border border-white/8 rounded-xl p-4 text-center">
            <div className={`font-black text-xl ${s.color}`}>{s.value}</div>
            <div className="text-slate-soft text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Budget progress */}
      <div className="glass border border-white/8 rounded-xl p-5">
        <div className="flex justify-between text-xs text-slate-soft mb-2">
          <span>Budget Used</span>
          <span className="text-gold font-bold">{Math.round((paid/PROJECT.budget)*100)}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div initial={{ width:0 }} animate={{ width:`${(paid/PROJECT.budget)*100}%` }}
            transition={{ duration:1.2 }} className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" />
        </div>
      </div>

      <div className="glass border border-white/8 rounded-2xl p-6">
        <h3 className="text-cream font-bold mb-5">Payment History</h3>
        <div className="space-y-3">
          {PAYMENTS.map((p,i) => (
            <motion.div key={p.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
              className="flex items-center justify-between p-4 rounded-xl border border-white/8 hover:border-gold/15 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${p.status==='Paid' ? 'bg-green-400/10' : p.status==='Pending' ? 'bg-gold/10' : 'bg-white/5'}`}>
                  {p.status==='Paid'
                    ? <CheckCircle2 size={15} className="text-green-400" />
                    : p.status==='Pending'
                      ? <AlertCircle size={15} className="text-gold" />
                      : <Clock size={15} className="text-slate-soft" />}
                </div>
                <div>
                  <p className="text-cream text-sm font-medium">{p.label}</p>
                  <p className="text-slate-soft text-xs">{p.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-cream font-bold text-sm">{fmt(p.amount)}</p>
                <span className={`text-[11px] font-semibold
                  ${p.status==='Paid' ? 'text-green-400' : p.status==='Pending' ? 'text-gold' : 'text-slate-soft'}`}>
                  {p.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Notifications Tab ────────────────────────────────────────────────────────
function Notifications() {
  return (
    <div className="glass border border-white/8 rounded-2xl p-6">
      <h3 className="text-cream font-bold text-lg mb-5">Notifications</h3>
      <div className="space-y-3">
        {NOTIFICATIONS.map((n,i) => (
          <motion.div key={n.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all
              ${n.unread ? 'bg-gold/4 border-gold/15' : 'border-white/8 hover:border-gold/10'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
              ${n.unread ? 'bg-gold/15' : 'bg-white/5'}`}>
              <n.icon size={16} className={n.unread ? 'text-gold' : 'text-slate-soft'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-relaxed ${n.unread ? 'text-cream' : 'text-slate-soft'}`}>{n.text}</p>
              <p className="text-xs text-slate-muted mt-1">{n.time}</p>
            </div>
            {n.unread && <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1" />}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [activeTab, setActiveTab]   = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout?.(); navigate('/login') }

  const TABS = {
    overview:      <Overview setTab={setActiveTab} />,
    milestones:    <Milestones />,
    photos:        <Photos />,
    payments:      <Payments />,
    notifications: <Notifications />,
    profile: (
      <div className="glass border border-white/8 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center mx-auto mb-4 text-3xl font-black text-gold">
          {(user?.name||'C')[0]}
        </div>
        <p className="text-cream font-bold text-xl">{user?.name || 'Client User'}</p>
        <p className="text-slate-soft text-sm mt-1">{user?.phone || '+91 98765 43210'}</p>
        <p className="text-gold text-xs mt-1 capitalize font-semibold">{user?.role || 'client'}</p>
      </div>
    ),
  }

  return (
    <div className="min-h-screen bg-navy text-cream flex">

      {/* ── Sidebar ── */}
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

        {/* User info */}
        <div className="px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-gold font-black">
              {(user?.name||'C')[0]}
            </div>
            <div className="min-w-0">
              <p className="text-cream text-sm font-semibold truncate">{user?.name||'Client User'}</p>
              <p className="text-slate-soft text-xs capitalize">{user?.role||'client'}</p>
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
              <item.icon size={17} /> {item.label}
              {item.id==='notifications' && (
                <span className="ml-auto w-4 h-4 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center">2</span>
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

      {/* ── Main ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-navy/90 backdrop-blur-md border-b border-white/8 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-soft" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <p className="text-xs text-slate-soft">Welcome back,</p>
              <p className="font-bold text-base text-cream">{user?.name || 'Client'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('notifications')}
              className="relative text-slate-soft hover:text-gold transition-colors">
              <Bell size={19} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-navy text-[9px] font-bold flex items-center justify-center">2</span>
            </button>
            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER||'919876543210'}`} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-all">
              <MessageSquare size={13} /> WhatsApp
            </a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence>
              <motion.div key={activeTab} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25 }}>
                {TABS[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

function AnimatePresence({ children }) { return children }
