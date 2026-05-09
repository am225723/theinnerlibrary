// Camera controller for The Inner Library 3D Bookshelf

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CameraController = ({ 
  target = { x: 0, y: -1, z: 0 },
  position = { x: 0, y: 1, z: 8 },
  enabled = true 
}) => {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(target.x, target.y, target.z));
  const positionRef = useRef(new THREE.Vector3(position.x, position.y, position.z));
  const lerpSpeed = 0.05;

  useEffect(() => {
    targetRef.current.set(target.x, target.y, target.z);
    positionRef.current.set(position.x, position.y, position.z);
  }, [target, position]);

  useFrame(() => {
    if (!enabled) return;

    // Smoothly interpolate camera position
    camera.position.lerp(positionRef.current, lerpSpeed);

    // Smoothly interpolate camera look-at target
    const currentTarget = new THREE.Vector3();
    camera.getWorldDirection(currentTarget);
    camera.lookAt(
      THREE.MathUtils.lerp(camera.position.x, targetRef.current.x, lerpSpeed),
      THREE.MathUtils.lerp(camera.position.y, targetRef.current.y, lerpSpeed),
      THREE.MathUtils.lerp(camera.position.z, targetRef.current.z, lerpSpeed)
    );
  });

  return null;
};

export default CameraController;
