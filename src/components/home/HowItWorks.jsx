import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, Palette, Code2, Rocket, HeartHandshake } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Share Your Requirements',
    desc: 'Tell us about your plot size, location, floors, and budget. Use our Smart Estimator for instant cost clarity.',
    color: '#c9a84c',
    detail: 'Free consultation · No commitment needed',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Design & Planning',
    desc: 'Our team creates detailed plans and timelines. You approve every milestone before work begins.',
    color: '#7ab8f5',
    detail: '3D floor plans · Timeline approval',
  },
  {
    number: '03',
    icon: Code2,
    title: 'Construction Begins',
    desc: 'Daily site photos uploaded by your contractor. Track every milestone live on your personal dashboard.',
    color: '#7ecf7e',
    detail: 'Daily updates · Real-time photos',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'AI Keeps You Informed',
    desc: 'Our AI assistant answers your questions 24/7. Get instant answers about materials, costs, and progress.',
    color: '#c9a84c',
    detail: 'Claude AI · 24/7 support',
  },
  {
    number: '05',
    icon: HeartHandshake,
    title: 'Dream Home Delivered',
    desc: 'Final inspection, documentation, and full handover. Your dream home — built with complete transparency.',
    color: '#e07a7a',
    detail: 'Quality check · Full documentation',
  },
]

function Step({ step, index }) {
  const isLeft = index % 2 === 0
  const Icon = step.icon

  return (
    <div className={`hiw__row ${isLeft ? 'hiw__row--left' : 'hiw__row--right'}`}>

      {/* Center timeline dot — desktop only */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="hiw__dot"
      >
        <span className="hiw__dot-num">{step.number}</span>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hiw__card-wrap"
      >
        <div className="hiw__card">
          {/* Mobile step number */}
          <div className="hiw__mobile-num">
            <div className="hiw__mobile-num-circle">
              <span>{step.number}</span>
            </div>
            <div className="hiw__mobile-num-line" />
          </div>

          <div className={`hiw__card-body ${isLeft ? 'hiw__card-body--reverse' : ''}`}>
            <div
              className="hiw__icon"
              style={{ background: `${step.color}18`, border: `1px solid ${step.color}35` }}
            >
              <Icon size={22} color={step.color} />
            </div>

            <div className={`hiw__text ${isLeft ? 'hiw__text--right' : ''}`}>
              <h3 className="hiw__title">{step.title}</h3>
              <p className="hiw__desc">{step.desc}</p>
              <div
                className="hiw__tag"
                style={{ background: `${step.color}15`, color: step.color, border: `1px solid ${step.color}30` }}
              >
                <span className="hiw__tag-dot" style={{ background: step.color }} />
                {step.detail}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* empty spacer keeps the grid 2-column on the opposite side */}
      <div className="hiw__spacer" />
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="hiw">
      <style>{`
        .hiw {
          position: relative;
          overflow: hidden;
          background: rgba(13, 24, 38, 0.55);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(2px);
          padding: 6rem 1.5rem;
        }

        .hiw__glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 400px;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%);
        }

        .hiw__inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Title ── */
        .hiw__title-wrap {
          text-align: center;
          margin-bottom: 5rem;
        }
        .hiw__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.06);
          margin-bottom: 1rem;
        }
        .hiw__badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #c9a84c;
        }
        .hiw__badge-text {
          color: #c9a84c; font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
        }
        .hiw__heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 2rem;
          line-height: 1.2;
          color: #e8d5a3;
          margin: 0 0 1rem;
        }
        .hiw__heading-accent { color: #c9a84c; }
        @media (min-width: 640px)  { .hiw__heading { font-size: 2.75rem; } }
        @media (min-width: 1024px) { .hiw__heading { font-size: 3.25rem; } }
        .hiw__subtitle {
          color: #e2eaf3;
          font-size: 1rem;
          max-width: 42rem;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Timeline container ── */
        .hiw__timeline {
          position: relative;
        }

        .hiw__spine {
          display: none;
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          transform: translateX(-50%);
          background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.22), transparent);
        }
        @media (min-width: 1024px) { .hiw__spine { display: block; } }

        .hiw__steps {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        @media (min-width: 1024px) { .hiw__steps { gap: 0.5rem; } }

        /* ── Each row ── */
        .hiw__row {
          position: relative;
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .hiw__row {
            grid-template-columns: 1fr 1fr;
            align-items: center;
            gap: 3rem;
          }
          .hiw__row--left .hiw__card-wrap { grid-column: 1; }
          .hiw__row--left .hiw__spacer { grid-column: 2; }
          .hiw__row--right .hiw__card-wrap { grid-column: 2; }
          .hiw__row--right .hiw__spacer { grid-column: 1; }
        }
        .hiw__spacer { display: none; }
        @media (min-width: 1024px) { .hiw__spacer { display: block; } }

        /* ── Timeline dot ── */
        .hiw__dot {
          display: none;
        }
        @media (min-width: 1024px) {
          .hiw__dot {
            display: flex;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            border: 2px solid rgba(201,168,76,0.45);
            background: #0a1420;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(201,168,76,0.22);
          }
        }
        .hiw__dot-num {
          color: #c9a84c;
          font-weight: 900;
          font-size: 0.85rem;
        }

        /* ── Card ── */
        .hiw__card-wrap { min-width: 0; }

        .hiw__card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1.25rem;
          padding: 1.5rem;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .hiw__card:hover {
          border-color: rgba(201,168,76,0.25);
          transform: translateY(-3px);
        }

        .hiw__mobile-num {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 1024px) { .hiw__mobile-num { display: none; } }
        .hiw__mobile-num-circle {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          border: 1px solid rgba(201,168,76,0.4);
          background: #0a1420;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hiw__mobile-num-circle span {
          color: #c9a84c;
          font-weight: 900;
          font-size: 0.7rem;
        }
        .hiw__mobile-num-line {
          height: 1px;
          flex: 1;
          background: rgba(201,168,76,0.15);
        }

        .hiw__card-body {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        @media (min-width: 1024px) {
          .hiw__card-body--reverse { flex-direction: row-reverse; }
        }

        .hiw__icon {
          flex-shrink: 0;
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        .hiw__card:hover .hiw__icon { transform: scale(1.08); }

        .hiw__text { min-width: 0; }
        @media (min-width: 1024px) {
          .hiw__text--right { text-align: right; }
        }

        .hiw__title {
          color: #e8d5a3;
          font-weight: 700;
          font-size: 1.15rem;
          margin: 0 0 0.5rem;
        }
        .hiw__desc {
          color: #8fa3b8;
          font-size: 0.875rem;
          line-height: 1.6;
          margin: 0 0 0.85rem;
        }
        .hiw__tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 600;
        }
        .hiw__tag-dot {
          width: 4px; height: 4px; border-radius: 50%;
        }

        /* ── Bottom CTA ── */
        .hiw__cta-wrap {
          text-align: center;
          margin-top: 5rem;
        }
        .hiw__cta-text {
          color: #e1eaf3;
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }
        .hiw__cta-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
        }
        .hiw__btn {
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-block;
        }
        .hiw__btn--gold {
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          box-shadow: 0 0 20px rgba(201,168,76,0.25);
        }
        .hiw__btn--gold:hover { box-shadow: 0 0 32px rgba(201,168,76,0.4); }
        .hiw__btn--outline {
          background: transparent;
          color: #e8d5a3;
          border: 1px solid rgba(232,213,163,0.25);
        }
        .hiw__btn--outline:hover { border-color: rgba(201,168,76,0.5); color: #c9a84c; }

        /* ══════════════════════════════════════════
           MOBILE (≤640px)
           ══════════════════════════════════════════ */
        @media (max-width: 640px) {
          .hiw { padding: 3.5rem 1rem; }
          .hiw__title-wrap { margin-bottom: 3rem; }
          .hiw__heading { font-size: 1.6rem; margin-bottom: 0.75rem; }
          .hiw__subtitle { font-size: 0.875rem; }
          .hiw__steps { gap: 1.5rem; }
          .hiw__card { padding: 1.25rem; }
          .hiw__icon { width: 2.6rem; height: 2.6rem; }
          .hiw__title { font-size: 1rem; }
          .hiw__desc { font-size: 0.82rem; }
          .hiw__cta-wrap { margin-top: 3rem; }
          .hiw__btn { width: 100%; text-align: center; }
        }

        @media (max-width: 380px) {
          .hiw__heading { font-size: 1.4rem; }
          .hiw__title { font-size: 0.95rem; }
        }
      `}</style>

      <div className="hiw__glow" />

      <div className="hiw__inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="hiw__title-wrap"
        >
          <div className="hiw__badge">
            <span className="hiw__badge-dot" />
            <span className="hiw__badge-text">How It Works</span>
          </div>
          <h2 className="hiw__heading">
            Your Construction Journey
            <br />
            <span className="hiw__heading-accent">Step by Step</span>
          </h2>
          <p className="hiw__subtitle">
            From the first call to final handover — here's exactly how IconBuilders
            makes your construction stress-free.
          </p>
        </motion.div>

        <div className="hiw__timeline">
          <div className="hiw__spine" />
          <div className="hiw__steps">
            {STEPS.map((step, i) => (
              <Step key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="hiw__cta-wrap"
        >
          <p className="hiw__cta-text">Ready to build with complete transparency?</p>

          <div className="hiw__cta-row">
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="hiw__btn hiw__btn--gold">
            
              Start Your Project
            </a>

            <Link to="/estimator" className="hiw__btn hiw__btn--outline">
              Get Free Estimate
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}