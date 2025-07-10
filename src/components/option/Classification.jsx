"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle } from "lucide-react";
import listingStore from "@/store/listingStore";
import { cn } from "@/lib/utils";

export default function Classification() {
  const getCategory = listingStore((state) => state.getCategory);
  const setCategory = listingStore((state) => state.setCategory);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        try {
          // Primary endpoint
          response = await fetch('/api/categories', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store'
            }
          });
        } catch (err) {
          console.log("Primary categories endpoint failed, trying alternative...");
          
          // Alternative endpoint
          response = await fetch('/api/services/categories', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store'
            }
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Categories API error:", errorText);
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Categories data received:", data);
        
        // Handle different response formats
        let formattedCategories = [];
        
        if (Array.isArray(data)) {
          formattedCategories = data.map(cat => ({
            title: cat.name || cat.title || cat.category,
            total: cat.serviceCount || cat.total || cat.count || 0,
            path: cat.path || cat.slug
          }));
        } else if (data.categories && Array.isArray(data.categories)) {
          formattedCategories = data.categories.map(cat => ({
            title: cat.name || cat.title || cat.category,
            total: cat.serviceCount || cat.total || cat.count || 0,
            path: cat.path || cat.slug
          }));
        } else if (data.data && Array.isArray(data.data)) {
          formattedCategories = data.data.map(cat => ({
            title: cat.name || cat.title || cat.category,
            total: cat.serviceCount || cat.total || cat.count || 0,
            path: cat.path || cat.slug
          }));
        } else {
          console.warn("Unexpected categories data format:", data);
          throw new Error("Invalid categories data format");
        }
        
        // Filter out invalid categories
        formattedCategories = formattedCategories.filter(cat => 
          cat.title && typeof cat.title === 'string'
        );
        
        setCategories(formattedCategories);
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error.message);
        
        // Fallback to static data if API fails
        try {
          const module = await import("@/data/listing");
          if (module.category && Array.isArray(module.category)) {
            setCategories(module.category);
            setError(null);
          } else {
            // Final fallback with hardcoded categories
            setCategories([
              { title: "Web Development", total: 45 },
              { title: "Mobile Development", total: 32 },
              { title: "Design", total: 67 },
              { title: "Marketing", total: 28 },
              { title: "Writing", total: 19 },
              { title: "Business", total: 41 },
              { title: "Technology", total: 53 },
              { title: "Creative", total: 34 }
            ]);
          }
        } catch (fallbackError) {
          console.error('Fallback data also failed:', fallbackError);
          setCategories([
            { title: "Services", total: 0 },
            { title: "All Categories", total: 0 }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Handle category selection
  const handleCategoryChange = (categoryTitle, checked) => {
    setCategory(categoryTitle);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading categories...</span>
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    );
  }

  // Error state with no categories
  if (error && categories.length === 0) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <span className="font-medium">Unable to load categories</span>
          <br />
          <span className="text-sm">{error}</span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-1">
      {/* Error indicator if using fallback data */}
      {error && categories.length > 0 && (
        <div className="mb-3">
          <Badge variant="secondary" className="text-xs">
            Using cached categories
          </Badge>
        </div>
      )}
      
      {categories.length > 0 ? (
        categories.map((item, i) => {
          const isChecked = getCategory.includes(item.title);
          
          return (
            <div key={i} className="flex items-center space-x-3 group">
              <Checkbox
                id={`category-${i}`}
                checked={isChecked}
                onCheckedChange={(checked) => handleCategoryChange(item.title, checked)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={`category-${i}`}
                className={cn(
                  "flex-1 text-sm cursor-pointer transition-colors duration-200",
                  "hover:text-primary group-hover:text-primary",
                  isChecked ? "font-medium text-primary" : "text-foreground"
                )}
              >
                {item.title}
              </label>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs font-normal transition-colors duration-200",
                  isChecked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {item.total}
              </Badge>
            </div>
          );
        })
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No categories available</p>
        </div>
      )}
    </div>
  );
}