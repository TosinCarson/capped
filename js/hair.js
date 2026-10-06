import * as THREE from "three";
import { headPoint } from "./head.js";

// Each haircut is a thickness map over the scalp. A sphere shell is pushed out
// from the head surface by that thickness, so every cut fits every face shape.
// Short areas blend toward the skin colour, which is what makes fades read.

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

// Cheap deterministic 3D noise in roughly [-1, 1].
function noise(x, y, z, f) {
  return (
    Math.sin(x * f * 1.7 + Math.sin(y * f * 1.3)) *
      Math.cos(z * f * 1.9 + Math.sin(x * f * 0.7)) *
      0.6 +
    Math.sin((x + y) * f * 3.1 + z * 2.3) * 0.25 +
    Math.cos((y - z) * f * 4.7 + x) * 0.15
  );
}

// Natural hairline height around the head. u: 0 = front, 0.5 = side, 1 = back.
function hairlineY(u) {
  const keys = [[0, 0.5], [0.3, 0.42], [0.5, 0.14], [0.75, -0.25], [1, -0.55]];
  for (let i = 1; i < keys.length; i++) {
    if (u <= keys[i][0]) {
      const [u0, h0] = keys[i - 1];
      const [u1, h1] = keys[i];
      return lerp(h0, h1, (u - u0) / (u1 - u0));
    }
  }
  return keys[keys.length - 1][1];
}

// Zone weights shared by the cut definitions.
function zones(x, y, z) {
  const u = Math.abs(Math.atan2(x, z)) / Math.PI;
  return {
    u,
    top: smooth(0.42, 0.72, y),
    front: 1 - smooth(0.2, 0.34, u),
    side: smooth(0.25, 0.4, u) * (1 - smooth(0.68, 0.8, u)),
    back: smooth(0.68, 0.82, u),
    ear: smooth(0.7, 0.92, Math.abs(x)) * (1 - smooth(0.12, 0.3, Math.abs(y + 0.04))) * (1 - smooth(0.2, 0.4, Math.abs(z + 0.08))),
  };
}

// t: thickness (head units, ~1 = 10cm). mix: 0 = scalp shows, 1 = full hair colour.
// fringe: how far hair reaches down the forehead. nape: how far below the
// hairline it reaches at the back. drop: hang down the neck (mullet).
const CUTS = {
  buzz: () => ({ t: 0.03, mix: 0.45, choppy: 0, fringe: 0, earCover: 0 }),

  "low-taper": (x, y, z, Z) => {
    const sideLen = lerp(0.015, 0.11, smooth(-0.15, 0.4, y));
    return {
      t: lerp(sideLen, 0.3 + 0.06 * Math.max(0, z), Z.top),
      mix: clamp01(lerp(0.35, 1, smooth(-0.1, 0.35, y))),
      choppy: 0.28 * Z.top,
      fringe: 0.12, fringeT: 0.11,
      forward: 0.1 * Z.top,
      earCover: 0,
    };
  },

  "mod-cut": (x, y, z, Z) => {
    let t = 0.34 * Z.top + 0.27 * (1 - Z.top);
    t *= lerp(0.12, 1, smooth(-0.42, -0.02, y) * (1 - Z.back) + smooth(-0.6, -0.2, y) * Z.back);
    return { t, mix: 1, choppy: 0.16, fringe: 0.2, fringeT: 0.14, forward: 0.05, earCover: 0.55, round: 0.06 };
  },

  mullet: (x, y, z, Z) => {
    const faded = Z.side * (1 - smooth(0.22, 0.42, y));
    let t = lerp(0.13, 0.25, Z.top);
    t = lerp(t, 0.012, faded);
    t = lerp(t, 0.22, Z.back * (1 - Z.top));
    return {
      t,
      mix: lerp(1, 0.3, faded),
      choppy: 0.38,
      fringe: 0.1, fringeT: 0.1,
      forward: 0.06 * Z.top,
      earCover: 0,
      nape: 0.38, drop: 1.0,
    };
  },

  "textured-crop": (x, y, z, Z) => {
    const fade = smooth(0.12, 0.46, y);
    return {
      t: lerp(0.006, 0.17, fade),
      mix: lerp(0.12, 1, fade),
      choppy: 0.45 * Z.top,
      fringe: 0.09, fringeT: 0.1,
      forward: 0.07 * Z.top,
      earCover: 0,
    };
  },

  curtains: (x, y, z, Z) => {
    let t = lerp(0.2, 0.28, Z.top);
    t *= lerp(0.15, 1, smooth(-0.4, -0.05, y) * (1 - Z.back) + smooth(-0.6, -0.25, y) * Z.back);
    const part = Z.front * smooth(0.25, 0.6, y) * (1 - smooth(0.02, 0.09, Math.abs(x)));
    t = lerp(t, 0.05, part);
    const curtain = smooth(0.06, 0.38, Math.abs(x));
    return { t, mix: 1, choppy: 0.12, fringe: 0.26 * curtain, fringeT: 0.1 * curtain + 0.02, forward: 0, earCover: 0.45 };
  },

  "crew-cut": (x, y, z, Z) => {
    const sideLen = lerp(0.025, 0.09, smooth(-0.1, 0.45, y));
    return {
      t: lerp(sideLen, 0.15 + 0.06 * Z.front, Z.top),
      mix: clamp01(lerp(0.5, 1, smooth(0, 0.4, y))),
      choppy: 0.12 * Z.top,
      fringe: 0.03, fringeT: 0.08,
      forward: 0.03,
      earCover: 0,
    };
  },
};

// Fine streaks along the sphere's meridians, i.e. flowing from the crown down.
let strandTex = null;
function strandTexture() {
  if (strandTex) return strandTex;
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 512;
  const g = cv.getContext("2d");
  g.fillStyle = "#d8d8d8";
  g.fillRect(0, 0, cv.width, cv.height);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * cv.width;
    const v = Math.floor(150 + rnd() * 105);
    g.strokeStyle = `rgba(${v},${v},${v},${0.35 + rnd() * 0.5})`;
    g.lineWidth = 0.6 + rnd() * 1.4;
    g.beginPath();
    g.moveTo(x, -10);
    g.bezierCurveTo(x + (rnd() - 0.5) * 14, cv.height * 0.33, x + (rnd() - 0.5) * 14, cv.height * 0.66, x + (rnd() - 0.5) * 10, cv.height + 10);
    g.stroke();
  }
  strandTex = new THREE.CanvasTexture(cv);
  strandTex.colorSpace = THREE.SRGBColorSpace;
  strandTex.wrapS = THREE.RepeatWrapping;
  strandTex.repeat.set(3, 1);
  strandTex.anisotropy = 4;
  return strandTex;
}

export const CUT_IDS = Object.keys(CUTS);

// Neck sits slightly behind the head centre; long hair must stay outside it.
const NECK_Z = -0.15;
const NECK_R = 0.62;

export function buildHair(cutId, shape, hairHex, skinHex, detail = 1) {
  const cut = CUTS[cutId] || CUTS.buzz;
  const geo = new THREE.SphereGeometry(1, Math.round(240 * detail), Math.round(180 * detail));
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const hair = new THREE.Color(hairHex);
  const skin = new THREE.Color(skinHex).multiplyScalar(0.92);
  const c = new THREE.Color();
  const d = new THREE.Vector3();
  const p = new THREE.Vector3();
  const nrm = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    d.fromBufferAttribute(pos, i).normalize();
    const Z = zones(d.x, d.y, d.z);
    const s = cut(d.x, d.y, d.z, Z);
    const H = hairlineY(Z.u);

    // Coverage: natural hairline, plus the fringe at the front and nape at the back.
    let cover = smooth(H - 0.05, H + 0.05, d.y);
    let fringeZone = 0;
    if (s.fringe) {
      const f = Z.front * smooth(H - s.fringe - 0.02, H - s.fringe + 0.1, d.y);
      fringeZone = f * (1 - cover);
      cover = Math.max(cover, f);
    }
    let napeZone = 0;
    if (s.nape) {
      // Only the true back of the head, never the underside or around the jaw.
      const nz = smooth(0.58, 0.78, Z.u) * smooth(-0.1, -0.45, d.z) * smooth(H - s.nape - 0.05, H - s.nape + 0.05, d.y);
      napeZone = nz * (1 - cover);
      cover = Math.max(cover, nz);
    }
    // Keep ears clear unless the cut covers them.
    cover *= 1 - Z.ear * (1 - (s.earCover || 0));

    let t = s.t;
    if (fringeZone > 0) t = lerp(t, s.fringeT, fringeZone);
    // Low-frequency irregularity reads as piecey texture without looking curly.
    t *= 1 + (s.choppy || 0) * 0.5 * noise(d.x, d.y, d.z, 4.5);
    t += (s.round || 0) * Z.top;

    headPoint(d.x, d.y, d.z, shape, p);
    nrm.copy(p).normalize();

    if (cover < 0.35 || t < 0.004) {
      // Dive under the skin (deep enough never to poke through at silhouettes),
      // easing in so edges thin out instead of ending in a hard wall.
      p.addScaledVector(nrm, lerp(-0.12, 0.002, smooth(0.12, 0.35, cover)));
    } else {
      p.addScaledVector(nrm, t * smooth(0.35, 1.0, cover) + 0.004);
      if (s.forward) p.z += s.forward * Z.front * Z.top;
      if (s.drop && (napeZone > 0 || d.y < H)) {
        // Mullet: let the back hang down the neck.
        const k = smooth(H + 0.1, H - 0.4, d.y) * smooth(0.58, 0.78, Z.u) * smooth(-0.1, -0.45, d.z);
        p.y -= s.drop * k * 0.55;
        const rx = p.x;
        const rz = p.z - NECK_Z;
        const r = Math.hypot(rx, rz);
        const minR = NECK_R + 0.06 + t * 0.6;
        if (r < minR && k > 0) {
          const g = lerp(r, minR, k) / Math.max(r, 1e-4);
          p.x = rx * g;
          p.z = NECK_Z + rz * g;
        }
      }
    }
    pos.setXYZ(i, p.x, p.y, p.z);

    // Colour: blend toward skin where short (fades), slightly darker at the roots.
    const depth = lerp(0.82, 1.05, smooth(0.0, 0.25, t));
    c.copy(skin).lerp(hair, clamp01(s.mix)).multiplyScalar(lerp(1, depth, clamp01(s.mix)));
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const tex = strandTexture();
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    map: tex,
    bumpMap: tex,
    bumpScale: 2.2,
    roughness: 0.72,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}
