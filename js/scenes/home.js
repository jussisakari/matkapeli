// home.js – the side-scrolling home: bedroom → bathroom → hallway.
// The house is 3 screens wide. Tap to walk; the camera follows the character.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const WORLD_W = 960;   // 3 rooms × 320
  const FLOOR = 150;     // where feet stand
  const DOOR_TOP = 96;   // top of the openings between rooms

  // Where things are in the house (x = middle)
  const POS = {
    window: 52, bed: 70, teddy: 126, panda: 140, ball: 172, poster: 200,
    toilet: 385, sink: 480, mirror: 480, towel: 560,
    wardrobe: 740, hooks: 820, door: 905,
  };

  // Things you can tap. standX = where the character stands to use it.
  const SPOTS = {
    sink:     { x: 464, y: 84,  w: 34, h: 70, standX: 461 },
    wardrobe: { x: 720, y: 92,  w: 40, h: 62, standX: 711 },
    door:     { x: 889, y: 100, w: 32, h: 54, standX: 878 },
    teddy:    { x: 118, y: 132, w: 15, h: 20 },
    panda:    { x: 133, y: 131, w: 15, h: 21 },
    poster:   { x: 200, y: 38,  w: 36, h: 46 },
  };

  // Waking up at the start (seconds): sleep → sit up → yawn and stretch → hop out
  const WAKE = { sitUp: 1.6, sitDone: 2.4, yawnStart: 2.7, yawnEnd: 3.9, hop: 4.2, land: 4.8 };
  const START_X = 102;       // where the character lands next to the bed
  const IN_BED_SCALE = 0.9;  // a bit smaller while in bed

  // What the character says, and which thing the arrow points at, in each step
  const QUESTS = {
    brush: { say: 'Huomenta! Mennään pesemään hampaat.', target: 'sink' },
    dress: { say: 'Puetaan vaatteet päälle!',             target: 'wardrobe' },
    door:  { say: 'Nyt lähdetään ulos!',                  target: 'door' },
    done:  { say: null,                                   target: null },
  };

  // ---------------------------------------------------------------------------
  // Room backgrounds
  // ---------------------------------------------------------------------------
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

  function tileFloor(ctx, x0, w) {
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(x0, FLOOR, w, MP.H - FLOOR);
    ctx.fillStyle = '#b8c4c9';
    for (let yy = FLOOR; yy < MP.H; yy += 8) {
      for (let xx = x0 + ((yy - FLOOR) / 8 % 2) * 8; xx < x0 + w; xx += 16) ctx.fillRect(xx, yy, 8, 8);
    }
  }

  // Wall between two rooms, with an opening to walk through
  function partition(ctx, x) {
    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = '#2b2340';
    ctx.fillStyle = '#e9d5bb';
    ctx.fillRect(x - 6, 0, 12, DOOR_TOP);
    ctx.strokeRect(x - 6, -1, 12, DOOR_TOP + 1);
    ctx.fillStyle = '#c98a55';
    MP.roundRect(ctx, x - 16, DOOR_TOP - 4, 32, 5, 1.5); ctx.fill(); ctx.stroke();
    MP.roundRect(ctx, x - 16, DOOR_TOP, 4, FLOOR - DOOR_TOP, 1); ctx.fill(); ctx.stroke();
    MP.roundRect(ctx, x + 12, DOOR_TOP, 4, FLOOR - DOOR_TOP, 1); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function towel(ctx, x) {
    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = '#2b2340';
    ctx.fillStyle = '#8a93a6';
    MP.roundRect(ctx, x - 9, 88, 18, 2.5, 1.2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff9ec4';
    MP.roundRect(ctx, x - 7, 89, 14, 22, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6.6, 105, 13.2, 2);
    ctx.restore();
  }

  function coatHooks(ctx, x) {
    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = '#2b2340';
    ctx.fillStyle = '#a0643c';
    MP.roundRect(ctx, x - 16, 70, 32, 4, 1.5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd23f';
    for (const hx of [-10, 0, 10]) { ctx.beginPath(); ctx.arc(x + hx, 76, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    // A jacket and a scarf
    ctx.fillStyle = '#4a78c8';
    MP.roundRect(ctx, x - 15, 76, 10, 20, 2.5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e04848';
    MP.roundRect(ctx, x + 8.5, 76, 3, 18, 1.5); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function doormat(ctx, x) {
    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = '#2b2340';
    ctx.fillStyle = '#8b5a2b';
    MP.roundRect(ctx, x - 16, FLOOR + 1, 32, 5, 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function rug(ctx, x) {
    ctx.save();
    ctx.fillStyle = '#c084fc';
    ctx.beginPath(); ctx.ellipse(x, FLOOR + 6, 30, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.ellipse(x, FLOOR + 6, 25, 3.2, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
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

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.home = {
    enter(params) {
      if (params && params.quest) MP.state.quest = params.quest;
      if (MP.state.quest === 'wake') MP.state.quest = 'brush';

      this.player = this.player || new MP.Player(START_X, { minX: 12, maxX: WORLD_W - 12 });
      const q = MP.state.quest;
      // Coming from the start screen: wake-up animation first
      this.intro = params && params.quest === 'wake' ? { t: 0, yawned: false } : null;
      this.introHead = { x: START_X, y: 100 };
      this.tiredUntil = 0;
      if (this.intro) this.player.place(START_X, 1);
      else if (q === 'dress') this.player.place(SPOTS.sink.standX, -1);
      else if (q === 'door') this.player.place(SPOTS.wardrobe.standX, 1);

      this.camX = this.cameraTarget();
      this.bubble = null;
      this.panel = null;          // the "Jatkuu pian…" panel
      this.doorOpen = false;
      this.busy = false;          // true while leaving for another scene
      this.toys = { teddy: 0, panda: 0 };
      this.notes = [];
      if (!this.intro) this.sayQuest(0.6);
    },

    // End of the wake-up animation (also when the player taps to skip it)
    finishIntro(skipped) {
      this.intro = null;
      this.player.place(START_X, 1);
      this.tiredUntil = MP.time + (skipped ? 1.5 : 3.2);
      if (!skipped) MP.sfx.tap();
      this.sayQuest(skipped ? 0.2 : 0.9);
    },

    // Draws the character in bed: lying, sitting up, yawning, hopping out.
    // Called in world coordinates, right after the bed.
    drawIntro(ctx) {
      const t = this.intro.t;
      const S = IN_BED_SCALE;
      const hipX = POS.bed + 5.6, hipY = 132;   // the body turns around the hips

      const blanket = () => {
        ctx.save();
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = MP.COLORS.outline;
        ctx.fillStyle = MP.COLORS.blanket;
        MP.roundRect(ctx, POS.bed - 7, 126, 30, 16, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = MP.COLORS.blanketDots;
        for (let xx = POS.bed - 3; xx < POS.bed + 22; xx += 5) {
          ctx.beginPath(); ctx.arc(xx, 131, 0.9, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(xx + 2.5, 136.5, 0.9, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
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
        if (t < WAKE.sitUp) {
          for (let i = 0; i < 3; i++) {
            const p = (t * 0.7 + i / 3) % 1;
            ctx.save();
            ctx.globalAlpha = 1 - p;
            MP.drawText(ctx, 'z', POS.bed - 12 + p * 12, 116 - p * 22, {
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

    cameraTarget() {
      return MP.clamp(this.player.x - MP.W / 2, 0, WORLD_W - MP.W);
    },

    say(text, seconds, delay) {
      this.bubble = { text, from: MP.time + (delay || 0), until: MP.time + (delay || 0) + (seconds || 4.5) };
    },

    sayQuest(delay) {
      const q = QUESTS[MP.state.quest];
      if (q && q.say) this.say(q.say, 5, delay);
    },

    // Run when the character has walked to a thing
    use(id) {
      const quest = MP.state.quest;
      if (id === 'sink') {
        if (quest === 'brush') this.leave(MP.scenes.brush);
        else this.say('Hampaat on jo puhtaat!', 2.5);
      } else if (id === 'wardrobe') {
        if (quest === 'dress') this.leave(MP.scenes.wardrobe);
        else if (quest === 'brush') this.say('Ensin pestään hampaat!', 2.5);
        else this.say('Vaatteet on jo päällä!', 2.5);
      } else if (id === 'door') {
        if (quest === 'door' || quest === 'done') {
          MP.state.quest = 'done';
          this.doorOpen = true;
          this.panel = { from: MP.time };
          MP.sfx.bling();
        } else if (quest === 'brush') {
          this.say('Ensin pestään hampaat!', 2.5);
        } else {
          this.say('Pitää ensin pukea vaatteet!', 2.5);
        }
      }
    },

    leave(scene) {
      if (this.busy) return;
      this.busy = true;
      this.player.stop();
      MP.goTo(scene);
    },

    onTap(x, y) {
      if (this.busy) return;

      // Tap during the wake-up animation skips it
      if (this.intro) {
        this.finishIntro(true);
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

      const wx = x + this.camX;

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
      // Sink, wardrobe, door: walk there, then use it
      for (const id of ['sink', 'wardrobe', 'door']) {
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
      if (this.intro) {
        this.intro.t += dt;
        if (this.intro.t >= WAKE.yawnStart && !this.intro.yawned) {
          this.intro.yawned = true;
          MP.sfx.yawn();
          this.say('Hoh-hoijaa…', WAKE.yawnEnd - WAKE.yawnStart);
        }
        if (this.intro.t >= WAKE.land) this.finishIntro(false);
        return;
      }

      this.player.update(dt);

      // Walking to the sink is enough to start brushing
      if (MP.state.quest === 'brush' && !this.busy &&
          Math.abs(this.player.x - SPOTS.sink.standX) < 8) {
        this.leave(MP.scenes.brush);
      }

      // Smooth camera that stops at the ends of the house
      const target = this.cameraTarget();
      this.camX += (target - this.camX) * Math.min(1, dt * 5);

      this.notes = this.notes.filter((n) => MP.time - n.born < 1.6);
    },

    draw(ctx) {
      const cam = this.camX;
      const t = MP.time;
      const quest = MP.state.quest;

      ctx.save();
      ctx.translate(-cam, 0);

      // --- Walls and floors of all three rooms ---
      dottedWall(ctx, 0, '#fbe3c8', 'rgba(230,170,130,0.35)');
      woodFloor(ctx, 0, 320);
      tiledWall(ctx, 320);
      tileFloor(ctx, 320, 320);
      stripedWall(ctx, 640);
      woodFloor(ctx, 640, 320);

      // Ceiling and skirting boards (drawn BEFORE the furniture, so they stay behind it)
      ctx.fillStyle = '#6e4226';
      ctx.fillRect(0, 0, WORLD_W, 5);
      ctx.fillStyle = '#e8c9a0'; ctx.fillRect(0, FLOOR - 3, 320, 3);
      ctx.fillStyle = '#b8d3dc'; ctx.fillRect(320, FLOOR - 3, 320, 3);
      ctx.fillStyle = '#c9d6b5'; ctx.fillRect(640, FLOOR - 3, 320, 3);
      ctx.strokeStyle = 'rgba(43,35,64,0.5)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(WORLD_W, FLOOR); ctx.stroke();

      // --- Bedroom ---
      rug(ctx, 150);
      MP.draw('window', ctx, POS.window - 15, 34, { t });
      MP.draw('poster', ctx, POS.poster, 38);
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

      // --- Hallway ---
      MP.draw('wardrobe', ctx, POS.wardrobe, FLOOR);
      coatHooks(ctx, POS.hooks);
      doormat(ctx, POS.door);
      MP.draw('door', ctx, POS.door, FLOOR, { open: this.doorOpen });

      // Walls between the rooms
      partition(ctx, 320);
      partition(ctx, 640);

      // Music notes from the poster
      for (const n of this.notes) {
        const age = t - n.born;
        if (age < 0) continue;
        note(ctx, n.x + Math.sin(age * 5) * 3 * n.drift, n.y - age * 22, MP.clamp(1 - age / 1.6, 0, 1));
      }

      // Bouncing arrow over the next thing to do
      const target = QUESTS[quest] && QUESTS[quest].target;
      const spot = target && !this.panel ? SPOTS[target] : null;
      if (spot) MP.draw('arrow', ctx, spot.x + spot.w / 2, spot.y - 3 + Math.sin(t * 6) * 2.5);

      ctx.restore();

      // If the thing is off the screen, an arrow at the edge shows the way
      if (spot) {
        const sx = spot.x + spot.w / 2 - cam;
        if (sx > MP.W - 4 || sx < 4) {
          const dir = sx > MP.W ? 1 : -1;
          const nudge = Math.sin(t * 6) * 2.5 * dir;
          ctx.save();
          ctx.translate(dir > 0 ? MP.W - 6 + nudge : 6 + nudge, 112);
          ctx.rotate(-dir * Math.PI / 2);
          MP.draw('arrow', ctx, 0, 0);
          ctx.restore();
        }
      }

      // --- The character (still a bit tired right after waking up) ---
      if (!this.intro) {
        let extra = null;
        if (t < this.tiredUntil) {
          const blink = (t % 1.3) < 0.18;
          extra = { eyes: blink ? 'closed' : 'sleepy', mouth: 'flat' };
        }
        this.player.draw(ctx, FLOOR, cam, extra);
      }

      // --- Speech bubble over the head ---
      const b = this.bubble;
      if (b && t >= b.from && t < b.until) {
        const head = this.intro ? this.introHead : { x: this.player.x, y: FLOOR - 46 };
        MP.drawBubble(ctx, b.text, head.x - cam, head.y, { maxWidth: 120 });
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
