import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Theme = "light" | "dark";
const GUEST_ID_KEY = "fitapp_guest_id";

const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

export const useThemePreference = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "light";
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

      const { data } = await supabase
        .from("user_preferences")
        .select("theme")
        .eq("user_id", identifier)
        .maybeSingle();

      if (data?.theme && data.theme !== theme) {
        applyTheme(data.theme as Theme);
      }
    };

    init();
  }, []);

  const applyTheme = (value: Theme) => {
    setTheme(value);
    document.documentElement.classList.toggle("dark", value === "dark");
    localStorage.setItem("theme", value);
  };

  const toggleTheme = async () => {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);

    if (!userId) return;

    await supabase.from("user_preferences").upsert(
      {
        user_id: userId,
        theme: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };
};
