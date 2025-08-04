// ============================================================================
// 9. src/components/customer-workspace/collections/ServicesList.jsx
import Manifest from "@/components/card/Manifest";
import { cn } from "@/lib/utils";

export function ServicesList({ items, viewMode, ManifestComponent }) {
  // Use the passed Manifest component (your existing one with gradients)
  const CardComponent = ManifestComponent;

  return (
    <div className={cn(
      "gap-6 mb-8",
      viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6"
        : "flex flex-col space-y-4"
    )}>
      {items.map((item, i) => (
        <div key={item.id || item.service_id || `service-${i}`} className={cn(
          "transition-all duration-200 hover:scale-[1.02]",
          viewMode === 'list' && "max-w-none"
        )}>
          {/* ✅ Your existing Manifest component with pastel gradients! */}
          <CardComponent data={item} viewMode={viewMode} />
        </div>
      ))}
    </div>
  );
}