import * as THREE from 'three';
import { OrnamentType, DualPosition } from './types';

// --- Palette ---
export const COLORS = {
  EMERALD_DEEP: '#002419',
  EMERALD_MID: '#044f38',
  GOLD_METALLIC: '#FFD700',
  GOLD_ROSE: '#E6C288',
  GOLD_BRIGHT: '#FFF8D6',
  RED_VELVET: '#590909'
};

// --- Configuration ---
export const TREE_CONFIG = {
  HEIGHT: 12,
  RADIUS_BOTTOM: 4.5,
  FOLIAGE_COUNT: 15000,
  ORNAMENT_COUNT: 400,
  SCATTER_RADIUS: 25
};

// --- Math Helpers ---

// Generate random point in a sphere
export const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return [x, y, z];
};

// Generate point on a cone surface (Christmas Tree shape)
export const getTreePoint = (height: number, maxRadius: number, verticalBias = 1): [number, number, number] => {
  // y goes from 0 to height
  const y = Math.pow(Math.random(), verticalBias) * height; 
  const currentRadius = maxRadius * (1 - y / height);
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * currentRadius; // Uniform distribution on disk
  
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  
  // Center the tree vertically around origin roughly
  return [x, y - height / 2, z];
};

// Generate Ornament Data
export const generateOrnaments = (count: number): DualPosition[] => {
  const ornaments: DualPosition[] = [];
  
  for (let i = 0; i < count; i++) {
    const typeRoll = Math.random();
    let type = OrnamentType.LIGHT_BALL;
    let scale = 1;
    let color = COLORS.GOLD_METALLIC;

    if (typeRoll < 0.15) {
      type = OrnamentType.HEAVY_BOX;
      scale = 0.6 + Math.random() * 0.4;
      color = Math.random() > 0.5 ? COLORS.RED_VELVET : COLORS.GOLD_ROSE;
    } else if (typeRoll < 0.8) {
      type = OrnamentType.LIGHT_BALL;
      scale = 0.3 + Math.random() * 0.3;
      color = Math.random() > 0.7 ? COLORS.EMERALD_MID : COLORS.GOLD_METALLIC;
    } else {
      type = OrnamentType.TINY_LIGHT;
      scale = 0.15 + Math.random() * 0.1;
      color = COLORS.GOLD_BRIGHT;
    }

    ornaments.push({
      id: i,
      scatterPos: getRandomSpherePoint(TREE_CONFIG.SCATTER_RADIUS),
      treePos: getTreePoint(TREE_CONFIG.HEIGHT, TREE_CONFIG.RADIUS_BOTTOM, 0.8), // 0.8 bias makes it denser at bottom
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      color,
      type,
      scale,
      phaseOffset: Math.random() * 100
    });
  }
  return ornaments;
};

// Foliage Shader
export const FOLIAGE_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uProgress;
  
  attribute vec3 aTreePos;
  attribute vec3 aScatterPos;
  attribute float aPhase;
  attribute float aSize;
  
  varying vec3 vColor;
  varying float vAlpha;

  // Cubic Ease In Out for smoother transition
  float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = uTime + aPhase;
    
    // Mix positions
    float easeProgress = easeInOutCubic(uProgress);
    vec3 mixedPos = mix(aScatterPos, aTreePos, easeProgress);
    
    // Add breathing animation
    // Less movement when in tree form to keep shape sharp, more float when scattered
    float noiseAmp = mix(0.5, 0.1, easeProgress); 
    mixedPos.x += sin(t * 0.5) * noiseAmp;
    mixedPos.y += cos(t * 0.3) * noiseAmp;
    mixedPos.z += sin(t * 0.7) * noiseAmp;

    vec4 mvPosition = modelViewMatrix * vec4(mixedPos, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    
    // Varying passing
    vColor = mix(vec3(0.0, 0.2, 0.1), vec3(0.01, 0.4, 0.25), sin(t + aPhase));
    // Gold shimmer on edges
    if (mod(aPhase + t, 10.0) > 9.0) {
        vColor = vec3(1.0, 0.9, 0.5);
    }
  }
`;

export const FOLIAGE_FRAGMENT_SHADER = `
  varying vec3 vColor;
  
  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft edge
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    
    gl_FragColor = vec4(vColor, alpha * 0.8);
  }
`;
