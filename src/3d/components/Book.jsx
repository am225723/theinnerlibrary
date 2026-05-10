// 3D Book component for The Inner Library

import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BOOK_STATES, TIMINGS } from '../utils/animationTimings';
import { getBookMaterial, BOOK_COLORS } from '../utils/materialPresets';
import { getTexture } from '../utils/textureGenerator';
import { loadAllCovers } from '../hooks/useCoverDesigner';

const Book = ({ 
  book, 
  position = [0, 0, 0], 
  onClick, 
  onHover, 
  onHoverEnd, 
  isSelected = false, 
  isHovered = false,
  showBookmark = false,
  bookmarkCount = 0,
}) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [animState, setAnimState] = useState(BOOK_STATES.IDLE);
  const animProgressRef = useRef(0);
  // targetRef reserved for future camera tracking
  const _targetRef = useRef({
    position: new THREE.Vector3(...position),
    rotation: new THREE.Euler(0, 0, 0),
  });
  void _targetRef;

  // Load saved cover design
  const savedCover = useMemo(() => {
    const covers = loadAllCovers();
    return covers[book.id] || null;
  }, [book.id]);

  // Get book material properties (use saved cover if available)
  const materialProps = useMemo(() => {
    if (savedCover) {
      return {
        coverColor: savedCover.colors.cover,
        lightColor: savedCover.colors.accent,
        darkColor: savedCover.colors.spine,
        accentColor: savedCover.colors.text,
        preset: savedCover.material,
        spineText: savedCover.spine.text || book.spineLabel,
      };
    }
    const mat = getBookMaterial(book.id);
    const colors = mat.color || BOOK_COLORS.navy;
    return {
      coverColor: colors.main,
      lightColor: colors.light,
      darkColor: colors.dark,
      accentColor: colors.accent,
      preset: mat.preset,
      spineText: book.spineLabel || book.title,
    };
  }, [book.id, book.spineLabel, book.title, savedCover]);

  // Generate spine text texture
  const spineTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = materialProps.darkColor;
    ctx.fillRect(0, 0, 256, 512);

    // Text
    const lines = materialProps.spineText.split('\\n');
    ctx.fillStyle = '#B8922A';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lineHeight = 40;
    const startY = 256 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, 128, startY + i * lineHeight);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [materialProps]);

  // Generate textures
  const textures = useMemo(() => {
    return {
      cover: getTexture(materialProps.preset === 'cloth' ? 'cloth' : 'leather', { 
        color: materialProps.coverColor 
      }),
      paper: getTexture('paper', { color: '#F5F0E8' }),
      goldFoil: getTexture('goldFoil'),
      spine: spineTexture,
    };
  }, [materialProps, spineTexture]);

  // Book dimensions based on position type
  const dimensions = useMemo(() => {
    const positions = {
      tall: { width: 0.7, height: 2.4, depth: 1.5 },
      medium: { width: 0.8, height: 2.0, depth: 1.4 },
      short: { width: 0.75, height: 1.6, depth: 1.3 },
    };
    return positions[book.position] || positions.medium;
  }, [book.position]);

  // Animation state machine
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const group = groupRef.current;

    // Breathing animation for idle state
    if (animState === BOOK_STATES.IDLE) {
      const breathe = Math.sin(time * (2 * Math.PI / (TIMINGS.BREATHING_CYCLE / 1000))) * 0.02;
      group.position.y = position[1] + breathe;
      group.position.z = position[2];
      group.rotation.y = 0;
    }

    // Hover animation
    if (animState === BOOK_STATES.HOVER) {
      group.position.y = THREE.MathUtils.lerp(group.position.y, position[1] + 0.08, 0.1);
      group.position.z = position[2];
    }

    // Selected animation - slide forward
    if (animState === BOOK_STATES.SELECTED) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.SELECTION_SLIDE / 1000));
      const t = easeInOutCubic(animProgressRef.current);
      group.position.z = THREE.MathUtils.lerp(position[2], position[2] + 1.5, t);
      group.position.y = THREE.MathUtils.lerp(position[1], position[1] + 0.1, t);
      group.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 12, t);
    }

    // CENTERED state - book in middle of screen
    if (animState === BOOK_STATES.CENTERED) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.BOOK_OPEN / 1000));
      const t = easeOutBack(animProgressRef.current);
      
      // Move to center of screen (z=3 for close-up, y=0 for center height)
      group.position.z = THREE.MathUtils.lerp(position[2] + 1.5, 3, t);
      group.position.y = THREE.MathUtils.lerp(position[1] + 0.1, 0, t);
      group.position.x = THREE.MathUtils.lerp(position[0], 0, t);
      
      // Rotate to face viewer
      group.rotation.y = THREE.MathUtils.lerp(Math.PI / 12, 0, t);
      group.rotation.x = THREE.MathUtils.lerp(0, 0.1, t); // Slight tilt for better viewing
    }

    // Opening animation
    if (animState === BOOK_STATES.OPENING) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.BOOK_OPEN / 1000));
      const t = easeOutBack(animProgressRef.current);
      group.rotation.y = THREE.MathUtils.lerp(0, 0, t);
      group.position.z = THREE.MathUtils.lerp(3, 2, t);
    }

    // Closing animation
    if (animState === BOOK_STATES.CLOSING) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.BOOK_OPEN / 1000));
      const t = easeInOutCubic(animProgressRef.current);
      group.position.z = THREE.MathUtils.lerp(2, 3, t);
      group.rotation.y = THREE.MathUtils.lerp(0, 0, t);
    }

    // Returning animation
    if (animState === BOOK_STATES.RETURNING) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.RETURN_TO_SHELF / 1000));
      const t = easeInOutCubic(animProgressRef.current);
      group.position.z = THREE.MathUtils.lerp(3, position[2], t);
      group.position.y = THREE.MathUtils.lerp(0, position[1], t);
      group.position.x = THREE.MathUtils.lerp(0, position[0], t);
      group.rotation.y = THREE.MathUtils.lerp(0, 0, t);
      group.rotation.x = THREE.MathUtils.lerp(0.1, 0, t);
    }
  });

  // Handle pointer events
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    if (animState === BOOK_STATES.IDLE) {
      setAnimState(BOOK_STATES.HOVER);
    }
    document.body.style.cursor = 'pointer';
    if (onHover) onHover(book.id);
  }, [animState, book.id, onHover]);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    setHovered(false);
    if (animState === BOOK_STATES.HOVER) {
      setAnimState(BOOK_STATES.IDLE);
    }
    document.body.style.cursor = 'default';
    if (onHoverEnd) onHoverEnd(book.id);
  }, [animState, book.id, onHoverEnd]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (animState === BOOK_STATES.IDLE || animState === BOOK_STATES.HOVER) {
      animProgressRef.current = 0;
      setAnimState(BOOK_STATES.SELECTED);
      
      // Chain to centered state after selection animation
      setTimeout(() => {
        animProgressRef.current = 0;
        setAnimState(BOOK_STATES.CENTERED);
        
        // Fire onClick after centered animation
        setTimeout(() => {
          if (onClick) onClick(book);
        }, TIMINGS.BOOK_OPEN);
      }, TIMINGS.SELECTION_SLIDE);
    }
  }, [animState, book, onClick]);

  // External state control
  useEffect(() => {
    if (isSelected && animState === BOOK_STATES.IDLE) {
      animProgressRef.current = 0;
      setAnimState(BOOK_STATES.SELECTED);
      setTimeout(() => {
        animProgressRef.current = 0;
        setAnimState(BOOK_STATES.CENTERED);
      }, TIMINGS.SELECTION_SLIDE);
    }
  }, [isSelected, animState]);

  // Reset book to shelf
  const resetBook = useCallback(() => {
    animProgressRef.current = 0;
    setAnimState(BOOK_STATES.RETURNING);
    setTimeout(() => {
      setAnimState(BOOK_STATES.IDLE);
    }, TIMINGS.RETURN_TO_SHELF);
  }, []);
  void resetBook;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      role="button"
      aria-label={`${book.title} book. ${book.subtitle}`}
    >
      {/* Book cover - main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial
          map={textures.cover}
          color={materialProps.coverColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Spine with text texture */}
      <mesh position={[0, 0, dimensions.depth / 2 + 0.005]} castShadow>
        <boxGeometry args={[dimensions.width + 0.02, dimensions.height + 0.01, 0.01]} />
        <meshStandardMaterial
          map={textures.spine}
          color={materialProps.darkColor}
          roughness={0.6}
          metalness={0.15}
        />
      </mesh>

      {/* Gold spine text line (decorative) */}
      <mesh position={[0, dimensions.height * 0.3, dimensions.depth / 2 + 0.015]}>
        <boxGeometry args={[dimensions.width * 0.6, 0.02, 0.005]} />
        <meshStandardMaterial
          color="#B8922A"
          roughness={0.3}
          metalness={0.8}
          emissive="#D4A845"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Gold spine text line 2 (decorative) */}
      <mesh position={[0, -dimensions.height * 0.2, dimensions.depth / 2 + 0.015]}>
        <boxGeometry args={[dimensions.width * 0.4, 0.015, 0.005]} />
        <meshStandardMaterial
          color="#B8922A"
          roughness={0.3}
          metalness={0.8}
          emissive="#D4A845"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Page edges - visible on top */}
      <mesh position={[0, dimensions.height / 2 + 0.005, -0.05]}>
        <boxGeometry args={[dimensions.width - 0.08, 0.01, dimensions.depth - 0.15]} />
        <meshStandardMaterial
          color="#F5F0E8"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Page edges - visible on side */}
      <mesh position={[-(dimensions.width / 2 + 0.005), 0, -0.05]}>
        <boxGeometry args={[0.01, dimensions.height - 0.04, dimensions.depth - 0.15]} />
        <meshStandardMaterial
          color="#E8E0D0"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Cover icon (subtle raised area) */}
      <mesh position={[0, dimensions.height * 0.15, dimensions.depth / 2 + 0.012]}>
        <boxGeometry args={[0.15, 0.15, 0.008]} />
        <meshStandardMaterial
          color={materialProps.accentColor}
          roughness={0.4}
          metalness={0.6}
          emissive={materialProps.accentColor}
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Hover glow effect */}
      {hovered && (
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[dimensions.width + 0.1, dimensions.height + 0.1, dimensions.depth + 0.1]} />
          <meshBasicMaterial
            color="#B8922A"
            transparent
            opacity={0.08}
          />
        </mesh>
      )}

      {/* Bookmark */}
      {showBookmark && bookmarkCount > 0 && (
        <Bookmark
          bookHeight={dimensions.height}
          count={bookmarkCount}
        />
      )}
    </group>
  );
};

// Bookmark sub-component
const Bookmark = ({ bookHeight, count = 1 }) => {
  const bookmarkRef = useRef();

  useFrame((state) => {
    if (!bookmarkRef.current) return;
    const time = state.clock.getElapsedTime();
    // Gentle sway animation
    bookmarkRef.current.rotation.z = Math.sin(time * (2 * Math.PI / 3)) * (Math.PI / 60);
  });

  return (
    <group
      ref={bookmarkRef}
      position={[0.1, bookHeight / 2 + 0.15, 0.3]}
    >
      {/* Ribbon */}
      <mesh castShadow>
        <boxGeometry args={[0.06, 0.4, 0.008]} />
        <meshStandardMaterial
          color="#B8922A"
          roughness={0.4}
          metalness={0.3}
          emissive="#D4A845"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Ribbon tail */}
      <mesh position={[0, -0.22, 0]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.008]} />
        <meshStandardMaterial
          color="#B8922A"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Count badge */}
      {count > 0 && (
        <mesh position={[0, 0.15, 0.01]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color="#B8922A" />
        </mesh>
      )}
    </group>
  );
};

// Easing functions
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

const easeOutBack = (t) => {
  const s = 1.70158;
  return (t -= 1) * t * ((s + 1) * t + s) + 1;
};

export default Book;