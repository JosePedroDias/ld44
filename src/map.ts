import { Vector } from 'matter-js';
import { R90 } from './consts';

export type Kind = 'circle' | 'rect' | 'road' | 'road2';

export type MapItem = {
  position: Vector;
  kind: Kind;
  radius?: number;
  color?: string;
  segments?: any;
};

export type Map = Array<MapItem>;

const WHITE = '#FFF';
const RED = '#F00';
const GREEN = '#0F0';
const BLUE = '#00F';

const straightL = 150;
const laneL = 20;

export const map: Map = [
  {
    position: { x: 0, y: 0 },
    kind: 'road2',
    segments: [
      { x: 0, y: 0, a: 0 },
      ['straight', straightL],
      ['arc', straightL - laneL, R90]
    ]
  },
  { position: { x: 0, y: 0 }, color: WHITE, kind: 'rect' },
  //{ position: { x: 50, y: 0 }, color: BLUE, kind: 'rect' },
  //{ position: { x: -50, y: 0 },color: BLUE, kind: 'rect' },
  { position: { x: 160, y: 120 }, radius: 60, color: '#2A2', kind: 'circle' },
  { position: { x: -100, y: 120 }, radius: 20, color: RED, kind: 'circle' }
];
