// 3D Book component for The Inner Library
// Realistic book with distinct visual styles, spine text, and page-flip animation

import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BOOK_STATES, TIMINGS } from '../utils/animationTimings';
import { getBookMaterial, BOOK_COLORS } from '../utils/materialPresets';
import { loadAllCovers } from '../hooks/useCoverDesigner';
import { getBookDimensionsById } from '../utils/bookGeometry';

const Book = ({
  book,
  position = [0, 0, 0],
  onClick,
  onHover,
  onHoverEnd,
  isSelected = false,
  showBookmark = false,
  bookmarkCount = 0,
}) => {
  const groupRef = useRef();
  const frontCoverRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [animState, setAnimState] = useState(BOOK_STATES.IDLE);
  const animProgressRef = useRef(0);
  const flipAngleRef = useRef(0);

  // Load saved cover design
  const savedCover = useMemo(() => {
    const covers = loadAllCovers();
    return covers[book.id] || null;
  }, [book.id]);

  // Get book material properties
  const bookMat = useMemo(() => getBookMaterial(book.id), [book.id]);

  // Material props for rendering
  const materialProps = useMemo(() => {
    if (savedCover) {
      return {
        coverColor: savedCover.colors.cover,
        lightColor: savedCover.colors.accent,
        darkColor: savedCover.colors.spine,
        accentColor: savedCover.colors.text,
        preset: savedCover.material,
        spineText: savedCover.spine.text || book.spineLabel,
        spineStyle: bookMat.spineStyle,
        coverStyle: bookMat.coverStyle,
        ribbonColor: bookMat.ribbonColor,
      };
    }
    const colors = bookMat.color || BOOK_COLORS.navy;
    return {
      coverColor: colors.main,
      lightColor: colors.light,
      darkColor: colors.dark,
      accentColor: colors.accent,
      preset: bookMat.preset,
      spineText: book.spineLabel || book.title,
      spineStyle: bookMat.spineStyle,
      coverStyle: bookMat.coverStyle,
      ribbonColor: bookMat.ribbonColor,
    };
  }, [book.spineLabel, book.title, savedCover, bookMat]);

  // Book dimensions - each book is unique
  const dimensions = useMemo(() => getBookDimensionsById(book.id), [book.id]);

  // Generate spine text texture - vertical text for book spine
  const spineTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = materialProps.darkColor;
    ctx.fillRect(0, 0, 128, 512);

    // Decorative lines on spine
    ctx.fillStyle = materialProps.accentColor;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(10, 30, 108, 2);
    ctx.fillRect(10, 480, 108, 2);
    ctx.globalAlpha = 1;

    // Text - written vertically (rotated)
    const text = materialProps.spineText.replace(/\\n/g, ' ');
    ctx.save();
    ctx.translate(64, 256);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = materialProps.accentColor;
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    ctx.restore();

    // Raised band decorations for classic spines
    if (materialProps.spineStyle === 'raised_bands') {
      ctx.fillStyle = materialProps.darkColor;
      ctx.globalAlpha = 0.3;
      [0.2, 0.4, 0.6, 0.8].forEach((pos) => {
        ctx.fillRect(8, 512 * pos - 4, 112, 8);
      });
      ctx.globalAlpha = 1;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [materialProps]);

  // Generate cover texture - unique design per book
  const coverTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base cover color
    ctx.fillStyle = materialProps.coverColor;
    ctx.fillRect(0, 0, 256, 512);

    // Add subtle texture noise
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 512;
      const brightness = Math.random() * 15 - 7;
      ctx.fillStyle = `rgba(${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${Math.abs(brightness) / 200})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Cover style decorations
    const accent = materialProps.accentColor;

    if (materialProps.coverStyle === 'gilt_border') {
      // Gold border frame
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(15, 15, 226, 482);
      ctx.strokeRect(22, 22, 212, 468);
      // Corner ornaments
      ctx.fillStyle = accent;
      [20, 220].forEach((x) => {
        [20, 480].forEach((y) => {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    } else if (materialProps.coverStyle === 'gilt_center') {
      // Gold center ornament
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, 196, 452);
      // Diamond ornament in center
      ctx.fillStyle = accent;
      ctx.save();
      ctx.translate(128, 200);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-15, -15, 30, 30);
      ctx.restore();
      // Small dots
      [80, 176].forEach((x) => {
        [150, 250].forEach((y) => {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    } else if (materialProps.coverStyle === 'modern_title') {
      // Clean modern design with title text
      ctx.fillStyle = accent;
      ctx.font = 'bold 24px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(book.title?.split(' ').slice(0, 3).join(' ') || '', 128, 180);
      // Accent line
      ctx.fillRect(78, 200, 100, 2);
    } else if (materialProps.coverStyle === 'embossed') {
      // Subtle embossed pattern
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        ctx.strokeRect(20 + i * 6, 20 + i * 6, 216 - i * 12, 472 - i * 12);
      }
      ctx.globalAlpha = 1;
    } else if (materialProps.coverStyle === 'watercolor') {
      // Soft watercolor effect
      for (let i = 0; i < 5; i++) {
        const x = 40 + Math.random() * 176;
        const y = 60 + Math.random() * 300;
        const r = 30 + Math.random() * 40;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, accent + '40');
        gradient.addColorStop(1, accent + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    } else if (materialProps.coverStyle === 'minimal') {
      // Simple line at top and bottom
      ctx.fillStyle = accent;
      ctx.fillRect(30, 40, 196, 2);
      ctx.fillRect(30, 470, 196, 2);
    }

    // Title on cover (all styles get a title)
    ctx.fillStyle = accent;
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    const titleText = book.title || '';
    const words = titleText.split(' ');
    if (words.length > 2) {
      ctx.fillText(words.slice(0, Math.ceil(words.length / 2)).join(' '), 128, 340);
      ctx.fillText(words.slice(Math.ceil(words.length / 2)).join(' '), 128, 365);
    } else {
      ctx.fillText(titleText, 128, 350);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [materialProps, book.title]);

  // Page edge texture
  const pageEdgeTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F5F0E8';
    ctx.fillRect(0, 0, 128, 128);
    // Page lines
    for (let y = 0; y < 128; y += 3) {
      ctx.fillStyle = `rgba(0,0,0,${0.02 + Math.random() * 0.02})`;
      ctx.fillRect(0, y, 128, 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Animation state machine
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const group = groupRef.current;

    // Idle - gentle breathing
    if (animState === BOOK_STATES.IDLE) {
      const breathe = Math.sin(time * (2 * Math.PI / (TIMINGS.BREATHING_CYCLE / 1000))) * 0.01;
      group.position.y = position[1] + breathe;
      group.position.z = position[2];
      group.position.x = position[0];
      group.rotation.set(0, 0, 0);
    }

    // Hover - lift slightly
    if (animState === BOOK_STATES.HOVER) {
      group.position.y = THREE.MathUtils.lerp(group.position.y, position[1] + 0.06, 0.1);
      group.position.z = THREE.MathUtils.lerp(group.position.z, position[2] + 0.1, 0.08);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0.02, 0.05);
    }

    // Selected - slide forward from shelf
    if (animState === BOOK_STATES.SELECTED) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.SELECTION_SLIDE / 1000));
      const t = easeInOutCubic(animProgressRef.current);
      group.position.z = THREE.MathUtils.lerp(position[2], position[2] + 2.0, t);
      group.position.y = THREE.MathUtils.lerp(position[1], position[1] + 0.15, t);
      group.rotation.y = THREE.MathUtils.lerp(0, -0.15, t);
    }

    // Centered - move to screen center and face camera
    if (animState === BOOK_STATES.CENTERED) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.CENTER_MOVE / 1000));
      const t = easeOutBack(animProgressRef.current);
      group.position.x = THREE.MathUtils.lerp(position[0], 0, t);
      group.position.y = THREE.MathUtils.lerp(position[1] + 0.15, 0.3, t);
      group.position.z = THREE.MathUtils.lerp(position[2] + 2.0, 4.0, t);
      group.rotation.y = THREE.MathUtils.lerp(-0.15, 0, t);
      group.rotation.z = THREE.MathUtils.lerp(0.02, 0, t);
    }

    // Flipping - open the book with page flip effect
    if (animState === BOOK_STATES.FLIPPING) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.BOOK_OPEN / 1000));
      const t = easeOutCubic(animProgressRef.current);
      // Book rotates to show open pages
      group.rotation.y = THREE.MathUtils.lerp(0, -Math.PI * 0.05, t);
      group.position.z = THREE.MathUtils.lerp(4.0, 3.5, t);
      // Animate the front cover opening directly on Three.js object
      flipAngleRef.current = THREE.MathUtils.lerp(0, -Math.PI * 0.85, t);
      if (frontCoverRef.current) {
        frontCoverRef.current.rotation.y = flipAngleRef.current;
      }
    }

    // Open - book is open, showing pages
    if (animState === BOOK_STATES.OPEN) {
      // Subtle idle animation while open
      const gentleFloat = Math.sin(time * 1.5) * 0.005;
      group.position.y = 0.3 + gentleFloat;
    }

    // Returning - go back to shelf
    if (animState === BOOK_STATES.RETURNING) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.RETURN_TO_SHELF / 1000));
      const t = easeInOutCubic(animProgressRef.current);
      group.position.x = THREE.MathUtils.lerp(0, position[0], t);
      group.position.y = THREE.MathUtils.lerp(0.3, position[1], t);
      group.position.z = THREE.MathUtils.lerp(3.5, position[2], t);
      group.rotation.y = THREE.MathUtils.lerp(-Math.PI * 0.05, 0, t);
      group.rotation.z = THREE.MathUtils.lerp(0, 0, t);
      flipAngleRef.current = THREE.MathUtils.lerp(-Math.PI * 0.85, 0, t);
      if (frontCoverRef.current) {
        frontCoverRef.current.rotation.y = flipAngleRef.current;
      }
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
      // Step 1: Slide out from shelf
      animProgressRef.current = 0;
      setAnimState(BOOK_STATES.SELECTED);

      // Step 2: Move to center
      setTimeout(() => {
        animProgressRef.current = 0;
        setAnimState(BOOK_STATES.CENTERED);

        // Step 3: Flip open
        setTimeout(() => {
          animProgressRef.current = 0;
          flipAngleRef.current = 0;
          setAnimState(BOOK_STATES.FLIPPING);

          // Step 4: Fully open - show confirmation
          setTimeout(() => {
            setAnimState(BOOK_STATES.OPEN);
            if (onClick) onClick(book);
          }, TIMINGS.BOOK_OPEN);
        }, TIMINGS.CENTER_MOVE);
      }, TIMINGS.SELECTION_SLIDE);
    }
  }, [animState, book, onClick]);

  // External state control
  useEffect(() => {
    if (isSelected && animState === BOOK_STATES.IDLE) {
      animProgressRef.current = 0;
      setAnimState(BOOK_STATES.SELECTED);
    }
  }, [isSelected, animState]);

  // Expose reset function via ref-like pattern
  const resetBook = useCallback(() => {
    animProgressRef.current = 0;
    flipAngleRef.current = 0;
    setAnimState(BOOK_STATES.RETURNING);
    setTimeout(() => {
      setAnimState(BOOK_STATES.IDLE);
    }, TIMINGS.RETURN_TO_SHELF);
  }, []);
  void resetBook;

  const w = dimensions.width;
  const h = dimensions.height;
  const d = dimensions.depth;
  const isOpen = animState === BOOK_STATES.FLIPPING || animState === BOOK_STATES.OPEN;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Back cover (stays in place when book opens) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.03]} />
        <meshStandardMaterial
          map={coverTexture}
          color={materialProps.coverColor}
          roughness={0.7}
          metalness={0.08}
        />
      </mesh>

      {/* Page block (visible between covers) */}
      <mesh position={[0, 0, d / 2 - 0.02]} castShadow>
        <boxGeometry args={[w - 0.04, h - 0.08, d - 0.04]} />
        <meshStandardMaterial
          map={pageEdgeTexture}
          color={bookMat.pageColor || '#F5F0E8'}
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      {/* Front cover (opens when flipping - rotation controlled via frontCoverRef in useFrame) */}
      <group ref={frontCoverRef} position={[0, 0, d - 0.015]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, 0.03]} />
          <meshStandardMaterial
            color={materialProps.coverColor}
            roughness={0.65}
            metalness={0.08}
          />
        </mesh>
        {/* Cover decoration on front */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[w - 0.06, h - 0.06]} />
          <meshStandardMaterial
            map={coverTexture}
            transparent
            opacity={0.95}
            roughness={0.6}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* Spine (left side) */}
      <mesh position={[-w / 2 - 0.015, 0, d / 2]} castShadow>
        <boxGeometry args={[0.03, h, d]} />
        <meshStandardMaterial
          map={spineTexture}
          color={materialProps.darkColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Page edges - top */}
      <mesh position={[0, h / 2 + 0.005, d / 2 - 0.02]}>
        <boxGeometry args={[w - 0.06, 0.008, d - 0.06]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.95} metalness={0} />
      </mesh>

      {/* Page edges - right side */}
      <mesh position={[w / 2 + 0.005, 0, d / 2 - 0.02]}>
        <boxGeometry args={[0.008, h - 0.1, d - 0.06]} />
        <meshStandardMaterial color="#EDE8DC" roughness={0.95} metalness={0} />
      </mesh>

      {/* Page edges - bottom */}
      <mesh position={[0, -h / 2 - 0.005, d / 2 - 0.02]}>
        <boxGeometry args={[w - 0.06, 0.008, d - 0.06]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.95} metalness={0} />
      </mesh>

      {/* Spine raised bands (for classic leather books) */}
      {materialProps.spineStyle === 'raised_bands' && (
        <>
          {[-0.25, -0.05, 0.15, 0.35].map((offset, i) => (
            <mesh
              key={`band-${i}`}
              position={[-w / 2 - 0.025, h * offset, d / 2]}
              castShadow
            >
              <boxGeometry args={[0.015, 0.04, d + 0.005]} />
              <meshStandardMaterial
                color={materialProps.darkColor}
                roughness={0.55}
                metalness={0.12}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Ribbon bookmark */}
      <mesh
        position={[w * 0.2, h / 2 + 0.01, d * 0.6]}
        rotation={[0.1, 0, 0.05]}
      >
        <boxGeometry args={[0.03, 0.35, 0.004]} />
        <meshStandardMaterial
          color={materialProps.ribbonColor}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Hover glow effect */}
      {hovered && !isOpen && (
        <mesh position={[0, 0, d / 2]}>
          <boxGeometry args={[w + 0.08, h + 0.08, d + 0.08]} />
          <meshBasicMaterial
            color={materialProps.accentColor}
            transparent
            opacity={0.06}
          />
        </mesh>
      )}

      {/* Bookmark indicator */}
      {showBookmark && bookmarkCount > 0 && (
        <Bookmark bookHeight={h} count={bookmarkCount} />
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
    bookmarkRef.current.rotation.z = Math.sin(time * (2 * Math.PI / 3)) * (Math.PI / 60);
  });

  return (
    <group ref={bookmarkRef} position={[0.08, bookHeight / 2 + 0.12, 0.3]}>
      <mesh castShadow>
        <boxGeometry args={[0.04, 0.3, 0.005]} />
        <meshStandardMaterial color="#B8922A" roughness={0.4} metalness={0.3} />
      </mesh>
      {count > 0 && (
        <mesh position={[0, 0.12, 0.005]}>
          <circleGeometry args={[0.04, 12]} />
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

const easeOutCubic = (t) => --t * t * t + 1;

export default Book;
