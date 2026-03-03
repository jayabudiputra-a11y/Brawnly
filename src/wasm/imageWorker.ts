import { wasmTranscodeImage } from "@/lib/wasmImagePipeline";

type ImageFormat = "webp" | "avif";

self.onmessage = async (e: MessageEvent) => {
  const { id, blob, format, quality } = e.data as {
    id: string;
    blob: Blob;
    format: string;
    quality: number;
  };

  try {
    const validFormat = (format.toLowerCase() === "avif" ? "avif" : "webp") as ImageFormat;

    const result = await wasmTranscodeImage(blob, validFormat, quality);
    
    self.postMessage({ id, result, error: null });
  } catch (err: any) {
    self.postMessage({ id, result: blob, error: err?.message ?? "worker_error" });
  }
};