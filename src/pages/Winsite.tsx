import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import atzengoldLogo from '../assets/atzengold-logo.png';
import chainTurn from '../assets/chain_turn.png';
import RegisterOverlay from '../components/RegisterOverlay';
import BurgerMenu from '../components/BurgerMenu';
import ErrorOverlay from '../components/ErrorOverlay';
import { pointsService } from '../services/pointsService';

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
  // const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showClaimOverlay, setShowClaimOverlay] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [sessionPoints, setSessionPoints] = useState<number>(0); // Points earned in current session
  const [lastSpinTime, setLastSpinTime] = useState<number>(0); // Cooldown tracking
  const [isSpinning, setIsSpinning] = useState<boolean>(false); // Prevent multiple spins
  const [claimPoints, setClaimPoints] = useState<number>(0);
  const [showGoldWinOverlay, setShowGoldWinOverlay] = useState<boolean>(false);

  const wheelRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef<boolean>(false);
  const startAngleRef = useRef<number | null>(null);
  const startRotationRef = useRef<number>(0);
  const lastPlusOneAngle = useRef<number>(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const plusOneCounter = useRef<number>(0);
  const hasAutoClaimed = useRef<boolean>(false); // Prevent multiple automatic claims
  const maxPoints = 12; // Maximum points per session
  const spinCooldown = 100; // Minimum time between spins (ms)
  const maxSessionPoints = 50; // Maximum points that can be earned in one session
  const pointsPerSpin = 12;
  const step = 30; // 30 degrees per step for smoother increment
  const progress = Math.max(0, Math.min(1, sessionPoints / maxPoints)); // Use sessionPoints instead of atzencoins

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
      setIsClaiming(true);
      console.log('🎯 Starting claim for', sessionPoints, 'points');
      const result = await pointsService.pushPoints(sessionPoints); // Use sessionPoints instead of maxPoints
      
      if (!result.success) {
        console.error('❌ Claim failed:', result.error);
        setErrorOverlay(result.error || 'An error occurred');
        setIsClaiming(false);
        return;
      }

      // Success - update the atzencoins state with the new total from backend
      if (result.points !== undefined) {
        console.log('✅ Claim successful! Updating atzencoins from', atzencoins, 'to', result.points);
        setAtzencoins(result.points);
      }
      
      // Reset session points after successful claim
      console.log('🔄 Resetting session points from', sessionPoints, 'to 0');
      setSessionPoints(0);

    } catch (error) {
      console.error('❌ Push points error:', error);
      setErrorOverlay('Network error. Please try again.');
    } finally {
      setIsClaiming(false);
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
    const deltaAngle = angle - startAngleRef.current!;
    const newRotation = startRotationRef.current + deltaAngle;
    
    setRotation(newRotation);
    
    // Calculate rotation difference for point earning
    const rotationDiff = Math.abs(newRotation - lastPlusOneAngle.current);
    if (rotationDiff >= step) {
      // Check if we haven't reached max points
      if (sessionPoints < maxPoints) {
        // Limit to 1 point per rotation step for smoother increment
        const pointsToAdd = 1;
        const actualPointsToAdd = Math.min(pointsToAdd, maxPoints - sessionPoints);
        
        if (actualPointsToAdd > 0) {
          console.log('🎯 Adding points:', actualPointsToAdd, 'sessionPoints:', sessionPoints, '->', sessionPoints + actualPointsToAdd);
          setSessionPoints(prev => prev + actualPointsToAdd);
          addPlusOneAtPosition(e.clientX, e.clientY, actualPointsToAdd);
          lastPlusOneAngle.current = newRotation;
        }
      }
    }
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    setIsDragging(false);
    lastPoint.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const touch = e.touches[0];
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
    
    const rect = wheelRef.current.getBoundingClientRect();
    const touch = e.touches[0];
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
    const deltaAngle = angle - startAngleRef.current!;
    const newRotation = startRotationRef.current + deltaAngle;
    
    setRotation(newRotation);
    
    // Calculate rotation difference for point earning
    const rotationDiff = Math.abs(newRotation - lastPlusOneAngle.current);
    if (rotationDiff >= step) {
      // Check if we haven't reached max points
      if (sessionPoints < maxPoints) {
        // Limit to 1 point per rotation step for smoother increment
        const pointsToAdd = 1;
        const actualPointsToAdd = Math.min(pointsToAdd, maxPoints - sessionPoints);
        
        if (actualPointsToAdd > 0) {
          console.log('🎯 Adding points (touch):', actualPointsToAdd, 'sessionPoints:', sessionPoints, '->', sessionPoints + actualPointsToAdd);
          setSessionPoints(prev => prev + actualPointsToAdd);
          addPlusOneAtPosition(touch.clientX, touch.clientY, actualPointsToAdd);
          lastPlusOneAngle.current = newRotation;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    isMouseDown.current = false;
    setIsDragging(false);
    lastPoint.current = null;
  };

  const handleRegisterOverlayClose = () => {
    setShowRegisterOverlay(false);
    setRegisterOverlayDismissed(true);
    localStorage.setItem('registerOverlayDismissed', 'true');
  };

  // New handler for successful registration - this should be called by the register component
  const handleSuccessfulRegistration = async () => {
    console.log('🎉 User successfully registered, claiming session points:', sessionPoints);
    if (sessionPoints >= maxPoints && !hasAutoClaimed.current) {
      hasAutoClaimed.current = true; // Prevent multiple claims
      await handleClaim();
    }
  };

  const handleShowLoginRegister = () => {
    setShowLoginOverlay(true);
  };

  // Show register overlay when session is full (important funnel step)
  useEffect(() => {
    console.log('🔍 Checking register overlay trigger:', {
      sessionPoints,
      maxPoints,
      registerOverlayDismissed,
      shouldShow: sessionPoints >= maxPoints && !registerOverlayDismissed
    });
    
    if (sessionPoints >= maxPoints && !registerOverlayDismissed) {
      console.log('🎯 Session full, showing register overlay');
      setShowRegisterOverlay(true);
    }
  }, [sessionPoints, maxPoints, registerOverlayDismissed]);

  // Reset register overlay dismissed flag when session resets
  useEffect(() => {
    if (sessionPoints === 0 && registerOverlayDismissed) {
      console.log('🔄 Session reset, clearing register overlay dismissed flag');
      setRegisterOverlayDismissed(false);
      localStorage.removeItem('registerOverlayDismissed');
    }
  }, [sessionPoints, registerOverlayDismissed]);

  // Remove automatic claim trigger - points should only be claimed after registration
  // useEffect(() => {
  //   if (sessionPoints >= maxPoints && !isClaiming && !hasAutoClaimed.current) {
  //     console.log('🎯 Session full, automatically claiming points');
  //     hasAutoClaimed.current = true; // Prevent multiple claims
  //     handleClaim();
  //   } else if (sessionPoints < maxPoints) {
  //     // Reset the flag when session points drop below max
  //     hasAutoClaimed.current = false;
  //   }
  // }, [sessionPoints, maxPoints, isClaiming]);

  // Fetch latest points from backend when component mounts
  useEffect(() => {
    const fetchLatestPoints = async () => {
      try {
        console.log('🔄 Fetching latest points from backend...');
        const currentPoints = await pointsService.getCurrentPoints();
        console.log('📊 Backend returned points:', currentPoints);
        console.log('📊 Current atzencoins state:', atzencoins);
        
        // Only update if the points are different to avoid unnecessary re-renders
        if (currentPoints !== atzencoins) {
          console.log('✅ Updating atzencoins from', atzencoins, 'to', currentPoints);
          setAtzencoins(currentPoints);
        } else {
          console.log('ℹ️ Points are the same, no update needed');
        }
      } catch (error) {
        console.error('❌ Failed to fetch latest points:', error);
      }
    };

    fetchLatestPoints();
  }, []); // Empty dependency array means this runs once when component mounts

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

  // Debug logging
  console.log('🎮 Rendering Winsite with atzencoins:', atzencoins, 'sessionPoints:', sessionPoints);

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
          Atzencoins: {sessionPoints}
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

      {/* Debug Reset Button - Remove in production */}
      <button
        onClick={() => {
          console.log('🔘 Reset button clicked!');
          setSessionPoints(0);
          setRegisterOverlayDismissed(false);
          localStorage.removeItem('registerOverlayDismissed');
          hasAutoClaimed.current = false;
        }}
        style={{
          position: 'fixed',
          top: 100,
          right: 20,
          background: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: 14,
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          userSelect: 'none',
          minWidth: '120px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ff6666';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ff4444';
        }}
      >
        🔄 Reset Session
      </button>

      {/* {showResetConfirmation && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '20px',
          borderRadius: 10,
          zIndex: 10000,
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          Session Reset!
        </div>
      )} */}

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
          onSuccessfulRegistration={handleSuccessfulRegistration}
        />
      )}
      {showLoginOverlay && (
        <RegisterOverlay
          atzencoins={atzencoins}
          onClose={() => setShowLoginOverlay(false)}
          mode="menu"
        />
      )}

      {errorOverlay && (
        <ErrorOverlay message={errorOverlay} onClose={() => setErrorOverlay(null)} />
      )}
    </div>
  );
} 