import { Composite, Engine, Vector } from 'matter-js';
import { BodyExt } from './main';
// @ts-ignore should fix this...
import * as SVG from 'svg.js';
import { R2D, R90, R180, DEBUG } from './consts';
import { vectToPair } from './utils';
import Turtle, { TPoint } from './turtle';

const W = 800;
const H = 600;

let CAM_X0 = 0;
let CAM_Y0 = 0;
let ZOOM = 1;

let app: any;
let wp: any;

let wps: Array<TPoint> = [];

//////

export function getWaypoints(): Array<TPoint> {
  return wps;
}

export function setZoom(z: number) {
  ZOOM = z;
}
export function getZoom(): number {
  return ZOOM;
}

export function setPosition(point: Vector) {
  CAM_X0 = point.x;
  CAM_Y0 = point.y;
  app.viewbox(
    point.x - W / ZOOM / 2,
    point.y - H / ZOOM / 2,
    W / ZOOM,
    H / ZOOM
  );
}
export function getPosition(): Vector {
  return { x: CAM_X0, y: CAM_Y0 };
}

//////

function circle(body: BodyExt) {
  const r = body.dims[0]; // / 2 ;// @TODO WEIRD
  const g = app
    .circle(r)
    .attr({ cx: 0, cy: 0, fill: body.color, 'data-name': 'circle' });
  body.el = g;
  return g;
}

function rect(body: BodyExt) {
  const g = app.group().attr({ 'data-name': 'rect' });
  const rect = app.rect(body.dims[0], body.dims[1]).attr({ fill: body.color });
  rect.move(-body.dims[0] / 2, -body.dims[1] / 2);
  g.add(rect);
  body.el = g;
  return g;
}

const laneL = 20;
const laneL2 = laneL * 2;

const roadFillStyle = { fill: '#555', stroke: 'none' };
const roadStripsStyle = {
  fill: 'none',
  stroke: 'white',
  'stroke-width': 1.5,
  'stroke-dasharray': '6'
};

function road2Lanes(body: BodyExt) {
  // @ts-ignore
  const segments: Array<any> = body.segments;
  let p0: TPoint = segments.shift();

  function setP0(p: TPoint) {
    p0 = p;
  }

  const roadGrp = app.group().attr({ 'data-name': 'road' });
  const wpsGrp = app.group().attr({ 'data-name': 'waypoints' });

  segments.forEach(segment => {
    let tFill: any;
    let tStrips: any;
    let tmp: any;
    //console.log(segment);
    if (segment[0] === 'straight') {
      const straightL: number = segment[1];
      tFill = new Turtle(p0, true)
        .left(laneL)
        .dot()
        .straight(straightL)
        .turn(R90)
        .straight(laneL2)
        .turn(R90)
        .straight(straightL);

      tmp = new Turtle(p0, true)
        .left(-laneL / 2)
        .dot()
        .straight(straightL, Math.ceil(straightL / 20));
      wps = wps.concat(tmp.points);

      tmp = new Turtle(p0, true)
        .left(laneL / 2)
        .turn(R180)
        .dot()
        .straight(-straightL, Math.ceil(straightL / 20));
      wps = wps.concat(tmp.points);

      tStrips = new Turtle(p0).straight(straightL).getP(setP0);
    } else if (segment[0] === 'arc') {
      const straightL: number = segment[1];
      const angle: number = segment[2];
      tFill = new Turtle(p0, true)
        .left(laneL)
        .dot()
        .arc(straightL, angle)
        .turn(R90)
        .straight(laneL2)
        .turn(R90)
        .arc(straightL - laneL2, -angle);

      let c = straightL - laneL / 2;
      tmp = new Turtle(p0, true)
        .left(laneL / 2)
        .turn(R180)
        .dot()
        .arc(-c, angle, Math.ceil((angle * c) / 20));
      wps = wps.concat(tmp.points);

      c = straightL - laneL * 1.5;
      tmp = new Turtle(p0, true)
        .left(-laneL / 2)
        .dot()
        .arc(c, angle, Math.ceil((angle * c) / 20));
      wps = wps.concat(tmp.points);

      tStrips = new Turtle(p0).arc(straightL - laneL, angle).getP(setP0);
    }
    if (tFill) {
      roadGrp.polygon(tFill.points.map(vectToPair)).attr(roadFillStyle);
    }
    if (tStrips) {
      roadGrp.polyline(tStrips.points.map(vectToPair)).attr(roadStripsStyle);
    }
    if (DEBUG) {
      wps.forEach((p: any) => {
        wpsGrp
          .use(wp)
          .move(p.x, p.y)
          .rotate(p.a * R2D);
      });
    }
  });
}

export function setup() {
  // @ts-ignore
  app = SVG('body').size(W, H);

  wp = app
    .defs()
    .polygon([4, 0, -3, -2, -3, 2])
    .fill('#F0F');
}

let running = true;

export function stopEngine() {
  running = false;
}

export function renderFactory(engine: Engine) {
  let t0 = 0;
  let frame = 0;

  function render(t_: number) {
    const t = t_ / 1000;
    const dt = t - t0;
    const fps = 1 / dt;
    //console.log('FPS ' + fps.toFixed(1));
    t0 = t;

    ++frame;

    // console.log(t.toFixed(2));

    window.requestAnimationFrame(render);

    /* if (frame % 2 !== 0) {
      return console.log('skipped', frame, frame % 2);
    } */

    Engine.update(engine, 1000 / fps);

    if (!running) {
      return;
    }

    const bodies = Composite.allBodies(engine.world) as Array<BodyExt>;

    if (t === 0) {
      bodies.forEach(body => {
        if (body.kind === 'circle') {
          circle(body);
        } else if (body.kind === 'rect') {
          rect(body);
        } else if (body.kind === 'road2') {
          road2Lanes(body);
        }
      });
    } else {
      bodies.forEach((body, i) => {
        const g = body.el;
        if (!g) {
          return;
        }
        const deg = body.angle * R2D;
        g.transform({ rotation: deg }).transform(body.position);
      });
    }
  }

  render(0);
}
