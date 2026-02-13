import React, { useState as _s, useEffect as _e, useMemo as _uM } from "react";
import { useNavigate as _uN } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send as _Sd, MessageSquare as _Ms, Loader2 as _L2, User as _Us, Reply as _Rp, CornerDownRight as _Cr, X as _X } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";

// Hooks & Libs
import { commentsApi, subscribersApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import FormattedDate from "@/components/features/FormattedDate";

// Types
import type { CommentWithUser as _Cu } from "@/types";

const _QK = "brawnly_sync_queue";
function _pushQ(job: any) {
  try {
    const q = JSON.parse(localStorage.getItem(_QK) || "[]");
    q.push(job);
    localStorage.setItem(_QK, JSON.stringify(q));
  } catch {}
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user: _u } = useAuth();
  const _nav = _uN();
  const _qC = useQueryClient();
  
  const [_txt, _sTxt] = _s<string>("");
  const [_sub, _sSub] = _s<boolean>(false);
  const [_replyTo, _sReplyTo] = _s<string | null>(null);
  const [_localComments, _setLocalComments] = _s<_Cu[]>([]);
  const [_blobCache, _sBlobCache] = _s<Record<string, string>>({});

  /* ============================================================
      🛠️ HYDRATION ENGINE
     ============================================================ */
  const _hydrateAvatar = async (url: string | null | undefined, userId: string) => {
    if (!url || url.startsWith("blob:") || _blobCache[userId]) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      _sBlobCache(prev => ({ ...prev, [userId]: blobUrl }));
    } catch (e) {}
  };

  /* ============================================================
      📡 DATA SYNC & REALTIME
     ============================================================ */
  const { data: _serverComments, isLoading: _iL } = useQuery({
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

  /* ============================================================
      ⚡ OPTIMISTIC & REPLY LOGIC
     ============================================================ */
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

    _setLocalComments(prev => [ ...prev, _newComment]); // Add to bottom or top based on UI preference
    _sTxt("");
    _sReplyTo(null);

    try {
      // Logic Post ke API menggunakan parent_id jika ada
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

  // Grouping Comments: Root vs Replies
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
                  <_Rp size={12} /> Replying to node_id: {_replyTo.slice(0,8)}
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
                onReply={() => { _sReplyTo(_c.id); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              />
              
              {/* Replies Thread */}
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

/* --------------------------------
    Sub-Component: CommentItem
-------------------------------- */
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