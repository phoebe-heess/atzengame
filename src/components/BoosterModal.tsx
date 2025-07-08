import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booster } from '../services/boosterService';

interface BoosterModalProps {
  booster: Booster;
  onClose: () => void;
  onActivate: () => void;
}

const GREEN = '#03855c';
const ORANGE = '#d69229';
const BG_COLOR = '#EDD1B2';

const BoosterModal: React.FC<BoosterModalProps> = ({ booster, onClose, onActivate }) => {
  const [timeRemaining, setTimeRemaining] = useState(booster.duration || 0);

  useEffect(() => {
    if (booster.duration) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [booster.duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
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
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            background: BG_COLOR,
            padding: '32px 24px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '320px',
            textAlign: 'center',
            border: `4px solid ${booster.color}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Booster Icon */}
          <div style={{
            fontSize: '64px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80px',
          }}>
            {booster.icon}
          </div>

          {/* Title */}
          <h2 style={{
            color: GREEN,
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '12px',
            fontFamily: 'Montserrat, Arial, sans-serif',
          }}>
            {booster.name}!
          </h2>

          {/* Description */}
          <p style={{
            color: GREEN,
            fontSize: '16px',
            marginBottom: '24px',
            fontFamily: 'Montserrat, Arial, sans-serif',
            lineHeight: 1.4,
          }}>
            {booster.description}
          </p>

          {/* Timer (if duration exists) */}
          {booster.duration && (
            <div style={{
              background: booster.color,
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '24px',
              display: 'inline-block',
              fontFamily: 'Montserrat, Arial, sans-serif',
            }}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={onActivate}
              style={{
                background: booster.color,
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Montserrat, Arial, sans-serif',
                minWidth: '100px',
              }}
            >
              Aktivieren
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                color: GREEN,
                padding: '12px 24px',
                borderRadius: '8px',
                border: `2px solid ${GREEN}`,
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Montserrat, Arial, sans-serif',
                minWidth: '100px',
              }}
            >
              Schließen
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BoosterModal; 