import api from './api'

// ── Public — get active service types + admin-set prices ─────────────────────

export const getServiceTypesConfig = async (city) => {
  const res = await api.get('/api/service-requests/config/', {
    params: city ? { city } : {},
  })
  return res.data
  // returns { service_types: [{ id, key, label, description, icon, pricing_mode, flat_price, price_per_sqft }] }
}

// ── Public — submit a property service request (guest, no login) ─────────────

export const submitServiceRequest = async (data, options = {}) => {
  const res = await api.post('/api/service-requests/submit/', data, options)
  return res.data
}

// ── Admin — get all service requests ──────────────────────────────────────────
export const getServiceRequests = async (status = null) => {
  const params = status ? { status } : {}
  const res = await api.get('/api/service-requests/', { params })
  return res.data
  // returns { requests: [...], summary: { total, new, reviewed, contacted, converted, closed } }
}

// ── Admin — get single service request ────────────────────────────────────────
export const getServiceRequest = async (id) => {
  const res = await api.get(`/api/service-requests/${id}/`)
  return res.data
}

// ── Admin — update service request status ─────────────────────────────────────
export const updateServiceRequestStatus = async (id, status, adminNote = '') => {
  const res = await api.patch(`/api/service-requests/${id}/status/`, {
    status,
    admin_note: adminNote,
  })
  return res.data
}

// ── Admin — delete service request ────────────────────────────────────────────
export const deleteServiceRequest = async (id) => {
  const res = await api.delete(`/api/service-requests/${id}/`)
  return res.data
}

// ── Admin — mark requests as viewed ───────────────────────────────────────────
export const markServiceRequestsViewed = async (ids) => {
  const res = await api.post('/api/service-requests/mark-viewed/', { ids })
  return res.data
}

// ── Admin — manage service types (pricing) ────────────────────────────────────
export const getServiceTypesAdmin = async () => {
  const res = await api.get('/api/service-requests/admin/service-types/')
  return res.data
}

export const createServiceType = async (data) => {
  const res = await api.post('/api/service-requests/admin/service-types/', data)
  return res.data
}

export const updateServiceType = async (id, data) => {
  const res = await api.patch(`/api/service-requests/admin/service-types/${id}/`, data)
  return res.data
}

export const deleteServiceType = async (id) => {
  const res = await api.delete(`/api/service-requests/admin/service-types/${id}/`)
  return res.data
}
