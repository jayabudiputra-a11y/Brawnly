// ─── WASM import is DYNAMIC (lazy) ───────────────────────────────────────────
// Previously: top-level `import { encode as encodeWebp } from "@jsquash/webp"`
//
// Same fix as wasmImagePipeline.ts — WASM only compiled on first actual call,
// not at module evaluation time. Saves ~85KB JS evaluation on startup.
// ─────────────────────────────────────────────────────────────────────────────

// Module-level lazy cache — shared with wasmImagePipeline if bundled together
let _webpModule: typeof import("@jsquash/webp") | null = null;

async function _getWebp() {
  if (!_webpModule) _webpModule = await import("@jsquash/webp");
  return _webpModule;
}

/* ======================
    VIDEO FRAME EXTRACTOR
   ====================== */

/**
 * Mengambil satu frame dari file video atau URL video.
 * Digunakan untuk membuat thumbnail instan sebelum transcode WASM.
 */
async function extractFrameFromVideo(file: Blob): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      video.currentTime = 1;
    };

    video.onseeked = () => {
      const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);

      const imgData = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
      URL.revokeObjectURL(url);
      resolve(imgData);
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
  });
}

/* ======================
    MAIN VIDEO PIPELINE
   ====================== */

/**
 * Pipeline WASM khusus untuk Video Facade (FB Offline Style).
 * Mengonversi video menjadi Thumbnail WebP yang sangat ringan (Slashing Quality).
 */
export async function wasmVideoToThumbnail(
  videoFile: Blob,
  quality: number = 0.25 // Default 1/4 quality untuk penghematan ekstrem
): Promise<Blob> {
  try {
    // 1. Ekstrak Frame dari Video
    const frameData = await extractFrameFromVideo(videoFile);

    // 2. Transcode ke WebP menggunakan WASM jSquash (lazy-loaded)
    const { encode: encodeWebp } = await _getWebp();
    const _q = quality * 100;

    const buf = await encodeWebp(frameData, {
      quality: _q, // 25% kualitas agar sangat ringan untuk offline cache
    });

    return new Blob([buf], { type: "image/webp" });

  } catch (error) {
    console.error("WASM Video Pipeline Failed:", error);
    return new Blob([], { type: "image/webp" });
  }
}

/**
 * Helper untuk menghitung estimasi penghematan memori
 */
export function calculateSlashingSize(originalSize: number, newSize: number): string {
  const saved = ((originalSize - newSize) / originalSize) * 100;
  return `${saved.toFixed(2)}% Data Slashed`;
}