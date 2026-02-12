import { createClient } from "@supabase/supabase-js";

const _0xS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_CLOUDINARY_CLOUD_NAME",
  "VITE_CLOUDINARY_PRESET",
  "persistSession",
  "autoRefreshToken",
  "detectSessionInUrl",
] as const;

const _gS = (_i: number) => _0xS[_i] as string;

const _U = import.meta.env[_gS(0)] || "";
const _K = import.meta.env[_gS(1)] || "";
const _N = import.meta.env[_gS(2)] || "";
const _P = import.meta.env[_gS(3)] || "";

export const supabase = createClient(_U, _K, {
  auth: {
    [_gS(4)]: true,
    [_gS(5)]: true,
    [_gS(6)]: true,
  },
  realtime: { params: { eventsPerSecond: 2 } },
  global: {
    fetch: (..._a) => {
      if (!navigator.onLine) return Promise.reject(new Error("OFFLINE"));
      return fetch(..._a);
    },
  },
});

export const CLOUDINARY_CONFIG = {
  cN: _N,
  uP: _P,
  rD: "res.cloudinary.com",
  baseUrl: _N ? `https://res.cloudinary.com/${_N}/image/upload` : "",
  uploadUrl: _N ? `https://api.cloudinary.com/v1_1/${_N}/image/upload` : "",
};

export const uploadToCloudinary = async (_f: File) => {
  if (!_N || !_P) throw new Error("ERR_ENV");
  const _fD = new FormData();
  _fD.append("file", _f);
  _fD.append("upload_preset", _P);
  const _r = await fetch(CLOUDINARY_CONFIG.uploadUrl, { method: "POST", body: _fD });
  if (!_r.ok) throw new Error("ERR_UP");
  return _r.json();
};