// src/app/api/categories/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensures the route is not statically optimized
export const revalidate = 0;

export async function GET(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new NextResponse(
        JSON.stringify({ error: 'Configuration error' }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all categories
    const { data: categories, error: catError } = await supabase
      .from('service_category')
      .select(`
        category_id,
        name,
        path,
        icon,
        description,
        is_active,
        display_order
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (catError) {
      console.error("Supabase query error:", catError);
      throw catError;
    }
    
    // For each category, get the count of services
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        // First, get subcategories for this category
        const { data: subcategories, error: subError } = await supabase
          .from('service_subcategory')
          .select('subcategory_id')
          .eq('category_id', category.category_id);
          
        if (subError) {
          console.error("Error getting subcategories:", subError);
          return { ...category, serviceCount: 0 };
        }
        
        if (!subcategories.length) {
          return { ...category, serviceCount: 0 };
        }
        
        // Get count of services for all subcategories
        const subcategoryIds = subcategories.map(sub => sub.subcategory_id);
        
        const { count, error: countError } = await supabase
          .from('service')
          .select('service_id', { count: 'exact', head: true })
          .in('subcategory_id', subcategoryIds)
          .eq('is_active', true);
          
        if (countError) {
          console.error("Error counting services:", countError);
          return { ...category, serviceCount: 0 };
        }
        
        return {
          id: category.category_id,
          name: category.name,
          path: category.path,
          icon: category.icon,
          description: category.description,
          serviceCount: count || 0
        };
      })
    );
    
    return NextResponse.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
