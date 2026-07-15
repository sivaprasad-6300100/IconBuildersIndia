import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, X, Send, Bot, User,
  Minimize2, RotateCcw, Sparkles,
} from 'lucide-react'

// ── Quick reply suggestions ───────────────────────────────────────────────────
const QUICK_REPLIES = [
  'What is the cost to build a 1200 sqft house?',
  'How does milestone tracking work?',
  'What materials do you recommend?',
  'How long does construction take?',
  'How do I track my project progress?',
]

// ── System prompt for Claude ──────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are ReliaState AI Assistant — a friendly, knowledgeable construction and real estate expert for IconBuilderIndia.com.

You help clients with:
- Construction cost estimates (standard rate: ₹1800-3200 per sqft depending on quality)
- Material recommendations (budget, standard, premium tiers)
- Project timeline guidance (typical: 6-14 months depending on size)
- Explaining ReliaState platform features (live tracking, OTP login, 3 dashboards)
- Construction process questions (foundation, structure, finishing stages)
- Connecting clients with the team via WhatsApp: +91 98765 43210

ReliaState platform features:
- Client Dashboard: live milestone tracking, photo gallery, payment view
- Contractor Dashboard: photo uploads, milestone updates
- Admin Panel: full project management
- Smart Cost Estimator: instant budget calculator
- OTP-based secure login
- AI Chatbot (that's you!) available 24/7

Keep responses concise (2-4 sentences max), friendly, and professional.
Always end with an offer to help further or suggest contacting the team.
Use ₹ for Indian Rupee. Focus on Hyderabad/India market.`

// ── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
        ${isUser ? 'bg-gold/20 border border-gold/30' : 'bg-gold/15 border border-gold/25'}`}>
        {isUser
          ? <User size={13} className="text-gold" />
          : <Bot size={13} className="text-gold" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? 'bg-gold text-navy font-medium rounded-tr-sm'
          : 'bg-white/8 text-cream border border-white/10 rounded-tl-sm'}`}>
        {msg.content}
        {msg.loading && (
          <div className="flex gap-1 mt-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-soft animate-bounce"
                style={{ animationDelay: `${i*0.15}s` }} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Main ChatWidget ───────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m ReliaState AI — your 24/7 construction assistant. Ask me anything about costs, materials, timelines, or how our platform works!',
    },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [unread, setUnread]     = useState(1)
  const [minimized, setMinimized] = useState(false)
  const bottomRef               = useRef()
  const inputRef                = useRef()

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300)
      setUnread(0)
    }
  }, [open, minimized])

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    setUnread(0)

    const userMsg = { role: 'user', content: userText }
    const loadingMsg = { role: 'assistant', content: '', loading: true }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setLoading(true)

    try {
      const history = messages
        .filter(m => !m.loading)
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: [...history, { role: 'user', content: userText }],
        }),
      })

      if (!response.ok) throw new Error('API error')

      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Sorry, I could not process that. Please try again.'

      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { role: 'assistant', content: reply },
      ])
    } catch {
      // Fallback smart replies when API not configured
      const fallback = getFallbackReply(userText)
      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { role: 'assistant', content: fallback },
      ])
    } finally {
      setLoading(false)
    }
  }

  // ── Fallback replies (works without API key) ──────────────────────────────
  const getFallbackReply = (text) => {
    const t = text.toLowerCase()
    if (t.includes('cost') || t.includes('price') || t.includes('budget') || t.includes('sqft'))
      return '💰 Construction costs in Hyderabad range from ₹1,800–3,200/sqft depending on quality. A 1200 sqft house typically costs ₹25L–45L. Use our Smart Estimator at /estimator for a detailed breakdown!'
    if (t.includes('time') || t.includes('long') || t.includes('months') || t.includes('duration'))
      return '⏱ A typical 1200 sqft house takes 8–12 months. Ground floor alone: 6–8 months. Each additional floor adds 2–3 months. We track every milestone live on your dashboard!'
    if (t.includes('material') || t.includes('brick') || t.includes('cement') || t.includes('steel'))
      return '🧱 We recommend AAC blocks for walls (lighter, better insulation), Fe500 steel for structure, and OPC 53-grade cement. Material quality depends on your budget tier — ask us for a detailed material list!'
    if (t.includes('track') || t.includes('progress') || t.includes('photo') || t.includes('dashboard'))
      return '📊 Your Client Dashboard shows live milestone progress, daily site photos uploaded by your contractor, payment tracking, and real-time notifications — all in one place!'
    if (t.includes('login') || t.includes('otp') || t.includes('password') || t.includes('account'))
      return '🔐 ReliaState uses secure OTP-based login — no passwords needed! Enter your phone number, get an OTP via SMS, and you\'re in. Role-based access ensures you only see your own project.'
    if (t.includes('whatsapp') || t.includes('contact') || t.includes('call') || t.includes('team'))
      return '📱 You can reach our team directly on WhatsApp: +91 98765 43210. We respond within 2 hours (Mon–Sat, 9AM–7PM). You can also use the Contact form on our homepage!'
    if (t.includes('floor') || t.includes('foundation') || t.includes('stage') || t.includes('phase'))
      return '🏗 Construction has 7 key stages: Foundation → Structure → Brickwork → Electrical & Plumbing → Plastering → Flooring → Final Finishing. Each stage is tracked as a milestone on your dashboard!'
    if (t.includes('estimat') || t.includes('calculator') || t.includes('quote'))
      return '🧮 Our Smart Estimator gives you an instant cost breakdown in 60 seconds! Just enter plot size, floors, city, and quality tier. Visit /estimator or click "Free Estimate" in the navbar.'
    return '🤖 Great question! For detailed assistance, our team is available on WhatsApp: +91 98765 43210. You can also use our Smart Estimator at /estimator for instant cost calculations. How else can I help?'
  }

  const resetChat = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Chat reset! I\'m ReliaState AI — ask me anything about construction costs, materials, timelines, or our platform!',
    }])
  }

  return (
    <>
      {/* ── Floating button ── */}
      <motion.button
        onClick={() => { setOpen(true); setMinimized(false) }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 200 }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                    bg-gradient-to-br from-gold to-gold-light
                    shadow-[0_0_30px_rgba(201,168,76,0.5)]
                    flex items-center justify-center
                    hover:shadow-[0_0_45px_rgba(201,168,76,0.7)]
                    hover:scale-110 transition-all duration-200
                    ${open ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100'}`}
        aria-label="Open AI Chat"
      >
        <Bot size={24} className="text-navy" />
        {unread > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500
                          flex items-center justify-center text-white text-[10px] font-bold
                          animate-bounce">
            {unread}
          </div>
        )}
      </motion.button>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px]
                       flex flex-col rounded-2xl overflow-hidden
                       shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                       border border-gold/20"
            style={{ height: minimized ? 'auto' : '520px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-navy-mid to-navy-light
                            border-b border-gold/15 px-4 py-3
                            flex items-center gap-3 flex-shrink-0">
              {/* Bot avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30
                                flex items-center justify-center">
                  <Bot size={18} className="text-gold" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
                                bg-green-400 border-2 border-navy-mid" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-cream font-bold text-sm">ReliaState AI</span>
                  <Sparkles size={11} className="text-gold" />
                </div>
                <span className="text-[11px] text-green-400 font-medium">● Online 24/7</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button onClick={resetChat}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                             text-slate-soft hover:text-gold hover:bg-white/5 transition-all"
                  title="Reset chat">
                  <RotateCcw size={13} />
                </button>
                <button onClick={() => setMinimized(!minimized)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                             text-slate-soft hover:text-gold hover:bg-white/5 transition-all"
                  title="Minimize">
                  <Minimize2 size={13} />
                </button>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                             text-slate-soft hover:text-red-400 hover:bg-red-400/5 transition-all"
                  title="Close">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            {!minimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4
                                bg-navy scrollbar-thin">
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} />
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Quick replies */}
                {messages.length <= 2 && (
                  <div className="px-3 py-2 border-t border-white/5 bg-navy flex gap-2 overflow-x-auto
                                  scrollbar-none flex-nowrap">
                    {QUICK_REPLIES.slice(0,3).map((q, i) => (
                      <button key={i} onClick={() => sendMessage(q)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs
                                   bg-white/5 border border-white/10 text-slate-soft
                                   hover:bg-gold/10 hover:text-gold hover:border-gold/25
                                   transition-all whitespace-nowrap">
                        {q.length > 28 ? q.slice(0,28)+'…' : q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="px-3 py-3 border-t border-white/8 bg-navy-mid flex gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask me anything..."
                    disabled={loading}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10
                               text-cream text-sm placeholder:text-slate-muted
                               focus:outline-none focus:border-gold/40
                               transition-all disabled:opacity-60"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light
                               flex items-center justify-center flex-shrink-0
                               disabled:opacity-40 disabled:cursor-not-allowed
                               hover:shadow-gold transition-all"
                  >
                    {loading
                      ? <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                      : <Send size={15} className="text-navy" />}
                  </button>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-navy-mid border-t border-white/5 text-center">
                  <span className="text-[10px] text-slate-muted">
                    Powered by Claude AI · iconbuilderindia.com
                  </span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
