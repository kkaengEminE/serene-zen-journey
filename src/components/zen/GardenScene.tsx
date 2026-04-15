import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Gravel ground with raked pattern lines
function GravelGround({ progress }: { progress: number }) {
  const groundColor = useMemo(() => {
    const t = Math.min(progress, 1);
    return new THREE.Color().lerpColors(
      new THREE.Color(0x2a2520),
      new THREE.Color(0x8a7d6b),
      t
    );
  }, [progress]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[60, 200]} />
        <meshStandardMaterial color={groundColor} roughness={0.95} />
      </mesh>
      {/* Raked sand lines */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={`rake-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[(i % 2 === 0 ? -1 : 1) * (1.8 + (i % 5) * 0.6), -1.95, -i * 4 - 2]}>
          <planeGeometry args={[0.03, 3]} />
          <meshStandardMaterial color={0x3a3530} roughness={1} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Stepping stones path down the center
function SteppingStones() {
  const stones = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      position: [
        Math.sin(i * 0.4) * 0.3,
        -1.9,
        -i * 4.5 - 3,
      ] as [number, number, number],
      scaleX: 0.6 + Math.random() * 0.3,
      scaleZ: 0.4 + Math.random() * 0.2,
      rotation: (Math.random() - 0.5) * 0.3,
    }));
  }, []);

  return (
    <>
      {stones.map((s, i) => (
        <mesh key={`step-${i}`} position={s.position} rotation={[-Math.PI / 2, s.rotation, 0]}>
          <circleGeometry args={[s.scaleX, 6]} />
          <meshStandardMaterial
            color={0x5a5248}
            roughness={0.85}
            flatShading
          />
        </mesh>
      ))}
    </>
  );
}

// Decorative garden stones along the sides
function GardenStones() {
  const stones = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      position: [
        (i % 2 === 0 ? -1 : 1) * (2.5 + Math.random() * 4),
        -1.5 + Math.random() * 0.2,
        -i * 6 - 5,
      ] as [number, number, number],
      scale: [
        0.3 + Math.random() * 0.5,
        0.2 + Math.random() * 0.3,
        0.3 + Math.random() * 0.5,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI,
    }));
  }, []);

  return (
    <>
      {stones.map((s, i) => (
        <mesh key={i} position={s.position} rotation={[0, s.rotation, 0]} scale={s.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? 0x4a4540 : i % 3 === 1 ? 0x5a5550 : 0x3d3a35}
            roughness={0.95}
            flatShading
          />
        </mesh>
      ))}
    </>
  );
}

// Suikinkutsu basin — a small stone bowl with water
function SuikinkutsuBasin() {
  const positions = useMemo(() => [
    [-3, -1.6, -12],
    [3.5, -1.6, -30],
    [-2.5, -1.6, -50],
  ] as [number, number, number][], []);

  return (
    <>
      {positions.map((pos, i) => (
        <group key={`basin-${i}`} position={pos}>
          {/* Bowl */}
          <mesh rotation={[-0.1, i * 1.2, 0]}>
            <cylinderGeometry args={[0.35, 0.45, 0.25, 12]} />
            <meshStandardMaterial color={0x3a3a38} roughness={0.9} />
          </mesh>
          {/* Water surface */}
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 16]} />
            <meshStandardMaterial
              color={0x4a6a7a}
              roughness={0.1}
              metalness={0.3}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

// Gentle glowing particles — slow, soft, sparse
function GentleParticles({ progress }: { progress: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 50;

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 10;
      pos[i * 3 + 2] = -Math.random() * 80 - 5;
      spd[i] = 0.05 + Math.random() * 0.12;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const y = posAttr.getY(i);
      posAttr.setY(i, y - speeds[i] * delta);
      if (y < -2) {
        posAttr.setY(i, 8 + Math.random() * 4);
        posAttr.setX(i, (Math.random() - 0.5) * 14);
      }
    }
    posAttr.needsUpdate = true;
  });

  const opacity = Math.min(progress * 1.5, 0.35);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color={0xddeeff} transparent opacity={opacity} sizeAttenuation />
    </points>
  );
}

// Water drops falling into suikinkutsu — very slow, sparse
function WaterDrops({ progress }: { progress: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 20;

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const basinX = i % 3 === 0 ? -3 : i % 3 === 1 ? 3.5 : -2.5;
      const basinZ = i % 3 === 0 ? -12 : i % 3 === 1 ? -30 : -50;
      pos[i * 3] = basinX + (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = Math.random() * 3;
      pos[i * 3 + 2] = basinZ + (Math.random() - 0.5) * 0.4;
      spd[i] = 0.15 + Math.random() * 0.1;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const y = posAttr.getY(i);
      posAttr.setY(i, y - speeds[i] * delta);
      if (y < -1.5) {
        posAttr.setY(i, 2 + Math.random() * 2);
      }
    }
    posAttr.needsUpdate = true;
  });

  const opacity = Math.min(progress * 2, 0.5);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color={0x88bbdd} transparent opacity={opacity} sizeAttenuation />
    </points>
  );
}

// Soft mist
function MistParticles({ progress }: { progress: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 30;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 3 - 1;
      pos[i * 3 + 2] = -Math.random() * 60 - 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.03) * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.8} color={0xbbaa99} transparent opacity={0.08 + progress * 0.12} sizeAttenuation />
    </points>
  );
}

// End light
function EndLight({ progress }: { progress: number }) {
  const intensity = Math.max(0, (progress - 0.5) * 6);
  return (
    <>
      <pointLight position={[0, 2, -80]} color={0xfff5e0} intensity={intensity} distance={40} />
      {progress > 0.6 && (
        <mesh position={[0, 1, -75]}>
          <sphereGeometry args={[3 + progress * 5, 16, 16]} />
          <meshBasicMaterial color={0xfff8e8} transparent opacity={Math.min((progress - 0.6) * 2, 0.8)} />
        </mesh>
      )}
    </>
  );
}

// Bamboo stalks along sides
function BambooStalks() {
  const stalks = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      x: (i % 2 === 0 ? -1 : 1) * (3.5 + Math.random() * 2.5),
      z: -i * 5 - 3,
      height: 4 + Math.random() * 3,
      thickness: 0.04 + Math.random() * 0.02,
    }));
  }, []);

  return (
    <>
      {stalks.map((s, i) => (
        <Float key={i} speed={0.3} floatIntensity={0.1}>
          <mesh position={[s.x, s.height / 2 - 1.5, s.z]}>
            <cylinderGeometry args={[s.thickness, s.thickness + 0.01, s.height, 6]} />
            <meshStandardMaterial color={0x4a5a3a} roughness={0.8} transparent opacity={0.5} />
          </mesh>
          {/* Bamboo node marks */}
          {[0.3, 0.55, 0.8].map((t, j) => (
            <mesh key={j} position={[s.x, s.height * t - 1.5, s.z]}>
              <torusGeometry args={[s.thickness + 0.005, 0.005, 4, 8]} />
              <meshStandardMaterial color={0x3a4a2a} roughness={0.9} transparent opacity={0.4} />
            </mesh>
          ))}
        </Float>
      ))}
    </>
  );
}

// Small moss patches
function MossPatches() {
  const patches = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 8,
        -1.94,
        -i * 7 - 4,
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <>
      {patches.map((p, i) => (
        <mesh key={i} position={p.position} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
          <circleGeometry args={[p.scale, 8]} />
          <meshStandardMaterial color={0x3a5a2a} roughness={1} transparent opacity={0.25} />
        </mesh>
      ))}
    </>
  );
}

// Camera rig
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
  progress: number;
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
      <ambientLight intensity={0.12 + progress * 0.35} />
      <directionalLight position={[5, 10, -20]} intensity={0.25 + progress * 0.4} color={0xffeedd} />
      <pointLight position={[-3, 3, -15]} intensity={0.15} color={0xaabbcc} distance={20} />

      <CameraRig progress={progress} />
      <GravelGround progress={progress} />
      <SteppingStones />
      <GardenStones />
      <SuikinkutsuBasin />
      <BambooStalks />
      <MossPatches />
      <GentleParticles progress={progress} />
      <WaterDrops progress={progress} />
      <MistParticles progress={progress} />
      <EndLight progress={progress} />
    </Canvas>
  );
};

export default GardenScene;
