import React, { useState as _s, useEffect as _e, useMemo as _uM } from "react";
import { Link as _L, useParams as _uP, useNavigate as _uN } from "react-router-dom";
import { Helmet as _Hm } from "react-helmet-async";
import { Eye as _Ey, Bookmark as _Bm, Hexagon as _Hx, Check as _Ck, WifiOff as _Wo, Share2 as _Sh, ArrowLeft as _Al, Send as _Sd, MessageSquare as _Ms, Loader2 as _L2, User as _Us, Reply as _Rp, CornerDownRight as _Cr, X as _X } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import FormattedDate from "@/components/features/FormattedDate";
import _mA from "@/assets/myAvatar.jpg";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import ArticleImageGallery from "@/components/features/ArticleImageGallery";
import ArticleCoverImage from "@/components/features/ArticleCoverImage";

import { useArticleData as _uAD } from "@/hooks/useArticleData";
import { useArticleViews as _uAV } from "@/hooks/useArticleViews";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useArticles as _uAs } from "@/hooks/useArticles";
import { useThemePreference as _uTP } from '@/hooks/useThemePreference';
import { useAuth } from "@/hooks/useAuth";
import { supabase, CLOUDINARY_CONFIG as _CC } from "@/lib/supabase";
import { commentsApi } from "@/lib/api";

import { wasmTranscodeImage as _wTI, wasmCreatePlaceholder as _wCP } from "@/lib/wasmImagePipeline";
import { wasmVideoToThumbnail as _wVT } from "@/lib/wasmVideoPipeline";
import { detectBestFormat as _dBF } from "@/lib/imageFormat";
import { mirrorQuery as _mQ, setCookieHash as _sCH } from "@/lib/enterpriseStorage";
import { trackPageView as _tPV } from "@/lib/trackViews";

import type { CommentWithUser as _Cu } from "@/types";

const _QK = "brawnly_sync_queue";
function _pushQ(job: any) {
  try {
    const q = JSON.parse(localStorage.getItem(_QK) || "[]");
    q.push(job);
    localStorage.setItem(_QK, JSON.stringify(q));
  } catch {}
}

function CommentItem({ comment, avatar, onReply, isReply = false }: { comment: _Cu, avatar: string | null, onReply?: () => void, isReply?: boolean }) {
  return (
    <div className="flex gap-4 md:gap-6 relative">
      {isReply && <_Cr className="absolute -left-10 top-2 text-neutral-300 dark:text-neutral-800" size={20} />}
      <div className="flex-shrink-0">
        <div className={`${isReply ? 'w-10 h-10' : 'w-14 h-14'} border-2 border-black dark:border-white overflow-hidden bg-neutral-100`}>
          {avatar ? (
            <img src={avatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400"><_Us size={isReply ? 16 : 24} /></div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-2">
          <h4 className={`font-black uppercase italic ${isReply ? 'text-[11px]' : 'text-[13px]'} flex items-center gap-2`}>
            {comment.user_name}
            {comment.id.toString().startsWith('temp-') && <span className="text-[9px] not-italic text-red-600 animate-pulse">SYNCING...</span>}
          </h4>
          <span className="text-[10px] font-bold opacity-40 uppercase"><FormattedDate dateString={comment.created_at} /></span>
        </div>
        <div className={`${isReply ? 'text-[15px]' : 'text-[18px]'} leading-relaxed font-serif text-neutral-800 dark:text-neutral-200 break-words mb-3`}>
          {comment.content}
        </div>
        {!isReply && onReply && (
          <button onClick={onReply} className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-emerald-600 hover:text-emerald-400 transition-colors">
            <_Rp size={12} /> Reply
          </button>
        )}
      </div>
    </div>
  );
}

function CommentSection({ articleId }: { articleId: string }) {
  const { user: _u } = useAuth();
  const _nav = _uN();
  const _qC = useQueryClient();
  const [_txt, _sTxt] = _s<string>("");
  const [_sub, _sSub] = _s<boolean>(false);
  const [_replyTo, _sReplyTo] = _s<string | null>(null);
  const [_localComments, _setLocalComments] = _s<_Cu[]>([]);
  const [_blobCache, _sBlobCache] = _s<Record<string, string>>({});

  const _hydrateAvatar = async (url: string | null | undefined, userId: string) => {
    if (!url || url.startsWith("blob:") || _blobCache[userId]) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      _sBlobCache(prev => ({ ...prev, [userId]: blobUrl }));
    } catch (e) {}
  };

  const { data: _serverComments } = useQuery({
    queryKey: ["comments", articleId],
    queryFn: () => commentsApi.getCommentsByArticle(articleId),
    enabled: !!articleId,
    staleTime: 1000 * 30,
  });

  _e(() => {
    if (_serverComments) {
      _setLocalComments(_serverComments);
      _serverComments.forEach(c => {
        if (c.user_avatar_url) _hydrateAvatar(c.user_avatar_url, c.user_id);
      });
    }
  }, [_serverComments]);

  _e(() => {
    if (_u?.user_metadata?.avatar_url) _hydrateAvatar(_u.user_metadata.avatar_url, "me");
  }, [_u]);

  const _onAddComment = async (content: string, parentId: string | null = null) => {
    if (!content.trim() || !_u) return;
    const _cleanContent = content.trim();
    const _optimisticAvatar = _blobCache["me"] || _u.user_metadata?.avatar_url || null;
    const _newComment: _Cu = {
      id: `temp-${Date.now()}`,
      article_id: articleId,
      content: _cleanContent,
      created_at: new Date().toISOString(),
      user_id: _u.id,
      user_name: _u.user_metadata?.full_name || "Member",
      user_avatar_url: _optimisticAvatar,
      parent_id: parentId
    };
    _setLocalComments(prev => [...prev, _newComment]);
    _sTxt("");
    _sReplyTo(null);
    try {
      const { data, error } = await supabase.from('comments').insert({
        content: _cleanContent,
        article_id: articleId,
        user_id: _u.id,
        parent_id: parentId
      }).select('*, profiles(username, avatar_url)').single();
      if (error) throw error;
      await _qC.invalidateQueries({ queryKey: ["comments", articleId] });
    } catch (e) {
      _setLocalComments(prev => prev.filter(c => c.id !== _newComment.id));
    }
  };

  const _hS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (_sub || !_txt.trim()) return;
    _sSub(true);
    await _onAddComment(_txt, _replyTo);
    _sSub(false);
  };

  const _getRenderAvatar = (url: string | null | undefined, uid: string) => {
    if (!url) return null;
    return _blobCache[uid] || url;
  };

  const _rootComments = _uM(() => _localComments.filter(c => !c.parent_id), [_localComments]);
  const _replies = _uM(() => _localComments.filter(c => c.parent_id), [_localComments]);

  return (
    <section className="max-w-[840px] mx-auto py-16 border-t-2 border-neutral-100 dark:border-neutral-900">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-red-600 text-white rounded-full"><_Ms size={20} /></div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Discussion ({_localComments.length})</h3>
      </div>
      {_u ? (
        <form onSubmit={_hS} className="mb-16">
          <div className="relative overflow-hidden border-2 border-black dark:border-white rounded-xl">
            {_replyTo && (
              <div className="bg-emerald-500 text-black px-4 py-2 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <_Rp size={12} /> Replying to node_id: {_replyTo.slice(0, 8)}
                </span>
                <button type="button" onClick={() => _sReplyTo(null)}><_X size={14} /></button>
              </div>
            )}
            <textarea
              value={_txt}
              onChange={(e) => _sTxt(e.target.value)}
              placeholder={_replyTo ? "Transmitting reply..." : "Write your perspective..."}
              className="w-full bg-neutral-50 dark:bg-neutral-900 p-6 font-serif text-lg min-h-[140px] focus:outline-none resize-none"
            />
            <div className="flex justify-between items-center p-4 bg-white dark:bg-black border-t-2 border-black dark:border-white">
              <span className="text-[10px] font-black uppercase opacity-50 tracking-widest">
                Posting as {_u.user_metadata?.full_name || "Member"}
              </span>
              <button type="submit" disabled={_sub || !_txt.trim()} className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:invert transition-all disabled:opacity-30">
                {_sub ? <_L2 className="animate-spin" size={14} /> : <_Sd size={14} />} Post
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-10 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center mb-16">
          <button onClick={() => _nav('/signin')} className="px-10 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">Sign In to Comment & reply to my viewers</button>
        </div>
      )}
      <div className="space-y-12">
        <_AP mode="popLayout">
          {_rootComments.map((_c) => (
            <_m.div key={_c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group">
              <CommentItem
                comment={_c}
                avatar={_getRenderAvatar(_c.user_avatar_url, _c.user_id)}
                onReply={() => { _sReplyTo(_c.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
              <div className="ml-10 md:ml-16 mt-6 space-y-6 border-l-2 border-neutral-100 dark:border-neutral-900 pl-6">
                {_replies.filter(r => r.parent_id === _c.id).map(r => (
                  <CommentItem
                    key={r.id}
                    comment={r}
                    isReply
                    avatar={_getRenderAvatar(r.user_avatar_url, r.user_id)}
                  />
                ))}
              </div>
            </_m.div>
          ))}
        </_AP>
      </div>
    </section>
  );
}

const _manageCacheMemory = () => {
  try {
    let _tS = 0;
    const _aK: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const _k = localStorage.key(i);
      if (_k && _k.startsWith("brawnly_article_")) {
        const _v = localStorage.getItem(_k);
        if (_v) { _tS += _v.length * 2; _aK.push(_k); }
      }
    }
    if (_tS > 1250000) {
      const _rM = _aK.slice(0, Math.ceil(_aK.length * 0.3));
      _rM.forEach(_k => localStorage.removeItem(_k));
    }
  } catch {}
};

export default function ArticleDetail() {
  const { isDark: _iD } = _uTP();
  const { slug: _sl } = _uP<{ slug: string }>();
  const _slV = _sl ?? "unknown";
  const [_blobUrl, _setBlobUrl] = _s<string | null>(null);
  const [_blurUrl, _setBlurUrl] = _s<string | null>(null);
  const [_isOff, _sOff] = _s(!navigator.onLine);
  const [_iS, _siS] = _s(() => localStorage.getItem(`brawnly_saved_${_slV}`) === "true");
  const [_nt, _sNt] = _s<{ show: boolean; msg: string; type: 'success' | 'info' }>({ show: false, msg: "", type: 'info' });
  const [_hasTracked, _sHasTracked] = _s(false);

  const _fC = (_u: string) => {
    if (!_u) return "";
    if (_u.startsWith("http")) return _u;
    return `${_CC.baseUrl}/${_u}`;
  };

  const _cachedArt = _uM(() => {
    try {
      const _k = `brawnly_article_${_slV}`;
      const _sP = localStorage.getItem(_k);
      if (!_sP) return null;
      const _parsed = JSON.parse(_sP);
      if (!_parsed.article || !_parsed.processedData) return null;
      const _cov = _parsed.processedData.coverImage;
      if (typeof _cov === 'string' && _cov.startsWith('blob:')) {
        const _remoteUrl = _parsed.article.featured_image;
        _parsed.processedData.coverImage = _remoteUrl;
        localStorage.setItem(_k, JSON.stringify(_parsed));
      }
      return _parsed;
    } catch (e) { return null; }
  }, [_slV]);

  const { processedData: _pD_raw, isLoading: _iL, article: _art_raw } = _uAD();
  const _pD = _pD_raw || _cachedArt?.processedData;
  const _art = _art_raw || _cachedArt?.article;

  const _rawImgSource = _uM(() => {
    const _img = _art?.featured_image?.split(/[\r\n]+/)[0];
    if (_img && _img.startsWith('blob:')) return null;
    return _img ? _fC(_img) : null;
  }, [_art?.featured_image]);

  _e(() => {
    if (!_rawImgSource || _rawImgSource.startsWith('blob:') || !navigator.onLine) return;
    let _active = true;
    (async () => {
      try {
        const res = await fetch(_rawImgSource);
        const b = await res.blob();
        const placeholder = await _wCP(b);
        if (_active) _setBlurUrl(placeholder);
        const _fmt = await _dBF();
        const _isVid = _rawImgSource.match(/\.(mp4|webm|ogg|mov)$/i);
        let final;
        if (_isVid) {
          final = URL.createObjectURL(await _wVT(b, 0.25));
        } else if (b.type === "image/gif" || _rawImgSource.toLowerCase().endsWith('.gif')) {
          final = _rawImgSource;
        } else {
          const opt = await _wTI(b, _fmt, 0.75);
          final = URL.createObjectURL(opt);
        }
        if (_active) {
          if (_blobUrl && _blobUrl.startsWith('blob:')) URL.revokeObjectURL(_blobUrl);
          _setBlobUrl(final);
        }
      } catch (e) {
        if (_active) _setBlobUrl(_rawImgSource);
      }
    })();
    return () => { _active = false; };
  }, [_rawImgSource]);

  _e(() => {
    _sCH(_slV);
    const _on = () => _sOff(false);
    const _off = () => _sOff(true);
    window.addEventListener('online', _on);
    window.addEventListener('offline', _off);
    return () => {
      window.removeEventListener('online', _on);
      window.removeEventListener('offline', _off);
    };
  }, [_slV]);

  _e(() => {
    if (_pD_raw && _art_raw) {
      _manageCacheMemory();
      const _cleanPD = { ..._pD_raw };
      if (typeof _cleanPD.coverImage === 'string' && _cleanPD.coverImage.startsWith('blob:')) {
        _cleanPD.coverImage = _art_raw.featured_image;
      }
      const _payload = JSON.stringify({ processedData: _cleanPD, article: _art_raw });
      localStorage.setItem(`brawnly_article_${_slV}`, _payload);
      import("@/lib/enterpriseStorage").then(m => {
        m.saveArticlesSnap([{ title: _pD_raw.title, slug: _slV, image: _art_raw.featured_image }]);
      });
    }
  }, [_pD_raw, _art_raw, _slV]);

  _e(() => {
    if (_art?.id && !_hasTracked) {
      _tPV(_art.id);
      _sHasTracked(true);
      if (!navigator.onLine) {
        _mQ({ type: "OFFLINE_VIEW_QUEUED", id: _art.id, slug: _slV });
        _sNt({ show: true, msg: "OFFLINE VIEW QUEUED", type: 'info' });
        setTimeout(() => _sNt(p => ({ ...p, show: false })), 2000);
      }
    }
  }, [_art?.id, _hasTracked]);

  const { data: _allA } = _uAs();
  const _hC = _uM(() => _allA ? [..._allA].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3) : [], [_allA]);

  const _trN = (m: string, t: 'success' | 'info' = 'info') => {
    _sNt({ show: true, msg: m, type: t });
    setTimeout(() => _sNt(p => ({ ...p, show: false })), 3500);
  };

  const _hSv = () => {
    const _nS = !_iS;
    _siS(_nS);
    _mQ({ action: _nS ? "SAVE" : "UNSAVE", slug: _slV, ts: Date.now() });
    if (_nS) {
      localStorage.setItem(`brawnly_saved_${_slV}`, "true");
      _trN("SAVED TO COLLECTION", 'success');
    } else {
      localStorage.removeItem(`brawnly_saved_${_slV}`);
      _trN("REMOVED FROM COLLECTION", 'info');
    }
  };

  const _hCL = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      _mQ({ action: "SHARE_LINK", slug: _slV });
      _trN("PERMALINK COPIED", 'success');
    } catch { _trN("FAILED", 'info'); }
  };

  const { viewCount: _realtimeViews } = _uAV({ id: _art?.id ?? "", slug: _slV, initialViews: _art?.views ?? 0 });

  const _displayViews = _uM(() => {
    if (_realtimeViews > 0 && navigator.onLine) return _realtimeViews;
    const _baseViews = _art?.views || 0;
    return navigator.onLine ? _baseViews : _baseViews + 1;
  }, [_realtimeViews, _art?.views, _isOff]);

  if (_iL && !_pD) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="w-20 h-[3px] bg-red-600 animate-pulse" />
    </div>
  );

  if (!_pD || !_art) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] px-6 text-center">
      <h1 className="text-[180px] font-black opacity-10 italic leading-none">404</h1>
      <_L to="/" className="px-12 py-5 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[11px] tracking-widest hover:invert transition-all">Back</_L>
    </div>
  );

  const _imgL = (_art.featured_image || "").split(/[\r\n]+/).map((s: string) => s.trim()).filter(Boolean);
  let _safeCover = _blobUrl || _blurUrl || _rawImgSource;
  if (_safeCover && _safeCover.startsWith('blob:') && _safeCover !== _blobUrl) {
    _safeCover = _rawImgSource;
  }
  const _isGif = _rawImgSource?.toLowerCase().endsWith('.gif');
  const _isVid = _rawImgSource?.match(/\.(mp4|webm|ogg|mov)$/i);

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500 relative">
      <_Hm>
        <title>{_pD.title} | Brawnly</title>
        <meta property="og:image" content={_gOI(_rawImgSource || "", 1200)} />
      </_Hm>
      <_AP>
        {_nt.show && (
          <_m.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className={`fixed top-10 right-10 z-[100] px-6 py-4 font-black uppercase text-[10px] tracking-widest shadow-2xl border-l-8 ${_nt.type === 'success' ? 'bg-emerald-500 text-black border-black' : 'bg-black text-white border-red-600'}`}
          >
            {_nt.msg}
          </_m.div>
        )}
      </_AP>
      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-4">
        <button onClick={_hSv} className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-500 border-2 ${_iS ? 'bg-emerald-500 border-black text-black scale-110' : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'}`}>
          {_iS ? <_Ck size={20} /> : <_Bm size={20} />}
        </button>
        <button onClick={_hCL} className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-800 hover:border-red-600 transition-all duration-500">
          <_Sh size={20} />
        </button>
      </aside>
      <div className="max-w-[1320px] mx-auto px-5 md:px-10">
        <header className="pt-16 pb-10 border-b-[12px] border-black dark:border-white mb-10 relative">
          <div className="flex justify-between items-start">
            <_L to="/" className="text-red-700 font-black uppercase text-[13px] tracking-[0.3em] mb-5 flex items-center gap-2 hover:gap-4 transition-all italic">
              <_Al size={14} /> Brawnly Exclusive
            </_L>
            {_isOff && <span className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse border border-red-500 px-3 py-1 rounded-full"><_Wo size={12} /> OFFLINE MODE</span>}
          </div>
          <h1 className="text-[45px] md:text-[92px] leading-[0.82] font-black uppercase tracking-tighter mb-10 italic break-words">{_pD.title}</h1>
          <div className="flex flex-col md:flex-row md:items-end justify-between py-8 border-t-2 border-black dark:border-white gap-6">
            <div className="flex items-center gap-5">
              <img src={_gOI(_mA, 120)} className="w-14 h-14 object-cover border-2 border-black grayscale" alt="B" />
              <div>
                <span className="block text-[15px] font-black uppercase italic">By {_art.author || "Brawnly"}</span>
                <span className="text-[12px] uppercase opacity-80"><FormattedDate dateString={_art.published_at} formatString="MMMM d, yyyy" /></span>
              </div>
            </div>
            <div className="text-2xl font-black italic flex items-center gap-3">
              {_displayViews.toLocaleString()} <_Ey size={20} className="text-red-600" />
            </div>
          </div>
        </header>
        <div className="flex flex-col lg:flex-row gap-16">
          <article className="flex-1 relative min-w-0">
            <p className="text-[24px] md:text-[32px] leading-[1.1] font-extrabold mb-14 tracking-tight">{_pD.excerpt}</p>
            <div className="mb-16 relative overflow-hidden group">
              {_isVid ? (
                <div className="w-full aspect-video md:aspect-[16/9] lg:aspect-[21/9] bg-black border-4 border-black">
                  <video src={_rawImgSource || ""} poster={_blurUrl || ""} controls className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`relative transition-all duration-700 ${_blobUrl ? 'blur-0 scale-100' : 'blur-xl scale-105'}`}>
                  <ArticleCoverImage
                    imageUrl={_safeCover || ""}
                    title={_pD.title}
                    slug={_slV}
                    className={_isGif ? "w-full h-auto object-contain" : "w-full aspect-[16/9] object-cover"}
                  />
                </div>
              )}
              {!_blobUrl && _blurUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                  <p className="text-[10px] font-black bg-black text-white px-4 py-2 uppercase tracking-widest animate-pulse">
                    Optimizing Asset...
                  </p>
                </div>
              )}
              <div className="mt-5 flex justify-between items-center border-b border-black dark:border-white pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                  {_isVid ? 'Brawnly Motion' : 'Brawnly Asset'} / Vol. 2026
                </p>
                <_Hx size={14} className="animate-spin-slow" />
              </div>
            </div>
            <div className="max-w-[840px] mx-auto relative">
              {_pD.paragraphs.map((l: string, i: number) => (
                <p key={i} className="text-[20px] md:text-[22px] leading-[1.85] mb-10 font-serif text-neutral-800 dark:text-neutral-300"
                  dangerouslySetInnerHTML={{
                    __html: l.trim()
                      .replace(/\*\*(.*?)\*\*/g, `<strong class="font-black text-black dark:text-white">$1</strong>`)
                      .replace(/\*(.*?)\*/g, `<em class="italic text-red-700">$1</em>`)
                  }}
                />
              ))}
              {_imgL.slice(1).length > 0 && (
                <div className="my-20 bg-neutral-50 dark:bg-[#111] border-l-[16px] border-black p-8">
                  <ArticleImageGallery images={_imgL.slice(1).join("\n")} title="" slug={_slV} downloadPrefix="brawnly_gallery" startIndex={2} />
                </div>
              )}
            </div>
            <section className="mt-32 border-t-[12px] border-black dark:border-white pt-16">
              <CommentSection articleId={_art.id} />
            </section>
          </article>
          <aside className="hidden lg:block w-[350px] flex-shrink-0">
            <div className="sticky top-32">
              <h3 className="text-[14px] font-black uppercase tracking-widest text-red-700 mb-8 italic underline">Hot Reads</h3>
              <div className="flex flex-col gap-10">
                {_hC.map((it: any, i: number) => (
                  <_L to={`/article/${it.slug}`} key={it.id} className="group block">
                    <div className="flex gap-5">
                      <span className="text-4xl font-black text-neutral-100 dark:text-neutral-900 group-hover:text-red-600 transition-colors">0{i + 1}</span>
                      <div>
                        <p className="text-[15px] font-black leading-tight uppercase group-hover:underline line-clamp-2">{it.title}</p>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{(it.views || 0).toLocaleString()} Reads</span>
                      </div>
                    </div>
                  </_L>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
      <ScrollToTopButton />
    </main>
  );
}