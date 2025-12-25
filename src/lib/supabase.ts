import { createClient } from "@supabase/supabase-js";

// JANGAN GUNAKAN import.meta.env SEMENTARA
// Masukkan string langsung dari .env.local Anda
const supabaseUrl = "https://zlwhvkexgjisyhakxyoe.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // PASTE KEY LENGKAP DI SINI

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Matikan sesi agar error 403 berhenti looping
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
});