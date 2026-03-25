// ─── WASM imports are DYNAMIC (lazy) ────────────────────────────────────────
// Previously: top-level `import { encode as encodeAvif } from "@jsquash/avif"`
//             top-level `import * as _webp from "@jsquash/webp"`
//
// Problem: top-level WASM imports are evaluated immediately when the module
// is first imported. Since wasmImagePipeline is imported by ArticleDetail,
// and ArticleDetail is lazy-loaded, the WASM was still being fetched and
// compiled on the main thread during article page hydration — contributing
// to Script Evaluation 4,659ms in Lighthouse.
//
// Fix: convert to dynamic imports inside each function. WASM is only fetched
// and compiled the FIRST time the function is actually called (e.g. when
// user opens an article with a cover image), not at module evaluation time.
// Subsequent calls reuse the cached module — no repeated compilation cost.
// ─────────────────────────────────────────────────────────────────────────────

// Module-level lazy cache — initialized once, reused across all calls
let _webpModule: typeof import("@jsquash/webp") | null = null;
let _avifModule: typeof import("@jsquash/avif") | null = null;

async function _getWebp() {
  if (!_webpModule) _webpModule = await import("@jsquash/webp");
  return _webpModule;
}

async function _getAvif() {
  if (!_avifModule) _avifModule = await import("@jsquash/avif");
  return _avifModule;
}

async function blobToImageData(blob: Blob): Promise<ImageData> {
  const bmp = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0);
  return ctx.getImageData(0, 0, bmp.width, bmp.height);
}

export async function wasmCreatePlaceholder(blob: Blob): Promise<string> {
  const _webp = await _getWebp();
  const img = await blobToImageData(blob);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(await createImageBitmap(blob), 0, 0, canvas.width, canvas.height);

  const buf = await _webp.encode(ctx.getImageData(0, 0, canvas.width, canvas.height), {
    quality: 90
  });
  return URL.createObjectURL(new Blob([buf], { type: "image/webp" }));
}

export async function wasmTranscodeImage(
  file: Blob,
  format: "webp" | "avif",
  quality?: number
): Promise<Blob> {
  try {
    const img = await blobToImageData(file);

    if (format === "avif") {
      const { encode: encodeAvif } = await _getAvif();
      const _q = quality ? Math.max(quality * 100, 80) : 85;
      const buf = await encodeAvif(img, {
        quality: _q,
        speed: 5
      });
      return new Blob([buf], { type: "image/avif" });
    }

    if (format === "webp") {
      const _webp = await _getWebp();
      const _q = quality ? Math.max(quality * 100, 85) : 90;
      const buf = await _webp.encode(img, {
        quality: _q
      });
      return new Blob([buf], { type: "image/webp" });
    }

    return file;
  } catch (e) {
    console.error(e);
    return file;
  }
}