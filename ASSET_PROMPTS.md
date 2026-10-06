# CAPPED — Nano Banana asset prompts

10 images in total: one **base** photo per model, plus **4 hairstyle edits** of each base.

## How to do it (important)

1. Generate the **base** photo for a model with a text-to-image prompt (Step 1).
2. For each hairstyle, **upload that base photo** to Nano Banana and run the edit prompt (Step 2).
   Always edit the *base*, never a previous hairstyle, so every image lines up perfectly.
3. Export each image as **JPG, 4:5 portrait (e.g. 1600×2000)** and save it with the exact filename shown.
4. Drop the files into the repo at `assets/models/<model>/` — the site picks them up automatically.

If an edit changes the face, the clothes or the framing, re-run it. The whole effect depends on
the same face in the same spot across every image.

---

## Step 1 — Base photos (text to image)

### Amara → `assets/models/amara/base.jpg`

```
Photorealistic studio fashion portrait of a young West African woman in her mid-20s with deep
dark-brown skin, an oval face, high cheekbones and a calm, neutral expression. Her head is
completely clean-shaven and bald, smooth scalp, no hair. Front-facing, looking straight into
the camera, shoulders square. Framed from the top of the head down to the mid-chest, with
generous empty space above the head. She wears a simple cream oversized wool coat with a
crew-neck cream knit underneath. Plain seamless warm light-grey studio backdrop (#EBE8E3).
Soft, even, diffused beauty lighting, no harsh shadows. Shot on 85mm lens, f/4, sharp focus,
natural skin texture, high-end e-commerce look. Portrait orientation 4:5. No jewellery, no
text, no logos.
```

### Mei → `assets/models/mei/base.jpg`

```
Photorealistic studio fashion portrait of a young East Asian woman in her mid-20s with light
skin with warm undertones, a heart-shaped face and a calm, neutral expression. Her head is
completely clean-shaven and bald, smooth scalp, no hair. Front-facing, looking straight into
the camera, shoulders square. Framed from the top of the head down to the mid-chest, with
generous empty space above the head. She wears a simple cream oversized wool coat with a
crew-neck cream knit underneath. Plain seamless warm light-grey studio backdrop (#EBE8E3).
Soft, even, diffused beauty lighting, no harsh shadows. Shot on 85mm lens, f/4, sharp focus,
natural skin texture, high-end e-commerce look. Portrait orientation 4:5. No jewellery, no
text, no logos.
```

---

## Step 2 — Hairstyle edits (upload the base photo, then prompt)

Every edit prompt starts with this same lock line, followed by the hairstyle line. Copy both.

**Lock line (use every time):**

```
Edit this photo. Keep the exact same person, face, facial features, skin tone, expression,
head position, pose, clothing, background, lighting, camera angle and framing — change
nothing except adding hair. The hair must look completely real, naturally attached at the
hairline, with realistic strands, shine and shadows that match the existing studio lighting.
```

**Then add one of these:**

| Filename | Hairstyle line |
|---|---|
| `knotless-braids.jpg` | `Add long, waist-length medium knotless box braids in natural black (1B), with a neat centre part, braids falling over both shoulders and down the front of the coat.` |
| `afro.jpg` | `Add a full, rounded natural afro in natural black, about 6 inches of volume, soft defined 4C coils, evenly shaped around the head, hairline visible.` |
| `sleek-bob.jpg` | `Add a sleek, glossy, chin-length blunt bob in dark espresso brown with a straight centre part, ends cut perfectly straight at the jawline.` |
| `curtain-waves.jpg` | `Add long, layered, soft loose waves in dark chocolate brown falling past the shoulders, with face-framing curtain bangs parted in the middle.` |

Run all four for **Amara** (save into `assets/models/amara/`) and all four for **Mei**
(save into `assets/models/mei/`).

---

## Checklist

```
assets/models/amara/base.jpg
assets/models/amara/knotless-braids.jpg
assets/models/amara/afro.jpg
assets/models/amara/sleek-bob.jpg
assets/models/amara/curtain-waves.jpg
assets/models/mei/base.jpg
assets/models/mei/knotless-braids.jpg
assets/models/mei/afro.jpg
assets/models/mei/sleek-bob.jpg
assets/models/mei/curtain-waves.jpg
```

## Tips

- **Face drifted?** Add `Do not alter the face in any way.` to the end and re-run.
- **Hair looks like a helmet/wig?** Add `Show individual strands and baby hairs at the hairline.`
- **Framing shifted?** Add `Output must be the same size and crop as the input image.`
- Keep file sizes under ~400 KB each (export JPG at ~80% quality) so the site stays fast.
