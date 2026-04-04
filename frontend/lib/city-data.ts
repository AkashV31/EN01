import type { ESGResponse, GeoPoint, NgoRanking } from './api'

export const DEFAULT_CITY = 'Pune'
export const ESG_COMPARE_CITY = 'Mumbai'

type CityProfile = {
  state: string
  center: { lat: number; lon: number }
  avgLst: number
  avgNdvi: number
  soilMoisture: number
  rainfallMm: number
  costMultiplier: number
  carbonFactor: number
  impact: {
    carbon: number
    shade: number
    heat: number
    equity: number
    biodiversity: number
  }
  species: string[]
  neighbourhoods?: string[]
}

const DEFAULT_ZONE_LABELS = [
  'Central Ward',
  'North Belt',
  'East Corridor',
  'Riverfront',
  'Tech Cluster',
  'Industrial Pocket',
  'Civic Core',
  'Garden District',
  'Transit Hub',
  'University Edge',
  'Old Quarter',
  'Peri-urban Fringe',
]

const ZONE_TEMPLATE = [
  { latOffset: 0.000, lonOffset: -0.022, lstDelta: 1.6, ndviDelta: -0.04, cost: 85000, soilDelta: -0.7, rainfallDelta: -40 },
  { latOffset: 0.011, lonOffset: -0.031, lstDelta: 1.1, ndviDelta: -0.05, cost: 70000, soilDelta: -1.0, rainfallDelta: -65 },
  { latOffset: 0.028, lonOffset: 0.034, lstDelta: -1.0, ndviDelta: 0.02, cost: 95000, soilDelta: 0.5, rainfallDelta: 30 },
  { latOffset: 0.039, lonOffset: 0.046, lstDelta: -1.8, ndviDelta: 0.06, cost: 80000, soilDelta: 0.8, rainfallDelta: 45 },
  { latOffset: 0.063, lonOffset: -0.138, lstDelta: 2.0, ndviDelta: -0.04, cost: 65000, soilDelta: -1.4, rainfallDelta: -85 },
  { latOffset: 0.070, lonOffset: -0.126, lstDelta: 2.8, ndviDelta: -0.06, cost: 60000, soilDelta: -1.7, rainfallDelta: -105 },
  { latOffset: 0.016, lonOffset: -0.034, lstDelta: -0.3, ndviDelta: -0.01, cost: 75000, soilDelta: -0.2, rainfallDelta: -20 },
  { latOffset: 0.028, lonOffset: -0.043, lstDelta: -2.6, ndviDelta: 0.08, cost: 110000, soilDelta: 1.3, rainfallDelta: 60 },
  { latOffset: -0.005, lonOffset: -0.014, lstDelta: 1.3, ndviDelta: -0.03, cost: 72000, soilDelta: -0.8, rainfallDelta: -50 },
  { latOffset: 0.023, lonOffset: 0.022, lstDelta: -4.0, ndviDelta: 0.12, cost: 120000, soilDelta: 1.9, rainfallDelta: 95 },
  { latOffset: -0.012, lonOffset: -0.047, lstDelta: 1.7, ndviDelta: -0.02, cost: 68000, soilDelta: -0.9, rainfallDelta: -60 },
  { latOffset: 0.005, lonOffset: 0.042, lstDelta: 2.3, ndviDelta: -0.07, cost: 58000, soilDelta: -1.5, rainfallDelta: -110 },
] as const

export const CITY_PROFILES: Record<string, CityProfile> = {
  Pune: {
    state: 'Maharashtra',
    center: { lat: 18.5204, lon: 73.8567 },
    avgLst: 43.1,
    avgNdvi: 0.13,
    soilMoisture: 3.2,
    rainfallMm: 680,
    costMultiplier: 1,
    carbonFactor: 1,
    impact: { carbon: 82, shade: 70, heat: 88, equity: 91, biodiversity: 76 },
    species: ['Neem', 'Peepal', 'Banyan', 'Arjun', 'Karanj'],
    neighbourhoods: ['Kothrud', 'Warje', 'Viman Nagar', 'Kalyani Nagar', 'Hinjewadi', 'Hinjewadi Phase 2', 'Shivajinagar', 'Baner', 'Dhankawadi', 'Koregaon Park', 'Wanowrie', 'Dhanori'],
  },
  Mumbai: {
    state: 'Maharashtra',
    center: { lat: 19.076, lon: 72.8777 },
    avgLst: 40.2,
    avgNdvi: 0.11,
    soilMoisture: 4.6,
    rainfallMm: 2200,
    costMultiplier: 1.22,
    carbonFactor: 1.25,
    impact: { carbon: 90, shade: 67, heat: 86, equity: 79, biodiversity: 82 },
    species: ['Mangrove', 'Rain Tree', 'Coconut Palm', 'Peepal', 'Neem'],
    neighbourhoods: ['Andheri', 'Powai', 'Bandra', 'Chembur', 'Airoli Edge', 'BKC', 'Dadar', 'Goregaon', 'Wadala', 'Mahim', 'Kurla', 'Mulund'],
  },
  Nagpur: {
    state: 'Maharashtra',
    center: { lat: 21.1458, lon: 79.0882 },
    avgLst: 42.4,
    avgNdvi: 0.12,
    soilMoisture: 2.9,
    rainfallMm: 1050,
    costMultiplier: 0.92,
    carbonFactor: 0.82,
    impact: { carbon: 70, shade: 64, heat: 84, equity: 76, biodiversity: 68 },
    species: ['Neem', 'Arjun', 'Mahua', 'Teak', 'Karanj'],
  },
  Nashik: {
    state: 'Maharashtra',
    center: { lat: 19.9975, lon: 73.7898 },
    avgLst: 39.1,
    avgNdvi: 0.17,
    soilMoisture: 4.1,
    rainfallMm: 820,
    costMultiplier: 0.95,
    carbonFactor: 0.9,
    impact: { carbon: 76, shade: 72, heat: 74, equity: 69, biodiversity: 75 },
    species: ['Neem', 'Peepal', 'Banyan', 'Jamun', 'Arjun'],
  },
  Aurangabad: {
    state: 'Maharashtra',
    center: { lat: 19.8762, lon: 75.3433 },
    avgLst: 41.8,
    avgNdvi: 0.1,
    soilMoisture: 2.7,
    rainfallMm: 710,
    costMultiplier: 0.93,
    carbonFactor: 0.84,
    impact: { carbon: 73, shade: 65, heat: 82, equity: 75, biodiversity: 66 },
    species: ['Neem', 'Karanj', 'Arjun', 'Banyan', 'Jamun'],
  },
  Bengaluru: {
    state: 'Karnataka',
    center: { lat: 12.9716, lon: 77.5946 },
    avgLst: 37.6,
    avgNdvi: 0.19,
    soilMoisture: 4.5,
    rainfallMm: 970,
    costMultiplier: 1.08,
    carbonFactor: 0.88,
    impact: { carbon: 78, shade: 81, heat: 73, equity: 72, biodiversity: 80 },
    species: ['Silver Oak', 'Rain Tree', 'Gulmohar', 'Honge', 'Peepal'],
    neighbourhoods: ['Malleshwaram', 'Indiranagar', 'Whitefield', 'Jayanagar', 'Electronic City', 'Yelahanka', 'Hebbal', 'Koramangala', 'RR Nagar', 'Bellandur', 'HSR Layout', 'JP Nagar'],
  },
  Mysuru: {
    state: 'Karnataka',
    center: { lat: 12.2958, lon: 76.6394 },
    avgLst: 35.9,
    avgNdvi: 0.2,
    soilMoisture: 4.8,
    rainfallMm: 790,
    costMultiplier: 0.9,
    carbonFactor: 0.86,
    impact: { carbon: 75, shade: 80, heat: 68, equity: 66, biodiversity: 78 },
    species: ['Neem', 'Honge', 'Peepal', 'Rain Tree', 'Arjun'],
  },
  Hubli: {
    state: 'Karnataka',
    center: { lat: 15.3647, lon: 75.124 },
    avgLst: 39.8,
    avgNdvi: 0.14,
    soilMoisture: 3.5,
    rainfallMm: 760,
    costMultiplier: 0.88,
    carbonFactor: 0.83,
    impact: { carbon: 72, shade: 69, heat: 77, equity: 71, biodiversity: 70 },
    species: ['Neem', 'Honge', 'Gulmohar', 'Arjun', 'Peepal'],
  },
  Mangaluru: {
    state: 'Karnataka',
    center: { lat: 12.9141, lon: 74.856 },
    avgLst: 34.4,
    avgNdvi: 0.24,
    soilMoisture: 5.6,
    rainfallMm: 3450,
    costMultiplier: 0.96,
    carbonFactor: 1.08,
    impact: { carbon: 84, shade: 83, heat: 62, equity: 64, biodiversity: 87 },
    species: ['Coconut Palm', 'Neem', 'Rain Tree', 'Jackfruit', 'Peepal'],
  },
  'New Delhi': {
    state: 'Delhi',
    center: { lat: 28.6139, lon: 77.209 },
    avgLst: 45.4,
    avgNdvi: 0.08,
    soilMoisture: 2.4,
    rainfallMm: 790,
    costMultiplier: 1.18,
    carbonFactor: 1.38,
    impact: { carbon: 95, shade: 63, heat: 94, equity: 86, biodiversity: 64 },
    species: ['Peepal', 'Neem', 'Amaltas', 'Ashoka', 'Arjun'],
    neighbourhoods: ['Connaught Place', 'Dwarka', 'Rohini', 'Saket', 'Mayur Vihar', 'Bawana', 'Narela', 'Civil Lines', 'Lajpat Nagar', 'Okhla', 'Karol Bagh', 'Najafgarh'],
  },
  Dwarka: {
    state: 'Delhi',
    center: { lat: 28.5921, lon: 77.046 },
    avgLst: 44.6,
    avgNdvi: 0.09,
    soilMoisture: 2.5,
    rainfallMm: 780,
    costMultiplier: 1.1,
    carbonFactor: 1.28,
    impact: { carbon: 91, shade: 64, heat: 91, equity: 78, biodiversity: 66 },
    species: ['Peepal', 'Neem', 'Ashoka', 'Amaltas', 'Arjun'],
  },
  Rohini: {
    state: 'Delhi',
    center: { lat: 28.7495, lon: 77.0565 },
    avgLst: 45,
    avgNdvi: 0.08,
    soilMoisture: 2.3,
    rainfallMm: 760,
    costMultiplier: 1.06,
    carbonFactor: 1.3,
    impact: { carbon: 92, shade: 62, heat: 92, equity: 81, biodiversity: 63 },
    species: ['Peepal', 'Neem', 'Ashoka', 'Amaltas', 'Arjun'],
  },
  Chennai: {
    state: 'Tamil Nadu',
    center: { lat: 13.0827, lon: 80.2707 },
    avgLst: 42.2,
    avgNdvi: 0.09,
    soilMoisture: 3.1,
    rainfallMm: 1400,
    costMultiplier: 1.09,
    carbonFactor: 1.12,
    impact: { carbon: 86, shade: 66, heat: 88, equity: 78, biodiversity: 73 },
    species: ['Neem', 'Pungam', 'Palmyra Palm', 'Peepal', 'Rain Tree'],
    neighbourhoods: ['Adyar', 'Velachery', 'Tambaram', 'Perambur', 'Anna Nagar', 'Sholinganallur', 'OMR Edge', 'T Nagar', 'Porur', 'Guindy', 'Thiruvanmiyur', 'Ambattur'],
  },
  Coimbatore: {
    state: 'Tamil Nadu',
    center: { lat: 11.0168, lon: 76.9558 },
    avgLst: 38.2,
    avgNdvi: 0.17,
    soilMoisture: 3.8,
    rainfallMm: 660,
    costMultiplier: 0.92,
    carbonFactor: 0.9,
    impact: { carbon: 77, shade: 73, heat: 75, equity: 67, biodiversity: 74 },
    species: ['Neem', 'Pungam', 'Peepal', 'Rain Tree', 'Arjun'],
  },
  Madurai: {
    state: 'Tamil Nadu',
    center: { lat: 9.9252, lon: 78.1198 },
    avgLst: 40.5,
    avgNdvi: 0.12,
    soilMoisture: 2.9,
    rainfallMm: 850,
    costMultiplier: 0.9,
    carbonFactor: 0.94,
    impact: { carbon: 79, shade: 68, heat: 82, equity: 71, biodiversity: 69 },
    species: ['Neem', 'Pungam', 'Palmyra Palm', 'Peepal', 'Arjun'],
  },
  Ahmedabad: {
    state: 'Gujarat',
    center: { lat: 23.0225, lon: 72.5714 },
    avgLst: 44.1,
    avgNdvi: 0.09,
    soilMoisture: 2.2,
    rainfallMm: 760,
    costMultiplier: 1.02,
    carbonFactor: 1.14,
    impact: { carbon: 88, shade: 61, heat: 90, equity: 77, biodiversity: 65 },
    species: ['Neem', 'Peepal', 'Banyan', 'Saptaparni', 'Arjun'],
  },
  Surat: {
    state: 'Gujarat',
    center: { lat: 21.1702, lon: 72.8311 },
    avgLst: 39.6,
    avgNdvi: 0.13,
    soilMoisture: 3.4,
    rainfallMm: 1200,
    costMultiplier: 0.99,
    carbonFactor: 1.01,
    impact: { carbon: 82, shade: 68, heat: 79, equity: 74, biodiversity: 72 },
    species: ['Neem', 'Peepal', 'Rain Tree', 'Banyan', 'Saptaparni'],
  },
  Vadodara: {
    state: 'Gujarat',
    center: { lat: 22.3072, lon: 73.1812 },
    avgLst: 41.2,
    avgNdvi: 0.12,
    soilMoisture: 3.1,
    rainfallMm: 930,
    costMultiplier: 0.95,
    carbonFactor: 0.97,
    impact: { carbon: 80, shade: 69, heat: 81, equity: 72, biodiversity: 70 },
    species: ['Neem', 'Peepal', 'Banyan', 'Saptaparni', 'Arjun'],
  },
  Jaipur: {
    state: 'Rajasthan',
    center: { lat: 26.9124, lon: 75.7873 },
    avgLst: 44.8,
    avgNdvi: 0.07,
    soilMoisture: 1.9,
    rainfallMm: 620,
    costMultiplier: 0.96,
    carbonFactor: 1.16,
    impact: { carbon: 89, shade: 58, heat: 92, equity: 75, biodiversity: 61 },
    species: ['Khejri', 'Rohida', 'Desert Teak', 'Ber', 'Neem'],
  },
  Jodhpur: {
    state: 'Rajasthan',
    center: { lat: 26.2389, lon: 73.0243 },
    avgLst: 45.1,
    avgNdvi: 0.06,
    soilMoisture: 1.7,
    rainfallMm: 410,
    costMultiplier: 0.91,
    carbonFactor: 1.1,
    impact: { carbon: 86, shade: 54, heat: 94, equity: 73, biodiversity: 58 },
    species: ['Khejri', 'Rohida', 'Ber', 'Neem', 'Banyan'],
  },
  Udaipur: {
    state: 'Rajasthan',
    center: { lat: 24.5854, lon: 73.7125 },
    avgLst: 38.7,
    avgNdvi: 0.16,
    soilMoisture: 3.5,
    rainfallMm: 660,
    costMultiplier: 0.93,
    carbonFactor: 0.9,
    impact: { carbon: 76, shade: 72, heat: 74, equity: 68, biodiversity: 74 },
    species: ['Neem', 'Khejri', 'Banyan', 'Peepal', 'Arjun'],
  },
  Bhopal: {
    state: 'Madhya Pradesh',
    center: { lat: 23.2599, lon: 77.4126 },
    avgLst: 40.2,
    avgNdvi: 0.15,
    soilMoisture: 3.7,
    rainfallMm: 1150,
    costMultiplier: 0.94,
    carbonFactor: 0.93,
    impact: { carbon: 79, shade: 74, heat: 77, equity: 69, biodiversity: 74 },
    species: ['Neem', 'Peepal', 'Banyan', 'Arjun', 'Jamun'],
  },
  Indore: {
    state: 'Madhya Pradesh',
    center: { lat: 22.7196, lon: 75.8577 },
    avgLst: 41.5,
    avgNdvi: 0.13,
    soilMoisture: 3.1,
    rainfallMm: 990,
    costMultiplier: 0.97,
    carbonFactor: 0.96,
    impact: { carbon: 81, shade: 70, heat: 82, equity: 73, biodiversity: 70 },
    species: ['Neem', 'Peepal', 'Banyan', 'Jamun', 'Arjun'],
  },
  Gwalior: {
    state: 'Madhya Pradesh',
    center: { lat: 26.2183, lon: 78.1828 },
    avgLst: 43.3,
    avgNdvi: 0.09,
    soilMoisture: 2.4,
    rainfallMm: 820,
    costMultiplier: 0.91,
    carbonFactor: 1.02,
    impact: { carbon: 84, shade: 63, heat: 87, equity: 74, biodiversity: 65 },
    species: ['Neem', 'Peepal', 'Arjun', 'Jamun', 'Banyan'],
  },
  Lucknow: {
    state: 'Uttar Pradesh',
    center: { lat: 26.8467, lon: 80.9462 },
    avgLst: 43.1,
    avgNdvi: 0.1,
    soilMoisture: 2.8,
    rainfallMm: 940,
    costMultiplier: 0.98,
    carbonFactor: 1.01,
    impact: { carbon: 83, shade: 66, heat: 86, equity: 76, biodiversity: 68 },
    species: ['Neem', 'Peepal', 'Arjun', 'Ashoka', 'Jamun'],
  },
  Varanasi: {
    state: 'Uttar Pradesh',
    center: { lat: 25.3176, lon: 82.9739 },
    avgLst: 42.7,
    avgNdvi: 0.11,
    soilMoisture: 3,
    rainfallMm: 1010,
    costMultiplier: 0.94,
    carbonFactor: 0.98,
    impact: { carbon: 82, shade: 68, heat: 84, equity: 72, biodiversity: 70 },
    species: ['Neem', 'Peepal', 'Arjun', 'Ashoka', 'Jamun'],
  },
  Agra: {
    state: 'Uttar Pradesh',
    center: { lat: 27.1767, lon: 78.0081 },
    avgLst: 44.2,
    avgNdvi: 0.08,
    soilMoisture: 2.3,
    rainfallMm: 690,
    costMultiplier: 0.92,
    carbonFactor: 1.08,
    impact: { carbon: 86, shade: 61, heat: 90, equity: 75, biodiversity: 63 },
    species: ['Neem', 'Peepal', 'Arjun', 'Ashoka', 'Jamun'],
  },
  Kolkata: {
    state: 'West Bengal',
    center: { lat: 22.5726, lon: 88.3639 },
    avgLst: 41,
    avgNdvi: 0.12,
    soilMoisture: 4,
    rainfallMm: 1600,
    costMultiplier: 1.01,
    carbonFactor: 1.11,
    impact: { carbon: 87, shade: 69, heat: 81, equity: 78, biodiversity: 79 },
    species: ['Banyan', 'Neem', 'Shimul', 'Raintree', 'Peepal'],
  },
  Howrah: {
    state: 'West Bengal',
    center: { lat: 22.5958, lon: 88.2636 },
    avgLst: 40.7,
    avgNdvi: 0.12,
    soilMoisture: 4,
    rainfallMm: 1590,
    costMultiplier: 0.96,
    carbonFactor: 1.06,
    impact: { carbon: 85, shade: 68, heat: 80, equity: 77, biodiversity: 77 },
    species: ['Banyan', 'Neem', 'Shimul', 'Raintree', 'Peepal'],
  },
  Siliguri: {
    state: 'West Bengal',
    center: { lat: 26.7271, lon: 88.3953 },
    avgLst: 33.4,
    avgNdvi: 0.26,
    soilMoisture: 5.8,
    rainfallMm: 2900,
    costMultiplier: 0.9,
    carbonFactor: 1.15,
    impact: { carbon: 89, shade: 84, heat: 60, equity: 63, biodiversity: 90 },
    species: ['Neem', 'Banyan', 'Jackfruit', 'Peepal', 'Raintree'],
  },
  Kochi: {
    state: 'Kerala',
    center: { lat: 9.9312, lon: 76.2673 },
    avgLst: 33.9,
    avgNdvi: 0.24,
    soilMoisture: 5.9,
    rainfallMm: 3050,
    costMultiplier: 0.97,
    carbonFactor: 1.16,
    impact: { carbon: 90, shade: 85, heat: 59, equity: 66, biodiversity: 89 },
    species: ['Coconut Palm', 'Teak', 'Jackfruit', 'Peepal', 'Neem'],
  },
  Thiruvananthapuram: {
    state: 'Kerala',
    center: { lat: 8.5241, lon: 76.9366 },
    avgLst: 33.1,
    avgNdvi: 0.25,
    soilMoisture: 6.1,
    rainfallMm: 1700,
    costMultiplier: 0.96,
    carbonFactor: 1.12,
    impact: { carbon: 88, shade: 84, heat: 58, equity: 65, biodiversity: 88 },
    species: ['Coconut Palm', 'Neem', 'Jackfruit', 'Peepal', 'Teak'],
  },
  Kozhikode: {
    state: 'Kerala',
    center: { lat: 11.2588, lon: 75.7804 },
    avgLst: 33.6,
    avgNdvi: 0.25,
    soilMoisture: 5.9,
    rainfallMm: 3200,
    costMultiplier: 0.95,
    carbonFactor: 1.13,
    impact: { carbon: 89, shade: 84, heat: 59, equity: 64, biodiversity: 89 },
    species: ['Coconut Palm', 'Neem', 'Jackfruit', 'Peepal', 'Teak'],
  },
  Hyderabad: {
    state: 'Telangana',
    center: { lat: 17.385, lon: 78.4867 },
    avgLst: 42,
    avgNdvi: 0.11,
    soilMoisture: 2.9,
    rainfallMm: 810,
    costMultiplier: 1.03,
    carbonFactor: 1.05,
    impact: { carbon: 84, shade: 67, heat: 85, equity: 77, biodiversity: 69 },
    species: ['Neem', 'Peepal', 'Jamun', 'Arjun', 'Karanj'],
    neighbourhoods: ['Banjara Hills', 'Kukatpally', 'Madhapur', 'Secunderabad', 'LB Nagar', 'Gachibowli', 'Uppal', 'Ameerpet', 'Begumpet', 'Kompally', 'Mehdipatnam', 'Shamshabad'],
  },
  Warangal: {
    state: 'Telangana',
    center: { lat: 17.9689, lon: 79.5941 },
    avgLst: 41.1,
    avgNdvi: 0.13,
    soilMoisture: 3.3,
    rainfallMm: 950,
    costMultiplier: 0.9,
    carbonFactor: 0.95,
    impact: { carbon: 80, shade: 71, heat: 81, equity: 72, biodiversity: 71 },
    species: ['Neem', 'Peepal', 'Jamun', 'Arjun', 'Karanj'],
  },
  Nizamabad: {
    state: 'Telangana',
    center: { lat: 18.6725, lon: 78.0941 },
    avgLst: 40.4,
    avgNdvi: 0.14,
    soilMoisture: 3.5,
    rainfallMm: 1020,
    costMultiplier: 0.88,
    carbonFactor: 0.93,
    impact: { carbon: 79, shade: 72, heat: 79, equity: 70, biodiversity: 72 },
    species: ['Neem', 'Peepal', 'Jamun', 'Arjun', 'Karanj'],
  },
  Ludhiana: {
    state: 'Punjab',
    center: { lat: 30.9009, lon: 75.8573 },
    avgLst: 42.7,
    avgNdvi: 0.1,
    soilMoisture: 2.7,
    rainfallMm: 760,
    costMultiplier: 0.97,
    carbonFactor: 1,
    impact: { carbon: 82, shade: 65, heat: 86, equity: 74, biodiversity: 67 },
    species: ['Neem', 'Peepal', 'Jamun', 'Arjun', 'Ashoka'],
  },
  Amritsar: {
    state: 'Punjab',
    center: { lat: 31.634, lon: 74.8723 },
    avgLst: 42.2,
    avgNdvi: 0.11,
    soilMoisture: 2.9,
    rainfallMm: 700,
    costMultiplier: 0.95,
    carbonFactor: 0.99,
    impact: { carbon: 81, shade: 66, heat: 84, equity: 73, biodiversity: 68 },
    species: ['Neem', 'Peepal', 'Jamun', 'Arjun', 'Ashoka'],
  },
  Chandigarh: {
    state: 'Punjab',
    center: { lat: 30.7333, lon: 76.7794 },
    avgLst: 39.3,
    avgNdvi: 0.18,
    soilMoisture: 3.9,
    rainfallMm: 1110,
    costMultiplier: 1.02,
    carbonFactor: 0.94,
    impact: { carbon: 78, shade: 78, heat: 75, equity: 67, biodiversity: 79 },
    species: ['Neem', 'Peepal', 'Jamun', 'Arjun', 'Ashoka'],
  },
}

export const STATES = Object.entries(
  Object.values(CITY_PROFILES).reduce<Record<string, string[]>>((acc, profile) => {
    if (!acc[profile.state]) acc[profile.state] = []
    return acc
  }, {})
).reduce<Record<string, string[]>>((acc, [state]) => {
  acc[state] = Object.entries(CITY_PROFILES)
    .filter(([, profile]) => profile.state === state)
    .map(([city]) => city)
    .sort((a, b) => a.localeCompare(b))
  return acc
}, {})

export function getCityProfile(city: string): CityProfile {
  return CITY_PROFILES[city] || CITY_PROFILES[DEFAULT_CITY]
}

export function getSpeciesForCity(city: string) {
  return getCityProfile(city).species
}

export function getCompareCities(city: string) {
  const profile = getCityProfile(city)
  // Return cities from same state + Mumbai as default compare
  const peers = Object.entries(CITY_PROFILES)
    .filter(([c, p]) => c !== city && (p.state === profile.state || c === 'Mumbai'))
    .map(([c]) => c)
    .slice(0, 5)
  return peers.length > 0 ? peers : [ESG_COMPARE_CITY]
}

export function getCityClimate(city: string) {
  const profile = getCityProfile(city)
  return {
    avgLst: profile.avgLst,
    soilMoisture: profile.soilMoisture,
    rainfallMm: profile.rainfallMm,
  }
}

export function getCityZones(city: string): GeoPoint[] {
  const profile = getCityProfile(city)
  const labels = profile.neighbourhoods || DEFAULT_ZONE_LABELS.map((label) => `${city} ${label}`)

  return ZONE_TEMPLATE.map((zone, index) => {
    const lst = Number((profile.avgLst + zone.lstDelta).toFixed(1))
    const ndvi = Number(Math.min(0.36, Math.max(0.04, profile.avgNdvi + zone.ndviDelta)).toFixed(2))
    const soilMoisture = Number(Math.min(8, Math.max(1.1, profile.soilMoisture + zone.soilDelta)).toFixed(1))
    const rainfallMm = Math.round(profile.rainfallMm + zone.rainfallDelta)

    return {
      lat: Number((profile.center.lat + zone.latOffset).toFixed(6)),
      lon: Number((profile.center.lon + zone.lonOffset).toFixed(6)),
      ndvi,
      lst,
      cost: Math.round(zone.cost * profile.costMultiplier),
      soil_moisture: soilMoisture,
      rainfall_mm: rainfallMm,
      water_available: soilMoisture >= 2.5,
      neighbourhood: labels[index] || `${city} Zone ${index + 1}`,
    }
  })
}

function deriveTreesPerZone(sourceCity: string, compareCity: string) {
  const source = getCityProfile(sourceCity)
  const compare = getCityProfile(compareCity)
  return compare.carbonFactor / source.carbonFactor
}

export function buildFallbackESGReport(selected: GeoPoint[], sourceCity: string, compareCity: string): ESGResponse {
  const source = getCityProfile(sourceCity)
  const compare = getCityProfile(compareCity)
  const treesPlanted = selected.length * 100
  const effectiveTrees = Math.round(treesPlanted * 0.85)
  const carbonKg = Number((effectiveTrees * 21.77 * 10).toFixed(2))
  const tempReduction = Number((effectiveTrees * 0.02).toFixed(2))
  const budgetUtilized = selected.reduce((sum, point) => sum + point.cost, 0)
  const carbonCreditValue = Math.round(carbonKg * 0.6)
  const roiPct = budgetUtilized > 0
    ? Number((((carbonCreditValue - budgetUtilized) / budgetUtilized) * 100).toFixed(1))
    : 0

  const ratio = deriveTreesPerZone(sourceCity, compareCity)
  const compareTrees = Math.round(effectiveTrees * ratio)
  const compareCarbonKg = Number((compareTrees * 21.77 * 10).toFixed(2))

  return {
    source_city: sourceCity,
    trees_planted: effectiveTrees,
    carbon_10yr: carbonKg,
    temp_reduction: tempReduction,
    budget_utilized: budgetUtilized,
    carbon_credit_value: carbonCreditValue,
    roi_pct: roiPct,
    compare_city: compareCity,
    compare_trees: compareTrees,
    compare_carbon: compareCarbonKg,
    urgency_zones: selected
      .filter((point) => point.lst >= 42 || point.ndvi <= 0.12)
      .sort((a, b) => b.lst - a.lst)
      .slice(0, 5)
      .map((point) => ({
        lat: point.lat,
        lon: point.lon,
        lst: point.lst,
        ndvi: point.ndvi,
        severity: point.lst >= 45 ? 'critical' : point.lst >= 42 ? 'high' : 'moderate',
        label: `${point.neighbourhood || 'Zone'} · LST ${point.lst}°C · NDVI ${point.ndvi}`,
      })),
    sdg_tags: [
      'SDG 11 – Sustainable Cities',
      'SDG 13 – Climate Action',
      'SDG 3 – Good Health',
      'SDG 15 – Life on Land',
    ],
    weekly_trees: Math.round(effectiveTrees / 52),
    monthly_trees: Math.round(effectiveTrees / 12),
    yearly_trees: effectiveTrees,
    impact_profile: [
      { metric: 'Carbon', source: source.impact.carbon, compare: compare.impact.carbon },
      { metric: 'Shade', source: source.impact.shade, compare: compare.impact.shade },
      { metric: 'Heat', source: source.impact.heat, compare: compare.impact.heat },
      { metric: 'Equity', source: source.impact.equity, compare: compare.impact.equity },
      { metric: 'Biodiv', source: source.impact.biodiversity, compare: compare.impact.biodiversity },
    ],
  }
}

/* ── NGO Carbon Credit Rankings ──────────────────────────────────────────── */

export const NGO_RANKINGS: NgoRanking[] = [
  { rank: 1, name: 'Green Yatra',             city: 'Mumbai',      state: 'Maharashtra', carbon_credits: 12400, trees_planted: 572000, badge: '🥇' },
  { rank: 2, name: 'Sankalp Taru',            city: 'Pune',        state: 'Maharashtra', carbon_credits: 9800,  trees_planted: 451000, badge: '🥈' },
  { rank: 3, name: 'Grow Trees',              city: 'Ahmedabad',   state: 'Gujarat',     carbon_credits: 8200,  trees_planted: 377000, badge: '🥉' },
  { rank: 4, name: 'SayTrees',               city: 'Bengaluru',   state: 'Karnataka',   carbon_credits: 7650,  trees_planted: 352000, badge: '🌿' },
  { rank: 5, name: 'Vanamitra Trust',         city: 'Hyderabad',   state: 'Telangana',   carbon_credits: 6100,  trees_planted: 281000, badge: '🌿' },
  { rank: 6, name: 'ATREE',                   city: 'Bengaluru',   state: 'Karnataka',   carbon_credits: 5800,  trees_planted: 266000, badge: '🌿' },
  { rank: 7, name: 'Wildlife Trust India',    city: 'New Delhi',   state: 'Delhi',       carbon_credits: 4200,  trees_planted: 193000, badge: '🌿' },
  { rank: 8, name: 'Earth5R',                 city: 'Mumbai',      state: 'Maharashtra', carbon_credits: 3900,  trees_planted: 179000, badge: '🌿' },
  { rank: 9, name: 'Tree Craze Foundation',   city: 'Chennai',     state: 'Tamil Nadu',  carbon_credits: 3100,  trees_planted: 143000, badge: '🌿' },
  { rank: 10, name: 'Environmentalist Foundation', city: 'New Delhi', state: 'Delhi',    carbon_credits: 2400,  trees_planted: 110000, badge: '🌿' },
]

/* ── Location Pins for Map Picker ─────────────────────────────────────────── */

export const LOCATION_PINS = Object.entries(CITY_PROFILES).map(([city, profile]) => ({
  name: city,
  lat: profile.center.lat,
  lon: profile.center.lon,
  state: profile.state,
})).sort((a, b) => a.name.localeCompare(b.name))
