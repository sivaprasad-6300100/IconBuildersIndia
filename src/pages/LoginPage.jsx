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
    <div className="otp">
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
          className={`otp__box ${value[i] ? 'otp__box--filled' : ''}`}
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
    <div className="lgn">
      <style>{`
        .lgn {
          min-height: 100vh;
          background: #071422;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1rem;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .lgn__grid-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.2;
          background-image:
            linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .lgn__glow-top {
          position: absolute;
          top: -8rem; right: -8rem;
          width: 24rem; height: 24rem;
          border-radius: 9999px;
          pointer-events: none;
          background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
        }
        .lgn__glow-bottom {
          position: absolute;
          bottom: -8rem; left: -8rem;
          width: 24rem; height: 24rem;
          border-radius: 9999px;
          pointer-events: none;
          background: radial-gradient(circle, rgba(30,68,112,0.2) 0%, transparent 70%);
        }

        .lgn__container { position: relative; z-index: 10; width: 100%; max-width: 28rem; }

        .lgn__back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #8fa3b8;
          font-size: 0.875rem;
          text-decoration: none;
          margin-bottom: 1.5rem;
          transition: color 0.2s ease;
        }
        .lgn__back:hover { color: #c9a84c; }
        .lgn__back-icon { transition: transform 0.2s ease; }
        .lgn__back:hover .lgn__back-icon { transform: translateX(-3px); }

        .lgn__card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 1.5rem;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        .lgn__card-glow {
          position: absolute;
          top: -3rem; right: -3rem;
          width: 10rem; height: 10rem;
          background: rgba(201,168,76,0.05);
          border-radius: 9999px;
          filter: blur(48px);
          pointer-events: none;
        }

        .lgn__logo-wrap { text-align: center; margin-bottom: 2rem; }
        .lgn__logo-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3.5rem; height: 3.5rem;
          border-radius: 1rem;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.2);
          margin-bottom: 1rem;
        }
        .lgn__logo-letter { color: #c9a84c; font-weight: 900; font-size: 1.5rem; }
        .lgn__brand { font-weight: 900; font-size: 1.5rem; letter-spacing: -0.02em; margin-bottom: 0.25rem; }
        .lgn__brand-cream { color: #e8d5a3; }
        .lgn__brand-gold { color: #c9a84c; }
        .lgn__brand-sub { font-size: 0.75rem; color: #8fa3b8; letter-spacing: 0.2em; text-transform: uppercase; }

        .lgn__step-title { color: #e8d5a3; font-weight: 700; font-size: 1.125rem; text-align: center; margin: 0 0 0.5rem; }
        .lgn__step-title--left { text-align: left; margin-bottom: 0.25rem; }
        .lgn__step-sub { color: #8fa3b8; font-size: 0.875rem; text-align: center; margin: 0 0 1.5rem; }
        .lgn__step-sub--left { text-align: left; margin-bottom: 1.5rem; }

        .lgn__step-back {
          display: flex; align-items: center; gap: 0.25rem;
          font-size: 0.75rem; color: #8fa3b8; background: none; border: none;
          cursor: pointer; margin-bottom: 1.25rem; padding: 0; font-family: inherit;
          transition: color 0.2s ease;
        }
        .lgn__step-back:hover { color: #c9a84c; }

        /* ── Type selection cards ── */
        .lgn__type-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .lgn__type-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          text-align: left;
        }
        .lgn__type-btn:hover { transform: translateY(-2px); }
        .lgn__type-btn--admin { border-color: rgba(192,132,252,0.3); }
        .lgn__type-btn--admin:hover { border-color: rgba(192,132,252,0.6); }
        .lgn__type-btn--client { border-color: rgba(201,168,76,0.3); }
        .lgn__type-btn--client:hover { border-color: rgba(201,168,76,0.6); }
        .lgn__type-btn--contractor { border-color: rgba(96,165,250,0.3); }
        .lgn__type-btn--contractor:hover { border-color: rgba(96,165,250,0.6); }
        .lgn__type-emoji { font-size: 1.5rem; }
        .lgn__type-label { color: #e8d5a3; font-weight: 700; font-size: 0.875rem; }
        .lgn__type-desc { color: #8fa3b8; font-size: 0.75rem; }
        .lgn__type-arrow { color: #8fa3b8; margin-left: auto; }

        /* ── Form fields ── */
        .lgn__field-group { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }
        .lgn__field-label {
          font-size: 0.75rem; color: #8fa3b8; text-transform: uppercase;
          letter-spacing: 0.05em; margin-bottom: 0.4rem; display: block;
        }
        .lgn__phone-row { display: flex; gap: 0.5rem; }
        .lgn__flag-box {
          display: flex; align-items: center; gap: 0.35rem;
          padding: 0.75rem; border-radius: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e8d5a3; font-size: 0.875rem; flex-shrink: 0;
        }
        .lgn__flag-box--lg { padding: 0.875rem 0.75rem; }

        .lgn__input-wrap { position: relative; flex: 1; }
        .lgn__input-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: rgba(201,168,76,0.5); }
        .lgn__input {
          width: 100%;
          box-sizing: border-box;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e8d5a3;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .lgn__input::placeholder { color: #5f7285; }
        .lgn__input:focus { border-color: rgba(201,168,76,0.4); }
        .lgn__input--icon-l { padding-left: 2.25rem; }
        .lgn__input--icon-r { padding-right: 2.5rem; }
        .lgn__input--lg { padding: 0.875rem 1rem 0.875rem 2.25rem; }
        .lgn__input:focus.lgn__input--glow { background: rgba(201,168,76,0.05); }

        .lgn__input-plain {
          flex: 1;
          box-sizing: border-box;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e8d5a3;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .lgn__input-plain::placeholder { color: #5f7285; }
        .lgn__input-plain:focus { border-color: rgba(201,168,76,0.4); }

        .lgn__toggle-pass {
          position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #8fa3b8;
          display: flex; transition: color 0.2s ease;
        }
        .lgn__toggle-pass:hover { color: #c9a84c; }

        .lgn__error-text { color: #f87171; font-size: 0.75rem; margin: 0.4rem 0 0 0.25rem; }

        .lgn__notice {
          display: flex; gap: 0.75rem; margin-bottom: 1.25rem;
          font-size: 0.75rem; color: #8fa3b8;
        }
        .lgn__notice-icon { color: rgba(201,168,76,0.6); flex-shrink: 0; margin-top: 0.15rem; }

        /* ── Buttons ── */
        .lgn__btn-gold {
          width: 100%;
          padding: 1rem;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 100%);
          color: #071422;
          font-size: 0.875rem;
          font-weight: 700;
          border: none;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 16px rgba(201,168,76,0.2);
        }
        .lgn__btn-gold:hover:not(:disabled) { box-shadow: 0 0 24px rgba(201,168,76,0.35); }
        .lgn__btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
        .lgn__spinner {
          width: 1rem; height: 1rem; border-radius: 50%;
          border: 2px solid rgba(7,20,34,0.3);
          border-top-color: #071422;
          animation: lgn-spin 0.7s linear infinite;
        }
        @keyframes lgn-spin { to { transform: rotate(360deg); } }

        /* ── OTP ── */
        .otp { display: flex; gap: 0.65rem; justify-content: center; }
        .otp__box {
          width: 2.75rem; height: 3.25rem;
          text-align: center;
          font-size: 1.25rem;
          font-weight: 700;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: #e8d5a3;
          caret-color: #c9a84c;
          outline: none;
          transition: all 0.2s ease;
        }
        .otp__box:focus { border-color: rgba(201,168,76,0.6); background: rgba(201,168,76,0.05); }
        .otp__box--filled {
          border-color: #c9a84c;
          background: rgba(201,168,76,0.1);
          box-shadow: 0 0 12px rgba(201,168,76,0.2);
        }
        .otp__box:disabled { opacity: 0.5; }

        .lgn__otp-complete { text-align: center; font-size: 0.75rem; color: #c9a84c; margin-bottom: 0.75rem; }

        .lgn__resend-row { text-align: center; }
        .lgn__resend-label { color: #8fa3b8; font-size: 0.75rem; }
        .lgn__resend-btn {
          font-size: 0.75rem; font-weight: 600;
          display: inline-flex; align-items: center; gap: 0.25rem;
          color: #c9a84c; background: none; border: none; cursor: pointer;
          transition: color 0.2s ease; font-family: inherit;
        }
        .lgn__resend-btn:hover:not(:disabled) { color: #f0d080; }
        .lgn__resend-btn:disabled { color: #8fa3b8; cursor: not-allowed; }

        /* ── Success ── */
        .lgn__success { padding: 2rem 0; text-align: center; }
        .lgn__success-icon-wrap {
          width: 5rem; height: 5rem; border-radius: 9999px;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.25);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem;
        }
        .lgn__success-title { color: #e8d5a3; font-weight: 700; font-size: 1.25rem; margin: 0 0 0.5rem; }
        .lgn__success-sub { color: #8fa3b8; font-size: 0.875rem; margin: 0 0 1rem; }
        .lgn__progress-track { width: 8rem; height: 0.25rem; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden; margin: 0 auto; }
        .lgn__progress-fill { height: 100%; border-radius: 9999px; background: linear-gradient(90deg, #c9a84c, #f0d080); }

        .lgn__footer { text-align: center; font-size: 0.75rem; color: #8fa3b8; margin-top: 1.25rem; }
      `}</style>

      {/* Background */}
      <div className="lgn__grid-bg" />
      <div className="lgn__glow-top" />
      <div className="lgn__glow-bottom" />

      <div className="lgn__container">

        {/* Back */}
        <Link to="/" className="lgn__back">
          <ArrowLeft size={14} className="lgn__back-icon" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="lgn__card">

          <div className="lgn__card-glow" />

          {/* Logo */}
          <div className="lgn__logo-wrap">
            <div className="lgn__logo-badge">
              <span className="lgn__logo-letter">R</span>
            </div>
            <div className="lgn__brand">
              <span className="lgn__brand-cream">ICON</span><span className="lgn__brand-gold">BUILDERS</span>
            </div>
            <div className="lgn__brand-sub">Secure Login</div>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step: Select login type ── */}
            {step === 'select' && (
              <motion.div key="select" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <h2 className="lgn__step-title">Who are you?</h2>
                <p className="lgn__step-sub">Choose your login type to continue</p>
                <div className="lgn__type-list">
                  {[
                    { type: 'admin',      emoji: '⚙️', label: 'Admin',      desc: 'Login with phone + password', mod: 'admin' },
                    { type: 'user',       emoji: '👤', label: 'Client',     desc: 'Login with phone + OTP',       mod: 'client' },
                    { type: 'user',       emoji: '🏗', label: 'Contractor', desc: 'Login with phone + OTP',       mod: 'contractor' },
                  ].map((item, i) => (
                    <button key={i} onClick={() => selectType(item.type)}
                      className={`lgn__type-btn lgn__type-btn--${item.mod}`}>
                      <span className="lgn__type-emoji">{item.emoji}</span>
                      <div>
                        <div className="lgn__type-label">{item.label}</div>
                        <div className="lgn__type-desc">{item.desc}</div>
                      </div>
                      <ArrowRight size={15} className="lgn__type-arrow" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step: Admin password login ── */}
            {step === 'password' && (
              <motion.div key="password" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <button onClick={() => setStep('select')} className="lgn__step-back">
                  <ArrowLeft size={12} /> Back
                </button>
                <h2 className="lgn__step-title lgn__step-title--left">Admin Login</h2>
                <p className="lgn__step-sub lgn__step-sub--left">Enter your credentials</p>

                <div className="lgn__field-group">
                  {/* Phone */}
                  <div>
                    <label className="lgn__field-label">Phone Number</label>
                    <div className="lgn__phone-row">
                      <div className="lgn__flag-box">🇮🇳 +91</div>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onKeyDown={e => e.key === 'Enter' && document.getElementById('admin-pass')?.focus()}
                        placeholder="Phone number"
                        className="lgn__input-plain" />
                    </div>
                  </div>
                  {/* Password */}
                  <div>
                    <label className="lgn__field-label">Password</label>
                    <div className="lgn__input-wrap">
                      <Lock size={14} className="lgn__input-icon" />
                      <input id="admin-pass" type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                        placeholder="Your password"
                        className="lgn__input lgn__input--icon-l lgn__input--icon-r" />
                      <button onClick={() => setShowPassword(!showPassword)} className="lgn__toggle-pass">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button onClick={handleAdminLogin} disabled={loading} className="lgn__btn-gold">
                  {loading ? <><div className="lgn__spinner" />Logging in...</> : <>Login as Admin <ArrowRight size={14} /></>}
                </button>
              </motion.div>
            )}

            {/* ── Step: Phone number ── */}
            {step === 'phone' && (
              <motion.div key="phone" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <button onClick={() => setStep('select')} className="lgn__step-back">
                  <ArrowLeft size={12} /> Back
                </button>
                <h2 className="lgn__step-title lgn__step-title--left">Enter Your Phone</h2>
                <p className="lgn__step-sub lgn__step-sub--left">We'll send a 6-digit OTP to verify</p>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="lgn__field-label">Mobile Number</label>
                  <div className="lgn__phone-row">
                    <div className="lgn__flag-box lgn__flag-box--lg">🇮🇳 +91</div>
                    <div className="lgn__input-wrap">
                      <Phone size={14} className="lgn__input-icon" />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        placeholder="10-digit number"
                        className="lgn__input lgn__input--lg" />
                    </div>
                  </div>
                  {phone.length > 0 && phone.length < 10 && (
                    <p className="lgn__error-text">Enter complete 10-digit number</p>
                  )}
                </div>

                <div className="lgn__notice">
                  <Shield size={13} className="lgn__notice-icon" />
                  <span>Only admin-registered numbers can login. Contact admin if you can't access.</span>
                </div>

                <button onClick={handleSendOTP} disabled={loading || phone.length < 10} className="lgn__btn-gold">
                  {loading ? <><div className="lgn__spinner" />Sending...</> : <>Send OTP <ArrowRight size={14} /></>}
                </button>
              </motion.div>
            )}

            {/* ── Step: OTP ── */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h2 className="lgn__step-title">Enter OTP</h2>
                  <p className="lgn__step-sub" style={{ marginBottom: '0.25rem' }}>
                    Sent to <span style={{ color: '#c9a84c', fontWeight: 600 }}>+91 {phone}</span>
                  </p>
                  <button onClick={() => { setStep('phone'); setOtp('') }} className="lgn__resend-btn" style={{ color: '#8fa3b8' }}>
                    <ArrowLeft size={11} /> Change number
                  </button>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <OTPInput value={otp} onChange={setOtp} disabled={loading} />
                </div>

                {otp.length === 6 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lgn__otp-complete">
                    ✓ OTP complete — tap Verify
                  </motion.p>
                )}

                <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="lgn__btn-gold" style={{ marginBottom: '1rem' }}>
                  {loading ? <><div className="lgn__spinner" />Verifying...</> : <>Verify & Login <ArrowRight size={14} /></>}
                </button>

                <div className="lgn__resend-row">
                  <span className="lgn__resend-label">Didn't receive? </span>
                  <button onClick={handleResend} disabled={resendTimer > 0} className="lgn__resend-btn">
                    <RefreshCw size={11} />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step: Success ── */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }} className="lgn__success">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="lgn__success-icon-wrap">
                  <CheckCircle size={36} color="#4ade80" />
                </motion.div>
                <h3 className="lgn__success-title">Login Successful!</h3>
                <p className="lgn__success-sub">Redirecting to your dashboard...</p>
                <div className="lgn__progress-track">
                  <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.4 }}
                    className="lgn__progress-fill" />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        <p className="lgn__footer">
          © ReliaState · iconbuilderindia.com
        </p>
      </div>
    </div>
  )
}