import api from './api'

// ── Admin Login ───────────────────────────────────────────────────────────────
export const adminLogin = async (phone, password) => {
  const res = await api.post('/api/auth/admin-login/', { phone, password })
  return res.data
  // returns { message, user, tokens: { access, refresh } }
}

// ── Send OTP — Client & Contractor ───────────────────────────────────────────
export const sendOTP = async (phone) => {
  const res = await api.post('/api/auth/send-otp/', { phone })
  return res.data
  // returns { message, phone, dev_otp? }
}

// ── Verify OTP — Client & Contractor ─────────────────────────────────────────
export const verifyOTP = async (phone, otp) => {
  const res = await api.post('/api/auth/verify-otp/', { phone, otp })
  return res.data
  // returns { message, user, tokens: { access, refresh } }
}

// ── Get current user ──────────────────────────────────────────────────────────
export const getMe = async () => {
  const res = await api.get('/api/auth/me/')
  return res.data
}
  
// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = async () => {
  const refresh = localStorage.getItem('rs_refresh')
  if (refresh) {
    await api.post('/api/auth/logout/', { refresh }).catch(() => {})
  }
  localStorage.removeItem('rs_user')
  localStorage.removeItem('rs_token')
  localStorage.removeItem('rs_refresh')
}
