// File: src/app/(customer-workspace)/customer/services/[id]/components/SelectedProfessionalsBar.jsx
// 📌 Fixed bottom bar for selected professionals

import { Button } from '@/components/ui/button'
import { CheckCircle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SelectedProfessionalsBar({ 
  selectedProfessionals = [], 
  onRequestQuotes,
  isMobile = false,
  className 
}) {
  // Don't render if no professionals are selected
  if (selectedProfessionals.length === 0) {
    return null
  }

  const count = selectedProfessionals.length
  const isPlural = count !== 1

  return (
    <div className={cn(
      // Fixed positioning and backdrop
      "fixed bottom-0 bg-background/95 backdrop-blur-sm border-t shadow-lg p-3 sm:p-4 z-40",
      // Full width positioning
      "left-0 right-0 lg:left-0",
      className
    )}>
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          
          {/* Selection Count Info */}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            <span>
              {count} professional{isPlural ? 's' : ''} selected
            </span>
          </div>
          
          {/* Request Quotes Button */}
          <Button 
            size={isMobile ? "default" : "lg"}
            onClick={onRequestQuotes}
            className="gap-2 px-4 sm:px-8 h-11 sm:h-12 text-sm sm:text-base order-1 sm:order-2 w-full sm:w-auto"
          >
            <MessageSquare className="h-4 w-4" />
            
            {/* Responsive text based on screen size */}
            <span className="hidden xs:inline">Request Quotes from </span>
            <span className="xs:hidden">Request from </span>
            
            {count}
            
            <span className="hidden sm:inline">
              Professional{isPlural ? 's' : ''}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}