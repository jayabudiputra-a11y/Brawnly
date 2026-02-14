import { useThemePreference } from '@/hooks/useThemePreference'
import { Moon, Sun, BookOpen } from 'lucide-react'
import { useEffect } from 'react'
import { setCookieHash, mirrorQuery } from '@/lib/enterpriseStorage'
import { enqueue } from '@/lib/idbQueue'

export default function ThemeToggle() {
  const { isDark, toggleTheme, theme } = useThemePreference()

  useEffect(() => {
    (async () => {
      await setCookieHash(`theme_${theme}`);
      mirrorQuery({ type: 'THEME_SYNC', value: theme, ts: Date.now() });
    })();
  }, [theme]);

  const handleToggle = async () => {
    toggleTheme();
    try {
      await enqueue({
        type: 'THEME_CHANGE',
        payload: { theme: !isDark ? 'dark' : 'light' },
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn("IDB Queue Error", e);
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle theme"
      className="
        flex items-center gap-2
        px-3 py-2 rounded-full
        border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-900
        text-gray-800 dark:text-gray-100
        hover:scale-105 transition
      "
    >
      <BookOpen size={16} />
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}