import React, { useEffect } from 'react';

const IframeA11yFixer: React.FC = () => {
  useEffect(() => {
    const fixIframes = () => {
      const iframes = document.querySelectorAll('iframe');
      
      let fixedCount = 0;

      iframes.forEach((iframe, index) => {
        // 1. Tambahkan pointer-events: none jika iframe hanya placeholder agar tidak menghalangi klik
        if (iframe.id.includes('google_ads') || iframe.src.includes('about:blank')) {
            iframe.style.pointerEvents = 'none';
        }

        if (!iframe.hasAttribute('title') || iframe.getAttribute('title') === '') {
          let defaultTitle = `Embedded Content ${index + 1}`;
          
          if (iframe.id.includes('google_ads')) {
             defaultTitle = 'Google Ad Placeholder';
          }
          
          iframe.setAttribute('title', defaultTitle);
          fixedCount++;
        }
      });

      if (fixedCount > 0) {
        // Hanya muncul di development agar console tidak kotor di production
        if (process.env.NODE_ENV === 'development') {
          console.info(`✅ Fixed ${fixedCount} iframe accessibility warning(s).`);
        }
      }
    };

    fixIframes();

    // Gunakan interval singkat untuk menangkap iframe yang telat muncul (seperti iklan)
    const intervalId = setInterval(fixIframes, 2000); 

    return () => clearInterval(intervalId);
  }, []); 

  // Pastikan benar-benar tidak merender apa pun ke DOM
  return null; 
};

export default IframeA11yFixer;