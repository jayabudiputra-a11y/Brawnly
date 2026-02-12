import { encode as encodeAvif } from "@jsquash/avif";
import * as _webp from "@jsquash/webp";

async function blobToImageData(blob: Blob): Promise<ImageData> {
  const bmp = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0);

  return ctx.getImageData(0, 0, bmp.width, bmp.height);
}

export async function wasmCreatePlaceholder(blob: Blob): Promise<string> {
  const img = await blobToImageData(blob);
  const scale = Math.min(100 / img.width, 100 / img.height);
  const canvas = new OffscreenCanvas(img.width * scale, img.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(await createImageBitmap(blob), 0, 0, canvas.width, canvas.height);

  const blurredBuf = await _webp.encode(ctx.getImageData(0, 0, canvas.width, canvas.height), {
    quality: 10
  });
  return URL.createObjectURL(new Blob([blurredBuf], { type: "image/webp" }));
}

export async function wasmTranscodeImage(
  file: Blob,
  format: "webp" | "avif",
  quality?: number
): Promise<Blob> {
  try {
    const img = await blobToImageData(file);

    if (format === "avif") {
      const _q = quality ? quality * 100 : 45;
      const buf = await encodeAvif(img, {
        quality: _q,
        speed: 6
      });
      return new Blob([buf], { type: "image/avif" });
    }

    if (format === "webp") {
      const _q = quality ? quality * 100 : 82;
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