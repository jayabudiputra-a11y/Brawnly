import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Theme = 'light' | 'dark'

export const useThemePreference = () => {
  const [theme, setTheme] = useState<Theme>('light')
  const [userId, setUserId] = useState<string | null>(null)

  // Init
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const uid = session?.user?.id ?? null
      setUserId(uid)

      if (uid) {
        const { data } = await supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_id', uid)
          .single()

        const savedTheme = data?.theme as Theme | undefined
        applyTheme(savedTheme ?? 'light')
      } else {
        const localTheme = localStorage.getItem('theme') as Theme | null
        applyTheme(localTheme ?? 'light')
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

    if (!userId) return

    await supabase
      .from('user_preferences')
      .upsert(
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
