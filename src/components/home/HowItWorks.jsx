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

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-pad bg-navy relative overflow-hidden">

      {/* Glow center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.03) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          border border-gold/20 bg-gold/5 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">
              How It Works
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream mb-4">
            Your Construction Journey
            <br />
            <span className="text-shimmer">Step by Step</span>
          </h2>
          <p className="text-slate-soft text-lg max-w-2xl mx-auto">
            From the first call to final handover — here's exactly how ReliaState
            makes your construction stress-free.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">

          {/* Vertical connector line — desktop */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px
                          bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

          <div className="space-y-12 lg:space-y-0">
            {STEPS.map((step, i) => {
              const isLeft = i % 2 === 0
              const Icon = step.icon

              return (
                <div key={i} className="relative lg:grid lg:grid-cols-2 lg:gap-12 items-center lg:mb-16">

                  {/* Center dot — desktop */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-10
                               w-12 h-12 rounded-full border-2 border-gold/40
                               bg-navy items-center justify-center
                               shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                  >
                    <span className="text-gold font-black text-sm">{step.number}</span>
                  </motion.div>

                  {/* Left card */}
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className={`${isLeft ? 'lg:text-right lg:pr-10' : 'lg:col-start-2 lg:pl-10'}`}
                  >
                    <div className={`
                      glass border border-white/8 rounded-2xl p-6
                      hover:border-gold/20 transition-all duration-300
                      hover:-translate-y-1 group
                    `}>

                      {/* Mobile step number */}
                      <div className="lg:hidden flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full border border-gold/40
                                        flex items-center justify-center bg-navy">
                          <span className="text-gold font-black text-xs">{step.number}</span>
                        </div>
                        <div className="h-px flex-1 bg-gold/15" />
                      </div>

                      <div className={`flex items-start gap-4 ${isLeft ? 'lg:flex-row-reverse' : ''}`}>

                        {/* Icon */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                     group-hover:scale-110 transition-transform duration-300"
                          style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                        >
                          <Icon size={22} style={{ color: step.color }} />
                        </div>

                        {/* Text */}
                        <div className={isLeft ? 'lg:text-right' : ''}>
                          <h3 className="text-cream font-bold text-lg mb-2">{step.title}</h3>
                          <p className="text-slate-soft text-sm leading-relaxed mb-3">{step.desc}</p>
                          <div
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                            style={{ background: `${step.color}12`, color: step.color, border: `1px solid ${step.color}25` }}
                          >
                            <div className="w-1 h-1 rounded-full" style={{ background: step.color }} />
                            {step.detail}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Empty col for alternating layout */}
                  {isLeft && <div className="hidden lg:block" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-20"
        >
          <p className="text-slate-soft text-base mb-6">
            Ready to build with complete transparency?
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#contact"
              onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="px-8 py-4 rounded-xl btn-gold text-sm font-bold"
            >
              Start Your Project
            </a>
            <a
              href="/estimator"
              className="px-8 py-4 rounded-xl btn-outline text-sm"
            >
              Get Free Estimate
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
