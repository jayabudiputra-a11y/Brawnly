import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Menggunakan framer-motion yang baru diinstall
import { commentsApi, authApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { CommentWithUser, AuthUser } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CommentSectionProps {
  articleId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LOGIKA PAGINATION (Halaman Buku)
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;

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

  // Kalkulasi data per halaman
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const currentName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || "Anonymous";
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
    setCurrentPage(1); // Balik ke halaman 1 agar komen baru terlihat

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

  if (!currentUser) {
    return (
      <div className="bg-gray-50 dark:bg-neutral-900/50 p-8 rounded-2xl text-center border-2 border-dashed border-gray-200 dark:border-neutral-800 transition-colors duration-300">
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          Sign up to comment
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-6">Join the Fitapp 2025 community.</p>
        <Link to="/subscribe" className="inline-block bg-black dark:bg-white text-white dark:text-black px-10 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform duration-200">
          Sign Up / Subscribe
        </Link>
      </div>
    );
  }

  return (
    <section className="bg-transparent py-8 transition-colors duration-300">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
        Comments <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-md">{comments.length}</span>
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
          <button type="submit" disabled={!commentContent.trim() || isSubmitting} className="bg-[#00a354] text-white px-8 py-2.5 rounded-full font-black uppercase text-xs tracking-widest disabled:bg-gray-200 dark:disabled:bg-neutral-800 hover:shadow-lg transition-all">
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
          <button type="button" onClick={() => supabase.auth.signOut()} className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Logout Account</button>
        </div>
      </form>

      {/* LIST KOMENTAR DENGAN ANIMASI TRANSISI HALAMAN */}
      <div className="space-y-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentComments.length > 0 ? (
              currentComments.map((c) => (
                <div key={c.id} className="group border-b border-gray-50 dark:border-neutral-900 pb-6 mb-6 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <img 
                      src={c.user_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name || 'Anonymous')}&background=random&color=fff`}
                      alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-neutral-800"
                    />
                    <div>
                      <p className="font-black uppercase text-[12px] tracking-widest text-black dark:text-white">{c.user_name}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed pl-[52px]">{c.content}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-neutral-500 py-10 uppercase font-black text-xs tracking-widest">No comments yet.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* NAVIGASI HALAMAN (BOOK STYLE) */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-12">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full border border-gray-200 dark:border-neutral-800 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-all text-black dark:text-white"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Hanya tampilkan halaman sekitar halaman aktif jika total terlalu banyak
                if (totalPages > 5 && Math.abs(currentPage - pageNum) > 2) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-full text-[11px] font-black transition-all ${
                      currentPage === pageNum 
                      ? 'bg-black dark:bg-white text-white dark:text-black scale-110 shadow-lg' 
                      : 'text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full border border-gray-200 dark:border-neutral-800 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-all text-black dark:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}
    </section>
  );
};

export default CommentSection;