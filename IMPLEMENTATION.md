# Implementation plan: Matkapeli, part 1

Build order for the game described in `PLAN.md`. Each milestone ends with something you can open and play, so you can commit after each one.

## Milestone 0: Set up the project (~15 min)
- `git init` in `C:\git\matkapeli`, add a `.gitignore`.
- Create the folder layout from PLAN.md, with empty files.
- `index.html`: a viewport meta tag (`width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no`), one `<canvas id="game">`, a hidden "Käännä tabletti" overlay `<div>`, and classic `<script>` tags in dependency order: `sprites → engine → player → scenes/* → main`.
- `style.css`: black background, canvas centered, `image-rendering: pixelated`, `touch-action: none`, `overflow: hidden`, `user-select: none`. Show the turn-the-tablet overlay with `@media (orientation: portrait)`.
- All files share one global namespace (`window.MP = {}`), because ES modules don't load from `file://`.

✅ Check: a black page with an empty canvas and no console errors. **Commit.**

## Milestone 1: Engine core (`engine.js`)
1. **Canvas and scaling**: the canvas stays 320×180 inside. On resize, `scale = Math.max(1, Math.floor(Math.min(innerWidth/320, innerHeight/180)))`, and the CSS size is set to 320·scale × 180·scale.
2. **Input**: `pointerdown/move/up/cancel` on the canvas, with `setPointerCapture`. Screen positions become canvas positions using `getBoundingClientRect()`, then go to the current scene's `onTap / onPointerDown / onPointerMove / onPointerUp`. A *tap* is a pointerdown→up that moved less than 4 px. It is sent as `onTap(x, y)`.
3. **Game loop**: `requestAnimationFrame`, with `dt` capped at 0.05 s so a tablet waking from sleep doesn't make the character jump.
4. **Scene manager**: `MP.goTo(scene, params)` fades to black (0.3 s), calls `scene.enter(params)`, then fades back in. Input is ignored during the fade.
5. **Shared game state**: `MP.state = { character, outfit, quest }`, with `MP.save()` and `MP.load()` wrapping `localStorage` in try/catch.
6. **Text**: a small **5×7 bitmap font** in `sprites.js` (A–Z, Å Ä Ö, 0–9 and `! ? . , … :`), with helpers `drawText(ctx, str, x, y, color, size)` and `drawBubble(ctx, text, x, y)` (word wrap plus a tail).
   *Why:* `fillText` on a 320×180 canvas that gets scaled up looks blurry. A bitmap font stays crisp, and Ella can draw the letters herself. The ✨ in "Hampaat puhtaina! ✨" becomes a small sparkle sprite instead of an emoji.
7. **Sound**: create the `AudioContext` and call `resume()` on the first pointerdown/up, which iPad Safari needs. Three sounds: `MP.sfx.bling()` (two rising notes), `MP.sfx.brush()` (a short burst of filtered noise), and `MP.sfx.tap()`.

✅ Check: a test scene shows "HEI ELLA ÄÖ" in crisp pixels, and a tap draws a dot exactly under your finger at every window size. **Commit.**

## Milestone 2: Sprites and palette (`sprites.js`)
- `PALETTE = { 'K': '#000', 'S': '#f2c9a0' /*skin*/, ... }`. A `.` means transparent.
- `MP.sprite(name)` turns a grid into an offscreen canvas once and caches it. Flipped versions are cached too, so drawing a flipped sprite is free.
- **The character, about 16×28 px**, built from layer grids that use placeholder letters:
  - `body` (skin, eyes, shoes), `hairGirl`/`hairBoy`, `shirt` (`T`=main color, `t`=shade), `pants`/`skirt` (`P`/`p`), `cap`/`beanie`/`sunhat` (`H`/`h`).
  - `composeCharacter(character, outfit, frame)` stacks the layers, swaps the placeholder letters for the chosen clothing's colors, and caches the result by key, e.g. `"girl|red|skirtBlue|beanie|f1"`.
  - Two walk frames: only the leg rows differ.
- Objects: bed, window, sun, moon, toy (ball/teddy), toilet, sink, mirror, toothbrush, wardrobe, door, arrow, star, sparkle, and a pointing hand for the tutorial.

✅ Check: a test scene draws every sprite, plus the girl and boy in a few outfits. **Commit** (and a good moment for Ella to try changing colors).

## Milestone 3: Start screen and sunrise (`scenes/start.js`)
- The scene has two states: `'choose'` and `'sunrise'`.
- **choose**: dark sky, about 40 stars at fixed positions that twinkle with `sin(t + seed)`, the moon, and a house with yellow windows. "MATKAPELI" in big letters with "SUUNNITELLUT ELLA" under it. Two cards (Tyttö and Poika) each showing the character. The selected card gets a thick frame and a small bounce. "ALOITA" stays gray until a card is picked. If a choice is saved from before, it is selected already.
- **sunrise** (3 s, `t = 0..1`): blend the sky color night → orange → light blue, move the moon down and the sun up, and turn the window lights off. At t≈0.6 show the "KUKKOKIEKUU!" bubble with a bird sprite. At the end, call `goTo(home, { quest: 'wake' })`.

✅ Check: choose a character → sunrise → black screen (home isn't built yet). **Commit.**

## Milestone 4: Player and home (`player.js`, `scenes/home.js`)
- **World**: 960 px wide, floor at y≈150. Bedroom from 0 to 320, bathroom from 320 to 640, hallway from 640 to 960. Walls between rooms have doorway openings. Each room has its own wallpaper color so you can tell them apart.
- **Player**: `x`, `targetX`, `speed ≈ 70 px/s`, `facing`, and a frame that switches every 0.15 s while walking. `walkTo(x, onArrive)`.
- **Camera**: `cam += (player.x - 160 - cam) * 5 * dt`, kept between 0 and 640. Taps are converted with `worldX = x + cam`.
- **Hotspots**: `{ id, x, y, w, h, standX, quest }`. Tapping one makes the character walk to `standX` and then run its action. Tapping anywhere else just walks there.
- **Quest steps**: `wake → brush → dress → door → done`. Each step sets:
  - the bubble text ("Huomenta! Mennään pesemään hampaat." / "Puetaan vaatteet päälle!" / "Nyt lähdetään ulos!")
  - which hotspot the bouncing arrow points at
  - which hotspot works (e.g. the wardrobe does nothing before the teeth are brushed. It could say "Ensin hampaat!" as a hint.)
- "Tap the sink **or reach it**": while the quest is `brush`, walking to within 12 px of the sink's `standX` starts the brushing too.
- `enter(params)` puts the character next to the right object when coming back from brushing or the wardrobe.

✅ Check: wake up, walk both ways, the camera follows and stops at the edges, tapping the sink starts its action (for now just a log message). **Commit.**

## Milestone 5: Brushing mini-game (`scenes/brush.js`)
- **Picture**: a big smile, with a top row and a bottom row of teeth split into **4 sections each** (8 in total). Each section has `dirt = 1.0`, and its color moves from yellow to white as `dirt` goes down.
- **Gesture recognition** (the important part):
  ```
  on down: last = p; dir = 0; travel = 0
  on move: d = p - last  (along the bigger axis: x, or y if up/down is enabled)
           if sign(d) == dir or dir == 0: travel += |d|; dir = sign(d)
           else if travel >= 6: → count one "brush" stroke, dir = sign(d), travel = |d|
           last = p
  ```
  - The threshold is in **canvas pixels**. PLAN.md says about 15 px, which I read as screen pixels, so I use **6 canvas px**, about 15–25 screen px depending on scale. Otherwise a stroke on a big screen would have to be very long.
  - A tap has no direction change, so it never counts ✔.
  - Each stroke takes **0.1** off the section under the brush, about 10 strokes per section. Foam particles appear and `sfx.brush()` plays at a limited rate.
- The brush sprite follows the finger. Until the first stroke, the hand demo animation loops with "HARJAA SORMELLA EDESTAKAISIN!".
- A progress bar at the top shows the average of all sections.
- **Done**: sparkles, "HIENOA! HAMPAAT PUHTAINA!" with the sparkle sprite, and `sfx.bling()`. After 2 s, `goTo(home, { quest: 'dress' })`.

✅ Check: taps don't help, side-to-side strokes clean the teeth, then you return to the bathroom and the arrow points at the wardrobe. **Commit.**

## Milestone 6: Wardrobe (`scenes/wardrobe.js`)
- **Clothing data** (in `sprites.js` or its own `clothes.js`, so it's easy to edit):
  ```js
  CLOTHES = {
    shirt:  [{id:'red', T:'#d33', t:'#a22'}, … 4],
    bottom: [{id:'jeans', layer:'pants', P:'#36c'}, {id:'skirtPink', layer:'skirt', …}, … 4],
    hat:    [{id:'none'}, {id:'cap', layer:'cap', H:…}, {id:'beanie',…}, {id:'sunhat',…}]
  }
  ```
- **Layout**: the character at 3× size in the middle, shirts on the left (2×2 grid), pants/skirts on the right (2×2), and a row of hats at the top. Each clothing button draws its own layer by itself on a background box. The selected item gets a frame. Tapping a button puts it on right away and plays `sfx.tap()`.
- "VALMIS!" saves the state with `MP.save()` and calls `goTo(home, { quest: 'door' })`.

✅ Check: the clothes you pick show up in the wardrobe, in the hallway, and still there after a page reload. **Commit.**

## Milestone 7: Front door, polish, README
- The door hotspot during the `door` quest: the character walks to the door, which opens a little, and a large "JATKUU PIAN…" panel appears (tapping it closes the panel).
- Get ready for later scenes: `MP.scenes = { start, home, brush, wardrobe }`. Opening the door will later just become `goTo(MP.scenes.street)`.
- `README.md` in Finnish: how to play, and "Näin vaihdat värejä" (how to change colors), showing how to edit `PALETTE` and `CLOTHES` and draw a new sprite grid.

## Milestone 8: Testing (following PLAN.md's verification steps)
1. Chrome via claude-in-chrome: play the whole game through, check that taps don't finish the brushing, and read the console.
2. Window sizes 1024×768, 768×1024 (the hint should appear) and 1920×1080.
3. Real tablet: run `python -m http.server 8000` and open `http://<pc-ip>:8000`.

---

## Decisions made along the way (change them if you disagree)
| Topic | Choice | Why |
|---|---|---|
| Text | Our own 5×7 bitmap font | Crisp pixels, and the letters are editable grids too |
| Brushing threshold | 6 canvas px | Feels the same at every screen size |
| Up/down brushing | Optional, left on by default (direction taken from the bigger axis) | Small change, more natural for a 7-year-old |
| Wardrobe before brushing | Doesn't open, gives the hint "Ensin hampaat!" | Keeps the order clear |
| Reloading the page | Always starts at the start screen, with the saved character already selected | Simple, and the story begins from the start again |

Suggested pace: milestones 0–2 in the first session (the engine and sprites are the base for everything else), then about one evening per scene.
