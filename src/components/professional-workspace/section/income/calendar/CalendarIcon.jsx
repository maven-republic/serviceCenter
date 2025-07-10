// ============ CalendarLegend.jsx - shadcn/ui + professional.css Version ============
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { 
  Calendar as CalendarIcon,
  DollarSign,
  Target,
  Clock,
  Info,
  ChevronRight,
  Circle,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CalendarIcon({ 
  showEarningsLegend = false,
  selectedRange = null,
  totalDaysSelected = 0,
  compact = false,
  showUsageTips = true
}) {
  // Basic calendar legend items
  const basicLegendItems = [
    {
      icon: <div className="w-3 h-3 bg-primary rounded border border-primary" />,
      label: 'Today',
      description: 'Current date'
    },
    {
      icon: <div className="w-3 h-3 bg-foreground rounded-sm" />,
      label: 'Selected',
      description: 'Chosen date(s)'
    },
    {
      icon: <div className="w-3 h-3 bg-muted rounded-sm border border-border" />,
      label: 'Range',
      description: 'Date range selection'
    },
    {
      icon: <Circle className="w-3 h-3 text-muted-foreground fill-current" />,
      label: 'Past dates',
      description: 'Previous dates'
    }
  ];

  // Earnings legend items
  const earningsLegendItems = [
    {
      icon: <Circle className="w-3 h-3 text-green-500 fill-current" />,
      label: 'High earnings',
      description: '$1000+',
      level: 'high'
    },
    {
      icon: <Circle className="w-3 h-3 text-yellow-500 fill-current" />,
      label: 'Medium earnings',
      description: '$500+',
      level: 'medium'
    },
    {
      icon: <Circle className="w-3 h-3 text-blue-500 fill-current" />,
      label: 'Low earnings',
      description: '$100+',
      level: 'low'
    },
    {
      icon: <Circle className="w-3 h-3 text-gray-400 fill-current" />,
      label: 'Minimal earnings',
      description: 'Under $100',
      level: 'minimal'
    }
  ];

  // Calculate days between dates
  const calculateDays = () => {
    if (!selectedRange?.startDate || !selectedRange?.endDate) return 0;
    const timeDiff = selectedRange.endDate.getTime() - selectedRange.startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const calculatedDays = totalDaysSelected || calculateDays();

  return (
    <Card className="professional-workspace mt-4">
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className={cn("text-sm", compact && "text-xs")}>
            Calendar Legend
          </CardTitle>
        </div>
        {!compact && (
          <CardDescription className="text-xs">
            Visual guide for calendar elements and states
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Legend */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-muted-foreground" />
            <h4 className="text-xs font-medium text-foreground">
              Date States
            </h4>
          </div>
          
          <div className={cn(
            "grid gap-2",
            compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
          )}>
            {basicLegendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex items-center justify-center w-4 h-4">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-foreground">
                    {item.label}
                  </span>
                  {!compact && (
                    <span className="text-xs text-muted-foreground ml-1">
                      - {item.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Legend (when enabled) */}
        {showEarningsLegend && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <h4 className="text-xs font-medium text-foreground">
                  Earnings Levels
                </h4>
              </div>
              
              <div className={cn(
                "grid gap-2",
                compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
              )}>
                {earningsLegendItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-4 h-4">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-foreground">
                        {item.label}
                      </span>
                      {!compact && (
                        <span className="text-xs text-muted-foreground ml-1">
                          - {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Selection Info */}
        {selectedRange && selectedRange.startDate && selectedRange.endDate && (
          <>
            <Separator />
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Selected Range
                </span>
              </div>
              <div className="text-xs text-foreground">
                <div className="flex items-center gap-1">
                  <span>
                    {selectedRange.startDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: selectedRange.startDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <span>
                    {selectedRange.endDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: selectedRange.endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </span>
                </div>
                {calculatedDays > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {calculatedDays} day{calculatedDays !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Usage Tips */}
        {showUsageTips && !compact && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-3 w-3 text-muted-foreground" />
                <h4 className="text-xs font-medium text-foreground">
                  Usage Tips
                </h4>
              </div>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>•</span>
                  <span>Click dates to select range</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>•</span>
                  <span>Navigate months with arrow buttons</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>•</span>
                  <span>Use "Today" button to jump to current month</span>
                </div>
                {showEarningsLegend && (
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>Colored dots indicate earnings levels</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        {!compact && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  Interactive
                </Badge>
                {showEarningsLegend && (
                  <Badge variant="outline" className="text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Earnings
                  </Badge>
                )}
              </div>
              
              {selectedRange && (
                <Badge variant="secondary" className="text-xs">
                  Range Selected
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}