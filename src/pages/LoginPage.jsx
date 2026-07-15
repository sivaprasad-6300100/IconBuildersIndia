import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ArrowRight, ArrowLeft, Shield, RefreshCw, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

// ── OTP Input — 6 boxes ──────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([])

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputs.current[index - 1]?.focus()
        const arr = value.split('')
        arr[index - 1] = ''
        onChange(arr.join(''))
      }
    }
  }

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const arr = value.padEnd(6, ' ').split('')
    arr[index] = val
    const next = arr.join('').replace(/ /g, '')
    onChange(next)
    if (val && index < 5) inputs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {[...Array(6)].map((_, i) => (
        <motion.input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          disabled={disabled}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.06 }}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-xl
            border transition-all duration-200 outline-none
            bg-white/5 text-cream caret-gold
            ${value[i]
              ? 'border-gold bg-gold/10 shadow-[0_0_12px_rgba(201,168,76,0.25)]'
              : 'border-white/15 focus:border-gold/60 focus:bg-gold/5'}
            disabled:opacity-50
          `}
        />
      ))}
    </div>
  )
}

// ── Particle background ──────────────────────────────────────────────────────
function LoginParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gold/30"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [-20, -80], opacity: [0, 0.6, 0] }}
          transition={{ duration: 3 + Math.random() * 4, delay: Math.random() * 5, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
      {/* Gold orb top right */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
      {/* Blue orb bottom left */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(30,68,112,0.3) 0%, transparent 70%)' }} />
    </div>
  )
}

// ── Main Login Page ──────────────────────────────────────────────────────────
export default function LoginPage() {
  const [step, setStep]         = useState('phone') // 'phone' | 'otp' | 'success'
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const timerRef = useRef(null)

  const { login, isAuthenticated, user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || null

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const map = { client: '/client', contractor: '/contractor', admin: '/admin' }
      navigate(map[user.role] || '/', { replace: true })
    }
  }, [isAuthenticated])

  // Countdown timer for resend OTP
  const startTimer = () => {
    setResendTimer(30)
    timerRef.current = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const sendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Enter a valid 10-digit phone number')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { phone })
      toast.success(`OTP sent to +91 ${phone}`)
      setStep('otp')
      startTimer()
    } catch (err) {
      // ── DEMO MODE: works even without backend ──
      if (err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
        toast.success(`OTP sent to +91 ${phone} (Demo: use 123456)`)
        setStep('otp')
        startTimer()
      } else {
        toast.error(err.response?.data?.message || 'Failed to send OTP')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const verifyOTP = async () => {
    if (otp.length < 6) {
      toast.error('Enter the complete 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp })
      const { user: userData, token } = res.data
      login(userData, token)
      setStep('success')
      setTimeout(() => {
        const map = { client: '/client', contractor: '/contractor', admin: '/admin' }
        navigate(from || map[userData.role] || '/', { replace: true })
      }, 1500)
    } catch (err) {
      // ── DEMO MODE ──
      if (otp === '123456' || err.code === 'ERR_NETWORK') {
        const demoUser = { id: 1, name: 'Demo User', phone, role: 'admin' }
        const demoToken = 'demo-jwt-token-reliastate'
        login(demoUser, demoToken)
        setStep('success')
        setTimeout(() => navigate(from || '/admin', { replace: true }), 1500)
      } else {
        toast.error(err.response?.data?.message || 'Invalid OTP. Try again.')
        setOtp('')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const resendOTP = async () => {
    if (resendTimer > 0) return
    setOtp('')
    await sendOTP()
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 relative overflow-hidden">

      <LoginParticles />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">

        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-soft text-sm
                                hover:text-gold transition-colors mb-8 group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass border border-gold/15 rounded-3xl p-8 relative overflow-hidden"
        >
          {/* Card glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                            bg-gold/10 border border-gold/20 mb-4 relative">
              <div className="text-2xl font-black">
                <span className="text-cream">R</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full
                              bg-green-400 border-2 border-navy flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="font-black text-2xl tracking-tight mb-1">
              <span className="text-cream">RELIA</span><span className="text-gold">STATE</span>
            </div>
            <div className="text-xs text-slate-soft tracking-widest uppercase">Secure OTP Login</div>
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Phone ── */}
            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 text-center">
                  <h2 className="text-cream font-bold text-xl mb-1">Welcome Back</h2>
                  <p className="text-slate-soft text-sm">Enter your phone number to receive a secure OTP</p>
                </div>

                {/* Phone input */}
                <div className="mb-5">
                  <label className="text-xs text-slate-soft uppercase tracking-wider mb-2 block">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    {/* Country code */}
                    <div className="flex items-center gap-2 px-3 py-3.5 rounded-xl
                                    bg-white/5 border border-white/10 text-cream text-sm
                                    flex-shrink-0 font-medium">
                      🇮🇳 +91
                    </div>
                    {/* Number */}
                    <div className="relative flex-1">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onKeyDown={e => e.key === 'Enter' && sendOTP()}
                        placeholder="98765 43210"
                        className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10
                                   text-cream text-sm placeholder:text-slate-muted
                                   focus:outline-none focus:border-gold/40 focus:bg-gold/5
                                   transition-all duration-200"
                      />
                    </div>
                  </div>
                  {phone.length > 0 && phone.length < 10 && (
                    <p className="text-red-400 text-xs mt-1.5 ml-1">Enter complete 10-digit number</p>
                  )}
                </div>

                {/* Trust badges */}
                <div className="flex gap-3 mb-6">
                  {[
                    { icon: Shield, text: 'Secure OTP' },
                    { text: 'No Password Needed' },
                    { text: 'Instant Access' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-slate-soft">
                      {b.icon && <b.icon size={11} className="text-gold/60" />}
                      {!b.icon && <div className="w-1 h-1 rounded-full bg-gold/40" />}
                      {b.text}
                    </div>
                  ))}
                </div>

                {/* Send OTP button */}
                <button
                  onClick={sendOTP}
                  disabled={loading || phone.length < 10}
                  className="w-full py-4 rounded-xl btn-gold text-sm font-bold
                             flex items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Sending OTP...</>
                  ) : (
                    <>Send OTP <ArrowRight size={15} /></>
                  )}
                </button>

                <p className="text-center text-xs text-slate-soft mt-4">
                  OTP sent via SMS · Powered by MSG91
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 text-center">
                  <h2 className="text-cream font-bold text-xl mb-1">Enter OTP</h2>
                  <p className="text-slate-soft text-sm">
                    Sent to <span className="text-gold font-semibold">+91 {phone}</span>
                  </p>
                  <button
                    onClick={() => { setStep('phone'); setOtp('') }}
                    className="text-xs text-slate-soft hover:text-gold transition-colors mt-1
                               inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={11} /> Change number
                  </button>
                </div>

                {/* OTP boxes */}
                <div className="mb-6">
                  <OTPInput value={otp} onChange={setOtp} disabled={loading} />
                </div>

                {/* Auto verify when 6 digits entered */}
                {otp.length === 6 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs text-gold mb-3"
                  >
                    ✓ OTP complete — tap Verify
                  </motion.div>
                )}

                {/* Verify button */}
                <button
                  onClick={verifyOTP}
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 rounded-xl btn-gold text-sm font-bold
                             flex items-center justify-center gap-2 mb-4
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Verifying...</>
                  ) : (
                    <>Verify & Login <ArrowRight size={15} /></>
                  )}
                </button>

                {/* Resend */}
                <div className="text-center">
                  <span className="text-slate-soft text-xs">Didn't receive OTP? </span>
                  <button
                    onClick={resendOTP}
                    disabled={resendTimer > 0}
                    className="text-xs font-semibold inline-flex items-center gap-1
                               disabled:text-slate-soft text-gold hover:text-gold-light
                               transition-colors disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? (
                      <><RefreshCw size={11} /> Resend in {resendTimer}s</>
                    ) : (
                      <><RefreshCw size={11} /> Resend OTP</>
                    )}
                  </button>
                </div>

                {/* Demo hint */}
                <div className="mt-4 p-3 rounded-xl bg-gold/5 border border-gold/15 text-center">
                  <p className="text-xs text-slate-soft">
                    🧪 <span className="text-gold font-semibold">Demo mode:</span> Use OTP <span className="text-gold font-bold">123456</span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-green-400/10 border border-green-400/25
                              flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle size={38} className="text-green-400" />
                </motion.div>
                <h3 className="text-cream font-bold text-xl mb-2">Login Successful!</h3>
                <p className="text-slate-soft text-sm mb-4">Redirecting to your dashboard...</p>
                <div className="flex justify-center">
                  <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.4, ease: 'easeInOut' }}
                      className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* Role info below card */}
        {step === 'phone' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 grid grid-cols-3 gap-3"
          >
            {[
              { role: 'Client',     emoji: '👤', desc: 'Track your project' },
              { role: 'Contractor', emoji: '🏗', desc: 'Upload progress' },
              { role: 'Admin',      emoji: '⚙️', desc: 'Manage platform' },
            ].map(r => (
              <div key={r.role} className="glass border border-white/8 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{r.emoji}</div>
                <div className="text-cream text-xs font-semibold">{r.role}</div>
                <div className="text-slate-soft text-[10px] mt-0.5">{r.desc}</div>
              </div>
            ))}
          </motion.div>
        )}

        <p className="text-center text-xs text-slate-soft mt-6">
          © ReliaState · iconbuilderindia.com · Secure Platform
        </p>
      </div>
    </div>
  )
}
