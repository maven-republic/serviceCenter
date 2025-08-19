import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

// Enhanced variant implementation with responsive support
const getButtonClasses = ({ 
  variant = "default", 
  size = "default", 
  responsive = false,
  enhanced = false,
  gradient = false 
}) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }
  
  const sizes = {
    default: responsive ? "h-12 px-6 text-base sm:h-9 sm:px-4 sm:text-sm" : "h-9 px-4 py-2",
    sm: responsive ? "h-10 px-4 text-sm sm:h-8 sm:px-3 sm:text-xs" : "h-8 rounded-md px-3 text-xs",
    lg: responsive ? "h-14 px-8 text-lg sm:h-11 sm:px-6 sm:text-base" : "h-10 rounded-md px-8",
    icon: responsive ? "h-12 w-12 sm:h-9 sm:w-9" : "h-9 w-9",
  }

  // Enhanced modifiers
  const enhancements = enhanced ? "btn-enhanced" : ""
  const gradientClass = gradient ? "btn-brand" : ""
  
  return cn(
    baseClasses, 
    variants[variant] || variants.default, 
    sizes[size] || sizes.default,
    enhancements,
    gradientClass
  )
}

const Button = React.forwardRef(({ 
  className, 
  variant = "default",
  size = "default", 
  responsive = false,
  enhanced = false,
  gradient = false,
  asChild = false, 
  children,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button"
  
  return (
    <Comp
      className={cn(
        getButtonClasses({ variant, size, responsive, enhanced, gradient }), 
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  )
})

Button.displayName = "Button"

// Export additional button variants for convenience
export const BrandButton = React.forwardRef((props, ref) => (
  <Button 
    ref={ref} 
    enhanced={true} 
    gradient={true}
    responsive={true}
    {...props} 
  />
))

export const ResponsiveButton = React.forwardRef((props, ref) => (
  <Button 
    ref={ref} 
    responsive={true}
    enhanced={true}
    {...props} 
  />
))

export const MobileButton = React.forwardRef((props, ref) => (
  <Button 
    ref={ref} 
    size="lg"
    responsive={true}
    enhanced={true}
    className="sm:size-default"
    {...props} 
  />
))

export { Button }