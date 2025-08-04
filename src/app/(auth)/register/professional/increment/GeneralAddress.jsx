'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Radius, Mountain, AlertCircle } from "lucide-react"
import Address from '@/components/Address/Address'
import AddressMap from '@/components/Address/AddressMap'

export default function GeneralAddress({
  formData,
  errors,
  handleAddressSelect,
  updateFormData
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      
      {/* Left column: Explanation */}
      <div className="lg:col-span-2 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Address & Service Area</h2>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Provide your home base address and how far you're willing to travel for work.
          </p>
        </div>

        {/* Compact Info Card */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Radius className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-amber-900">Service Area Tips</p>
                <p className="text-xs text-amber-700">
                  A larger service area means more potential clients, but consider travel time and costs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column: Form inputs */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-4 w-4" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Address Input */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                Street Address
              </Label>
              <Address
                defaultValue={formData.formattedAddress}
                onSelect={handleAddressSelect}
              />
              {errors.streetAddress && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.streetAddress}
                </p>
              )}
            </div>

            {/* Service Radius Slider */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Radius className="h-4 w-4" />
                Service Area: {formData.serviceRadius} km
              </Label>
              
              <div className="px-1">
                <Slider
                  value={[parseInt(formData.serviceRadius) || 1]}
                  onValueChange={(value) => 
                    updateFormData({
                      target: {
                        name: 'serviceRadius',
                        value: value[0].toString()
                      }
                    })
                  }
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                
                {/* Slider Labels */}
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                This defines how far away from your home you're willing to work.
              </p>
            </div>

            {/* Map Preview */}
            {formData.latitude && formData.longitude && (
              <div className="space-y-1">
                <Label className="text-sm font-medium">Service Area Preview</Label>
                <div className="border rounded-lg overflow-hidden h-48">
                  <AddressMap
                    lat={formData.latitude}
                    lng={formData.longitude}
                    radius={formData.serviceRadius || 0}
                  />
                </div>
              </div>
            )}

            {/* Rural Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRural"
                checked={formData.isRural}
                onCheckedChange={(checked) =>
                  updateFormData({
                    target: {
                      name: 'isRural',
                      value: checked
                    }
                  })
                }
              />
              <Label 
                htmlFor="isRural" 
                className="text-sm font-medium flex items-center gap-2 cursor-pointer"
              >
                <Mountain className="h-4 w-4" />
                This is a rural address
              </Label>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}