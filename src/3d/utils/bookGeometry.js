// Book geometry utilities for The Inner Library 3D Bookshelf

// Each book has unique dimensions to look realistic and distinct
export const BOOK_DIMENSIONS_MAP = {
  daily_checkin: { width: 0.55, height: 1.8, depth: 1.2 },
  needs_translator: { width: 0.4, height: 1.5, depth: 0.9 },
  boundary_scripts: { width: 0.65, height: 2.0, depth: 1.4 },
  cognitive_reframe: { width: 0.5, height: 1.6, depth: 1.1 },
  evidence_shelf: { width: 0.45, height: 1.4, depth: 0.85 },
  character_notes: { width: 0.6, height: 1.9, depth: 1.3 },
  younger_self: { width: 0.5, height: 1.7, depth: 1.0 },
  session_prep: { width: 0.55, height: 1.6, depth: 1.15 },
};

// Default dimensions
export const BOOK_DIMENSIONS = {
  width: 0.55,
  height: 1.8,
  depth: 1.2,
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
  
  // Calculate cumulative width for snug packing
  let xOffset = 0;
  for (let i = 0; i < posInShelf; i++) {
    const dims = getBookDimensionsById(booksOnShelf[i]?.id);
    xOffset += (dims?.width || 0.55) + 0.04; // small gap between books
  }
  
  const shelfY = -shelfIndex * SHELF_DIMENSIONS.shelfGap;
  const totalBooksWidth = booksOnShelf.reduce((sum, b) => {
    const dims = getBookDimensionsById(b?.id);
    return sum + (dims?.width || 0.55) + 0.04;
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
    tall: { width: 0.6, height: 2.0, depth: 1.3 },
    medium: { width: 0.55, height: 1.7, depth: 1.1 },
    short: { width: 0.45, height: 1.4, depth: 0.9 },
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
