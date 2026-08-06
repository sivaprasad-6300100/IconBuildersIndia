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

// ── Handle 401 — auto logout ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rs_user')
      localStorage.removeItem('rs_token')
      localStorage.removeItem('rs_refresh')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api