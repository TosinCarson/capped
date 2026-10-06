import * as THREE from "three";
import { OrbitControls } from "three/addons/OrbitControls.js";
import { RoomEnvironment } from "three/addons/RoomEnvironment.js";
import { CHARACTERS, CUTS, SKIN_TONES, FACE_SHAPES } from "./data.js";
import { buildBody, createMaterials, applyTones } from "./body.js";
import { buildHead } from "./head.js";
import { buildHair } from "./hair.js";

const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- State (also mirrored in the URL) ----------
const params = new URLSearchParams(location.search);
const pick = (list, id) => (list.some((x) => x.id === id) ? id : list[0].id);
const state = {
  char: pick(CHARACTERS, params.get("char")),
  cut: pick(CUTS, params.get("cut")),
  tones: Object.fromEntries(CHARACTERS.map((c) => [c.id, c.tone])),
  ba: "after",
  frame: params.get("frame") === "body" ? "body" : "head",
  auto: !reduceMotion,
};
if (SKIN_TONES.some((t) => t.id === params.get("tone"))) state.tones[state.char] = params.get("tone");

const charData = () => CHARACTERS.find((c) => c.id === state.char);
const cutData = () => CUTS.find((c) => c.id === state.cut);
const toneHex = (charId) => SKIN_TONES.find((t) => t.id === state.tones[charId]).hex;
const activeCut = () => (state.ba === "before" ? "buzz" : state.cut);

// ---------- Renderer, scene, lights ----------
const canvas = $("scene");
const frameEl = $("frame");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const envTexture = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

function addLights(scene, shadows) {
  scene.environment = envTexture;
  scene.environmentIntensity = 0.55;
  const key = new THREE.DirectionalLight("#fff6ec", 2.4);
  key.position.set(1.6, 3, 2.6);
  if (shadows) {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -1.5;
    key.shadow.camera.right = 1.5;
    key.shadow.camera.top = 2.5;
    key.shadow.camera.bottom = -0.5;
    key.shadow.bias = -0.001;
    key.shadow.normalBias = 0.05;
  }
  const fill = new THREE.DirectionalLight("#e8eeff", 0.8);
  fill.position.set(-2.5, 1.5, 1.5);
  const rim = new THREE.DirectionalLight("#ffffff", 1.6);
  rim.position.set(-1, 2.5, -3);
  scene.add(key, fill, rim, new THREE.HemisphereLight("#ffffff", "#d8d2ca", 0.5));
}

const scene = new THREE.Scene();
addLights(scene, true);
const ground = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.ShadowMaterial({ opacity: 0.16 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 50);
camera.position.set(0, 1.62, 1);

// ---------- Controls: drag/touch to rotate, auto-rotate when idle ----------
const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.8;
controls.minPolarAngle = Math.PI / 2 - 0.55;
controls.maxPolarAngle = Math.PI / 2 + 0.3;
controls.autoRotateSpeed = 1.4;
controls.autoRotate = state.auto;

let resumeTimer;
let snapTheta = null; // target azimuth when a view button is pressed
controls.addEventListener("start", () => {
  controls.autoRotate = false;
  snapTheta = null;
  clearTimeout(resumeTimer);
  $("dragHint").classList.add("gone");
  setActiveAngle(null);
});
controls.addEventListener("end", () => {
  clearTimeout(resumeTimer);
  if (state.auto) resumeTimer = setTimeout(() => (controls.autoRotate = state.auto), 2500);
});

// ---------- Character ----------
const mats = createMaterials();
let current = null; // { root, headAnchor, hair }

function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
  });
}

function setHair() {
  const c = charData();
  if (current.hair) {
    current.headAnchor.remove(current.hair);
    current.hair.geometry.dispose();
    current.hair.material.dispose();
  }
  current.hair = buildHair(activeCut(), FACE_SHAPES[c.face], c.hair, toneHex(c.id));
  current.headAnchor.add(current.hair);
}

function buildCharacter() {
  const c = charData();
  if (current) {
    scene.remove(current.root);
    disposeTree(current.root);
  }
  applyTones(mats, toneHex(c.id), c.hair);
  const { root, headAnchor } = buildBody(c, FACE_SHAPES[c.face], mats);
  current = { root, headAnchor, hair: null };
  setHair();
  scene.add(root);
  frameTo(state.frame, true);
}

// ---------- Framing: head shot vs full body ----------
const goal = { target: new THREE.Vector3(), dist: 1, active: false };

function frameTo(kind, instant = false) {
  const headY = current.headAnchor.getWorldPosition(new THREE.Vector3()).y;
  const c = charData();
  if (kind === "head") {
    goal.target.set(0, headY - 0.03, 0);
    goal.dist = 1.05;
    controls.minDistance = 0.6;
    controls.maxDistance = 1.8;
  } else {
    goal.target.set(0, c.height * 0.52, 0);
    goal.dist = 4.6;
    controls.minDistance = 2.2;
    controls.maxDistance = 6;
  }
  goal.active = true;
  if (instant) {
    const off = camera.position.clone().sub(controls.target);
    if (off.lengthSq() < 1e-6) off.set(0, 0, 1);
    controls.target.copy(goal.target);
    camera.position.copy(goal.target).add(off.setLength(goal.dist));
    goal.active = false;
  }
}

// ---------- View snapping: front / left / right / back ----------
// Azimuth 0 = facing the camera. The character's left is +x.
const ANGLES = { front: 0, left: Math.PI / 2, right: -Math.PI / 2, back: Math.PI };

function snapTo(name) {
  snapTheta = ANGLES[name];
  controls.autoRotate = false;
  clearTimeout(resumeTimer);
  setAuto(false);
  setActiveAngle(name);
}

function setActiveAngle(name) {
  document.querySelectorAll("#viewSeg button").forEach((b) => b.classList.toggle("active", b.dataset.angle === name));
}

const sph = new THREE.Spherical();
const offset = new THREE.Vector3();
const clock = new THREE.Clock();

function tick() {
  // Frame-rate independent easing, so transitions take the same time on any device.
  const k = 1 - Math.exp(-clock.getDelta() * 7);
  if (goal.active) {
    controls.target.lerp(goal.target, k);
    offset.copy(camera.position).sub(controls.target);
    const len = THREE.MathUtils.lerp(offset.length(), goal.dist, k);
    camera.position.copy(controls.target).add(offset.setLength(len));
    if (controls.target.distanceTo(goal.target) < 0.002 && Math.abs(len - goal.dist) < 0.005) goal.active = false;
  }
  if (snapTheta !== null) {
    offset.copy(camera.position).sub(controls.target);
    sph.setFromVector3(offset);
    let d = snapTheta - sph.theta;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    sph.theta += d * k;
    sph.phi += (Math.PI / 2 - 0.08 - sph.phi) * k;
    if (Math.abs(d) < 0.002) snapTheta = null;
    camera.position.copy(controls.target).add(offset.setFromSpherical(sph));
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function resize() {
  const w = frameEl.clientWidth;
  const h = frameEl.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(frameEl);

// ---------- Thumbnails (rendered once per change into images) ----------
const thumbRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
thumbRenderer.setSize(192, 192);
thumbRenderer.outputColorSpace = THREE.SRGBColorSpace;
thumbRenderer.toneMapping = THREE.ACESFilmicToneMapping;
const thumbScene = new THREE.Scene();
addLights(thumbScene, false);
const thumbMats = createMaterials();
const thumbCam = new THREE.PerspectiveCamera(24, 1, 0.1, 50);

function thumbnail(char, cutId, toneId, yawDeg = 28) {
  const shape = FACE_SHAPES[char.face];
  const skinHex = SKIN_TONES.find((t) => t.id === toneId).hex;
  applyTones(thumbMats, skinHex, char.hair);
  const g = new THREE.Group();
  g.add(buildHead(shape, thumbMats));
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.66, 1.6, 32), thumbMats.skin);
  neck.position.set(0, -1.3, -0.12);
  const tee = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 2.4, 1.2, 48), thumbMats.tee);
  tee.position.set(0, -2.4, -0.12);
  tee.scale.z = 0.6;
  g.add(neck, tee, buildHair(cutId, shape, char.hair, skinHex, 0.55));
  thumbScene.add(g);
  const yaw = THREE.MathUtils.degToRad(yawDeg);
  thumbCam.position.set(Math.sin(yaw) * 7.2, 0.5, Math.cos(yaw) * 7.2);
  thumbCam.lookAt(0, -0.1, 0);
  thumbRenderer.render(thumbScene, thumbCam);
  const url = thumbRenderer.domElement.toDataURL("image/png");
  thumbScene.remove(g);
  g.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material && !Object.values(thumbMats).includes(o.material)) o.material.dispose();
  });
  return url;
}

// ---------- UI ----------
function renderCharacters() {
  const wrap = $("modelSwitcher");
  wrap.innerHTML = "";
  CHARACTERS.forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "model-btn";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(c.id === state.char));
    const img = document.createElement("img");
    img.alt = "";
    img.src = thumbnail(c, state.cut, state.tones[c.id], 0);
    const text = document.createElement("span");
    text.className = "model-text";
    text.innerHTML = `${c.name}<small>${FACE_SHAPES[c.face].label}</small>`;
    btn.append(img, text);
    btn.addEventListener("click", () => {
      if (c.id === state.char) return;
      state.char = c.id;
      buildCharacter();
      renderAll({ chars: true, cuts: true });
    });
    wrap.append(btn);
  });
}

function renderCuts() {
  const grid = $("styleGrid");
  grid.innerHTML = "";
  const c = charData();
  CUTS.forEach((cut) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "style-tile";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(cut.id === state.cut));
    const img = document.createElement("img");
    img.alt = "";
    img.src = thumbnail(c, cut.id, state.tones[c.id]);
    const label = document.createElement("span");
    label.textContent = cut.name;
    btn.append(img, label);
    btn.addEventListener("click", () => selectCut(cut.id));
    grid.append(btn);
  });
}

function renderSkin() {
  const wrap = $("swatches");
  wrap.innerHTML = "";
  const tone = state.tones[state.char];
  SKIN_TONES.forEach((t) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "swatch";
    b.style.setProperty("--c", t.hex);
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(t.id === tone));
    b.setAttribute("aria-label", t.label);
    b.title = t.label;
    b.addEventListener("click", () => {
      state.tones[state.char] = t.id;
      applyTones(mats, t.hex, charData().hair);
      setHair();
      renderAll({ chars: true, cuts: true });
    });
    wrap.append(b);
  });
  $("toneLabel").textContent = `${charData().name}'s skin tone: ${SKIN_TONES.find((t) => t.id === tone).label}`;
}

function renderDetails() {
  const cut = cutData();
  const c = charData();
  $("styleName").textContent = state.ba === "before" ? `Before · Buzz cut` : cut.name;
  $("styleTag").textContent = cut.tag;
  $("styleDesc").textContent = cut.desc;
  $("metaLength").textContent = cut.length;
  $("metaTime").textContent = cut.time;
  $("metaFresh").textContent = cut.fresh;
  $("metaUpkeep").textContent = cut.upkeep;
  $("modelPillName").textContent = c.name;
  $("modelPillFace").textContent = `${FACE_SHAPES[c.face].label} face`;
  canvas.setAttribute("aria-label", `${c.name}, ${FACE_SHAPES[c.face].label.toLowerCase()} face, with a ${state.ba === "before" ? "buzz cut" : cut.name}. Drag to rotate.`);
}

function syncUrl() {
  const url = new URL(location.href);
  url.searchParams.set("char", state.char);
  url.searchParams.set("cut", state.cut);
  url.searchParams.set("tone", state.tones[state.char]);
  url.searchParams.set("frame", state.frame);
  history.replaceState(null, "", url);
}

function renderAll({ chars = false, cuts = false } = {}) {
  renderDetails();
  renderSkin();
  if (cuts) renderCuts();
  if (chars) renderCharacters();
  syncUrl();
}

function selectCut(id) {
  state.cut = id;
  if (state.ba === "before") setBA("after");
  else setHair();
  renderAll({ chars: true, cuts: true });
}

function setBA(v) {
  state.ba = v;
  document.querySelectorAll("[data-ba]").forEach((b) => {
    const on = b.dataset.ba === v;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
  setHair();
  renderDetails();
}

function setAuto(on) {
  state.auto = on;
  controls.autoRotate = on;
  const btn = $("autoBtn");
  btn.classList.toggle("active", on);
  btn.setAttribute("aria-pressed", String(on));
}

document.querySelectorAll("[data-ba]").forEach((b) => b.addEventListener("click", () => setBA(b.dataset.ba)));
document.querySelectorAll("[data-angle]").forEach((b) => b.addEventListener("click", () => snapTo(b.dataset.angle)));
$("autoBtn").addEventListener("click", () => {
  setAuto(!state.auto);
  if (state.auto) {
    snapTheta = null;
    setActiveAngle(null);
  }
});
document.querySelectorAll("[data-frame]").forEach((b) =>
  b.addEventListener("click", () => {
    state.frame = b.dataset.frame;
    document.querySelectorAll("[data-frame]").forEach((x) => {
      const on = x === b;
      x.classList.toggle("active", on);
      x.setAttribute("aria-pressed", String(on));
    });
    frameTo(state.frame);
    syncUrl();
  }),
);
document.querySelectorAll("[data-tab]").forEach((tab) =>
  tab.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((t) => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
    });
    document.querySelectorAll("[data-tab-body]").forEach((body) => (body.hidden = body.dataset.tabBody !== tab.dataset.tab));
  }),
);

document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  const i = CUTS.findIndex((c) => c.id === state.cut);
  const step = e.key === "ArrowRight" ? 1 : -1;
  selectCut(CUTS[(i + step + CUTS.length) % CUTS.length].id);
});

// ---------- Save + share ----------
const SAVE_KEY = "capped:saved";
function readSaved() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || []; } catch { return []; }
}
function writeSaved(list) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
}
const renderSavedCount = () => ($("savedCount").textContent = `Saved (${readSaved().length})`);

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

$("saveBtn").addEventListener("click", () => {
  const list = readSaved();
  const key = `${state.char}/${state.cut}/${state.tones[state.char]}`;
  if (list.includes(key)) return toast("Already in your saved looks");
  list.push(key);
  writeSaved(list);
  renderSavedCount();
  toast("Look saved");
});

$("shareBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    toast("Link copied");
  } catch {
    toast("Copy failed — use the address bar");
  }
});

// ---------- Init ----------
document.querySelectorAll("[data-frame]").forEach((x) => {
  const on = x.dataset.frame === state.frame;
  x.classList.toggle("active", on);
  x.setAttribute("aria-pressed", String(on));
});
setAuto(state.auto);
resize();
buildCharacter();
renderAll({ chars: true, cuts: true });
renderSavedCount();
$("loading").remove();
tick();
