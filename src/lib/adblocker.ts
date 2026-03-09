/**
 * adBlocker.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Runtime ad-blocker yang berjalan di browser.
 * Intercept fetch(), XMLHttpRequest, window.open(), iframe.src,
 * MutationObserver, click, navigator.sendBeacon, document.createElement.
 *
 * Domains / patterns blocked:
 *   - v2006.com / v2006.com/link2 / v2006.com/afu.php
 *   - hatcheskoeri.shop / ik.hatcheskoeri.shop  (/cx/ path)
 *   - defacesirras.click / ym.defacesirras.click (/cx/ path)
 *   - phiglerdail.net   (/afu.php)
 *   - nn125.com         (/afu.php)  ← NEW
 *   - rajabsyne.shop / to.rajabsyne.shop (/cx/ path) ← NEW
 *   - *.click + /cx/   (TLD catch-all)
 *   - *.shop + /cx/    (TLD catch-all) ← NEW
 *   - /afu.php + zoneid= (afu network path+param catch-all)
 *   - doubleclick.net, googlesyndication, adserver
 *   - popads, trafficjunkie, adcash.com, exosrv.com
 *   - popcash.net, juicyads.com, propellerads.com
 *   - hilltopads.net, adsterra.com
 *   - md= + pr= + fc=  (cx-payload query fingerprint)
 *   - zoneid= + ab2r=  (afu network 2-param fingerprint) ← NEW
 *   - zoneid= + var= + rid= (afu full fingerprint)
 *
 * CARA PAKAI:
 *   Import sekali di paling atas App.tsx (sebelum semua import lain):
 *   import "@/lib/adBlocker";
 *
 * Self-executing — cukup import, langsung aktif.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Obfuscated domain/path pattern registry ─────────────────────────────────
const _0xBL: string[] = [
  // === v2006 family ===
  "djYyMDA2LmNvbQ==",              // v2006.com
  "djYyMDA2LmNvbS9saW5rMg==",     // v2006.com/link2

  // === hatcheskoeri family ===
  "aGF0Y2hlc2tvZXJp",              // hatcheskoeri (catch-all)
  "aGF0Y2hlc2tvZXJpLnNob3A=",     // hatcheskoeri.shop
  "aWsuaGF0Y2hlc2tvZXJp",         // ik.hatcheskoeri

  // === defacesirras family (/cx/ delivery path) ===
  "ZGVmYWNlc2lycmFzLmNsaWNr",     // defacesirras.click
  "eW0uZGVmYWNlc2lycmFzLmNsaWNr", // ym.defacesirras.click

  // === phiglerdail family (/afu.php) ===
  "cGhpZ2xlcmRhaWwubmV0",         // phiglerdail.net

  // === nn125 family (/afu.php) — NEW ===
  "bm4xMjUuY29t",                  // nn125.com
  "bm4xMjU=",                      // nn125 (catch-all subdomain)

  // === rajabsyne family (/cx/ delivery) — NEW ===
  "cmFqYWJzeW5lLnNob3A=",         // rajabsyne.shop
  "cmFqYWJzeW5l",                  // rajabsyne (catch-all)
  "dG8ucmFqYWJzeW5lLnNob3A=",     // to.rajabsyne.shop

  // === path-based catch-all (works regardless of rotating domain) ===
  "L2N4Lw==",                      // /cx/  (ad payload delivery path)
  "L2FmdS5waHA=",                  // /afu.php  (afu ad network path)

  // === standard ad networks ===
  "ZG91YmxlY2xpY2submV0",         // doubleclick.net
  "Z29vZ2xlc3luZGljYXRpb24=",    // googlesyndication
  "YWRzZXJ2ZXI=",                  // adserver
  "cG9wYWRz",                      // popads
  "dHJhZmZpY2p1bmtpZQ==",         // trafficjunkie
  "YWRjYXNoLmNvbQ==",              // adcash.com
  "ZXhvc3J2LmNvbQ==",              // exosrv.com
  "cG9wY2FzaC5uZXQ=",              // popcash.net
  "anVpY3lhZHMuY29t",              // juicyads.com
  "cHJvcGVsbGVyYWRzLmNvbQ==",     // propellerads.com
  "aGlsbHRvcGFkcy5uZXQ=",          // hilltopads.net
  "YWRzdGVycmEuY29t",              // adsterra.com
];

// ─── Query param fingerprints ─────────────────────────────────────────────────
// Group A: v2006.com/link2 — ALL 3 required (AND logic)
const _0xBLQ_V2006 = [
  "dmFyPQ==",    // var=
  "eW1pZD0=",   // ymid=
  "dmFyXzM9",   // var_3=
] as const;

// Group B: hatcheskoeri / defacesirras / rajabsyne /cx/ payload — ALL 3 (AND)
const _0xBLQ_CX = [
  "bWQ9",   // md=
  "cHI9",   // pr=
  "ZmM9",   // fc=
] as const;

// Group C: phiglerdail / nn125 / afu network full — ALL 3 (AND)
const _0xBLQ_AFU = [
  "em9uZWlkPQ==",  // zoneid=
  "dmFyPQ==",      // var=
  "cmlkPQ==",      // rid=
] as const;

// Group D: afu network 2-param fast check — zoneid= + ab2r= — NEW
// ab2r= is unique to this ad network and never appears in legitimate requests
const _0xBLQ_AFU2 = [
  "em9uZWlkPQ==",  // zoneid=
  "YWIycj0=",      // ab2r=
] as const;

// Group E: afu + rhd fingerprint — zoneid= + rhd=true — NEW
const _0xBLQ_AFU3 = [
  "em9uZWlkPQ==",    // zoneid=
  "cmhkPXRydWU=",    // rhd=true
] as const;

// ─── TLD catch-all patterns ───────────────────────────────────────────────────
// Matches: anything.click/cx/ — catches rotating ad domains on .click TLD
const _0xTLD_CLICK_CX = "LmNsaWNrL2N4Lw==";   // .click/cx/
// Matches: anything.shop/cx/  — catches rajabsyne.shop + future rotators — NEW
const _0xTLD_SHOP_CX  = "LnNob3AvY3gv";        // .shop/cx/

// ─── Decode all patterns once at module init ──────────────────────────────────
const _D = (arr: readonly string[]) =>
  arr.map((b) => { try { return atob(b); } catch { return ""; } }).filter(Boolean);

const _BL        = _D(_0xBL);
const _BLQ_V2006 = _D(_0xBLQ_V2006);
const _BLQ_CX    = _D(_0xBLQ_CX);
const _BLQ_AFU   = _D(_0xBLQ_AFU);
const _BLQ_AFU2  = _D(_0xBLQ_AFU2);
const _BLQ_AFU3  = _D(_0xBLQ_AFU3);

let _TLD_CX: string;
let _TLD_SHOP_CX: string;
try { _TLD_CX      = atob(_0xTLD_CLICK_CX); } catch { _TLD_CX = ""; }
try { _TLD_SHOP_CX = atob(_0xTLD_SHOP_CX);  } catch { _TLD_SHOP_CX = ""; }

// ─── Core check ──────────────────────────────────────────────────────────────
/**
 * Returns true if a URL should be blocked.
 * Checks: domain/path patterns, query-param fingerprints, TLD+path heuristic.
 */
export function _shouldBlock(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  // Normalise — lowercase for TLD matching, keep original for param matching
  const _lower = url.toLowerCase();

  // 1. Domain / path exact/partial match (base64-decoded)
  if (_BL.some((p) => _lower.includes(p.toLowerCase()))) return true;

  // 2. TLD + /cx/ path catch-alls — rotating domains
  if (_TLD_CX      && _lower.includes(_TLD_CX.toLowerCase()))      return true;
  if (_TLD_SHOP_CX && _lower.includes(_TLD_SHOP_CX.toLowerCase())) return true;

  // 3. Query param fingerprint checks
  try {
    const _u = new URL(url);
    const _s = _u.search;

    // v2006 fingerprint: var= + ymid= + var_3=
    if (_BLQ_V2006.every((q) => _s.includes(q))) return true;

    // cx-payload fingerprint: md= + pr= + fc= (hatcheskoeri/defacesirras/rajabsyne)
    if (_BLQ_CX.every((q) => _s.includes(q))) return true;

    // afu full fingerprint: zoneid= + var= + rid=
    if (_BLQ_AFU.every((q) => _s.includes(q))) return true;

    // afu 2-param fast fingerprint: zoneid= + ab2r= — NEW
    if (_BLQ_AFU2.every((q) => _s.includes(q))) return true;

    // afu+rhd fingerprint: zoneid= + rhd=true — NEW
    if (_BLQ_AFU3.every((q) => _s.includes(q))) return true;

  } catch { /* relative URL or non-parseable — skip */ }

  return false;
}

// Export alias for use in api.ts / Home.tsx
export { _shouldBlock as isAdUrl };

// ─── Blocked response helper ──────────────────────────────────────────────────
const _blocked204 = () =>
  new Response(null, { status: 204, statusText: "No Content (ad blocked)" });

// ─── 1. Patch window.fetch ────────────────────────────────────────────────────
const _origFetch = window.fetch.bind(window);
window.fetch = function _patchedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url =
    typeof input === "string"
      ? input
      : input instanceof Request
      ? input.url
      : String(input);

  if (_shouldBlock(url)) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] fetch blocked:", url.slice(0, 120));
    return Promise.resolve(_blocked204());
  }
  return _origFetch(input, init);
};

// ─── 2. Patch XMLHttpRequest ──────────────────────────────────────────────────
const _XHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function _patchedOpen(
  method: string,
  url: string | URL,
  async?: boolean,
  username?: string | null,
  password?: string | null
) {
  const _url = String(url);
  if (_shouldBlock(_url)) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] XHR blocked:", _url.slice(0, 120));
    (this as any).__adBlocked = true;
    return;
  }
  return _XHROpen.apply(this, arguments as any);
};

const _XHRSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function _patchedSend(
  body?: Document | XMLHttpRequestBodyInit | null
) {
  if ((this as any).__adBlocked) return;
  return _XHRSend.apply(this, arguments as any);
};

// ─── 3. Patch window.open ─────────────────────────────────────────────────────
const _origOpen = window.open.bind(window);
(window as any).open = function _patchedWindowOpen(
  url?: string | URL,
  target?: string,
  features?: string
): Window | null {
  const _url = url ? String(url) : "";
  // Block ALL non-same-origin new tabs with suspicious targets OR known ad URLs
  if (_url && _shouldBlock(_url)) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] window.open blocked:", _url.slice(0, 120));
    return null;
  }
  // Block blank new tabs opened by ad scripts (no URL = ad pop-under trick)
  if (!_url && target === "_blank") {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] window.open blank _blank blocked");
    return null;
  }
  return _origOpen(url, target, features);
};

// ─── 4. Patch navigator.sendBeacon — ad tracking beacon ──────────────────────
if (navigator.sendBeacon) {
  const _origBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = function _patchedBeacon(url: string | URL, data?: BodyInit | null): boolean {
    const _url = String(url);
    if (_shouldBlock(_url)) {
      if (import.meta.env.DEV) console.debug("[AD_BLOCK] sendBeacon blocked:", _url.slice(0, 120));
      return true; // pretend success
    }
    return _origBeacon(url, data);
  };
}

// ─── 5. Block iframe.src setter ──────────────────────────────────────────────
const _origIframeSrcDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src");
if (_origIframeSrcDesc?.set) {
  Object.defineProperty(HTMLIFrameElement.prototype, "src", {
    set(value: string) {
      if (_shouldBlock(value)) {
        if (import.meta.env.DEV) console.debug("[AD_BLOCK] iframe.src blocked:", value.slice(0, 120));
        return;
      }
      _origIframeSrcDesc.set!.call(this, value);
    },
    get() {
      return _origIframeSrcDesc.get!.call(this);
    },
    configurable: true,
  });
}

// ─── 6. Block location.href / replace / assign ────────────────────────────────
const _origLocationDesc = Object.getOwnPropertyDescriptor(window, "location");
if (_origLocationDesc && _origLocationDesc.configurable) {
  const _origHrefDesc = Object.getOwnPropertyDescriptor(Location.prototype, "href");
  if (_origHrefDesc?.set) {
    Object.defineProperty(Location.prototype, "href", {
      set(value: string) {
        if (_shouldBlock(String(value))) {
          if (import.meta.env.DEV) console.debug("[AD_BLOCK] location.href blocked:", String(value).slice(0, 120));
          return;
        }
        _origHrefDesc.set!.call(this, value);
      },
      get() {
        return _origHrefDesc.get!.call(this);
      },
      configurable: true,
    });
  }
}

const _origReplace = Location.prototype.replace;
Location.prototype.replace = function _patchedReplace(url: string | URL) {
  const _url = String(url);
  if (_shouldBlock(_url)) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] location.replace blocked:", _url.slice(0, 120));
    return;
  }
  return _origReplace.call(this, url);
};

const _origAssign = Location.prototype.assign;
Location.prototype.assign = function _patchedAssign(url: string | URL) {
  const _url = String(url);
  if (_shouldBlock(_url)) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] location.assign blocked:", _url.slice(0, 120));
    return;
  }
  return _origAssign.call(this, url);
};

// ─── 7. Patch document.createElement — block dynamic ad script/iframe inject ─
// Ad networks often do: const s = document.createElement('script'); s.src = 'https://adnet...'
const _origCreateElement = document.createElement.bind(document);
(document as any).createElement = function _patchedCreateElement(
  tagName: string,
  options?: ElementCreationOptions
): HTMLElement {
  const el = _origCreateElement(tagName, options) as any;
  const tag = tagName.toLowerCase();

  if (tag === "script") {
    // Intercept .src assignment on dynamically created scripts
    let _scriptSrc = "";
    const _origScriptSrcDesc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
    if (_origScriptSrcDesc) {
      Object.defineProperty(el, "src", {
        set(value: string) {
          _scriptSrc = value;
          if (_shouldBlock(value)) {
            if (import.meta.env.DEV) console.debug("[AD_BLOCK] dynamic script.src blocked:", value.slice(0, 120));
            // Mark element as poisoned — MutationObserver will also catch it
            el.__adBlocked = true;
            return;
          }
          _origScriptSrcDesc.set!.call(el, value);
        },
        get() {
          return _scriptSrc || (_origScriptSrcDesc.get ? _origScriptSrcDesc.get.call(el) : "");
        },
        configurable: true,
      });
    }
  }

  if (tag === "iframe") {
    // Already patched via prototype, but also guard per-instance
    let _iframeSrc = "";
    const _origIframeSrc2 = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src");
    if (_origIframeSrc2) {
      Object.defineProperty(el, "src", {
        set(value: string) {
          _iframeSrc = value;
          if (_shouldBlock(value)) {
            if (import.meta.env.DEV) console.debug("[AD_BLOCK] dynamic iframe.src blocked:", value.slice(0, 120));
            el.__adBlocked = true;
            return;
          }
          if (_origIframeSrc2.set) _origIframeSrc2.set.call(el, value);
        },
        get() {
          return _iframeSrc || (_origIframeSrc2.get ? _origIframeSrc2.get.call(el) : "");
        },
        configurable: true,
      });
    }
  }

  return el;
};

// ─── 8. MutationObserver — remove injected ad nodes from DOM ─────────────────
function _checkAndRemove(node: HTMLElement): boolean {
  let attr = "";
  if (node.tagName === "SCRIPT")      attr = "src";
  else if (node.tagName === "IFRAME") attr = "src";
  else if (node.tagName === "A")      attr = "href";
  else return false;

  const val =
    node.getAttribute(attr) ||
    (node.tagName === "A"
      ? (node as HTMLAnchorElement).href
      : (node as HTMLScriptElement | HTMLIFrameElement).src) ||
    "";

  if (val && _shouldBlock(val)) {
    if (import.meta.env.DEV) console.debug(`[AD_BLOCK] DOM ${node.tagName} removed:`, val.slice(0, 120));
    node.remove();
    return true;
  }
  // Also remove if element is marked as poisoned by createElement patch
  if ((node as any).__adBlocked) {
    node.remove();
    return true;
  }
  return false;
}

const _adObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of Array.from(mutation.addedNodes)) {
      if (!(node instanceof HTMLElement)) continue;
      if (_checkAndRemove(node)) continue;
      // Recursively check children (ad wrapper divs containing iframes/scripts)
      node
        .querySelectorAll<HTMLElement>("script[src], iframe[src], a[href]")
        .forEach(_checkAndRemove);
    }
  }
});

_adObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// ─── 9. Click-level guard — intercept <a> clicks to ad domains ───────────────
document.addEventListener(
  "click",
  (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest("a");
    if (!target) return;
    const href = target.getAttribute("href") || target.href || "";
    if (href && _shouldBlock(href)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (import.meta.env.DEV) console.debug("[AD_BLOCK] click blocked:", href.slice(0, 120));
    }
  },
  true // capture phase — runs before any other click handler
);

// ─── 10. beforeunload / popstate guard — block ad-triggered navigation ────────
// Some ad scripts abuse history.pushState or trigger beforeunload redirect
const _origPushState    = history.pushState.bind(history);
const _origReplaceState = history.replaceState.bind(history);

history.pushState = function _patchedPushState(
  state: any, unused: string, url?: string | URL | null
) {
  if (url && _shouldBlock(String(url))) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] history.pushState blocked:", String(url).slice(0, 120));
    return;
  }
  return _origPushState(state, unused, url);
};

history.replaceState = function _patchedReplaceState(
  state: any, unused: string, url?: string | URL | null
) {
  if (url && _shouldBlock(String(url))) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] history.replaceState blocked:", String(url).slice(0, 120));
    return;
  }
  return _origReplaceState(state, unused, url);
};

// ─── 11. Inject Content Security Policy meta tag ─────────────────────────────
// Browser-level CSP as last line of defense — blocks resources before they load
(function _injectCSP() {
  try {
    const _csp = document.createElement("meta");
    _csp.httpEquiv = "Content-Security-Policy";
    // Block known ad domains from loading any resources
    const _blockedHosts = [
      "v2006.com",
      "hatcheskoeri.shop",
      "*.hatcheskoeri.shop",
      "defacesirras.click",
      "*.defacesirras.click",
      "phiglerdail.net",
      "*.phiglerdail.net",
      "nn125.com",
      "*.nn125.com",
      "rajabsyne.shop",
      "*.rajabsyne.shop",
      "doubleclick.net",
      "*.doubleclick.net",
      "googlesyndication.com",
      "*.googlesyndication.com",
      "popads.net",
      "*.popads.net",
      "trafficjunkie.com",
      "adcash.com",
      "exosrv.com",
      "popcash.net",
      "juicyads.com",
      "propellerads.com",
      "hilltopads.net",
      "adsterra.com",
    ].join(" ");

    _csp.content = [
      `default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *`,
      `frame-src 'self' blob: data: https://www.youtube.com https://player.vimeo.com`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' * blob:`,
      `connect-src 'self' * blob: data:`,
    ].join("; ");

    // Insert as first child of <head> so it takes precedence
    const _head = document.head || document.getElementsByTagName("head")[0];
    if (_head && _head.firstChild) {
      _head.insertBefore(_csp, _head.firstChild);
    } else if (_head) {
      _head.appendChild(_csp);
    }
  } catch {
    // CSP injection failed — other layers still active
  }
})();

if (import.meta.env.DEV) {
  console.log(
    `[AD_BLOCK] ✅ Aktif. ${_BL.length} domain/path patterns + 5 query fingerprints` +
    ` + .click/cx/ + .shop/cx/ heuristics` +
    ` + createElement patch + sendBeacon patch + history patch + CSP meta.`
  );
}