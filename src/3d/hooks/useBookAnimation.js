// Book animation hook for The Inner Library 3D Bookshelf

import { useState, useRef, useCallback, useEffect } from 'react';
import { BOOK_STATES, TIMINGS, EASING_PRESETS } from '../utils/animationTimings';

export const useBookAnimation = (initialState = BOOK_STATES.IDLE) => {
  const [state, setState] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);
  const timeoutRef = useRef(null);

  // Clear any pending animation
  const clearAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  // Transition to a new state
  const transitionTo = useCallback((newState, callback) => {
    clearAnimation();
    setIsAnimating(true);
    setState(newState);

    // Auto-transition after animation completes
    const duration = getAnimationDuration(state, newState);
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        if (callback) callback();
      }, duration);
    } else {
      setIsAnimating(false);
      if (callback) callback();
    }
  }, [state, clearAnimation]);

  // Get animation duration between states
  const getAnimationDuration = useCallback((fromState, toState) => {
    const transitions = {
      [BOOK_STATES.IDLE]: {
        [BOOK_STATES.HOVER]: TIMINGS.HOVER_LIFT,
        [BOOK_STATES.SELECTED]: TIMINGS.SELECTION_SLIDE,
      },
      [BOOK_STATES.HOVER]: {
        [BOOK_STATES.IDLE]: TIMINGS.HOVER_LIFT,
        [BOOK_STATES.SELECTED]: TIMINGS.SELECTION_SLIDE,
      },
      [BOOK_STATES.SELECTED]: {
        [BOOK_STATES.OPENING]: TIMINGS.BOOK_OPEN,
        [BOOK_STATES.RETURNING]: TIMINGS.RETURN_TO_SHELF,
      },
      [BOOK_STATES.OPENING]: {
        [BOOK_STATES.OPEN]: TIMINGS.CONTENT_FADE,
      },
      [BOOK_STATES.OPEN]: {
        [BOOK_STATES.CLOSING]: TIMINGS.BOOK_OPEN,
      },
      [BOOK_STATES.CLOSING]: {
        [BOOK_STATES.RETURNING]: TIMINGS.RETURN_TO_SHELF,
      },
      [BOOK_STATES.RETURNING]: {
        [BOOK_STATES.IDLE]: TIMINGS.RETURN_TO_SHELF,
      },
    };

    return transitions[fromState]?.[toState] || 0;
  }, []);

  // Hover animation
  const onHover = useCallback(() => {
    if (state === BOOK_STATES.IDLE) {
      transitionTo(BOOK_STATES.HOVER);
    }
  }, [state, transitionTo]);

  const onHoverEnd = useCallback(() => {
    if (state === BOOK_STATES.HOVER) {
      transitionTo(BOOK_STATES.IDLE);
    }
  }, [state, transitionTo]);

  // Select book
  const onSelect = useCallback(() => {
    if (state === BOOK_STATES.IDLE || state === BOOK_STATES.HOVER) {
      transitionTo(BOOK_STATES.SELECTED, () => {
        transitionTo(BOOK_STATES.OPENING, () => {
          transitionTo(BOOK_STATES.OPEN);
        });
      });
    }
  }, [state, transitionTo]);

  // Close book
  const onClose = useCallback(() => {
    if (state === BOOK_STATES.OPEN) {
      transitionTo(BOOK_STATES.CLOSING, () => {
        transitionTo(BOOK_STATES.RETURNING, () => {
          transitionTo(BOOK_STATES.IDLE);
        });
      });
    }
  }, [state, transitionTo]);

  // Reset to idle
  const reset = useCallback(() => {
    clearAnimation();
    setState(BOOK_STATES.IDLE);
    setIsAnimating(false);
  }, [clearAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAnimation();
    };
  }, [clearAnimation]);

  return {
    state,
    isAnimating,
    onHover,
    onHoverEnd,
    onSelect,
    onClose,
    reset,
    transitionTo,
    getAnimationDuration,
  };
};

// Breathing animation hook for idle state
export const useBreathingAnimation = (enabled = true) => {
  const [offset, setOffset] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setOffset(0);
      return;
    }

    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % TIMINGS.BREATHING_CYCLE) / TIMINGS.BREATHING_CYCLE;
      
      // Sine wave breathing: -1 to 1
      const sine = Math.sin(progress * Math.PI * 2);
      setOffset(sine * 0.02); // Small vertical movement

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled]);

  return offset;
};

// Bookmark sway animation hook
export const useBookmarkSway = (hasReminders = false) => {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!hasReminders) {
      setRotation(0);
      return;
    }

    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % TIMINGS.BOOKMARK_SWAY) / TIMINGS.BOOKMARK_SWAY;
      
      // Gentle sway: -3 to 3 degrees
      const sine = Math.sin(progress * Math.PI * 2);
      setRotation(sine * (Math.PI / 60)); // ~3 degrees in radians

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hasReminders]);

  return rotation;
};