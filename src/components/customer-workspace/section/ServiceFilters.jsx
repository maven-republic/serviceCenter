// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { FilterX, ChevronDown, Check } from 'lucide-react';
// import FilterChip from '@/components/element/Filter';

// export default function SearchFilters({ 
//   currentFilters, 
//   categories = [], 
//   parishes = [],
//   isAuthenticated 
// }) {
//   const router = useRouter();
//   const [expanded, setExpanded] = useState({
//     category: true,
//     price: true,
//     location: true,
//     experience: isAuthenticated,
//     verification: isAuthenticated
//   });
  
//   // Price range state
//   const [priceRange, setPriceRange] = useState({
//     min: currentFilters.minPrice || '',
//     max: currentFilters.maxPrice || ''
//   });
  
//   // Toggle section expansion
//   const toggleSection = (section) => {
//     setExpanded({
//       ...expanded,
//       [section]: !expanded[section]
//     });
//   };
  
//   // Apply a single filter
//   const applyFilter = (key, value) => {
//     const params = new URLSearchParams(currentFilters);
    
//     // If it's the same value, toggle it off
//     if (params.get(key) === value.toString()) {
//       params.delete(key);
//     } else {
//       params.set(key, value);
//     }
    
//     // Reset to page 1 when changing filters
//     params.delete('page');
    
//     router.push(`/customer/search?${params.toString()}`);
//   };
  
//   // Apply price range filter
//   const applyPriceFilter = () => {
//     const params = new URLSearchParams(currentFilters);
    
//     if (priceRange.min) {
//       params.set('minPrice', priceRange.min);
//     } else {
//       params.delete('minPrice');
//     }
    
//     if (priceRange.max) {
//       params.set('maxPrice', priceRange.max);
//     } else {
//       params.delete('maxPrice');
//     }
    
//     // Reset to page 1
//     params.delete('page');
    
//     router.push(`/customer/search?${params.toString()}`);
//   };
  
//   // Clear all filters
//   const clearAllFilters = () => {
//     const params = new URLSearchParams();
    
//     // Preserve search query and type
//     if (currentFilters.q) params.set('q', currentFilters.q);
//     if (currentFilters.type) params.set('type', currentFilters.type);
    
//     router.push(`/customer/search?${params.toString()}`);
//   };
  
//   // Active filters count
//   const activeFilterCount = Object.keys(currentFilters).filter(key => 
//     !['q', 'type', 'page', 'sortBy', 'sortOrder'].includes(key)
//   ).length;
  
//   return (
//     <div className="bg-white p-4 rounded-lg shadow-sm">
//       {/* Filters header */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="font-semibold">Filters</h2>
//         {activeFilterCount > 0 && (
//           <button 
//             onClick={clearAllFilters}
//             className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-800"
//           >
//             <FilterX size={14} /> Clear all
//           </button>
//         )}
//       </div>
      
//       {/* Active filter chips */}
//       {activeFilterCount > 0 && (
//         <div className="flex flex-wrap gap-2 mb-4">
//           {currentFilters.category && (
//             <FilterChip 
//               label={`Category: ${categories.find(c => c.category_id === currentFilters.category)?.name || 'Selected'}`}
//               onRemove={() => applyFilter('category', '')}
//             />
//           )}
          
//           {currentFilters.subcategory && (
//             <FilterChip 
//               label="Subcategory"
//               onRemove={() => applyFilter('subcategory', '')}
//             />
//           )}
          
//           {currentFilters.parish && (
//             <FilterChip 
//               label={`Location: ${currentFilters.parish}`}
//               onRemove={() => applyFilter('parish', '')}
//             />
//           )}
          
//           {(currentFilters.minPrice || currentFilters.maxPrice) && (
//             <FilterChip 
//               label={`Price: ${currentFilters.minPrice || '0'} - ${currentFilters.maxPrice || '∞'}`}
//               onRemove={() => {
//                 const params = new URLSearchParams(currentFilters);
//                 params.delete('minPrice');
//                 params.delete('maxPrice');
//                 params.delete('page');
//                 router.push(`/customer/search?${params.toString()}`);
//               }}
//             />
//           )}
          
//           {currentFilters.experience && (
//             <FilterChip 
//               label={`Experience: ${currentFilters.experience}`}
//               onRemove={() => applyFilter('experience', '')}
//             />
//           )}
          
//           {currentFilters.verified === 'true' && (
//             <FilterChip 
//               label="Verified only"
//               onRemove={() => applyFilter('verified', '')}
//             />
//           )}
//         </div>
//       )}
      
//       {/* Category filter */}
//       <div className="mb-4 border-b pb-4">
//         <button 
//           onClick={() => toggleSection('category')}
//           className="flex justify-between items-center w-full text-left font-medium"
//         >
//           Categories
//           <ChevronDown 
//             size={16} 
//             className={`transform transition-transform ${expanded.category ? 'rotate-180' : ''}`} 
//           />
//         </button>
        
//         {expanded.category && categories.length > 0 && (
//           <div className="mt-2 space-y-1">
//             {categories.map(category => (
//               <button
//                 key={category.category_id}
//                 onClick={() => applyFilter('category', category.category_id)}
//                 className={`flex items-center w-full px-2 py-1 text-sm rounded-md ${
//                   currentFilters.category === category.category_id 
//                     ? 'bg-blue-50 text-blue-600' 
//                     : 'hover:bg-gray-50'
//                 }`}
//               >
//                 {currentFilters.category === category.category_id && (
//                   <Check size={14} className="mr-1 flex-shrink-0" />
//                 )}
//                 <span className="truncate">{category.name}</span>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
      
//       {/* Price range filter */}
//       <div className="mb-4 border-b pb-4">
//         <button 
//           onClick={() => toggleSection('price')}
//           className="flex justify-between items-center w-full text-left font-medium"
//         >
//           Price Range
//           <ChevronDown 
//             size={16} 
//             className={`transform transition-transform ${expanded.price ? 'rotate-180' : ''}`} 
//           />
//         </button>
        
//         {expanded.price && (
//           <div className="mt-2">
//             <div className="flex items-center gap-2 mb-2">
//               <input
//                 type="number"
//                 value={priceRange.min}
//                 onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
//                 placeholder="Min"
//                 className="w-full p-2 text-sm border border-gray-300 rounded-md"
//                 min="0"
//               />
//               <span className="text-gray-500">-</span>
//               <input
//                 type="number"
//                 value={priceRange.max}
//                 onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
//                 placeholder="Max"
//                 className="w-full p-2 text-sm border border-gray-300 rounded-md"
//                 min={priceRange.min || "0"}
//               />
//             </div>
//             <button
//               onClick={applyPriceFilter}
//               className="w-full py-1 px-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition"
//             >
//               Apply
//             </button>
//           </div>
//         )}
//       </div>
      
//       {/* Location filter */}
//       <div className="mb-4 border-b pb-4">
//         <button 
//           onClick={() => toggleSection('location')}
//           className="flex justify-between items-center w-full text-left font-medium"
//         >
//           Location
//           <ChevronDown 
//             size={16} 
//             className={`transform transition-transform ${expanded.location ? 'rotate-180' : ''}`} 
//           />
//         </button>
        
//         {expanded.location && parishes.length > 0 && (
//           <div className="mt-2 space-y-1">
//             {parishes.map(parish => (
//               <button
//                 key={parish}
//                 onClick={() => applyFilter('parish', parish)}
//                 className={`flex items-center w-full px-2 py-1 text-sm rounded-md ${
//                   currentFilters.parish === parish 
//                     ? 'bg-blue-50 text-blue-600' 
//                     : 'hover:bg-gray-50'
//                 }`}
//               >
//                 {currentFilters.parish === parish && (
//                   <Check size={14} className="mr-1 flex-shrink-0" />
//                 )}
//                 <span className="truncate">{parish}</span>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
      
//       {/* Experience filter - only for authenticated users */}
//       {isAuthenticated && (
//         <div className="mb-4 border-b pb-4">
//           <button 
//             onClick={() => toggleSection('experience')}
//             className="flex justify-between items-center w-full text-left font-medium"
//           >
//             Experience Level
//             <ChevronDown 
//               size={16} 
//               className={`transform transition-transform ${expanded.experience ? 'rotate-180' : ''}`} 
//             />
//           </button>
          
//           {expanded.experience && (
//             <div className="mt-2 space-y-1">
//               {['2', '3', '5', '10'].map(exp => (
//                 <button
//                   key={exp}
//                   onClick={() => applyFilter('experience', exp)}
//                   className={`flex items-center w-full px-2 py-1 text-sm rounded-md ${
//                     currentFilters.experience === exp
//                       ? 'bg-blue-50 text-blue-600' 
//                       : 'hover:bg-gray-50'
//                   }`}
//                 >
//                   {currentFilters.experience === exp && (
//                     <Check size={14} className="mr-1 flex-shrink-0" />
//                   )}
//                   <span>
//                     {exp === '2' && 'Entry level'}
//                     {exp === '3' && 'Intermediate'}
//                     {exp === '5' && 'Experienced'}
//                     {exp === '10' && 'Expert'}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Verification filter - only for authenticated users */}
//       {isAuthenticated && (
//         <div className="mb-4">
//           <button 
//             onClick={() => toggleSection('verification')}
//             className="flex justify-between items-center w-full text-left font-medium"
//           >
//             Verification
//             <ChevronDown 
//               size={16} 
//               className={`transform transition-transform ${expanded.verification ? 'rotate-180' : ''}`} 
//             />
//           </button>
          
//           {expanded.verification && (
//             <div className="mt-2">
//               <button
//                 onClick={() => applyFilter('verified', 'true')}
//                 className={`flex items-center w-full px-2 py-1 text-sm rounded-md ${
//                   currentFilters.verified === 'true'
//                     ? 'bg-blue-50 text-blue-600' 
//                     : 'hover:bg-gray-50'
//                 }`}
//               >
//                 {currentFilters.verified === 'true' && (
//                   <Check size={14} className="mr-1 flex-shrink-0" />
//                 )}
//                 <span>Verified providers only</span>
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
