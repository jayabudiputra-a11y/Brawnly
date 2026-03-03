import { wasmTranscodeImage } from "@/lib/wasmImagePipeline";
import { detectBestFormat } from "@/lib/imageFormat";

type ImageFormat = "webp" | "avif";

export async function optimizeUpload(
  file: File
): Promise<Blob | File> {

  try {
    const _fmt = await detectBestFormat() as ImageFormat;

    if (file.size < 120 * 1024) {
      return file;
    }

    const _isHuge = file.size > 5242880;
    const _quality = _isHuge ? 0.6 : 0.8;

    const validFormat = (_fmt.toLowerCase() === "avif" ? "avif" : "webp") as ImageFormat;

    let _opt = await wasmTranscodeImage(
      file,
      validFormat,
      _quality
    );

    if (_opt.size > 5242880) {
      console.warn(`[BRAWNLY_OPTIMIZER]: Image still exceeds 5MB (${(_opt.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    return _opt;

  } catch (_err) {
    return file;
  }
}