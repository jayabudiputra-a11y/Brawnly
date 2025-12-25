import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Logika untuk mengecek apakah kunci terbaca di browser
if (!supabaseAnonKey || supabaseAnonKey === "undefined") {
  console.error("CRITICAL: Kunci VITE_SUPABASE_ANON_KEY tidak ditemukan oleh Vite!");
}

export const supabase = createClient(
  supabaseUrl || "", 
  supabaseAnonKey || "",
  {
    global: {
      headers: {
        // Memaksa header apikey ada di setiap request
        'apikey': supabaseAnonKey || "",
        'Authorization': `Bearer ${supabaseAnonKey || ""}`
      }
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);