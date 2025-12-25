import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Theme = 'light' | 'dark'
const GUEST_ID_KEY = 'fitapp_guest_id'

const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY)
  if (!guestId) {
    guestId = crypto.randomUUID()
    localStorage.setItem(GUEST_ID_KEY, guestId)
  }
  return guestId
}

export const useThemePreference = () => {
  // 1. Ambil dari localStorage SEGERA agar tidak ada 'flicker' putih
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light'
  })
  const [userId, setUserId] = useState<string | null>(null)

  // 2. Terapkan class 'dark' segera saat komponen dimuat
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Init Data dari Supabase (Latar Belakang)
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      let identifier = session?.user?.id ?? getGuestId()
      setUserId(identifier)

      if (identifier) {
        const { data } = await supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_id', identifier)
          .maybeSingle()

        // Jika di DB berbeda dengan lokal, ikuti DB
        if (data?.theme && data.theme !== theme) {
          applyTheme(data.theme as Theme)
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
    
    // LANGKAH PENTING: Ubah UI secara instan dulu
    applyTheme(next)

    // Baru simpan ke database di latar belakang
    if (!userId) return
    await supabase.from('user_preferences').upsert(
      {
        user_id: userId,
        theme: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
  }

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  }
}