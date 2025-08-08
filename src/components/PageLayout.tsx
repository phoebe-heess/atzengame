import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BG_COLOR = '#EDD1B2';
const GREEN = '#03855c';
const ORANGE = '#d69229';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  onOpenMenu?: () => void;
  alignTop?: boolean;
  onClose?: () => void;
  hideCloseButton?: boolean;
}

export default function PageLayout({ children, title, onOpenMenu, alignTop, onClose, hideCloseButton }: PageLayoutProps) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{ 
        background: BG_COLOR, 
        minHeight: '100vh', 
        fontFamily: 'monospace',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: alignTop ? undefined : 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: 430,
        margin: '32px auto 0 auto',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        boxShadow: '0 8px 32px #0002',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{
        width: 40,
        height: 4,
        background: GREEN,
        borderRadius: 2,
        margin: '16px auto 12px auto',
      }} />
      {!hideCloseButton && (
        <button
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'transparent',
            border: 'none',
            color: GREEN,
            fontWeight: 'bold',
            fontSize: 28,
            cursor: 'pointer',
          }}
          onClick={onClose ? onClose : () => navigate('/')}
          aria-label="Close"
        >
          ×
        </button>
      )}
      <h1 style={{ 
        color: ORANGE, 
        fontWeight: 'bold', 
        fontSize: 36, 
        marginTop: 40,
        marginBottom: 32,
        textAlign: 'center',
        width: '100%',
      }}>
        {title}
      </h1>
      <div style={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        {children}
      </div>
    </motion.div>
  );
} 