import { useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import { Building2, Users, Award, Clock } from 'lucide-react'


import { useState, useEffect } from 'react'

function useCountUp(end, duration = 2500, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setValue(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, end, duration])
  return value
}

const STATS = [
  { value: 500,  suffix: '+', label: 'Projects Delivered',   icon: Building2, color: '#c9a84c' },
  { value: 98,   suffix: '%', label: 'Client Satisfaction',  icon: Award,     color: '#c9a84c' },
  { value: 1200, suffix: '+', label: 'Happy Families',       icon: Users,     color: '#c9a84c' },
  { value: 7,    suffix: '+', label: 'Years of Excellence',  icon: Clock,     color: '#c9a84c' },
]

const ABOUT_POINTS = [
  'India\'s first AI-powered construction management platform',
  'Real-time milestone tracking with daily photo updates',
  'Transparent cost estimation — no hidden charges ever',
  'Dedicated dashboards for clients, contractors & admins',
]

function StatCard({ stat, index }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })
  const Icon = stat.icon
  const count = useCountUp(stat.value, 2500, inView)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: 'easeOut' }}
      className="glass border border-gold/15 rounded-2xl p-6 text-center
                 hover:border-gold/35 hover:-translate-y-2
                 transition-all duration-300 group cursor-default"
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20
                      flex items-center justify-center mx-auto mb-4
                      group-hover:bg-gold/20 transition-colors">
        <Icon size={24} className="text-gold" />
      </div>

      {/* Number */}
      <div className="text-4xl font-black text-gold leading-none mb-1">

        {count.toLocaleString()}
        
        <span>{stat.suffix}</span>
      </div>

      {/* Label */}
      <div className="text-slate-soft text-sm mt-2 font-medium">{stat.label}</div>

      {/* Bottom gold line */}
      <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent
                      scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </motion.div>
  )
}

export default function AboutSection() {
  const { ref: titleRef, inView: titleInView } = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section id="about" className="section-pad bg-navy relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section title */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          border border-gold/20 bg-gold/5 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">
              About ReliaState
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream mb-4">
            Built for India's
            <span className="text-shimmer"> Construction Industry</span>
          </h2>
          <p className="text-slate-soft text-lg max-w-2xl mx-auto leading-relaxed">
            We eliminate the chaos of construction — bringing every party onto one
            transparent, AI-powered platform that builds trust at every step.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* About content — two columns */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h3 className="font-display text-3xl font-bold text-cream mb-6">
              Why builders & clients
              <br />
              <span className="text-gold">choose ReliaState</span>
            </h3>
            <div className="space-y-4">
              {ABOUT_POINTS.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-gold/15 border border-gold/30
                                  flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  </div>
                  <p className="text-cream/80 text-sm leading-relaxed">{point}</p>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="#contact"
              onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2 mt-8 px-6 py-3
                         rounded-xl btn-gold text-sm font-bold"
            >
              Start Your Project
            </motion.a>
          </motion.div>

          {/* Right — visual card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative"
          >
            {/* Main card */}
            <div className="glass border border-gold/15 rounded-3xl p-8 relative overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full
                              bg-gold/10 blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-cream font-bold text-lg">Project Overview</div>
                  <div className="text-slate-soft text-xs mt-1">Villa Construction — Phase 3</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-semibold">
                  On Track
                </div>
              </div>

              {/* Milestone progress bars */}
              {[
                { label: 'Foundation',       pct: 100, done: true },
                { label: 'Structural Work',  pct: 100, done: true },
                { label: 'Brickwork',        pct: 78,  done: false },
                { label: 'Electrical',       pct: 40,  done: false },
                { label: 'Finishing',        pct: 0,   done: false },
              ].map((m, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-cream/80 font-medium">{m.label}</span>
                    <span className={`text-xs font-bold ${m.done ? 'text-green-400' : m.pct > 0 ? 'text-gold' : 'text-slate-soft'}`}>
                      {m.done ? '✓ Done' : m.pct > 0 ? `${m.pct}%` : 'Pending'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        m.done ? 'bg-green-400' :
                        m.pct > 0 ? 'bg-gradient-to-r from-gold to-gold-light' :
                        'bg-white/10'
                      }`}
                    />
                  </div>
                </div>
              ))}

              {/* Bottom info */}
              <div className="mt-6 pt-4 border-t border-gold/10 flex justify-between">
                <div className="text-center">
                  <div className="text-gold font-bold text-lg">Day 45</div>
                  <div className="text-slate-soft text-xs">of 120</div>
                </div>
                <div className="text-center">
                  <div className="text-gold font-bold text-lg">₹18.4L</div>
                  <div className="text-slate-soft text-xs">spent of ₹28L</div>
                </div>
                <div className="text-center">
                  <div className="text-gold font-bold text-lg">12</div>
                  <div className="text-slate-soft text-xs">photos today</div>
                </div>
              </div>
            </div>

            {/* AI badge floating */}
            <div className="absolute -bottom-4 -left-4 glass border border-gold/20
                            rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-gold">
              <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center">
                <span className="text-base">🤖</span>
              </div>
              <div>
                <div className="text-xs font-bold text-gold">AI Assistant</div>
                <div className="text-[10px] text-slate-soft">Active 24/7</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
