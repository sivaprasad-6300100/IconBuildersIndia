import axios from 'axios'

// ── Base URL string ─────────────────────────────────────────────────────────
// Exported on its own so plain `fetch()` calls (portfolio pages) can use the
// same URL + env var as the axios instance below, instead of hardcoding it.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Base instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// ── Attach JWT token to every request ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rs_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Endpoints where a 401 means "wrong credentials", not "session expired" ───
const AUTH_ENDPOINTS = [
  '/api/auth/admin-login/',
  '/api/auth/send-otp/',
  '/api/auth/verify-otp/',
]

// ── Handle 401 — auto logout (but not for login/OTP requests themselves) ─────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => url.includes(path))

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('rs_user')
      localStorage.removeItem('rs_token')
      localStorage.removeItem('rs_refresh')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api