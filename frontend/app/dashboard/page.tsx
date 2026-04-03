'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLang, t } from '@/lib/i18n'
import { LangSwitcher } from '@/components/ui/LangSwitcher'
import { parseIntent, runOptimize, generateESG, MOCK_GEO_DATA, MOCK_ESG, type GeoPoint, type ESGResponse } from '@/lib/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts'

// ── Static data ───────────────────────────────────────────────────────────
const STATES: Record<string, string[]> = {
  'Maharashtra': ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Karnataka':   ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru'],
  'Delhi':       ['New Delhi', 'Dwarka', 'Rohini'],
  'Tamil Nadu':  ['Chennai', 'Coimbatore', 'Madurai'],
  'Gujarat':     ['Ahmedabad', 'Surat', 'Vadodara'],
}
const SPECIES_BY_CLIMATE: Record<string, string[]> = {
  'Pune':    ['Neem', 'Peepal', 'Banyan', 'Gulmohar', 'Arjun'],
  'Mumbai':  ['Mangrove', 'Rain Tree', 'Coconut Palm', 'Flame of Forest'],
  'default': ['Neem', 'Peepal', 'Banyan', 'Tamarind', 'Mixed Native'],
}
const GOALS = [
  { value: 'carbon_focus',   label: 'Carbon Focus' },
  { value: 'shade_coverage', label: 'Shade Coverage' },
  { value: 'heat_reduction', label: 'Heat Reduction' },
  { value: 'biodiversity',   label: 'Biodiversity' },
]
const QUICK_FILLS = [
  'Plant drought-resistant trees in high-heat zones of Pune',
  'Maximum carbon sequestration under ₹5 lakh budget',
  'Find cool corridors for pedestrian zones in Kothrud',
  'Prioritise biodiversity near water bodies',
]

// ── Map panel ─────────────────────────────────────────────────────────────
function MapPanel({ selected, onToggleSize, expanded }: { selected: GeoPoint[]; onToggleSize: () => void; expanded: boolean }) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(160deg, #f5f2e8 0%, #ebe6d6 50%, #ddd8c4 100%)',
      }}>
        {/* Topographic grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(var(--olive-300) 1px, transparent 1px), linear-gradient(90deg, var(--olive-300) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        
        {/* Subtle contour rings */}
        {[60, 120, 180, 240, 300].map((r, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: r * 2, height: r * 2,
            left: '50%', top: '40%',
            transform: 'translate(-50%,-50%)',
            border: '1px solid rgba(99,114,32,0.12)',
          }} />
        ))}

        {/* City label */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-md bg-white/90 text-xs font-medium text-stone-600 flex items-center gap-2" style={{ border: '1px solid var(--border)', fontFamily: 'DM Mono, monospace' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-olive-500 animate-pulse" />
          Pune, Maharashtra
        </div>

        {/* Data points */}
        {MOCK_GEO_DATA.map((p, i) => {
          const isSelected = selected.some(s => s.lat === p.lat)
          const px = ((p.lon - 73.75) / 0.35) * 100
          const py = ((18.62 - p.lat) / 0.22) * 100
          const dotColor = isSelected ? '#637220' : p.lst > 43 ? '#dc2626' : p.lst > 38 ? '#d97706' : '#9dac50'
          return (
            <div key={i} className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${Math.max(5, Math.min(92, px))}%`, top: `${Math.max(5, Math.min(92, py))}%` }}>
              <div className="w-4 h-4 rounded-sm border-2 border-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm"
                style={{
                  background: dotColor,
                  transform: isSelected ? 'scale(1.35)' : 'scale(1)',
                  boxShadow: isSelected ? `0 0 0 3px rgba(99,114,32,0.2)` : undefined,
                }}>
                {isSelected && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block pointer-events-none z-20">
                <div className="bg-white rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md" style={{ border: '1px solid var(--border)' }}>
                  <div className="font-medium text-stone-700" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem' }}>{p.lat.toFixed(3)}, {p.lon.toFixed(3)}</div>
                  <div className="text-stone-400 mt-0.5">LST {p.lst}°C · NDVI {p.ndvi}</div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 rounded-md p-3 text-xs space-y-1.5 shadow-sm" style={{ border: '1px solid var(--border)' }}>
          {[
            { label: 'Selected', color: '#637220' },
            { label: 'High LST > 43°C', color: '#dc2626' },
            { label: 'Medium', color: '#d97706' },
            { label: 'Low', color: '#9dac50' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-stone-500">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Token note */}
        <div className="absolute top-3 right-12 px-2.5 py-1 rounded-md bg-olive-700 text-white text-xs" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem' }}>
          Add MAPBOX_TOKEN for live map
        </div>
      </div>

      {/* Toggle */}
      <button onClick={onToggleSize}
        className="absolute bottom-3 right-3 bg-white rounded-md px-2.5 py-1.5 text-xs text-stone-600 hover:bg-stone-50 transition-colors z-10 flex items-center gap-1.5"
        style={{ border: '1px solid var(--border)' }}>
        {expanded ? (
          <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 20l-4-4m0 0L12 12m4 4l4-4M4 4l4 4m0 0L12 12M8 8L4 4" /></svg>Shrink</>
        ) : (
          <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>Expand</>
        )}
      </button>
    </div>
  )
}

// ── DropSelect ────────────────────────────────────────────────────────────
function DropSelect({ label, value, onChange, options, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; disabled?: boolean
}) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-400 mb-1.5 block tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className="select">
        <option value="">— select —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── Step 1 — Configure ────────────────────────────────────────────────────
function Step1({ onRun, loading }: { onRun: (budget: number, query: string) => void; loading: boolean }) {
  const { lang } = useLang()
  const [state, setState] = useState('')
  const [city, setCity]   = useState('')
  const [species, setSpecies] = useState('')
  const [goal, setGoal]   = useState('')
  const [budget, setBudget] = useState(500000)
  const [query, setQuery] = useState('')

  const cities = state ? STATES[state] || [] : []
  const speciesList = city ? (SPECIES_BY_CLIMATE[city] || SPECIES_BY_CLIMATE['default']) : SPECIES_BY_CLIMATE['default']

  return (
    <div className="space-y-5">
      {/* AI input */}
      <div>
        <label className="text-xs font-medium text-stone-400 mb-1.5 flex items-center gap-2 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>
          AI Assistant
        </label>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Describe your planting mission…"
          rows={2}
          className="input resize-none leading-relaxed"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {QUICK_FILLS.map(q => (
            <button key={q} onClick={() => setQuery(q)}
              className="text-xs px-2.5 py-1 rounded-sm text-stone-500 hover:text-olive-700 hover:bg-olive-50 border transition-all truncate max-w-[160px]"
              style={{ borderColor: 'var(--border)' }}>
              {q.slice(0, 32)}&hellip;
            </button>
          ))}
        </div>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-2 gap-3">
        <DropSelect label={t('select_state', lang)} value={state} onChange={v => { setState(v); setCity(''); setSpecies('') }}
          options={Object.keys(STATES).map(s => ({ value: s, label: s }))} />
        <DropSelect label={t('select_city', lang)} value={city} onChange={setCity}
          options={cities.map(c => ({ value: c, label: c }))} disabled={!state} />
        <DropSelect label={t('select_species', lang)} value={species} onChange={setSpecies}
          options={speciesList.map(s => ({ value: s, label: s }))} disabled={!city} />
        <DropSelect label={t('select_goal', lang)} value={goal} onChange={setGoal}
          options={GOALS.map(g => ({ value: g.value, label: g.label }))} />
      </div>

      {/* Budget */}
      <div>
        <div className="flex justify-between mb-2.5">
          <label className="text-xs font-medium text-stone-400 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>{t('budget_label', lang)}</label>
          <span className="text-xs font-medium text-olive-700 px-2 py-0.5 rounded-sm bg-olive-50 border border-olive-200" style={{ fontFamily: 'DM Mono, monospace' }}>
            ₹{budget.toLocaleString('en-IN')}
          </span>
        </div>
        <input type="range" min={50000} max={10000000} step={50000} value={budget}
          onChange={e => setBudget(Number(e.target.value))}
          className="w-full cursor-pointer" style={{ accentColor: 'var(--olive-600)' }} />
        <div className="flex justify-between text-xs text-stone-400 mt-1.5" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem' }}>
          <span>₹50K</span><span>₹1Cr</span>
        </div>
      </div>

      <button
        onClick={() => onRun(budget, query || `Plant ${species || 'native'} trees in ${city || 'Pune'} for ${goal || 'heat_reduction'}`)}
        disabled={loading}
        className="btn-primary w-full justify-center py-2.5">
        {loading ? (
          <><span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />Optimising&hellip;</>
        ) : <>{t('run_optimizer', lang)} &rarr;</>}
      </button>
    </div>
  )
}

// ── Step 2 — Optimise ─────────────────────────────────────────────────────
function Step2({ selected, all, onNext, loading }: { selected: GeoPoint[]; all: GeoPoint[]; onNext: () => void; loading: boolean }) {
  const { lang } = useLang()
  const notSelected = all.filter(p => !selected.some(s => s.lat === p.lat))
  const totalCost = selected.reduce((sum, p) => sum + p.cost, 0)

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: selected.length, label: 'Zones', color: 'var(--olive-600)' },
          { v: `₹${(totalCost / 1000).toFixed(0)}K`, label: 'Budget Used', color: 'var(--olive-700)' },
          { v: notSelected.length, label: 'Excluded', color: 'var(--text-muted)' },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-md text-center bg-white" style={{ border: '1px solid var(--border)' }}>
            <div className="text-xl font-normal" style={{ fontFamily: 'Cormorant Garamond, serif', color: s.color, letterSpacing: '-0.02em' }}>{s.v}</div>
            <div className="text-xs text-stone-400 mt-0.5" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Selected zones */}
      <div>
        <div className="text-xs font-medium text-stone-400 mb-2 flex items-center gap-2 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-olive-500" />
          Optimal zones ({selected.length})
        </div>
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {selected.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-md text-xs hover:bg-stone-50 transition-colors" style={{ border: '1px solid var(--border)' }}>
              <span className="w-5 h-5 rounded-sm flex items-center justify-center font-medium text-white shrink-0 text-xs" style={{ background: 'var(--olive-700)', fontFamily: 'DM Mono, monospace' }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-stone-700" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem' }}>{p.lat.toFixed(4)}, {p.lon.toFixed(4)}</div>
                <div className="text-stone-400 truncate mt-0.5">{p.reason || `LST ${p.lst}°C · NDVI ${p.ndvi}`}</div>
              </div>
              <div className="text-stone-600 font-medium shrink-0" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem' }}>₹{p.cost.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Not selected */}
      {notSelected.length > 0 && (
        <div>
          <div className="text-xs text-stone-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>Not selected ({notSelected.length})</div>
          <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
            {notSelected.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-md text-xs bg-stone-50" style={{ border: '1px solid var(--border)' }}>
                <div className="w-1 h-1 rounded-full bg-stone-300 shrink-0" />
                <div className="flex-1 text-stone-400" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem' }}>{p.lat.toFixed(4)}, {p.lon.toFixed(4)}</div>
                <div className="text-stone-300 text-xs italic">Budget / low impact</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="flex items-start gap-3 p-3.5 rounded-md bg-amber-50 text-xs" style={{ border: '1px solid #fde68a' }}>
        <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
        <div>
          <p className="font-medium text-amber-700">{t('private_land_warning', lang)}</p>
          <p className="mt-0.5 text-amber-600">Some zones may include private or restricted land. Verify before planting.</p>
        </div>
      </div>

      <button onClick={onNext} disabled={loading || selected.length === 0} className="btn-primary w-full justify-center py-2.5">
        {loading ? (
          <><span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />Generating&hellip;</>
        ) : 'Generate ESG Report \u2192'}
      </button>
    </div>
  )
}

// ── Step 3 — ESG Report ───────────────────────────────────────────────────
function Step3({ esg }: { esg: ESGResponse | null }) {
  const { lang } = useLang()
  const data = esg || MOCK_ESG

  const comparisonData = [
    { name: 'Pune',   trees: data.trees_planted,                          carbon: +(data.carbon_10yr / 1000).toFixed(1) },
    { name: 'Mumbai', trees: Math.round(data.trees_planted * 1.3),        carbon: +(data.carbon_10yr * 1.3 / 1000).toFixed(1) },
    { name: 'Nagpur', trees: Math.round(data.trees_planted * 0.7),        carbon: +(data.carbon_10yr * 0.7 / 1000).toFixed(1) },
  ]
  const radarData = [
    { metric: 'Carbon', pune: 82, mumbai: 91, nagpur: 65 },
    { metric: 'Shade',  pune: 70, mumbai: 60, nagpur: 75 },
    { metric: 'Heat',   pune: 88, mumbai: 85, nagpur: 72 },
    { metric: 'Equity', pune: 91, mumbai: 74, nagpur: 80 },
    { metric: 'Biodiv', pune: 76, mumbai: 68, nagpur: 83 },
  ]

  return (
    <div className="space-y-4">
      {/* KPI trio */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: data.trees_planted.toLocaleString(), label: t('trees_planted', lang), color: 'var(--olive-700)' },
          { v: `${(data.carbon_10yr / 1000).toFixed(1)}t`, label: t('carbon_offset', lang), color: 'var(--olive-600)' },
          { v: `−${data.temp_reduction.toFixed(1)}°C`, label: t('temp_reduction', lang), color: '#6b5433' },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-md text-center bg-white" style={{ border: '1px solid var(--border)' }}>
            <div className="text-xl font-normal" style={{ fontFamily: 'Cormorant Garamond, serif', color: s.color, letterSpacing: '-0.02em' }}>{s.v}</div>
            <div className="text-stone-400 mt-0.5" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.63rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-md p-4 bg-white" style={{ border: '1px solid var(--border)' }}>
        <p className="text-xs text-stone-400 mb-3 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>Trees Planted — City Comparison</p>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={comparisonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a08c6a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#a08c6a' }} />
            <Tooltip />
            <Bar dataKey="trees" fill="#637220" radius={[2, 2, 0, 0]} name="Trees" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar chart */}
      <div className="rounded-md p-4 bg-white" style={{ border: '1px solid var(--border)' }}>
        <p className="text-xs text-stone-400 mb-3 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>Impact Profile vs Cities</p>
        <ResponsiveContainer width="100%" height={140}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2ddd0" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#a08c6a' }} />
            <Radar name="Pune" dataKey="pune" stroke="#637220" fill="#637220" fillOpacity={0.25} strokeWidth={1.5} />
            <Radar name="Mumbai" dataKey="mumbai" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={1} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts */}
      <div className="flex items-start gap-3 p-3.5 rounded-md bg-red-50 text-xs" style={{ border: '1px solid #fecaca' }}>
        <svg className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div className="text-red-700"><span className="font-medium">Highest urgency:</span> Wanowrie &amp; Dhanori zones show LST &gt;44°C with NDVI &lt;0.1 — immediate intervention recommended.</div>
      </div>

      <div className="flex items-start gap-3 p-3.5 rounded-md bg-olive-50 text-xs" style={{ border: '1px solid var(--olive-200)' }}>
        <svg className="w-3.5 h-3.5 text-olive-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div className="text-olive-800"><span className="font-medium">Private land note:</span> 3 zones include private parcels. ROI excludes these. Contact municipal body for access.</div>
      </div>

      <button className="btn-secondary w-full justify-center py-2.5">
        {t('generate_esg', lang)} &rarr;
      </button>
    </div>
  )
}

// ── Step tab pill ─────────────────────────────────────────────────────────
function StepTab({ n, label, state, onClick }: {
  n: number; label: string; state: 'active' | 'done' | 'locked'; onClick: () => void
}) {
  return (
    <button onClick={onClick} disabled={state === 'locked'}
      className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 flex items-center justify-center gap-1.5 tracking-wide
        ${state === 'active'
          ? 'border-olive-600 text-olive-700 bg-olive-50/50'
          : state === 'done'
          ? 'border-transparent text-stone-500 hover:bg-stone-50 cursor-pointer'
          : 'border-transparent text-stone-300 cursor-not-allowed'}`}
      style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.68rem' }}>
      {state === 'done' ? (
        <svg className="w-3 h-3 text-olive-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
      ) : (
        <span className="w-4 h-4 rounded-sm flex items-center justify-center text-xs"
          style={{ background: state === 'active' ? 'var(--olive-700)' : 'transparent', color: state === 'active' ? 'white' : 'inherit', fontFamily: 'DM Mono, monospace' }}>
          {n}
        </span>
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [mapExpanded, setMapExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<GeoPoint[]>([])
  const [esg, setEsg] = useState<ESGResponse | null>(null)

  const handleRun = useCallback(async (budget: number, query: string) => {
    setLoading(true)
    try {
      let sel: GeoPoint[] = []
      try {
        await parseIntent(query)
        const res = await runOptimize(budget, MOCK_GEO_DATA)
        sel = res.selected
      } catch {
        const sorted = [...MOCK_GEO_DATA]
          .filter(p => p.cost <= budget)
          .sort((a, b) => ((b.lst * 0.7 - b.ndvi * 0.3) / b.cost) - ((a.lst * 0.7 - a.ndvi * 0.3) / a.cost))
        let rem = budget
        sel = sorted.filter(p => { if (p.cost <= rem) { rem -= p.cost; return true } return false })
      }
      setSelected(sel)
      setStep(2)
    } finally { setLoading(false) }
  }, [])

  const handleESG = useCallback(async () => {
    setLoading(true)
    try {
      const res = await generateESG(selected)
      setEsg(res)
    } catch { setEsg(MOCK_ESG) }
    finally { setLoading(false); setStep(3) }
  }, [selected])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="bg-white h-13 flex items-center px-5 gap-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.push('/home')}
          className="text-sm text-stone-500 hover:text-olive-700 transition flex items-center gap-1.5 font-medium">
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
          <span className="font-medium text-stone-800" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
            {t('dashboard_title', lang)}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <LangSwitcher />
        </div>
      </header>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map */}
        <div className={`transition-all duration-400 p-3 ${mapExpanded ? 'md:w-2/3' : 'md:w-1/2'} h-[40vh] md:h-auto`}>
          <MapPanel selected={selected} onToggleSize={() => setMapExpanded(v => !v)} expanded={mapExpanded} />
        </div>

        {/* Steps panel */}
        <div className={`transition-all duration-400 flex flex-col overflow-y-auto ${mapExpanded ? 'md:w-1/3' : 'md:w-1/2'} bg-white`} style={{ borderLeft: '1px solid var(--border)' }}>

          {/* Step tabs */}
          <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <StepTab n={1} label="Configure" state={step === 1 ? 'active' : 'done'} onClick={() => setStep(1)} />
            <StepTab n={2} label="Optimise"  state={step === 2 ? 'active' : step > 2 ? 'done' : 'locked'} onClick={() => step >= 2 && setStep(2)} />
            <StepTab n={3} label="ESG Report" state={step === 3 ? 'active' : 'locked'} onClick={() => step >= 3 && setStep(3)} />
          </div>

          {/* Content */}
          <div className="p-5 flex-1 overflow-y-auto">
            {step === 1 && <Step1 onRun={handleRun} loading={loading} />}
            {step === 2 && <Step2 selected={selected} all={MOCK_GEO_DATA} onNext={handleESG} loading={loading} />}
            {step === 3 && <Step3 esg={esg} />}
          </div>
        </div>
      </div>
    </div>
  )
}
