import {
  Application,
  Sprite,
  utils,
  Graphics,
  Texture,
  DisplayObject,
  Container,
  Point,
  Rectangle
} from 'pixi.js';
import { Composite, Engine, Body, Vector } from 'matter-js';
import { BodyExt } from './main';
import { D2R, R2D } from './consts';

// http://pixijs.io/examples/

utils.skipHello();

let app: Application;
let scene = new Container();

let CAM_X0;
let CAM_Y0;

export function setZoom(z: number) {
  app.stage.scale.set(z);
}
export function getZoom(): number {
  return app.stage.scale.x;
}

export function setRotation(deg: number) {
  app.stage.rotation = D2R * deg;
}
export function getRotation(): number {
  return app.stage.rotation * R2D;
}

export function setPosition(point: Point) {
  scene.position = new Point(-point.x, -point.y);
}
export function getPosition(): Point {
  // @ts-ignore
  return scene.position; //.clone();
}

// @ts-ignore
// window.setZoom = setZoom;

// @ts-ignore
// window.setRotation = setRotation;

// @ts-ignore
// window.setPosition = setPosition;

function polygon(body: BodyExt) {
  const verts = body.vertices;
  const g = new PIXI.Graphics();

  // g.blendMode = PIXI.BLEND_MODES.LIGHTEN;
  g.beginFill(body.color || 0xff3300, 0.5);
  g.lineStyle(1, 0xffffff, 1);
  const p = body.position;
  verts.forEach((v, i) => {
    const v2 = { x: v.x + p.x, y: v.y + p.y };
    if (i === 0) {
      g.moveTo(v2.x, v2.y);
    } else {
      g.lineTo(v2.x, v2.y);
    }
  });
  g.lineTo(verts[0].x + p.x, verts[0].y + p.y);
  g.endFill();

  const tex: Texture = app.renderer.generateTexture(g);
  const sp = new Sprite(tex);
  sp.anchor.set(0.5);
  return sp;
}

function sprite(body: BodyExt, app: Application) {
  const sp = Sprite.fromImage(body.sprite);
  if ('scale' in body) {
    sp.scale.set(body.scale);
  }
  sp.anchor.set(0.5);
  // @ts-ignore
  body.sprite = sp;
  return sp;
}

// @ts-ignore
let _g, _tex, _sp;
function line(p0: Vector, p1: Vector, color: number, width: number) {
  // @ts-ignore
  if (_g) {
    // @ts-ignore
    scene.removeChild(_sp);
    // @ts-ignore
    _sp.destroy();
    // @ts-ignore
    _tex.destroy();
    // @ts-ignore
    _g.destroy();
  }

  const g: Graphics = new Graphics();

  //g.position.set(400, 300);
  g.lineStyle(width, color)
    .moveTo(p0.x, p0.y)
    .lineTo(p1.x, p1.y);

  const w = Math.max(Math.abs(p0.x - p1.x), 512);
  const h = Math.max(Math.abs(p0.y - p1.y), 512);
  const x = Math.min(p0.x, p1.x);
  const y = Math.min(p0.y, p1.y);

  const tex: Texture = app.renderer.generateTexture(
    g,
    1,
    1,
    new PIXI.Rectangle(x, y, w, h)
  );
  const sp = new Sprite(tex);
  sp.position.x = x;
  sp.position.y = y;

  _g = g;
  _tex = tex;
  _sp = sp;

  return sp;
}

function circle(body: BodyExt, app: Application) {
  const g: Graphics = new Graphics();
  g.beginFill(body.color || 0xff22aa);
  const r = body.dims[0] / 2;
  g.drawCircle(r, r, r);
  g.endFill();
  const tex: Texture = app.renderer.generateTexture(g);
  const sp = new Sprite(tex);
  sp.anchor.set(0.5);
  // @ts-ignore
  body.sprite = sp;
  return sp;
}

function rect(body: BodyExt, app: Application) {
  const g: Graphics = new Graphics();
  g.beginFill(body.color || 0xff22aa);
  g.drawRect(0, 0, body.dims[0], body.dims[1]); // tslint:disable-line
  g.endFill();
  const tex: Texture = app.renderer.generateTexture(g);
  const sp = new Sprite(tex);
  sp.anchor.set(0.5);
  // @ts-ignore
  body.sprite = sp;
  return sp;
}

export function setup() {
  app = new Application(800, 600, { backgroundColor: 0x000000 });
  document.body.appendChild(app.view);

  CAM_X0 = app.screen.width / 2;
  CAM_Y0 = app.screen.height / 2;
  app.stage.position.x = CAM_X0;
  app.stage.position.y = CAM_Y0;

  // app.stage.scale.set(2.5); // TEMP

  // app.stage.rotation = D2R * 0;

  app.stage.addChild(scene);
}

export function removeSprite(body: BodyExt) {
  // @ts-ignore
  const sp: Sprite = body.sprite;
  //sp.alpha = 0.25;
  scene.removeChild(sp);
}

let running = true;

export function stopEngine() {
  running = false;
}

export function renderFactory(engine: Engine) {
  let t0 = 0;

  function render(t_: number) {
    const t = t_ / 1000;
    // const dt = t - t0;
    t0 = t;

    // console.log(t.toFixed(2));

    if (!running) {
      return;
    }

    window.requestAnimationFrame(render);
    Engine.update(engine, 1000 / 60);

    const bodies = Composite.allBodies(engine.world) as Array<BodyExt>;

    if (t === 0) {
      bodies.forEach((body, bIdx) => {
        let g: DisplayObject;
        if (body.kind === 'rect') {
          g = rect(body, app);
        } else if (body.kind === 'sprite') {
          g = sprite(body, app);
        } else {
          g = circle(body, app);
        }

        scene.addChild(g);
      });
    } else {
      bodies.forEach((body, i) => {
        // @ts-ignore
        const g: DisplayObject = body.sprite;
        if (!g) {
          return console.warn('body without sprite');
        }
        g.position.x = body.position.x;
        g.position.y = body.position.y;
        g.rotation = body.angle;
      });
    }

    //@ts-ignore
    if (window.addLine) {
      // @ts-ignore
      scene.addChild(line.apply(null, window.addLine));
    }
    //if (t === 0) {
    //  scene.addChild(line({ x: 400, y: 300 }, { x: 350, y: 300 }, 0xff00ff, 4));
    //}

    //setRotation(getRotation() + 15 * dt);
    //setZoom((1 + Math.sin(t * 2) * 0.5) * 0.75);
  }

  render(0);
}

export function render() {}
