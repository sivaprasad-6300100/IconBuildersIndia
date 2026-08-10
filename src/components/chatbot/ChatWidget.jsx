import { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, User, X, Send, Minimize2, RotateCcw, Sparkles, AlertCircle, Maximize2,
} from 'lucide-react'

// ── Shared facts (single source of truth) ─────────────────────────────────────
const FACTS = {
  costLow: 1800, costHigh: 3200, sampleLow: '25L', sampleHigh: '45L',
  groundFloor: '6–8 months', perExtraFloor: '2–3 months',
  whatsapp: '+91 98765 43210', hours: 'Mon–Sat, 9AM–7PM',
}

const QUICK_REPLIES = [
  'What is the cost to build a 1200 sqft house?',
  'How does milestone tracking work?',
  'What materials do you recommend?',
  'How long does construction take?',
]

const FALLBACK_RULES = [
  { test: t => /cost|price|budget|sqft/.test(t),
    reply: `💰 Construction costs in Hyderabad range from ₹${FACTS.costLow.toLocaleString('en-IN')}–${FACTS.costHigh.toLocaleString('en-IN')}/sqft depending on quality. A 1200 sqft house typically costs ₹${FACTS.sampleLow}–${FACTS.sampleHigh}. Use our Smart Estimator for a detailed breakdown!` },
  { test: t => /time|long|months|duration/.test(t),
    reply: `⏱ A typical 1200 sqft house takes 8–12 months. Ground floor alone: ${FACTS.groundFloor}. Each additional floor adds ${FACTS.perExtraFloor}. We track every milestone live on your dashboard!` },
  { test: t => /material|brick|cement|steel/.test(t),
    reply: '🧱 We recommend AAC blocks for walls (lighter, better insulation), Fe500 steel for structure, and OPC 53-grade cement. Ask us for a full material list by budget tier!' },
  { test: t => /track|progress|photo|dashboard/.test(t),
    reply: '📊 Your Client Dashboard shows live milestone progress, daily site photos, and payment tracking — all in one place!' },
  { test: t => /login|otp|password|account/.test(t),
    reply: '🔐 IconBuilders uses secure OTP-based login — no passwords needed! Enter your phone number, get an OTP via SMS, and you\'re in.' },
  { test: t => /whatsapp|contact|call|team/.test(t),
    reply: `📱 Reach our team on WhatsApp: ${FACTS.whatsapp}. We respond within 2 hours (${FACTS.hours}).` },
  { test: t => /floor|foundation|stage|phase/.test(t),
    reply: '🏗 Construction has 7 stages: Foundation → Structure → Brickwork → Electrical & Plumbing → Plastering → Flooring → Final Finishing. Each is tracked as a milestone!' },
  { test: t => /estimat|calculator|quote/.test(t),
    reply: '🧮 Our Smart Estimator gives you an instant cost breakdown in 60 seconds! Visit /estimator or click "Free Estimate" in the navbar.' },
]
const DEFAULT_FALLBACK = `🤖 Great question! For details, message our team on WhatsApp: ${FACTS.whatsapp}. You can also try our Smart Estimator at /estimator.`
const getFallbackReply = text => (FALLBACK_RULES.find(r => r.test(text.toLowerCase())) || { reply: DEFAULT_FALLBACK }).reply

// ── id helper ──────────────────────────────────────────────────────────────
let idCounter = 0
const nextId = () => `msg-${Date.now()}-${idCounter++}`

class ApiError extends Error {}
class RateLimitError extends Error {}

// NOTE ON SECURITY: never call api.anthropic.com or use an API key from this
// file. This posts to your own backend, which holds the real key server-side.
// See server/chat-endpoint.example.js.
const CHAT_ENDPOINT = '/api/chat'

// ── Internal CSS ───────────────────────────────────────────────────────────
// Embedded in-file so the component is fully self-contained (no external
// .css import). Concept: a foreman's spec sheet pinned to the corner of the
// screen — blueprint paper, brass hardware, spirit-level status.
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

.cw-root{
  --cw-navy-deep:  #0d1830;
  --cw-navy-mid:   #11213a;
  --cw-navy-light: #16283f;
  --cw-paper:      #f2ecdc;
  --cw-brass:      #c6a15b;
  --cw-brass-light:#e3c583;
  --cw-brass-dim:  rgba(198,161,91,0.16);
  --cw-ok:         #6fbf8b;
  --cw-warn:       #d9776b;
  --cw-ink-muted:  #7f8ba3;
  --cw-font-display: 'Fraunces', Georgia, serif;
  --cw-font-body:    'Inter', -apple-system, sans-serif;
  --cw-font-mono:    'IBM Plex Mono', ui-monospace, monospace;
}

.cw-launcher{
  position: fixed; bottom: 28px; right: 28px; z-index: 60;
  width: 60px; height: 60px; border-radius: 50%;
  border: none; cursor: pointer;
  background: linear-gradient(155deg, var(--cw-brass-light), var(--cw-brass));
  box-shadow: 0 0 0 1px rgba(255,255,255,0.15) inset,
              0 10px 30px rgba(198,161,91,0.35),
              0 0 0 0 rgba(198,161,91,0.5);
  display:flex; align-items:center; justify-content:center;
  transition: transform .18s ease, box-shadow .25s ease;
  animation: cw-launcher-breathe 3.6s ease-in-out infinite;
}
@keyframes cw-launcher-breathe{
  0%,100%{ box-shadow: 0 0 0 1px rgba(255,255,255,0.15) inset, 0 10px 30px rgba(198,161,91,0.35), 0 0 0 0 rgba(198,161,91,0.28); }
  50%{ box-shadow: 0 0 0 1px rgba(255,255,255,0.15) inset, 0 10px 30px rgba(198,161,91,0.35), 0 0 0 9px rgba(198,161,91,0); }
}
.cw-launcher:hover{ transform: scale(1.07); box-shadow: 0 0 0 1px rgba(255,255,255,0.2) inset, 0 14px 38px rgba(198,161,91,0.55); }
.cw-launcher:focus-visible{ outline: 2px solid var(--cw-brass-light); outline-offset: 3px; }
.cw-launcher svg{ width:24px; height:24px; color: var(--cw-navy-deep); }
.cw-launcher.is-hidden{ opacity:0; pointer-events:none; transform: scale(.7); }

.cw-badge{
  position:absolute; top:-4px; right:-4px;
  width:20px; height:20px; border-radius:50%;
  background: var(--cw-warn); color:#fff;
  font-family: var(--cw-font-mono); font-size:10px; font-weight:600;
  display:flex; align-items:center; justify-content:center;
  border: 2px solid var(--cw-navy-deep);
  animation: cw-badge-pulse 1.8s ease-in-out infinite;
}
@keyframes cw-badge-pulse{ 0%,100%{ transform:scale(1);} 50%{ transform:scale(1.14);} }

.cw-panel{
  position: fixed; bottom: 28px; right: 28px; z-index: 60;
  width: 384px;
  display:flex; flex-direction:column;
  background: var(--cw-navy-mid);
  border-radius: 14px;
  overflow:hidden;
  box-shadow: 0 24px 70px rgba(0,0,0,0.55), 0 0 0 1px var(--cw-brass-dim), 0 0 60px -20px rgba(198,161,91,0.25);
  transform-origin: bottom right;
}
.cw-panel::before{
  content:""; position:absolute; top:0; left:0;
  width:0; height:0;
  border-style:solid;
  border-width: 22px 22px 0 0;
  border-color: var(--cw-brass) transparent transparent transparent;
  opacity:.9; z-index:2;
  filter: drop-shadow(1px 1px 2px rgba(0,0,0,.35));
}
/* drafting line — draws itself in along the top edge when the panel opens */
.cw-panel::after{
  content:""; position:absolute; top:0; left:22px; right:0; height:1px;
  background: linear-gradient(90deg, var(--cw-brass-light), transparent);
  transform-origin: left;
  animation: cw-draft-line .7s ease-out .1s both;
}
@keyframes cw-draft-line{ from{ transform: scaleX(0); } to{ transform: scaleX(1); } }

.cw-rivet{
  position:absolute; width:6px; height:6px; border-radius:50%;
  background: radial-gradient(circle at 35% 30%, var(--cw-brass-light), var(--cw-brass) 70%);
  box-shadow: 0 1px 2px rgba(0,0,0,.5);
  z-index:3;
}
.cw-rivet--br{ bottom:8px; right:8px; }
.cw-rivet--bl{ bottom:8px; left:8px; }

.cw-header{
  position:relative;
  display:flex; align-items:center; gap:12px;
  padding: 14px 16px 13px 18px;
  background: linear-gradient(180deg, var(--cw-navy-light), var(--cw-navy-mid));
  border-bottom: 1px solid var(--cw-brass-dim);
  flex-shrink:0;
}
.cw-avatar{
  position:relative;
  width:36px; height:36px; border-radius:9px; flex-shrink:0;
  background: var(--cw-brass-dim);
  border: 1px solid rgba(198,161,91,0.4);
  display:flex; align-items:center; justify-content:center;
}
.cw-avatar::after{
  content:""; position:absolute; inset:-3px; border-radius:12px;
  border: 1px solid rgba(198,161,91,0.25);
}
.cw-avatar svg{ width:19px; height:19px; color: var(--cw-brass-light); }

.cw-header__id{ flex:1; min-width:0; }
.cw-header__name{
  font-family: var(--cw-font-display); font-weight:600; font-size:15.5px;
  color: var(--cw-paper); letter-spacing:.01em; display:flex; align-items:center; gap:6px;
}
.cw-header__name svg{ width:12px; height:12px; color: var(--cw-brass-light); }
.cw-header__status{
  display:flex; align-items:center; gap:6px; margin-top:2px;
  font-family: var(--cw-font-mono); font-size:10px; letter-spacing:.06em;
  color: var(--cw-ok); text-transform:uppercase;
}

.cw-level{
  width:22px; height:9px; border-radius:5px;
  background: rgba(111,191,139,0.12);
  border: 1px solid rgba(111,191,139,0.4);
  position:relative; flex-shrink:0;
}
.cw-level__bubble{
  position:absolute; top:1.5px; left:6px;
  width:4.5px; height:4.5px; border-radius:50%;
  background: var(--cw-ok);
  box-shadow: 0 0 4px rgba(111,191,139,.8);
  animation: cw-drift 3.4s ease-in-out infinite;
}
@keyframes cw-drift{ 0%,100%{ left:2px; } 50%{ left:14px; } }

.cw-header__actions{ display:flex; gap:2px; flex-shrink:0; }
.cw-icon-btn{
  width:28px; height:28px; border-radius:7px; border:none; cursor:pointer;
  background:transparent; color: var(--cw-ink-muted);
  display:flex; align-items:center; justify-content:center;
  transition: background .15s, color .15s, transform .15s;
}
.cw-icon-btn svg{ width:14px; height:14px; }
.cw-icon-btn:hover{ background: rgba(255,255,255,0.06); color: var(--cw-brass-light); transform: translateY(-1px); }
.cw-icon-btn--close:hover{ background: rgba(217,119,107,0.12); color: var(--cw-warn); }
.cw-icon-btn:focus-visible{ outline: 2px solid var(--cw-brass-light); outline-offset: 1px; }

.cw-body{ flex:1; display:flex; flex-direction:column; min-height:0; }

.cw-log{
  flex:1; overflow-y:auto; min-height:0;
  padding: 18px 16px;
  display:flex; flex-direction:column; gap:14px;
  background-image:
    linear-gradient(var(--cw-brass-dim) 1px, transparent 1px),
    linear-gradient(90deg, var(--cw-brass-dim) 1px, transparent 1px);
  background-size: 22px 22px;
  background-color: var(--cw-navy-deep);
}
.cw-log::-webkit-scrollbar{ width:6px; }
.cw-log::-webkit-scrollbar-thumb{ background: var(--cw-brass-dim); border-radius:3px; }

.cw-msg{ display:flex; gap:9px; max-width:100%; }
.cw-msg--user{ flex-direction:row-reverse; }

.cw-msg__avatar{
  width:24px; height:24px; border-radius:6px; flex-shrink:0; margin-top:2px;
  display:flex; align-items:center; justify-content:center;
  background: var(--cw-brass-dim); border:1px solid rgba(198,161,91,.3);
}
.cw-msg__avatar svg{ width:12px; height:12px; color: var(--cw-brass-light); }

.cw-msg__bubble{
  max-width:78%; padding: 10px 13px; border-radius: 11px;
  font-size: 13.5px; line-height:1.55; color: var(--cw-paper);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-top-left-radius:4px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
}
.cw-msg--user .cw-msg__bubble{
  background: linear-gradient(155deg, var(--cw-brass-light), var(--cw-brass));
  color: var(--cw-navy-deep); font-weight:500;
  border:none; border-top-right-radius:4px; border-top-left-radius:11px;
  box-shadow: 0 3px 10px rgba(198,161,91,0.25);
}
.cw-msg--error .cw-msg__bubble{
  background: rgba(217,119,107,0.08); border-color: rgba(217,119,107,0.35);
}
.cw-msg__flag{
  display:flex; align-items:center; gap:5px; margin-bottom:5px;
  font-family: var(--cw-font-mono); font-size:10px; letter-spacing:.04em;
  color: var(--cw-warn); text-transform:uppercase;
}
.cw-msg__flag svg{ width:11px; height:11px; }

.cw-tape{ display:flex; align-items:center; gap:2px; height:14px; margin-top:2px; }
.cw-tape span{ width:2px; background: var(--cw-brass-light); border-radius:1px; animation: cw-tick 1.1s ease-in-out infinite; }
.cw-tape span:nth-child(odd){ height:6px; }
.cw-tape span:nth-child(even){ height:10px; }
.cw-tape span:nth-child(1){ animation-delay:0s; }
.cw-tape span:nth-child(2){ animation-delay:.1s; }
.cw-tape span:nth-child(3){ animation-delay:.2s; }
.cw-tape span:nth-child(4){ animation-delay:.3s; }
.cw-tape span:nth-child(5){ animation-delay:.4s; }
.cw-tape span:nth-child(6){ animation-delay:.5s; }
@keyframes cw-tick{ 0%,100%{ opacity:.35; } 50%{ opacity:1; } }

.cw-quick{
  display:flex; gap:7px; padding: 10px 14px;
  border-top:1px solid rgba(255,255,255,0.05);
  background: var(--cw-navy-deep);
  overflow-x:auto;
}
.cw-quick::-webkit-scrollbar{ display:none; }
.cw-chip{
  flex-shrink:0; white-space:nowrap; cursor:pointer;
  padding: 7px 12px; border-radius:20px; font-size:11.5px;
  font-family: var(--cw-font-body); color: var(--cw-ink-muted);
  background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
  transition: all .15s ease;
}
.cw-chip:hover{ color: var(--cw-brass-light); border-color: rgba(198,161,91,.4); background: var(--cw-brass-dim); transform: translateY(-1px); }
.cw-chip:focus-visible{ outline: 2px solid var(--cw-brass-light); outline-offset: 1px; }

.cw-composer{
  display:flex; gap:8px; padding: 12px;
  background: var(--cw-navy-light);
  border-top: 1px solid var(--cw-brass-dim);
  flex-shrink:0;
}
.cw-composer input{
  flex:1; min-width:0; padding: 11px 14px; border-radius:10px;
  border:1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.03);
  color: var(--cw-paper); font-family: var(--cw-font-body); font-size:13.5px;
  transition: border-color .15s, box-shadow .15s;
}
.cw-composer input::placeholder{ color: var(--cw-ink-muted); }
.cw-composer input:focus{ outline:none; border-color: var(--cw-brass); box-shadow: 0 0 0 3px rgba(198,161,91,0.15); }
.cw-composer input:disabled{ opacity:.55; }

.cw-send-btn{
  width:40px; height:40px; border-radius:10px; border:none; cursor:pointer;
  flex-shrink:0; display:flex; align-items:center; justify-content:center;
  background: linear-gradient(155deg, var(--cw-brass-light), var(--cw-brass));
  box-shadow: 0 3px 10px rgba(198,161,91,0.3);
  transition: filter .15s, transform .15s, box-shadow .15s;
}
.cw-send-btn:hover:not(:disabled){ filter:brightness(1.08); transform: translateY(-1px); box-shadow: 0 5px 14px rgba(198,161,91,0.42); }
.cw-send-btn:disabled{ opacity:.35; cursor:not-allowed; box-shadow:none; }
.cw-send-btn:focus-visible{ outline: 2px solid var(--cw-brass-light); outline-offset: 2px; }
.cw-send-btn svg{ width:15px; height:15px; color: var(--cw-navy-deep); }

.cw-spinner{
  width:15px; height:15px; border-radius:50%;
  border: 2px solid rgba(13,24,48,.25); border-top-color: var(--cw-navy-deep);
  animation: cw-spin .7s linear infinite;
}
@keyframes cw-spin{ to{ transform: rotate(360deg); } }

.cw-footer{ text-align:center; padding: 7px; background: var(--cw-navy-light); border-top: 1px solid rgba(255,255,255,0.04); }
.cw-footer span{ font-family: var(--cw-font-mono); font-size:9.5px; letter-spacing:.04em; color: var(--cw-ink-muted); text-transform:uppercase; }

.cw-sr-only{
  position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;
}

@media (max-width: 420px){
  .cw-panel{ width: calc(100vw - 24px); }
  .cw-launcher, .cw-panel{ right:12px; bottom:12px; }
}
@media (prefers-reduced-motion: reduce){
  .cw-launcher, .cw-badge, .cw-level__bubble, .cw-tape span, .cw-spinner, .cw-panel::after{
    animation-duration: .001ms !important;
  }
}
`

// ── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className={`cw-msg ${isUser ? 'cw-msg--user' : ''} ${msg.isError ? 'cw-msg--error' : ''}`}
    >
      <div className="cw-msg__avatar" aria-hidden="true">
        {isUser ? <User /> : <Bot />}
      </div>
      <div className="cw-msg__bubble">
        {msg.isError && (
          <span className="cw-msg__flag"><AlertCircle /> Connection issue</span>
        )}
        <div>{msg.content}</div>
        {msg.loading && (
          <div className="cw-tape" role="status" aria-label="Assistant is typing">
            {Array.from({ length: 6 }).map((_, i) => <span key={i} />)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Main ChatWidget ───────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: nextId(), role: 'assistant',
      content: '👋 Hi! I\'m IconBuilders AI — your 24/7 construction assistant. Ask me anything about costs, materials, timelines, or how our platform works!' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(1)
  const [minimized, setMinimized] = useState(false)
  const bottomRef = useRef()
  const inputRef = useRef()
  const liveRegionRef = useRef()
  const panelTitleId = useId()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (open && !minimized) {
      const t = setTimeout(() => inputRef.current?.focus(), 260)
      setUnread(0)
      return () => clearTimeout(t)
    }
  }, [open, minimized])

  useEffect(() => {
    if (!open) return
    const onKeyDown = e => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const announce = text => { if (liveRegionRef.current) liveRegionRef.current.textContent = text }

  const sendMessage = async (text) => {
    const userText = (text ?? input).trim()
    if (!userText || loading) return

    setInput('')
    setUnread(0)

    const userMsg = { id: nextId(), role: 'user', content: userText }
    const loadingId = nextId()
    setMessages(prev => [...prev, userMsg, { id: loadingId, role: 'assistant', content: '', loading: true }])
    setLoading(true)

    try {
      const history = messages.filter(m => !m.loading).map(m => ({ role: m.role, content: m.content }))
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message: userText }),
      })

      if (response.status === 429) throw new RateLimitError('rate limited')
      if (!response.ok) throw new ApiError(`status ${response.status}`)

      const data = await response.json()
      const reply = data.reply || 'Sorry, I could not process that. Please try again.'
      setMessages(prev => [...prev.filter(m => m.id !== loadingId), { id: nextId(), role: 'assistant', content: reply }])
      announce(reply)
    } catch (err) {
      let content
      if (err instanceof RateLimitError) {
        content = '⏳ We\'re getting a lot of questions right now — please try again in a few seconds.'
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        content = '📡 You appear to be offline. Reconnect and I\'ll pick up right where we left off.'
      } else {
        console.error('IconBuilders chat error:', err)
        content = getFallbackReply(userText)
      }
      setMessages(prev => [...prev.filter(m => m.id !== loadingId), { id: nextId(), role: 'assistant', content, isError: true }])
      announce(content)
    } finally {
      setLoading(false)
    }
  }

  const resetChat = () => {
    setMessages([{ id: nextId(), role: 'assistant',
      content: '👋 Chat reset! Ask me anything about construction costs, materials, timelines, or our platform!' }])
  }

  return (
    <div className="cw-root">
      <style>{STYLES}</style>

      {/* ── Launcher ── */}
      <motion.button
        onClick={() => { setOpen(true); setMinimized(false) }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        className={`cw-launcher ${open ? 'is-hidden' : ''}`}
        aria-label="Open AI chat assistant"
        aria-expanded={open}
      >
        <Bot aria-hidden="true" />
        {unread > 0 && (
          <span className="cw-badge" aria-label={`${unread} unread message${unread > 1 ? 's' : ''}`}>
            {unread}
          </span>
        )}
      </motion.button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-labelledby={panelTitleId}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: minimized ? 68 : 540 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.22, type: 'spring', stiffness: 300, damping: 26 }}
            className="cw-panel"
          >
            <span className="cw-rivet cw-rivet--br" aria-hidden="true" />
            <span className="cw-rivet cw-rivet--bl" aria-hidden="true" />

            {/* Header */}
            <div className="cw-header">
              <div className="cw-avatar" aria-hidden="true"><Bot /></div>
              <div className="cw-header__id">
                <span id={panelTitleId} className="cw-header__name">
                  IconBuilders AI <Sparkles aria-hidden="true" />
                </span>
                <div className="cw-header__status">
                  <span className="cw-level" aria-hidden="true"><span className="cw-level__bubble" /></span>
                  On site · 24/7
                </div>
              </div>
              <div className="cw-header__actions">
                <button onClick={resetChat} className="cw-icon-btn" aria-label="Reset chat">
                  <RotateCcw aria-hidden="true" />
                </button>
                <button onClick={() => setMinimized(!minimized)} className="cw-icon-btn"
                  aria-label={minimized ? 'Expand chat' : 'Minimize chat'} aria-pressed={minimized}>
                  {minimized ? <Maximize2 aria-hidden="true" /> : <Minimize2 aria-hidden="true" />}
                </button>
                <button onClick={() => setOpen(false)} className="cw-icon-btn cw-icon-btn--close" aria-label="Close chat">
                  <X aria-hidden="true" />
                </button>
              </div>
            </div>

            {!minimized && (
              <div className="cw-body">
                <div ref={liveRegionRef} aria-live="polite" aria-atomic="true" className="cw-sr-only" />

                <div className="cw-log" role="log" aria-label="Chat conversation">
                  {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                  <div ref={bottomRef} />
                </div>

                {messages.length <= 2 && (
                  <div className="cw-quick">
                    {QUICK_REPLIES.slice(0, 3).map(q => (
                      <button key={q} onClick={() => sendMessage(q)} className="cw-chip">
                        {q.length > 28 ? q.slice(0, 28) + '…' : q}
                      </button>
                    ))}
                  </div>
                )}

                <form className="cw-composer" onSubmit={e => { e.preventDefault(); sendMessage() }}>
                  <label htmlFor="cw-chat-input" className="cw-sr-only">Type your message</label>
                  <input
                    id="cw-chat-input"
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={loading}
                    autoComplete="off"
                  />
                  <button type="submit" className="cw-send-btn" disabled={loading || !input.trim()} aria-label="Send message">
                    {loading ? <span className="cw-spinner" aria-hidden="true" /> : <Send aria-hidden="true" />}
                  </button>
                </form>

                <div className="cw-footer">
                  <span>Powered by Claude AI · iconbuilderindia.com</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}