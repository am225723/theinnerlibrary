// useElapsedTime — replacement for clock.getElapsedTime()
//
// THREE.Clock is deprecated in Three.js v0.184 in favour of THREE.Timer.
// R3F's useFrame still exposes `clock`, but calling clock.getElapsedTime()
// triggers a deprecation warning. This hook accumulates delta from useFrame
// into a ref, giving the same monotonically-increasing time without warnings.

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function useElapsedTime() {
  const t = useRef(0);
  useFrame((_, delta) => {
    t.current += delta;
  });
  return t;
}
