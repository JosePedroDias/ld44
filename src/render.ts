import { Composite, Engine, Vector } from 'matter-js';
import { BodyExt } from './main';
import * as SVG from 'svg.js';
import { R2D } from './consts';
import { clampAngle } from './utils';

const W = 800;
const H = 600;

let CAM_X0 = 0;
let CAM_Y0 = 0;
let ZOOM = 1;

let app: any;

export function setZoom(z: number) {
  ZOOM = z;
}
export function getZoom(): number {
  return ZOOM;
}

export function setRotation(deg: number) {}
export function getRotation(): number {
  return 0;
}

export function setPosition(point: Vector) {
  CAM_X0 = point.x;
  CAM_Y0 = point.y;
  app.viewbox(-W / 2, -H / 2, W / ZOOM, H / ZOOM);
}
export function getPosition(): Vector {
  return { x: CAM_X0, y: CAM_Y0 };
}

function circle(body: BodyExt) {
  /* const g = app.group();
  const r = body.dims[0] / 2;
  const circle = app.circle(r).attr({ fill: body.color });
  //circle.move(-r, -r);
  //circle.transform({ x: -r, y: -r });
  g.add(circle);
  body.el = g;
  return g; */
  const r = body.dims[0]; // / 2;
  const g = app.circle(r).attr({ cx: 0, cy: 0, fill: body.color });
  body.el = g;
  return g;
}

function rect(body: BodyExt) {
  const g = app.group();
  const rect = app.rect(body.dims[0], body.dims[1]).attr({ fill: body.color });
  rect.move(-body.dims[0] / 2, -body.dims[1] / 2);
  g.add(rect);
  body.el = g;
  return g;
}

export function setup() {
  // @ts-ignore
  app = SVG('body').size(W, H);
}

let running = true;

export function stopEngine() {
  running = false;
}

export function renderFactory(engine: Engine) {
  let t0 = 0;

  function render(t_: number) {
    const t = t_ / 1000;
    t0 = t;
    // console.log(t.toFixed(2));

    if (!running) {
      return;
    }

    window.requestAnimationFrame(render);
    Engine.update(engine, 1000 / 60);

    const bodies = Composite.allBodies(engine.world) as Array<BodyExt>;

    if (t === 0) {
      bodies.forEach(body => {
        if (body.kind === 'circle') {
          circle(body);
        } else {
          rect(body);
        }
      });
    } else {
      bodies.forEach((body, i) => {
        const g = body.el;
        const deg = body.angle * R2D;
        g.transform({ rotation: deg }).transform(body.position);
      });
    }
  }

  render(0);
}
