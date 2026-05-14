// Bookshelf.jsx – The Inner Library
// Realistic floating wall shelf with carved brackets, books, and decorative props

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Book from './Book';
import { SHELF_DIMENSIONS, getBookDimensionsById } from '../utils/bookGeometry';

// ─── shelf wallpaper texture ───────────────────────────────────────────
function buildShelfWallpaperTexture() {
  const W = 512, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // warm cream base
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   '#DDD5C3');
  bg.addColorStop(0.3, '#D8CEBC');
  bg.addColorStop(0.6, '#DDD8C8');
  bg.addColorStop(1,   '#D5CBB8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // fine paper grain
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillStyle = Math.random() > 0.5 ? '#B0A080' : '#F0E8D8';
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;

  // elegant damask-style pattern
  ctx.globalAlpha = 0.10;
  const cell = 80;
  for (let row = -1; row < H / cell + 1; row++) {
    for (let col = -1; col < W / cell + 1; col++) {
      const cx = col * cell + (row % 2) * cell * 0.5;
      const cy = row * cell * 0.866;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      
      ctx.strokeStyle = '#8B7040';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-14, -14, 28, 28);
      
      ctx.strokeStyle = '#A08050';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-9, -9, 18, 18);
      
      // center diamond
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.bezierCurveTo(-5, -6, 0, -6, 0, 0);
      ctx.bezierCurveTo(0, 6, 5, 6, 5, 0);
      ctx.stroke();
      
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;

  // aging spots
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 40 + Math.random() * 120;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    const shade = Math.random() > 0.5;
    gr.addColorStop(0, shade ? 'rgba(140,110,70,0.03)' : 'rgba(190,180,160,0.02)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 2);
  tex.anisotropy = 8;
  return tex;
}

// ─── wood texture ─────────────────────────────────────────────────────────────
function buildWoodTexture(baseColor = '#7A5C38', grain = true) {
  const W = 512, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // base
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, W, H);

  if (grain) {
    // long horizontal grain lines
    for (let i = 0; i < 60; i++) {
      const y  = Math.random() * H;
      const w  = 0.4 + Math.random() * 1.2;
      const a  = 0.04 + Math.random() * 0.10;
      const dark = Math.random() > 0.5;
      ctx.fillStyle = dark
        ? `rgba(0,0,0,${a})`
        : `rgba(255,220,160,${a * 0.5})`;
      ctx.fillRect(0, y, W, w);
    }
    // subtle knot-like ellipses
    for (let i = 0; i < 4; i++) {
      const cx = Math.random() * W, cy = Math.random() * H;
      const rx = 20 + Math.random() * 40, ry = 6 + Math.random() * 12;
      ctx.strokeStyle = `rgba(0,0,0,0.07)`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  // micro noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    const a = 0.008 + Math.random() * 0.015;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(4, 1);
  tex.anisotropy = 8;
  return tex;
}

// ─── Bookshelf (root) ─────────────────────────────────────────────────────────
const Bookshelf = ({
  books = [],
  onBookClick,
  onBookHover,
  onBookHoverEnd,
  selectedBookId,
  bookmarks = {},
  onBookOpen,
  onBookReturn,
  returnToShelfId,
  openBookScale = 1.2,
  openBookPosX = 0,
  openBookPosZ = 3.5,
  openBookPosY = 0.2,
  overlayOffsetX = 0,
  overlayOffsetY = 0,
  overlayWidthScale = 1.0,
  overlayHeightScale = 1.0,
}) => {
  const woodTex     = useMemo(() => buildWoodTexture('#8B6844'), []);
  const darkWoodTex = useMemo(() => buildWoodTexture('#5C3D20'), []);
  const edgeTex     = useMemo(() => buildWoodTexture('#7A5530', false), []);
  const wallpaperTex = useMemo(() => buildShelfWallpaperTexture(), []);

  const shelves = useMemo(() => {
    const per = SHELF_DIMENSIONS.booksPerShelf;
    const count = Math.max(2, Math.ceil(books.length / per));
    return Array.from({ length: count }, (_, i) => ({
      index: i,
      y:     -i * SHELF_DIMENSIONS.shelfGap,
      books: books.slice(i * per, (i + 1) * per),
    }));
  }, [books]);

  return (
    <group>
      {/* Back wall panel behind shelves – wallpaper texture */}
      <mesh position={[0, -1.2, -1.05]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial map={wallpaperTex} roughness={0.92} metalness={0} />
      </mesh>

      {shelves.map((shelf) => (
        <ShelfLevel
          key={shelf.index}
          shelf={shelf}
          woodTex={woodTex}
          darkWoodTex={darkWoodTex}
          edgeTex={edgeTex}
          onBookClick={onBookClick}
          onBookHover={onBookHover}
          onBookHoverEnd={onBookHoverEnd}
          selectedBookId={selectedBookId}
          bookmarks={bookmarks}
          onBookOpen={onBookOpen}
          onBookReturn={onBookReturn}
          returnToShelfId={returnToShelfId}
          openBookScale={openBookScale}
          openBookPosX={openBookPosX}
          openBookPosZ={openBookPosZ}
          openBookPosY={openBookPosY}
          overlayOffsetX={overlayOffsetX}
          overlayOffsetY={overlayOffsetY}
          overlayWidthScale={overlayWidthScale}
          overlayHeightScale={overlayHeightScale}
        />
      ))}

      {/* Decorations – first shelf */}
      <Candle      position={[-SHELF_DIMENSIONS.width / 2 + 0.5,  shelves[0]?.y + 0.88, 0.25]} />
      <SmallPlant  position={[ SHELF_DIMENSIONS.width / 2 - 0.55, shelves[0]?.y + 0.76, 0.28]} />
      <CoffeeCup   position={[ SHELF_DIMENSIONS.width / 2 - 1.30, shelves[0]?.y + 0.66, 0.35]} />
      <PictureFrame position={[-SHELF_DIMENSIONS.width / 2 + 1.6,  shelves[0]?.y + 0.88, 0.18]} />

      {/* Decorations – second shelf */}
      {shelves.length > 1 && (
        <>
          <SaltLamp   position={[ SHELF_DIMENSIONS.width / 2 - 0.42, shelves[1]?.y + 0.72, 0.28]} />
          <SmallPlant position={[-SHELF_DIMENSIONS.width / 2 + 0.45, shelves[1]?.y + 0.78, 0.28]} variant="succulent" />
        </>
      )}
    </group>
  );
};

// ─── ShelfLevel ───────────────────────────────────────────────────────────────
const ShelfLevel = ({
  shelf, woodTex, darkWoodTex, edgeTex,
  onBookClick, onBookHover, onBookHoverEnd, selectedBookId, bookmarks,
  onBookOpen, onBookReturn, returnToShelfId,
  openBookScale = 1.2, openBookPosX = 0, openBookPosZ = 3.5, openBookPosY = 0.2,
  overlayOffsetX = 0, overlayOffsetY = 0,
  overlayWidthScale = 1.0, overlayHeightScale = 1.0,
}) => {
  const sy = shelf.y;
  const W  = SHELF_DIMENSIONS.width;
  const D  = SHELF_DIMENSIONS.depth;

  return (
    <group>
      {/* ── Main plank ── */}
      <mesh position={[0, sy, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, 0.09, D]} />
        <meshStandardMaterial
          map={woodTex}
          color="#8B6844"
          roughness={0.60}
          metalness={0.03}
        />
      </mesh>

      {/* Plank front lip (slightly proud) */}
      <mesh position={[0, sy + 0.048, D / 2 + 0.008]} castShadow>
        <boxGeometry args={[W, 0.10, 0.022]} />
        <meshStandardMaterial
          map={darkWoodTex}
          color="#7A5530"
          roughness={0.55}
          metalness={0.03}
        />
      </mesh>

      {/* Plank back edge */}
      <mesh position={[0, sy + 0.02, -D / 2 + 0.012]}>
        <boxGeometry args={[W, 0.055, 0.02]} />
        <meshStandardMaterial color="#5C3D20" roughness={0.80} metalness={0} />
      </mesh>

      {/* Under-shelf shadow catcher */}
      <mesh position={[0, sy - 0.046, 0]} receiveShadow>
        <boxGeometry args={[W + 0.04, 0.002, D + 0.04]} />
        <meshStandardMaterial color="#3A2510" roughness={1} metalness={0} transparent opacity={0.18} />
      </mesh>

      {/* ── Wall brackets ── */}
      <WallBracket position={[-W / 2 + 0.38, sy - 0.01, -D / 2 + 0.28]} />
      <WallBracket position={[ W / 2 - 0.38, sy - 0.01, -D / 2 + 0.28]} mirror />
      {/* Extra centre bracket for wide shelf */}
      {W > 7 && <WallBracket position={[0, sy - 0.01, -D / 2 + 0.28]} />}

      {/* ── Books ── */}
      <SnugBookRow
        shelfBooks={shelf.books}
        shelfY={sy}
        onBookClick={onBookClick}
        onBookHover={onBookHover}
        onBookHoverEnd={onBookHoverEnd}
        selectedBookId={selectedBookId}
        bookmarks={bookmarks}
        onBookOpen={onBookOpen}
        onBookReturn={onBookReturn}
        returnToShelfId={returnToShelfId}
        openBookScale={openBookScale}
        openBookPosX={openBookPosX}
        openBookPosZ={openBookPosZ}
        openBookPosY={openBookPosY}
        overlayOffsetX={overlayOffsetX}
        overlayOffsetY={overlayOffsetY}
        overlayWidthScale={overlayWidthScale}
        overlayHeightScale={overlayHeightScale}
      />
    </group>
  );
};

// ─── WallBracket ──────────────────────────────────────────────────────────────
const WallBracket = ({ position, mirror = false }) => {
  return (
    <group position={position}>
      {/* Vertical back plate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.065, 0.55, 0.065]} />
        <meshStandardMaterial color="#3E2A14" roughness={0.70} metalness={0.08} />
      </mesh>
      {/* Angled arm */}
      <mesh
        position={[0, -0.14, 0.22]}
        rotation={[Math.atan2(0.28, 0.44), 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.055, 0.52, 0.055]} />
        <meshStandardMaterial color="#4A3018" roughness={0.68} metalness={0.08} />
      </mesh>
      {/* Decorative cap */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.075, 0.025, 0.075]} />
        <meshStandardMaterial color="#2E1A0A" roughness={0.65} metalness={0.10} />
      </mesh>
    </group>
  );
};

// ─── SnugBookRow ─────────────────────────────────────────────────────────────
const SnugBookRow = ({
  shelfBooks, shelfY,
  onBookClick, onBookHover, onBookHoverEnd, selectedBookId, bookmarks,
  onBookOpen, onBookReturn, returnToShelfId,
  openBookScale, openBookPosX, openBookPosZ, openBookPosY,
  overlayOffsetX, overlayOffsetY,
  overlayWidthScale, overlayHeightScale,
}) => {
  const positions = useMemo(() => {
    const gap = 0.03;
    let xOff = 0;
    const raw = shelfBooks.map((book) => {
      const dims = getBookDimensionsById(book.id);
      const pos  = { x: xOff, book, dims };
      xOff += dims.thickness + gap;
      return pos;
    });
    const totalW = xOff - gap;
    const startX = -totalW / 2;
    return raw.map((p) => ({ 
      ...p, 
      x: startX + p.x + p.dims.thickness / 2,
      rotation: p.dims.spineAngle || 0 
    }));
  }, [shelfBooks]);

  return (
    <>
      {positions.map(({ x, book, dims, rotation }) => {
        const bookY = shelfY + dims.height / 2 + 0.052;
        const bookZ = 0.28; // slight forward of shelf centre so spine is near front lip
        return (
          <Book
            key={book.id}
            book={book}
            position={[x, bookY, bookZ]}
            rotation={[0, rotation, 0]}
            onClick={onBookClick}
            onHover={onBookHover}
            onHoverEnd={onBookHoverEnd}
            isSelected={selectedBookId === book.id}
            showBookmark={!!bookmarks[book.id]}
            bookmarkCount={bookmarks[book.id] || 0}
            onBookOpen={onBookOpen}
            onBookReturn={onBookReturn}
            returnToShelf={returnToShelfId === book.id}
            openBookScale={openBookScale}
            openBookPosX={openBookPosX}
            openBookPosZ={openBookPosZ}
            openBookPosY={openBookPosY}
            overlayOffsetX={overlayOffsetX}
            overlayOffsetY={overlayOffsetY}
            overlayWidthScale={overlayWidthScale}
            overlayHeightScale={overlayHeightScale}
          />
        );
      })}
    </>
  );
};

// ─── Candle ───────────────────────────────────────────────────────────────────
const Candle = ({ position }) => {
  const flameRef = useRef();
  useFrame(({ clock }) => {
    if (!flameRef.current) return;
    const t = clock.getElapsedTime();
    flameRef.current.scale.x = 1 + Math.sin(t * 7.3) * 0.09;
    flameRef.current.scale.y = 1 + Math.sin(t * 5.1) * 0.12;
    flameRef.current.position.y = 0.36 + Math.sin(t * 6.7) * 0.005;
  });
  return (
    <group position={position}>
      {/* Brass holder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.055, 20]} />
        <meshStandardMaterial color="#B8922A" roughness={0.28} metalness={0.72} />
      </mesh>
      {/* Candle body */}
      <mesh position={[0, 0.175, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.042, 0.30, 18]} />
        <meshStandardMaterial color="#FAF5EE" roughness={0.62} metalness={0.02} />
      </mesh>
      {/* Wax drip */}
      <mesh position={[0.028, 0.22, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#F0EBE0" roughness={0.7} metalness={0} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.36, 0]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#FFD060" />
      </mesh>
      {/* Flame tip */}
      <mesh position={[0, 0.378, 0]}>
        <coneGeometry args={[0.010, 0.028, 8]} />
        <meshBasicMaterial color="#FF9900" />
      </mesh>
      <pointLight position={[0, 0.37, 0]} color="#FFB830" intensity={0.55} distance={3.2} decay={2} />
    </group>
  );
};

// ─── SmallPlant ───────────────────────────────────────────────────────────────
const SmallPlant = ({ position, variant = 'leafy' }) => (
  <group position={position}>
    <mesh castShadow>
      <cylinderGeometry args={[0.075, 0.058, 0.115, 18]} />
      <meshStandardMaterial
        color={variant === 'succulent' ? '#C8B99A' : '#D8C9B5'}
        roughness={0.88}
        metalness={0}
      />
    </mesh>
    <mesh position={[0, 0.058, 0]}>
      <cylinderGeometry args={[0.077, 0.077, 0.014, 18]} />
      <meshStandardMaterial color="#2C1A0C" roughness={0.96} metalness={0} />
    </mesh>
    {variant === 'succulent' ? (
      [0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 0.028,
            0.095 + i * 0.004,
            Math.sin((angle * Math.PI) / 180) * 0.028,
          ]}
          rotation={[0.35, (angle * Math.PI) / 180, 0]}
          castShadow
        >
          <boxGeometry args={[0.038, 0.062, 0.01]} />
          <meshStandardMaterial color="#6E9B5C" roughness={0.82} metalness={0} />
        </mesh>
      ))
    ) : (
      [0, 55, 110, 165, 220, 275].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 0.048,
            0.115 + i * 0.014,
            Math.sin((angle * Math.PI) / 180) * 0.048,
          ]}
          rotation={[0, (angle * Math.PI) / 180, 0.22]}
          castShadow
        >
          <boxGeometry args={[0.055, 0.115, 0.007]} />
          <meshStandardMaterial color="#357A28" roughness={0.82} metalness={0} />
        </mesh>
      ))
    )}
  </group>
);

// ─── CoffeeCup ────────────────────────────────────────────────────────────────
const CoffeeCup = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.038, 0]} castShadow>
      <cylinderGeometry args={[0.048, 0.038, 0.095, 18]} />
      <meshStandardMaterial color="#F8F4F0" roughness={0.38} metalness={0.04} />
    </mesh>
    <mesh position={[0, 0.082, 0]}>
      <cylinderGeometry args={[0.042, 0.042, 0.018, 18]} />
      <meshStandardMaterial color="#5A2A10" roughness={0.28} metalness={0.12} />
    </mesh>
    {/* Handle */}
    <mesh position={[0.058, 0.038, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.028, 0.007, 8, 18, Math.PI]} />
      <meshStandardMaterial color="#F0ECE8" roughness={0.40} metalness={0.04} />
    </mesh>
    {/* Saucer */}
    <mesh position={[0, 0.005, 0]}>
      <cylinderGeometry args={[0.075, 0.068, 0.010, 20]} />
      <meshStandardMaterial color="#F8F4F0" roughness={0.38} metalness={0.04} />
    </mesh>
  </group>
);

// ─── PictureFrame ─────────────────────────────────────────────────────────────
const PictureFrame = ({ position }) => (
  <group position={position}>
    <mesh castShadow>
      <boxGeometry args={[0.38, 0.48, 0.022]} />
      <meshStandardMaterial color="#4A3018" roughness={0.65} metalness={0.06} />
    </mesh>
    {/* Mat */}
    <mesh position={[0, 0, 0.013]}>
      <planeGeometry args={[0.30, 0.40]} />
      <meshStandardMaterial color="#EDE5D8" roughness={0.92} metalness={0} />
    </mesh>
    {/* Image */}
    <mesh position={[0, 0.02, 0.015]}>
      <planeGeometry args={[0.24, 0.30]} />
      <meshStandardMaterial color="#A4BFA0" roughness={0.88} metalness={0} />
    </mesh>
    {/* Gold frame edge highlight */}
    <mesh position={[0, 0, 0.011]}>
      <boxGeometry args={[0.385, 0.485, 0.004]} />
      <meshStandardMaterial color="#B8922A" roughness={0.30} metalness={0.70} transparent opacity={0.45} />
    </mesh>
  </group>
);

// ─── SaltLamp ─────────────────────────────────────────────────────────────────
const SaltLamp = ({ position }) => {
  const lampRef = useRef();
  useFrame(({ clock }) => {
    if (!lampRef.current) return;
    lampRef.current.material.emissiveIntensity = 0.28 + Math.sin(clock.getElapsedTime() * 2.2) * 0.06;
  });
  return (
    <group position={position}>
      <mesh ref={lampRef} position={[0, 0.12, 0]} castShadow>
        <dodecahedronGeometry args={[0.115, 1]} />
        <meshStandardMaterial
          color="#E87A42"
          roughness={0.88}
          metalness={0}
          transparent
          opacity={0.82}
          emissive="#FF6820"
          emissiveIntensity={0.30}
        />
      </mesh>
      {/* Wooden base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.095, 0.095, 0.038, 18]} />
        <meshStandardMaterial color="#5C3D20" roughness={0.80} metalness={0} />
      </mesh>
      <pointLight position={[0, 0.12, 0]} color="#FF7830" intensity={0.55} distance={2.8} decay={2} />
    </group>
  );
};

export default Bookshelf;
