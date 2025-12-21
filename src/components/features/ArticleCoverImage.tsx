// D:\projects\fitapp-2025\src\components\features\ArticleCoverImage.tsx (REVISI FINAL UNTUK MENGHINDARI REDUNDANSI URL)

import React from 'react';
import Card from '@/components/ui/Card';
import { getLowQualityUrl } from '@/utils/helpers'; 
import { useSaveData } from '@/hooks/useSaveData'; 
// ----------------------

interface ArticleCoverImageProps {
  imageUrl?: string | null;
  title: string;
  slug: string;
}

const ArticleCoverImage: React.FC<ArticleCoverImageProps> = ({ imageUrl, title, slug }) => {
    // 1. Panggil hook useSaveData
    const { isEnabled, saveData } = useSaveData(); 

  if (!imageUrl) {
    return null;
  }
    
    const highQualityUrl = imageUrl; 
    
    let safeHighQualityUrl = highQualityUrl.split('\r\n')[0].trim();
    
    if (safeHighQualityUrl.length === 0) {
        return null;
    }

    const isLowQualityMode = isEnabled && saveData.quality === 'low';
            
    const displayUrl = isLowQualityMode 
        ? getLowQualityUrl(safeHighQualityUrl) // Tambahkan ?quality=low ke URL lengkap
        : safeHighQualityUrl; // Gunakan URL kualitas tinggi

  return (
    <div className="px-6 pt-6">
      <Card variant="shadow" className="p-0">
        <a 
          // Link download selalu menggunakan URL kualitas tinggi
          href={safeHighQualityUrl} 
          download={`fitapp_${slug}_cover.jpg`} 
          className="block w-full h-full" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <div className="aspect-[16/9] bg-gray-100 animate-pulse">
            <img 
              src={displayUrl} 
              alt={title} 
              className="w-full h-full object-cover !m-0 transition-opacity duration-300" 
              loading="eager" 
              onLoad={(e) => e.currentTarget.style.opacity = '1'}
              onError={(e) => {
                  e.currentTarget.style.opacity = '0.5'; 
                  console.error("Gagal memuat cover image:", displayUrl);
              }}
              style={{ opacity: 0 }}
            />
          </div>
        </a>
      </Card>
    </div>
  );
};

export default ArticleCoverImage;