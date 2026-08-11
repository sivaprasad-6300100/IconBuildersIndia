import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, BedDouble, Ruler, ArrowUpRight } from 'lucide-react'
import { API_BASE } from '../services/api'

const CATEGORY_LABELS = {
  villa: 'Villa',
  apartment: 'Apartment',
  'row-house': 'Row House',
   plot: 'Plot',
  commercial: 'Commercial',
  'real-images': 'Real Images',
}

const STATUS_COLORS = {
  Completed: '#4ade80',
  'In Progress': '#c9a84c',
  Planning: '#fb923c',
}

function ProjectCard({ project, index, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onClick={onClick}
      className="cat__card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      <div className="cat__banner">
        {project.image
          ? <img src={project.image} alt={project.title} className="cat__banner-img" />
          : <span className="cat__emoji">🏗️</span>}

        <div
          className="cat__status"
          style={{
            background: `${STATUS_COLORS[project.status] || '#8fa3b8'}18`,
            borderColor: `${STATUS_COLORS[project.status] || '#8fa3b8'}40`,
            color: STATUS_COLORS[project.status] || '#8fa3b8',
          }}
        >
          {project.status}
        </div>
        <div className="cat__budget">{project.budget}</div>
      </div>

      <div className="cat__body">
        <h3 className="cat__title">{project.title}</h3>
        <p className="cat__desc">{project.desc}</p>
        <div className="cat__meta">
          <span className="cat__meta-item"><MapPin size={11} color="#c9a84c99" />{project.location}</span>
          <span className="cat__meta-item"><Ruler size={11} color="#c9a84c99" />{project.area}</span>
          {project.beds && <span className="cat__meta-item"><BedDouble size={11} color="#c9a84c99" />{project.beds} BHK</span>}
        </div>
        <div className="cat__footer">
          <span className="cat__photo-count">{project.image_count} photos</span>
          <ArrowUpRight size={13} color="rgba(201,168,76,0.6)" />
        </div>
      </div>
    </motion.div>
  )
}

export default function CategoryPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const label = CATEGORY_LABELS[category?.toLowerCase()] || category

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/portfolio/?category=${encodeURIComponent(label)}`)
        if (!res.ok) throw new Error(`Failed to load (${res.status})`)
        const data = await res.json()
        if (!cancelled) { setProjects(data); setError(null) }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [label])

  return (
    <section className="cat">
      <style>{`
        .cat { min-height: 100vh; background: #0d1826; padding: 2rem 1.5rem 4rem; }
        .cat__back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          color: #c9a84c; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; margin-bottom: 1.5rem; background: none; border: none;
        }
        .cat__header { max-width: 1280px; margin: 0 auto 2rem; }
        .cat__title-main {
          font-family: 'Playfair Display', Georgia, serif;
          color: #e8d5a3; font-size: 2rem; margin: 0 0 0.4rem;
        }
        .cat__sub { color: #8fa3b8; font-size: 0.9rem; }
        .cat__grid {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;
        }
        @media (min-width: 640px)  { .cat__grid { grid-template-columns: repeat(2, 1fr); gap: 1.25rem; } }
        @media (min-width: 1024px) { .cat__grid { grid-template-columns: repeat(3, 1fr); } }

        .cat__card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .cat__card:hover { border-color: rgba(201,168,76,0.3); transform: translateY(-6px); }

        .cat__banner { position: relative; height: 11rem; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #0d1826; }
        .cat__banner-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .cat__emoji { font-size: 3.5rem; }

        .cat__status {
          position: absolute; top: 0.75rem; right: 0.75rem;
          padding: 0.3rem 0.7rem; border-radius: 9999px; border: 1px solid;
          font-size: 0.7rem; font-weight: 700;
        }
        .cat__budget {
          position: absolute; top: 0.75rem; left: 0.75rem;
          background: rgba(255,255,255,0.05); backdrop-filter: blur(6px);
          border: 1px solid rgba(201,168,76,0.25); border-radius: 0.5rem;
          padding: 0.3rem 0.65rem; font-size: 0.72rem; font-weight: 700; color: #c9a84c;
        }

        .cat__body { padding: 1.25rem; }
        .cat__title { color: #e8d5a3; font-weight: 700; font-size: 1rem; margin: 0 0 0.4rem; }
        .cat__desc { color: #8fa3b8; font-size: 0.78rem; line-height: 1.55; margin: 0 0 1rem; }
        .cat__meta { display: flex; gap: 0.85rem; flex-wrap: wrap; font-size: 0.75rem; color: #8fa3b8; }
        .cat__meta-item { display: flex; align-items: center; gap: 0.3rem; }
        .cat__footer { display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; }
        .cat__photo-count { font-size: 0.72rem; color: #6b8099; }

        .cat__state-msg { text-align: center; color: #8fa3b8; font-size: 0.9rem; padding: 3rem 0; }
      `}</style>

      <button className="cat__back" onClick={() => navigate('/#projects')}>
        <ArrowLeft size={16} /> Back to All Projects
      </button>

      <div className="cat__header">
        <h1 className="cat__title-main">{label} Projects</h1>
        <p className="cat__sub">{projects.length} {label.toLowerCase()} project{projects.length === 1 ? '' : 's'}</p>
      </div>

      {loading && <p className="cat__state-msg">Loading projects…</p>}
      {!loading && error && <p className="cat__state-msg">Couldn't load projects right now.</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="cat__state-msg">No {label.toLowerCase()} projects yet.</p>
      )}

      {!loading && !error && projects.length > 0 && (
        <motion.div layout className="cat__grid">
          <AnimatePresence mode="popLayout">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}