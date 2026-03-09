import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { loadTheme, saveTheme, applyThemeToDocument, applyDarkModeToDocument, type ThemeColors } from '@/lib/theme'
import { getThemeFromApi, saveThemeToApi } from '@/lib/api'

type ThemeContextValue = {
  theme: ThemeColors
  updateTheme: (primary: string, secondary: string) => void
  darkMode: boolean
  setDarkMode: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeColors>(() => loadTheme())
  const hasLocalThemeUpdate = useRef(false)

  const darkMode = theme.darkMode ?? false

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme.primary, theme.secondary])

  useEffect(() => {
    applyDarkModeToDocument(darkMode)
  }, [darkMode])

  // Carregar tema salvo no backend ao montar (persiste após build/restart).
  // Não sobrescreve se o usuário já salvou tema nesta sessão (evita race com PATCH).
  useEffect(() => {
    getThemeFromApi()
      .then((t) => {
        if (t.primary && t.secondary && !hasLocalThemeUpdate.current) {
          setTheme((prev) => {
            const next = { ...prev, ...t, darkMode: prev.darkMode ?? (t as ThemeColors).darkMode ?? false }
            saveTheme(next)
            return next
          })
        }
      })
      .catch(() => { /* mantém tema do localStorage ou padrão */ })
  }, [])

  const updateTheme = (primary: string, secondary: string) => {
    hasLocalThemeUpdate.current = true
    const next = { ...theme, primary, secondary }
    setTheme(next)
    saveTheme(next)
    applyThemeToDocument(next)
    saveThemeToApi({ primary, secondary }).catch(() => {})
  }

  const setDarkMode = (value: boolean) => {
    const next = { ...theme, darkMode: value }
    setTheme(next)
    saveTheme(next)
    applyDarkModeToDocument(value)
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
