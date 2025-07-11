'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Briefcase,
  Tag,
  Users,
  Building
} from "lucide-react"
import useSearchStore from '@/store/searchStore'
import { cn } from "@/lib/utils"

export default function UniversalSearch({ 
  className = '',
  placeholder = "Search for services, professionals, or categories...",
  onSearch
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const { setSearchQuery } = useSearchStore()
  const searchTimeout = useRef(null)

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (query.length >= 2) {
      searchTimeout.current = setTimeout(() => {
        fetchSuggestions(query)
      }, 300)
    } else {
      setSuggestions([])
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [query, fetchSuggestions])

  // Handle search execution
  const executeSearch = useCallback((searchQuery, type = 'service') => {
    if (!searchQuery.trim()) return

    // Update search store
    setSearchQuery(searchQuery.trim())
    
    // Call parent callback if provided
    if (onSearch) {
      onSearch(searchQuery.trim())
    }

    // Navigate to search results
    if (type === 'industry' || type === 'vertical') {
      router.push(`/customer/workspace?category=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push(`/customer/workspace?q=${encodeURIComponent(searchQuery)}`)
    }

    // Close dialog
    setOpen(false)
    setQuery('')
  }, [router, setSearchQuery, onSearch])

  // Handle keyboard shortcut
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setOpen(true)
    }
  }, [])

  // Keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Get icon for suggestion type
  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'service': return Briefcase
      case 'keyword': return Search
      case 'industry': return Building
      case 'vertical': return Tag
      case 'professional': return Users
      default: return Search
    }
  }

  // Get badge text for suggestion type
  const getBadgeText = (suggestion) => {
    switch (suggestion.type) {
      case 'service': return 'Service'
      case 'keyword': return 'Related'
      case 'industry': return 'Industry'
      case 'vertical': return 'Category'
      case 'professional': return 'Pro'
      default: return suggestion.badge || suggestion.type
    }
  }

  return (
    <>
      {/* Minimalist Search Bar */}
      <div className={cn("relative w-full max-w-2xl", className)}>
        <Button
          variant="outline"
          className="relative w-full justify-start text-muted-foreground hover:bg-accent/50 h-12"
          onClick={() => setOpen(true)}
        >
          <Search className="mr-3 h-4 w-4" />
          <span className="flex-1 text-left">{placeholder}</span>
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>
      </div>

      {/* Search Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={setQuery}
          className="text-base"
        />
        
        <CommandList className="max-h-96">
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <CommandGroup>
              {suggestions.map((suggestion, index) => {
                const Icon = getSuggestionIcon(suggestion.type)
                return (
                  <CommandItem
                    key={`${suggestion.type}-${suggestion.id}-${index}`}
                    value={suggestion.text}
                    onSelect={() => executeSearch(suggestion.text, suggestion.type)}
                    className="flex items-center gap-3 p-3"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.text}</div>
                      {suggestion.category && (
                        <div className="text-xs text-muted-foreground">
                          {suggestion.category}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getBadgeText(suggestion)}
                    </Badge>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}

          {/* No Results */}
          {query.length >= 2 && !loading && suggestions.length === 0 && (
            <CommandEmpty className="py-6 text-center">
              <div className="space-y-2">
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No results found for "{query}"
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeSearch(query)}
                  className="mt-2"
                >
                  Search anyway
                </Button>
              </div>
            </CommandEmpty>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}