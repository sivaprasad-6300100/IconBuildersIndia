import api from './api'

// ── Get all users ─────────────────────────────────────────────────────────────
export const getUsers = async (role = null) => {
  const params = role ? { role } : {}
  const res = await api.get('/api/users/', { params })
  return res.data
}

// ── Get all clients ───────────────────────────────────────────────────────────
export const getClients = async () => {
  const res = await api.get('/api/users/', { params: { role: 'client' } })
  return res.data
}

// ── Get all contractors ───────────────────────────────────────────────────────
export const getContractors = async () => {
  const res = await api.get('/api/users/', { params: { role: 'contractor' } })
  return res.data
}

// ── Create client (admin only) ────────────────────────────────────────────────
export const createClient = async (data) => {
  // data = { name, phone, email? }
  const res = await api.post('/api/users/create-client/', data)
  return res.data
}

// ── Create contractor (admin only) ───────────────────────────────────────────
export const createContractor = async (data) => {
  // data = { name, phone, email? }
  const res = await api.post('/api/users/create-contractor/', data)
  return res.data
}

// ── Update user ───────────────────────────────────────────────────────────────
export const updateUser = async (id, data) => {
  const res = await api.put(`/api/users/${id}/`, data)
  return res.data
}

// ── Deactivate user ───────────────────────────────────────────────────────────
export const deactivateUser = async (id) => {
  const res = await api.delete(`/api/users/${id}/`)
  return res.data
}