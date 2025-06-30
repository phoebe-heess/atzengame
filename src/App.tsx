import React, { useState, useRef, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgeCheckModal from './components/AgeCheckModal';
import Kontakt from './pages/Kontakt';
import Datenschutz from './pages/Datenschutz';
import Impressum from './pages/Impressum';
import { biconomyService } from './services/BiconomyService';
import { PlusOne, Point } from './types';
import atzengoldLogo from './assets/atzengold-logo.png';
import chainTurn from './assets/chain_turn.png';
import RegisterOverlay from './components/RegisterOverlay';
import BurgerMenu from './components/BurgerMenu';
import { motion, AnimatePresence } from 'framer-motion';

const ORANGE = '#d69229';

const App: React.FC = () => {
  // FORCE age check modal for testing
  const [showAgeCheck, setShowAgeCheck] = useState(true);

  const handleAgeCheckConfirm = (allowed: boolean) => {
    if (allowed) {
      localStorage.setItem('ageChecked', 'true');
      localStorage.setItem('dsgvoAccepted', 'true');
      setShowAgeCheck(false);
    }
  };

  if (showAgeCheck) {
    return (
      <div className="app-container">
        <div className="mobile-container">
          <AgeCheckModal onConfirm={handleAgeCheckConfirm} />
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="app-container">
        <div className="mobile-container" style={{ position: 'relative' }}>
          <Router>
            <Routes>
              <Route path="/game/:code" element={<GamePage />} />
              <Route path="/game" element={<GamePage />} />
              <Route path="/kontakt" element={<Kontakt />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/" element={<GamePage />} />
            </Routes>
          </Router>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

// --- GamePage component ---
export function GamePage() {
  const [atzencoins, setAtzencoins] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [plusOnes, setPlusOnes] = useState<PlusOne[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showRegisterOverlay, setShowRegisterOverlay] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [registerOverlayDismissed, setRegisterOverlayDismissed] = useState(() => {
    return localStorage.getItem('registerOverlayDismissed') === 'true';
  });
  const wheelRef = useRef<HTMLDivElement>(null);
  const lastPoint = useRef<Point | null>(null);
  const plusOneCounter = useRef(0);
  const lastRotation = useRef(0);
  const maxPoints = 560;
  const progress = Math.max(0, Math.min(1, atzencoins / maxPoints));
  // --- Hour tracking for +1s ---
  const lastHour = React.useRef<number | null>(null);
  const WHEEL_SIZE = 400; // px
  const WHEEL_RADIUS = WHEEL_SIZE / 2;
  const WHEEL_CENTER = { x: WHEEL_RADIUS, y: WHEEL_RADIUS };
  const wheelMargin = 200;
  const barMargin = 8;

  // +1 animation logic for hour positions
  const addPlusOneAtHour = (hour: number) => {
    // hour: 0 = 12, 1 = 1, ..., 11 = 11
    const angleDeg = (hour * 30) - 90; // 0h = -90deg (top)
    const angleRad = (angleDeg * Math.PI) / 180;
    const rimRadius = WHEEL_RADIUS * 0.92; // slightly inside the rim
    const x = WHEEL_CENTER.x + rimRadius * Math.cos(angleRad);
    const y = WHEEL_CENTER.y + rimRadius * Math.sin(angleRad);
    const id = plusOneCounter.current++;
    setPlusOnes(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setPlusOnes(prev => prev.filter(p => p.id !== id));
    }, 2000);
  };

  // Wheel logic (unchanged, but no wallet logic)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastPoint.current = { x: e.clientX, y: e.clientY };
    lastRotation.current = rotation;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !lastPoint.current || !wheelRef.current) return;
    const currentPoint = { x: e.clientX, y: e.clientY };
    const wheelRect = wheelRef.current.getBoundingClientRect();
    const wheelCenter = {
      x: wheelRect.left + wheelRect.width / 2,
      y: wheelRect.top + wheelRect.height / 2,
    };
    const lastAngle = Math.atan2(
      lastPoint.current.y - wheelCenter.y,
      lastPoint.current.x - wheelCenter.x
    );
    const currentAngle = Math.atan2(
      currentPoint.y - wheelCenter.y,
      currentPoint.x - wheelCenter.x
    );
    let angleDiff = currentAngle - lastAngle;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    const newRotation = rotation + (angleDiff * 180) / Math.PI;
    setRotation(newRotation);
    // --- +1 at hour positions ---
    const normalizedRotation = ((newRotation % 360) + 360) % 360;
    const currentHour = Math.floor(((normalizedRotation + 360) % 360) / 30) % 12;
    if (lastHour.current === null || currentHour !== lastHour.current) {
      if (atzencoins < maxPoints) {
        setAtzencoins(prev => Math.min(prev + 1, maxPoints));
        addPlusOneAtHour(currentHour);
        lastRotation.current = newRotation;
      }
      lastHour.current = currentHour;
    }
    lastPoint.current = currentPoint;
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    lastPoint.current = null;
    lastHour.current = null;
    if (atzencoins >= maxPoints) {
      setShowRegisterOverlay(true);
    }
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    lastPoint.current = { x: touch.clientX, y: touch.clientY };
    lastRotation.current = rotation;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !lastPoint.current || !wheelRef.current) return;
    const touch = e.touches[0];
    const currentPoint = { x: touch.clientX, y: touch.clientY };
    const wheelRect = wheelRef.current.getBoundingClientRect();
    const wheelCenter = {
      x: wheelRect.left + wheelRect.width / 2,
      y: wheelRect.top + wheelRect.height / 2,
    };
    const lastAngle = Math.atan2(
      lastPoint.current.y - wheelCenter.y,
      lastPoint.current.x - wheelCenter.x
    );
    const currentAngle = Math.atan2(
      currentPoint.y - wheelCenter.y,
      currentPoint.x - wheelCenter.x
    );
    let angleDiff = currentAngle - lastAngle;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    const newRotation = rotation + (angleDiff * 180) / Math.PI;
    setRotation(newRotation);
    // --- +1 at hour positions ---
    const normalizedRotation = ((newRotation % 360) + 360) % 360;
    const currentHour = Math.floor(((normalizedRotation + 360) % 360) / 30) % 12;
    if (lastHour.current === null || currentHour !== lastHour.current) {
      if (atzencoins < maxPoints) {
        setAtzencoins(prev => Math.min(prev + 1, maxPoints));
        addPlusOneAtHour(currentHour);
        lastRotation.current = newRotation;
      }
      lastHour.current = currentHour;
    }
    lastPoint.current = currentPoint;
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
    lastPoint.current = null;
    lastHour.current = null;
    if (atzencoins >= maxPoints) {
      setShowRegisterOverlay(true);
    }
  };
  const handleRegisterOverlayClose = () => {
    setShowRegisterOverlay(false);
    setRegisterOverlayDismissed(true);
    localStorage.setItem('registerOverlayDismissed', 'true');
  };
  const handleShowLoginRegister = () => {
    setShowLoginOverlay(true);
  };

  return (
    <div className="game-page">
      {/* Atzencoins Counter - copied from Atzenwin */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%', 
        position: 'absolute', 
        top: 16, 
        left: 0, 
        right: 0, 
        zIndex: 100 
      }}>
        <div style={{ 
          background: '#03855c', 
          color: '#EDD1B2', 
          fontFamily: 'Montserrat, monospace', 
          fontWeight: 700, 
          fontSize: 28, 
          borderRadius: 18, 
          padding: '8px 18px', 
          minWidth: 120, 
          height: 56, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '0 2px 8px #0001' 
        }}>
          Atzencoins: {atzencoins}
        </div>
      </div>
      <div className="wheel-section" style={{ marginTop: wheelMargin }}>
        <div
          ref={wheelRef}
          className="wheel-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={chainTurn}
            alt="Chain Turn"
            className="chain-turn"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            }}
          />
          <img
            src={atzengoldLogo}
            alt="Atzengold Logo"
            className="atzengold-logo"
          />
        </div>
      </div>
      {/* Progress Bar - move together with wheel */}
      <div className="progress-bar" style={{ marginTop: barMargin }}>
        <div
          className="progress-fill"
          style={{ width: `${(1 - progress) * 100}%` }}
        />
      </div>
      {/* +1 Animations */}
      <AnimatePresence>
        {plusOnes.map(plusOne => (
          <motion.div
            key={plusOne.id}
            className="plus-one"
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -300, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{
              left: plusOne.x,
              top: plusOne.y,
              color: ORANGE,
              fontSize: 32,
              fontWeight: 'bold',
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            +1
          </motion.div>
        ))}
      </AnimatePresence>
      <BurgerMenu onShowLoginRegister={handleShowLoginRegister} />
      {showRegisterOverlay && !registerOverlayDismissed && (
        <RegisterOverlay
          atzencoins={atzencoins}
          onClose={handleRegisterOverlayClose}
        />
      )}
      {showLoginOverlay && (
        <RegisterOverlay
          atzencoins={atzencoins}
          onClose={() => setShowLoginOverlay(false)}
          mode="menu"
        />
      )}
    </div>
  );
}

export default App;
