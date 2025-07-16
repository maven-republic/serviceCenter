// src/app/(customer-workspace)/customer/workspace/page.jsx (FIXED - No Interests)
"use client";

import { useState } from 'react';
import Collection from "@/components/section/Collection";
import UniversalSearch from "@/components/customer-workspace/element/UniversalSearch";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  Search,
  PlusCircle,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react';

export default function ExploreInterface() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    console.log('Search query:', query);
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">What service do you need?  </h1>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <UniversalSearch 
            onSearch={handleSearch}
            className="w-full max-w-3xl"
            placeholder="What service are you looking for today?"
          />
        </div>

        <div>
             <Collection />
        </div>

      </div>
    </div>
  );
}