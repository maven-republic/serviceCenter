// src/components/professional-workspace/interests/forms/ProvideFinalQuote.jsx
'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, DollarSign } from 'lucide-react'

export default function ProvideFinalQuote({
  assessment,
  interest,
  finalQuoteAmount,
  setFinalQuoteAmount,
  responseMessage,
  setResponseMessage,
  loading = false
}) {
  
  const priceRangeMin = interest?.price_range_min || 0
  const priceRangeMax = interest?.price_range_max || 0
  
  return (
    <div className="space-y-6">
      {/* Assessment Summary */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Assessment Complete!</strong> Based on your site visit, please provide the final quote for this project.
          {priceRangeMin > 0 && priceRangeMax > 0 && (
            <div className="mt-2 text-sm">
              Original estimate range: ${priceRangeMin.toFixed(2)} - ${priceRangeMax.toFixed(2)}
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Final Quote Amount */}
      <div className="space-y-3">
        <Label htmlFor="finalQuote" className="text-base font-semibold">
          Final Quote Amount <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="finalQuote"
            type="number"
            min="0"
            step="0.01"
            value={finalQuoteAmount}
            onChange={(e) => setFinalQuoteAmount(e.target.value)}
            placeholder="0.00"
            disabled={loading}
            className="pl-10 text-lg font-semibold"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Provide the total project cost based on your assessment findings.
        </p>
      </div>

      {/* Quote Explanation */}
      <div className="space-y-3">
        <Label htmlFor="quoteMessage" className="text-base font-semibold">
          Quote Details & Explanation <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="quoteMessage"
          value={responseMessage}
          onChange={(e) => setResponseMessage(e.target.value)}
          placeholder="Explain what's included in your quote, timeline, and any important details the customer should know..."
          disabled={loading}
          rows={8}
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground">
          Min 50 characters. Include scope of work, timeline, materials, and any conditions.
        </p>
      </div>

      {/* Validation Info */}
      {priceRangeMin > 0 && priceRangeMax > 0 && finalQuoteAmount && (
        <Alert className={
          parseFloat(finalQuoteAmount) < priceRangeMin || parseFloat(finalQuoteAmount) > priceRangeMax
            ? 'bg-amber-50 border-amber-200'
            : 'bg-green-50 border-green-200'
        }>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {parseFloat(finalQuoteAmount) < priceRangeMin && (
              <span className="text-amber-800">
                <strong>Below estimate:</strong> Your quote is lower than the original range. 
                This is great for the customer!
              </span>
            )}
            {parseFloat(finalQuoteAmount) > priceRangeMax && (
              <span className="text-amber-800">
                <strong>Above estimate:</strong> Your quote is higher than the original range. 
                Make sure to explain the additional scope or complexity in your message.
              </span>
            )}
            {parseFloat(finalQuoteAmount) >= priceRangeMin && 
             parseFloat(finalQuoteAmount) <= priceRangeMax && (
              <span className="text-green-800">
                <strong>Within range:</strong> Your quote is within the estimated range provided.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}