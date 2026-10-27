import React from 'react'
import { cn } from '../../utils/cn'

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-subtle bg-bg-surface text-text-primary shadow-sm transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={cn('p-6 pb-4 flex flex-col space-y-1.5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className = '', children, as: Tag = 'h3', ...props }) {
  return (
    <Tag className={cn('text-lg font-semibold tracking-tight text-text-primary', className)} {...props}>
      {children}
    </Tag>
  )
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={cn('text-sm text-text-secondary leading-relaxed', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={cn('p-6 pt-0 flex items-center', className)} {...props}>
      {children}
    </div>
  )
}

export default Card
