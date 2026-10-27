import React from 'react'
import { cn } from '../../utils/cn'

const badgeVariants = {
  default:
    'bg-bg-elevated text-text-primary border-border-subtle',
  primary:
    'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
  success:
    'bg-status-excellent/10 text-status-excellent border-status-excellent/30',
  info:
    'bg-status-strong/10 text-status-strong border-status-strong/30',
  warning:
    'bg-status-warning/10 text-status-warning border-status-warning/30',
  danger:
    'bg-status-danger/10 text-status-danger border-status-danger/30',
  outline:
    'bg-transparent text-text-secondary border-border-subtle',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors select-none',
        badgeVariants[variant] || badgeVariants.default,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </span>
  )
}

export default Badge
