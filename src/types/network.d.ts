// network.d.ts — Network Information API type augmentation
// Dipakai oleh lib/imageFormat.ts dan komponen yang cek koneksi
// sebelum memuat gambar resolusi tinggi.

declare interface Navigator {
  connection?: {
    // Apakah user mengaktifkan "Save Data" di browser/OS
    saveData?: boolean;
    // Tipe koneksi efektif: "slow-2g" | "2g" | "3g" | "4g"
    effectiveType?: string;
    // Estimasi bandwidth downlink dalam Mbps
    downlink?: number;
    // Round-trip latency estimasi dalam ms
    rtt?: number;
    // Callback saat koneksi berubah
    onchange?: EventListenerOrEventListenerObject | null;
  };
}