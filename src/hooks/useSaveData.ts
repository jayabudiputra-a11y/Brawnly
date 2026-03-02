import { useState as _s, useEffect as _e, useCallback as _uC } from 'react';
import type { SaveDataPreference as _SDP } from '../types';
import { enqueue as _enq } from '@/lib/idbQueue';
import { backoffRetry as _boR } from '@/lib/backoff';
import { supabase as _sb } from '@/lib/supabase';

/* ======================
    BANDWIDTH & SYNC
   ====================== */
const _0xflux = [
    'saveDataPreference',
    'low',                
    'high',               
    'enabled'             
] as const;

// OPTIMASI: Kunci indeks agar TypeScript tahu batas array-nya
type FluxIndex = 0 | 1 | 2 | 3;
const _x = (i: FluxIndex) => _0xflux[i];

export const useSaveData = () => {
  // --- PREFERENCE LOGIC ---
  const [saveData, setSaveData] = _s<_SDP>(() => {
    try {
      const saved = localStorage.getItem(_x(0));
      if (saved) return JSON.parse(saved) as _SDP;
    } catch (e) {
      // Abaikan jika localStorage corrupt/gagal diparse
    }
    // Nilai default yang aman (Type Safe)
    return { enabled: false, quality: 'high' } as _SDP;
  });

  /**
   * OPTIMASI: Deteksi Data Saver Dinamis
   * Sekarang hook ini juga mendengarkan perubahan jaringan secara real-time.
   * Jika user tiba-tiba ganti ke WiFi/Paket Data hemat, aplikasi akan beradaptasi.
   */
  _e(() => {
    const connection = (navigator as any).connection;
    if (!connection) return;

    const handleConnectionChange = () => {
      const isBrowserSaving = connection.saveData === true;
      setSaveData((prev) => {
        // Hanya update state jika kondisinya benar-benar berubah
        if (isBrowserSaving && !prev.enabled) {
          return { ...prev, enabled: true, quality: 'low' };
        }
        return prev;
      });
    };

    handleConnectionChange(); // Cek saat pertama kali dimuat
    
    // Dengarkan perubahan jaringan
    connection.addEventListener('change', handleConnectionChange);
    return () => connection.removeEventListener('change', handleConnectionChange);
  }, []);

  _e(() => {
    localStorage.setItem(_x(0), JSON.stringify(saveData));
  }, [saveData]);

  // OPTIMASI: Gunakan useCallback agar komponen yang memanggil fungsi ini
  // tidak ikut ter-render ulang setiap kali state lain berubah.
  const toggleSaveData = _uC(() => {
    setSaveData((prev) => {
      const nextState = !prev.enabled;
      return {
        ...prev,
        enabled: nextState,
        quality: nextState ? 'low' : 'high',
      };
    });
  }, []);

  const setQuality = _uC((quality: 'low' | 'medium' | 'high') => {
    setSaveData((prev) => ({ ...prev, quality }));
  }, []);

  // --- PERSISTENCE SYNC LOGIC ---
  /**
   * Mengirim data ke server dengan strategi retry atau 
   * memasukkannya ke antrean IndexedDB jika tetap gagal/offline.
   */
  const _syncData = _uC(async (_d: any) => {
    try {
      if (!navigator.onLine) throw new Error("Offline");
      
      // Strategi Backoff: Mencoba kirim ke Supabase hingga 6 kali percobaan
      await _boR(async () => {
        const { error } = await _sb.from('user_progress').insert(_d);
        if (error) throw error;
      });
      
    } catch (_err) {
      // Jika offline atau percobaan backoff habis, simpan ke IndexedDB
      await _enq({ 
        type: 'SAVE_PROGRESS', 
        payload: _d, 
        timestamp: Date.now() 
      });
    }
  }, []); // Kosongkan dependency array karena _enq, _boR, dan _sb adalah fungsi statis/eksternal

  return {
    saveData,
    toggleSaveData,
    setQuality,
    isEnabled: saveData.enabled,
    syncData: _syncData
  };
};