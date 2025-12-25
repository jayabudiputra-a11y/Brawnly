import { createClient } from "@supabase/supabase-js";

// Mengambil variabel environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validasi ketat: 
 * Jika key tidak ada, kita beri tahu di console agar tidak menebak-nebak
 * tapi jangan biarkan aplikasi mengirim request kosong.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "FATAL ERROR: Supabase URL or Anon Key is missing!\n" +
    "Check your Vercel Environment Variables and ensure they start with VITE_"
  );
}

/**
 * REVISI STRUKTUR:
 * 1. Kita hapus header 'global' manual karena library supabase-js 
 * secara otomatis mengisi apikey jika parameter kedua sudah benar.
 * 2. Kita tambahkan pengecekan runtime agar apikey tidak pernah 'undefined'.
 */
export const supabase = createClient(
  supabaseUrl || "", 
  supabaseAnonKey || "", 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Memastikan cookie digunakan dengan benar di lingkungan produksi
      storageKey: 'fitapp-auth-token', 
    }
  }
);