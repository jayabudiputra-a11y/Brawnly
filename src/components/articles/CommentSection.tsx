import React, { useState as _s, useEffect as _e, useMemo as _uM, useRef as _uR } from "react";
import { useNavigate as _uN } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send as _Sd, MessageSquare as _Ms, Loader2 as _L2, User as _Us, Reply as _Rp, CornerDownRight as _Cr, X as _X } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";

import { commentsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import FormattedDate from "@/components/features/FormattedDate";

import { setCookieHash, mirrorQuery } from "@/lib/enterpriseStorage";
import { enqueue } from "@/lib/idbQueue";
import { wasmTranscodeImage } from "@/lib/wasmImagePipeline";
import { detectBestFormat } from "@/lib/imageFormat";

import type { CommentWithUser as _Cu } from "@/types";

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user: _u } = useAuth();
  const _nav = _uN();
  const _qC = useQueryClient();
  const _formRef = _uR<HTMLFormElement>(null); 
  
  const [_txt, _sTxt] = _s<string>("");
  const [_sub, _sSub] = _s<boolean>(false);
  const [_replyTo, _sReplyTo] = _s<string | null>(null);
  const [_localComments, _setLocalComments] = _s<_Cu[]>([]);
  const [_blobCache, _sBlobCache] = _s<Record<string, string>>({});

  const _hydrateAvatar = async (url: string | null | undefined, userId: string) => {
    if (!url || url.startsWith("blob:") || _blobCache[userId]) return;
    try {
      const _fmt = await detectBestFormat();
      const response = await fetch(url);
      const blob = await response.blob();
      const optimized = await wasmTranscodeImage(blob, _fmt, 0.4);
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

  const _onAddComment = async (content: string, parent_id: string | null = null) => {
    if (!content.trim() || !_u) return;
    _sSub(true);
    
    const payload = {
      content: content.trim(),
      article_id: articleId,
      user_id: _u.id,
      parent_id: parent_id
    };

    try {
      await setCookieHash(_u.id);
      mirrorQuery({ type: "COMMENT_POST", articleId, ts: Date.now() });

      if (!navigator.onLine) {
        await enqueue({ type: "ADD_COMMENT", payload });
        _sTxt("");
        _sReplyTo(null);
        return;
      }

      const { error } = await supabase.from('comments').insert(payload);
      if (error) throw error;
      await _qC.invalidateQueries({ queryKey: ["comments", articleId] });
      _sTxt("");
      _sReplyTo(null);
    } catch (e) {
      await enqueue({ type: "ADD_COMMENT", payload });
    } finally {
      _sSub(false);
    }
  };

  const _handleReplyInitiation = (commentId: string) => {
    if (!_u) {
      _nav('/signin');
      return;
    }
    _sReplyTo(commentId);
    _formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const _getRenderAvatar = (url: string | null | undefined, uid: string) => {
    if (!url) return null;
    return _blobCache[uid] || url;
  };

  const _sortedComments = _uM(() => {
    return [..._localComments].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [_localComments]);

  const _rootComments = _uM(() => _sortedComments.filter(c => !c.parent_id), [_sortedComments]);
  const _replies = _uM(() => _sortedComments.filter(c => c.parent_id), [_sortedComments]);

  return (
    <section className="max-w-[840px] mx-auto py-16 border-t-2 border-neutral-100 dark:border-neutral-900 px-4 md:px-0">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-red-600 text-white rounded-full"><_Ms size={20} /></div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white">Discussion ({_localComments.length})</h3>
      </div>

      {_u ? (
        <form ref={_formRef} onSubmit={(e) => { e.preventDefault(); _onAddComment(_txt, _replyTo); }} className="mb-16">
          <div className="relative overflow-hidden border-2 border-black dark:border-white rounded-xl shadow-xl">
            {_replyTo && (
              <div className="bg-emerald-500 text-black px-4 py-2 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                  <_Rp size={12} /> Replying to viewer_node: {_replyTo.slice(0,8)}
                </span>
                <button type="button" onClick={() => _sReplyTo(null)} className="hover:scale-110 transition-transform"><_X size={14} /></button>
              </div>
            )}
            <label htmlFor="comment-input" className="sr-only">Write your comment</label>
            <textarea
              id="comment-input"
              name="comment_content"
              value={_txt}
              onChange={(e) => _sTxt(e.target.value)}
              placeholder={_replyTo ? "Transmitting reply..." : "Write your perspective..."}
              className="w-full bg-neutral-50 dark:bg-neutral-950 p-6 font-serif text-lg min-h-[140px] focus:outline-none resize-none text-black dark:text-white"
            />
            <div className="flex justify-between items-center p-4 bg-white dark:bg-black border-t-2 border-black dark:border-white">
                <span className="text-[10px] font-black uppercase opacity-50 tracking-widest text-black dark:text-white">
                  ID: {_u.user_metadata?.full_name || "Member"}
                </span>
                <button type="submit" disabled={_sub || !_txt.trim()} className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:invert active:scale-95 transition-all disabled:opacity-30 shadow-lg">
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
              <CommentItem 
                comment={_c} 
                avatar={_getRenderAvatar(_c.user_avatar_url, _c.user_id)} 
                onReply={() => _handleReplyInitiation(_c.id)} 
              />
              <div className="ml-10 md:ml-16 mt-6 space-y-6 pl-6">
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

function CommentItem({ comment, avatar, onReply, isReply = false }: { comment: _Cu, avatar: string | null, onReply?: () => void, isReply?: boolean }) {
  return (
    <div className="flex gap-4 md:gap-6 relative group">
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
          <h4 className={`font-black uppercase italic ${isReply ? 'text-[11px]' : 'text-[13px]'} text-black dark:text-white`}>
            {comment.user_name}
            {comment.id.toString().startsWith('temp-') && <span className="ml-2 text-[9px] not-italic text-emerald-600 animate-pulse tracking-widest">SYNCING...</span>}
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