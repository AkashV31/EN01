'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLang, t } from '@/lib/i18n'
import { LangSwitcher } from '@/components/ui/LangSwitcher'

type Role = 'student' | 'farmer' | 'ngo' | null

function LiveBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white/10 border border-white/20 text-white/70 text-xs backdrop-blur-sm" style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s infinite' }} />
      {label}
    </span>
  )
}

function RoleCard({ icon, label, desc, onClick }: { icon: string; label: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-start gap-4 p-4 rounded-md border bg-white/70 hover:bg-white backdrop-blur-sm text-left transition-all duration-200"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="w-8 h-8 rounded-sm bg-olive-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-olive-200 transition-colors text-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-stone-800 group-hover:text-olive-800 transition-colors">{label}</div>
        <div className="text-xs text-stone-500 mt-0.5 leading-relaxed">{desc}</div>
      </div>
      <svg className="w-4 h-4 text-stone-300 group-hover:text-olive-500 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
    </button>
  )
}

function Field({ label, type, placeholder, required }: { label: string; type: string; placeholder?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-stone-500 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 rounded-md text-sm text-stone-800 placeholder-stone-300 bg-white transition-all duration-150"
        style={{ border: '1px solid var(--border)' }}
        onFocus={e => { e.target.style.borderColor = 'var(--olive-500)'; e.target.style.boxShadow = '0 0 0 3px rgba(125,143,50,0.1)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => router.push('/home'), 900)
  }

  const ROLES = [
    { id: 'student' as const, icon: '◎', label: t('student', lang), desc: 'Research, analysis & academic use' },
    { id: 'farmer' as const, icon: '◈', label: t('farmer', lang), desc: 'Land management & crop planning' },
    { id: 'ngo' as const, icon: '◉', label: t('ngo', lang), desc: 'Policy, advocacy & community work' },
  ]

  return (
    <div className={`min-h-screen relative flex items-center justify-center overflow-hidden transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

      {/* Background — dark forest, refined */}
      <div className="absolute inset-0 z-0" style={{
        background: 'linear-gradient(160deg, #0e1a06 0%, #111f07 45%, #0a1504 100%)',
      }}>
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(143,154,69,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(143,154,69,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />
        {/* Soft ambient glow */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(99,114,32,0.15) 0%, transparent 70%)',
        }} />
      </div>

      {/* Lang switcher */}
      <div className="absolute top-5 right-5 z-20"><LangSwitcher /></div>

      {/* Live badges */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-1.5">
        <LiveBadge label="Sentinel-2 · Live" />
        <LiveBadge label="GEE · Connected" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px] mx-5">
        
        {/* Card proper */}
        <div className="bg-white/95 backdrop-blur-xl rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)' }}>
          
          {/* Top accent line */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--olive-500), transparent)' }} />

          <div className="p-8">

            {/* Logo area */}
            <div className="text-center mb-8">
              <div className="inline-flex flex-col items-center gap-3">
                {/* Minimal mark */}
                <div className="w-12 h-12 rounded-md flex items-center justify-center" style={{ background: 'var(--olive-800)' }}>
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-olive-200" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C8 3 4 6 4 10c0 2.5 1 4.5 3 6l2 2h6l2-2c2-1.5 3-3.5 3-6 0-4-4-7-8-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-3" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-normal text-stone-900" style={{ fontFamily: 'Cormorant Garamond, serif', letterSpacing: '-0.02em' }}>
                    {t('login_title', lang)}
                  </h1>
                  <p className="text-xs text-stone-400 mt-0.5 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {t('login_subtitle', lang)}
                  </p>
                </div>
              </div>
            </div>

            {/* Role selector */}
            {!role && (
              <div className="space-y-2.5 animate-fade-in">
                <p className="text-xs font-medium text-stone-400 text-center mb-4 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {t('select_role', lang)}
                </p>
                {ROLES.map((r) => (
                  <RoleCard key={r.id} {...r} onClick={() => setRole(r.id)} />
                ))}
              </div>
            )}

            {/* Login form */}
            {role && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
                <div className="flex items-center justify-between mb-5">
                  <button type="button" onClick={() => setRole(null)}
                    className="flex items-center gap-1 text-xs text-olive-600 hover:text-olive-800 transition-colors font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    {t('back', lang)}
                  </button>
                  <span className="badge">
                    {ROLES.find(r => r.id === role)?.icon} {t(role, lang)}
                  </span>
                </div>
                <Field label={t('name', lang)} type="text" placeholder="Enter your name" required />
                <Field label={t('email', lang)} type="email" placeholder="you@example.com" required />
                <Field label={t('password', lang)} type="password" placeholder="••••••••" required />
                {role === 'student' && <Field label={t('institution', lang)} type="text" placeholder="e.g. COEP Pune" />}
                {role === 'farmer' && <Field label={t('farm_location', lang)} type="text" placeholder="e.g. Kothrud, Pune" />}
                {role === 'ngo' && (
                  <>
                    <Field label={t('org_name', lang)} type="text" placeholder="Organisation name" required />
                    <Field label={t('reg_number', lang)} type="text" placeholder="Registration number" />
                  </>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-md font-medium text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                  style={{ background: loading ? 'var(--olive-600)' : 'var(--olive-700)', letterSpacing: '0.025em' }}
                  onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = 'var(--olive-800)' }}
                  onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.background = 'var(--olive-700)' }}
                >
                  {loading ? (
                    <><span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />{t('sign_in', lang)}&hellip;</>
                  ) : <>{t('sign_in', lang)} &rarr;</>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer badges */}
        <div className="flex justify-center gap-2 mt-5">
          {['Sentinel-2', 'Earth Engine', 'IPCC Tier-1'].map(label => (
            <span key={label} className="text-xs px-2.5 py-1 rounded-sm text-white/50 border border-white/15" style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em' }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
