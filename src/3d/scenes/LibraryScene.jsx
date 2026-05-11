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

  // warm cream base
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   '#EDE4D2');
  bg.addColorStop(0.5, '#E8DDC8');
  bg.addColorStop(1,   '#E2D6BE');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // damask-style diamond grid
  ctx.globalAlpha = 0.055;
  const cell = 64;
  for (let row = 0; row < W / cell + 1; row++) {
    for (let col = 0; col < H / cell + 1; col++) {
      const cx = col * cell + (row % 2) * cell * 0.5;
      const cy = row * cell;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = '#8B7040';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-14, -14, 28, 28);
      ctx.strokeRect(-9,  -9,  18, 18);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;

  // light aging wash
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = 70 + Math.random() * 130;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0,   'rgba(160,130,90,0.028)');
    gr.addColorStop(0.6, 'rgba(140,110,70,0.012)');
    gr.addColorStop(1,   'rgba(120,90,50,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

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
const LibrarySceneContent = ({ onBookSelect }) => {
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
    if (onBookSelect) setTimeout(() => onBookSelect(book), 2200);
  }, [onBookSelect]);

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
        />

        {/* Bookends */}
        <Bookend position={[-4.1, 0.07, 0.22]} />
        <Bookend position={[ 4.1, 0.07, 0.22]} mirror />
        <Bookend position={[-3.9, -2.51, 0.22]} />
        <Bookend position={[ 3.9, -2.51, 0.22]} mirror />

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
const LibraryScene = ({ onBookSelect }) => (
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
    <LibrarySceneContent onBookSelect={onBookSelect} />
  </Canvas>
);

export default LibraryScene;
