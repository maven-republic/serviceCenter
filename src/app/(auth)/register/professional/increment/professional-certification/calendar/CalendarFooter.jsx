'use client'

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function CalendarFooter({
  isMobile,
  onTodayClick,
  onClearClick
}) {

  return (
    <div className={cn("space-y-3", isMobile ? "mt-4" : "mt-3")}>
      <Separator />
      
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={onTodayClick}
          className={cn(
            "text-xs font-normal",
            isMobile && "text-sm h-10 px-4"
          )}
        >
          Today
        </Button>

        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={onClearClick}
          className={cn(
            "text-xs font-normal text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground",
            isMobile && "text-sm h-10 px-4"
          )}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}