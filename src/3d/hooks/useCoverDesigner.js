// Cover designer hook for The Inner Library 3D Bookshelf

import { useState, useCallback } from 'react';
import { MATERIAL_PRESETS, BOOK_COLORS } from '../utils/materialPresets';

const COVER_STORAGE_KEY = 'inner_library_cover_designs';

// Default cover design
const getDefaultCover = (bookId) => ({
  id: `cover_${bookId}_default`,
  bookId,
  material: 'leather',
  colors: {
    cover: BOOK_COLORS.navy?.main || '#1B2A4A',
    spine: BOOK_COLORS.navy?.main || '#1B2A4A',
    text: '#B8922A',
    accent: '#D4A845',
  },
  texture: {
    type: 'grainy',
    roughness: 0.7,
    metalness: 0.1,
  },
  pattern: null,
  icon: {
    emoji: '📖',
    position: 'center',
    size: 48,
  },
  border: {
    enabled: true,
    color: '#B8922A',
    width: 2,
  },
  spine: {
    text: '',
    font: 'Playfair Display',
    fontSize: 14,
    vertical: true,
  },
  embossing: {
    enabled: false,
    depth: 0.5,
    elements: [],
  },
  wear: 'light',
});

export const useCoverDesigner = (bookId) => {
  const [cover, setCover] = useState(() => {
    // Try to load saved cover
    const saved = loadCoverFromStorage(bookId);
    return saved || getDefaultCover(bookId);
  });

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update cover property
  const updateCover = useCallback((updates) => {
    setCover((prev) => {
      const updated = { ...prev, ...updates };
      // Handle nested updates
      if (updates.colors) {
        updated.colors = { ...prev.colors, ...updates.colors };
      }
      if (updates.texture) {
        updated.texture = { ...prev.texture, ...updates.texture };
      }
      if (updates.icon) {
        updated.icon = { ...prev.icon, ...updates.icon };
      }
      if (updates.border) {
        updated.border = { ...prev.border, ...updates.border };
      }
      if (updates.spine) {
        updated.spine = { ...prev.spine, ...updates.spine };
      }
      if (updates.embossing) {
        updated.embossing = { ...prev.embossing, ...updates.embossing };
      }
      return updated;
    });
    setHasChanges(true);
  }, []);

  // Material selection
  const setMaterial = useCallback((material) => {
    const preset = MATERIAL_PRESETS[material];
    if (preset) {
      updateCover({
        material,
        texture: {
          ...cover.texture,
          roughness: preset.roughness,
          metalness: preset.metalness,
        },
      });
    }
  }, [cover.texture, updateCover]);

  // Color selection
  const setCoverColor = useCallback((colorKey) => {
    const colorSet = BOOK_COLORS[colorKey];
    if (colorSet) {
      updateCover({
        colors: {
          ...cover.colors,
          cover: colorSet.main,
          spine: colorSet.main,
          accent: colorSet.accent,
        },
      });
    }
  }, [cover.colors, updateCover]);

  // Custom color
  const setCustomColor = useCallback((color) => {
    updateCover({
      colors: {
        ...cover.colors,
        cover: color,
        spine: color,
      },
    });
  }, [cover.colors, updateCover]);

  // Spine text
  const setSpineText = useCallback((text) => {
    updateCover({
      spine: {
        ...cover.spine,
        text,
      },
    });
  }, [cover.spine, updateCover]);

  // Icon selection
  const setIcon = useCallback((emoji) => {
    updateCover({
      icon: {
        ...cover.icon,
        emoji,
      },
    });
  }, [cover.icon, updateCover]);

  // Border toggle
  const setBorderEnabled = useCallback((enabled) => {
    updateCover({
      border: {
        ...cover.border,
        enabled,
      },
    });
  }, [cover.border, updateCover]);

  // Pattern selection
  const setPattern = useCallback((pattern) => {
    updateCover({ pattern });
  }, [updateCover]);

  // Wear level
  const setWear = useCallback((wear) => {
    updateCover({ wear });
  }, [updateCover]);

  // Embossing
  const setEmbossing = useCallback((embossing) => {
    updateCover({
      embossing: {
        ...cover.embossing,
        ...embossing,
      },
    });
  }, [cover.embossing, updateCover]);

  // Save cover
  const saveCover = useCallback(() => {
    saveCoverToStorage(cover);
    setHasChanges(false);
  }, [cover]);

  // Reset to default
  const resetCover = useCallback(() => {
    setCover(getDefaultCover(bookId));
    setHasChanges(true);
  }, [bookId]);

  // Preview toggle
  const togglePreview = useCallback(() => {
    setIsPreviewing((prev) => !prev);
  }, []);

  return {
    cover,
    isPreviewing,
    hasChanges,
    updateCover,
    setMaterial,
    setCoverColor,
    setCustomColor,
    setSpineText,
    setIcon,
    setBorderEnabled,
    setPattern,
    setWear,
    setEmbossing,
    saveCover,
    resetCover,
    togglePreview,
  };
};

// Storage helpers
const loadCoverFromStorage = (bookId) => {
  try {
    const raw = localStorage.getItem(COVER_STORAGE_KEY);
    const covers = raw ? JSON.parse(raw) : {};
    return covers[bookId] || null;
  } catch {
    return null;
  }
};

const saveCoverToStorage = (cover) => {
  try {
    const raw = localStorage.getItem(COVER_STORAGE_KEY);
    const covers = raw ? JSON.parse(raw) : {};
    covers[cover.bookId] = cover;
    localStorage.setItem(COVER_STORAGE_KEY, JSON.stringify(covers));
  } catch (e) {
    console.warn('Failed to save cover design:', e);
  }
};

// Load all saved covers
export const loadAllCovers = () => {
  try {
    const raw = localStorage.getItem(COVER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Delete a saved cover
export const deleteCover = (bookId) => {
  try {
    const raw = localStorage.getItem(COVER_STORAGE_KEY);
    const covers = raw ? JSON.parse(raw) : {};
    delete covers[bookId];
    localStorage.setItem(COVER_STORAGE_KEY, JSON.stringify(covers));
  } catch (e) {
    console.warn('Failed to delete cover design:', e);
  }
};

// Get default covers for all books
export const getDefaultCovers = () => {
  const bookIds = [
    'daily_checkin', 'needs_translator', 'boundary_scripts', 'cognitive_reframe',
    'evidence_shelf', 'character_notes', 'younger_self', 'session_prep',
  ];
  const covers = {};
  bookIds.forEach((id) => {
    covers[id] = getDefaultCover(id);
  });
  return covers;
};