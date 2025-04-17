'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSearchStore from '@/store/searchStore';
import { createClient } from '../../../../utils/supabase/client';

export default function GlobalSearch({ className = '' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const router = useRouter();

  // Pre-load suggestions on component mount
  useEffect(() => {
    const fetchInitialSuggestions = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('service')
        .select(`
          service_id, 
          name, 
          service_subcategory (
            name, 
            service_category (name)
          )
        `)
        .limit(10);

      if (data) {
        setSuggestions(data.map(service => ({
          id: service.service_id,
          name: service.name,
          subcategory: service.service_subcategory.name,
          category: service.service_subcategory.service_category.name
        })));
      }
    };

    fetchInitialSuggestions();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions based on query
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 2) {
        const supabase = createClient();
        const { data } = await supabase
          .from('service')
          .select(`
            service_id, 
            name, 
            service_subcategory (
              name, 
              service_category (name)
            )
          `)
          .ilike('name', `%${query}%`)
          .limit(10);

        if (data) {
          setSuggestions(data.map(service => ({
            id: service.service_id,
            name: service.name,
            subcategory: service.service_subcategory.name,
            category: service.service_subcategory.service_category.name
          })));
        }
      } else {
        // Revert to initial suggestions if query is too short
        const supabase = createClient();
        const { data } = await supabase
          .from('service')
          .select(`
            service_id, 
            name, 
            service_subcategory (
              name, 
              service_category (name)
            )
          `)
          .limit(10);

        if (data) {
          setSuggestions(data.map(service => ({
            id: service.service_id,
            name: service.name,
            subcategory: service.service_subcategory.name,
            category: service.service_subcategory.service_category.name
          })));
        }
      }
    };

    fetchSuggestions();
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/customer/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div className={`position-relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="input-group position-relative">
          <input
            type="text"
            className="form-control rounded"
            placeholder="Search services, providers..."
            value={query}
            onChange={(e) => {
              const newQuery = e.target.value;
              setQuery(newQuery);
              setIsOpen(newQuery.length >= 2);
            }}
          />
          {query && (
            <button 
              type="button" 
              className="position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent rounded-end" 
              style={{ 
                zIndex: 10, 
                paddingRight: '10px'
              }}
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
            >
              <X size={16} className="text-muted" />
            </button>
          )}
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="dropdown-menu show w-100 p-0 mt-1 shadow-sm">
          <div className="list-group list-group-flush">
            {suggestions.map((suggestion) => (
              <Link 
                key={suggestion.id} 
                href={`/search?q=${suggestion.name}`} 
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                {suggestion.name}
                <span className="badge bg-secondary ms-2">{suggestion.category}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}