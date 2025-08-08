import React from 'react';
import { authService } from '../services/auth';

const GREEN = '#03855c';
const BG_COLOR = '#EDD1B2';
const ORANGE = '#d69229';
const BEIGE = '#EDD1B2';
const GOOGLE_BLUE = '#4285F4';

interface SocialAuthProps {
  atzencoins: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  buttonStyle?: React.CSSProperties;
}

function SocialAuth({ atzencoins, onSuccess, onError, buttonStyle }: SocialAuthProps) {
  const handleGoogleLogin = () => {
    console.log('🔍 Google login button clicked');
    try {
      // Redirect to backend for Google OAuth
      authService.loginWithGoogle();
      // Note: onSuccess will be called when user returns from OAuth flow
    } catch (error: any) {
      console.error('Google login error:', error);
      onError(error.message || 'Google authentication failed');
    }
  };

  const handleMockLogin = async () => {
    try {
      await authService.mockLogin();
      onSuccess();
    } catch (error: any) {
      console.error('Mock login error:', error);
      onError(error.message || 'Mock authentication failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        onClick={handleGoogleLogin}
        style={{
          background: GOOGLE_BLUE,
          color: BEIGE,
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 600,
          fontSize: '17px',
          borderRadius: '10px',
          padding: '14px',
          width: '100%',
          marginBottom: '10px',
          boxShadow: '0 2px 8px #0001',
          transition: 'background 0.2s',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '10px',
          cursor: 'pointer',
          ...buttonStyle,
        }}
      >
        {/* Official Google G icon SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
          <g>
            <path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.23-1.484 3.617-5.617 3.617-3.375 0-6.117-2.797-6.117-6.25s2.742-6.25 6.117-6.25c1.922 0 3.211.797 3.953 1.484l2.703-2.617c-1.617-1.484-3.711-2.398-6.656-2.398-5.484 0-9.938 4.453-9.938 9.938s4.453 9.938 9.938 9.938c5.719 0 9.5-4.016 9.5-9.672 0-.641-.07-1.125-.156-1.563z" fill="#fff"/>
            <path d="M3.545 7.545l2.844 2.086c.641-1.211 1.953-2.617 4.016-2.617 1.172 0 2.25.453 3.078 1.344l2.312-2.25c-1.344-1.25-3.047-2.016-5.391-2.016-3.375 0-6.117 2.797-6.117 6.25 0 1.016.219 1.984.609 2.797z" fill="#fbbc05"/>
            <path d="M12.023 22c2.484 0 4.547-.828 6.047-2.25l-2.844-2.297c-.797.547-1.844.922-3.203.922-2.484 0-4.594-1.672-5.344-3.953l-2.844 2.203c1.547 3.047 4.844 5.375 8.188 5.375z" fill="#34a853"/>
            <path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.23-1.484 3.617-5.617 3.617-3.375 0-6.117-2.797-6.117-6.25 0-1.016.219-1.984.609-2.797l2.844 2.086c.75 2.281 2.859 3.953 5.344 3.953 1.359 0 2.406-.375 3.203-.922l2.844 2.297c-1.5 1.422-3.563 2.25-6.047 2.25z" fill="#4285f4"/>
            <path d="M3.545 7.545l2.844 2.086c.641-1.211 1.953-2.617 4.016-2.617 1.172 0 2.25.453 3.078 1.344l2.312-2.25c-1.344-1.25-3.047-2.016-5.391-2.016-3.375 0-6.117 2.797-6.117 6.25 0 1.016.219 1.984.609 2.797z" fill="#ea4335"/>
          </g>
        </svg>
        Weiter mit Google
      </button>
      
      {/* Temporary mock login button for testing */}
      <button
        onClick={handleMockLogin}
        style={{
          background: ORANGE,
          color: BEIGE,
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 600,
          fontSize: '17px',
          borderRadius: '10px',
          padding: '14px',
          width: '100%',
          boxShadow: '0 2px 8px #0001',
          transition: 'background 0.2s',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: 'pointer',
          ...buttonStyle,
        }}
      >
        🧪 Test Login (Mock)
      </button>
    </div>
  );
}

export default SocialAuth; 