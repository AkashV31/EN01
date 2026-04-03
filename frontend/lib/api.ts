import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Types mirroring backend schemas.py ────────────────────────────────────

export interface GeoPoint {
  lat: number
  lon: number
  ndvi: number
  lst: number
  cost: number
  reason?: string
}

export interface IntentResponse {
  budget: number
  tree_type: string
  priority: string
}

export interface OptimizeResponse {
  selected: GeoPoint[]
  total_cost: number
}

export interface ESGResponse {
  trees_planted: number
  carbon_10yr: number
  temp_reduction: number
}

// ── API calls ──────────────────────────────────────────────────────────────

export async function parseIntent(query: string): Promise<IntentResponse> {
  const { data } = await api.post<IntentResponse>('/parse-intent', { query })
  return data
}

export async function runOptimize(
  budget: number,
  geo_data: GeoPoint[]
): Promise<OptimizeResponse> {
  const { data } = await api.post<OptimizeResponse>('/optimize', { budget, geo_data })
  return data
}

export async function generateESG(selected: GeoPoint[]): Promise<ESGResponse> {
  const { data } = await api.post<ESGResponse>('/esg-report', { selected })
  return data
}

// ── Mock fallbacks (used when backend is unreachable) ──────────────────────

export const MOCK_GEO_DATA: GeoPoint[] = [
  { lat: 18.5204, lon: 73.8567, ndvi: 0.12, lst: 44.2, cost: 85000 },
  { lat: 18.5080, lon: 73.8070, ndvi: 0.23, lst: 41.5, cost: 72000 },
  { lat: 18.5308, lon: 73.8474, ndvi: 0.31, lst: 38.9, cost: 65000 },
  { lat: 18.5590, lon: 73.8070, ndvi: 0.18, lst: 43.1, cost: 91000 },
  { lat: 18.4840, lon: 73.8930, ndvi: 0.09, lst: 46.7, cost: 78000 },
  { lat: 18.5930, lon: 73.8990, ndvi: 0.27, lst: 37.4, cost: 55000 },
  { lat: 18.4590, lon: 73.8890, ndvi: 0.14, lst: 45.3, cost: 68000 },
  { lat: 18.4960, lon: 73.8280, ndvi: 0.35, lst: 35.8, cost: 49000 },
]

export const MOCK_ESG: ESGResponse = {
  trees_planted: 700,
  carbon_10yr: 15239,
  temp_reduction: 14.0,
}
