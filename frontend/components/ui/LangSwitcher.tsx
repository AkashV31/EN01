'use client'
import { useLang, type Lang } from '@/lib/i18n'

const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'mr', label: 'मर', native: 'मराठी' },
  { code: 'hi', label: 'हि', native: 'हिंदी' },
]

export function LangSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div className="flex items-center bg-white/80 backdrop-blur-sm border border-olive-200 rounded-xl p-0.5 gap-0.5 shadow-sm">
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          title={l.native}
          className={`
            px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200
            ${lang === l.code
              ? 'bg-olive-500 text-white shadow-sm'
              : 'text-bark-500 hover:text-olive-700 hover:bg-olive-50'}
          `}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
