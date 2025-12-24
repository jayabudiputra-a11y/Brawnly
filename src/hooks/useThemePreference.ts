import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Theme = 'light' | 'dark'

const GUEST_ID_KEY = 'fitapp_guest_id'

// Helper untuk generate ID unik jika browser mendukungnya
const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY)
  if (!guestId) {
    // Generate UUID sederhana
    guestId = crypto.randomUUID()
    localStorage.setItem(GUEST_ID_KEY, guestId)
  }
  return guestId
}

export const useThemePreference = () => {
  const [theme, setTheme] = useState<Theme>('light')
  const [userId, setUserId] = useState<string | null>(null)

  // Init
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Jika login, pakai ID user. Jika belum, pakai Guest ID
      let identifier: string | null = session?.user?.id ?? null

      if (!identifier) {
        identifier = getGuestId()
      }

      setUserId(identifier)

      if (identifier) {
        // PERBAIKAN: Menggunakan .maybeSingle() agar tidak error 406 
        // jika data visitor baru BELUM ADA di database.
        const { data } = await supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_id', identifier)
          .maybeSingle()

        if (data?.theme) {
          applyTheme(data.theme as Theme)
        } else {
          // Fallback ke localStorage jika data di DB belum ada
          const localTheme = localStorage.getItem('theme') as Theme | null
          applyTheme(localTheme ?? 'light')
        }
      }
    }

    init()
  }, [])

  const applyTheme = (value: Theme) => {
    setTheme(value)
    document.documentElement.classList.toggle('dark', value === 'dark')
    localStorage.setItem('theme', value)
  }

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light'
    applyTheme(next)

    // Jangan return dulu meski null, karena sekarang visitor punya ID
    if (!userId) return

    // Simpan ke Supabase (baik user login maupun visitor)
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userId, // Ini bisa ID User atau Guest ID
          theme: next,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error("Gagal menyimpan preferensi tema:", error.message)
    }
  }

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  }
}