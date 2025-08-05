import React, { useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

const GREEN = '#03855c';
const ORANGE = '#d69229';
const BG_COLOR = '#EDD1B2';

type ContainerRect = {
  left: number;
  top: number;
  width: number;
  height: number;
} | null;

const Kontakt: React.FC = () => {
  const [containerRect, setContainerRect] = useState<ContainerRect>(null);
  const navigate = useNavigate();

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
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  const portalContent = containerRect ? (
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
          onClick={handleClose}
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
          <div style={{ 
            marginTop: 40, 
            width: '100%', 
            padding: '0 20px',
            height: 'calc(100% - 40px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            <style>
              {`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            {/* Kontakt Content from backup */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0 0 40px 0',
            }}>
              <h1 style={{ 
                color: GREEN, 
                fontWeight: 700, 
                fontSize: 28, 
                textAlign: 'center', 
                marginBottom: 24,
                fontFamily: 'Montserrat, Arial, sans-serif',
              }}>
                KONTAKT
              </h1>
              <div style={{ 
                fontSize: 16, 
                color: GREEN, 
                marginBottom: 12, 
                maxWidth: 320, 
                padding: '0 20px', 
                textAlign: 'center', 
                lineHeight: 1.6,
                fontFamily: 'Montserrat, Arial, sans-serif',
              }}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                  Atzengold
                </div>
                <div>Atzenhofer Str. 76</div>
                <div>90768 Fürth</div>
                <div>Deutschland</div>
                <div style={{ marginTop: 12 }}>Telefon: +49 (0) 176 6 2345 740</div>
                <div>E-Mail: gp@atzengold.net</div>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  ) : null;

  return (
    <>
      {typeof window !== 'undefined' && createPortal(portalContent, document.body)}
    </>
  );
};

export default Kontakt; 