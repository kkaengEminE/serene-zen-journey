import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

// Gravel ground plane with subtle pattern
function GravelGround({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const groundColor = useMemo(() => {
    const t = Math.min(progress, 1);
    return new THREE.Color().lerpColors(
      new THREE.Color(0x2a2520),
      new THREE.Color(0x8a7d6b),
      t
    );
  }, [progress]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[60, 200]} />
      <meshStandardMaterial color={groundColor} roughness={0.9} />
    </mesh>
  );
}

// Zen garden stones
function Stones() {
  const stones = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        -1.5 + Math.random() * 0.3,
        -i * 8 - 5,
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.7,
      rotation: Math.random() * Math.PI,
    }));
  }, []);

  return (
    <>
      {stones.map((s, i) => (
        <mesh key={i} position={s.position} rotation={[0, s.rotation, 0]}>
          <dodecahedronGeometry args={[s.scale, 0]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? 0x4a4540 : 0x5a5550}
            roughness={0.95}
            flatShading
          />
        </mesh>
      ))}
    </>
  );
}

// Suikinkutsu water drops — floating particles
function WaterDrops({ progress }: { progress: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 80;

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 8 - 1;
      pos[i * 3 + 2] = -Math.random() * 80 - 5;
      spd[i] = 0.2 + Math.random() * 0.5;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    const geo = particlesRef.current.geometry;
    const posAttr = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      const y = posAttr.getY(i);
      posAttr.setY(i, y - speeds[i] * delta * 2);
      if (y < -2) {
        posAttr.setY(i, 6 + Math.random() * 4);
      }
    }
    posAttr.needsUpdate = true;
  });

  const opacity = Math.min(progress * 2, 0.6);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={0xaaccdd}
        transparent
        opacity={opacity}
        sizeAttenuation
      />
    </points>
  );
}

// Fog / mist particles
function MistParticles({ progress }: { progress: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 40;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 5 - 1;
      pos[i * 3 + 2] = -Math.random() * 60 - 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color={0xccbbaa}
        transparent
        opacity={0.15 + progress * 0.2}
        sizeAttenuation
      />
    </points>
  );
}

// Light at the end
function EndLight({ progress }: { progress: number }) {
  const intensity = Math.max(0, (progress - 0.5) * 6);
  return (
    <>
      <pointLight
        position={[0, 2, -80]}
        color={0xfff5e0}
        intensity={intensity}
        distance={40}
      />
      {progress > 0.6 && (
        <mesh position={[0, 1, -75]}>
          <sphereGeometry args={[3 + progress * 5, 16, 16]} />
          <meshBasicMaterial
            color={0xfff8e8}
            transparent
            opacity={Math.min((progress - 0.6) * 2, 0.8)}
          />
        </mesh>
      )}
    </>
  );
}

// Camera controller that moves forward
function CameraRig({ progress }: { progress: number }) {
  useFrame((state) => {
    const targetZ = -progress * 70;
    const targetY = 0.5 + progress * 1.5;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.02);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.02);
    state.camera.lookAt(0, targetY * 0.5, targetZ - 10);
  });

  return null;
}

interface GardenSceneProps {
  progress: number; // 0 to 1
}

const GardenScene = ({ progress }: GardenSceneProps) => {
  const fogColor = useMemo(() => {
    const t = Math.min(progress, 1);
    return new THREE.Color().lerpColors(
      new THREE.Color(0x1a1815),
      new THREE.Color(0xfff8e8),
      t * t
    );
  }, [progress]);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5], fov: 60 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <fog attach="fog" args={[fogColor, 5, 40 + progress * 30]} />
      <ambientLight intensity={0.15 + progress * 0.4} />
      <directionalLight position={[5, 10, -20]} intensity={0.3 + progress * 0.5} color={0xffeedd} />

      <CameraRig progress={progress} />
      <GravelGround progress={progress} />
      <Stones />
      <WaterDrops progress={progress} />
      <MistParticles progress={progress} />
      <EndLight progress={progress} />

      {progress < 0.4 && (
        <Stars radius={50} depth={30} count={200} factor={2} saturation={0} fade speed={0.3} />
      )}

      {/* Bamboo-like vertical lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Float key={i} speed={0.5} floatIntensity={0.2}>
          <mesh
            position={[
              (i % 2 === 0 ? -1 : 1) * (3 + Math.random() * 3),
              1,
              -i * 6 - 3,
            ]}
          >
            <cylinderGeometry args={[0.05, 0.06, 6, 6]} />
            <meshStandardMaterial
              color={0x4a5a3a}
              roughness={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </Canvas>
  );
};

export default GardenScene;
