import { useMutation } from '@tanstack/react-query'
import { subscribersApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      // 1. Paksa keluar dari sesi lama agar tidak ada error 'Invalid Refresh Token'
      await supabase.auth.signOut();

      // 2. Simpan ke database subscriber
      try {
        await subscribersApi.insertIfNotExists(email, 'Subscriber');
      } catch (dbError: any) {
        console.warn('DB Log:', dbError.message);
      }

      // 3. Minta OTP (Confirm Email)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Link Konfirmasi Terkirim!', {
        description: 'Buka email Anda dan klik link untuk konfirmasi subscribe.'
      });
    },
    onError: (error: any) => {
      if (error.status === 429 || error.message?.includes('rate limit')) {
        toast.error('Keamanan Aktif', {
          description: 'Supabase membatasi pengiriman email. Mohon tunggu 1-2 menit penuh tanpa menekan tombol.'
        });
        return;
      }
      
      toast.error('Gagal', { description: error.message });
    },
  })
}