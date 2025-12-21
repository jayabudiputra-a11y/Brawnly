import React, { useEffect } from 'react';

const IframeA11yFixer: React.FC = () => {
  useEffect(() => {
    const fixIframes = () => {
      const iframes = document.querySelectorAll('iframe');
      
      let fixedCount = 0;

      iframes.forEach((iframe, index) => {
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
        console.info(`✅ Fixed ${fixedCount} iframe accessibility warning(s).`);
      }
    };

    fixIframes();

    const timeoutId = setTimeout(fixIframes, 500); 

    return () => clearTimeout(timeoutId);
  }, []); 

  return null; 
};

export default IframeA11yFixer;