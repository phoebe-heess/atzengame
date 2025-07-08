import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Winsite from './pages/Winsite';
import AgeCheckModal from './components/AgeCheckModal';
import BurgerMenu from './components/BurgerMenu';
import Register from './pages/Register';
import Kontakt from './pages/Kontakt';
import Datenschutz from './pages/Datenschutz';
import Impressum from './pages/Impressum';
import RegisterOverlay from './components/RegisterOverlay';
import Scoreboard from './pages/Scoreboard';
import BoosterModal from './components/BoosterModal';
import { boosterService, Booster } from './services/boosterService';
import { motion, AnimatePresence } from 'framer-motion';

const GREEN = '#03855c';
const ORANGE = '#d69229';
const BG_COLOR = '#EDD1B2';

function App() {
  const [showAgeCheck, setShowAgeCheck] = useState(false);
  const [showLoginRegister, setShowLoginRegister] = useState(false);
  const [atzencoins, setAtzencoins] = useState<number>(0);
  const [showBoosterModal, setShowBoosterModal] = useState(false);
  const [currentBooster, setCurrentBooster] = useState<Booster | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    const ageChecked = localStorage.getItem('ageChecked');
    const dsgvoAccepted = localStorage.getItem('dsgvoAccepted');
    setShowAgeCheck(!(ageChecked === 'true' && dsgvoAccepted === 'true'));
  }, []);

  useEffect(() => {
    // Clear expired boosters on app load
    boosterService.clearExpiredBoosters();
  }, []);

  const handleAgeCheckConfirm = (allowed: boolean) => {
    if (allowed) {
      localStorage.setItem('ageChecked', 'true');
      localStorage.setItem('dsgvoAccepted', 'true');
      setShowAgeCheck(false);
    }
  };

  const handleBoosterActivated = () => {
    if (currentBooster) {
      boosterService.activateBooster(currentBooster);
      setCurrentBooster(null);
      setShowBoosterModal(false);
    }
  };

  const handleBoosterWon = (booster: Booster) => {
    setCurrentBooster(booster);
    setShowBoosterModal(true);
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <div className="mobile-container" style={{ position: 'relative', minHeight: '100vh' }}>
          {showAgeCheck && <AgeCheckModal onConfirm={handleAgeCheckConfirm} />}
          {!showAgeCheck && (
            <Routes>
              <Route path="/" element={<Winsite atzencoins={atzencoins} setAtzencoins={setAtzencoins} />} />
              <Route path="/game" element={<Winsite atzencoins={atzencoins} setAtzencoins={setAtzencoins} />} />
              <Route path="/game/:code" element={<Winsite atzencoins={atzencoins} setAtzencoins={setAtzencoins} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/kontakt" element={<Kontakt />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/scoreboard" element={<Scoreboard atzencoins={atzencoins} />} />
            </Routes>
          )}
          <BurgerMenu onShowLoginRegister={() => setShowLoginRegister(true)} />
          {showLoginRegister && (
            <RegisterOverlay atzencoins={atzencoins} onClose={() => setShowLoginRegister(false)} mode="menu" />
          )}

          {/* Booster Modal */}
          <AnimatePresence>
            {showBoosterModal && currentBooster && (
              <BoosterModal
                booster={currentBooster}
                onClose={() => {
                  setShowBoosterModal(false);
                  setCurrentBooster(null);
                }}
                onActivate={handleBoosterActivated}
              />
            )}
          </AnimatePresence>

          {/* Instagram Button (from Atzenwin) */}
          <button
            aria-label="Instagram"
            tabIndex={-1}
            onMouseDown={e => e.preventDefault()}
            onTouchStart={e => e.preventDefault()}
            style={{
              position: 'absolute',
              bottom: 20,
              right: 24,
              background: BG_COLOR,
              color: GREEN,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              zIndex: 2000,
              cursor: 'pointer',
            }}
            onClick={() => window.open('https://www.instagram.com/atzengold/', '_blank')}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill={GREEN}/>
            </svg>
          </button>
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
