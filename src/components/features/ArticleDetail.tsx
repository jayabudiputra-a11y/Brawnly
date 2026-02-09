import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Eye, Link2, Anchor, Bookmark, Hexagon, Check, X } from "lucide-react";
import { motion } from "framer-motion"; // Import Framer Motion
import FormattedDate from "@/components/features/FormattedDate";
import StructuredData from "../seo/StructuredData";
import myAvatar from "@/assets/myAvatar.jpg";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import CommentSection from "@/components/articles/CommentSection";
import { useArticleData } from "@/hooks/useArticleData";
import { useArticleViews } from "@/hooks/useArticleViews";
import ArticleImageGallery from "@/components/features/ArticleImageGallery";
import ArticleCoverImage from "@/components/features/ArticleCoverImage";
import { getOptimizedImage } from "@/lib/utils";
import { useArticles } from "@/hooks/useArticles";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const slugValue = slug ?? "unknown";

  const { processedData, isLoading, article } = useArticleData();
  const { data: allArticles } = useArticles();
  
  const hotContent = allArticles
    ? [...allArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3)
    : [];

  const [isSaved, setIsSaved] = useState(false);
  const [notify, setNotify] = useState<{ show: boolean; msg: string; type: 'success' | 'info' }>({ 
    show: false, 
    msg: "", 
    type: 'info' 
  });

  useEffect(() => {
    const savedStatus = localStorage.getItem(`brawnly_saved_${slugValue}`);
    if (savedStatus === "true") setIsSaved(true);
  }, [slugValue]);

  const triggerNotify = (msg: string, type: 'success' | 'info' = 'info') => {
    setNotify({ show: true, msg, type });
    setTimeout(() => setNotify({ ...notify, show: false }), 3500);
  };

  const handleSave = () => {
    const newState = !isSaved;
    setIsSaved(newState);
    
    if (newState) {
      localStorage.setItem(`brawnly_saved_${slugValue}`, "true");
      triggerNotify("ARTICLE ADDED TO YOUR COLLECTION", 'success');
    } else {
      localStorage.removeItem(`brawnly_saved_${slugValue}`);
      triggerNotify("REMOVED FROM COLLECTION", 'info');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      triggerNotify("PERMALINK COPIED TO CLIPBOARD", 'success');
    } catch (err) {
      triggerNotify("FAILED TO COPY LINK", 'info');
    }
  };

  const initialViewsFromArticle = article?.views ?? 0;
  const { viewCount } = useArticleViews({
    id: article?.id ?? "",
    slug: slugValue,
    initialViews: initialViewsFromArticle,
  });

  const _x = {
    root: "bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500 relative selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black",
    core: "max-w-[1320px] mx-auto px-5 md:px-10",
    head: "pt-16 pb-10 border-b-[12px] border-black dark:border-white mb-10 relative",
    tag: "text-red-700 font-black uppercase text-[13px] tracking-[0.3em] mb-5 block italic",
    title: "text-[45px] md:text-[92px] leading-[0.82] font-black uppercase tracking-tighter mb-10 italic break-words",
    auth: "flex flex-col md:flex-row md:items-end justify-between py-8 border-t-2 border-black dark:border-white gap-6",
    info: "text-[12px] font-black uppercase tracking-widest flex items-center gap-5 opacity-80",
    lead: "text-[24px] md:text-[32px] leading-[1.1] font-extrabold text-neutral-900 dark:text-neutral-100 mb-14 font-sans tracking-tight",
    body: "max-w-[840px] mx-auto relative",
    text: "text-[20px] md:text-[22px] leading-[1.85] mb-10 font-serif text-neutral-800 dark:text-neutral-300",
    rail: "hidden xl:flex flex-col gap-6 sticky top-32 h-fit -ml-28 float-left border-r border-neutral-100 dark:border-neutral-900 pr-6 z-10",
    
    toast: `fixed bottom-8 right-5 md:right-10 z-[999] bg-white dark:bg-[#111] text-black dark:text-white 
            border-[3px] border-black dark:border-white px-6 py-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]
            transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) transform flex items-center gap-4 max-w-[90vw] md:max-w-md
            ${notify.show ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95 pointer-events-none"}`,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center">
          <div className="w-20 h-[3px] bg-red-600 animate-pulse mb-6" />
          <p className="text-[10px] font-black uppercase tracking-[1em] text-neutral-400">
            Fetching Editorial
          </p>
        </div>
      </div>
    );
  }

  if (!processedData || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-white dark:bg-[#0a0a0a] px-6">
        <h1 className="text-[180px] font-black leading-none tracking-tighter italic opacity-10">404</h1>
        <p className="text-xl font-black uppercase tracking-widest mb-12">Missing Content</p>
        <Link to="/" className="px-12 py-5 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[11px] tracking-widest hover:invert transition-all">
          Back to Feed
        </Link>
      </div>
    );
  }

  const {
    title,
    excerpt,
    paragraphs,
    coverImage,
    midGallery: midGalleryString,
    bottomGallery: bottomGalleryString,
  } = processedData;

  const desc = excerpt || `Brawnly 2026 Exclusive: ${title}`;
  const imgOg = getOptimizedImage(coverImage, 1200);
  const lines = paragraphs.filter((l: string) => l.trim() !== "" && l.trim() !== "&nbsp;");

  return (
    <main className={_x.root}>
      <Helmet>
        <title>{title} | Brawnly Online Magazine</title>
        <meta name="description" content={desc} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${title} | Brawnly Online Magazine`} />
        <meta property="og:image" content={imgOg} />
      </Helmet>

      <StructuredData
        article={{
          title,
          excerpt: desc,
          featured_image: imgOg,
          published_at: article.published_at,
        }}
      />

      <div className={_x.toast}>
        <div className={`p-2 rounded-full ${notify.type === 'success' ? 'bg-green-500' : 'bg-black dark:bg-white'} text-white dark:text-black`}>
          {notify.type === 'success' ? <Check size={16} strokeWidth={4} /> : <Eye size={16} strokeWidth={3} />}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">System Notification</span>
          <span className="text-[13px] font-black uppercase tracking-wide leading-none mt-1">{notify.msg}</span>
        </div>
        <button onClick={() => setNotify({ ...notify, show: false })} className="ml-auto opacity-50 hover:opacity-100">
          <X size={18} />
        </button>
      </div>

      <div className={_x.core}>
        <header className={_x.head}>
          <span className={_x.tag}>Brawnly Exclusive Selection</span>
          <h1 className={_x.title}>{title}</h1>
          
          <div className={_x.auth}>
            <div className="flex items-center gap-5">
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
              >
                <img
                  src={getOptimizedImage(myAvatar, 120)}
                  alt="Brawnly Author"
                  className="w-14 h-14 object-cover border-2 border-black dark:border-white grayscale group-hover:grayscale-0 transition-all duration-500 ease-in-out"
                />
              </motion.div>

              <div>
                <span className="block text-[15px] font-black uppercase italic">
                  By {article.author || "Brawnly Editor"}
                </span>
                <span className={_x.info}>
                  <FormattedDate dateString={article.published_at} formatString="MMMM d, yyyy" />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-8 border-l-0 md:border-l-2 border-black dark:border-white pl-0 md:pl-8">
              <div className="flex flex-col items-start md:items-end">
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">Article Reach</span>
                <span className="text-2xl font-black italic flex items-center gap-3">
                   {viewCount.toLocaleString()} <Eye size={20} className="text-red-600" />
                </span>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className={_x.core}>
        <div className="flex flex-col lg:flex-row gap-16">
          
          <article className="flex-1 relative">
            <p className={_x.lead}>{excerpt}</p>
            
            <div className="mb-16">
              <div className="p-1 border border-neutral-200 dark:border-neutral-800">
                <ArticleCoverImage
                  imageUrl={coverImage}
                  title={title}
                  slug={slugValue}
                />
              </div>
              <div className="mt-5 flex justify-between items-center border-b border-black dark:border-white pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Brawnly Digital Asset / Vol. 2026
                </p>
                <Hexagon size={14} className="animate-spin-slow" />
              </div>
            </div>

            <div className={_x.rail}>
              <button 
                onClick={handleCopyLink}
                title="Copy Article Permalink"
                className="group w-12 h-12 flex items-center justify-center bg-white dark:bg-[#0a0a0a] border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-md active:scale-95"
              >
                <Anchor size={20} className="group-hover:rotate-45 transition-transform" />
              </button>
              
              <button 
                onClick={handleSave}
                title={isSaved ? "Remove from Library" : "Save to Collection"}
                className={`group w-12 h-12 flex items-center justify-center border border-black dark:border-white transition-all shadow-md active:scale-95 ${
                  isSaved 
                  ? "bg-red-600 text-white border-red-600" 
                  : "bg-white dark:bg-[#0a0a0a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                }`}
              >
                <Bookmark 
                  size={20} 
                  fill={isSaved ? "currentColor" : "none"} 
                  className={isSaved ? "" : "group-hover:scale-110 transition-transform"}
                />
              </button>
              
              <div className="flex-1 w-[1px] bg-gradient-to-b from-black to-transparent dark:from-white mx-auto mt-2 opacity-20" />
            </div>

            <div className={_x.body}>
              {lines.map((line: string, idx: number) => {
                const markup = line
                  .trim()
                  .replace(/\*\*(.*?)\*\*/g, `<strong class="font-black text-black dark:text-white">$1</strong>`)
                  .replace(/\*(.*?)\*/g, `<em class="italic text-red-700">$1</em>`);

                return (
                  <p
                    key={idx}
                    className={_x.text}
                    dangerouslySetInnerHTML={{ __html: markup }}
                  />
                );
              })}

              {midGalleryString && (
                <div className="my-20 bg-neutral-50 dark:bg-[#111] border-l-[16px] border-black dark:border-white p-8">
                   <div className="mb-8 flex items-baseline gap-4">
                    <h4 className="font-black uppercase text-2xl tracking-tighter italic">Imagery</h4>
                    <div className="h-[2px] flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
                  </div>
                  <ArticleImageGallery
                    images={midGalleryString}
                    title=""
                    slug={slugValue}
                    downloadPrefix="brawnly_mid"
                    startIndex={1}
                    containerClassName="px-0 py-0" 
                  />
                </div>
              )}

              <div className="my-16 py-10 border-y-4 border-double border-neutral-200 dark:border-neutral-800">
                <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-center text-red-600">
                  End of Feature Part I
                </h4>
              </div>

              {bottomGalleryString && (
                <div className="mt-12 mb-24">
                   <h3 className="text-5xl font-black uppercase italic mb-10 tracking-[0.05em] border-b-4 border-black dark:border-white inline-block">
                    The Archive
                   </h3>
                  <ArticleImageGallery
                    images={bottomGalleryString}
                    title=""
                    slug={slugValue}
                    downloadPrefix="brawnly_archive"
                    startIndex={7}
                    containerClassName="px-0 py-0"
                  />
                </div>
              )}
            </div>

            <section className="mt-32 border-t-[12px] border-black dark:border-white pt-16">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
                  Dialogue
                </h2>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Community Guidelines</p>
                  <p className="text-xs font-bold italic">Join the Brawnly conversation below.</p>
                </div>
              </div>
              <CommentSection articleId={article.id} />
            </section>
          </article>

          <aside className="hidden lg:block w-[350px]">
            <div className="sticky top-32">
              <div className="mb-14 border-t-4 border-black dark:border-white pt-6">
                <h3 className="text-[14px] font-black uppercase tracking-widest text-red-700 mb-8 italic underline decoration-2">
                  Hot Content
                </h3>
                <div className="flex flex-col gap-10">
                  {hotContent.map((item: any, i: number) => (
                    <Link to={`/article/${item.slug}`} key={item.id} className="group cursor-pointer block">
                      <div className="flex gap-5">
                        <span className="text-4xl font-black text-neutral-100 dark:text-neutral-900 group-hover:text-red-600 transition-colors">
                          0{i + 1}
                        </span>
                        <div>
                          <p className="text-[15px] font-black leading-tight uppercase group-hover:underline line-clamp-2">
                            {item.title}
                          </p>
                          <span className="text-[10px] font-bold text-neutral-400 mt-1 block">
                             {item.views} READS
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="p-8 bg-black text-white dark:bg-white dark:text-black shadow-2xl">
                <h4 className="text-[12px] font-black uppercase mb-5 tracking-[0.2em]">Weekly Briefing</h4>
                <p className="text-sm mb-6 font-medium leading-snug opacity-80">
                  Direct intelligence from the Brawnly Editorial desk.
                </p>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="ENTER MAIL" 
                    className="w-full bg-transparent border-b-2 border-white dark:border-black py-3 text-[12px] font-black focus:outline-none placeholder:opacity-30"
                  />
                  <button className="absolute right-0 bottom-3 hover:scale-125 transition-transform">
                    <Link2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mt-12 flex justify-center opacity-10">
                 <Hexagon size={120} strokeWidth={1} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer className="mt-32 border-t border-neutral-200 dark:border-neutral-900 py-16">
        <div className={_x.core}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-600 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-[0.6em]">
                  Brawnly Editorial © 2026
                </span>
             </div>
             <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest opacity-50">
                <Link to="/terms" className="hover:opacity-100 hover:text-red-600 transition-all">Terms</Link>
                <Link to="/privacy" className="hover:opacity-100 hover:text-red-600 transition-all">Privacy</Link>
                <Link to="/ethics" className="hover:opacity-100 hover:text-red-600 transition-all">Ethics</Link>
             </div>
          </div>
        </div>
      </footer>
      <ScrollToTopButton />
    </main>
  );
}