"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
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

        let response;
        try {
          response = await fetch("/api/categories", {
            method: "GET",
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          });
        } catch {
          response = await fetch("/api/services/categories", {
            method: "GET",
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Categories API error:", errorText);
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        let formatted = [];
        if (Array.isArray(data)) {
          formatted = data.map((cat) => ({
            title: cat.name || cat.title || cat.category,
            total: cat.serviceCount || cat.total || cat.count || 0,
            path: cat.path || cat.slug,
          }));
        } else if (data.categories && Array.isArray(data.categories)) {
          formatted = data.categories.map((cat) => ({
            title: cat.name || cat.title || cat.category,
            total: cat.serviceCount || cat.total || cat.count || 0,
            path: cat.path || cat.slug,
          }));
        } else if (data.data && Array.isArray(data.data)) {
          formatted = data.data.map((cat) => ({
            title: cat.name || cat.title || cat.category,
            total: cat.serviceCount || cat.total || cat.count || 0,
            path: cat.path || cat.slug,
          }));
        } else {
          throw new Error("Invalid categories data format");
        }

        formatted = formatted.filter((c) => c.title && typeof c.title === "string");
        setCategories(formatted);
      } catch (e) {
        console.error("Error fetching categories:", e);
        setError(e.message);

        // Fallback data
        try {
          const fallback = [
            { title: "Web Development", total: 45 },
            { title: "Mobile Development", total: 32 },
            { title: "Design", total: 67 },
            { title: "Marketing", total: 28 },
            { title: "Writing", total: 19 },
            { title: "Business", total: 41 },
            { title: "Technology", total: 53 },
            { title: "Creative", total: 34 },
          ];
          setCategories(fallback);
          setError(null);
        } catch {
          setCategories([
            { title: "Services", total: 0 },
            { title: "All Categories", total: 0 },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (title, checked) => {
    setCategory(title);
  };

  // Loading state (pure Tailwind)
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          <span className="text-sm text-slate-500">Loading categories...</span>
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 flex-1 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-8 rounded bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Error state with no categories (pure Tailwind)
  if (error && categories.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-md border border-orange-200 bg-orange-50 p-3">
        <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
        <div className="text-orange-800">
          <div className="font-medium">Unable to load categories</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Fallback/cached indicator */}
      {error && categories.length > 0 && (
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            Using cached categories
          </span>
        </div>
      )}

      {categories.length > 0 ? (
        categories.map((item, i) => {
          const isChecked = getCategory.includes(item.title);
          const id = `category-${i}`;

          return (
            <label
              key={id}
              htmlFor={id}
              className="group flex cursor-pointer select-none items-center gap-3"
            >
              {/* Hidden native checkbox + custom square box */}
              <input
                id={id}
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleCategoryChange(item.title, e.target.checked)}
                className="peer sr-only"
              />
              <span
                className={`
                  grid place-content-center h-4 w-4 rounded-[4px]
                  border border-slate-300
                  peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-200
                  peer-checked:bg-emerald-500 peer-checked:border-emerald-500
                  transition-colors
                  after:content-[''] after:h-2 after:w-1.5 after:rotate-45
                  after:border-b-2 after:border-r-2 after:border-white
                  after:block after:opacity-0 peer-checked:after:opacity-100
                `}
              />
              <span
                className={`flex-1 text-sm transition-colors duration-200 ${
                  isChecked ? "font-medium text-emerald-600" : "text-slate-800 group-hover:text-emerald-600"
                }`}
              >
                {item.title}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-normal transition-colors ${
                  isChecked ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.total}
              </span>
            </label>
          );
        })
      ) : (
        <div className="py-4 text-center">
          <p className="text-sm text-slate-500">No categories available</p>
        </div>
      )}
    </div>
  );
}
