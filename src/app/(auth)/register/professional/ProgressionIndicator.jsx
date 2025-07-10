'use client'

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const PROGRESSION_LABELS = [
  'Account',
  'Identity', 
  'Education',
  'Address',
  'Services',
  'Pricing',
  'Contact'
]

export default function ProgressionIndicator({ currentStep, onStepClick }) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {PROGRESSION_LABELS.map((label, idx) => {
          const stepNum = idx + 1
          const isCompleted = currentStep > stepNum
          const isActive = currentStep === stepNum
          const isClickable = onStepClick && currentStep > stepNum

          return (
            <div
              key={label}
              className={cn(
                "flex flex-col items-center space-y-2 min-w-0",
                "transition-all duration-300 ease-in-out",
                isClickable && "cursor-pointer hover:scale-105"
              )}
              onClick={() => {
                if (isClickable) {
                  onStepClick(stepNum)
                }
              }}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  "text-sm font-medium",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isActive && "border-primary bg-primary/10 text-primary",
                  !isCompleted && !isActive && "border-muted-foreground/30 bg-background text-muted-foreground",
                  isClickable && "hover:border-primary hover:bg-primary/5"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNum}</span>
                )}
                
                {/* Connector Line (except for last step) */}
                {idx < PROGRESSION_LABELS.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-full top-1/2 w-8 md:w-12 h-0.5 -translate-y-1/2 transition-colors duration-300",
                      "hidden sm:block",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  />
                )}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  "text-xs font-medium text-center transition-colors duration-300",
                  "max-w-16 truncate",
                  isCompleted && "text-primary",
                  isActive && "text-primary font-semibold",
                  !isCompleted && !isActive && "text-muted-foreground"
                )}
                title={label}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mobile Alternative: Horizontal Progress Bar */}
      <div className="sm:hidden mt-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Step {currentStep}</span>
          <span>{PROGRESSION_LABELS.length} Steps</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / PROGRESSION_LABELS.length) * 100}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-foreground">
            {PROGRESSION_LABELS[currentStep - 1]}
          </span>
        </div>
      </div>
    </div>
  )
}