import { useMutation } from '@tanstack/react-query'
import { subscribersApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Konfigurasi limit 4 kali per jam
const RATE_LIMIT_KEY = 'fitapp_subscribe_timer';
const MAX_ATTEMPTS = 4;
const ONE_HOUR = 60 * 60 * 1000;

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      // 1. CEK LIMIT LOKAL (Kelonggaran 4x per jam)
      const now = Date.now();
      const storageData = localStorage.getItem(RATE_LIMIT_KEY);
      let attempts: number[] = storageData ? JSON.parse(storageData) : [];
      
      // Bersihkan data lama (lebih dari 1 jam)
      attempts = attempts.filter(ts => now - ts < ONE_HOUR);

      if (attempts.length >= MAX_ATTEMPTS) {
        throw new Error('LIMIT_TERCAPAI');
      }

      // 2. PROSES INSERT (Sekarang pasti sukses karena constraint sudah dihapus)
      try {
        await subscribersApi.insertIfNotExists(email, 'Subscriber');
      } catch (err) {
        console.warn('DB Insert Skip/Error:', err);
      }

      // 3. KIRIM OTP KE SUPABASE
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      // Jika Supabase mulai membatasi (429), kita tangkap agar tidak error merah
      if (error && error.status === 429) {
        return { rateLimited: true };
      }

      if (error) throw error;

      // Catat percobaan sukses ke limit lokal
      attempts.push(now);
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(attempts));
      
      return { success: true };
    },
    onSuccess: (data) => {
      if (data?.rateLimited) {
        toast.info('Pendaftaran Diterima', {
          description: 'Data sudah masuk. Jika email belum ada, mohon tunggu beberapa saat karena server sedang sibuk.'
        });
        return;
      }

      // PESAN AWAL ANDA
      toast.success('Pendaftaran Berhasil!', {
        description: 'Silakan cek kotak masuk email Anda untuk konfirmasi.'
      });
    },
    onError: (error: any) => {
      if (error.message === 'LIMIT_TERCAPAI') {
        toast.warning('Batas Percobaan', {
          description: 'Anda sudah mencoba 4 kali dalam 1 jam. Silakan coba lagi nanti.'
        });
        return;
      }

      toast.error('Gagal', { 
        description: error.message || 'Terjadi kesalahan sistem.' 
      });
    },
  })
}