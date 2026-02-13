import React, { useState as _s, useEffect as _e } from "react";
import { useNavigate as _uN } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send as _Sd, MessageSquare as _Ms, Loader2 as _L2, User as _Us } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";

// Hooks & Libs
import { commentsApi, subscribersApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import FormattedDate from "@/components/features/FormattedDate";

// Types
import type { CommentWithUser as _Cu } from "@/types";

/* --------------------------------
   Offline Sync Queue (PWA Engine)
-------------------------------- */
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
  const [_localComments, _setLocalComments] = _s<_Cu[]>([]);

  /* ============================================================
     📡 SERVER DATA SYNC (Optimized for V3)
     ============================================================ */
  const { data: _serverComments, isLoading: _iL } = useQuery({
    queryKey: ["comments", articleId],
    queryFn: () => commentsApi.getCommentsByArticle(articleId),
    enabled: !!articleId,
    staleTime: 1000 * 30, 
  });

  _e(() => {
    if (_serverComments) _setLocalComments(_serverComments);
  }, [_serverComments]);

  /* ============================================================
     🛠️ IDENTITY SYNC LOGIC (Merged from AuthCallback)
     ============================================================ */
  const _syncUserIdentity = async () => {
    if (!_u) return;
    
    const fullName = _u.user_metadata?.full_name || _u.email?.split("@")[0] || "Member";
    const profilePayload = {
      id: _u.id,
      username: fullName,
      avatar_url: _u.user_metadata?.avatar_url || null
    };

    // 1. Sync ke User Profiles (Background)
    try {
      await supabase.from("user_profiles").upsert(profilePayload, { onConflict: "id" });
    } catch {
      _pushQ({ type: "profile_upsert", payload: profilePayload });
    }

    // 2. Sync ke Subscribers (Background)
    if (_u.email) {
      try {
        await subscribersApi.insertIfNotExists(_u.email, fullName);
      } catch {
        _pushQ({ type: "subscriber_insert", payload: { email: _u.email, name: fullName } });
      }
    }
  };

  /* ============================================================
     ⚡ OPTIMISTIC UPDATE LOGIC (Instant Display)
     ============================================================ */
  const _onAddComment = async (content: string) => {
    if (!content.trim() || !_u) return;

    const _cleanContent = content.trim();
    const _newCommentOptimistic: _Cu = {
      id: `temp-${Date.now()}`,
      article_id: articleId,
      content: _cleanContent,
      created_at: new Date().toISOString(),
      user_id: _u.id,
      user_name: _u.user_metadata?.full_name || "Member",
      user_avatar_url: _u.user_metadata?.avatar_url || null,
      parent_id: null
    };

    // UI Update langsung (Sinkron)
    _setLocalComments(prev => [_newCommentOptimistic, ...prev]);
    _sTxt("");

    try {
      // Pastikan identitas tersinkron sebelum/saat komen
      await _syncUserIdentity();
      
      await commentsApi.addComment(articleId, _cleanContent);
      await _qC.invalidateQueries({ queryKey: ["comments", articleId] });
    } catch (e) {
      // Rollback jika gagal
      _setLocalComments(prev => prev.filter(c => c.id !== _newCommentOptimistic.id));
      console.error("[COMMENT_ERROR]", e);
    }
  };

  const _hS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (_sub || !_txt.trim()) return;
    _sSub(true);
    await _onAddComment(_txt);
    _sSub(false);
  };

  return (
    <section className="max-w-[840px] mx-auto py-16 border-t-2 border-neutral-100 dark:border-neutral-900">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 text-white rounded-full"><_Ms size={20} /></div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">
            Discussion ({_localComments.length})
          </h3>
        </div>
      </div>

      {_u ? (
        <form onSubmit={_hS} className="mb-16 relative">
          <div className="relative overflow-hidden border-2 border-black dark:border-white focus-within:ring-4 focus-within:ring-red-600/20 transition-all rounded-xl">
            <textarea
              value={_txt}
              onChange={(e) => _sTxt(e.target.value)}
              placeholder="Write your perspective..."
              className="w-full bg-neutral-50 dark:bg-neutral-900 p-6 font-serif text-lg min-h-[140px] focus:outline-none resize-none"
            />
            <div className="flex justify-between items-center p-4 bg-white dark:bg-black border-t-2 border-black dark:border-white">
              <span className="text-[10px] font-black uppercase opacity-50 tracking-widest px-2">
                Posting as {_u.user_metadata?.full_name || "Member"}
              </span>
              <button
                type="submit"
                disabled={_sub || !_txt.trim()}
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:invert transition-all disabled:opacity-30"
              >
                {_sub ? <_L2 className="animate-spin" size={14} /> : <_Sd size={14} />}
                Post
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-10 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center mb-16">
          <p className="font-black uppercase text-[11px] tracking-[0.3em] opacity-40 mb-6 italic">
            Identification required for node participation
          </p>
          <button 
            onClick={() => _nav('/signin')}
            className="px-10 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all active:scale-95"
          >
            Sign In
          </button>
        </div>
      )}

      <div className="space-y-10">
        <_AP mode="popLayout">
          {_localComments.map((_c) => (
            <_m.div
              key={_c.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group flex gap-6 pb-10 border-b border-neutral-100 dark:border-neutral-900 last:border-0 ${
                _c.id.toString().startsWith('temp-') ? 'opacity-50 grayscale' : ''
              }`}
            >
              <div className="flex-shrink-0 w-14 h-14 border-2 border-black dark:border-white overflow-hidden bg-neutral-100">
                {_c.user_avatar_url ? (
                  <img src={_c.user_avatar_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400"><_Us size={24} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-black uppercase text-[13px] italic">
                    {_c.user_name}
                    {_c.id.toString().startsWith('temp-') && <span className="ml-3 text-[9px] not-italic text-red-600 animate-pulse">SYNCING...</span>}
                  </h4>
                  <span className="text-[10px] font-bold opacity-40 uppercase"><FormattedDate dateString={_c.created_at} /></span>
                </div>
                <div className="text-[18px] md:text-[20px] leading-relaxed font-serif text-neutral-800 dark:text-neutral-200 break-words">{_c.content}</div>
              </div>
            </_m.div>
          ))}
        </_AP>
      </div>
    </section>
  );
}