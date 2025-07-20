// ============================================================================
// Discoveries Barrel Exports - src/components/discoveries/index.js
// Simple, clean exports that work without conflicts
// ============================================================================

// 🎯 Core Components
export { default as Discoveries } from './core/Discoveries';
export { default as DiscoveriesHeader } from './core/DiscoveriesHeader';
export { default as DiscoveriesList } from './core/DiscoveriesList';
export { default as DiscoveryCard } from './core/DiscoveryCard';

// 🎨 State Components
export { default as DiscoveriesLoading } from './core/DiscoveriesLoading';
export { default as DiscoveriesEmpty } from './core/DiscoveriesEmpty';
export { default as DiscoveriesError } from './core/DiscoveriesError';

// 🔍 Filter Components
export { default as DiscoveriesFilters } from './core/DiscoveriesFilters';
export { default as CategoryFilter } from './filters/CategoryFilter';

// 📝 Input Components
export { default as SearchInput } from './core/SearchInput';
export { default as KeywordFilter } from './core/KeywordFilter';


// 📄 Navigation Components
export { default as DiscoveriesPagination } from './navigation/DiscoveriesPagination';

// 🎨 Legacy Components (Your existing beautiful components)
export { default as Manifest } from './legacy/Manifest';
export { default as Sift } from './legacy/Sift';

// 🏪 Context & Hooks
export { SearchProvider, useSearch } from './context/SearchContext';