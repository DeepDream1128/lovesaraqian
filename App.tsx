import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import { TreeState } from './types';
import { Loader } from '@react-three/drei';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState(prev => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <ErrorBoundary>
      <div className="relative w-full h-full bg-[#010806] text-white overflow-hidden font-sans-body selection:bg-red-900">
        
        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas 
            shadows 
            camera={{ position: [0, 3, 22], fov: 45 }}
            gl={{ antialias: false, toneMappingExposure: 1.2 }}
            dpr={[1, 2]} 
          >
            <Experience treeState={treeState} />
          </Canvas>
          <Loader 
            dataInterpolation={(p) => `Loading Magic ${p.toFixed(0)}%`}
            containerStyles={{ background: '#010806' }}
            barStyles={{ background: '#C5A000', height: '2px' }}
            innerStyles={{ border: 'none' }}
          />
        </div>

        {/* UI Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10">
          
          {/* Header - Top Left */}
          {/* Adjusted sizes: text-5xl for mobile to ensure visibility */}
          <header className="flex flex-col items-start animate-fade-in z-20 select-none pt-4 md:pt-0">
             <h1 className="text-5xl md:text-8xl font-serif-display text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-red-600 to-red-800 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] tracking-tight leading-[0.95]">
              Merry<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">Christmas</span>
             </h1>
             <p className="text-yellow-100/90 tracking-[0.2em] text-sm md:text-lg mt-4 md:mt-6 font-serif-display italic border-t border-yellow-500/40 pt-3 md:pt-4 pl-1">
               I love you my dear
             </p>
             <p className="text-yellow-100/80 tracking-[0.1em] text-xs md:text-base mt-2 font-serif-display pl-1">
               佳佳小公主小狗猫宝宝
             </p>
          </header>

          {/* Footer Controls - Bottom Right */}
          <div className="w-full flex justify-end items-end pointer-events-auto pb-4 md:pb-8">
            
            <div className="flex flex-col items-end gap-3">
               {/* "Make a wish" Hint */}
              <div className="font-serif-display text-yellow-100/80 text-sm md:text-base tracking-widest italic drop-shadow-lg mr-2 animate-pulse">
                {treeState === TreeState.TREE_SHAPE ? 'Make a wish...' : 'Gather the magic'}
              </div>

              {/* Star Button */}
              <button 
                onClick={toggleState}
                className="group relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-950/80 to-black/80 backdrop-blur-xl border border-red-500/30 rounded-full flex items-center justify-center transition-all duration-500 hover:border-yellow-400 hover:scale-110 hover:shadow-[0_0_40px_rgba(220,20,60,0.5)] active:scale-95"
                aria-label="Toggle Tree State"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-full w-full h-full bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                
                {/* Icon */}
                <span className="relative z-10 text-3xl md:text-4xl filter drop-shadow-md group-hover:rotate-12 transition-transform duration-300">
                  {treeState === TreeState.TREE_SHAPE ? '✨' : '🎄'}
                </span>
              </button>
            </div>

          </div>
        </div>
        
        {/* Signature Watermark - Bottom Left */}
         <div className="absolute bottom-8 left-8 hidden md:block opacity-40 mix-blend-screen pointer-events-none">
            <div className="text-[10px] tracking-[0.3em] text-emerald-500 uppercase font-sans-body">
              Arix Signature Collection
            </div>
         </div>

      </div>
    </ErrorBoundary>
  );
}

export default App;