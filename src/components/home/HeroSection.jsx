import ParticleField from './ParticleField'

export default function HeroSection() {
  return (
    <section className="hero">
      <style>{`
        .hero {
          position: relative;
          min-height: 100vh;
          background: #000000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* 3D skyline — confined to the LOWER portion only,
           so buildings never collide with the headline above them */
        .hero__canvas {
          position: absolute;
          inset: 0;
        }

        .hero__vignette {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.70) 0%,
            rgba(0,0,0,0.20) 45%,
            rgba(0,0,0,0.85) 100%
          );
          pointer-events: none;
        }

        .hero__content {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 1.5rem 1.5rem;
          text-align: center;
        }

        .hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 9999px;
          padding: 0.4rem 1rem;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c9a84c;
        }

        .hero__badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a84c;
        }

        .hero__title {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 600;
          font-size: 2rem;
          line-height: 1.15;
          color: #e8d5a3;
          max-width: 48rem;
          margin-top: 1.25rem;
        }

        .hero__title-accent {
          color: #c9a84c;
        }

        @media (min-width: 768px) {
          .hero__title { font-size: 3.25rem; }
        }
        @media (min-width: 1024px) {
          .hero__title { font-size: 3.75rem; }
        }

        .hero__subtitle {
          color: #5a7a9a;
          font-size: 0.875rem;
          max-width: 36rem;
          margin-top: 1rem;
        }
        @media (min-width: 768px) {
          .hero__subtitle { font-size: 1rem; }
        }

        .hero__ctas {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          margin-top: 1.75rem;
        }

        .hero__btn {
          padding: 0.875rem 2rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .hero__btn--primary {
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          box-shadow: 0 0 20px rgba(201,168,76,0.3);
        }
        .hero__btn--primary:hover {
          box-shadow: 0 0 40px rgba(201,168,76,0.5);
          transform: translateY(-2px);
        }

        .hero__btn--secondary {
          background: transparent;
          color: #e8d5a3;
          font-weight: 600;
          border: 1px solid rgba(232,213,163,0.25);
        }
        .hero__btn--secondary:hover {
          border-color: rgba(201,168,76,0.5);
          color: #c9a84c;
        }

        .hero__stats {
          position: relative;
          z-index: 10;
          border-top: 1px solid rgba(232,213,163,0.1);
          margin: 0 auto;
          width: 100%;
          max-width: 42rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.75rem 0;
        }

        .hero__stat {
          flex: 1;
          text-align: center;
          padding: 0 1.5rem;
          border-left: 1px solid rgba(232,213,163,0.1);
        }
        .hero__stat:first-child {
          border-left: none;
        }

        .hero__stat-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.25rem;
          color: #c9a84c;
        }
        @media (min-width: 768px) {
          .hero__stat-value { font-size: 1.5rem; }
        }

        .hero__stat-label {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #5a7a9a;
          margin-top: 0.375rem;
        }

        .hero__scroll {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: center;
          padding: 1.25rem 0;
          animation: heroFloat 6s ease-in-out infinite;
        }

        .hero__scroll-pill {
          width: 16px;
          height: 24px;
          border: 1px solid rgba(232,213,163,0.3);
          border-radius: 9999px;
          display: flex;
          justify-content: center;
          padding-top: 6px;
        }

        .hero__scroll-dot {
          width: 2px;
          height: 6px;
          border-radius: 9999px;
          background: #c9a84c;
        }

        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }

        @keyframes heroFadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroScaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }

        .hero__badge,
        .hero__title,
        .hero__subtitle,
        .hero__stats {
          animation: heroFadeInUp 0.7s ease-out forwards;
        }
        .hero__ctas {
          animation: heroScaleIn 0.5s ease-out forwards;
        }
      `}</style>

      <div className="hero__canvas">
        <ParticleField />
      </div>

      <div className="hero__vignette" />

      <div className="hero__content">
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Hyderabad &middot; RERA Registered
        </div>

        <h1 className="hero__title">
          From blueprint to keys <span className="hero__title-accent">&mdash; tracked live</span>, every step
        </h1>

        <p className="hero__subtitle">
          120+ homes delivered across India. Real-time build progress, right from your phone.
        </p>

        <div className="hero__ctas">
          <a href="/estimator" className="hero__btn hero__btn--primary">
            Get Free Estimate
          </a>
          <a href="/#projects" className="hero__btn hero__btn--secondary">
            View Projects
          </a>
        </div>
      </div>

      <div className="hero__stats">
        {[
          { value: '120+', label: 'Homes Delivered' },
          { value: '4.9', label: 'Client Rating' },
          { value: '9 yrs', label: 'Experience' },
        ].map((stat) => (
          <div key={stat.label} className="hero__stat">
            <div className="hero__stat-value">{stat.value}</div>
            <div className="hero__stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="hero__scroll">
        <div className="hero__scroll-pill">
          <span className="hero__scroll-dot" />
        </div>
      </div>
    </section>
  )
}
