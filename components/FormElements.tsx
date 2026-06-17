'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BaseProps {
  label?: string;
  error?: string;
  className?: string;
  required?: boolean;
}

export function FormInput({ 
  label, error, className, required, ...props 
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("space-y-2", className)} dir="rtl">
      {label && (
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        className={cn(
          "w-full px-4 py-3 rounded-xl border transition-all outline-none",
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
        )}
        {...props}
      />
      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function FormSelect({ 
  label, error, className, required, options, ...props 
}: BaseProps & React.SelectHTMLAttributes<HTMLSelectElement> & { options: { label: string, value: string }[] }) {
  return (
    <div className={cn("space-y-2", className)} dir="rtl">
      {label && (
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        className={cn(
          "w-full px-4 py-3 rounded-xl border transition-all outline-none appearance-none",
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function FormTextarea({ 
  label, error, className, required, ...props 
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={cn("space-y-2", className)} dir="rtl">
      {label && (
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          "w-full px-4 py-3 rounded-xl border transition-all outline-none min-h-[120px]",
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
        )}
        {...props}
      />
      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function PhoneInput({ 
  label, error, className, required, ...props 
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("space-y-2", className)} dir="rtl">
      {label && (
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <span className="absolute right-4 text-gray-400 font-bold border-l border-gray-100 pl-3 ml-3">+962</span>
        <input
          className={cn(
            "w-full pr-20 pl-4 py-3 rounded-xl border transition-all outline-none",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
            "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-left",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
          )}
          placeholder="7XXXXXXXX"
          {...props}
        />
      </div>
      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}
