import { Engine, World, Bodies, Events, Body } from 'matter-js';
import { setup, renderFactory, setZoom, setPosition } from './render';
import {
  KC_UP,
  KC_DOWN,
  KC_LEFT,
  KC_RIGHT,
  isDown,
  hookKeys,
  justChanged
} from './keyboard';
import { clamp, sign, lerp, raycast, accum } from './utils';
import { CAR_CATEGORY, OBSTACLE_CATEGORY } from './matterCategories';
import { MapItem, map } from './map';

export interface BodyExt extends Body {
  el: any;
  dims: Array<number>;
  color: string;
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

const obstacles: Array<Body> = [];
const bots: Array<Body> = [];

const fwdAccum: Array<number> = [];
const sideAccum: Array<number> = [];

function addCar(item: MapItem) {
  const w = 14;
  const h = 22;
  // @ts-ignore
  let b2: BodyExt = Bodies.rectangle(item.position.x, item.position.y, w, h, {
    isStatic: false,
    angle: 0,
    collisionFilter: {
      category: CAR_CATEGORY,
      mask: CAR_CATEGORY | OBSTACLE_CATEGORY
    }
  }) as BodyExt;
  b2.kind = 'rect'; // rect sprite
  //b2.sprite = `assets/B.png`;
  b2.color = item.color;
  b2.dims = [w, h];
  b2.frictionAir = 0.3;
  b2.friction = 0.1;
  World.add(engine.world, b2);
  return b2;
}

function addObstacle(item: MapItem) {
  // @ts-ignore
  let b2: BodyExt = Bodies.circle(
    item.position.x,
    item.position.y,
    item.radius,
    // @ts-ignore
    {
      isStatic: true,
      collisionFilter: {
        category: OBSTACLE_CATEGORY,
        mask: CAR_CATEGORY
      }
    }
  );
  b2.kind = 'circle';
  b2.color = item.color;
  b2.dims = [item.radius * 2, item.radius * 2];
  World.add(engine.world, b2);
  obstacles.push(b2);
  return b2;
}

function addRoadSegment() {}

map.forEach((mapItem, idx) => {
  if (mapItem.kind === 'circle') {
    addObstacle(mapItem);
  } else {
    const b2 = addCar(mapItem);
    if (idx === 0) {
      playerBody = b2;
      cameraTargetBody = b2;
      cameraTargetBodiesAvailable.push(b2);
    } else {
      bots.push(b2);
    }
  }
});

renderFactory(engine);

//setZoom(2.5);
setPosition({ x: -400, y: -200 });

Events.on(engine, 'afterUpdate', (ev: any) => {
  const d = raycast(playerBody, obstacles, -Math.PI / 2, 0, 256, 4);

  //const dd = dist(d[0], d[1]);
  //console.log(dd.toFixed(0));

  // @ts-ignore
  //window.addLine = [d[0], d[1], 0xff00ff, 2];
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
  const fwd = pressingUp ? 1 : pressingDown ? -0.5 : 0;
  const side = pressingLeft ? -1 : pressingRight ? 1 : 0;
  driveCarLow(carBody, fwd, side);
}

function driveCarLow(carBody: Body, fwd: number, side: number) {
  if (fwd) {
    const p = fwd * 0.0013;
    const ang = carBody.angle - Math.PI / 2;
    const v = {
      x: p * Math.cos(ang),
      y: p * Math.sin(ang)
    };
    Body.applyForce(carBody, carBody.position, v);
  }

  if (side) {
    const spd = clamp(carBody.speed, 0.01, 0.1);
    const angVel = spd * side * sign(fwd);
    Body.setAngularVelocity(carBody, angVel);
  }
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

  const fwd = accum(fwdAccum, Math.random() * 1.5 - 0.5, 5); // [-0.5, 1]
  const side = accum(sideAccum, Math.random() * 2 - 1, 10); // [-1, 1]

  bots.forEach(bot => {
    driveCarLow(bot, fwd, side);
  });
});

hookKeys();
