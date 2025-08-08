export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_GOOGLE_CLIENT_ID?: string;
    readonly VITE_APPLE_CLIENT_ID?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user: User | null;
}

export const authService = {

  // Initiate Google OAuth login using popup
  loginWithGoogle() {
    const authUrl = `${API_URL}/auth/google`;
    console.log('🔍 Opening popup to:', authUrl);
    const popup = window.open(
      authUrl,
      'googleOAuth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    // Check if popup was blocked
    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
    
    // Listen for popup close and check for success
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        // Trigger a check for authentication status
        window.dispatchEvent(new CustomEvent('oauth-complete'));
      }
    }, 1000);
  },

  // Mock login for testing (temporary)
  async mockLogin(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/mock-login`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Mock login response:', data);
    } catch (error) {
      console.error('Mock login error:', error);
    }
  },

  // Check authentication status
  async checkAuthStatus(): Promise<AuthStatus> {
    try {
      const response = await fetch(`${API_URL}/auth/status`, {
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { authenticated: false, user: null };
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // Get current user from session (deprecated - use checkAuthStatus instead)
  getCurrentUser(): User | null {
    // This is now handled by the backend session
    // We'll keep this for backward compatibility but it won't work
    console.warn('getCurrentUser() is deprecated. Use checkAuthStatus() instead.');
    return null;
  }
}; 