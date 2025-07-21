"use client";

import { useState, useMemo } from "react";
import { logout } from "@/app/(auth)/logout/actions";
import { customerNavigation, navigationConfig } from "@/data/dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  // Core Navigation
  Home,
  Search,
  Calendar,
  User,
  Settings,
  LogOut,
  
  // Analytics & Data
  BarChart3,
  LineChart,
  TrendingUp,
  Activity,
  PieChart,
  
  // Communication & User
  MessageSquare,
  Bell,
  UserCircle,
  UserCheck,
  Phone,
  
  // Business & Services  
  Briefcase,
  Clock,
  MapPin,
  
  // Financial
  CreditCard,
  DollarSign,
  Receipt,
  
  // Utility
  HelpCircle,
  Bookmark,
  Star,
  Plus,
  Grid3X3,
  Shield,
  Zap
} from "lucide-react";

// Semantic Icon Mapping System (UI Layer)
const iconMap = {
  // === WORKSPACE & DISCOVERY ===
  'search': Search,
  'explore': Grid3X3,
  'discover': Search,
  'browse': Grid3X3,
  'home': Home,
  
  // === ANALYTICS & PERFORMANCE ===
  'analytics': LineChart,        // 📈 Perfect for analytics/trends
  'dashboard': BarChart3,        // 📊 Overview/summary data
  'stats': Activity,             // ⚡ Real-time statistics
  'reports': TrendingUp,         // 📈 Growth/performance reports
  'insights': PieChart,          // 🥧 Data breakdown
  'performance': BarChart3,      // 📊 Performance metrics
  
  // === SCHEDULING & TIME ===
  'calendar': Calendar,          // 📅 Appointments/events
  'schedule': Clock,             // 🕒 Scheduling/timing
  'availability': Clock,         // 🕒 Time availability
  'booking': Calendar,           // 📅 Booking system
  'appointments': Calendar,      // 📅 Appointment management
  
  // === USER & PROFILE ===
  'profile': UserCircle,         // 👤 User profile
  'account': UserCircle,         // 👤 Account management
  'user': User,                  // 👤 User data
  'account-settings': Settings,  // ⚙️ Settings
  'verification': UserCheck,     // ✅ Verification status
  
  // === SERVICES & BUSINESS ===
  'services': Briefcase,         // 💼 Service offerings
  'business': Briefcase,         // 💼 Business management
  'portfolio': Briefcase,        // 💼 Work portfolio
  
  // === COMMUNICATION ===
  'messages': MessageSquare,     // 💬 Messaging
  'chat': MessageSquare,         // 💬 Chat interface
  'notifications': Bell,         // 🔔 Notifications
  'support': HelpCircle,         // ❓ Help/support
  'contact': Phone,              // 📞 Contact info
  
  // === FINANCIAL ===
  'payments': CreditCard,        // 💳 Payment methods
  'billing': Receipt,            // 🧾 Billing/invoices
  'invoices': Receipt,           // 🧾 Invoice management
  'money': DollarSign,           // 💰 Financial
  'wallet': DollarSign,          // 💰 Wallet/balance
  
  // === LOCATION ===
  'address': MapPin,             // 📍 Address/location
  'location': MapPin,            // 📍 Geographic location
  'map': MapPin,                 // 📍 Map/navigation
  
  // === UTILITY & ACTIONS ===
  'settings': Settings,          // ⚙️ Configuration
  'help': HelpCircle,           // ❓ Help/FAQ
  'saved': Bookmark,            // 🔖 Saved items
  'favorites': Star,            // ⭐ Favorites
  'reviews': Star,              // ⭐ Reviews/ratings
  'add': Plus,                  // ➕ Add/create
  'create': Plus,               // ➕ Create new
  'quick': Zap,                 // ⚡ Quick actions
  
  // === SYSTEM ACTIONS ===
  'logout': LogOut,             // 🚪 Sign out
  'security': Shield,           // 🛡️ Security/privacy
  
  // === LEGACY SUPPORT (Backward Compatibility) ===
  'flaticon-search': Search,
  'flaticon-calendar': Calendar,
  'flaticon-user': User,
  'flaticon-photo': UserCircle,
  'flaticon-home': Home,
  'flaticon-analytics': LineChart,
  'flaticon-account-info': UserCircle,
  'flaticon-account-information': UserCircle,
  'flaticon-credit-card': CreditCard,
  'flaticon-settings': Settings,
  'flaticon-logout': LogOut,
  'flaticon-message': MessageSquare,
  'flaticon-notification': Bell,
  'flaticon-help': HelpCircle,
  'flaticon-appointment': Calendar,
  'flaticon-stats': Activity,
  'flaticon-dashboard': BarChart3,
  'flaticon-reports': TrendingUp,
  'flaticon-profile': UserCircle,
  'flaticon-my-account': UserCircle,
};

// Advanced icon resolver with fallback chain
const getIconComponent = (iconIdentifier, fallback = Home) => {
  if (!iconIdentifier) return fallback;
  
  // Direct component reference
  if (typeof iconIdentifier === 'function') {
    return iconIdentifier;
  }
  
  // String identifier resolution
  if (typeof iconIdentifier === 'string') {
    // Try exact match first
    if (iconMap[iconIdentifier]) {
      return iconMap[iconIdentifier];
    }
    
    // Try normalized match (lowercase, normalize separators)
    const normalizedKey = iconIdentifier.toLowerCase()
      .replace(/[\s-_]/g, '-')
      .replace(/^flaticon-/, ''); // Remove flaticon prefix for semantic matching
    
    if (iconMap[normalizedKey]) {
      return iconMap[normalizedKey];
    }
  }
  
  // Log missing icons in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Icon not found: "${iconIdentifier}". Using fallback.`);
  }
  
  return fallback;
};

// Enhanced Navigation Item Component
const NavigationItem = ({ item, isActive = false, hoveredItem, setHoveredItem }) => {
  const IconComponent = getIconComponent(item.icon);
  const isHovered = hoveredItem === item.name;
  
  // Handle special actions (like logout)
  if (item.action === 'logout') {
    return (
      <form>
        <button
          type="submit"
          formAction={logout}
          className="flex flex-col items-center justify-center group w-full"
          onMouseEnter={() => setHoveredItem(item.name)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
            bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600
            ${isHovered ? 'scale-105' : ''}
          `}>
            <IconComponent className="h-5 w-5" />
          </div>
          <span className="mt-2 text-xs font-medium text-gray-600 text-center leading-tight">
            {item.name}
          </span>
        </button>
      </form>
    );
  }

  // Regular navigation item
  return (
    <Link
      href={item.path}
      className="flex flex-col items-center justify-center group relative"
      onMouseEnter={() => setHoveredItem(item.name)}
      onMouseLeave={() => setHoveredItem(null)}
      title={item.description} // Tooltip with description
    >
      {/* Icon Container */}
      <div className={`
        w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 relative
        ${isActive 
          ? 'bg-gray-900 text-white shadow-md' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
        }
        ${isHovered ? 'scale-105' : ''}
      `}>
        <IconComponent className="h-5 w-5" />
        
        {/* Badge for notifications */}
        {item.badge && item.badge > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {item.badge > 99 ? '99+' : item.badge}
          </div>
        )}
      </div>
      
      {/* Label */}
      <span className={`
        mt-2 text-xs font-medium text-center leading-tight max-w-[80px] px-1
        ${isActive ? 'text-gray-900' : 'text-gray-600'}
      `}>
        {item.name}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -left-2 top-4 w-1 h-4 bg-gray-900 rounded-full" />
      )}
    </Link>
  );
};

// Main Navigation Component
export default function CustomerWorkspaceNavigation() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState(null);

  // Separate navigation items - Account Information goes to bottom
  const mainNavItems = useMemo(() => {
    return [
      ...(customerNavigation.workspace || []),
      // Exclude account items from main nav - they go to bottom
      ...(customerNavigation.settings?.filter(item => item.action !== 'logout') || [])
    ];
  }, []);

  // Get account and logout items for bottom section
  const accountItem = useMemo(() => {
    return customerNavigation.account?.find(item => item.name === 'Account Information');
  }, []);

  const logoutItem = useMemo(() => {
    return customerNavigation.settings?.find(item => item.action === 'logout');
  }, []);

  // Determine visible items based on config
  const visibleItems = mainNavItems.slice(0, navigationConfig.maxVisibleItems || 6);

  return (
    <div className="hidden lg:flex w-24 border-r border-gray-200 bg-white sticky top-0 h-screen z-10">
      <div className="flex flex-col w-full">
        {/* Header/Logo Area */}
        <div className="flex items-center justify-center p-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
        </div>

        {/* Main Navigation Items */}
        <div className="flex-1 flex flex-col justify-between py-6">
          <div className="space-y-4 px-4">
            {visibleItems.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                isActive={pathname === item.path}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
              />
            ))}
          </div>
        </div>

        {/* Bottom Section - Account Information & Logout */}
        <div className="border-t border-gray-100 py-4 px-4 space-y-3">
          {/* Account Information - Replaces generic account avatar */}
          {accountItem && (
            <NavigationItem
              item={accountItem}
              isActive={pathname === accountItem.path}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
            />
          )}

          {/* Logout Button */}
          {logoutItem && (
            <NavigationItem
              item={logoutItem}
              isActive={false}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
            />
          )}
        </div>
      </div>
    </div>
  );
}