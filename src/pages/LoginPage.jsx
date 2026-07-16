import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, ArrowRight, ArrowLeft, Shield,
  RefreshCw, CheckCircle, Lock, Eye, EyeOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

// ── OTP 6-box input ───────────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([])

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus()
      const arr = value.split('')
      arr[index - 1] = ''
      onChange(arr.join(''))
    }
  }

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const arr = value.padEnd(6, ' ').split('')
    arr[index] = val
    onChange(arr.join('').replace(/ /g, ''))
    if (val && index < 5) inputs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-2.5 justify-center">
      {[...Array(6)].map((_, i) => (
        <motion.input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ''} disabled={disabled}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.06 }}
          className={`w-11 h-13 text-center text-xl font-bold rounded-xl
            border transition-all duration-200 outline-none
            bg-white/5 text-cream caret-gold
            ${value[i]
              ? 'border-gold bg-gold/10 shadow-[0_0_12px_rgba(201,168,76,0.2)]'
              : 'border-white/15 focus:border-gold/60 focus:bg-gold/5'}
            disabled:opacity-50`}
        />
      ))}
    </div>
  )
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const [loginType, setLoginType]     = useState(null)      // 'admin' | 'user'
  const [step, setStep]               = useState('select')  // select | phone | otp | password | success
  const [phone, setPhone]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp]                 = useState('')
  const [loading, setLoading]         = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const timerRef                      = useRef(null)

  const { loginAsAdmin, requestOTP, loginWithOTP, isAuthenticated, user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || null

  // Already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const map = { client: '/client', contractor: '/contractor', admin: '/admin' }
      navigate(map[user.role] || '/', { replace: true })
    }
  }, [isAuthenticated])

  // Countdown timer
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

  // ── Select login type ─────────────────────────────────────────────────────
  const selectType = (type) => {
    setLoginType(type)
    setStep(type === 'admin' ? 'password' : 'phone')
  }

  // ── Admin login ───────────────────────────────────────────────────────────
  const handleAdminLogin = async () => {
    if (!phone || !password) { toast.error('Enter phone and password'); return }
    setLoading(true)
    try {
      const data = await loginAsAdmin(phone, password)
      setStep('success')
      setTimeout(() => navigate(from || '/admin', { replace: true }), 1500)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) { toast.error('Enter valid 10-digit number'); return }
    setLoading(true)
    try {
      const data = await requestOTP(phone)
      toast.success(`OTP sent to +91 ${phone}`)
      if (data.dev_otp) toast(`Dev OTP: ${data.dev_otp}`, { icon: '🧪' })
      setStep('otp')
      startTimer()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    if (otp.length < 6) { toast.error('Enter complete 6-digit OTP'); return }
    setLoading(true)
    try {
      const data = await loginWithOTP(phone, otp)
      setStep('success')
      const map = { client: '/client', contractor: '/contractor', admin: '/admin' }
      setTimeout(() => navigate(from || map[data.user.role] || '/', { replace: true }), 1500)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP')
      setOtp('')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setOtp('')
    await handleSendOTP()
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(30,68,112,0.2) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-soft text-sm hover:text-gold transition-colors mb-6 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
          className="glass border border-gold/15 rounded-3xl p-8 relative overflow-hidden">

          <div className="absolute -top-12 -right-12 w-40 h-40 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 mb-4">
              <span className="text-gold font-black text-2xl">R</span>
            </div>
            <div className="font-black text-2xl tracking-tight mb-1">
              <span className="text-cream">RELIA</span><span className="text-gold">STATE</span>
            </div>
            <div className="text-xs text-slate-soft tracking-widest uppercase">Secure Login</div>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step: Select login type ── */}
            {step === 'select' && (
              <motion.div key="select" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.25 }}>
                <h2 className="text-cream font-bold text-lg text-center mb-2">Who are you?</h2>
                <p className="text-slate-soft text-sm text-center mb-6">Choose your login type to continue</p>
                <div className="space-y-3">
                  {[
                    { type:'admin',      emoji:'⚙️', label:'Admin',      desc:'Login with phone + password',   color:'border-purple-400/30 hover:border-purple-400/60' },
                    { type:'user',       emoji:'👤', label:'Client',     desc:'Login with phone + OTP',        color:'border-gold/30 hover:border-gold/60' },
                    { type:'user',       emoji:'🏗',  label:'Contractor', desc:'Login with phone + OTP',        color:'border-blue-400/30 hover:border-blue-400/60' },
                  ].map((item, i) => (
                    <button key={i} onClick={() => selectType(item.type)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border glass transition-all duration-200 hover:-translate-y-0.5 ${item.color}`}>
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="text-left">
                        <div className="text-cream font-bold text-sm">{item.label}</div>
                        <div className="text-slate-soft text-xs">{item.desc}</div>
                      </div>
                      <ArrowRight size={15} className="text-slate-soft ml-auto" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step: Admin password login ── */}
            {step === 'password' && (
              <motion.div key="password" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.25 }}>
                <button onClick={() => setStep('select')} className="flex items-center gap-1 text-xs text-slate-soft hover:text-gold mb-5">
                  <ArrowLeft size={12} /> Back
                </button>
                <h2 className="text-cream font-bold text-lg mb-1">Admin Login</h2>
                <p className="text-slate-soft text-sm mb-6">Enter your credentials</p>

                <div className="space-y-4 mb-5">
                  {/* Phone */}
                  <div>
                    <label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm flex-shrink-0">
                        🇮🇳 +91
                      </div>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                        onKeyDown={e => e.key==='Enter' && document.getElementById('admin-pass')?.focus()}
                        placeholder="Phone number"
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
                    </div>
                  </div>
                  {/* Password */}
                  <div>
                    <label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
                      <input id="admin-pass" type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key==='Enter' && handleAdminLogin()}
                        placeholder="Your password"
                        className="w-full pl-9 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 transition-all" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-soft hover:text-gold transition-colors">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button onClick={handleAdminLogin} disabled={loading}
                  className="w-full py-4 rounded-xl btn-gold text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <><div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Logging in...</> : <>Login as Admin <ArrowRight size={14} /></>}
                </button>
              </motion.div>
            )}

            {/* ── Step: Phone number ── */}
            {step === 'phone' && (
              <motion.div key="phone" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.25 }}>
                <button onClick={() => setStep('select')} className="flex items-center gap-1 text-xs text-slate-soft hover:text-gold mb-5">
                  <ArrowLeft size={12} /> Back
                </button>
                <h2 className="text-cream font-bold text-lg mb-1">Enter Your Phone</h2>
                <p className="text-slate-soft text-sm mb-6">We'll send a 6-digit OTP to verify</p>

                <div className="mb-5">
                  <label className="text-xs text-slate-soft uppercase tracking-wider mb-1.5 block">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-3.5 rounded-xl bg-white/5 border border-white/10 text-cream text-sm flex-shrink-0">
                      🇮🇳 +91
                    </div>
                    <div className="relative flex-1">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                        onKeyDown={e => e.key==='Enter' && handleSendOTP()}
                        placeholder="10-digit number"
                        className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-cream text-sm placeholder:text-slate-muted focus:outline-none focus:border-gold/40 focus:bg-gold/5 transition-all" />
                    </div>
                  </div>
                  {phone.length > 0 && phone.length < 10 && (
                    <p className="text-red-400 text-xs mt-1.5 ml-1">Enter complete 10-digit number</p>
                  )}
                </div>

                <div className="flex gap-3 mb-5 text-xs text-slate-soft">
                  <Shield size={13} className="text-gold/60 flex-shrink-0 mt-0.5" />
                  <span>Only admin-registered numbers can login. Contact admin if you can't access.</span>
                </div>

                <button onClick={handleSendOTP} disabled={loading || phone.length < 10}
                  className="w-full py-4 rounded-xl btn-gold text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <><div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Sending...</> : <>Send OTP <ArrowRight size={14} /></>}
                </button>
              </motion.div>
            )}

            {/* ── Step: OTP ── */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.25 }}>
                <div className="text-center mb-6">
                  <h2 className="text-cream font-bold text-lg mb-1">Enter OTP</h2>
                  <p className="text-slate-soft text-sm">
                    Sent to <span className="text-gold font-semibold">+91 {phone}</span>
                  </p>
                  <button onClick={() => { setStep('phone'); setOtp('') }} className="text-xs text-slate-soft hover:text-gold mt-1 inline-flex items-center gap-1">
                    <ArrowLeft size={11} /> Change number
                  </button>
                </div>

                <div className="mb-5">
                  <OTPInput value={otp} onChange={setOtp} disabled={loading} />
                </div>

                {otp.length === 6 && (
                  <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center text-xs text-gold mb-3">
                    ✓ OTP complete — tap Verify
                  </motion.p>
                )}

                <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6}
                  className="w-full py-4 rounded-xl btn-gold text-sm font-bold flex items-center justify-center gap-2 mb-4 disabled:opacity-50">
                  {loading ? <><div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Verifying...</> : <>Verify & Login <ArrowRight size={14} /></>}
                </button>

                <div className="text-center">
                  <span className="text-slate-soft text-xs">Didn't receive? </span>
                  <button onClick={handleResend} disabled={resendTimer > 0}
                    className="text-xs font-semibold inline-flex items-center gap-1 text-gold hover:text-gold-light disabled:text-slate-soft transition-colors disabled:cursor-not-allowed">
                    <RefreshCw size={11} />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step: Success ── */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ type:'spring' }} className="py-8 text-center">
                <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.1, type:'spring', stiffness:200 }}
                  className="w-20 h-20 rounded-full bg-green-400/10 border border-green-400/25 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={36} className="text-green-400" />
                </motion.div>
                <h3 className="text-cream font-bold text-xl mb-2">Login Successful!</h3>
                <p className="text-slate-soft text-sm mb-4">Redirecting to your dashboard...</p>
                <div className="flex justify-center">
                  <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width:0 }} animate={{ width:'100%' }} transition={{ duration:1.4 }}
                      className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-slate-soft mt-5">
          © ReliaState · iconbuilderindia.com
        </p>
      </div>
    </div>
  )
}
