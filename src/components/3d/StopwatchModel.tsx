'use client';
import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMatchStore } from '@/store/matchStore';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { MatchTimer } from '@/lib/timer';
import { cn } from '@/lib/utils';

interface StopwatchModelProps {
  matchDuration?: number;
  size?: number;
}

const halfLabels: Record<number, string> = { 1: '1ST HALF', 2: '2ND HALF', 3: 'EXTRA TIME' };

function WatchSystem({ matchDuration = 45 }: { matchDuration?: number }) {
  const watchGroup = useRef<THREE.Group>(null);
  const secondHand = useRef<THREE.Group>(null);
  const minuteHand = useRef<THREE.Group>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);
  const msTextRef = useRef<HTMLSpanElement>(null);
  const halfTextRef = useRef<HTMLSpanElement>(null);
  const isRunningRef = useRef<boolean>(false);
  
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsLight(document.documentElement.classList.contains('light'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useFrame((state, delta) => {
    // Floating animation removed per user request
    const matchState = useMatchStore.getState();
    const timer = matchState.timer;
    const elapsedMs = timer.elapsedMs;
    const currentHalf = timer.currentHalf;
    isRunningRef.current = timer.isRunning;
    
    // Calculate total display milliseconds including offset for halves
    const displayElapsed = currentHalf === 2
      ? elapsedMs + matchDuration * 60 * 1000
      : currentHalf === 3
      ? elapsedMs + matchDuration * 2 * 60 * 1000
      : elapsedMs;

    // Seconds calculation (0 to 60000ms is one rotation)
    const secRot = -((displayElapsed % 60000) / 60000) * Math.PI * 2;
    
    // Minutes calculation (0 to matchDuration*60*1000 is one rotation, e.g. 45 mins)
    const minRot = -((displayElapsed % 3600000) / 3600000) * Math.PI * 2;

    if (secondHand.current) secondHand.current.rotation.z = secRot;
    if (minuteHand.current) minuteHand.current.rotation.z = minRot;

    // Update HTML overlay directly to avoid React re-renders at 60fps
    if (timeTextRef.current || msTextRef.current) {
      const display = MatchTimer.formatDisplay(displayElapsed);
      const parts = display.split('.');
      if (timeTextRef.current) timeTextRef.current.innerText = parts[0];
      if (msTextRef.current) msTextRef.current.innerText = parts[1] !== undefined ? `.${parts[1]}` : '';
    }
    if (halfTextRef.current) {
      halfTextRef.current.innerText = halfLabels[currentHalf] ?? 'MATCH';
    }
    
    if (timeTextRef.current && msTextRef.current && halfTextRef.current) {
       const textColor = isLight ? '#ffffff' : '#000000';
       
       timeTextRef.current.style.color = textColor;
       msTextRef.current.style.color = textColor;
       halfTextRef.current.style.color = textColor;
       
       timeTextRef.current.className = 'text-3xl font-extrabold tabular-nums';
       msTextRef.current.className = 'opacity-75 font-bold ml-0.5 text-xl';
    }
  });

  return (
    <group ref={watchGroup} rotation={[-0.1, 0, 0]}>
      {/* Outer casing (Realistic Metallic Silver) */}
      <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.2, 64]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
      </mesh>
      
      {/* Silver trim ring */}
      <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.05, 2.2, 0.05, 64]} />
        <meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.1} />
      </mesh>
      
      {/* Dial base */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2, 0.1, 64]} />
        <meshStandardMaterial color={isLight ? "#0f172a" : "#f8fafc"} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Tick Marks */}
      <group position={[0, 0, 0.06]}>
        {Array.from({ length: 60 }).map((_, i) => {
          const isMajor = i % 5 === 0;
          const angle = (i / 60) * Math.PI * 2;
          const radius = 1.85;
          const x = Math.sin(angle) * radius;
          const y = Math.cos(angle) * radius;
          return (
            <mesh key={i} position={[x, y, 0]} rotation={[0, 0, -angle]}>
              <boxGeometry args={[isMajor ? 0.03 : 0.015, isMajor ? 0.15 : 0.08, 0.01]} />
              <meshStandardMaterial color={isLight ? (isMajor ? "#ffffff" : "#64748b") : (isMajor ? "#0f172a" : "#94a3b8")} />
            </mesh>
          );
        })}
      </group>

      {/* Top Button (Metallic Crown) */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.4, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.2} />
      </mesh>

      {/* Minute hand */}
      <group ref={minuteHand} position={[0, 0, 0.1]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.06, 1.2, 0.02]} />
          <meshStandardMaterial color={isLight ? "#ffffff" : "#334155"} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
          <meshStandardMaterial color={isLight ? "#ffffff" : "#334155"} />
        </mesh>
      </group>
      
      {/* Second hand */}
      <group ref={secondHand} position={[0, 0, 0.12]}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.03, 1.7, 0.015]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Glass cover */}
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2, 2, 0.02, 64]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.1} 
          roughness={0.05} 
          transparent={true} 
          opacity={0.1} 
        />
      </mesh>

      {/* Digital display overlay */}
      <Html transform position={[0, -0.15, 0.12]} className="pointer-events-none select-none flex flex-col items-center">
        <span ref={halfTextRef} className="text-[10px] tracking-widest font-bold mb-1">
          MATCH
        </span>
        <div className="flex items-baseline justify-center min-w-[120px]">
          <span ref={timeTextRef} className="text-3xl font-extrabold tabular-nums">00:00</span>
          <span ref={msTextRef} className="text-xl opacity-75 font-bold ml-0.5">.0</span>
        </div>
      </Html>
    </group>
  );
}

export function StopwatchModel({ matchDuration = 45, size = 320 }: StopwatchModelProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full flex-1 min-h-0">
      <div style={{ maxWidth: size, maxHeight: size }} className="relative z-10 w-full h-full aspect-square">
        <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }} shadows className="w-full h-full">
          <ambientLight intensity={0.6} />
          {/* Key light */}
          <directionalLight 
            position={[5, 8, 5]} 
            intensity={1.5} 
            color="#ffffff"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          {/* Fill light */}
          <pointLight position={[-4, -2, 4]} intensity={0.8} color="#93c5fd" />
          <WatchSystem matchDuration={matchDuration} />
        </Canvas>
      </div>
      {/* Dynamic breathing drop shadow */}
      <div className="w-48 h-3 bg-black/10 dark:bg-black/40 rounded-full blur-xl -mt-6 animate-pulse shrink-0" />
    </div>
  );
}
