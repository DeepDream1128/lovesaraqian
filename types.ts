export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export enum OrnamentType {
  HEAVY_BOX = 'HEAVY_BOX',
  LIGHT_BALL = 'LIGHT_BALL',
  TINY_LIGHT = 'TINY_LIGHT'
}

export interface DualPosition {
  id: number;
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  rotation: [number, number, number];
  color: string;
  type: OrnamentType;
  scale: number;
  phaseOffset: number; // For animation variety
}