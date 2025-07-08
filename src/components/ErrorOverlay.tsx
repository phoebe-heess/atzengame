import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GREEN = '#03855c';
const BG_COLOR = '#EDD1B2';

interface ErrorOverlayProps {
  message: string;
  onClose: () => void;
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ message, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.7)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Montserrat, Arial, sans-serif',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        style={{
          background: BG_COLOR,
          border: `2px solid ${GREEN}`,
          borderRadius: 16,
          padding: '32px 24px',
          minWidth: 220,
          maxWidth: 320,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ color: GREEN, fontWeight: 700, fontSize: 22, marginBottom: 18 }}>{message}</div>
        <button
          onClick={onClose}
          style={{
            background: GREEN,
            color: BG_COLOR,
            fontWeight: 600,
            fontSize: 16,
            borderRadius: 8,
            padding: '10px 24px',
            border: 'none',
            cursor: 'pointer',
            marginTop: 12,
            fontFamily: 'Montserrat, Arial, sans-serif',
          }}
        >
          Schließen
        </button>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

export default ErrorOverlay; 