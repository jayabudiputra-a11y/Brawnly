// src/components/ui/Button.tsx
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
}

const Button = ({ 
  className = '', 
  variant = 'default', 
  children, 
  ...props 
}: ButtonProps) => {
  const base = 'px-8 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-4 focus:ring-emerald-300'
  const variants = {
    default: 'bg-emerald-600 text-white hover:bg-emerald-700',
    outline: 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50'
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button  // ← HARUS DEFAULT EXPORT!