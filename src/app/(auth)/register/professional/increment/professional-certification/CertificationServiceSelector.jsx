'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, X, Tag } from "lucide-react"

export default function CertificationServiceSelector({ selected, onSelect, onRemove }) {
  const supabase = useSupabaseClient()
  const [allServices, setAllServices] = useState([])
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('service')
        .select('service_id, name')
        .order('name')

      if (!error) setAllServices(data)
    }

    fetchServices()
  }, [supabase])

  const suggestions = allServices
    .filter(service =>
      service.name.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(service.service_id)
    )
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Related Services
        </Label>
        <p className="text-sm text-muted-foreground">
          Tag services or work types this credential qualifies you for
        </p>

        {!showInput ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowInput(true)}
            className="border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        ) : (
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Search services..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setInput('')
                  setShowInput(false)
                }
              }}
            />

            {suggestions.length > 0 && (
              <Card>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {suggestions.map(service => (
                      <button
                        key={service.service_id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          onSelect(service.service_id)
                          setInput('')
                          setShowInput(false)
                        }}
                      >
                        {service.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setInput('')
                setShowInput(false)
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Services:</Label>
          <div className="flex flex-wrap gap-2">
            {selected.map(id => {
              const svc = allServices.find(s => s.service_id === id)
              if (!svc) return null
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => onRemove(id)}
                >
                  {svc.name}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}