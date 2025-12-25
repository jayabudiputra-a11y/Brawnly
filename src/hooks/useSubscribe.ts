import { useMutation } from '@tanstack/react-query'
import { subscribersApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      // 1. Bersihkan sesi lama tanpa menunggu (mencegah macet di awal)
      supabase.auth.signOut().catch(() => {});

      // 2. PAKSA masuk ke Database dulu
      // Kita pakai await di sini agar data masuk sebelum lanjut ke OTP
      try {
        await subscribersApi.insertIfNotExists(email, 'Subscriber');
        console.log('Data berhasil masuk ke tabel subscribers');
      } catch (dbError: any) {
        // Jika hanya error "duplicate", kita abaikan dan lanjut kirim email
        console.warn('DB Status:', dbError.message);
      }

      // 3. Kirim OTP via SMTP Outlook
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      // Jika error terjadi di sini (seperti error {}), data tetap sudah masuk ke DB
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Berhasil!', {
        description: 'Data tersimpan & link konfirmasi terkirim ke email.'
      });
    },
    onError: (error: any) => {
      // Menangani error {} agar lebih informatif
      if (!error.message || error.message === "{}" || Object.keys(error).length === 0) {
        toast.error('Gagal Mengirim Email', {
          description: 'Data sudah masuk ke database, tapi server Outlook menolak koneksi. Periksa kembali Port (gunakan 587) dan App Password.'
        });
        return;
      }

      if (error.status === 429 || error.message?.toLowerCase().includes('rate limit')) {
        toast.error('Limit Tercapai', {
          description: 'Mohon tunggu 60 detik sebelum mencoba lagi.'
        });
        return;
      }
      
      toast.error('Terjadi Kesalahan', { description: error.message });
    },
  })
}