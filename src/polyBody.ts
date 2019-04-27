import { Bodies, Vector } from 'matter-js';

/*
var star = Vertices.fromPath('50 0 63 38 100 38 69 59 82 100 50 75 18 100 31 59 0 38 37 38'),
concave = Bodies.fromVertices(200, 200, star);
*/

export function polyBody(center: Vector, verts: Vector[][], opts: any) {
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
