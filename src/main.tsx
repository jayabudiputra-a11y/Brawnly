import './index.css';
import './App.css';
import './styles/globals.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import App from '@/App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  
  const startApp = () => {
    root.render(
      <React.StrictMode>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </QueryClientProvider>
        </HelmetProvider>
      </React.StrictMode>
    );
  };

  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => startApp());
  } else {
    setTimeout(startApp, 1);
  }
}