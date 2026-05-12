// Bookmark component for The Inner Library 3D Bookshelf

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Bookmark3D = ({ 
  position = [0, 0, 0], 
  color = '#B8922A', 
  count = 1, 
  type = 'daily',
  animated = true,
}) => {
  const groupRef = useRef();

  // Bookmark type styling
  const bookmarkStyles = {
    daily: { color: '#B8922A', badgeColor: '#B8922A' },      // Gold ribbon
    weekly: { color: '#C0C0C0', badgeColor: '#C0C0C0' },      // Silver ribbon
    unfinished: { color: '#B8922A', badgeColor: '#CC3333' },   // Gold with red tip
    bookmarked: { color: '#B8922A', badgeColor: '#B8922A' },   // Gold with star
    therapist: { color: '#4A7AB5', badgeColor: '#4A7AB5' },    // Blue ribbon
  };

  const style = bookmarkStyles[type] || bookmarkStyles.daily;

  // Sway animation
  useFrame((state) => {
    if (!groupRef.current || !animated) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(time * (2 * Math.PI / 3)) * (Math.PI / 60);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main ribbon */}
      <mesh castShadow>
        <boxGeometry args={[0.06, 0.35, 0.005]} />
        <meshStandardMaterial
          color={style.color}
          roughness={0.4}
          metalness={0.3}
          emissive={style.color}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Ribbon V-cut at bottom */}
      <mesh position={[0, -0.19, 0]} castShadow>
        <boxGeometry args={[0.06, 0.04, 0.005]} />
        <meshStandardMaterial
          color={style.color}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Red tip for unfinished entries */}
      {type === 'unfinished' && (
        <mesh position={[0, -0.21, 0]}>
          <boxGeometry args={[0.06, 0.02, 0.005]} />
          <meshStandardMaterial
            color="#CC3333"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* Count badge */}
      {count > 0 && (
        <group position={[0, 0.2, 0.004]}>
          <mesh>
            <circleGeometry args={[0.05, 16]} />
            <meshBasicMaterial color={style.badgeColor} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Bookmark3D;
