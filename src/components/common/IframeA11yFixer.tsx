import React, { useEffect as _e } from 'react';

const IframeA11yFixer: React.FC = () => {
  _e(() => {
    const _f = () => {
      const _if = document.querySelectorAll('iframe');
      let _c = 0;

      _if.forEach((_i, _idx) => {
        if (_i.id.includes('google_ads') || _i.src.includes('about:blank')) {
          _i.style.pointerEvents = 'none';
        }

        if (!_i.hasAttribute('title') || _i.getAttribute('title') === '') {
          let _t = `Embedded Content ${_idx + 1}`;
          if (_i.id.includes('google_ads')) {
            _t = 'Google Ad Placeholder';
          }
          _i.setAttribute('title', _t);
          _c++;
        }
      });

      if (_c > 0 && import.meta.env.DEV) {
        console.info(`✅ Fixed ${_c} iframe accessibility warning(s).`);
      }
    };

    _f();
    const _id = setInterval(_f, 2000);
    return () => clearInterval(_id);
  }, []);

  return null;
};

export default IframeA11yFixer;