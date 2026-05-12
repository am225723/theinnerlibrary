// Material presets for The Inner Library 3D Bookshelf
// Each book has a unique, distinct visual identity

// Extended book cover color palette - each color is unique
export const BOOK_COLORS = {
  navy: { main: '#1B2A4A', light: '#2A3F6A', dark: '#0F1A2E', accent: '#B8922A' },
  forest: { main: '#2D5016', light: '#3D6B22', dark: '#1A3009', accent: '#8BC34A' },
  brown: { main: '#6B4226', light: '#8B5A3C', dark: '#4A2E1A', accent: '#D4A845' },
  gold: { main: '#B8922A', light: '#D4A845', dark: '#8B6F1F', accent: '#F5E6B8' },
  warm: { main: '#8B4513', light: '#A0522D', dark: '#6B3410', accent: '#DEB887' },
  burgundy: { main: '#7B1D2A', light: '#9B2D3A', dark: '#5A1320', accent: '#E8C170' },
  teal: { main: '#1A5C5C', light: '#2A7C7C', dark: '#0F3C3C', accent: '#D4A845' },
  plum: { main: '#4A2060', light: '#6A3080', dark: '#2A1040', accent: '#D4A845' },
  slate: { main: '#4A5568', light: '#5A6578', dark: '#2D3748', accent: '#E2B55A' },
  terracotta: { main: '#B85C38', light: '#CC7A56', dark: '#8B3E22', accent: '#F5E6B8' },
  sage: { main: '#6B8E5A', light: '#7FA06E', dark: '#4A6B3A', accent: '#E8C170' },
  midnight: { main: '#191970', light: '#2B2B8B', dark: '#0E0E4A', accent: '#D4A845' },
  rust: { main: '#9C4A2A', light: '#B8603E', dark: '#6B3218', accent: '#F5E6B8' },
  moss: { main: '#4A6741', light: '#5A7B51', dark: '#2D4225', accent: '#E8C170' },
  crimson: { main: '#8B1A1A', light: '#A82E2E', dark: '#5C1010', accent: '#F5E6B8' },
  olive: { main: '#6B6B3A', light: '#8B8B4A', dark: '#4A4A25', accent: '#E8C170' },
  // New colors
  chocolate: { main: '#3E2723', light: '#5D4037', dark: '#1B0F0A', accent: '#FFB74D' },
  indigo: { main: '#283593', light: '#3949AB', dark: '#1A237E', accent: '#FFD54F' },
  emerald: { main: '#1B5E20', light: '#2E7D32', dark: '#0D3B12', accent: '#FDD835' },
  maroon: { main: '#4A0E0E', light: '#6D1B1B', dark: '#2D0808', accent: '#EF9A9A' },
  copper: { main: '#795548', light: '#8D6E63', dark: '#4E342E', accent: '#FFAB91' },
  aubergine: { main: '#4A148C', light: '#6A1B9A', dark: '#300070', accent: '#CE93D8' },
  denim: { main: '#1565C0', light: '#1E88E5', dark: '#0D47A1', accent: '#90CAF9' },
  charcoal: { main: '#37474F', light: '#455A64', dark: '#263238', accent: '#B0BEC5' },
  mahogany: { main: '#4E342E', light: '#6D4C41', dark: '#3E2723', accent: '#BCAAA4' },
  rosewood: { main: '#5D4037', light: '#795548', dark: '#3E2723', accent: '#D7CCC8' },
  parchment: { main: '#D7CCC8', light: '#EFEBE9', dark: '#BCAAA4', accent: '#8D6E63' },
  ivory: { main: '#F5F0E8', light: '#FFFEF5', dark: '#E0D8C8', accent: '#B8922A' },
};

// Material presets with visual properties
export const MATERIAL_PRESETS = {
  leather: {
    name: 'Classic Leather',
    roughness: 0.65,
    metalness: 0.08,
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
    roughness: 0.25,
    metalness: 0.15,
    bumpScale: 0.003,
    description: 'Sleek contemporary finish',
  },
  linen: {
    name: 'Linen',
    roughness: 0.8,
    metalness: 0.0,
    bumpScale: 0.012,
    description: 'Natural linen texture',
  },
  // New material presets
  vellum: {
    name: 'Vellum',
    roughness: 0.72,
    metalness: 0.02,
    bumpScale: 0.008,
    description: 'Soft animal skin parchment',
  },
  silk: {
    name: 'Silk',
    roughness: 0.35,
    metalness: 0.08,
    bumpScale: 0.004,
    description: 'Lustrous silk fabric',
  },
  canvas: {
    name: 'Canvas',
    roughness: 0.90,
    metalness: 0.0,
    bumpScale: 0.018,
    description: 'Textured canvas wrap',
  },
  patent: {
    name: 'Patent Leather',
    roughness: 0.12,
    metalness: 0.25,
    bumpScale: 0.002,
    description: 'High-gloss patent leather',
  },
  suede: {
    name: 'Suede',
    roughness: 0.98,
    metalness: 0.0,
    bumpScale: 0.015,
    description: 'Soft napped suede',
  },
  metallic: {
    name: 'Metallic',
    roughness: 0.20,
    metalness: 0.60,
    bumpScale: 0.003,
    description: 'Shimmering metallic finish',
  },
};

// Texture pattern presets
export const PATTERN_PRESETS = {
  none: { name: 'None', description: 'Clean cover' },
  geometric: { name: 'Geometric', description: 'Geometric pattern' },
  floral: { name: 'Floral', description: 'Floral motif' },
  striped: { name: 'Striped', description: 'Classic stripes' },
  damask: { name: 'Damask', description: 'Traditional damask' },
  // New patterns
  stars: { name: 'Stars', description: 'Celestial stars' },
  dots: { name: 'Polka Dots', description: 'Playful dots' },
  herringbone: { name: 'Herringbone', description: 'Classic weave' },
  chevron: { name: 'Chevron', description: 'V-shaped pattern' },
  paisley: { name: 'Paisley', description: 'Ornate paisley' },
  art_deco: { name: 'Art Deco', description: '1920s geometric' },
  celtic: { name: 'Celtic Knot', description: 'Interwoven design' },
  mosaic: { name: 'Mosaic', description: 'Tile pattern' },
  marbled: { name: 'Marbled', description: 'Swirling marble' },
};

// Border style presets
export const BORDER_PRESETS = {
  none: { name: 'None', width: 0 },
  thin: { name: 'Thin', width: 1 },
  thick: { name: 'Thick', width: 2 },
  gold: { name: 'Gold Border', width: 1.5, color: '#B8922A' },
  silver: { name: 'Silver Border', width: 1.5, color: '#C0C0C0' },
  // New border styles
  double: { name: 'Double Line', width: 2, color: '#B8922A' },
  ornate: { name: 'Ornate', width: 3, color: '#D4A845' },
  corner: { name: 'Corner Only', width: 2, color: '#B8922A' },
  embossed: { name: 'Embossed', width: 2, color: '#8B6F1F' },
  rope: { name: 'Rope Pattern', width: 2, color: '#B8922A' },
};

// Corner decoration presets
export const CORNER_PRESETS = {
  none: { name: 'None' },
  simple: { name: 'Simple', style: 'line' },
  ornate: { name: 'Ornate', style: 'scroll' },
  fleur: { name: 'Fleur-de-lis', style: 'fleur' },
  diamond: { name: 'Diamond', style: 'diamond' },
  star: { name: 'Star', style: 'star' },
};

// Font presets for spine and cover text
export const FONT_PRESETS = {
  serif: { name: 'Serif', family: 'Georgia, serif' },
  sans: { name: 'Sans Serif', family: 'Arial, sans-serif' },
  script: { name: 'Script', family: 'Brush Script MT, cursive' },
  display: { name: 'Display', family: 'Impact, sans-serif' },
  classic: { name: 'Classic', family: 'Times New Roman, serif' },
  modern: { name: 'Modern', family: 'Helvetica, sans-serif' },
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

// Unique book definitions - each book looks distinctly different
// Different sizes, colors, materials, and visual styles
export const getBookMaterial = (bookId) => {
  const bookMaterials = {
    daily_checkin: {
      preset: 'leather',
      color: BOOK_COLORS.navy,
      spineStyle: 'raised_bands',
      coverStyle: 'ornate',          // Victorian ornate with medallion
      pageColor: '#F8F4EC',
      ribbonColor: '#B8922A',
    },
    needs_translator: {
      preset: 'cloth',
      color: BOOK_COLORS.forest,
      spineStyle: 'flat',
      coverStyle: 'floral_vine',     // Botanical vine illustration
      pageColor: '#F5F0E8',
      ribbonColor: '#8BC34A',
    },
    boundary_scripts: {
      preset: 'leather',
      color: BOOK_COLORS.burgundy,
      spineStyle: 'raised_bands',
      coverStyle: 'gilt_center',     // Gold center ornament
      pageColor: '#FAF6EE',
      ribbonColor: '#E8C170',
    },
    cognitive_reframe: {
      preset: 'modern',
      color: BOOK_COLORS.gold,
      spineStyle: 'flat',
      coverStyle: 'geometric_modern', // Modern overlapping shapes
      pageColor: '#FFFFFF',
      ribbonColor: '#D4A845',
    },
    evidence_shelf: {
      preset: 'cloth',
      color: BOOK_COLORS.teal,
      spineStyle: 'flat',
      coverStyle: 'art_deco',        // Bold Art Deco sunburst
      pageColor: '#F5F0E8',
      ribbonColor: '#D4A845',
    },
    character_notes: {
      preset: 'velvet',
      color: BOOK_COLORS.plum,
      spineStyle: 'raised_bands',
      coverStyle: 'stars',           // Celestial stars & moon
      pageColor: '#FAF0E6',
      ribbonColor: '#D4A845',
    },
    younger_self: {
      preset: 'linen',
      color: BOOK_COLORS.terracotta,
      spineStyle: 'flat',
      coverStyle: 'watercolor',      // Soft artistic washes
      pageColor: '#FFF8F0',
      ribbonColor: '#F5E6B8',
    },
    session_prep: {
      preset: 'leather',
      color: BOOK_COLORS.brown,
      spineStyle: 'raised_bands',
      coverStyle: 'gilt_border',     // Classic gilt border frame
      pageColor: '#F8F4EC',
      ribbonColor: '#D4A845',
    },
  };
  return bookMaterials[bookId] || { preset: 'leather', color: BOOK_COLORS.navy, spineStyle: 'flat', coverStyle: 'minimal', pageColor: '#F5F0E8', ribbonColor: '#B8922A' };
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
