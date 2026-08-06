import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowLeft, MapPin, Ruler, BedDouble, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { API_BASE } from '../services/api'

const STATUS_COLORS = {
  Completed: '#4ade80',
  'In Progress': '#c9a84c',
  Planning: '#fb923c',
}

export default function ProjectGallery() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [projectError, setProjectError] = useState(null)

  const [images, setImages] = useState([])
  const [nextPage, setNextPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingImages, setLoadingImages] = useState(false)
  const [imagesError, setImagesError] = useState(null)

  const [lightboxIndex, setLightboxIndex] = useState(null)
  const loadedPages = useRef(new Set())

  const { ref: sentinelRef, inView } = useInView({ rootMargin: '400px 0px' })

  // ── Load project meta (title, status, budget, description, count) ──
  useEffect(() => {
    let cancelled = false
    async function loadProject() {
      try {
        const res = await fetch(`${API_BASE}/api/portfolio/${id}/`)
        if (!res.ok) throw new Error(`Failed to load project (${res.status})`)
        const data = await res.json()
        if (!cancelled) setProject(data)
      } catch (err) {
        if (!cancelled) setProjectError(err.message)
      }
    }
    loadProject()
    return () => { cancelled = true }
  }, [id])

  // ── Load one page of gallery images ──
  const loadPage = useCallback(async (page) => {
    if (loadedPages.current.has(page)) return
    loadedPages.current.add(page)
    setLoadingImages(true)
    try {
      const res = await fetch(`${API_BASE}/api/portfolio/${id}/images/?page=${page}`)
      if (!res.ok) throw new Error(`Failed to load images (${res.status})`)
      const data = await res.json()
      // Expects DRF PageNumberPagination shape: { results, next, ... }
      setImages((prev) => [...prev, ...data.results])
      setHasMore(Boolean(data.next))
      setNextPage(page + 1)
      setImagesError(null)
    } catch (err) {
      setImagesError(err.message)
    } finally {
      setLoadingImages(false)
    }
  }, [id])

  useEffect(() => { loadPage(1) }, [loadPage])

  useEffect(() => {
    if (inView && hasMore && !loadingImages) loadPage(nextPage)
  }, [inView, hasMore, loadingImages, nextPage, loadPage])

  // ── Lightbox keyboard controls ──
  useEffect(() => {
    if (lightboxIndex === null) return
    function onKey(e) {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((i) => Math.min(i + 1, images.length - 1))
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, images.length])

  const statusColor = project ? (STATUS_COLORS[project.status] || '#8fa3b8') : '#8fa3b8'

  return (
    <section className="gal">
      <style>{`
        .gal { min-height: 100vh; background: #0d1826; padding: 2rem 1.5rem 5rem; }

        .gal__back {
          display: inline-flex; align-items: center; gap: 0.5rem;
          color: #8fa3b8; font-size: 0.85rem; font-weight: 600;
          background: none; border: none; cursor: pointer; padding: 0.5rem 0;
          transition: color 0.2s ease;
        }
        .gal__back:hover { color: #c9a84c; }

        .gal__header { max-width: 1280px; margin: 1.5rem auto 2.5rem; }
        .gal__eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0.85rem; border-radius: 9999px; margin-bottom: 1rem;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .gal__title {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700; font-size: 2.25rem; color: #e8d5a3; margin: 0 0 0.75rem;
        }
        .gal__desc { color: #8fa3b8; font-size: 0.95rem; max-width: 46rem; line-height: 1.7; margin: 0 0 1.25rem; }
        .gal__meta { display: flex; flex-wrap: wrap; gap: 1.25rem; font-size: 0.82rem; color: #8fa3b8; }
        .gal__meta-item { display: flex; align-items: center; gap: 0.35rem; }

        .gal__count {
          margin-top: 1.5rem; font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: #6b8099; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem;
        }

        .gal__grid {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.65rem;
        }
        @media (min-width: 640px)  { .gal__grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .gal__grid { grid-template-columns: repeat(4, 1fr); } }

        .gal__thumb {
          position: relative; aspect-ratio: 1 / 1; border-radius: 0.6rem; overflow: hidden;
          cursor: pointer; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
        }
        .gal__thumb img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.4s ease;
        }
        .gal__thumb:hover img { transform: scale(1.06); }
        .gal__thumb-order {
          position: absolute; bottom: 0.4rem; left: 0.5rem;
          font-size: 0.65rem; font-weight: 700; color: #f0d080;
          background: rgba(7,20,34,0.7); padding: 0.1rem 0.4rem; border-radius: 0.3rem;
        }

        .gal__sentinel { height: 1px; }
        .gal__state-msg { text-align: center; color: #8fa3b8; font-size: 0.9rem; padding: 2.5rem 0; }

        .gal__lightbox {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(7,12,20,0.96); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
        }
        .gal__lightbox-img { max-width: 90vw; max-height: 82vh; object-fit: contain; border-radius: 0.4rem; }
        .gal__lightbox-close, .gal__lightbox-prev, .gal__lightbox-next {
          position: absolute; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
          color: #e8d5a3; border-radius: 9999px; width: 2.5rem; height: 2.5rem;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .gal__lightbox-close { top: 1.5rem; right: 1.5rem; }
        .gal__lightbox-prev { left: 1.5rem; top: 50%; transform: translateY(-50%); }
        .gal__lightbox-next { right: 1.5rem; top: 50%; transform: translateY(-50%); }
        .gal__lightbox-counter {
          position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
          font-size: 0.75rem; color: #8fa3b8;
        }

        @media (max-width: 640px) {
          .gal { padding: 1.5rem 1rem 4rem; }
          .gal__title { font-size: 1.6rem; }
          .gal__grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
        }
      `}</style>

      <button className="gal__back" onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Back to projects
      </button>

      {projectError && <p className="gal__state-msg">Couldn't load this project right now.</p>}

      {project && (
        <div className="gal__header">
          <span className="gal__eyebrow" style={{ background: `${statusColor}18`, color: statusColor }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
            {project.status}
          </span>
          <h1 className="gal__title">{project.title}</h1>
          {project.description && <p className="gal__desc">{project.description}</p>}
          <div className="gal__meta">
            <span className="gal__meta-item"><MapPin size={13} color="#c9a84c99" />{project.location}</span>
            <span className="gal__meta-item"><Ruler size={13} color="#c9a84c99" />{project.area}</span>
            {project.beds && <span className="gal__meta-item"><BedDouble size={13} color="#c9a84c99" />{project.beds} BHK</span>}
            <span className="gal__meta-item">{project.budget}</span>
            <span className="gal__meta-item">{project.progress}% complete</span>
          </div>
          <div className="gal__count">
            {project.image_count} {project.image_count === 1 ? 'photo' : 'photos'} from the build
          </div>
        </div>
      )}

      {imagesError && images.length === 0 && (
        <p className="gal__state-msg">Couldn't load photos right now. Please try again shortly.</p>
      )}

      {!imagesError && images.length === 0 && !loadingImages && (
        <p className="gal__state-msg">No photos uploaded for this project yet.</p>
      )}

      <div className="gal__grid">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="gal__thumb"
              onClick={() => setLightboxIndex(i)}
            >
              <img src={img.image_url} alt={img.caption || `${project?.title || 'Project'} photo`} loading="lazy" />
              <span className="gal__thumb-order">{img.order + 1}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && <div ref={sentinelRef} className="gal__sentinel" />}
      {loadingImages && <p className="gal__state-msg">Loading more photos…</p>}

      {lightboxIndex !== null && images[lightboxIndex] && (
        <div className="gal__lightbox" onClick={() => setLightboxIndex(null)}>
          <button className="gal__lightbox-close" onClick={() => setLightboxIndex(null)}>
            <X size={18} />
          </button>

          {lightboxIndex > 0 && (
            <button
              className="gal__lightbox-prev"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i - 1) }}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <img
            className="gal__lightbox-img"
            src={images[lightboxIndex].image_url}
            alt={images[lightboxIndex].caption || 'Project photo'}
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < images.length - 1 && (
            <button
              className="gal__lightbox-next"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i + 1) }}
            >
              <ChevronRight size={20} />
            </button>
          )}

          <span className="gal__lightbox-counter">
            {lightboxIndex + 1} / {images.length}{hasMore ? '+' : ''}
          </span>
        </div>
      )}
    </section>
  )
}