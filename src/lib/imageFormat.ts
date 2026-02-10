/* ======================
   FORMAT DETECTOR (ENTERPRISE)
====================== */

let cachedFormat: "avif" | "webp" | null = null;

export async function detectBestFormat(): Promise<"avif" | "webp"> {

  /* MEMORY CACHE (0ms return) */
  if (cachedFormat) return cachedFormat;

  /* ======================
     AVIF REAL SIGNATURE TEST
     (Most reliable)
  ====================== */

  try {

    const avif = await createImageBitmap(
      new Blob(
        [
          Uint8Array.from(
            atob("AAAAIGZ0eXBhdmlmAAAAAG1pZjFhdmlmAAACAGF2MDEAAQABAAEAAAA="),
            c => c.charCodeAt(0)
          )
        ],
        { type: "image/avif" }
      )
    );

    if (avif) {
      cachedFormat = "avif";
      return cachedFormat;
    }

  } catch {}

  /* ======================
     FALLBACK MICRO TEST
     (For weird browsers / WebView)
  ====================== */

  try {

    const avif = await createImageBitmap(
      new Blob(
        [new Uint8Array([0x00])],
        { type: "image/avif" }
      )
    );

    if (avif) {
      cachedFormat = "avif";
      return cachedFormat;
    }

  } catch {}

  /* ======================
     FINAL FALLBACK
  ====================== */

  cachedFormat = "webp";
  return cachedFormat;
}
