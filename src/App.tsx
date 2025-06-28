import React, { useState, useRef, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { biconomyService } from './services/BiconomyService';
import { PlusOne, Point } from './types';
import atzengoldLogo from './assets/atzengold-logo.png';
import chainTurn from './assets/chain_turn.png';
import AgeCheckModal from './components/AgeCheckModal';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Winsite from './pages/Winsite';
import RegisterOverlay from './components/RegisterOverlay';
import BurgerMenu from './components/BurgerMenu';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from './services/auth';

console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

const App: React.FC = () => {
  const [showAgeCheck, setShowAgeCheck] = useState(true);
  const [currentPage, setCurrentPage] = useState('game');
  const [atzencoins, setAtzencoins] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [plusOnes, setPlusOnes] = useState<PlusOne[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showRegisterOverlay, setShowRegisterOverlay] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [localPoints, setLocalPoints] = useState(0);
  const [hasUnsyncedPoints, setHasUnsyncedPoints] = useState(false);
  const [logoSize] = useState(391);
  const [chainSize] = useState(400);
  const [verticalOffset] = useState(2);
  const [registerOverlayDismissed, setRegisterOverlayDismissed] = useState(() => {
    return localStorage.getItem('registerOverlayDismissed') === 'true';
  });

  const wheelRef = useRef<HTMLDivElement>(null);
  const lastPoint = useRef<Point | null>(null);
  const plusOneCounter = useRef(0);
  const lastRotation = useRef(0);

  const maxPoints = 560;
  const progress = Math.max(0, Math.min(1, atzencoins / maxPoints));

  useEffect(() => {
    // DSGVO check
    const dsgvoAccepted = localStorage.getItem('dsgvoAccepted');
    if (dsgvoAccepted === 'true') {
      setShowAgeCheck(false);
    }
    // Background smart wallet creation for logged-in users
    const user = authService.getCurrentUser();
    if (user && !walletAddress) {
      (async () => {
        try {
          setIsConnecting(true);
          const result = await biconomyService.initializeSmartAccount(user.user.email || user.user.id);
          setWalletAddress(result.address);
          setIsConnecting(false);
        } catch (err) {
          setError('Smart wallet initialization failed');
          setIsConnecting(false);
        }
      })();
    }
    // Auto-sync points when maxPoints reached
    if (walletAddress && hasUnsyncedPoints && atzencoins >= maxPoints && localPoints > 0) {
      (async () => {
        try {
          setLoadingMessage('Syncing points to blockchain...');
          await biconomyService.addPoints(walletAddress, localPoints);
          setHasUnsyncedPoints(false);
          setLocalPoints(0);
          setLoadingMessage('Points synced!');
          setTimeout(() => setLoadingMessage(''), 2000);
        } catch (err) {
          setError('Sync failed');
          setLoadingMessage('');
        }
      })();
    }
  }, [walletAddress, hasUnsyncedPoints, atzencoins, maxPoints, localPoints]);

  const handleAgeConfirm = () => {
    setIsFlipped(true);
  };

  const handleDSGVOAccept = () => {
    localStorage.setItem('dsgvoAccepted', 'true');
    setShowAgeCheck(false);
  };

  const addPlusOne = (x: number, y: number) => {
    const id = plusOneCounter.current++;
    setPlusOnes(prev => [...prev, { id, x, y }]);
    
    setTimeout(() => {
      setPlusOnes(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

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

    // Add points for every 90 degrees
    const rotationDiff = Math.abs(newRotation - lastRotation.current);
    if (rotationDiff >= 90 && atzencoins < maxPoints) {
      setAtzencoins(prev => Math.min(prev + 1, maxPoints));
      setLocalPoints(prev => prev + 1);
      setHasUnsyncedPoints(true);
      addPlusOne(currentPoint.x, currentPoint.y);
      lastRotation.current = newRotation;
    }

    lastPoint.current = currentPoint;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    lastPoint.current = null;
    
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

    // Add points for every 90 degrees
    const rotationDiff = Math.abs(newRotation - lastRotation.current);
    if (rotationDiff >= 90 && atzencoins < maxPoints) {
      setAtzencoins(prev => Math.min(prev + 1, maxPoints));
      setLocalPoints(prev => prev + 1);
      setHasUnsyncedPoints(true);
      addPlusOne(currentPoint.x, currentPoint.y);
      lastRotation.current = newRotation;
    }

    lastPoint.current = currentPoint;
  };

  const handleTouchEnd = () => {
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

  useEffect(() => {
    if (atzencoins >= maxPoints && !registerOverlayDismissed) {
      setShowRegisterOverlay(true);
    }
  }, [atzencoins, maxPoints, registerOverlayDismissed]);

  const handleShowLoginRegister = () => {
    setShowRegisterOverlay(true);
    setRegisterOverlayDismissed(false);
    localStorage.removeItem('registerOverlayDismissed');
  };

  const renderGamePage = () => (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', position: 'relative' }}>
      <div className="atzencoin-counter">{atzencoins}</div>
      <div style={{ width: '100%', height: 400, position: 'relative', margin: '30px 0 30px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
          style={{
            position: 'absolute',
            left: '50%',
            top: `calc(50% + ${verticalOffset}px)`,
            transform: 'translate(-50%, -50%)',
            width: chainSize,
            height: chainSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={chainTurn}
            alt="Chain Turn"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: chainSize,
              height: chainSize,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)` ,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              zIndex: 1,
              pointerEvents: 'none',
              objectFit: 'contain',
              aspectRatio: '1/1',
            }}
          />
          <img
            src={atzengoldLogo}
            alt="Atzengold Logo"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: logoSize,
              height: logoSize,
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
              pointerEvents: 'none',
              background: 'none',
              objectFit: 'contain',
              aspectRatio: '1/1',
            }}
          />
        </div>
      </div>
      {/* Progress bar below the wheel */}
      <div className="progress-bar" style={{ marginTop: 0, marginBottom: 20, position: 'relative', width: '90%' }}>
        <div
          className="progress-fill"
          style={{
            width: `${(1 - progress) * 100}%`,
            right: 0,
            left: 'auto',
            position: 'absolute',
            height: '100%',
            backgroundColor: '#03855c',
            borderRadius: '10px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      {/* Wallet connect and sync UI */}
      {error && (
        <div style={{ color: 'red', textAlign: 'center', margin: '10px 0', fontSize: '14px' }}>
          {error}
        </div>
      )}
      {loadingMessage && (
        <div style={{ color: '#03855c', textAlign: 'center', margin: '10px 0', fontSize: '14px' }}>
          {loadingMessage}
        </div>
      )}
      <AnimatePresence>
        {plusOnes.map(plusOne => (
          <motion.div
            key={plusOne.id}
            className="plus-one"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -50 }}
            exit={{ opacity: 0 }}
            style={{
              left: plusOne.x,
              top: plusOne.y,
              position: 'absolute',
              color: '#d69229',
              fontWeight: 'bold',
              fontSize: 32,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            +1
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const renderScoreboard = () => (
    <div className="page scoreboard">
      <h1>Scoreboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{atzencoins}</div>
          <div className="stat-label">Atzencoins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.floor(progress * 100)}%</div>
          <div className="stat-label">Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{localPoints}</div>
          <div className="stat-label">Unsynced Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{walletAddress ? 'Connected' : 'Not Connected'}</div>
          <div className="stat-label">Wallet Status</div>
        </div>
      </div>

      {walletAddress && (
        <div style={{ margin: '20px 0', padding: '15px', backgroundColor: 'rgba(3, 133, 92, 0.1)', borderRadius: '10px' }}>
          <div style={{ fontSize: '14px', color: '#03855c' }}>
            <strong>Wallet Address:</strong><br />
            {walletAddress}
          </div>
        </div>
      )}

      <div className="coming-soon">
        🏆 Collectibles - SOON
      </div>
      
      <div className="coming-soon">
        🥇 Real Gold Rewards - SOON
      </div>
    </div>
  );

  const renderLoginPage = () => (
    <div className="page">
      <h1 style={{ textAlign: 'center', color: '#03855c', marginBottom: '30px' }}>
        Login
      </h1>
      
      <div className="form-group">
        <label>Email</label>
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label>Password</label>
        <input type="password" placeholder="Enter your password" />
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <button className="btn">Login</button>
        <button className="btn btn-secondary">Login with Google</button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={() => {}}
          disabled={true}
          className="btn"
        >
          Connect Blockchain Wallet
        </button>
      </div>
    </div>
  );

  const renderTestPage = () => (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#EDD1B2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 375, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ textAlign: 'center' }}>Test Page: Image Display</h1>
        <div style={{ margin: '20px 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 40, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={atzengoldLogo} alt="Atzengold Logo" style={{ maxWidth: logoSize, maxHeight: logoSize, width: logoSize, height: logoSize, display: 'block', marginBottom: 10, objectFit: 'contain', aspectRatio: '1/1' }} />
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={chainTurn} alt="Chain Turn" style={{ maxWidth: chainSize, maxHeight: chainSize, width: chainSize, height: chainSize, display: 'block', marginBottom: 10, objectFit: 'contain', aspectRatio: '1/1' }} />
          </div>
        </div>
      </div>
    </div>
  );

  if (showAgeCheck) {
    return <AgeCheckModal onConfirm={() => setShowAgeCheck(false)} />;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <Router>
        <Routes>
          <Route path="/game/:code" element={<Winsite />} />
          <Route path="/game" element={<Winsite />} />
          <Route path="/kontakt" element={<div style={{padding: 24}}>Kontakt Seite (Platzhalter)</div>} />
          <Route path="/datenschutz" element={<div style={{padding: 24}}>Datenschutz Seite (Platzhalter)</div>} />
          <Route path="/impressum" element={<div style={{padding: 24}}>Impressum Seite (Platzhalter)</div>} />
          <Route path="/" element={
            <div style={{
              width: '100vw',
              minHeight: '100vh',
              background: '#EDD1B2',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <div className="mobile-container" style={{
                width: 375,
                minHeight: '100vh',
                background: '#EDD1B2',
                boxShadow: '0 0 24px rgba(0,0,0,0.08)',
                borderRadius: 16,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                overflow: 'hidden',
              }}>
                {renderGamePage()}
                <BurgerMenu onShowLoginRegister={handleShowLoginRegister} />
                {showRegisterOverlay && !registerOverlayDismissed && (
                  <RegisterOverlay
                    atzencoins={atzencoins}
                    onClose={handleRegisterOverlayClose}
                  />
                )}
                {/* Mobile container style for mobile look */}
                <style>{`
                  .mobile-container {
                    box-sizing: border-box;
                    max-width: 100vw;
                    margin: 0 auto;
                  }
                `}</style>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
