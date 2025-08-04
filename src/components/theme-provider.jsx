// src/components/theme-provider.jsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
  actualTheme: "light", // The actual applied theme
  isProfessionalWorkspace: false,
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
  const [actualTheme, setActualTheme] = useState("light")
  const [isProfessionalWorkspace, setIsProfessionalWorkspace] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // 🔧 CRITICAL FIX: Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) || defaultTheme
    setTheme(savedTheme)
    setIsInitialized(true)
  }, [storageKey, defaultTheme])

  // 🎯 PROFESSIONAL WORKSPACE DETECTION
  useEffect(() => {
    // Check current path for professional workspace
    const checkProfessionalWorkspace = () => {
      const isProfessional = window.location.pathname.includes('/professional')
      setIsProfessionalWorkspace(isProfessional)
      return isProfessional
    }

    // Initial check
    checkProfessionalWorkspace()

    // Listen for navigation changes (for SPA routing)
    const handleRouteChange = () => {
      checkProfessionalWorkspace()
    }

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange)

    // For Next.js router changes, we'll use a MutationObserver
    // to detect when the URL changes without page reload
    const observer = new MutationObserver(() => {
      checkProfessionalWorkspace()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      observer.disconnect()
    }
  }, [])

  // 🌙 THEME APPLICATION LOGIC
  useEffect(() => {
    if (!isInitialized) return

    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove("light", "dark")

    let appliedTheme

    if (isProfessionalWorkspace) {
      // 🔒 FORCE DARK THEME for professional workspace
      appliedTheme = "dark"
      root.classList.add("dark")
      
      // Add professional workspace class for component targeting
      root.classList.add("professional-workspace")
    } else {
      // 🎨 APPLY USER PREFERENCE for other areas
      root.classList.remove("professional-workspace")
      
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        appliedTheme = systemTheme
        root.classList.add(systemTheme)
      } else {
        appliedTheme = theme
        root.classList.add(theme)
      }
    }

    setActualTheme(appliedTheme)
  }, [theme, isProfessionalWorkspace, isInitialized])

  // 🎧 SYSTEM THEME CHANGE LISTENER
  useEffect(() => {
    if (theme !== "system" || isProfessionalWorkspace) return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? "dark" : "light"
      setActualTheme(newSystemTheme)
      
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(newSystemTheme)
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [theme, isProfessionalWorkspace])

  const value = {
    theme,
    setTheme: (newTheme) => {
      // 🚫 Prevent theme change in professional workspace
      if (isProfessionalWorkspace && newTheme !== "dark") {
        console.warn("Theme switching is disabled in professional workspace (always dark)")
        return
      }
      
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
    actualTheme,
    isProfessionalWorkspace,
  }

  // 🚫 Prevent flash of unstyled content
  if (!isInitialized) {
    return (
      <div style={{ visibility: 'hidden', position: 'absolute' }}>
        {children}
      </div>
    )
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}