import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
})

export interface IntentParseResponse {
  budget: number
  tree_type: string
  priority: string
  state?: string | null
  city?: string | null
  location?: string | null
}

export interface GeoPoint {
  lat: number
  lon: number
  ndvi: number
  lst: number
  cost: number
  reason?: string
  soil_moisture?: number
  rainfall_mm?: number
  drought_impact_score?: number
  drought_priority_rank?: number
  water_available?: boolean
  neighbourhood?: string
  zone_name?: string
  city?: string
  state?: string
}

export interface AlternativeLocation {
  zone_name: string
  city: string
  state: string
  score: number
  reason: string
  lat: number
  lon: number
  ndvi: number
  compliance_score: number
}

export interface ImpactByCity {
  city: string
  impact_percent: number
  selected_zones: number
  total_zones: number
}

export interface NgoRanking {
  rank: number
  name: string
  city: string
  state: string
  carbon_credits: number
  trees_planted: number
  badge: string
}

export interface ESGResponse {
  source_city: string
  trees_planted: number
  carbon_10yr: number
  temp_reduction: number
  budget_utilized: number
  carbon_credit_value: number
  roi_pct: number
  compare_city: string
  compare_trees: number
  compare_carbon: number
  urgency_zones: Array<{ lat: number; lon: number; lst: number; ndvi: number; severity: string; label: string }>
  sdg_tags: string[]
  weekly_trees: number
  monthly_trees: number
  yearly_trees: number
  impact_profile: Array<{ metric: string; source: number; compare: number }>
  summary?: string
  llm_source?: string
  ngo_rankings?: NgoRanking[]
}

export interface SpeciesPrediction {
  species: string
  survival_probability: number
  survival_percent: string
  tier: string
  recommendation: string
  rank: number
}

export interface SurvivalResponse {
  recommendations: SpeciesPrediction[]
  best_species: string
  zone_summary: string
}

// Mock geo data for Pune zones
export const MOCK_GEO_DATA: GeoPoint[] = [
  { lat: 18.520, lon: 73.856, ndvi: 0.12, lst: 44.1, cost: 85000,  soil_moisture: 2.5, rainfall_mm: 650, neighbourhood: 'Kothrud'     },
  { lat: 18.530, lon: 73.847, ndvi: 0.08, lst: 43.5, cost: 70000,  soil_moisture: 2.0, rainfall_mm: 620, neighbourhood: 'Warje'       },
  { lat: 18.560, lon: 73.912, ndvi: 0.18, lst: 41.2, cost: 95000,  soil_moisture: 4.5, rainfall_mm: 720, neighbourhood: 'Viman Nagar' },
  { lat: 18.571, lon: 73.922, ndvi: 0.22, lst: 39.8, cost: 80000,  soil_moisture: 5.0, rainfall_mm: 740, neighbourhood: 'Kalyani Nagar'},
  { lat: 18.595, lon: 73.718, ndvi: 0.09, lst: 45.3, cost: 65000,  soil_moisture: 1.8, rainfall_mm: 580, neighbourhood: 'Hinjewadi'  },
  { lat: 18.602, lon: 73.728, ndvi: 0.07, lst: 46.1, cost: 60000,  soil_moisture: 1.5, rainfall_mm: 560, neighbourhood: 'Hinjewadi Phase 2'},
  { lat: 18.536, lon: 73.845, ndvi: 0.15, lst: 42.0, cost: 75000,  soil_moisture: 3.2, rainfall_mm: 680, neighbourhood: 'Shivajinagar'},
  { lat: 18.548, lon: 73.835, ndvi: 0.25, lst: 38.5, cost: 110000, soil_moisture: 6.0, rainfall_mm: 790, neighbourhood: 'Baner'       },
  { lat: 18.515, lon: 73.862, ndvi: 0.10, lst: 43.8, cost: 72000,  soil_moisture: 2.2, rainfall_mm: 630, neighbourhood: 'Dhankawadi' },
  { lat: 18.543, lon: 73.878, ndvi: 0.30, lst: 36.2, cost: 120000, soil_moisture: 7.5, rainfall_mm: 850, neighbourhood: 'Koregaon Park'},
  { lat: 18.508, lon: 73.831, ndvi: 0.11, lst: 44.5, cost: 68000,  soil_moisture: 2.1, rainfall_mm: 610, neighbourhood: 'Wanowrie'   },
  { lat: 18.525, lon: 73.898, ndvi: 0.06, lst: 45.8, cost: 58000,  soil_moisture: 1.6, rainfall_mm: 575, neighbourhood: 'Dhanori'    },
]

export const MOCK_ESG: ESGResponse = {
  source_city: 'Pune',
  trees_planted: 1200,
  carbon_10yr: 26124,
  temp_reduction: 24.0,
  budget_utilized: 850000,
  carbon_credit_value: 15674,
  roi_pct: -98.2,
  compare_city: 'Mumbai',
  compare_trees: 1560,
  compare_carbon: 33961.2,
  urgency_zones: [
    { lat: 18.602, lon: 73.728, lst: 46.1, ndvi: 0.07, severity: 'critical', label: 'LST 46.1°C · NDVI 0.07' },
    { lat: 18.595, lon: 73.718, lst: 45.3, ndvi: 0.09, severity: 'critical', label: 'LST 45.3°C · NDVI 0.09' },
  ],
  sdg_tags: ['SDG 11', 'SDG 13', 'SDG 3', 'SDG 15'],
  weekly_trees: 23,
  monthly_trees: 100,
  yearly_trees: 1200,
  impact_profile: [
    { metric: 'Carbon', source: 82, compare: 90 },
    { metric: 'Shade', source: 70, compare: 67 },
    { metric: 'Heat', source: 88, compare: 86 },
    { metric: 'Equity', source: 91, compare: 79 },
    { metric: 'Biodiv', source: 76, compare: 82 },
  ],
}

// API calls
export async function parseIntent(query: string) {
  const { data } = await API.post('/parse-intent', { query })
  return data as IntentParseResponse
}

export async function runOptimize(
  budget: number,
  geo_data: GeoPoint[],
  drought_mode = false,
  tree_type = 'native',
  priority = 'heat_reduction',
  target_zone?: string,
  selected_location?: string,
) {
  const { data } = await API.post('/optimize', {
    budget,
    geo_data,
    drought_mode,
    tree_type,
    priority,
    target_zone,
    selected_location,
  })
  return data as {
    selected: GeoPoint[]
    total_cost: number
    alternatives: AlternativeLocation[]
    drought_resilient_insights: string[]
    fallback_tree_suggestions: string[]
    zone_reasoning?: string
    llm_source: string
    impact_vs_city: ImpactByCity[]
  }
}

export async function generateESG(
  selected: GeoPoint[],
  compare_city = 'Mumbai',
  source_city = 'Pune',
) {
  const { data } = await API.post('/esg-report', { selected, compare_city, source_city })
  return data as ESGResponse
}

export async function predictSpecies(
  lst_celsius: number, soil_moisture: number,
  rainfall_mm: number, species?: string
): Promise<SurvivalResponse> {
  const { data } = await API.post('/predict-species', { lst_celsius, soil_moisture, rainfall_mm, species })
  return data as SurvivalResponse
}
