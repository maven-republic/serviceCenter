// SkeletonLoader.jsx - Reusable Loading Skeleton Component

'use client'

const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  className = '', 
  rounded = false,
  backgroundColor = '#f3f4f6'
}) => {
  return (
    <>
      {/* Skeleton CSS Animation */}
      <style jsx>{`
        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .skeleton-loader {
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div 
        className={`skeleton-loader ${className}`}
        style={{
          width,
          height,
          backgroundColor,
          borderRadius: rounded ? '50%' : '6px',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite'
        }}
      />
    </>
  )
}

export default SkeletonLoader