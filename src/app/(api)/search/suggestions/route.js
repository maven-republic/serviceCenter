// Enhanced /app/api/search/suggestions/route.js
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const supabase = createClient();

  // ILIKE for categories (simple case-insensitive matching)
  const { data: categories } = await supabase
    .from('service_category')
    .select('category_id, name')
    .ilike('name', `%${query}%`)
    .limit(3);
    
  // Text search for services (more powerful with weighting and ranking)
  const { data: services } = await supabase
    .from('service')
    .select('service_id, name')
    .textSearch('name', query, {
      type: 'websearch',
      config: 'english'  // or other language as needed
    })
    .limit(4);
    
  // Text search in service_search_term table for keywords
  const { data: searchTerms } = await supabase
    .from('service_search_term')
    .select('service_id, search_term, service:service_id(name)')
    .textSearch('search_term', query)
    .limit(4);
  
  // Search for professionals offering relevant services
  const { data: professionals } = await supabase
    .from('individual_professional')
    .select(`
      professional_id,
      account:account_id(first_name, last_name)
    `)
    .or(`account.first_name.ilike.%${query}%, account.last_name.ilike.%${query}%`)
    .limit(3);

  // Format all suggestions
  const suggestions = [
    ...(categories || []).map(cat => ({ 
      type: 'category', 
      id: cat.category_id, 
      name: cat.name 
    })),
    ...(services || []).map(svc => ({ 
      type: 'service', 
      id: svc.service_id, 
      name: svc.name 
    })),
    ...(searchTerms || []).map(term => ({ 
      type: 'service', 
      id: term.service_id, 
      name: term.service.name,
      term: term.search_term
    })),
    ...(professionals || []).map(pro => ({ 
      type: 'provider', 
      id: pro.professional_id, 
      name: `${pro.account.first_name} ${pro.account.last_name}` 
    }))
  ];
  
  return NextResponse.json({ suggestions });
}