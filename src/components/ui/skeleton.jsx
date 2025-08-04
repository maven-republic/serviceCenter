import { cn } from "@/lib/utils"

function Skeleton({ 
  className, 
  variant = "default",
  speed = "normal",
  shimmer = false,
  ...props 
}) {
  const variants = {
    default: "bg-muted",
    light: "bg-gray-100",
    dark: "bg-gray-300",
    subtle: "bg-gray-50",
    card: "bg-white border border-gray-100",
  }

  const speeds = {
    slow: "animate-pulse [animation-duration:2s]",
    normal: "animate-pulse",
    fast: "animate-pulse [animation-duration:0.8s]",
  }

  const shimmerClasses = shimmer 
    ? "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent"
    : ""

  return (
    <div
      className={cn(
        "rounded-md",
        variants[variant],
        speeds[speed],
        shimmerClasses,
        className
      )}
      {...props}
    />
  )
}

// Preset skeleton components for common use cases
function SkeletonText({ lines = 1, className, ...props }) {
  if (lines === 1) {
    return <Skeleton className={cn("h-4 w-full", className)} {...props} />
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full", // Last line shorter
            className
          )}
          {...props}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ size = "default", className, ...props }) {
  const sizes = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  return (
    <Skeleton
      className={cn("rounded-full", sizes[size], className)}
      {...props}
    />
  )
}

function SkeletonButton({ size = "default", className, ...props }) {
  const sizes = {
    sm: "h-8 px-3",
    default: "h-10 px-4",
    lg: "h-12 px-6",
  }

  return (
    <Skeleton
      className={cn("rounded-md", sizes[size], className)}
      {...props}
    />
  )
}

function SkeletonCard({ className, ...props }) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        <SkeletonText lines={2} />
        <div className="flex items-center space-x-2">
          <SkeletonAvatar size="sm" />
          <SkeletonText className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5, columns = 4, className, ...props }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4 flex-1"
              variant="light"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard,
  SkeletonTable 
}