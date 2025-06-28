import React, { useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

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
  const navigate = useNavigate();
  const buttonContainerRef = useRef(null);

  const menuItems = [
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