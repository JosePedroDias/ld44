import { polarMove, times, lerp } from './utils';

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

  constructor(p0: TPoint) {
    this.p0 = newTPoint(p0);
    this.points = [];
  }

  straight(distance: number, steps: number = 1, skipDraw: boolean = false) {
    if (!skipDraw) {
      this.points.push(newTPoint(this.p0));
    }

    for (let i = 0; i < steps; ++i) {
      const v = polarMove(this.p0, distance / steps, this.p0.a);
      this.p0 = { x: v.x, y: v.y, a: this.p0.a };

      if (!skipDraw) {
        this.points.push(newTPoint(this.p0));
      }
    }
  }

  arc(
    distance: number,
    dAngle: number,
    steps: number = 4,
    skipDraw: boolean = false
  ) {
    const initialP = newTPoint(this.p0);

    if (!skipDraw) {
      this.points.push(newTPoint(this.p0));
    }

    for (let i = 0; i < steps; ++i) {
      const rat = (i + 1) / steps;
      const a1 = lerp(initialP.a, initialP.a + dAngle, rat);
      const v = polarMove(this.p0, distance * rat, a1);
      this.p0 = { x: v.x, y: v.y, a: a1 };

      if (!skipDraw) {
        this.points.push(newTPoint(this.p0));
      }
    }
  }
}

export default Turtle;
