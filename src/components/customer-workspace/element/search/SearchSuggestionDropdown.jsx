// ============================================================================
// 3️⃣ SEARCH SUGGESTION DROPDOWN COMPONENT
// File: src/components/customer-workspace/element/search/SearchSuggestionDropdown.jsx
import { Sparkles, Search, AlertTriangle } from 'lucide-react';
import { useSearchSuggestions } from './primitives/useSearchSuggestions';
import DefaultSuggestions from './DefaultSuggestions';
import SmartSuggestions from './SmartSuggestions';

export default function SearchSuggestionDropdown({
  query,
  isFocused,
  analysis,
  smartSuggestions,
  onSuggestionClick
}) {
  const { suggestions, loading: suggestionsLoading } = useSearchSuggestions('all', 6);

  if (!isFocused) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden">
      {/* Emergency Alert */}
      {query && analysis?.isEmergency && (
        <div className="bg-red-50 border-b border-red-100 p-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Emergency Services Available 24/7</span>
          </div>
        </div>
      )}

      {/* Default Suggestions (when not typing) */}
      {!query && (
        <DefaultSuggestions
          suggestions={suggestions}
          loading={suggestionsLoading}
          onSuggestionClick={onSuggestionClick}
        />
      )}

      {/* Smart Suggestions (when typing) */}
      {query && query.length > 2 && (
        <SmartSuggestions
          query={query}
          smartSuggestions={smartSuggestions}
          onSuggestionClick={onSuggestionClick}
        />
      )}
    </div>
  );
}