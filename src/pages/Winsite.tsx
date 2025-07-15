import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import atzengoldLogo from '../assets/atzengold-logo.png';
import chainTurn from '../assets/chain_turn.png';
import RegisterOverlay from '../components/RegisterOverlay';
import BurgerMenu from '../components/BurgerMenu';
import ErrorOverlay from '../components/ErrorOverlay';
import { API_URL } from '../services/auth';

const ORANGE = '#d69229';
const GREEN = '#03855c';

type PlusOne = { id: number; x: number; y: number };

interface WinsiteProps {
  atzencoins: number;
  setAtzencoins: React.Dispatch<React.SetStateAction<number>>;
}

export default function Winsite({ atzencoins, setAtzencoins }: WinsiteProps) {
  const [rotation, setRotation] = useState<number>(0);
  const [plusOnes, setPlusOnes] = useState<PlusOne[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showRegisterOverlay, setShowRegisterOverlay] = useState<boolean>(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState<boolean>(false);
  const [registerOverlayDismissed, setRegisterOverlayDismissed] = useState<boolean>(() => {
    return localStorage.getItem('registerOverlayDismissed') === 'true';
  });
  const [errorOverlay, setErrorOverlay] = useState<string | null>(null);
  const [showClaimOverlay, setShowClaimOverlay] = useState<boolean>(false);
  const [claimPoints, setClaimPoints] = useState<number>(0);
  const [showGoldWinOverlay, setShowGoldWinOverlay] = useState<boolean>(false);
  
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const plusOneCounter = useRef<number>(0);
  const lastPlusOneAngle = useRef<number>(0);
  const startAngleRef = useRef<number | null>(null);
  const startRotationRef = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  
  const maxPoints = 12;
  const progress = Math.max(0, Math.min(1, atzencoins / maxPoints));
  const pointsPerSpin = 12;
  const step = 90; // 90 degrees per step

  // Gold and booster probability (1 in 12 for testing)
  const checkGoldWin = () => {
    return Math.random() < 1/12;
  };

  const checkBoosterWin = () => {
    return Math.random() < 1/12;
  };

  const addPlusOneAtPosition = (x: number, y: number, count: number = 1) => {
    for (let i = 0; i < count; i++) {
      const id = plusOneCounter.current++;
      setPlusOnes(prev => [...prev, { id, x, y }]);
      setTimeout(() => {
        setPlusOnes(prev => prev.filter(p => p.id !== id));
      }, 2000);
    }
  };

  const handleClaim = async () => {
    try {
      const response = await fetch(`${API_URL}/push-points`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points: maxPoints }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorOverlay(data.error || 'An error occurred');
        setAtzencoins(0);
        return;
      }

      // Success - show claim overlay with transaction hash
      setClaimPoints(maxPoints);
      setShowClaimOverlay(true);
      setAtzencoins(0);

      // Check for gold win
      if (checkGoldWin()) {
        setShowGoldWinOverlay(true);
      }

    } catch (error) {
      console.error('Push points error:', error);
      setErrorOverlay('Network error. Please try again.');
      setAtzencoins(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is inside the logo area
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const radius = 150; // Logo radius
    if (dx * dx + dy * dy > radius * radius) return;
    
    isMouseDown.current = true;
    setIsDragging(true);
    lastPoint.current = { x: e.clientX, y: e.clientY };
    
    const angle = Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI;
    startAngleRef.current = angle;
    startRotationRef.current = rotation;
    lastPlusOneAngle.current = rotation;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown.current || !wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is inside the logo area
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const radius = 150; // Logo radius
    if (dx * dx + dy * dy > radius * radius) return;
    
    const angle = Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI;
    let delta = angle - (startAngleRef.current ?? 0);
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const newRotation = startRotationRef.current + delta;
    setRotation(newRotation);
    
    // Track 90-degree steps for gradual increment
    const last = lastPlusOneAngle.current;
    const diff = newRotation - last;
    if (Math.abs(diff) >= step) {
      const stepsPassed = Math.floor(Math.abs(diff) / step);
      for (let i = 1; i <= stepsPassed; i++) {
        if (atzencoins < maxPoints) {
          const pointsToAdd = pointsPerSpin / 4; // 3 points per 90° step
          setAtzencoins(prev => Math.min(prev + pointsToAdd, maxPoints));
          
          // Create +1 animations around the wheel
          for (let j = 0; j < 4; j++) {
            const angle = (j * 90) + (newRotation % 360);
            const angleRad = (angle * Math.PI) / 180;
            const rimRadius = 180;
            const animX = centerX + rimRadius * Math.cos(angleRad);
            const animY = centerY + rimRadius * Math.sin(angleRad);
            addPlusOneAtPosition(animX, animY, 1);
          }
        }
      }
      lastPlusOneAngle.current = last + step * stepsPassed * Math.sign(diff);
    }
    
    lastPoint.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    setIsDragging(false);
    lastPoint.current = null;
    if (atzencoins >= maxPoints) {
      setShowRegisterOverlay(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!wheelRef.current) return;
    
    const touch = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check if touch is inside the logo area
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const radius = 150; // Logo radius
    if (dx * dx + dy * dy > radius * radius) return;
    
    isMouseDown.current = true;
    setIsDragging(true);
    lastPoint.current = { x: touch.clientX, y: touch.clientY };
    
    const angle = Math.atan2(touch.clientY - (rect.top + rect.height / 2), touch.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI;
    startAngleRef.current = angle;
    startRotationRef.current = rotation;
    lastPlusOneAngle.current = rotation;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMouseDown.current || !wheelRef.current) return;
    
    const touch = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check if touch is inside the logo area
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const radius = 150; // Logo radius
    if (dx * dx + dy * dy > radius * radius) return;
    
    const angle = Math.atan2(touch.clientY - (rect.top + rect.height / 2), touch.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI;
    let delta = angle - (startAngleRef.current ?? 0);
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const newRotation = startRotationRef.current + delta;
    setRotation(newRotation);
    
    // Track 90-degree steps for gradual increment
    const last = lastPlusOneAngle.current;
    const diff = newRotation - last;
    if (Math.abs(diff) >= step) {
      const stepsPassed = Math.floor(Math.abs(diff) / step);
      for (let i = 1; i <= stepsPassed; i++) {
        if (atzencoins < maxPoints) {
          const pointsToAdd = pointsPerSpin / 4; // 3 points per 90° step
          setAtzencoins(prev => Math.min(prev + pointsToAdd, maxPoints));
          
          // Create +1 animations around the wheel
          for (let j = 0; j < 4; j++) {
            const angle = (j * 90) + (newRotation % 360);
            const angleRad = (angle * Math.PI) / 180;
            const rimRadius = 180;
            const animX = centerX + rimRadius * Math.cos(angleRad);
            const animY = centerY + rimRadius * Math.sin(angleRad);
            addPlusOneAtPosition(animX, animY, 1);
          }
        }
      }
      lastPlusOneAngle.current = last + step * stepsPassed * Math.sign(diff);
    }
    
    lastPoint.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    isMouseDown.current = false;
    setIsDragging(false);
    lastPoint.current = null;
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

  // Handle claim when bar is full
  useEffect(() => {
    if (atzencoins >= maxPoints) {
      // Call backend claim endpoint
      fetch('/api/claim', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'wheel-claim' }),
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok && data.error) {
            setErrorOverlay(data.error);
            // DON'T reset the bar on error - let user see their points
          } else {
            // Success - reset the bar and show success message
            setAtzencoins(0);
            // TODO: Show success overlay with confetti
          }
        })
        .catch(() => {
          setErrorOverlay('Network error. Please try again.');
          // DON'T reset the bar on network error
        });
    }
  }, [atzencoins, maxPoints]);

  // Helper to map backend error to overlay message
  function getOverlayMessage(error: string) {
    if (error === 'Exploit prevention: scanning too fast') {
      return 'Exploit prevention: scanning too fast';
    }
    if (error === 'Error: more than 120 scans per day') {
      return 'Error: more than 120 scans per day';
    }
    return 'An error occurred. Please try again.';
  }

  return (
    <div className="game-page">
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
          background: GREEN, 
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
      <div className="wheel-section" style={{ marginTop: 200 }}>
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
      <div className="progress-bar" style={{ marginTop: 8 }}>
        <div
          className="progress-fill"
          style={{ width: `${(1 - progress) * 100}%` }}
        />
      </div>
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
      {/* Burger Menu */}
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
      {/* Instagram Button */}
      <button
        aria-label="Instagram"
        tabIndex={-1}
        onMouseDown={e => e.preventDefault()}
        onTouchStart={e => e.preventDefault()}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 24,
          background: '#EDD1B2',
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
      {errorOverlay && (
        <ErrorOverlay message={errorOverlay} onClose={() => setErrorOverlay(null)} />
      )}
    </div>
  );
} 