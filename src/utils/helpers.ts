export const LANGS = ["en", "id", "zh", "ja", "ko", "es", "fr", "de", "ru", "ar", "th", "vi"] as const;
export type LangCode = (typeof LANGS)[number];

/* ======================
    BRAWNLY URL ENGINE
   ====================== */
const _0xcore = [
    'https://', 
    '.supabase.co/storage/v1/object/public/', 
    'zlwhvkexgjisyhakxyoe',
    'reverse', 
    'split', 
    'join',
    'cloudinary.com' // 6
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

/**
 * SMART REDIRECT ENGINE
 * Mengubah link Supabase menjadi Cloudinary secara otomatis
 */
export const generateFullImageUrl = (relativePath: string): string => {
    if (!relativePath) return '';
    
    const _SB_DOM = _h(2); // 'zlwhvkexgjisyhakxyoe'
    if (relativePath.includes(_SB_DOM)) {
        return "https://res.cloudinary.com/dtkiwn8i4/image/upload/v1770883496/mmwxnbhyhu6yewzmy6d0.jpg";
    }

    // 2. Cek jika sudah link Cloudinary (hasil upload baru)
    if (relativePath.includes(_h(6))) {
        return cleanAndValidateUrl(relativePath);
    }

    // 3. Jika input adalah URL lengkap (seperti YouTube thumbnail), biarkan saja
    if (relativePath.startsWith('http')) {
        return cleanAndValidateUrl(relativePath);
    }

    // 4. Logika original untuk menyusun path (fallback jika bukan Supabase/Cloudinary)
    const cleanPath = relativePath.trim().replace(/[, ]+$/, '');
    const _B = _get_base();
    const fullUrl = `${_B}${cleanPath}`;
    
    return cleanAndValidateUrl(fullUrl);
};