import * as THREE from "three";
import { buildHead, HEAD_SCALE } from "./head.js";

// A clean, mannequin-style body in metres, feet on y = 0, facing +z.

const UP = new THREE.Vector3(0, 1, 0);

function limb(a, b, r, mat) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 20), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
  m.castShadow = true;
  return m;
}

function lathe(points, mat, depth = 0.62) {
  const geo = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), 64);
  const m = new THREE.Mesh(geo, mat);
  m.scale.z = depth;
  m.castShadow = true;
  return m;
}

export function createMaterials() {
  return {
    skin: new THREE.MeshPhysicalMaterial({ color: "#d9a882", roughness: 0.58, sheen: 0.35, sheenRoughness: 0.6, sheenColor: "#ff9f86" }),
    lips: new THREE.MeshStandardMaterial({ color: "#b27060", roughness: 0.5 }),
    eyeWhite: new THREE.MeshStandardMaterial({ color: "#eeeae4", roughness: 0.25 }),
    iris: new THREE.MeshStandardMaterial({ color: "#2a1d15", roughness: 0.15 }),
    brow: new THREE.MeshStandardMaterial({ color: "#2a1d15", roughness: 0.9 }),
    tee: new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.92 }),
    denim: new THREE.MeshStandardMaterial({ color: "#2c3646", roughness: 0.85 }),
    shoe: new THREE.MeshStandardMaterial({ color: "#f1efea", roughness: 0.6 }),
    sole: new THREE.MeshStandardMaterial({ color: "#d8d4cc", roughness: 0.7 }),
  };
}

// Sets skin, lip and brow colours from the chosen tone and hair colour.
export function applyTones(mats, skinHex, hairHex) {
  mats.skin.color.set(skinHex);
  mats.lips.color.set(skinHex).lerp(new THREE.Color("#a0524a"), 0.35).multiplyScalar(0.85);
  mats.brow.color.set(hairHex).multiplyScalar(0.85);
}

// Returns { root, headAnchor }. Hair meshes are added to headAnchor.
export function buildBody(char, shape, mats) {
  const root = new THREE.Group();
  const s = char.height / 1.8;
  const b = char.build;
  const body = new THREE.Group();
  body.scale.set(b, s, b);
  root.add(body);

  // Torso in a black tee.
  body.add(
    lathe(
      [[0.0, 1.47], [0.062, 1.485], [0.1, 1.468], [0.16, 1.44], [0.2, 1.405], [0.212, 1.36], [0.207, 1.28],
       [0.195, 1.15], [0.185, 1.02], [0.188, 0.95], [0.0, 0.95]],
      mats.tee,
    ),
  );
  // Hips.
  body.add(lathe([[0.0, 0.97], [0.185, 0.97], [0.19, 0.9], [0.175, 0.82], [0.0, 0.8]], mats.denim, 0.66));

  // Neck.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.16, 32), mats.skin);
  neck.position.set(0, 1.52, -0.015);
  body.add(neck);

  // Arms: sleeve, upper arm, forearm, hand.
  for (const sx of [-1, 1]) {
    const sh = new THREE.Vector3(sx * 0.205, 1.36, 0);
    const el = new THREE.Vector3(sx * 0.24, 1.1, -0.01);
    const wr = new THREE.Vector3(sx * 0.25, 0.86, 0.03);
    body.add(limb(sh, el, 0.044, mats.skin));
    body.add(limb(sh.clone().add(new THREE.Vector3(sx * -0.01, 0.0, 0)), sh.clone().lerp(el, 0.5), 0.054, mats.tee));
    body.add(limb(el, wr, 0.04, mats.skin));
    const hand = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), mats.skin);
    hand.scale.set(0.032, 0.075, 0.05);
    hand.position.copy(wr).add(new THREE.Vector3(sx * 0.004, -0.07, 0));
    hand.castShadow = true;
    body.add(hand);
  }

  // Legs and shoes.
  for (const sx of [-1, 1]) {
    body.add(limb(new THREE.Vector3(sx * 0.095, 0.86, 0), new THREE.Vector3(sx * 0.1, 0.48, 0.01), 0.074, mats.denim));
    body.add(limb(new THREE.Vector3(sx * 0.1, 0.48, 0.01), new THREE.Vector3(sx * 0.105, 0.12, 0), 0.062, mats.denim));
    const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.17, 6, 16), mats.shoe);
    shoe.rotation.x = Math.PI / 2;
    shoe.scale.set(1.05, 1, 0.75);
    shoe.position.set(sx * 0.105, 0.055 / s, 0.05);
    shoe.castShadow = true;
    body.add(shoe);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.022, 0.29), mats.sole);
    sole.position.set(sx * 0.105, 0.011 / s, 0.05);
    body.add(sole);
  }

  // Head sits on the neck, in world scale (not stretched by the body scale).
  const headAnchor = new THREE.Group();
  headAnchor.position.set(0, 1.5 * s + 0.095, 0.012);
  headAnchor.scale.setScalar(HEAD_SCALE);
  headAnchor.add(buildHead(shape, mats));
  root.add(headAnchor);

  return { root, headAnchor };
}
