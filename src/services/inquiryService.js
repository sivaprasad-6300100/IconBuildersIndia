import api from './api'

// ── Public — submit inquiry from contact form ─────────────────────────────────
export const submitInquiry = async (data) => {
  // data = { name, phone, email, city, inquiry_type, plot_size, message, source }
  const res = await api.post('/api/inquiries/submit/', data)
  return res.data
  // returns { message, reference }
}

// ── Admin — get all inquiries ─────────────────────────────────────────────────
export const getInquiries = async (status = null) => {
  const params = status ? { status } : {}
  const res = await api.get('/api/inquiries/', { params })
  return res.data
  // returns { inquiries: [...], summary: { total, new, called, converted, closed } }
}

// ── Admin — get single inquiry ────────────────────────────────────────────────
export const getInquiry = async (id) => {
  const res = await api.get(`/api/inquiries/${id}/`)
  return res.data
}

// ── Admin — update inquiry status ─────────────────────────────────────────────
export const updateInquiryStatus = async (id, status, adminNote = '') => {
  const res = await api.patch(`/api/inquiries/${id}/status/`, {
    status,
    admin_note: adminNote,
  })
  return res.data
}

// ── Admin — delete inquiry ────────────────────────────────────────────────────
export const deleteInquiry = async (id) => {
  const res = await api.delete(`/api/inquiries/${id}/`)
  return res.data
}