import React, { useState as _s, useEffect as _e, useMemo as _uM } from "react";
import { Link as _L, useParams as _uP, useNavigate as _uN } from "react-router-dom";
import { Helmet as _Hm } from "react-helmet-async";
import { Eye as _Ey, Bookmark as _Bm, Check as _Ck, WifiOff as _Wo, Share2 as _Sh, ArrowLeft as _Al, Send as _Sd, MessageSquare as _Ms, Loader2 as _L2, User as _Us, Reply as _Rp, CornerDownRight as _Cr, X as _X, Camera as _Ca, PlayCircle as _Pc, Aperture as _Ap } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import FormattedDate from "@/components/features/FormattedDate";
import _mA from "@/assets/myAvatar.jpg";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import ArticleCoverImage from "@/components/features/ArticleCoverImage";

import _muscleLeft from "@/assets/119-1191125_muscle-arms-png-big-arm-muscles-transparent-png.png";
import _muscleRight from "@/assets/634-6343275_muscle-arm-png-background-images-barechested-transparent-png.png";

import { useArticleData as _uAD } from "@/hooks/useArticleData";
import { useArticleViews as _uAV } from "@/hooks/useArticleViews";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useArticles as _uAs } from "@/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { supabase, CLOUDINARY_CONFIG as _CC } from "@/lib/supabase";
import { commentsApi } from "@/lib/api";

import { wasmTranscodeImage as _wTI, wasmCreatePlaceholder as _wCP } from "@/lib/wasmImagePipeline";
import { wasmVideoToThumbnail as _wVT } from "@/lib/wasmVideoPipeline";
import { detectBestFormat as _dBF, detectBestFormat } from "@/lib/imageFormat";
import { setCookieHash, mirrorQuery, warmupEnterpriseStorage } from "@/lib/enterpriseStorage";
import { enqueue } from "@/lib/idbQueue";
import { saveAssetToShared, getAssetFromShared } from "@/lib/sharedStorage";
import { registerSW } from "@/pwa/swRegister";

import type { CommentWithUser as _Cu } from "@/types";

function CommentItem({ comment, avatar, onReply, isReply = false }: { comment: _Cu, avatar: string | null, onReply?: () => void, isReply?: boolean }) {
  return (
    <div className={`flex gap-4 md:gap-6 relative ${isReply ? 'ml-10 md:ml-16 mt-6' : ''}`}>
      {isReply && <_Cr className="absolute -left-10 top-2 text-neutral-300 dark:text-neutral-800" size={20} />}
      <div className="flex-shrink-0">
        <div className={`${isReply ? 'w-10 h-10' : 'w-14 h-14'} border-2 border-black dark:border-white overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-sm`}>
          {avatar ? (
            <img src={avatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-black tracking-tighter italic">
              <_Us size={isReply ? 16 : 24} />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-2">
          <h4 className={`font-black uppercase italic ${isReply ? 'text-[11px]' : 'text-[13px]'} flex items-center gap-2 text-black dark:text-white`}>
            {comment.user_name}
            {comment.id.toString().startsWith('temp-') && <span className="text-[9px] not-italic text-emerald-500 animate-pulse tracking-widest">SYNCING...</span>}
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
      const _fmt = await _dBF();
      const response = await fetch(url);
      const blob = await response.blob();
      const optimized = await _wTI(blob, _fmt, 0.4);
      const blobUrl = URL.createObjectURL(optimized);
      _sBlobCache(prev => ({ ...prev, [userId]: blobUrl }));
    } catch (e) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        _sBlobCache(prev => ({ ...prev, [userId]: blobUrl }));
      } catch (err) {}
    }
  };

  const { data: _serverComments } = useQuery({
    queryKey: ["comments", articleId],
    queryFn: () => commentsApi.getCommentsByArticle(articleId),
    enabled: !!articleId,
  });

  _e(() => {
    if (_serverComments) {
      _setLocalComments(_serverComments);
      _serverComments.forEach(c => {
        if (c.user_avatar_url) _hydrateAvatar(c.user_avatar_url, c.user_id);
      });
    }
  }, [_serverComments]);

  const _rootComments = _uM(() => _localComments.filter(c => !c.parent_id), [_localComments]);
  const _replies = _uM(() => _localComments.filter(c => c.parent_id), [_localComments]);

  const _onAddComment = async (content: string, parentId: string | null = null) => {
    if (!content.trim() || !_u) return;
    _sSub(true);
    
    const payload = {
      article_id: articleId,
      user_id: _u.id,
      content: content.trim(),
      parent_id: parentId
    };

    try {
      await setCookieHash(_u.id);
      mirrorQuery({ type: "COMMENT_POST", articleId, ts: Date.now() });

      if (!navigator.onLine) {
        await enqueue({ type: "ADD_COMMENT", payload });
        toast.info("Cached offline. Will sync when online.");
        _sTxt("");
        _sReplyTo(null);
        return;
      }

      const { error: cErr } = await supabase.from('comments').insert(payload);
      if (cErr) throw cErr;
      await _qC.invalidateQueries({ queryKey: ["comments", articleId] });
      toast.success("Perspective Synced");
      _sTxt("");
      _sReplyTo(null);
    } catch (e: any) {
      await enqueue({ type: "ADD_COMMENT", payload });
      toast.error("Network issue. Perspective queued.");
    } finally {
      _sSub(false);
    }
  };

  const _getRenderAvatar = (url: string | null | undefined, uid: string): string | null => {
    const result = uid === _u?.id ? (_blobCache["me"] || url) : (_blobCache[uid] || url);
    return result || null;
  };

  return (
    <section className="max-w-[840px] mx-auto py-16 border-t-2 border-neutral-100 dark:border-neutral-900 px-4 md:px-0">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-red-600 text-white rounded-full"><_Ms size={20} /></div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white">Discussion ({_localComments.length})</h3>
      </div>
      {_u ? (
        <form id="comment-form" onSubmit={(e) => { e.preventDefault(); _onAddComment(_txt, _replyTo); }} className="mb-16">
          <div className="relative overflow-hidden border-2 border-black dark:border-white rounded-xl shadow-2xl">
            {_replyTo && (
              <div className="bg-emerald-500 text-black px-4 py-2 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                  <_Rp size={12} /> Replying_To: {_replyTo.slice(0, 8)}
                </span>
                <button type="button" onClick={() => _sReplyTo(null)} className="hover:scale-110 transition-transform"><_X size={14} /></button>
              </div>
            )}
            <label htmlFor="comment-textarea" className="sr-only">Write your perspective</label>
            <textarea
              id="comment-textarea"
              name="comment_content"
              value={_txt}
              onChange={(e) => _sTxt(e.target.value)}
              placeholder={_replyTo ? "Transmitting reply..." : "Write your perspective..."}
              className="w-full bg-neutral-50 dark:bg-neutral-950 p-6 font-serif text-lg min-h-[140px] focus:outline-none resize-none text-black dark:text-white placeholder:opacity-20"
            />
            <div className="flex justify-between items-center p-4 bg-white dark:bg-black border-t-2 border-black dark:border-white">
              <span className="text-[10px] font-black uppercase opacity-50 tracking-widest text-black dark:text-white">ID_NODE: {_u.user_metadata?.full_name || "Member"}</span>
              <button type="submit" disabled={_sub || !_txt.trim()} className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:invert active:scale-95 transition-all disabled:opacity-30">
                {_sub ? <_L2 className="animate-spin" size={14} /> : <_Sd size={14} />} Commit
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-10 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center mb-16">
          <p className="mb-6 font-serif italic text-neutral-500 text-lg">Sign up to comment and reply as a Brawnly viewer.</p>
          <button onClick={() => _nav('/signin')} className="px-10 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg">Sign Up Now</button>
        </div>
      )}
      <div className="space-y-12">
        <_AP mode="popLayout">
          {_rootComments.map((_c) => (
            <_m.div key={_c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group">
              <CommentItem comment={_c} avatar={_getRenderAvatar(_c.user_avatar_url, _c.user_id)} onReply={() => { _sReplyTo(_c.id); }} />
              <div className="space-y-6">
                {_replies.filter(r => r.parent_id === _c.id).map(r => (
                  <CommentItem key={r.id} comment={r} isReply avatar={_getRenderAvatar(r.user_avatar_url, r.user_id)} />
                ))}
              </div>
            </_m.div>
          ))}
        </_AP>
      </div>
    </section>
  );
}

export default function ArticleDetail() {
  const { slug: _sl } = _uP<{ slug: string }>();
  const _slV = _sl ?? "unknown";
  const [_blobUrl, _setBlobUrl] = _s<string | null>(null);
  const [_blurUrl, _setBlurUrl] = _s<string | null>(null);
  const [_isOff, _sOff] = _s(!navigator.onLine);
  const [_iS, _siS] = _s(() => localStorage.getItem(`brawnly_saved_${_slV}`) === "true");
  const [_hasTracked, _sHasTracked] = _s(false);

  const _fC = (_u: string) => {
    if (!_u) return "";
    if (_u.startsWith("http")) return _u;
    return `${_CC.baseUrl}/${_u}`;
  };

  const { processedData: _pD, isLoading: _iL, article: _art } = _uAD();

  const _allMedia = _uM(() => {
    const sourceStr = _art?.featured_image_url || _art?.featured_image;
    if (!sourceStr) return [];
    return sourceStr.split(/[\r\n]+/).filter(Boolean);
  }, [_art?.featured_image_url, _art?.featured_image]);

  const _rawImgSource = _uM(() => _allMedia[0] ? _fC(_allMedia[0]) : null, [_allMedia]);
  const _extraMedia = _uM(() => _allMedia.slice(1), [_allMedia]);

  const _youtubeShorts = _uM(() => 
    _extraMedia.filter((url: string) => url.includes("youtube.com") || url.includes("youtu.be")), 
  [_extraMedia]);

  const _animatedImages = _uM(() => 
    _extraMedia.filter((url: string) => url.match(/\.(gif|gifv|webp)$/i)), 
  [_extraMedia]);

  const _galleryImages = _uM(() => 
    _extraMedia.filter((url: string) => 
        !url.includes("youtube.com") && 
        !url.includes("youtu.be") &&
        !url.match(/\.(gif|gifv|webp)$/i)
    ), 
  [_extraMedia]);

  const _getEmbedUrl = (url: string) => {
    try {
      const match = url.match(/(?:shorts\/|v=|youtu\.be\/)([\w-]{11})/);
      const videoId = match ? match[1] : null;
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) {
      return null;
    }
  };

  _e(() => {
    warmupEnterpriseStorage();
    registerSW();
    detectBestFormat();
    
    const oN = () => _sOff(false);
    const oF = () => _sOff(true);
    window.addEventListener('online', oN);
    window.addEventListener('offline', oF);
    return () => {
      window.removeEventListener('online', oN);
      window.removeEventListener('offline', oF);
    };
  }, []);

  _e(() => {
    if (!_rawImgSource) return;
    
    if (_rawImgSource.match(/\.(gif|gifv|webp)$/i)) {
      _setBlobUrl(_rawImgSource);
      return;
    }

    let _active = true;
    (async () => {
      try {
        const cached = await getAssetFromShared(`cover_${_slV}`);
        if (cached && _active) {
          _setBlobUrl(URL.createObjectURL(cached));
          return;
        }

        const res = await fetch(_rawImgSource);
        const b = await res.blob();
        const placeholder = await _wCP(b);
        if (_active) _setBlurUrl(placeholder);
        
        const _fmt = await _dBF();
        let final;
        
        if (_rawImgSource.match(/\.(mp4|webm|ogg|mov)$/i)) {
          const vThumb = await _wVT(b, 0.25);
          final = URL.createObjectURL(vThumb);
          await saveAssetToShared(`cover_${_slV}`, vThumb);
        } else {
          const opt = await _wTI(b, _fmt, 0.75);
          final = URL.createObjectURL(opt);
          await saveAssetToShared(`cover_${_slV}`, opt);
        }
        
        if (_active) _setBlobUrl(final);
      } catch (e) {
        if (_active) _setBlobUrl(_rawImgSource);
      }
    })();
    return () => { _active = false; };
  }, [_rawImgSource, _slV]);

  _e(() => {
    if (_art?.id && !_hasTracked) {
      setCookieHash(_slV);
      mirrorQuery({ type: "ARTICLE_VIEW", id: _art.id, slug: _slV, ts: Date.now() });
      _sHasTracked(true);
    }
  }, [_art?.id, _hasTracked, _slV]);

  const { data: _allA } = _uAs();
  const _hC = _uM(() => _allA ? [..._allA].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3) : [], [_allA]);

  const _hSv = () => {
    const _nS = !_iS;
    _siS(_nS);
    if (_nS) {
      localStorage.setItem(`brawnly_saved_${_slV}`, "true");
      toast.success("Identity Saved");
    } else {
      localStorage.removeItem(`brawnly_saved_${_slV}`);
      toast.info("Removed");
    }
  };

  const { viewCount: _realtimeViews } = _uAV({ id: _art?.id ?? "", slug: _slV, initialViews: _art?.views ?? 0 });

  if (_iL && !_pD) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="w-20 h-[3px] bg-red-600 animate-pulse" />
    </div>
  );

  if (!_pD || !_art) return null;

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500 relative overflow-x-hidden">
      <_Hm>
        <title>{_pD.title} | Brawnly</title>
        <meta property="og:image" content={_gOI(_rawImgSource || "", 1200)} />
      </_Hm>

      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-4">
        <button onClick={_hSv} className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-500 border-2 ${_iS ? 'bg-emerald-500 border-black text-black scale-110' : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 shadow-xl'}`}>
          {_iS ? <_Ck size={20} /> : <_Bm size={20} />}
        </button>
        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Node Link Copied"); }} className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-800 hover:border-red-600 transition-all duration-500">
          <_Sh size={20} />
        </button>
      </aside>

      <div className="max-w-[1320px] mx-auto px-4 md:px-10">
        <header className="pt-12 md:pt-16 pb-8 md:pb-10 border-b-[8px] md:border-b-[12px] border-black dark:border-white mb-8 md:mb-10 relative text-black dark:text-white">
          <div className="flex justify-between items-start mb-6">
            <_L to="/articles" className="text-red-700 font-black uppercase text-[11px] md:text-[13px] tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all italic">
              <_Al size={14} /> Node_Explore
            </_L>
            {_isOff && <span className="flex items-center gap-2 text-red-500 text-[9px] font-bold uppercase tracking-widest animate-pulse border border-red-500 px-3 py-1 rounded-full"><_Wo size={12} /> OFFLINE</span>}
          </div>
          <h1 className="text-[36px] sm:text-[45px] md:text-[92px] leading-[0.9] md:leading-[0.82] font-black uppercase tracking-tighter mb-8 md:mb-10 italic break-words">
            {_pD.title}
          </h1>
          <div className="flex flex-col md:flex-row md:items-end justify-between py-6 md:py-8 border-t-2 border-black dark:border-white gap-6">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden border-2 border-black grayscale shadow-lg bg-neutral-100">
                <img src={_gOI(_mA, 120)} className="w-full h-full object-cover" alt="B" />
              </div>
              <div>
                <span className="block text-[13px] md:text-[15px] font-black uppercase italic">By {_art.author || "Brawnly"}</span>
                <span className="text-[10px] md:text-[12px] uppercase opacity-80"><FormattedDate dateString={_art.published_at} /></span>
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black italic flex items-center gap-3">
              {_realtimeViews.toLocaleString()} <_Ey size={20} className="text-red-600" />
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
          <article className="flex-1 relative min-w-0">
            <p className="text-[20px] md:text-[32px] leading-[1.2] md:leading-[1.1] font-extrabold mb-10 md:mb-14 tracking-tight text-neutral-900 dark:text-neutral-100 italic">
              {_pD.excerpt}
            </p>

            <div className="relative mb-12 md:mb-20 px-4 md:px-12 lg:px-20">
                <div className="absolute left-[-15px] sm:left-[-30px] md:left-[-60px] lg:left-[-80px] top-1/2 -translate-y-1/2 w-20 sm:w-32 md:w-48 lg:w-56 z-10 opacity-90 pointer-events-none">
                    <img src={_muscleLeft} alt="Decorative Arm Left" className="w-full drop-shadow-2xl" />
                </div>
                
                <div className="relative overflow-hidden group rounded-2xl md:rounded-3xl border-2 border-black dark:border-white shadow-2xl z-20 bg-black">
                   <ArticleCoverImage imageUrl={_blobUrl || _rawImgSource || ""} title={_pD.title} slug={_slV} className="w-full aspect-video md:aspect-[21/9] object-cover" />
                </div>

                <div className="absolute right-[-15px] sm:right-[-30px] md:right-[-60px] lg:right-[-80px] top-1/2 -translate-y-1/2 w-20 sm:w-32 md:w-48 lg:w-56 z-10 opacity-90 pointer-events-none">
                    <img src={_muscleRight} alt="Decorative Arm Right" className="w-full drop-shadow-2xl" />
                </div>
            </div>

            <div className="max-w-[840px] mx-auto">
              {_pD.paragraphs.map((l: string, i: number) => (
                <p key={i} className="text-[18px] md:text-[22px] leading-[1.8] md:leading-[1.85] mb-8 md:mb-10 font-serif text-neutral-800 dark:text-neutral-300"
                  dangerouslySetInnerHTML={{ __html: l.trim().replace(/\*\*(.*?)\*\*/g, `<strong class="font-black text-black dark:text-white">$1</strong>`).replace(/\*(.*?)\*/g, `<em class="italic text-red-700">$1</em>`) }} />
              ))}
            </div>

            {_youtubeShorts.length > 0 && (
              <div className="my-16 max-w-[840px] mx-auto">
                 {_youtubeShorts.map((videoUrl: string, idx: number) => {
                    const embedUrl = _getEmbedUrl(videoUrl);
                    if (!embedUrl) return null;
                    return (
                      <div key={`yt-${idx}`} className="flex flex-col items-center justify-center mb-16">
                         <div className="relative w-full flex justify-center">
                            <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full transform scale-75 opacity-50 pointer-events-none" />
                            <iframe 
                                width="459" 
                                height="816" 
                                src={embedUrl} 
                                title={`Shorts video ${idx + 1}`}
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                referrerPolicy="strict-origin-when-cross-origin" 
                                allowFullScreen
                                className="relative z-10 max-w-full rounded-2xl border-[4px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] bg-black"
                            ></iframe>
                         </div>
                         <div className="mt-5 flex items-center gap-2 text-red-600 dark:text-red-500 font-bold uppercase tracking-widest text-[11px]">
                            <_Pc size={16} /> Watch Short
                         </div>
                      </div>
                    )
                 })}
              </div>
            )}

            {_animatedImages.length > 0 && (
                <section className="my-20 max-w-[600px] mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-10 opacity-70">
                        <_Ap size={18} className="animate-spin-slow" />
                        <span className="text-[10px] uppercase font-black tracking-[0.3em]">Motion_Capture</span>
                    </div>
                    <div className="flex flex-col gap-10 items-center">
                        {_animatedImages.map((img: string, idx: number) => (
                            <div key={`gif-${idx}`} className="w-auto max-w-[80%] md:max-w-full relative group">
                                <img 
                                    src={_fC(img)} 
                                    alt={`Motion ${idx}`}
                                    className="w-full h-auto rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800"
                                    style={{ objectFit: 'contain' }}
                                    loading="lazy"
                                />
                                <div className="absolute -bottom-3 -right-3 bg-black text-white px-2 py-1 text-[8px] font-bold uppercase tracking-widest border border-white">
                                    GIF
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {_galleryImages.length > 0 && (
                <section className="mt-20 mb-12 border-t-2 border-neutral-100 dark:border-neutral-900 pt-16">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full"><_Ca size={18} /></div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white">Gallery</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {_galleryImages.map((img: string, idx: number) => (
                            <div key={idx} className="overflow-hidden border-2 border-black dark:border-white rounded-xl group shadow-lg bg-neutral-100 relative">
                                <img 
                                    src={_fC(img)} 
                                    alt={`Gallery node ${idx}`}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 aspect-square md:aspect-[4/5]"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="flex xl:hidden items-center gap-4 mb-16 border-t-2 border-neutral-100 dark:border-neutral-900 pt-8">
              <button
                onClick={_hSv}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 font-black uppercase text-[12px] tracking-widest transition-all shadow-md active:scale-95 ${
                  _iS
                    ? 'bg-emerald-500 border-black text-black'
                    : 'bg-white dark:bg-black border-black dark:border-white text-black dark:text-white'
                }`}
              >
                {_iS ? <_Ck size={16} /> : <_Bm size={16} />}
                {_iS ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Node Link Copied");
                }}
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[12px] tracking-widest shadow-md hover:invert active:scale-95 transition-all"
              >
                <_Sh size={16} />
                Permalink
              </button>
            </div>

            <CommentSection articleId={_art.id} />
          </article>

          <aside className="hidden lg:block w-[320px] xl:w-[350px] flex-shrink-0">
            <div className="sticky top-32 space-y-12">
              <div className="p-8 bg-neutral-50 dark:bg-[#111] rounded-[2.5rem] border-2 border-black dark:border-white shadow-xl">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-emerald-600 mb-8 italic flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping" /> Trending
                </h3>
                <div className="flex flex-col gap-10">
                  {_hC.map((it: any, i: number) => (
                    <_L to={`/article/${it.slug}`} key={it.id} className="group block">
                      <div className="flex gap-4">
                        <span className="text-3xl font-black text-neutral-200 dark:text-neutral-800 group-hover:text-emerald-500 transition-colors">0{i + 1}</span>
                        <div>
                          <p className="text-[14px] font-black leading-tight uppercase group-hover:underline line-clamp-2 text-black dark:text-white">{it.title}</p>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">{(it.views || 0).toLocaleString()} Identity_Reads</span>
                        </div>
                      </div>
                    </_L>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <ScrollToTopButton />
    </main>
  );
}