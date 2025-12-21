// D:\projects\fitapp-2025\src\components\features\ArticleImageGallery.tsx (REVISI ROBUSTNESS)

import React from 'react';
import { useTranslation } from "react-i18next";
import Card from '@/components/ui/Card';
// Import fungsi helper yang baru
import { generateFullImageUrl, getLowQualityUrl } from '@/utils/helpers'; 
import { useSaveData } from '@/hooks/useSaveData';

interface ArticleImageGalleryProps {
  // Prop ini sekarang berisi string path dipisahkan oleh line break (\r\n) dari hook data
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
  containerClassName = "px-6 pb-10 pt-4",
  downloadPrefix,
  startIndex
}) => {
  const { t } = useTranslation();
  const { isEnabled, saveData } = useSaveData(); 

  // *** PERBAIKAN ROBUSTNESS: Menggunakan Regex untuk memisahkan semua jenis line break ***
  const imagePaths = rawImagesString 
    ? rawImagesString.split(/[\r\n]+/) // Menggunakan Regex untuk memisahkan dengan \r atau \n
                     .map(path => path.trim())
                     .filter(path => path.length > 0)
    : [];

  if (imagePaths.length === 0) {
    return null;
  }

  return (
    <div className={containerClassName}>
      <h2 className="text-xl font-bold mb-4 text-gray-900">{t(title)}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {imagePaths.map((relativePath: string, i: number) => {
            
            // 3. Buat URL Lengkap (kualitas tinggi)
            const highQualityUrl = generateFullImageUrl(relativePath); 
            
            // Jika URL berkualitas tinggi tidak valid, skip
            if (!highQualityUrl) return null;

            // 4. Tentukan URL yang akan dimuat
            const isLowQualityMode = isEnabled && saveData.quality === 'low';
            
            const displayUrl = isLowQualityMode 
                    ? getLowQualityUrl(highQualityUrl) 
                    : highQualityUrl; 

            const downloadUrl = highQualityUrl; 

            return (
                <Card key={i} variant="shadow" className="p-0 aspect-[4/5] overflow-hidden group">
                    <a 
                        href={downloadUrl} 
                        download={`fitapp_${slug}_${downloadPrefix}_${startIndex + i}.jpg`} 
                        className="block w-full h-full" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <img 
                            src={displayUrl} 
                            loading="lazy" 
                            className="w-full h-full object-cover !m-0 transition-transform duration-300 group-hover:scale-[1.03]" 
                            alt={`${t("Gallery image")} ${startIndex + i}`} 
                        />
                    </a>
                </Card>
            )})}
      </div>
    </div>
  );
};

export default ArticleImageGallery;