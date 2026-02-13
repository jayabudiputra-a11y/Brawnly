import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const _0xM = ["cloudinary.com", "/upload/", "c_scale,w_", ",q_auto,f_auto/"] as const;
const _gM = (_i: number) => _0xM[_i];

export function cn(..._in: ClassValue[]) {
  return twMerge(clsx(_in));
}

export function formatDate(_d: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(_d));
}

export function readingTime(_c: string): number {
  const _w = _c.trim().split(/\s+/).length;
  return Math.ceil(_w / 200);
}

export function truncate(_s: string, _l: number): string {
  return _s.length > _l ? _s.substring(0, _l) + "..." : _s;
}

export function slugify(_t: string): string {
  return _t.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
}

// FIX: Tambahkan nilai default '_w: number = 1200' agar parameter ini opsional
export function getOptimizedImage(_u: string | null | undefined, _w: number = 1200): string {
  if (!_u) return "";
  const _D = _gM(0);
  const _U = _gM(1);
  const _T = _gM(2);
  const _Q = _gM(3);

  if (!_u.includes(_D)) return _u;
  
  if (_u.includes(_T) || _u.includes("w_")) return _u;

  if (_u.includes(_U)) {
    const _p = _u.split(_U);
    return `${_p[0]}${_U}${_T}${_w}${_Q}${_p[1]}`;
  }

  return _u;
}