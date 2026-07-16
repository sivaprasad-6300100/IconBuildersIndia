import api from './api'

// ── Get payments for a project ────────────────────────────────────────────────
export const getPayments = async (projectId) => {
  const res = await api.get(`/api/payments/project/${projectId}/`)
  return res.data
  // returns { payments: [...], summary: { total_amount, total_paid, total_pending } }
}

// ── Admin creates payment entry ───────────────────────────────────────────────
export const createPayment = async (projectId, data) => {
  // data = { milestone_name, amount, method, milestone? }
  const res = await api.post(`/api/payments/project/${projectId}/create/`, data)
  return res.data
}

// ── Admin marks payment as paid ───────────────────────────────────────────────
export const markPaymentPaid = async (paymentId, data) => {
  // data = { paid_date, receipt_note, method }
  const res = await api.patch(`/api/payments/${paymentId}/mark-paid/`, data)
  return res.data
}

// ── Admin marks payment as pending (undo) ─────────────────────────────────────
export const markPaymentPending = async (paymentId) => {
  const res = await api.patch(`/api/payments/${paymentId}/mark-pending/`)
  return res.data
}

// ── Admin deletes payment ─────────────────────────────────────────────────────
export const deletePayment = async (paymentId) => {
  const res = await api.delete(`/api/payments/${paymentId}/delete/`)
  return res.data
}