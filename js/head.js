import * as THREE from "three";

// The head is a sphere sculpted by the face shape. Everything is in "head
// units" (radius ~1), and the head group is scaled to metres in body.js.
// +z is the face, +y is up, +x is the character's left.

export const HEAD_SCALE = 0.1;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

// Width multiplier down the head: forehead → cheekbones → jaw → chin.
function widthAt(y, s) {
  const keys = [
    [-1.0, s.chin],
    [-0.85, s.chin],
    [-0.45, s.jw],
    [0.05, s.cw],
    [0.5, s.fw],
    [1.0, s.fw * 0.96],
  ];
  for (let i = 1; i < keys.length; i++) {
    if (y <= keys[i][0]) {
      const [y0, w0] = keys[i - 1];
      const [y1, w1] = keys[i];
      return lerp(w0, w1, smooth(y0, y1, y));
    }
  }
  return keys[keys.length - 1][1];
}

// Maps a unit direction to a point on this face shape's head surface.
export function headPoint(x, y, z, s, out = new THREE.Vector3()) {
  // Squarer cross-section around the jaw for square/rectangle faces.
  const jawW = Math.exp(-(((y + 0.5) / 0.32) ** 2));
  const n = lerp(2, s.n, jawW);
  let k = 1;
  const r = Math.hypot(x, z);
  if (r > 1e-6 && n !== 2) {
    const c = Math.abs(x / r);
    const sn = Math.abs(z / r);
    k = Math.min(1.18, Math.pow(c ** n + sn ** n, -1 / n));
  }
  const w = widthAt(y, s);
  let X = x * k * w * 0.8;
  let Z = z * k * 0.98;
  const Y = y * s.h;
  if (y < 0) {
    if (z > 0) Z *= 1 + 0.06 * -y; // chin sits forward
    else Z *= 1 - 0.28 * smooth(0, -0.9, y); // back of skull tucks into neck
  }
  if (y > 0.2 && z > 0.3) Z *= 1 - 0.05 * smooth(0.2, 0.7, y); // flatter forehead
  return out.set(X, Y, Z);
}

// Direction on the unit sphere from simple angles (degrees).
export function dir(yawDeg, pitchDeg) {
  const yaw = THREE.MathUtils.degToRad(yawDeg);
  const pitch = THREE.MathUtils.degToRad(pitchDeg);
  return new THREE.Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch),
  );
}

function surface(d, s) {
  const v = d.clone().normalize();
  return headPoint(v.x, v.y, v.z, s);
}

function ellipsoid(mat, sx, sy, sz, seg = 24) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)), mat);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  return m;
}

// Builds the bare head (skin, ears, nose, lips, eyes, brows).
// Returns { group, skinMeshes } so the skin tone can be swapped later.
export function buildHead(shape, mats) {
  const group = new THREE.Group();

  const geo = new THREE.SphereGeometry(1, 128, 96);
  const pos = geo.attributes.position;
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    headPoint(p.x, p.y, p.z, shape, p);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  geo.computeVertexNormals();
  const skull = new THREE.Mesh(geo, mats.skin);
  skull.castShadow = true;
  group.add(skull);

  // Nose: bridge + tip.
  const bridgeAt = surface(dir(0, -8), shape);
  const bridge = ellipsoid(mats.skin, 0.075, 0.24, 0.09);
  bridge.position.copy(bridgeAt).add(new THREE.Vector3(0, -0.02, 0.0));
  bridge.rotation.x = -0.3;
  group.add(bridge);
  const tipAt = surface(dir(0, -19), shape);
  const tip = ellipsoid(mats.skin, 0.085, 0.075, 0.08);
  tip.position.copy(tipAt).add(new THREE.Vector3(0, 0.02, 0.085));
  group.add(tip);
  for (const sx of [-1, 1]) {
    const ala = ellipsoid(mats.skin, 0.055, 0.045, 0.05);
    ala.position.copy(tipAt).add(new THREE.Vector3(sx * 0.068, -0.005, 0.04));
    group.add(ala);
  }

  // Lips.
  const mouthAt = surface(dir(0, -32), shape);
  const upper = ellipsoid(mats.lips, 0.14, 0.026, 0.035);
  upper.position.copy(mouthAt).add(new THREE.Vector3(0, 0.02, -0.012));
  const lower = ellipsoid(mats.lips, 0.12, 0.032, 0.04);
  lower.position.copy(mouthAt).add(new THREE.Vector3(0, -0.03, -0.015));
  group.add(upper, lower);

  // Eyes, lids and brows.
  for (const sx of [-1, 1]) {
    const eyeAt = surface(dir(sx * 21, 9), shape);
    const inward = eyeAt.clone().normalize().multiplyScalar(-0.035);
    const white = ellipsoid(mats.eyeWhite, 0.105, 0.05, 0.05, 24);
    white.position.copy(eyeAt).add(inward);
    const iris = ellipsoid(mats.iris, 0.042, 0.042, 0.012, 20);
    iris.position.copy(eyeAt).add(inward).add(new THREE.Vector3(sx * -0.004, -0.002, 0.047));
    const lid = ellipsoid(mats.skin, 0.12, 0.034, 0.062, 24);
    lid.position.copy(eyeAt).add(inward).add(new THREE.Vector3(0, 0.036, 0.004));
    const lower = ellipsoid(mats.skin, 0.11, 0.02, 0.055, 20);
    lower.position.copy(eyeAt).add(inward).add(new THREE.Vector3(0, -0.04, 0.0));
    group.add(white, iris, lid, lower);

    const browAt = surface(dir(sx * 21, 22), shape);
    const brow = ellipsoid(mats.brow, 0.15, 0.028, 0.035, 16);
    brow.position.copy(browAt).add(browAt.clone().normalize().multiplyScalar(0.01));
    brow.rotation.z = sx * -0.12;
    group.add(brow);
  }

  // Ears.
  for (const sx of [-1, 1]) {
    const earAt = surface(new THREE.Vector3(sx, -0.02, -0.08), shape);
    const ear = ellipsoid(mats.skin, 0.07, 0.26, 0.17);
    ear.position.copy(earAt).add(new THREE.Vector3(sx * 0.02, 0, -0.02));
    ear.rotation.y = sx * -0.35;
    ear.rotation.z = sx * 0.06;
    group.add(ear);
  }

  return group;
}
