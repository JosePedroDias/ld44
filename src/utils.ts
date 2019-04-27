import { Vector, Body, Query } from 'matter-js';

const R360 = Math.PI * 2;

export function distSquared(p0: Vector, p1: Vector) {
  const dx = p0.x - p1.x;
  const dy = p0.y - p1.y;
  return dx * dx + dy * dy;
}

export function dist(p0: Vector, p1: Vector) {
  const dx = p0.x - p1.x;
  const dy = p0.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function len(v: Vector) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v: Vector, scale: number = 1) {
  const dst: number = len(v);
  if (dst === 0) {
    return v;
  }
  return {
    x: (scale * v.x) / dst,
    y: (scale * v.y) / dst
  };
}

export function polarMove(pos: Vector, r: number, angle: number): Vector {
  return {
    x: pos.x + Math.cos(angle) * r,
    y: pos.y + Math.sin(angle) * r
  };
}

export function times(n: number): Array<number> {
  const arr: Array<number> = [];
  for (let i = 0; i < n; ++i) {
    arr.push(i);
  }
  return arr;
}

export function lerp(a: number, b: number, i: number) {
  return i * a + (1 - i) * b;
}

export function lerp2(arrA: number[], arrB: number[], i: number) {
  return [lerp(arrA[0], arrB[0], i), lerp(arrA[1], arrB[1], i)];
}

export function clamp(n: number, min: number, max: number): number {
  return n < min ? min : n > max ? max : n;
}

export function clampAngle(n: number, min: number, max: number): number {
  const delta = max - min;
  if (n < min) {
    while (n < min) {
      n += delta;
    }
  } else if (n > max) {
    while (n > max) {
      n -= delta;
    }
  }
  return n;
}

export function linearize(n: number, a: number, b: number): number {
  const l = Math.abs(b - a);

  let r;
  if (a > b) {
    r = (n - a) / -l;
  } else {
    r = (n - a) / l;
  }

  return clamp(r, 0, 1);
}

export function sign(n: number) {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}

export function vecToAngle(v: Vector) {
  return Math.atan2(v.y, v.x);
}

export function normalizeAngle(a: number) {
  while (a < 0) {
    a += R360;
  }
  while (a > R360) {
    a -= R360;
  }
  return a;
}

export function raycast(
  body: Body,
  bodies: Array<Body>,
  dAngle: number,
  r0: number,
  r1: number,
  dR: number
): Array<Vector> {
  let p0, p1;

  let r = r0;

  const ang = body.angle + dAngle;

  p0 = polarMove(body.position, r, ang);
  p1 = p0;

  while (r < r1) {
    p1 = polarMove(body.position, r, ang);
    if (Query.point(bodies, p1)[0]) {
      return [p0, p1];
    }
    r += dR;
  }
  return [p0, p1];
}

/*
export function rayDist(
  body: Body,
  bodies: Array<Body>,
  dAngle: number,
  dMin: number,
  dMax: number
) {
  const p0 = body.position;
  const v0 = {
    x: p0.x + dMin * Math.cos(body.angle + dAngle),
    y: p0.y + dMin * Math.sin(body.angle + dAngle)
  };
  const v1 = {
    x: p0.x + dMax * Math.cos(body.angle + dAngle),
    y: p0.y + dMax * Math.sin(body.angle + dAngle)
  };
  const o = Query.ray(bodies, v0, v1, dMax); // engine.world.bodies
  let d = 10000;
  if (o.length > 0) {
    const o0 = o[0];
    const sup = o0.supports[0];
    return distSquared(p0, sup);
  }
  return d;
}*/

export function now() {
  return new Date().valueOf();
}

export function randomInt(n: number) {
  return ~~(Math.random() * n);
}

export function randomFromArray(arr: Array<any>): any {
  return arr[randomInt(arr.length)];
}

export function avg(arr: Array<number>) {
  let n = 0;
  const len = arr.length;
  for (let i = 0; i < len; ++i) {
    n += arr[i];
  }
  return n / len;
}

export function accum(
  arr: Array<number>,
  newReading: number,
  maxLength: number
) {
  arr.unshift(newReading);
  if (arr.length > maxLength) {
    arr.pop();
  }
  let v = 0;
  arr.forEach(vi => {
    v += vi;
  });

  return v / maxLength;
}

export function vectToPair(p: Vector): Array<number> {
  return [p.x, p.y];
}
