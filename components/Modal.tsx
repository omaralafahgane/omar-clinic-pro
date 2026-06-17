'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    full: 'sm:max-w-[95%] sm:h-[95vh]',
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" dir="rtl">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Center the modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal Content */}
        <div
          ref={modalRef}
          className={cn(
            'inline-block align-bottom bg-white dark:bg-gray-900 rounded-[2rem] text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:w-full border border-gray-100 dark:border-gray-800',
            sizeClasses[size]
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-xl leading-6 font-black text-gray-900 dark:text-white" id="modal-headline">
              {title}
            </h3>
            {closeButton && (
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all hover:rotate-90"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-8 py-6 dark:text-gray-300">{children}</div>
        </div>
      </div>
    </div>
  );
}
