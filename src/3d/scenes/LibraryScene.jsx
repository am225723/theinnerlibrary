// Library Scene for The Inner Library 3D Bookshelf
// Warm, inviting atmosphere with realistic lighting

import React, { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Bookshelf from '../components/Bookshelf';
import { useBookshelfLayout } from '../hooks/useBookshelfLayout';
import { getEntries } from '../../utils/storage';

const LibraryScene = ({ onBookSelect }) => {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [, setHoveredBookId] = useState(null);

  const entries = getEntries();
  const { books } = useBookshelfLayout(entries.slice(0, 8));

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
      <color attach="background" args={['#F5F0E8']} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#F5F0E8', 10, 20]} />

      <Suspense fallback={null}>
        {/* Environment lighting for realistic reflections */}
        <Environment preset="apartment" />

        {/* Main directional light - warm sunlight from window */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
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
        <ambientLight intensity={0.35} color="#FFF8F0" />

        {/* Rim light from behind */}
        <directionalLight position={[-3, 5, -3]} intensity={0.3} color="#FFE8CC" />

        {/* Warm accent from left */}
        <pointLight position={[-4, 2, 2]} intensity={0.4} color="#FFD4A0" distance={8} decay={2} />

        <Bookshelf
          books={books}
          onBookClick={handleBookClick}
          onBookHover={handleBookHover}
          onBookHoverEnd={handleBookHoverEnd}
          selectedBookId={selectedBookId}
          bookmarks={bookmarks}
        />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#E8E0D0" roughness={0.95} metalness={0} />
        </mesh>
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
    </Canvas>
  );
};

export default LibraryScene;
