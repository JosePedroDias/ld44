import { Engine, World, Bodies, Events, Body } from 'matter-js';
import { setup, renderFactory, setZoom, setPosition, getZoom } from './render';
import {
  KC_UP,
  KC_DOWN,
  KC_LEFT,
  KC_RIGHT,
  isDown,
  hookKeys,
  justChanged
} from './keyboard';
import { clamp, sign, lerp, raycast, accum, angleBetweenAngles } from './utils';
import {
  CAR_CATEGORY,
  OBSTACLE_CATEGORY,
  IGNORE_CATEGORY
} from './matterCategories';
import { MapItem, map } from './map';
import { getNearestWaypoint } from './waypoints';

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
  const angle = item.angle || 0;
  // @ts-ignore
  let b2: BodyExt = Bodies.rectangle(item.position.x, item.position.y, w, h, {
    isStatic: false,
    angle,
    collisionFilter: {
      category: CAR_CATEGORY,
      mask: CAR_CATEGORY | OBSTACLE_CATEGORY
    }
  }) as BodyExt;
  b2.kind = 'rect';
  if (item.color) {
    b2.color = item.color;
  }
  b2.dims = [w, h];
  b2.frictionAir = 0.3;
  b2.friction = 0.1;
  World.add(engine.world, b2);
  return b2;
}

function addObstacle(item: MapItem) {
  // @ts-ignore
  item.radius = item.radius || 0;
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
  if (item.color) {
    b2.color = item.color;
  }

  b2.dims = [item.radius * 2, item.radius * 2];
  World.add(engine.world, b2);
  obstacles.push(b2);
  return b2;
}

function addRoad(item: MapItem) {
  // @ts-ignore
  const b2: BodyExt = Bodies.circle(-1000, -1000, 1, {
    isStatic: true,
    // @ts-ignore
    collisionFilter: {
      category: IGNORE_CATEGORY,
      mask: 0
    }
  });
  b2.kind = 'road2';
  // @ts-ignore
  b2.segments = item.segments;
  World.add(engine.world, b2);
  return b2;
}

map.forEach(mapItem => {
  if (mapItem.kind === 'road2') {
    addRoad(mapItem);
  } else if (mapItem.kind === 'circle') {
    addObstacle(mapItem);
  } else if (mapItem.kind === 'rect') {
    const b2 = addCar(mapItem);
    if (!playerBody && mapItem.isPlayer) {
      playerBody = b2;
      cameraTargetBody = b2;
      cameraTargetBodiesAvailable.push(b2);
    } else {
      bots.push(b2);
    }
  }
});

renderFactory(engine);

// @TODO center of bouding box?
setZoom(1.1);
setPosition({ x: 0, y: 250 });

Events.on(engine, 'afterUpdate', (ev: any) => {
  // const d = raycast(playerBody, obstacles, -Math.PI / 2, 0, 256, 4);
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

  // manipulate car according to keys being pressed
  if (playerBody) {
    Object.keys(justChanged).forEach(k => {
      // @ts-ignore
      justChanged[k] = false;
    });

    // @ts-ignore
    setPosition(cameraTargetBody.position);
    setZoom(
      lerp(clamp(0.5 / cameraTargetBody.speed, 0.75, 2), getZoom(), 0.03)
    );

    driveCar(
      playerBody,
      isDown[KC_UP],
      isDown[KC_DOWN],
      isDown[KC_LEFT],
      isDown[KC_RIGHT]
    );
  }

  //const fwd = accum(fwdAccum, Math.random() * 1.5 - 0.5, 5); // [-0.5, 1]
  //const side = accum(sideAccum, Math.random() * 2 - 1, 10); // [-1, 1]

  bots.forEach(bot => {
    const wp = getNearestWaypoint(bot.position, bot.angle);

    const a = angleBetweenAngles(wp.a, bot.angle);
    const shouldTurn = Math.abs(a) > 0.7;
    //console.log(a);

    const fwd = 0.25;
    const side = shouldTurn ? sign(a) * 0.3 : 0;
    driveCarLow(bot, fwd, side);
  });
});

hookKeys();
