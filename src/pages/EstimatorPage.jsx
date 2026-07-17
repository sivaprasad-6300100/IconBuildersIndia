import { useState, useMemo, useEffect } from 'react'
import { motion, animate } from 'framer-motion'
import {
  Home, Building2, Layers, MapPin, Sparkles, Wrench,
  Clock, Download, MessageCircle, CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ── Static data ──────────────────────────────────────────────────────────
const CITIES = [
  { name: 'Hyderabad', rate: 1750 },
  { name: 'Bangalore', rate: 2100 },
  { name: 'Mumbai', rate: 2600 },
  { name: 'Pune', rate: 1950 },
  { name: 'Chennai', rate: 1850 },
  { name: 'Delhi NCR', rate: 2200 },
]

const CONSTRUCTION_TYPES = [
  { id: 'residential', label: 'Residential Home', icon: Home },
  { id: 'villa', label: 'Villa', icon: Building2 },
  { id: 'apartment', label: 'Apartment', icon: Layers },
  { id: 'commercial', label: 'Commercial', icon: Building2 },
]

const QUALITY_TIERS = [
  { id: 'basic', label: 'Basic', multiplier: 1, desc: 'Standard fittings, functional finish' },
  { id: 'standard', label: 'Standard', multiplier: 1.3, desc: 'Branded fittings, quality tiles' },
  { id: 'premium', label: 'Premium', multiplier: 1.7, desc: 'Designer finish, modular interiors' },
  { id: 'luxury', label: 'Luxury', multiplier: 2.3, desc: 'Imported materials, bespoke design' },
]

const ADD_ONS = [
  { id: 'kitchen', label: 'Modular Kitchen', cost: 250000, icon: Wrench },
  { id: 'pool', label: 'Swimming Pool', cost: 800000, icon: Sparkles },
  { id: 'automation', label: 'Home Automation', cost: 150000, icon: Sparkles },
  { id: 'solar', label: 'Solar Panels', cost: 300000, icon: Sparkles },
  { id: 'landscape', label: 'Landscaping & Garden', cost: 200000, icon: Sparkles },
  { id: 'interior', label: 'Full Interior Design', costPerSqft: 350, icon: Wrench },
]

const BREAKDOWN = [
  { label: 'Structure', pct: 0.38, mod: 'structure' },
  { label: 'Finishing', pct: 0.24, mod: 'finishing' },
  { label: 'Labor', pct: 0.20, mod: 'labor' },
  { label: 'Materials', pct: 0.13, mod: 'materials' },
  { label: 'Taxes & Approvals', pct: 0.05, mod: 'taxes' },
]

function formatINR(num) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(num))
}

// Animated number ticker
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return <>₹{formatINR(display)}</>
}

export default function EstimatorPage() {
  const [plotSize, setPlotSize] = useState(1500)
  const [floors, setFloors] = useState(2)
  const [city, setCity] = useState(CITIES[0].name)
  const [type, setType] = useState('residential')
  const [quality, setQuality] = useState('standard')
  const [addOns, setAddOns] = useState([])

  const toggleAddOn = (id) =>
    setAddOns((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))

  const calc = useMemo(() => {
    const cityRate = CITIES.find((c) => c.name === city)?.rate || 1800
    const qualityMult = QUALITY_TIERS.find((q) => q.id === quality)?.multiplier || 1
    const floorsFactor = 1 + (floors - 1) * 0.82
    const typeAdj = type === 'commercial' ? 1.15 : type === 'villa' ? 1.1 : 1

    const baseCost = plotSize * cityRate * qualityMult * floorsFactor * typeAdj

    const addOnCost = addOns.reduce((sum, id) => {
      const item = ADD_ONS.find((a) => a.id === id)
      if (!item) return sum
      return sum + (item.costPerSqft ? item.costPerSqft * plotSize : item.cost)
    }, 0)

    const total = baseCost + addOnCost
    const perSqft = total / plotSize
    const months = Math.round(6 + floors * 2 + plotSize / 900)

    return { baseCost, addOnCost, total, perSqft, months }
  }, [plotSize, floors, city, type, quality, addOns])

  return (
    <div className="est">
      <style>{`
        .est {
          min-height: 100vh;
          background: linear-gradient(160deg, #050b14 0%, #0d1826 45%, #071422 100%);
          color: #e8d5a3;
          font-family: 'Inter', system-ui, sans-serif;
          padding-top: 7rem;
          padding-bottom: 6rem;
        }
        .est__display { font-family: Georgia, 'Times New Roman', serif; }

        /* ── Header ── */
        .est__header {
          max-width: 72rem;
          margin: 0 auto;
          padding: 0 1.5rem;
          margin-bottom: 3.5rem;
          text-align: center;
        }
        .est__eyebrow {
          display: inline-block;
          color: #c9a84c;
          font-size: 0.75rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        .est__title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 2.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 1rem;
        }
        @media (min-width: 768px) { .est__title { font-size: 3rem; } }
        .est__title-gradient {
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .est__subtitle {
          color: #8fa3b8;
          max-width: 36rem;
          margin: 0 auto;
        }

        /* ── Grid layout ── */
        .est__grid {
          max-width: 72rem;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 1024px) {
          .est__grid { grid-template-columns: 1.1fr 0.9fr; }
        }

        .est__left { display: flex; flex-direction: column; gap: 2rem; }

        /* ── Card shell ── */
        .est__card {
          background: linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1rem;
          padding: 1.5rem;
        }
        .est__card-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 1rem;
        }
        .est__label {
          font-size: 0.875rem;
          color: #8fa3b8;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .est__label--block { display: block; margin-bottom: 1rem; }
        .est__label--icon { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
        .est__value-lg {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.5rem;
          color: #c9a84c;
        }

        /* Range input */
        .est__range {
          width: 100%;
          accent-color: #c9a84c;
        }
        .est__range-minmax {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #5f7285;
          margin-top: 0.5rem;
        }

        /* Floors */
        .est__floor-group { display: flex; gap: 0.75rem; }
        .est__floor-btn {
          flex: 1;
          padding: 0.75rem 0;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.125rem;
          color: #8fa3b8;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .est__floor-btn:hover { border-color: rgba(201,168,76,0.4); }
        .est__floor-btn--active {
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          border-color: transparent;
          box-shadow: 0 0 16px rgba(201,168,76,0.25);
        }
        .est__floor-btn--active:hover { border-color: transparent; }

        /* City */
        .est__city-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .est__city-btn {
          padding: 0.625rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #8fa3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .est__city-btn:hover { border-color: rgba(201,168,76,0.3); }
        .est__city-btn--active {
          background: rgba(201,168,76,0.15);
          border-color: #c9a84c;
          color: #c9a84c;
        }

        /* Construction type */
        .est__type-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .est__type-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          font-size: 0.875rem;
          color: #8fa3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .est__type-btn:hover { border-color: rgba(201,168,76,0.3); }
        .est__type-btn--active {
          background: rgba(201,168,76,0.15);
          border-color: #c9a84c;
          color: #c9a84c;
        }

        /* Quality tiers */
        .est__quality-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .est__quality-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .est__quality-btn:hover { border-color: rgba(201,168,76,0.3); }
        .est__quality-btn--active {
          background: rgba(201,168,76,0.15);
          border-color: #c9a84c;
        }
        .est__quality-label { margin: 0; color: #ffffff; }
        .est__quality-label--active { color: #c9a84c; font-weight: 600; }
        .est__quality-desc { font-size: 0.75rem; color: #5f7285; margin: 0.15rem 0 0; }
        .est__quality-check { color: #c9a84c; flex-shrink: 0; }

        /* Add-ons */
        .est__addon-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .est__addon-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          font-size: 0.75rem;
          color: #8fa3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .est__addon-btn:hover { border-color: rgba(201,168,76,0.3); }
        .est__addon-btn--active {
          background: rgba(201,168,76,0.15);
          border-color: #c9a84c;
          color: #c9a84c;
        }

        /* ── Right column ── */
        .est__right {
          height: fit-content;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (min-width: 1024px) {
          .est__right { position: sticky; top: 7rem; }
        }

        .est__result {
          position: relative;
          background: linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01));
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          overflow: hidden;
        }
        .est__result-glow {
          position: absolute;
          top: -4rem;
          right: -4rem;
          width: 12rem;
          height: 12rem;
          background: rgba(201,168,76,0.1);
          border-radius: 9999px;
          filter: blur(48px);
          animation: est-float 5s ease-in-out infinite;
        }
        @keyframes est-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .est__result-label {
          color: #8fa3b8;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          margin: 0 0 0.5rem;
          position: relative;
        }
        .est__result-total {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 2.25rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
          position: relative;
        }
        @media (min-width: 768px) { .est__result-total { font-size: 3rem; } }
        .est__result-persqft {
          color: #c9a84c;
          font-size: 0.875rem;
          margin: 0 0 1.5rem;
          position: relative;
        }

        .est__breakdown { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; position: relative; }
        .est__bd-row-head {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #8fa3b8;
          margin-bottom: 0.25rem;
        }
        .est__bd-track {
          height: 0.375rem;
          background: rgba(255,255,255,0.05);
          border-radius: 9999px;
          overflow: hidden;
        }
        .est__bd-fill { height: 100%; border-radius: 9999px; }
        .est__bd-fill--structure { background: #c9a84c; }
        .est__bd-fill--finishing { background: #f0d080; }
        .est__bd-fill--labor { background: #8fa3b8; }
        .est__bd-fill--materials { background: #5f7285; }
        .est__bd-fill--taxes { background: #e8d5a3; }
        .est__bd-fill--addon { background: #c9a84c; width: 100%; }

        .est__timeline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #8fa3b8;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 1rem;
          position: relative;
        }
        .est__timeline-value { color: #ffffff; font-weight: 600; }

        .est__actions { display: flex; flex-direction: column; gap: 0.75rem; }
        .est__btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 0;
          border-radius: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          font-size: 1rem;
        }
        .est__btn--primary {
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          border: none;
          box-shadow: 0 0 16px rgba(201,168,76,0.25);
        }
        .est__btn--primary:hover { box-shadow: 0 0 26px rgba(201,168,76,0.4); }
        .est__btn--outline {
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          color: #8fa3b8;
        }
        .est__btn--outline:hover { border-color: rgba(201,168,76,0.4); color: #c9a84c; }

        .est__disclaimer {
          font-size: 0.75rem;
          color: #5f7285;
          text-align: center;
          padding: 0 1rem;
        }
      `}</style>

      {/* Header */}
      <div className="est__header">
        <span className="est__eyebrow">Estimate before you build</span>
        <h1 className="est__title">
          Smart Cost <span className="est__title-gradient">Estimator</span>
        </h1>
        <p className="est__subtitle">
          Move the sliders, pick your finish, and watch your construction budget take shape in real time.
        </p>
      </div>

      <div className="est__grid">
        {/* ── LEFT: Inputs ── */}
        <div className="est__left">

          {/* Plot size */}
          <div className="est__card">
            <div className="est__card-head">
              <label className="est__label">Plot Size</label>
              <span className="est__value-lg">{plotSize.toLocaleString('en-IN')} sq.ft</span>
            </div>
            <input
              type="range" min={500} max={10000} step={50}
              value={plotSize}
              onChange={(e) => setPlotSize(Number(e.target.value))}
              className="est__range"
            />
            <div className="est__range-minmax">
              <span>500 sq.ft</span><span>10,000 sq.ft</span>
            </div>
          </div>

          {/* Floors */}
          <div className="est__card">
            <label className="est__label est__label--block">Floors</label>
            <div className="est__floor-group">
              {[1, 2, 3, 4].map((f) => (
                <button
                  key={f}
                  onClick={() => setFloors(f)}
                  className={`est__floor-btn ${floors === f ? 'est__floor-btn--active' : ''}`}
                >
                  {f === 4 ? 'G+3' : f === 1 ? 'Ground' : `G+${f - 1}`}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="est__card">
            <label className="est__label est__label--icon">
              <MapPin size={14} color="#c9a84c" /> City
            </label>
            <div className="est__city-grid">
              {CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCity(c.name)}
                  className={`est__city-btn ${city === c.name ? 'est__city-btn--active' : ''}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Construction type */}
          <div className="est__card">
            <label className="est__label est__label--block">Construction Type</label>
            <div className="est__type-grid">
              {CONSTRUCTION_TYPES.map((t) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`est__type-btn ${type === t.id ? 'est__type-btn--active' : ''}`}
                  >
                    <Icon size={16} /> {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quality tier */}
          <div className="est__card">
            <label className="est__label est__label--block">Finish Quality</label>
            <div className="est__quality-list">
              {QUALITY_TIERS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setQuality(q.id)}
                  className={`est__quality-btn ${quality === q.id ? 'est__quality-btn--active' : ''}`}
                >
                  <div>
                    <p className={`est__quality-label ${quality === q.id ? 'est__quality-label--active' : ''}`}>{q.label}</p>
                    <p className="est__quality-desc">{q.desc}</p>
                  </div>
                  {quality === q.id && <CheckCircle2 size={18} className="est__quality-check" />}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="est__card">
            <label className="est__label est__label--block">Add-ons</label>
            <div className="est__addon-grid">
              {ADD_ONS.map((a) => {
                const Icon = a.icon
                const active = addOns.includes(a.id)
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAddOn(a.id)}
                    className={`est__addon-btn ${active ? 'est__addon-btn--active' : ''}`}
                  >
                    <Icon size={14} /> {a.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Live result (sticky) ── */}
        <div className="est__right">
          <motion.div layout className="est__result">
            <div className="est__result-glow" />
            <p className="est__result-label">Estimated Total Cost</p>
            <div className="est__result-total">
              <AnimatedNumber value={calc.total} />
            </div>
            <p className="est__result-persqft">≈ ₹{formatINR(calc.perSqft)} / sq.ft</p>

            {/* Breakdown bars */}
            <div className="est__breakdown">
              {BREAKDOWN.map((b) => (
                <div key={b.label}>
                  <div className="est__bd-row-head">
                    <span>{b.label}</span>
                    <span>₹{formatINR(calc.baseCost * b.pct)}</span>
                  </div>
                  <div className="est__bd-track">
                    <motion.div
                      className={`est__bd-fill est__bd-fill--${b.mod}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${b.pct * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
              {calc.addOnCost > 0 && (
                <div>
                  <div className="est__bd-row-head">
                    <span>Add-ons</span>
                    <span>₹{formatINR(calc.addOnCost)}</span>
                  </div>
                  <div className="est__bd-track">
                    <div className="est__bd-fill est__bd-fill--addon" />
                  </div>
                </div>
              )}
            </div>

            <div className="est__timeline">
              <Clock size={16} color="#c9a84c" />
              Estimated timeline: <span className="est__timeline-value">{calc.months} months</span>
            </div>
          </motion.div>

          <div className="est__actions">
            <Link to="/#contact" className="est__btn est__btn--primary">
              <MessageCircle size={18} /> Get a Detailed Quote
            </Link>
            <button onClick={() => window.print()} className="est__btn est__btn--outline">
              <Download size={18} /> Download Estimate
            </button>
          </div>

          <p className="est__disclaimer">
            This is an approximate estimate based on average regional rates. Final cost depends on site
            conditions, design complexity, and material choices confirmed after a site visit.
          </p>
        </div>
      </div>
    </div>
  )
}