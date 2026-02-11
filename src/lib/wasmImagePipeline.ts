import { encode as encodeAvif } from "@jsquash/avif";
import * as _webp from "@jsquash/webp"; // Gunakan Namespace Import

/* ======================
    BLOB → ImageData
   ====================== */
async function blobToImageData(blob: Blob): Promise<ImageData> {
  const bmp = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0);

  return ctx.getImageData(0, 0, bmp.width, bmp.height);
}

/* ======================
    MAIN TRANSCODER
   ====================== */

/**
 * Pipeline WASM untuk konversi gambar.
 * Menggunakan Namespace Import untuk mengatasi error "no default export".
 */
export async function wasmTranscodeImage(
  file: Blob,
  format: "webp" | "avif",
  quality?: number
): Promise<Blob> {
  try {
    const img = await blobToImageData(file);

    /* ========= AVIF ========= */
    if (format === "avif") {
      const _q = quality ? quality * 100 : 45;
      const buf = await encodeAvif(img, {
        quality: _q,
        speed: 6
      });
      return new Blob([buf], { type: "image/avif" });
    }

    /* ========= WEBP ========= */
    if (format === "webp") {
      const _q = quality ? quality * 100 : 82;
      
      // Panggil fungsi encode dari namespace _webp
      // Ini akan menghilangkan error TS "no default export"
      const buf = await _webp.encode(img, {
        quality: _q
      });

      return new Blob([buf], { type: "image/webp" });
    }

    return file;
  } catch (e) {
    console.error("WASM Pipeline Failure, falling back to original:", e);
    return file; 
  }
}