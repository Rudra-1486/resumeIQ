import React from 'react'
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const alertStyles = {
  info: {
    container: 'bg-status-strong/10 border-status-strong/30 text-status-strong',
    icon: Info,
    iconColor: 'text-status-strong',
  },
  success: {
    container: 'bg-status-excellent/10 border-status-excellent/30 text-status-excellent',
    icon: CheckCircle2,
    iconColor: 'text-status-excellent',
  },
  warning: {
    container: 'bg-status-warning/10 border-status-warning/30 text-status-warning',
    icon: AlertTriangle,
    iconColor: 'text-status-warning',
  },
  error: {
    container: 'bg-status-danger/10 border-status-danger/30 text-status-danger',
    icon: XCircle,
    iconColor: 'text-status-danger',
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  onClose,
  ...props
}) {
  const current = alertStyles[variant] || alertStyles.info
  const Icon = current.icon

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-xl border p-4 flex gap-3 text-sm transition-all',
        current.container,
        className
      )}
      {...props}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', current.iconColor)} />
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        {children && <div className="text-text-primary/90 text-sm leading-relaxed">{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 text-text-secondary hover:text-text-primary rounded-md transition-colors"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default Alert
