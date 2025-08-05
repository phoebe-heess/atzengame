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

const Datenschutz: React.FC = () => {
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
                fontSize: 24, 
                textAlign: 'center', 
                marginBottom: 24,
                fontFamily: 'Montserrat, Arial, sans-serif',
                maxWidth: '280px',
                wordWrap: 'break-word',
              }}>
                DATENSCHUTZ<br />
                ERKLÄRUNG
              </h1>
              <div style={{ 
                color: GREEN, 
                fontWeight: 600, 
                fontSize: 16, 
                textAlign: 'center', 
                marginBottom: 16,
                fontFamily: 'Montserrat, Arial, sans-serif',
              }}>
                gemäß DSGVO
              </div>
                              <div style={{ 
                  fontSize: 13, 
                  color: GREEN, 
                  marginBottom: 12, 
                  maxWidth: 320, 
                  padding: '0 20px', 
                  textAlign: 'center', 
                  lineHeight: 1.6,
                  fontFamily: 'Montserrat, Arial, sans-serif',
                }}>


                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Verantwortlicher:
                </div>
                <div style={{ marginBottom: 16 }}>
                  Atzengold<br />
                  Atzenhofer Str. 76<br />
                  90768 Fürth<br />
                  Deutschland<br />
                  E-Mail: gp@atzengold.net
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 20, marginBottom: 8 }}>
                  Google Analytics
                </div>
                <div style={{ marginBottom: 16 }}>
                  Wir verwenden Google Analytics, um zu sehen wann wo unser Bier getrunken wird und so effizienter und umweltschonender arbeiten zu können. Wir verbinden jedoch KEINE Standortdaten mit Benutzerprofilen.
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 20, marginBottom: 8 }}>
                  1. Erhebung und Verarbeitung personenbezogener Daten
                </div>
                <div style={{ marginBottom: 12 }}>
                  Wir erheben und verarbeiten personenbezogene Daten nur im gesetzlich erlaubten Umfang oder nach Ihrer ausdrücklichen Einwilligung. Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen.
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 16, marginBottom: 8 }}>
                  2. Zweck der Datenverarbeitung
                </div>
                <div style={{ marginBottom: 12 }}>
                  Ihre Daten werden verarbeitet für:<br />
                  • Bereitstellung unserer Spiele-App<br />
                  • Gewinnspiel-Durchführung<br />
                  • Verbesserung unserer Services<br />
                  • Technische Analyse (ohne Profilerstellung)
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 16, marginBottom: 8 }}>
                  3. Google Analytics
                </div>
                <div style={{ marginBottom: 12 }}>
                  Diese App verwendet Google Analytics zur Analyse der Nutzung. Google Analytics verwendet Cookies und ähnliche Technologien. Die durch den Cookie erzeugten Informationen über Ihre Nutzung werden an Google übertragen und dort gespeichert.<br /><br />
                  <strong>Wichtig:</strong> Wir verbinden keine Standortdaten mit Benutzerprofilen. Ihre Standortinformationen werden nicht mit Ihren persönlichen Daten verknüpft.
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 16, marginBottom: 8 }}>
                  4. Standortdaten
                </div>
                <div style={{ marginBottom: 12 }}>
                  Falls Sie Standortdaten freigeben, werden diese ausschließlich für die Spielfunktionalität verwendet. Diese Daten werden nicht mit Ihren persönlichen Profildaten verknüpft oder für andere Zwecke verwendet.
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 16, marginBottom: 8 }}>
                  5. Gewinnspiel-spezifische Hinweise
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Preise und Gewinne:</strong><br />
                  • Gewonnene Preise können nicht zurückgegeben oder umgetauscht werden<br />
                  • Der Rechtsweg ist ausgeschlossen<br />
                  • Wir garantieren nicht die Funktionalität der Spielmechaniken<br />
                  • Punkte und Preise können technischen Störungen unterliegen
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 16, marginBottom: 8 }}>
                  6. Ihre Rechte (DSGVO)
                </div>
                <div style={{ marginBottom: 12 }}>
                  Sie haben das Recht auf:<br />
                  • Auskunft über Ihre gespeicherten Daten<br />
                  • Berichtigung falscher Daten<br />
                  • Löschung Ihrer Daten<br />
                  • Einschränkung der Verarbeitung<br />
                  • Datenübertragbarkeit<br />
                  • Widerspruch gegen die Verarbeitung
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 16, marginBottom: 8 }}>
                  7. Datensicherheit
                </div>
                <div style={{ marginBottom: 12 }}>
                  Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen Manipulation, Verlust, Zerstörung oder gegen den Zugriff unberechtigter Personen zu schützen.
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 16, marginBottom: 8 }}>
                  8. Cookies
                </div>
                <div style={{ marginBottom: 12 }}>
                  Diese App verwendet Cookies für die Funktionalität und Analyse. Sie können Cookies in Ihren Browsereinstellungen deaktivieren, was jedoch die Funktionalität beeinträchtigen kann.
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 16, marginBottom: 8 }}>
                  9. Kontakt
                </div>
                <div style={{ marginBottom: 12 }}>
                  Bei Fragen zum Datenschutz kontaktieren Sie uns unter:<br />
                  E-Mail: gp@atzengold.net<br />
                  Telefon: +49 (0) 176 6 2345 740
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 16, marginBottom: 8 }}>
                  10. Änderungen
                </div>
                <div style={{ marginBottom: 12 }}>
                  Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder bei Änderungen unserer Services anzupassen.
                </div>

                <div style={{ fontSize: 11, marginTop: 20, fontStyle: 'italic' }}>
                  Stand: Dezember 2024
                </div>
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

export default Datenschutz; 