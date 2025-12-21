export const LANGS = ["en", "id", "zh", "ja", "ko", "es", "fr", "de", "ru", "ar", "th", "vi"] as const;
export type LangCode = (typeof LANGS)[number];

const SUPABASE_BASE_URL = 'https://zlwhvkexgjisyhakxyoe.supabase.co/storage/v1/object/public/';

export const cleanAndValidateUrl = (url: string): string => {
    if (!url) return "";
    const trimmedUrl = url.trim();

    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
        return "";
    }
    
    try {
        const urlObj = new URL(trimmedUrl);
        
        const pathSegments = urlObj.pathname.split('/');
        
        const encodedPath = pathSegments.map(segment => {
            if (!segment) return '';
            return encodeURIComponent(decodeURIComponent(segment));
        }).join('/');

        urlObj.pathname = encodedPath;
        return urlObj.toString();
    } catch (e) {
        console.error("URL encoding failed for:", trimmedUrl, e);
        return "";
    }
};

export const getLowQualityUrl = (url: string): string => {
    const cleanedUrl = cleanAndValidateUrl(url);
    if (!cleanedUrl) return "";

    try {
        const urlObj = new URL(cleanedUrl);
        urlObj.searchParams.set('quality', 'low');
        urlObj.searchParams.set('format', 'webp');
        return urlObj.toString();
    } catch (e) {
        console.error("Failed to append low quality parameter:", url, e);
        return cleanedUrl;
    }
};

export const generateFullImageUrl = (relativePath: string): string => {
    if (!relativePath) return '';
    
    const cleanPath = relativePath.trim().replace(/[, ]+$/, '');
    
    const fullUrl = `${SUPABASE_BASE_URL}${cleanPath}`;
    
    return cleanAndValidateUrl(fullUrl);
};