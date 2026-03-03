import { createClient } from "@supabase/supabase-js";

const _URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const _KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const _CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const _PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

if (import.meta.env.DEV) {
  console.log("Supabase URL Check:", _URL);
  console.log("Supabase Key Check:", _KEY ? "EXISTS" : "MISSING");
}

if (!_URL || !_KEY) {
  if (import.meta.env.DEV) {
    console.error("🚨 [SUPABASE] FATAL: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
  }
}

export const supabase = createClient(_URL || "", _KEY || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  global: {
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      return fetch(url, { ...options, signal: controller.signal }).finally(() =>
        clearTimeout(timeout)
      );
    },
  },
  db: {
    schema: "public",
  },
});

export const CLOUDINARY_CONFIG = {
  cN: _CLOUD_NAME,
  uP: _PRESET,
  rD: "res.cloudinary.com",
  baseUrl: _CLOUD_NAME
    ? `https://res.cloudinary.com/${_CLOUD_NAME}/image/upload`
    : "",
  uploadUrl: _CLOUD_NAME
    ? `https://api.cloudinary.com/v1_1/${_CLOUD_NAME}/image/upload`
    : "",
};

let _uploadController: AbortController | null = null;

export const uploadToCloudinary = async (_f: File) => {
  if (!_CLOUD_NAME || !_PRESET) {
    throw new Error("ERR_ENV_CLOUDINARY");
  }

  if (_uploadController) {
    _uploadController.abort();
  }
  _uploadController = new AbortController();

  const _fD = new FormData();
  _fD.append("file", _f);
  _fD.append("upload_preset", _PRESET);
  _fD.append("folder", "brawnly_uploads");

  try {
    const _r = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: "POST",
      body: _fD,
      signal: _uploadController.signal,
    });
    if (!_r.ok) throw new Error("ERR_UP_FAILED");
    return await _r.json();
  } catch (err) {
    if ((err as any)?.name !== "AbortError") {
      if (import.meta.env.DEV) {
        console.error("[CLOUDINARY] Network Error:", err);
      }
    }
    throw err;
  } finally {
    _uploadController = null;
  }
};