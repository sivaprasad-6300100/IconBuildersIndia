import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('rs_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('rs_token') || null
  })

  // Call this after OTP verified — pass user object + JWT token from backend
  const login = useCallback((userData, jwtToken) => {
    localStorage.setItem('rs_user', JSON.stringify(userData))
    localStorage.setItem('rs_token', jwtToken)
    setUser(userData)
    setToken(jwtToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('rs_user')
    localStorage.removeItem('rs_token')
    setUser(null)
    setToken(null)
  }, [])

  // Update user data without full re-login (e.g. after profile update)
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields }
      localStorage.setItem('rs_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const isAuthenticated = !!user && !!token

  // role = 'client' | 'contractor' | 'admin'
  const hasRole = (role) => user?.role === role

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        updateUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
