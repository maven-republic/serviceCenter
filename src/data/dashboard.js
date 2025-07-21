// Updated navigation data structure with semantic icon naming
// src/data/dashboard.js (Clean Data Layer)

export const customerNavigation = {
  workspace: [
    {
      id: 1,
      name: 'Explore',
      icon: 'search',                    // ✅ Clean semantic name
      path: "/customer/workspace",
      description: "Find services and professionals",
      shortcut: "cmd+e"
    },
    {
      id: 2,
      name: 'Appointments',
      icon: 'calendar',                  // ✅ Clear intent
      path: "/customer/appointments",
      description: "Manage your bookings",
      badge: null,                       // Can be populated dynamically
      requiresAuth: true
    }
  ],
  account: [
    {
      id: 3,
      name: "Analytics",
      icon: "analytics",                 // ✅ Perfect semantic name (was flaticon-home)
      path: "/customer/analytics",
      description: "View performance metrics",
      requiresFeature: "basic"
    },
    {
      id: 4,
      name: "Account Information",
      icon: "profile",                   // ✅ Clear semantic name (was flaticon-photo)
      path: "/customer/account-information",
      description: "Manage your profile",
      requiresAuth: true
    }
  ],
  settings: [
    {
      id: 5,
      name: "Logout",
      icon: "logout",                    // ✅ Clear action name
      path: "/login",
      description: "Sign out of your account",
      action: "logout"                   // Special handling flag
    }
  ]
};

export const professionalNavigation = {
  dashboard: [
    {
      id: 1,
      name: "Analytics",
      icon: "analytics",                 // ✅ Semantic name (was flaticon-home)
      path: "/professional/workspace",
      description: "Business performance overview",
      permissions: ["professional"]
    },
    {
      id: 2,
      name: "Appointments",
      icon: "calendar",                  // ✅ Clear purpose
      path: "/professional/manage-appointments",
      description: "Manage client bookings",
      badge: null                        // Dynamic appointment count
    }
  ],
  account: [
    {
      id: 15,
      name: "Account Information",
      icon: "profile",                   // ✅ Consistent with customer
      path: "/professional/account-information",
      description: "Update professional profile"
    },
    {
      id: 16,
      name: "Availability",
      icon: "schedule",                  // ✅ More specific than calendar
      path: "/professional/availability",
      description: "Set your working hours"
    }
  ],
  settings: [
    {
      id: 17,
      name: "Logout",
      icon: "logout",
      path: "/login",
      action: "logout"
    }
  ]
};

// Navigation configuration and metadata
export const navigationConfig = {
  // Default settings
  maxVisibleItems: 6,
  enableShortcuts: true,
  enableBadges: true,
  
  // Icon categories for documentation/reference
  iconCategories: {
    workspace: ['search', 'explore', 'dashboard'],
    scheduling: ['calendar', 'schedule', 'availability'],
    analytics: ['analytics', 'stats', 'reports', 'insights'],
    user: ['profile', 'account', 'settings'],
    communication: ['messages', 'notifications', 'support'],
    financial: ['payments', 'billing', 'invoices'],
    actions: ['logout', 'add', 'create', 'save']
  },

  // Role-based access control
  userRoles: {
    customer: ['workspace', 'account', 'settings'],
    professional: ['dashboard', 'account', 'settings'],
    admin: ['dashboard', 'account', 'settings', 'admin']
  }
};

// Utility functions for navigation
export const getNavigationForRole = (role) => {
  switch (role) {
    case 'customer':
      return customerNavigation;
    case 'professional':
      return professionalNavigation;
    default:
      return customerNavigation;
  }
};

export const flattenNavigation = (navigation) => {
  return Object.values(navigation).flat();
};

export const getNavigationItemById = (navigation, id) => {
  const allItems = flattenNavigation(navigation);
  return allItems.find(item => item.id === id);
};

// Keep existing exports for backward compatibility
export const invoice = [
  {
    id: 1,
    invoiceId: 99,
    invoiceName: "App Services",
    purchaseDate: "April 9, 2023",
    amount: 1.2,
    status: 1,
  },
  {
    id: 2,
    invoiceId: 99,
    invoiceName: "App Services",
    purchaseDate: "April 9, 2023",
    amount: 1.2,
    status: 2,
  },
  {
    id: 3,
    invoiceId: 99,
    invoiceName: "App Services",
    purchaseDate: "April 9, 2023",
    amount: 1.2,
    status: 2,
  },
  {
    id: 4,
    invoiceId: 99,
    invoiceName: "App Services",
    purchaseDate: "April 9, 2023",
    amount: 1.2,
    status: 3,
  },
  {
    id: 5,
    invoiceId: 99,
    invoiceName: "App Services",
    purchaseDate: "April 9, 2023",
    amount: 1.2,
    status: 3,
  },
  {
    id: 6,
    invoiceId: 99,
    invoiceName: "App Services",
    purchaseDate: "April 9, 2023",
    amount: 1.2,
    status: 2,
  },
  {
    id: 7,
    invoiceId: 99,
    invoiceName: "App Services",
    purchaseDate: "April 9, 2023",
    amount: 1.2,
    status: 2,
  },
  {
    id: 8,
    invoiceId: 99,
    invoiceName: "App Services",
    purchaseDate: "April 9, 2023",
    amount: 1.2,
    status: 1,
  },
  {
    id: 9,
    invoiceId: 99,
    invoiceName: "App Services",
    purchaseDate: "April 9, 2023",
    amount: 1.2,
    status: 3,
  },
];

export const payout = [
  {
    id: 1,
    amount: 1.8,
    date: "April 9, 2023",
    method: "Paypal",
    status: 1,
  },
  {
    id: 2,
    amount: 1.8,
    date: "April 9, 2023",
    method: "Payoneer",
    status: 2,
  },
  {
    id: 3,
    amount: 1.8,
    date: "April 9, 2023",
    method: "Bank Transfer",
    status: 2,
  },
  {
    id: 4,
    amount: 1.8,
    date: "April 9, 2023",
    method: "Bank Transfer",
    status: 2,
  },
  {
    id: 5,
    amount: 1.8,
    date: "April 9, 2023",
    method: "Paypal",
    status: 2,
  },
  {
    id: 6,
    amount: 1.8,
    date: "April 9, 2023",
    method: "Bank Transfer",
    status: 2,
  },
  {
    id: 7,
    amount: 1.8,
    date: "April 9, 2023",
    method: "Paypal",
    status: 1,
  },
  {
    id: 8,
    amount: 1.8,
    date: "April 9, 2023",
    method: "Payoneer",
    status: 3,
  },
  {
    id: 9,
    amount: 1.8,
    date: "April 9, 2023",
    method: "Payoneer",
    status: 1,
  },
  {
    id: 10,
    amount: 1.8,
    date: "April 9, 2023",
    method: "Paypal",
    status: 3,
  },
];

export const statement = [
  {
    id: 1,
    date: "April 9, 2023",
    type: 1,
    detail: "I will design website UI UX in adobe xd or figma",
    price: 829,
    amount: 829,
  },
  {
    id: 2,
    date: "April 9, 2023",
    type: 1,
    detail: "I will design website UI UX in adobe xd or figma",
    price: 829,
    amount: 829,
  },
  {
    id: 3,
    date: "April 9, 2023",
    type: 2,
    detail: "I will design website UI UX in adobe xd or figma",
    price: 829,
    amount: 829,
  },
  {
    id: 4,
    date: "April 9, 2023",
    type: 2,
    detail: "I will design website UI UX in adobe xd or figma",
    price: 829,
    amount: 829,
  },
  {
    id: 5,
    date: "April 9, 2023",
    type: 2,
    detail: "I will design website UI UX in adobe xd or figma",
    price: 829,
    amount: 829,
  },
  {
    id: 6,
    date: "April 9, 2023",
    type: 1,
    detail: "I will design website UI UX in adobe xd or figma",
    price: 829,
    amount: 829,
  },
  {
    id: 7,
    date: "April 9, 2023",
    type: 2,
    detail: "I will design website UI UX in adobe xd or figma",
    price: 829,
    amount: 829,
  },
  {
    id: 8,
    date: "April 9, 2023",
    type: 2,
    detail: "I will design website UI UX in adobe xd or figma",
    price: 829,
    amount: 829,
  },
];

export const manageService = [
  {
    id: 1,
    img: "/images/listings/g-1.jpg",
    title: "I will design modern websites in figma or adobe xd",
    list: [
      "Delivered within a day",
      "Delivery Time Decreased",
      "Upload apps to Stores",
    ],
    category: "Web & App Design",
    cost: 500,
  },
  {
    id: 2,
    img: "/images/listings/g-2.jpg",
    title: "I will design modern websites in figma or adobe xd",
    list: [
      "Delivered within a day",
      "Delivery Time Decreased",
      "Upload apps to Stores",
    ],
    category: "Web & App Design",
    cost: 500,
  },
  {
    id: 3,
    img: "/images/listings/g-3.jpg",
    title: "I will design modern websites in figma or adobe xd",
    list: [
      "Delivered within a day",
      "Delivery Time Decreased",
      "Upload apps to Stores",
    ],
    category: "Web & App Design",
    cost: 500,
  },
  {
    id: 4,
    img: "/images/listings/g-4.jpg",
    title: "I will design modern websites in figma or adobe xd",
    list: [
      "Delivered within a day",
      "Delivery Time Decreased",
      "Upload apps to Stores",
    ],
    category: "Web & App Design",
    cost: 500,
  },
  {
    id: 5,
    img: "/images/listings/g-5.jpg",
    title: "I will design modern websites in figma or adobe xd",
    list: [
      "Delivered within a day",
      "Delivery Time Decreased",
      "Upload apps to Stores",
    ],
    category: "Web & App Design",
    cost: 500,
  },
];

export const managejob = [
  {
    id: 1,
    img: "/images/team/client-2.png",
    title: "Marketing and Communications Manager",
    server: "Mailchimp",
    application: 3,
    created: "October 27, 2017",
    expired: "April 25, 2011",
    status: 1,
  },
  {
    id: 2,
    img: "/images/team/client-3.png",
    title: "Software Engineer",
    server: "Google",
    application: 10,
    created: "June 15, 2022",
    expired: "August 30, 2022",
    status: 1,
  },
  {
    id: 3,
    img: "/images/team/client-1.png",
    title: "Graphic Designer",
    server: "Adobe",
    application: 5,
    created: "April 8, 2023",
    expired: "July 15, 2023",
    status: 1,
  },
  {
    id: 4,
    img: "/images/team/client-4.png",
    title: "Sales Associate",
    server: "Salesforce",
    application: 2,
    created: "January 12, 2023",
    expired: "March 20, 2023",
    status: 1,
  },
  {
    id: 5,
    img: "/images/team/client-5.png",
    title: "Product Manager",
    server: "Amazon",
    application: 8,
    created: "September 5, 2022",
    expired: "December 10, 2022",
    status: 1,
  },
  {
    id: 6,
    img: "/images/team/client-6.png",
    title: "Customer Support Specialist",
    server: "Zendesk",
    application: 4,
    created: "March 20, 2023",
    expired: "June 30, 2023",
    status: 1,
  },
  {
    id: 7,
    img: "/images/team/client-7.png",
    title: "Data Analyst",
    server: "Microsoft",
    application: 6,
    created: "November 10, 2022",
    expired: "February 28, 2023",
    status: 1,
  },
];