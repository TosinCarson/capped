// CAPPED — virtual hair studio concept.
// To add a model or style: add an entry below and drop the matching image in
// assets/models/<model-id>/<style-id>.jpg (see ASSET_PROMPTS.md).

const MODELS = [
  { id: "amara", name: "Amara", note: "Oval · Deep" },
  { id: "mei", name: "Mei", note: "Heart · Light" },
];

const STYLES = [
  {
    id: "knotless-braids",
    name: "Knotless Braids",
    tag: "Protective",
    desc: "Waist-length, medium knotless box braids. Lightweight at the root with a soft, natural part.",
    length: "Long",
    install: "5–7 hrs",
    lasts: "6–8 wks",
    upkeep: "Low",
  },
  {
    id: "afro",
    name: "Natural Afro",
    tag: "Natural",
    desc: "A full, rounded afro with defined coils. Big volume, shaped evenly around the face.",
    length: "Medium",
    install: "1 hr",
    lasts: "Daily",
    upkeep: "Medium",
  },
  {
    id: "sleek-bob",
    name: "Sleek Bob",
    tag: "Classic",
    desc: "A glossy, chin-length blunt bob with a centre part. Sharp, polished, and easy to wear.",
    length: "Short",
    install: "1.5 hrs",
    lasts: "4–6 wks",
    upkeep: "Medium",
  },
  {
    id: "curtain-waves",
    name: "Curtain Waves",
    tag: "Soft glam",
    desc: "Long, layered soft waves with face-framing curtain bangs and plenty of movement.",
    length: "Long",
    install: "2 hrs",
    lasts: "3–5 days",
    upkeep: "High",
  },
];

const BASE_ID = "base";
const imgPath = (model, style) => `assets/models/${model}/${style}.jpg`;

// ---------- Placeholder for images that haven't been added yet ----------
function placeholder(model, style) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
    <rect width="400" height="500" fill="#ebe8e3"/>
    <ellipse cx="200" cy="190" rx="70" ry="86" fill="#dcd8d2"/>
    <rect x="172" y="262" width="56" height="50" fill="#dcd8d2"/>
    <path d="M70 500 C80 360 140 318 200 318 C260 318 320 360 330 500 Z" fill="#dcd8d2"/>
    <text x="200" y="440" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" fill="#8a8680">${model}/${style}.jpg</text>
    <text x="200" y="462" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#a9a59f">image not added yet</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function setImg(img, model, style) {
  img.onerror = () => {
    img.onerror = null;
    img.src = placeholder(model, style);
  };
  img.src = imgPath(model, style);
}

// ---------- State ----------
const params = new URLSearchParams(location.search);
const state = {
  model: MODELS.some((m) => m.id === params.get("model")) ? params.get("model") : MODELS[0].id,
  style: STYLES.some((s) => s.id === params.get("style")) ? params.get("style") : STYLES[0].id,
  view: "style",
};

const $ = (id) => document.getElementById(id);
const frame = $("frame");
const baseImg = $("baseImg");
const styleImg = $("styleImg");

// ---------- Render ----------
function renderModels() {
  const wrap = $("modelSwitcher");
  wrap.innerHTML = "";
  MODELS.forEach((m) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "model-btn";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(m.id === state.model));
    btn.dataset.model = m.id;
    const img = document.createElement("img");
    img.alt = "";
    setImg(img, m.id, BASE_ID);
    btn.append(img);
    const text = document.createElement("span");
    text.className = "model-text";
    text.innerHTML = `${m.name}<small>${m.note}</small>`;
    btn.append(text);
    btn.addEventListener("click", () => update({ model: m.id }));
    wrap.append(btn);
  });
}

function renderStyles() {
  const grid = $("styleGrid");
  grid.innerHTML = "";
  STYLES.forEach((s) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "style-tile";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(s.id === state.style));
    const img = document.createElement("img");
    img.alt = "";
    setImg(img, state.model, s.id);
    const label = document.createElement("span");
    label.textContent = s.name;
    btn.append(img, label);
    btn.addEventListener("click", () => update({ style: s.id }));
    grid.append(btn);
  });
}

function renderDetails() {
  const s = STYLES.find((x) => x.id === state.style);
  const m = MODELS.find((x) => x.id === state.model);
  $("styleName").textContent = s.name;
  $("styleTag").textContent = s.tag;
  $("styleDesc").textContent = s.desc;
  $("metaLength").textContent = s.length;
  $("metaInstall").textContent = s.install;
  $("metaLasts").textContent = s.lasts;
  $("metaUpkeep").textContent = s.upkeep;
  $("modelPillName").textContent = m.name;
  styleImg.alt = `${m.name} wearing ${s.name}`;
  baseImg.alt = `${m.name} before styling`;
}

function swapStage() {
  styleImg.classList.add("loading");
  const done = () => styleImg.classList.remove("loading");
  styleImg.addEventListener("load", done, { once: true });
  setImg(styleImg, state.model, state.style);
  setImg(baseImg, state.model, BASE_ID);
}

function update(patch) {
  const modelChanged = patch.model && patch.model !== state.model;
  Object.assign(state, patch);
  renderDetails();
  swapStage();
  renderModels();
  if (modelChanged || patch.style) renderStyles();
  const url = new URL(location.href);
  url.searchParams.set("model", state.model);
  url.searchParams.set("style", state.style);
  history.replaceState(null, "", url);
}

// ---------- View toggle + compare slider ----------
document.querySelectorAll(".view-toggle button").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.view = btn.dataset.view;
    document.querySelectorAll(".view-toggle button").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", String(on));
    });
    frame.classList.toggle("compare", state.view === "compare");
  });
});

$("compareRange").addEventListener("input", (e) => {
  frame.style.setProperty("--split", `${e.target.value}%`);
});

// ---------- Keyboard ----------
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  const i = STYLES.findIndex((s) => s.id === state.style);
  const step = e.key === "ArrowRight" ? 1 : -1;
  update({ style: STYLES[(i + step + STYLES.length) % STYLES.length].id });
});

// ---------- Save + share ----------
const SAVE_KEY = "capped:saved";
function readSaved() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || []; } catch { return []; }
}
function writeSaved(list) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
}
function renderSavedCount() {
  $("savedCount").textContent = `Saved (${readSaved().length})`;
}

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
  const key = `${state.model}/${state.style}`;
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

// ---------- Preload so switching feels instant ----------
function preload() {
  MODELS.forEach((m) => {
    [BASE_ID, ...STYLES.map((s) => s.id)].forEach((s) => {
      const i = new Image();
      i.src = imgPath(m.id, s);
    });
  });
}

// ---------- Init ----------
renderSavedCount();
update({});
renderStyles();
preload();
