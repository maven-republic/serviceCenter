'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SelectWithSearch({
  label,
  placeholder,
  value,
  options = [],
  onValueChange,
  onQueryChange,
  displayField = 'name',
  valueField = 'name',
  isLoading = false,
  noResultsMessage = 'No results found'
}) {
  const [query, setQuery] = useState('')
  const [filteredOptions, setFilteredOptions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  // Filter options based on query
  useEffect(() => {
    if (query.trim()) {
      const matches = options.filter(option =>
        option[displayField].toLowerCase().includes(query.toLowerCase())
      )
      setFilteredOptions(matches)
      setShowDropdown(true)
    } else {
      setFilteredOptions([])
      setShowDropdown(false)
    }
  }, [query, options, displayField])

  // Sync query with external value changes
  useEffect(() => {
    if (value !== query) {
      setQuery(value)
    }
  }, [value])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setQuery(newValue)
    onValueChange(newValue)
    if (onQueryChange) {
      onQueryChange(newValue)
    }
  }

  const handleOptionSelect = (option) => {
    const selectedValue = option[valueField]
    setQuery(selectedValue)
    onValueChange(selectedValue)
    setShowDropdown(false)
  }

  return (
    <div className="space-y-2 relative">
      <Label className="text-sm font-medium">{label}</Label>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className={cn(
            "pl-10 transition-all duration-200",
            showDropdown && "ring-2 ring-ring ring-offset-2"
          )}
        />
      </div>

      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-hidden shadow-lg animate-in fade-in-0 slide-in-from-top-1">
          <CardContent className="p-0">
            <div className="max-h-48 overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Loading...</span>
                </div>
              )}

              {!isLoading && filteredOptions.length === 0 && query.trim() && (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{noResultsMessage}</span>
                </div>
              )}

              {!isLoading && filteredOptions.length > 0 && 
                filteredOptions.map((option, index) => (
                  <button
                    key={option.id || option[valueField] || index}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0 focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    onMouseDown={() => handleOptionSelect(option)}
                  >
                    <div className="font-medium text-sm">{option[displayField]}</div>
                    {option.subtitle && (
                      <div className="text-xs text-muted-foreground mt-1">{option.subtitle}</div>
                    )}
                  </button>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}