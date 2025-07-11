'use client'

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NavigationSelectors({
  currentStep,
  nextStep,
  prevStep,
  totalSteps = 10,
  onSubmit,
  loading = false
}) {
  const progressPercent = (currentStep / totalSteps) * 100

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center max-w-4xl mx-auto">
          
          {/* Back Button */}
          <div className="flex justify-center md:justify-start">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="w-full md:w-auto transition-all duration-200 hover:bg-secondary/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div className="hidden md:block" /> // Spacer for alignment
            )}
          </div>

          {/* Progress Section */}
          <div className="flex flex-col items-center space-y-1 order-first md:order-none">
            <div className="w-full max-w-xs">
              <Progress 
                value={progressPercent} 
                className="h-1.5 transition-all duration-500 ease-out"
              />
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          {/* Next/Submit Button */}
          <div className="flex justify-center md:justify-end">
            {currentStep < totalSteps ? (
              <Button
                type="button"
                size="sm"
                onClick={nextStep}
                className={cn(
                  "w-full md:w-auto transition-all duration-200",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "font-medium"
                )}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={onSubmit}
                disabled={loading}
                className={cn(
                  "w-full md:w-auto transition-all duration-200",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Step Indicator */}
        <div className="md:hidden mt-2 pt-2 border-t">
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }, (_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    idx + 1 <= currentStep ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}