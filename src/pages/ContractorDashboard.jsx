import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, HardHat, Wallet, Package, MessageSquare, User,
  LogOut, Bell, TrendingUp, Clock, CheckCircle2, AlertCircle,
  ChevronRight, Camera, Menu, X,
} from 'lucide-react'

// ── Mock data — replace with api.js calls once backend endpoints exist ────
const STATS = [
  { label: 'Active Projects', value: '6', icon: HardHat, change: '+2 this month' },
  { label: "This Month's Earnings", value: '₹8.4L', icon: Wallet, change: '+12% vs last month' },
  { label: 'Pending Payments', value: '₹2.1L', icon: Clock, change: '3 invoices due' },
  { label: 'Completion Rate', value: '94%', icon: TrendingUp, change: 'On-time delivery' },
]

const PROJECTS = [
  { id: 1, name: 'Kondapur Villa — Phase 2', client: 'R. Mehta', progress: 68, stage: 'Structure', due: 'Aug 20' },
  { id: 2, name: 'Gachibowli Apartments — Block C', client: 'Skyline Realty', progress: 42, stage: 'Foundation', due: 'Sep 05' },
  { id: 3, name: 'Jubilee Hills Residence', client: 'A. Rao', progress: 91, stage: 'Finishing', due: 'Jul 28' },
  { id: 4, name: 'Manikonda Commercial Plaza', client: 'Vertex Corp', progress: 15, stage: 'Planning', due: 'Nov 10' },
]

const TASKS = [
  { id: 1, text: 'Submit material invoice — Kondapur Villa', due: 'Today', urgent: true },
  { id: 2, text: 'Site inspection — Jubilee Hills', due: 'Tomorrow', urgent: true },
  { id: 3, text: 'Upload progress photos — Gachibowli Block C', due: 'Jul 16', urgent: false },
  { id: 4, text: 'Review revised layout — Manikonda Plaza', due: 'Jul 18', urgent: false },
]

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'My Projects', icon: HardHat },
  { id: 'payments', label: 'Payments', icon: Wallet },
  { id: 'materials', label: 'Materials', icon: Package },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
]

function stageColor(stage) {
  return {
    Planning: 'text-slate-soft bg-white/5',
    Foundation: 'text-gold bg-gold/10',
    Structure: 'text-gold bg-gold/10',
    Finishing: 'text-green-400 bg-green-400/10',
  }[stage] || 'text-slate-soft bg-white/5'
}

export default function ContractorDashboard() {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout?.()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-navy-gradient text-cream font-body flex">

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-navy-mid border-r border-white/10 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
          <Link to="/" className="font-display text-xl font-bold text-gold">IconBuilders</Link>
          <button className="lg:hidden text-slate-soft" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { setActive(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  active === item.id
                    ? 'bg-gold/15 text-gold border border-gold/30'
                    : 'text-slate-soft hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Icon size={18} /> {item.label}
              </button>
            )
          })}
        </nav>

        <div className="px-4 py-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-soft hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-navy/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-soft" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <p className="text-xs text-slate-soft">Welcome back,</p>
              <p className="font-display text-lg text-white">{user?.name || 'Contractor'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-slate-soft hover:text-gold transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-navy font-bold text-sm">
              {(user?.name || 'C')[0]}
            </div>
          </div>
        </header>

        <main className="p-6 space-y-8">

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {STATS.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card-gradient border border-white/10 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-soft mt-1">{s.label}</p>
                  <p className="text-[11px] text-gold mt-2">{s.change}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">

            {/* Active projects */}
            <div className="bg-card-gradient border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg text-white">Active Projects</h2>
                <button className="text-xs text-gold flex items-center gap-1 hover:underline">
                  View all <ChevronRight size={14} />
                </button>
              </div>
              <div className="space-y-4">
                {PROJECTS.map((p) => (
                  <div key={p.id} className="border border-white/5 rounded-xl p-4 hover:border-gold/20 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-slate-muted">{p.client}</p>
                      </div>
                      <span className={`text-[11px] px-2 py-1 rounded-full ${stageColor(p.stage)}`}>
                        {p.stage}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                      <motion.div
                        className="h-full bg-gold-gradient rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${p.progress}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-soft">{p.progress}% complete</span>
                      <span className="text-slate-muted">Due {p.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks + quick action */}
            <div className="space-y-6">
              <div className="bg-card-gradient border border-white/10 rounded-2xl p-6">
                <h2 className="font-display text-lg text-white mb-5">Upcoming Tasks</h2>
                <div className="space-y-3">
                  {TASKS.map((t) => (
                    <div key={t.id} className="flex items-start gap-3">
                      {t.urgent ? (
                        <AlertCircle size={16} className="text-gold shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 size={16} className="text-slate-muted shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-white leading-snug">{t.text}</p>
                        <p className="text-[11px] text-slate-muted mt-0.5">{t.due}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card-gradient border border-gold/20 rounded-2xl p-6 text-center">
                <Camera size={22} className="text-gold mx-auto mb-3" />
                <p className="text-sm text-white font-medium mb-1">Upload Site Photos</p>
                <p className="text-xs text-slate-muted mb-4">Keep clients updated with today's progress</p>
                <button className="w-full py-2.5 rounded-xl bg-gold-gradient text-navy text-sm font-semibold shadow-gold hover:shadow-gold-lg transition-all">
                  Upload Now
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}