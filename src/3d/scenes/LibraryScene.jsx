// LibraryScene.jsx – The Inner Library
// Rich Victorian-style private library environment with warm lighting

import React, { useState, useCallback, Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Bookshelf from '../components/Bookshelf';
import { useBookshelfLayout } from '../hooks/useBookshelfLayout';
import { getEntries } from '../../utils/storage';

// ─── wallpaper texture ────────────────────────────────────────────────────────
function buildWallpaperTexture() {
  const W = 512, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // warm cream with subtle variation
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   '#E8E0D0');
  bg.addColorStop(0.3, '#E5DBC8');
  bg.addColorStop(0.6, '#E8E3D4');
  bg.addColorStop(1,   '#E0D5C0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // fine paper grain
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillStyle = Math.random() > 0.5 ? '#C4B090' : '#F5F0E5';
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;

  // elegant damask pattern with better detail
  ctx.globalAlpha = 0.08;
  const cell = 96;
  for (let row = -1; row < H / cell + 1; row++) {
    for (let col = -1; col < W / cell + 1; col++) {
      const cx = col * cell + (row % 2) * cell * 0.5;
      const cy = row * cell * 0.866;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      
      // outer border
      ctx.strokeStyle = '#8B7040';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-18, -18, 36, 36);
      
      // inner detail
      ctx.strokeStyle = '#A08050';
      ctx.lineWidth = 1;
      ctx.strokeRect(-12, -12, 24, 24);
      
      // center flourish
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.bezierCurveTo(-6, -8, 0, -8, 0, 0);
      ctx.bezierCurveTo(0, 8, 6, 8, 6, 0);
      ctx.stroke();
      
      // diagonal accents
      ctx.strokeStyle = '#9A7848';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-14, -14);
      ctx.lineTo(-8, -8);
      ctx.moveTo(14, 14);
      ctx.lineTo(8, 8);
      ctx.stroke();
      
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;

  // corner flourishes
  ctx.globalAlpha = 0.06;
  const corners = [[0, 0], [W, 0], [0, H], [W, H]];
  corners.forEach(([bx, by]) => {
    ctx.save();
    ctx.translate(bx, by);
    if (bx === W) ctx.scale(-1, 1);
    if (by === H) ctx.scale(1, -1);
    
    ctx.strokeStyle = '#7A6030';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.quadraticCurveTo(0, 0, 80, 0);
    ctx.stroke();
    
    // ornamental scroll
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.bezierCurveTo(25, 15, 15, 25, 0, 25);
    ctx.moveTo(0, 25);
    ctx.bezierCurveTo(10, 25, 20, 35, 20, 0);
    ctx.stroke();
    
    ctx.restore();
  });
  ctx.globalAlpha = 1;

  // aging effects with more variety
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 50 + Math.random() * 180;
    
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    const shade = Math.random() > 0.5;
    gr.addColorStop(0, shade ? 'rgba(150,120,80,0.035)' : 'rgba(200,190,170,0.025)');
    gr.addColorStop(0.5, shade ? 'rgba(130,100,60,0.02)' : 'rgba(180,170,150,0.015)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // subtle texture scratches
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const len = 5 + Math.random() * 25;
    const angle = Math.random() * Math.PI * 2;
    
    ctx.strokeStyle = '#5A4020';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3.5, 2.5);
  tex.anisotropy = 8;
  return tex;
}

// ─── wood floor texture ───────────────────────────────────────────────────────
function buildFloorTexture() {
  const W = 512, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const plankH = H / 4;
  const colors = ['#B8956A', '#AD8A60', '#C29E74', '#A87E54'];

  for (let row = 0; row < 4; row++) {
    const offset = (row % 2) * 128;
    const y = row * plankH;
    for (let col = 0; col < 6; col++) {
      const x = col * 100 - offset;
      ctx.fillStyle = colors[col % colors.length];
      ctx.fillRect(x, y, 98, plankH - 1);
      // grain
      for (let g = 0; g < 30; g++) {
        const gx = x + Math.random() * 98;
        const gy = y + Math.random() * (plankH - 1);
        ctx.fillStyle = `rgba(0,0,0,${0.02 + Math.random() * 0.04})`;
        ctx.fillRect(gx, gy, 1 + Math.random() * 3, 0.5);
      }
    }
    // plank gap
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, y + plankH - 1, W, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 4);
  tex.anisotropy = 8;
  return tex;
}

// ─── Ornate window ────────────────────────────────────────────────────────────
const Window = ({ position }) => (
  <group position={position}>
    {/* Dark wood outer frame */}
    <mesh castShadow>
      <boxGeometry args={[2.1, 3.0, 0.14]} />
      <meshStandardMaterial color="#3A2810" roughness={0.65} metalness={0.06} />
    </mesh>
    {/* Warm glass */}
    <mesh position={[0, 0, 0.074]}>
      <planeGeometry args={[1.72, 2.62]} />
      <meshStandardMaterial
        color="#FFF6E0"
        emissive="#FFCC70"
        emissiveIntensity={0.55}
        transparent
        opacity={0.82}
        roughness={0.08}
        metalness={0.04}
      />
    </mesh>
    {/* Glazing bars */}
    <mesh position={[0, 0, 0.082]}>
      <boxGeometry args={[1.74, 0.05, 0.025]} />
      <meshStandardMaterial color="#3A2810" roughness={0.65} metalness={0.05} />
    </mesh>
    <mesh position={[0, 0, 0.082]}>
      <boxGeometry args={[0.05, 2.64, 0.025]} />
      <meshStandardMaterial color="#3A2810" roughness={0.65} metalness={0.05} />
    </mesh>
    {/* Horizontal divider */}
    <mesh position={[0, 0.22, 0.082]}>
      <boxGeometry args={[1.74, 0.04, 0.025]} />
      <meshStandardMaterial color="#3A2810" roughness={0.65} metalness={0.05} />
    </mesh>
    {/* Sill */}
    <mesh position={[0, -1.45, 0.11]} castShadow>
      <boxGeometry args={[2.3, 0.07, 0.28]} />
      <meshStandardMaterial color="#4A3018" roughness={0.62} metalness={0.05} />
    </mesh>
    {/* Window light */}
    <pointLight position={[0, 0, 1.8]} color="#FFE0A0" intensity={1.4} distance={9} decay={2} />
  </group>
);

// ─── Ceiling lamp ─────────────────────────────────────────────────────────────
const CeilingLamp = ({ position }) => {
  const shadeRef = useRef();
  useFrame(({ clock }) => {
    if (!shadeRef.current) return;
    shadeRef.current.material.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 0.8) * 0.03;
  });
  return (
    <group position={position}>
      {/* Chain */}
      <mesh>
        <cylinderGeometry args={[0.005, 0.005, 0.35, 6]} />
        <meshStandardMaterial color="#8B7228" roughness={0.30} metalness={0.75} />
      </mesh>
      {/* Brass collar */}
      <mesh position={[0, -0.175, 0]}>
        <cylinderGeometry args={[0.055, 0.040, 0.055, 16]} />
        <meshStandardMaterial color="#B8922A" roughness={0.28} metalness={0.72} />
      </mesh>
      {/* Shade */}
      <mesh ref={shadeRef} position={[0, -0.34, 0]}>
        <coneGeometry args={[0.28, 0.30, 24, 1, true]} />
        <meshStandardMaterial
          color="#C8A850"
          roughness={0.55}
          metalness={0.12}
          emissive="#D4A020"
          emissiveIntensity={0.40}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight position={[0, -0.38, 0]} color="#FFD070" intensity={1.1} distance={7} decay={2} />
    </group>
  );
};

// ─── Rug ─────────────────────────────────────────────────────────────────────
const Rug = ({ position }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[5.5, 3.8]} />
      <meshStandardMaterial color="#8B2020" roughness={0.96} metalness={0} />
    </mesh>
    {/* Border */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.001]}>
      <planeGeometry args={[5.1, 3.4]} />
      <meshStandardMaterial color="#C8A820" roughness={0.96} metalness={0} transparent opacity={0.25} />
    </mesh>
  </group>
);

// ─── Dust particles ───────────────────────────────────────────────────────────
const DustParticles = () => {
  const ref   = useRef();
  const count = 50;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t   = clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += Math.sin(t * 0.28 + i) * 0.00045;
      pos[i * 3 + 1] += Math.cos(t * 0.19 + i * 0.4) * 0.00030;
      pos[i * 3 + 2] += Math.sin(t * 0.23 + i * 0.6) * 0.00038;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.013}
        color="#FFE8C0"
        transparent
        opacity={0.45}
        sizeAttenuation
      />
    </points>
  );
};

// ─── Wainscoting panels ───────────────────────────────────────────────────────
const Wainscoting = () => {
  const panels = [-3.5, -2.1, -0.7, 0.7, 2.1, 3.5];
  return (
    <group>
      {/* Horizontal rail */}
      <mesh position={[0, -2.55, -1.34]} castShadow>
        <boxGeometry args={[11, 0.08, 0.065]} />
        <meshStandardMaterial color="#C8B89A" roughness={0.70} metalness={0.04} />
      </mesh>
      {/* Top cap rail */}
      <mesh position={[0, -2.50, -1.30]}>
        <boxGeometry args={[11, 0.03, 0.09]} />
        <meshStandardMaterial color="#D8C8A8" roughness={0.65} metalness={0.05} />
      </mesh>
      {/* Vertical stiles */}
      {panels.map((x, i) => (
        <mesh key={i} position={[x, -3.25, -1.34]}>
          <boxGeometry args={[0.055, 1.45, 0.05]} />
          <meshStandardMaterial color="#C0B090" roughness={0.72} metalness={0.03} />
        </mesh>
      ))}
      {/* Panel insets */}
      {panels.slice(0, -1).map((x, i) => (
        <mesh key={i} position={[x + 0.7, -3.25, -1.32]}>
          <planeGeometry args={[1.2, 1.3]} />
          <meshStandardMaterial color="#C8BA9C" roughness={0.88} metalness={0} />
        </mesh>
      ))}
    </group>
  );
};

// ─── SceneContent ─────────────────────────────────────────────────────────────
const LibrarySceneContent = ({ onBookSelect, onBookOpen, onBookReturn, returnToShelfId,
  openBookScale = 1.2, openBookPosX = 0, openBookPosZ = 3.5, openBookPosY = 0.2,
  overlayOffsetX = 0.22, overlayOffsetY = 0, overlayWidthScale = 1.0, overlayHeightScale = 1.0 }) => {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [, setHoveredBookId] = useState(null);

  const entries   = getEntries();
  const { books } = useBookshelfLayout(entries.slice(0, 8));

  const wallpaperTex = useMemo(() => buildWallpaperTexture(), []);
  const floorTex     = useMemo(() => buildFloorTexture(),     []);

  const bookmarks = {};
  entries.forEach((e) => {
    if (e.toolId) bookmarks[e.toolId] = (bookmarks[e.toolId] || 0) + 1;
  });

  const handleBookClick = useCallback((book) => {
    setSelectedBookId(book.id);
    if (onBookSelect) onBookSelect(book);
  }, [onBookSelect]);

  const handleBookOpen = useCallback((book) => {
    if (onBookOpen) onBookOpen(book);
  }, [onBookOpen]);

  const handleBookReturn = useCallback((bookId) => {
    setSelectedBookId(null);
    if (onBookReturn) onBookReturn(bookId);
  }, [onBookReturn]);

  return (
    <>
      <fog attach="fog" args={['#E8DDD0', 11, 24]} />
      <color attach="background" args={['#E8DDD0']} />

      <Suspense fallback={null}>
        <Environment preset="apartment" />

        {/* ── Lights ── */}
        {/* Primary warm sun from upper-right */}
        <directionalLight
          position={[6, 9, 5]}
          intensity={1.6}
          color="#FFF4E0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={22}
          shadow-camera-left={-11}
          shadow-camera-right={11}
          shadow-camera-top={11}
          shadow-camera-bottom={-11}
          shadow-bias={-0.00015}
        />
        {/* Soft fill */}
        <ambientLight intensity={0.38} color="#FFF6EC" />
        {/* Back-rim bounce */}
        <directionalLight position={[-4, 4, -4]} intensity={0.28} color="#FFE5CC" />
        {/* Left-side window spill */}
        <pointLight position={[-5, 1.5, 2]} intensity={0.65} color="#FFD8A0" distance={9} decay={2} />
        {/* Overhead warm fill */}
        <pointLight position={[0, 5, 0.5]} intensity={0.45} color="#FFF0CC" distance={7} decay={2} />

        {/* ── Room shell ── */}

        {/* Back wall */}
        <mesh position={[0, -0.5, -1.5]} receiveShadow>
          <planeGeometry args={[15, 13]} />
          <meshStandardMaterial map={wallpaperTex} roughness={0.94} metalness={0} />
        </mesh>

        {/* Left wall */}
        <mesh position={[-7.5, -0.5, 4]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[13, 13]} />
          <meshStandardMaterial color="#DDD5C3" roughness={0.92} metalness={0} />
        </mesh>

        {/* Right wall */}
        <mesh position={[7.5, -0.5, 4]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[13, 13]} />
          <meshStandardMaterial color="#DDD5C3" roughness={0.92} metalness={0} />
        </mesh>

        {/* Ceiling */}
        <mesh position={[0, 5.5, 4]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 13]} />
          <meshStandardMaterial color="#EEE8DC" roughness={0.96} metalness={0} />
        </mesh>

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.1, 4]} receiveShadow>
          <planeGeometry args={[22, 16]} />
          <meshStandardMaterial map={floorTex} color="#B08850" roughness={0.80} metalness={0.02} />
        </mesh>

        {/* Crown moulding */}
        <mesh position={[0, 5.30, -1.38]}>
          <boxGeometry args={[15, 0.18, 0.12]} />
          <meshStandardMaterial color="#EDE5D8" roughness={0.80} metalness={0} />
        </mesh>

        {/* Baseboard */}
        <mesh position={[0, -4.98, -1.38]} castShadow>
          <boxGeometry args={[15, 0.22, 0.08]} />
          <meshStandardMaterial color="#6A5040" roughness={0.68} metalness={0.04} />
        </mesh>

        {/* Wainscoting */}
        <Wainscoting />

        {/* Window */}
        <Window position={[-7.3, 0.8, 2.2]} />

        {/* Ceiling lamps */}
        <CeilingLamp position={[-2.5, 4.8, 0.5]} />
        <CeilingLamp position={[ 2.5, 4.8, 0.5]} />

        {/* Rug */}
        <Rug position={[0, -5.07, 3.2]} />

        {/* ── Bookshelf ── */}
        <Bookshelf
          books={books}
          onBookClick={handleBookClick}
          onBookHover={setHoveredBookId}
          onBookHoverEnd={() => setHoveredBookId(null)}
          selectedBookId={selectedBookId}
          bookmarks={bookmarks}
          onBookOpen={handleBookOpen}
          onBookReturn={handleBookReturn}
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

        {/* Bookends */}
        <Bookend position={[-4.1, 0.07, 0.22]} />
        <Bookend position={[ 4.1, 0.07, 0.22]} mirror />
        <Bookend position={[-3.9, -2.51, 0.22]} />
        <Bookend position={[ 3.9, -2.51, 0.22]} mirror />

        {/* ── Wall decorations ── */}
        {/* Painting on right wall */}
        <Painting position={[6.8, 1.2, 1.5]} />
        <Painting position={[6.8, 1.2, 4.0]} width={1.0} height={1.2} />
        {/* Painting on left wall (near window) */}
        <Painting position={[-6.8, 1.5, 5.0]} width={1.2} height={0.8} />

        {/* Mirror on right wall */}
        <HangingMirror position={[6.8, 1.0, 3.0]} />

        {/* Wall clock on back wall */}
        <WallClock position={[4.5, 2.5, -1.42]} />

        {/* ── Floor decorations ── */}
        {/* Side table with book */}
        <SideTable position={[-5.5, -5.08, 3.5]} />

        {/* Floor plant */}
        <FloorPlant position={[5.0, -5.08, 4.0]} />

        {/* Second plant near window */}
        <FloorPlant position={[-5.0, -5.08, 1.0]} />

        {/* Decorative globe on shelf */}
        <DecorativeGlobe position={[3.2, 0.10, 0.30]} />

        {/* Stacked books on shelf */}
        <StackedBooks position={[-3.5, -2.44, 0.30]} />
        <StackedBooks position={[3.5, 0.07, 0.35]} />

        <DustParticles />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={4.5}
        maxDistance={11}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        minAzimuthAngle={-Math.PI / 5}
        maxAzimuthAngle={Math.PI / 5}
        target={[0, -0.2, 0]}
        enableDamping
        dampingFactor={0.06}
      />
    </>
  );
};

// ─── Wall Painting ──────────────────────────────────────────────
const Painting = ({ position, width = 1.4, height = 1.0 }) => {
  const paintTex = useMemo(() => {
    const W = 256, H = Math.round(256 * (height / width));
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Sky-like abstract
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#87CEEB');
    sky.addColorStop(0.4, '#B0D4E8');
    sky.addColorStop(0.6, '#E8D5A0');
    sky.addColorStop(1, '#C8A060');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // Abstract landscape hills
    ctx.fillStyle = '#6B8E5A';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.7);
    ctx.quadraticCurveTo(W * 0.25, H * 0.55, W * 0.5, H * 0.65);
    ctx.quadraticCurveTo(W * 0.75, H * 0.75, W, H * 0.6);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.fill();

    ctx.fillStyle = '#5A7D4A';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.8);
    ctx.quadraticCurveTo(W * 0.3, H * 0.68, W * 0.6, H * 0.78);
    ctx.quadraticCurveTo(W * 0.85, H * 0.85, W, H * 0.75);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.fill();

    // Soft aging
    ctx.fillStyle = 'rgba(240, 230, 210, 0.08)';
    ctx.fillRect(0, 0, W, H);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  }, [width, height]);

  return (
    <group position={position}>
      {/* Gilt frame */}
      <mesh castShadow>
        <boxGeometry args={[width + 0.14, height + 0.14, 0.06]} />
        <meshStandardMaterial color="#8B7228" roughness={0.35} metalness={0.65} />
      </mesh>
      {/* Inner frame bevel */}
      <mesh position={[0, 0, 0.031]}>
        <boxGeometry args={[width + 0.04, height + 0.04, 0.01]} />
        <meshStandardMaterial color="#B8922A" roughness={0.30} metalness={0.70} />
      </mesh>
      {/* Canvas */}
      <mesh position={[0, 0, 0.037]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={paintTex} roughness={0.85} metalness={0} />
      </mesh>
    </group>
  );
};

// ─── Hanging Mirror ─────────────────────────────────────────────
const HangingMirror = ({ position }) => (
  <group position={position}>
    {/* Ornate frame */}
    <mesh castShadow>
      <boxGeometry args={[0.95, 1.3, 0.05]} />
      <meshStandardMaterial color="#7A6520" roughness={0.32} metalness={0.70} />
    </mesh>
    {/* Inner bevel */}
    <mesh position={[0, 0, 0.027]}>
      <boxGeometry args={[0.82, 1.17, 0.01]} />
      <meshStandardMaterial color="#B8922A" roughness={0.28} metalness={0.72} />
    </mesh>
    {/* Mirror surface */}
    <mesh position={[0, 0, 0.033]}>
      <planeGeometry args={[0.76, 1.11]} />
      <meshStandardMaterial
        color="#C8D0D8"
        roughness={0.05}
        metalness={0.92}
        envMapIntensity={0.6}
      />
    </mesh>
    {/* Chain */}
    <mesh position={[0, 0.72, 0]}>
      <cylinderGeometry args={[0.008, 0.008, 0.4, 6]} />
      <meshStandardMaterial color="#8B7228" roughness={0.30} metalness={0.75} />
    </mesh>
  </group>
);

// ─── Wall Clock ─────────────────────────────────────────────────
const WallClock = ({ position }) => {
  const handRef = useRef();
  useFrame(({ clock }) => {
    if (!handRef.current) return;
    handRef.current.rotation.z = -(clock.getElapsedTime() * 0.1) % (Math.PI * 2);
  });

  return (
    <group position={position}>
      {/* Wooden case */}
      <mesh castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.08, 32]} />
        <meshStandardMaterial color="#5C3D20" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Face */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0.042]}>
        <circleGeometry args={[0.32, 32]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.90} metalness={0} />
      </mesh>
      {/* Hour marks */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * Math.PI / 6) * 0.27,
            Math.cos(i * Math.PI / 6) * 0.27,
            0.045,
          ]}
        >
          <boxGeometry args={[0.012, 0.035, 0.004]} />
          <meshStandardMaterial color="#1B2A4A" roughness={0.50} metalness={0.10} />
        </mesh>
      ))}
      {/* Hour hand */}
      <mesh position={[0, 0.08, 0.048]}>
        <boxGeometry args={[0.014, 0.14, 0.003]} />
        <meshStandardMaterial color="#1B2A4A" roughness={0.50} metalness={0.10} />
      </mesh>
      {/* Minute hand */}
      <group ref={handRef} position={[0, 0, 0.050]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.010, 0.20, 0.002]} />
          <meshStandardMaterial color="#2A3A5A" roughness={0.50} metalness={0.10} />
        </mesh>
      </group>
      {/* Center pin */}
      <mesh position={[0, 0, 0.052]}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshStandardMaterial color="#B8922A" roughness={0.30} metalness={0.70} />
      </mesh>
    </group>
  );
};

// ─── Side Table ──────────────────────────────────────────────────
const SideTable = ({ position }) => (
  <group position={position}>
    {/* Table top */}
    <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.38, 0.38, 0.04, 24]} />
      <meshStandardMaterial color="#6B4226" roughness={0.60} metalness={0.05} />
    </mesh>
    {/* Leg */}
    <mesh position={[0, 0.27, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.05, 0.50, 12]} />
      <meshStandardMaterial color="#5C3D20" roughness={0.65} metalness={0.05} />
    </mesh>
    {/* Base */}
    <mesh position={[0, 0.03, 0]} receiveShadow>
      <cylinderGeometry args={[0.28, 0.30, 0.04, 24]} />
      <meshStandardMaterial color="#5C3D20" roughness={0.65} metalness={0.05} />
    </mesh>
    {/* Small book on table */}
    <mesh position={[0.05, 0.59, 0.02]} castShadow rotation={[0, 0.3, 0]}>
      <boxGeometry args={[0.22, 0.03, 0.16]} />
      <meshStandardMaterial color="#8B2020" roughness={0.70} metalness={0.03} />
    </mesh>
  </group>
);

// ─── Floor Plant ─────────────────────────────────────────────────
const FloorPlant = ({ position }) => {
  const leafRef = useRef();
  useFrame(({ clock }) => {
    if (!leafRef.current) return;
    const t = clock.getElapsedTime();
    leafRef.current.rotation.z = Math.sin(t * 0.4) * 0.02;
  });

  return (
    <group position={position}>
      {/* Terracotta pot */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.42, 16]} />
        <meshStandardMaterial color="#C8703A" roughness={0.82} metalness={0} />
      </mesh>
      {/* Pot rim */}
      <mesh position={[0, 0.43, 0]} castShadow>
        <cylinderGeometry args={[0.20, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#B86030" roughness={0.80} metalness={0} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 16]} />
        <meshStandardMaterial color="#3A2510" roughness={0.95} metalness={0} />
      </mesh>
      {/* Leaves */}
      <group ref={leafRef} position={[0, 0.70, 0]}>
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          const lean = 0.3 + Math.random() * 0.3;
          return (
            <mesh
              key={i}
              position={[
                Math.sin(angle) * 0.08,
                0.15 + Math.random() * 0.15,
                Math.cos(angle) * 0.08,
              ]}
              rotation={[lean * Math.cos(angle), 0, -lean * Math.sin(angle)]}
            >
              <boxGeometry args={[0.06, 0.28, 0.008]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#4A7A3A' : '#3A6A2A'}
                roughness={0.75}
                metalness={0}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

// ─── Decorative Globe ───────────────────────────────────────────
const DecorativeGlobe = ({ position }) => (
  <group position={position}>
    {/* Stand base */}
    <mesh position={[0, 0, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.10, 0.03, 16]} />
      <meshStandardMaterial color="#5C3D20" roughness={0.55} metalness={0.05} />
    </mesh>
    {/* Stand pillar */}
    <mesh position={[0, 0.08, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.025, 0.14, 8]} />
      <meshStandardMaterial color="#8B7228" roughness={0.35} metalness={0.65} />
    </mesh>
    {/* Meridian ring */}
    <mesh position={[0, 0.22, 0]} rotation={[0, 0, 0]}>
      <torusGeometry args={[0.12, 0.006, 8, 32]} />
      <meshStandardMaterial color="#B8922A" roughness={0.30} metalness={0.70} />
    </mesh>
    {/* Globe sphere */}
    <mesh position={[0, 0.22, 0]} castShadow>
      <sphereGeometry args={[0.11, 24, 24]} />
      <meshStandardMaterial color="#4A6A8A" roughness={0.65} metalness={0.08} />
    </mesh>
  </group>
);

// ─── Stacked Books (horizontal decoration) ───────────────────────
const StackedBooks = ({ position }) => (
  <group position={position}>
    {/* Bottom book */}
    <mesh position={[0, 0.02, 0]} castShadow rotation={[0, 0.15, 0]}>
      <boxGeometry args={[0.30, 0.04, 0.20]} />
      <meshStandardMaterial color="#1B3A5A" roughness={0.65} metalness={0.03} />
    </mesh>
    {/* Middle book */}
    <mesh position={[0.02, 0.06, 0]} castShadow rotation={[0, -0.08, 0]}>
      <boxGeometry args={[0.28, 0.035, 0.18]} />
      <meshStandardMaterial color="#5A1A1A" roughness={0.70} metalness={0.03} />
    </mesh>
    {/* Top book */}
    <mesh position={[-0.01, 0.095, 0]} castShadow rotation={[0, 0.22, 0]}>
      <boxGeometry args={[0.26, 0.03, 0.17]} />
      <meshStandardMaterial color="#2A5A2A" roughness={0.68} metalness={0.03} />
    </mesh>
  </group>
);

// ─── Bookend ─────────────────────────────────────────────────────────────────
const Bookend = ({ position, mirror = false }) => (
  <group position={position} scale={[mirror ? -1 : 1, 1, 1]}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[0.14, 0.038, 0.24]} />
      <meshStandardMaterial color="#1E1E1E" roughness={0.28} metalness={0.72} />
    </mesh>
    <mesh position={[0, 0.13, -0.06]} castShadow>
      <boxGeometry args={[0.028, 0.24, 0.18]} />
      <meshStandardMaterial color="#1A1A1A" roughness={0.28} metalness={0.72} />
    </mesh>
    <mesh position={[0, 0.24, -0.04]} castShadow>
      <boxGeometry args={[0.095, 0.028, 0.16]} />
      <meshStandardMaterial color="#252525" roughness={0.28} metalness={0.72} />
    </mesh>
  </group>
);

// ─── LibraryScene (Canvas wrapper) ───────────────────────────────────────────
const LibraryScene = ({ onBookSelect, onBookOpen, onBookReturn, returnToShelfId,
  openBookScale, openBookPosX, openBookPosZ, openBookPosY,
  overlayOffsetX, overlayOffsetY, overlayWidthScale, overlayHeightScale }) => (
  <Canvas
    shadows
    camera={{ position: [0, -0.2, 8], fov: 42, near: 0.1, far: 55 }}
    style={{
      position: 'absolute',
      top: 0, left: 0,
      width: '100%', height: '100%',
      display: 'block',
    }}
    gl={{
      antialias:    true,
      alpha:        false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
      version: 1,
    }}
    dpr={[1, 2]}
  >
    <LibrarySceneContent
      onBookSelect={onBookSelect}
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
  </Canvas>
);

export default LibraryScene;
