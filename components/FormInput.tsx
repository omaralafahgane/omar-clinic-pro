import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  required?: boolean;
}

export function FormInput({
  label,
  error,
  hint,
  icon,
  required,
  className,
  ...props
}: FormInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">{icon}</div>}
        <input
          className={cn(
            'w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors',
            icon ? 'pr-10' : '',
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300',
            'p-2.5 text-sm',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
