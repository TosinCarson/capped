# CAPPED: Nano Banana asset prompts

There are 10 images in total: one **base** photo per model, plus **4 haircut edits** of each base.
Paste **one prompt at a time**. Each prompt makes one image.

## How to do it

1. Generate the **base** photo for a model with the text prompt in Step 1.
2. For each haircut, start a new chat, **upload that base photo**, and paste the haircut prompt from Step 2.
   Always edit the *base* photo, never a previous haircut, so every image lines up.
3. Save each image as a **JPG, 4:5 portrait (e.g. 1600×2000)** with the exact filename shown.
4. Put the files in `assets/models/<model>/`. The site picks them up automatically.

If an edit changes the face, the T-shirt or the framing, run it again. The whole effect depends on
the same face sitting in the same spot in every image.

---

## Step 1: Base photos (text to image)

The base is a short buzz cut. It's the "before" shot, and it gives each edit a natural hairline to build from.

### Jake → `assets/models/jake/base.jpg`

```
Photorealistic studio portrait of an American man in his mid-20s, light skin, light-brown hair cut in a very short even buzz cut (#2 guard), square jaw, light stubble, calm neutral expression. Front-facing, looking straight into the camera, shoulders square. Framed from the top of the head down to the mid-chest, with generous empty space above the head. He wears a plain fitted black crew-neck T-shirt. Plain seamless warm light-grey studio backdrop. Soft, even, diffused lighting, no harsh shadows. 85mm lens, sharp focus, natural skin texture, high-end barbershop lookbook style. Portrait orientation 4:5. No jewellery, no text, no logos.
```

### Leo → `assets/models/leo/base.jpg`

```
Photorealistic studio portrait of a Latino Canadian man in his mid-20s, olive skin, dark-brown hair cut in a very short even buzz cut (#2 guard), oval face, clean-shaven, calm neutral expression. Front-facing, looking straight into the camera, shoulders square. Framed from the top of the head down to the mid-chest, with generous empty space above the head. He wears a plain fitted black crew-neck T-shirt. Plain seamless warm light-grey studio backdrop. Soft, even, diffused lighting, no harsh shadows. 85mm lens, sharp focus, natural skin texture, high-end barbershop lookbook style. Portrait orientation 4:5. No jewellery, no text, no logos.
```

---

## Step 2: Haircut edits (upload the base photo, then paste one prompt)

Each prompt is complete. Copy the whole box. Use his natural hair colour from the base photo.

### `mod-cut.jpg`
```
Edit this photo. Keep the exact same man, face, facial features, skin tone, stubble, expression, head position, pose, black T-shirt, background, lighting, camera angle and framing. Change only the hair. Give him a modern mod cut in his natural hair colour: a rounded, full shape with soft choppy texture, a heavy fringe falling forward to just above the eyebrows, hair covering the tops of the ears, and a soft taper at the neckline. The hair must look completely real, with natural strands, shine and shadows that match the studio lighting.
```

### `low-taper.jpg`
```
Edit this photo. Keep the exact same man, face, facial features, skin tone, stubble, expression, head position, pose, black T-shirt, background, lighting, camera angle and framing. Change only the hair. Give him a low taper fade in his natural hair colour: very short and tight at the temples and neckline, blending up into about 3 inches of length on top, styled forward with a messy textured finish and a slightly broken-up fringe. Crisp, clean line-up at the temples. The hair must look completely real, with natural strands, shine and shadows that match the studio lighting.
```

### `mullet.jpg`
```
Edit this photo. Keep the exact same man, face, facial features, skin tone, stubble, expression, head position, pose, black T-shirt, background, lighting, camera angle and framing. Change only the hair. Give him a modern mullet in his natural hair colour: a short, choppy textured top with a slight fringe, a burst fade curving around the ears, and noticeably longer textured hair at the back flowing down to the nape of the neck, visible on both sides of the neck from the front. The hair must look completely real, with natural strands, shine and shadows that match the studio lighting.
```

### `textured-crop.jpg`
```
Edit this photo. Keep the exact same man, face, facial features, skin tone, stubble, expression, head position, pose, black T-shirt, background, lighting, camera angle and framing. Change only the hair. Give him a textured French crop in his natural hair colour: a mid skin fade on the sides and back, a choppy, piecey textured top about 1.5 inches long, and a short blunt fringe cut straight across the upper forehead. Matte finish. The hair must look completely real, with natural strands and shadows that match the studio lighting.
```

Run all four for **Jake** (save them into `assets/models/jake/`) and all four for **Leo** (save them into `assets/models/leo/`).

---

## Checklist

```
assets/models/jake/base.jpg
assets/models/jake/mod-cut.jpg
assets/models/jake/low-taper.jpg
assets/models/jake/mullet.jpg
assets/models/jake/textured-crop.jpg
assets/models/leo/base.jpg
assets/models/leo/mod-cut.jpg
assets/models/leo/low-taper.jpg
assets/models/leo/mullet.jpg
assets/models/leo/textured-crop.jpg
```

## Tips

- **The face changed?** Add `Do not alter the face in any way.` to the end and run it again.
- **The hair looks like a wig?** Add `Show individual strands and a natural, soft hairline.`
- **The framing shifted?** Add `Output must be the same size and crop as the input image.`
- **Leo is clean-shaven**, so in his edits you can delete the word "stubble" (it's fine to leave it in, though).
- Keep each file under ~400 KB (export JPG at about 80% quality) so the site stays fast.
