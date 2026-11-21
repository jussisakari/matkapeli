// hairbrush.js – the hair brushing mini-game (girl's long hair).
// In the morning the hair is full of tangles. Brush DOWNWARDS over each
// tangle with a finger (or the mouse with the button down) until it is gone.
// Moving up or sideways doesn't help – hair is brushed from top to bottom.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const ME = { x: 160, y: 176, s: 4 };      // the big girl in the mirror
  const REACH = 17;                          // how close the brush must be to a tangle
  const PER_UNIT = 0.011;                    // how much one unit of downward brushing untangles
  // where the tangles are, in drawPerson units (the lumps of messy hair)
  const KNOTS = [[-9.2, -25], [9.6, -21], [-9.4, -17.5], [9.1, -30], [-8.8, -33], [8.6, -15.5], [0.5, -39], [-4.8, -37.5]];
  const toScreen = (k) => ({ x: ME.x + k[0] * ME.s, y: ME.y + k[1] * ME.s });

  MP.scenes.hairbrush = {
    enter() {
      this.knots = KNOTS.map((k) => Object.assign(toScreen(k), { h: 1 }));
      this.sparkles = [];
      this.hairs = [];                      // little hairs falling off the brush
      this.brush = { x: 268, y: 120 };
      this.down = false;
      this.last = null;
      this.started = false;
      this.done = false;
      this.doneAt = 0;
      this.left = false;
      this.soundAt = 0;
    },

    progress() {
      return 1 - this.knots.reduce((a, k) => a + k.h, 0) / this.knots.length;
    },

    onPointerDown(x, y) {
      if (this.done) return;
      this.down = true;
      this.last = { x, y };
      this.brush.x = x;
      this.brush.y = y;
    },

    onPointerMove(x, y) {
      if (!this.down || this.done) return;
      const dy = y - this.last.y;
      this.last = { x, y };
      this.brush.x = x;
      this.brush.y = y;
      if (dy <= 0) return;                  // only downward strokes brush the hair
      let hit = false;
      for (const k of this.knots) {
        if (k.h <= 0) continue;
        if (Math.hypot(x - k.x, y - k.y) > REACH) continue;
        hit = true;
        this.started = true;
        k.h = Math.max(0, k.h - dy * PER_UNIT);
        if (k.h === 0) {
          MP.sfx.bling();
          for (let i = 0; i < 4; i++) {
            this.sparkles.push({ x: k.x + (Math.random() - 0.5) * 20, y: k.y + (Math.random() - 0.5) * 16, born: MP.time + i * 0.07, r: 3 + Math.random() * 2 });
          }
        }
      }
      if (hit) {
        if (MP.time - this.soundAt > 0.18) { MP.sfx.brush(); this.soundAt = MP.time; }
        if (Math.random() < 0.3) this.hairs.push({ x, y, vx: (Math.random() - 0.5) * 20, born: MP.time });
      }
      if (!this.done && this.knots.every((k) => k.h <= 0)) {
        this.done = true;
        this.doneAt = MP.time;
        MP.state.hairMessy = false;
        MP.save();
        MP.sfx.tune();
      }
    },

    onPointerUp() {
      this.down = false;
    },

    update() {
      const now = MP.time;
      this.sparkles = this.sparkles.filter((s) => now - s.born < 1);
      this.hairs = this.hairs.filter((h) => now - h.born < 1.2);
      if (this.done && !this.left && now - this.doneAt > 2.4) {
        this.left = true;
        MP.goTo(MP.scenes.home, { done: 'hair' });
      }
    },

    exit() {
      this.left = false;
    },

    draw(ctx) {
      const t = MP.time;
      const W = MP.W, H = MP.H;

      // ===== The child's room wall and the big mirror =====
      ctx.fillStyle = '#f7d6e6';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let x = 0; x < W; x += 18) ctx.fillRect(x, 0, 9, H);
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#c084fc';
      ctx.beginPath(); ctx.ellipse(160, 100, 82, 98, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d4efff';
      ctx.beginPath(); ctx.ellipse(160, 100, 74, 90, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(108, 52); ctx.lineTo(122, 30); ctx.stroke();
      ctx.restore();

      // ===== The girl in the mirror, hair as tangled as the knots left =====
      const left = 1 - this.progress();
      const happy = this.done;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(160, 100, 74, 90, 0, 0, Math.PI * 2); ctx.clip();
      MP.drawPerson(ctx, ME.x, ME.y, {
        character: 'girl', scale: ME.s, messy: Math.min(1, left * 1.3),
        eyes: happy ? 'open' : (left > 0.5 ? 'sleepy' : 'open'), mouth: happy ? 'smile' : (left > 0.7 ? 'flat' : 'smile'),
      });
      // the tangles: little scribbles that fade away
      const hairColor = MP.CHARACTERS.girl.hair;
      for (const k of this.knots) {
        if (k.h <= 0) continue;
        ctx.save();
        ctx.globalAlpha = 0.3 + 0.7 * k.h;
        ctx.strokeStyle = MP.mixColor(hairColor, '#000000', 0.45);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 6; a += 0.4) {
          const r = 3 + a * 0.5;
          ctx.lineTo(k.x + Math.cos(a) * r * 0.9, k.y + Math.sin(a) * r * 0.6);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // ===== Little falling hairs and sparkles =====
      ctx.save();
      ctx.strokeStyle = hairColor;
      ctx.lineWidth = 0.6;
      for (const h of this.hairs) {
        const age = t - h.born;
        const hx = h.x + h.vx * age, hy = h.y + age * age * 60;
        ctx.globalAlpha = 1 - age / 1.2;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 3, hy + 2, hx + 1, hy + 5); ctx.stroke();
      }
      ctx.restore();
      for (const s of this.sparkles) {
        const age = t - s.born;
        if (age < 0) continue;
        MP.draw('sparkle', ctx, s.x, s.y, { r: s.r * Math.sin(MP.clamp(age, 0, 1) * Math.PI) + 0.01 });
      }

      // ===== The brush (follows the finger). Before the first stroke a hand shows how. =====
      const showHow = !this.started && !this.down;
      if (!showHow) {
        MP.drawHairbrush(ctx, this.brush.x, this.brush.y, 2.2, 0.25);
      } else {
        const k = this.knots[0];
        const u = (t * 0.9) % 1;
        const hy = k.y - 22 + u * 44;
        ctx.save();
        ctx.globalAlpha = Math.sin(u * Math.PI);
        MP.drawHairbrush(ctx, k.x, hy, 2.2, 0.25);
        ctx.translate(k.x + 10, hy + 18);
        ctx.scale(1.8, 1.8);
        MP.draw('hand', ctx, 0, 0);
        ctx.restore();
        // an arrow showing "down"
        ctx.save();
        ctx.translate(k.x - 28, k.y + 6);
        MP.draw('arrow', ctx, 0, 0);
        ctx.restore();
      }

      // ===== Progress bar =====
      const p = this.progress();
      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#ffffff';
      MP.roundRect(ctx, 90, 4, 140, 10, 5);
      ctx.fill(); ctx.stroke();
      if (p > 0.01) {
        ctx.fillStyle = '#e0559a';
        MP.roundRect(ctx, 91, 5, 138 * p, 8, 4);
        ctx.fill();
      }
      ctx.restore();
      MP.drawHairbrush(ctx, 238, 9, 0.6, -0.6);

      // ===== Texts =====
      if (this.done) {
        MP.drawText(ctx, 'Hienoa! Hiukset on harjattu!', W / 2, 160, {
          size: 1.5, color: '#ffe680', outline: O(), align: 'center',
        });
      } else if (!this.started) {
        MP.drawText(ctx, 'Hiukset on takussa! Harjaa alaspäin takkujen päältä.', W / 2, 160, {
          size: 1, color: '#ffffff', outline: O(), align: 'center',
        });
      }
    },
  };
})();
