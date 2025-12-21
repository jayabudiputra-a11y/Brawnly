

import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

import { cleanAndValidateUrl } from "@/utils/helpers"; 
import type { LangCode } from "@/utils/helpers"; 
import type { Article } from "@/components/features/ArticleDetail"; 


export const useArticleData = () => {
    const { slug } = useParams<{ slug: string }>();
    const { i18n, t } = useTranslation();
    const lang = (i18n.language as LangCode) || "en";
    
    const { data: article, isLoading } = useQuery<Article | null>({ 
        queryKey: ["article", slug],
        queryFn: async () => {
            const { data } = await supabase
                .from("articles_denormalized") 
                .select("*")
                .eq("slug", slug!)
                .maybeSingle();
            return data as Article | null;
        },
        enabled: !!slug,
        retry: false,
    });
    
    const getField = (base: string) => {
        if (!article) return '';
        const articleFields = article as Article & Record<string, any>; 
        const langKey = lang === 'en' ? '' : `_${lang}`; 
        
        return articleFields[`${base}${langKey}`] || 
             articleFields[`${base}_en`] || 
             articleFields[base];
    }

    const processedData = useMemo(() => {
        if (!article) {
            return null;
        }

        const title = getField("title") || t("Article Title");
        const excerpt = getField("excerpt") || t("A short excerpt about the article.");
        const content = getField("content") || t("Content not available.");


        const coverImage = article.featured_image_url_clean ?? undefined; 
        
        const allPaths: string[] = article.featured_image_path_clean
            ? article.featured_image_path_clean
                .split(/[\r\n]+/) 
                .map(path => path.trim()) 
                .filter(path => path.length > 0) 
            : [];
        
        const galleryPaths = allPaths.slice(1); 
        
        const midGallery: string = galleryPaths.slice(0, 5).join('\r\n'); 
        
        const bottomGallery: string = galleryPaths.slice(5).join('\r\n'); 

        const paragraphs = content
            .replace(/\r\n/g, "\n")
            .replace(/\\n/g, "\n")
            .split("\n")
            .filter(Boolean);

        return {
            article,
            title,
            excerpt,
            content,
            paragraphs,
            coverImage,     
            midGallery,     
            bottomGallery,  
        };
    }, [article, lang, t]);

    return { 
        processedData, 
        isLoading, 
        article: article, 
    };
};
