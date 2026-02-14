import './index.css';
import './App.css';
import './styles/globals.css';

import {createRoot as _c} from 'react-dom/client';
import {BrowserRouter as _R} from 'react-router-dom';
import {QueryClient as _Q,QueryClientProvider as _QP} from '@tanstack/react-query';
import {HelmetProvider as _H} from 'react-helmet-async';
import {Toaster as _T} from 'sonner';
import App from '@/App';
import React from 'react';
import {registerSW as _SW} from 'virtual:pwa-register';

const _u=_SW({onNeedRefresh(){confirm('Brawnly Updated. Reload?')&&_u(!0)},onOfflineReady(){console.log('[BRAWNLY] Offline ready')}});

const _q=new _Q({defaultOptions:{queries:{staleTime:3e5,retry:1}}});

function _b(n:HTMLElement){
  _c(n).render(
    React.createElement(_H,null,
      React.createElement(_QP,{client:_q},
        React.createElement(_R,null,
          React.createElement(App),
          React.createElement(_T,{position:'top-right',richColors:!0,closeButton:!0,theme:'system'})
        )
      )
    )
  )
}

const _r=document.getElementById('root');_r&&_b(_r);