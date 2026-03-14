import React, { useEffect as _e } from 'react';

/**
 * IframeA11yFixer.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixes iframe accessibility warnings (missing title attribute) without
 * touching layout, width, pointer-events, or any visual property of
 * Google AdSense iframes.
 *
 * ✅  AdSense iframes — title added only (NO style mutation)
 *     width: 100% / display: block are set by ArticleDetail.tsx <ins> styles.
 *     Touching those here would override AdSense's own dimension negotiation.
 *
 * ✅  AMP Auto Ads iframes (cdn.ampproject.org) — title added only
 *     AMP manages its own iframe sizing and positioning; no style mutations.
 *
 * ✅  about:blank iframes that are NOT Google ads / NOT AMP — pointer-events: none
 *     These are empty placeholders with no interactive content.
 *
 * ✅  Non-ad, non-blank iframes (Twitter, YouTube, Instagram) — title only
 *     Their layout is managed by their respective embed scripts / CSS.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Returns true if the iframe belongs to the Google AdSense / DoubleClick stack */
function _isGoogleAdIframe(iframe: HTMLIFrameElement): boolean {
  const id  = iframe.id  ?? '';
  const src = (() => { try { return iframe.src; } catch { return ''; } })();
  const name = iframe.getAttribute('name') ?? '';

  return (
    id.includes('google_ads')          ||
    id.includes('aswift')              ||
    id.startsWith('google_ads_iframe') ||
    name.includes('google_ads')        ||
    src.includes('googlesyndication')  ||
    src.includes('doubleclick.net')    ||
    src.includes('googleadservices')   ||
    src.includes('adtrafficquality')
  );
}

/**
 * Returns true if the iframe was injected by AMP Auto Ads runtime.
 * AMP iframes originate from cdn.ampproject.org and have class names
 * beginning with "i-amphtml-" or carry data-amp-* attributes.
 */
function _isAmpIframe(iframe: HTMLIFrameElement): boolean {
  const src  = (() => { try { return iframe.src ?? ''; } catch { return ''; } })();
  const cls  = iframe.className ?? '';
  const name = iframe.getAttribute('name') ?? '';
  const id   = iframe.id ?? '';

  return (
    src.includes('ampproject.org')          ||
    src.includes('cdn.ampproject.org')      ||
    cls.includes('i-amphtml')               ||
    name.includes('amp_')                   ||
    id.includes('amp_')                     ||
    iframe.hasAttribute('data-amp-slot')    ||
    iframe.hasAttribute('data-amp-auto-ads') ||
    /* AMP ad iframe parents carry amp-* custom element tag */
    (iframe.parentElement?.tagName?.toLowerCase().startsWith('amp-') ?? false)
  );
}

/** Returns a readable label for the iframe based on its src/id */
function _inferTitle(iframe: HTMLIFrameElement, idx: number): string {
  const src = (() => { try { return iframe.src ?? ''; } catch { return ''; } })();
  const id  = iframe.id ?? '';

  if (_isGoogleAdIframe(iframe))               return 'Advertisement';
  if (_isAmpIframe(iframe))                    return 'Advertisement — AMP Auto Ads';
  if (id.includes('twitter') || src.includes('twitter.com') || src.includes('x.com'))
                                               return 'Embedded Tweet';
  if (src.includes('youtube') || src.includes('youtu.be'))
                                               return 'Embedded YouTube Video';
  if (src.includes('instagram.com'))           return 'Embedded Instagram Post';
  if (src.includes('tumblr.com'))              return 'Embedded Tumblr Post';
  if (src.includes('substack.com'))            return 'Embedded Substack Post';
  if (src.includes('pinterest.com'))           return 'Embedded Pinterest Pin';
  if (src.includes('clashroyale'))             return 'Embedded Clash Royale Widget';
  if (src === 'about:blank' || src === '')     return `Inline Frame ${idx + 1}`;
  return `Embedded Content ${idx + 1}`;
}

const IframeA11yFixer: React.FC = () => {
  _e(() => {
    const _fix = () => {
      const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
      let fixed = 0;

      iframes.forEach((iframe, idx) => {
        const isAd    = _isGoogleAdIframe(iframe);
        const isAmp   = _isAmpIframe(iframe);
        const src     = (() => { try { return iframe.src ?? ''; } catch { return ''; } })();
        const isBlank = src === 'about:blank' || src === '';

        // ── 1. Title fix (all iframes) ────────────────────────────────────
        const existingTitle = iframe.getAttribute('title');
        if (!existingTitle || existingTitle.trim() === '') {
          iframe.setAttribute('title', _inferTitle(iframe, idx));
          fixed++;
        }

        // ── 2. pointer-events: none — ONLY non-ad, non-AMP blank placeholders
        //    ⚠️  Never touch AdSense iframes — breaks click-through & layout.
        //    ⚠️  Never touch AMP iframes — AMP runtime manages their interaction.
        if (!isAd && !isAmp && isBlank) {
          iframe.style.pointerEvents = 'none';
        }

        // ── 3. AdSense iframes — NO style mutations ───────────────────────
        //    width: 100% is controlled by the <ins> wrapper in ArticleDetail.
        //    AdSense sets its own height after slot negotiation.
        //    Mutating any dimension here breaks "No slot size for availableWidth=0".

        // ── 4. AMP Auto Ads iframes — NO style mutations ─────────────────
        //    AMP runtime positions and sizes its own ad iframes via
        //    the amp-auto-ads component. Any external style mutation
        //    will interfere with AMP's internal layout engine.
      });

      if (fixed > 0 && import.meta.env.DEV) {
        console.info(`✅ IframeA11yFixer: fixed ${fixed} iframe title(s).`);
      }
    };

    // Run immediately, then poll every 2 s for dynamically injected iframes
    // (covers AdSense lazy slots, AMP auto-placed iframes, React-mounted embeds)
    _fix();
    const _id = setInterval(_fix, 2000);
    return () => clearInterval(_id);
  }, []);

  return null;
};

export default IframeA11yFixer;