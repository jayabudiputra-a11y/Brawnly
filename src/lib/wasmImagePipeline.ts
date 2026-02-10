import { encode as encodeAvif } from "@jsquash/avif";
import { encode as encodeWebp } from "@jsquash/webp";

/* ======================
   BLOB → ImageData
====================== */

async function blobToImageData(blob: Blob): Promise<ImageData> {

  const bmp = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(
    bmp.width,
    bmp.height
  );

  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(bmp, 0, 0);

  return ctx.getImageData(
    0,
    0,
    bmp.width,
    bmp.height
  );
}

/* ======================
   MAIN TRANSCODER
====================== */

export async function wasmTranscodeImage(
  file: Blob,
  format: "webp" | "avif"
): Promise<Blob> {

  try {

    const img = await blobToImageData(file);

    /* ========= AVIF ========= */

    if (format === "avif") {

      const buf = await encodeAvif(img, {
        quality: 45,      // 0–100 (lower = smaller)
        speed: 6          // 0 slow best → 10 fast worst
      });

      return new Blob(
        [buf],
        { type: "image/avif" }
      );
    }

    /* ========= WEBP ========= */

    if (format === "webp") {

      const buf = await encodeWebp(img, {
        quality: 82       // 0–100
      });

      return new Blob(
        [buf],
        { type: "image/webp" }
      );
    }

    return file;

  } catch {

    return file;

  }
}
