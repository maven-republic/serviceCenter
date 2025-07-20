// ============================================================================
// 2️⃣ SEARCH INPUT FIELD COMPONENT
// File: src/components/customer-workspace/element/search/SearchInputField.jsx
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSearchConfig } from './SearchConfigProvider';

export default function SearchInputField({
  query,
  setQuery,
  placeholder,
  isFocused,
  onFocus,
  onBlur,
  onKeyDown,
  onClear,
  onSubmit,
  showFilters
}) {
  const { config, variantStyle } = useSearchConfig();

  return (
    <div className={cn(
      'relative flex items-center rounded-lg transition-all duration-200',
      config.height,
      variantStyle.container,
      variantStyle.shadow,
      isFocused && 'ring-2 ring-primary ring-offset-2',
      variantStyle.variant === 'hero' && isFocused && 'scale-[1.02] transform'
    )}>
      {/* Search Icon */}
      <Search className={cn(
        'absolute text-muted-foreground',
        config.iconSize,
        config.iconLeft,
        isFocused && 'text-primary',
        variantStyle.variant === 'hero' && 'text-primary/70'
      )} />

      {/* Input */}
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          config.height,
          config.textSize,
          config.padding,
          variantStyle.input,
          'placeholder:text-muted-foreground/60'
        )}
      />

      {/* Clear Button */}
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className={cn(
            'absolute hover:bg-muted rounded-full',
            config.iconRight,
            config.buttonSize
          )}
        >
          <X className={cn(config.iconSize, 'text-muted-foreground hover:text-foreground')} />
        </Button>
      )}

      {/* Filter Button */}
      {showFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'absolute rounded-full',
            query ? 'right-12' : config.iconRight,
            config.buttonSize
          )}
        >
          <Filter className={cn(config.iconSize, 'text-muted-foreground hover:text-foreground')} />
        </Button>
      )}

      {/* Hero Search Button */}
      {variantStyle.variant === 'hero' && (
        <Button
          type="button"
          onClick={onSubmit}
          size={config.size === 'xl' ? 'lg' : config.size === 'large' ? 'default' : 'sm'}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 shadow-lg"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      )}
    </div>
  );
}