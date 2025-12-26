import React, { useEffect, useState, useRef } from "react";
import { commentsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"; 
import { getOptimizedImage } from "@/lib/utils";
import type { CommentWithUser } from "@/types";
import FormattedDate from "@/components/features/FormattedDate";

const CommentSection: React.FC<{ articleId: string }> = ({ articleId }) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;

  const loadComments = async () => {
    if (!articleId) return;
    const data = await commentsApi.getCommentsByArticle(articleId);
    setComments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await commentsApi.addComment(articleId, content, replyTo?.id || null);
      setContent("");
      setReplyTo(null);
      toast.success(replyTo ? "Reply sent successfully!" : "Comment sent successfully!");
      await loadComments();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const rootComments = comments.filter(c => !c.parent_id);
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentRootComments = rootComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(rootComments.length / commentsPerPage);

  const getReplies = (parentId: string) =>
    comments.filter(c => c.parent_id === parentId);

  if (loading) {
    return (
      <p className="text-center py-10 text-neutral-600 dark:text-neutral-400 font-medium">
        Loading discussion...
      </p>
    );
  }

  return (
    <section className="relative w-full">
      {/* PERBAIKAN UTAMA: 
          Mengganti margin negatif ekstrim dengan nilai yang lebih kecil (-mt-4)
          agar judul Discussion berada tepat di bawah galeri tanpa menabrak gambar.
      */}
      <div className="flex justify-between items-baseline mb-8 -mt-4 relative z-20"> 
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
          Discussion ({comments.length})
        </h2>
        {totalPages > 1 && (
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Page {currentPage} / {totalPages}
          </span>
        )}
      </div>

      {isAuthenticated ? (
        <form ref={formRef} onSubmit={handleSubmit} className="mb-10 scroll-mt-32">
          {replyTo && (
            <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-3 mb-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
              <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">
                Replying to <span className="font-bold">@{replyTo.name}</span>
              </p>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-[10px] bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-lg shadow-sm text-red-600 dark:text-red-400 font-black tracking-wider hover:bg-red-50 transition-all"
              >
                CANCEL
              </button>
            </div>
          )}

          <textarea
            className="w-full border-2 p-4 rounded-2xl outline-none transition-all
                       bg-white dark:bg-neutral-900 
                       border-gray-100 dark:border-neutral-800 
                       text-gray-900 dark:text-neutral-100
                       focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 placeholder:text-neutral-400"
            placeholder={replyTo ? `Reply to ${replyTo.name}...` : "Share your thoughts..."}
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button
            type="submit"
            className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            {replyTo ? "Send Reply" : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="p-8 bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl text-center mb-10 border border-dashed border-neutral-200 dark:border-neutral-800">
          <p className="mb-4 text-neutral-600 dark:text-neutral-400 font-bold uppercase text-[10px] tracking-[.2em]">
            Join the conversation
          </p>
          <a
            href="/signin"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[.2em] hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95"
          >
            Sign in to Comment
          </a>
        </div>
      )}

      {/* Daftar Komentar */}
      <div className="space-y-10">
        {currentRootComments.length > 0 ? (
          currentRootComments.map((c) => (
            <div key={c.id} className="group/comment">
              <article className="flex gap-4">
                <img
                  src={c.user_avatar_url ? getOptimizedImage(c.user_avatar_url, 100) : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name)}&background=random`}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-neutral-50 dark:ring-neutral-900 shrink-0"
                  alt={c.user_name}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                      {c.user_name}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">
                      <Clock className="w-2.5 h-2.5" />
                      <FormattedDate dateString={c.created_at} formatString="MMM d, yyyy" />
                    </span>
                  </div>
                  <p className="text-[14px] md:text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {c.content}
                  </p>
                  <button
                    onClick={() => {
                      setReplyTo({ id: c.id, name: c.user_name });
                      formRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="mt-2 text-[9px] uppercase font-black text-emerald-600 dark:text-emerald-500 hover:underline tracking-widest"
                  >
                    Reply
                  </button>
                </div>
              </article>

              {/* Replies Section */}
              {getReplies(c.id).length > 0 && (
                <div className="ml-10 md:ml-14 mt-6 space-y-6 border-l-2 border-neutral-100 dark:border-neutral-900 pl-6">
                  {getReplies(c.id).map((reply) => (
                    <div key={reply.id} className="flex gap-3 items-start">
                      <img 
                         src={reply.user_avatar_url ? getOptimizedImage(reply.user_avatar_url, 60) : `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user_name)}&background=random`}
                         className="w-7 h-7 rounded-lg object-cover shrink-0"
                         alt=""
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-[13px] dark:text-white">{reply.user_name}</span>
                          <span className="text-[8px] font-bold text-neutral-400 uppercase">
                            <FormattedDate dateString={reply.created_at} formatString="MMM d" />
                          </span>
                        </div>
                        <p className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-neutral-50/50 dark:bg-neutral-900/10 rounded-[2rem] border-2 border-dotted border-neutral-100 dark:border-neutral-800">
            <p className="text-neutral-400 uppercase text-[9px] font-black tracking-[.3em]">
              No discussions yet
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-16 flex justify-center items-center gap-4" aria-label="Pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage(p => p - 1);
              window.scrollTo({ top: formRef.current?.offsetTop ? formRef.current.offsetTop - 200 : 0, behavior: 'smooth' });
            }}
            className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 disabled:opacity-20 hover:bg-emerald-600 hover:text-white transition-all text-neutral-600 dark:text-neutral-400"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[9px] font-black uppercase tracking-[.2em] text-neutral-500">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage(p => p + 1);
              window.scrollTo({ top: formRef.current?.offsetTop ? formRef.current.offsetTop - 200 : 0, behavior: 'smooth' });
            }}
            className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 disabled:opacity-20 hover:bg-emerald-600 hover:text-white transition-all text-neutral-600 dark:text-neutral-400"
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      )}
    </section>
  );
};

export default CommentSection;