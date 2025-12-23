import { useThemePreference } from '@/hooks/useThemePreference'
import { Moon, Sun, BookOpen } from 'lucide-react'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemePreference()

  return (
    <button
      onClick={toggleTheme}
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
