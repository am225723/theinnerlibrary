// Lighting component for The Inner Library 3D Bookshelf
// Warm study ambience: reading-lamp SpotLight + cool window DirectionalLight

import React from 'react';

const Lighting = () => {
  return (
    <>
      {/* ── Warm ambient fill (cream candlelight) ── */}
      <ambientLight color="#F5F0E8" intensity={0.45} />

      {/* ── PRIMARY: Warm SpotLight — reading lamp from upper-right ── */}
      <spotLight
        color="#FFE4B5"
        intensity={2.2}
        position={[4, 8, 6]}
        angle={Math.PI / 5}
        penumbra={0.65}
        decay={2}
        distance={22}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
        target-position={[0, 0, 0]}
      />

      {/* ── SECONDARY: Cool window light — north-facing daylight ── */}
      <directionalLight
        color="#B0C4DE"
        intensity={0.55}
        position={[-6, 7, 2]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
      />

      {/* ── Fill light — warm side bounce ── */}
      <pointLight
        color="#E4DBCA"
        intensity={0.3}
        position={[5, 5, 5]}
        distance={20}
        decay={2}
      />

      {/* ── Rim light — subtle backlight for depth ── */}
      <pointLight
        color="#B8922A"
        intensity={0.15}
        position={[0, 5, -5]}
        distance={15}
        decay={2}
      />

      {/* ── Warm accent from below (bounce off wood) ── */}
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
