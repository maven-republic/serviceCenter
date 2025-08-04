'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Clock, Calendar } from "lucide-react"

export default function Pricing({ formData, updateFormData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      
      {/* Left column: Explanatory content */}
      <div className="lg:col-span-2 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Pricing</h2>
          </div>
          
          <div className="space-y-3 text-muted-foreground">
            <p>
              Set your service rates. These help clients understand what to expect and allow you to communicate your value clearly.
            </p>
            <p>
              You can always adjust these rates later based on demand and experience.
            </p>
          </div>
        </div>

        {/* Pricing Tips Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Pricing Tips</p>
                <p className="text-xs text-blue-700">
                  Research market rates in Jamaica. Consider your experience level and unique value proposition.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column: Form fields */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Rate Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourlyRate" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hourly Rate (JMD)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={updateFormData}
                  placeholder="2500"
                  className="pl-8"
                  min="0"
                  step="100"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This is your standard rate per hour for most services
              </p>
            </div>

            {/* Daily Rate */}
            <div className="space-y-2">
              <Label htmlFor="dailyRate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Daily Rate (JMD)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  id="dailyRate"
                  name="dailyRate"
                  value={formData.dailyRate}
                  onChange={updateFormData}
                  placeholder="15000"
                  className="pl-8"
                  min="0"
                  step="500"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Full day rate for extended projects (typically 8 hours)
              </p>
            </div>

            {/* Rate Calculation Helper */}
            {formData.hourlyRate && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Rate Calculator</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">4 hours:</span>
                    <span className="ml-2 font-medium">
                      JMD ${(parseInt(formData.hourlyRate) * 4).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">8 hours:</span>
                    <span className="ml-2 font-medium">
                      JMD ${(parseInt(formData.hourlyRate) * 8).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}