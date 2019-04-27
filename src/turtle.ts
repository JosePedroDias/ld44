import { polarMove, times, lerp, dist } from './utils';
import { R90 } from './consts';

export type TPoint = {
  x: number;
  y: number;
  a: number;
};

function newTPoint(p0: TPoint): TPoint {
  return { x: p0.x, y: p0.y, a: p0.a };
}

class Turtle {
  p0: TPoint;
  points: Array<TPoint>;

  constructor(p0: TPoint, skipDraw: boolean = false) {
    this.p0 = newTPoint(p0);
    this.points = [];

    if (!skipDraw) {
      this.points.push(newTPoint(this.p0));
    }
  }

  straight(distance: number, steps: number = 1, skipDraw: boolean = false) {
    for (let i = 0; i < steps; ++i) {
      const v = polarMove(this.p0, distance / steps, this.p0.a);
      this.p0 = { x: v.x, y: v.y, a: this.p0.a };

      if (!skipDraw) {
        this.points.push(newTPoint(this.p0));
      }
    }
    return this;
  }

  turn(dAngle: number) {
    this.p0 = { x: this.p0.x, y: this.p0.y, a: this.p0.a + dAngle };
    return this;
  }

  dot() {
    this.points.push(newTPoint(this.p0));
    return this;
  }

  left(distance: number) {
    this.turn(-R90)
      .straight(distance, 1, true)
      .turn(R90);
    return this;
  }

  arc(
    radius: number,
    dAngle: number,
    steps: number = 16,
    skipDraw: boolean = false
  ) {
    const sign = dAngle < 0 ? -1 : 1;
    const dAngleAbs = Math.abs(dAngle);
    const dda = dAngleAbs / (steps - 1);

    times(steps).forEach(i => {
      const t = i / steps;
      const r = lerp(radius, radius, t);
      const l = (dAngleAbs * r) / steps;

      this.straight(l, 1, skipDraw);

      if (i < steps - 1) {
        this.turn(sign * dda);
      }
    });

    return this;
  }

  log() {
    console.log(this.p0);
    return this;
  }

  getP(f: Function) {
    f(newTPoint(this.p0));
    return this;
  }
}

export default Turtle;
