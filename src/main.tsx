import './index.css';
import './App.css';
import './styles/globals.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import App from '@/App';
import { registerSW } from '@/registerSW';

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

const _isPrerender =
  typeof navigator !== 'undefined' && navigator.webdriver === true;

let _eventDispatched = false;
function _dispatchRenderEvent() {
  if (_eventDispatched) return;
  _eventDispatched = true;
  document.dispatchEvent(new Event('render-event'));
}

if (_isPrerender) {
  window.addEventListener('error', () => _dispatchRenderEvent(), { once: true });
  window.addEventListener('unhandledrejection', () => _dispatchRenderEvent(), { once: true });
  setTimeout(() => _dispatchRenderEvent(), 8000);
}

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);

  const startApp = () => {
    const AppTree = (
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    );

    root.render(
      import.meta.env.DEV
        ? <React.StrictMode>{AppTree}</React.StrictMode>
        : AppTree
    );

    if (_isPrerender) {
      setTimeout(() => _dispatchRenderEvent(), 1000);
    } else {
      setTimeout(() => _dispatchRenderEvent(), 100);
    }
  };

  if (_isPrerender) {
    startApp();
  } else if (window.requestIdleCallback) {
    window.requestIdleCallback(() => startApp());
  } else {
    setTimeout(startApp, 1);
  }
}

registerSW();