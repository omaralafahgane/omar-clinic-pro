'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      theme="light"
      toastOptions={{
        classNames: {
          toast: 'text-right',
          title: 'text-right',
          description: 'text-right'
        }
      }}
    />
  );
}
