// ============ TodaysIncome.jsx - Tailwind + shadcn/ui Version ============
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Clock, DollarSign, TrendingUp } from 'lucide-react';

export default function TodaysIncome({ hideEarnings }) {
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Beta state - set to true when user has actual bookings
  const hasBookings = false; // This would come from your app state/API

  useEffect(() => {
    // Only run the earnings counter if we have bookings or showing preview
    if (hasBookings || showPreview) {
      const interval = setInterval(() => {
        setCurrentEarnings(prev => prev + Math.random() * 20);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [hasBookings, showPreview]);

  const formatEarnings = (amount) => {
    if (hideEarnings) return '••••';
    return `$${amount.toFixed(2)}`;
  };

  // Beta Empty State
  if (!hasBookings && !showPreview) {
    return (
      <div className="max-w-2xl">
        <Card className="border-2 border-dashed border-muted bg-muted from-muted/20 to-muted/40 transition-all duration-300 hover:border-muted-foreground/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Today's Earnings</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-20 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/40 rounded animate-pulse" />
                  <DollarSign className="h-5 w-5 text-muted-foreground/60" />
                </div>
                <p className="text-xs text-muted-foreground/80">Waiting for your first booking</p>
              </div>
              
              <div className="text-right space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Time Online</p>
                <div className="flex items-center gap-2 justify-end">
                  <Clock className="h-6 w-6 text-muted-foreground/60" />
                  <div className="h-6 w-12 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/40 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Preview Toggle */}
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPreview(true)}
            className="gap-2 text-xs"
          >
            <Eye className="h-3 w-3" />
            Preview earnings
          </Button>
        </div>
      </div>
    );
  }

  // Preview or Live Mode
  return (
    <div className="max-w-2xl">
      <Card className={`bg-muted transition-all duration-300 border-0 ${
        showPreview 
          ? 'bg-muted opacity-80' 
          : 'bg-card'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-popover-foreground">
                  {showPreview ? "Today's Earnings (Preview)" : "Today's Earnings"}
                </p>
                {showPreview && (
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                    Preview Mode
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-popover-foreground">
                  {showPreview ? `Sample: ${formatEarnings(currentEarnings)}` : formatEarnings(currentEarnings)}
                </p>
                <DollarSign className="h-5 w-5 text-popover-foreground/80" />
              </div>
              
              <div className="flex items-center gap-1 text-popover-foreground/90">
                <TrendingUp className="h-3 w-3" />
                <p className="text-sm">
                  {showPreview ? "Sample data +12%" : "+12% from yesterday"}
                </p>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <p className="text-sm font-medium text-popover-foreground">Active Hours</p>
              <div className="flex items-center gap-2 justify-end">
                <Clock className="h-5 w-5 text-popover-foreground/80" />
                <p className="text-2xl font-bold text-popover-foreground">
                  {showPreview ? "Demo" : "6.5h"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Show preview controls only in beta mode */}
      {!hasBookings && showPreview && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPreview(false)}
            className="gap-2 text-xs"
          >
            <EyeOff className="h-3 w-3" />
            Hide preview
          </Button>
        </div>
      )}
    </div>
  );
}