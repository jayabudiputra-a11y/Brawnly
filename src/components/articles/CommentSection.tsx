import React, { useState as _s, useEffect as _e } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send as _Sd, MessageSquare as _Ms, Loader2 as _L2 } from "lucide-react";
import { commentsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import FormattedDate from "@/components/features/FormattedDate";
// Fix 1: Type-only import untuk verbatimModuleSyntax
import type { CommentWithUser as _Cu } from "@/types";

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user: _u } = useAuth();
  const _qC = useQueryClient();
  const [_txt, _sTxt] = _s("");
  const [_sub, _sSub] = _s(false);
  const [_localComments, _setLocalComments] = _s<_Cu[]>([]);

  const { data: _serverComments, isLoading: _iL } = useQuery({
    queryKey: ["comments", articleId],
    queryFn: () => commentsApi.getCommentsByArticle(articleId),
    enabled: !!articleId,
  });

  _e(() => {
    if (_serverComments) {
      _setLocalComments(_serverComments);
    }
  }, [_serverComments]);

  const _onAddComment = async (content: string) => {
    if (!content.trim() || !_u) return;

    // Fix 2: Mengatasi Assignable 'undefined' to 'string | null'
    const _newCommentOptimistic: _Cu = {
      id: `temp-${Date.now()}`,
      article_id: articleId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      user_id: _u.id,
      user_name: _u.user_metadata?.full_name || "You",
      user_avatar_url: _u.user_metadata?.avatar_url || null, // Pastikan fallback null
      parent_id: null
    };

    _setLocalComments(prev => [...prev, _newCommentOptimistic]);
    _sTxt("");

    try {
      await commentsApi.addComment(articleId, content);
      await _qC.invalidateQueries({ queryKey: ["comments", articleId] });
    } catch (e) {
      _setLocalComments(prev => prev.filter(c => c.id !== _newCommentOptimistic.id));
      alert("FAILED TO POST COMMENT");
    }
  };

  const _hS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (_sub) return;
    _sSub(true);
    await _onAddComment(_txt);
    _sSub(false);
  };

  return (
    <div className="max-w-[840px] mx-auto py-10">
      <div className="flex items-center gap-3 mb-10">
        <_Ms className="text-red-600" size={24} />
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">
          Discussion ({_localComments.length})
        </h3>
      </div>

      {_u ? (
        <form onSubmit={_hS} className="mb-16">
          <div className="relative group">
            <textarea
              value={_txt}
              onChange={(e) => _sTxt(e.target.value)}
              placeholder="Join the conversation..."
              className="w-full bg-neutral-50 dark:bg-neutral-900 border-2 border-black dark:border-white p-5 font-serif text-lg min-h-[120px] focus:outline-none focus:ring-4 focus:ring-red-600/20 transition-all"
            />
            <button
              type="submit"
              disabled={_sub || !_txt.trim()}
              className="absolute bottom-4 right-4 bg-black dark:bg-white text-white dark:text-black px-6 py-3 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:invert transition-all disabled:opacity-50"
            >
              {_sub ? <_L2 className="animate-spin" size={14} /> : <_Sd size={14} />}
              Post
            </button>
          </div>
        </form>
      ) : (
        <div className="p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-center mb-16">
          <p className="font-black uppercase text-[11px] tracking-widest opacity-50">
            Please login to participate in the discussion
          </p>
        </div>
      )}

      <div className="space-y-12">
        {_iL && _localComments.length === 0 ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-1 bg-red-600 animate-pulse" />
          </div>
        ) : (
          _localComments.map((_c) => (
            <div key={_c.id} className="group relative">
              <div className="flex gap-5">
                <div className="flex-shrink-0">
                  <img
                    src={_c.user_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${_c.user_id}`}
                    alt={_c.user_name || "User"}
                    className="w-12 h-12 border-2 border-black dark:border-white grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <div className="flex-1 border-b border-neutral-100 dark:border-neutral-800 pb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black uppercase text-[13px] italic">
                      {_c.user_name}
                    </span>
                    <span className="text-[10px] uppercase opacity-50">
                      <FormattedDate dateString={_c.created_at} />
                    </span>
                  </div>
                  <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 font-serif">
                    {_c.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}