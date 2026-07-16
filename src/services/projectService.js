import api from './api'

// ── Projects ──────────────────────────────────────────────────────────────────

export const getProjects = async () => {
  // Admin gets all, client gets own, contractor gets assigned
  const res = await api.get('/api/projects/')
  return res.data
}

export const getProject = async (id) => {
  const res = await api.get(`/api/projects/${id}/`)
  return res.data
}

export const createProject = async (data) => {
  // Admin only
  // data = { name, address, client, contractor, total_budget, start_date, end_date }
  const res = await api.post('/api/projects/', data)
  return res.data
}

export const updateProject = async (id, data) => {
  const res = await api.put(`/api/projects/${id}/`, data)
  return res.data
}

export const deleteProject = async (id) => {
  const res = await api.delete(`/api/projects/${id}/`)
  return res.data
}

// ── Milestones ────────────────────────────────────────────────────────────────

export const getMilestones = async (projectId) => {
  const res = await api.get(`/api/projects/${projectId}/milestones/`)
  return res.data
}

export const createMilestone = async (projectId, data) => {
  // Admin only
  // data = { title, description, expected_date, order }
  const res = await api.post(`/api/projects/${projectId}/milestones/`, data)
  return res.data
}

export const updateMilestoneStatus = async (milestoneId, status) => {
  // Contractor or Admin
  const res = await api.patch(`/api/milestones/${milestoneId}/status/`, { status })
  return res.data
}

export const updateMilestone = async (milestoneId, data) => {
  // Admin only
  const res = await api.put(`/api/milestones/${milestoneId}/`, data)
  return res.data
}