import { useState as _s, useEffect as _e } from 'react';
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

const _x = (i: number) => _0xflux[i] as any;
const _KEY_EN = _0xflux[3]; // 'enabled'

export const useSaveData = () => {
  // --- PREFERENCE LOGIC ---
  const [saveData, setSaveData] = _s<_SDP>(() => {
    const _K = _x(0);
    const saved = localStorage.getItem(_K);
    return saved
      ? JSON.parse(saved)
      : ({ [_KEY_EN]: false, quality: _x(2) } as any as _SDP);
  });

  _e(() => {
    const connection = (navigator as any).connection;
    const isBrowserSaving = connection?.saveData || false;

    if (isBrowserSaving && !saveData[_KEY_EN]) {
      setSaveData({ [_KEY_EN]: true, quality: _x(1) } as any as _SDP);
    }
  }, []);

  _e(() => {
    localStorage.setItem(_x(0), JSON.stringify(saveData));
  }, [saveData]);

  const toggleSaveData = () => {
    setSaveData((prev) => {
      const nextState = !prev[_KEY_EN];
      return {
        ...prev,
        [_KEY_EN]: nextState,
        quality: nextState ? _x(1) : _x(2),
      } as any as _SDP;
    });
  };

  const setQuality = (quality: 'low' | 'medium' | 'high') => {
    setSaveData((prev) => ({ ...prev, quality }));
  };

  // --- PERSISTENCE SYNC LOGIC ---
  /**
   * Mengirim data ke server dengan strategi retry atau 
   * memasukkannya ke antrean IndexedDB jika tetap gagal/offline.
   */
  const _syncData = async (_d: any) => {
    try {
      if (!navigator.onLine) throw new Error("Offline");
      
      // Strategi Backoff: Mencoba kirim ke Supabase hingga 6 kali percobaan
      await _boR(async () => {
        const { error } = await _sb.from('user_progress').insert(_d);
        if (error) throw error;
      });
      
      console.log("✅ Progress synced to cloud");
    } catch (_err) {
      // Jika offline atau percobaan backoff habis, simpan ke IndexedDB
      await _enq({ 
        type: 'SAVE_PROGRESS', 
        payload: _d, 
        timestamp: Date.now() 
      });
      console.warn("⚠️ Data deferred to offline queue due to connection/timeout");
    }
  };

  return {
    saveData,
    toggleSaveData,
    setQuality,
    isEnabled: saveData[_KEY_EN],
    syncData: _syncData // Ekspos fungsi sync untuk digunakan di komponen
  };
}