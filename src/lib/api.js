/**
 * API client for Netlify Functions.
 * Uses relative /api in production; works with netlify dev proxy locally.
 */

const API_BASE = '/api'

export async function createPresupuesto(payload) {
  const res = await fetch(`${API_BASE}/presupuestos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

export async function generatePdf(presupuestoId) {
  const res = await fetch(`${API_BASE}/generatePdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ presupuesto_id: presupuestoId }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

export async function approveBudget(payload) {
  const res = await fetch(`${API_BASE}/approveBudget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

