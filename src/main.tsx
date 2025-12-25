import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import App from '@/App'

import '@/lib/i18n'

// URUTAN CSS: globals.css di paling bawah agar logic filter gambar tidak tertimpa
import './index.css'
import './App.css'
import './styles/globals.css' 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          {/* REVISI: Menggunakan theme="system" agar valid secara TypeScript 
            dan warna toast otomatis sinkron dengan mode Dark/Light perangkat.
          */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="system"
            toastOptions={{
              style: { 
                fontFamily: 'Inter, system-ui, sans-serif',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                letterSpacing: '0.05em'
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
)