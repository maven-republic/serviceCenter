import { createClient } from '@/utils/supabase/server' 

const supabase = createClient();

export async function searchServices({
searchText,
minPrice,
maxPrice,
city,
parish,
country,
limit = 20,
offset = 0,
}) {
const { data, error } = await supabase
.rpc("commerce_service_search", {
search_text: searchText ?? null,
min_price: minPrice ?? null,
max_price: maxPrice ?? null,
city_filter: city ?? null,
parish_filter: parish ?? null,
country_filter: country ?? null,
limit_val: limit,
offset_val: offset,
});

if (error) {
console.error("Search error:", error);
throw error;
}

return data;
}