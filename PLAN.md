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
3. **Home (side view, two floors, scrolls left to right)**:
   - **Upstairs**: **child's room** (bed, nightstand with an alarm clock, window, teddy bear, panda, a poster of **Turpapojat** – the band of two boys from Ella's class – and the **wardrobe**) → **bathroom** (toilet, sink, mirror, toothbrush) → **top of the stairs**.
   - **Downstairs**: **living room** (sofa, TV, plant, lamp) → **kitchen** (fridge, stove, clock, table) → **hallway** (bottom of the stairs, shoe rack under the stairs, coat hooks, front door).
   - **Stairs**: tap anywhere on the landing (upstairs) or on the staircase (downstairs) to walk down or up step by step; signs show the way; the camera glides between the floors. If everything left is on the other floor, the arrow points at the stairs.
   - **Bookshelf** (living room, next to the TV): tap it to read books (`books.js`). First pick a book from two covers, then read: tap the right page or the arrow to turn forward, the left page to go back; "Lue ääneen" reads the page aloud with the device's Finnish voice (if it has one). Books: **Muinainen Egypti** (pyramids, pharaoh, the Nile, hieroglyphs, mummies, Tutankhamun, cats and the sphinx, scarab) and **Hämähäkkisankari ja ystävät** (the hero costumes from the wardrobe: spider hero, black spider, ghost spider, iron hero, panther hero, and all of them together). New books are easy to add to `MP.BOOKS`.
   - **TV**: tap the TV or sofa to sit down and watch "HAHA-TV" (a dog chasing its tail, a jumping duck "KVAAK!", a cat slipping on a banana peel). The TV is shown big with a frame; the remote control's red button closes it. After 30 seconds of TV in total, mom or dad comes: "Nyt riittää telkkari! Laitetaan TV kiinni." – and the TV can't be switched on again that morning.
4. **Waking up**: first a short **night → morning** animation in the child's room (dark room, moon and stars in the window → orange sunrise → day; tap skips it). Then the character sleeps in bed in pyjamas ("z z z") while the **alarm clock rings**. A bouncing arrow points at the clock. If nobody taps the clock in 10 seconds, **mom or dad** (randomly) walks in, says "Herätys, kultaseni!" / "Herätys, unikeko!", switches the alarm off and walks out. Tapping the clock (or the parent) wakes them up: they sit up sleepily, yawn and stretch ("Hoh-hoijaa…"), hop out of bed, and stay tired-eyed for a moment.
5. **Morning tasks – in any order** (a checklist in the corner shows them with green checks; arrows point at everything still to do):
   - **Toilet** (can be used again any time): pyjamas stay on. The girl sits on the toilet, the boy stands with his back to us. "La la laa…", flush ("Huuuuh!"), "Kädet pesty!".
   - **Brushing teeth** at the sink (mini-game below).
   - **Brushing hair** (girl only – her long hair is all tangled in the morning; the boy's short hair doesn't need it): a tall mirror in the child's room opens the hair brushing mini-game (`hairbrush.js`): the girl big in the mirror with eight tangles; brush **downwards** over each tangle until it's gone. Until then the tangled hair shows in every scene.
   - **Getting dressed** at the wardrobe (below) – clothes can be changed again any time.
   - **Breakfast** at the kitchen table: choose foods (Jogurtti, Banaani, Omena, Riisipiirakka, Riisipuuro) and a drink (Vesi or Maito), tap to eat (3 bites each) and drink (3 sips). "Valmis!" works after eating something and drinking a glass.
   - **Shoes** from the shoe rack (after getting dressed). Indoors everyone wears socks – no shoes inside in Finland! If you walk out of the hallway with shoes on (kitchen, living room or upstairs), mom or dad comes: "Hei! Sisällä ei kävellä kengillä! Kengät pois." – the shoes go back on the rack, so they have to be put on last.
   - **Walk**: tap left or right to walk; tap a thing to walk there and use it.
5. **Brushing mini-game (gestures)**: a close-up of a smile with yellowish teeth and a toothbrush. The player moves a finger or the mouse back and forth over the teeth. The brush follows the finger, foam bubbles appear, and the teeth whiten section by section (progress bar). When done: sparkle, "Hienoa! Hampaat puhtaina! ✨", success sound.
6. **Wardrobe**: the arrow points to the wardrobe in the hallway: "Puetaan vaatteet päälle!" Tapping it opens the wardrobe view: the character large in front of a mirror, tabs on the left (Hattu, Paita, Housut / hame, Asut) and cards on the right showing each item on the character. **Paita** (shirt, 4 options), **Housut/Hame** (pants or skirt, 4 options), **Hattu/Pipo** (hat or beanie, 3 options + no hat), and **Asu** (costume): a spider-hero suit with a mask, a black spider suit with red webs, a white hooded spider suit, a red-and-gold armour suit with a glowing chest light, a black panther suit with cat ears and a silver necklace, a pharaoh (striped headdress, gold collar, kilt) or a mermaid (fish tail, shell top, starfish). Also T-shirts (plain, a K-pop shirt with a star and a microphone, a spider shirt), shorts, a ponytail (in the Hattu tab) and a swimsuit (a costume; swimming trunks for the boy). A costume covers the other clothes. Tapping a piece puts it straight onto the character. Then press "Valmis!" ("Done!").
7. **Going out**: tapping the front door before everything is done says "Aamutoimet on vielä kesken! Vielä: …" with the list of what's left. When all tasks are done: "Kaikki aamutoimet tehty! Nyt lähdetään ulos!", the arrow points at the door, and tapping it shows "Jatkuu pian…" (placeholder for the street).

## Outside and travelling
- `street.js` (**built**): outside in **3D** (Three.js, saved in `js/lib/` so it works offline). The camera follows the character from behind; the character is our normal drawing seen from behind. **Tap to walk**; a "Käänny" button turns around. The street has houses, trees, lamps, hills and clouds. At the **crossroad** a signpost points left to the **taxi station** (tap the taxi → you hop in and it drives to the **airport**) and right to the **playground** (swing and slide you ride, a roundabout that spins, a sandbox where a sand castle appears).
- Shortcuts for testing: `index.html#ulos`, `#lentokentta`, `#lento`, `#egypti`, `#talvimaa`, `#thaimaa`, `#hiukset`, `#pyramidi`, `#koti`, `#hampaat`, `#vaatekaappi`, `#aamupala`, `#kirjat`, `#galleria`.
- `airport.js` (**built**): the **airport**, 2D side view. Glass doors (back to the taxi), the departures board "LÄHDÖT", check-in desk, seats, and Portti 1 (the gate). Tap the board → "Minne lennetään?" with a card for each country (flag, picture, name) plus "Tulossa pian" cards. Choose one → the character walks to the gate and boards. The same airport works abroad ("Kairon lentokenttä") with "Suomi" as the way home. Countries are a list in `MP.DESTINATIONS`.
- `flight.js` (**built**): the flight animation: the plane speeds down the runway and takes off (home: forest and lake, Egypt: desert and pyramids), flies above the clouds with a flag-to-flag progress line, then descends and lands in the new country: "Tervetuloa Egyptiin!". Tap skips it.
- `egypt.js` (**built**): Egypt in **3D**, more realistic: sand and stone textures, the Giza pyramids at their real shape (Khufu, Khafre with its white top, Menkaure, three small queens' pyramids), the Great Sphinx (stone, broken nose), the **temple of Ramses II** like Abu Simbel (four seated giant statues, one with its head fallen on the ground, baboons on top, the sun god over the door), an obelisk, the **Nile** with papyrus, palms and a felucca sailing boat, and a one-humped camel you can ride. You arrive in a white Cairo taxi from the airport; tap it to go back to the airport.
- `pyramid.js` (**built**): inside the big pyramid, **2D side view** like the house. Torches, painted hieroglyph walls, a jar, a cat statue, a sarcophagus with a friendly mummy, and a treasure chest. Task: find **three golden scarabs** (in the jar, on the picture wall, under the cat statue); with all three the chest opens: gold and **Tutankhamun's golden mask**, also shown big ("Tutankhamonin kultainen naamio!"). The mummy tells you what to do (and notices if you wear the pharaoh costume). The bright doorway on the left goes back out.
- `winter.js` (**built**): **Talvimaa**, a snowy 3D land: falling snow, icebergs in the sea, a seal on an ice floe, penguins that slide on their bellies when tapped, a snowman built step by step (tap 4 times; then it waves), an igloo, a sledding hill with a red sled, snowy spruces.
- `thailand.js` (**built**): **Thaimaa**, a 3D beach: turquoise sea with waves, tall rocky islands, coconut palms, a golden Thai temple and a golden stupa, an elephant that sprays water from its trunk, a long-tail boat, a sandcastle built in 3 steps, a coconut water stand, crabs walking sideways, beach umbrella; you can paddle in the shallow water. Arrive and leave by **tuk-tuk**.
- The airport now lists Egypti, Talvimaa and Thaimaa (plus "Tulossa pian"); each country has its own airport look and flight landscape.
- `world3d.js`: shared 3D helpers (one WebGL canvas, building kit, the character picture, walking, camera, taps, the "Käänny" button) used by the street and Egypt.
- **Speech bubbles stay until the next tap**, so there is time to read (a tap closes them and still does its normal job).
- Later: more countries at the airport.

## Verification
1. Open `C:\git\matkapeli\index.html` in Chrome (via claude-in-chrome): check the start screen ("Suunnitellut Ella"), girl/boy selection, sunrise, side-scrolling walk and camera, brushing with drag gestures (taps alone must not finish it), wardrobe choices shown on the character, and the door message. Check that the console has no errors.
2. Resize to a tablet size (e.g. 1024×768 landscape and portrait) to check scaling and the turn-the-tablet hint.
3. You test on a real tablet: copy the folder or serve it with e.g. `python -m http.server` on the local network and open it in the tablet's browser.
