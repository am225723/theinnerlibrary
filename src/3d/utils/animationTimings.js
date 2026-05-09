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
};

// Animation duration constants (ms)
export const TIMINGS = {
  HOVER_LIFT: 200,
  SELECTION_SLIDE: 400,
  BOOK_OPEN: 600,
  PAGE_FLIP: 300,
  CONTENT_FADE: 200,
  BOOKMARK_SWAY: 3000,
  RETURN_TO_SHELF: 400,
  BREATHING_CYCLE: 3000,
};

// Animation easing presets
export const EASING_PRESETS = {
  HOVER_LIFT: 'easeOutQuad',
  SELECTION_SLIDE: 'easeInOutCubic',
  BOOK_OPEN: 'easeOutBack',
  PAGE_FLIP: 'easeInOutSine',
  CONTENT_FADE: 'easeOutQuad',
  BOOKMARK_SWAY: 'easeInOutSine',
  RETURN_TO_SHELF: 'easeInOutCubic',
};

// Book animation states
export const BOOK_STATES = {
  IDLE: 'idle',
  HOVER: 'hover',
  SELECTED: 'selected',
  CENTERED: 'centered',
  OPENING: 'opening',
  OPEN: 'open',
  CLOSING: 'closing',
  RETURNING: 'returning',
};

// Spring configs for framer-motion/react-spring
export const SPRING_CONFIGS = {
  gentle: { tension: 120, friction: 14, mass: 1 },
  snappy: { tension: 300, friction: 20, mass: 1 },
  slow: { tension: 80, friction: 20, mass: 1 },
  bouncy: { tension: 180, friction: 12, mass: 0.5 },
};

// Framer motion transition presets
export const FRAMER_TRANSITIONS = {
  hover: {
    duration: TIMINGS.HOVER_LIFT / 1000,
    ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
  },
  selection: {
    duration: TIMINGS.SELECTION_SLIDE / 1000,
    ease: [0.645, 0.045, 0.355, 1], // easeInOutCubic
  },
  bookOpen: {
    duration: TIMINGS.BOOK_OPEN / 1000,
    ease: [0.34, 1.56, 0.64, 1], // easeOutBack
  },
  pageFlip: {
    duration: TIMINGS.PAGE_FLIP / 1000,
    ease: [0.37, 0, 0.63, 1], // easeInOutSine
  },
  contentFade: {
    duration: TIMINGS.CONTENT_FADE / 1000,
    ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
  },
  returnShelf: {
    duration: TIMINGS.RETURN_TO_SHELF / 1000,
    ease: [0.645, 0.045, 0.355, 1], // easeInOutCubic
  },
  breathing: {
    duration: TIMINGS.BREATHING_CYCLE / 1000,
    ease: [0.37, 0, 0.63, 1], // easeInOutSine
    repeat: Infinity,
    repeatType: 'reverse',
  },
  bookmarkSway: {
    duration: TIMINGS.BOOKMARK_SWAY / 1000,
    ease: [0.37, 0, 0.63, 1], // easeInOutSine
    repeat: Infinity,
    repeatType: 'reverse',
  },
};
