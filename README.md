# CAPPED

**See the cut. Before the clippers.**

CAPPED is a concept for a virtual barber studio, rendered in real-time 3D. You can try modern
men's haircuts on six characters (one per face shape), change their skin tone, and spin
them around to see the sides and back before you sit in the chair.

## Features

- **6 characters, one per face shape:** square, rectangle, heart, oval, round, diamond
- **6 cuts on every character:** Mod Cut, Low Taper, Modern Mullet, Textured Crop, Curtains, Crew Cut
- **Skin tone:** 8 tones, set per character
- **Head shot or full body** framing
- **360° view:** slow auto-rotate, drag with a mouse or finger to spin, and Front / Left / Right / Back buttons
- **Before / After:** "Before" shows a buzz cut
- **Save looks and share links:** the URL keeps the character, cut, tone and framing
- **Keyboard:** `←` / `→` cycle through cuts

## Run it

It's a static site with no build step, but it uses ES modules, so it has to be served
(opening `index.html` straight from disk won't work):

```
python3 -m http.server 8000
# then open http://localhost:8000
```

To host it free, turn on **GitHub Pages** (Settings → Pages → deploy from a branch, root).

## How it works

```
js/data.js   characters, face shapes, skin tones, cut details (edit this to add more)
js/head.js   sculpts a head from the face-shape parameters, plus the facial features
js/hair.js   each cut is a thickness map over the scalp, so every cut fits every head
js/body.js   mannequin body (black tee, jeans, sneakers) and materials
js/main.js   scene, lighting, camera / rotation controls, UI
vendor/      three.js r170 (MIT), served locally
```

Short hair blends toward the skin colour, which is how the fades read.

## Next step: realistic 3D models

The characters are stylized stand-ins built entirely in code. For a photoreal look, swap in
GLB models: one bald head/body per character, plus one hair mesh per cut fitted to a shared
base head. You could get these from an AI image-to-3D tool, from Character Creator or
MakeHuman exports, or from bought hair packs. The UI, rotation, framing and skin tone logic
stay the same.
