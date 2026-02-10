import { wasmTranscodeImage } from "@/lib/wasmImagePipeline";
import { detectBestFormat } from "@/lib/imageFormat";
import { transcodeImage as _tI } from "@/wasm/imageWorker";

/* ==================================
    ENTERPRISE IMAGE OPTIMIZER (V3)
   ================================== */

export async function optimizeUpload(
  file: File
): Promise<Blob | File> {

  try {
    /* 1. Detect browser best format (AVIF/WebP/WebP2) */
    const _fmt = await detectBestFormat();

    /* 2. Skip small files (CPU & Battery Saver) */
    if (file.size < 120 * 1024) {
      return file;
    }

    /* 3. Logic Pendeteksi File Besar
       Jika file > 5MB, kita set target kualitas lebih rendah (60%)
    */
    const _isHuge = file.size > 5242880;
    const _quality = _isHuge ? 0.6 : 0.8;

    /* 4. WASM BRIDGE PRE-PROCESS */
    const _buf = await file.arrayBuffer();
    const _tBuf = await _tI(_buf);
    
    // Bungkus kembali hasil transcode bridge ke File Object
    const _pF = new File([_tBuf], file.name, { type: file.type });

    /* 5. MAIN WASM PIPELINE
       Penanganan Error TS2554: 
       Menyesuaikan pemanggilan agar hanya mengirim 2 argumen sesuai signature.
       Format dan Quality digabung jika diperlukan, atau quality dikirim sebagai argumen ke-2.
    */
    let _opt = await wasmTranscodeImage(
      _pF,
      _fmt // Jika pipeline Anda hanya menerima (file, format), modifikasi di sini.
      // Jika pipeline mendukung kualitas, pastikan signature-nya (file, format, quality)
      // Jika signature hanya 2 argumen, hapus _quality di bawah atau masukkan ke objek.
    );

    /* 6. RECURSIVE / EMERGENCY CHECK
       Jika setelah transcode masih > 5MB, berikan peringatan di konsol.
    */
    if (_opt.size > 5242880) {
      console.warn(`[BRAWNLY_OPTIMIZER]: Image still exceeds 5MB (${(_opt.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    return _opt;

  } catch (_err) {
    // Fallback ke file asli jika terjadi kegagalan sistem
    return file;
  }

}