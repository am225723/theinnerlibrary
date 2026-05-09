// Book Open Scene for The Inner Library 3D Bookshelf
// This scene handles the transition animation when a book is opened

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Lighting from '../components/Lighting';

// Individual page component
const Page = ({ position, rotation, pageProgress = 0 }) => {
  const pageRef = useRef();

  useFrame((state) => {
    if (!pageRef.current) return;
  });

  return (
    <mesh ref={pageRef} position={position} rotation={rotation}>
      <planeGeometry args={[0.65, 0.9]} />
      <meshStandardMaterial
        color="#F5F0E8"
        roughness={0.9}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Open book component
const OpenBook = ({ book, onClose }) => {
  const groupRef = useRef();
  const [openProgress, setOpenProgress] = useState(0);

  // Opening animation
  useEffect(() => {
    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / 600);
      setOpenProgress(easeOutBack(progress));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <group ref={groupRef}>
      {/* Left cover */}
      <mesh
        position={[-0.4, 0, 0]}
        rotation={[0, openProgress * Math.PI * 0.45, 0]}
      >
        <boxGeometry args={[0.7, 1.0, 0.02]} />
        <meshStandardMaterial color="#1B2A4A" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Right cover */}
      <mesh
        position={[0.4, 0, 0]}
        rotation={[0, -openProgress * Math.PI * 0.45, 0]}
      >
        <boxGeometry args={[0.7, 1.0, 0.02]} />
        <meshStandardMaterial color="#1B2A4A" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Pages - fan out */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * openProgress * Math.PI * 0.8 - openProgress * Math.PI * 0.4;
        const zOffset = Math.sin(angle) * 0.05;
        return (
          <Page
            key={i}
            position={[0, 0, zOffset]}
            rotation={[0, angle * 0.3, 0]}
            pageProgress={openProgress}
          />
        );
      })}

      {/* Spine */}
      <mesh position={[0, 0, -0.35]}>
        <boxGeometry args={[0.02, 1.0, 0.7]} />
        <meshStandardMaterial color="#0F1A2E" roughness={0.6} metalness={0.15} />
      </mesh>
    </group>
  );
};

// Book open scene wrapper
const BookOpenScene = ({ book, onClose }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 3], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#F5F0E8']} />

      <Suspense fallback={null}>
        <Lighting />
        <OpenBook book={book} onClose={onClose} />
      </Suspense>
    </Canvas>
  );
};

// Easing function
const easeOutBack = (t) => {
  const s = 1.70158;
  return (t -= 1) * t * ((s + 1) * t + s) + 1;
};

export default BookOpenScene;
