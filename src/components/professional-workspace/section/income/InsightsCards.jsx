'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const insights = [
  {
    title: "Best Performance",
    subtitle: "Weekends 6–9 PM",
    icon: "📈",
    bgColor: "bg-muted",
    borderColor: "border-green-200",
    iconBg: "bg-green-50",
    titleColor: "text-foreground",
    subtitleColor: "text-foreground",
  },
  {
    title: "Opportunity",
    subtitle: "Mornings 7–9 AM",
    icon: "⭐",
    bgColor: "bg-muted",
    borderColor: "border-blue-300",
    iconBg: "bg-blue-50",
    titleColor: "text-foreground",
    subtitleColor: "text-foreground",
  },
  {
    title: "Weekly Goal",
    subtitle: "85% complete",
    icon: "🎯",
    bgColor: "bg-muted",
    borderColor: "border-yellow-300",
    iconBg: "bg-yellow-50",
    titleColor: "text-foreground",
    subtitleColor: "text-foreground",
  },
]

export default function InsightsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
      {insights.map((insight, index) => (
        <Card
          key={index}
          className={`flex items-center space-x-4 p-4 rounded-lg ${insight.bgColor} ${insight.borderColor} border`}
        >
          <div className={`w-8 h-8 ${insight.iconBg} rounded-full flex items-center justify-center`}>
            <span className="text-sm">{insight.icon}</span>
          </div>
          <div>
            <div className={`text-sm font-semibold ${insight.titleColor}`}>
              {insight.title}
            </div>
            <div className={`text-xs ${insight.subtitleColor}`}>
              {insight.subtitle}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
