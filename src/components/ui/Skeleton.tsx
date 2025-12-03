// src/components/ui/Skeleton.tsx
import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
}

export const Skeleton = ({ 
  className, 
  variant = 'rectangular', 
  ...props 
}: SkeletonProps) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-200',
        {
          'h-4 w-full': variant === 'text',
          'rounded-full': variant === 'circular',
          'rounded-lg': variant === 'rectangular',
        },
        className
      )}
      {...props}
    />
  )
}

export default Skeleton