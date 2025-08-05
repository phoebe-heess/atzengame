import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { authService, AuthStatus } from '../services/auth';

const GREEN = '#03855c';
const ORANGE = '#d69229';
const BG_COLOR = '#EDD1B2';

const MOBILE_WIDTH = 375;

type ContainerRect = {
  left: number;
  top: number;
  width: number;
  height: number;
} | null;

export let openBurgerMenu: (() => void) | null = null;

interface BurgerMenuProps {
  onShowLoginRegister: () => void;
}

export default function BurgerMenu({ onShowLoginRegister }: BurgerMenuProps) {
  const [open, setOpen] = useState(false);
  const [containerRect, setContainerRect] = useState<ContainerRect>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ authenticated: false, user: null });
  const navigate = useNavigate();
  const buttonContainerRef = useRef(null);

  // Check authentication status when component mounts and when menu opens
  useEffect(() => {
    const checkAuth = async () => {
      const status = await authService.checkAuthStatus();
      setAuthStatus(status);
    };
    
    checkAuth();
    
    // Check auth status every 5 seconds to keep it updated
    const interval = setInterval(checkAuth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  const menuItems = authStatus.authenticated ? [
    { label: 'Profil', path: '/scoreboard' },
    { label: 'Abmelden', action: async () => { 
      await authService.logout(); 
      setAuthStatus({ authenticated: false, user: null });
      setOpen(false);
    }},
    { label: 'Kontakt', path: '/kontakt' },
    { label: 'Datenschutz', path: '/datenschutz' },
    { label: 'Impressum', path: '/impressum' },
  ] : [
    { label: 'Login/Register', action: () => { setOpen(false); onShowLoginRegister(); } },
    { label: 'Kontakt', path: '/kontakt' },
    { label: 'Datenschutz', path: '/datenschutz' },
    { label: 'Impressum', path: '/impressum' },
  ];

  // Find the .mobile-container and get its bounding rect
  useLayoutEffect(() => {
    function updateRect() {
      const el = document.querySelector('.mobile-container');
      if (el) {
        const rect = el.getBoundingClientRect();
        setContainerRect({
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        });
      }
    }
    if (open) {
      updateRect();
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect);
    }
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [open]);

  React.useEffect(() => {
    openBurgerMenu = () => setOpen(true);
    return () => { openBurgerMenu = null; };
  }, []);

  const portalContent = (open && containerRect) ? (
    <AnimatePresence>
      <>
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: containerRect.top,
            left: containerRect.left,
            width: containerRect.width,
            height: containerRect.height,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 2000,
          }}
          onClick={() => setOpen(false)}
        />
        {/* Menu Panel */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'absolute',
            top: containerRect.top + 32,
            left: containerRect.left,
            width: containerRect.width,
            height: containerRect.height - 32,
            background: BG_COLOR,
            boxShadow: '0 8px 32px #0002',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            zIndex: 2001,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Swipe handle */}
          <div style={{
            width: 40,
            height: 4,
            background: GREEN,
            borderRadius: 2,
            margin: '16px auto 12px auto',
          }} />
          <button
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              fontSize: 32,
              color: '#03855c',
              cursor: 'pointer',
              zIndex: 1001,
            }}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            
          </button>
          <div style={{ 
            marginTop: 80, 
            width: '100%', 
            padding: '0 20px',
            height: 'calc(100% - 80px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>
            {menuItems.map(item => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.path) { setOpen(false); navigate(item.path); }
                }}
                style={{
                  width: '100%',
                  padding: '16px 0',
                  border: 'none',
                  background: 'none',
                  color: GREEN,
                  fontWeight: 'bold',
                  fontSize: 24,
                  borderBottom: `1px solid ${GREEN}20`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                }}
              >
                {item.label}
              </button>
            ))}
            
            {/* Instagram Icon at the end */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px 0',
              borderTop: `1px solid ${GREEN}20`,
              marginTop: 'auto',
            }}>
              <a
                href="https://www.instagram.com/atzenwin/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  color: GREEN,
                  fontSize: 18,
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  ) : null;

  return (
    <>
      <div ref={buttonContainerRef} style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100 }}>
        <motion.button
          onClick={() => setOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 8,
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            margin: 0,
          }}
          whileTap={{ scale: 0.98 }}
          aria-label="Open menu"
        >
          <div style={{ width: 28, height: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ display: 'block', height: 2, width: 28, background: GREEN, borderRadius: 1 }}></span>
            <span style={{ display: 'block', height: 2, width: 28, background: GREEN, borderRadius: 1 }}></span>
            <span style={{ display: 'block', height: 2, width: 28, background: GREEN, borderRadius: 1 }}></span>
          </div>
        </motion.button>
      </div>
      {typeof window !== 'undefined' && createPortal(portalContent, document.body)}
    </>
  );
} 