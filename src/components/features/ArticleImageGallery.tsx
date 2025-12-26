import React from 'react';
import { useTranslation } from "react-i18next";
import { generateFullImageUrl } from '@/utils/helpers'; 
import { useSaveData } from '@/hooks/useSaveData';
import { getOptimizedImage } from '@/lib/utils';

interface ArticleImageGalleryProps {
  images: string; 
  title: string;
  slug: string;
  containerClassName?: string;
  downloadPrefix: string;
  startIndex: number;
}

const ArticleImageGallery: React.FC<ArticleImageGalleryProps> = ({ 
  images: rawImagesString, 
  title, 
  slug, 
  containerClassName = "px-0 py-0",
  downloadPrefix,
  startIndex
}) => {
  const { t } = useTranslation();
  const { isEnabled, saveData } = useSaveData(); 

  const imagePaths = rawImagesString 
    ? rawImagesString.split(/[\r\n]+/) 
                     .map(path => path.trim())
                     .filter(path => path.length > 0)
    : [];

  if (imagePaths.length === 0) return null;

  return (
    /* REVISI: 
      1. Menambahkan 'overflow-hidden' agar transformasi gambar tidak membuat scrollbar liar.
      2. Memastikan leading-[0] untuk mematikan celah font descender.
    */
    <div className={`${containerClassName} leading-[0] block overflow-hidden`}>
      {title && title.trim() !== "" && (
        <h2 className="text-lg font-black uppercase mb-4 text-gray-900 dark:text-white tracking-tight leading-normal">
          {t(title)}
        </h2>
      )}
      
      {/* REVISI GRID:
        1. Menghapus max-w-[600px] agar gallery memenuhi 800px (lebar artikel).
        2. Menggunakan 'place-items-start' untuk memastikan tidak ada stretch otomatis yang aneh.
        3. mb-0 dan pb-0 untuk merapatkan ke komponen berikutnya.
      */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 w-full mb-0 pb-0 place-items-start">
        {imagePaths.map((relativePath: string, i: number) => {
          const highQualityUrl = generateFullImageUrl(relativePath); 
          if (!highQualityUrl) return null;

          const isLowQualityMode = isEnabled && saveData.quality === 'low';
          const targetWidth = isLowQualityMode ? 200 : 400;
          const displayUrl = getOptimizedImage(highQualityUrl, targetWidth);

          return (
            <div 
              key={i} 
              className="w-full aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 group relative"
            >
              <a 
                href={highQualityUrl} 
                download={`fitapp_${slug}_${downloadPrefix}_${startIndex + i}.jpg`} 
                className="block w-full h-full" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img 
                  src={displayUrl} 
                  loading="lazy" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt={`${t("Gallery image")} ${startIndex + i}`} 
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  /* Inline style untuk smooth fade-in saat load */
                  style={{ opacity: 0, transition: 'opacity 0.5s', display: 'block' }}
                />
                
                {/* Overlay tipis saat hover agar efek interaktif lebih terasa */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArticleImageGallery;