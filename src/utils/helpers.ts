export const LANGS = ["en", "id", "zh", "ja", "ko", "es", "fr", "de", "ru", "ar", "th", "vi"] as const;
export type LangCode = (typeof LANGS)[number];

/* ======================
    
   ====================== */
const _0xcore = [
    'https://', 
    '.supabase.co/storage/v1/object/public/', 
    'zlwhvkexgjisyhakxyoe',
    'reverse', 
    'split', 
    'join'
] as const;

const _h = (i: number) => _0xcore[i] as any;

const _get_base = () => {
    const _p = _h(2);
    const _d = _h(1); 
    const _s = _h(0); 
    return `${_s}${_p}${_d}`;
};

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
        return "";
    }
};

export const generateFullImageUrl = (relativePath: string): string => {
    if (!relativePath) return '';
    
    if (relativePath.startsWith('http')) {
        return cleanAndValidateUrl(relativePath);
    }

    const cleanPath = relativePath.trim().replace(/[, ]+$/, '');
    const _B = _get_base();
    const fullUrl = `${_B}${cleanPath}`;
    
    return cleanAndValidateUrl(fullUrl);
};