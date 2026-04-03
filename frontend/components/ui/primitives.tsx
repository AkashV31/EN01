/**
 * components/ui/primitives.tsx
 * CanopyROI shared design-system primitives.
 * All components use the olive / cream / orchid token system.
 */

import React from 'react'

// ── cn utility ────────────────────────────────────────────────────────────
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

// ── Button ────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'orchid'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:   'bg-olive-500 hover:bg-olive-600 active:bg-olive-700 text-white shadow-olive hover:shadow-md border border-olive-600/20',
  secondary: 'bg-white hover:bg-olive-50 active:bg-olive-100 text-olive-700 border border-olive-200 hover:border-olive-400 shadow-xs',
  ghost:     'bg-transparent hover:bg-olive-50 text-bark-600 hover:text-olive-700 border border-transparent',
  danger:    'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300',
  orchid:    'bg-orchid-500 hover:bg-orchid-600 active:bg-orchid-700 text-white shadow-orchid border border-orchid-600/20',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-250 ease-spring',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:ring-2 focus-visible:ring-olive-400 focus-visible:ring-offset-1',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 'sm' : 'md'} />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  return (
    <span
      className={cn(sz, 'border-2 border-current border-t-transparent rounded-full animate-spin', className)}
      aria-label="Loading"
    />
  )
}

// ── Card ─────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: 'div' | 'section' | 'article'
}

const cardPadding = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({ children, className, hover = false, padding = 'md', as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={cn(
        'bg-white rounded-2xl border border-olive-100',
        'shadow-card',
        hover && 'hover:shadow-card-hover transition-shadow duration-250 cursor-pointer',
        cardPadding[padding],
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function CardSubtle({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-cream-50 rounded-2xl border border-olive-100',
        cardPadding[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────
type BadgeVariant = 'olive' | 'orchid' | 'amber' | 'red' | 'sage' | 'bark'

const badgeVariants: Record<BadgeVariant, string> = {
  olive:  'bg-olive-100 text-olive-700 border-olive-200',
  orchid: 'bg-orchid-100 text-orchid-700 border-orchid-200',
  amber:  'bg-amber-50 text-amber-700 border-amber-200',
  red:    'bg-red-50 text-red-700 border-red-200',
  sage:   'bg-sage-100 text-sage-600 border-sage-200',
  bark:   'bg-bark-100 text-bark-600 border-bark-200',
}

export function Badge({
  children,
  variant = 'olive',
  className,
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full',
        'text-2xs font-medium border',
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, hint, error, icon, className, id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-bark-600 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-400 text-sm">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-white text-bark-800 text-sm',
            'placeholder-bark-300',
            'transition-all duration-200',
            'focus:outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-100',
            error ? 'border-red-300 bg-red-50' : 'border-olive-200',
            icon ? 'pl-9 pr-3.5 py-2.5' : 'px-3.5 py-2.5',
            className,
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="mt-1 text-2xs text-bark-400">{hint}</p>}
      {error && <p className="mt-1 text-2xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  placeholder?: string
  error?: string
}

export function Select({ label, options, placeholder = '— select —', error, className, id, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-bark-600 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full rounded-xl border bg-white text-bark-700 text-sm',
            'px-3.5 py-2.5 pr-9',
            'appearance-none cursor-pointer',
            'transition-all duration-200',
            'focus:outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-100',
            'disabled:bg-olive-25 disabled:text-bark-300 disabled:cursor-not-allowed',
            error ? 'border-red-300' : 'border-olive-200',
            className,
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {/* Chevron */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bark-400">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      {error && <p className="mt-1 text-2xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────
type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const alertStyles: Record<AlertVariant, { wrap: string; icon: string }> = {
  info:    { wrap: 'bg-olive-50 border-olive-200 text-olive-800',   icon: 'ℹ️' },
  success: { wrap: 'bg-orchid-50 border-orchid-200 text-orchid-800', icon: '✅' },
  warning: { wrap: 'bg-amber-50 border-amber-200 text-amber-800',   icon: '⚠️' },
  error:   { wrap: 'bg-red-50 border-red-200 text-red-800',         icon: '🚨' },
}

export function Alert({
  variant = 'info',
  title,
  children,
  action,
  className,
}: {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  const s = alertStyles[variant]
  return (
    <div className={cn('flex items-start gap-3 p-3.5 rounded-xl border text-sm', s.wrap, className)}>
      <span className="shrink-0 mt-0.5">{s.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="opacity-90">{children}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────
export function StatCard({
  value,
  label,
  sub,
  trend,
  color = 'olive',
  className,
}: {
  value: string
  label: string
  sub?: string
  trend?: { value: string; positive: boolean }
  color?: 'olive' | 'orchid' | 'bark' | 'amber'
  className?: string
}) {
  const colors = {
    olive:  'text-olive-600 bg-olive-50',
    orchid: 'text-orchid-600 bg-orchid-50',
    bark:   'text-bark-600 bg-bark-50',
    amber:  'text-amber-600 bg-amber-50',
  }
  return (
    <div className={cn('card p-4 flex flex-col', className)}>
      <div className={cn('text-2xl font-bold font-mono tabular-nums', colors[color].split(' ')[0])}>
        {value}
      </div>
      <div className="text-xs font-medium text-bark-600 mt-1">{label}</div>
      {sub && <div className="text-2xs text-bark-400 mt-0.5">{sub}</div>}
      {trend && (
        <div className={cn(
          'mt-2 text-2xs font-medium inline-flex items-center gap-0.5',
          trend.positive ? 'text-orchid-600' : 'text-red-500'
        )}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────
export function Divider({ label, className }: { label?: string; className?: string }) {
  if (!label) return <hr className={cn('border-olive-100 my-4', className)} />
  return (
    <div className={cn('flex items-center gap-3 my-4', className)}>
      <hr className="flex-1 border-olive-100" />
      <span className="text-2xs text-bark-400 font-medium uppercase tracking-wider">{label}</span>
      <hr className="flex-1 border-olive-100" />
    </div>
  )
}

// ── SectionLabel ──────────────────────────────────────────────────────────
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-2xs font-semibold tracking-widest uppercase text-olive-500 mb-3', className)}>
      {children}
    </p>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-olive-100', className)} />
  )
}
