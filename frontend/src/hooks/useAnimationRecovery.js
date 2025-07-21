import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to handle animation recovery and prevent glitching
 * in card components with flip animations
 */
const useAnimationRecovery = () => {
  const animationStateRef = useRef({
    isAnimating: false,
    animationType: null,
    startTime: null,
    recoveryTimeouts: []
  });

  // Clear all recovery timeouts
  const clearRecoveryTimeouts = useCallback(() => {
    animationStateRef.current.recoveryTimeouts.forEach(clearTimeout);
    animationStateRef.current.recoveryTimeouts = [];
  }, []);

  // Start animation with recovery mechanism
  const startAnimation = useCallback((type, duration = 800) => {
    const state = animationStateRef.current;
    
    // Clear any existing recovery timeouts
    clearRecoveryTimeouts();
    
    // Set animation state
    state.isAnimating = true;
    state.animationType = type;
    state.startTime = Date.now();
    
    // Set up automatic recovery timeout (150% of expected duration)
    const recoveryTimeout = setTimeout(() => {
      if (state.isAnimating && state.animationType === type) {
        console.warn(`Animation recovery triggered for ${type} after ${duration * 1.5}ms`);
        finishAnimation(type);
      }
    }, duration * 1.5);
    
    state.recoveryTimeouts.push(recoveryTimeout);
    
    return () => finishAnimation(type);
  }, [clearRecoveryTimeouts]);

  // Finish animation and clean up
  const finishAnimation = useCallback((type) => {
    const state = animationStateRef.current;
    
    if (state.animationType === type || !type) {
      state.isAnimating = false;
      state.animationType = null;
      state.startTime = null;
      clearRecoveryTimeouts();
    }
  }, [clearRecoveryTimeouts]);

  // Check if currently animating
  const isAnimating = useCallback((type = null) => {
    const state = animationStateRef.current;
    if (type) {
      return state.isAnimating && state.animationType === type;
    }
    return state.isAnimating;
  }, []);

  // Get animation duration elapsed
  const getElapsedTime = useCallback(() => {
    const state = animationStateRef.current;
    if (state.startTime) {
      return Date.now() - state.startTime;
    }
    return 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRecoveryTimeouts();
      animationStateRef.current = {
        isAnimating: false,
        animationType: null,
        startTime: null,
        recoveryTimeouts: []
      };
    };
  }, [clearRecoveryTimeouts]);

  return {
    startAnimation,
    finishAnimation,
    isAnimating,
    getElapsedTime,
    clearRecoveryTimeouts
  };
};

export default useAnimationRecovery;