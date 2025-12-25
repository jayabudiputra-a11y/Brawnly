import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { commentsApi, authApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { CommentWithUser, AuthUser } from "@/types";

interface CommentSectionProps {
  articleId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const data = await commentsApi.getCommentsByArticle(articleId);
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const user = await authApi.getCurrentUser();
      setCurrentUser(user);
      await fetchComments();
      setLoading(false);
    };

    fetchInitialData();
  }, [articleId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const currentName = 
      currentUser?.user_metadata?.full_name || 
      currentUser?.user_metadata?.name || 
      "Anonymous";

    const currentAvatar = currentUser?.user_metadata?.avatar_url ?? null;

    const tempComment: CommentWithUser = {
      id: `temp-${Date.now()}`,
      article_id: articleId,
      user_id: currentUser?.id || "",
      content: commentContent,
      created_at: new Date().toISOString(),
      user_name: currentName,
      user_avatar_url: currentAvatar,
    };

    setComments((prev) => [tempComment, ...prev]);
    setCommentContent("");

    try {
      await commentsApi.addComment(articleId, commentContent);
      await fetchComments();
    } catch (err: any) {
      alert(err.message || "Failed to post comment.");
      await fetchComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs font-black uppercase tracking-widest text-neutral-500">Loading discussion…</p>
      </div>
    );
  }

  // Tampilan "Sign In to Comment" yang Berwarna Pelangi
  if (!currentUser) {
    return (
      <div className="bg-gray-50 dark:bg-neutral-900/50 p-8 rounded-2xl text-center border-2 border-dashed border-gray-200 dark:border-neutral-800 transition-colors duration-300">
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          Sign up to comment
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-6">
          Join the Fitapp 2025 community to share your thoughts.
        </p>
        <Link 
          to="/subscribe" 
          className="inline-block bg-black dark:bg-white text-white dark:text-black px-10 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform duration-200"
        >
          Sign Up / Subscribe
        </Link>
      </div>
    );
  }

  return (
    <section className="bg-transparent py-8 transition-colors duration-300">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
        Comments 
        <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-md">{comments.length}</span>
      </h2>

      <form onSubmit={handlePostComment} className="mb-12">
        <textarea
          rows={4}
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          className="w-full bg-white dark:bg-neutral-900 border-2 border-gray-100 dark:border-neutral-800 rounded-xl p-4 focus:border-emerald-500 outline-none transition-all text-black dark:text-white"
          placeholder="Write your comment…"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            disabled={!commentContent.trim() || isSubmitting}
            className="bg-[#00a354] text-white px-8 py-2.5 rounded-full font-black uppercase text-xs tracking-widest disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>

          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-600 transition-colors"
          >
            Logout Account
          </button>
        </div>
      </form>

      <div className="space-y-8">
        {comments.map((c) => (
          <div key={c.id} className="group border-b border-gray-50 dark:border-neutral-900 pb-6 transition-colors">
            <div className="flex items-center space-x-3 mb-3">
              <img 
                src={
                  c.user_avatar_url 
                  ? c.user_avatar_url 
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name || 'Anonymous')}&background=random&color=fff`
                }
                alt={`${c.user_name}'s avatar`} 
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-neutral-800 shadow-sm"
              />
              <div>
                <p className="font-black uppercase text-[12px] tracking-widest text-black dark:text-white">{c.user_name}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">
                  {new Date(c.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed pl-[52px]">
              {c.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommentSection;