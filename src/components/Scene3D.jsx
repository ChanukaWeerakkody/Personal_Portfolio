import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Core({ accent }) {
  const group = useRef();
  const pts = useRef();
  const color = useMemo(() => new THREE.Color(`rgb(${accent.split(' ').join(',')})`), [accent]);
  const positions = useMemo(() => {
    const arr = new Float32Array(900);
    for (let i = 0; i < 300; i++) {
      const r = 2.4 + Math.random() * 1.6, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      arr.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3);
    }
    return arr;
  }, []);

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    group.current.rotation.y = t * 0.15 + pointer.x * 0.4;
    group.current.rotation.x = Math.sin(t * 0.3) * 0.15 - pointer.y * 0.3;
    pts.current.rotation.y = -t * 0.05;
  });

  return (
    <>
      <group ref={group}>
        <mesh>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
        </mesh>
        <mesh scale={0.78}>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} />
        </mesh>
      </group>
      <points ref={pts}>
        <bufferGeometry><bufferAttribute attach="attributes-position" array={positions} count={300} itemSize={3} /></bufferGeometry>
        <pointsMaterial color={color} size={0.03} sizeAttenuation transparent opacity={0.8} />
      </points>
    </>
  );
}

export default function Scene3D({ accent }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} frameloop="always" aria-hidden>
      <Core accent={accent} />
    </Canvas>
  );
}
