// Animation timing and easing functions for The Inner Library 3D Bookshelf

// Easing functions
export const easings = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInSine: (t) => -Math.cos(t * (Math.PI / 2)) + 1,
  easeOutSine: (t) => Math.sin(t * (Math.PI / 2)),
  easeInOutSine: (t) => -0.5 * (Math.cos(Math.PI * t) - 1),
  easeOutBack: (t) => {
    const s = 1.70158;
    return (t -= 1) * t * ((s + 1) * t + s) + 1;
  },
  easeInBack: (t) => {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
  },
};

// Animation duration constants (ms)
export const TIMINGS = {
  HOVER_LIFT: 180,
  SELECTION_SLIDE: 620,   // book slides forward + rotates 90°
  CENTER_MOVE: 750,       // book glides to screen centre
  BOOK_OPEN: 680,         // cover swings open
  PAGE_FLIP: 380,
  FLIP_PAUSE: 120,
  CONTENT_FADE: 200,
  BOOKMARK_SWAY: 3000,
  RETURN_TO_SHELF: 700,
  BREATHING_CYCLE: 3200,
};

// Book animation states
export const BOOK_STATES = {
  IDLE: 'idle',
  HOVER: 'hover',
  SELECTED: 'selected',
  CENTERED: 'centered',
  FLIPPING: 'flipping',
  OPEN: 'open',
  CLOSING: 'closing',
  RETURNING: 'returning',
};

// Spring configs
export const SPRING_CONFIGS = {
  gentle: { tension: 120, friction: 14, mass: 1 },
  snappy: { tension: 300, friction: 20, mass: 1 },
  slow: { tension: 80, friction: 20, mass: 1 },
  bouncy: { tension: 180, friction: 12, mass: 0.5 },
};
