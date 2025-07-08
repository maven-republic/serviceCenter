// src/app/services/categories/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const supabase = await createClient();
    
    console.log('Services Categories API called');

    // Get distinct categories from services via portfolio/vertical/industry path
    const { data: services, error: servicesError } = await supabase
      .from('service')
      .select(`
        service_id,
        portfolio:portfolio_id (
          portfolio_id,
          name,
          vertical:vertical_id (
            vertical_id,
            name,
            industry:industry_id (
              industry_id,
              name,
              icon
            )
          )
        )
      `)
      .eq('is_active', true);

    if (servicesError) {
      console.error("Services query error:", servicesError);
      throw servicesError;
    }

    // Process and group services by industry/vertical
    const categoryMap = new Map();

    services.forEach(service => {
      const industry = service.portfolio?.vertical?.industry;
      const vertical = service.portfolio?.vertical;
      
      if (industry) {
        const categoryKey = industry.name;
        
        if (!categoryMap.has(categoryKey)) {
          categoryMap.set(categoryKey, {
            id: industry.industry_id,
            name: industry.name,
            path: industry.name.toLowerCase().replace(/\s+/g, '-'),
            icon: industry.icon || 'fas fa-briefcase',
            description: `${industry.name} services`,
            serviceCount: 0,
            verticals: new Set()
          });
        }
        
        const category = categoryMap.get(categoryKey);
        category.serviceCount++;
        
        if (vertical) {
          category.verticals.add(vertical.name);
        }
      }
    });

    // Convert to array and clean up
    const categories = Array.from(categoryMap.values()).map(cat => ({
      id: cat.id,
      name: cat.name,
      path: cat.path,
      icon: cat.icon,
      description: cat.description,
      serviceCount: cat.serviceCount,
      verticals: Array.from(cat.verticals)
    }));

    // Sort by service count (descending) then by name
    categories.sort((a, b) => {
      if (b.serviceCount !== a.serviceCount) {
        return b.serviceCount - a.serviceCount;
      }
      return a.name.localeCompare(b.name);
    });

    console.log(`✅ Found ${categories.length} service categories with ${services.length} total services`);
    
    return NextResponse.json(categories);

  } catch (error) {
    console.error('Services Categories API error:', error);
    
    // Fallback to basic categories
    const fallbackCategories = [
      { id: 1, name: 'Professional Services', path: 'professional-services', icon: 'fas fa-briefcase', description: 'Professional services', serviceCount: 0 },
      { id: 2, name: 'Technical Services', path: 'technical-services', icon: 'fas fa-laptop-code', description: 'Technical services', serviceCount: 0 },
      { id: 3, name: 'Creative Services', path: 'creative-services', icon: 'fas fa-palette', description: 'Creative services', serviceCount: 0 },
      { id: 4, name: 'Business Services', path: 'business-services', icon: 'fas fa-chart-line', description: 'Business services', serviceCount: 0 }
    ];

    return NextResponse.json(fallbackCategories);
  }
}