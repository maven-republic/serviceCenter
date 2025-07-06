"use client";
import { useEffect, useState } from "react";
import listingStore from "@/store/listingStore";

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
        
        // Try multiple API endpoints
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
          
          // Alternative endpoint - try getting categories from services API
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
          // Direct array of categories
          formattedCategories = data.map(cat => ({
            title: cat.name || cat.title || cat.category,
            total: cat.serviceCount || cat.total || cat.count || 0,
            path: cat.path || cat.slug
          }));
        } else if (data.categories && Array.isArray(data.categories)) {
          // Nested in categories property
          formattedCategories = data.categories.map(cat => ({
            title: cat.name || cat.title || cat.category,
            total: cat.serviceCount || cat.total || cat.count || 0,
            path: cat.path || cat.slug
          }));
        } else if (data.data && Array.isArray(data.data)) {
          // Nested in data property
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
        
        // Fallback to using static data if API fails
        try {
          const module = await import("@/data/listing");
          if (module.category && Array.isArray(module.category)) {
            setCategories(module.category);
            setError(null); // Clear error if fallback works
          } else {
            // Final fallback with hardcoded categories
            setCategories([
              { title: "Web Development", total: 0 },
              { title: "Mobile Development", total: 0 },
              { title: "Design", total: 0 },
              { title: "Marketing", total: 0 },
              { title: "Writing", total: 0 },
              { title: "Business", total: 0 }
            ]);
          }
        } catch (fallbackError) {
          console.error('Fallback data also failed:', fallbackError);
          // Use basic categories as last resort
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

  // Handler
  const categoryHandler = (data) => {
    setCategory(data);
  };

  // Loading state
  if (loading) {
    return (
      <div className="checkbox-style1 mb15">
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Loading categories...</span>
        </div>
      </div>
    );
  }

  // Error state with categories still available
  return (
    <>
      {error && categories.length === 0 && (
        <div className="alert alert-warning alert-sm mb-2">
          <small>Unable to load categories: {error}</small>
        </div>
      )}
      
      <div className="checkbox-style1 mb15">
        {categories.length > 0 ? (
          categories.map((item, i) => (
            <label key={i} className="custom_checkbox">
              {item.title}
              <input
                type="checkbox"
                onChange={() => categoryHandler(item.title)}
                checked={getCategory.includes(item.title)}
              />
              <span className="checkmark" />
              <span className="right-tags">({item.total})</span>
            </label>
          ))
        ) : (
          <div className="text-muted">
            <small>No categories available</small>
          </div>
        )}
      </div>
      
      {error && categories.length > 0 && (
        <small className="text-warning">
          Using cached categories
        </small>
      )}
    </>
  );
}