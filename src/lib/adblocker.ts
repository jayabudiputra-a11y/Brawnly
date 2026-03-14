import.meta.env;

const _0xBL: string[] = [
  "djYyMDA2LmNvbQ==",
  "djYyMDA2LmNvbS9saW5rMg==",
  "aGF0Y2hlc2tvZXJp",
  "aGF0Y2hlc2tvZXJpLnNob3A=",
  "aWsuaGF0Y2hlc2tvZXJp",
  "ZGVmYWNlc2lycmFzLmNsaWNr",
  "eW0uZGVmYWNlc2lycmFzLmNsaWNr",
  "cGhpZ2xlcmRhaWwubmV0",
  "bm4xMjUuY29t",
  "bm4xMjU=",
  "cmFqYWJzeW5lLnNob3A=",
  "cmFqYWJzeW5l",
  "dG8ucmFqYWJzeW5lLnNob3A=",
  "L2N4Lw==",
  "L2FmdS5waHA=",
  "cG9wYWRz",
  "dHJhZmZpY2p1bmtpZQ==",
  "YWRjYXNoLmNvbQ==",
  "ZXhvc3J2LmNvbQ==",
  "cG9wY2FzaC5uZXQ=",
  "anVpY3lhZHMuY29t",
  "cHJvcGVsbGVyYWRzLmNvbQ==",
  "aGlsbHRvcGFkcy5uZXQ=",
  "YWRzdGVycmEuY29t",
];

const _0xBLQ_V2006 = ["dmFyPQ==", "eW1pZD0=", "dmFyXzM5"] as const;
const _0xBLQ_CX    = ["bWQ9", "cHI9", "ZmM5"] as const;
const _0xBLQ_AFU   = ["em9uZWlkPQ==", "dmFyPQ==", "cmlkPQ=="] as const;
const _0xBLQ_AFU2  = ["em9uZWlkPQ==", "YWIycj0="] as const;
const _0xBLQ_AFU3  = ["em9uZWlkPQ==", "cmhkPXRydWU="] as const;

const _0xTLD_CLICK_CX = "LmNsaWNrL2N4Lw==";
const _0xTLD_SHOP_CX  = "LnNob3AvY3gv";

const _D = (arr: readonly string[]) =>
  arr.map((b) => { try { return atob(b); } catch { return ""; } }).filter(Boolean);

const _BL        = _D(_0xBL);
const _BLQ_V2006 = _D(_0xBLQ_V2006);
const _BLQ_CX    = _D(_0xBLQ_CX);
const _BLQ_AFU   = _D(_0xBLQ_AFU);
const _BLQ_AFU2  = _D(_0xBLQ_AFU2);
const _BLQ_AFU3  = _D(_0xBLQ_AFU3);

let _TLD_CX = "";
let _TLD_SHOP_CX = "";
try { _TLD_CX      = atob(_0xTLD_CLICK_CX); } catch { _TLD_CX = ""; }
try { _TLD_SHOP_CX = atob(_0xTLD_SHOP_CX);  } catch { _TLD_SHOP_CX = ""; }

// Whitelist: Google ad infra + Twitter/X platform widget
const _0xWL: string[] = [
  "ZG91YmxlY2xpY2submV0",              // doubleclick.net
  "Z29vZ2xlc3luZGljYXRpb24uY29t",      // googlesyndication.com
  "YWR0cmFmZmljcXVhbGl0eS5nb29nbGU=",  // adtrafficquality.google
  "Z29vZ2xldGFnbWFuYWdlci5jb20=",      // googletagmanager.com
  "Z29vZ2xldGFnc2VydmljZXMuY29t",      // googletagservices.com
  "Z29vZ2xlYWRzZXJ2aWNlcy5jb20=",      // googleadservices.com
  "Z29vZ2xlYXBpcy5jb20=",              // googleapis.com
  "cGxhdGZvcm0udHdpdHRlci5jb20=",      // platform.twitter.com
  "cGxhdGZvcm0ueC5jb20=",              // platform.x.com
];
const _WL = _D(_0xWL);

export function _shouldBlock(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const _lower = url.toLowerCase();
  if (_WL.some((w) => _lower.includes(w.toLowerCase()))) return false;
  if (_BL.some((p) => _lower.includes(p.toLowerCase()))) return true;
  if (_TLD_CX      && _lower.includes(_TLD_CX.toLowerCase()))      return true;
  if (_TLD_SHOP_CX && _lower.includes(_TLD_SHOP_CX.toLowerCase())) return true;
  try {
    const _u = new URL(url);
    const _s = _u.search;
    if (_BLQ_V2006.every((q) => _s.includes(q))) return true;
    if (_BLQ_CX.every((q) => _s.includes(q)))    return true;
    if (_BLQ_AFU.every((q) => _s.includes(q)))   return true;
    if (_BLQ_AFU2.every((q) => _s.includes(q)))  return true;
    if (_BLQ_AFU3.every((q) => _s.includes(q)))  return true;
  } catch { /* skip */ }
  return false;
}

export { _shouldBlock as isAdUrl };

const _blocked204 = () =>
  new Response(null, { status: 204, statusText: "No Content (ad blocked)" });

const _origFetch = window.fetch.bind(window);
window.fetch = function _patchedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url =
    typeof input === "string" ? input
    : input instanceof Request ? input.url
    : String(input);
  if (_shouldBlock(url)) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] fetch blocked:", url.slice(0, 120));
    return Promise.resolve(_blocked204());
  }
  return _origFetch(input, init);
};

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

const _origOpen = window.open.bind(window);
(window as any).open = function _patchedWindowOpen(
  url?: string | URL, target?: string, features?: string
): Window | null {
  const _url = url ? String(url) : "";
  if (_url && _shouldBlock(_url)) {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] window.open blocked:", _url.slice(0, 120));
    return null;
  }
  if (!_url && target === "_blank") {
    if (import.meta.env.DEV) console.debug("[AD_BLOCK] window.open blank _blank blocked");
    return null;
  }
  return _origOpen(url, target, features);
};

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

(function _injectCSP() {
  try {
    const _csp = document.createElement("meta");
    _csp.httpEquiv = "Content-Security-Policy";
    _csp.content = [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *",
      [
        "frame-src",
        "'self'", "blob:", "data:",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
        "https://player.vimeo.com",
        "https://vimeo.com",
        "https://accounts.google.com",
        "https://www.google.com",
        "https://*.google.com",
        "https://*.google",
        "https://fundingchoices.google.com",
        "https://td.doubleclick.net",
        "https://doubleclick.net",
        "https://*.doubleclick.net",
        "https://*.googlesyndication.com",
        "https://googletagmanager.com",
        "https://*.googletagmanager.com",
        "https://platform.twitter.com",
        "https://platform.x.com",
        "https://www.instagram.com",
        "https://instagram.com",
      ].join(" "),
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' * blob:",
      "connect-src 'self' * blob: data:",
    ].join("; ");
    const _head = document.head || document.getElementsByTagName("head")[0];
    if (_head?.firstChild) _head.insertBefore(_csp, _head.firstChild);
    else if (_head) _head.appendChild(_csp);
  } catch { /* noop */ }
})();

(function _injectPermissionsPolicy() {
  try {
    const _pp = document.createElement("meta");
    _pp.httpEquiv = "Permissions-Policy";
    _pp.content = "camera=(), microphone=(), geolocation=(), unload=()";
    const _head = document.head || document.getElementsByTagName("head")[0];
    if (_head?.firstChild) _head.insertBefore(_pp, _head.firstChild);
    else if (_head) _head.appendChild(_pp);
  } catch { /* noop */ }
})();

if (import.meta.env.DEV) {
  console.log(
    `[AD_BLOCK] ✅ ${_BL.length} patterns + ${_WL.length} whitelist (google+twitter) + 5 fingerprints + TLD heuristics + createElement + sendBeacon + history + CSP + PermissionsPolicy.`
  );
}