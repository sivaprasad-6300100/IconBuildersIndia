import { useState, useEffect, useRef } from "react";

const FLOORS = [
  { label: "Rooftop", color: "#c9a84c", windows: 4 },
  { label: "5th Floor", color: "#1a3a5c", windows: 5 },
  { label: "4th Floor", color: "#1e4470", windows: 5 },
  { label: "3rd Floor", color: "#1a3a5c", windows: 5 },
  { label: "2nd Floor", color: "#1e4470", windows: 5 },
  { label: "1st Floor", color: "#1a3a5c", windows: 5 },
  { label: "Ground", color: "#152d48", windows: 3 },
];

function useCountdown(targetDate) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = targetDate - new Date();
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

export default function ComingSoon() {
  const [floorsBuilt, setFloorsBuilt] = useState(0);
  const [craneAngle, setCraneAngle] = useState(-20);
  const [sparkles, setSparkles] = useState([]);
  const [particles, setParticles] = useState([]);
  const [glitchActive, setGlitchActive] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [windowLights, setWindowLights] = useState({});

  const launchDate = new Date(Date.now() + 49 * 24 * 3600 * 1000);
  const countdown = useCountdown(launchDate);

  // Build floors one by one
  useEffect(() => {
    if (floorsBuilt >= FLOORS.length) return;
    const delay = floorsBuilt === 0 ? 1200 : 900;
    const t = setTimeout(() => {
      setFloorsBuilt((f) => f + 1);
      const newSparkles = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        x: 40 + Math.random() * 40,
        y: 50 + (FLOORS.length - floorsBuilt - 1) * 38,
        angle: (i / 10) * 360,
        dist: 15 + Math.random() * 25,
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 700);
    }, delay);
    return () => clearTimeout(t);
  }, [floorsBuilt]);

  // Random window lights
  useEffect(() => {
    const id = setInterval(() => {
      setWindowLights((prev) => {
        const key = `${Math.floor(Math.random() * 7)}-${Math.floor(Math.random() * 5)}`;
        return { ...prev, [key]: !prev[key] };
      });
    }, 600);
    return () => clearInterval(id);
  }, []);

  // Crane swing
  useEffect(() => {
    let dir = 1;
    const id = setInterval(() => {
      setCraneAngle((a) => {
        const next = a + dir * 0.4;
        if (next > 18 || next < -18) dir *= -1;
        return next;
      });
    }, 40);
    return () => clearInterval(id);
  }, []);

  // Background particles
  useEffect(() => {
    setParticles(Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 18 + 12,
      delay: Math.random() * 8,
    })));
  }, []);

  // Scan line
  useEffect(() => {
    const id = setInterval(() => setScanLine((s) => (s + 1) % 100), 30);
    return () => clearInterval(id);
  }, []);

  // Glitch
  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 120);
        schedule();
      }, 4000 + Math.random() * 4000);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  const buildProgress = Math.round((floorsBuilt / FLOORS.length) * 100);

  const handleSubmit = () => {
    if (email.includes("@")) setSubmitted(true);
  };

  // SVG building dimensions
  const FLOOR_H = 38;
  const BUILDING_X = 30;
  const BUILDING_W = 160;
  const BASE_Y = 295;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 25% 60%, #071422 0%, #040c18 55%, #020608 100%)",
      color: "#e8d5a3",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem",
    }}>

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
        backgroundSize: "55px 55px",
      }} />

      {/* Particles */}
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%", background: "#c9a84c",
          opacity: 0,
          animation: `particleFloat ${p.duration}s ${p.delay}s infinite linear`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Scan line */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: "1px",
        top: `${scanLine}%`,
        background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent)",
        pointerEvents: "none",
      }} />

      {/* === BRAND === */}
      <div style={{ textAlign: "center", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
        <div style={{
          fontSize: "0.65rem", letterSpacing: "0.5em", color: "#c9a84c",
          marginBottom: "0.6rem", textTransform: "uppercase",
        }}>
          iconbuilderindia.com
        </div>
        <div style={{
          fontSize: "clamp(3rem, 9vw, 5.5rem)",
          fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1,
          display: "inline-block",
          ...(glitchActive
            ? { textShadow: "4px 0 #ff003c, -4px 0 #00f0ff", transform: "skewX(-3deg)" }
            : { textShadow: "0 0 50px rgba(201,168,76,0.25)" }),
          transition: "all 0.1s",
        }}>
          <span style={{ color: "#e8d5a3" }}>RELIA</span>
          <span style={{ color: "#c9a84c" }}>STATE</span>
        </div>
        <div style={{
          fontSize: "0.72rem", letterSpacing: "0.22em", color: "#6a8aaa",
          marginTop: "0.5rem", textTransform: "uppercase",
        }}>
          AI-Powered Construction & Real Estate Platform
        </div>
      </div>

      {/* === MAIN ROW === */}
      <div style={{
        display: "flex", gap: "3.5rem", alignItems: "flex-end",
        flexWrap: "wrap", justifyContent: "center",
        position: "relative", zIndex: 10, width: "100%", maxWidth: "920px",
      }}>

        {/* BUILDING SVG */}
        <div style={{ flexShrink: 0 }}>
          <svg width="230" height="360" viewBox="0 0 230 360" style={{ overflow: "visible" }}>
            {/* Stars */}
            {[...Array(15)].map((_, i) => (
              <circle key={i}
                cx={5 + (i * 16) % 220} cy={5 + (i * 9) % 35} r={i % 3 === 0 ? 1.5 : 1}
                fill="#c9a84c" opacity={0.2 + (i % 4) * 0.15}
                style={{ animation: `twinkle ${1.2 + (i % 5) * 0.4}s ${i * 0.2}s infinite alternate` }}
              />
            ))}

            {/* Moon */}
            <circle cx="195" cy="22" r="12" fill="#0a1628" />
            <circle cx="200" cy="18" r="11" fill="#1a2d40" opacity="0.8" />

            {/* Crane */}
            <g transform={`translate(155, ${BASE_Y - FLOORS.length * FLOOR_H - 30})`}
              style={{ transformOrigin: "0 0" }}>
              {/* Mast */}
              <line x1="0" y1="0" x2="0" y2="-55" stroke="#8aaccc" strokeWidth="3" />
              <line x1="-6" y1="-55" x2="6" y2="-55" stroke="#8aaccc" strokeWidth="2" />
              {/* Arm rotates */}
              <g style={{ transform: `rotate(${craneAngle}deg)`, transformOrigin: "0 0", transition: "transform 0.04s" }}>
                <line x1="0" y1="0" x2="60" y2="-6" stroke="#c9a84c" strokeWidth="2.5" />
                <line x1="0" y1="0" x2="-22" y2="-2" stroke="#c9a84c" strokeWidth="1.5" />
                <line x1="20" y1="-55" x2="0" y2="0" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.5" />
                {/* Cable */}
                <line x1="60" y1="-6" x2="60" y2="35" stroke="#c9a84c" strokeWidth="1.2" strokeDasharray="4,3" />
                {/* Load box */}
                <rect x="53" y="35" width="14" height="10" rx="1" fill="#c9a84c" opacity="0.8" />
                {/* Hook */}
                <circle cx="60" cy="33" r="2.5" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
              </g>
            </g>

            {/* Scaffolding on building side */}
            {floorsBuilt < FLOORS.length && (
              <g opacity="0.4">
                {[...Array(Math.min(floorsBuilt + 1, FLOORS.length))].map((_, i) => (
                  <line key={i}
                    x1={BUILDING_X + BUILDING_W + 4}
                    y1={BASE_Y - i * FLOOR_H}
                    x2={BUILDING_X + BUILDING_W + 4}
                    y2={BASE_Y - (i + 1) * FLOOR_H}
                    stroke="#c9a84c" strokeWidth="2" />
                ))}
                <line x1={BUILDING_X + BUILDING_W + 4} y1={BASE_Y - floorsBuilt * FLOOR_H}
                  x2={BUILDING_X + BUILDING_W + 18} y2={BASE_Y - floorsBuilt * FLOOR_H}
                  stroke="#c9a84c" strokeWidth="1.5" />
                <circle cx={BUILDING_X + BUILDING_W + 18} cy={BASE_Y - floorsBuilt * FLOOR_H}
                  r="3" fill="#c9a84c" opacity="0.7" />
              </g>
            )}

            {/* Build floors bottom-up */}
            {FLOORS.slice().reverse().map((floor, displayIdx) => {
              const dataIdx = FLOORS.length - 1 - displayIdx;
              if (floorsBuilt <= dataIdx) return null;
              const y = BASE_Y - (displayIdx + 1) * FLOOR_H;
              const isTop = displayIdx === FLOORS.length - 1;

              return (
                <g key={dataIdx} style={{ animation: floorsBuilt === dataIdx + 1 ? "buildUp 0.5s ease-out" : "none" }}>
                  {/* Floor body */}
                  <rect x={BUILDING_X} y={y} width={BUILDING_W} height={FLOOR_H - 1}
                    fill={floor.color} rx="1"
                    stroke="#c9a84c" strokeWidth="0.4" strokeOpacity="0.35" />

                  {/* Top highlight */}
                  <rect x={BUILDING_X} y={y} width={BUILDING_W} height="2.5" fill="#c9a84c" opacity="0.2" />

                  {/* Windows */}
                  {Array.from({ length: floor.windows }).map((_, wi) => {
                    const gap = BUILDING_W / (floor.windows + 1);
                    const wx = BUILDING_X + gap * (wi + 1) - 7;
                    const lit = !!windowLights[`${dataIdx}-${wi}`];
                    return (
                      <rect key={wi} x={wx} y={y + 9} width={13} height={isTop ? 20 : 18}
                        rx="1"
                        fill={lit ? "#ffe040" : "#061220"}
                        opacity={lit ? 0.95 : 0.8}
                        style={floorsBuilt === dataIdx + 1 ? { animation: `winAppear 0.3s ${wi * 0.08}s ease-in both` } : {}}
                      />
                    );
                  })}

                  {/* Balcony on middle floors */}
                  {!isTop && displayIdx > 0 && displayIdx < FLOORS.length - 1 && (
                    <rect x={BUILDING_X - 4} y={y + FLOOR_H - 4} width={BUILDING_W + 8} height="3"
                      fill="#c9a84c" opacity="0.2" rx="1" />
                  )}
                </g>
              );
            })}

            {/* Foundation */}
            <rect x={BUILDING_X - 8} y={BASE_Y} width={BUILDING_W + 16} height="6" rx="2" fill="#0d2035" />
            {/* Ground */}
            <rect x="5" y={BASE_Y + 6} width="220" height="4" rx="2" fill="#0a1628" />

            {/* Sparkle burst when floor added */}
            {sparkles.map((s) => (
              <g key={s.id}>
                <circle
                  cx={s.x + Math.cos((s.angle * Math.PI) / 180) * s.dist}
                  cy={s.y - Math.abs(Math.sin((s.angle * Math.PI) / 180)) * s.dist}
                  r="2.5" fill="#c9a84c"
                  style={{ animation: "sparkPop 0.7s ease-out forwards" }}
                />
              </g>
            ))}
          </svg>

          {/* Progress bar */}
          <div style={{ width: "230px", marginTop: "0.5rem" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: "0.6rem", letterSpacing: "0.15em", color: "#6a8aaa", marginBottom: "0.3rem",
            }}>
              <span>CONSTRUCTION PROGRESS</span>
              <span style={{ color: "#c9a84c" }}>{buildProgress}%</span>
            </div>
            <div style={{ height: "3px", background: "#071422", borderRadius: "2px" }}>
              <div style={{
                height: "100%", borderRadius: "2px",
                background: "linear-gradient(90deg, #c9a84c, #f0d080)",
                width: `${buildProgress}%`,
                transition: "width 0.7s ease",
                boxShadow: "0 0 8px #c9a84c60",
              }} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={{ flex: 1, minWidth: "260px", maxWidth: "460px" }}>

          <div style={{
            fontSize: "0.6rem", letterSpacing: "0.4em",
            color: "#c9a84c", marginBottom: "0.75rem", textTransform: "uppercase",
          }}>
            ◆ &nbsp;Something Extraordinary Is Coming&nbsp; ◆
          </div>

          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800, lineHeight: 1.15,
            margin: "0 0 1rem", color: "#e8d5a3",
          }}>
            Construction<br />
            <span style={{ color: "#c9a84c" }}>reimagined</span> with AI.
          </h1>

          <p style={{
            fontSize: "0.88rem", color: "#6a8aaa",
            lineHeight: 1.75, marginBottom: "1.5rem",
          }}>
            Live milestone tracking, smart cost estimation, AI-powered chatbot, and three purpose-built dashboards — all in one platform built for India's construction industry.
          </p>

          {/* Feature pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "1.75rem" }}>
            {["🏗 Live Tracking", "🤖 AI Chatbot", "💰 Cost Estimator", "📊 3 Dashboards", "🔐 OTP Login"].map((f) => (
              <span key={f} style={{
                fontSize: "0.68rem", padding: "0.28rem 0.65rem",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: "20px", color: "#c9a84c",
                background: "rgba(201,168,76,0.06)",
                letterSpacing: "0.02em",
              }}>{f}</span>
            ))}
          </div>

          {/* Countdown */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{
              fontSize: "0.58rem", letterSpacing: "0.3em",
              color: "#4a6a88", marginBottom: "0.6rem",
            }}>
              LAUNCHING IN
            </div>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {[["DAYS", countdown.days], ["HRS", countdown.hours], ["MIN", countdown.minutes], ["SEC", countdown.seconds]].map(([label, val]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
                    fontWeight: 700, color: "#c9a84c",
                    lineHeight: 1, fontVariantNumeric: "tabular-nums",
                    background: "rgba(201,168,76,0.06)",
                    border: "1px solid rgba(201,168,76,0.18)",
                    borderRadius: "8px", padding: "0.4rem 0.55rem",
                    minWidth: "52px",
                    textShadow: "0 0 25px rgba(201,168,76,0.45)",
                  }}>
                    {String(val).padStart(2, "0")}
                  </div>
                  <div style={{
                    fontSize: "0.52rem", letterSpacing: "0.18em",
                    color: "#3a5a78", marginTop: "0.3rem",
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email */}
          {!submitted ? (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{
                  flex: 1, minWidth: "175px",
                  padding: "0.65rem 1rem",
                  background: "rgba(7,20,34,0.85)",
                  border: "1px solid rgba(201,168,76,0.28)",
                  borderRadius: "8px", color: "#e8d5a3",
                  fontSize: "0.85rem", outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button onClick={handleSubmit} style={{
                padding: "0.65rem 1.15rem",
                background: "linear-gradient(135deg, #c9a84c 0%, #e8c96a 100%)",
                border: "none", borderRadius: "8px",
                color: "#071422", fontWeight: 700,
                fontSize: "0.78rem", cursor: "pointer",
                letterSpacing: "0.07em",
                boxShadow: "0 0 22px rgba(201,168,76,0.28)",
                fontFamily: "inherit",
              }}>
                NOTIFY ME
              </button>
            </div>
          ) : (
            <div style={{
              padding: "0.75rem 1rem",
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.35)",
              borderRadius: "8px", color: "#c9a84c",
              fontSize: "0.85rem",
            }}>
              ✓ You're on the list — we'll notify you at launch!
            </div>
          )}

          {/* WhatsApp */}
          <a href="https://wa.me/916300100420" style={{
            display: "inline-flex", alignItems: "center", gap: "0.45rem",
            fontSize: "0.75rem", color: "#4aab68", textDecoration: "none",
            letterSpacing: "0.04em", marginTop: "1rem",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#4aab68">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat with us on WhatsApp
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: "2.5rem", zIndex: 10, position: "relative",
        borderTop: "1px solid rgba(201,168,76,0.08)",
        paddingTop: "1rem", width: "100%", maxWidth: "920px",
        textAlign: "center",
        fontSize: "0.62rem", letterSpacing: "0.28em", color: "#2a4a68",
      }}>
        iconbuilderindia.com &nbsp;·&nbsp; Building the future of construction management &nbsp;·&nbsp; India
      </div>

      <style>{`
        @keyframes particleFloat {
          0%   { transform: translateY(0); opacity: 0; }
          10%  { opacity: 0.35; }
          90%  { opacity: 0.25; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        @keyframes twinkle {
          from { opacity: 0.1; } to { opacity: 0.85; }
        }
        @keyframes buildUp {
          from { transform: translateY(-18px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes winAppear {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes sparkPop {
          0%   { transform: scale(0); opacity: 1; }
          60%  { transform: scale(1.8); opacity: 0.7; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
