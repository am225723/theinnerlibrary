// Library Scene for The Inner Library 3D Bookshelf
// Warm, inviting atmosphere with realistic lighting and room environment

import React, { useState, useCallback, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Bookshelf from '../components/Bookshelf';
import { useBookshelfLayout } from '../hooks/useBookshelfLayout';
import { getEntries } from '../../utils/storage';

// Wallpaper texture generator - warm damask pattern
const WallpaperTexture = () => {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base warm cream with slight green undertone
    ctx.fillStyle = '#E8E0D0';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle damask diamond pattern
    ctx.globalAlpha = 0.04;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cx = col * 64 + 32;
        const cy = row * 64 + 32;
        const offset = (row % 2) * 32;

        // Diamond shape
        ctx.save();
        ctx.translate(cx + offset, cy);
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-12, -12, 24, 24);
        // Inner diamond
        ctx.strokeRect(-6, -6, 12, 12);
        ctx.restore();

        // Small dots at intersections
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.arc(cx + offset, cy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // Warm aging/watercolor wash
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 60 + Math.random() * 120;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, 'rgba(180, 160, 130, 0.03)');
      gradient.addColorStop(0.5, 'rgba(160, 140, 110, 0.015)');
      gradient.addColorStop(1, 'rgba(140, 120, 90, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    return tex;
  }, []);

  return texture;
};

// Window with warm light streaming in
const Window = ({ position }) => {
  return (
    <group position={position}>
      {/* Window frame - dark wood */}
      <mesh castShadow>
        <boxGeometry args={[2.2, 2.8, 0.15]} />
        <meshStandardMaterial color="#4A3828" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Window glass - warm light */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[1.8, 2.4]} />
        <meshStandardMaterial
          color="#FFF8E8"
          emissive="#FFE8C0"
          emissiveIntensity={0.6}
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0}
        />
      </mesh>

      {/* Window cross bar - horizontal */}
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[1.8, 0.06, 0.03]} />
        <meshStandardMaterial color="#4A3828" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Window cross bar - vertical */}
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[0.06, 2.4, 0.03]} />
        <meshStandardMaterial color="#4A3828" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Window sill */}
      <mesh position={[0, -1.35, 0.12]} castShadow>
        <boxGeometry args={[2.4, 0.08, 0.3]} />
        <meshStandardMaterial color="#5C4033" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Light streaming from window */}
      <pointLight position={[0, 0, 1.5]} color="#FFE8C0" intensity={1.2} distance={8} decay={2} />
    </group>
  );
};

// Bookend decoration
const Bookend = ({ position, variant = 'horse' }) => {
  return (
    <group position={position}>
      {/* Bookend base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.04, 0.25]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Bookend vertical */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.03, 0.22, 0.2]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Decorative top - L-shape */}
      <mesh position={[0.04, 0.22, 0]} castShadow>
        <boxGeometry args={[0.1, 0.03, 0.18]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
};

// Rug on floor
const Rug = ({ position }) => {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[5, 3.5]} />
      <meshStandardMaterial color="#8B4513" roughness={0.95} metalness={0} />
    </mesh>
  );
};

// Floating dust particles
const DustParticles = () => {
  const particlesRef = React.useRef();
  const count = 40;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const time = state.clock.getElapsedTime();
    const positions = particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      positions[i * 3] += Math.sin(time * 0.3 + i) * 0.0005;
      positions[i * 3 + 1] += Math.cos(time * 0.2 + i * 0.5) * 0.0003;
      positions[i * 3 + 2] += Math.sin(time * 0.25 + i * 0.3) * 0.0004;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#FFE8C0"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

const LibrarySceneContent = ({ onBookSelect }) => {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [, setHoveredBookId] = useState(null);

  const entries = getEntries();
  const { books } = useBookshelfLayout(entries.slice(0, 8));
  const wallpaperTexture = WallpaperTexture();

  // Calculate bookmarks from entries
  const bookmarks = {};
  entries.forEach((entry) => {
    if (entry.toolId) {
      bookmarks[entry.toolId] = (bookmarks[entry.toolId] || 0) + 1;
    }
  });

  const handleBookClick = useCallback((book) => {
    setSelectedBookId(book.id);
    if (onBookSelect) {
      // Delay to allow animation to play
      setTimeout(() => {
        onBookSelect(book);
      }, 2200);
    }
  }, [onBookSelect]);

  const handleBookHover = useCallback((bookId) => {
    setHoveredBookId(bookId);
  }, []);

  const handleBookHoverEnd = useCallback(() => {
    setHoveredBookId(null);
  }, []);

  return (
    <>
      {/* Fog for depth - warm tones */}
      <fog attach="fog" args={['#E8E0D0', 10, 22]} />

      {/* Background color */}
      <color attach="background" args={['#E8E0D0']} />

      <Suspense fallback={null}>
        {/* Environment lighting for realistic reflections */}
        <Environment preset="apartment" />

        {/* Main directional light - warm sunlight streaming from window */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.4}
          color="#FFF5E6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={20}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0001}
        />

        {/* Fill light - soft ambient */}
        <ambientLight intensity={0.3} color="#FFF8F0" />

        {/* Rim light from behind */}
        <directionalLight position={[-3, 5, -3]} intensity={0.25} color="#FFE8CC" />

        {/* Warm accent from left - window light */}
        <pointLight position={[-4, 2, 2]} intensity={0.5} color="#FFD4A0" distance={8} decay={2} />

        {/* Ceiling light - overhead reading lamp */}
        <pointLight position={[0, 4, 1]} intensity={0.3} color="#FFF0D0" distance={6} decay={2} />

        {/* === ROOM ENVIRONMENT === */}

        {/* Back wall - warm wallpaper */}
        <mesh position={[0, -0.5, -1.4]} receiveShadow>
          <planeGeometry args={[14, 12]} />
          <meshStandardMaterial
            map={wallpaperTexture}
            roughness={0.92}
            metalness={0}
          />
        </mesh>

        {/* Left wall */}
        <mesh position={[-7, -0.5, 4]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#DDD5C5" roughness={0.9} metalness={0} />
        </mesh>

        {/* Right wall */}
        <mesh position={[7, -0.5, 4]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#DDD5C5" roughness={0.9} metalness={0} />
        </mesh>

        {/* Ceiling */}
        <mesh position={[0, 5, 4]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 12]} />
          <meshStandardMaterial color="#F0E8D8" roughness={0.95} metalness={0} />
        </mesh>

        {/* Window on left wall */}
        <Window position={[-6.8, 0.5, 2]} />

        {/* Baseboard along back wall */}
        <mesh position={[0, -5.6, -1.3]} castShadow>
          <boxGeometry args={[14, 0.25, 0.08]} />
          <meshStandardMaterial color="#5C4033" roughness={0.7} metalness={0.05} />
        </mesh>

        {/* Crown molding along back wall */}
        <mesh position={[0, 4.9, -1.3]}>
          <boxGeometry args={[14, 0.15, 0.1]} />
          <meshStandardMaterial color="#F5F0E8" roughness={0.8} metalness={0} />
        </mesh>

        {/* Rug on floor in front of bookshelf */}
        <Rug position={[0, -4.95, 3]} />

        {/* Floor - hardwood */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 4]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#C4A872" roughness={0.85} metalness={0} />
        </mesh>

        {/* Floor - wood plank lines */}
        {[0, 1.5, 3, 4.5, 6].map((x, i) => (
          <mesh key={`plank-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-5 + x * 2, -4.98, 4]}>
            <planeGeometry args={[0.02, 20]} />
            <meshStandardMaterial color="#A08050" roughness={0.9} metalness={0} />
          </mesh>
        ))}

        {/* === BOOKSHELF === */}
        <Bookshelf
          books={books}
          onBookClick={handleBookClick}
          onBookHover={handleBookHover}
          onBookHoverEnd={handleBookHoverEnd}
          selectedBookId={selectedBookId}
          bookmarks={bookmarks}
        />

        {/* Bookends on shelves */}
        <Bookend position={[-4.0, 0.06, 0.2]} />
        <Bookend position={[4.0, 0.06, 0.2]} variant="shield" />
        <Bookend position={[-3.8, -2.54, 0.2]} />
        <Bookend position={[3.8, -2.54, 0.2]} />

        {/* Floating dust particles in light */}
        <DustParticles />
      </Suspense>

      {/* Orbit controls - gentle rotation only */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
        target={[0, -0.3, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
};

const LibraryScene = ({ onBookSelect }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, -0.3, 7], fov: 45, near: 0.1, far: 50 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
        version: 1,
      }}
      dpr={[1, 2]}
    >
      <LibrarySceneContent onBookSelect={onBookSelect} />
    </Canvas>
  );
};

export default LibraryScene;
