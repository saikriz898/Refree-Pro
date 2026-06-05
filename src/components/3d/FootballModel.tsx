'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useLoader } from '@react-three/fiber';

function SoccerBall() {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, '/football_texture.png');

  // To prevent the texture from being too bright if colorSpace isn't perfectly set
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.7;
      groupRef.current.rotation.x += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.4} 
          metalness={0.1}
          envMapIntensity={1.0}
        />
      </mesh>
    </group>
  );
}

export function FootballModel({ size = 300 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ width: size, height: size }} className="animate-float">
        <Canvas camera={{ position: [0, 0, 2.5] }}>
          <ambientLight intensity={0.55} />
          {/* Professional directional keylight for specularity */}
          <directionalLight 
            position={[4, 5, 3]} 
            intensity={1.8} 
            color="#ffffff"
          />
          {/* Blue accent backlight */}
          <pointLight position={[-4, -2, -3]} intensity={1.5} color="#3b82f6" />
          <Suspense fallback={null}>
            <SoccerBall />
          </Suspense>
        </Canvas>
      </div>
      {/* Glowing breathing drop shadow underneath ball */}
      <div className="w-24 h-1.5 bg-primary/15 rounded-full blur-md mt-2 animate-pulse" />
    </div>
  );
}
