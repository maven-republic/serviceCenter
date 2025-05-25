export default function SkeletonTemplate() {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-40 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 h-80"
            >
              {/* Skeleton for image */}
              <div className="h-40 w-full bg-gray-200 animate-pulse"></div>
              
              <div className="p-4">
                {/* Skeleton for title */}
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
                
                {/* Skeleton for description */}
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mb-4"></div>
                
                {/* Skeleton for price and rating */}
                <div className="flex justify-between items-center mt-4">
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

