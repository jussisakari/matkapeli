// sprites.js – colors, characters, clothes and all drawings of the game.
//
// Everything is drawn with simple shapes (circles, ovals, rounded boxes).
// Sizes are in "game units": the whole screen is 320 × 180 units.
// Try changing the colors below – everything that uses them changes!
window.MP = window.MP || {};

// ---------------------------------------------------------------------------
// COLORS
// ---------------------------------------------------------------------------
MP.COLORS = {
  outline: '#2b2340',      // the dark line around everything
  skin: '#f6cfa8',
  cheeks: 'rgba(240,120,130,0.55)',
  shoes: '#6b3e26',
  wood: '#a0643c',
  woodDark: '#6e4226',
  woodLight: '#c98a55',
  porcelain: '#ffffff',     // sink and toilet
  porcelainShade: '#eef2f8',
  metal: '#8a93a6',
  glass: '#bfe6ff',
  gold: '#ffd23f',
  sun: '#ffd23f',
  sunRays: '#ffb000',
  moon: '#fff4c2',
  moonShade: '#e8d68a',
  blanket: '#4a78c8',
  blanketDots: '#9fc8ff',
  pillow: '#ffffff',
  teddy: '#a0643c',
  teddyNose: '#d9a877',
  pandaBlack: '#2b2b33',
  pandaWhite: '#fbfbfb',
  frontDoor: '#d9534f',
  frontDoorShade: '#a83a37',
  toothbrush: '#ff8fc0',
  cup: '#4a78c8',
  arrow: '#ffd23f',
  rooster: '#ffffff',
  roosterComb: '#e04848',
  beak: '#ffb000',
};

// ---------------------------------------------------------------------------
// CHARACTERS: the girl and the boy
// ---------------------------------------------------------------------------
MP.CHARACTERS = {
  girl: { name: 'Tyttö', hair: '#8b4a2b', bow: '#ff8fc0' },
  boy:  { name: 'Poika', hair: '#e3b04b' },
};

// ---------------------------------------------------------------------------
// CLOTHES
// "stripe" paints stripes on a shirt.
// "hidden" items (pyjamas) are worn at the start but not shown in the wardrobe.
// A costume covers everything else when it is on.
// ---------------------------------------------------------------------------
MP.CLOTHES = {
  shirt: [
    { id: 'pyjama', name: 'Pyjama',    hidden: true, color: '#9fc8ff', stripe: '#e6f2ff' },
    { id: 'red',    name: 'Punainen',  color: '#e04848' },
    { id: 'yellow', name: 'Keltainen', color: '#ffd23f' },
    { id: 'green',  name: 'Vihreä',    color: '#4caf50' },
    { id: 'sailor', name: 'Raita',     color: '#ffffff', stripe: '#2f4a8a' },
  ],
  bottom: [
    { id: 'pyjama',      name: 'Pyjama',        hidden: true, type: 'pants', color: '#9fc8ff' },
    { id: 'jeans',       name: 'Farkut',        type: 'pants', color: '#3f6fb5' },
    { id: 'brown',       name: 'Ruskeat',       type: 'pants', color: '#8b5a2b' },
    { id: 'skirtPink',   name: 'Pinkki hame',   type: 'skirt', color: '#ff8fc0' },
    { id: 'skirtPurple', name: 'Violetti hame', type: 'skirt', color: '#9b6bd6' },
  ],
  hat: [
    { id: 'none',   name: 'Ei hattua' },
    { id: 'cap',    name: 'Lippis',       color: '#e04848', shade: '#a83232' },
    { id: 'beanie', name: 'Pipo',         color: '#4a78c8', shade: '#2f4a8a' },
    { id: 'sunhat', name: 'Aurinkohattu', color: '#ffe08a', shade: '#e04848' },
  ],
  costume: [
    { id: 'none',   name: 'Ei asua' },
    { id: 'spider',  name: 'Hämähäkkiasu', top: '#d62828', legs: '#2b4fa8', boots: '#d62828', web: '#7a1418' },
    { id: 'pharaoh', name: 'Faarao',       top: '#f4efe1', kilt: '#f4efe1', boots: '#c8913a',
      gold: '#f2c230', blue: '#2f5fb5', red: '#d33a3a' },
    { id: 'mermaid', name: 'Merenneito',   top: '#b46be0', legs: '#2bb3a3', scales: '#1d7f74',
      fin: '#7fe0c8', shell: '#ffc6e0', starfish: '#ffb347' },
  ],
};

// ---------------------------------------------------------------------------
// MOM AND DAD (one of them comes to wake you up if the alarm rings too long)
// ---------------------------------------------------------------------------
MP.PARENTS = {
  mom: {
    name: 'Äiti', character: 'girl', hair: '#6b3a1e', scale: 1.3, noBow: true,
    outfit: { shirt: 'green', bottom: 'skirtPurple', shoes: false },
    say: 'Herätys, kultaseni! Aamu on jo!',
  },
  dad: {
    name: 'Isä', character: 'boy', hair: '#4a3020', scale: 1.38, glasses: true,
    outfit: { shirt: 'sailor', bottom: 'brown', shoes: false },
    say: 'Herätys, unikeko! Aamu on jo!',
  },
};

// ---------------------------------------------------------------------------
// BAND POSTER in the bedroom
// ---------------------------------------------------------------------------
MP.BAND = {
  name: 'TURPAPOJAT',
  colorTop: '#6a3fb5',
  colorBottom: '#e0559a',
  textColor: '#ffe680',
  guitar: '#e08a3c',
  members: [
    { hair: '#4a3020', shirt: 'red' },     // with the guitar
    { hair: '#e3b04b', shirt: 'sailor' },  // with the microphone
  ],
};

// ---------------------------------------------------------------------------
// BREAKFAST: what you can choose (type 'food' goes on the plate, 'drink' in the glass)
// ---------------------------------------------------------------------------
MP.FOODS = [
  { id: 'yoghurt',  name: 'Jogurtti',      type: 'food' },
  { id: 'banana',   name: 'Banaani',       type: 'food' },
  { id: 'apple',    name: 'Omena',         type: 'food' },
  { id: 'ricepie',  name: 'Riisipiirakka', type: 'food' },
  { id: 'porridge', name: 'Riisipuuro',    type: 'food' },
  { id: 'water',    name: 'Vesi',          type: 'drink' },
  { id: 'milk',     name: 'Maito',         type: 'drink' },
];

// Finds a clothing item by id. Unknown ids give the first item (pyjamas / none).
MP.findItem = function (slot, id) {
  const list = MP.CLOTHES[slot];
  return list.find((it) => it.id === id) || list[0];
};

// ===========================================================================
// Drawing helpers (you don't need to change these)
// ===========================================================================
(function () {
  const C = MP.COLORS;

  function rr(c, x, y, w, h, r) { MP.roundRect(c, x, y, w, h, r); }
  function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
  function ellipse(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); }
  // fill + outline
  function fs(c, fill) { c.fillStyle = fill; c.fill(); c.stroke(); }
  function begin(c, lw) {
    c.save();
    c.lineWidth = lw || 0.8;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.strokeStyle = C.outline;
  }

  // Spider web pattern: lines from the middle + sagging rings
  function web(c, cx, cy, r, color, lw) {
    c.save();
    c.strokeStyle = color;
    c.lineWidth = lw;
    const n = 10;
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    for (const k of [0.3, 0.55, 0.8, 1.05]) {
      for (let i = 0; i < n; i++) {
        const a1 = i / n * Math.PI * 2, a2 = (i + 1) / n * Math.PI * 2, am = (a1 + a2) / 2;
        c.moveTo(cx + Math.cos(a1) * r * k, cy + Math.sin(a1) * r * k);
        c.quadraticCurveTo(cx + Math.cos(am) * r * k * 0.85, cy + Math.sin(am) * r * k * 0.85,
                           cx + Math.cos(a2) * r * k, cy + Math.sin(a2) * r * k);
      }
    }
    c.stroke();
    c.restore();
  }

  // Fills a shape and paints horizontal stripes inside it
  function striped(c, pathFn, base, stripe, step) {
    pathFn(); c.fillStyle = base; c.fill();
    c.save();
    pathFn(); c.clip();
    c.fillStyle = stripe;
    for (let yy = -60; yy < 10; yy += step) c.fillRect(-20, yy, 40, step / 2);
    c.restore();
    pathFn(); c.stroke();
  }

  // Five-pointed starfish
  function starfish(c, x, y, r, color) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const rad = i % 2 ? r * 0.45 : r;
      const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
      if (i) c.lineTo(px, py); else c.moveTo(px, py);
    }
    c.closePath();
    c.lineWidth = 0.5;
    c.fillStyle = color; c.fill(); c.stroke();
    c.lineWidth = 0.7;
  }

  function spiderEmblem(c, x, y, s) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.fillStyle = C.outline;
    c.strokeStyle = C.outline;
    c.lineWidth = 0.35;
    ellipse(c, 0, 0.2, 0.6, 0.9); c.fill();
    circle(c, 0, -0.9, 0.45); c.fill();
    c.beginPath();
    for (const sd of [-1, 1]) {
      c.moveTo(0, -0.3); c.lineTo(sd * 1.6, -1.5);
      c.moveTo(0, 0); c.lineTo(sd * 1.8, -0.3);
      c.moveTo(0, 0.2); c.lineTo(sd * 1.7, 1.0);
      c.moveTo(0, 0.4); c.lineTo(sd * 1.3, 1.9);
    }
    c.stroke();
    c.restore();
  }

  // =========================================================================
  // PERSON
  // MP.drawPerson(ctx, x, y, { character, outfit, walking, walkTime, flip, scale, hair,
  //                            eyes, mouth, armUp })
  //   (x, y) = between the feet. About 42 units tall at scale 1.
  //   character/outfit default to the player's choices in MP.state.
  // =========================================================================
  MP.PERSON_H = 42;

  MP.drawPerson = function (c, x, y, opts) {
    opts = opts || {};
    const st = MP.state || {};
    const charId = MP.CHARACTERS[opts.character] ? opts.character
      : (MP.CHARACTERS[st.character] ? st.character : 'girl');
    const ch = MP.CHARACTERS[charId];
    const outfit = opts.outfit || st.outfit || {};
    const shirt = MP.findItem('shirt', outfit.shirt);
    const bottom = MP.findItem('bottom', outfit.bottom);
    const hat = MP.findItem('hat', outfit.hat);
    const costume = MP.findItem('costume', outfit.costume);
    const suit = costume.id !== 'none' ? costume : null;
    const kind = suit ? suit.id : null; // 'spider', 'pharaoh' or 'mermaid'

    const top = suit ? suit.top : shirt.color;
    const legs = suit ? (suit.legs || C.skin) : bottom.color;
    const skirt = !suit && bottom.type === 'skirt';
    const shoes = suit ? (suit.boots || C.shoes) : C.shoes;
    // Indoors (outfit.shoes === false) we wear socks – no shoes inside in Finland!
    const socks = !suit && outfit.shoes === false;
    const sit = !!opts.sit;             // sitting (legs shorter, lap shows)
    const hands = kind === 'spider' ? suit.top : C.skin;
    const arms = (kind === 'pharaoh' || kind === 'mermaid') ? C.skin : top;
    const isGirl = charId === 'girl';
    const hairColor = opts.hair || ch.hair;
    const showHair = kind !== 'spider' && kind !== 'pharaoh';

    const t = opts.walkTime || 0;
    const sw = opts.walking ? Math.sin(t * 11) : 0;
    const bob = opts.walking ? -Math.abs(Math.sin(t * 11)) * 0.8 : 0;
    const s = opts.scale || 1;

    begin(c, 0.7);
    c.translate(x, y + bob * s);
    c.scale(opts.flip ? -s : s, s);

    // Long hair behind the head (girl)
    if (isGirl && showHair) { rr(c, -8.3, -37, 16.6, kind === 'mermaid' ? 29 : 22, 6); fs(c, hairColor); }

    if (kind === 'mermaid') {
      // Fish tail instead of legs (it sways when walking)
      c.save();
      c.translate(0, -14.5);
      c.rotate(sw * 0.12);
      const tail = () => {
        c.beginPath();
        c.moveTo(-5.2, 0);
        c.quadraticCurveTo(-5.6, 7.5, -1.4, 12);
        c.lineTo(1.4, 12);
        c.quadraticCurveTo(5.6, 7.5, 5.2, 0);
        c.closePath();
      };
      tail(); c.fillStyle = suit.legs; c.fill();
      c.save(); tail(); c.clip();
      c.strokeStyle = suit.scales; c.lineWidth = 0.4;
      for (let row = 0; row < 6; row++) {
        const yy = 1.5 + row * 2;
        c.beginPath();
        for (let xx = -5 + (row % 2); xx < 6; xx += 2) {
          c.moveTo(xx - 1, yy);
          c.quadraticCurveTo(xx, yy + 1.4, xx + 1, yy);
        }
        c.stroke();
      }
      c.restore();
      tail(); c.stroke();
      c.beginPath();
      c.moveTo(0, 11.4);
      c.quadraticCurveTo(-5, 11, -7.2, 15.2);
      c.quadraticCurveTo(-3, 13.6, 0, 14);
      c.quadraticCurveTo(3, 13.6, 7.2, 15.2);
      c.quadraticCurveTo(5, 11, 0, 11.4);
      c.closePath(); fs(c, suit.fin);
      c.restore();
    } else {
      // Legs + shoes (they swing when walking)
      for (const side of [-1, 1]) {
        c.save();
        c.translate(side * 2.4, sit ? -9.5 : -12.5);
        c.rotate(side * sw * 0.35);
        const len = sit ? 8.5 : 11;
        rr(c, -1.8, 0, 3.6, len, 1.7); fs(c, skirt ? C.skin : legs);
        if (socks) { ellipse(c, 0.6, len + 0.1, 2.3, 1.4); fs(c, '#f4f4f8'); }
        else { ellipse(c, 0.9, len + 0.3, 2.9, 1.7); fs(c, shoes); }
        c.restore();
      }
      if (sit && !skirt && kind !== 'pharaoh') {
        rr(c, -5.8, -13.5, 11.6, 5, 2.2); fs(c, legs);   // lap: knees towards us
      }

      if (kind === 'pharaoh') {
        // White kilt with a gold front panel and belt
        c.beginPath();
        c.moveTo(-5.2, -15); c.lineTo(5.2, -15); c.lineTo(6.6, -7.5);
        c.quadraticCurveTo(0, -6.6, -6.6, -7.5);
        c.closePath(); fs(c, suit.kilt);
        c.beginPath();
        c.moveTo(-1.6, -14); c.lineTo(1.6, -14); c.lineTo(2.4, -7.2); c.lineTo(-2.4, -7.2);
        c.closePath(); fs(c, suit.gold);
        rr(c, -5.4, -15.6, 10.8, 2.2, 1); fs(c, suit.gold);
      } else if (skirt) {
        c.beginPath();
        c.moveTo(-5, -14); c.lineTo(5, -14); c.lineTo(7.5, -6.5);
        c.quadraticCurveTo(0, -5, -7.5, -6.5);
        c.closePath(); fs(c, legs);
      } else {
        rr(c, -5, -14.5, 10, 5, 1.8); fs(c, legs);
      }
    }

    // Arms (swing opposite to the legs)
    for (const side of [-1, 1]) {
      c.save();
      c.translate(side * 5.6, -21.5);
      const rest = side * 0.18 - side * sw * 0.45;
      const up = -side * (Math.PI - 0.35);            // arms stretched up
      c.rotate(rest + (up - rest) * (opts.armUp || 0));
      rr(c, -1.7, 0, 3.4, 8.5, 1.7); fs(c, arms);
      if (kind === 'pharaoh') { rr(c, -1.9, 2.5, 3.8, 1.4, 0.7); fs(c, suit.gold); } // arm band
      circle(c, 0, 9.4, 1.8); fs(c, hands);
      c.restore();
    }

    // Body / shirt
    rr(c, -6, -23.5, 12, 11, 3.5); fs(c, top);
    const stripe = !suit && shirt.stripe;
    if (stripe || kind === 'spider' || kind === 'pharaoh') {
      c.save();
      rr(c, -6, -23.5, 12, 11, 3.5); c.clip();
      if (stripe) {
        c.fillStyle = stripe;
        for (let yy = -22; yy < -12; yy += 2.6) c.fillRect(-7, yy, 14, 1.2);
      } else if (kind === 'spider') {
        web(c, 0, -18.5, 9, suit.web, 0.35);
      } else {
        // Pharaoh's wide collar
        c.fillStyle = suit.gold; ellipse(c, 0, -23.8, 7.5, 6); c.fill();
        c.fillStyle = suit.blue; ellipse(c, 0, -23.8, 6, 4.6); c.fill();
        c.fillStyle = suit.gold; ellipse(c, 0, -23.8, 4.6, 3.3); c.fill();
        c.fillStyle = C.skin; ellipse(c, 0, -23.8, 3.2, 2); c.fill();
      }
      c.restore();
      rr(c, -6, -23.5, 12, 11, 3.5); c.stroke();
    }

    if (kind === 'mermaid') {
      // Shell on the top
      c.beginPath(); c.moveTo(0, -15.2); c.arc(0, -15.2, 3.4, Math.PI * 1.12, Math.PI * 1.88); c.closePath();
      fs(c, suit.shell);
      c.beginPath();
      for (const a of [1.3, 1.5, 1.7]) {
        c.moveTo(0, -15.2);
        c.lineTo(Math.cos(a * Math.PI) * 3, -15.2 + Math.sin(a * Math.PI) * 3);
      }
      c.lineWidth = 0.4; c.stroke(); c.lineWidth = 0.7;
    }

    if (kind === 'pharaoh') {
      // Striped cloth hanging down on both sides of the head
      for (const side of [-1, 1]) {
        striped(c, () => rr(c, side * 7.8 - 1.9, -30, 3.8, 12.5, 1.5), suit.gold, suit.blue, 1.6);
      }
    }

    if (kind === 'spider') {
      // Spider mask: red head, web lines, big white eyes
      spiderEmblem(c, 0, -19.5, 1.1);
      circle(c, 0, -30.5, 7.6); c.fillStyle = suit.top; c.fill();
      c.save(); circle(c, 0, -30.5, 7.6); c.clip();
      web(c, 0, -29.5, 9.5, suit.web, 0.38);
      c.restore();
      circle(c, 0, -30.5, 7.6); c.stroke();
      for (const sd of [-1, 1]) {
        ellipse(c, sd * 3, -31, 2, 1.3, -sd * 0.55);
        c.fillStyle = '#ffffff'; c.fill();
        c.lineWidth = 0.9; c.stroke(); c.lineWidth = 0.7;
      }
      c.restore();
      return;
    }

    // Head
    circle(c, 0, -30.5, 7.6); fs(c, C.skin);
    // opts.back: seen from behind – only hair, no face
    const back = !!opts.back && showHair;
    if (back) {
      circle(c, 0, -30.8, 7.9); fs(c, hairColor);
      c.beginPath(); c.arc(0.5, -34, 2.2, 0.3, Math.PI * 1.4); c.stroke();
    } else {
    // Face. opts.eyes: 'open' (default), 'sleepy', 'closed'
    //       opts.mouth: 'smile' (default), 'yawn', 'flat'
    const eyes = opts.eyes || 'open';
    for (const sd of [-1, 1]) {
      const ex = sd * 2.7;
      if (eyes === 'closed') {
        c.beginPath();
        c.moveTo(ex - 1.1, -30.2);
        c.quadraticCurveTo(ex, -29, ex + 1.1, -30.2);
        c.stroke();
      } else if (eyes === 'sleepy') {
        c.fillStyle = C.outline;
        c.beginPath(); c.ellipse(ex, -30, 0.95, 1.35, 0, 0, Math.PI); c.fill();   // lower half only
        c.beginPath(); c.moveTo(ex - 1.3, -30.1); c.lineTo(ex + 1.3, -30.1); c.stroke(); // heavy eyelid
      } else {
        c.fillStyle = C.outline;
        ellipse(c, ex, -30, 0.95, 1.35); c.fill();
        c.fillStyle = '#fff';
        circle(c, ex + 0.3, -30.5, 0.35); c.fill();
      }
    }
    c.fillStyle = C.cheeks;
    circle(c, -4.6, -27.6, 1.4); c.fill();
    circle(c, 4.6, -27.6, 1.4); c.fill();
    const mouth = opts.mouth || 'smile';
    if (mouth === 'yawn') {
      ellipse(c, 0, -26.8, 1.5, 2); fs(c, '#7a2e3a');
      c.fillStyle = '#ff8fa3';
      ellipse(c, 0, -25.6, 0.9, 0.6); c.fill();
    } else if (mouth === 'flat') {
      c.beginPath(); c.moveTo(-1.1, -27.4); c.lineTo(1.1, -27.4); c.stroke();
    } else {
      c.beginPath(); c.arc(0, -28, 1.9, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
    }
    if (opts.glasses) {
      c.beginPath();
      c.arc(-2.7, -30, 2, 0, Math.PI * 2);
      c.moveTo(4.7, -30); c.arc(2.7, -30, 2, 0, Math.PI * 2);
      c.moveTo(-0.7, -30.3); c.lineTo(0.7, -30.3);
      c.stroke();
    }

    if (kind === 'pharaoh') {
      // Striped headdress, gold band and a little snake on the forehead
      const nemes = () => {
        c.beginPath();
        c.moveTo(-8.8, -26.5);
        c.lineTo(-8.4, -31.5);
        c.arc(0, -31.5, 8.4, Math.PI, 2 * Math.PI);
        c.lineTo(8.8, -26.5);
        c.lineTo(6.6, -28.5);
        c.quadraticCurveTo(6.4, -33.4, 0, -33.6);
        c.quadraticCurveTo(-6.4, -33.4, -6.6, -28.5);
        c.closePath();
      };
      striped(c, nemes, suit.gold, suit.blue, 1.6);
      rr(c, -6.9, -34.6, 13.8, 1.8, 0.9); fs(c, suit.gold);
      ellipse(c, 0, -36.2, 1, 1.4); fs(c, suit.gold);
      c.fillStyle = suit.red; circle(c, 0, -36.4, 0.4); c.fill();
    }

    // Hair on top of the head
    if (showHair) {
    c.beginPath();
    if (isGirl) {
      c.moveTo(-8.1, -29);
      c.quadraticCurveTo(-8.4, -39.5, 0, -39.3);
      c.quadraticCurveTo(8.4, -39.5, 8.1, -29);
      c.quadraticCurveTo(6.5, -31.5, 4.3, -32.8);
      c.quadraticCurveTo(2.2, -31, 0.2, -33.2);
      c.quadraticCurveTo(-2.4, -31, -4.6, -32.8);
      c.quadraticCurveTo(-6.6, -31.5, -8.1, -29);
    } else {
      c.moveTo(-7.9, -30);
      c.quadraticCurveTo(-8.2, -39.5, 0, -39.5);
      c.quadraticCurveTo(2, -41.5, 3.2, -40.6);
      c.quadraticCurveTo(8.3, -38.5, 7.9, -30);
      c.quadraticCurveTo(5.5, -33.8, 2, -33.6);
      c.quadraticCurveTo(-1.5, -35, -4, -33.6);
      c.quadraticCurveTo(-6.6, -33, -7.9, -30);
    }
    c.closePath(); fs(c, hairColor);
    }
    } // end of face (not back view)

    // Hats (not with costumes). The mermaid has a starfish in the hair.
    if (kind === 'mermaid') {
      starfish(c, isGirl ? 5.6 : 4.8, -37.4, 2.6, suit.starfish);
    } else if (suit) {
      // the costume has its own head piece
    } else if (hat.id === 'cap') {
      rr(c, 0, -34.2, 12, 2.6, 1.3); fs(c, hat.shade);
      c.beginPath(); c.arc(0, -33.6, 8.2, Math.PI, 2 * Math.PI); c.closePath(); fs(c, hat.color);
      circle(c, 0, -41.6, 0.9); fs(c, hat.shade);
    } else if (hat.id === 'beanie') {
      c.beginPath(); c.arc(0, -33.4, 8.3, Math.PI, 2 * Math.PI); c.closePath(); fs(c, hat.color);
      rr(c, -8.7, -35.2, 17.4, 3.6, 1.8); fs(c, hat.shade);
      c.save(); c.strokeStyle = hat.color; c.lineWidth = 0.5;
      c.beginPath();
      for (let xx = -6.5; xx <= 6.5; xx += 2.2) { c.moveTo(xx, -34.6); c.lineTo(xx, -32.2); }
      c.stroke(); c.restore();
      circle(c, 0, -42.2, 2); fs(c, '#ffffff');
    } else if (hat.id === 'sunhat') {
      ellipse(c, 0, -34.2, 12.5, 2.4); fs(c, hat.color);
      c.beginPath(); c.arc(0, -34.6, 6.8, Math.PI, 2 * Math.PI); c.closePath(); fs(c, hat.color);
      rr(c, -6.8, -36.6, 13.6, 2, 1); fs(c, hat.shade);
    } else if (isGirl && !opts.noBow) {
      // Bow when there is no hat
      c.save(); c.translate(5.6, -37.2);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(3, -2.2); c.lineTo(3, 2.2); c.closePath(); fs(c, ch.bow);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-3, -2.2); c.lineTo(-3, 2.2); c.closePath(); fs(c, ch.bow);
      circle(c, 0, 0, 1.1); fs(c, ch.bow);
      c.restore();
    }
    c.restore();
  };

  // =========================================================================
  // THINGS. MP.draw('bed', ctx, x, y, opts)
  // For furniture (x, y) is the middle of the bottom edge (where it stands).
  // MP.SIZES tells how big each one is (for tapping).
  // =========================================================================
  MP.SIZES = {
    bed: { w: 46, h: 29 },
    teddy: { w: 12, h: 14 },
    panda: { w: 12, h: 15 },
    window: { w: 34, h: 28 },   // (x, y) = top-left corner
    mirror: { w: 16, h: 20 },   // (x, y) = middle
    sink: { w: 22, h: 34 },
    toilet: { w: 20, h: 33 },
    wardrobe: { w: 36, h: 56 },
    door: { w: 28, h: 48 },
    poster: { w: 36, h: 46 },   // (x, y) = top-left corner
  };

  const D = {};

  D.bed = function (c) {
    rr(c, -23, -28, 5, 28, 2); fs(c, C.wood);
    rr(c, 19, -17, 4, 17, 2); fs(c, C.wood);
    rr(c, -19, -13, 40, 8, 2); fs(c, '#ffffff');
    rr(c, -17, -18, 12, 6, 3); fs(c, C.pillow);
    rr(c, -9, -16, 30, 9, 3); fs(c, C.blanket);
    c.fillStyle = C.blanketDots;
    for (let xx = -5; xx < 19; xx += 5) { circle(c, xx, -11.5, 0.9); c.fill(); }
    rr(c, -20, -6, 41, 4, 1.5); fs(c, C.woodDark);
  };

  D.teddy = function (c) {
    circle(c, -3, -12, 1.8); fs(c, C.teddy);
    circle(c, 3, -12, 1.8); fs(c, C.teddy);
    ellipse(c, 0, -4, 4.5, 4.2); fs(c, C.teddy);
    circle(c, 0, -10, 3.8); fs(c, C.teddy);
    ellipse(c, 0, -9, 1.8, 1.3); fs(c, C.teddyNose);
    c.fillStyle = C.outline;
    circle(c, -1.4, -11, 0.5); c.fill();
    circle(c, 1.4, -11, 0.5); c.fill();
    circle(c, 0, -9.4, 0.5); c.fill();
  };

  D.panda = function (c) {
    const B = C.pandaBlack, Wt = C.pandaWhite;
    circle(c, -3.2, -12.6, 1.7); fs(c, B);
    circle(c, 3.2, -12.6, 1.7); fs(c, B);
    ellipse(c, -3, -1.2, 2, 1.5); fs(c, B);
    ellipse(c, 3, -1.2, 2, 1.5); fs(c, B);
    ellipse(c, 0, -4.5, 4.6, 4.3); fs(c, Wt);
    ellipse(c, -4, -5.2, 1.4, 2.4); fs(c, B);
    ellipse(c, 4, -5.2, 1.4, 2.4); fs(c, B);
    ellipse(c, 0, -10.2, 4.1, 3.7); fs(c, Wt);
    c.fillStyle = B;
    ellipse(c, -1.6, -10.6, 1.05, 1.4, 0.5); c.fill();
    ellipse(c, 1.6, -10.6, 1.05, 1.4, -0.5); c.fill();
    c.fillStyle = Wt;
    circle(c, -1.4, -10.9, 0.35); c.fill();
    circle(c, 1.4, -10.9, 0.35); c.fill();
    c.fillStyle = B;
    ellipse(c, 0, -8.9, 0.6, 0.4); c.fill();
  };

  // Window. opts: { skyTop, skyBottom, sun, moon, stars, t }
  D.window = function (c, o) {
    o = o || {};
    rr(c, 0, 0, 30, 26, 3); fs(c, C.woodLight);
    const sky = c.createLinearGradient(0, 3, 0, 23);
    sky.addColorStop(0, o.skyTop || '#6cc0ff');
    sky.addColorStop(1, o.skyBottom || '#cdeeff');
    rr(c, 3, 3, 24, 20, 1.5); fs(c, sky);
    c.save();
    rr(c, 3, 3, 24, 20, 1.5); c.clip();
    if (o.stars) {
      c.fillStyle = '#ffffff';
      [[6, 6], [12, 9], [22, 5], [8, 16], [24, 15]].forEach(([sx, sy], i) => {
        c.globalAlpha = 0.5 + 0.5 * Math.sin((o.t || 0) * 3 + i);
        circle(c, sx, sy, 0.6); c.fill();
      });
      c.globalAlpha = 1;
    }
    if (o.moon) D.moon(c, { x: 19, y: 10, r: 4 });
    if (o.sun !== false && !o.moon) {
      D.sun(c, { x: 19, y: 11, r: 4.5, t: o.t });
      c.fillStyle = '#ffffff';
      ellipse(c, 9, 17, 4, 1.8); c.fill();
      ellipse(c, 12, 16, 3, 2); c.fill();
    }
    c.restore();
    c.save();
    c.beginPath(); c.moveTo(15, 3); c.lineTo(15, 23); c.moveTo(3, 13); c.lineTo(27, 13);
    c.lineWidth = 1.6; c.strokeStyle = C.woodLight; c.stroke();
    c.restore();
    rr(c, -2, 25, 34, 3, 1.5); fs(c, C.wood);
  };

  D.mirror = function (c) {
    ellipse(c, 0, 0, 8, 10); fs(c, C.gold);
    ellipse(c, 0, 0, 6, 8); fs(c, C.glass);
    c.save();
    c.strokeStyle = '#ffffff'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-3, -5); c.lineTo(-1, -7); c.moveTo(-3, -1); c.lineTo(2, -6); c.stroke();
    c.restore();
  };

  D.sink = function (c) {
    rr(c, -3, -22, 6, 23, 2); fs(c, C.porcelainShade);
    c.beginPath();
    c.moveTo(-11, -24); c.lineTo(11, -24);
    c.quadraticCurveTo(10, -16, 0, -16);
    c.quadraticCurveTo(-10, -16, -11, -24);
    c.closePath(); fs(c, C.porcelain);
    // Tap
    c.save();
    c.beginPath(); c.moveTo(0, -24); c.lineTo(0, -30); c.quadraticCurveTo(0, -31.5, 3, -31.5); c.lineTo(5, -31.5);
    c.lineWidth = 1.8; c.strokeStyle = C.metal; c.stroke();
    c.restore();
    // Cup with toothbrush
    c.save();
    c.beginPath(); c.moveTo(-8, -33); c.lineTo(-7, -38);
    c.lineWidth = 1; c.strokeStyle = C.toothbrush; c.stroke();
    c.restore();
    rr(c, -10, -33, 4.5, 9, 1); fs(c, C.cup);
  };

  D.toilet = function (c) {
    rr(c, -9.6, -33, 8.2, 2.2, 1); fs(c, C.porcelain);       // tank lid
    rr(c, -9, -31, 7, 17, 1.5); fs(c, C.porcelain);           // tank
    circle(c, -5.5, -33.6, 0.9); fs(c, C.metal);              // button
    rr(c, -1, -7, 6, 7, 1.5); fs(c, C.porcelainShade);        // foot
    c.beginPath();                                             // bowl
    c.moveTo(-3, -13.5); c.lineTo(9.5, -13.5);
    c.quadraticCurveTo(9, -6, 2, -6);
    c.quadraticCurveTo(-3, -7, -3, -13.5);
    c.closePath(); fs(c, C.porcelain);
    rr(c, -3.5, -16, 13.5, 2.6, 1.2); fs(c, C.porcelain);     // seat
    rr(c, -3, -1.5, 10, 1.5, 0.7); fs(c, C.porcelainShade);   // base
  };

  // Wardrobe. opts: { open }  When open, the clothes inside are visible.
  D.wardrobe = function (c, o) {
    o = o || {};
    rr(c, -16, -52, 32, 53, 2.5); fs(c, C.wood);
    if (!o.open) {
      rr(c, -13, -49, 12.5, 46, 1.5); fs(c, C.woodLight);
      rr(c, 0.5, -49, 12.5, 46, 1.5); fs(c, C.woodLight);
      circle(c, -3, -26, 1); fs(c, C.gold);
      circle(c, 2.5, -26, 1); fs(c, C.gold);
    } else {
      rr(c, -13, -49, 26, 46, 1.5); fs(c, '#4a2c18');
      c.save();
      c.beginPath(); c.moveTo(-12, -45); c.lineTo(12, -45);
      c.lineWidth = 1; c.strokeStyle = C.metal; c.stroke();
      c.restore();
      const hook = (hx) => { c.beginPath(); c.moveTo(hx, -45); c.lineTo(hx, -43.5); c.stroke(); };
      // A shirt
      hook(-9);
      rr(c, -11.4, -43.5, 4.8, 8, 1.5); fs(c, MP.CLOTHES.shirt[1].color);
      // Pharaoh costume
      const ph = MP.findItem('costume', 'pharaoh');
      hook(-3.5);
      rr(c, -6.1, -43.5, 5.2, 11, 1.5); fs(c, ph.top);
      c.save();
      rr(c, -6.1, -43.5, 5.2, 11, 1.5); c.clip();
      c.fillStyle = ph.gold; ellipse(c, -3.5, -43.5, 3.2, 2.6); c.fill();
      c.fillStyle = ph.blue; ellipse(c, -3.5, -43.5, 2.2, 1.6); c.fill();
      c.fillStyle = ph.gold; c.fillRect(-7, -37, 7, 1.2);
      c.restore();
      rr(c, -6.1, -43.5, 5.2, 11, 1.5); c.stroke();
      // Mermaid costume (tail + top)
      const mm = MP.findItem('costume', 'mermaid');
      hook(2);
      c.beginPath();
      c.moveTo(-0.3, -39); c.quadraticCurveTo(-0.6, -34, 1.4, -31.5);
      c.lineTo(2.6, -31.5); c.quadraticCurveTo(4.6, -34, 4.3, -39);
      c.closePath(); fs(c, mm.legs);
      c.beginPath();
      c.moveTo(2, -32); c.quadraticCurveTo(-0.5, -32, -1, -29.5);
      c.quadraticCurveTo(2, -30.5, 5, -29.5); c.quadraticCurveTo(4.5, -32, 2, -32);
      c.closePath(); fs(c, mm.fin);
      rr(c, -0.4, -43.5, 4.8, 5, 1.5); fs(c, mm.top);
      // Spider costume on a hanger
      const sp = MP.findItem('costume', 'spider');
      const hx = 8.5;
      c.beginPath(); c.moveTo(hx, -45); c.lineTo(hx, -43.5); c.stroke();
      rr(c, hx - 2.2, -34.5, 2, 8, 1); fs(c, sp.legs);
      rr(c, hx + 0.2, -34.5, 2, 8, 1); fs(c, sp.legs);
      rr(c, hx - 2.8, -43.5, 5.6, 9.5, 1.5); fs(c, sp.top);
      c.save(); rr(c, hx - 2.8, -43.5, 5.6, 9.5, 1.5); c.clip();
      web(c, hx, -39.5, 5, sp.web, 0.25);
      c.restore();
      spiderEmblem(c, hx, -40, 0.6);
      // Open doors
      rr(c, -25, -49, 9, 46, 1.5); fs(c, C.woodLight);
      rr(c, 16, -49, 9, 46, 1.5); fs(c, C.woodLight);
    }
    rr(c, -18, -55, 36, 4, 2); fs(c, C.woodDark);
  };

  // Front door. opts: { open }
  D.door = function (c, o) {
    o = o || {};
    rr(c, -14, -48, 28, 48, 2); fs(c, C.woodDark);
    if (o.open) {
      const sky = c.createLinearGradient(0, -45, 0, 0);
      sky.addColorStop(0, '#8fd3ff'); sky.addColorStop(1, '#d8f3ff');
      rr(c, -11, -45, 22, 45, 1.5); fs(c, sky);
      c.fillStyle = '#7cc56b'; c.fillRect(-10.5, -9, 21, 9);
      rr(c, -11, -45, 6, 45, 1.5); fs(c, C.frontDoor);
      return;
    }
    rr(c, -11, -45, 22, 45, 1.5); fs(c, C.frontDoor);
    rr(c, -5, -40, 10, 8, 1.5); fs(c, C.glass);
    c.save();
    c.strokeStyle = C.frontDoorShade;
    rr(c, -8, -28, 6.5, 10, 1); c.stroke();
    rr(c, 1.5, -28, 6.5, 10, 1); c.stroke();
    rr(c, -8, -15, 6.5, 11, 1); c.stroke();
    rr(c, 1.5, -15, 6.5, 11, 1); c.stroke();
    c.restore();
    circle(c, 7, -21, 1.2); fs(c, C.gold);
  };

  // Small things: (x, y) is the middle unless said otherwise.
  D.sun = function (c, o) {
    const r = o.r || 6, t = o.t || 0;
    c.save();
    c.strokeStyle = C.sunRays;
    c.lineWidth = r * 0.18;
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + t * 0.5;
      c.moveTo(o.x + Math.cos(a) * r * 1.35, o.y + Math.sin(a) * r * 1.35);
      c.lineTo(o.x + Math.cos(a) * r * 1.8, o.y + Math.sin(a) * r * 1.8);
    }
    c.stroke();
    c.restore();
    c.fillStyle = C.sun;
    circle(c, o.x, o.y, r); c.fill();
  };

  D.moon = function (c, o) {
    const r = o.r || 6;
    c.fillStyle = C.moon;
    circle(c, o.x, o.y, r); c.fill();
    c.fillStyle = C.moonShade;
    circle(c, o.x - r * 0.35, o.y - r * 0.2, r * 0.22); c.fill();
    circle(c, o.x + r * 0.3, o.y + r * 0.35, r * 0.16); c.fill();
    circle(c, o.x + r * 0.25, o.y - r * 0.4, r * 0.1); c.fill();
  };

  // Four-pointed star / sparkle
  D.sparkle = function (c, o) {
    const r = o.r || 4;
    c.fillStyle = o.color || '#ffffff';
    c.beginPath();
    c.moveTo(o.x, o.y - r);
    c.quadraticCurveTo(o.x, o.y, o.x + r, o.y);
    c.quadraticCurveTo(o.x, o.y, o.x, o.y + r);
    c.quadraticCurveTo(o.x, o.y, o.x - r, o.y);
    c.quadraticCurveTo(o.x, o.y, o.x, o.y - r);
    c.fill();
    c.fillStyle = o.center || C.gold;
    circle(c, o.x, o.y, r * 0.18); c.fill();
  };

  D.star = function (c, o) {
    D.sparkle(c, { x: o.x, y: o.y, r: o.r || 2.5, color: o.color || '#fff7c8', center: '#ffffff' });
  };

  // Arrow pointing down, tip at (x, y)
  D.arrow = function (c, o) {
    c.beginPath();
    c.moveTo(o.x - 2.6, o.y - 14);
    c.lineTo(o.x + 2.6, o.y - 14);
    c.lineTo(o.x + 2.6, o.y - 7);
    c.lineTo(o.x + 6, o.y - 7);
    c.lineTo(o.x, o.y);
    c.lineTo(o.x - 6, o.y - 7);
    c.lineTo(o.x - 2.6, o.y - 7);
    c.closePath();
    fs(c, C.arrow);
  };

  // Rooster, standing at (x, y)
  D.rooster = function (c, o) {
    c.save();
    c.translate(o.x, o.y);
    const s = o.scale || 1;
    c.scale(s, s);
    c.beginPath(); c.moveTo(-1.5, -3); c.lineTo(-1.5, 0); c.moveTo(1.5, -3); c.lineTo(1.5, 0);
    c.save(); c.strokeStyle = C.beak; c.lineWidth = 0.9; c.stroke(); c.restore();
    // Tail
    c.beginPath(); c.moveTo(4, -7); c.quadraticCurveTo(9, -14, 10, -8); c.quadraticCurveTo(9, -5, 4, -4.5); c.closePath();
    fs(c, '#2f8f5b');
    ellipse(c, 0, -6, 5.5, 4); fs(c, C.rooster);
    circle(c, -4, -11, 2.8); fs(c, C.rooster);
    // Comb and beak
    c.beginPath(); c.moveTo(-5.5, -13.2); c.quadraticCurveTo(-5, -16, -3.5, -14); c.quadraticCurveTo(-2.5, -16, -1.8, -13); c.closePath();
    fs(c, C.roosterComb);
    c.beginPath(); c.moveTo(-6.6, -11.6); c.lineTo(-9, -10.8); c.lineTo(-6.6, -10); c.closePath(); fs(c, C.beak);
    c.fillStyle = C.outline; circle(c, -4.6, -11.6, 0.5); c.fill();
    c.restore();
  };

  // Band poster on the wall. (x, y) = top-left corner, 36 × 46.
  D.poster = function (c) {
    const band = MP.BAND;
    const bg = c.createLinearGradient(0, 0, 0, 46);
    bg.addColorStop(0, band.colorTop);
    bg.addColorStop(1, band.colorBottom);
    rr(c, 0, 0, 36, 46, 1.5); fs(c, bg);

    // Stage lights
    c.save();
    rr(c, 0, 0, 36, 46, 1.5); c.clip();
    c.fillStyle = 'rgba(255,240,150,0.22)';
    c.beginPath(); c.moveTo(4, 10); c.lineTo(0, 46); c.lineTo(16, 46); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(32, 10); c.lineTo(20, 46); c.lineTo(36, 46); c.closePath(); c.fill();
    // Stage
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.fillRect(0, 41, 36, 5);
    c.restore();

    // Band name
    MP.drawText(c, band.name, 18, 3, { size: 0.58, color: band.textColor, align: 'center', outline: C.outline });

    // The two band members
    const [m1, m2] = band.members;
    MP.drawPerson(c, 11, 43, { character: 'boy', outfit: { shirt: m1.shirt, bottom: 'jeans' }, hair: m1.hair, scale: 0.58 });
    MP.drawPerson(c, 25, 43, { character: 'boy', outfit: { shirt: m2.shirt, bottom: 'jeans' }, hair: m2.hair, scale: 0.58, flip: true });

    // Guitar for the first one
    c.save();
    c.translate(11.5, 34.5);
    c.rotate(-0.6);
    rr(c, 0, -0.5, 7, 1, 0.4); fs(c, C.woodDark);
    ellipse(c, -0.5, 0, 2.6, 2); fs(c, band.guitar);
    c.fillStyle = C.outline; circle(c, -0.3, 0, 0.6); c.fill();
    c.restore();

    // Microphone for the second one
    c.save();
    c.beginPath(); c.moveTo(29, 43); c.lineTo(29, 31.5);
    c.lineWidth = 0.6; c.strokeStyle = C.metal; c.stroke();
    c.restore();
    circle(c, 28.6, 31, 1); fs(c, '#555a66');

    // Music notes and sparkles
    c.fillStyle = band.textColor;
    c.strokeStyle = band.textColor;
    c.lineWidth = 0.5;
    for (const [nx, ny] of [[4.5, 19], [31.5, 17], [18, 15]]) {
      ellipse(c, nx, ny, 1, 0.75, -0.3); c.fill();
      c.beginPath(); c.moveTo(nx + 0.9, ny); c.lineTo(nx + 0.9, ny - 3.5); c.lineTo(nx + 2.2, ny - 2.6); c.stroke();
    }
    c.strokeStyle = C.outline;
    D.sparkle(c, { x: 6, y: 28, r: 1.8 });
    D.sparkle(c, { x: 31, y: 26, r: 1.5 });

    // Pins
    circle(c, 2.5, 2.5, 0.9); fs(c, '#e04848');
    circle(c, 33.5, 2.5, 0.9); fs(c, '#e04848');
  };

  // Shoe rack by the front door. opts: { taken } (true = our shoes are on)
  D.shoeRack = function (c, o) {
    rr(c, -16, -14, 32, 2.5, 1.2); fs(c, C.wood);
    rr(c, -16, -3, 32, 2.5, 1.2); fs(c, C.wood);
    rr(c, -16, -15, 2.5, 15, 1); fs(c, C.woodDark);
    rr(c, 13.5, -15, 2.5, 15, 1); fs(c, C.woodDark);
    const shoe = (x, y, col) => {
      c.beginPath();
      c.moveTo(x - 3, y); c.lineTo(x - 3, y - 2.6); c.quadraticCurveTo(x - 1, y - 3.4, x + 0.5, y - 2.2);
      c.quadraticCurveTo(x + 3.4, y - 2, x + 3.4, y); c.closePath();
      fs(c, col);
    };
    // Grown-ups' boots on the top shelf
    shoe(-9, -14, '#5a3a2a'); shoe(-3, -14, '#5a3a2a');
    shoe(5, -14, '#2f4a8a'); shoe(11, -14, '#2f4a8a');
    // Our shoes on the bottom shelf (gone when they are on our feet)
    if (!o.taken) { shoe(-6, -3, C.shoes); shoe(1, -3, C.shoes); }
    shoe(9, -3, '#e04848');
  };

  // Small bedside table. (x, y) = middle of the bottom.
  D.nightstand = function (c) {
    rr(c, -11, -18, 22, 18, 2); fs(c, C.woodLight);
    rr(c, -12, -19.5, 24, 3, 1.5); fs(c, C.wood);
    rr(c, -8, -14, 16, 6, 1.2); fs(c, C.wood);
    circle(c, 0, -11, 0.9); fs(c, C.gold);
  };

  // Alarm clock. (x, y) = middle of the bottom. opts: { ringing, t }
  D.alarmClock = function (c, o) {
    const t = o.t || 0;
    c.save();
    c.translate(o.x, o.y);
    if (o.ringing) {
      c.rotate(Math.sin(t * 45) * 0.12);
      // shaking lines
      c.save();
      c.strokeStyle = C.outline; c.lineWidth = 0.6;
      c.beginPath();
      for (const sd of [-1, 1]) {
        c.moveTo(sd * 8, -10); c.lineTo(sd * 10.5, -12);
        c.moveTo(sd * 8.5, -7); c.lineTo(sd * 11.5, -7);
        c.moveTo(sd * 8, -4); c.lineTo(sd * 10.5, -2);
      }
      c.stroke();
      c.restore();
    }
    // feet and bells
    c.beginPath(); c.moveTo(-3.5, -2); c.lineTo(-4.5, 0); c.moveTo(3.5, -2); c.lineTo(4.5, 0); c.stroke();
    circle(c, -3.6, -11.6, 2.2); fs(c, C.gold);
    circle(c, 3.6, -11.6, 2.2); fs(c, C.gold);
    c.beginPath(); c.moveTo(0, -12.5); c.lineTo(0, -14); c.stroke();
    circle(c, 0, -6.5, 5.5); fs(c, '#e04848');
    circle(c, 0, -6.5, 4); fs(c, '#ffffff');
    // hands showing 7 o'clock
    c.beginPath();
    c.moveTo(0, -6.5); c.lineTo(0, -9.6);
    c.moveTo(0, -6.5); c.lineTo(-1.4, -4.4);
    c.stroke();
    c.restore();
  };

  // ---- Breakfast foods. (x, y) = middle. opts: { scale, level (drinks: 0..1) } ----
  function food(c, o, fn) {
    c.save();
    c.translate(o.x, o.y);
    const s = o.scale || 1;
    c.scale(s, s);
    fn();
    c.restore();
  }

  D.yoghurt = (c, o) => food(c, o, () => {
    c.beginPath(); c.moveTo(-5, -5); c.lineTo(5, -5); c.lineTo(4, 6); c.lineTo(-4, 6); c.closePath();
    fs(c, '#ffffff');
    c.beginPath(); c.moveTo(-4.7, -1.5); c.lineTo(4.7, -1.5); c.lineTo(4.4, 2.5); c.lineTo(-4.4, 2.5); c.closePath();
    fs(c, '#ff8fc0');
    c.fillStyle = '#e04848'; circle(c, 0, 0.5, 1); c.fill();
    rr(c, -5.6, -6.6, 11.2, 1.8, 0.9); fs(c, '#d8dde6');
    c.save(); c.translate(3, -6); c.rotate(0.5);
    rr(c, -0.5, -7, 1, 7, 0.5); fs(c, '#c9d3e6');
    ellipse(c, 0, -7.5, 1.2, 1.6); fs(c, '#c9d3e6');
    c.restore();
  });

  // Banana. opts.peeled: peel opened down (we don't eat the peel!),
  // opts.eaten: 0..1 how much of the fruit is eaten (1 = only the peel left)
  D.banana = (c, o) => food(c, o, () => {
    if (o.peeled) {
      const left = 1 - MP.clamp(o.eaten || 0, 0, 1);
      if (left > 0.02) {
        const top = 1.5 - 11 * left;
        rr(c, -2.4, top, 4.8, 3 - top, 2.4); fs(c, '#fff3c4');     // the fruit
      }
      for (const sd of [-1, 1]) {                                     // peel flaps hanging down
        c.beginPath();
        c.moveTo(sd * 2.6, 1.5);
        c.quadraticCurveTo(sd * 7, 2.5, sd * 7.6, 7);
        c.quadraticCurveTo(sd * 4.2, 5.6, sd * 1, 4);
        c.closePath(); fs(c, '#ffd84d');
      }
      c.beginPath();
      c.moveTo(-2, 2.5); c.quadraticCurveTo(0, 9.5, 2, 2.5); c.closePath(); fs(c, '#f2c230');
      rr(c, -3, 0.5, 6, 4.5, 2); fs(c, '#ffd84d');
      c.fillStyle = '#6b4a2b'; circle(c, 0, 5.4, 0.8); c.fill();
      return;
    }
    c.beginPath(); c.moveTo(-7, -3);
    c.quadraticCurveTo(0, 8, 7, -3);
    c.quadraticCurveTo(0, 0, -7, -3);
    c.closePath(); fs(c, '#ffd84d');
    c.fillStyle = '#6b4a2b';
    circle(c, -7, -3, 0.8); c.fill();
    circle(c, 7, -3, 0.8); c.fill();
  });

  D.apple = (c, o) => food(c, o, () => {
    c.beginPath(); c.moveTo(0, -3.5);
    c.bezierCurveTo(4, -7, 8, -2, 5.5, 3);
    c.bezierCurveTo(4, 6.5, 1.5, 6, 0, 5);
    c.bezierCurveTo(-1.5, 6, -4, 6.5, -5.5, 3);
    c.bezierCurveTo(-8, -2, -4, -7, 0, -3.5);
    c.closePath(); fs(c, '#e04848');
    c.beginPath(); c.moveTo(0, -3.5); c.quadraticCurveTo(0.3, -6, 1.2, -7); c.stroke();
    ellipse(c, 2.8, -5.8, 2, 1, -0.5); fs(c, '#4caf50');
    c.fillStyle = 'rgba(255,255,255,0.6)'; ellipse(c, -3, -1, 1, 1.8); c.fill();
  });

  // Riisipiirakka: crimped rye crust with rice filling
  D.ricepie = (c, o) => food(c, o, () => {
    c.beginPath();
    for (let i = 0; i <= 28; i++) {
      const a = i / 28 * Math.PI * 2;
      const r = i % 2 ? 1.08 : 1;
      const px = Math.cos(a) * 8 * r, py = Math.sin(a) * 4.5 * r;
      if (i) c.lineTo(px, py); else c.moveTo(px, py);
    }
    c.closePath(); fs(c, '#a8652f');
    ellipse(c, 0, -0.3, 6, 2.8); fs(c, '#fff3d6');
    c.fillStyle = '#e9cf95';
    for (const [px, py] of [[-3, -0.5], [-1, 0.6], [1.5, -1], [3.5, 0.4], [0.2, -1.6]]) {
      ellipse(c, px, py, 0.7, 0.4); c.fill();
    }
  });

  // Riisipuuro: bowl of rice porridge with a butter "eye"
  D.porridge = (c, o) => food(c, o, () => {
    ellipse(c, 0, -1.5, 8, 2.6); fs(c, '#fff6e3');
    c.beginPath(); c.moveTo(-8, -1.5);
    c.quadraticCurveTo(-7.5, 6, 0, 6);
    c.quadraticCurveTo(7.5, 6, 8, -1.5);
    c.quadraticCurveTo(0, 1.5, -8, -1.5);
    c.closePath(); fs(c, '#4a78c8');
    c.fillStyle = '#ffd23f'; ellipse(c, 0.5, -1.8, 1.8, 0.8); c.fill();
  });

  function glass(c, o, liquid) {
    food(c, o, () => {
      const lvl = o.level == null ? 1 : MP.clamp(o.level, 0, 1);
      const shape = () => {
        c.beginPath(); c.moveTo(-4.5, -7); c.lineTo(4.5, -7); c.lineTo(3.6, 7); c.lineTo(-3.6, 7); c.closePath();
      };
      shape(); c.fillStyle = 'rgba(220,240,255,0.55)'; c.fill();
      if (lvl > 0) {
        c.save(); shape(); c.clip();
        c.fillStyle = liquid;
        c.fillRect(-6, 7 - 12.5 * lvl, 12, 14);
        c.restore();
      }
      shape(); c.stroke();
      c.save();
      c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(-2.8, -5); c.lineTo(-2.3, 4); c.stroke();
      c.restore();
    });
  }
  D.water = (c, o) => glass(c, o, '#8fd3ff');
  D.milk = (c, o) => glass(c, o, '#ffffff');

  // House seen from outside. (x, y) = middle of the bottom.
  // opts: { night: 0..1 (how dark), lights: true/false }
  D.house = function (c, o) {
    const n = o.night || 0;
    const dark = '#2a2f5a';
    const mix = (col) => MP.mixColor(col, dark, n * 0.65);
    rr(c, 10, -56, 6, 14, 1); fs(c, mix('#9c4a3f'));                    // chimney
    rr(c, -24, -36, 48, 36, 1.5); fs(c, mix('#f2d7b0'));                 // wall
    c.beginPath();                                                        // roof
    c.moveTo(-29, -35); c.lineTo(0, -58); c.lineTo(29, -35); c.closePath();
    fs(c, mix('#c0504d'));
    rr(c, -5, -19, 10, 19, 1.5); fs(c, mix('#8a5a35'));                  // door
    circle(c, 2.6, -9.5, 0.8); fs(c, C.gold);
    for (const wx of [-19, 9]) {                                          // windows
      rr(c, wx, -29, 10, 9, 1); fs(c, o.lights ? '#ffd86b' : mix(C.glass));
      if (o.lights) {
        c.save();
        c.globalAlpha = 0.35;
        c.fillStyle = '#ffd86b';
        circle(c, wx + 5, -24.5, 9); c.fill();
        c.restore();
        rr(c, wx, -29, 10, 9, 1); c.stroke();
      }
      c.beginPath(); c.moveTo(wx + 5, -29); c.lineTo(wx + 5, -20); c.moveTo(wx, -24.5); c.lineTo(wx + 10, -24.5); c.stroke();
    }
    rr(c, -2.5, -46, 5, 5, 2.5); fs(c, o.lights ? '#ffd86b' : mix(C.glass)); // round attic window
  };

  // Pointing hand, fingertip at (x, y)
  D.hand = function (c, o) {
    c.save();
    c.translate(o.x, o.y);
    rr(c, -1.6, 0, 3.2, 9, 1.6); fs(c, C.skin);
    rr(c, -4.5, 6, 9, 8, 3); fs(c, C.skin);
    ellipse(c, -4.5, 9.5, 1.6, 2.6, 0.4); fs(c, C.skin);
    c.restore();
  };

  // Toothbrush. (x, y) = middle of the bristles. opts: { angle, scale }
  D.toothbrush = function (c, o) {
    c.save();
    c.translate(o.x, o.y);
    c.rotate(o.angle || 0);
    const s = o.scale || 1;
    c.scale(s, s);
    rr(c, -3, 0.5, 26, 3, 1.5); fs(c, C.toothbrush);
    rr(c, -3.5, -3, 7, 3.8, 1); fs(c, '#ffffff');
    c.save();
    c.strokeStyle = '#c9d3e6'; c.lineWidth = 0.4;
    c.beginPath();
    for (let i = -2.5; i <= 2.5; i += 1.2) { c.moveTo(i, -2.6); c.lineTo(i, 0.4); }
    c.stroke();
    c.restore();
    c.restore();
  };

  D.ball = function (c, o) {
    const r = o.r || 4;
    circle(c, o.x, o.y - r, r); fs(c, '#ffffff');
    c.save();
    circle(c, o.x, o.y - r, r); c.clip();
    c.fillStyle = C.frontDoor;
    c.fillRect(o.x - r, o.y - r * 1.4, r * 2, r * 0.8);
    c.restore();
    circle(c, o.x, o.y - r, r); c.stroke();
  };

  MP.DRAW = D;

  // MP.draw('bed', ctx, x, y, opts)
  // Furniture: (x, y) = middle of the bottom. window: top-left. mirror: middle.
  // Small things (sun, moon, star, sparkle, arrow, rooster, hand, toothbrush,
  // ball) take everything in opts: MP.draw('sun', ctx, 0, 0, { x, y, r }).
  const POSITIONED = { bed: 1, teddy: 1, panda: 1, window: 1, mirror: 1, sink: 1, toilet: 1, wardrobe: 1, door: 1, poster: 1, house: 1, nightstand: 1, shoeRack: 1 };
  MP.draw = function (name, c, x, y, opts) {
    const fn = D[name];
    if (!fn) throw new Error('No drawing called "' + name + '"');
    begin(c, 0.8);
    if (POSITIONED[name]) {
      c.translate(x, y);
      fn(c, opts || {});
    } else {
      fn(c, Object.assign({ x, y }, opts));
    }
    c.restore();
  };
})();
