// Material presets for The Inner Library 3D Bookshelf

// Book cover color palette
export const BOOK_COLORS = {
  navy: { main: '#1B2A4A', light: '#2A3F6A', dark: '#0F1A2E', accent: '#B8922A' },
  forest: { main: '#2D5016', light: '#3D6B22', dark: '#1A3009', accent: '#8BC34A' },
  brown: { main: '#6B4226', light: '#8B5A3C', dark: '#4A2E1A', accent: '#D4A845' },
  gold: { main: '#B8922A', light: '#D4A845', dark: '#8B6F1F', accent: '#F5E6B8' },
  warm: { main: '#8B4513', light: '#A0522D', dark: '#6B3410', accent: '#DEB887' },
  burgundy: { main: '#6B1D2A', light: '#8B2D3A', dark: '#4A1320', accent: '#D4A845' },
  teal: { main: '#1A5C5C', light: '#2A7C7C', dark: '#0F3C3C', accent: '#B8922A' },
  plum: { main: '#4A2060', light: '#6A3080', dark: '#2A1040', accent: '#D4A845' },
};

// Material presets
export const MATERIAL_PRESETS = {
  leather: {
    name: 'Classic Leather',
    roughness: 0.7,
    metalness: 0.1,
    bumpScale: 0.02,
    description: 'Rich leather with subtle grain',
  },
  cloth: {
    name: 'Book Cloth',
    roughness: 0.85,
    metalness: 0.0,
    bumpScale: 0.015,
    description: 'Traditional library cloth binding',
  },
  paper: {
    name: 'Paper Cover',
    roughness: 0.6,
    metalness: 0.0,
    bumpScale: 0.005,
    description: 'Clean matte paper finish',
  },
  velvet: {
    name: 'Velvet',
    roughness: 0.95,
    metalness: 0.0,
    bumpScale: 0.01,
    description: 'Soft velvet touch',
  },
  modern: {
    name: 'Modern Gloss',
    roughness: 0.3,
    metalness: 0.15,
    bumpScale: 0.003,
    description: 'Sleek contemporary finish',
  },
};

// Texture pattern presets
export const PATTERN_PRESETS = {
  none: { name: 'None', description: 'Clean cover' },
  geometric: { name: 'Geometric', description: 'Geometric pattern' },
  floral: { name: 'Floral', description: 'Floral motif' },
  striped: { name: 'Striped', description: 'Classic stripes' },
  damask: { name: 'Damask', description: 'Traditional damask' },
};

// Border style presets
export const BORDER_PRESETS = {
  none: { name: 'None', width: 0 },
  thin: { name: 'Thin', width: 1 },
  thick: { name: 'Thick', width: 2 },
  gold: { name: 'Gold Border', width: 1.5, color: '#B8922A' },
  silver: { name: 'Silver Border', width: 1.5, color: '#C0C0C0' },
};

// Wear level presets
export const WEAR_PRESETS = {
  pristine: { name: 'Pristine', roughnessOffset: 0, bumpOffset: 0 },
  light: { name: 'Light Wear', roughnessOffset: 0.05, bumpOffset: 0.005 },
  moderate: { name: 'Moderate Wear', roughnessOffset: 0.1, bumpOffset: 0.01 },
  heavy: { name: 'Well-Loved', roughnessOffset: 0.2, bumpOffset: 0.02 },
};

// Gold foil material properties
export const GOLD_FOIL = {
  color: '#B8922A',
  roughness: 0.3,
  metalness: 0.8,
  emissive: '#D4A845',
  emissiveIntensity: 0.15,
};

// Paper material properties
export const PAPER_MATERIAL = {
  color: '#F5F0E8',
  roughness: 0.9,
  metalness: 0.0,
  bumpScale: 0.003,
};

// Wood shelf material properties
export const WOOD_MATERIAL = {
  color: '#8B6F47',
  roughness: 0.8,
  metalness: 0.0,
  bumpScale: 0.01,
};

// Get material properties for a book
export const getBookMaterial = (bookId) => {
  const bookMaterials = {
    daily_checkin: { preset: 'leather', color: BOOK_COLORS.navy },
    needs_translator: { preset: 'cloth', color: BOOK_COLORS.forest },
    boundary_scripts: { preset: 'leather', color: BOOK_COLORS.brown },
    cognitive_reframe: { preset: 'cloth', color: BOOK_COLORS.gold },
    evidence_shelf: { preset: 'leather', color: BOOK_COLORS.forest },
    character_notes: { preset: 'leather', color: BOOK_COLORS.navy },
    younger_self: { preset: 'velvet', color: BOOK_COLORS.warm },
    session_prep: { preset: 'cloth', color: BOOK_COLORS.gold },
  };
  return bookMaterials[bookId] || { preset: 'leather', color: BOOK_COLORS.navy };
};

// Get Three.js material props from preset
export const getMaterialProps = (presetName, colorOverride) => {
  const preset = MATERIAL_PRESETS[presetName] || MATERIAL_PRESETS.leather;
  const color = colorOverride || BOOK_COLORS.navy;
  return {
    color: color.main,
    roughness: preset.roughness,
    metalness: preset.metalness,
    bumpScale: preset.bumpScale,
  };
};
