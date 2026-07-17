import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import { Building2, Users, Award, Clock } from 'lucide-react'

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
  { value: 500,  suffix: '+', label: 'Projects Delivered',  icon: Building2 },
  { value: 98,   suffix: '%', label: 'Client Satisfaction', icon: Award },
  { value: 1200, suffix: '+', label: 'Happy Families',      icon: Users },
  { value: 7,    suffix: '+', label: 'Years of Excellence', icon: Clock },
]

const ABOUT_POINTS = [
  "India's first AI-powered construction management platform",
  'Real-time milestone tracking with daily photo updates',
  'Transparent cost estimation — no hidden charges ever',
  'Dedicated dashboards for clients, contractors & admins',
]

const MILESTONES = [
  { label: 'Foundation',      pct: 100, done: true },
  { label: 'Structural Work', pct: 100, done: true },
  { label: 'Brickwork',       pct: 78,  done: false },
  { label: 'Electrical',      pct: 40,  done: false },
  { label: 'Finishing',       pct: 0,   done: false },
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
      className="about__stat-card"
    >
      <div className="about__stat-icon">
        <Icon size={24} color="#c9a84c" />
      </div>
      <div className="about__stat-number">
        {count.toLocaleString()}<span>{stat.suffix}</span>
      </div>
      <div className="about__stat-label">{stat.label}</div>
      <div className="about__stat-underline" />
    </motion.div>
  )
}

export default function AboutSection() {
  const { ref: titleRef, inView: titleInView } = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section id="about" className="about">
      <style>{`
        .about {
          position: relative;
          overflow: hidden;
          background: #0a1420;
          padding: 6rem 1.5rem;
        }

        .about__glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%);
        }

        .about__inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Title ── */
        .about__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.06);
          margin-bottom: 1rem;
        }
        .about__badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a84c;
        }
        .about__badge-text {
          color: #c9a84c;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .about__title-wrap {
          text-align: center;
          margin-bottom: 4rem;
        }

        .about__title {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 2rem;
          color: #e8d5a3;
          margin: 0 0 1rem;
          line-height: 1.2;
        }
        .about__title-accent {
          color: #c9a84c;
        }
        @media (min-width: 640px) { .about__title { font-size: 2.75rem; } }
        @media (min-width: 1024px) { .about__title { font-size: 3.25rem; } }

        .about__subtitle {
          color: #8fa3b8;
          font-size: 1rem;
          max-width: 42rem;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Stats grid ── */
        .about__stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 5rem;
        }
        @media (min-width: 1024px) {
          .about__stats { grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        }

        .about__stat-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 1rem;
          padding: 1.5rem 1rem;
          text-align: center;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .about__stat-card:hover {
          border-color: rgba(201,168,76,0.4);
          transform: translateY(-4px);
        }

        .about__stat-icon {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 0.75rem;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .about__stat-number {
          font-size: 2rem;
          font-weight: 900;
          color: #c9a84c;
          line-height: 1;
          margin-bottom: 0.375rem;
        }

        .about__stat-label {
          color: #8fa3b8;
          font-size: 0.8rem;
          font-weight: 500;
          margin-top: 0.5rem;
        }

        .about__stat-underline {
          margin-top: 1rem;
          height: 2px;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.4), transparent);
        }

        /* ── Two-column content — the part that was breaking ── */
        .about__content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .about__content { grid-template-columns: 1fr 1fr; gap: 4rem; }
        }

        .about__heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 1.85rem;
          color: #e8d5a3;
          line-height: 1.3;
          margin: 0 0 1.5rem;
        }
        .about__heading-accent { color: #c9a84c; }

        .about__points {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .about__point {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .about__point-icon {
          flex-shrink: 0;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0.15rem;
        }
        .about__point-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a84c;
        }

        .about__point-text {
          color: rgba(232,213,163,0.8);
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
        }

        .about__cta {
          display: inline-block;
          margin-top: 2rem;
          padding: 0.875rem 1.75rem;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          font-size: 0.875rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 0 20px rgba(201,168,76,0.25);
        }

        /* ── Right visual card ── */
        .about__visual {
          position: relative;
        }

        .about__card {
          position: relative;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 1.5rem;
          padding: 1.75rem;
          overflow: hidden;
        }

        .about__card-glow {
          position: absolute;
          top: -2.5rem;
          right: -2.5rem;
          width: 10rem;
          height: 10rem;
          border-radius: 50%;
          background: rgba(201,168,76,0.1);
          filter: blur(48px);
          pointer-events: none;
        }

        .about__card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          position: relative;
        }
        .about__card-title { color: #e8d5a3; font-weight: 700; font-size: 1.1rem; }
        .about__card-subtitle { color: #8fa3b8; font-size: 0.75rem; margin-top: 0.25rem; }

        .about__badge-ontrack {
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.3);
          color: #4ade80;
          font-size: 0.7rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .about__milestone { margin-bottom: 1rem; }
        .about__milestone-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4rem;
        }
        .about__milestone-label { color: rgba(232,213,163,0.8); font-size: 0.85rem; font-weight: 500; }
        .about__milestone-pct { font-size: 0.75rem; font-weight: 700; }
        .about__milestone-track {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 9999px;
          overflow: hidden;
        }
        .about__milestone-fill {
          height: 100%;
          border-radius: 9999px;
        }

        .about__card-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(201,168,76,0.1);
        }
        .about__footer-item { text-align: center; }
        .about__footer-value { color: #c9a84c; font-weight: 700; font-size: 1.1rem; }
        .about__footer-label { color: #8fa3b8; font-size: 0.7rem; margin-top: 0.15rem; }

        /* AI badge — no longer overlaps content below it */
        .about__ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          margin-top: 1.25rem;
          padding: 0.65rem 1rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(201,168,76,0.2);
          box-shadow: 0 0 16px rgba(201,168,76,0.12);
        }
        .about__ai-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          background: rgba(201,168,76,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }
        .about__ai-title { color: #c9a84c; font-size: 0.75rem; font-weight: 700; }
        .about__ai-sub { color: #8fa3b8; font-size: 0.65rem; }

        /* ══════════════════════════════════════════════════════════
           MOBILE REFINEMENTS (≤640px)
           ══════════════════════════════════════════════════════════ */
        @media (max-width: 640px) {
          .about {
            padding: 3.5rem 1rem;
          }

          .about__glow {
            width: 380px;
            height: 380px;
          }

          .about__title-wrap {
            margin-bottom: 2.5rem;
          }

          .about__badge {
            padding: 0.35rem 0.85rem;
          }

          .about__badge-text {
            font-size: 10px;
            letter-spacing: 0.15em;
          }

          .about__title {
            font-size: 1.6rem;
            margin-bottom: 0.75rem;
          }

          .about__subtitle {
            font-size: 0.875rem;
            line-height: 1.6;
            padding: 0 0.25rem;
          }

          /* Stats: keep 2-col but tighten padding + font so it doesn't feel cramped */
          .about__stats {
            gap: 0.75rem;
            margin-bottom: 3rem;
          }

          .about__stat-card {
            padding: 1.1rem 0.65rem;
            border-radius: 0.85rem;
          }

          .about__stat-icon {
            width: 2.75rem;
            height: 2.75rem;
            margin-bottom: 0.75rem;
          }

          .about__stat-number {
            font-size: 1.5rem;
          }

          .about__stat-label {
            font-size: 0.7rem;
            margin-top: 0.35rem;
            line-height: 1.3;
          }

          .about__stat-underline {
            margin-top: 0.75rem;
          }

          /* Content column */
          .about__content {
            gap: 2.5rem;
          }

          .about__heading {
            font-size: 1.4rem;
            margin-bottom: 1.15rem;
          }

          .about__points {
            gap: 0.85rem;
          }

          .about__point-text {
            font-size: 0.85rem;
          }

          .about__cta {
            display: block;
            text-align: center;
            width: 100%;
            margin-top: 1.5rem;
            padding: 0.9rem 1.5rem;
          }

          /* Visual card */
          .about__card {
            padding: 1.25rem;
            border-radius: 1.1rem;
          }

          .about__card-title {
            font-size: 1rem;
          }

          .about__card-subtitle {
            font-size: 0.7rem;
          }

          .about__badge-ontrack {
            font-size: 0.65rem;
            padding: 0.25rem 0.6rem;
          }

          .about__milestone-label {
            font-size: 0.78rem;
          }

          .about__milestone-pct {
            font-size: 0.7rem;
          }

          .about__card-footer {
            flex-wrap: wrap;
            gap: 1rem 0;
          }

          .about__footer-item {
            flex: 1 1 33%;
          }

          .about__footer-value {
            font-size: 0.95rem;
          }

          .about__footer-label {
            font-size: 0.62rem;
          }

          .about__ai-badge {
            width: 100%;
            justify-content: center;
          }
        }

        /* ══════════════════════════════════════════════════════════
           EXTRA-SMALL PHONES (≤380px)
           ══════════════════════════════════════════════════════════ */
        @media (max-width: 380px) {
          .about__title {
            font-size: 1.4rem;
          }

          .about__stat-number {
            font-size: 1.3rem;
          }

          .about__stat-label {
            font-size: 0.65rem;
          }

          .about__card-footer {
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }
        }
      `}</style>

      <div className="about__glow" />

      <div className="about__inner">

        {/* Title */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="about__title-wrap"
        >
          <div className="about__badge">
            <span className="about__badge-dot" />
            <span className="about__badge-text">About ReliaState</span>
          </div>
          <h2 className="about__title">
            Built for India's <span className="about__title-accent">Construction Industry</span>
          </h2>
          <p className="about__subtitle">
            We eliminate the chaos of construction — bringing every party onto one
            transparent, AI-powered platform that builds trust at every step.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="about__stats">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Two-column content */}
        <div className="about__content">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h3 className="about__heading">
              Why builders & clients<br />
              <span className="about__heading-accent">choose ReliaState</span>
            </h3>

            <div className="about__points">
              {ABOUT_POINTS.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="about__point"
                >
                  <div className="about__point-icon">
                    <div className="about__point-dot" />
                  </div>
                  <p className="about__point-text">{point}</p>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="#contact"
              onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="about__cta"
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
            className="about__visual"
          >
            <div className="about__card">
              <div className="about__card-glow" />

              <div className="about__card-header">
                <div>
                  <div className="about__card-title">Project Overview</div>
                  <div className="about__card-subtitle">Villa Construction — Phase 3</div>
                </div>
                <div className="about__badge-ontrack">On Track</div>
              </div>

              {MILESTONES.map((m, i) => (
                <div key={i} className="about__milestone">
                  <div className="about__milestone-row">
                    <span className="about__milestone-label">{m.label}</span>
                    <span
                      className="about__milestone-pct"
                      style={{ color: m.done ? '#4ade80' : m.pct > 0 ? '#c9a84c' : '#8fa3b8' }}
                    >
                      {m.done ? '✓ Done' : m.pct > 0 ? `${m.pct}%` : 'Pending'}
                    </span>
                  </div>
                  <div className="about__milestone-track">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeOut' }}
                      className="about__milestone-fill"
                      style={{
                        background: m.done
                          ? '#4ade80'
                          : m.pct > 0
                            ? 'linear-gradient(to right, #c9a84c, #f0d080)'
                            : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="about__card-footer">
                <div className="about__footer-item">
                  <div className="about__footer-value">Day 45</div>
                  <div className="about__footer-label">of 120</div>
                </div>
                <div className="about__footer-item">
                  <div className="about__footer-value">₹18.4L</div>
                  <div className="about__footer-label">spent of ₹28L</div>
                </div>
                <div className="about__footer-item">
                  <div className="about__footer-value">12</div>
                  <div className="about__footer-label">photos today</div>
                </div>
              </div>
            </div>

            {/* AI badge — moved inline below the card instead of absolutely
                positioned on top of it, so it can never overlap other content */}
            <div className="about__ai-badge">
              <div className="about__ai-icon">🤖</div>
              <div>
                <div className="about__ai-title">AI Assistant</div>
                <div className="about__ai-sub">Active 24/7</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}