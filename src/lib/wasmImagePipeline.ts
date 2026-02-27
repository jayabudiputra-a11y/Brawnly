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
      const _q = quality ? Math.max(quality * 100, 80) : 85;
      const buf = await encodeAvif(img, {
        quality: _q,
        speed: 5
      });
      return new Blob([buf], { type: "image/avif" });
    }

    if (format === "webp") {
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