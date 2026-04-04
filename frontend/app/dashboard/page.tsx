'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang, t } from '@/lib/i18n'
import { LangSwitcher } from '@/components/ui/LangSwitcher'
import MapWrapper from '@/components/map/MapWrapper'
import {
  generateESG,
  parseIntent,
  predictSpecies,
  runOptimize,
  type ESGResponse,
  type GeoPoint,
  type SpeciesPrediction,
} from '@/lib/api'
import {
  buildFallbackESGReport,
  DEFAULT_CITY,
  ESG_COMPARE_CITY,
  STATES,
  getCityClimate,
  getCityProfile,
  getCityZones,
  getCompareCities,
  getSpeciesForCity,
  NGO_RANKINGS,
  LOCATION_PINS,
} from '@/lib/city-data'
import {
  Bar, BarChart, CartesianGrid, Legend,
  PolarAngleAxis, PolarGrid, Radar, RadarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

type Step = 1 | 2 | 3

const QUICK_FILLS = [
  'Plant drought-resistant trees in high-heat zones of Pune',
  'Maximum carbon sequestration under ₹5 lakh budget',
  'Cool corridors for pedestrian zones near transit hubs',
  'Prioritise biodiversity near water bodies',
]

const pointKey = (p: GeoPoint) => `${p.lat}-${p.lon}`

/* ── Budget parser ──────────────────────────────────────────────────── */
function parseBudgetFromText(q: string) {
  const l = q.toLowerCase()
  for (const pat of [
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)\s*(cr|crore|lakh|lac|lk|k)?/,
    /([\d,]+(?:\.\d+)?)\s*(cr|crore|lakh|lac|lk|k)\b/,
  ]) {
    const m = l.match(pat)
    if (!m) continue
    const v = Number(m[1].replaceAll(',', ''))
    const s = (m[2] || '').toLowerCase()
    if (s === 'cr' || s === 'crore') return Math.round(v * 10000000)
    if (s === 'lakh' || s === 'lac' || s === 'lk') return Math.round(v * 100000)
    if (s === 'k') return Math.round(v * 1000)
    return Math.round(v)
  }
  return 500000
}

function parseDirectiveFallback(query: string) {
  const lower = query.toLowerCase()
  const cityEntry = Object.entries(STATES)
    .flatMap(([state, cities]) => cities.map(city => ({ state, city })))
    .find(({ city, state }) => lower.includes(city.toLowerCase()) || lower.includes(state.toLowerCase()))
  const species = ['Neem','Peepal','Banyan','Arjun','Karanj','Rain Tree','Mangrove','Palm']
    .find(s => lower.includes(s.toLowerCase())) || 'Native'
  let goal = 'heat_reduction'
  if (lower.includes('carbon') || lower.includes('co2')) goal = 'carbon_focus'
  else if (lower.includes('shade') || lower.includes('canopy')) goal = 'shade_coverage'
  else if (lower.includes('biodiversity') || lower.includes('green')) goal = 'biodiversity'
  return {
    budget: parseBudgetFromText(query), tree_type: species, priority: goal,
    state: cityEntry?.state || null, city: cityEntry?.city || null,
    location: cityEntry?.city || cityEntry?.state || null,
  }
}

/* ── Drought score (mirrors backend) ───────────────────────────────── */
function droughtScore(p: GeoPoint): number {
  const soil = p.soil_moisture ?? 3.0
  const rain = p.rainfall_mm ?? 700
  const soilS = Math.max(0, (4 - soil) / 4)
  const rainS = Math.max(0, (800 - rain) / 800)
  const lstS  = Math.max(0, (p.lst - 35) / 15)
  const ndviS = Math.max(0, (0.3 - p.ndvi) / 0.3)
  return lstS * 0.35 + ndviS * 0.25 + soilS * 0.25 + rainS * 0.15
}

function fallbackOptimize(budget: number, points: GeoPoint[], drought: boolean) {
  const ranked = [...points].sort((a, b) =>
    drought
      ? droughtScore(b) / b.cost - droughtScore(a) / a.cost
      : ((b.lst * 0.7 - b.ndvi * 0.3) / b.cost) - ((a.lst * 0.7 - a.ndvi * 0.3) / a.cost)
  )
  let rem = budget
  return ranked.reduce<GeoPoint[]>((acc, p) => {
    if (p.cost > rem) return acc
    rem -= p.cost
    const ds = droughtScore(p)
    const tier = ds > 0.6 ? 'High' : ds > 0.35 ? 'Medium' : 'Low'
    return [...acc, {
      ...p,
      drought_impact_score: ds,
      reason: drought
        ? `Drought risk ${tier} (${ds.toFixed(2)}) · LST ${p.lst}°C · Soil ${p.soil_moisture ?? 0}%`
        : `Heat ${p.lst}°C · NDVI ${p.ndvi}`,
    }]
  }, [])
}

function getExcludedReason(p: GeoPoint, drought: boolean) {
  const name = (p.neighbourhood || '').toLowerCase()
  if ((p.soil_moisture ?? 0) < 2.2 || p.water_available === false)
    return 'Low soil moisture and weak water access for the current planting cycle'
  if (name.includes('industrial') || name.includes('tech') || name.includes('phase 2') || name.includes('transit'))
    return 'Restricted or built-up parcel with limited planting access'
  if (drought) return 'Lower drought-resilience score than the selected zones'
  return 'Lower impact-to-cost score within the current budget'
}

function getNearbySuggestions(p: GeoPoint, all: GeoPoint[]) {
  return all
    .filter(c => pointKey(c) !== pointKey(p) && (c.soil_moisture ?? 0) >= 2.5)
    .sort((a, b) => (b.ndvi + (b.soil_moisture ?? 0) * 0.02) - (a.ndvi + (a.soil_moisture ?? 0) * 0.02))
    .slice(0, 2)
}

/* ── DropSelect ─────────────────────────────────────────────────────── */
function DropSelect({ label, value, onChange, options, disabled }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-400 mb-1.5 tracking-widest uppercase"
        style={{ fontFamily: 'DM Mono,monospace' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className="select w-full">
        <option value="">— select —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

/* ── StepTab ────────────────────────────────────────────────────────── */
function StepTab({ n, label, state, onClick }: {
  n: number; label: string; state: 'active' | 'done' | 'locked'; onClick: () => void
}) {
  return (
    <button onClick={onClick} disabled={state === 'locked'}
      className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 flex items-center justify-center gap-1.5
        ${state === 'active' ? 'border-olive-600 text-olive-700 bg-olive-50/50'
          : state === 'done' ? 'border-transparent text-stone-500 hover:bg-stone-50 cursor-pointer'
          : 'border-transparent text-stone-300 cursor-not-allowed'}`}
      style={{ fontFamily: 'DM Mono,monospace', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.68rem' }}>
      {state === 'done'
        ? <svg className="w-3 h-3 text-olive-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        : <span className="w-4 h-4 rounded-sm flex items-center justify-center text-xs"
            style={{ background: state === 'active' ? 'var(--olive-700)' : 'transparent', color: state === 'active' ? 'white' : 'inherit' }}>{n}</span>}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

/* ── Step 1 ─────────────────────────────────────────────────────────── */
function Step1({ onRun, loading, currentCity, onQueryChange, initialQuery }: {
  onRun: (budget: number, query: string, droughtMode: boolean, city: string) => void
  loading: boolean; currentCity: string; onQueryChange?: (q: string) => void; initialQuery?: string
}) {
  const { lang } = useLang()
  const initialProfile = getCityProfile(currentCity)
  const [selectedState, setSelectedState] = useState(initialProfile.state)
  const [city, setCity] = useState(currentCity)
  const [species, setSpecies] = useState('')
  const [goal, setGoal] = useState('')
  const [budget, setBudget] = useState(500000)
  const [query, setQuery] = useState('')
  const [droughtMode, setDroughtMode] = useState(false)
  const [mlRecs, setMlRecs] = useState<SpeciesPrediction[]>([])
  const [mlLoading, setMlLoading] = useState(false)
  const [parseLoading, setParseLoading] = useState(false)
  const [parseError, setParseError] = useState('')
  const [parsedDirective, setParsedDirective] = useState<{ location: string; budget: number; species: string; goal: string } | null>(null)

  const cities = STATES[selectedState] || []
  const speciesList = getSpeciesForCity(city || DEFAULT_CITY)

  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery)
    }
  }, [initialQuery, query])

  useEffect(() => {
    if (!city) { setMlRecs([]); return }
    const climate = getCityClimate(city)
    setMlLoading(true)
    predictSpecies(climate.avgLst, climate.soilMoisture, climate.rainfallMm)
      .then(r => setMlRecs(r.recommendations.slice(0, 5)))
      .catch(() => setMlRecs([]))
      .finally(() => setMlLoading(false))
  }, [city])

  const applyParsedResult = useCallback((parsed: { budget: number; tree_type: string; priority: string; state?: string | null; city?: string | null; location?: string | null }) => {
    if (parsed.state && STATES[parsed.state]) setSelectedState(parsed.state)
    const targetCity = parsed.city && Object.values(STATES).some(sc => sc.includes(parsed.city!)) ? parsed.city : undefined
    if (targetCity) { const s = getCityProfile(targetCity).state; setSelectedState(s); setCity(targetCity) }
    else if (parsed.state && STATES[parsed.state]?.length) setCity(STATES[parsed.state][0])
    const sp = parsed.tree_type || 'Native'
    if (sp && sp.toLowerCase() !== 'native') setSpecies(sp)
    if (parsed.priority) setGoal(parsed.priority)
    if (parsed.budget) setBudget(parsed.budget)
    setParsedDirective({ location: parsed.location || parsed.city || targetCity || parsed.state || city || currentCity, budget: parsed.budget || budget, species: sp, goal: parsed.priority || goal || 'heat_reduction' })
  }, [budget, city, currentCity, goal])

  const applyParsedDirective = useCallback(async () => {
    const q = query.trim(); if (!q) return
    setParseLoading(true); setParseError('')
    try { const parsed = await parseIntent(q); applyParsedResult(parsed) }
    catch { applyParsedResult(parseDirectiveFallback(q)) }
    finally { setParseLoading(false) }
  }, [applyParsedResult, query])

  const updateQuery = (q: string) => { setQuery(q); onQueryChange?.(q) }

  return (
    <div className="space-y-5">
      {/* AI Directive */}
      <div>
        <label className="block text-xs font-medium text-stone-400 mb-1.5 tracking-widest uppercase" style={{ fontFamily: 'DM Mono,monospace' }}>AI Directive</label>
        <textarea value={query} onChange={e => updateQuery(e.target.value)} placeholder="Describe your planting mission…" rows={2} className="input resize-none w-full leading-relaxed" />
        <div className="flex items-center justify-between gap-3 mt-2">
          <button type="button" onClick={applyParsedDirective} disabled={parseLoading || !query.trim()} className="btn-secondary px-3 py-2 text-xs">
            {parseLoading ? 'Parsing…' : 'Parse with Groq AI'}
          </button>
          <div className="text-[10px] text-stone-400 text-right" style={{ fontFamily: 'DM Mono,monospace' }}>Groq llama-3.3-70b</div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {QUICK_FILLS.map(fill => (
            <button key={fill} onClick={() => updateQuery(fill)} className="text-xs px-2.5 py-1 rounded-sm text-stone-500 hover:text-olive-700 hover:bg-olive-50 border transition-all truncate max-w-[210px]" style={{ borderColor: 'var(--border)' }}>
              {fill.slice(0, 36)}…
            </button>
          ))}
        </div>
        {parsedDirective && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[{ label: 'Location', value: parsedDirective.location || 'Not found' }, { label: 'Budget', value: `₹${parsedDirective.budget.toLocaleString('en-IN')}` }, { label: 'Species', value: parsedDirective.species || 'Native' }, { label: 'Goal', value: parsedDirective.goal.replaceAll('_', ' ') }].map(item => (
              <div key={item.label} className="rounded-md bg-stone-50 p-2.5" style={{ border: '1px solid var(--border)' }}>
                <div className="text-[10px] uppercase tracking-widest text-stone-400" style={{ fontFamily: 'DM Mono,monospace' }}>{item.label}</div>
                <div className="text-sm text-stone-700 mt-1">{item.value}</div>
              </div>
            ))}
          </div>
        )}
        {parseError && <p className="text-xs text-red-600 mt-2">{parseError}</p>}
      </div>

      {/* Location selectors */}
      <div className="grid grid-cols-2 gap-3">
        <DropSelect label={t('select_state', lang)} value={selectedState} onChange={v => { setSelectedState(v); setCity(STATES[v]?.[0] || ''); setSpecies('') }} options={Object.keys(STATES).map(s => ({ value: s, label: s }))} />
        <DropSelect label={t('select_city', lang)} value={city} onChange={v => { setCity(v); setSpecies('') }} options={cities.map(c => ({ value: c, label: c }))} disabled={!selectedState} />
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1.5 tracking-widest uppercase" style={{ fontFamily: 'DM Mono,monospace' }}>
            {t('select_species', lang)}{mlLoading && <span className="ml-2 text-olive-500 normal-case">AI loading…</span>}
          </label>
          <select value={species} onChange={e => setSpecies(e.target.value)} disabled={!city} className="select w-full">
            <option value="">— select —</option>
            {mlRecs.length > 0
              ? mlRecs.map(r => <option key={r.species} value={r.species}>{r.species} — {r.survival_percent}</option>)
              : speciesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {mlRecs.length > 0 && <p className="text-xs text-olive-600 mt-1" style={{ fontFamily: 'DM Mono,monospace', fontSize: 10 }}>Ranked by predicted 5yr survival for {city}</p>}
        </div>
        <DropSelect label={t('select_goal', lang)} value={goal} onChange={setGoal} options={[{ value: 'carbon_focus', label: 'Carbon Focus' }, { value: 'shade_coverage', label: 'Shade Coverage' }, { value: 'heat_reduction', label: 'Heat Reduction' }, { value: 'biodiversity', label: 'Biodiversity' }]} />
      </div>

      {/* Drought mode toggle */}
      <button type="button" onClick={() => setDroughtMode(v => !v)} aria-pressed={droughtMode} className="w-full flex items-center gap-3 p-3 rounded-md text-left" style={{ border: '1px solid var(--border)', background: droughtMode ? '#fef9ec' : 'var(--bg)' }}>
        <span className="w-11 h-6 rounded-full transition-colors relative shrink-0" style={{ background: droughtMode ? 'var(--olive-600)' : '#d1d5db' }}>
          <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{ left: droughtMode ? '22px' : '4px' }} />
        </span>
        <div>
          <div className="text-sm font-medium text-stone-700">🌵 Drought Mode</div>
          <div className="text-xs text-stone-400">{droughtMode ? 'Active — zones ranked by water-stress urgency (LST + soil + rainfall)' : 'Off — tap to switch to water-stress scoring'}</div>
        </div>
      </button>

      {/* Drought mode info panel */}
      {droughtMode && (
        <div className="rounded-md p-3 text-xs space-y-1.5" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div className="font-semibold text-amber-700 mb-2">Drought Scoring Active</div>
          {['High soil-stress zones (moisture < 2.5%) are deprioritized unless critical LST', 'Zones with rainfall < 600mm/yr get 25% higher drought urgency weight', 'Species recommendations shift toward Khejri, Neem, Karanj (drought-hardy)', 'Priority rank: LST stress 35% + NDVI deficiency 25% + soil stress 25% + rain stress 15%'].map(tip => (
            <div key={tip} className="flex items-start gap-1.5 text-amber-700"><span className="shrink-0 mt-0.5">›</span><span>{tip}</span></div>
          ))}
        </div>
      )}

      {/* Budget slider */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-xs font-medium text-stone-400 tracking-widest uppercase" style={{ fontFamily: 'DM Mono,monospace' }}>{t('budget_label', lang)}</label>
          <span className="font-normal text-olive-700 px-2 py-0.5 rounded-sm bg-olive-50 border border-olive-200" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.05rem' }}>₹{budget.toLocaleString('en-IN')}</span>
        </div>
        <input type="range" min={50000} max={10000000} step={50000} value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full cursor-pointer" style={{ accentColor: 'var(--olive-600)' }} />
        <div className="flex justify-between text-xs text-stone-400 mt-1" style={{ fontFamily: 'DM Mono,monospace', fontSize: '0.68rem' }}>
          <span>₹50K</span><span>₹1Cr</span>
        </div>
      </div>

      <button onClick={() => onRun(budget, query || `Plant ${species || 'native'} trees in ${city || DEFAULT_CITY}`, droughtMode, city || DEFAULT_CITY)} disabled={loading} className="btn-primary w-full justify-center py-2.5">
        {loading ? <><span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />Optimising…</> : <>{droughtMode ? '🌵 Run Drought Optimizer' : 'Run Optimizer'} →</>}
      </button>
    </div>
  )
}

/* ── Step 2 ─────────────────────────────────────────────────────────── */
function Step2({ selected, all, onNext, loading, droughtMode, cityName }: {
  selected: GeoPoint[]; all: GeoPoint[]; onNext: () => void
  loading: boolean; droughtMode: boolean; cityName: string
}) {
  const selectedKeys = new Set(selected.map(pointKey))
  const excluded = all.filter(p => !selectedKeys.has(pointKey(p)))
  const totalCost = selected.reduce((s, p) => s + p.cost, 0)
  const restrictedCount = excluded.filter(p => getExcludedReason(p, droughtMode).includes('Restricted')).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: selected.length, label: 'Zones', color: 'var(--olive-600)' },
          { value: `₹${(totalCost / 1000).toFixed(0)}K`, label: 'Budget Used', color: 'var(--olive-700)' },
          { value: excluded.length, label: 'Excluded', color: '#a08c6a' },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-md text-center bg-white" style={{ border: '1px solid var(--border)' }}>
            <div className="stat-value-sm" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-stone-400 mt-0.5" style={{ fontFamily: 'DM Mono,monospace', fontSize: '0.65rem', letterSpacing: '0.06em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Drought insights panel */}
      {droughtMode && selected.length > 0 && (
        <div className="rounded-md p-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
            <span>🌵</span>Drought Risk Breakdown — {cityName}
          </div>
          <div className="space-y-1.5">
            {selected.map(p => {
              const ds = droughtScore(p)
              const tier = ds > 0.6 ? 'HIGH' : ds > 0.35 ? 'MED' : 'LOW'
              const barW = Math.round(ds * 100)
              const col = ds > 0.6 ? '#dc2626' : ds > 0.35 ? '#d97706' : '#9dac50'
              return (
                <div key={pointKey(p)} className="text-xs">
                  <div className="flex justify-between mb-0.5" style={{ fontFamily: 'DM Mono,monospace', fontSize: '0.68rem' }}>
                    <span className="text-stone-600 truncate max-w-[140px]">{p.neighbourhood || `${p.lat.toFixed(3)},${p.lon.toFixed(3)}`}</span>
                    <span className="font-semibold shrink-0" style={{ color: col }}>{tier} {(ds * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, background: col }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-[10px] text-amber-600 mt-2" style={{ fontFamily: 'DM Mono,monospace' }}>
            Score = 35% LST + 25% NDVI deficiency + 25% soil stress + 15% rainfall stress
          </div>
        </div>
      )}

      {/* Selected zones list */}
      <div>
        <div className="text-xs font-medium text-stone-400 mb-2 flex items-center gap-2 tracking-widest uppercase" style={{ fontFamily: 'DM Mono,monospace' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-olive-500" />Optimal Zones ({cityName})
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {selected.map((p, i) => (
            <div key={pointKey(p)} className="flex items-start gap-3 p-2.5 rounded-md text-xs hover:bg-stone-50 transition-colors" style={{ border: '1px solid var(--border)' }}>
              <span className="w-5 h-5 rounded-sm flex items-center justify-center font-medium text-white shrink-0 text-xs mt-0.5" style={{ background: 'var(--olive-700)', fontFamily: 'DM Mono,monospace' }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-stone-700" style={{ fontFamily: 'DM Mono,monospace', fontSize: '0.72rem' }}>{p.neighbourhood || `${p.lat.toFixed(3)}, ${p.lon.toFixed(3)}`}</div>
                <div className="text-stone-400 mt-0.5">LST {p.lst}°C · NDVI {p.ndvi} · Soil {p.soil_moisture ?? 0}%</div>
                {droughtMode && <div className="text-amber-600 mt-0.5">Drought score {droughtScore(p).toFixed(2)}</div>}
                {p.reason && <div className="text-stone-400 mt-0.5 truncate">{p.reason}</div>}
              </div>
              <div className="text-stone-600 font-medium shrink-0" style={{ fontFamily: 'DM Mono,monospace', fontSize: '0.72rem' }}>₹{p.cost.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Excluded zones */}
      {excluded.length > 0 && (
        <div>
          <div className="text-xs text-stone-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'DM Mono,monospace' }}>Excluded ({excluded.length})</div>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {excluded.slice(0, 5).map(p => {
              const reason = getExcludedReason(p, droughtMode)
              const nearby = getNearbySuggestions(p, all)
              const restricted = reason.includes('Restricted')
              return (
                <div key={pointKey(p)} className="p-2 rounded-md text-xs" style={{ background: restricted ? '#fef2f2' : '#f9fafb', border: `1px solid ${restricted ? '#fecaca' : 'var(--border)'}` }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-stone-600">{p.neighbourhood || `${p.lat.toFixed(3)}, ${p.lon.toFixed(3)}`}</span>
                    {restricted && <span className="text-[10px] px-2 py-0.5 rounded text-white shrink-0" style={{ background: 'var(--olive-600)', fontFamily: 'DM Mono,monospace' }}>Restricted</span>}
                  </div>
                  <div className="text-stone-400 mt-0.5">{reason}</div>
                  {nearby.length > 0 && <div className="mt-1 text-xs text-olive-600">Nearby: {nearby.map(z => `${z.neighbourhood} (${z.ndvi.toFixed(2)} NDVI)`).join(' · ')}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {restrictedCount > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 text-xs" style={{ border: '1px solid #fde68a' }}>
          <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          <div><p className="font-medium text-amber-700">{restrictedCount} restricted-access zones detected</p><p className="mt-0.5 text-amber-600">Nearby alternatives are suggested above.</p></div>
        </div>
      )}

      <button onClick={onNext} disabled={loading || selected.length === 0} className="btn-primary w-full justify-center py-2.5">
        {loading ? <><span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />Generating…</> : 'Generate ESG Report →'}
      </button>
    </div>
  )
}

/* ── Step 3 — ESG Dashboard ─────────────────────────────────────────── */
function Step3({ esg, baseCity, compareCity, compareOptions, onCompareChange, loadingCompare }: {
  esg: ESGResponse | null; baseCity: string; compareCity: string
  compareOptions: string[]; onCompareChange: (city: string) => void; loadingCompare: boolean
}) {
  const { lang } = useLang()
  if (!esg) return null

  const toTonnes = (value: number) => (value > 1000 ? value / 1000 : value)
  const sourceCarbonTonnes = Number(toTonnes(esg.carbon_10yr).toFixed(2))
  const compareCarbonTonnes = Number(toTonnes(esg.compare_carbon).toFixed(2))

  // Normalize comparison data so trees & carbon don't mix axes
  // Use carbon in tonnes for both cities
  const comparisonData = [
    { name: baseCity, carbon_t: sourceCarbonTonnes, trees: esg.trees_planted },
    { name: esg.compare_city, carbon_t: compareCarbonTonnes, trees: esg.compare_trees },
  ]

  const temporalData = [
    { period: 'Weekly', trees: esg.weekly_trees },
    { period: 'Monthly', trees: esg.monthly_trees },
    { period: 'Yearly', trees: esg.yearly_trees },
  ]

  // Radar — all values normalized 0-100
  const radarData = esg.impact_profile.map(m => ({ metric: m.metric, [baseCity]: Math.min(100, Math.max(0, m.source)), [esg.compare_city]: Math.min(100, Math.max(0, m.compare)) }))

  const topNgo = Math.max(...NGO_RANKINGS.map(n => n.carbon_credits))

  return (
    <div className="space-y-4">
      {/* LLM Summary badge */}
      {esg.summary && (
        <div className="p-3 rounded-md text-xs text-stone-600 leading-relaxed" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span className="font-semibold text-emerald-700">✦ AI Summary: </span>{esg.summary}
          {esg.llm_source && <span className="ml-2 text-[10px] text-stone-400 font-mono">via {esg.llm_source}</span>}
        </div>
      )}

      {/* Compare selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-stone-400 tracking-widest uppercase shrink-0" style={{ fontFamily: 'DM Mono,monospace' }}>Compare with</label>
        <select value={compareCity} onChange={e => onCompareChange(e.target.value)} className="select flex-1" disabled={loadingCompare || compareOptions.length <= 1}>
          {compareOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: esg.trees_planted.toLocaleString(), label: t('trees_planted', lang), color: 'var(--olive-700)' },
          { value: `${sourceCarbonTonnes.toFixed(1)}t`, label: t('carbon_offset', lang), color: 'var(--olive-600)' },
          { value: `−${esg.temp_reduction.toFixed(1)}°C`, label: t('temp_reduction', lang), color: '#6b5433' },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-md text-center bg-white" style={{ border: '1px solid var(--border)' }}>
            <div className="stat-value-sm" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-stone-400 mt-0.5" style={{ fontFamily: 'DM Mono,monospace', fontSize: '0.63rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Budget + Carbon credit */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'BUDGET UTILIZED', value: `₹${esg.budget_utilized.toLocaleString('en-IN')}` },
          { label: 'CARBON CREDIT VALUE', value: `₹${esg.carbon_credit_value.toLocaleString('en-IN')}` },
        ].map(c => (
          <div key={c.label} className="p-3 rounded-md bg-white" style={{ border: '1px solid var(--border)' }}>
            <div className="text-xs text-stone-400 mb-1" style={{ fontFamily: 'DM Mono,monospace', fontSize: '0.65rem' }}>{c.label}</div>
            <div className="font-medium text-olive-700" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.2rem' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Planting rate chart */}
      <div className="rounded-md p-4 bg-white" style={{ border: '1px solid var(--border)' }}>
        <p className="text-xs text-stone-400 mb-3 tracking-widest uppercase" style={{ fontFamily: 'DM Mono,monospace' }}>Planting Rate ({baseCity})</p>
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={temporalData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd0" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#a08c6a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#a08c6a' }} />
            <Tooltip />
            <Bar dataKey="trees" fill="#637220" radius={[2, 2, 0, 0]} name="Trees" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Carbon comparison — both in tonnes, same axis */}
      <div className="rounded-md p-4 bg-white" style={{ border: '1px solid var(--border)' }}>
        <p className="text-xs text-stone-400 mb-3 tracking-widest uppercase" style={{ fontFamily: 'DM Mono,monospace' }}>{baseCity} vs {esg.compare_city} — Carbon 10yr (Tonnes)</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={comparisonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a08c6a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#a08c6a' }} unit="t" />
            <Tooltip formatter={(v: number) => [`${v}t`, 'Carbon']} />
            <Bar dataKey="carbon_t" fill="#637220" radius={[2, 2, 0, 0]} name="Carbon (t)" />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { name: baseCity, trees: esg.trees_planted, carbon: sourceCarbonTonnes.toFixed(2) },
            { name: esg.compare_city, trees: esg.compare_trees, carbon: compareCarbonTonnes.toFixed(2) },
          ].map(c => (
            <div key={c.name} className="rounded-md bg-stone-50 p-3" style={{ border: '1px solid var(--border)' }}>
              <div className="text-[10px] uppercase tracking-widest text-stone-400" style={{ fontFamily: 'DM Mono,monospace' }}>{c.name}</div>
              <div className="text-sm text-stone-700 mt-1">{c.trees.toLocaleString()} trees · {c.carbon}t</div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar chart — normalized 0-100 */}
      <div className="rounded-md p-4 bg-white" style={{ border: '1px solid var(--border)' }}>
        <p className="text-xs text-stone-400 mb-3 tracking-widest uppercase" style={{ fontFamily: 'DM Mono,monospace' }}>Impact Profile (0–100 scale)</p>
        <ResponsiveContainer width="100%" height={170}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2ddd0" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#a08c6a' }} />
            <Radar name={baseCity} dataKey={baseCity} stroke="#637220" fill="#637220" fillOpacity={0.22} strokeWidth={1.5} />
            <Radar name={esg.compare_city} dataKey={esg.compare_city} stroke="#9dac50" fill="#9dac50" fillOpacity={0.12} strokeWidth={1.2} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10, fontFamily: 'DM Mono,monospace' }} />
          </RadarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
          {esg.impact_profile.map(m => (
            <div key={m.metric} className="rounded-md bg-stone-50 p-2.5" style={{ border: '1px solid var(--border)' }}>
              <div className="text-[10px] uppercase tracking-widest text-stone-400" style={{ fontFamily: 'DM Mono,monospace' }}>{m.metric}</div>
              <div className="text-sm text-stone-700 mt-1">{baseCity}: {Math.round(m.source)}</div>
              <div className="text-sm text-olive-700">{esg.compare_city}: {Math.round(m.compare)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* NGO Carbon Credit Ranking */}
      <div className="rounded-md p-4 bg-white" style={{ border: '1px solid var(--border)' }}>
        <p className="text-xs text-stone-400 mb-3 tracking-widest uppercase flex items-center gap-2" style={{ fontFamily: 'DM Mono,monospace' }}>
          <span>🏆</span> NGO Carbon Credit Rankings — India
        </p>
        <div className="space-y-2">
          {NGO_RANKINGS.map(ngo => {
            const barPct = Math.round((ngo.carbon_credits / topNgo) * 100)
            return (
              <div key={ngo.name} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-5 text-center">{ngo.badge}</span>
                    <div>
                      <div className="font-medium text-stone-700" style={{ fontFamily: 'DM Mono,monospace', fontSize: '0.72rem' }}>{ngo.name}</div>
                      <div className="text-stone-400 text-[10px]">{ngo.city} · {ngo.state}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="font-semibold text-olive-700" style={{ fontFamily: 'DM Mono,monospace', fontSize: '0.72rem' }}>{ngo.carbon_credits.toLocaleString()}t</div>
                    <div className="text-stone-400 text-[10px]">{ngo.trees_planted.toLocaleString()} trees</div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: ngo.rank <= 3 ? '#637220' : '#9dac50' }} />
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-stone-400 mt-3" style={{ fontFamily: 'DM Mono,monospace' }}>Carbon credits = CO₂ sequestered (tonnes) · Estimated from IPCC Tier-1 urban forestry rates</p>
      </div>

      {/* Urgency zones */}
      {esg.urgency_zones.length > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 text-xs" style={{ border: '1px solid #fecaca' }}>
          <svg className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="font-medium text-red-700 mb-1">Highest urgency zones — immediate intervention</p>
            {esg.urgency_zones.map((z, i) => <p key={i} className="text-red-600">{z.label} — {z.severity.toUpperCase()}</p>)}
          </div>
        </div>
      )}

      {/* SDG tags */}
      <div className="flex flex-wrap gap-1.5">
        {esg.sdg_tags.map(tag => (
          <span key={tag} className="px-2.5 py-1 rounded-sm text-xs border" style={{ borderColor: 'var(--olive-300)', color: 'var(--olive-700)', background: 'var(--olive-50)', fontFamily: 'DM Mono,monospace', fontSize: '0.68rem' }}>{tag}</span>
        ))}
      </div>

      <button className="btn-secondary w-full justify-center py-2.5">↓ Download ESG Report (PDF)</button>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<GeoPoint[]>([])
  const [allZones, setAllZones] = useState<GeoPoint[]>(() => getCityZones(DEFAULT_CITY))
  const [esg, setEsg] = useState<ESGResponse | null>(null)
  const [droughtMode, setDroughtMode] = useState(false)
  const [currentCity, setCurrentCity] = useState(DEFAULT_CITY)
  const [compareCity, setCompareCity] = useState(ESG_COMPARE_CITY)
  const [aiQuery, setAiQuery] = useState('')

  // Feed map zone click into AI directive
  const handleZoneClick = useCallback((point: GeoPoint) => {
    const loc = point.neighbourhood || `${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}`
    setAiQuery(prev => prev ? `${prev} near ${loc}` : `Plant trees in ${loc} (LST ${point.lst}°C, NDVI ${point.ndvi})`)
  }, [])

  const fetchReport = useCallback(async (targetCompareCity: string, openStep3: boolean) => {
    if (selected.length === 0) return
    setLoading(true)
    try {
      const res = await generateESG(selected, targetCompareCity, currentCity)
      // Inject NGO rankings into response for display
      setEsg({ ...res, ngo_rankings: NGO_RANKINGS })
    } catch {
      setEsg({ ...buildFallbackESGReport(selected, currentCity, targetCompareCity), ngo_rankings: NGO_RANKINGS })
    } finally {
      setLoading(false)
      if (openStep3) setStep(3)
    }
  }, [currentCity, selected])

  const handleRun = useCallback(async (budget: number, query: string, drought: boolean, city: string) => {
    const activeCity = city || DEFAULT_CITY
    const cityZones = getCityZones(activeCity)
    setLoading(true); setCurrentCity(activeCity); setAllZones(cityZones)
    setDroughtMode(drought); setCompareCity(ESG_COMPARE_CITY); setEsg(null)
    try {
      if (query.trim()) { try { await parseIntent(query) } catch { /* advisory only */ } }
      let zones: GeoPoint[] = []
      try { const res = await runOptimize(budget, cityZones, drought); zones = res.selected }
      catch { zones = fallbackOptimize(budget, cityZones, drought) }
      setSelected(zones); setStep(2)
    } finally { setLoading(false) }
  }, [])

  const handleCompareChange = useCallback(async (city: string) => {
    setCompareCity(city); await fetchReport(city, false)
  }, [fetchReport])

  const compareOptions = getCompareCities(currentCity)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="bg-white h-12 flex items-center px-5 gap-4 shrink-0 z-30" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.push('/home')} className="text-sm text-stone-500 hover:text-olive-700 transition flex items-center gap-1.5 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {t('back', lang)}
        </button>
        <div className="w-px h-4 bg-stone-200" />
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-sm flex items-center justify-center" style={{ background: 'var(--olive-800)' }}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-olive-200" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C8 3 4 6 4 10c0 2.5 1 4.5 3 6l2 2h6l2-2c2-1.5 3-3.5 3-6 0-4-4-7-8-7z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-3" />
            </svg>
          </div>
          <span className="font-medium text-stone-800" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.05rem' }}>CanopyROI Dashboard</span>
        </div>
        {droughtMode && step > 1 && (
          <span className="px-2.5 py-0.5 rounded-sm text-xs bg-amber-100 text-amber-700 border border-amber-200" style={{ fontFamily: 'DM Mono,monospace' }}>🌵 Drought Mode</span>
        )}
        <div className="ml-auto flex items-center gap-3"><LangSwitcher /></div>
      </header>

      {/* Body */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>
        {/* Map panel */}
        <div className="h-[46vh] md:h-full md:w-1/2 shrink-0 relative overflow-hidden bg-[#f5f2e8]" style={{ borderRight: '1px solid var(--border)' }}>
          <MapWrapper
            allZones={allZones}
            selected={selected}
            locationPins={LOCATION_PINS}
            onZoneClick={handleZoneClick}
          />
        </div>

        {/* Control panel */}
        <div className="md:w-1/2 flex flex-col overflow-hidden bg-white">
          <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <StepTab n={1} label="Configure" state={step === 1 ? 'active' : 'done'} onClick={() => setStep(1)} />
            <StepTab n={2} label="Optimise"  state={step === 2 ? 'active' : step > 2 ? 'done' : 'locked'} onClick={() => step >= 2 && setStep(2)} />
            <StepTab n={3} label="ESG Report" state={step === 3 ? 'active' : 'locked'} onClick={() => step >= 3 && setStep(3)} />
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {step === 1 && <Step1 onRun={handleRun} loading={loading} currentCity={currentCity} onQueryChange={setAiQuery} initialQuery={aiQuery} />}
            {step === 2 && <Step2 selected={selected} all={allZones} onNext={() => fetchReport(compareCity, true)} loading={loading} droughtMode={droughtMode} cityName={currentCity} />}
            {step === 3 && <Step3 esg={esg} baseCity={currentCity} compareCity={compareCity} compareOptions={compareOptions} onCompareChange={handleCompareChange} loadingCompare={loading} />}
          </div>
        </div>
      </div>
    </div>
  )
}
