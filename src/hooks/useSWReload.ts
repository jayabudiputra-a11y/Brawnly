import { useEffect } from 'react';

export function useSWReload() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'SW_ACTIVATED') {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);

    navigator.serviceWorker.ready.then((reg) => {
      reg.update();
    });

    return () => {
      navigator.serviceWorker.removeEventListener('message', handler);
    };
  }, []);
}