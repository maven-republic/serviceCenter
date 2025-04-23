import { createClient } from '../../../../utils/supabase/server'
import { NextResponse } from 'next/server';

export async function GET(req) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url);

  const service_name = searchParams.get('service_name');
  const parish = searchParams.get('parish');
  const min_rating = Number(searchParams.get('min_rating')) || null;
  const max_rating = Number(searchParams.get('max_rating')) || null;
  const min_price = Number(searchParams.get('min_price')) || null;
  const max_price = Number(searchParams.get('max_price')) || null;
  const search_keyword = searchParams.get('search_keyword');
  const sort_by = searchParams.get('sort_by') || 'relevance';
  const limit_results = Number(searchParams.get('limit_results')) || 20;
  const offset_results = Number(searchParams.get('offset_results')) || 0;

  // Parse comma-separated subcategory_ids or professional_ids into arrays
  const subcategory_ids = searchParams.get('subcategory_ids')
    ?.split(',')
    .map((id) => parseInt(id))
    .filter((id) => !isNaN(id)) || [];

  const professional_ids = searchParams.get('professional_ids')
    ?.split(',')
    .map((id) => parseInt(id))
    .filter((id) => !isNaN(id)) || [];






    try {
      const { data, error } = await supabase.rpc('search_professionals', {
        service_name,
        professional_ids,
        parish,
        min_rating,
        max_rating,
        min_price,
        max_price,
        subcategory_ids,
        search_keyword,
        sort_by,
        limit_results,
        offset_results,
      });
    
      if (error) {
        console.error('RPC Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    
      return NextResponse.json(data);
    } catch (err) {
      console.error('Unexpected Error:', err);
      return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
    } 
}

















































// import { createClient } from '../../../../utils/supabase/server'
// export default async function handler(req, res) {
//   const supabase = await createClient()
//   // Get parameters from query string
//   const {
//     service_name = null,
//     professional_ids = [],
//     parish = null,
//     min_rating = null,
//     max_rating = null,
//     min_price = null,
//     max_price = null,
//     subcategory_ids = [],
//     search_keyword = null,
//     sort_by = 'relevance',
//     limit_results = 20,
//     offset_results = 0,
//   } = req.query;

//   try {
//     // Call the search_professionals function from Supabase
//     const { data, error } = await supabase.rpc('search_professionals', {
//       service_name,
//       professional_ids,
//       parish,
//       min_rating,
//       max_rating,
//       min_price,
//       max_price,
//       subcategory_ids,
//       search_keyword,
//       sort_by,
//       limit_results,
//       offset_results,
//     });

//     if (error) {
//       throw error;
//     }
// console.log("hello");
//     // Return the results as a JSON response
//     res.status(200).json(data);
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ error: 'Database query failed' });
//   }
// }
