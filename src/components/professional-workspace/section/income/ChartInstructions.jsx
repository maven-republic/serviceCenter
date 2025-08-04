'use client'

export default function ChartInstructions({ activeChart }) {
  const getTimeUnit = () => {
    switch (activeChart) {
      case 'daily': return 'day'
      case 'hourly': return 'hour'
      case 'weekly': return 'week'
      case 'monthly': return 'month'
      default: return 'period'
    }
  }

  return (
    <div className="mt-5 rounded-md border border-border bg-muted/50 p-4">
      <p className="text-sm text-muted-foreground">
        💡 <span className="font-medium">Tip:</span> Click on any bar in the chart to see detailed earnings for that specific {getTimeUnit()}.
      </p>
    </div>
  )
}
