'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, X, Brain } from "lucide-react"

export default function EducationCompetenceSelector({ selected, allCompetences, onSelect, onRemove }) {
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)

  const suggestions = (allCompetences || [])
    .filter(c =>
      c.name.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(c.competence_id)
    )
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Brain className="h-4 w-4" />
        What soft skills do you have that would make you likeable to our customers?
      </div>

      {!showInput ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowInput(true)}
          className="border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Competence
        </Button>
      ) : (
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Type a competence..."
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
                  {suggestions.map(c => (
                    <button
                      key={c.competence_id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => {
                        onSelect(c.competence_id)
                        setInput('')
                        setShowInput(false)
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
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
        </div>
      )}

      {selected.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Selected Competences:</div>
          <div className="flex flex-wrap gap-2">
            {selected.map(id => {
              const comp = allCompetences.find(c => c.competence_id === id)
              if (!comp) return null
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => onRemove(id)}
                >
                  {comp.name}
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