import { wasmTranscodeImage } from "@/lib/wasmImagePipeline";
import { detectBestFormat } from "@/lib/imageFormat";

/* ======================
   ENTERPRISE IMAGE OPTIMIZER
====================== */

export async function optimizeUpload(
  file: File
): Promise<Blob> {

  try {

    /* Detect browser best format */
    const format = await detectBestFormat();

    /* Skip small files (CPU saver) */
    if (file.size < 120 * 1024) {
      return file;
    }

    /* WASM Transcode */
    const optimized = await wasmTranscodeImage(
      file,
      format
    );

    return optimized;

  } catch {

    return file;

  }

}
