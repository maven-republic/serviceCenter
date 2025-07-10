import { Button } from '@/components/ui/button'
import { Eye, EyeOff, TrendingUp } from 'lucide-react'

export default function InsightsHeader({ hideEarnings, setHideEarnings }) {
  return (
    <div className="flex items-start justify-between border-b border-border pb-4 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Income Insights</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-md">
          Track your earning patterns and optimize your schedule for better performance
        </p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        className="gap-2 shrink-0"
        onClick={() => setHideEarnings(!hideEarnings)}
      >
        {hideEarnings ? (
          <>
            <Eye className="h-4 w-4" />
            Show Earnings
          </>
        ) : (
          <>
            <EyeOff className="h-4 w-4" />
            Hide Earnings
          </>
        )}
      </Button>
    </div>
  );
}