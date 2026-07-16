import api from './api'

// ── Get photos for a project ──────────────────────────────────────────────────
export const getPhotos = async (projectId) => {
  const res = await api.get(`/api/photos/${projectId}/`)
  return res.data
}

// ── Upload photo — Contractor or Admin ────────────────────────────────────────
export const uploadPhoto = async (projectId, formData) => {
  // formData should contain: image, caption, category, milestone?
  const res = await api.post(`/api/photos/${projectId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ── Delete photo — Admin only ─────────────────────────────────────────────────
export const deletePhoto = async (photoId) => {
  const res = await api.delete(`/api/photos/delete/${photoId}/`)
  return res.data
}