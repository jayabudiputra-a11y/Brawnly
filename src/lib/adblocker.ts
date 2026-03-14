/**
 * adBlocker.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Runtime ad-blocker yang berjalan di browser.
 * Intercept fetch(), XMLHttpRequest, window.open(), iframe.src,
 * MutationObserver, click, navigator.sendBeacon, document.createElement.
 *
 * ⚠️  _injectCSP() INTENTIONALLY REMOVED — ini adalah ROOT CAUSE iklan
 *     Google tidak muncul di semua versi sebelumnya.
 *
 *     Fungsi itu meng-inject <meta http-equiv="Content-Security-Policy">
 *     sebagai FIRST CHILD of <head> dengan frame-src yang TIDAK LENGKAP:
 *       • ep1/ep2.adtrafficquality.google TIDAK ADA → AdSense quality frame diblok
 *       • syndication.x.com / x.com TIDAK ADA → X embed diblok
 *       • tumblr, substack, pinterest, *.youtube.com TIDAK ADA → embed diblok
 *
 *     Browser menerapkan SEMUA <meta CSP> secara bersamaan (intersection =
 *     paling ketat). CSP pendek ini selalu menang atas CSP lengkap di
 *     index.html karena di-inject sebagai firstChild.
 *
 *     index.html sudah punya CSP lengkap — tidak perlu CSP kedua di sini.
 *     index.html juga punya CSP meta killer yang menghapus CSP pendek dari
 *     build lama yang masih ter-cache di browser user.
 *
 * ── WHITELIST (dicek PERTAMA — tidak pernah diblok) ──────────────────────────
 *   Google AdSense full stack:
 *     doubleclick.net (semua subdomain incl. googleads.g, td, cm, ds)
 *     googlesyndication.com / pagead2.googlesyndication.com
 *     googleadservices.com / partner.googleadservices.com
 *     googletagmanager.com / googletagservices.com / googleapis.com
 *     adtrafficquality.google (incl. ep1, ep2)
 *     google.com (fundingchoicesmessages, accounts, cse, www, *.google.com)
 *   Twitter/X embed:
 *     platform.twitter.com / platform.x.com
 *     syndication.twitter.com / syndication.x.com
 *     twitter.com / x.com / twimg.com / cdn.syndication.twimg.com
 *   Media embed:
 *     youtube.com / youtu.be / ytimg.com / ggpht.com / googlevideo.com
 *     vimeo.com
 *   Social embed:
 *     instagram.com / cdninstagram.com / tumblr.com / pinterest.com
 *     pinimg.com / substack.com
 *   App infra:
 *     brawnly.online / supabase.co / cloudinary.com / royaleapi.com
 *     rss2json.com / allorigins.win / codetabs.com / corsproxy.io
 *     thingproxy.freeboard.io / cors.sh
 *   Streaming player:
 *     m4uhd.com / m4uhd.co / m4ufree
 *
 * ── BLOCKED patterns ──────────────────────────────────────────────────────────
 *   v2006.com/link2, hatcheskoeri, defacesirras, phiglerdail, nn125, rajabsyne,
 *   /cx/, /afu.php, popads, trafficjunkie, adcash.com, exosrv.com, popcash.net,
 *   juicyads.com, propellerads.com, hilltopads.net, adsterra.com
 *
 * CARA PAKAI:  import "@/lib/adBlocker";   (di paling atas App.tsx)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import.meta.env;

// ─── Blocklist (obfuscated) ───────────────────────────────────────────────────
// ⚠️  doubleclick.net TIDAK ADA di sini — ada di whitelist _0xWL di bawah.
const _0xBL: string[] = [
  // v2006 family
  "djYyMDA2LmNvbQ==",              // v62006.com
  "djYyMDA2LmNvbS9saW5rMg==",     // v62006.com/link2
  // hatcheskoeri family
  "aGF0Y2hlc2tvZXJp",              // hatcheskoeri (catch-all)
  "aGF0Y2hlc2tvZXJpLnNob3A=",     // hatcheskoeri.shop
  "aWsuaGF0Y2hlc2tvZXJp",         // ik.hatcheskoeri
  // defacesirras family
  "ZGVmYWNlc2lycmFzLmNsaWNr",     // defacesirras.click
  "eW0uZGVmYWNlc2lycmFzLmNsaWNr", // ym.defacesirras.click
  // phiglerdail / nn125 / rajabsyne
  "cGhpZ2xlcmRhaWwubmV0",         // phiglerdail.net
  "bm4xMjUuY29t",                  // nn125.com
  "bm4xMjU=",                      // nn125 (subdomain catch-all)
  "cmFqYWJzeW5lLnNob3A=",         // rajabsyne.shop
  "cmFqYWJzeW5l",                  // rajabsyne (catch-all)
  "dG8ucmFqYWJzeW5lLnNob3A=",     // to.rajabsyne.shop
  // path-based (rotating domain independent)
  "L2N4Lw==",                      // /cx/
  "L2FmdS5waHA=",                  // /afu.php
  // streaming popup / redirect networks — NOT Google
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

// ─── Query fingerprints ───────────────────────────────────────────────────────
const _0xBLQ_V2006 = ["dmFyPQ==", "eW1pZD0=", "dmFyXzM5"] as const; // var= ymid= var_3=
const _0xBLQ_CX    = ["bWQ9", "cHI5", "ZmM5"]              as const; // md= pr= fc=
const _0xBLQ_AFU   = ["em9uZWlkPQ==", "dmFyPQ==", "cmlkPQ=="] as const; // zoneid= var= rid=
const _0xBLQ_AFU2  = ["em9uZWlkPQ==", "YWIycj0="]          as const; // zoneid= ab2r=
const _0xBLQ_AFU3  = ["em9uZWlkPQ==", "cmhkPXRydWU="]      as const; // zoneid= rhd=true
// Streaming popup fingerprint
const _0xBLQ_POPUP = ["cGlkPQ==", "emlkPQ==", "c2lkPQ=="]  as const; // pid= zid= sid=

// ─── TLD catch-all ────────────────────────────────────────────────────────────
const _0xTLD_CLICK_CX = "LmNsaWNrL2N4Lw=="; // .click/cx/
const _0xTLD_SHOP_CX  = "LnNob3AvY3gv";     // .shop/cx/

// ─── Whitelist (obfuscated, decoded once at init) ─────────────────────────────
// DICEK PERTAMA di _shouldBlock() — jika match, langsung return false.
// ⚠️  Jangan hapus entri ini. Ini yang memastikan iklan Google muncul.
const _0xWL: string[] = [
  // Google AdSense & delivery stack — WAJIB ADA
  "ZG91YmxlY2xpY2submV0",              // doubleclick.net  (ALL subdomains)
  "Z29vZ2xlc3luZGljYXRpb24uY29t",      // googlesyndication.com
  "YWR0cmFmZmljcXVhbGl0eS5nb29nbGU=",  // adtrafficquality.google
  "Z29vZ2xldGFnbWFuYWdlci5jb20=",      // googletagmanager.com
  "Z29vZ2xldGFnc2VydmljZXMuY29t",      // googletagservices.com
  "Z29vZ2xlYWRzZXJ2aWNlcy5jb20=",      // googleadservices.com
  "Z29vZ2xlYXBpcy5jb20=",              // googleapis.com
  "Z29vZ2xlLmNvbQ==",                  // google.com  (covers *.google.com, fundingchoicesmessages, etc.)
  // Twitter / X platform widgets
  "cGxhdGZvcm0udHdpdHRlci5jb20=",      // platform.twitter.com
  "cGxhdGZvcm0ueC5jb20=",              // platform.x.com
  "c3luZGljYXRpb24udHdpdHRlci5jb20=",  // syndication.twitter.com
  "c3luZGljYXRpb24ueC5jb20=",          // syndication.x.com
  "dHdpdHRlci5jb20=",                  // twitter.com
  "dHdpbWcuY29t",                      // twimg.com
  "eC5jb20=",                          // x.com
  "Y2RuLnN5bmRpY2F0aW9uLnR3aW1nLmNvbQ==", // cdn.syndication.twimg.com
  // YouTube & media CDN
  "eW91dHViZS5jb20=",                  // youtube.com
  "eW91dHUuYmU=",                      // youtu.be
  "eXRpbWcuY29t",                      // ytimg.com
  "Z2dwaHQuY29t",                      // ggpht.com
  "Z29vZ2xldmlkZW8uY29t",              // googlevideo.com
  "dmltZW8uY29t",                      // vimeo.com
  // Social embeds
  "aW5zdGFncmFtLmNvbQ==",              // instagram.com
  "Y2RuaW5zdGFncmFtLmNvbQ==",          // cdninstagram.com
  "dHVtYmxyLmNvbQ==",                  // tumblr.com
  "cGludGVyZXN0LmNvbQ==",              // pinterest.com
  "cGluaW1nLmNvbQ==",                  // pinimg.com
  "c3Vic3RhY2suY29t",                  // substack.com
  // App infrastructure
  "YnJhd25seS5vbmxpbmU=",              // brawnly.online
  "c3VwYWJhc2UuY28=",                  // supabase.co
  "Y2xvdWRpbmFyeS5jb20=",              // cloudinary.com
  "cm95YWxlYXBpLmNvbQ==",              // royaleapi.com
  // RSS proxy services
  "cnNzMmpzb24uY29t",                  // rss2json.com
  "YWxsb3JpZ2lucy53aW4=",              // allorigins.win
  "Y29kZXRhYnMuY29t",                  // codetabs.com
  "Y29yc3Byb3h5Lmlv",                  // corsproxy.io
  "dGhpbmdwcm94eS5mcmVlYm9hcmQuaW8=",  // thingproxy.freeboard.io
  "Y29ycy5zaA==",                      // cors.sh
  // Streaming player (handled by window.__openSafeMovie in index.html)
  "bTR1aGQuY29t",                      // m4uhd.com
  "bTR1aGQuY28=",                      // m4uhd.co
  "bTR1ZnJlZQ==",                      // m4ufree
];

// ─── Decode all patterns once at module init ──────────────────────────────────
const _D = (arr: readonly string[]) =>
  arr.map((b) => { try { return atob(b); } catch { return ""; } }).filter(Boolean);

const _BL        = _D(_0xBL);
const _BLQ_V2006 = _D(_0xBLQ_V2006);
const _BLQ_CX    = _D(_0xBLQ_CX);
const _BLQ_AFU   = _D(_0xBLQ_AFU);
const _BLQ_AFU2  = _D(_0xBLQ_AFU2);
const _BLQ_AFU3  = _D(_0xBLQ_AFU3);
const _BLQ_POPUP = _D(_0xBLQ_POPUP);
const _WL        = _D(_0xWL);

let _TLD_CX = "";
let _TLD_SHOP_CX = "";
try { _TLD_CX      = atob(_0xTLD_CLICK_CX); } catch { _TLD_CX = ""; }
try { _TLD_SHOP_CX = atob(_0xTLD_SHOP_CX);  } catch { _TLD_SHOP_CX = ""; }

// ─── Core check ───────────────────────────────────────────────────────────────
/**
 * Urutan pengecekan:
 *   1. Whitelist — jika match → return false LANGSUNG (tidak diblok)
 *   2. Domain/path blocklist
 *   3. TLD heuristics
 *   4. Query param fingerprints
 */
export function _shouldBlock(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  const _lower = url.toLowerCase();

  // ── Step 1: Whitelist ── WAJIB jalan duluan sebelum apapun ───────────────
  // Ini memastikan Google AdSense, YouTube, Instagram, Twitter/X TIDAK diblok.
  if (_WL.some((w) => _lower.includes(w.toLowerCase()))) return false;

  // ── Step 2: Domain / path patterns ────────────────────────────────────────
  if (_BL.some((p) => _lower.includes(p.toLowerCase()))) return true;

  // ── Step 3: TLD + path heuristics ─────────────────────────────────────────
  if (_TLD_CX      && _lower.includes(_TLD_CX.toLowerCase()))      return true;
  if (_TLD_SHOP_CX && _lower.includes(_TLD_SHOP_CX.toLowerCase())) return true;

  // ── Step 4: Query param fingerprints ──────────────────────────────────────
  try {
    const _u = new URL(url);
    const _s = _u.search;
    if (_BLQ_V2006.every((q) => _s.includes(q))) return true; // v2006 redirect
    if (_BLQ_CX.every((q)    => _s.includes(q))) return true; // cx-payload
    if (_BLQ_AFU.every((q)   => _s.includes(q))) return true; // afu full
    if (_BLQ_AFU2.every((q)  => _s.includes(q))) return true; // afu fast
    if (_BLQ_AFU3.every((q)  => _s.includes(q))) return true; // afu+rhd
    if (_BLQ_POPUP.every((q) => _s.includes(q))) return true; // streaming popup
    // Popunder keys — any ONE is sufficient
    if (["popunder=", "popzone=", "popid="].some((q) => _s.includes(q))) return true;
  } catch { /* non-parseable URL */ }

  return false;
}

export { _shouldBlock as isAdUrl };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const _blocked204 = () =>
  new Response(null, { status: 204, statusText: "No Content (ad blocked)" });

// ─── 1. fetch ─────────────────────────────────────────────────────────────────
const _origFetch = window.fetch.bind(window);
window.fetch = function _patchedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url =
    typeof input === "string"       ? input
    : input instanceof Request      ? input.url
    : String(input);
  if (_shouldBlock(url)) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] fetch blocked:", url.slice(0, 120));
    return Promise.resolve(_blocked204());
  }
  return _origFetch(input, init);
};

// ─── 2. XMLHttpRequest ───────────────────────────────────────────────────────
const _XHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function _patchedOpen(
  method: string, url: string | URL, async?: boolean,
  username?: string | null, password?: string | null
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

// ─── 3. window.open ──────────────────────────────────────────────────────────
const _origOpen = window.open.bind(window);
(window as any).open = function _patchedWindowOpen(
  url?: string | URL, target?: string, features?: string
): Window | null {
  const _url = url ? String(url) : "";
  if (_url && _shouldBlock(_url)) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] window.open blocked:", _url.slice(0, 120));
    return null;
  }
  // Block blank popunder pattern
  if (!_url && target === "_blank") {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] window.open blank _blank blocked");
    return null;
  }
  if ((_url === "" || _url === "about:blank") && !features) return null;
  return _origOpen(url, target, features);
};

// ─── 4. sendBeacon ───────────────────────────────────────────────────────────
if (navigator.sendBeacon) {
  const _origBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = function _patchedBeacon(url: string | URL, data?: BodyInit | null): boolean {
    const _url = String(url);
    if (_shouldBlock(_url)) {
      if (import.meta.env.DEV) console.debug("[AD_BLOCK] sendBeacon blocked:", _url.slice(0, 120));
      return true;
    }
    return _origBeacon(url, data);
  };
}

// ─── 5. iframe.src setter ────────────────────────────────────────────────────
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
    get() { return _origIframeSrcDesc.get!.call(this); },
    configurable: true,
  });
}

// ─── 6. location.href / replace / assign ─────────────────────────────────────
const _origLocationDesc = Object.getOwnPropertyDescriptor(window, "location");
if (_origLocationDesc?.configurable) {
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
      get() { return _origHrefDesc.get!.call(this); },
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

// ─── 7. document.createElement ───────────────────────────────────────────────
const _origCreateElement = document.createElement.bind(document);
(document as any).createElement = function _patchedCreateElement(
  tagName: string, options?: ElementCreationOptions
): HTMLElement {
  const el = _origCreateElement(tagName, options) as any;
  const tag = tagName.toLowerCase();

  if (tag === "script") {
    let _scriptSrc = "";
    const _osd = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
    if (_osd) {
      Object.defineProperty(el, "src", {
        set(value: string) {
          _scriptSrc = value;
          if (_shouldBlock(value)) {
            if (import.meta.env.DEV) console.debug("[AD_BLOCK] dynamic script.src blocked:", value.slice(0, 120));
            el.__adBlocked = true;
            return;
          }
          _osd.set!.call(el, value);
        },
        get() { return _scriptSrc || (_osd.get ? _osd.get.call(el) : ""); },
        configurable: true,
      });
    }
  }

  if (tag === "iframe") {
    let _iframeSrc = "";
    const _oid = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src");
    if (_oid) {
      Object.defineProperty(el, "src", {
        set(value: string) {
          _iframeSrc = value;
          if (_shouldBlock(value)) {
            if (import.meta.env.DEV) console.debug("[AD_BLOCK] dynamic iframe.src blocked:", value.slice(0, 120));
            el.__adBlocked = true;
            return;
          }
          if (_oid.set) _oid.set.call(el, value);
        },
        get() { return _iframeSrc || (_oid.get ? _oid.get.call(el) : ""); },
        configurable: true,
      });
    }
  }

  return el;
};

// ─── 8. MutationObserver ─────────────────────────────────────────────────────
function _checkAndRemove(node: HTMLElement): boolean {
  // ⚠️  Jangan sentuh <meta> — CSP meta management ada di index.html
  if (node.tagName === "META") return false;

  let attr = "";
  if (node.tagName === "SCRIPT")      attr = "src";
  else if (node.tagName === "IFRAME") attr = "src";
  else if (node.tagName === "A")      attr = "href";
  else return false;

  const val =
    node.getAttribute(attr) ||
    (node.tagName === "A"
      ? (node as HTMLAnchorElement).href
      : (node as HTMLScriptElement | HTMLIFrameElement).src) || "";

  if (val && _shouldBlock(val)) {
    if (import.meta.env.DEV) console.debug(`[AD_BLOCK] DOM ${node.tagName} removed:`, val.slice(0, 120));
    node.remove();
    return true;
  }
  if ((node as any).__adBlocked) { node.remove(); return true; }
  return false;
}

const _adObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of Array.from(mutation.addedNodes)) {
      if (!(node instanceof HTMLElement)) continue;
      if (_checkAndRemove(node)) continue;
      node.querySelectorAll<HTMLElement>("script[src], iframe[src], a[href]").forEach(_checkAndRemove);
    }
  }
});

_adObserver.observe(document.documentElement, { childList: true, subtree: true });

// ─── 9. Click guard ──────────────────────────────────────────────────────────
document.addEventListener("click", (e: MouseEvent) => {
  const target = (e.target as HTMLElement).closest("a");
  if (!target) return;
  const href = target.getAttribute("href") || target.href || "";
  if (href && _shouldBlock(href)) {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] click blocked:", href.slice(0, 120));
  }
}, true);

// ─── 10. History API guard ────────────────────────────────────────────────────
const _origPushState    = history.pushState.bind(history);
const _origReplaceState = history.replaceState.bind(history);

history.pushState = function _patchedPushState(state: any, unused: string, url?: string | URL | null) {
  if (url && _shouldBlock(String(url))) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] history.pushState blocked:", String(url).slice(0, 120));
    return;
  }
  return _origPushState(state, unused, url);
};

history.replaceState = function _patchedReplaceState(state: any, unused: string, url?: string | URL | null) {
  if (url && _shouldBlock(String(url))) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] history.replaceState blocked:", String(url).slice(0, 120));
    return;
  }
  return _origReplaceState(state, unused, url);
};

// ─── 11. securitypolicyviolation suppressor ───────────────────────────────────
// Suppress frame-src violation noise dari Chrome extension / old SW cache.
// stopImmediatePropagation tidak mencegah CSP enforcement — hanya mencegah
// listener lain melihat event ini (mengurangi spam di DevTools console).
document.addEventListener("securitypolicyviolation", (e: SecurityPolicyViolationEvent) => {
  if (e.violatedDirective?.includes("frame-src")) {
    e.stopImmediatePropagation();
  }
}, true);

// ─── 12. Permissions-Policy meta ─────────────────────────────────────────────
// Inject Permissions-Policy untuk suppress unload deprecation warning.
// Ini AMAN — Permissions-Policy meta tidak mempengaruhi iklan.
(function _injectPermissionsPolicy() {
  try {
    const _pp = document.createElement("meta");
    _pp.httpEquiv = "Permissions-Policy";
    /* NOTE: unload=() was removed intentionally.
       Setting unload=() in Permissions-Policy does NOT suppress the
       "[Violation] Permissions policy violation: unload" console error —
       it actually GENERATES it repeatedly for every script that calls
       addEventListener('unload', ...).
       The correct suppressor is in index.html: EventTarget.prototype
       .addEventListener is patched to redirect 'unload' → 'pagehide'. */
    _pp.content   = "camera=(), microphone=(), geolocation=()";
    const _head = document.head || document.getElementsByTagName("head")[0];
    if (_head?.firstChild) _head.insertBefore(_pp, _head.firstChild);
    else if (_head) _head.appendChild(_pp);
  } catch { /* noop */ }
})();

// ─── ⛔  _injectCSP() SENGAJA TIDAK ADA DI SINI ───────────────────────────────
//
// Versi sebelumnya meng-inject CSP ini ke <head> sebagai firstChild:
//
//   frame-src 'self' blob: data:
//     https://www.youtube.com
//     https://player.vimeo.com
//     ... (daftar pendek)
//
// Browser menerapkan SEMUA <meta CSP> secara bersamaan (intersection = paling
// ketat). Daftar pendek ini memblok ep1/ep2.adtrafficquality.google,
// syndication.x.com, tumblr.com, substack.com, dan banyak domain lain yang
// tidak ada di daftar pendek — termasuk frame iklan Google AdSense.
//
// index.html sudah punya CSP lengkap dengan SEMUA domain yang diperlukan.
// Tidak perlu CSP kedua di sini. Iklan Google sekarang bisa muncul.
// ─────────────────────────────────────────────────────────────────────────────

if (import.meta.env.DEV) {
  console.log(
    `[AD_BLOCK] ✅ Aktif — ${_BL.length} patterns | ${_WL.length} whitelist entries` +
    ` | 6 fingerprint groups | TLD heuristics` +
    ` | createElement + sendBeacon + history + PermissionsPolicy` +
    ` | [_injectCSP REMOVED — iklan Google diizinkan]`
  );
}