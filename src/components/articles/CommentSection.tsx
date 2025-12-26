import React, { useEffect, useState } from "react";
import { commentsApi, authApi } from "@/lib/api"; // SATU PINTU KE api.ts
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { CommentWithUser } from "@/types";

const CommentSection: React.FC<{ articleId: string }> = ({ articleId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

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
      await commentsApi.addComment(articleId, content);
      setContent("");
      toast.success("Komentar terkirim!");
      await loadComments(); // REFRESH LIST
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <p className="text-center py-10">Memuat diskusi...</p>;

  return (
    <div className="mt-10 border-t pt-10">
      <h3 className="text-2xl font-black mb-6 uppercase">Diskusi ({comments.length})</h3>
      
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <textarea 
            className="w-full border-2 p-4 rounded-xl focus:border-emerald-500 outline-none"
            placeholder="Tulis pendapatmu..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" className="mt-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold">
            Kirim Komentar
          </button>
        </form>
      ) : (
        <div className="p-6 bg-gray-50 rounded-xl text-center mb-10">
          <p className="mb-4">Login untuk ikut berdiskusi</p>
          <a href="/signin" className="text-emerald-600 font-bold uppercase">Masuk Disini</a>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-4 p-4 bg-white border rounded-xl shadow-sm">
            <img 
              src={c.user_avatar_url || `https://ui-avatars.com/api/?name=${c.user_name}&background=10b981&color=fff`} 
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-black text-xs uppercase text-emerald-600">{c.user_name}</p>
              <p className="text-gray-700 mt-1">{c.content}</p>
              <p className="text-[10px] text-gray-400 mt-2 uppercase">{new Date(c.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;