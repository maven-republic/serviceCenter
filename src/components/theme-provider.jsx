// src/components/theme-provider.jsx - FIXED
'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'

const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
  actualTheme: "light",
  isProfessionalWorkspace: false,
  isCustomerWorkspace: false,
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
  professionalStorageKey = "professional-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(defaultTheme)
  const [actualTheme, setActualTheme] = useState("light")
  const [isProfessionalWorkspace, setIsProfessionalWorkspace] = useState(false)
  const [isCustomerWorkspace, setIsCustomerWorkspace] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Track last pathname to prevent unnecessary updates
  const lastPathname = useRef('')

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) || defaultTheme
    setTheme(savedTheme)
    setIsInitialized(true)
  }, [storageKey, defaultTheme])

  // WORKSPACE DETECTION - FIXED: Only check on mount and pathname change
  useEffect(() => {
    const checkWorkspaceType = () => {
      const pathname = window.location.pathname
      
      // Skip if pathname hasn't changed
      if (pathname === lastPathname.current) {
        return
      }
      
      lastPathname.current = pathname
      
      const isProfessional = pathname.includes('/professional')
      const isCustomer = pathname.includes('/customer')
      
      setIsProfessionalWorkspace(isProfessional)
      setIsCustomerWorkspace(isCustomer)
      
      // Load workspace-specific theme when entering professional workspace
      if (isProfessional) {
        const professionalTheme = localStorage.getItem(professionalStorageKey) || "dark"
        setTheme(professionalTheme)
      } else if (!isCustomer) {
        const generalTheme = localStorage.getItem(storageKey) || defaultTheme
        setTheme(generalTheme)
      }
      
      console.log('🏢 Workspace Detection:', { 
        pathname, 
        isProfessional, 
        isCustomer,
        currentTheme: isProfessional ? localStorage.getItem(professionalStorageKey) : localStorage.getItem(storageKey)
      })
    }

    // Initial check
    checkWorkspaceType()

    // FIXED: Only listen for popstate (browser back/forward)
    const handleRouteChange = () => {
      checkWorkspaceType()
    }

    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [professionalStorageKey, storageKey, defaultTheme])

  // Theme application logic
  useEffect(() => {
    if (!isInitialized) return

    const root = window.document.documentElement
    const pathname = window.location.pathname
    
    // Remove existing theme classes
    root.classList.remove("light", "dark", "professional-workspace", "customer-workspace")

    let appliedTheme

    // Check for browse pages first
    if (pathname === '/browse-services' || pathname.startsWith('/browse')) {
      appliedTheme = "light"
      root.classList.add("light")
      
    } else if (isProfessionalWorkspace) {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark" : "light"
        appliedTheme = systemTheme
        root.classList.add(systemTheme, "professional-workspace")
      } else {
        appliedTheme = theme
        root.classList.add(theme, "professional-workspace")
      }
      
    } else if (isCustomerWorkspace) {
      appliedTheme = "light"
      root.classList.add("light", "customer-workspace")
      
    } else {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark" : "light"
        appliedTheme = systemTheme
        root.classList.add(systemTheme)
      } else {
        appliedTheme = theme
        root.classList.add(theme)
      }
    }

    setActualTheme(appliedTheme)
  }, [theme, isProfessionalWorkspace, isCustomerWorkspace, isInitialized])

  // System theme change listener
  useEffect(() => {
    const pathname = window.location.pathname
    
    if (theme !== "system" || isCustomerWorkspace || pathname === '/browse-services' || pathname.startsWith('/browse')) {
      return
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? "dark" : "light"
      setActualTheme(newSystemTheme)
      
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(newSystemTheme)
      
      if (isProfessionalWorkspace) {
        root.classList.add("professional-workspace")
      }
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [theme, isProfessionalWorkspace, isCustomerWorkspace])

  const value = {
    theme,
    setTheme: (newTheme) => {
      const pathname = window.location.pathname
      
      if (isCustomerWorkspace) {
        console.warn("Theme switching is disabled in customer workspace")
        return
      }
      
      if (pathname === '/browse-services' || pathname.startsWith('/browse')) {
        console.warn("Theme switching is disabled on browse pages")
        return
      }
      
      if (isProfessionalWorkspace) {
        localStorage.setItem(professionalStorageKey, newTheme)
      } else {
        localStorage.setItem(storageKey, newTheme)
      }
      
      setTheme(newTheme)
    },
    actualTheme,
    isProfessionalWorkspace,
    isCustomerWorkspace,
  }

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