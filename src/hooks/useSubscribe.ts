import { useMutation } from '@tanstack/react-query'
import { subscribersApi } from '@/lib/api'
import { toast } from 'sonner'

const LIMIT_KEY = 'fitapp_v1_limit';

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      // 1. Cek Limit Lokal (Proteksi Anti-Spam)
      const now = Date.now();
      const storage = JSON.parse(localStorage.getItem(LIMIT_KEY) || '[]');
      const recentAttempts = storage.filter((ts: number) => now - ts < 3600000);

      if (recentAttempts.length >= 4) {
        throw new Error('LIMIT_LOKAL');
      }

      // 2. Simpan ke Database (Upsert)
      // Kita gunakan nama 'Subscriber' sebagai default karena belum ada input nama di sini
      await subscribersApi.insertIfNotExists(email, 'Subscriber');

      // 3. Update limit record
      recentAttempts.push(now);
      localStorage.setItem(LIMIT_KEY, JSON.stringify(recentAttempts));
      
      return { status: 'success' };
    },
    onSuccess: () => {
      // Selaras dengan skema "Tanpa Password": Tidak perlu cek email
      toast.success('Berhasil Berlangganan!', {
        description: 'Email Anda telah terdaftar dalam daftar newsletter kami.'
      });
    },
    onError: (error: any) => {
      if (error.message === 'LIMIT_LOKAL') {
        toast.warning('Terlalu Banyak Mencoba', {
          description: 'Demi keamanan, silakan coba berlangganan lagi dalam 1 jam.'
        });
        return;
      }

      toast.error('Gagal', { 
        description: 'Email ini mungkin sudah terdaftar atau ada gangguan koneksi.' 
      });
    },
  })
}