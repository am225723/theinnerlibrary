// Library Scene for The Inner Library 3D Bookshelf

import React, { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Bookshelf from '../components/Bookshelf';
import Lighting from '../components/Lighting';
import CameraController from '../components/CameraController';
import { useBookshelfLayout } from '../hooks/useBookshelfLayout';
import { getEntries } from '../../utils/storage';

const LibraryScene = ({ onBookSelect }) => {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [, setHoveredBookId] = useState(null);

  // Get saved entries for additional books
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
      setTimeout(() => {
        onBookSelect(book);
      }, 1000);
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
      camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 50 }}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block'
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

      <Suspense fallback={null}>
        <Lighting />

        <CameraController
          target={{ x: 0, y: -1, z: 0 }}
          position={{ x: 0, y: 0, z: 10 }}
        />

        <Bookshelf
          books={books}
          onBookClick={handleBookClick}
          onBookHover={handleBookHover}
          onBookHoverEnd={handleBookHoverEnd}
          selectedBookId={selectedBookId}
          bookmarks={bookmarks}
        />

        {/* Floor */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -5, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial
            color="#E8E0D0"
            roughness={0.95}
            metalness={0}
          />
        </mesh>
      </Suspense>

      {/* Orbit controls with limited range */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={6}
        maxDistance={15}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        target={[0, -1, 0]}
      />
    </Canvas>
  );
};

export default LibraryScene;