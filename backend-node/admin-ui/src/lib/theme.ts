/**
 * Converte cor hexadecimal para formato HSL usado nas variáveis CSS.
 * Retorna "H S% L%" (ex: "356 97% 44%") para uso em hsl(var(--primary))
 */
export function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!result) return '356 97% 44%' // fallback vermelho

  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  const H = Math.round(360 * h)
  const S = Math.round(s * 100)
  const L = Math.round(l * 100)

  return `${H} ${S}% ${L}%`
}

const STORAGE_KEY = 'n360_theme'

export type ThemeColors = {
  primary: string
  secondary: string
  darkMode?: boolean
}

const DEFAULT_THEME: ThemeColors = {
  primary: '#E30613',
  secondary: '#004796',
  darkMode: false,
}

export function loadTheme(): ThemeColors {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ThemeColors
      if (parsed.primary && parsed.secondary) {
        return { ...DEFAULT_THEME, ...parsed }
      }
    }
  } catch {}
  return { ...DEFAULT_THEME }
}

export function saveTheme(theme: ThemeColors): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
  } catch {}
}

export function applyThemeToDocument(theme: ThemeColors): void {
  const root = document.documentElement
  root.style.setProperty('--primary', hexToHSL(theme.primary))
  root.style.setProperty('--secondary', hexToHSL(theme.secondary))
  root.style.setProperty('--ring', hexToHSL(theme.primary))
  root.style.setProperty('--chart-1', hexToHSL(theme.primary))
  root.style.setProperty('--chart-2', hexToHSL(theme.secondary))
}

export function applyDarkModeToDocument(dark: boolean): void {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
