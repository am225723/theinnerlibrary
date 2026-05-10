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

// Each book has unique dimensions
export const BOOK_DIMENSIONS_MAP = {
  daily_checkin:    { thickness: 0.55, height: 1.05, depth: 0.72 },
  needs_translator: { thickness: 0.40, height: 0.88, depth: 0.54 },
  boundary_scripts: { thickness: 0.65, height: 1.15, depth: 0.84 },
  cognitive_reframe:{ thickness: 0.50, height: 0.92, depth: 0.66 },
  evidence_shelf:   { thickness: 0.38, height: 0.82, depth: 0.51 },
  character_notes:  { thickness: 0.60, height: 1.10, depth: 0.78 },
  younger_self:     { thickness: 0.48, height: 0.98, depth: 0.60 },
  session_prep:     { thickness: 0.55, height: 0.92, depth: 0.69 },
};

// Default dimensions
export const BOOK_DIMENSIONS = {
  thickness: 0.55,
  height: 1.05,
  depth: 0.72,
  spineRadius: 0.05,
  coverThickness: 0.03,
  pageThickness: 0.001,
  pageCount: 200,
};

// Shelf dimensions - two shelves, 4 books each
export const SHELF_DIMENSIONS = {
  width: 8.5,
  depth: 1.8,
  height: 0.12,
  shelfGap: 2.6,
  booksPerShelf: 4,
};

// Get book dimensions by ID
export const getBookDimensionsById = (bookId) => {
  return BOOK_DIMENSIONS_MAP[bookId] || BOOK_DIMENSIONS;
};

// Calculate book position on shelf - snug side by side
export const calculateBookPosition = (index, shelfIndex, books) => {
  const booksOnShelf = books.slice(shelfIndex * SHELF_DIMENSIONS.booksPerShelf, (shelfIndex + 1) * SHELF_DIMENSIONS.booksPerShelf);
  const posInShelf = index % SHELF_DIMENSIONS.booksPerShelf;
  
  // Calculate cumulative thickness (X axis = shelf spacing) for snug packing
  let xOffset = 0;
  for (let i = 0; i < posInShelf; i++) {
    const dims = getBookDimensionsById(booksOnShelf[i]?.id);
    xOffset += (dims?.thickness || 0.55) + 0.04;
  }
  
  const shelfY = -shelfIndex * SHELF_DIMENSIONS.shelfGap;
  const totalBooksWidth = booksOnShelf.reduce((sum, b) => {
    const dims = getBookDimensionsById(b?.id);
    return sum + (dims?.thickness || 0.55) + 0.04;
  }, -0.04);
  
  const startX = -totalBooksWidth / 2;
  
  return {
    x: startX + xOffset,
    y: shelfY,
    z: 0,
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
