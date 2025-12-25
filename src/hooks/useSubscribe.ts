import { useMutation } from '@tanstack/react-query'
import { subscribersApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const storageKey = 'fitapp-auth-token';
      localStorage.removeItem(storageKey);
      
      await supabase.auth.signOut().catch(() => {});

      try {
        await subscribersApi.insertIfNotExists(email, 'Subscriber');
        console.log('Data berhasil masuk ke tabel subscribers');
      } catch (dbError: any) {
        console.warn('DB Status:', dbError.message);
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pendaftaran Berhasil!', {
        description: 'Silakan cek kotak masuk email Anda untuk konfirmasi.'
      });
    },
    onError: (error: any) => {
      if (error.status === 429 || error.message?.toLowerCase().includes('rate limit')) {
        toast.info('Pendaftaran Diterima', {
          description: 'Data sudah masuk. Jika email konfirmasi belum ada, mohon tunggu 60 detik sebelum mencoba lagi.'
        });
        return;
      }

      if (!error.message || error.message === "{}" || Object.keys(error).length === 0) {
        toast.warning('Data Sudah Tersimpan', {
          description: 'Email sudah masuk daftar, namun server sedang sibuk. Silakan cek email secara berkala.'
        });
        return;
      }
      
      toast.error('Gagal', { 
        description: error.message || 'Terjadi kesalahan sistem.' 
      });
    },
  })
}