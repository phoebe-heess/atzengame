import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseSwipeDownOptions {
  onSwipeDown?: () => void;
  threshold?: number;
}

export const useSwipeDown = (options: UseSwipeDownOptions = {}) => {
  const { onSwipeDown, threshold = 50 } = options;
  const navigate = useNavigate();
  const startY = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === null) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    
    // Only allow downward swipe
    if (deltaY > 0) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (startY.current === null || startTime.current === null) return;
    
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - startY.current;
    const deltaTime = Date.now() - startTime.current;
    
    // Check if it's a downward swipe with enough distance and reasonable speed
    if (deltaY > threshold && deltaTime < 500) {
      if (onSwipeDown) {
        onSwipeDown();
      } else {
        navigate('/');
      }
    }
    
    startY.current = null;
    startTime.current = null;
  }, [threshold, onSwipeDown, navigate]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}; 