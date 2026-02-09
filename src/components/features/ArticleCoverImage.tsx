import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { getOptimizedImage } from '@/lib/utils';
import { useSaveData } from '@/hooks/useSaveData';

interface ArticleCoverImageProps {
  imageUrl?: string | null;
  title: string;
  slug: string;
}

const ArticleCoverImage: React.FC<ArticleCoverImageProps> = ({ imageUrl, title, slug }) => {
  const { isEnabled, saveData } = useSaveData();
  const [isLoaded, setIsLoaded] = useState(false);

  const safeHighQualityUrl = React.useMemo(() => {
    if (!imageUrl || typeof imageUrl !== 'string') return null;
    return imageUrl.split(/[\r\n]+/)[0].trim();
  }, [imageUrl]);

  if (!safeHighQualityUrl) return null;

  const isLowQualityMode = isEnabled && saveData.quality === 'low';
  const targetWidth = isLowQualityMode ? 480 : 900;
  const displayUrl = getOptimizedImage(safeHighQualityUrl, targetWidth);

  return (
    <div className="w-full mb-6">
      <Card variant="shadow" className="p-0 overflow-hidden border-none shadow-xl dark:shadow-neutral-900/50">
        <a 
          href={safeHighQualityUrl} 
          className="block w-full h-full cursor-zoom-in" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <div className={`aspect-[16/9] bg-neutral-100 dark:bg-neutral-900 overflow-hidden ${!isLoaded ? 'animate-pulse' : ''}`}>
            <img 
              src={displayUrl} 
              alt={title} 
              className={`w-full h-full object-cover !m-0 transition-opacity duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
              loading="eager" 
              {...({ fetchpriority: "high" } as any)}
              width="900"
              height="506"
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                setIsLoaded(true); 
                e.currentTarget.style.opacity = '0.5';
                e.currentTarget.parentElement?.classList.add('bg-neutral-200');
              }}
            />
          </div>
        </a>
      </Card>
      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-600 font-bold text-center">
        Brawnly Visual Content — {slug.replace(/-/g, ' ')}
      </p>
    </div>
  );
};

export default ArticleCoverImage;