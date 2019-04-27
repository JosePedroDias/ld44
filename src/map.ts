import { Vector } from '../node_modules/@types/matter-js/index';

export type Kind = 'circle' | 'rect';

export type MapItem = {
  position: Vector;
  kind: Kind;
  radius: number;
  color: number;
};

export type Map = Array<MapItem>;

export const map: Map = [
  { position: { x: 0, y: 0 }, radius: 0, color: 0xffffff, kind: 'rect' },
  { position: { x: 50, y: 0 }, radius: 0, color: 0x0000ff, kind: 'rect' },
  { position: { x: -50, y: 0 }, radius: 0, color: 0x0000ff, kind: 'rect' },
  { position: { x: 100, y: 100 }, radius: 40, color: 0xff0000, kind: 'circle' },
  { position: { x: -100, y: 120 }, radius: 20, color: 0xff0000, kind: 'circle' }
];
