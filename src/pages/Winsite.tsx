import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import atzengoldLogo from '../assets/atzengold-logo.png';
import chainTurn from '../assets/chain_turn.png';
import RegisterOverlay from '../components/RegisterOverlay';
import BurgerMenu from '../components/BurgerMenu';
import ErrorOverlay from '../components/ErrorOverlay';
import { pointsService } from '../services/pointsService';
import { authService } from '../services/auth';

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
  const [hasClaimedPoints, setHasClaimedPoints] = useState<boolean>(() => {
    return localStorage.getItem('hasClaimedPoints') === 'true';
  });
  const [overlayShownThisSession, setOverlayShownThisSession] = useState<boolean>(false);
  const [errorOverlay, setErrorOverlay] = useState<string | null>(null);
  // const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showClaimOverlay, setShowClaimOverlay] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [sessionPoints, setSessionPoints] = useState<number>(0); // Points earned in current session
  const [lastSpinTime, setLastSpinTime] = useState<number>(0); // Cooldown tracking
  const [isSpinning, setIsSpinning] = useState<boolean>(false); // Prevent multiple spins
  const [claimPoints, setClaimPoints] = useState<number>(0);
  const [showGoldWinOverlay, setShowGoldWinOverlay] = useState<boolean>(false);

  // ===== GOLD WIN SYSTEM (INACTIVE) =====
  // Based on research from atzenwin-clean build
  // TODO: When ready to activate:
  // 1. Set GOLD_WIN_ENABLED = true
  // 2. Create GoldWinOverlay component (similar to RegisterOverlay)
  // 3. Add overlay rendering in JSX with AnimatePresence
  // 4. Add backend service to track gold wins
  // 5. Consider adjusting probabilities for production (currently 33% each)
  const [goldWinResult, setGoldWinResult] = useState<'none' | 'gold' | 'booster' | 'lose'>('none');
  const GOLD_WIN_ENABLED = false; // Set to true to activate gold win system

  const wheelRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef<boolean>(false);
  const startAngleRef = useRef<number | null>(null);
  const startRotationRef = useRef<number>(0);
  const lastPlusOneAngle = useRef<number>(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const plusOneCounter = useRef<number>(0);
  const hasAutoClaimed = useRef<boolean>(false); // Prevent multiple automatic claims
  // POINT SYSTEM CONFIGURATION - EASY REVERT
  const USE_NEW_POINT_SYSTEM = true; // Set to false to revert to old system
  
  const maxPoints = USE_NEW_POINT_SYSTEM ? 560 : 12; // Maximum points per session
  const spinCooldown = 200; // Minimum time between spins (ms) - increased to prevent jumping
  const step = 60; // 60 degrees per step to prevent rapid jumping
  
  // New point system: ~17 points per full turn (560 points ÷ 30 turns ≈ 18.7 points per turn)
  // Award 1 point every ~19.2 degrees (360° ÷ 18.7 ≈ 19.2°)
  const degreesPerPoint = USE_NEW_POINT_SYSTEM ? 19.2 : 60; // Old system used 60° steps
  const progress = Math.max(0, Math.min(1, sessionPoints / maxPoints)); // Use sessionPoints instead of atzencoins

  // Gold win system probabilities (inactive until GOLD_WIN_ENABLED = true)
  const checkGoldWin = () => {
    // Based on atzenwin-clean research: 33.33% chance (1 in 3)
    // For production, consider lowering to 1-5% for rarity
    return GOLD_WIN_ENABLED && Math.random() < 1/3;
  };

  const checkBoosterWin = () => {
    return GOLD_WIN_ENABLED && Math.random() < 1/3;
  };

  // Enhanced gold win trigger logic (from atzenwin-clean research)
  const triggerGoldWinCheck = (rotationAmount: number) => {
    if (!GOLD_WIN_ENABLED || rotationAmount < 300) return; // Must rotate >300 degrees
    
    const outcomes = ['gold', 'booster', 'lose'];
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)] as typeof goldWinResult;
    
    setGoldWinResult(randomOutcome);
    
    if (randomOutcome === 'gold') {
      console.log('🥇 GOLD WIN! (System currently inactive)');
      // Future: setShowGoldWinOverlay(true);
    } else if (randomOutcome === 'booster') {
      console.log('🚀 BOOSTER WIN! (System currently inactive)');
      // Future: show booster overlay
    } else {
      console.log('😞 No win this time (System currently inactive)');
      // Future: show try again overlay
    }
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
      
      // Set session points to maxPoints after successful claim
      setSessionPoints(maxPoints);
      // Don't save to localStorage since we want them to reset on page reload
      
      // Set flag to prevent register overlay from showing again
      setHasClaimedPoints(true);
      localStorage.setItem('hasClaimedPoints', 'true');
      
      // Reset the hasAutoClaimed flag after successful claim
      hasAutoClaimed.current = false;

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
    
    if (USE_NEW_POINT_SYSTEM) {
      // NEW SYSTEM: Track rotation and add points based on degrees rotated
      // Normalize angles to handle 360°/0° boundary crossing
      const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
      const currentAngle = normalizeAngle(newRotation);
      const lastAngle = normalizeAngle(lastPlusOneAngle.current);
      
      // Calculate the shortest rotation difference
      let rotationDiff = currentAngle - lastAngle;
      if (rotationDiff > 180) {
        rotationDiff -= 360;
      } else if (rotationDiff < -180) {
        rotationDiff += 360;
      }
      
      // Only consider positive rotation (forward spinning)
      const absRotationDiff = Math.abs(rotationDiff);
      
      if (absRotationDiff >= degreesPerPoint && sessionPoints < maxPoints) {
        // Add 1 point per degree threshold crossed
        const pointsToAdd = Math.floor(absRotationDiff / degreesPerPoint);
        const actualPointsToAdd = Math.min(pointsToAdd, maxPoints - sessionPoints);
        
        if (actualPointsToAdd > 0) {
          setSessionPoints(prev => prev + actualPointsToAdd);
          
          // Create +1 animations - limit to max 3 at once to prevent spam
          const animationsToShow = Math.min(actualPointsToAdd, 3);
          for (let i = 0; i < animationsToShow; i++) {
            const animAngle = (newRotation + (i * 45)) % 360;
            const angleRad = (animAngle * Math.PI) / 180;
            const rimRadius = 180;
            const animX = centerX + rimRadius * Math.cos(angleRad);
            const animY = centerY + rimRadius * Math.sin(angleRad);
            addPlusOneAtPosition(animX, animY, actualPointsToAdd > 3 ? Math.ceil(actualPointsToAdd / 3) : 1);
          }
          
          // Update the last angle where we awarded points
          lastPlusOneAngle.current = currentAngle - (absRotationDiff % degreesPerPoint);
        }
      }
    } else {
      // OLD SYSTEM: Track rotation and add points based on time, not steps
      const now = Date.now();
      
      // Only add points if enough time has passed and we haven't reached max
      if (now - lastSpinTime >= spinCooldown && sessionPoints < maxPoints) {
        // Add 1 point per spin with cooldown
        setSessionPoints(prev => {
          const newSessionPoints = Math.min(prev + 1, maxPoints);
          return newSessionPoints;
        });
        
        // Create +1 animations around the wheel
        for (let j = 0; j < 4; j++) {
          const angle = (j * 90) + (newRotation % 360);
          const angleRad = (angle * Math.PI) / 180;
          const rimRadius = 180;
          const animX = centerX + rimRadius * Math.cos(angleRad);
          const animY = centerY + rimRadius * Math.sin(angleRad);
          addPlusOneAtPosition(animX, animY, 1);
        }
        
        setLastSpinTime(now);
      }
    }
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    setIsDragging(false);
    lastPoint.current = null;
    
    // Trigger gold win check (inactive until GOLD_WIN_ENABLED = true)
    triggerGoldWinCheck(Math.abs(rotation));
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
    
    if (USE_NEW_POINT_SYSTEM) {
      // NEW SYSTEM: Track rotation and add points based on degrees rotated
      // Normalize angles to handle 360°/0° boundary crossing
      const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
      const currentAngle = normalizeAngle(newRotation);
      const lastAngle = normalizeAngle(lastPlusOneAngle.current);
      
      // Calculate the shortest rotation difference
      let rotationDiff = currentAngle - lastAngle;
      if (rotationDiff > 180) {
        rotationDiff -= 360;
      } else if (rotationDiff < -180) {
        rotationDiff += 360;
      }
      
      // Only consider positive rotation (forward spinning)
      const absRotationDiff = Math.abs(rotationDiff);
      
      if (absRotationDiff >= degreesPerPoint && sessionPoints < maxPoints) {
        // Add 1 point per degree threshold crossed
        const pointsToAdd = Math.floor(absRotationDiff / degreesPerPoint);
        const actualPointsToAdd = Math.min(pointsToAdd, maxPoints - sessionPoints);
        
        if (actualPointsToAdd > 0) {
          setSessionPoints(prev => prev + actualPointsToAdd);
          
          // Create +1 animations - limit to max 3 at once to prevent spam
          const animationsToShow = Math.min(actualPointsToAdd, 3);
          for (let i = 0; i < animationsToShow; i++) {
            const animAngle = (newRotation + (i * 45)) % 360;
            const angleRad = (animAngle * Math.PI) / 180;
            const rimRadius = 180;
            const animX = centerX + rimRadius * Math.cos(angleRad);
            const animY = centerY + rimRadius * Math.sin(angleRad);
            addPlusOneAtPosition(animX, animY, actualPointsToAdd > 3 ? Math.ceil(actualPointsToAdd / 3) : 1);
          }
          
          // Update the last angle where we awarded points
          lastPlusOneAngle.current = currentAngle - (absRotationDiff % degreesPerPoint);
        }
      }
    } else {
      // OLD SYSTEM: Track rotation and add points based on time, not steps
      const now = Date.now();
      
      // Only add points if enough time has passed and we haven't reached max
      if (now - lastSpinTime >= spinCooldown && sessionPoints < maxPoints) {
        // Add 1 point per spin with cooldown
        setSessionPoints(prev => {
          const newSessionPoints = Math.min(prev + 1, maxPoints);
          return newSessionPoints;
        });
        
        // Create +1 animations around the wheel
        for (let j = 0; j < 4; j++) {
          const angle = (j * 90) + (newRotation % 360);
          const angleRad = (angle * Math.PI) / 180;
          const rimRadius = 180;
          const animX = centerX + rimRadius * Math.cos(angleRad);
          const animY = centerY + rimRadius * Math.sin(angleRad);
          addPlusOneAtPosition(animX, animY, 1);
        }
        
        setLastSpinTime(now);
      }
    }
  };

  const handleTouchEnd = () => {
    isMouseDown.current = false;
    setIsDragging(false);
    lastPoint.current = null;
    
    // Trigger gold win check (inactive until GOLD_WIN_ENABLED = true)
    triggerGoldWinCheck(Math.abs(rotation));
  };

  const handleRegisterOverlayClose = () => {
    setShowRegisterOverlay(false);
    setRegisterOverlayDismissed(true);
    localStorage.setItem('registerOverlayDismissed', 'true');
  };

  // Function to refresh scoreboard with latest points from backend
  const refreshScoreboard = async () => {
    try {
      console.log('🔄 Refreshing scoreboard with latest points from backend');
      const currentPoints = await pointsService.getCurrentPoints();
      console.log('📊 Backend points:', currentPoints, 'Current atzencoins:', atzencoins);
      
      if (currentPoints !== atzencoins) {
        setAtzencoins(currentPoints);
        console.log('✅ Scoreboard updated to:', currentPoints);
      } else {
        console.log('ℹ️ Scoreboard already up to date');
      }
    } catch (error) {
      console.error('❌ Failed to refresh scoreboard:', error);
    }
  };

  // New handler for successful registration - this should be called by the register component
  const handleSuccessfulRegistration = async () => {
    console.log('🎉 User successfully registered, claiming session points:', sessionPoints);
    
    // Always claim points when registration is successful
    if (sessionPoints > 0) {
      console.log('🎯 Claiming points after successful registration');
      await handleClaim();
      console.log('✅ Points claimed successfully, session points remain at:', sessionPoints);
    } else {
      console.log('⚠️ No session points to claim');
    }
    
    // Refresh scoreboard to show latest cumulative points
    await refreshScoreboard();
  };

  const handleShowLoginRegister = () => {
    setShowLoginOverlay(true);
  };

  // Check authentication status independently (can happen at any time)
  // Handle session completion (when user reaches 12 points)
  useEffect(() => {
    console.log('🔍 Session points:', sessionPoints, 'Max points:', maxPoints, 'Overlay shown this session:', overlayShownThisSession);
    
    if (sessionPoints >= maxPoints && !overlayShownThisSession) {
      console.log('🎯 Session full, checking authentication');
      
      const checkAuthAndHandle = async () => {
        try {
          const authStatus = await authService.checkAuthStatus();
          console.log('🔍 Auth status:', authStatus);
          
          if (authStatus.authenticated) {
            // User is authenticated, add session points to their account
            console.log('🎯 User authenticated, adding session points to account');
            handleClaim();
          } else {
            // User not authenticated, show register overlay
            console.log('🎯 User not authenticated, showing register overlay');
            setShowRegisterOverlay(true);
            setOverlayShownThisSession(true);
            localStorage.setItem('overlayShownThisSession', 'true');
          }
        } catch (error) {
          console.error('❌ Error checking auth status:', error);
          // Fallback to showing overlay if auth check fails
          console.log('🎯 Auth check failed, showing register overlay');
          setShowRegisterOverlay(true);
          setOverlayShownThisSession(true);
            localStorage.setItem('overlayShownThisSession', 'true');
        }
      };
      
      checkAuthAndHandle();
    } else if (sessionPoints >= maxPoints) {
      console.log('⚠️ Session full but overlay already shown this session');
    } else {
      console.log('ℹ️ Session not full yet');
    }
  }, [sessionPoints, maxPoints, overlayShownThisSession]);

  // Reset register overlay dismissed flag when session resets
  useEffect(() => {
    if (sessionPoints === 0 && registerOverlayDismissed) {
      console.log('🔄 Session reset, clearing register overlay dismissed flag');
      setRegisterOverlayDismissed(false);
      localStorage.removeItem('registerOverlayDismissed');
    }
  }, [sessionPoints, registerOverlayDismissed]);

  // Debug overlay state changes
  useEffect(() => {
    console.log('🔍 Overlay state changed - showRegisterOverlay:', showRegisterOverlay, 'showLoginOverlay:', showLoginOverlay, 'registerOverlayDismissed:', registerOverlayDismissed);
  }, [showRegisterOverlay, showLoginOverlay, registerOverlayDismissed]);
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
        
        // Only update total points (atzencoins) from backend, don't affect session points
        if (currentPoints !== atzencoins) {
          console.log('✅ Updating atzencoins from', atzencoins, 'to', currentPoints);
          setAtzencoins(currentPoints);
        } else {
          console.log('ℹ️ Points are the same, no update needed');
        }
        
        // Session points should remain independent and not be affected by backend fetch
      } catch (error) {
        console.error('❌ Failed to fetch latest points:', error);
      }
    };

    fetchLatestPoints();
  }, []); // Empty dependency array means this runs once when component mounts

  // Function to start a new session (called when QR code is scanned)
  const startNewSession = () => {
    setSessionPoints(0);
    localStorage.removeItem('sessionPoints');
    setRegisterOverlayDismissed(false);
    localStorage.removeItem('registerOverlayDismissed');
    setHasClaimedPoints(false);
    localStorage.removeItem('hasClaimedPoints');
    setOverlayShownThisSession(false);
    localStorage.removeItem('overlayShownThisSession');
    hasAutoClaimed.current = false;
    
    // Also reset age check for a complete fresh start
    localStorage.removeItem('ageChecked');
    localStorage.removeItem('dsgvoAccepted');
    
    console.log('🔄 Starting new session - all localStorage cleared');
  };

  // Expose startNewSession function globally so it can be called from QR scanner
  useEffect(() => {
    (window as any).startNewSession = startNewSession;
    return () => {
      delete (window as any).startNewSession;
    };
  }, []);

  // Don't save session points to localStorage - they should reset on page reload

  // Handle Google OAuth popup success
  useEffect(() => {
    // Check for oauth=success URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('oauth') === 'success') {
      console.log('🎯 Google OAuth success detected via URL parameter');
      
      // Always refresh scoreboard when user logs in
      refreshScoreboard();
      
      // Dismiss all overlays since user is now logged in
      console.log('🎯 Dismissing all overlays after successful login');
      console.log('🎯 Before dismissal - showRegisterOverlay:', showRegisterOverlay, 'showLoginOverlay:', showLoginOverlay);
      
      setShowRegisterOverlay(false);
      setShowLoginOverlay(false);
      setRegisterOverlayDismissed(true);
      localStorage.setItem('registerOverlayDismissed', 'true');
      setOverlayShownThisSession(true);
      localStorage.setItem('overlayShownThisSession', 'true');
      
      // Force a re-render by updating state
      setTimeout(() => {
        console.log('🎯 After timeout - setting overlays to false');
        setShowRegisterOverlay(false);
        setShowLoginOverlay(false);
      }, 100);
      
      // If there are session points, claim them
      if (sessionPoints > 0) {
        console.log('🎯 Claiming session points:', sessionPoints);
        setHasClaimedPoints(true);
        localStorage.setItem('hasClaimedPoints', 'true');
        setIsClaiming(true);
        handleClaim();
      }
      
      // Clean up the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    const handleOAuthSuccess = (event: MessageEvent) => {
      console.log('🎯 Received message event:', event.data, 'from:', event.origin);
      if (event.data === 'oauth-success') {
        console.log('🎯 Google OAuth popup success detected');
        
        // Always refresh scoreboard when user logs in
        refreshScoreboard();
        
        // Dismiss all overlays since user is now logged in
        console.log('🎯 Dismissing all overlays after successful login');
        console.log('🎯 Before dismissal - showRegisterOverlay:', showRegisterOverlay, 'showLoginOverlay:', showLoginOverlay);
        
        setShowRegisterOverlay(false);
        setShowLoginOverlay(false);
        setRegisterOverlayDismissed(true);
        localStorage.setItem('registerOverlayDismissed', 'true');
        setOverlayShownThisSession(true);
        localStorage.setItem('overlayShownThisSession', 'true');
        
        // Force a re-render by updating state
        setTimeout(() => {
          console.log('🎯 After timeout - setting overlays to false');
          setShowRegisterOverlay(false);
          setShowLoginOverlay(false);
        }, 100);
        
        // If there are session points, claim them
        if (sessionPoints > 0) {
          console.log('🎯 Claiming session points:', sessionPoints);
          setHasClaimedPoints(true);
          localStorage.setItem('hasClaimedPoints', 'true');
          setIsClaiming(true);
          handleClaim();
        }
      }
    };

    window.addEventListener('message', handleOAuthSuccess);
    return () => window.removeEventListener('message', handleOAuthSuccess);
  }, [sessionPoints]);

  // Fallback: Periodically check if user is authenticated when overlay is shown
  useEffect(() => {
    let authCheckInterval: NodeJS.Timeout | null = null;
    if (showRegisterOverlay || showLoginOverlay) {
      authCheckInterval = setInterval(async () => {
        try {
          const authStatus = await authService.checkAuthStatus();
          if (authStatus.authenticated) {
            console.log('🎯 User authenticated via periodic check, dismissing overlays');
            setShowRegisterOverlay(false);
            setShowLoginOverlay(false);
            setRegisterOverlayDismissed(true);
            localStorage.setItem('registerOverlayDismissed', 'true');
            setOverlayShownThisSession(true);
            localStorage.setItem('overlayShownThisSession', 'true');
            refreshScoreboard();
            
            if (sessionPoints > 0) {
              setHasClaimedPoints(true);
              localStorage.setItem('hasClaimedPoints', 'true');
              setIsClaiming(true);
              handleClaim();
            }
          }
        } catch (error) {
          console.error('❌ Error checking auth status:', error);
        }
      }, 2000); // Check every 2 seconds
    }
    
    return () => {
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
      }
    };
  }, [showRegisterOverlay, showLoginOverlay, sessionPoints]);

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
              position: 'absolute',
              left: `${plusOne.x}px`,
              top: `${plusOne.y}px`,
              color: ORANGE,
              fontSize: 32,
              fontWeight: 'bold',
              pointerEvents: 'none',
              zIndex: 10,
              transform: 'translate(-50%, -50%)',
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
          atzencoins={sessionPoints}
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

      {/* GOLD WIN OVERLAY (INACTIVE) - TODO: Implement when GOLD_WIN_ENABLED = true */}
      {/* 
      {showGoldWinOverlay && GOLD_WIN_ENABLED && (
        <GoldWinOverlay
          result={goldWinResult}
          onClose={() => setShowGoldWinOverlay(false)}
        />
      )}
      */}

      {errorOverlay && (
        <ErrorOverlay message={errorOverlay} onClose={() => setErrorOverlay(null)} />
      )}
    </div>
  );
} 