// src/components/ui/optimized-image.jsx
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false, 
  className = "",
  fill = false,
  sizes,
  ...props 
}) {
  // Default sizes for responsive images
  const defaultSizes = sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  
  const imageProps = {
    src,
    alt,
    priority,
    className: cn("transition-opacity duration-300", className),
    ...props
  }
  
  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        sizes={defaultSizes}
        style={{
          objectFit: 'cover',
          ...props.style
        }}
      />
    )
  }
  
  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
      sizes={defaultSizes}
      style={{
        width: '100%',
        height: 'auto',
        ...props.style
      }}
    />
  )
}

// Specific components for common use cases
export function HeroImage({ src, alt, priority = true, className = "" }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1200}
      height={600}
      priority={priority}
      className={cn("w-full h-auto", className)}
      sizes="100vw"
    />
  )
}

export function CardImage({ src, alt, className = "" }) {
  return (
    <div className={cn("relative aspect-video overflow-hidden", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

export function IconImage({ src, alt, size = 24, className = "" }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn(`w-${size/4} h-${size/4}`, className)}
      priority={false}
    />
  )
}

export function LogoImage({ src, alt, width, height, className = "" }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={true}
      className={cn("h-auto", className)}
      style={{
        width: 'auto',
        height: '100%',
        maxWidth: width,
        maxHeight: height
      }}
    />
  )
}