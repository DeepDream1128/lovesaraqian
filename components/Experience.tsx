import React, { useMemo } from 'react';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TREE_CONFIG, generateOrnaments } from '../constants';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import StarTopper from './StarTopper';
import { TreeState } from '../types';

interface ExperienceProps {
  treeState: TreeState;
}

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  // Calculate progress scalar based on enum
  // In a real app we might use spring here, but we'll pass the scalar down
  // and let the components interpolate it for frame-perfect physics control
  const targetProgress = treeState === TreeState.TREE_SHAPE ? 1 : 0;
  
  // Generate data once
  const ornamentData = useMemo(() => generateOrnaments(TREE_CONFIG.ORNAMENT_COUNT), []);

  return (
    <>
      <color attach="background" args={['#000504']} />
      
      <OrbitControls 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going below ground
        enablePan={false}
        maxDistance={40}
        minDistance={5}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#fff5b6" 
        castShadow 
      />
      <spotLight 
        position={[-10, 15, -5]} 
        angle={0.6} 
        penumbra={1} 
        intensity={1.5} 
        color="#ffceaa" 
      />
      {/* Rim light from bottom for drama */}
      <pointLight position={[0, -2, 0]} intensity={2} color="#00ff9d" distance={10} />

      {/* Environment for Reflections */}
      <Environment preset="city" />

      {/* The Content */}
      <group position={[0, -2, 0]}>
         <Foliage progress={targetProgress} />
         <Ornaments data={ornamentData} progress={targetProgress} />
         <StarTopper progress={targetProgress} />
      </group>

      {/* Ground Reflections */}
      <ContactShadows 
        opacity={0.5} 
        scale={40} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Post Processing for Luxury Feel */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipWow={0} 
          intensity={1.5} 
          radius={0.4} 
          levels={9}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <Noise opacity={0.02} /> 
      </EffectComposer>
    </>
  );
};

export default Experience;