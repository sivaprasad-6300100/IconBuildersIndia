import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, BedDouble, Ruler, ArrowUpRight } from 'lucide-react'

const PROJECTS = [
  {
    id: 1, title: 'Luxury Villa — Jubilee Hills', category: 'Villa',
    location: 'Hyderabad', beds: 4, area: '3200 sqft', budget: '₹1.8 Cr',
    status: 'Completed', statusColor: '#4ade80',
    progress: 100, emoji: '🏡', gradientFrom: 'rgba(146,64,14,0.35)',
    desc: 'Premium 4BHK villa with Italian marble flooring, home theatre, and smart home automation.',
  },
  {
    id: 2, title: 'Modern Apartment — Gachibowli', category: 'Apartment',
    location: 'Hyderabad', beds: 3, area: '1850 sqft', budget: '₹95 L',
    status: 'In Progress', statusColor: '#c9a84c',
    progress: 68, emoji: '🏢', gradientFrom: 'rgba(30,58,138,0.35)',
    desc: 'Contemporary 3BHK apartment with open floor plan, modular kitchen, and rooftop access.',
  },
  {
    id: 3, title: 'Commercial Complex — Kondapur', category: 'Commercial',
    location: 'Hyderabad', beds: null, area: '12000 sqft', budget: '₹4.2 Cr',
    status: 'In Progress', statusColor: '#60a5fa',
    progress: 42, emoji: '🏬', gradientFrom: 'rgba(30,41,59,0.55)',
    desc: 'G+3 commercial space with basement parking, glass facade, and modern interiors.',
  },
  {
    id: 4, title: 'Duplex Home — Banjara Hills', category: 'Villa',
    location: 'Hyderabad', beds: 5, area: '4500 sqft', budget: '₹2.6 Cr',
    status: 'Completed', statusColor: '#4ade80',
    progress: 100, emoji: '🏠', gradientFrom: 'rgba(6,78,59,0.35)',
    desc: 'Stunning duplex with private pool, landscaped garden, and premium imported fixtures.',
  },
  {
    id: 5, title: 'Budget Apartment — Miyapur', category: 'Apartment',
    location: 'Hyderabad', beds: 2, area: '1100 sqft', budget: '₹52 L',
    status: 'Completed', statusColor: '#4ade80',
    progress: 100, emoji: '🏗', gradientFrom: 'rgba(88,28,135,0.35)',
    desc: 'Affordable 2BHK with quality finishes, vastu compliance, and great connectivity.',
  },
  {
    id: 6, title: 'IT Office Space — HITEC City', category: 'Commercial',
    location: 'Hyderabad', beds: null, area: '8500 sqft', budget: '₹3.1 Cr',
    status: 'Planning', statusColor: '#fb923c',
    progress: 15, emoji: '🏛', gradientFrom: 'rgba(124,45,18,0.3)',
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
      className="proj__card"
    >
      <div
        className="proj__banner"
        style={{ background: `linear-gradient(135deg, ${project.gradientFrom} 0%, #0d1826 100%)` }}
      >
        <motion.span
          animate={{ scale: hovered ? 1.2 : 1, rotate: hovered ? 5 : 0 }}
          transition={{ duration: 0.3 }}
          className="proj__emoji"
        >
          {project.emoji}
        </motion.span>

        <div className="proj__grid-overlay" />

        <div
          className="proj__status"
          style={{
            background: `${project.statusColor}18`,
            borderColor: `${project.statusColor}40`,
            color: project.statusColor,
          }}
        >
          <span className="proj__status-dot" style={{ background: project.statusColor }} />
          {project.status}
        </div>

        <div className="proj__budget">{project.budget}</div>

        <div className="proj__progress-track">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${project.progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="proj__progress-fill"
          />
        </div>
      </div>

      <div className="proj__body">
        <h3 className="proj__title">{project.title}</h3>
        <p className="proj__desc">{project.desc}</p>

        <div className="proj__meta">
          <span className="proj__meta-item"><MapPin size={11} color="#c9a84c99" />{project.location}</span>
          <span className="proj__meta-item"><Ruler size={11} color="#c9a84c99" />{project.area}</span>
          {project.beds && (
            <span className="proj__meta-item"><BedDouble size={11} color="#c9a84c99" />{project.beds} BHK</span>
          )}
        </div>

        <div className="proj__footer">
          <div className="proj__pct">{project.progress}% Complete</div>
          <motion.div
            animate={{ x: hovered ? 3 : 0, y: hovered ? -3 : 0 }}
            className="proj__arrow"
          >
            <ArrowUpRight size={13} color={hovered ? '#c9a84c' : 'rgba(201,168,76,0.5)'} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProjectShowcase() {
  const [activeTab, setActiveTab] = useState('All')
  const filtered = activeTab === 'All' ? PROJECTS : PROJECTS.filter((p) => p.category === activeTab)

  return (
    <section id="projects" className="proj">
      <style>{`
        .proj {
        position: relative;
overflow: hidden;
// background: linear-gradient(180deg, rgba(13,24,38,0.7) 0%, rgba(20,28,20,0.6) 100%);
// backdrop-filter: blur(1px);
// -webkit-backdrop-filter: blur(1px);
background: rgba(13, 24, 38, 0.55);
backdrop-filter: blur(2px);
-webkit-backdrop-filter: blur(2px);
padding: 6rem 1.5rem;

        }

        .proj__top-border, .proj__bottom-border {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent);
        }
        .proj__top-border { top: 0; }
        .proj__bottom-border { bottom: 0; }

        .proj__inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── Title ── */
        .proj__title-wrap {
          text-align: center;
          margin-bottom: 3rem;
        }
        .proj__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.06);
          margin-bottom: 1rem;
        }
        .proj__badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #c9a84c;
        }
        .proj__badge-text {
          color: #c9a84c; font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
        }
        .proj__heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 2rem;
          line-height: 1.2;
          color: #e8d5a3;
          margin: 0 0 1rem;
        }
        .proj__heading-accent { color: #c9a84c; }
        @media (min-width: 640px)  { .proj__heading { font-size: 2.75rem; } }
        @media (min-width: 1024px) { .proj__heading { font-size: 3.25rem; } }
        .proj__subtitle {
          color: #8fa3b8;
          font-size: 1rem;
          max-width: 42rem;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Tabs ── */
        .proj__tabs {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
        }
        .proj__tab {
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: #8fa3b8;
          transition: all 0.2s ease;
        }
        .proj__tab:hover {
          color: #e8d5a3;
          border-color: rgba(201,168,76,0.25);
        }
        .proj__tab--active {
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          border-color: transparent;
          box-shadow: 0 0 16px rgba(201,168,76,0.3);
        }
        .proj__tab--active:hover {
          color: #071422;
        }

        /* ── Grid ── */
        .proj__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 640px)  { .proj__grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .proj__grid { grid-template-columns: repeat(3, 1fr); } }

        /* ── Card ── */
        .proj__card {
          position: relative;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          overflow: hidden;
          cursor: default;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .proj__card:hover {
          border-color: rgba(201,168,76,0.3);
          transform: translateY(-6px);
        }

        .proj__banner {
          position: relative;
          height: 11rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .proj__emoji {
          font-size: 3.75rem;
          user-select: none;
        }

        .proj__grid-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.25;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(201,168,76,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.1) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .proj__status {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.7rem;
          border-radius: 9999px;
          border: 1px solid;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .proj__status-dot {
          width: 6px; height: 6px; border-radius: 50%;
        }

        .proj__budget {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 0.5rem;
          padding: 0.3rem 0.65rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #c9a84c;
        }

        .proj__progress-track {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 4px;
          background: rgba(255,255,255,0.1);
        }
        .proj__progress-fill {
          height: 100%;
          background: linear-gradient(to right, #c9a84c, #f0d080);
        }

        .proj__body {
          padding: 1.25rem;
        }

        .proj__title {
          color: #e8d5a3;
          font-weight: 700;
          font-size: 1rem;
          margin: 0 0 0.4rem;
          transition: color 0.3s ease;
        }
        .proj__card:hover .proj__title { color: #c9a84c; }

        .proj__desc {
          color: #8fa3b8;
          font-size: 0.78rem;
          line-height: 1.55;
          margin: 0 0 1rem;
        }

        .proj__meta {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
          font-size: 0.75rem;
          color: #8fa3b8;
        }
        .proj__meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .proj__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
        }
        .proj__pct {
          font-size: 0.72rem;
          color: #6b8099;
        }
        .proj__arrow {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(201,168,76,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Bottom CTA ── */
        .proj__cta-wrap {
          text-align: center;
          margin-top: 3rem;
        }
        .proj__cta-text {
          color: #8fa3b8;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        .proj__cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          font-size: 0.875rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 0 20px rgba(201,168,76,0.25);
          transition: box-shadow 0.2s ease;
        }
        .proj__cta-btn:hover { box-shadow: 0 0 32px rgba(201,168,76,0.4); }

        /* ══════════════════════════════════════════
           MOBILE (≤640px)
           ══════════════════════════════════════════ */
        @media (max-width: 640px) {
          .proj { padding: 3.5rem 1rem; }
          .proj__title-wrap { margin-bottom: 2rem; }
          .proj__heading { font-size: 1.6rem; margin-bottom: 0.75rem; }
          .proj__subtitle { font-size: 0.875rem; }
          .proj__tabs { margin-bottom: 2rem; }
          .proj__tab { padding: 0.45rem 1rem; font-size: 0.78rem; }
          .proj__grid { gap: 1rem; }
          .proj__banner { height: 9rem; }
          .proj__emoji { font-size: 3rem; }
          .proj__body { padding: 1rem; }
          .proj__title { font-size: 0.95rem; }
          .proj__desc { font-size: 0.75rem; }
          .proj__cta-wrap { margin-top: 2rem; }
          .proj__cta-btn { width: 100%; justify-content: center; }
        }

        @media (max-width: 380px) {
          .proj__heading { font-size: 1.4rem; }
        }
      `}</style>

      <div className="proj__top-border" />

      <div className="proj__inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="proj__title-wrap"
        >
          <div className="proj__badge">
            <span className="proj__badge-dot" />
            <span className="proj__badge-text">Our Projects</span>
          </div>
          <h2 className="proj__heading">
            Built with Pride,
            <br />
            <span className="proj__heading-accent">Delivered with Precision</span>
          </h2>
          <p className="proj__subtitle">
            Every project tracked live on ReliaState — from foundation to final handover.
          </p>
        </motion.div>

        <div className="proj__tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`proj__tab ${activeTab === tab ? 'proj__tab--active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <motion.div layout className="proj__grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="proj__cta-wrap"
        >
          <p className="proj__cta-text">Want to see your project here?</p>
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="proj__cta-btn"
          >
            Start Your Project Today
          </a>
        </motion.div>
      </div>

      <div className="proj__bottom-border" />
    </section>
  )
}