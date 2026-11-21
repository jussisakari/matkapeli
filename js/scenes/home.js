// home.js – the side-scrolling home with TWO FLOORS.
//   Upstairs:   child's room (bed, alarm clock, wardrobe) → bathroom → top of the stairs
//   Downstairs: living room (sofa + TV) → kitchen → hallway (stairs, shoes, front door)
// Tap to walk; the camera follows the character. Tap the stairs to go up or down.
//
// The morning: the alarm clock rings → tap it → wake up. Then the morning tasks
// (toilet, brushing teeth, getting dressed, breakfast, shoes) in ANY order.
// You can only go out of the front door when all of them are done.
// You may watch TV too – but not for too long!
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const WORLD_W = 960;   // 3 rooms × 320 on each floor
  const FLOOR = 150;     // where feet stand (inside one floor)
  const FLOOR_UP = 150;  // upstairs feet, in world coordinates
  const FLOOR_DOWN = 330;// downstairs feet (the downstairs is drawn 180 lower)
  const DOWN_Y = 180;    // how much lower the downstairs is drawn
  const DOOR_TOP = 96;   // top of the openings between rooms

  // The staircase goes from the top (upstairs) down to the right
  const STAIRS = { topX: 700, bottomX: 860, steps: 12 };
  const UP_MAX_X = 690;  // upstairs you can't walk past the top of the stairs

  // Where things are (x = middle)
  const POS = {
    // upstairs: child's room 0–320
    nightstand: 30, window: 52, bed: 70, teddy: 126, panda: 140, ball: 172, poster: 196, rug: 150, wardrobe: 274,
    // upstairs: bathroom 320–640
    toilet: 385, sink: 480, mirror: 480, towel: 560,
    // upstairs: landing 640–960
    landingPicture: 650, landingPlant: 900,
    // downstairs: living room 0–320
    plant: 22, livingWindow: 70, sofa: 110, lamp: 166, tv: 232, bookshelf: 293,
    // downstairs: kitchen 320–640
    fridge: 354, counter: 428, clock: 492, kitchenWindow: 516, table: 590,
    // downstairs: hallway 640–960
    shoeRack: 772, hooks: 892, door: 932,
  };

  // Things you can tap (world coordinates; downstairs things are 180 lower).
  // standX = where the character stands to use it.
  const SPOTS = {
    alarm:      { x: 16,  y: 104, w: 30, h: 30 },
    teddy:      { x: 118, y: 132, w: 15, h: 20 },
    panda:      { x: 133, y: 131, w: 15, h: 21 },
    poster:     { x: 196, y: 38,  w: 36, h: 46 },
    wardrobe:   { x: 254, y: 92,  w: 40, h: 62, standX: 248 },
    toilet:     { x: 370, y: 112, w: 30, h: 42, standX: 404 },
    sink:       { x: 464, y: 84,  w: 34, h: 70, standX: 461 },
    // Big areas for the stairs: upstairs the whole landing, downstairs the whole staircase
    stairsUp:   { x: 640, y: 30,  w: 320, h: 126, standX: UP_MAX_X, arrowX: 712, arrowY: 112 },
    sofa:       { x: 78,  y: 290, w: 64, h: 44, standX: 110 },
    tv:         { x: 198, y: 270, w: 68, h: 62, standX: 110 },
    books:      { x: 274, y: 246, w: 38, h: 88, standX: 286 },
    table:      { x: 556, y: 288, w: 68, h: 46, standX: 590 },
    shoes:      { x: 752, y: 306, w: 40, h: 26, standX: 772 },
    stairsDown: { x: 696, y: 182, w: 190, h: 138, standX: 872, arrowX: 846, arrowY: 268 },
    door:       { x: 916, y: 280, w: 32, h: 54, standX: 904 },
  };
  const floorOf = (spot) => (spot.y >= DOWN_Y ? 1 : 0);

  // The morning tasks. Any order is fine, but all of them before going out.
  //   spot = the thing to tap, name = how it is said
  const TASKS = [
    { id: 'toilet',    spot: 'toilet',   name: 'vessa' },
    { id: 'brush',     spot: 'sink',     name: 'hampaiden pesu' },
    { id: 'dress',     spot: 'wardrobe', name: 'pukeminen' },
    { id: 'breakfast', spot: 'table',    name: 'aamupala' },
    { id: 'shoes',     spot: 'shoes',    name: 'kengät' },
  ];
  // Said when you try something that is already done
  const ALREADY = {
    toilet: 'Ei tarvitse nyt.',
    sink: 'Hampaat on jo puhtaat!',
    wardrobe: 'Vaatteet on jo päällä!',
    table: 'Aamupala on jo syöty!',
    shoes: 'Kengät on jo jalassa!',
  };

  // Waking up (seconds after tapping the alarm clock): sit up → yawn → hop out
  const WAKE = { sitUp: 0.3, sitDone: 1.1, yawnStart: 1.4, yawnEnd: 2.6, hop: 2.9, land: 3.5 };
  const START_X = 102;       // where the character lands next to the bed
  const IN_BED_SCALE = 0.9;  // a bit smaller while in bed
  const ALARM_EVERY = 1.4;   // seconds between "rrring!" sounds
  const PARENT_AFTER = 10;   // if the alarm rings this long, mom or dad comes to wake you
  const PARENT_SPEED = 65;
  const STAIR_SPEED = 95;
  const TV_MAX = 30;         // seconds of TV before mom or dad switches it off
  const HALLWAY_X = 650;     // downstairs, the hallway starts here (shoes are OK only there)

  // The TV view (when watching): TV in the middle, remote control on the right
  const TV_VIEW = { x: 40, y: 12, w: 236, h: 150 };
  const TV_SCREEN = { x: 52, y: 22, w: 212, h: 124 };
  const REMOTE = { x: 284, y: 96, w: 28, h: 66 };
  const POWER = { x: 298, y: 110, r: 7 };

  // ---------------------------------------------------------------------------
  // Small drawing helpers for the rooms
  // ---------------------------------------------------------------------------
  function box(ctx, x, y, w, h, r, fill) {
    MP.roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();
  }

  function withLine(ctx, fn) {
    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = MP.COLORS.outline;
    fn();
    ctx.restore();
  }

  function dottedWall(ctx, x0, color, dot) {
    ctx.fillStyle = color;
    ctx.fillRect(x0, 0, 320, FLOOR);
    ctx.fillStyle = dot;
    for (let yy = 14; yy < FLOOR - 6; yy += 14) {
      for (let xx = x0 + ((yy / 14) % 2) * 7 + 4; xx < x0 + 320; xx += 14) {
        ctx.beginPath(); ctx.arc(xx, yy, 1.1, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function tiledWall(ctx, x0) {
    ctx.fillStyle = '#d8f0f5';
    ctx.fillRect(x0, 0, 320, FLOOR);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x0, 62, 320, FLOOR - 62);
    ctx.strokeStyle = 'rgba(120,160,180,0.35)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let yy = 70; yy < FLOOR; yy += 8) { ctx.moveTo(x0, yy); ctx.lineTo(x0 + 320, yy); }
    for (let xx = x0 + 4; xx < x0 + 320; xx += 8) { ctx.moveTo(xx, 62); ctx.lineTo(xx, FLOOR); }
    ctx.stroke();
    ctx.fillStyle = '#7cc3d6';
    ctx.fillRect(x0, 60, 320, 3);
  }

  function kitchenWall(ctx, x0) {
    ctx.fillStyle = '#fff1c9';
    ctx.fillRect(x0, 0, 320, FLOOR);
    ctx.fillStyle = 'rgba(240,180,90,0.16)';
    for (let yy = 0; yy < FLOOR; yy += 10) {
      for (let xx = x0 + ((yy / 10) % 2) * 10; xx < x0 + 320; xx += 20) ctx.fillRect(xx, yy, 10, 10);
    }
  }

  function stripedWall(ctx, x0) {
    ctx.fillStyle = '#e6f0d8';
    ctx.fillRect(x0, 0, 320, FLOOR);
    ctx.fillStyle = 'rgba(150,190,120,0.25)';
    for (let xx = x0; xx < x0 + 320; xx += 12) ctx.fillRect(xx, 0, 5, FLOOR);
  }

  function woodFloor(ctx, x0, w) {
    ctx.fillStyle = '#d9a877';
    ctx.fillRect(x0, FLOOR, w, MP.H - FLOOR);
    ctx.strokeStyle = 'rgba(120,70,40,0.35)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let yy = FLOOR + 7; yy < MP.H; yy += 7) { ctx.moveTo(x0, yy); ctx.lineTo(x0 + w, yy); }
    ctx.stroke();
  }

  function tileFloor(ctx, x0, w, base, check) {
    ctx.fillStyle = base;
    ctx.fillRect(x0, FLOOR, w, MP.H - FLOOR);
    ctx.fillStyle = check;
    for (let yy = FLOOR; yy < MP.H; yy += 8) {
      for (let xx = x0 + ((yy - FLOOR) / 8 % 2) * 8; xx < x0 + w; xx += 16) ctx.fillRect(xx, yy, 8, 8);
    }
  }

  // Wall between two rooms, with an opening to walk through
  function partition(ctx, x) {
    withLine(ctx, () => {
      ctx.fillStyle = '#e9d5bb';
      ctx.fillRect(x - 6, 0, 12, DOOR_TOP);
      ctx.strokeRect(x - 6, -1, 12, DOOR_TOP + 1);
      box(ctx, x - 16, DOOR_TOP - 4, 32, 5, 1.5, '#c98a55');
      box(ctx, x - 16, DOOR_TOP, 4, FLOOR - DOOR_TOP, 1, '#c98a55');
      box(ctx, x + 12, DOOR_TOP, 4, FLOOR - DOOR_TOP, 1, '#c98a55');
    });
  }

  function towel(ctx, x) {
    withLine(ctx, () => {
      box(ctx, x - 9, 88, 18, 2.5, 1.2, '#8a93a6');
      box(ctx, x - 7, 89, 14, 22, 2, '#ff9ec4');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 6.6, 105, 13.2, 2);
    });
  }

  function coatHooks(ctx, x) {
    withLine(ctx, () => {
      box(ctx, x - 16, 70, 32, 4, 1.5, '#a0643c');
      ctx.fillStyle = '#ffd23f';
      for (const hx of [-10, 0, 10]) { ctx.beginPath(); ctx.arc(x + hx, 76, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      box(ctx, x - 15, 76, 10, 20, 2.5, '#4a78c8');   // jacket
      box(ctx, x + 8.5, 76, 3, 18, 1.5, '#e04848');   // scarf
    });
  }

  function doormat(ctx, x) {
    withLine(ctx, () => box(ctx, x - 16, FLOOR + 1, 32, 5, 2, '#8b5a2b'));
  }

  function rug(ctx, x) {
    ctx.save();
    ctx.fillStyle = '#c084fc';
    ctx.beginPath(); ctx.ellipse(x, FLOOR + 6, 30, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.ellipse(x, FLOOR + 6, 25, 3.2, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // ---- Kitchen ----
  function fridge(ctx, x) {
    withLine(ctx, () => {
      box(ctx, x - 15, 88, 30, 62, 3, '#f4f7fb');
      ctx.beginPath(); ctx.moveTo(x - 15, 110); ctx.lineTo(x + 15, 110); ctx.stroke();
      box(ctx, x + 9, 95, 2.2, 10, 1, '#8a93a6');
      box(ctx, x + 9, 115, 2.2, 18, 1, '#8a93a6');
      // A child's drawing held by magnets
      box(ctx, x - 11, 116, 13, 11, 0.8, '#ffffff');
      ctx.save();
      ctx.strokeStyle = '#ffb000'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.arc(x - 7, 120, 2, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#4caf50';
      ctx.beginPath(); ctx.moveTo(x - 10, 125.5); ctx.lineTo(x + 1, 125.5); ctx.stroke();
      ctx.strokeStyle = '#e04848';
      ctx.beginPath(); ctx.moveTo(x - 3, 125); ctx.lineTo(x - 1, 121); ctx.lineTo(x + 1, 125); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#e04848'; ctx.beginPath(); ctx.arc(x - 10, 116.5, 1.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4a78c8'; ctx.beginPath(); ctx.arc(x + 1, 116.5, 1.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
  }

  function counter(ctx, x) {
    withLine(ctx, () => {
      box(ctx, x - 36, 50, 72, 26, 2, '#9fd3c7');            // upper cupboards
      ctx.beginPath(); ctx.moveTo(x, 50); ctx.lineTo(x, 76); ctx.stroke();
      box(ctx, x - 36, 116, 72, 34, 2, '#9fd3c7');           // lower cupboards
      box(ctx, x - 11, 121, 22, 24, 1.5, '#2b2340');         // oven door
      box(ctx, x - 8, 127, 16, 12, 1, '#5a5a73');
      box(ctx, x - 38, 112.5, 76, 4, 1.5, '#e9eef2');        // counter top
      ctx.fillStyle = '#2b2340';
      for (const bx of [-12, 12]) { ctx.beginPath(); ctx.ellipse(x + bx, 112.5, 6, 1.2, 0, 0, Math.PI * 2); ctx.fill(); }
      box(ctx, x + 6, 103, 13, 9.5, 2, '#e04848');           // pot
      box(ctx, x + 5, 101.5, 15, 2, 1, '#a83232');
      box(ctx, x - 30, 106, 3, 6.5, 1, '#8a93a6');           // tap
    });
  }

  function wallClock(ctx, x, y, t) {
    withLine(ctx, () => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const m = t * 0.5, h = t * 0.04;
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(m) * 5, y - Math.cos(m) * 5);
      ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(h) * 3.2, y - Math.cos(h) * 3.2);
      ctx.stroke();
    });
  }

  function kitchenTable(ctx, x) {
    withLine(ctx, () => {
      for (const sd of [-1, 1]) {                            // chairs
        const cx = x + sd * 36;
        box(ctx, cx - 7, 131, 14, 3, 1.2, '#e04848');
        box(ctx, cx + sd * 5 - 1.5, 110, 3, 24, 1.2, '#e04848');
        box(ctx, cx - 6, 134, 2.5, 16, 1, '#a83232');
        box(ctx, cx + 3.5, 134, 2.5, 16, 1, '#a83232');
      }
      box(ctx, x - 27, 127, 3, 23, 1, '#a0643c');            // table legs
      box(ctx, x + 24, 127, 3, 23, 1, '#a0643c');
      box(ctx, x - 31, 123, 62, 5, 2, '#c98a55');            // table top
    });
    MP.draw('porridge', ctx, x - 10, 119, { scale: 0.7 });
    MP.draw('milk', ctx, x + 10, 118, { scale: 0.55 });
  }

  // Little music note (for the poster tune)
  function note(ctx, x, y, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#6a3fb5';
    ctx.strokeStyle = '#6a3fb5';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(x, y, 2, 1.5, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 1.8, y); ctx.lineTo(x + 1.8, y - 7); ctx.lineTo(x + 4.5, y - 5); ctx.stroke();
    ctx.restore();
  }

  // A little picture for each task in the checklist (drawn around cx, cy)
  function taskIcon(ctx, id, cx, cy) {
    if (id === 'toilet') {
      ctx.save(); ctx.translate(cx, cy + 7); ctx.scale(0.42, 0.42);
      MP.draw('toilet', ctx, 0, 0);
      ctx.restore();
    } else if (id === 'brush') {
      MP.draw('toothbrush', ctx, cx - 3.5, cy - 1, { scale: 0.42, angle: -0.6 });
    } else if (id === 'dress') {
      withLine(ctx, () => {
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(cx - 2.5, cy - 5); ctx.lineTo(cx - 6, cy - 2.5); ctx.lineTo(cx - 4.5, cy);
        ctx.lineTo(cx - 3, cy - 1); ctx.lineTo(cx - 3, cy + 5); ctx.lineTo(cx + 3, cy + 5);
        ctx.lineTo(cx + 3, cy - 1); ctx.lineTo(cx + 4.5, cy); ctx.lineTo(cx + 6, cy - 2.5);
        ctx.lineTo(cx + 2.5, cy - 5); ctx.quadraticCurveTo(cx, cy - 3.5, cx - 2.5, cy - 5);
        ctx.closePath();
        ctx.fillStyle = '#e04848'; ctx.fill(); ctx.stroke();
      });
    } else if (id === 'breakfast') {
      MP.draw('porridge', ctx, cx, cy + 1, { scale: 0.7 });
    } else if (id === 'shoes') {
      withLine(ctx, () => {
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy + 4); ctx.lineTo(cx - 5, cy - 1); ctx.quadraticCurveTo(cx - 1.5, cy - 3, cx + 0.5, cy);
        ctx.quadraticCurveTo(cx + 6, cy + 0.5, cx + 6, cy + 4); ctx.closePath();
        ctx.fillStyle = MP.COLORS.shoes; ctx.fill(); ctx.stroke();
      });
    }
  }

  // ---- Living room, landing and stairs ----
  function sofa(ctx, x) {
    withLine(ctx, () => {
      box(ctx, x - 30, 112, 60, 22, 7, '#3aa8a0');      // back
      box(ctx, x - 30, 127, 60, 15, 4, '#4cc1b8');      // seat
      box(ctx, x - 35, 120, 10, 24, 4, '#3aa8a0');      // arm rests
      box(ctx, x + 25, 120, 10, 24, 4, '#3aa8a0');
      box(ctx, x - 24, 115, 13, 11, 3, '#ffd23f');      // cushions
      box(ctx, x + 11, 115, 13, 11, 3, '#ff8fc0');
      box(ctx, x - 30, 143, 4, 7, 1, '#6e4226');        // legs
      box(ctx, x + 26, 143, 4, 7, 1, '#6e4226');
    });
  }

  // TV on a low cabinet. on = shows the cartoon, showT = how long it has been on
  function tvSet(ctx, x, on, showT) {
    withLine(ctx, () => {
      box(ctx, x - 30, 128, 60, 20, 2, '#a0643c');      // cabinet
      ctx.beginPath(); ctx.moveTo(x, 128); ctx.lineTo(x, 148); ctx.stroke();
      box(ctx, x - 29, 148, 4, 2, 0.5, '#6e4226');
      box(ctx, x + 25, 148, 4, 2, 0.5, '#6e4226');
      box(ctx, x - 4, 124, 8, 4, 1, '#2b2b33');          // TV foot
      box(ctx, x - 33, 88, 66, 37, 3, '#2b2b33');        // TV
    });
    if (on) {
      MP.drawTvShow(ctx, x - 30, 91, 60, 31, showT);
    } else {
      ctx.save();
      ctx.fillStyle = '#3a3f4f';
      ctx.fillRect(x - 30, 91, 60, 31);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 24, 117); ctx.lineTo(x - 8, 95); ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.fillStyle = on ? '#4cd964' : '#e04848';           // little light
    ctx.beginPath(); ctx.arc(x + 29, 123, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Bookshelf: rows of colorful books. The Egypt book (gold) and the
  // spider-hero book (red) stick out a little – those can be read.
  function bookshelf(ctx, x) {
    const cols = ['#4a78c8', '#3cb371', '#c084fc', '#e07a3a', '#ff8fc0', '#5aa84f', '#e04848', '#2bb3a3'];
    withLine(ctx, () => {
      box(ctx, x - 18, 68, 36, 82, 2, '#a0643c');
      ctx.fillStyle = '#7a4a25';
      for (let r = 0; r < 3; r++) ctx.fillRect(x - 15, 72 + r * 26, 30, 22);
      for (let r = 0; r < 3; r++) {
        const base = 94 + r * 26;
        let bx = x - 14;
        for (let i = 0; bx < x + 13; i++) {
          const w = 3 + ((i * 7 + r * 3) % 3);
          const h = 14 + ((i * 5 + r) % 6);
          if (bx + w > x + 14) break;
          let color = cols[(i * 3 + r * 5) % cols.length];
          let out = 0;
          if (r === 1 && i === 1) { color = '#2f6fb8'; out = 2; }     // Egypt
          if (r === 1 && i === 4) { color = '#d62828'; out = 2; }     // spider heroes
          ctx.fillStyle = color;
          ctx.fillRect(bx, base - h - out, w, h);
          ctx.strokeRect(bx, base - h - out, w, h);
          if (out) {
            ctx.fillStyle = color === '#2f6fb8' ? '#ffd23f' : '#2b4fa8';
            ctx.fillRect(bx + 0.6, base - h - out + 3, w - 1.2, 1.4);
          }
          bx += w;
        }
      }
    });
  }

  function plant(ctx, x) {
    withLine(ctx, () => {
      ctx.fillStyle = '#4caf50';
      for (const [dx, dy, r] of [[-6, -26, 0.5], [6, -27, -0.5], [0, -32, 0], [-8, -18, 0.9], [8, -19, -0.9]]) {
        ctx.beginPath(); ctx.ellipse(x + dx, 150 + dy, 3.5, 8, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      box(ctx, x - 7, 136, 14, 14, 2, '#c96b3c');
    });
  }

  function floorLamp(ctx, x) {
    withLine(ctx, () => {
      ctx.beginPath(); ctx.moveTo(x, 148); ctx.lineTo(x, 92); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, 148.5, 7, 1.8, 0, 0, Math.PI * 2); ctx.fillStyle = '#6e4226'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 6, 80); ctx.lineTo(x + 6, 80); ctx.lineTo(x + 9, 93); ctx.lineTo(x - 9, 93); ctx.closePath();
      ctx.fillStyle = '#ffe08a'; ctx.fill(); ctx.stroke();
    });
  }

  function framedPicture(ctx, x) {
    withLine(ctx, () => {
      box(ctx, x - 13, 46, 26, 20, 1.5, '#c98a55');
      box(ctx, x - 10, 49, 20, 14, 1, '#bfe6ff');
      ctx.fillStyle = '#7cc56b';
      ctx.beginPath(); ctx.moveTo(x - 10, 63); ctx.lineTo(x - 3, 54); ctx.lineTo(x + 2, 59); ctx.lineTo(x + 6, 55); ctx.lineTo(x + 10, 63); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x + 6, 52, 1.6, 0, Math.PI * 2); ctx.fill();
    });
  }

  // Height of the feet on the stairs (the character steps down one step at a time)
  function stairY(x) {
    const { topX, bottomX, steps } = STAIRS;
    if (x <= topX) return FLOOR_UP;
    if (x >= bottomX) return FLOOR_DOWN;
    const i = Math.floor((x - topX) / ((bottomX - topX) / steps));
    return FLOOR_UP + i * (FLOOR_DOWN - FLOOR_UP) / steps;
  }

  // The hole in the upstairs floor where the stairs go down
  function stairHole(ctx) {
    ctx.fillStyle = '#4a3426';
    ctx.fillRect(STAIRS.topX, FLOOR_UP, 62, DOWN_Y - FLOOR_UP + 6);
  }

  function staircase(ctx) {
    const x0 = STAIRS.topX, x1 = STAIRS.bottomX, n = STAIRS.steps;
    const y0 = FLOOR_UP, y1 = FLOOR_DOWN;
    const sx = (x1 - x0) / n, sy = (y1 - y0) / n;
    withLine(ctx, () => {
      // steps + side board
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let i = 0; i < n; i++) {
        ctx.lineTo(x0 + (i + 1) * sx, y0 + i * sy);
        ctx.lineTo(x0 + (i + 1) * sx, y0 + (i + 1) * sy);
      }
      ctx.lineTo(x1 - 12, y1);
      ctx.lineTo(x0, y0 + 18);
      ctx.closePath();
      ctx.fillStyle = '#c98a55';
      ctx.fill();
      ctx.stroke();
      // hand rail with posts
      ctx.lineWidth = 0.8;
      for (let i = 0; i < n; i += 2) {
        const px = x0 + (i + 0.5) * sx;
        const ty = y0 + i * sy;
        ctx.beginPath(); ctx.moveTo(px, ty); ctx.lineTo(px, ty - 22); ctx.stroke();
      }
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = MP.COLORS.woodDark;
      ctx.beginPath(); ctx.moveTo(x0 - 4, y0 - 26); ctx.lineTo(x1, y1 - 24); ctx.stroke();
    });
  }

  // Little sign that shows where the stairs go. dir: 1 = down, -1 = up
  function stairSign(ctx, x, y, text, dir) {
    withLine(ctx, () => {
      box(ctx, x - 30, y, 60, 15, 4, '#fff7e0');
      ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y); ctx.stroke();
    });
    MP.drawText(ctx, text, x - 6, y + 4, { size: 0.72, color: MP.COLORS.outline, align: 'center' });
    ctx.save();
    ctx.translate(x + 22, y + 7.5 + dir * 4);
    if (dir < 0) ctx.rotate(Math.PI);
    ctx.scale(0.55, 0.55);
    MP.draw('arrow', ctx, 0, 0);
    ctx.restore();
  }

  // Railing around the stairwell upstairs
  function landingRailing(ctx) {
    withLine(ctx, () => {
      ctx.lineWidth = 0.8;
      for (let x = STAIRS.topX + 2; x <= STAIRS.topX + 62; x += 8) {
        ctx.beginPath(); ctx.moveTo(x, FLOOR_UP); ctx.lineTo(x, FLOOR_UP - 22); ctx.stroke();
      }
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = MP.COLORS.woodDark;
      ctx.beginPath(); ctx.moveTo(STAIRS.topX - 2, FLOOR_UP - 24); ctx.lineTo(STAIRS.topX + 64, FLOOR_UP - 24); ctx.stroke();
    });
  }

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.home = {
    enter(params) {
      params = params || {};
      const waking = params.quest === 'wake';
      if (waking || !MP.state.tasks) {
        MP.state.tasks = { toilet: false, brush: false, dress: false, breakfast: false, shoes: false };
        MP.state.tv = { time: 0, locked: false, lockedBy: null };
      }

      this.player = this.player || new MP.Player(START_X);
      this.floor = this.floor || 0;
      if (waking) {
        this.setFloor(0);
        this.player.place(START_X, 1);
      } else if (params.done) {
        // Back from brushing / the wardrobe / breakfast: that task is done
        MP.state.tasks[params.done] = true;
        const task = TASKS.find((k) => k.id === params.done);
        if (task) {
          const spot = SPOTS[task.spot];
          this.setFloor(floorOf(spot));
          this.player.place(spot.standX, 1);
        }
      } else {
        this.setFloor(this.floor);
      }

      // Waking up: sleeping until the alarm clock is tapped
      this.intro = waking ? { awake: false, t: 0, sleepT: 0, yawned: false, nextRing: MP.time + 0.6 } : null;
      this.introHead = { x: START_X, y: 100 };
      this.tiredUntil = 0;

      this.stairs = null;         // walking on the stairs: { dir, x }
      this.parent = null;         // mom or dad visiting
      this.parentBubble = null;
      this.tvOn = false;
      this.tvView = false;        // the big TV picture is open
      this.showT = 0;             // how long the cartoon has been running
      this.lastShowT = 0;
      this.sitting = false;       // sitting on the sofa

      this.camX = this.cameraTargetX();
      this.camY = this.cameraTargetY();
      this.bubble = null;
      this.panel = null;          // the "Jatkuu pian…" panel
      this.visit = null;          // toilet visit or putting shoes on: { id, t }
      this.doorOpen = false;
      this.busy = false;          // true while leaving for another scene
      this.toys = { teddy: 0, panda: 0 };
      this.notes = [];
      if (!this.intro) this.sayProgress(0.5);
    },

    setFloor(f) {
      this.floor = f;
      this.player.minX = 12;
      this.player.maxX = f === 0 ? UP_MAX_X : WORLD_W - 12;
      this.playerY = f === 0 ? FLOOR_UP : FLOOR_DOWN;
    },

    cameraTargetX() {
      return MP.clamp(this.player.x - MP.W / 2, 0, WORLD_W - MP.W);
    },

    cameraTargetY() {
      return MP.clamp(this.playerY - FLOOR_UP, 0, DOWN_Y);
    },

    say(text, seconds, delay) {
      this.bubble = { text, from: MP.time + (delay || 0), until: MP.time + (delay || 0) + (seconds || 4.5) };
    },

    // ---- The morning tasks ----
    missing() {
      return TASKS.filter((k) => !MP.state.tasks[k.id]);
    },

    allDone() {
      return this.missing().length === 0;
    },

    sayProgress(delay, before) {
      const done = TASKS.length - this.missing().length;
      let text;
      if (this.allDone()) text = 'Kaikki aamutoimet tehty! Nyt lähdetään ulos!';
      else if (done === 0) text = 'Huomenta! Mitä tehdään ensin?';
      else text = 'Hienoa! Mitä seuraavaksi?';
      this.say((before ? before + ' ' : '') + text, 4.5, delay);
    },

    // ---- Waking up ----
    wakeUp(byParent) {
      this.intro.awake = true;
      this.intro.t = 0;
      if (!byParent) MP.sfx.tap();
      // If mom or dad was on the way, they turn back
      if (this.parent && this.parent.state === 'enter') this.parent.state = 'leave';
    },

    finishIntro(skipped) {
      this.intro = null;
      this.player.place(START_X, 1);
      this.tiredUntil = MP.time + (skipped ? 1.5 : 3.2);
      if (!skipped) MP.sfx.tap();
      this.sayProgress(skipped ? 0.2 : 0.9);
    },

    // Draws the character in bed: sleeping, sitting up, yawning, hopping out.
    // Called in world coordinates, right after the bed.
    drawIntro(ctx) {
      const intro = this.intro;
      const t = intro.awake ? intro.t : -1;   // -1 = still sleeping
      const S = IN_BED_SCALE;
      const hipX = POS.bed + 5.6, hipY = 132;   // the body turns around the hips

      const blanket = () => {
        withLine(ctx, () => {
          box(ctx, POS.bed - 7, 126, 30, 16, 4, MP.COLORS.blanket);
          ctx.fillStyle = MP.COLORS.blanketDots;
          for (let xx = POS.bed - 3; xx < POS.bed + 22; xx += 5) {
            ctx.beginPath(); ctx.arc(xx, 131, 0.9, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(xx + 2.5, 136.5, 0.9, 0, Math.PI * 2); ctx.fill();
          }
        });
      };

      if (t < WAKE.hop) {
        // Lying down → sitting up (smooth turn from -90° to 0°)
        const u = MP.clamp((t - WAKE.sitUp) / (WAKE.sitDone - WAKE.sitUp), 0, 1);
        const angle = -Math.PI / 2 * (1 - u * u * (3 - 2 * u));
        let eyes = t < WAKE.sitUp ? 'closed' : 'sleepy';
        let mouth = 'flat';
        let armUp = 0;
        if (t >= WAKE.yawnStart && t < WAKE.yawnEnd) {
          const k = Math.sin(MP.clamp((t - WAKE.yawnStart) / (WAKE.yawnEnd - WAKE.yawnStart), 0, 1) * Math.PI);
          armUp = k;
          eyes = 'closed';
          mouth = k > 0.3 ? 'yawn' : 'flat';
        }
        ctx.save();
        ctx.translate(hipX, hipY);
        ctx.rotate(angle);
        MP.drawPerson(ctx, 0, 12 * S, { scale: S, eyes, mouth, armUp });
        ctx.restore();
        blanket();

        const d = 29 * S; // from the hips to just above the head
        this.introHead = { x: hipX + d * Math.sin(angle), y: hipY - d * Math.cos(angle) };

        // Floating "z z z" while sleeping
        if (!intro.awake) {
          for (let i = 0; i < 3; i++) {
            const p = (MP.time * 0.7 + i / 3) % 1;
            ctx.save();
            ctx.globalAlpha = 1 - p;
            MP.drawText(ctx, 'z', POS.bed - 8 + p * 12, 116 - p * 22, {
              size: 0.7 + p * 0.6, color: '#4a78c8', outline: '#ffffff',
            });
            ctx.restore();
          }
        }
      } else {
        // Hop out of bed onto the floor
        const u = MP.clamp((t - WAKE.hop) / (WAKE.land - WAKE.hop), 0, 1);
        blanket();
        const x = MP.lerp(hipX, START_X, u);
        const y = MP.lerp(hipY + 12 * S, FLOOR, u) - Math.sin(u * Math.PI) * 12;
        const sc = MP.lerp(S, 1, u);
        MP.drawPerson(ctx, x, y, { scale: sc, eyes: 'sleepy', mouth: 'flat', walking: true, walkTime: t });
        this.introHead = { x, y: y - 44 * sc };
      }
    },

    // ---- Mom or dad ----
    // opts: { who, floorY, fromX, standX, say, talkFor, onTalk, onGone }
    callParent(opts) {
      this.parent = Object.assign({
        who: Math.random() < 0.5 ? 'mom' : 'dad',
        state: 'enter', t: 0, walkTime: 0, acted: false, talkFor: 2.2,
      }, opts);
      this.parent.x = this.parent.fromX;
      this.parent.facing = this.parent.standX < this.parent.fromX ? -1 : 1;
      if (typeof this.parent.say === 'function') this.parent.say = this.parent.say(this.parent.who);
    },

    updateParent(dt) {
      const p = this.parent;
      if (!p) return;
      p.walkTime += dt;
      if (p.state === 'enter') {
        const d = p.standX - p.x;
        p.facing = d < 0 ? -1 : 1;
        p.x += Math.sign(d) * Math.min(Math.abs(d), PARENT_SPEED * dt);
        if (Math.abs(p.standX - p.x) < 0.5) {
          p.state = 'talk';
          p.t = 0;
          this.parentBubble = { text: p.say, until: MP.time + p.talkFor };
        }
      } else if (p.state === 'talk') {
        p.t += dt;
        if (p.t >= 0.9 && !p.acted) {
          p.acted = true;
          if (p.onTalk) p.onTalk();
        }
        if (p.t >= p.talkFor) p.state = 'leave';
      } else {
        const d = p.fromX - p.x;
        p.facing = d < 0 ? -1 : 1;
        p.x += Math.sign(d) * Math.min(Math.abs(d), PARENT_SPEED * dt);
        if (Math.abs(d) < 0.5) {
          this.parent = null;
          if (p.onGone) p.onGone();
        }
      }
    },

    // ---- Stairs ----
    startStairs() {
      const down = this.floor === 0;
      this.stairs = { dir: down ? 1 : -1, x: this.player.x };
      this.bubble = null;
    },

    updateStairs(dt) {
      const s = this.stairs;
      s.x += s.dir * STAIR_SPEED * dt;
      this.player.walkTime += dt;
      this.player.walking = true;
      this.player.facing = s.dir;
      const endX = s.dir > 0 ? SPOTS.stairsDown.standX : SPOTS.stairsUp.standX;
      if ((s.dir > 0 && s.x >= endX) || (s.dir < 0 && s.x <= endX)) {
        this.stairs = null;
        this.setFloor(s.dir > 0 ? 1 : 0);
        this.player.place(endX, s.dir);
        return;
      }
      this.player.x = s.x;
      this.playerY = stairY(s.x);
    },

    // ---- TV ----
    startTv() {
      if (MP.state.tv.locked) {
        const who = MP.PARENTS[MP.state.tv.lockedBy] || MP.PARENTS.mom;
        this.say(who.name + ' sanoi, että TV on nyt kiinni.', 3);
        return;
      }
      this.player.place(POS.sofa, 1);
      this.sitting = true;
      this.tvOn = true;
      this.tvView = true;
      this.tvViewFrom = MP.time;
      this.bubble = null;
      MP.sfx.tap();
    },

    closeTv() {
      this.tvOn = false;
      this.tvView = false;
      this.sitting = false;
      MP.sfx.tvOff();
      this.say('TV kiinni!', 1.8);
    },

    // Plays the funny sounds of the cartoon
    tvSounds(prev, now) {
      if (MP.tvGag(prev) !== MP.tvGag(now)) MP.sfx.boing();
      const gag = MP.tvGag(now), a = MP.tvGagTime(prev), b = MP.tvGagTime(now);
      if (b < a) return;
      if (gag === 1 && Math.floor(a * 4 / Math.PI) !== Math.floor(b * 4 / Math.PI)) MP.sfx.quack();
      if (gag === 2 && a < 2.5 && b >= 2.5) MP.sfx.boing();
      if (gag === 2 && a < 3.5 && b >= 3.5) MP.sfx.nom();
      if (gag === 0 && a < 4.5 && b >= 4.5) MP.sfx.yawn();
    },

    // Too much TV: mom or dad comes and switches it off for the rest of the morning
    tvTimeUp() {
      this.tvView = false;
      this.callParent({
        floorY: FLOOR_DOWN, fromX: 345, standX: POS.tv + 36, talkFor: 2.8,
        say: 'Nyt riittää telkkari! Laitetaan TV kiinni.',
        onTalk: () => {
          this.tvOn = false;
          this.sitting = false;
          MP.sfx.tvOff();
          MP.state.tv.locked = true;
          MP.state.tv.lockedBy = this.parent.who;
        },
        onGone: () => this.sayProgress(0.2, 'Höh.'),
      });
    },

    // ---- Shoes are only for going out ----
    shoesInside() {
      if (!MP.state.outfit.shoes) return false;
      return this.floor === 0 || this.player.x < HALLWAY_X;
    },

    shoesNotAllowed() {
      this.player.stop();
      const x = this.player.x;
      const maxX = this.floor === 0 ? UP_MAX_X : WORLD_W - 10;
      const fromLeft = x > 200;
      const fromX = fromLeft ? Math.max(10, x - 170) : Math.min(maxX, x + 170);
      this.callParent({
        floorY: this.floor === 0 ? FLOOR_UP : FLOOR_DOWN,
        fromX, standX: fromLeft ? x - 24 : x + 24, talkFor: 2.6,
        say: 'Hei! Sisällä ei kävellä kengillä! Kengät pois.',
        onTalk: () => {
          MP.state.outfit.shoes = false;
          MP.state.tasks.shoes = false;
          MP.save();
          MP.sfx.tap();
        },
        onGone: () => this.say('Ai niin! Kengät laitetaan vasta, kun lähdetään.', 3.5),
      });
    },

    // ---- Using things ----
    // Called when the character has walked to a thing
    use(id) {
      if (id === 'stairsUp' || id === 'stairsDown') {
        this.startStairs();
        return;
      }
      if (id === 'tv' || id === 'sofa') {
        this.startTv();
        return;
      }
      if (id === 'books') {
        this.leave(MP.scenes.books);
        return;
      }
      if (id === 'door') {
        if (this.allDone()) {
          // Everything done: out we go!
          this.doorOpen = true;
          MP.sfx.bling();
          this.leave(MP.scenes.street);
        } else {
          const left = this.missing().map((k) => k.name).join(', ');
          this.say('Aamutoimet on vielä kesken! Vielä: ' + left + '.', 5);
        }
        return;
      }
      const task = TASKS.find((k) => k.spot === id);
      // The toilet and the wardrobe can be used again any time
      const again = id === 'toilet' || id === 'wardrobe';
      if (MP.state.tasks[task.id] && !again) {
        this.say(ALREADY[id], 2.5);
        return;
      }
      if (task.id === 'shoes' && !MP.state.tasks.dress) {
        this.say('Ensin vaatteet päälle, sitten kengät!', 3);
        return;
      }
      if (id === 'toilet') {
        this.visit = { id: 'toilet', t: 0, flushed: false };
        this.bubble = null;
      } else if (id === 'shoes') {
        this.visit = { id: 'shoes', t: 0 };
        this.say('Kengät jalkaan!', 1.4);
      } else if (id === 'sink') {
        this.leave(MP.scenes.brush);
      } else if (id === 'wardrobe') {
        this.leave(MP.scenes.wardrobe);
      } else if (id === 'table') {
        this.leave(MP.scenes.breakfast);
      }
    },

    leave(scene) {
      if (this.busy) return;
      this.busy = true;
      this.player.stop();
      MP.goTo(scene);
    },

    onTap(x, y) {
      if (this.busy || this.visit || this.stairs) return;

      // Watching TV: only the remote control's red button works
      if (this.tvView) {
        if (Math.hypot(x - POWER.x, y - POWER.y) < POWER.r + 5) this.closeTv();
        return;
      }
      // Mom or dad is switching the TV off: wait
      if (this.parent && !this.intro) return;

      const wx = x + this.camX;
      const wy = y + this.camY;

      // Waking up: tap the alarm clock. Tapping during the wake-up skips it.
      if (this.intro) {
        if (!this.intro.awake) {
          if (MP.hit(SPOTS.alarm, wx, wy)) this.wakeUp();
        } else {
          this.finishIntro(true);
        }
        return;
      }

      // The "Jatkuu pian…" panel: tap closes it
      if (this.panel) {
        if (MP.time - this.panel.from > 0.5) {
          this.panel = null;
          this.doorOpen = false;
        }
        return;
      }

      if (this.floor === 0) {
        // Toys: jump and say boing (no walking)
        for (const toy of ['teddy', 'panda']) {
          if (MP.hit(SPOTS[toy], wx, wy)) {
            this.toys[toy] = MP.time;
            MP.sfx.boing();
            return;
          }
        }
        // Band poster: plays a tune
        if (MP.hit(SPOTS.poster, wx, wy)) {
          MP.sfx.tune();
          for (let i = 0; i < 5; i++) {
            this.notes.push({ x: POS.poster + 8 + i * 5, y: 60, born: MP.time + i * 0.14, drift: (i % 2 ? 1 : -1) });
          }
          return;
        }
      }

      // Things on this floor: walk there, then use it
      for (const id of ['toilet', 'sink', 'wardrobe', 'stairsUp', 'books', 'tv', 'sofa', 'table', 'shoes', 'stairsDown', 'door']) {
        const spot = SPOTS[id];
        if (floorOf(spot) === this.floor && MP.hit(spot, wx, wy)) {
          MP.sfx.tap();
          this.player.walkTo(spot.standX, () => this.use(id));
          return;
        }
      }
      // Anywhere else: just walk there
      this.player.walkTo(wx);
    },

    update(dt) {
      this.updateParent(dt);

      // --- Waking up ---
      if (this.intro) {
        const intro = this.intro;
        if (!intro.awake) {
          intro.sleepT += dt;
          if (intro.sleepT >= PARENT_AFTER && !this.parent) {
            this.callParent({
              floorY: FLOOR_UP, fromX: 345, standX: 124,
              say: (who) => MP.PARENTS[who].say,
              onTalk: () => { if (this.intro && !this.intro.awake) this.wakeUp(true); },
            });
          }
          if (MP.time >= intro.nextRing) {
            MP.sfx.alarm();
            intro.nextRing = MP.time + ALARM_EVERY;
          }
          return;
        }
        intro.t += dt;
        if (intro.t >= WAKE.yawnStart && !intro.yawned) {
          intro.yawned = true;
          MP.sfx.yawn();
          this.say('Hoh-hoijaa…', WAKE.yawnEnd - WAKE.yawnStart);
        }
        if (intro.t >= WAKE.land) this.finishIntro(false);
        return;
      }

      // --- TV running ---
      if (this.tvOn) {
        const prev = this.showT;
        this.showT += dt;
        this.tvSounds(prev, this.showT);
        MP.state.tv.time += dt;
        if (MP.state.tv.time >= TV_MAX && !this.parent && !MP.state.tv.locked) this.tvTimeUp();
      }

      // --- Toilet visit or putting shoes on ---
      if (this.visit) {
        const v = this.visit;
        v.t += dt;
        if (v.id === 'toilet') {
          if (v.t >= 0.3 && !v.hummed) { v.hummed = true; this.say('La la laa…', 1.6); }
          if (v.t >= 2.0 && !v.flushed) {
            v.flushed = true;
            MP.sfx.flush();
            this.say('Huuuuh!', 0.9);
          }
          if (v.t >= 3.0) {
            this.visit = null;
            MP.state.tasks.toilet = true;
            this.player.place(SPOTS.toilet.standX, 1);
            this.sayProgress(0, 'Kädet pesty!');
          }
        } else {
          if (v.t >= 0.4 && !v.tap1) { v.tap1 = true; MP.sfx.tap(); }
          if (v.t >= 0.9 && !v.tap2) { v.tap2 = true; MP.sfx.tap(); }
          if (v.t >= 1.3) {
            this.visit = null;
            MP.state.tasks.shoes = true;
            MP.state.outfit.shoes = true;
            MP.save();
            this.sayProgress(0);
          }
        }
      } else if (this.stairs) {
        this.updateStairs(dt);
      } else if (!this.sitting) {
        this.player.update(dt);
      }

      // Shoes on inside the house? Mom or dad comes to say it's not allowed
      if (this.shoesInside() && !this.parent && !this.stairs && !this.visit && !this.busy) {
        this.shoesNotAllowed();
      }

      // Smooth camera that stops at the ends of the house and follows up and down
      const k = Math.min(1, dt * 5);
      this.camX += (this.cameraTargetX() - this.camX) * k;
      this.camY += (this.cameraTargetY() - this.camY) * k;

      this.notes = this.notes.filter((n) => MP.time - n.born < 1.6);
    },

    draw(ctx) {
      const cam = this.camX, camY = this.camY;
      const t = MP.time;

      ctx.save();
      ctx.translate(-cam, -camY);

      // ===== Walls and floors =====
      // Upstairs: child's room, bathroom, landing
      dottedWall(ctx, 0, '#fbe3c8', 'rgba(230,170,130,0.35)');
      woodFloor(ctx, 0, 320);
      tiledWall(ctx, 320);
      tileFloor(ctx, 320, 320, '#cfd8dc', '#b8c4c9');
      dottedWall(ctx, 640, '#e3ecf7', 'rgba(120,150,200,0.25)');
      woodFloor(ctx, 640, 320);
      // Downstairs: living room, kitchen, hallway
      ctx.save();
      ctx.translate(0, DOWN_Y);
      stripedWall(ctx, 0);
      woodFloor(ctx, 0, 320);
      kitchenWall(ctx, 320);
      tileFloor(ctx, 320, 320, '#e9d3a8', '#d8bd8a');
      stripedWall(ctx, 640);
      woodFloor(ctx, 640, 320);
      ctx.restore();

      // Ceilings and skirting boards (behind the furniture)
      for (const y0 of [0, DOWN_Y]) {
        ctx.fillStyle = '#6e4226';
        ctx.fillRect(0, y0, WORLD_W, 5);
        ctx.strokeStyle = 'rgba(43,35,64,0.5)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, y0 + FLOOR); ctx.lineTo(WORLD_W, y0 + FLOOR); ctx.stroke();
      }
      ctx.fillStyle = '#e8c9a0'; ctx.fillRect(0, FLOOR - 3, 320, 3);
      ctx.fillStyle = '#b8d3dc'; ctx.fillRect(320, FLOOR - 3, 320, 3);
      ctx.fillStyle = '#cfdcec'; ctx.fillRect(640, FLOOR - 3, 320, 3);
      ctx.fillStyle = '#c9d6b5'; ctx.fillRect(0, DOWN_Y + FLOOR - 3, 320, 3);
      ctx.fillStyle = '#efd9a8'; ctx.fillRect(320, DOWN_Y + FLOOR - 3, 320, 3);
      ctx.fillStyle = '#c9d6b5'; ctx.fillRect(640, DOWN_Y + FLOOR - 3, 320, 3);
      stairHole(ctx);

      // ===== Upstairs: child's room =====
      rug(ctx, POS.rug);
      MP.draw('window', ctx, POS.window - 15, 34, { t });
      MP.draw('poster', ctx, POS.poster, 38);
      MP.draw('wardrobe', ctx, POS.wardrobe, FLOOR);
      MP.draw('nightstand', ctx, POS.nightstand, FLOOR);
      MP.draw('alarmClock', ctx, POS.nightstand, FLOOR - 19.5, {
        ringing: !!(this.intro && !this.intro.awake), t,
      });
      MP.draw('bed', ctx, POS.bed, FLOOR);
      if (this.intro) this.drawIntro(ctx);
      for (const toy of ['teddy', 'panda']) {
        const u = (t - this.toys[toy]) / 0.45;
        const hop = u >= 0 && u < 1 ? -Math.sin(u * Math.PI) * 7 : 0;
        MP.draw(toy, ctx, POS[toy], FLOOR + hop);
      }
      MP.draw('ball', ctx, POS.ball, FLOOR, { r: 4 });

      // ===== Upstairs: bathroom =====
      MP.draw('toilet', ctx, POS.toilet, FLOOR);
      MP.draw('mirror', ctx, POS.mirror, 98);
      MP.draw('sink', ctx, POS.sink, FLOOR);
      towel(ctx, POS.towel);

      // On the toilet (pyjamas stay on): the girl sits, the boy stands with his back to us
      const onToilet = !!(this.visit && this.visit.id === 'toilet' && this.visit.t > 0.15);
      if (onToilet) {
        if (MP.state.character === 'boy') {
          MP.drawPerson(ctx, POS.toilet + 4, FLOOR, { back: true });
        } else {
          MP.drawPerson(ctx, POS.toilet + 4, FLOOR - 3, { sit: true, eyes: this.visit.t < 2 ? 'closed' : 'open' });
        }
      }

      // ===== Upstairs: landing =====
      framedPicture(ctx, POS.landingPicture);
      plant(ctx, POS.landingPlant);

      // ===== Downstairs =====
      ctx.save();
      ctx.translate(0, DOWN_Y);
      // living room
      MP.draw('window', ctx, POS.livingWindow - 15, 36, { t });
      plant(ctx, POS.plant);
      rug(ctx, POS.sofa + 40);
      sofa(ctx, POS.sofa);
      floorLamp(ctx, POS.lamp);
      tvSet(ctx, POS.tv, this.tvOn, this.showT);
      bookshelf(ctx, POS.bookshelf);
      // kitchen
      fridge(ctx, POS.fridge);
      counter(ctx, POS.counter);
      wallClock(ctx, POS.clock, 40, t);
      MP.draw('window', ctx, POS.kitchenWindow, 36, { t });
      kitchenTable(ctx, POS.table);
      // hallway
      coatHooks(ctx, POS.hooks);
      MP.draw('shoeRack', ctx, POS.shoeRack, FLOOR, { taken: MP.state.tasks.shoes });
      doormat(ctx, POS.door);
      MP.draw('door', ctx, POS.door, FLOOR, { open: this.doorOpen });
      ctx.restore();

      // ===== Stairs and walls between rooms =====
      staircase(ctx);
      landingRailing(ctx);
      stairSign(ctx, 800, 66, 'Alakertaan', 1);
      stairSign(ctx, 670, DOWN_Y + 52, 'Yläkertaan', -1);
      for (const x of [320, 640]) {
        partition(ctx, x);
        ctx.save();
        ctx.translate(0, DOWN_Y);
        partition(ctx, x);
        ctx.restore();
      }

      // Music notes from the poster
      for (const n of this.notes) {
        const age = t - n.born;
        if (age < 0) continue;
        note(ctx, n.x + Math.sin(age * 5) * 3 * n.drift, n.y - age * 22, MP.clamp(1 - age / 1.6, 0, 1));
      }

      // Mom or dad
      const par = this.parent;
      if (par) {
        const look = MP.PARENTS[par.who];
        MP.drawPerson(ctx, par.x, par.floorY, {
          character: look.character, outfit: look.outfit, hair: look.hair, scale: look.scale,
          noBow: look.noBow, glasses: look.glasses,
          walking: par.state !== 'talk', walkTime: par.walkTime, flip: par.facing < 0,
        });
      }

      // Bouncing arrows over the things still to do (on this floor),
      // or over the stairs when everything left is on the other floor
      let spots = [];
      if (this.intro) {
        if (!this.intro.awake) spots = [SPOTS.alarm];
      } else if (!this.panel && !this.visit && !this.stairs && !this.tvView && !this.parent) {
        const wanted = this.allDone() ? [SPOTS.door] : this.missing().map((k) => SPOTS[k.spot]);
        spots = wanted.filter((s) => floorOf(s) === this.floor);
        if (!spots.length && wanted.length) spots = [this.floor === 0 ? SPOTS.stairsUp : SPOTS.stairsDown];
      }
      const arrowX = (s) => (s.arrowX != null ? s.arrowX : s.x + s.w / 2);
      const arrowY = (s) => (s.arrowY != null ? s.arrowY : s.y - 3);
      for (const s of spots) MP.draw('arrow', ctx, arrowX(s), arrowY(s) + Math.sin(t * 6) * 2.5);

      ctx.restore();

      // If none of them is on the screen, an arrow at the edge shows the way to the nearest one
      if (spots.length) {
        const xs = spots.map((s) => arrowX(s) - cam);
        if (!xs.some((sx) => sx > 4 && sx < MP.W - 4)) {
          const nearest = xs.reduce((a, b) => (Math.abs(b - MP.W / 2) < Math.abs(a - MP.W / 2) ? b : a));
          const dir = nearest > MP.W / 2 ? 1 : -1;
          const nudge = Math.sin(t * 6) * 2.5 * dir;
          ctx.save();
          ctx.translate(dir > 0 ? MP.W - 6 + nudge : 6 + nudge, 112);
          ctx.rotate(-dir * Math.PI / 2);
          MP.draw('arrow', ctx, 0, 0);
          ctx.restore();
        }
      }

      // ===== The character =====
      const px = this.player.x - cam;
      const py = this.playerY - camY;
      if (!this.intro && !onToilet) {
        let extra = null;
        if (t < this.tiredUntil) {
          const blink = (t % 1.3) < 0.18;
          extra = { eyes: blink ? 'closed' : 'sleepy', mouth: 'flat' };
        }
        if (this.sitting) {
          MP.drawPerson(ctx, px, py - 8.5, { sit: true, mouth: this.tvOn ? 'yawn' : 'smile' });
        } else if (this.visit && this.visit.id === 'shoes') {
          // little hops while pulling the shoes on
          const hop = -Math.abs(Math.sin(this.visit.t * 8)) * 2;
          MP.drawPerson(ctx, px, py + hop, {});
        } else {
          MP.drawPerson(ctx, px, py, Object.assign({
            walking: this.player.walking, walkTime: this.player.walkTime, flip: this.player.facing < 0,
          }, extra));
        }
      }

      // ===== Checklist of the morning tasks (top-left corner) =====
      if (!this.intro && !this.tvView) {
        const n = TASKS.length;
        ctx.save();
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = MP.COLORS.outline;
        ctx.fillStyle = 'rgba(255,250,235,0.92)';
        MP.roundRect(ctx, 3, 8, n * 19 + 5, 21, 5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        TASKS.forEach((k, i) => {
          const cx = 3 + 12 + i * 19, cy = 18.5;
          const done = MP.state.tasks[k.id];
          ctx.save();
          if (done) ctx.globalAlpha = 0.45;
          taskIcon(ctx, k.id, cx, cy);
          ctx.restore();
          if (done) {
            ctx.save();
            ctx.strokeStyle = '#2e9e4f';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(cx - 4, cy); ctx.lineTo(cx - 1, cy + 3.5); ctx.lineTo(cx + 5, cy - 4.5); ctx.stroke();
            ctx.restore();
          }
        });
      }

      // ===== Speech bubbles =====
      const b = this.bubble;
      if (b && t >= b.from && t < b.until && !this.tvView) {
        let head = this.intro ? { x: this.introHead.x, y: this.introHead.y } : { x: this.player.x, y: this.playerY - 46 };
        if (onToilet) head = { x: POS.toilet + 4, y: FLOOR - 49 };
        if (this.sitting) head.y += 8;
        MP.drawBubble(ctx, b.text, head.x - cam, head.y - camY, { maxWidth: 130 });
      }
      if (par && this.parentBubble && t < this.parentBubble.until) {
        const look = MP.PARENTS[par.who];
        MP.drawBubble(ctx, this.parentBubble.text, par.x - cam,
          par.floorY - MP.PERSON_H * look.scale - 4 - camY, { maxWidth: 120 });
      }

      // ===== Watching TV: big TV with a frame, and the remote control =====
      if (this.tvView) {
        ctx.save();
        ctx.fillStyle = 'rgba(15,15,30,0.7)';
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.lineWidth = 1;
        ctx.strokeStyle = MP.COLORS.outline;
        ctx.fillStyle = '#2b2b33';
        MP.roundRect(ctx, TV_VIEW.x, TV_VIEW.y, TV_VIEW.w, TV_VIEW.h, 8);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3a3a46';
        MP.roundRect(ctx, TV_VIEW.x + 4, TV_VIEW.y + 4, TV_VIEW.w - 8, TV_VIEW.h - 8, 6);
        ctx.fill();
        ctx.restore();
        MP.drawTvShow(ctx, TV_SCREEN.x, TV_SCREEN.y, TV_SCREEN.w, TV_SCREEN.h, this.showT);
        ctx.save();
        ctx.fillStyle = '#4cd964';
        ctx.beginPath(); ctx.arc(TV_VIEW.x + TV_VIEW.w - 10, TV_VIEW.y + TV_VIEW.h - 6, 1.6, 0, Math.PI * 2); ctx.fill();
        // remote control
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = MP.COLORS.outline;
        ctx.fillStyle = '#4a4a58';
        MP.roundRect(ctx, REMOTE.x, REMOTE.y, REMOTE.w, REMOTE.h, 6);
        ctx.fill(); ctx.stroke();
        const pulse = 1 + Math.sin(t * 6) * 0.08;
        ctx.fillStyle = '#e04848';
        ctx.beginPath(); ctx.arc(POWER.x, POWER.y, POWER.r * pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(POWER.x, POWER.y, 3, -Math.PI * 0.3, Math.PI * 1.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(POWER.x, POWER.y - 4); ctx.lineTo(POWER.x, POWER.y - 0.5); ctx.stroke();
        ctx.fillStyle = '#c9d3e6';
        for (let r = 0; r < 3; r++) for (let cI = 0; cI < 2; cI++) {
          ctx.beginPath(); ctx.arc(REMOTE.x + 9 + cI * 10, REMOTE.y + 30 + r * 10, 2.4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        if (t - this.tvViewFrom < 4) {
          MP.drawText(ctx, 'Sulje TV punaisesta napista', MP.W / 2, 166, {
            size: 0.9, color: '#ffffff', outline: MP.COLORS.outline, align: 'center',
          });
        }
      }

      // ===== "Jatkuu pian…" panel =====
      if (this.panel) {
        const a = MP.clamp((t - this.panel.from) * 4, 0, 1);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(20,20,40,0.45)';
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#2b2340';
        ctx.fillStyle = '#fff7e0';
        MP.roundRect(ctx, 60, 45, 200, 90, 10);
        ctx.fill();
        ctx.stroke();
        MP.drawText(ctx, 'Jatkuu pian…', MP.W / 2, 60, { size: 2.2, color: '#e0559a', outline: '#2b2340', align: 'center' });
        MP.drawText(ctx, 'Seuraavaksi: katu ja risteys', MP.W / 2, 92, { size: 1, color: '#2b2340', align: 'center' });
        MP.drawText(ctx, '(napauta)', MP.W / 2, 112, { size: 0.8, color: '#6e4226', align: 'center' });
        ctx.restore();
      }
    },
  };
})();
