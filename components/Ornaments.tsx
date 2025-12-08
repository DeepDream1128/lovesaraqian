import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrnamentType, DualPosition } from '../types';
import { TREE_CONFIG, COLORS } from '../constants';

interface OrnamentsProps {
  data: DualPosition[];
  progress: number;
}

const tempObject = new THREE.Object3D();
const tempPos = new THREE.Vector3();

// Reusable component for handling a specific type of ornament (Box or Sphere)
const OrnamentLayer: React.FC<{
  items: DualPosition[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  progress: number;
}> = ({ items, geometry, material, progress }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Store current animated positions to simulate physics inertia
  const currentPositions = useRef<Float32Array>(new Float32Array(items.length * 3));
  
  // Initialize positions
  useEffect(() => {
    items.forEach((item, i) => {
      currentPositions.current[i * 3] = item.scatterPos[0];
      currentPositions.current[i * 3 + 1] = item.scatterPos[1];
      currentPositions.current[i * 3 + 2] = item.scatterPos[2];
    });
  }, [items]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    
    const time = state.clock.getElapsedTime();
    const isFormingTree = progress > 0.5;

    items.forEach((item, i) => {
      // Target determination
      // We calculate the ideal target based on progress (0 to 1)
      // However, we want different items to move at different speeds based on "weight"
      
      const targetX = THREE.MathUtils.lerp(item.scatterPos[0], item.treePos[0], progress);
      const targetY = THREE.MathUtils.lerp(item.scatterPos[1], item.treePos[1], progress);
      const targetZ = THREE.MathUtils.lerp(item.scatterPos[2], item.treePos[2], progress);

      // Determine Physics "Weight"
      let lerpSpeed = 0.05; // Default
      let floatAmp = 0.05;

      if (item.type === OrnamentType.HEAVY_BOX) {
        lerpSpeed = 0.02; // Heavy moves slower
        floatAmp = 0.02;
      } else if (item.type === OrnamentType.TINY_LIGHT) {
        lerpSpeed = 0.1; // Lights zip fast
        floatAmp = 0.2;
      }

      // Update current physics position towards target
      currentPositions.current[i*3] = THREE.MathUtils.lerp(currentPositions.current[i*3], targetX, lerpSpeed);
      currentPositions.current[i*3+1] = THREE.MathUtils.lerp(currentPositions.current[i*3+1], targetY, lerpSpeed);
      currentPositions.current[i*3+2] = THREE.MathUtils.lerp(currentPositions.current[i*3+2], targetZ, lerpSpeed);
      
      // Add floating noise
      const x = currentPositions.current[i*3];
      const y = currentPositions.current[i*3+1] + Math.sin(time + item.phaseOffset) * floatAmp;
      const z = currentPositions.current[i*3+2];

      tempObject.position.set(x, y, z);
      
      // Rotation logic
      if (isFormingTree) {
         // Align roughly with up vector but maintain some chaos
         tempObject.rotation.set(0, item.phaseOffset, 0);
      } else {
         // Tumble when scattered
         tempObject.rotation.set(
            item.rotation[0] + time * 0.2,
            item.rotation[1] + time * 0.1,
            item.rotation[2]
         );
      }
      
      tempObject.scale.setScalar(item.scale);
      tempObject.updateMatrix();
      
      mesh.setMatrixAt(i, tempObject.matrix);
      // Set Color for instanced mesh
      mesh.setColorAt(i, new THREE.Color(item.color));
    });
    
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, items.length]}
      castShadow
      receiveShadow
    />
  );
};

const Ornaments: React.FC<OrnamentsProps> = ({ data, progress }) => {
  // Split data by geometry type for efficiency
  const { boxes, balls, lights } = useMemo(() => {
    const boxes = data.filter(d => d.type === OrnamentType.HEAVY_BOX);
    const balls = data.filter(d => d.type === OrnamentType.LIGHT_BALL);
    const lights = data.filter(d => d.type === OrnamentType.TINY_LIGHT);
    return { boxes, balls, lights };
  }, [data]);

  // Geometries
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);
  
  // Materials
  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({
    metalness: 0.9,
    roughness: 0.2,
    envMapIntensity: 1.5
  }), []);
  
  const velvetMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLORS.RED_VELVET,
    metalness: 0.1,
    roughness: 0.8
  }), []);

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    toneMapped: false,
    color: COLORS.GOLD_BRIGHT
  }), []);

  return (
    <group>
      {/* Heavy Boxes - Mix of metal and velvet? Let's just use metal for high shine luxury */}
      <OrnamentLayer 
        items={boxes} 
        geometry={boxGeo} 
        material={metalMat} 
        progress={progress} 
      />
      
      {/* Balls */}
      <OrnamentLayer 
        items={balls} 
        geometry={sphereGeo} 
        material={metalMat} 
        progress={progress} 
      />

      {/* Tiny Lights - Emissive */}
      <OrnamentLayer 
        items={lights} 
        geometry={sphereGeo} 
        material={glowMat} 
        progress={progress} 
      />
    </group>
  );
};

export default Ornaments;