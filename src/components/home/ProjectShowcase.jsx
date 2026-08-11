import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ArrowUpRight, LayoutGrid } from 'lucide-react'
import { API_BASE } from '../../services/api'

const CATEGORY_ORDER = ['Villa', 'Apartment', 'Row House', 'Plot', 'Commercial', 'Real Images']


const STATUS_COLORS = {
  Completed: '#4ade80',
  'In Progress': '#c9a84c',
  Planning: '#fb923c',
}

function CategoryCard({ card, index, onClick }) {
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
      onClick={onClick}
      className="proj__card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      <div className="proj__banner">
        {card.image ? (
          <img src={card.image} alt={card.category} className="proj__banner-img" />
        ) : (
          <motion.span
            animate={{ scale: hovered ? 1.2 : 1, rotate: hovered ? 5 : 0 }}
            transition={{ duration: 0.3 }}
            className="proj__emoji"
          >
            🏗️
          </motion.span>
        )}

        <div className="proj__grid-overlay" />

        <div className="proj__budget">
          <LayoutGrid size={11} style={{ marginRight: 4, display: 'inline' }} />
          {card.count} {card.count === 1 ? 'Project' : 'Projects'}
        </div>
      </div>

      <div className="proj__body">
        <h3 className="proj__title">{card.category}</h3>
        <p className="proj__desc">{card.desc}</p>

        {card.location && (
          <div className="proj__meta">
            <span className="proj__meta-item"><MapPin size={11} color="#c9a84c99" />{card.location}</span>
          </div>
        )}

        <div className="proj__footer">
          <div className="proj__pct">View all {card.category.toLowerCase()} projects</div>
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
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/portfolio/`)
        if (!res.ok) throw new Error(`Failed to load projects (${res.status})`)
        const data = await res.json()

        const normalized = data.map((p) => ({
          ...p,
          statusColor: STATUS_COLORS[p.status] || '#8fa3b8',
        }))

        if (!cancelled) {
          setProjects(normalized)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProjects()
    return () => { cancelled = true }
  }, [])

  // Group all projects by category, then collapse each group into a
  // single representative card (prefer one that actually has an image).
  const categoryCards = (() => {
    const grouped = {}
    projects.forEach((p) => {
      if (!grouped[p.category]) grouped[p.category] = []
      grouped[p.category].push(p)
    })

    const categories = Object.keys(grouped).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a)
      const bi = CATEGORY_ORDER.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })

    return categories.map((category) => {
      const list = grouped[category]
      const representative = list.find((p) => p.image) || list[0]
      return {
        category,
        image: representative.image,
        location: representative.location,
        count: list.length,
        desc: `Explore our ${category.toLowerCase()} projects — from ongoing builds to completed handovers.`,
      }
    })
  })()


  const handleCardClick = (category) => {
    const slug = category.toLowerCase().replace(/\s+/g, '-')
    navigate(`/portfolio/${slug}`)
  }

  return (
    <section id="projects" className="proj">
      <style>{`
        .proj {
          position: relative;
          overflow: hidden;
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

        .proj__title-wrap { text-align: center; margin-bottom: 3rem; }
        .proj__badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 1rem; border-radius: 9999px;
          border: 1px solid rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.06);
          margin-bottom: 1rem;
        }
        .proj__badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #c9a84c; }
        .proj__badge-text {
          color: #c9a84c; font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
        }
        .proj__heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700; font-size: 2rem; line-height: 1.2;
          color: #e8d5a3; margin: 0 0 1rem;
        }
        .proj__heading-accent { color: #c9a84c; }
        @media (min-width: 640px)  { .proj__heading { font-size: 2.75rem; } }
        @media (min-width: 1024px) { .proj__heading { font-size: 3.25rem; } }
        .proj__subtitle { color: #8fa3b8; font-size: 1rem; max-width: 42rem; margin: 0 auto; line-height: 1.7; }

        .proj__grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
        @media (min-width: 640px)  { .proj__grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .proj__grid { grid-template-columns: repeat(3, 1fr); } }

        .proj__card {
          position: relative;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .proj__card:hover { border-color: rgba(201,168,76,0.3); transform: translateY(-6px); }

        .proj__banner { position: relative; height: 12rem; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .proj__emoji { font-size: 3.75rem; user-select: none; }
        .proj__banner-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }

        .proj__grid-overlay {
          position: absolute; inset: 0; opacity: 0.25; pointer-events: none;
          background-image:
            linear-gradient(rgba(201,168,76,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.1) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .proj__budget {
          position: absolute; top: 0.75rem; left: 0.75rem;
          background: rgba(255,255,255,0.05); backdrop-filter: blur(6px);
          border: 1px solid rgba(201,168,76,0.25); border-radius: 0.5rem;
          padding: 0.3rem 0.65rem; font-size: 0.72rem; font-weight: 700; color: #c9a84c;
        }

        .proj__body { padding: 1.25rem; }
        .proj__title { color: #e8d5a3; font-weight: 700; font-size: 1.15rem; margin: 0 0 0.4rem; transition: color 0.3s ease; }
        .proj__card:hover .proj__title { color: #c9a84c; }
        .proj__desc { color: #8fa3b8; font-size: 0.78rem; line-height: 1.55; margin: 0 0 1rem; }

        .proj__meta { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; font-size: 0.75rem; color: #8fa3b8; margin-bottom: 0.75rem; }
        .proj__meta-item { display: flex; align-items: center; gap: 0.3rem; }

        .proj__footer { display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; }
        .proj__pct { font-size: 0.72rem; color: #6b8099; }
        .proj__arrow {
          width: 1.75rem; height: 1.75rem; border-radius: 0.5rem;
          border: 1px solid rgba(201,168,76,0.25);
          display: flex; align-items: center; justify-content: center;
        }

        .proj__cta-wrap { text-align: center; margin-top: 3rem; }
        .proj__cta-text { color: #8fa3b8; font-size: 0.9rem; margin-bottom: 1rem; }
        .proj__cta-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 1rem 2rem; border-radius: 0.75rem;
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422; font-size: 0.875rem; font-weight: 700;
          text-decoration: none; box-shadow: 0 0 20px rgba(201,168,76,0.25);
          transition: box-shadow 0.2s ease;
        }
        .proj__cta-btn:hover { box-shadow: 0 0 32px rgba(201,168,76,0.4); }

        .proj__state-msg {
          text-align: center;
          color: #8fa3b8;
          font-size: 0.9rem;
          padding: 3rem 0;
        }

        @media (max-width: 640px) {
          .proj { padding: 3.5rem 1rem; }
          .proj__title-wrap { margin-bottom: 2rem; }
          .proj__heading { font-size: 1.6rem; margin-bottom: 0.75rem; }
          .proj__subtitle { font-size: 0.875rem; }
          .proj__grid { gap: 1rem; }
          .proj__banner { height: 10rem; }
          .proj__emoji { font-size: 3rem; }
          .proj__body { padding: 1rem; }
          .proj__title { font-size: 1.05rem; }
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
            Every project tracked live on IconBuilders — from foundation to final handover.
          </p>
        </motion.div>

        {loading && <p className="proj__state-msg">Loading projects…</p>}

        {!loading && error && (
          <p className="proj__state-msg">Couldn't load projects right now. Please try again shortly.</p>
        )}

        {!loading && !error && categoryCards.length === 0 && (
          <p className="proj__state-msg">No projects published yet.</p>
        )}

        {!loading && !error && categoryCards.length > 0 && (
          <motion.div layout className="proj__grid">
            <AnimatePresence mode="popLayout">
              {categoryCards.map((card, i) => (
                <CategoryCard
                  key={card.category}
                  card={card}
                  index={i}
                  onClick={() => handleCardClick(card.category)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="proj__cta-wrap"
        >
          <p className="proj__cta-text">Want to see your project here?</p>
          
          <a href="#contact"
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