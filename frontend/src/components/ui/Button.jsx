import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-brand-primary text-white hover:opacity-90 active:scale-[0.98] shadow-sm focus-visible:ring-2 focus-visible:ring-brand-primary/50',
  secondary:
    'bg-bg-elevated text-text-primary hover:bg-border-subtle/70 active:scale-[0.98] border border-border-subtle focus-visible:ring-2 focus-visible:ring-border-subtle',
  outline:
    'border border-border-subtle bg-transparent text-text-primary hover:bg-bg-elevated active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-border-subtle',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated active:scale-[0.98]',
  destructive:
    'bg-status-danger text-white hover:opacity-90 active:scale-[0.98] shadow-sm focus-visible:ring-2 focus-visible:ring-status-danger/50',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  icon: 'h-9 w-9 p-0 rounded-lg justify-center',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 select-none outline-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
    </button>
  )
}

export default Button
