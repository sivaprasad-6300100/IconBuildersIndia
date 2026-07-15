import { useRef } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Bot, Calculator, Camera,
  Shield, Bell, FileText, Users
} from 'lucide-react'

const SERVICES = [
  {
    icon: LayoutDashboard,
    title: 'Live Project Dashboard',
    desc: 'Real-time milestone tracking visible to every stakeholder. Know exactly where your project stands — every single day.',
    tag: 'Client Portal',
    gradient: 'from-blue-500/10 to-blue-900/5',
    border: 'hover:border-blue-400/30',
  },
  {
    icon: Bot,
    title: 'AI Chatbot Assistant',
    desc: '24/7 intelligent support powered by Claude AI. Answers pricing queries, material questions, and project guidance instantly.',
    tag: 'AI Powered',
    gradient: 'from-gold/10 to-gold/5',
    border: 'hover:border-gold/30',
    highlight: true,
  },
  {
    icon: Calculator,
    title: 'Smart Cost Estimator',
    desc: 'Get an accurate construction budget in 60 seconds. Enter plot size, floors, city — get a full breakdown instantly.',
    tag: 'Lead Generation',
    gradient: 'from-green-500/10 to-green-900/5',
    border: 'hover:border-green-400/30',
  },
  {
    icon: Camera,
    title: 'Photo Progress Logs',
    desc: 'Contractors upload daily site photos. Clients see real progress with timestamped images organized by milestone.',
    tag: 'Transparency',
    gradient: 'from-purple-500/10 to-purple-900/5',
    border: 'hover:border-purple-400/30',
  },
  {
    icon: Shield,
    title: 'Secure OTP Login',
    desc: 'Bank-level security with OTP-based authentication. Role-based access ensures clients see only their own project.',
    tag: 'Security',
    gradient: 'from-red-500/10 to-red-900/5',
    border: 'hover:border-red-400/30',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Instant alerts when milestones are reached, photos uploaded, or payments are due. Stay informed without checking in.',
    tag: 'Real-time',
    gradient: 'from-orange-500/10 to-orange-900/5',
    border: 'hover:border-orange-400/30',
  },
  {
    icon: FileText,
    title: 'Digital Reports',
    desc: 'Auto-generated progress reports, payment receipts, and project summaries. Everything documented and downloadable.',
    tag: 'Documentation',
    gradient: 'from-teal-500/10 to-teal-900/5',
    border: 'hover:border-teal-400/30',
  },
  {
    icon: Users,
    title: 'Admin Control Panel',
    desc: 'Full platform management — users, projects, milestones, inquiries, and analytics. Complete control from one place.',
    tag: 'Management',
    gradient: 'from-slate-500/10 to-slate-900/5',
    border: 'hover:border-slate-400/30',
  },
]

function ServiceCard({ service, index }) {
  const cardRef = useRef()
  const Icon = service.icon

  // 3D tilt on mouse move
  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotateX = ((y - cy) / cy) * -8
    const rotateY = ((x - cx) / cx) * 8
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transition: 'transform 0.15s ease' }}
        className={`
          relative h-full glass border rounded-2xl p-6
          ${service.border} border-white/5
          ${service.highlight ? 'border-gold/20 shadow-gold' : ''}
          cursor-default group overflow-hidden
        `}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl`} />

        {/* Highlight glow */}
        {service.highlight && (
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
        )}

        {/* Tag */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                        bg-white/5 border border-white/10 mb-4">
          <div className={`w-1 h-1 rounded-full ${service.highlight ? 'bg-gold' : 'bg-slate-soft'}`} />
          <span className="text-[10px] text-slate-soft font-semibold tracking-wider uppercase">
            {service.tag}
          </span>
        </div>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4
                         ${service.highlight ? 'bg-gold/15 border border-gold/25' : 'bg-white/5 border border-white/10'}
                         group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} className={service.highlight ? 'text-gold' : 'text-cream/70'} />
        </div>

        {/* Content */}
        <h3 className="text-cream font-bold text-lg mb-3 leading-snug">{service.title}</h3>
        <p className="text-slate-soft text-sm leading-relaxed">{service.desc}</p>

        {/* Bottom arrow */}
        <div className="mt-5 flex items-center gap-1 text-xs font-semibold
                        text-gold/0 group-hover:text-gold/70
                        transition-all duration-300 translate-x-0 group-hover:translate-x-1">
          <span>Learn more</span>
          <span>→</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function ServicesSection() {
  return (
    <section id="services" className="section-pad bg-navy-mid relative overflow-hidden">

      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          border border-gold/20 bg-gold/5 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">
              Our Services
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream mb-4">
            Everything You Need
            <br />
            <span className="text-shimmer">In One Platform</span>
          </h2>
          <p className="text-slate-soft text-lg max-w-2xl mx-auto">
            From first estimate to final handover — ReliaState covers every stage
            of your construction journey with intelligent tools.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  )
}
