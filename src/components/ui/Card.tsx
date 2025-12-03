import { type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shadow' | 'bordered';
}

const Card = ({ className, variant = 'default', children, ...props }: CardProps) => {
  return (
    <div
      className={clsx(
        'rounded-xl overflow-hidden',
        {
          'bg-white shadow-md hover:shadow-lg transition-shadow': variant === 'shadow',
          'bg-white border border-gray-200': variant === 'bordered',
          'bg-white': variant === 'default',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;