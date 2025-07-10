// ============ Statistics.jsx - Tailwind + shadcn/ui Version ============
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Award,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

export default function Statistics() {
  // Beta state - set to true when user has actual bookings
  const hasBookings = false; // This would come from your app state/API

  const stats = [
    {
      title: "Total Earnings",
      value: hasBookings ? "$89,340" : "",
      change: hasBookings ? "+15%" : "",
      changeType: "positive",
      subtitle: hasBookings ? "This Month" : "Your first booking",
      icon: DollarSign,
      iconColor: "text-primary",
      iconBg: "bg-green-100",
    },
    {
      title: "This Month's Earning",
      value: hasBookings ? "$12,850" : "", 
      change: hasBookings ? "+8%" : "",
      changeType: "positive",
      subtitle: hasBookings ? "vs Last Month" : "Initial transactions",
      icon: TrendingUp,
      iconColor: "text-primary",
      iconBg: "bg-blue-100",
    },
    {
      title: "Mean Order Value",
      value: hasBookings ? "$485" : "",
      change: hasBookings ? "+12%" : "",
      changeType: "positive", 
      subtitle: hasBookings ? "Increase" : "After 3+ orders",
      icon: BarChart3,
      iconColor: "text-primary",
      iconBg: "bg-purple-100",
    },
    {
      title: "Commission Earned",
      value: hasBookings ? "$8,934" : "",
      change: hasBookings ? "10%" : "",
      changeType: "neutral",
      subtitle: hasBookings ? "Platform Fee" : "First customer", 
      icon: Award,
      iconColor: "text-primary",
      iconBg: "bg-orange-100",
    }
  ];

  if (!hasBookings) {
    // Beta Empty State
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={index} 
              className="border-2 border-dashed border-muted bg-muted from-muted/20 to-muted/40 opacity-80 hover:opacity-90 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="h-8 flex items-center">
                      <div className="h-6 w-16 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/40 rounded animate-pulse" />
                    </div>
                    <p className="text-xs text-muted-foreground/80">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.iconBg} opacity-60`}>
                    <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Original Statistics (when hasBookings = true)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const isPositive = stat.changeType === "positive";
        const isNegative = stat.changeType === "negative";
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1">
                    {stat.change && (
                      <>
                        <Badge 
                          variant={isPositive ? "default" : isNegative ? "destructive" : "secondary"}
                          className="text-xs gap-1"
                        >
                          {isPositive && <ArrowUp className="h-3 w-3" />}
                          {isNegative && <ArrowDown className="h-3 w-3" />}
                          {stat.change}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {stat.subtitle}
                        </span>
                      </>
                    )}
                    {!stat.change && (
                      <span className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}