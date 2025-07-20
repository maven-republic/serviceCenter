// ============================================================================
// 6️⃣ SEARCH CONFIGURATION PROVIDER
// File: src/components/customer-workspace/element/search/SearchConfigProvider.jsx
import { createContext, useContext } from 'react';

const SearchConfigContext = createContext();

export function useSearchConfig() {
  const context = useContext(SearchConfigContext);
  if (!context) {
    throw new Error('useSearchConfig must be used within SearchConfigProvider');
  }
  return context;
}

export default function SearchConfigProvider({ children, size, variant }) {
  // Size configurations
  const sizeConfig = {
    small: {
      height: 'h-10',
      textSize: 'text-sm',
      iconSize: 'h-4 w-4',
      padding: 'pl-9 pr-10',
      iconLeft: 'left-2.5',
      iconRight: 'right-2',
      buttonSize: 'h-6 w-6',
      suggestionIconSize: 'w-6 h-6'
    },
    medium: {
      height: 'h-12',
      textSize: 'text-base',
      iconSize: 'h-4 w-4',
      padding: 'pl-10 pr-12',
      iconLeft: 'left-3',
      iconRight: 'right-2',
      buttonSize: 'h-8 w-8',
      suggestionIconSize: 'w-8 h-8'
    },
    large: {
      height: 'h-14',
      textSize: 'text-lg',
      iconSize: 'h-5 w-5',
      padding: 'pl-12 pr-14',
      iconLeft: 'left-3.5',
      iconRight: 'right-2',
      buttonSize: 'h-10 w-10',
      suggestionIconSize: 'w-8 h-8'
    },
    xl: {
      height: 'h-16',
      textSize: 'text-xl',
      iconSize: 'h-6 w-6',
      padding: 'pl-14 pr-16',
      iconLeft: 'left-4',
      iconRight: 'right-2',
      buttonSize: 'h-12 w-12',
      suggestionIconSize: 'w-10 h-10'
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'bg-background border border-input',
      input: 'border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent',
      shadow: 'shadow-sm hover:shadow-md transition-shadow duration-200',
      variant: 'default'
    },
    hero: {
      container: 'bg-white border-2 border-primary/20 shadow-xl',
      input: 'border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent font-medium',
      shadow: 'shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-primary/40',
      variant: 'hero'
    },
    minimal: {
      container: 'bg-muted/50 border border-muted',
      input: 'border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent',
      shadow: 'hover:bg-muted/70 transition-colors duration-200',
      variant: 'minimal'
    }
  };

  const config = { ...sizeConfig[size], size };
  const variantStyle = variantConfig[variant];

  return (
    <SearchConfigContext.Provider value={{ config, variantStyle }}>
      {children}
    </SearchConfigContext.Provider>
  );
}
