// brush.js – the tooth brushing mini-game.
// Move a finger (or the mouse with the button down) back and forth over the
// teeth. Every change of direction is one brush stroke and cleans the teeth
// under the brush. Plain taps do nothing.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const STROKE_MIN = 6;     // how far (game units) to move before turning back counts
  const CLEAN = 0.16;       // how much one stroke cleans (1 = fully dirty) – about 7 strokes per section
  const NEIGHBOUR = 0.35;   // the teeth next to the brush get a little cleaner too

  // The open mouth
  const MOUTH = { x: 84, y: 96, w: 152, h: 72, r: 30 };
  const TEETH_X = 92;       // left edge of the first tooth
  const TOOTH_W = 17;       // 8 teeth per row
  const TOP_ROW = { y: 98, h: 21 };
  const BOTTOM_ROW = { y: 145, h: 21 };
  const SECTIONS = 8;       // 4 on top (0–3) and 4 at the bottom (4–7), 2 teeth each

  function sectionCenter(s) {
    const col = s % 4;
    const row = s < 4 ? TOP_ROW : BOTTOM_ROW;
    return { x: TEETH_X + col * TOOTH_W * 2 + TOOTH_W, y: row.y + row.h / 2 };
  }

  // Which section is under the brush (or -1 if the brush is not on the teeth)
  function sectionAt(x, y) {
    if (x < MOUTH.x - 4 || x > MOUTH.x + MOUTH.w + 4) return -1;
    if (y < MOUTH.y - 8 || y > MOUTH.y + MOUTH.h + 8) return -1;
    const col = MP.clamp(Math.floor((x - TEETH_X) / (TOOTH_W * 2)), 0, 3);
    return (y < MOUTH.y + MOUTH.h / 2 ? 0 : 4) + col;
  }

  MP.scenes.brush = {
    enter() {
      this.dirt = [];
      for (let i = 0; i < SECTIONS; i++) this.dirt.push(1);
      this.spots = [];                       // yellow spots on the teeth (fixed places)
      for (let i = 0; i < 40; i++) {
        this.spots.push({ s: i % SECTIONS, dx: (Math.random() - 0.5) * 26, dy: (Math.random() - 0.5) * 12, r: 1 + Math.random() * 1.6 });
      }
      this.foam = [];                        // foam bubbles
      this.sparkles = [];                    // sparkles when a section gets clean
      this.down = false;
      this.brush = { x: 262, y: 128, angle: 0 };
      this.started = false;                  // false until the first real stroke
      this.done = false;
      this.doneAt = 0;
      this.left = false;
      this.trackX = { dir: 0, travel: 0 };
      this.trackY = { dir: 0, travel: 0 };
      this.last = null;
    },

    progress() {
      return 1 - this.dirt.reduce((a, b) => a + b, 0) / SECTIONS;
    },

    // ---- Finger / mouse ----
    onPointerDown(x, y) {
      if (this.done) return;
      this.down = true;
      this.last = { x, y };
      this.trackX = { dir: 0, travel: 0 };
      this.trackY = { dir: 0, travel: 0 };
      this.brush.x = x;
      this.brush.y = y;
    },

    onPointerMove(x, y) {
      if (!this.down || this.done) return;
      const dx = x - this.last.x, dy = y - this.last.y;
      this.last = { x, y };
      this.brush.x = x;
      this.brush.y = y;
      this.brush.angle = MP.clamp(dy * 0.05, -0.4, 0.4);

      // A stroke = moving one way at least STROKE_MIN, then turning back.
      // Left-right and up-down both work.
      const turnedX = this.track(this.trackX, dx);
      const turnedY = this.track(this.trackY, dy);
      if (turnedX || turnedY) this.stroke(x, y);

      // Foam while moving on the teeth
      if (sectionAt(x, y) >= 0 && Math.abs(dx) + Math.abs(dy) > 0.6 && Math.random() < 0.6) {
        this.foam.push({
          x: x + (Math.random() - 0.5) * 14, y: y + (Math.random() - 0.5) * 8,
          r: 1.5 + Math.random() * 2.5, born: MP.time,
          vx: (Math.random() - 0.5) * 8, vy: -4 - Math.random() * 8,
        });
      }
    },

    onPointerUp() {
      this.down = false;
    },

    // Follows movement along one axis. Returns true when it turned back
    // after moving far enough.
    track(tr, d) {
      if (Math.abs(d) < 0.05) return false;
      const sgn = Math.sign(d);
      if (tr.dir === 0 || sgn === tr.dir) {
        tr.dir = sgn;
        tr.travel += Math.abs(d);
        return false;
      }
      const counted = tr.travel >= STROKE_MIN;
      tr.dir = sgn;
      tr.travel = Math.abs(d);
      return counted;
    },

    stroke(x, y) {
      const s = sectionAt(x, y);
      if (s < 0) return;
      this.started = true;
      MP.sfx.brush();
      this.cleanSection(s, CLEAN);
      const col = s % 4, base = s < 4 ? 0 : 4;
      if (col > 0) this.cleanSection(base + col - 1, CLEAN * NEIGHBOUR);
      if (col < 3) this.cleanSection(base + col + 1, CLEAN * NEIGHBOUR);

      if (!this.done && this.dirt.every((d) => d <= 0)) {
        this.done = true;
        this.down = false;
        this.doneAt = MP.time;
        MP.sfx.bling();
        for (let i = 0; i < 14; i++) {
          this.sparkles.push({
            x: TEETH_X + Math.random() * TOOTH_W * 8, y: 100 + Math.random() * 66,
            born: MP.time + Math.random() * 0.6, r: 3 + Math.random() * 4,
          });
        }
      }
    },

    cleanSection(s, amount) {
      const before = this.dirt[s];
      this.dirt[s] = Math.max(0, before - amount);
      if (before > 0 && this.dirt[s] === 0) {
        // This part is now clean: a little sparkle
        const c = sectionCenter(s);
        this.sparkles.push({ x: c.x, y: c.y, born: MP.time, r: 6 });
        MP.sfx.tap();
      }
    },

    update() {
      const now = MP.time;
      this.foam = this.foam.filter((f) => now - f.born < 1.2);
      this.sparkles = this.sparkles.filter((s) => now - s.born < 1.2);
      if (this.done && !this.left && now - this.doneAt > 2.4) {
        this.left = true;
        MP.goTo(MP.scenes.home, { done: 'brush' });
      }
      if (!this.down && !this.done) {
        // The brush rests at the side when not brushing
        this.brush.x += (262 - this.brush.x) * 0.1;
        this.brush.y += (128 - this.brush.y) * 0.1;
        this.brush.angle *= 0.9;
      }
    },

    draw(ctx) {
      const W = MP.W, H = MP.H, t = MP.time;
      const ch = MP.CHARACTERS[MP.state.character] || MP.CHARACTERS.girl;
      const O = MP.COLORS.outline;

      // --- Big face filling the screen ---
      ctx.fillStyle = '#d8f0f5';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = O;
      // hair behind
      ctx.fillStyle = ch.hair;
      ctx.beginPath(); ctx.ellipse(160, 100, 152, 112, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // face
      ctx.fillStyle = MP.COLORS.skin;
      ctx.beginPath(); ctx.ellipse(160, 120, 135, 115, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // fringe (only its wavy lower edge gets a line)
      ctx.fillStyle = ch.hair;
      ctx.beginPath();
      ctx.moveTo(30, 40);
      ctx.quadraticCurveTo(160, -50, 290, 40);
      ctx.quadraticCurveTo(240, 12, 200, 22);
      ctx.quadraticCurveTo(160, 6, 120, 22);
      ctx.quadraticCurveTo(80, 12, 30, 40);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(290, 40);
      ctx.quadraticCurveTo(240, 12, 200, 22);
      ctx.quadraticCurveTo(160, 6, 120, 22);
      ctx.quadraticCurveTo(80, 12, 30, 40);
      ctx.stroke();
      // eyes (happy when done)
      for (const ex of [112, 208]) {
        if (this.done) {
          ctx.beginPath(); ctx.arc(ex, 52, 8, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 2.5; ctx.stroke();
        } else {
          ctx.fillStyle = O;
          ctx.beginPath(); ctx.ellipse(ex, 50, 6.5, 9, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(ex + 2, 46, 2.4, 0, Math.PI * 2); ctx.fill();
        }
      }
      // cheeks
      ctx.fillStyle = MP.COLORS.cheeks;
      ctx.beginPath(); ctx.arc(70, 92, 15, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(250, 92, 15, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (ch.bow) {
        ctx.save();
        ctx.translate(262, 30);
        ctx.scale(4, 4);
        ctx.lineWidth = 0.4;
        ctx.strokeStyle = O;
        ctx.fillStyle = ch.bow;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, -2.2); ctx.lineTo(3, 2.2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-3, -2.2); ctx.lineTo(-3, 2.2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 1.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
      }

      // --- Open mouth with teeth ---
      ctx.save();
      MP.roundRect(ctx, MOUTH.x, MOUTH.y, MOUTH.w, MOUTH.h, MOUTH.r);
      ctx.fillStyle = '#5a1f2a';
      ctx.fill();
      ctx.clip();
      // tongue and gums
      ctx.fillStyle = '#ff7f96';
      ctx.beginPath(); ctx.ellipse(160, 160, 44, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff9aa8';
      ctx.fillRect(MOUTH.x, MOUTH.y, MOUTH.w, 5);
      ctx.fillRect(MOUTH.x, MOUTH.y + MOUTH.h - 5, MOUTH.w, 5);
      // teeth
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = '#b9a98a';
      for (let i = 0; i < 16; i++) {
        const top = i < 8;
        const col = i % 8;
        const s = (top ? 0 : 4) + Math.floor(col / 2);
        const row = top ? TOP_ROW : BOTTOM_ROW;
        const x = TEETH_X + col * TOOTH_W;
        ctx.fillStyle = MP.mixColor('#ffffff', '#e6cf6a', this.dirt[s]);
        MP.roundRect(ctx, x + 0.5, row.y, TOOTH_W - 1, row.h, 4);
        ctx.fill();
        ctx.stroke();
      }
      // dirty spots
      for (const sp of this.spots) {
        const d = this.dirt[sp.s];
        if (d <= 0) continue;
        const c = sectionCenter(sp.s);
        ctx.fillStyle = 'rgba(176,140,40,' + (0.55 * d).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(c.x + sp.dx, c.y + sp.dy * 0.7, sp.r * (0.6 + d * 0.4), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      // lips
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#e8737a';
      MP.roundRect(ctx, MOUTH.x - 1, MOUTH.y - 1, MOUTH.w + 2, MOUTH.h + 2, MOUTH.r + 1);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O;
      MP.roundRect(ctx, MOUTH.x - 3, MOUTH.y - 3, MOUTH.w + 6, MOUTH.h + 6, MOUTH.r + 3);
      ctx.stroke();
      ctx.restore();

      // --- Foam bubbles ---
      for (const f of this.foam) {
        const age = t - f.born;
        ctx.save();
        ctx.globalAlpha = MP.clamp(1 - age / 1.2, 0, 1);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#9fd8ff';
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.arc(f.x + f.vx * age, f.y + f.vy * age, f.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
      }

      // --- Sparkles ---
      for (const s of this.sparkles) {
        const age = t - s.born;
        if (age < 0) continue;
        const k = Math.sin(MP.clamp(age / 1.2, 0, 1) * Math.PI);
        MP.draw('sparkle', ctx, s.x, s.y, { r: s.r * k + 0.01 });
      }

      // --- Toothbrush (follows the finger). Before the first stroke a hand shows how. ---
      const showHow = !this.started && !this.down;
      if (!showHow) {
        MP.draw('toothbrush', ctx, this.brush.x, this.brush.y, { scale: 3, angle: this.brush.angle });
      } else {
        const hx = 160 + Math.sin(t * 5) * 34;
        MP.draw('toothbrush', ctx, hx, 108, { scale: 3, angle: 0 });
        ctx.save();
        ctx.translate(hx + 12, 112);
        ctx.scale(1.8, 1.8);
        MP.draw('hand', ctx, 0, 0);
        ctx.restore();
      }

      // --- Progress bar ---
      const p = this.progress();
      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = O;
      ctx.fillStyle = '#ffffff';
      MP.roundRect(ctx, 90, 4, 140, 10, 5);
      ctx.fill(); ctx.stroke();
      if (p > 0.01) {
        ctx.fillStyle = '#3cb371';
        MP.roundRect(ctx, 91, 5, 138 * p, 8, 4);
        ctx.fill();
      }
      ctx.restore();
      MP.draw('sparkle', ctx, 236, 9, { r: 4 + Math.sin(t * 5) * 0.8 });

      // --- Texts ---
      if (this.done) {
        MP.drawText(ctx, 'Hienoa! Hampaat puhtaina!', W / 2, 68, {
          size: 1.6, color: '#ffe680', outline: O, align: 'center',
        });
        const tw = MP.measureText('Hienoa! Hampaat puhtaina!', 1.6);
        MP.draw('sparkle', ctx, W / 2 + tw / 2 + 8, 74, { r: 6 + Math.sin(t * 8) * 1.5 });
      } else if (!this.started) {
        MP.drawText(ctx, 'Harjaa sormella edestakaisin!', W / 2, 68, {
          size: 1.3, color: '#ffffff', outline: O, align: 'center',
        });
      }
    },
  };
})();
