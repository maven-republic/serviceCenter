// src/primitives/useAuthGuard.js
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { createClient } from '@/utils/supabase/client';

export const useAuthGuard = () => {
  const router = useRouter();
  const { user } = useUserStore();

  /**
   * Check if user is authenticated
   * @returns {boolean} Whether user is logged in
   */
  const isAuthenticated = () => {
    return !!user;
  };

  /**
   * Require authentication for an action
   * Redirects to login if not authenticated
   * @param {string} action - Description of the action requiring auth
   * @param {string} customReturnUrl - Custom return URL after login
   */
  const requireAuth = (action = 'access this feature', customReturnUrl = null) => {
    if (isAuthenticated()) {
      return true; // User is authenticated, allow action
    }

    // User is not authenticated, redirect to login
    const currentPath = customReturnUrl || window.location.pathname;
    const returnUrl = encodeURIComponent(currentPath);
    const actionParam = encodeURIComponent(action);
    
    // Add search params for context
    const searchParams = new URLSearchParams();
    searchParams.set('returnTo', currentPath);
    searchParams.set('action', actionParam);
    
    // Add any current URL search params to preserve context
    const currentSearchParams = new URLSearchParams(window.location.search);
    currentSearchParams.forEach((value, key) => {
      if (key !== 'returnTo' && key !== 'action') {
        searchParams.set(key, value);
      }
    });

    const loginUrl = `/login?${searchParams.toString()}`;
    router.push(loginUrl);
    
    return false; // Prevent action from continuing
  };

  /**
   * Check authentication status with Supabase
   * Useful for checking if session is still valid
   * @returns {Promise<boolean>} Whether user has valid session
   */
  const checkAuthStatus = async () => {
    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Auth status check failed:', error);
      return false;
    }
  };

  /**
   * Require authentication with async session validation
   * More thorough than requireAuth but slower
   * @param {string} action - Description of the action requiring auth
   * @returns {Promise<boolean>} Whether user is authenticated
   */
  const requireAuthWithValidation = async (action = 'access this feature') => {
    // First check local state
    if (!isAuthenticated()) {
      requireAuth(action);
      return false;
    }

    // Then validate with server
    const isValid = await checkAuthStatus();
    if (!isValid) {
      requireAuth(action);
      return false;
    }

    return true;
  };

  /**
   * Create an auth-protected click handler
   * @param {Function} callback - Function to call if authenticated
   * @param {string} action - Description of the action
   * @returns {Function} Click handler that checks auth first
   */
  const withAuth = (callback, action = 'perform this action') => {
    return (event) => {
      if (requireAuth(action)) {
        return callback(event);
      }
      // If not authenticated, requireAuth handles the redirect
    };
  };

  /**
   * Create an auth-protected async click handler
   * @param {Function} callback - Async function to call if authenticated
   * @param {string} action - Description of the action
   * @returns {Function} Async click handler that checks auth first
   */
  const withAuthAsync = (callback, action = 'perform this action') => {
    return async (event) => {
      const isAuth = await requireAuthWithValidation(action);
      if (isAuth) {
        return await callback(event);
      }
      // If not authenticated, requireAuthWithValidation handles the redirect
    };
  };

  /**
   * Get login URL with context
   * @param {string} action - Description of the action
   * @param {string} returnUrl - URL to return to after login
   * @returns {string} Login URL with query parameters
   */
  const getLoginUrl = (action = 'continue', returnUrl = null) => {
    const targetUrl = returnUrl || window.location.pathname;
    const searchParams = new URLSearchParams();
    searchParams.set('returnTo', targetUrl);
    searchParams.set('action', action);
    
    return `/login?${searchParams.toString()}`;
  };

  return {
    isAuthenticated,
    requireAuth,
    checkAuthStatus,
    requireAuthWithValidation,
    withAuth,
    withAuthAsync,
    getLoginUrl,
    user
  };
};