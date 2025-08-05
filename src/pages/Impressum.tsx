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

const Impressum: React.FC = () => {
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
                fontSize: 28, 
                textAlign: 'center', 
                marginBottom: 24,
                fontFamily: 'Montserrat, Arial, sans-serif',
              }}>
                IMPRESSUM
              </h1>
                              <div style={{ 
                  fontSize: 14, 
                  color: GREEN, 
                  marginBottom: 12, 
                  maxWidth: 320, 
                  padding: '0 20px', 
                  textAlign: 'center', 
                  lineHeight: 1.6,
                  fontFamily: 'Montserrat, Arial, sans-serif',
                }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
                  Angaben gemäß § 5 TMG
                </div>
                
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Verantwortlich für den Inhalt:
                </div>
                <div style={{ marginBottom: 16 }}>
                  Atzengold<br />
                  Atzenhofer Str. 76<br />
                  90768 Fürth<br />
                  Deutschland
                </div>

                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Kontakt:
                </div>
                <div style={{ marginBottom: 16 }}>
                  Telefon: +49 (0) 176 6 2345 740<br />
                  E-Mail: gp@atzengold.net
                </div>

                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Vertreten durch:
                </div>
                <div style={{ marginBottom: 16 }}>
                  Geschäftsführer: Gabriel Maria Platt
                </div>

                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Umsatzsteuer-ID:
                </div>
                <div style={{ marginBottom: 16 }}>
                  Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE346497049
                </div>

                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Aufsichtsbehörde:
                </div>
                <div style={{ marginBottom: 16 }}>
                  [Zuständige Aufsichtsbehörde falls erforderlich]
                </div>

                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 24, marginBottom: 12 }}>
                  Haftungsausschluss
                </div>

                <div style={{ marginBottom: 12 }}>
                  <strong>Gewinnspiel und Preise:</strong><br />
                  Die Teilnahme an unserem Gewinnspiel erfolgt auf eigene Gefahr. Gewonnene Preise können nicht zurückgegeben oder umgetauscht werden. Der Rechtsweg ist ausgeschlossen.
                </div>

                <div style={{ marginBottom: 12 }}>
                  <strong>Keine Gewährleistung:</strong><br />
                  Wir übernehmen keine Garantie für die Funktionalität der Spielmechaniken, die Verfügbarkeit von Punkten oder die korrekte Auszahlung von Preisen. Das Spiel kann technischen Störungen unterliegen.
                </div>

                <div style={{ marginBottom: 12 }}>
                  <strong>Haftung für Inhalte:</strong><br />
                  Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                </div>

                <div style={{ marginBottom: 12 }}>
                  <strong>Haftung für Links:</strong><br />
                  Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                </div>

                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 24, marginBottom: 12 }}>
                  Urheberrecht
                </div>
                <div style={{ marginBottom: 12 }}>
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </div>

                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 24, marginBottom: 12 }}>
                  Datenschutz
                </div>
                <div style={{ marginBottom: 12 }}>
                  Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis.
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

export default Impressum; 