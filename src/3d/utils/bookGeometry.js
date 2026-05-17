// Book geometry utilities for The Inner Library 3D Bookshelf
//
// Coordinate system:
//   X = thickness (spine width, what you see on the shelf, ~0.4-0.8)
//   Y = height (tall axis, vertical, ~0.9-1.2)
//   Z = depth (page area, front-to-back, ~0.6-1.0)
//
// On shelf: spine is on the +Z face (narrow, thickness × height)
// Front cover is on the +X face (wide, depth × height)
// When selected: rotate group +π/2 around Y so front cover faces camera

// ── Seeded random for deterministic per-book variation ──────────────────
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h;
}

function seededRandom(seed) {
  // Mulberry32 – fast, decent distribution
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Apply small natural offsets so books don't look uniformly digital.
// Thickness ±5%, Height ±3%, Depth ±4%, spineAngle ±0.01
function vary(base, id) {
  const rng = seededRandom(hashStr(id) * 0x9e3779b9);
  const tOff = (rng() - 0.5) * 2 * base.thickness * 0.05;
  const hOff = (rng() - 0.5) * 2 * base.height   * 0.03;
  const dOff = (rng() - 0.5) * 2 * base.depth     * 0.04;
  const aOff = (rng() - 0.5) * 2 * 0.01;
  return {
    ...base,
    thickness: +(base.thickness + tOff).toFixed(4),
    height:    +(base.height    + hOff).toFixed(4),
    depth:     +(base.depth     + dOff).toFixed(4),
    spineAngle:+(base.spineAngle + aOff).toFixed(4),
  };
}

// Each book has unique base dimensions - thinner, more realistic spines
const BASE_DIMENSIONS = {
  daily_checkin:    { thickness: 0.38, height: 1.08, depth: 0.65, spineAngle: -0.02 },
  needs_translator: { thickness: 0.32, height: 0.95, depth: 0.52, spineAngle: 0.03 },
  boundary_scripts: { thickness: 0.45, height: 1.15, depth: 0.72, spineAngle: -0.01 },
  cognitive_reframe:{ thickness: 0.35, height: 1.00, depth: 0.58, spineAngle: 0.02 },
  evidence_shelf:   { thickness: 0.30, height: 0.88, depth: 0.48, spineAngle: -0.03 },
  character_notes:  { thickness: 0.42, height: 1.12, depth: 0.68, spineAngle: 0.01 },
  younger_self:     { thickness: 0.34, height: 1.02, depth: 0.55, spineAngle: -0.02 },
  session_prep:     { thickness: 0.38, height: 0.98, depth: 0.62, spineAngle: 0.04 },
};

// Public map with deterministic natural variation baked in
export const BOOK_DIMENSIONS_MAP = Object.fromEntries(
  Object.entries(BASE_DIMENSIONS).map(([id, base]) => [id, vary(base, id)])
);

// Default dimensions
export const BOOK_DIMENSIONS = {
  thickness: 0.36,
  height: 1.05,
  depth: 0.62,
  spineRadius: 0.04,
  coverThickness: 0.025,
  pageThickness: 0.001,
  pageCount: 200,
  spineAngle: 0, // Small angle variation for realism
};

// Shelf dimensions - two shelves, 4 books each
export const SHELF_DIMENSIONS = {
  width: 8.5,
  depth: 1.8,
  height: 0.12,
  shelfGap: 2.6,
  booksPerShelf: 4,
};

// Get book dimensions by ID (with natural variation already applied)
export const getBookDimensionsById = (bookId) => {
  if (BOOK_DIMENSIONS_MAP[bookId]) return BOOK_DIMENSIONS_MAP[bookId];
  // Unknown book – vary the default so even fallbacks look natural
  return vary(BOOK_DIMENSIONS, bookId || 'unknown');
};

// Calculate book position on shelf - snug side by side
export const calculateBookPosition = (index, shelfIndex, books) => {
  const booksOnShelf = books.slice(shelfIndex * SHELF_DIMENSIONS.booksPerShelf, (shelfIndex + 1) * SHELF_DIMENSIONS.booksPerShelf);
  const posInShelf = index % SHELF_DIMENSIONS.booksPerShelf;

  // Calculate cumulative thickness (X axis = shelf spacing) for snug packing
  let xOffset = 0;
  for (let i = 0; i < posInShelf; i++) {
    const dims = getBookDimensionsById(booksOnShelf[i]?.id);
    xOffset += (dims?.thickness || 0.36) + 0.03;
  }

  const shelfY = -shelfIndex * SHELF_DIMENSIONS.shelfGap;
  const totalBooksWidth = booksOnShelf.reduce((sum, b) => {
    const dims = getBookDimensionsById(b?.id);
    return sum + (dims?.thickness || 0.36) + 0.03;
  }, -0.03);

  const startX = -totalBooksWidth / 2;
  const bookDims = getBookDimensionsById(booksOnShelf[posInShelf]?.id);

  return {
    x: startX + xOffset,
    y: shelfY,
    z: 0,
    rotation: bookDims?.spineAngle || 0,
  };
};

// Get book dimensions by position type (legacy support)
export const getBookDimensions = (positionType) => {
  const positions = {
    tall: { thickness: 0.65, height: 1.15, depth: 0.84 },
    medium: { thickness: 0.50, height: 0.98, depth: 0.66 },
    short: { thickness: 0.38, height: 0.82, depth: 0.51 },
  };
  return positions[positionType] || positions.medium;
};

// Camera positions
export const CAMERA_POSITIONS = {
  library: { x: 0, y: -0.5, z: 7 },
  bookSelected: { x: 0, y: 0, z: 4 },
  bookOpen: { x: 0, y: 0, z: 3.5 },
};

// Camera targets
export const CAMERA_TARGETS = {
  library: { x: 0, y: -0.5, z: 0 },
  bookSelected: { x: 0, y: 0, z: 0 },
  bookOpen: { x: 0, y: 0, z: 0 },
};

// Shadow properties
export const SHADOW_PROPS = {
  mapSize: 2048,
  camera: {
    left: -10,
    right: 10,
    top: 10,
    bottom: -10,
    near: 0.5,
    far: 20,
  },
  bias: -0.0001,
  normalBias: 0.02,
};
