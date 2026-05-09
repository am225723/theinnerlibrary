// Lighting component for The Inner Library 3D Bookshelf

import React from 'react';

const Lighting = () => {
  return (
    <>
      {/* Ambient light - warm cream fill */}
      <ambientLight color="#F5F0E8" intensity={0.6} />

      {/* Main directional light - simulates window light from upper-left */}
      <directionalLight
        color="#FFFFFF"
        intensity={0.8}
        position={[-5, 10, 5]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      {/* Fill light - warm side fill */}
      <pointLight
        color="#E4DBCA"
        intensity={0.3}
        position={[5, 5, 5]}
        distance={20}
        decay={2}
      />

      {/* Rim light - subtle backlight for depth */}
      <pointLight
        color="#B8922A"
        intensity={0.15}
        position={[0, 5, -5]}
        distance={15}
        decay={2}
      />

      {/* Warm accent light from below */}
      <pointLight
        color="#D4A845"
        intensity={0.08}
        position={[0, -3, 3]}
        distance={10}
        decay={2}
      />
    </>
  );
};

export default Lighting;
