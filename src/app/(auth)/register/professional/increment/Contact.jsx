'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Contact({
  formData,
  errors,
  updateFormData,
  handleBlur
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
        <Phone className="h-4 w-4" />
        Phone Number
      </Label>
      <Input
        type="tel"
        id="phone"
        name="phone"
        value={formData.phone}
        onChange={updateFormData}
        onBlur={handleBlur}
        placeholder="876-123-4567"
        className={cn(
          errors.phone && 'border-destructive focus-visible:ring-destructive',
          formData.phone && !errors.phone && 'border-green-500 focus-visible:ring-green-500'
        )}
      />
      
      {errors.phone && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.phone}</AlertDescription>
        </Alert>
      )}
      
      {formData.phone && !errors.phone && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Valid phone number
        </p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Enter a valid phone number (e.g., 8761234567)
      </p>
    </div>
  )
}