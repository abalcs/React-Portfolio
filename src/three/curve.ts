import * as THREE from 'three';
import { terrainHeight, gridHeight, PEAK } from './terrainHeight';

// Switchback ascent: trailhead far in front of the mountain, weaving left
// and right while climbing toward the summit at PEAK.
const CONTROL_XZ: Array<[number, number]> = [
  [0, 168], // trailhead — home
  [34, 118],
  [-38, 82], // about
  [40, 46], // skills
  [-34, 12], // experience
  [30, -18], // projects
  [-16, -42], // github
  [PEAK.x, PEAK.z + 6], // summit — contact
];

// The coarse guide only fixes the route in XZ. The real trail is that
// route resampled every few meters and re-seated on the terrain surface,
// so it hugs every ridge and dip instead of tunneling between waypoints.
const guide = new THREE.CatmullRomCurve3(
  CONTROL_XZ.map(([x, z]) => new THREE.Vector3(x, 0, z)),
  false,
  'centripetal'
);

// Dense sampling + low tension keeps the spline from dipping below sharp
// terrain detail between samples (visible as the path "entering" rock).
const surfacePoints = guide
  .getSpacedPoints(260)
  .map((p) => new THREE.Vector3(p.x, terrainHeight(p.x, p.z) + 0.7, p.z));

export const trailCurve = new THREE.CatmullRomCurve3(
  surfacePoints,
  false,
  'catmullrom',
  0.25
);

// Sunken twin of the trail for the path mesh, so the tube's crown sits at
// the hiker's boot level instead of swallowing him.
export const trailBedCurve = new THREE.CatmullRomCurve3(
  surfacePoints.map((p) => new THREE.Vector3(p.x, p.y - 0.65, p.z)),
  false,
  'catmullrom',
  0.25
);

/**
 * A point beside the trail at parameter t, offset perpendicular to the
 * direction of travel and re-seated on the terrain surface.
 */
export function besideTrail(t: number, side: number): THREE.Vector3 {
  const p = trailCurve.getPointAt(t);
  const tangent = trailCurve.getTangentAt(t);
  const perp = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
  p.addScaledVector(perp, side);
  p.y = gridHeight(p.x, p.z);
  return p;
}

export { WAYPOINT_T } from './journey';
