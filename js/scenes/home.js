// home.js – the side-scrolling home: bedroom → bathroom → kitchen → hallway.
// The house is 4 screens wide. Tap to walk; the camera follows the character.
//
// The morning: the alarm clock rings → tap it → wake up. Then the morning tasks
// (toilet, brushing teeth, getting dressed, breakfast, shoes) in ANY order.
// You can only go out of the front door when all of them are done.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const WORLD_W = 1280;  // 4 rooms × 320
  const FLOOR = 150;     // where feet stand
  const DOOR_TOP = 96;   // top of the openings between rooms

  // Where things are in the house (x = middle)
  const POS = {
    // bedroom 0–320
    nightstand: 30, window: 52, bed: 70, teddy: 126, panda: 140, ball: 172, poster: 200, rug: 150,
    // bathroom 320–640
    toilet: 385, sink: 480, mirror: 480, towel: 560,
    // kitchen 640–960
    fridge: 674, counter: 748, clock: 812, kitchenWindow: 836, table: 870,
    // hallway 960–1280
    wardrobe: 1060, hooks: 1140, shoeRack: 1158, door: 1225,
  };

  // Things you can tap. standX = where the character stands to use it.
  const SPOTS = {
    alarm:    { x: 16,   y: 104, w: 30, h: 30 },
    toilet:   { x: 370,  y: 112, w: 30, h: 42, standX: 404 },
    sink:     { x: 464,  y: 84,  w: 34, h: 70, standX: 461 },
    table:    { x: 836,  y: 108, w: 68, h: 46, standX: 870 },
    wardrobe: { x: 1040, y: 92,  w: 40, h: 62, standX: 1031 },
    shoes:    { x: 1140, y: 126, w: 36, h: 26, standX: 1160 },
    door:     { x: 1209, y: 100, w: 32, h: 54, standX: 1198 },
    teddy:    { x: 118,  y: 132, w: 15, h: 20 },
    panda:    { x: 133,  y: 131, w: 15, h: 21 },
    poster:   { x: 200,  y: 38,  w: 36, h: 46 },
  };

  // The morning tasks. Any order is fine, but all of them before going out.
  //   spot = the thing to tap, name = how it is said, icon = picture in the checklist
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

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.home = {
    enter(params) {
      params = params || {};
      const waking = params.quest === 'wake';
      if (waking || !MP.state.tasks) {
        MP.state.tasks = { toilet: false, brush: false, dress: false, breakfast: false, shoes: false };
      }

      this.player = this.player || new MP.Player(START_X, { minX: 12, maxX: WORLD_W - 12 });
      if (waking) {
        this.player.place(START_X, 1);
      } else if (params.done) {
        // Back from brushing / the wardrobe / breakfast: that task is done
        MP.state.tasks[params.done] = true;
        const task = TASKS.find((k) => k.id === params.done);
        if (task) this.player.place(SPOTS[task.spot].standX, 1);
      }

      // Waking up: sleeping until the alarm clock is tapped
      this.intro = waking ? { awake: false, t: 0, yawned: false, nextRing: MP.time + 0.6 } : null;
      this.introHead = { x: START_X, y: 100 };
      this.tiredUntil = 0;

      this.camX = this.cameraTarget();
      this.bubble = null;
      this.panel = null;          // the "Jatkuu pian…" panel
      this.visit = null;          // toilet visit or putting shoes on: { id, t }
      this.doorOpen = false;
      this.busy = false;          // true while leaving for another scene
      this.toys = { teddy: 0, panda: 0 };
      this.notes = [];
      if (!this.intro) this.sayProgress(0.5);
    },

    cameraTarget() {
      return MP.clamp(this.player.x - MP.W / 2, 0, WORLD_W - MP.W);
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
    wakeUp() {
      this.intro.awake = true;
      this.intro.t = 0;
      MP.sfx.tap();
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

    // ---- Using things ----
    // Called when the character has walked to a thing
    use(id) {
      if (id === 'door') {
        if (this.allDone()) {
          this.doorOpen = true;
          this.panel = { from: MP.time };
          MP.sfx.bling();
        } else {
          const left = this.missing().map((k) => k.name).join(', ');
          this.say('Aamutoimet on vielä kesken! Vielä: ' + left + '.', 5);
        }
        return;
      }
      const task = TASKS.find((k) => k.spot === id);
      if (MP.state.tasks[task.id]) {
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
      if (this.busy || this.visit) return;
      const wx = x + this.camX;

      // Waking up: tap the alarm clock. Tapping during the wake-up skips it.
      if (this.intro) {
        if (!this.intro.awake) {
          if (MP.hit(SPOTS.alarm, wx, y)) this.wakeUp();
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

      // Toys: jump and say boing (no walking)
      for (const toy of ['teddy', 'panda']) {
        if (MP.hit(SPOTS[toy], wx, y)) {
          this.toys[toy] = MP.time;
          MP.sfx.boing();
          return;
        }
      }
      // Band poster: plays a tune
      if (MP.hit(SPOTS.poster, wx, y)) {
        MP.sfx.tune();
        for (let i = 0; i < 5; i++) {
          this.notes.push({ x: POS.poster + 8 + i * 5, y: 60, born: MP.time + i * 0.14, drift: (i % 2 ? 1 : -1) });
        }
        return;
      }
      // Toilet, sink, wardrobe, table, shoes, door: walk there, then use it
      for (const id of ['toilet', 'sink', 'wardrobe', 'table', 'shoes', 'door']) {
        if (MP.hit(SPOTS[id], wx, y)) {
          MP.sfx.tap();
          this.player.walkTo(SPOTS[id].standX, () => this.use(id));
          return;
        }
      }
      // Anywhere else: just walk there
      this.player.walkTo(wx);
    },

    update(dt) {
      // --- Waking up ---
      if (this.intro) {
        const intro = this.intro;
        if (!intro.awake) {
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
        return;
      }

      this.player.update(dt);

      // Smooth camera that stops at the ends of the house
      const target = this.cameraTarget();
      this.camX += (target - this.camX) * Math.min(1, dt * 5);

      this.notes = this.notes.filter((n) => MP.time - n.born < 1.6);
    },

    draw(ctx) {
      const cam = this.camX;
      const t = MP.time;

      ctx.save();
      ctx.translate(-cam, 0);

      // --- Walls and floors of all four rooms ---
      dottedWall(ctx, 0, '#fbe3c8', 'rgba(230,170,130,0.35)');
      woodFloor(ctx, 0, 320);
      tiledWall(ctx, 320);
      tileFloor(ctx, 320, 320, '#cfd8dc', '#b8c4c9');
      kitchenWall(ctx, 640);
      tileFloor(ctx, 640, 320, '#e9d3a8', '#d8bd8a');
      stripedWall(ctx, 960);
      woodFloor(ctx, 960, 320);

      // Ceiling and skirting boards (drawn BEFORE the furniture, so they stay behind it)
      ctx.fillStyle = '#6e4226';
      ctx.fillRect(0, 0, WORLD_W, 5);
      ctx.fillStyle = '#e8c9a0'; ctx.fillRect(0, FLOOR - 3, 320, 3);
      ctx.fillStyle = '#b8d3dc'; ctx.fillRect(320, FLOOR - 3, 320, 3);
      ctx.fillStyle = '#efd9a8'; ctx.fillRect(640, FLOOR - 3, 320, 3);
      ctx.fillStyle = '#c9d6b5'; ctx.fillRect(960, FLOOR - 3, 320, 3);
      ctx.strokeStyle = 'rgba(43,35,64,0.5)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(WORLD_W, FLOOR); ctx.stroke();

      // --- Bedroom ---
      rug(ctx, POS.rug);
      MP.draw('window', ctx, POS.window - 15, 34, { t });
      MP.draw('poster', ctx, POS.poster, 38);
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

      // --- Bathroom ---
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

      // --- Kitchen ---
      fridge(ctx, POS.fridge);
      counter(ctx, POS.counter);
      wallClock(ctx, POS.clock, 40, t);
      MP.draw('window', ctx, POS.kitchenWindow, 36, { t });
      kitchenTable(ctx, POS.table);

      // --- Hallway ---
      MP.draw('wardrobe', ctx, POS.wardrobe, FLOOR);
      coatHooks(ctx, POS.hooks);
      MP.draw('shoeRack', ctx, POS.shoeRack, FLOOR, { taken: MP.state.tasks.shoes });
      doormat(ctx, POS.door);
      MP.draw('door', ctx, POS.door, FLOOR, { open: this.doorOpen });

      // Walls between the rooms
      partition(ctx, 320);
      partition(ctx, 640);
      partition(ctx, 960);

      // Music notes from the poster
      for (const n of this.notes) {
        const age = t - n.born;
        if (age < 0) continue;
        note(ctx, n.x + Math.sin(age * 5) * 3 * n.drift, n.y - age * 22, MP.clamp(1 - age / 1.6, 0, 1));
      }

      // Bouncing arrows over the things still to do (the door when all is done)
      let spots = [];
      if (this.intro) {
        if (!this.intro.awake) spots = [SPOTS.alarm];
      } else if (!this.panel && !this.visit) {
        spots = this.allDone() ? [SPOTS.door] : this.missing().map((k) => SPOTS[k.spot]);
      }
      for (const s of spots) MP.draw('arrow', ctx, s.x + s.w / 2, s.y - 3 + Math.sin(t * 6) * 2.5);

      ctx.restore();

      // If none of them is on the screen, an arrow at the edge shows the way to the nearest one
      if (spots.length) {
        const xs = spots.map((s) => s.x + s.w / 2 - cam);
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

      // --- The character (still a bit tired right after waking up) ---
      if (!this.intro && !onToilet) {
        let extra = null;
        if (t < this.tiredUntil) {
          const blink = (t % 1.3) < 0.18;
          extra = { eyes: blink ? 'closed' : 'sleepy', mouth: 'flat' };
        }
        if (this.visit && this.visit.id === 'shoes') {
          // little hops while pulling the shoes on
          const hop = -Math.abs(Math.sin(this.visit.t * 8)) * 2;
          MP.drawPerson(ctx, this.player.x - cam, FLOOR + hop, {});
        } else {
          this.player.draw(ctx, FLOOR, cam, extra);
        }
      }

      // --- Checklist of the morning tasks (top-left corner) ---
      if (!this.intro) {
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

      // --- Speech bubble over the head ---
      const b = this.bubble;
      if (b && t >= b.from && t < b.until) {
        let head = this.intro ? this.introHead : { x: this.player.x, y: FLOOR - 46 };
        if (onToilet) head = { x: POS.toilet + 4, y: FLOOR - 49 };
        MP.drawBubble(ctx, b.text, head.x - cam, head.y, { maxWidth: 130 });
      }

      // --- "Jatkuu pian…" panel ---
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
        MP.drawText(ctx, 'Seuraavaksi: katu ja taksiasema', MP.W / 2, 92, { size: 1, color: '#2b2340', align: 'center' });
        MP.drawText(ctx, '(napauta)', MP.W / 2, 112, { size: 0.8, color: '#6e4226', align: 'center' });
        ctx.restore();
      }
    },
  };
})();
