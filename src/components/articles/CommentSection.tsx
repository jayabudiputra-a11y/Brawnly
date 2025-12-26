import React, { useEffect, useState, useRef } from "react";
import { commentsApi } from "@/lib/api"; 
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CommentWithUser } from "@/types";

const CommentSection: React.FC<{ articleId: string }> = ({ articleId }) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Ref to scroll directly to the form
  const formRef = useRef<HTMLFormElement>(null);

  // Pagination
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
  const getReplies = (parentId: string) =>
    comments.filter(c => c.parent_id === parentId);

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentRootComments = rootComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const totalPages = Math.ceil(rootComments.length / commentsPerPage);

  if (loading)
    return (
      <p className="text-center py-10 dark:text-gray-400">
        Loading discussion...
      </p>
    );

  return (
    <div className="mt-10 border-t dark:border-neutral-800 pt-10">
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-2xl font-black uppercase dark:text-white">
          Discussion ({comments.length})
        </h3>
        {totalPages > 1 && (
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {isAuthenticated ? (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mb-10 scroll-mt-32"
        >
          {replyTo && (
            <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/30 p-3 mb-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Replying to <span className="font-bold">@{replyTo.name}</span>
              </p>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-[10px] bg-white dark:bg-neutral-800 px-2 py-1 rounded shadow-sm text-red-500 font-bold"
              >
                CANCEL
              </button>
            </div>
          )}

          <textarea
            className="w-full border-2 p-4 rounded-xl outline-none transition-all
                       bg-white dark:bg-neutral-900 
                       border-gray-200 dark:border-neutral-700 
                       text-gray-900 dark:text-white
                       focus:border-emerald-500"
            placeholder={
              replyTo
                ? `Write a reply to ${replyTo.name}...`
                : "Write your opinion..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button
            type="submit"
            className="mt-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
          >
            {replyTo ? "Send Reply" : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="p-6 bg-gray-50 dark:bg-neutral-900 rounded-xl text-center mb-10 border dark:border-neutral-800">
          <p className="mb-4 dark:text-gray-300">
            Log in to join the discussion
          </p>
          <a
            href="/signin"
            className="text-emerald-600 font-bold uppercase underline"
          >
            Sign in here
          </a>
        </div>
      )}

      <div className="space-y-8 min-h-[400px]">
        {currentRootComments.length > 0 ? (
          currentRootComments.map((c) => (
            <div key={c.id} className="group">
              <div className="flex gap-4 p-4 bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl shadow-sm">
                <img
                  src={
                    c.user_avatar_url ||
                    `https://ui-avatars.com/api/?name=${c.user_name}&background=10b981&color=fff`
                  }
                  className="w-10 h-10 rounded-full border dark:border-neutral-700"
                  alt={c.user_name}
                />
                <div className="flex-1">
                  <p className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                    {c.user_name}
                  </p>
                  <p className="text-gray-700 dark:text-gray-200 mt-1 leading-relaxed">
                    {c.content}
                  </p>
                  <div className="flex gap-4 mt-3">
                    <button
                      onClick={() => {
                        setReplyTo({ id: c.id, name: c.user_name });
                        formRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                      className="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 uppercase"
                    >
                      Reply
                    </button>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">
                      {new Date(c.created_at).toLocaleDateString("en-US")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Replies */}
              <div className="ml-8 md:ml-12 mt-4 space-y-4 border-l-2 border-gray-100 dark:border-neutral-800 pl-4">
                {getReplies(c.id).map((reply) => (
                  <div
                    key={reply.id}
                    className="flex gap-3 p-3 bg-gray-50/50 dark:bg-neutral-800/30 rounded-lg border dark:border-neutral-800"
                  >
                    <img
                      src={
                        reply.user_avatar_url ||
                        `https://ui-avatars.com/api/?name=${reply.user_name}&background=10b981&color=fff`
                      }
                      className="w-8 h-8 rounded-full shadow-sm"
                      alt={reply.user_name}
                    />
                    <div>
                      <p className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                        {reply.user_name}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-20">
            No discussions yet.
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-2 rounded-full border dark:border-neutral-700 disabled:opacity-30 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                  currentPage === i + 1
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-white dark:bg-neutral-900 border dark:border-neutral-700 dark:text-gray-400 hover:border-emerald-500"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-2 rounded-full border dark:border-neutral-700 disabled:opacity-30 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
