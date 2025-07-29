// src/components/customer-workspace/sidebar/navigation/iconMapper.js
import { 
  Home, 
  Search, 
  Calendar, 
  Bell, 
  CreditCard, 
  Settings, 
  User, 
  MapPin, 
  LogOut,
  Plus,
  Grid3X3,
  ShoppingBag,
  FileText,
  Heart,
  ArrowUp,
  Download,
  BarChart3
} from "lucide-react";

// Icon mapping for flaticon classes to Lucide React icons
export const iconMap = {
  "flaticon-search": Search,
  "flaticon-calendar": Calendar,
  "flaticon-home": BarChart3,  // Analytics
  "flaticon-photo": User,
  "flaticon-logout": LogOut,
  "flaticon-appointment": Calendar,
  "flaticon-presentation": FileText,
  "flaticon-briefcase": ShoppingBag,
  "flaticon-content": FileText,
  "flaticon-document": FileText,
  "flaticon-price-tag": CreditCard,
  "flaticon-like": Heart,
  "flaticon-chat": Bell,
  "flaticon-review-1": FileText,
  "flaticon-receipt": FileText,
  "flaticon-dollar": CreditCard,
  "flaticon-web": Grid3X3,
};

/**
 * Get the appropriate icon component for a given icon class
 * @param {string} iconClass - The flaticon class name
 * @returns {React.Component} - The corresponding Lucide React icon component
 */
export const getIconComponent = (iconClass) => {
  return iconMap[iconClass] || Home;
};

/**
 * Get all available icon mappings
 * @returns {Object} - Object with all icon mappings
 */
export const getAllIconMappings = () => iconMap;

/**
 * Check if an icon class has a mapping
 * @param {string} iconClass - The flaticon class name
 * @returns {boolean} - Whether the icon has a mapping
 */
export const hasIconMapping = (iconClass) => {
  return iconClass in iconMap;
};