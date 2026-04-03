'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang, t } from '@/lib/i18n'
import { LangSwitcher } from '@/components/ui/LangSwitcher'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// ── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  const router = useRouter()
  const { lang } = useLang()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled ? 'bg-white/96 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
      style={{ borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent' }}>
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center gap-6">
        <button onClick={() => scrollTo('hero')}
          className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ background: 'var(--olive-800)' }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-olive-200" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C8 3 4 6 4 10c0 2.5 1 4.5 3 6l2 2h6l2-2c2-1.5 3-3.5 3-6 0-4-4-7-8-7z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-3" />
            </svg>
          </div>
          <span className="font-medium text-stone-800 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>CanopyROI</span>
        </button>

        <div className="flex items-center gap-0.5 flex-1">
          {[
            { label: t('nav_vision', lang), id: 'vision' },
            { label: t('nav_steps', lang), id: 'steps' },
            { label: t('nav_analysis', lang), id: 'analysis' },
          ].map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)}
              className="px-3.5 py-1.5 text-sm text-stone-500 hover:text-olive-800 hover:bg-olive-50/70 rounded-md transition-all">
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LangSwitcher />
          <button onClick={() => router.push('/dashboard')}
            className="btn-primary text-xs px-4 py-1.5">
            {t('nav_dashboard', lang)} &rarr;
          </button>
        </div>
      </div>
    </nav>
  )
}

// ── Canopy SVG Illustration ───────────────────────────────────────────────
function CanopyIllustration() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      {/* Ambient background glow */}
      <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(ellipse, var(--olive-400), transparent 70%)' }} />

      <svg viewBox="0 0 480 480" className="w-full drop-shadow-xl" style={{ filter: 'drop-shadow(0 12px 40px rgba(78,90,24,0.15))' }}>
        <defs>
          <radialGradient id="bgCircle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f7f5ee" />
            <stop offset="100%" stopColor="#eeeae0" />
          </radialGradient>
          <radialGradient id="groundGrad" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#3c4514" />
            <stop offset="100%" stopColor="#2e340f" />
          </radialGradient>
          <clipPath id="circleClip"><circle cx="240" cy="240" r="210" /></clipPath>
        </defs>

        {/* Background circle */}
        <circle cx="240" cy="240" r="215" fill="url(#bgCircle)" />
        <circle cx="240" cy="240" r="215" fill="none" stroke="var(--border)" strokeWidth="1" />

        {/* Ground */}
        <ellipse cx="240" cy="370" rx="180" ry="30" fill="url(#groundGrad)" opacity="0.15" />

        {/* Tree trunks */}
        {[140, 240, 340].map((x, i) => (
          <rect key={i} x={x - 5} y={290 - i * 10} width={10} height={80 + i * 10} rx="3" fill="#493825" opacity="0.7" />
        ))}

        {/* Tree canopies — layered circles */}
        {[
          { cx: 140, cy: 240, r: 55, color: '#637220', opacity: 0.9 },
          { cx: 140, cy: 220, r: 40, color: '#7d8f32', opacity: 0.9 },
          { cx: 240, cy: 210, r: 70, color: '#4e5a18', opacity: 0.9 },
          { cx: 240, cy: 185, r: 55, color: '#637220', opacity: 0.9 },
          { cx: 240, cy: 165, r: 40, color: '#7d8f32', opacity: 0.85 },
          { cx: 340, cy: 250, r: 50, color: '#637220', opacity: 0.85 },
          { cx: 340, cy: 230, r: 38, color: '#7d8f32', opacity: 0.9 },
        ].map((c, i) => (
          <circle key={i} cx={c.cx} cy={c.cy + Math.sin(tick * 0.03 + i * 1.2) * 1.5} r={c.r} fill={c.color} opacity={c.opacity} />
        ))}

        {/* Highlight on central tree */}
        <circle cx="240" cy="165" r="20" fill="white" opacity="0.06" />

        {/* Heat shimmer dots (urban heat) */}
        {[[70, 320], [400, 310], [60, 180], [410, 200]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3"
            fill="#ef4444"
            opacity={0.4 + 0.3 * Math.sin(tick * 0.06 + i * 1.5)} />
        ))}

        {/* Satellite orbit trace */}
        <ellipse cx="240" cy="240" r="230" ry="60" fill="none"
          stroke="#9dac50" strokeWidth="0.8" strokeDasharray="6 5"
          opacity="0.25" transform="rotate(-20 240 240)" />

        {/* Satellite */}
        <g transform={`rotate(${(tick * 0.5) % 360} 240 240)`}>
          <circle cx="470" cy="240" r="4" fill="#9dac50" opacity="0.8" />
          <circle cx="470" cy="240" r="8" fill="#9dac50" opacity="0.15" />
        </g>

        {/* Outer ring */}
        <circle cx="240" cy="240" r="215" fill="none" stroke="#9dac50" strokeWidth="0.5" opacity="0.3" />
      </svg>

      {/* Floating metric cards */}
      <div className="absolute top-8 -right-2 md:-right-8 bg-white rounded-md px-3 py-2 text-xs shadow-md animate-float" style={{ border: '1px solid var(--border)', animationDelay: '0s' }}>
        <div className="stat-value text-lg">+2.4°C</div>
        <div className="stat-label mt-0.5">Urban heat avg</div>
      </div>
      <div className="absolute bottom-16 -left-2 md:-left-8 bg-white rounded-md px-3 py-2 text-xs shadow-md animate-float" style={{ border: '1px solid var(--border)', animationDelay: '1.4s' }}>
        <div className="stat-value text-lg" style={{ color: '#dc2626' }}>−34%</div>
        <div className="stat-label mt-0.5">Canopy 2020–24</div>
      </div>
      <div className="absolute bottom-1/3 -right-2 md:-right-10 bg-white rounded-md px-3 py-2 text-xs shadow-md animate-float" style={{ border: '1px solid var(--border)', animationDelay: '0.8s' }}>
        <div className="stat-value text-lg" style={{ color: 'var(--olive-600)' }}>1.2M</div>
        <div className="stat-label mt-0.5">Trees needed</div>
      </div>
    </div>
  )
}

// ── Chart data ────────────────────────────────────────────────────────────
const tempData = [
  { year: '2000', temp: 27.2, canopy: 28 },
  { year: '2005', temp: 27.8, canopy: 25 },
  { year: '2010', temp: 28.6, canopy: 21 },
  { year: '2015', temp: 29.5, canopy: 18 },
  { year: '2020', temp: 30.2, canopy: 15 },
  { year: '2024', temp: 31.1, canopy: 12 },
]

const worldData = [
  { city: 'Mumbai',    lst: 44.2, ndvi: 0.08 },
  { city: 'Delhi',     lst: 47.1, ndvi: 0.06 },
  { city: 'Pune',      lst: 43.6, ndvi: 0.11 },
  { city: 'Bengaluru', lst: 38.9, ndvi: 0.18 },
  { city: 'Chennai',   lst: 45.3, ndvi: 0.07 },
  { city: 'Hyderabad', lst: 42.1, ndvi: 0.13 },
]

const HOW_STEPS = [
  { n: '01', title: 'Satellite Scan',  desc: 'Sentinel-2 captures NDVI and LST bands across the city grid every 5 days.' },
  { n: '02', title: 'AI Analysis',     desc: 'Our knapsack optimizer ranks planting zones by impact-to-cost ratio using allometric equations.' },
  { n: '03', title: 'Zone Selection',  desc: 'High-LST, low-NDVI patches are flagged. Water access, land type, and budget are factored in.' },
  { n: '04', title: 'ESG Receipt',     desc: 'Generate a verifiable carbon MRV report with Chave et al. allometry and IPCC Tier-1 fractions.' },
]

export default function HomePage() {
  const router = useRouter()
  const { lang } = useLang()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section id="hero" className="min-h-screen flex items-center pt-14">
        <div className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-2 gap-16 items-center">

          {/* Left — illustration */}
          <div className="flex justify-center order-2 md:order-1">
            <CanopyIllustration />
          </div>

          {/* Right — copy */}
          <div className="space-y-8 order-1 md:order-2">
            <div>
              <span className="section-label">Environment & Sustainability · AI Hackathon</span>
              <div className="w-8 h-px mt-3 mb-6" style={{ background: 'var(--olive-500)' }} />
            </div>

            <div className="space-y-4">
              <h1 className="text-stone-900 leading-none" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {t('hero_quote', lang)}
              </h1>
              <p className="text-base text-stone-500 leading-relaxed max-w-md">
                {t('hero_sub', lang)}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { value: '2,847', label: 'Zones Analysed' },
                { value: '₹4.2Cr', label: 'Budget Optimised' },
                { value: '94t CO₂', label: 'Sequestration / yr' },
              ].map(s => (
                <div key={s.label} className="py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="stat-value text-2xl">{s.value}</div>
                  <div className="stat-label mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => router.push('/dashboard')} className="btn-primary">
                Launch Dashboard &rarr;
              </button>
              <button onClick={() => document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vision ── */}
      <section id="vision" className="py-28 bg-white" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="max-w-xl mb-16">
            <span className="section-label">Our Vision</span>
            <h2 className="mt-2 text-stone-900">{t('vision_title', lang)}</h2>
            <div className="w-8 h-px mt-4 mb-5" style={{ background: 'var(--olive-500)' }} />
            <p className="text-base leading-relaxed">{t('vision_body', lang)}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Chart */}
            <div className="rounded-lg p-6" style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}>
              <p className="text-xs font-medium text-stone-500 mb-4 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>
                Urban Temperature vs. Canopy Cover — Pune 2000–2024
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={tempData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="canopyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#637220" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#637220" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#a08c6a' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#a08c6a' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="temp" stroke="#ef4444" fill="url(#tempGrad)" name="Temp (°C)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="canopy" stroke="#637220" fill="url(#canopyGrad)" name="Canopy %" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div className="space-y-3 self-center">
              {[
                { label: 'Rising Urban Heat', body: "Pune's average surface temperature rose 3.9°C in 24 years as canopy cover dropped from 28% to 12%." },
                { label: 'Equity Gap', body: 'Low-income neighbourhoods have 40% less tree cover on average — the people most exposed to heat have the fewest trees.' },
                { label: 'ROI-Driven Planting', body: 'Every rupee spent on the highest-impact zones delivers 3.8× more carbon sequestration than random planting.' },
              ].map((item, i) => (
                <div key={item.label} className="flex gap-5 p-4 rounded-md" style={{ border: '1px solid var(--border)' }}>
                  <div className="w-px self-stretch shrink-0 rounded-full mt-1" style={{ background: 'var(--olive-400)', minWidth: '1px' }} />
                  <div>
                    <div className="font-medium text-stone-800 text-sm mb-1">{item.label}</div>
                    <div className="text-xs text-stone-500 leading-relaxed">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="steps" className="py-28" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="section-label">Process</span>
            <h2 className="mt-2 text-stone-900">{t('steps_title', lang)}</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {HOW_STEPS.map((step, i) => (
              <div key={step.n} className="relative group">
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%+12px)] w-full h-px z-0" style={{ background: 'var(--border)', width: 'calc(100% - 24px)' }} />
                )}
                <div className="relative z-10 bg-white p-5 rounded-md hover:-translate-y-1 transition-all duration-300" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                  <div className="text-xs font-medium text-stone-400 mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>{step.n}</div>
                  <div className="w-6 h-px mb-4" style={{ background: 'var(--olive-500)' }} />
                  <div className="font-medium text-stone-800 text-sm mb-2">{step.title}</div>
                  <div className="text-xs text-stone-500 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analysis ── */}
      <section id="analysis" className="py-28 bg-white" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-12">
            <span className="section-label">Data</span>
            <h2 className="mt-2 text-stone-900">{t('analysis_title', lang)}</h2>
          </div>

          {/* City cards */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-14">
            {worldData.map(city => {
              const severity = city.lst > 45 ? 'critical' : city.lst > 42 ? 'high' : 'moderate'
              const badgeClass = severity === 'critical' ? 'badge-red' : severity === 'high' ? 'badge-amber' : 'badge'
              const tempColor = severity === 'critical' ? '#dc2626' : severity === 'high' ? '#d97706' : 'var(--olive-600)'
              return (
                <div key={city.city} className="bg-white p-4 rounded-md" style={{ border: '1px solid var(--border)' }}>
                  <span className={badgeClass + ' mb-3 block w-fit'}>{severity}</span>
                  <div className="font-medium text-stone-800 text-sm">{city.city}</div>
                  <div className="text-2xl font-normal mt-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: tempColor, letterSpacing: '-0.02em' }}>{city.lst}°C</div>
                  <div className="text-xs text-stone-400 mt-0.5">LST avg</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--olive-600)', fontFamily: 'DM Mono, monospace' }}>NDVI {city.ndvi.toFixed(2)}</div>
                </div>
              )
            })}
          </div>

          {/* CTA block */}
          <div className="rounded-lg p-12 text-center" style={{ background: 'var(--olive-800)', border: '1px solid var(--olive-900)' }}>
            <div className="w-8 h-px mx-auto mb-6" style={{ background: 'var(--olive-400)' }} />
            <h3 className="text-2xl text-white mb-3 font-normal" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Ready to find where trees matter most?
            </h3>
            <p className="text-olive-300 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Run our optimizer on any Indian city in under 30 seconds. Get a printable ESG receipt for your stakeholders.
            </p>
            <button onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-white text-olive-800 font-medium text-sm transition-all hover:bg-olive-50"
              style={{ letterSpacing: '0.025em' }}>
              Start Analysing &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <p className="text-xs text-stone-400" style={{ fontFamily: 'DM Mono, monospace' }}>
            CanopyROI &middot; AI Hackathon
          </p>
          <p className="text-xs text-stone-400" style={{ fontFamily: 'DM Mono, monospace' }}>
            Sentinel-2 · GEE · IPCC Tier-1
          </p>
        </div>
      </footer>
    </div>
  )
}
