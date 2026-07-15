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
  { label: 'Structure', pct: 0.38, color: 'bg-gold' },
  { label: 'Finishing', pct: 0.24, color: 'bg-gold-light' },
  { label: 'Labor', pct: 0.20, color: 'bg-slate-soft' },
  { label: 'Materials', pct: 0.13, color: 'bg-slate-muted' },
  { label: 'Taxes & Approvals', pct: 0.05, color: 'bg-cream' },
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
    <div className="min-h-screen bg-navy-gradient text-cream font-body pt-28 pb-24">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-14 text-center">
        <span className="inline-block text-gold text-xs tracking-[0.3em] uppercase mb-4 font-semibold">
          Estimate before you build
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Smart Cost <span className="text-transparent bg-clip-text bg-gold-gradient">Estimator</span>
        </h1>
        <p className="text-slate-soft max-w-xl mx-auto">
          Move the sliders, pick your finish, and watch your construction budget take shape in real time.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        {/* ── LEFT: Inputs ── */}
        <div className="space-y-8">

          {/* Plot size */}
          <div className="bg-card-gradient border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-baseline mb-4">
              <label className="text-sm text-slate-soft uppercase tracking-wide">Plot Size</label>
              <span className="font-display text-2xl text-gold">{plotSize.toLocaleString('en-IN')} sq.ft</span>
            </div>
            <input
              type="range" min={500} max={10000} step={50}
              value={plotSize}
              onChange={(e) => setPlotSize(Number(e.target.value))}
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-xs text-slate-muted mt-2">
              <span>500 sq.ft</span><span>10,000 sq.ft</span>
            </div>
          </div>

          {/* Floors */}
          <div className="bg-card-gradient border border-white/10 rounded-2xl p-6">
            <label className="text-sm text-slate-soft uppercase tracking-wide block mb-4">Floors</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((f) => (
                <button
                  key={f}
                  onClick={() => setFloors(f)}
                  className={`flex-1 py-3 rounded-xl border font-display text-lg transition-all ${
                    floors === f
                      ? 'bg-gold-gradient text-navy border-transparent shadow-gold'
                      : 'border-white/10 text-slate-soft hover:border-gold/40'
                  }`}
                >
                  {f === 4 ? 'G+3' : f === 1 ? 'Ground' : `G+${f - 1}`}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="bg-card-gradient border border-white/10 rounded-2xl p-6">
            <label className="text-sm text-slate-soft uppercase tracking-wide flex items-center gap-2 mb-4">
              <MapPin size={14} className="text-gold" /> City
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCity(c.name)}
                  className={`py-2.5 px-2 rounded-lg text-sm border transition-all ${
                    city === c.name
                      ? 'bg-gold/15 border-gold text-gold'
                      : 'border-white/10 text-slate-soft hover:border-gold/30'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Construction type */}
          <div className="bg-card-gradient border border-white/10 rounded-2xl p-6">
            <label className="text-sm text-slate-soft uppercase tracking-wide block mb-4">Construction Type</label>
            <div className="grid grid-cols-2 gap-3">
              {CONSTRUCTION_TYPES.map((t) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`flex items-center gap-2 py-3 px-4 rounded-xl border text-sm transition-all ${
                      type === t.id
                        ? 'bg-gold/15 border-gold text-gold'
                        : 'border-white/10 text-slate-soft hover:border-gold/30'
                    }`}
                  >
                    <Icon size={16} /> {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quality tier */}
          <div className="bg-card-gradient border border-white/10 rounded-2xl p-6">
            <label className="text-sm text-slate-soft uppercase tracking-wide block mb-4">Finish Quality</label>
            <div className="space-y-2">
              {QUALITY_TIERS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setQuality(q.id)}
                  className={`w-full flex items-center justify-between text-left py-3 px-4 rounded-xl border transition-all ${
                    quality === q.id
                      ? 'bg-gold/15 border-gold'
                      : 'border-white/10 hover:border-gold/30'
                  }`}
                >
                  <div>
                    <p className={quality === q.id ? 'text-gold font-semibold' : 'text-white'}>{q.label}</p>
                    <p className="text-xs text-slate-muted">{q.desc}</p>
                  </div>
                  {quality === q.id && <CheckCircle2 size={18} className="text-gold shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="bg-card-gradient border border-white/10 rounded-2xl p-6">
            <label className="text-sm text-slate-soft uppercase tracking-wide block mb-4">Add-ons</label>
            <div className="grid grid-cols-2 gap-3">
              {ADD_ONS.map((a) => {
                const Icon = a.icon
                const active = addOns.includes(a.id)
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAddOn(a.id)}
                    className={`flex items-center gap-2 py-3 px-3 rounded-xl border text-xs transition-all ${
                      active
                        ? 'bg-gold/15 border-gold text-gold'
                        : 'border-white/10 text-slate-soft hover:border-gold/30'
                    }`}
                  >
                    <Icon size={14} /> {a.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Live result (sticky) ── */}
        <div className="lg:sticky lg:top-28 h-fit space-y-6">
          <motion.div
            layout
            className="relative bg-card-gradient border border-gold/20 rounded-2xl p-8 shadow-navy overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gold/10 rounded-full blur-3xl animate-float" />
            <p className="text-slate-soft text-sm uppercase tracking-wide mb-2">Estimated Total Cost</p>
            <div className="font-display text-4xl md:text-5xl font-bold text-white mb-1">
              <AnimatedNumber value={calc.total} />
            </div>
            <p className="text-gold text-sm mb-6">≈ ₹{formatINR(calc.perSqft)} / sq.ft</p>

            {/* Breakdown bars */}
            <div className="space-y-3 mb-6">
              {BREAKDOWN.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs text-slate-soft mb-1">
                    <span>{b.label}</span>
                    <span>₹{formatINR(calc.baseCost * b.pct)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${b.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${b.pct * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
              {calc.addOnCost > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-slate-soft mb-1">
                    <span>Add-ons</span>
                    <span>₹{formatINR(calc.addOnCost)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full w-full" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-soft border-t border-white/10 pt-4">
              <Clock size={16} className="text-gold" />
              Estimated timeline: <span className="text-white font-semibold">{calc.months} months</span>
            </div>
          </motion.div>

          <div className="flex flex-col gap-3">
            <Link
              to="/#contact"
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold-gradient text-navy font-semibold shadow-gold hover:shadow-gold-lg transition-all"
            >
              <MessageCircle size={18} /> Get a Detailed Quote
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/15 text-slate-soft hover:border-gold/40 hover:text-gold transition-all"
            >
              <Download size={18} /> Download Estimate
            </button>
          </div>

          <p className="text-xs text-slate-muted text-center px-4">
            This is an approximate estimate based on average regional rates. Final cost depends on site
            conditions, design complexity, and material choices confirmed after a site visit.
          </p>
        </div>
      </div>
    </div>
  )
}