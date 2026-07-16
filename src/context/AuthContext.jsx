import { createContext, useContext, useState, useCallback } from 'react'
import { adminLogin, sendOTP, verifyOTP, logout as logoutService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('rs_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('rs_token') || null
  })

  // ── Save login data ───────────────────────────────────────────────────────
  const login = useCallback((userData, accessToken, refreshToken) => {
    localStorage.setItem('rs_user',    JSON.stringify(userData))
    localStorage.setItem('rs_token',   accessToken)
    localStorage.setItem('rs_refresh', refreshToken || '')
    setUser(userData)
    setToken(accessToken)
  }, [])

  // ── Admin login with phone + password ─────────────────────────────────────
  const loginAsAdmin = useCallback(async (phone, password) => {
    const data = await adminLogin(phone, password)
    login(data.user, data.tokens.access, data.tokens.refresh)
    return data
  }, [login])

  // ── Client / Contractor — send OTP ────────────────────────────────────────
  const requestOTP = useCallback(async (phone) => {
    const data = await sendOTP(phone)
    return data
  }, [])

  // ── Client / Contractor — verify OTP ─────────────────────────────────────
  const loginWithOTP = useCallback(async (phone, otp) => {
    const data = await verifyOTP(phone, otp)
    login(data.user, data.tokens.access, data.tokens.refresh)
    return data
  }, [login])

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await logoutService()
    setUser(null)
    setToken(null)
  }, [])

  const updateUser = useCallback((fields) => {
    setUser(prev => {
      const updated = { ...prev, ...fields }
      localStorage.setItem('rs_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const isAuthenticated = !!user && !!token
  const hasRole = (role) => user?.role === role

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated,
      login, loginAsAdmin, requestOTP, loginWithOTP,
      logout, updateUser, hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
