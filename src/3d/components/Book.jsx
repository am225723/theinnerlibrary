// 3D Book component for The Inner Library
// Realistic book with proper orientation: spine faces camera on shelf,
// front cover opens like a real book when centered

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
  const frontCoverPivotRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [animState, setAnimState] = useState(BOOK_STATES.IDLE);
  const animProgressRef = useRef(0);

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
        embossing: savedCover.embossing || { enabled: false, depth: 0.5, elements: [] },
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
      embossing: { enabled: false, depth: 0.5, elements: [] },
    };
  }, [book.spineLabel, book.title, savedCover, bookMat]);

  // Book dimensions - each book is unique
  const dimensions = useMemo(() => getBookDimensionsById(book.id), [book.id]);

  // Generate spine texture - vertical text
  const spineTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background gradient for depth
    const bgGrad = ctx.createLinearGradient(0, 0, 128, 0);
    bgGrad.addColorStop(0, materialProps.darkColor);
    bgGrad.addColorStop(0.15, lightenColor(materialProps.darkColor, 15));
    bgGrad.addColorStop(0.85, lightenColor(materialProps.darkColor, 10));
    bgGrad.addColorStop(1, materialProps.darkColor);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 128, 512);

    // Subtle leather grain texture
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, ${0.01 + Math.random() * 0.02})`;
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1);
    }

    // Decorative lines on spine
    ctx.fillStyle = materialProps.accentColor;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(12, 30, 104, 1.5);
    ctx.fillRect(12, 482, 104, 1.5);
    ctx.globalAlpha = 1;

    // Raised band decorations for classic spines
    if (materialProps.spineStyle === 'raised_bands') {
      [0.2, 0.4, 0.6, 0.8].forEach((pos) => {
        const bandY = 512 * pos;
        ctx.fillStyle = lightenColor(materialProps.darkColor, 20);
        ctx.fillRect(8, bandY - 5, 112, 10);
        ctx.fillStyle = materialProps.darkColor;
        ctx.fillRect(8, bandY - 3, 112, 6);
      });
    }

    // Text - written vertically (rotated)
    const text = materialProps.spineText.replace(/\\n/g, ' ');
    ctx.save();
    ctx.translate(64, 256);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = materialProps.accentColor;
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 2;
    ctx.fillText(text, 0, 0);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [materialProps]);

  // Generate front cover texture
  const frontCoverTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // Base cover color with gradient for depth
    const baseGrad = ctx.createLinearGradient(0, 0, 512, 0);
    baseGrad.addColorStop(0, materialProps.coverColor);
    baseGrad.addColorStop(0.05, lightenColor(materialProps.coverColor, 8));
    baseGrad.addColorStop(0.95, lightenColor(materialProps.coverColor, 5));
    baseGrad.addColorStop(1, darkenColor(materialProps.coverColor, 15));
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 512, 768);

    // Leather/cloth grain texture
    const grainIntensity = materialProps.preset === 'leather' ? 2500 :
                            materialProps.preset === 'cloth' ? 4000 :
                            materialProps.preset === 'velvet' ? 5000 : 1500;
    for (let i = 0; i < grainIntensity; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 768;
      const brightness = Math.random() * 12 - 6;
      ctx.fillStyle = `rgba(${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${Math.abs(brightness) / 250})`;
      if (materialProps.preset === 'cloth') {
        // Horizontal weave pattern
        ctx.fillRect(x, y, 3 + Math.random() * 4, 1);
      } else {
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
    }

    // Cover style decorations
    const accent = materialProps.accentColor;

    if (materialProps.coverStyle === 'gilt_border') {
      // Double gold border frame
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(24, 24, 464, 720);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(32, 32, 448, 704);
      // Corner ornaments - fleur-de-lis style dots
      ctx.fillStyle = accent;
      [[28, 28], [484, 28], [28, 740], [484, 740]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      // Center decorative diamond
      ctx.save();
      ctx.translate(256, 300);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(-18, -18, 36, 36);
      ctx.restore();
    } else if (materialProps.coverStyle === 'gilt_center') {
      // Ornate center medallion
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, 432, 688);
      // Central ornate circle
      ctx.beginPath();
      ctx.arc(256, 280, 60, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(256, 280, 50, 0, Math.PI * 2);
      ctx.stroke();
      // Diamond in center
      ctx.fillStyle = accent;
      ctx.save();
      ctx.translate(256, 280);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-12, -12, 24, 24);
      ctx.restore();
      // Decorative dots around
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        ctx.beginPath();
        ctx.arc(256 + Math.cos(angle) * 70, 280 + Math.sin(angle) * 70, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (materialProps.coverStyle === 'modern_title') {
      // Clean modern design - large title text
      ctx.fillStyle = accent;
      ctx.font = 'bold 28px Georgia, serif';
      ctx.textAlign = 'center';
      const words = (book.title || '').split(' ');
      if (words.length > 3) {
        ctx.fillText(words.slice(0, Math.ceil(words.length / 2)).join(' '), 256, 240);
        ctx.fillText(words.slice(Math.ceil(words.length / 2)).join(' '), 256, 280);
      } else {
        ctx.fillText(book.title || '', 256, 260);
      }
      // Gold accent line
      ctx.fillRect(156, 300, 200, 2);
    } else if (materialProps.coverStyle === 'embossed') {
      // Embossed/debossed pattern - concentric rectangles with shadow effect
      for (let i = 0; i < 10; i++) {
        const offset = 24 + i * 8;
        // Light edge (top-left highlight)
        ctx.strokeStyle = lightenColor(materialProps.coverColor, 15 + i * 2);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(offset, offset + 720 - i * 16);
        ctx.lineTo(offset, offset);
        ctx.lineTo(offset + 464 - i * 16, offset);
        ctx.stroke();
        // Dark edge (bottom-right shadow)
        ctx.strokeStyle = darkenColor(materialProps.coverColor, 10 + i * 2);
        ctx.beginPath();
        ctx.moveTo(offset + 464 - i * 16, offset);
        ctx.lineTo(offset + 464 - i * 16, offset + 720 - i * 16);
        ctx.lineTo(offset, offset + 720 - i * 16);
        ctx.stroke();
      }
      // Embossed title area
      ctx.fillStyle = lightenColor(materialProps.coverColor, 10);
      ctx.fillRect(80, 400, 352, 120);
      ctx.strokeStyle = darkenColor(materialProps.coverColor, 8);
      ctx.lineWidth = 1;
      ctx.strokeRect(80, 400, 352, 120);
    } else if (materialProps.coverStyle === 'watercolor') {
      // Soft watercolor wash effect
      for (let i = 0; i < 8; i++) {
        const x = 60 + Math.random() * 392;
        const y = 80 + Math.random() * 500;
        const r = 40 + Math.random() * 60;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, accent + '35');
        gradient.addColorStop(0.6, accent + '18');
        gradient.addColorStop(1, accent + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Subtle gold splatter
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 768;
        ctx.fillStyle = accent + '15';
        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (materialProps.coverStyle === 'minimal') {
      // Clean minimal lines
      ctx.fillStyle = accent;
      ctx.fillRect(60, 60, 392, 1.5);
      ctx.fillRect(60, 708, 392, 1.5);
      // Small centered ornament
      ctx.fillRect(236, 680, 40, 1);
    }

    // Title on cover (all styles except modern_title which has it already)
    if (materialProps.coverStyle !== 'modern_title') {
      ctx.fillStyle = accent;
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 2;
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'center';
      const titleText = book.title || '';
      const words = titleText.split(' ');
      if (words.length > 3) {
        ctx.fillText(words.slice(0, Math.ceil(words.length / 2)).join(' '), 256, 520);
        ctx.fillText(words.slice(Math.ceil(words.length / 2)).join(' '), 256, 550);
      } else if (words.length > 1) {
        ctx.fillText(titleText, 256, 530);
      } else {
        ctx.fillText(titleText, 256, 530);
      }
      ctx.shadowBlur = 0;
    }

    // Embossing overlay
    if (materialProps.embossing?.enabled) {
      ctx.strokeStyle = lightenColor(materialProps.coverColor, 20);
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, 412, 668);
      ctx.strokeStyle = darkenColor(materialProps.coverColor, 15);
      ctx.lineWidth = 1;
      ctx.strokeRect(52, 52, 408, 664);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [materialProps, book.title]);

  // Generate back cover texture (simpler, no decoration)
  const backCoverTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = materialProps.coverColor;
    ctx.fillRect(0, 0, 256, 512);

    // Subtle grain
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 512;
      const b = Math.random() * 8 - 4;
      ctx.fillStyle = `rgba(${b > 0 ? 255 : 0}, ${b > 0 ? 255 : 0}, ${b > 0 ? 255 : 0}, ${Math.abs(b) / 300})`;
      ctx.fillRect(x, y, 2, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [materialProps]);

  // Page edge texture with visible pages
  const pageEdgeTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Cream base
    ctx.fillStyle = '#F5F0E8';
    ctx.fillRect(0, 0, 256, 256);

    // Individual page lines
    for (let y = 0; y < 256; y += 2) {
      const variation = Math.random() * 0.03;
      ctx.fillStyle = `rgba(0,0,0,${0.02 + variation})`;
      ctx.fillRect(0, y, 256, 0.5);
    }

    // Occasional slightly yellowed page
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * 256;
      ctx.fillStyle = 'rgba(210, 180, 120, 0.04)';
      ctx.fillRect(0, y, 256, 3 + Math.random() * 5);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Inner page texture (visible when book opens)
  const innerPageTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // Warm cream paper
    ctx.fillStyle = '#FDFAF3';
    ctx.fillRect(0, 0, 512, 768);

    // Subtle paper grain
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 768;
      ctx.fillStyle = `rgba(0,0,0,${0.005 + Math.random() * 0.01})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Margin lines (very faint)
    ctx.fillStyle = 'rgba(180, 160, 140, 0.08)';
    ctx.fillRect(60, 40, 1, 688); // Left margin

    // Page number at bottom
    ctx.fillStyle = 'rgba(100, 80, 60, 0.15)';
    ctx.font = '12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('1', 256, 740);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  // Animation state machine
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const group = groupRef.current;

    // Idle - gentle breathing
    if (animState === BOOK_STATES.IDLE) {
      const breathe = Math.sin(time * (2 * Math.PI / (TIMINGS.BREATHING_CYCLE / 1000))) * 0.008;
      group.position.y = position[1] + breathe;
      group.position.z = position[2];
      group.position.x = position[0];
      group.rotation.set(0, 0, 0);
      // Reset front cover
      if (frontCoverPivotRef.current) {
        frontCoverPivotRef.current.rotation.y = 0;
      }
    }

    // Hover - lift slightly
    if (animState === BOOK_STATES.HOVER) {
      group.position.y = THREE.MathUtils.lerp(group.position.y, position[1] + 0.06, 0.1);
      group.position.z = THREE.MathUtils.lerp(group.position.z, position[2] + 0.15, 0.08);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0.02, 0.05);
    }

    // Selected - slide forward from shelf, start to turn toward camera
    if (animState === BOOK_STATES.SELECTED) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.SELECTION_SLIDE / 1000));
      const t = easeInOutCubic(animProgressRef.current);
      group.position.z = THREE.MathUtils.lerp(position[2], position[2] + 2.5, t);
      group.position.y = THREE.MathUtils.lerp(position[1], position[1] + 0.15, t);
      // Start rotating so front cover faces camera (rotate 90 degrees around Y)
      group.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 2, t * 0.5);
    }

    // Centered - move to screen center, finish rotating to face camera
    if (animState === BOOK_STATES.CENTERED) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.CENTER_MOVE / 1000));
      const t = easeOutBack(animProgressRef.current);
      group.position.x = THREE.MathUtils.lerp(position[0], 0, t);
      group.position.y = THREE.MathUtils.lerp(position[1] + 0.15, 0.5, t);
      group.position.z = THREE.MathUtils.lerp(position[2] + 2.5, 5.0, t);
      // Continue rotation - book faces camera with front cover visible
      group.rotation.y = THREE.MathUtils.lerp(Math.PI / 4, Math.PI / 2, t);
      group.rotation.z = THREE.MathUtils.lerp(0.02, 0, t);
    }

    // Flipping - open the front cover like a real book (hinge at spine)
    if (animState === BOOK_STATES.FLIPPING) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.BOOK_OPEN / 1000));
      const t = easeOutCubic(animProgressRef.current);
      // Slight tilt as book opens
      group.rotation.y = THREE.MathUtils.lerp(Math.PI / 2, Math.PI / 2 - 0.08, t);
      group.position.z = THREE.MathUtils.lerp(5.0, 4.5, t);
      // Open the front cover - rotates around spine edge
      if (frontCoverPivotRef.current) {
        frontCoverPivotRef.current.rotation.y = THREE.MathUtils.lerp(0, -Math.PI * 0.82, t);
      }
    }

    // Open - book is open, showing pages
    if (animState === BOOK_STATES.OPEN) {
      const gentleFloat = Math.sin(time * 1.5) * 0.003;
      group.position.y = 0.5 + gentleFloat;
    }

    // Returning - go back to shelf
    if (animState === BOOK_STATES.RETURNING) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta / (TIMINGS.RETURN_TO_SHELF / 1000));
      const t = easeInOutCubic(animProgressRef.current);
      group.position.x = THREE.MathUtils.lerp(0, position[0], t);
      group.position.y = THREE.MathUtils.lerp(0.5, position[1], t);
      group.position.z = THREE.MathUtils.lerp(4.5, position[2], t);
      // Rotate back to spine-facing-camera
      group.rotation.y = THREE.MathUtils.lerp(Math.PI / 2, 0, t);
      group.rotation.z = 0;
      // Close the front cover
      if (frontCoverPivotRef.current) {
        frontCoverPivotRef.current.rotation.y = THREE.MathUtils.lerp(-Math.PI * 0.82, 0, t);
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
      // Step 1: Slide out from shelf and start turning
      animProgressRef.current = 0;
      setAnimState(BOOK_STATES.SELECTED);

      // Step 2: Move to center and finish turning to face camera
      setTimeout(() => {
        animProgressRef.current = 0;
        setAnimState(BOOK_STATES.CENTERED);

        // Step 3: Open the front cover
        setTimeout(() => {
          animProgressRef.current = 0;
          if (frontCoverPivotRef.current) {
            frontCoverPivotRef.current.rotation.y = 0;
          }
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

  const w = dimensions.width;
  const h = dimensions.height;
  const d = dimensions.depth;
  const coverThick = 0.025;
  const pageOffset = 0.01;
  const isOpen = animState === BOOK_STATES.FLIPPING || animState === BOOK_STATES.OPEN;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/*
        BOOK ORIENTATION:
        - Book stands upright on shelf
        - Spine faces camera (along -Z toward camera)
        - Front cover faces +X (right side when viewed from front)
        - X = width (spine-to-front), Y = height, Z = depth (front-to-back)

        When centering, we rotate the group 90° around Y so front cover faces camera.
        The front cover opens by rotating around the spine edge (Y axis at X=0).
      */}

      {/* === SPINE (faces camera on shelf) === */}
      <mesh position={[0, 0, d / 2]} castShadow>
        <boxGeometry args={[coverThick, h, d]} />
        <meshStandardMaterial
          map={spineTexture}
          color={materialProps.darkColor}
          roughness={materialProps.preset === 'leather' ? 0.55 : 0.7}
          metalness={0.08}
        />
      </mesh>

      {/* Spine raised bands */}
      {materialProps.spineStyle === 'raised_bands' && (
        <>
          {[-0.25, -0.05, 0.15, 0.35].map((offset, i) => (
            <mesh
              key={`band-${i}`}
              position={[-0.005, h * offset, d / 2]}
              castShadow
            >
              <boxGeometry args={[0.012, 0.035, d + 0.005]} />
              <meshStandardMaterial
                color={lightenColor(materialProps.darkColor, 8)}
                roughness={0.5}
                metalness={0.1}
              />
            </mesh>
          ))}
        </>
      )}

      {/* === BACK COVER (faces -X, behind the pages) === */}
      <mesh position={[w / 2 + coverThick / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[coverThick, h, d - 0.02]} />
        <meshStandardMaterial
          map={backCoverTexture}
          color={materialProps.coverColor}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* === PAGE BLOCK (between covers) === */}
      <mesh position={[w / 2, 0, 0]} castShadow>
        <boxGeometry args={[w - pageOffset * 2, h - 0.06, d - 0.06]} />
        <meshStandardMaterial
          map={pageEdgeTexture}
          color={bookMat.pageColor || '#F5F0E8'}
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      {/* Page edges - top */}
      <mesh position={[w / 2, h / 2 - 0.01, 0]}>
        <boxGeometry args={[w - 0.04, 0.006, d - 0.04]} />
        <meshStandardMaterial color="#EDE8DC" roughness={0.95} metalness={0} />
      </mesh>

      {/* Page edges - bottom */}
      <mesh position={[w / 2, -h / 2 + 0.01, 0]}>
        <boxGeometry args={[w - 0.04, 0.006, d - 0.04]} />
        <meshStandardMaterial color="#EDE8DC" roughness={0.95} metalness={0} />
      </mesh>

      {/* Page edges - front (right side when on shelf) */}
      <mesh position={[w + pageOffset, 0, 0]}>
        <boxGeometry args={[0.006, h - 0.08, d - 0.04]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.95} metalness={0} />
      </mesh>

      {/* === HEADBAND (top of spine, decorative) === */}
      <mesh position={[0.01, h / 2 - 0.005, d / 2]}>
        <boxGeometry args={[w + coverThick, 0.012, 0.03]} />
        <meshStandardMaterial color={materialProps.ribbonColor} roughness={0.4} metalness={0.15} />
      </mesh>

      {/* === TAILBAND (bottom of spine, decorative) === */}
      <mesh position={[0.01, -h / 2 + 0.005, d / 2]}>
        <boxGeometry args={[w + coverThick, 0.012, 0.03]} />
        <meshStandardMaterial color={materialProps.ribbonColor} roughness={0.4} metalness={0.15} />
      </mesh>

      {/* === FRONT COVER WITH OPENING PIVOT === */}
      {/* Pivot group at spine edge (X=0) - rotates around Y axis to open */}
      <group ref={frontCoverPivotRef} position={[0, 0, 0]}>
        {/* The cover itself, offset from pivot by half width */}
        <group position={[w / 2, 0, -d / 2 + coverThick / 2]}>
          {/* Front cover board */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, coverThick]} />
            <meshStandardMaterial
              color={materialProps.coverColor}
              roughness={materialProps.preset === 'leather' ? 0.55 : materialProps.preset === 'modern' ? 0.25 : 0.7}
              metalness={materialProps.preset === 'modern' ? 0.15 : 0.05}
            />
          </mesh>

          {/* Front cover decoration (outer face) */}
          <mesh position={[0, 0, -coverThick / 2 - 0.001]}>
            <planeGeometry args={[w - 0.02, h - 0.02]} />
            <meshStandardMaterial
              map={frontCoverTexture}
              transparent
              opacity={0.98}
              roughness={0.55}
              metalness={0.05}
            />
          </mesh>

          {/* Inner front cover face (visible when open) */}
          <mesh position={[0, 0, coverThick / 2 + 0.001]}>
            <planeGeometry args={[w - 0.02, h - 0.02]} />
            <meshStandardMaterial
              color={darkenColor(materialProps.coverColor, 20)}
              roughness={0.8}
              metalness={0.02}
            />
          </mesh>

          {/* Endpaper on front cover (decorative marbled look when open) */}
          <mesh position={[0, 0, coverThick / 2 + 0.003]}>
            <planeGeometry args={[w - 0.04, h - 0.04]} />
            <meshStandardMaterial
              color="#E8DDD0"
              roughness={0.7}
              metalness={0}
            />
          </mesh>
        </group>

        {/* First visible page when cover opens */}
        <mesh position={[w / 2, 0, -d / 2 + coverThick + 0.01]} rotation={[0, 0, 0]}>
          <planeGeometry args={[w - 0.04, h - 0.06]} />
          <meshStandardMaterial
            map={innerPageTexture}
            roughness={0.9}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Inner pages visible from back when book is open */}
      <mesh position={[w / 2 + 0.01, 0, -0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w - 0.06, h - 0.08]} />
        <meshStandardMaterial
          map={innerPageTexture}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Back cover endpaper (visible when open) */}
      <mesh position={[w / 2 + coverThick / 2 - 0.003, 0, -0.01]}>
        <planeGeometry args={[w - 0.04, h - 0.04]} />
        <meshStandardMaterial
          color="#E8DDD0"
          roughness={0.7}
          metalness={0}
        />
      </mesh>

      {/* === RIBBON BOOKMARK === */}
      <mesh
        position={[w * 0.3, h / 2 + 0.01, d * 0.4]}
        rotation={[0.15, 0, 0.08]}
      >
        <boxGeometry args={[0.025, 0.3, 0.003]} />
        <meshStandardMaterial
          color={materialProps.ribbonColor}
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>

      {/* Ribbon tail */}
      <mesh
        position={[w * 0.3 + 0.01, h / 2 + 0.14, d * 0.25]}
        rotation={[0.3, 0, -0.12]}
      >
        <boxGeometry args={[0.025, 0.12, 0.003]} />
        <meshStandardMaterial
          color={materialProps.ribbonColor}
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>

      {/* Hover glow effect */}
      {hovered && !isOpen && (
        <mesh position={[w / 2, 0, 0]}>
          <boxGeometry args={[w + 0.06, h + 0.06, d + 0.06]} />
          <meshBasicMaterial
            color={materialProps.accentColor}
            transparent
            opacity={0.05}
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
    <group ref={bookmarkRef} position={[0.3, bookHeight / 2 + 0.1, 0.3]}>
      <mesh castShadow>
        <boxGeometry args={[0.04, 0.28, 0.004]} />
        <meshStandardMaterial color="#B8922A" roughness={0.4} metalness={0.3} />
      </mesh>
      {count > 0 && (
        <mesh position={[0, 0.12, 0.004]}>
          <circleGeometry args={[0.035, 12]} />
          <meshBasicMaterial color="#B8922A" />
        </mesh>
      )}
    </group>
  );
};

// Color utility functions
const lightenColor = (hex, amount = 20) => {
  const color = hex.replace('#', '');
  const r = Math.min(255, parseInt(color.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(color.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(color.substring(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const darkenColor = (hex, amount = 20) => {
  const color = hex.replace('#', '');
  const r = Math.max(0, parseInt(color.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(color.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(color.substring(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
