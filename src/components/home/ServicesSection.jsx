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
    accent: '#5b9bd5',
  },
  {
    icon: Bot,
    title: 'AI Chatbot Assistant',
    desc: '24/7 intelligent support powered by Claude AI. Answers pricing queries, material questions, and project guidance instantly.',
    tag: 'AI Powered',
    accent: '#c9a84c',
    highlight: true,
  },
  {
    icon: Calculator,
    title: 'Smart Cost Estimator',
    desc: 'Get an accurate construction budget in 60 seconds. Enter plot size, floors, city — get a full breakdown instantly.',
    tag: 'Lead Generation',
    accent: '#4ade80',
  },
  {
    icon: Camera,
    title: 'Photo Progress Logs',
    desc: 'Contractors upload daily site photos. Clients see real progress with timestamped images organized by milestone.',
    tag: 'Transparency',
    accent: '#a78bfa',
  },
  {
    icon: Shield,
    title: 'Secure OTP Login',
    desc: 'Bank-level security with OTP-based authentication. Role-based access ensures clients see only their own project.',
    tag: 'Security',
    accent: '#f87171',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Instant alerts when milestones are reached, photos uploaded, or payments are due. Stay informed without checking in.',
    tag: 'Real-time',
    accent: '#fb923c',
  },
  {
    icon: FileText,
    title: 'Digital Reports',
    desc: 'Auto-generated progress reports, payment receipts, and project summaries. Everything documented and downloadable.',
    tag: 'Documentation',
    accent: '#2dd4bf',
  },
  {
    icon: Users,
    title: 'Admin Control Panel',
    desc: 'Full platform management — users, projects, milestones, inquiries, and analytics. Complete control from one place.',
    tag: 'Management',
    accent: '#94a3b8',
  },
]

function ServiceCard({ service, index }) {
  const cardRef = useRef()
  const Icon = service.icon

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotateX = ((y - cy) / cy) * -6
    const rotateY = ((x - cx) / cx) * 6
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`
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
      className="svc__cell"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`svc__card ${service.highlight ? 'svc__card--highlight' : ''}`}
        style={{ '--accent': service.accent }}
      >
        <div className="svc__card-bg" />
        {service.highlight && <div className="svc__card-glow" />}

        <div className="svc__tag">
          <span className="svc__tag-dot" />
          <span className="svc__tag-text">{service.tag}</span>
        </div>

        <div className="svc__icon">
          <Icon size={22} color={service.highlight ? '#c9a84c' : 'rgba(232,213,163,0.75)'} />
        </div>

        <h3 className="svc__title">{service.title}</h3>
        <p className="svc__desc">{service.desc}</p>

        <div className="svc__learn">
          <span>Learn more</span>
          <span>→</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function ServicesSection() {
  return (
    <section id="services" className="svc">
      <style>{`
        .svc {
          position: relative;
          overflow: hidden;
          // background: linear-gradient(180deg, rgba(13,24,38,0.7) 0%, rgba(20,28,20,0.6) 100%);
          // backdrop-filter: blur(1px);
          // -webkit-backdrop-filter: blur(1px);
          background: rgba(13, 24, 38, 0.55);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(2px);
          padding: 6rem 1.5rem;
        }

        .svc__top-border,
        .svc__bottom-border {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent);
        }
        .svc__top-border { top: 0; }
        .svc__bottom-border { bottom: 0; }

        .svc__grid-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.35;
          background-image:
            linear-gradient(rgba(201,168,76,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.035) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .svc__inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── Title ── */
        .svc__title-wrap {
          text-align: center;
          margin-bottom: 4rem;
        }

        .svc__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.06);
          margin-bottom: 1rem;
        }
        .svc__badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a84c;
        }
        .svc__badge-text {
          color: #c9a84c;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .svc__heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 2rem;
          line-height: 1.2;
          color: #e8d5a3;
          margin: 0 0 1rem;
        }
        .svc__heading-accent { color: #c9a84c; }
        @media (min-width: 640px)  { .svc__heading { font-size: 2.75rem; } }
        @media (min-width: 1024px) { .svc__heading { font-size: 3.25rem; } }

        .svc__subtitle {
          color: #8fa3b8;
          font-size: 1rem;
          max-width: 42rem;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Grid ── */
        .svc__cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.1rem;
        }
        @media (min-width: 640px)  { .svc__cards { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .svc__cards { grid-template-columns: repeat(4, 1fr); gap: 1.25rem; } }

        .svc__cell {
          height: 100%;
        }

        /* ── Card ── */
        .svc__card {
          position: relative;
          height: 100%;
          min-height: 280px;
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 1rem;
          padding: 1.5rem;
          overflow: hidden;
          cursor: default;
          transition: transform 0.15s ease, border-color 0.3s ease;
        }
        .svc__card:hover {
          border-color: color-mix(in srgb, var(--accent) 45%, transparent);
        }
        .svc__card--highlight {
          border-color: rgba(201,168,76,0.25);
          box-shadow: 0 0 24px rgba(201,168,76,0.1);
        }

        .svc__card-bg {
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s ease;
          background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%);
        }
        .svc__card:hover .svc__card-bg {
          opacity: 1;
        }

        .svc__card-glow {
          position: absolute;
          top: -1.5rem;
          right: -1.5rem;
          width: 6rem;
          height: 6rem;
          border-radius: 50%;
          background: rgba(201,168,76,0.12);
          filter: blur(32px);
          pointer-events: none;
        }

        .svc__tag {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.65rem;
          border-radius: 9999px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 1rem;
          align-self: flex-start;
        }
        .svc__tag-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent);
        }
        .svc__tag-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8fa3b8;
        }

        .svc__icon {
          position: relative;
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.3s ease;
        }
        .svc__card--highlight .svc__icon {
          background: rgba(201,168,76,0.15);
          border-color: rgba(201,168,76,0.25);
        }
        .svc__card:hover .svc__icon {
          transform: scale(1.08);
        }

        .svc__title {
          position: relative;
          color: #e8d5a3;
          font-weight: 700;
          font-size: 1.1rem;
          line-height: 1.35;
          margin: 0 0 0.65rem;
        }

        .svc__desc {
          position: relative;
          color: #8fa3b8;
          font-size: 0.875rem;
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }

        .svc__learn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          margin-top: 1.15rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: transparent;
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .svc__card:hover .svc__learn {
          color: rgba(201,168,76,0.75);
          transform: translateX(4px);
        }

        /* ══════════════════════════════════════════════
           MOBILE (≤640px)
           ══════════════════════════════════════════════ */
        @media (max-width: 640px) {
          .svc { padding: 3.5rem 1rem; }

          .svc__title-wrap { margin-bottom: 2.5rem; }

          .svc__heading { font-size: 1.6rem; margin-bottom: 0.75rem; }

          .svc__subtitle { font-size: 0.875rem; padding: 0 0.25rem; }

          .svc__cards { gap: 1rem; }

          .svc__card {
            min-height: unset;
            padding: 1.25rem;
          }

          .svc__icon {
            width: 2.6rem;
            height: 2.6rem;
            margin-bottom: 0.85rem;
          }

          .svc__title { font-size: 1rem; }

          .svc__desc { font-size: 0.82rem; }

          .svc__learn { margin-top: 0.9rem; }

          /* tilt effect feels off on touch devices — disable transform on hover-less screens */
          .svc__card { transform: none !important; }
        }

        @media (max-width: 380px) {
          .svc__heading { font-size: 1.4rem; }
          .svc__title { font-size: 0.95rem; }
        }
      `}</style>

      <div className="svc__top-border" />
      <div className="svc__grid-bg" />

      <div className="svc__inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="svc__title-wrap"
        >
          <div className="svc__badge">
            <span className="svc__badge-dot" />
            <span className="svc__badge-text">Our Services</span>
          </div>
          <h2 className="svc__heading">
            Everything You Need
            <br />
            <span className="svc__heading-accent">In One Platform</span>
          </h2>
          <p className="svc__subtitle">
            From first estimate to final handover — IconBuilders covers every stage
            of your construction journey with intelligent tools.
          </p>
        </motion.div>

        <div className="svc__cards">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>

      <div className="svc__bottom-border" />
    </section>
  )
}