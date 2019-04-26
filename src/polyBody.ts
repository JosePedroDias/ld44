import { Bodies, Vector } from 'matter-js';
import { Point } from 'pixi.js';

export function polyBody(center: Point, verts: Vector[][], opts: any) {
  // @ts-ignore
  const verts2 = verts.map(p => Vector.create(p[0], p[1]));
  // @ts-ignore
  return Bodies.fromVertices(
    center.x,
    center.y,
    verts2,
    opts,
    false,
    0,
    0.0000001
  );
}
