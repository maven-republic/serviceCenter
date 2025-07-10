'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ServiceTag({ service, selected, onToggle }) {
  return (
    <Button
      type="button"
      variant={selected ? "default" : "outline"}
      size="sm"
      onClick={() => onToggle(service.service_id)}
      title={service.name}
      aria-pressed={selected}
      className={cn(
        "h-auto py-2 px-3 text-sm transition-all duration-200",
        "border-border hover:border-primary/50",
        selected && "bg-primary text-primary-foreground border-primary shadow-sm",
        !selected && "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <div className="flex items-center gap-2">
        {selected && <Check className="h-3 w-3" />}
        <span className="truncate">{service.name}</span>
      </div>
    </Button>
  )
}