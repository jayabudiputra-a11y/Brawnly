// src/components/features/ArticleCard.tsx
import { Link } from "react-router-dom";
import { Calendar, Clock, Eye } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { format } from "date-fns";
import myAvatar from "@/assets/myAvatar.jpg";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string; // bisa 1 foto atau multi-line
  category: string;
  author?: string;
  published_at: string;
  reading_time: number;
  views: number;
}

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const authorName = article.author?.trim() || "Anonymous King";

  // 🟢 FIX UTAMA: Ambil foto pertama dari featured_image multi-line
  const firstImage =
    article.featured_image
      ?.split(/\r?\n/) // pisahkan multiline
      .map((url) => url.trim())
      .filter((url) => url !== "")[0] ?? null;

  return (
    <Link to={`/article/${article.slug}`} className="block group">
      <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">

        {/* 🖼️ IMAGE */}
        <div className="relative overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={article.title}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 h-64 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">Fitapp</span>
            </div>
          )}

          <div className="absolute top-4 left-4">
            <Badge variant="primary">{article.category || "fit"}</Badge>
          </div>
        </div>

        {/* 📄 CONTENT */}
        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-3">
            {article.title}
          </h2>

          {article.excerpt && (
            <p className="text-gray-600 line-clamp-3 mb-4 flex-1">{article.excerpt}</p>
          )}

          {/* 👤 AUTHOR */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={myAvatar}
                  alt={authorName}
                  className="w-10 h-10 rounded-full ring-2 ring-emerald-500 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{authorName}</p>
                <p className="text-xs text-gray-500">Fitapp Author</p>
              </div>
            </div>

            {/* ⏱️ META */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(article.published_at), "dd MMM yyyy")}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.reading_time} min
              </span>

              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.views}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
