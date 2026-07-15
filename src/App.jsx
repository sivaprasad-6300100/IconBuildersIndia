import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import Layout from './components/layout/Layout'

// Real pages
import HomePage   from './pages/HomePage'
import LoginPage  from './pages/LoginPage'
import EstimatorPage from './pages/EstimatorPage'
import ContractorDashboard from './pages/ContractorDashboard'
import ClientDashboard from './pages/ClientDashboard'
import AdminPanel from './pages/AdminPanel'

// Placeholders until we build each one


import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'

// ─── Smart redirect after login ──────────────────────────────────────────────
function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const map = { client: '/client', contractor: '/contractor', admin: '/admin' }
  return <Navigate to={map[user?.role] || '/login'} replace />
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes (with Navbar) ── */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/estimator"  element={<EstimatorPage />} />
        <Route path="/login"      element={<LoginPage />} />

        

        {/* ── Auto-redirect /dashboard → correct role dashboard ── */}
        <Route path="/dashboard"  element={<DashboardRedirect />} />

        {/* ── Client routes (role: client) ── */}
        <Route
          path="/client/*"
          element={
            <ProtectedRoute role="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Contractor routes (role: contractor) ── */}
        <Route
          path="/contractor/*"
          element={
            <ProtectedRoute role="contractor">
              <ContractorDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Admin routes (role: admin) ── */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}
