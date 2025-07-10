// src/components/theme-provider.jsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
})

export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(defaultTheme)
  const [isInitialized, setIsInitialized] = useState(false)

  // 🔧 CRITICAL FIX: Load saved theme from localStorage on mount
  useEffect(() => {
const savedTheme = localStorage.getItem(storageKey) || defaultTheme
    if (savedTheme) {
      setTheme(savedTheme)
    }
    setIsInitialized(true)
  }, [storageKey])

  // Apply theme to DOM
  useEffect(() => {
    if (!isInitialized) return

    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, isInitialized])

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  // 🚫 Prevent flash of unstyled content
  if (!isInitialized) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}