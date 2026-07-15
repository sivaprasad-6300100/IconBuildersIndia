import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, BedDouble, Ruler, ArrowUpRight } from 'lucide-react'

const PROJECTS = [
  {
    id: 1, title: 'Luxury Villa — Jubilee Hills', category: 'Villa',
    location: 'Hyderabad', beds: 4, area: '3200 sqft', budget: '₹1.8 Cr',
    status: 'Completed', statusColor: 'text-green-400',
    statusBg: 'bg-green-400/10 border-green-400/20',
    progress: 100, emoji: '🏡', gradient: 'from-amber-900/40 to-navy',
    desc: 'Premium 4BHK villa with Italian marble flooring, home theatre, and smart home automation.',
  },
  {
    id: 2, title: 'Modern Apartment — Gachibowli', category: 'Apartment',
    location: 'Hyderabad', beds: 3, area: '1850 sqft', budget: '₹95 L',
    status: 'In Progress', statusColor: 'text-gold',
    statusBg: 'bg-gold/10 border-gold/20',
    progress: 68, emoji: '🏢', gradient: 'from-blue-900/40 to-navy',
    desc: 'Contemporary 3BHK apartment with open floor plan, modular kitchen, and rooftop access.',
  },
  {
    id: 3, title: 'Commercial Complex — Kondapur', category: 'Commercial',
    location: 'Hyderabad', beds: null, area: '12000 sqft', budget: '₹4.2 Cr',
    status: 'In Progress', statusColor: 'text-blue-400',
    statusBg: 'bg-blue-400/10 border-blue-400/20',
    progress: 42, emoji: '🏬', gradient: 'from-slate-800/60 to-navy',
    desc: 'G+3 commercial space with basement parking, glass facade, and modern interiors.',
  },
  {
    id: 4, title: 'Duplex Home — Banjara Hills', category: 'Villa',
    location: 'Hyderabad', beds: 5, area: '4500 sqft', budget: '₹2.6 Cr',
    status: 'Completed', statusColor: 'text-green-400',
    statusBg: 'bg-green-400/10 border-green-400/20',
    progress: 100, emoji: '🏠', gradient: 'from-emerald-900/40 to-navy',
    desc: 'Stunning duplex with private pool, landscaped garden, and premium imported fixtures.',
  },
  {
    id: 5, title: 'Budget Apartment — Miyapur', category: 'Apartment',
    location: 'Hyderabad', beds: 2, area: '1100 sqft', budget: '₹52 L',
    status: 'Completed', statusColor: 'text-green-400',
    statusBg: 'bg-green-400/10 border-green-400/20',
    progress: 100, emoji: '🏗', gradient: 'from-purple-900/40 to-navy',
    desc: 'Affordable 2BHK with quality finishes, vastu compliance, and great connectivity.',
  },
  {
    id: 6, title: 'IT Office Space — HITEC City', category: 'Commercial',
    location: 'Hyderabad', beds: null, area: '8500 sqft', budget: '₹3.1 Cr',
    status: 'Planning', statusColor: 'text-orange-400',
    statusBg: 'bg-orange-400/10 border-orange-400/20',
    progress: 15, emoji: '🏛', gradient: 'from-orange-900/30 to-navy',
    desc: 'State-of-the-art office with open workspaces, conference rooms, and server room.',
  },
]

const TABS = ['All', 'Villa', 'Apartment', 'Commercial']

function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative glass border border-white/8 rounded-2xl overflow-hidden
                 hover:border-gold/25 transition-all duration-300 hover:-translate-y-2 cursor-default"
    >
      <div className={`relative h-44 bg-gradient-to-br ${project.gradient} flex items-center justify-center overflow-hidden`}>
        <motion.span
          animate={{ scale: hovered ? 1.2 : 1, rotate: hovered ? 5 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-6xl select-none"
        >{project.emoji}</motion.span>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.08) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${project.statusBg} ${project.statusColor}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${project.statusColor.replace('text-','bg-')}`} />
          {project.status}
        </div>
        <div className="absolute top-3 left-3 glass border border-gold/20 rounded-lg px-2.5 py-1 text-xs font-bold text-gold">{project.budget}</div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <motion.div initial={{ width: 0 }} whileInView={{ width: `${project.progress}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }} className="h-full bg-gradient-to-r from-gold to-gold-light" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-cream font-bold text-base mb-1.5 group-hover:text-gold transition-colors">{project.title}</h3>
        <p className="text-slate-soft text-xs leading-relaxed mb-4">{project.desc}</p>
        <div className="flex items-center gap-3 text-xs text-slate-soft flex-wrap">
          <span className="flex items-center gap-1"><MapPin size={11} className="text-gold/60" />{project.location}</span>
          <span className="flex items-center gap-1"><Ruler size={11} className="text-gold/60" />{project.area}</span>
          {project.beds && <span className="flex items-center gap-1"><BedDouble size={11} className="text-gold/60" />{project.beds} BHK</span>}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-slate-muted">{project.progress}% Complete</div>
          <motion.div animate={{ x: hovered ? 3 : 0, y: hovered ? -3 : 0 }} className="w-7 h-7 rounded-lg border border-gold/20 flex items-center justify-center">
            <ArrowUpRight size={13} className="text-gold/50 group-hover:text-gold transition-colors" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProjectShowcase() {
  const [activeTab, setActiveTab] = useState('All')
  const filtered = activeTab === 'All' ? PROJECTS : PROJECTS.filter(p => p.category === activeTab)

  return (
    <section id="projects" className="section-pad bg-navy-mid relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">Our Projects</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream mb-4">
            Built with Pride,<br /><span className="text-shimmer">Delivered with Precision</span>
          </h2>
          <p className="text-slate-soft text-lg max-w-2xl mx-auto">Every project tracked live on ReliaState — from foundation to final handover.</p>
        </motion.div>
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === tab ? 'bg-gold text-navy shadow-gold' : 'glass border border-white/10 text-slate-soft hover:text-cream hover:border-gold/20'}`}>
              {tab}
            </button>
          ))}
        </div>
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => <ProjectCard key={project.id} project={project} index={i} />)}
          </AnimatePresence>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="text-center mt-12">
          <p className="text-slate-soft text-sm mb-4">Want to see your project here?</p>
          <a href="#contact" onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-gold text-sm font-bold">
            Start Your Project Today
          </a>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  )
}
