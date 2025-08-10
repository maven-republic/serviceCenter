// src/components/theme-provider.jsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

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
  professionalStorageKey = "professional-ui-theme", // Separate storage for professional workspace
  ...props
}) {
  const [theme, setTheme] = useState(defaultTheme)
  const [actualTheme, setActualTheme] = useState("light")
  const [isProfessionalWorkspace, setIsProfessionalWorkspace] = useState(false)
  const [isCustomerWorkspace, setIsCustomerWorkspace] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) || defaultTheme
    setTheme(savedTheme)
    setIsInitialized(true)
  }, [storageKey, defaultTheme])

  // WORKSPACE DETECTION - Enhanced for customer workspace
  useEffect(() => {
    const checkWorkspaceType = () => {
      const pathname = window.location.pathname
      
      const isProfessional = pathname.includes('/professional')
      const isCustomer = pathname.includes('/customer')
      
      setIsProfessionalWorkspace(isProfessional)
      setIsCustomerWorkspace(isCustomer)
      
      // Load workspace-specific theme when entering professional workspace
      if (isProfessional) {
        const professionalTheme = localStorage.getItem(professionalStorageKey) || "dark" // Default to dark for professional
        setTheme(professionalTheme)
      } else if (!isCustomer) {
        // Restore general theme when leaving professional workspace (but not entering customer)
        const generalTheme = localStorage.getItem(storageKey) || defaultTheme
        setTheme(generalTheme)
      }
      
      console.log('🏢 Workspace Detection:', { 
        pathname, 
        isProfessional, 
        isCustomer,
        currentTheme: isProfessional ? localStorage.getItem(professionalStorageKey) : localStorage.getItem(storageKey)
      })
      
      return { isProfessional, isCustomer }
    }

    // Initial check
    checkWorkspaceType()

    // Listen for navigation changes
    const handleRouteChange = () => {
      checkWorkspaceType()
    }

    window.addEventListener('popstate', handleRouteChange)

    // Observe URL changes for SPA routing
    const observer = new MutationObserver(() => {
      checkWorkspaceType()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      observer.disconnect()
    }
  }, [professionalStorageKey, storageKey, defaultTheme])

  // ENHANCED THEME APPLICATION LOGIC
  useEffect(() => {
    if (!isInitialized) return

    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove("light", "dark", "professional-workspace", "customer-workspace")

    let appliedTheme

    if (isProfessionalWorkspace) {
      // 🎨 ALLOW THEME SWITCHING for professional workspace (but add workspace class)
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        appliedTheme = systemTheme
        root.classList.add(systemTheme, "professional-workspace")
        console.log('🏢 Applied professional workspace system theme:', systemTheme)
      } else {
        appliedTheme = theme
        root.classList.add(theme, "professional-workspace")
        console.log('🏢 Applied professional workspace theme:', theme)
      }
      
    } else if (isCustomerWorkspace) {
      // 🔒 FORCE LIGHT THEME (WHITE BACKGROUND) for customer workspace
      appliedTheme = "light"
      root.classList.add("light", "customer-workspace")
      console.log('👤 Applied customer workspace theme (white)')
      
    } else {
      // 🎨 APPLY USER PREFERENCE for other areas (homepage, etc.)
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        appliedTheme = systemTheme
        root.classList.add(systemTheme)
        console.log('🌓 Applied system theme:', systemTheme)
      } else {
        appliedTheme = theme
        root.classList.add(theme)
        console.log('🎨 Applied user theme:', theme)
      }
    }

    setActualTheme(appliedTheme)
  }, [theme, isProfessionalWorkspace, isCustomerWorkspace, isInitialized])

  // System theme change listener
  useEffect(() => {
    if (theme !== "system" || isCustomerWorkspace) return // Customer workspace is always light

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? "dark" : "light"
      setActualTheme(newSystemTheme)
      
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(newSystemTheme)
      
      // Maintain workspace classes
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
      // 🚫 Prevent theme change ONLY in customer workspace
      if (isCustomerWorkspace) {
        console.warn("Theme switching is disabled in customer workspace (always white)")
        return
      }
      
      // Save theme to appropriate storage
      if (isProfessionalWorkspace) {
        localStorage.setItem(professionalStorageKey, newTheme)
        console.log('💾 Saved professional workspace theme:', newTheme)
      } else {
        localStorage.setItem(storageKey, newTheme)
        console.log('💾 Saved general theme:', newTheme)
      }
      
      setTheme(newTheme)
    },
    actualTheme,
    isProfessionalWorkspace,
    isCustomerWorkspace,
  }

  // Prevent flash of unstyled content
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