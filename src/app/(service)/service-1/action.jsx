import { createClient } from '../../../../utils/supabase/server'

export async function fetchServicesWithReviewsAndCategories() {
    const { data, error } = await createClient()
      .from('services').select('*') // select all fields from services
    //   .select('service_id, name, price, category(name), reviews(rating, comment)') // select fields from the joined tables
    //   .leftJoin('categories', 'services.category_id', 'categories.category_id') // join with categories
    //   .leftJoin('reviews', 'services.service_id', 'reviews.service_id'); // join with reviews
  
      console.log("data", data);
    if (error) {
      console.error(error);
      return [];
    }
  
    return data;
};