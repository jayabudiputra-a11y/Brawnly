// src/components/articles/CommentSection.tsx

import React, { useEffect, useState } from "react";
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

    const tempComment: CommentWithUser = {
      id: `temp-${Date.now()}`,
      article_id: articleId,
      user_id: currentUser?.id || "",
      content: commentContent,
      created_at: new Date().toISOString(),
      user_name: currentUser?.user_metadata?.name ?? "Anonymous",
      user_avatar_url: currentUser?.user_metadata?.avatar_url ?? null,
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
    return <p className="text-center text-gray-500">Loading comments…</p>;
  }

  if (!currentUser) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center border border-red-300">
        <h3 className="text-xl font-semibold mb-2">Sign up to comment</h3>
        <p className="text-gray-600 mb-4">
          You need an account to join the discussion.
        </p>
        <button className="bg-red-600 text-white px-4 py-2 rounded">
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <section className="bg-white py-8">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({comments.length})
      </h2>

      <form onSubmit={handlePostComment} className="mb-8">
        <textarea
          rows={4}
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          className="w-full border rounded p-3"
          placeholder="Write your comment…"
          disabled={isSubmitting}
        />
        <div className="flex justify-between mt-2">
          <button
            type="submit"
            disabled={!commentContent.trim() || isSubmitting}
            className="bg-emerald-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>

          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-red-600"
          >
            Logout
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map((c) => (
          <div key={c.id} className="border-b pb-4">
            <div className="flex items-center space-x-3 mb-2">
                {c.user_avatar_url && (
                    <img src={c.user_avatar_url} alt={`${c.user_name}'s avatar`} className="w-8 h-8 rounded-full"/>
                )}
                <p className="font-semibold">{c.user_name ?? "Anonymous"}</p>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(c.created_at).toLocaleDateString()}
            </p>
            <p className="mt-2">{c.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommentSection;