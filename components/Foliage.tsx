import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, getRandomSpherePoint, getTreePoint, FOLIAGE_VERTEX_SHADER, FOLIAGE_FRAGMENT_SHADER } from '../constants';

interface FoliageProps {
  progress: number; // 0 to 1
}

const Foliage: React.FC<FoliageProps> = ({ progress }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate Geometry Data once
  const { positions, treePositions, scatterPositions, phases, sizes } = useMemo(() => {
    const count = TREE_CONFIG.FOLIAGE_COUNT;
    const positions = new Float32Array(count * 3);
    const treePositions = new Float32Array(count * 3);
    const scatterPositions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Current positions (initially 0, shader handles placement)
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Tree Target
      const [tx, ty, tz] = getTreePoint(TREE_CONFIG.HEIGHT, TREE_CONFIG.RADIUS_BOTTOM);
      treePositions[i * 3] = tx;
      treePositions[i * 3 + 1] = ty;
      treePositions[i * 3 + 2] = tz;

      // Scatter Target
      const [sx, sy, sz] = getRandomSpherePoint(TREE_CONFIG.SCATTER_RADIUS);
      scatterPositions[i * 3] = sx;
      scatterPositions[i * 3 + 1] = sy;
      scatterPositions[i * 3 + 2] = sz;

      phases[i] = Math.random() * 10;
      sizes[i] = Math.random() * 0.5 + 0.5; // Base size
    }

    return { positions, treePositions, scatterPositions, phases, sizes };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      // Smooth lerp for the uniform
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        progress,
        0.05 // Damping factor
      );
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={phases.length}
          array={phases}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={FOLIAGE_VERTEX_SHADER}
        fragmentShader={FOLIAGE_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  );
};

export default Foliage;