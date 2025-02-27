import { createContext, useContext, useEffect, useState, useMemo } from "react"

const initialState = {
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
  systemTheme: "light",
  isSystemTheme: false,
  isDark: false,
}

const ThemeContext = createContext(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "tap-ui-theme",
  ...props
}) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  )
  
  const [systemTheme, setSystemTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  )

  const isSystemTheme = theme === "system"
  const currentTheme = isSystemTheme ? systemTheme : theme
  const isDark = currentTheme === "dark"

  // Set the theme class on the document element
  useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, systemTheme])

  // Watch for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = (e) => {
      const newSystemTheme = e.matches ? "dark" : "light"
      setSystemTheme(newSystemTheme)
    }
    
    mediaQuery.addEventListener("change", handleChange)
    
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Set theme function with localStorage update
  const setTheme = (newTheme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  // Toggle between dark and light theme
  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(systemTheme === "dark" ? "light" : "dark")
    } else {
      setTheme(theme === "dark" ? "light" : "dark")
    }
  }

  // Create memoized context value
  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      systemTheme,
      isSystemTheme,
      isDark: currentTheme === "dark",
    }),
    [theme, systemTheme, isSystemTheme, currentTheme]
  )

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
    
  return context
}