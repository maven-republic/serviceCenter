// ============================================================================
// 🔍 SEARCH HOOKS FOR DATABASE INTEGRATION
// ============================================================================

// 1️⃣ SEARCH ANALYSIS HOOK
// File: src/components/customer-workspace/element/search/primitives/useSearchAnalysis.js
import { useMemo } from 'react';
import { AlertTriangle, Wrench, Zap, Home } from 'lucide-react';

const SEARCH_INTELLIGENCE = {
  emergency: ['emergency', 'urgent', 'flooding', 'burst', 'leak', '24/7', 'same day', 'asap', 'help'],
  
  problemSolutions: {
    'no hot water': ['Traditional Water Heater Installation', 'Tankless Water Heater Installation', 'Water Heater Repair & Maintenance'],
    'toilet wont flush': ['Toilet Repair & Maintenance', 'Toilet Unclogging & Repair'],
    'pipe burst': ['Emergency Pipe Burst Repair', 'Emergency Water Shut-off Service'],
    'water pressure low': ['Water Pressure Regulator Installation', 'Main Water Line Upgrade'],
    'drain clogged': ['Kitchen Drain Cleaning', 'Bathroom Drain Cleaning', 'Main Drain Line Cleaning'],
    'gas smell': ['Emergency Gas Leak Response', 'Gas Leak Detection & Repair'],
    'sewer backup': ['Emergency Sewer Backup Response', 'Sewer Line Replacement'],
    'custom gate': ['Custom Metal Gate Fabrication', 'Decorative Wrought Iron Welding'],
    'bbq pit': ['Custom BBQ Pit & Smoker Welding', 'Outdoor Kitchen Structure Welding'],
    'metal repair': ['Crack Repair Welding', 'Equipment & Machinery Repair'],
    'pool plumbing': ['Swimming Pool Plumbing', 'Pool Equipment Plumbing', 'Hot Tub & Spa Plumbing']
  },
  
  synonyms: {
    'plumber': ['plumbing professional', 'water specialist', 'pipe expert'],
    'welder': ['welding professional', 'metal fabricator', 'steel worker'],
    'fix': ['repair', 'maintenance', 'service'],
    'install': ['installation', 'setup', 'hookup'],
    'emergency': ['urgent', '24/7', 'immediate', 'asap'],
    'water heater': ['hot water tank', 'water heating system'],
    'toilet': ['bathroom fixture', 'commode'],
    'faucet': ['tap', 'spigot', 'valve']
  },
  
  categories: {
    plumbing: {
      icon: Wrench,
      color: 'blue',
      keywords: ['plumbing', 'pipe', 'water', 'drain', 'sewer', 'toilet', 'faucet', 'leak']
    },
    welding: {
      icon: Zap,
      color: 'orange', 
      keywords: ['welding', 'metal', 'steel', 'fabrication', 'custom', 'repair', 'gate', 'frame']
    },
    emergency: {
      icon: AlertTriangle,
      color: 'red',
      keywords: ['emergency', 'urgent', 'burst', 'flooding', 'backup', '24/7']
    },
    outdoor: {
      icon: Home,
      color: 'green',
      keywords: ['outdoor', 'pool', 'irrigation', 'sprinkler', 'landscape', 'garden']
    }
  }
};

const processSearchQuery = (query) => {
  if (!query || query.length < 2) return null;
  
  const lowerQuery = query.toLowerCase().trim();
  
  // Check if emergency
  const isEmergency = SEARCH_INTELLIGENCE.emergency.some(keyword => 
    lowerQuery.includes(keyword)
  );
  
  // Find problem solutions
  const problemMatch = Object.entries(SEARCH_INTELLIGENCE.problemSolutions)
    .find(([problem]) => lowerQuery.includes(problem));
  
  // Detect category
  const detectedCategory = Object.entries(SEARCH_INTELLIGENCE.categories)
    .find(([, config]) => config.keywords.some(keyword => lowerQuery.includes(keyword)));
  
  // Expand synonyms
  let expandedQuery = lowerQuery;
  Object.entries(SEARCH_INTELLIGENCE.synonyms).forEach(([original, synonyms]) => {
    if (lowerQuery.includes(original)) {
      expandedQuery += ' ' + synonyms.join(' ');
    }
  });
  
  return {
    original: query,
    expanded: expandedQuery,
    isEmergency,
    problemSolutions: problemMatch ? problemMatch[1] : [],
    category: detectedCategory ? detectedCategory[0] : null,
    categoryConfig: detectedCategory ? detectedCategory[1] : null
  };
};

const generateSmartSuggestions = (query, analysis) => {
  if (!analysis) return [];
  
  const suggestions = [];
  
  // Add emergency services if detected
  if (analysis.isEmergency) {
    suggestions.push({
      type: 'emergency',
      title: '24/7 Emergency Services',
      subtitle: 'Immediate response available',
      searchTerm: 'emergency plumbing services',
      icon: AlertTriangle,
      badge: 'Emergency',
      priority: 1
    });
  }
  
  // Add problem solutions
  if (analysis.problemSolutions.length > 0) {
    analysis.problemSolutions.slice(0, 2).forEach(solution => {
      suggestions.push({
        type: 'solution',
        title: solution,
        subtitle: 'Recommended for your problem',
        searchTerm: solution,
        icon: Wrench,
        badge: 'Solution',
        priority: 2
      });
    });
  }
  
  // Add category suggestions
  if (analysis.categoryConfig) {
    suggestions.push({
      type: 'category',
      title: `${analysis.category.charAt(0).toUpperCase() + analysis.category.slice(1)} Services`,
      subtitle: `Browse all ${analysis.category} services`,
      searchTerm: `${analysis.category} services`,
      icon: analysis.categoryConfig.icon,
      badge: 'Category',
      priority: 3
    });
  }
  
  return suggestions.sort((a, b) => a.priority - b.priority);
};

export function useSearchAnalysis(query) {
  const analysis = useMemo(() => processSearchQuery(query), [query]);
  const smartSuggestions = useMemo(() => generateSmartSuggestions(query, analysis), [query, analysis]);
  
  return { analysis, smartSuggestions };
}

