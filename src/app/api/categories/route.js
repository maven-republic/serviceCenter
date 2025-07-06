// src/app/api/categories/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const supabase = await createClient();
    
    console.log('Categories API called');

    // First, let's check what tables actually exist and get categories from the industry/vertical/portfolio structure
    const { data: industries, error: industryError } = await supabase
      .from('industry')
      .select(`
        industry_id,
        name,
        description,
        icon,
        is_active,
        display_order
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (industryError) {
      console.error("Industry query error:", industryError);
      // Fallback to simpler approach if industry table has issues
      return await fallbackCategoriesQuery(supabase);
    }

    // For each industry, get verticals and count services
    const categoriesWithCounts = await Promise.all(
      industries.map(async (industry) => {
        try {
          // Get verticals for this industry
          const { data: verticals, error: verticalError } = await supabase
            .from('vertical')
            .select('vertical_id')
            .eq('industry_id', industry.industry_id)
            .eq('is_active', true);
            
          if (verticalError) {
            console.error("Error getting verticals:", verticalError);
            return { ...industry, serviceCount: 0 };
          }
          
          if (!verticals.length) {
            return { ...industry, serviceCount: 0 };
          }
          
          // Get portfolios for these verticals
          const verticalIds = verticals.map(v => v.vertical_id);
          const { data: portfolios, error: portfolioError } = await supabase
            .from('portfolio')
            .select('portfolio_id')
            .in('vertical_id', verticalIds)
            .eq('is_active', true);
            
          if (portfolioError) {
            console.error("Error getting portfolios:", portfolioError);
            return { ...industry, serviceCount: 0 };
          }
          
          if (!portfolios.length) {
            return { ...industry, serviceCount: 0 };
          }
          
          // Count services for all portfolios
          const portfolioIds = portfolios.map(p => p.portfolio_id);
          const { count, error: countError } = await supabase
            .from('service')
            .select('service_id', { count: 'exact', head: true })
            .in('portfolio_id', portfolioIds)
            .eq('is_active', true);
            
          if (countError) {
            console.error("Error counting services:", countError);
            return { ...industry, serviceCount: 0 };
          }
          
          return {
            id: industry.industry_id,
            name: industry.name,
            path: industry.name.toLowerCase().replace(/\s+/g, '-'),
            icon: industry.icon,
            description: industry.description,
            serviceCount: count || 0
          };
        } catch (err) {
          console.error(`Error processing industry ${industry.name}:`, err);
          return { ...industry, serviceCount: 0 };
        }
      })
    );
    
    console.log(`✅ Fetched ${categoriesWithCounts.length} categories`);
    return NextResponse.json(categoriesWithCounts);
    
  } catch (error) {
    console.error('Categories API error:', error);
    return await fallbackResponse();
  }
}

// Fallback function to try alternative queries
async function fallbackCategoriesQuery(supabase) {
  try {
    console.log('🔄 Trying fallback categories query...');
    
    // Try to get categories directly from verticals
    const { data: verticals, error: verticalError } = await supabase
      .from('vertical')
      .select(`
        vertical_id,
        name,
        description,
        is_active,
        display_order,
        industry:industry_id (
          name,
          icon
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (verticalError) {
      console.error("Vertical fallback error:", verticalError);
      return await fallbackResponse();
    }

    // Group by industry and count services
    const industriesMap = new Map();
    
    for (const vertical of verticals) {
      const industryName = vertical.industry?.name || 'General';
      
      if (!industriesMap.has(industryName)) {
        industriesMap.set(industryName, {
          name: industryName,
          icon: vertical.industry?.icon || 'fas fa-briefcase',
          verticals: [],
          serviceCount: 0
        });
      }
      
      industriesMap.get(industryName).verticals.push(vertical.vertical_id);
    }

    // Count services for each industry
    const categories = [];
    let index = 0;
    
    for (const [industryName, industryData] of industriesMap) {
      try {
        // Get portfolios for this industry's verticals
        const { data: portfolios, error: portfolioError } = await supabase
          .from('portfolio')
          .select('portfolio_id')
          .in('vertical_id', industryData.verticals)
          .eq('is_active', true);
          
        if (!portfolioError && portfolios.length > 0) {
          const portfolioIds = portfolios.map(p => p.portfolio_id);
          
          const { count, error: countError } = await supabase
            .from('service')
            .select('service_id', { count: 'exact', head: true })
            .in('portfolio_id', portfolioIds)
            .eq('is_active', true);
            
          industryData.serviceCount = count || 0;
        }
        
        categories.push({
          id: `industry_${index++}`,
          name: industryName,
          path: industryName.toLowerCase().replace(/\s+/g, '-'),
          icon: industryData.icon,
          description: `${industryName} services`,
          serviceCount: industryData.serviceCount
        });
        
      } catch (err) {
        console.error(`Error processing fallback industry ${industryName}:`, err);
        categories.push({
          id: `industry_${index++}`,
          name: industryName,
          path: industryName.toLowerCase().replace(/\s+/g, '-'),
          icon: industryData.icon,
          description: `${industryName} services`,
          serviceCount: 0
        });
      }
    }
    
    console.log(`✅ Fallback: Fetched ${categories.length} categories`);
    return NextResponse.json(categories);
    
  } catch (error) {
    console.error('Fallback categories query failed:', error);
    return await fallbackResponse();
  }
}

// Final fallback with static data
async function fallbackResponse() {
  console.log('🔄 Using static fallback categories');
  
  const staticCategories = [
    { id: 'tech', name: 'Technology', path: 'technology', icon: 'fas fa-laptop-code', description: 'Technology services', serviceCount: 0 },
    { id: 'design', name: 'Design', path: 'design', icon: 'fas fa-palette', description: 'Design services', serviceCount: 0 },
    { id: 'business', name: 'Business', path: 'business', icon: 'fas fa-briefcase', description: 'Business services', serviceCount: 0 },
    { id: 'marketing', name: 'Marketing', path: 'marketing', icon: 'fas fa-bullhorn', description: 'Marketing services', serviceCount: 0 },
    { id: 'writing', name: 'Writing', path: 'writing', icon: 'fas fa-pen', description: 'Writing services', serviceCount: 0 },
    { id: 'other', name: 'Other', path: 'other', icon: 'fas fa-ellipsis-h', description: 'Other services', serviceCount: 0 }
  ];

  return NextResponse.json(staticCategories);
}