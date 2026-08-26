import { useState } from 'react'

// ── Config ───────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '+91 90356 24465' // display format
const WHATSAPP_DIGITS = WHATSAPP_NUMBER.replace(/[^\d]/g, '') // wa.me needs digits only
const WHATSAPP_MESSAGE = "Hi! I'd like to know more about IconBuilders."
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

// ── Internal CSS ───────────────────────────────────────────────────────────
// Same blueprint / brass-on-navy language as the rest of the site, sized
// down to a single floating action button with a hover tooltip.
const STYLES = `
.ww-root{
  --ww-navy-deep:  #0d1830;
  --ww-brass:      #c6a15b;
  --ww-brass-light:#e3c583;
  --ww-green:      #25D366;
  --ww-green-dark: #1ea952;
  --ww-paper:      #f2ecdc;
  --ww-font-body:  'Inter', -apple-system, sans-serif;
  --ww-font-mono:  'IBM Plex Mono', ui-monospace, monospace;
}

.ww-launcher{
  position: fixed; bottom: 28px; right: 28px; z-index: 60;
  width: 60px; height: 60px; border-radius: 50%;
  display:flex; align-items:center; justify-content:center;
  text-decoration:none;
  background: linear-gradient(155deg, var(--ww-green), var(--ww-green-dark));
  box-shadow: 0 0 0 1px rgba(255,255,255,0.15) inset,
              0 10px 30px rgba(37,211,102,0.35),
              0 0 0 0 rgba(37,211,102,0.5);
  transition: transform .18s ease, box-shadow .25s ease;
  animation: ww-breathe 3.6s ease-in-out infinite;
}
@keyframes ww-breathe{
  0%,100%{ box-shadow: 0 0 0 1px rgba(255,255,255,0.15) inset, 0 10px 30px rgba(37,211,102,0.35), 0 0 0 0 rgba(37,211,102,0.28); }
  50%{ box-shadow: 0 0 0 1px rgba(255,255,255,0.15) inset, 0 10px 30px rgba(37,211,102,0.35), 0 0 0 9px rgba(37,211,102,0); }
}
.ww-launcher:hover{ transform: scale(1.07); box-shadow: 0 0 0 1px rgba(255,255,255,0.2) inset, 0 14px 38px rgba(37,211,102,0.55); }
.ww-launcher:focus-visible{ outline: 2px solid var(--ww-brass-light); outline-offset: 3px; }
.ww-launcher svg{ width:28px; height:28px; }

.ww-badge{
  position:absolute; top:-4px; right:-4px;
  width:20px; height:20px; border-radius:50%;
  background: var(--ww-brass); color: var(--ww-navy-deep);
  font-family: var(--ww-font-mono); font-size:10px; font-weight:700;
  display:flex; align-items:center; justify-content:center;
  border: 2px solid var(--ww-navy-deep);
  animation: ww-badge-pulse 1.8s ease-in-out infinite;
}
@keyframes ww-badge-pulse{ 0%,100%{ transform:scale(1);} 50%{ transform:scale(1.14);} }

.ww-tooltip{
  position:absolute; right: 72px; top: 50%; transform: translateY(-50%) translateX(6px);
  white-space: nowrap;
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--ww-navy-deep);
  border: 1px solid rgba(198,161,91,0.25);
  color: var(--ww-paper);
  font-family: var(--ww-font-body);
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  opacity: 0;
  pointer-events: none;
  transition: opacity .18s ease, transform .18s ease;
}
.ww-launcher:hover + .ww-tooltip,
.ww-launcher:focus-visible + .ww-tooltip{
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

@media (max-width: 420px){
  .ww-launcher{ right:12px; bottom:12px; }
  .ww-tooltip{ display:none; }
}
@media (prefers-reduced-motion: reduce){
  .ww-launcher, .ww-badge{ animation-duration: .001ms !important; }
}
`

// ── WhatsApp glyph (inline, no icon-library dependency) ─────────────────────
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="#fff" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.362.687 4.564 1.872 6.417L4 29l7.77-1.84A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.818a9.75 9.75 0 0 1-4.98-1.363l-.357-.212-4.61 1.092 1.127-4.49-.233-.368A9.74 9.74 0 0 1 5.273 15c0-5.914 4.812-10.727 10.73-10.727 5.917 0 10.73 4.813 10.73 10.727 0 5.914-4.813 10.727-10.73 10.727Zm5.89-8.036c-.323-.161-1.91-.943-2.206-1.05-.296-.108-.512-.161-.727.16-.215.323-.834 1.05-1.022 1.267-.188.215-.377.242-.7.081-.323-.161-1.364-.503-2.598-1.603-.96-.856-1.609-1.913-1.797-2.235-.188-.323-.02-.497.141-.658.145-.144.323-.376.484-.564.161-.188.215-.323.323-.538.108-.215.054-.404-.027-.565-.081-.161-.727-1.751-.997-2.4-.263-.63-.53-.545-.727-.555l-.619-.011c-.215 0-.564.081-.86.404-.296.323-1.13 1.104-1.13 2.694s1.157 3.126 1.318 3.341c.161.215 2.276 3.474 5.515 4.872.77.332 1.37.531 1.838.68.772.246 1.474.211 2.03.128.619-.092 1.91-.78 2.18-1.534.269-.753.269-1.398.188-1.534-.08-.135-.296-.215-.618-.377Z"/>
    </svg>
  )
}

export default function WhatsAppWidget({ unreadCount = 1 }) {
  const [dismissedBadge, setDismissedBadge] = useState(false)

  return (
    <div className="ww-root">
      <style>{STYLES}</style>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="ww-launcher"
        aria-label="Chat with us on WhatsApp"
        onClick={() => setDismissedBadge(true)}
      >
        <WhatsAppIcon />
        {unreadCount > 0 && !dismissedBadge && (
          <span className="ww-badge" aria-hidden="true">{unreadCount}</span>
        )}
      </a>

      <span className="ww-tooltip" role="tooltip">
        Chat with us on WhatsApp
      </span>
    </div>
  )
}