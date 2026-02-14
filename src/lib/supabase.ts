import { createClient } from "@supabase/supabase-js";

const _URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const _KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const _CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const _PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

// Biarkan log ini untuk memastikan ENV terbaca di Vercel
console.log("Supabase URL Check:", _URL); 
console.log("Supabase Key Check:", _KEY ? "EXISTS" : "MISSING");

if (!_URL || !_KEY) {
  console.error("🚨 [SUPABASE] FATAL: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(_URL || "", _KEY || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  // BAGIAN HEADERS DIHAPUS karena merusak auth flow SDK
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const CLOUDINARY_CONFIG = {
  cN: _CLOUD_NAME,
  uP: _PRESET,
  rD: "res.cloudinary.com",
  baseUrl: _CLOUD_NAME ? `https://res.cloudinary.com/${_CLOUD_NAME}/image/upload` : "",
  uploadUrl: _CLOUD_NAME ? `https://api.cloudinary.com/v1_1/${_CLOUD_NAME}/image/upload` : "",
};

export const uploadToCloudinary = async (_f: File) => {
  if (!_CLOUD_NAME || !_PRESET) {
    throw new Error("ERR_ENV_CLOUDINARY");
  }

  const _fD = new FormData();
  _fD.append("file", _f);
  _fD.append("upload_preset", _PRESET);
  _fD.append("folder", "brawnly_uploads");

  try {
    const _r = await fetch(CLOUDINARY_CONFIG.uploadUrl, { 
      method: "POST", 
      body: _fD 
    });
    if (!_r.ok) throw new Error("ERR_UP_FAILED");
    return await _r.json();
  } catch (err) {
    console.error("[CLOUDINARY] Network Error:", err);
    throw err;
  }
};