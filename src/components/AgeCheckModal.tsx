import React, { useState } from 'react';
import { motion } from 'framer-motion';
import schriftGif from '../assets/schrift.gif';
import { analyticsService } from '../services/analyticsService';

const GREEN = '#03855c';
const BG_COLOR = '#EDD1B2';

// If you have a logo image, import it here, e.g.:
// import logo from '../assets/atzengold-logo.png';

interface AgeCheckModalProps {
  onConfirm: (allowed: boolean) => void;
}

export default function AgeCheckModal({ onConfirm }: AgeCheckModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  // Locked values from user selection
  const logoTop = 11;
  const logoSize = 131;
  const textTop = 20;
  const dsgvoButtonsBottom = 10;

  const handleAgeConfirm = () => {
    setIsFlipped(true);
  };

  const handleDSGVOAccept = () => {
    localStorage.setItem('dsgvoAccepted', 'true');
    onConfirm(true);
  };

  const handleDSGVODecline = () => {
    // Track age check decline
    analyticsService.trackAgeCheck(false);
    window.location.href = '/datenschutz';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: BG_COLOR,
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Montserrat, Arial, sans-serif',
      padding: 0,
      perspective: '1000px',
    }}>
      <motion.div
        style={{
          width: '96vw',
          maxWidth: 260,
          height: 400,
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Front side - Age Check */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          border: `2px solid ${GREEN}`,
          borderRadius: 0,
          background: BG_COLOR,
          padding: '12px 4px 16px 4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            marginTop: `${logoTop}%`
          }}>
            {/* Logo gif */}
            <img src={schriftGif} alt="Atzengold Schrift" style={{ 
              width: logoSize, 
              maxWidth: '60vw', 
              margin: '0 auto 6px auto', 
              display: 'block' 
            }} />
            <div style={{
              color: GREEN,
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 14,
              fontFamily: 'Montserrat, Arial, sans-serif',
              textAlign: 'center',
              marginTop: textTop,
            }}>
              Bist Du 16 Jahre oder älter?
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            maxWidth: 180,
            marginTop: 'auto',
            marginBottom: 16,
          }}>
            <button
              onClick={handleAgeConfirm}
              style={{
                background: GREEN,
                color: BG_COLOR,
                fontWeight: 500,
                fontSize: 14,
                borderRadius: 0,
                padding: '7px 0',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontFamily: 'Montserrat, Arial, sans-serif',
                display: 'block',
                textAlign: 'center',
                boxSizing: 'border-box',
                height: 32,
              }}
            >
              Ja
            </button>
            <a
              href="https://www.bierbewusstgeniessen.de/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: GREEN,
                color: BG_COLOR,
                fontWeight: 500,
                fontSize: 14,
                borderRadius: 0,
                padding: '7px 0',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textDecoration: 'none',
                display: 'block',
                fontFamily: 'Montserrat, Arial, sans-serif',
                textAlign: 'center',
                lineHeight: 'normal',
                boxSizing: 'border-box',
                height: 32,
              }}
            >
              Nein
            </a>
          </div>
        </div>

        {/* Back side - DSGVO */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          border: `2px solid ${GREEN}`,
          borderRadius: 0,
          background: BG_COLOR,
          padding: '12px 4px 16px 4px',
          display: 'flex',
          flexDirection: 'column',
          transform: 'rotateY(180deg)',
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}>
          <div style={{
            color: GREEN,
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 14,
            fontFamily: 'Montserrat, Arial, sans-serif',
            textAlign: 'center',
          }}>
            Datenschutzhinweis
          </div>
          
          <div style={{ 
            color: GREEN,
            fontSize: 13,
            lineHeight: 1.5,
            marginBottom: 14,
            fontFamily: 'Montserrat, Arial, sans-serif',
            textAlign: 'center',
          }}>
            <p style={{ marginBottom: 8 }}>
              Willkommen bei Atzenwin! Um dir das bestmögliche Erlebnis zu bieten, verwenden wir Cookies und ähnliche Technologien.
            </p>
            <p style={{ marginBottom: 8 }}>
              Mit deiner Einwilligung können wir:
            </p>
            <ul style={{ 
              listStyle: 'disc',
              paddingLeft: 20,
              marginBottom: 8,
              display: 'inline-block',
              textAlign: 'left',
            }}>
              <li>Die Nutzung unserer App analysieren</li>
              <li>Personalisierte Inhalte anbieten</li>
              <li>Die Funktionalität unserer App verbessern</li>
            </ul>
            <p style={{ marginBottom: 8 }}>
              Du kannst deine Einwilligung jederzeit widerrufen. Weitere Informationen findest du in unserer Datenschutzerklärung.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            width: '100%',
            maxWidth: 180,
            margin: 'auto 0 0 0',
            alignSelf: 'center',
            position: 'absolute',
            bottom: dsgvoButtonsBottom,
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
            <button
              onClick={handleDSGVOAccept}
              style={{
                background: GREEN,
                color: BG_COLOR,
                fontWeight: 500,
                fontSize: 14,
                borderRadius: 0,
                padding: '7px 0',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontFamily: 'Montserrat, Arial, sans-serif',
                display: 'block',
                textAlign: 'center',
                boxSizing: 'border-box',
                height: 32,
              }}
            >
              Akzeptieren
            </button>
            <button
              onClick={handleDSGVODecline}
              style={{
                background: GREEN,
                color: BG_COLOR,
                fontWeight: 500,
                fontSize: 14,
                borderRadius: 0,
                padding: '7px 0',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontFamily: 'Montserrat, Arial, sans-serif',
                display: 'block',
                textAlign: 'center',
                boxSizing: 'border-box',
                height: 32,
              }}
            >
              Ablehnen
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 