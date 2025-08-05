import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Winsite from './pages/Winsite';
import AgeCheckModal from './components/AgeCheckModal';

import Register from './pages/Register';
import Kontakt from './pages/Kontakt';
import Datenschutz from './pages/Datenschutz';
import Impressum from './pages/Impressum';
import RegisterOverlay from './components/RegisterOverlay';
import Scoreboard from './pages/Scoreboard';
import BoosterModal from './components/BoosterModal';
import { boosterService, Booster } from './services/boosterService';
import { pointsService } from './services/pointsService';
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
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
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

  // Fetch current points from backend when component loads
  useEffect(() => {
    const fetchCurrentPoints = async () => {
      try {
        setIsLoadingPoints(true);
        const currentPoints = await pointsService.getCurrentPoints();
        setAtzencoins(currentPoints);
        console.log('Fetched current points from backend:', currentPoints);
      } catch (error) {
        console.error('Failed to fetch current points:', error);
        // Keep default value of 0 if fetch fails
      } finally {
        setIsLoadingPoints(false);
      }
    };

    fetchCurrentPoints();
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

  // Don't render the main app until points are loaded
  if (isLoadingPoints) {
    return (
      <div className="mobile-container" style={{ 
        position: 'relative', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BG_COLOR
      }}>
        <div style={{ 
          color: GREEN, 
          fontFamily: 'Montserrat, monospace', 
          fontWeight: 700, 
          fontSize: 24 
        }}>
          Loading...
        </div>
      </div>
    );
  }

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
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
