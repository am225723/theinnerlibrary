// Book geometry utilities for The Inner Library 3D Bookshelf

// Book dimensions (in Three.js units, scaled for visual balance)
export const BOOK_DIMENSIONS = {
  width: 0.8,        // spine width
  height: 2.4,       // book height
  depth: 1.6,        // book depth when closed
  spineRadius: 0.05, // rounded spine
  coverThickness: 0.02,
  pageThickness: 0.001,
  pageCount: 200,
};

// Book position presets (tall, medium, short)
export const BOOK_POSITIONS = {
  tall: { height: 2.4, spineWidth: 0.8 },
  medium: { height: 2.0, spineWidth: 0.9 },
  short: { height: 1.6, spineWidth: 0.85 },
};

// Shelf dimensions
export const SHELF_DIMENSIONS = {
  width: 12,
  depth: 2,
  height: 0.15,
  shelfGap: 2.8, // vertical space between shelves
  booksPerShelf: 4,
};

// Calculate book position on shelf
export const calculateBookPosition = (index, shelfIndex, totalBooks) => {
  const booksPerShelf = SHELF_DIMENSIONS.booksPerShelf;
  const shelfWidth = SHELF_DIMENSIONS.width;
  const bookSpacing = shelfWidth / booksPerShelf;
  
  const shelfY = -shelfIndex * SHELF_DIMENSIONS.shelfGap;
  const bookX = -shelfWidth / 2 + (index % booksPerShelf) * bookSpacing + bookSpacing / 2;
  const bookZ = 0;
  
  return { x: bookX, y: shelfY, z: bookZ };
};

// Get book dimensions by position type
export const getBookDimensions = (positionType) => {
  return BOOK_POSITIONS[positionType] || BOOK_POSITIONS.medium;
};

// Calculate book cover vertices for rounded spine
export const createBookCoverGeometry = (width, height, depth, spineRadius) => {
  // This would create a custom geometry with rounded spine
  // For now, we'll use a scaled box geometry
  return {
    width,
    height,
    depth,
  };
};

// Page stack geometry
export const createPageStackGeometry = (width, height, depth, pageCount) => {
  const pageThickness = depth / pageCount;
  return {
    width: width - 0.1, // pages slightly smaller than cover
    height: height - 0.1,
    depth: depth - 0.05,
    pageCount,
    pageThickness,
  };
};

// Bookmark dimensions
export const BOOKMARK_DIMENSIONS = {
  width: 0.08,
  height: 0.6,
  thickness: 0.005,
  ribbonWidth: 0.04,
};

// Calculate bookmark position
export const calculateBookmarkPosition = (bookHeight, bookDepth) => {
  return {
    x: 0,
    y: bookHeight / 2 - 0.3,
    z: bookDepth / 2 + 0.02,
  };
};

// Camera positions for different views
export const CAMERA_POSITIONS = {
  library: { x: 0, y: 0, z: 8 },
  bookSelected: { x: 0, y: 0, z: 5 },
  bookOpen: { x: 0, y: 0, z: 4 },
};

// Camera targets for different views
export const CAMERA_TARGETS = {
  library: { x: 0, y: -1, z: 0 },
  bookSelected: { x: 0, y: 0, z: 0 },
  bookOpen: { x: 0, y: 0, z: 0 },
};

// Lighting positions
export const LIGHTING_POSITIONS = {
  ambient: { x: 0, y: 0, z: 0 },
  directional: { x: -5, y: 10, z: 5 },
  fill: { x: 5, y: 5, z: 5 },
  rim: { x: 0, y: 5, z: -5 },
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

// Animation keyframes
export const ANIMATION_KEYFRAMES = {
  hover: {
    position: { y: [0, 0.1, 0] },
    duration: 3,
    repeat: Infinity,
  },
  selection: {
    position: { z: [0, 2] },
    rotation: { y: [0, Math.PI / 12] },
    duration: 0.4,
  },
  open: {
    rotation: { y: [Math.PI / 12, 0] },
    duration: 0.6,
  },
  close: {
    rotation: { y: [0, Math.PI / 12] },
    position: { z: [2, 0] },
    duration: 0.4,
  },
};

// Scale factors for responsive design
export const SCALE_FACTORS = {
  mobile: 0.8,
  tablet: 1.0,
  desktop: 1.2,
};

// Get scale factor based on viewport
export const getScaleFactor = (width) => {
  if (width < 480) return SCALE_FACTORS.mobile;
  if (width < 768) return SCALE_FACTORS.tablet;
  return SCALE_FACTORS.desktop;
};