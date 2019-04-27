import { Vector } from 'matter-js';
import { getWaypoints } from './render';
import { TPoint } from './turtle';
import { distSquared, sign } from './utils';

export function getNearestWaypoint(position: Vector, angle: number): TPoint {
  let wps: Array<TPoint> = getWaypoints();
  const wpAux = wps.map(wp => [wp, distSquared(position, wp)]);
  function sortBySecond(a: any, b: any) {
    return sign(a[1] - b[1]);
  }
  wpAux.sort(sortBySecond);
  wps = wpAux.map(pair => pair[0]) as Array<TPoint>;
  //console.log(wpAux);
  return wps[0];
  // @TODO filter by difference of angle...
}
