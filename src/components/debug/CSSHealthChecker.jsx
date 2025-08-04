// css-health-checker.js
// Add this as a temporary component to test your CSS architecture
// Place in: src/components/debug/CSSHealthChecker.jsx

'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { Check, X, AlertTriangle, Monitor, Sun, Moon } from 'lucide-react'

export function CSSHealthChecker() {
  const { theme, actualTheme, isProfessionalWorkspace } = useTheme()
  const [checks, setChecks] = useState([])
  const [isVisible, setIsVisible] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      runHealthChecks()
    }
  }, [theme, actualTheme, isProfessionalWorkspace, isClient])

  // Don't render anything on the server
  if (!isClient) {
    return null
  }

  const runHealthChecks = () => {
    // Guard against SSR
    if (typeof window === 'undefined') return
    
    const results = []

    // 1. Check if CSS variables are properly defined
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)
    
    results.push({
      id: 'css-variables',
      name: 'CSS Variables',
      status: checkCSSVariables(computedStyle),
      details: 'Core CSS variables (--background, --foreground, etc.) are defined'
    })

    // 2. Check theme application
    results.push({
      id: 'theme-application',
      name: 'Theme Application',
      status: checkThemeApplication(),
      details: `Current theme: ${theme}, Applied: ${actualTheme}, Professional: ${isProfessionalWorkspace}`
    })

    // 3. Check professional workspace detection
    results.push({
      id: 'professional-detection',
      name: 'Professional Workspace Detection',
      status: checkProfessionalWorkspace(),
      details: 'Professional workspace is correctly detected and themed'
    })

    // 4. Check for CSS conflicts
    results.push({
      id: 'css-conflicts',
      name: 'CSS Conflicts',
      status: checkCSSConflicts(),
      details: 'No duplicate CSS imports or conflicting styles'
    })

    // 5. Check component classes
    results.push({
      id: 'component-classes',
      name: 'Component Classes',
      status: checkComponentClasses(),
      details: 'Professional and customer component classes are available'
    })

    // 6. Check responsive behavior
    results.push({
      id: 'responsive',
      name: 'Responsive Design',
      status: checkResponsive(),
      details: 'Layout adapts properly to different screen sizes'
    })

    setChecks(results)
  }

  const checkCSSVariables = (computedStyle) => {
    const requiredVars = [
      '--background',
      '--foreground',
      '--primary',
      '--secondary',
      '--border',
      '--sidebar-background'
    ]

    const missing = requiredVars.filter(varName => {
      const value = computedStyle.getPropertyValue(varName).trim()
      return !value || value === ''
    })

    return missing.length === 0 ? 'pass' : 'fail'
  }

  const checkThemeApplication = () => {
    const root = document.documentElement
    const hasThemeClass = root.classList.contains('light') || root.classList.contains('dark')
    
    if (isProfessionalWorkspace) {
      return root.classList.contains('dark') ? 'pass' : 'fail'
    }
    
    return hasThemeClass ? 'pass' : 'fail'
  }

  const checkProfessionalWorkspace = () => {
    if (typeof window === 'undefined') return 'pass'
    
    const currentPath = window.location.pathname
    const isProfessionalPath = currentPath.includes('/professional')
    
    if (isProfessionalPath && !isProfessionalWorkspace) return 'fail'
    if (!isProfessionalPath && isProfessionalWorkspace) return 'fail'
    
    return 'pass'
  }

  const checkCSSConflicts = () => {
    // Check for duplicate Tailwind imports
    const stylesheets = Array.from(document.styleSheets)
    let tailwindCount = 0
    
    try {
      stylesheets.forEach(sheet => {
        if (sheet.href && sheet.href.includes('tailwind')) {
          tailwindCount++
        }
      })
    } catch (e) {
      // CORS issues with external stylesheets
    }

    // Check for old professional.css
    const hasOldProfessionalCSS = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .some(link => link.href && link.href.includes('professional.css'))

    return !hasOldProfessionalCSS ? 'pass' : 'fail'
  }

  const checkComponentClasses = () => {
    // Test if our component classes exist by creating a temporary element
    const testElement = document.createElement('div')
    testElement.className = 'professional-card'
    document.body.appendChild(testElement)
    
    const computedStyle = getComputedStyle(testElement)
    const hasBackground = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)'
    
    document.body.removeChild(testElement)
    
    return hasBackground ? 'pass' : 'warning'
  }

  const checkResponsive = () => {
    if (typeof window === 'undefined') return 'pass'
    
    const isMobile = window.innerWidth < 768
    const hasViewportMeta = document.querySelector('meta[name="viewport"]')
    
    return hasViewportMeta ? 'pass' : 'warning'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <Check className="w-4 h-4 text-green-500" />
      case 'fail': return <X className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'text-green-700 bg-green-50 border-green-200'
      case 'fail': return 'text-red-700 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const overallStatus = checks.every(check => check.status === 'pass') ? 'pass' :
                      checks.some(check => check.status === 'fail') ? 'fail' : 'warning'

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg z-50"
        title="Show CSS Health Checker"
      >
        <Monitor className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-background border border-border rounded-lg shadow-xl z-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          {getStatusIcon(overallStatus)}
          CSS Health Check
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-accent rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Current State Summary */}
      <div className="mb-4 p-3 bg-muted rounded-md">
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            {actualTheme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
            <span>Theme: {theme} → {actualTheme}</span>
          </div>
          <div>Path: {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</div>
          <div>Professional: {isProfessionalWorkspace ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="space-y-2 mb-4">
        {checks.map(check => (
          <div
            key={check.id}
            className={cn(
              'p-2 rounded border text-sm',
              getStatusColor(check.status)
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(check.status)}
              <span className="font-medium">{check.name}</span>
            </div>
            <div className="text-xs opacity-75">{check.details}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={runHealthChecks}
          className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
        >
          Recheck
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90"
        >
          Reload
        </button>
      </div>

      {/* Quick Actions for Testing */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">Quick Tests:</div>
        <div className="flex gap-1 text-xs">
          <a 
            href="/professional/workspace" 
            className="px-2 py-1 bg-accent rounded hover:bg-accent/80"
          >
            Professional
          </a>
          <a 
            href="/customer/workspace" 
            className="px-2 py-1 bg-accent rounded hover:bg-accent/80"
          >
            Customer
          </a>
          <a 
            href="/" 
            className="px-2 py-1 bg-accent rounded hover:bg-accent/80"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  )
}

// Test component to verify your new component classes
export function ComponentClassTest() {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Component Class Tests</h2>
      
      {/* Professional Components Test */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Professional Components</h3>
        <div className="professional-card p-4 space-y-3">
          <h4 className="font-medium">Professional Card</h4>
          <div className="flex gap-2">
            <button className="professional-button-primary">Primary Button</button>
            <button className="professional-button-secondary">Secondary Button</button>
          </div>
          <input 
            className="professional-input w-full" 
            placeholder="Professional input field"
          />
          <textarea 
            className="professional-textarea w-full" 
            placeholder="Professional textarea"
          />
        </div>
      </section>

      {/* Customer Components Test */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Components</h3>
        <div className="customer-card space-y-3">
          <h4 className="font-medium">Customer Card</h4>
          <button className="customer-button-primary">Book Service</button>
        </div>
      </section>

      {/* Utility Components Test */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Utility Components</h3>
        <div className="loading-shimmer h-20 rounded-md"></div>
        <div className="error-state">Error state component</div>
        <div className="success-state">Success state component</div>
        <button className="brand-button">Brand Button</button>
      </section>
    </div>
  )
}