import React from 'react';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
  /** Transparent lets the fixed 3D canvas behind the page show through */
  transparent?: boolean;
}

export default function Layout({ children, transparent = false }: LayoutProps) {
  return (
    <div className={`min-h-screen ${transparent ? '' : 'bg-primary'}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #22c55e',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {children}
    </div>
  );
}
