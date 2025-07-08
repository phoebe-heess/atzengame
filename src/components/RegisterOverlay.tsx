import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmailRegisterForm from './EmailRegisterForm';
import EmailLoginForm from './EmailLoginForm';
import SocialAuth from './SocialAuth';
import { useNavigate } from 'react-router-dom';

const BEIGE = '#EDD1B2';
const GREEN = '#03855c';
const ORANGE = '#d69229';
const BG_COLOR = '#EDD1B2';

interface RegisterOverlayProps {
  atzencoins: number;
  onClose: () => void;
  mode?: 'menu';
}

export default function RegisterOverlay({ atzencoins, onClose, mode }: RegisterOverlayProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailRegister = () => {
    setIsLogin(false);
    setShowEmailForm(true);
  };

  const handleEmailLogin = () => {
    setIsLogin(true);
    setShowEmailForm(true);
  };

  const handleSuccess = () => {
    // Update atzencoins in localStorage user object if present
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      if (typeof atzencoins === 'number') {
        userObj.user.atzencoins = atzencoins;
        localStorage.setItem('user', JSON.stringify(userObj));
        console.log('Updated user atzencoins in localStorage:', atzencoins);
      }
    }
    onClose();
    navigate('/scoreboard');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence mode="wait">
        {showEmailForm ? (
          isLogin ? (
            <EmailLoginForm
              key="email-login"
              onSuccess={handleSuccess}
              onCancel={() => setShowEmailForm(false)}
            />
          ) : (
            <EmailRegisterForm
              key="email-register"
              atzencoins={atzencoins}
              onSuccess={handleSuccess}
              onCancel={() => setShowEmailForm(false)}
            />
          )
        ) : (
          <motion.div
            key="auth-options"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: BG_COLOR,
              padding: '24px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '320px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: GREEN, fontSize: '24px', marginBottom: '16px', fontWeight: 700, fontFamily: 'Montserrat, Arial, sans-serif' }}>
              {mode === 'menu' ? 'Login/Register' : 'Speichere deine Atzencoins'}
            </h2>
            {mode !== 'menu' && (
              <p style={{ color: GREEN, marginBottom: '24px', fontSize: '16px', fontFamily: 'Montserrat, Arial, sans-serif' }}>
                Du hast {atzencoins} Atzencoins gesammelt! Erstelle ein Profil oder melde dich an, um sie zu sichern und weiterzutrinken <span role="img" aria-label="tears of joy">😂</span>.
              </p>
            )}
            {error && (
              <div style={{ color: 'red', marginBottom: '16px', fontWeight: 500 }}>
                {error}
              </div>
            )}
            <button
              onClick={handleEmailRegister}
              style={{
                background: GREEN,
                color: BEIGE,
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '17px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '10px',
                marginBottom: '14px',
                width: '100%',
                boxShadow: '0 2px 8px #0001',
                transition: 'background 0.2s',
                fontFamily: 'Montserrat, Arial, sans-serif',
              }}
            >
              <span>📧</span> Mit E-Mail registrieren
            </button>
            <button
              onClick={handleEmailLogin}
              style={{
                background: ORANGE,
                color: BEIGE,
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '17px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '10px',
                marginBottom: '14px',
                width: '100%',
                boxShadow: '0 2px 8px #0001',
                transition: 'background 0.2s',
                fontFamily: 'Montserrat, Arial, sans-serif',
              }}
            >
              <span>🔑</span> Mit E-Mail anmelden
            </button>
            <SocialAuth
              atzencoins={atzencoins}
              onSuccess={handleSuccess}
              onError={handleError}
              buttonStyle={{
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontWeight: 600,
                fontSize: '17px',
                borderRadius: '10px',
                padding: '14px',
                width: '100%',
                marginBottom: '10px',
                boxShadow: '0 2px 8px #0001',
                transition: 'background 0.2s',
              }}
            />
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                color: GREEN,
                fontWeight: 700,
                fontSize: '20px',
                fontFamily: 'Montserrat, Arial, sans-serif',
                border: 'none',
                cursor: 'pointer',
                margin: '20px auto 0 auto',
                display: 'block',
                textAlign: 'center',
                letterSpacing: '0.5px',
                padding: 0,
              }}
            >
              Später
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 