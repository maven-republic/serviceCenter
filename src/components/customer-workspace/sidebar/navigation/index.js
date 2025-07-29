// src/components/customer-workspace/sidebar/navigation/index.js

// Export all navigation components for easy importing
export { default as NavigationItem } from './NavigationItem';
export { default as IconButton } from './IconButton';
export { default as LogoutButton } from './LogoutButton';
export { default as SidebarLogo } from './SidebarLogo';
export { default as NavigationSection } from './NavigationSection';

// Export utility functions
export { 
  iconMap, 
  getIconComponent, 
  getAllIconMappings, 
  hasIconMapping 
} from './iconMapper';

// Export the main navigation component
export { default as CustomerWorkspaceNavigation } from '../CustomerWorkspaceNavigation';