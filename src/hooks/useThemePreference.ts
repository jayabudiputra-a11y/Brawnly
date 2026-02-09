import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Theme = "light" | "dark";

/* ======================
    ENGINE
   ====================== */
const _0xpref = [
    'user_preferences', 
    'user_id',          
    'theme',            
    'updated_at',       
    'Brawnly_guest_id'   
] as const;

const _p = (i: number) => _0xpref[i] as any;

const getGuestId = () => {
  const _G = _p(4);
  let guestId = localStorage.getItem(_G);
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem(_G, guestId);
  }
  return guestId;
};

export const useThemePreference = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(_p(2)) as Theme) || "light";
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const identifier = session?.user?.id ?? getGuestId();
      setUserId(identifier);

      // Menggunakan obfuscated table & column name
      const { data } = await (supabase.from(_p(0)) as any)
        .select(_p(2))
        .eq(_p(1), identifier)
        .maybeSingle();

      if (data && data[_p(2)] && data[_p(2)] !== theme) {
        applyTheme(data[_p(2)] as Theme);
      }
    };

    init();
  }, []);

  const applyTheme = (value: Theme) => {
    setTheme(value);
    document.documentElement.classList.toggle("dark", value === "dark");
    localStorage.setItem(_p(2), value);
  };

  const toggleTheme = async () => {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);

    if (!userId) return;

    await (supabase.from(_p(0)) as any).upsert(
      {
        [_p(1)]: userId,
        [_p(2)]: next,
        [_p(3)]: new Date().toISOString(),
      },
      { onConflict: _p(1) }
    );
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };
};