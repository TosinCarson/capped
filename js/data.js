// Everything the studio can show. Add a character, cut or skin tone here.

// Face shape parameters drive the head sculpt in head.js.
//   fw / cw / jw / chin: width at forehead, cheekbones, jaw and chin
//   h: head height, n: jaw squareness (2 = round, higher = squarer corners)
export const FACE_SHAPES = {
  square:    { label: "Square",    fw: 1.0,  cw: 1.0,  jw: 1.02, chin: 0.72, h: 1.08, n: 2.9 },
  rectangle: { label: "Rectangle", fw: 0.95, cw: 0.95, jw: 0.96, chin: 0.66, h: 1.22, n: 2.7 },
  heart:     { label: "Heart",     fw: 1.08, cw: 1.02, jw: 0.82, chin: 0.52, h: 1.1, n: 2.2 },
  oval:      { label: "Oval",      fw: 0.93, cw: 1.0,  jw: 0.86, chin: 0.58, h: 1.12, n: 2.2 },
  round:     { label: "Round",     fw: 0.96, cw: 1.07, jw: 0.98, chin: 0.62, h: 1.0,  n: 2.0 },
  diamond:   { label: "Diamond",   fw: 0.82, cw: 1.08, jw: 0.82, chin: 0.52, h: 1.12, n: 2.4 },
};

export const SKIN_TONES = [
  { id: "porcelain", label: "Porcelain", hex: "#f3d9c6" },
  { id: "fair",      label: "Fair",      hex: "#e8c0a0" },
  { id: "light",     label: "Light",     hex: "#d9a882" },
  { id: "medium",    label: "Medium",    hex: "#c68c64" },
  { id: "olive",     label: "Olive",     hex: "#b07a52" },
  { id: "tan",       label: "Tan",       hex: "#946042" },
  { id: "brown",     label: "Brown",     hex: "#74472d" },
  { id: "deep",      label: "Deep",      hex: "#4e2e1d" },
];

export const CHARACTERS = [
  { id: "jake",  name: "Jake",  face: "square",    tone: "fair",   hair: "#5e4129", height: 1.84, build: 1.06 },
  { id: "ryan",  name: "Ryan",  face: "rectangle", tone: "light",  hair: "#33241a", height: 1.86, build: 1.0 },
  { id: "leo",   name: "Leo",   face: "heart",     tone: "olive",  hair: "#1c1612", height: 1.76, build: 0.96 },
  { id: "ethan", name: "Ethan", face: "oval",      tone: "porcelain", hair: "#8c6a42", height: 1.8, build: 0.98 },
  { id: "kai",   name: "Kai",   face: "round",     tone: "medium", hair: "#141210", height: 1.74, build: 1.02 },
  { id: "mateo", name: "Mateo", face: "diamond",   tone: "tan",    hair: "#221813", height: 1.79, build: 1.0 },
];

// "buzz" is the before shot, so it isn't listed as a cut.
export const CUTS = [
  {
    id: "mod-cut",
    name: "Mod Cut",
    tag: "Trending",
    desc: "A rounded, fringe-heavy shape with soft texture. The fringe sits just above the brows, with the tops of the ears covered.",
    length: "Medium", time: "45 min", fresh: "4–5 wks", upkeep: "Medium",
  },
  {
    id: "low-taper",
    name: "Low Taper",
    tag: "Clean",
    desc: "A low taper at the temples and neckline with textured length on top, pushed forward with a messy finish.",
    length: "Short", time: "40 min", fresh: "2–3 wks", upkeep: "Low",
  },
  {
    id: "mullet",
    name: "Modern Mullet",
    tag: "Bold",
    desc: "A choppy, textured top with a burst fade around the ears and length left at the back, flowing down the neck.",
    length: "Medium", time: "50 min", fresh: "4–6 wks", upkeep: "Medium",
  },
  {
    id: "textured-crop",
    name: "Textured Crop",
    tag: "Low effort",
    desc: "A French crop with a mid skin fade, a choppy top and a short blunt fringe. Sharp, with almost zero styling.",
    length: "Short", time: "35 min", fresh: "2–3 wks", upkeep: "Low",
  },
  {
    id: "curtains",
    name: "Curtains",
    tag: "90s revival",
    desc: "A middle part with longer front pieces that fall either side of the forehead, and soft length over the ears.",
    length: "Medium", time: "45 min", fresh: "5–6 wks", upkeep: "Medium",
  },
  {
    id: "crew-cut",
    name: "Crew Cut",
    tag: "Classic",
    desc: "Short on top with a little extra length at the front, tapered neatly down the sides and back.",
    length: "Short", time: "30 min", fresh: "3–4 wks", upkeep: "Low",
  },
];
