import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

export default function FloatingGem() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme, isDark } = useTheme();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  const color = isDark ? '#8B5CF6' : '#6366F1'; // violet500 or indigo500

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 0]} />
      <meshStandardMaterial 
        color={color} 
        wireframe={true} 
        transparent 
        opacity={0.4} 
      />
    </mesh>
  );
}
