import { Vector } from 'matter-js';

export type Kind = 'circle' | 'rect';

export type MapItem = {
  position: Vector;
  kind: Kind;
  radius: number;
  color: string;
};

export type Map = Array<MapItem>;

const WHITE = '#FFF';
const RED = '#F00';
const GREEN = '#0F0';
const BLUE = '#00F';

export const map: Map = [
  { position: { x: 0, y: 0 }, radius: 0, color: WHITE, kind: 'rect' },
  { position: { x: 50, y: 0 }, radius: 0, color: BLUE, kind: 'rect' },
  { position: { x: -50, y: 0 }, radius: 0, color: BLUE, kind: 'rect' },
  { position: { x: 100, y: 100 }, radius: 40, color: RED, kind: 'circle' },
  { position: { x: -100, y: 120 }, radius: 20, color: RED, kind: 'circle' }
];
