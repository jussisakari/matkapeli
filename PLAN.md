# Matkapeli: browser travel game, part 1 (home)

## Context
A parent and their 7-year-old daughter are building a simple cartoon-style browser game together. It must work on a PC and on a tablet. The idea: travel from home to different places, starting with Egypt and the pyramids. This first step builds the **home**:
- Night start screen showing "Suunnitellut Ella". The player picks a girl or a boy and presses "Aloita". Night turns into morning.
- **Horizontal (side-scrolling) gameplay**: the house is a row of rooms seen from the side, and the camera follows the character left and right.
- The character walks to the bathroom and brushes their teeth **with gestures** (swiping back and forth).
- After that, the player picks clothes from a **wardrobe**.
- The code is structured so later steps (go outside → taxi station → Egypt) can be added as new scenes.

Decisions made: **Finnish** text, **tap/click to walk**, **plain HTML + JavaScript** (no build step, open `index.html` directly), **round cartoon drawings made in code** (style A in `samples/style-sample-2.html`; colors, clothes and the band poster are simple lists that are easy to edit). *(Changed from pixel art after comparing samples.)*

## Project location
New folder `C:\git\matkapeli\` (git init, so you can commit progress together).

## Files
```
matkapeli/
  index.html      – canvas + loads scripts (classic <script> tags, so file:// works with no server)
  style.css       – full-screen, black borders, smooth scaling, no scroll/zoom on tablet
  js/sprites.js   – colors, characters, clothes, and drawing functions (girl, boy, bed, teddy, panda, band poster, sink, toothbrush, toilet, wardrobe, door, window, moon, sun…)
  js/engine.js    – canvas setup/scaling, pointer input, game loop, scene switching, text/speech bubbles
  js/player.js    – character: tap-to-walk movement, walk animation, facing direction
  js/scenes/start.js – night screen: choose girl/boy and "Aloita" button, then sunrise transition
  js/scenes/home.js  – the side-scrolling home (bedroom → bathroom → hallway), walking + camera
  js/scenes/brush.js – brushing mini-game with gestures (close-up of teeth)
  js/scenes/wardrobe.js – choosing clothes
  js/main.js      – starts the game
  README.md       – how to play + "how to change colors/sprites" for the kid
```

## Technical approach
- **Game units**: the world is always 320×180 units (16:9). The canvas is drawn at the screen's real resolution and scaled to fit, so drawings and text stay smooth and sharp on any screen. Landscape-oriented; on a portrait tablet a "Käännä tabletti" (turn the tablet) hint is shown.
- **Input**: Pointer Events (one code path covers mouse and touch). `touch-action: none` and a viewport meta tag stop tablet scrolling and zooming. Screen coordinates are converted to canvas coordinates.
- **Drawings**: everything is drawn with simple shapes (circles, ovals, rounded boxes) with a dark outline. `MP.draw('bed', ctx, x, y)` draws a thing, `MP.drawPerson(ctx, x, y, opts)` draws a character. The girl and boy share a body and differ in hair and colors. All colors are in `MP.COLORS`, so Ella can change them. Text uses a rounded font (Comic Sans / Chalkboard).
- **Scenes**: each scene object has `enter()`, `update(dt)`, `draw(ctx)` and `onTap(x,y)`. `engine.goTo(scene)` switches scenes with a fade. Later scenes (`street.js`, `taxi.js`, `egypt.js`) use the same pattern.
- **Horizontal walking + camera**: the home is about 3 screens wide (960 px world). The character walks only left or right on the floor, toward the tapped x position. While walking, the arms and legs swing and the body bobs, and the character flips to face the walking direction. The camera follows smoothly and stops at the edges of the world. Tapping an object (sink, wardrobe, door) makes the character walk there and then starts its action.
- **Brushing gestures**: pointer down/move/up track the finger. Each **change of direction** in a back-and-forth stroke (at least about 15 px) counts as one "brush". Plain taps do not count. Optionally, up/down strokes clean the top or bottom teeth. A hand animation shows how to do it at the start ("Harjaa sormella edestakaisin!").
- **Clothes**: the character is drawn in layers (hair → legs → pants/skirt → arms → shirt → head → hair → hat). The colors and shapes come from the selected clothing items in `MP.CLOTHES`, so the chosen outfit is seen in all later scenes. A **costume** (the spider suit) replaces the whole outfit, including a mask.
- **Saved state**: the chosen character and outfit are stored in `localStorage` (inside try/catch).
- **Sound (small extra)**: simple WebAudio "bling" sounds for success and brushing, generated in code with no files. They only start after the first tap, because browsers require a user action before playing sound.

## Game flow (this phase)
1. **Start screen (night)**: dark blue sky, stars that twinkle, moon, a house with lit windows. Title "Matkapeli" with **"Suunnitellut Ella"** clearly under it. Two big character cards: "Tyttö" and "Poika". Tapping one selects it. Big "Aloita" button.
2. **Sunrise transition (~3 s)**: the sky color fades from night to morning, the moon sets and the sun rises, a bird/rooster "Kukkokiekuu!". Then a fade into the home.
3. **Home (side view, scrolls left to right)**: **bedroom** (bed, window with sun, teddy bear, panda, and a poster of **Turpapojat**, the band of two boys from Ella's class) → **bathroom** (toilet, sink, mirror, toothbrush) → **hallway** (wardrobe, front door). The character wakes up by the bed and a speech bubble says: "Huomenta! Mennään pesemään hampaat." A bouncing arrow points to the right, toward the sink.
4. **Walk**: the player taps to the left or right. When they tap the sink or reach it, the brushing scene starts.
5. **Brushing mini-game (gestures)**: a close-up of a smile with yellowish teeth and a toothbrush. The player moves a finger or the mouse back and forth over the teeth. The brush follows the finger, foam bubbles appear, and the teeth whiten section by section (progress bar). When done: sparkle, "Hienoa! Hampaat puhtaina! ✨", success sound.
6. **Wardrobe**: the arrow points to the wardrobe in the hallway: "Puetaan vaatteet päälle!" Tapping it opens the wardrobe view: the character large in the middle, with rows of clothes on each side. **Paita** (shirt, 4 options), **Housut/Hame** (pants or skirt, 4 options), **Hattu/Pipo** (hat or beanie, 3 options + no hat), and **Asu** (costume): a spider-hero suit with a mask, which covers the other clothes. Tapping a piece puts it straight onto the character. Then press "Valmis!" ("Done!").
7. **Next goal**: back in the hallway, the character now wears the chosen clothes. The arrow points at the front door: "Nyt lähdetään ulos!" Tapping the door shows "Jatkuu pian…" (a placeholder for the next step: street and taxi station).

## Later steps (not built now, just planned for)
- `street.js`: the street outside the home (also side-scrolling); walk to the taxi station.
- `taxi.js`: taxi ride. Choose a destination on a map (Egypt first), with a driving animation.
- `egypt.js`: desert, pyramids, camel, a small task.

## Verification
1. Open `C:\git\matkapeli\index.html` in Chrome (via claude-in-chrome): check the start screen ("Suunnitellut Ella"), girl/boy selection, sunrise, side-scrolling walk and camera, brushing with drag gestures (taps alone must not finish it), wardrobe choices shown on the character, and the door message. Check that the console has no errors.
2. Resize to a tablet size (e.g. 1024×768 landscape and portrait) to check scaling and the turn-the-tablet hint.
3. You test on a real tablet: copy the folder or serve it with e.g. `python -m http.server` on the local network and open it in the tablet's browser.
