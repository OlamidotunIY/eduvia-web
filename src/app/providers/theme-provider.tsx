import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = Exclude<Theme, 'system'>

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined)

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : theme === 'system'
      ? 'light'
      : theme
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'eduvia-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey)
    return storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
      ? storedTheme
      : defaultTheme
  })

  React.useEffect(() => {
    const applyTheme = () => {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(resolveTheme(theme))
    }
    applyTheme()
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    query.addEventListener('change', applyTheme)
    return () => query.removeEventListener('change', applyTheme)
  }, [theme])

  const value = React.useMemo<ThemeProviderState>(
    () => ({
      theme,
      setTheme: (nextTheme) => {
        localStorage.setItem(storageKey, nextTheme)
        setThemeState(nextTheme)
      },
    }),
    [storageKey, theme],
  )

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider.')
  return context
}
