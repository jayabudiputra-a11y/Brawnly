import React, { useState as _s, useMemo as _m, useEffect as _e } from 'react';
import { getOptimizedImage as _gOI } from '@/lib/utils';
import { useSaveData as _uSD } from '@/hooks/useSaveData';
import { setCookieHash, mirrorQuery } from '@/lib/enterpriseStorage';
import { detectBestFormat } from '@/lib/imageFormat';
import { saveAssetToShared, getAssetFromShared } from '@/lib/sharedStorage';

type _IF = "webp" | "avif";

const _SU  = "https://www.brawnly.online";
const _SN  = "Brawnly";
const _AN  = "Budi Putra Jaya";
const _OL  = "https://creativecommons.org/licenses/by/4.0/";
const _OC  = `© 2026 ${_AN}. All rights reserved.`;
const _OAU = `${_SU}/license`;

const _SP: Record<string,{license:string;copyright:string;acquireUrl:string;creatorName:string;creatorType:"Person"|"Organization";creatorUrl:string}> = {
  instagram: {license:"https://www.instagram.com/legal/terms/",copyright:"© Instagram / Meta Platforms, Inc. All rights reserved.",acquireUrl:"https://www.instagram.com/legal/terms/",creatorName:"Instagram / Meta Platforms, Inc.",creatorType:"Organization",creatorUrl:"https://www.instagram.com"},
  tiktok:    {license:"https://www.tiktok.com/legal/page/us/terms-of-service/en",copyright:"© TikTok / ByteDance Ltd. All rights reserved.",acquireUrl:"https://www.tiktok.com/legal/page/us/terms-of-service/en",creatorName:"TikTok / ByteDance Ltd.",creatorType:"Organization",creatorUrl:"https://www.tiktok.com"},
  tumblr:    {license:"https://www.tumblr.com/policy/en/terms-of-service",copyright:"© Tumblr / Automattic Inc. / respective content creators. All rights reserved.",acquireUrl:"https://www.tumblr.com/policy/en/terms-of-service",creatorName:"Tumblr / respective content creators",creatorType:"Organization",creatorUrl:"https://www.tumblr.com"},
  twitter:   {license:"https://twitter.com/en/tos",copyright:"© X Corp. / respective tweet authors. All rights reserved.",acquireUrl:"https://twitter.com/en/tos",creatorName:"X Corp. / respective tweet authors",creatorType:"Organization",creatorUrl:"https://twitter.com"},
  pinterest: {license:"https://policy.pinterest.com/en/terms-of-service",copyright:"© Pinterest, Inc. / respective pin owners. All rights reserved.",acquireUrl:"https://policy.pinterest.com/en/terms-of-service",creatorName:"Pinterest / respective content creators",creatorType:"Organization",creatorUrl:"https://www.pinterest.com"},
  google:    {license:"https://policies.google.com/terms",copyright:"© Google LLC. All rights reserved.",acquireUrl:"https://policies.google.com/terms",creatorName:"Google LLC",creatorType:"Organization",creatorUrl:"https://www.google.com"},
  flickr:    {license:"https://www.flickr.com/creativecommons/",copyright:"© Respective photographers on Flickr. License varies per image.",acquireUrl:"https://www.flickr.com/help/terms",creatorName:"Respective photographers on Flickr",creatorType:"Person",creatorUrl:"https://www.flickr.com"},
  youtube:   {license:"https://www.youtube.com/t/terms",copyright:"© YouTube / Google LLC / respective content creators. All rights reserved.",acquireUrl:"https://www.youtube.com/t/terms",creatorName:"YouTube / respective content creators",creatorType:"Organization",creatorUrl:"https://www.youtube.com"},
  cloudinary:{license:_OL,copyright:_OC,acquireUrl:_OAU,creatorName:_AN,creatorType:"Person",creatorUrl:_SU},
};

type _TPr = typeof _SP[keyof typeof _SP];

function _dIS(url: string): _TPr {
  const u = (url || "").toLowerCase();
  if (u.includes("instagram.com")||u.includes("cdninstagram.com")||u.includes("fbcdn.net")) return _SP.instagram;
  if (u.includes("tiktok.com")||u.includes("tiktokcdn.com")||u.includes("musical.ly")) return _SP.tiktok;
  if (u.includes("tumblr.com")||u.includes("tumblr.co")) return _SP.tumblr;
  if (u.includes("twitter.com")||u.includes("twimg.com")||u.includes("x.com")) return _SP.twitter;
  if (u.includes("pinterest.com")||u.includes("pinimg.com")) return _SP.pinterest;
  if (u.includes("googleusercontent.com")||u.includes("ggpht.com")||u.includes("gstatic.com")) return _SP.google;
  if (u.includes("flickr.com")||u.includes("staticflickr.com")||u.includes("live.staticflickr.com")) return _SP.flickr;
  if (u.includes("youtube.com")||u.includes("ytimg.com")||u.includes("youtu.be")) return _SP.youtube;
  if (u.includes("cloudinary.com")||u.includes("res.cloudinary.com")||u.includes("brawnly.online")) return _SP.cloudinary;
  return {license:_OL,copyright:_OC,acquireUrl:_OAU,creatorName:_AN,creatorType:"Person",creatorUrl:_SU};
}

function _vUM(url: string|null|undefined): string|null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!u.hostname || u.hostname.length < 4) return null;
    return url;
  } catch { return null; }
}

interface ArticleCoverImageProps {
  imageUrl?: string | null;
  title: string;
  slug: string;
  className?: string;
}

const ArticleCoverImage: React.FC<ArticleCoverImageProps> = ({
  imageUrl: _u,
  title: _t,
  slug: _sl,
  className: _cN = ""
}) => {
  const { isEnabled: _iE, saveData: _sD } = _uSD();
  const [_iL, _siL] = _s(false);
  const [_oW, _sOW] = _s<string | null>(null);

  const _mQ = async () => {
    try { return await navigator.storage?.estimate?.(); } catch { return null; }
  };

  const _sUrl = _m(() => {
    if (!_u || typeof _u !== 'string') return null;
    return _u.split(/[\r\n]+/)[0].trim();
  }, [_u]);

  const _isGif = _m(() => {
    if (!_sUrl) return false;
    const p = _sUrl.toLowerCase();
    return p.endsWith('.gif') || p.endsWith('.gifv') || p.includes('tumblr.com') || p.includes('giphy.com');
  }, [_sUrl]);

  const _cp = _m(() => _sUrl ? _dIS(_sUrl) : null, [_sUrl]);
  const _metaUrl = _m(() => _vUM(_sUrl), [_sUrl]);

  const _tOpt = async (_src: string) => {
    try {
      const _isTrusted = _src.includes('cloudinary.com') || _src.includes('localhost') || _src.includes('supabase.co');
      if (!_isTrusted || _isGif) return _src;
      const cached = await getAssetFromShared(`cover_${_sl}`);
      if (cached) return URL.createObjectURL(cached);
      const r = await fetch(_src, { mode: "cors" });
      const b = await r.blob();
      let finalBlob = b;
      if (b.type !== "image/gif" && window.Worker) {
        try {
          const _fmtStr = await detectBestFormat();
          const _fmt = (_fmtStr.toLowerCase() === "avif" ? "avif" : "webp") as _IF;
          const _quality = _iE ? 0.4 : 0.75;
          finalBlob = await new Promise<Blob>((resolve, reject) => {
            const worker = new Worker(new URL('@/wasm/imageWorker.ts', import.meta.url), { type: 'module' });
            worker.onmessage = (e) => { const { error, result } = e.data; worker.terminate(); if (error) reject(new Error(error)); else resolve(result); };
            worker.onerror  = (err) => { worker.terminate(); reject(err); };
            worker.postMessage({ id: `cover_${_sl}`, blob: b, format: _fmt, quality: _quality });
          });
          if (finalBlob) await saveAssetToShared(`cover_${_sl}`, finalBlob);
        } catch {}
      }
      return URL.createObjectURL(finalBlob);
    } catch { return _src; }
  };

  _e(() => {
    if (!_sUrl) return;
    (async () => {
      const k = `brawnly_cover_${_sl}`;
      const payload = JSON.stringify({ t: _t, s: _sl, u: _sUrl, ts: Date.now() });
      try {
        const est = await _mQ();
        if (est?.quota && est?.usage && est.usage > est.quota * 0.25) {
          Object.keys(localStorage).filter(key => key.startsWith("brawnly_cover_")).slice(0, 3).forEach(key => localStorage.removeItem(key));
        }
        localStorage.setItem(k, payload);
        await setCookieHash(`cover_${_sl}`);
        mirrorQuery({ type: 'COVER_VIEW', slug: _sl, ts: Date.now() });
      } catch {}
    })();
  }, [_sUrl, _sl, _t]);

  _e(() => {
    if (!_sUrl) return;
    let _activeBlob: string | null = null;
    (async () => {
      const _srcForBlob = _isGif ? _sUrl : _gOI(_sUrl, 1200);
      const u = await _tOpt(_srcForBlob);
      _activeBlob = u;
      _sOW(u);
    })();
    return () => { if (_activeBlob && _activeBlob.startsWith("blob:")) URL.revokeObjectURL(_activeBlob); };
  }, [_sUrl, _isGif, _iE]);

  if (!_sUrl) return null;

  const _iLQM = _iE && _sD.quality === 'low';
  const _tWidth = _iLQM ? 480 : 900;
  const _dU = _isGif ? _sUrl : _gOI(_sUrl, _tWidth);
  const _fU = _oW || _dU;
  const _mU = _metaUrl || _sUrl;

  const _ldIO = {
    "@context":"https://schema.org","@type":"ImageObject",
    "url":_mU,"contentUrl":_mU,
    "name":_t?`${_t} — Cover Image`:`Cover image — ${_sl}`,
    "description":_t?`Featured cover image for the article: ${_t}`:`Cover image for Brawnly article: ${_sl.replace(/-/g,' ')}`,
    "caption":_t||_sl.replace(/-/g,' '),"representativeOfPage":true,
    "encodingFormat":_isGif?"image/gif":"image/jpeg","width":_tWidth,
    "license":_cp?.license,
    "creator":_cp?{"@type":_cp.creatorType,"name":_cp.creatorName,"url":_cp.creatorUrl}:undefined,
    "copyrightNotice":_cp?.copyright,"acquireLicensePage":_cp?.acquireUrl,"creditText":_cp?.creatorName,
    "associatedArticle":{"@type":"Article","url":`${_SU}/article/${_sl}`,"headline":_t||_sl.replace(/-/g,' '),"name":_t||_sl.replace(/-/g,' ')},
    "publisher":{"@type":"Organization","name":_SN,"url":_SU,"logo":{"@type":"ImageObject","url":`${_SU}/masculineLogo.svg`,"contentUrl":`${_SU}/masculineLogo.svg`,"name":`${_SN} logo`,"license":_OL,"creator":{"@type":"Person","name":_AN,"url":_SU},"copyrightNotice":_OC,"acquireLicensePage":_OAU}},
  };

  const _ldWP = {
    "@context":"https://schema.org","@type":"WebPage",
    "@id":`${_SU}/article/${_sl}`,"url":`${_SU}/article/${_sl}`,"name":_t||_sl.replace(/-/g,' '),
    "primaryImageOfPage":{"@type":"ImageObject","url":_mU,"contentUrl":_mU,"name":_t?`${_t} — Cover Image`:`Cover image — ${_sl}`,"representativeOfPage":true,"license":_cp?.license,"creator":_cp?{"@type":_cp.creatorType,"name":_cp.creatorName,"url":_cp.creatorUrl}:undefined,"copyrightNotice":_cp?.copyright,"acquireLicensePage":_cp?.acquireUrl,"creditText":_cp?.creatorName},
    "image":{"@type":"ImageObject","url":_mU,"contentUrl":_mU},
  };

  return (
    <div className={`w-full mb-6 ${_cN}`} itemScope itemType="https://schema.org/ImageObject">
      <script type="application/ld+json">{JSON.stringify(_ldIO)}</script>
      <script type="application/ld+json">{JSON.stringify(_ldWP)}</script>

      <meta itemProp="url"                  content={_mU} />
      <meta itemProp="contentUrl"           content={_mU} />
      <meta itemProp="name"                 content={_t?`${_t} — Cover Image`:`Cover image — ${_sl}`} />
      <meta itemProp="description"          content={_t?`Featured cover image for the article: ${_t}`:`Cover image for Brawnly article: ${_sl.replace(/-/g,' ')}`} />
      <meta itemProp="representativeOfPage" content="true" />
      <meta itemProp="encodingFormat"       content={_isGif?"image/gif":"image/jpeg"} />
      <meta itemProp="caption"              content={_t||_sl.replace(/-/g,' ')} />
      {_cp && <>
        <meta itemProp="license"            content={_cp.license} />
        <meta itemProp="copyrightNotice"    content={_cp.copyright} />
        <meta itemProp="acquireLicensePage" content={_cp.acquireUrl} />
        <meta itemProp="creditText"         content={_cp.creatorName} />
        <span itemScope itemType={`https://schema.org/${_cp.creatorType}`} itemProp="creator" style={{display:"none"}}>
          <meta itemProp="name" content={_cp.creatorName} />
          <meta itemProp="url"  content={_cp.creatorUrl} />
        </span>
      </>}

      <div aria-hidden="true" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)",whiteSpace:"nowrap"}}>
        <figure itemScope itemType="https://schema.org/ImageObject">
          <img src={_sUrl} alt={_t?`${_t} — Cover Image`:`Cover image — ${_sl}`} itemProp="url" tabIndex={-1} />
          <meta itemProp="contentUrl"          content={_mU} />
          <meta itemProp="name"                content={_t?`${_t} — Cover Image`:`Cover image — ${_sl}`} />
          <meta itemProp="description"         content={_t?`Featured cover image for the article: ${_t}`:`Cover image for Brawnly article: ${_sl.replace(/-/g,' ')}`} />
          <meta itemProp="representativeOfPage" content="true" />
          <meta itemProp="encodingFormat"      content={_isGif?"image/gif":"image/jpeg"} />
          <meta itemProp="caption"             content={_t||_sl.replace(/-/g,' ')} />
          {_cp && <>
            <meta itemProp="license"            content={_cp.license} />
            <meta itemProp="copyrightNotice"    content={_cp.copyright} />
            <meta itemProp="acquireLicensePage" content={_cp.acquireUrl} />
            <meta itemProp="creditText"         content={_cp.creatorName} />
            <span itemScope itemType={`https://schema.org/${_cp.creatorType}`} itemProp="creator">
              <meta itemProp="name" content={_cp.creatorName} />
              <meta itemProp="url"  content={_cp.creatorUrl} />
            </span>
          </>}
          <figcaption itemProp="caption">{_t||_sl.replace(/-/g,' ')}{_isGif?" (animated)":""}</figcaption>
        </figure>

        <span itemScope itemType="https://schema.org/Article">
          <a href={`${_SU}/article/${_sl}`} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_t||_sl.replace(/-/g,' ')}</a>
          <span itemProp="headline" content={_t||_sl.replace(/-/g,' ')} />
          <meta itemProp="image" content={_mU} />
        </span>

        <span itemScope itemType="https://schema.org/Organization">
          <a href={_SU} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_SN}</a>
          <span itemProp="name" content={_SN} />
        </span>

        <link rel="isPartOf" href={`${_SU}/article/${_sl}`} />

        <span itemScope itemType="https://schema.org/ImageObject">
          <meta itemProp="url"   content={_gOI(_sUrl, 1200)} />
          <meta itemProp="width" content="1200" />
          <meta itemProp="name"  content={_t?`${_t} — Cover (1200w)`:`Cover image 1200w — ${_sl}`} />
          <meta itemProp="representativeOfPage" content="true" />
          {_cp && <>
            <meta itemProp="license"            content={_cp.license} />
            <meta itemProp="copyrightNotice"    content={_cp.copyright} />
            <meta itemProp="acquireLicensePage" content={_cp.acquireUrl} />
            <meta itemProp="creditText"         content={_cp.creatorName} />
          </>}
        </span>
      </div>

      <div className="p-[4px] bg-gradient-to-r from-[#ff0099] via-[#00ffff] to-[#ccff00] rounded-sm shadow-[6px_6px_0px_0px_#aa00ff] dark:shadow-[6px_6px_0px_0px_#00ffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#aa00ff] transition-all duration-200">
        <div className="bg-white dark:bg-[#1a0b2e] p-[2px]">
          <a
            href={_sUrl}
            className="block w-full h-full cursor-zoom-in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={_t?`View full cover image for: ${_t}${_isGif?" (animated GIF)":""}`:`View cover image for article: ${_sl.replace(/-/g,' ')}${_isGif?" (animated GIF)":""}`}
            itemProp="url"
          >
            <div className={`${_isGif?'aspect-auto min-h-[200px]':'aspect-[16/9]'} bg-[#f0f0f0] dark:bg-[#2a1b3d] overflow-hidden relative ${_iL?'':'animate-pulse'}`}>
              <img
                src={_fU}
                alt={_t?`${_t}${_isGif?" — animated cover":" — cover image"}`:`Cover image — ${_sl.replace(/-/g,' ')}${_isGif?" (animated)":""}`}
                className={`w-full h-full transition-opacity duration-700 ${_isGif?'object-contain':'object-cover'} ${_iL?'opacity-100':'opacity-0'}`}
                loading="eager"
                crossOrigin="anonymous"
                onLoad={() => _siL(true)}
                onError={(e) => { _siL(true); if (_fU.startsWith("blob:")) e.currentTarget.src = _dU; }}
                itemProp="contentUrl"
                {...({ fetchpriority: "high" } as any)}
              />
            </div>
          </a>
        </div>
      </div>

      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#ff0099] dark:text-[#00ffff] font-black text-center drop-shadow-sm italic" itemProp="caption">
        Brawnly Visual Asset — {_sl.replace(/-/g,' ')}
      </p>

      <span className="sr-only" role="img" aria-label={_t||_sl.replace(/-/g,' ')}>
        {_t?`${_t} — featured cover image${_isGif?" (animated)":""}`:` Cover image for article: ${_sl.replace(/-/g,' ')}${_isGif?" (animated)":""}`}
      </span>
    </div>
  );
};

export default ArticleCoverImage;