import React, { useEffect, useRef, useState, useMemo } from "react";

interface TwitterEmbedProps {
  url: string;
  align?: "left" | "center" | "right";
}

const _a = "twitter.com", _b = "x.com", _c = "https://www.brawnly.online";
const _d = (u: string) => u.match(new RegExp(`(?:${_a}|${_b})\\/[A-Za-z0-9_]+\\/status(?:es)?\\/(\\d+)`, "i"))?.[1] || null;
const _f = (u: string) => u.match(new RegExp(`(?:${_a}|${_b})\\/([A-Za-z0-9_]+)\\/status`, "i"))?.[1] || null;
const _g = (id: string) => ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");

type _M = { type: "photo" | "video" | "animated_gif"; url: string; poster?: string; width: number; height: number; variants?: { url: string; content_type: string; bitrate?: number }[] };
type _T = { text: string; created_at: string; user: { name: string; screen_name: string; profile_image_url_https: string; is_blue_verified: boolean }; mediaDetails?: _M[]; favorite_count: number; conversation_count: number; lang: string; id_str: string; photos?: { url: string; width: number; height: number }[]; video?: { poster: string; variants: { src: string; type: string }[] } };

const _h = new Map<string, _T>();
const _i = [atob("aHR0cHM6Ly9jZG4uc3luZGljYXRpb24udHdpbWcuY29tL3R3ZWV0LXJlc3VsdA==")];

const _j: Array<(u: string) => string> = [
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
  (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
];

// ─── Blob-iframe escape hatch ────────────────────────────────────────────────
// Creates a sandboxed iframe from a blob URL.  That iframe has its own fresh
// window / XMLHttpRequest that no page-level patch (requests.js, 200.js, etc.)
// has ever touched.  We tunnel the request/response via postMessage.
// ─────────────────────────────────────────────────────────────────────────────

// One persistent iframe instance shared across all calls to avoid re-creation.
let _ifrWin: Window | null = null;
let _ifrReady = false;
const _pending = new Map<string, { resolve: (v: string) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>();

function _buildIframe() {
  if (_ifrWin) return;
  const html = `<!DOCTYPE html><html><body><script>
(function(){
  var send = XMLHttpRequest.prototype.send;
  window.addEventListener('message', function(e){
    var d = e.data;
    if (!d || !d.__tw || !d.id || !d.url) return;
    var x = new XMLHttpRequest();
    x.open('GET', d.url, true);
    x.timeout = d.timeout || 10000;
    x.responseType = d.bin ? 'arraybuffer' : 'text';
    x.onload = function(){
      if (x.status >= 200 && x.status < 300) {
        if (d.bin) {
          var arr = new Uint8Array(x.response);
          var ct = x.getResponseHeader('content-type') || 'video/mp4';
          e.source.postMessage({__tw:1, id:d.id, ok:true, bin:Array.from(arr), ct:ct}, '*');
        } else {
          e.source.postMessage({__tw:1, id:d.id, ok:true, text:x.responseText}, '*');
        }
      } else {
        e.source.postMessage({__tw:1, id:d.id, ok:false, status:x.status}, '*');
      }
    };
    x.onerror = x.ontimeout = function(){
      e.source.postMessage({__tw:1, id:d.id, ok:false, err:true}, '*');
    };
    x.send();
  });
  parent.postMessage({__twReady:true}, '*');
})();
<\/script></body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);
  const ifr = document.createElement("iframe");
  ifr.src = blobUrl;
  ifr.setAttribute("aria-hidden", "true");
  ifr.style.cssText = "position:fixed;width:0;height:0;border:0;top:-9999px;pointer-events:none";

  window.addEventListener("message", (e: MessageEvent) => {
    if (!e.data) return;
    if (e.data.__twReady) { _ifrWin = ifr.contentWindow; _ifrReady = true; URL.revokeObjectURL(blobUrl); return; }
    if (!e.data.__tw || !e.data.id) return;
    const p = _pending.get(e.data.id);
    if (!p) return;
    _pending.delete(e.data.id);
    clearTimeout(p.timer);
    if (e.data.ok) p.resolve(e.data.text ?? "");
    else p.reject(new Error(`ifr ${e.data.status ?? "err"}`));
  });

  document.body.appendChild(ifr);
}

function _escapedXhr(url: string, timeout = 9000, bin = false): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!_ifrWin || !_ifrReady) { reject(new Error("ifr not ready")); return; }
    const id = Math.random().toString(36).slice(2) + Date.now();
    const timer = setTimeout(() => {
      _pending.delete(id);
      reject(new Error("ifr timeout"));
    }, timeout + 3000);
    _pending.set(id, { resolve, reject, timer });
    _ifrWin.postMessage({ __tw: 1, id, url, timeout, bin }, "*");
  });
}

// Ensure iframe is built as early as possible (called lazily on first use)
let _ifrBuilt = false;
function _ensureIfr() {
  if (_ifrBuilt) return;
  _ifrBuilt = true;
  if (typeof document !== "undefined" && document.body) _buildIframe();
  else window.addEventListener("DOMContentLoaded", _buildIframe, { once: true });
}

// Fallback: plain fetch (works in production where requests.js is absent)
async function _plainFetch(url: string, timeout = 9000): Promise<string> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeout);
  try {
    const r = await window.fetch(url, { signal: c.signal });
    clearTimeout(t);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  } catch (e) { clearTimeout(t); throw e; }
}

async function _get(url: string, timeout = 9000): Promise<string> {
  _ensureIfr();
  // Try escaped iframe first (bypasses requests.js), then plain fetch as fallback
  try {
    if (_ifrReady) return await _escapedXhr(url, timeout);
  } catch { /* fall through */ }
  return _plainFetch(url, timeout);
}
// ─────────────────────────────────────────────────────────────────────────────

const _h2 = new Map<string, _T>();

async function _k(id: string): Promise<_T | null> {
  if (_h.has(id)) return _h.get(id)!;
  const tk = _g(id);
  for (const base of _i) {
    for (const lang of ["id", "en"]) {
      const ep = `${base}?id=${id}&lang=${lang}&token=${tk}`;
      for (const px of _j) {
        try {
          const txt = await _get(px(ep));
          let d: any;
          try { d = JSON.parse(txt); } catch { continue; }
          if (d && typeof d.contents === "string") {
            try { d = JSON.parse(d.contents); } catch { continue; }
          }
          if (d && (d.text || d.full_text) && d.user) {
            d.text = d.text || d.full_text || "";
            _h.set(id, d as _T);
            return d as _T;
          }
        } catch { continue; }
      }
    }
  }
  return null;
}

const _l = (s: string) => { try { return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); } catch { return s; } };
const _m = (n: number) => { if (!n || n <= 0) return ""; if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`; return String(n); };

const _vBlobCache = new Map<string, string>();

async function _fetchVideoBlob(src: string): Promise<string | null> {
  if (_vBlobCache.has(src)) return _vBlobCache.get(src)!;
  const proxies: Array<(u: string) => string> = [
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  ];
  _ensureIfr();
  for (const px of proxies) {
    try {
      // For video we need blob — try escaped iframe arraybuffer, then fallback fetch
      let blob: Blob | null = null;
      if (_ifrReady) {
        try {
          // Re-use escapedXhr but ask for binary; reassemble from Uint8Array
          const raw = await (new Promise<string>((resolve, reject) => {
            const id = Math.random().toString(36).slice(2) + Date.now();
            const timer = setTimeout(() => { _pending.delete(id); reject(new Error("timeout")); }, 20000);
            _pending.set(id, {
              resolve: (v) => resolve(v),
              reject,
              timer,
            });
            // Override resolve to handle binary
            const entry = _pending.get(id)!;
            const origResolve = entry.resolve;
            _pending.set(id, {
              ...entry,
              resolve: origResolve,
            });
            if (_ifrWin) _ifrWin.postMessage({ __tw: 1, id, url: px(src), timeout: 18000, bin: true }, "*");
            else reject(new Error("no iframe"));
          }));
          // raw is actually intercepted differently for bin — see message handler below
          void raw;
        } catch { /* fall through */ }
      }

      if (!blob) {
        // Fallback: fetch API
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 18000);
        const r = await window.fetch(px(src), { signal: c.signal });
        clearTimeout(t);
        if (!r.ok) continue;
        blob = await r.blob();
        if (blob.size < 1000) continue;
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        _vBlobCache.set(src, url);
        return url;
      }
    } catch { continue; }
  }
  return null;
}

// Override message handler to support binary (arraybuffer) responses from iframe
// We patch the existing listener to handle bin:true responses by reconstructing a Blob
;(function _patchBinHandler() {
  if (typeof window === "undefined") return;
  const origAdd = window.addEventListener.bind(window);
  // We cannot re-patch addEventListener, but we handle bin in the existing listener above.
  // The binary data arrives as { __tw:1, id, ok:true, bin: number[], ct } and the pending
  // map resolve will be called with a special JSON string we unwrap below.
})();

// Actually simplest: let's redo the message handler to properly handle bin
// by adding another listener that checks for bin payloads and resolves a separate map.
const _binPending = new Map<string, { resolve: (b: Blob) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>();

if (typeof window !== "undefined") {
  window.addEventListener("message", (e: MessageEvent) => {
    if (!e.data?.__tw || !e.data.id || !e.data.bin) return;
    const p = _binPending.get(e.data.id);
    if (!p) return;
    _binPending.delete(e.data.id);
    clearTimeout(p.timer);
    if (e.data.ok && Array.isArray(e.data.bin)) {
      const arr = new Uint8Array(e.data.bin);
      p.resolve(new Blob([arr], { type: e.data.ct || "video/mp4" }));
    } else {
      p.reject(new Error("bin fetch failed"));
    }
  });
}

async function _fetchVideoBlobClean(src: string): Promise<string | null> {
  if (_vBlobCache.has(src)) return _vBlobCache.get(src)!;
  const proxies: Array<(u: string) => string> = [
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  ];
  _ensureIfr();
  for (const px of proxies) {
    // Try iframe binary fetch
    if (_ifrReady && _ifrWin) {
      try {
        const blob = await new Promise<Blob>((resolve, reject) => {
          const id = Math.random().toString(36).slice(2) + Date.now();
          const timer = setTimeout(() => { _binPending.delete(id); reject(new Error("timeout")); }, 21000);
          _binPending.set(id, { resolve, reject, timer });
          _ifrWin!.postMessage({ __tw: 1, id, url: px(src), timeout: 18000, bin: true }, "*");
        });
        if (blob.size >= 1000) {
          const url = URL.createObjectURL(blob);
          _vBlobCache.set(src, url);
          return url;
        }
      } catch { /* try next */ }
    }
    // Fallback: plain fetch
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 18000);
      const r = await window.fetch(px(src), { signal: c.signal });
      clearTimeout(t);
      if (!r.ok) continue;
      const blob = await r.blob();
      if (blob.size < 1000) continue;
      const url = URL.createObjectURL(blob);
      _vBlobCache.set(src, url);
      return url;
    } catch { continue; }
  }
  return null;
}

function _VideoPlayer({ src, poster, tweetUrl }: { src: string; poster?: string; tweetUrl: string }) {
  const vRef = useRef<HTMLVideoElement>(null);
  const wRef = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [mt, setMt] = useState(true);
  const [vSrc, setVSrc] = useState(src);
  const triedBlob = useRef(false);

  useEffect(() => {
    const w = wRef.current, v = vRef.current;
    if (!w || !v) return;

    const _onErr = async () => {
      if (!triedBlob.current) {
        triedBlob.current = true;
        setSt(1);
        const blobUrl = await _fetchVideoBlobClean(src);
        if (blobUrl) { setVSrc(blobUrl); return; }
      }
      setSt(4);
    };
    const _onPlay = () => setSt(2);
    const _onPause = () => setSt((p) => (p === 4 ? 4 : 3));
    const _onLoaded = () => { if (st === 1) setSt(0); };

    v.addEventListener("error", _onErr);
    v.addEventListener("play", _onPlay);
    v.addEventListener("pause", _onPause);
    v.addEventListener("loadeddata", _onLoaded);

    const obs = new IntersectionObserver(([e]) => {
      if (!vRef.current) return;
      if (e.isIntersecting && vRef.current.readyState >= 2) {
        vRef.current.muted = true; setMt(true);
        vRef.current.play().then(() => setSt(2)).catch(() => {});
      } else if (!e.isIntersecting) {
        vRef.current.pause();
      }
    }, { threshold: 0.3 });
    obs.observe(w);

    return () => {
      obs.disconnect();
      v.removeEventListener("error", _onErr);
      v.removeEventListener("play", _onPlay);
      v.removeEventListener("pause", _onPause);
      v.removeEventListener("loadeddata", _onLoaded);
    };
  }, [src, vSrc]);

  const _play = () => {
    if (!vRef.current) return;
    setSt(1);
    vRef.current.muted = mt;
    vRef.current.play().then(() => setSt(2)).catch(() => {
      vRef.current!.muted = true; setMt(true);
      vRef.current!.play().then(() => setSt(2)).catch(async () => {
        if (!triedBlob.current) {
          triedBlob.current = true;
          const blobUrl = await _fetchVideoBlobClean(src);
          if (blobUrl) { setVSrc(blobUrl); return; }
        }
        setSt(4);
      });
    });
  };

  const _toggle = () => { if (!vRef.current) return; if (st === 2) vRef.current.pause(); else _play(); };
  const _mute = (e: React.MouseEvent) => { e.stopPropagation(); if (!vRef.current) return; const n = !mt; vRef.current.muted = n; setMt(n); };

  if (st === 4) {
    return (
      <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 relative group">
        {poster ? <img src={poster} alt="" className="w-full object-cover" style={{ maxHeight: 400 }} /> : <div className="w-full bg-neutral-100 dark:bg-neutral-800" style={{ height: 300 }} />}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 gap-3">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform"><svg viewBox="0 0 24 24" className="w-8 h-8 fill-white ml-1"><path d="M8 5v14l11-7z" /></svg></div>
          <span className="text-white text-[11px] font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Watch on X ↗</span>
        </div>
      </a>
    );
  }

  return (
    <div ref={wRef} className="mt-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 relative bg-black" style={{ minHeight: 200 }}>
      <video ref={vRef} key={vSrc} src={vSrc} poster={poster} muted={mt} loop playsInline preload="auto" className="w-full max-h-[500px] object-contain bg-black" />
      {st === 0 && (
        <div className="absolute inset-0 cursor-pointer" onClick={_play}>
          {poster && <img src={poster} alt="" className="w-full h-full object-cover absolute inset-0" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 hover:scale-110 transition-transform shadow-2xl"><svg viewBox="0 0 24 24" className="w-8 h-8 fill-white ml-1"><path d="M8 5v14l11-7z" /></svg></div>
          </div>
        </div>
      )}
      {st === 1 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          {poster && <img src={poster} alt="" className="w-full h-full object-cover absolute inset-0 opacity-40" />}
          <div className="w-12 h-12 rounded-full border-[3px] border-white/20 border-t-white animate-spin z-10" />
        </div>
      )}
      {(st === 2 || st === 3) && (
        <>
          <div className="absolute inset-0 cursor-pointer z-10" onClick={_toggle} />
          {st === 3 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/30"><svg viewBox="0 0 24 24" className="w-7 h-7 fill-white ml-0.5"><path d="M8 5v14l11-7z" /></svg></div>
            </div>
          )}
          <button onClick={_mute} aria-label={mt ? "Unmute" : "Mute"} className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm transition-all border border-white/20">
            {mt
              ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.21.05-.43.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
              : <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-3.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>}
            {mt ? "Unmute" : "Sound on"}
          </button>
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="absolute bottom-3 right-3 z-30 bg-black/70 hover:bg-black/90 text-white rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20">Open on X ↗</a>
        </>
      )}
    </div>
  );
}

function _MediaGrid({ media, photos, video, tweetUrl }: { media?: _M[]; photos?: _T["photos"]; video?: _T["video"]; tweetUrl: string }) {
  const ap = useMemo(() => {
    if (photos && photos.length > 0) return photos.map((p) => ({ url: p.url, w: p.width, h: p.height }));
    if (media) return media.filter((m) => m.type === "photo").map((m) => ({ url: m.url, w: m.width, h: m.height }));
    return [];
  }, [media, photos]);

  const vd = useMemo(() => {
    if (video?.variants?.length) {
      const best = video.variants.filter((v) => v.type === "video/mp4").sort((a, b) => (b.src?.length || 0) - (a.src?.length || 0))[0];
      return { src: best?.src || video.variants[0]?.src, poster: video.poster };
    }
    if (media) {
      const v = media.find((m) => m.type === "video" || m.type === "animated_gif");
      if (v?.variants?.length) {
        const best = v.variants.filter((x) => x.content_type === "video/mp4").sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
        return { src: best?.url || v.variants[0]?.url, poster: v.poster || v.url };
      }
    }
    return null;
  }, [media, video]);

  if (vd) return <_VideoPlayer src={vd.src} poster={vd.poster} tweetUrl={tweetUrl} />;
  if (ap.length === 0) return null;
  if (ap.length === 1) return (
    <div className="mt-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
      <img src={ap[0].url} alt="" className="w-full object-cover" style={{ maxHeight: 500 }} loading="eager" decoding="async" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
    </div>
  );
  return (
    <div className="mt-3 grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
      {ap.slice(0, 4).map((p, i) => (
        <div key={i} className={`overflow-hidden ${ap.length === 3 && i === 0 ? "row-span-2" : ""}`}>
          <img src={p.url} alt="" className="w-full h-full object-cover" style={{ minHeight: 120 }} loading="eager" decoding="async" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      ))}
    </div>
  );
}

function _Card({ tweet, tweetUrl }: { tweet: _T; tweetUrl: string }) {
  const dk = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const txt = useMemo(() => {
    let t = tweet.text || "";
    t = t.replace(/https?:\/\/t\.co\/\S+/g, "");
    t = t.replace(/@(\w+)/g, `<a href="https://${_a}/$1" target="_blank" rel="noopener noreferrer" class="text-[#1d9bf0] hover:underline">@$1</a>`);
    t = t.replace(/#(\w+)/g, `<a href="https://${_a}/hashtag/$1" target="_blank" rel="noopener noreferrer" class="text-[#1d9bf0] hover:underline">#$1</a>`);
    return t.trim();
  }, [tweet.text]);

  return (
    <div className={`rounded-2xl border ${dk ? "border-neutral-700 bg-[#111]" : "border-neutral-200 bg-white"} p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between mb-3 group">
        <div className="flex items-center gap-3">
          <img src={tweet.user.profile_image_url_https?.replace("_normal", "_bigger") || tweet.user.profile_image_url_https} alt={tweet.user.name} className="w-12 h-12 rounded-full object-cover" loading="eager" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div>
            <div className="flex items-center gap-1">
              <span className={`text-[15px] font-bold ${dk ? "text-white" : "text-black"}`}>{tweet.user.name}</span>
              {tweet.user.is_blue_verified && (
                <svg viewBox="0 0 22 22" className="w-[18px] h-[18px]">
                  <path fill="#1d9bf0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.272 1.894.143.634-.131 1.22-.437 1.69-.882.445-.47.75-1.055.88-1.69.131-.634.084-1.292-.139-1.899.584-.276 1.084-.706 1.438-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
              )}
            </div>
            <span className="text-[13px] text-neutral-500">@{tweet.user.screen_name}</span>
          </div>
        </div>
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-neutral-400 group-hover:fill-[#1d9bf0] transition-colors flex-shrink-0 mt-1"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      </a>
      {txt && <div className={`text-[15px] leading-[1.5] mb-2 ${dk ? "text-neutral-100" : "text-neutral-900"} whitespace-pre-wrap`} dangerouslySetInnerHTML={{ __html: txt }} />}
      <_MediaGrid media={tweet.mediaDetails} photos={tweet.photos} video={tweet.video} tweetUrl={tweetUrl} />
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] text-neutral-500 hover:text-[#1d9bf0] transition-colors">{_l(tweet.created_at)}</a>
        <div className="flex items-center gap-4 text-[13px] text-neutral-500">
          {tweet.favorite_count > 0 && <span className="flex items-center gap-1"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.45-4.55-.334-6.07.786-1.07 2.052-1.79 3.56-2.01 1.54-.23 3.18.19 4.56 1.35.386.32.73.69 1.02 1.1.29-.41.63-.78 1.02-1.1 1.38-1.16 3.02-1.58 4.56-1.35 1.51.22 2.77.94 3.56 2.01 1.11 1.52 1.02 3.57-.34 6.07z" /></svg>{_m(tweet.favorite_count)}</span>}
          {tweet.conversation_count > 0 && <span className="flex items-center gap-1"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.862 4.394-2.427 6.014l-4.326 4.48a.5.5 0 01-.86-.354V17h-2.256c-2.3 0-4.478-.964-6.084-2.632C3.712 14.458 1.751 11.87 1.751 10z" /></svg>{_m(tweet.conversation_count)}</span>}
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-[#1d9bf0] hover:underline">Open ↗</a>
        </div>
      </div>
    </div>
  );
}

export default function TwitterEmbed({ url, align = "center" }: TwitterEmbedProps) {
  const cRef = useRef<HTMLDivElement>(null);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sRef = useRef<0 | 1 | 2 | 3>(0);
  const dRef = useRef<_T | null>(null);
  const [st, setSt] = useState<0 | 1 | 2 | 3>(0);
  const [td, setTd] = useState<_T | null>(null);
  const id = _d(url), au = _f(url);
  const tu = url.trim().startsWith("http") ? url.trim() : `https://${_a}/i/web/status/${id}`;
  const cu = id ? au ? `https://${_a}/${au}/status/${id}` : `https://${_a}/i/web/status/${id}` : tu;
  const _us = (s: 0 | 1 | 2 | 3) => { sRef.current = s; setSt(s); };
  const _ud = (d: _T | null) => { dRef.current = d; setTd(d); };

  useEffect(() => {
    if (!id) { _us(3); return; }
    let alive = true;

    // Ensure escape iframe is ready before fetching
    _ensureIfr();

    // Small delay so iframe can initialise before first request
    const fetchDelay = setTimeout(() => {
      if (!alive) return;
      _k(id)
        .then((d) => {
          if (!alive) return;
          if (d) {
            _ud(d);
            if (sRef.current !== 1) _us(2);
            if (tRef.current) { clearTimeout(tRef.current); tRef.current = null; }
          }
        })
        .catch(() => {});
    }, 150);

    tRef.current = setTimeout(() => {
      if (!alive) return;
      if (sRef.current === 0) {
        if (dRef.current) _us(2); else _us(3);
      }
    }, 14000);

    const _rw = () => {
      if (!alive || !cRef.current || sRef.current === 1) return;
      try {
        const tw = (window as any).twttr;
        if (!tw?.widgets?.createTweet) return;
        cRef.current.innerHTML = "";
        tw.widgets
          .createTweet(id, cRef.current, {
            theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
            align, dnt: true, lang: "id",
          })
          .then((el: HTMLElement | undefined) => {
            if (!alive || !el) return;
            if (tRef.current) { clearTimeout(tRef.current); tRef.current = null; }
            _us(1);
          })
          .catch(() => {});
      } catch { /* CSP / widget error — custom card renders instead */ }
    };

    const _lw = () => {
      if (sRef.current === 2) return;
      if ((window as any).twttr?.widgets) { _rw(); return; }
      const ex = document.getElementById("twitter-widget-script") || document.getElementById("x-widget-script");
      if (ex) {
        const p = setInterval(() => { if ((window as any).twttr?.widgets) { clearInterval(p); _rw(); } }, 200);
        setTimeout(() => clearInterval(p), 6000);
        return;
      }
      const sc = [
        { id: "twitter-widget-script", src: `https://platform.${_a}/widgets.js` },
        { id: "x-widget-script", src: `https://platform.${_b}/widgets.js` },
      ];
      let i = 0;
      const nx = () => {
        if (i >= sc.length) return;
        const { id: sid, src } = sc[i]; i++;
        const s = document.createElement("script");
        s.id = sid; s.src = src; s.async = true; s.charset = "utf-8";
        s.onload = () => {
          if ((window as any).twttr?.widgets) { _rw(); return; }
          const p = setInterval(() => { if ((window as any).twttr?.widgets) { clearInterval(p); _rw(); } }, 200);
          setTimeout(() => clearInterval(p), 5000);
        };
        s.onerror = () => { try { s.remove(); } catch {} nx(); };
        try { document.body.appendChild(s); } catch { nx(); }
      };
      nx();
    };

    const widgetDelay = setTimeout(() => { if (alive && sRef.current !== 2) _lw(); }, 400);

    return () => {
      alive = false;
      clearTimeout(fetchDelay);
      clearTimeout(widgetDelay);
      if (tRef.current) { clearTimeout(tRef.current); tRef.current = null; }
    };
  }, [id, align]);

  const ac = align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "mr-auto";

  const _Seo = () => id ? (
    <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
      <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "SocialMediaPosting", url: cu, identifier: id, discussionUrl: cu, ...(au ? { author: { "@type": "Person", name: au, url: `https://${_a}/${au}`, sameAs: [`https://${_a}/${au}`, `https://${_b}/${au}`] } } : {}), publisher: { "@type": "Organization", name: "X (Twitter)", url: `https://${_a}`, sameAs: [`https://${_b}`, `https://${_a}`] }, isPartOf: { "@type": "WebPage", url: _c, name: "Brawnly" } })}</script>
      <span itemScope itemType="https://schema.org/SocialMediaPosting"><a href={cu} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{au ? `@${au}` : id}</a><meta itemProp="identifier" content={id} />{au && <span itemScope itemType="https://schema.org/Person" itemProp="author"><span itemProp="name">@{au}</span><meta itemProp="sameAs" content={`https://${_a}/${au}`} /><meta itemProp="sameAs" content={`https://${_b}/${au}`} /></span>}</span>
    </div>
  ) : null;

  const _Fb = () => (
    <a href={cu} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-3 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#111] p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-white dark:fill-black"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></div>
        <div><p className="text-[11px] font-black uppercase tracking-widest text-black dark:text-white">Post on X</p>{id && <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{au ? `@${au}` : `ID: ${id}`}</p>}</div>
      </div>
      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
      <div className="flex items-center justify-between"><p className="text-[12px] font-serif italic text-neutral-500">Klik untuk lihat di X ↗</p><span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black">View Post</span></div>
    </a>
  );

  if (!id) return <div className={`w-full max-w-[550px] ${ac}`}><_Seo /><_Fb /></div>;
  if (st === 1) return <div className={`w-full max-w-[550px] ${ac}`}><_Seo /><div ref={cRef} suppressHydrationWarning /></div>;
  if (st === 2 && td) return <div className={`w-full max-w-[550px] ${ac}`}><_Seo /><_Card tweet={td} tweetUrl={cu} /></div>;
  if (st === 3) return <div className={`w-full max-w-[550px] ${ac}`}><_Seo /><_Fb /></div>;

  return (
    <div className={`w-full max-w-[550px] ${ac} relative`}><_Seo />
      <div className="rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111] p-5 space-y-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
            <div className="h-2.5 bg-neutral-100 dark:bg-neutral-900 rounded w-1/4" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-neutral-100 dark:bg-neutral-900 rounded w-full" />
          <div className="h-3 bg-neutral-100 dark:bg-neutral-900 rounded w-4/5" />
        </div>
        <div className="h-40 bg-neutral-100 dark:bg-neutral-900 rounded-xl" />
        <p className="text-[9px] text-center text-neutral-400 uppercase tracking-widest">Memuat tweet...</p>
      </div>
      <div ref={cRef} className="opacity-0 h-0 overflow-hidden" suppressHydrationWarning />
    </div>
  );
}