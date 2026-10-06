# CAPPED

**See the style. Before you commit.**

CAPPED is a concept for a virtual hair studio. You can switch between models with
different face shapes, skin tones and textures, and preview the same hairstyle on each
before you sit in the chair.

## Features

- Model switcher: see the same style on different faces
- Hairstyle picker: the "Make it yours" panel, with live thumbnails
- Before / after: a drag slider that compares the base photo with the styled one
- Style details: length, install time, how long it lasts, upkeep
- Save looks, and copy a share link (the URL keeps the model and style)
- Keyboard: `←` / `→` cycle through styles

## Run it

It's a static site with no build step. Open `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

To host it free, turn on **GitHub Pages** (Settings → Pages → deploy from branch `main`, root).

## Images

The photos are generated with Nano Banana. The exact prompts and filenames are in
[`ASSET_PROMPTS.md`](ASSET_PROMPTS.md). Any image that's missing shows a placeholder
until you add it.

## Adding more models or styles

1. Add an entry to `MODELS` or `STYLES` at the top of `app.js`.
2. Add the matching images at `assets/models/<model-id>/<style-id>.jpg`.
