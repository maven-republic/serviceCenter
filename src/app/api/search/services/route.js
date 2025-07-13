import { createApiClient } from "@/utils/supabase/api";

export async function POST(req) {
  try {
    // Parse JSON body
    const body = await req.json();

    // Get the token from the Authorization header (if present)
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    const supabase = createApiClient(token);

    const {
      search_text,
      min_price,
      max_price,
      city_filter,
      parish_filter,
      country_filter,
      center_lat,
      center_lon,
      radius_km,
      limit_val,
      offset_val,
    } = body;

    const { data, error } = await supabase.rpc("commerce_service_search", {
      search_text,
      min_price,
      max_price,
      city_filter,
      parish_filter,
      country_filter,
      center_lat,
      center_lon,
      radius_km,
      limit_val: limit_val || 20,
      offset_val: offset_val || 0,
    });

    if (error) {
      console.error("Supabase RPC Error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Search results:", data);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
