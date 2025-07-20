// src/app/(customer-workspace)/customer/workspace/page.jsx
import { 
  SearchProvider,
  SearchInput, 
  Discoveries 
} from '@/components/discoveries';

export default function WorkspacePage() {
  return (
    <SearchProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">What service do you need?</h1>
        
        <div className="max-w-2xl mx-auto mb-8">
          <SearchInput size="lg" placeholder="Search for services..." />
        </div>
        
        <Discoveries />
      </div>
    </SearchProvider>
  );
}