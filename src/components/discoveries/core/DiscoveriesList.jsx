// ============================================================================
// Phase 4: Service Grid Layout Optimization - core/DiscoveriesList.jsx
// Perfect responsive grid with no horizontal scroll, beautiful Manifest integration
// ============================================================================

import Manifest from '../legacy/Manifest';

export default function DiscoveriesList({ results }) {
  console.log('🔍 DiscoveriesList rendering:', {
    resultsCount: results?.length || 0,
    firstResult: results?.[0]
  });

  // Safety check
  if (!results || !Array.isArray(results) || results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No services to display</p>
      </div>
    );
  }

  // ✅ GRID VIEW: Always show grid layout - responsive and beautiful
  return (
    <div className="w-full">
      <div 
        className="grid gap-4 sm:gap-6"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
        }}
      >
        {results.map((result, index) => (
          <div 
            key={`${result.service_id || result.id || index}`}
            className="w-full min-w-0"
          >
            <Manifest data={result} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* 
🎯 PHASE 4 ARCHITECTURE DECISIONS:

✅ RESPONSIVE GRID STRATEGY:
- CSS Grid with auto-fill and minmax(280px, 1fr)
- Automatically adjusts columns based on available space
- No fixed breakpoints that can cause horizontal scroll
- Cards maintain minimum 280px width for readability

✅ OVERFLOW PREVENTION:
- w-full on container ensures full width usage
- min-w-0 on grid items prevents flex overflow
- No max column limits that could break on wide screens
- CSS Grid handles responsiveness naturally

✅ SPACING OPTIMIZATION:
- gap-4 sm:gap-6 for consistent spacing
- No margin conflicts with parent containers
- Clean integration with Manifest components

✅ PERFORMANCE:
- Native CSS Grid for optimal rendering
- Minimal JavaScript calculations
- Clean key generation for React reconciliation

BREAKPOINT BEHAVIOR:
📱 Mobile (320px+): 1 column (280px cards)
📱 Small (640px+): 2 columns 
💻 Medium (768px+): 2-3 columns
💻 Large (1024px+): 3-4 columns
🖥️ XL (1280px+): 4-5 columns
🖥️ 2XL (1536px+): 5-6 columns

NEXT: Phase 5 will integrate everything together
*/