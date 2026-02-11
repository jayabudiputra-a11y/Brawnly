import { createClient } from "@supabase/supabase-js";

/* ======================
    ENGINE
   ====================== */
const _0xsys = [
  "VITE_SUPABASE_URL", 
  "VITE_SUPABASE_ANON_KEY",
  "persistSession",
  "autoRefreshToken",
  "detectSessionInUrl"
] as const;

const _s = (i: number) => _0xsys[i] as string;

const _u = import.meta.env[_s(0)];
const _k = import.meta.env[_s(1)];

/**
 * BRAWNLY SUPABASE ENGINE (V2)
 * Terintegrasi dengan Offline Protection & Realtime Optimization
 */
export const supabase = createClient(
  _u || "", 
  _k || "", 
  {
    auth: {
      [_s(2)]: true,      
      [_s(3)]: true,      
      [_s(4)]: true,      
    },
    // 1. PROTEKSI REALTIME: Mencegah serangan retry berlebih saat offline
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
    // 2. GLOBAL FETCH WRAPPER: Pencegah error merah di konsol saat offline
    global: {
      fetch: (...args) => {
        // Jika sensor browser mendeteksi offline, jangan kirim request ke Supabase
        if (!navigator.onLine) {
          return Promise.reject(new Error("OFFLINE_MODE: Request Aborted to save resources."));
        }
        return fetch(...args);
      },
    },
  }
);