// src/components/ui/Badge.tsx
import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Badge = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-emerald-100 text-emerald-700': variant === 'primary',
          'bg-gray-100 text-gray-700': variant === 'secondary',
          'bg-green-100 text-green-700': variant === 'success',
          'bg-yellow-100 text-yellow-700': variant === 'warning',
          'bg-red-100 text-red-700': variant === 'danger',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
          'px-4 py-1.5 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge