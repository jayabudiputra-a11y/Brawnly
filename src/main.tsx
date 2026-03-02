import './index.css';
import './App.css';
import './styles/globals.css';

import React from 'react';
import { createRoot as _c, hydrateRoot as _h } from 'react-dom/client';
import { BrowserRouter as _R } from 'react-router-dom';
import { QueryClient as _Q, QueryClientProvider as _QP } from '@tanstack/react-query';
import { HelmetProvider as _Hm } from 'react-helmet-async';
import { Toaster as _T } from 'sonner';
import App from '@/App';
import { registerSW as _SW } from 'virtual:pwa-register';

const _u = _SW({
  onNeedRefresh() {
    confirm('Brawnly Updated. Reload?') && _u(true);
  },
  onOfflineReady() {
    console.log('[BRAWNLY] Offline ready');
  }
});

const _q = new _Q({
  defaultOptions: {
    queries: {
      staleTime: 3e5,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
});

const _r = document.getElementById('root');

if (_r) {
  const _content = (
    <React.StrictMode>
      <_Hm>
        <_QP client={_q}>
          <_R>
            <App />
            <_T 
              position='top-right' 
              richColors={true} 
              closeButton={true} 
              theme='system' 
            />
          </_R>
        </_QP>
      </_Hm>
    </React.StrictMode>
  );

  if (_r.hasChildNodes()) {
    _h(_r, _content);
  } else {
    _c(_r).render(_content);
  }
}