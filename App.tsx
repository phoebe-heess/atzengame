import React, { useState, useRef, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { biconomyService } from './services/BiconomyService';
import { PlusOne, Point } from './types';

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

  const wheelRef = useRef<HTMLDivElement>(null);
  const lastPoint = useRef<Point | null>(null);
  const plusOneCounter = useRef(0);
  const lastRotation = useRef(0);

  const maxPoints = 48;
  const progress = Math.max(0, Math.min(1, atzencoins / maxPoints));

  useEffect(() => {
    const dsgvoAccepted = localStorage.getItem('dsgvoAccepted');
    if (dsgvoAccepted === 'true') {
      setShowAgeCheck(false);
    }
  }, []);

  const handleAgeConfirm = () => {
    setIsFlipped(true);
  };

  const handleDSGVOAccept = () => {
    localStorage.setItem('dsgvoAccepted', 'true');
    setShowAgeCheck(false);
  };

  const connectWallet = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const connectedAddress = await biconomyService.connectWallet();
      const wallet = await biconomyService.initializeSmartAccount(connectedAddress);
      setWalletAddress(wallet.address);
      setAtzencoins(wallet.balance.atzencoins);
      setLoadingMessage('Wallet connected successfully!');
      setTimeout(() => setLoadingMessage(''), 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const syncPointsToBlockchain = async () => {
    if (!walletAddress || !hasUnsyncedPoints) return;
    
    try {
      setLoadingMessage('Syncing points to blockchain...');
      const tx = await biconomyService.addPoints(walletAddress, localPoints);
      await tx.wait();
      setLocalPoints(0);
      setHasUnsyncedPoints(false);
      setLoadingMessage('Points synced successfully!');
      setTimeout(() => setLoadingMessage(''), 2000);
    } catch (error) {
      setError('Failed to sync points to blockchain');
      setLoadingMessage('');
    }
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

  const renderGamePage = () => (
    <div className="page">
      <div className="atzencoin-counter">{atzencoins}</div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {!walletAddress && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <input
            type="email"
            placeholder="Enter email to connect wallet"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '80%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
          <br />
          <button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      )}

      {walletAddress && (
        <div style={{ textAlign: 'center', margin: '10px 0', fontSize: '12px' }}>
          <div>Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
          {hasUnsyncedPoints && (
            <button onClick={syncPointsToBlockchain} className="btn" style={{ fontSize: '12px', padding: '5px 10px' }}>
              Sync {localPoints} Points to Blockchain
            </button>
          )}
        </div>
      )}

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
      
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
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
            transform: `rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          <div className="wheel">
            <div className="wheel-center">
              ATZEN WIN
            </div>
          </div>
        </div>
      </div>

      {plusOnes.map(plusOne => (
        <div
          key={plusOne.id}
          className="plus-one"
          style={{
            left: plusOne.x,
            top: plusOne.y,
            animation: 'fadeUp 1s ease-out forwards'
          }}
        >
          +1
        </div>
      ))}

      <style>{`
        @keyframes fadeUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-50px); }
        }
      `}</style>
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
          onClick={connectWallet}
          disabled={isConnecting}
          className="btn"
        >
          {isConnecting ? 'Connecting Wallet...' : 'Connect Blockchain Wallet'}
        </button>
      </div>
    </div>
  );

  if (showAgeCheck) {
    return (
      <div className="mobile-container">
        <div className="age-check-modal">
          <div className="age-check-card">
            <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
              <div className="card-front">
                <h2 style={{ color: '#03855c', marginBottom: '20px' }}>
                  Age Verification
                </h2>
                <p style={{ marginBottom: '30px' }}>
                  You must be 16 years or older to play Atzenwin.
                </p>
                <button className="btn" onClick={handleAgeConfirm}>
                  I am 16 or older
                </button>
              </div>
              <div className="card-back">
                <h2 style={{ color: '#03855c', marginBottom: '20px' }}>
                  Privacy Policy
                </h2>
                <p style={{ marginBottom: '20px', fontSize: '14px' }}>
                  We collect and process your data in accordance with DSGVO regulations. 
                  Your privacy is important to us.
                </p>
                <button className="btn" onClick={handleDSGVOAccept}>
                  Accept & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="mobile-container">
        {currentPage === 'game' && renderGamePage()}
        {currentPage === 'score' && renderScoreboard()}
        {currentPage === 'login' && renderLoginPage()}

        <div className="navigation">
          <button 
            className={`nav-button ${currentPage === 'game' ? 'active' : ''}`}
            onClick={() => setCurrentPage('game')}
          >
            🎮 Game
          </button>
          <button 
            className={`nav-button ${currentPage === 'score' ? 'active' : ''}`}
            onClick={() => setCurrentPage('score')}
          >
            🏆 Score
          </button>
          <button 
            className={`nav-button ${currentPage === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentPage('login')}
          >
            👤 Login
          </button>
        </div>

        {showRegisterOverlay && (
          <div className="overlay">
            <div className="overlay-content">
              <h2 style={{ color: '#03855c', marginBottom: '20px' }}>
                Maximum Points Reached!
              </h2>
              <p style={{ marginBottom: '20px' }}>
                You've earned {maxPoints} Atzencoins! Register to save your progress.
              </p>
              <button 
                className="btn"
                onClick={() => setShowRegisterOverlay(false)}
              >
                Register Now
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowRegisterOverlay(false)}
              >
                Continue Playing
              </button>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
