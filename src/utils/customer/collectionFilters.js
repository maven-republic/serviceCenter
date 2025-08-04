// ============================================================================
// 2. src/utils/customer/collectionFilters.js
export const createFilter = (filterFn, fallback = true) => (item) => {
  try {
    return filterFn(item);
  } catch (err) {
    console.warn('Filter error:', err);
    return fallback;
  }
};

export const createFilters = (stores) => {
  const {
    getDeliveryTime,
    getPriceRange,
    getLevel,
    getLocation,
    getSearch,
    getBestSeller,
    getDesginTool,
    getSpeak,
    getCategory
  } = stores;

  return {
    deliveryFilter: createFilter((item) =>
      getDeliveryTime === "" || getDeliveryTime === "anytime"
        ? true
        : item.deliveryTime === getDeliveryTime
    ),

    categoryFilter: createFilter((item) =>
      getCategory?.length !== 0 
        ? getCategory.includes(item.category) 
        : true
    ),

    priceFilter: createFilter((item) => {
      const price = item.price || item.base_price || 0;
      return getPriceRange.min <= price && getPriceRange.max >= price;
    }),

    levelFilter: createFilter((item) =>
      getLevel?.length !== 0 ? getLevel.includes(item.level) : true
    ),

    locationFilter: createFilter((item) =>
      getLocation?.length !== 0 ? getLocation.includes(item.location) : true
    ),

    searchFilter: createFilter((item) => {
      if (getSearch === "") return true;
      
      const searchTerm = getSearch.toLowerCase();
      const searchableFields = [
        item.title,
        item.name,
        item.category,
        item.description,
        item.tags?.join(' ')
      ].filter(Boolean);
      
      return searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
    }),

    sortByFilter: createFilter((item) =>
      getBestSeller === "" ? true : (getBestSeller === "best-seller" ? true : item.sort === getBestSeller)
    ),

    designToolFilter: createFilter((item) =>
      getDesginTool?.length !== 0 ? getDesginTool.includes(item.tool) : true
    ),

    speakFilter: createFilter((item) =>
      getSpeak?.length !== 0 ? getSpeak.includes(item.language) : true
    )
  };
};

export const applySorting = (services, sortBy) => {
  if (!sortBy || services.length === 0) return services;

  return [...services].sort((a, b) => {
    try {
      switch (sortBy) {
        case 'price-low':
          return (a.price || a.base_price || 0) - (b.price || b.base_price || 0);
        case 'price-high':
          return (b.price || b.base_price || 0) - (a.price || a.base_price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
        case 'popular':
          return (b.reviews || b.review_count || 0) - (a.reviews || a.review_count || 0);
        default:
          return 0;
      }
    } catch (err) {
      console.warn('Sort error:', err);
      return 0;
    }
  });
};