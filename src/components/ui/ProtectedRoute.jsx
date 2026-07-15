import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  // Not logged in → go to login, remember where they were trying to go
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role → go to their correct dashboard
  if (role && !hasRole(role)) {
    const { user } = useAuth()
    const redirectMap = {
      client: '/client',
      contractor: '/contractor',
      admin: '/admin',
    }
    return <Navigate to={redirectMap[user?.role] || '/login'} replace />
  }

  return children
}
