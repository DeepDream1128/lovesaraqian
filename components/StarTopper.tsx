import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, TREE_CONFIG, getRandomSpherePoint } from '../constants';

interface StarTopperProps {
  progress: number;
}

const StarTopper: React.FC<StarTopperProps> = ({ progress }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Target Position (Top of tree)
  // Height is 12, centered at y=0, so range is -6 to 6. Top is 6.
  const treePos = new THREE.Vector3(0, TREE_CONFIG.HEIGHT / 2 + 0.2, 0);
  
  // Scatter Position
  const scatterPos = useMemo(() => {
    const p = getRandomSpherePoint(TREE_CONFIG.SCATTER_RADIUS);
    return new THREE.Vector3(p[0], p[1], p[2]);
  }, []);

  // Star Shape Geometry
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.8;
    const innerRadius = 0.38;
    
    // Draw the star
    for (let i = 0; i < points * 2; i++) {
      // Use +PI/2 to start at 12 o'clock (pointing up)
      const angle = (i * Math.PI) / points + Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Do NOT use geom.center() for X/Y as it centers the bounding box, 
    // which for a 5-pointed star is vertically offset from the visual center.
    // We only want to center the Z axis so it rotates nicely.
    
    geom.computeBoundingBox();
    if (geom.boundingBox) {
        const centerOffsetZ = -0.5 * (geom.boundingBox.max.z - geom.boundingBox.min.z);
        geom.translate(0, 0, centerOffsetZ);
    }

    return geom;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Position Lerp
    // Use easeInOut for smoother landing
    const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    const currentPos = new THREE.Vector3().lerpVectors(scatterPos, treePos, easeProgress);
    
    // Add floating motion (more intense when scattered)
    const floatAmp = THREE.MathUtils.lerp(0.5, 0.05, progress);
    const floatY = Math.sin(time * 1.5) * floatAmp;
    
    meshRef.current.position.set(currentPos.x, currentPos.y + floatY, currentPos.z);
    
    // Rotation
    // Continuous spin
    meshRef.current.rotation.y += 0.01;
    // Tumble when scattered
    if (progress < 1) {
       meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.05);
       meshRef.current.rotation.z = THREE.MathUtils.lerp(Math.sin(time) * 0.5, 0, progress);
    } else {
       // Ensure it's perfectly upright when on the tree
       meshRef.current.rotation.x = 0;
       meshRef.current.rotation.z = 0;
    }

    // Sync glow position
    if (glowRef.current) {
        glowRef.current.position.copy(meshRef.current.position);
        // Pulse glow
        const scale = 1 + Math.sin(time * 2) * 0.2;
        glowRef.current.scale.setScalar(scale * (0.8 + 0.2 * progress));
    }
  });

  return (
    <>
        <mesh ref={meshRef} geometry={starGeometry} castShadow receiveShadow>
          <meshStandardMaterial 
            color={COLORS.GOLD_METALLIC} 
            emissive={COLORS.GOLD_METALLIC}
            emissiveIntensity={0.6}
            metalness={1.0}
            roughness={0.15}
          />
        </mesh>
        
        {/* Outer Halo Glow */}
        <mesh ref={glowRef}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshBasicMaterial 
                color={COLORS.GOLD_BRIGHT} 
                transparent 
                opacity={0.15} 
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
        
        {/* Dynamic Light Source from Star */}
        <pointLight 
            position={[treePos.x, treePos.y, treePos.z]} 
            intensity={2 * progress + 0.5} 
            color={COLORS.GOLD_BRIGHT} 
            distance={15} 
            decay={2} 
        />
    </>
  );
};

export default StarTopper;