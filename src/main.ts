import {
  Engine,
  World,
  Bodies,
  Events,
  Body,
  Vector,
  IPair,
  Query,
  Composite
} from 'matter-js';
import {
  setup,
  renderFactory,
  setZoom,
  setPosition,
  getZoom,
  getPosition,
  removeSprite,
  stopEngine
} from './pixiRender';
import { polyBody } from './polyBody';
import { Point } from 'pixi.js';
import {
  KC_UP,
  KC_DOWN,
  KC_LEFT,
  KC_RIGHT,
  isDown,
  hookKeys,
  justChanged,
  KC_SPACE
} from './keyboard';
import { clamp, sign, lerp, randomFromArray, raycast, dist } from './utils';
import { CAR_CATEGORY, OBSTACLE_CATEGORY } from './matterCategories';

export interface BodyExt extends Body {
  dims: Array<number>;
  color: number;
  sprite: string;
  kind: string;
  scale: number;
}

setup();

const engine = Engine.create();

let cameraTargetBody: Body;
let cameraTargetBodiesAvailable: Array<Body> = [];

engine.world.gravity.x = 0;
engine.world.gravity.y = 0;

let playerBody: Body;
let b2: BodyExt;

const obstacles: Array<Body> = [];

// CAR

const isCar = true;
const w = isCar ? 14 : 32;
const h = isCar ? 22 : 32;
// @ts-ignore
b2 = Bodies.rectangle(0, 0, w, h, {
  isStatic: false,
  angle: 0,
  //angle: Math.PI / 2,
  collisionFilter: {
    category: CAR_CATEGORY,
    mask: CAR_CATEGORY | OBSTACLE_CATEGORY
  }
}) as BodyExt;
b2.kind = 'rect'; // rect sprite
//b2.sprite = `assets/B.png`;
b2.color = 0x0000ff;
b2.dims = [w, h];
b2.scale = 1;

b2.frictionAir = 0.3;
b2.friction = 0.1;
playerBody = b2;
cameraTargetBody = b2;
cameraTargetBodiesAvailable.push(b2);

World.add(engine.world, b2);

// OBSTACLE
// @ts-ignore
b2 = Bodies.circle(100, 100, 20, {
  isStatic: true,
  collisionFilter: {
    category: OBSTACLE_CATEGORY,
    mask: CAR_CATEGORY
  }
});
b2.kind = 'circle';
b2.color = 0xff0000;
b2.dims = [40, 40];
b2.scale = 1;
World.add(engine.world, b2);
obstacles.push(b2);

renderFactory(engine);

//setZoom(2.5);
setPosition(new Point(-400, -200));

// let toKill: Array<Body> = [];

/* Events.on(engine, 'afterUpdate', (ev: any) => {
  toKill.forEach((body: BodyExt) => {
    removeSprite(body);
    World.remove(engine.world, body);
  });
  toKill = [];
}); */

Events.on(engine, 'afterUpdate', (ev: any) => {
  //const bodies = Composite.allBodies(engine.world);
  //const d = rayDist(playerBody, bodies, -Math.PI / 2, 30, 120);
  //console.log(d);

  const d = raycast(playerBody, obstacles, -Math.PI / 2, 0, 256, 4);

  //const dd = dist(d[0], d[1]);
  //console.log(dd.toFixed(0));

  // @ts-ignore
  window.addLine = [d[0], d[1], 0xff00ff, 2];
});

/* Events.on(engine, 'collisionStart', (ev: any) => {
  // collisionStart collisionEnd beforeUpdate beforeTick
  (ev.pairs as Array<IPair>).forEach((pair: IPair) => {
    // @ts-ignore
    const bA: BodyExt = pair.bodyA;
    // @ts-ignore
    const bB: BodyExt = pair.bodyB;
  });
}); */

function driveCar(
  carBody: Body,
  pressingUp: boolean,
  pressingDown: boolean,
  pressingLeft: boolean,
  pressingRight: boolean
) {
  const fwd = pressingUp
    ? carBody === playerBody
      ? 1
      : 0.6
    : pressingDown
    ? -0.5
    : 0;
  const side = pressingLeft ? -1 : pressingRight ? 1 : 0;

  if (fwd) {
    const p = fwd * 0.0013;
    const ang = carBody.angle - Math.PI / 2;
    const v = {
      x: p * Math.cos(ang),
      y: p * Math.sin(ang)
    };
    Body.applyForce(carBody, carBody.position, v);
    //console.log('v', p);
  }

  if (side) {
    const spd = clamp(carBody.speed, 0.01, 0.1);
    const angVel = spd * side * sign(fwd);
    Body.setAngularVelocity(carBody, angVel);
    //console.log('angVel', angVel);
  }
}

function moveCar(carBody: Body, dir: Vector) {
  Body.applyForce(carBody, carBody.position, dir);
}

Events.on(engine, 'beforeUpdate', (ev: any) => {
  // collisionStart collisionEnd beforeUpdate beforeTick

  //console.log(justChanged);

  Object.keys(justChanged).forEach(k => {
    // @ts-ignore
    justChanged[k] = false;
  });

  // console.log(`${oldPos.x.toFixed(0)}, ${oldPos.y.toFixed(0)}`);

  // @ts-ignore
  setPosition(cameraTargetBody.position);
  // setZoom( lerp(clamp(0.5 / cameraTargetBody.speed, 0.75, 1.33), getZoom(), 0.03) );

  //console.log(isDown);

  // manipulate car according to keys being pressed
  driveCar(
    playerBody,
    isDown[KC_UP],
    isDown[KC_DOWN],
    isDown[KC_LEFT],
    isDown[KC_RIGHT]
  );
});

hookKeys();
