import { type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={clsx(
        'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors',
        className
      )}
      {...props}
    />
  );
};

export default Input;