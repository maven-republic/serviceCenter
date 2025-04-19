"use client";
import { useEffect, useState } from "react";
import listingStore from "@/store/listingStore";

export default function Classification() {
  const getCategory = listingStore((state) => state.getCategory);
  const setCategory = listingStore((state) => state.setCategory);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Call your API endpoint that returns service categories with counts
        const response = await fetch('/api/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        
        // Transform API data to match expected format
        const formattedCategories = data.map(cat => ({
          title: cat.name,
          total: cat.serviceCount || 0,
          path: cat.path // Preserve path for any other filtering needs
        }));
        
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        
        // Fallback to using static data if API fails
        import("@/data/listing").then(module => {
          setCategories(module.category);
        });
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
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="checkbox-style1 mb15">
        {categories.map((item, i) => (
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
        ))}
      </div>
    </>
  );
}