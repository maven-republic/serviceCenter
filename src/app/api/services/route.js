// src/app/(api)/services/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // This ensures the route is not statically optimized
export const revalidate = 0;

export async function GET(request) {
  try {
    console.log("Route handler called");
    console.log("Environment variables:", {
     supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
    });

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
    
    // Get query parameters if needed
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    console.log("Fetching services from Supabase", { category });
    
    // Build the query
    let query = supabase
      .from('service')
      .select(`
        *,
        service_subcategory(
          name,
          service_category(
            name,
            path,
            icon
          )
        ),
        service_attribute(*),
        service_image(*),
        service_search_term(*)
      `);
    
    // Add filters if provided
    if (category) {
      query = query.eq('service_subcategory.service_category.path', category);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} services from database`);
    
    // Transform the data to match the expected format in the frontend
    const transformedData = data.map(item => ({
      id: item.service_id,
      img: item.service_image && item.service_image.length > 0 
        ? item.service_image[0].image_url 
        : "/images/listings/default.jpg",
      img2: item.service_image && item.service_image.length > 0 
        ? item.service_image[0].image_url 
        : "/images/listings/default.jpg",
      category: item.service_subcategory?.service_category?.name || "General",
      title: item.name,
      rating: getAttributeValue(item.service_attribute, 'skill_level') || 4.7,
      review: Math.floor(Math.random() * 100) + 20, // Random reviews count for demo
      author: {
        img: "/images/team/fl-s-1.png", // Default author image
        name: "Service Provider", // Default provider name
      },
      price: item.base_price,
      tag: item.service_subcategory?.name || "Service",
      deliveryTime: `${Math.ceil((item.duration_minutes || 1440) / 60 / 24)}d`,
      level: item.is_featured ? "top-rated" : "lavel-1",
      location: "united-states", // Default location
      sort: item.is_featured ? "best-seller" : "recommended",
      tool: getAttributeValue(item.service_attribute, 'service_type') || "professional-tools",
      language: "english",
      lat: 23.8103 + (Math.random() - 0.5), // Random coordinates near default
      long: 90.4125 + (Math.random() - 0.5), // Random coordinates near default
      description: item.description
    }));



    console.log("Transformation complete", transformedData.length);

    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
        
        { error: error.message }, { status: 500 }
    
    );
  }
}

// Helper function to get attribute value
function getAttributeValue(attributes, attributeName) {
  if (!attributes || !attributes.length) return null;
  const attribute = attributes.find(attr => attr.attribute_name === attributeName);
  return attribute ? attribute.attribute_value : null;
}