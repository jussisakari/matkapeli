// swim.js – SWIMMING in our own pool in the back yard (a minigame).
// The pool is seen from the side. Tap the water and you swim there.
// Collect the rubber ducks floating on the water, and dive down to get the
// rings from the bottom. Only with the swimsuit on! "Pois" takes you out.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const POOL = { x: 16, y: 62, w: 288, h: 108 };   // the water
  const SURFACE = 66;
  const BOTTOM = POOL.y + POOL.h - 4;
  const LIMITS = { minX: POOL.x + 14, maxX: POOL.x + POOL.w - 14, minY: SURFACE + 6, maxY: BOTTOM - 10 };
  const SPEED = 58;
  const S = 1.1;                                    // the swimmer's size
  const OUT = { x: 4, y: 4, w: 60, h: 18 };          // the "Pois" button

  const ITEMS = [
    { kind: 'duck', x: 84 }, { kind: 'duck', x: 176 }, { kind: 'duck', x: 262 },
    { kind: 'ring', x: 60, color: '#ff5f8f' }, { kind: 'ring', x: 140, color: '#ffd23f' }, { kind: 'ring', x: 226, color: '#3cb371' },
  ];

  function drawDuck(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s || 1, s || 1);
    ctx.lineWidth = 0.7; ctx.strokeStyle = MP.COLORS.outline;
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(4, -5.5, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff8a2a';
    ctx.beginPath(); ctx.moveTo(7, -6); ctx.lineTo(10.4, -5); ctx.lineTo(7, -3.8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = MP.COLORS.outline;
    ctx.beginPath(); ctx.arc(5, -6.4, 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e0a91f'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.arc(-1, -0.5, 3, 0.2, Math.PI - 0.6); ctx.stroke();   // a wing
    ctx.restore();
  }

  function drawRing(ctx, x, y, color, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s || 1, s || 1);
    ctx.lineWidth = 3.6; ctx.strokeStyle = MP.COLORS.outline;
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 2.6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2.2; ctx.strokeStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 2.6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  MP.scenes.swim = {
    enter() {
      this.x = LIMITS.minX + 10;
      this.y = LIMITS.minY;
      this.target = null;
      this.rot = 0;
      this.facing = 1;
      this.moving = false;
      this.swimTime = 0;
      this.items = ITEMS.map((it, i) => Object.assign({ got: false, phase: i * 1.3 }, it));
      this.flying = [];             // collected things flying to the counter
      this.bubbles = [];
      this.splashAt = MP.time;
      this.done = false;
      this.leaving = false;
      this.bubble = null;
      MP.sfx.flush();
      this.say('Uimaan! Napauta vettä, niin uit sinne. Kerää kumiankat ja sukella hakemaan renkaat pohjasta!', 0.6);
    },

    say(text, delay) {
      this.bubble = { text, from: MP.time + (delay || 0), until: Infinity };
    },

    itemPos(it) {
      if (it.kind === 'duck') return { x: it.x + Math.sin(MP.time * 0.7 + it.phase) * 6, y: SURFACE - 2 + Math.sin(MP.time * 2 + it.phase) * 1.2 };
      return { x: it.x, y: BOTTOM - 2 };
    },

    leave() {
      if (this.leaving) return;
      this.leaving = true;
      MP.sfx.tap();
      MP.goTo(MP.scenes.street, { from: 'pool' });
    },

    onTap(x, y) {
      if (this.leaving) return;
      if (MP.hit(OUT, x, y)) { this.leave(); return; }
      // tapping above the water swims to the surface
      this.target = { x: MP.clamp(x, LIMITS.minX, LIMITS.maxX), y: MP.clamp(y, LIMITS.minY, LIMITS.maxY) };
      MP.sfx.tap();
    },

    update(dt) {
      const t = MP.time;
      // --- swimming towards the tap ---
      this.moving = false;
      if (this.target) {
        const dx = this.target.x - this.x, dy = this.target.y - this.y;
        const d = Math.hypot(dx, dy);
        if (d < 1) {
          this.target = null;
        } else {
          const step = Math.min(d, SPEED * dt);
          this.x += dx / d * step;
          this.y += dy / d * step;
          this.moving = true;
          this.swimTime += dt;
          if (Math.abs(dx) > 2) this.facing = dx > 0 ? 1 : -1;
          // lie down to swim; tilt when diving or coming up
          const tilt = MP.clamp(Math.atan2(dy, Math.abs(dx) + 0.01), -1.1, 1.1);
          this.wantRot = this.facing > 0 ? Math.PI / 2 + tilt : -Math.PI / 2 - tilt;
        }
      }
      if (!this.moving) this.wantRot = 0;   // standing up in the water (treading water)
      this.rot += ((this.wantRot || 0) - this.rot) * Math.min(1, dt * 6);

      // --- bubbles from under the water ---
      if (this.y > SURFACE + 18 && Math.random() < dt * 4) {
        this.bubbles.push({ x: this.x + this.facing * 8, y: this.y - 6, r: 0.8 + Math.random() * 1.4, wob: Math.random() * 6 });
      }
      for (const b of this.bubbles) b.y -= dt * 24;
      this.bubbles = this.bubbles.filter((b) => b.y > SURFACE);

      // --- collecting ---
      this.items.forEach((it, i) => {
        if (it.got) return;
        const p = this.itemPos(it);
        if (Math.hypot(p.x - this.x, p.y - this.y) < 15) {
          it.got = true;
          MP.sfx.bling();
          this.flying.push({ it, from: { x: p.x, y: p.y }, slot: i, t: 0 });
          const left = this.items.filter((q) => !q.got).length;
          if (!left) {
            this.done = true;
            this.say('Hienoa uintia! Keräsit kaikki ankat ja renkaat! Napauta "Pois", kun haluat nousta altaasta.', 0.6);
            MP.sfx.tune();
          } else if (it.kind === 'ring') {
            this.say('Sukellus! Sait renkaan pohjasta.');
          } else {
            this.say('Kvaak! Kumiankka kyytiin.');
          }
        }
      });
      for (const f of this.flying) f.t += dt;
    },

    slotPos(i) {
      return { x: 84 + i * 18, y: 13 };
    },

    draw(ctx) {
      const t = MP.time;
      // ----- The back yard: sky, the house wall, the wooden fence, the grass -----
      const sky = ctx.createLinearGradient(0, 0, 0, POOL.y);
      sky.addColorStop(0, '#8fd0f6'); sky.addColorStop(1, '#e6f6ff');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, MP.W, POOL.y);
      MP.draw('sun', ctx, 0, 0, { x: 286, y: 30, r: 7, t });
      ctx.save();
      ctx.lineWidth = 0.7; ctx.strokeStyle = MP.COLORS.outline;
      ctx.fillStyle = '#f2d7b0';
      ctx.fillRect(-2, 6, 50, 52); ctx.strokeRect(-2, 6, 50, 52);              // our house's corner
      ctx.fillStyle = '#bfe6ff';
      ctx.fillRect(14, 20, 18, 14); ctx.strokeRect(14, 20, 18, 14);
      ctx.fillStyle = '#c0504d';
      ctx.beginPath(); ctx.moveTo(-4, 8); ctx.lineTo(54, 8); ctx.lineTo(40, -6); ctx.lineTo(-4, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (let x = 56; x < MP.W; x += 7) {                                    // wooden pickets
        ctx.fillStyle = '#b07a45';
        ctx.beginPath(); ctx.moveTo(x, 54); ctx.lineTo(x, 38); ctx.lineTo(x + 2.5, 35); ctx.lineTo(x + 5, 38); ctx.lineTo(x + 5, 54); ctx.closePath();
        ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(52, 41, MP.W - 52, 2); ctx.fillRect(52, 49, MP.W - 52, 2);
      ctx.fillStyle = '#7cc56b';
      ctx.fillRect(0, 52, MP.W, POOL.y - 52);
      // the pool edge (white tiles)
      ctx.fillStyle = '#f2f5f8';
      ctx.fillRect(0, POOL.y - 6, MP.W, 6); ctx.strokeRect(-1, POOL.y - 6, MP.W + 2, 6);
      ctx.fillRect(0, POOL.y, POOL.x, MP.H); ctx.fillRect(POOL.x + POOL.w, POOL.y, MP.W, MP.H);
      ctx.fillRect(0, POOL.y + POOL.h, MP.W, MP.H);
      ctx.restore();

      // ----- The pool: tiles on the walls and the bottom -----
      const water = ctx.createLinearGradient(0, SURFACE, 0, POOL.y + POOL.h);
      water.addColorStop(0, '#7fd6f7'); water.addColorStop(1, '#2a8fcf');
      ctx.fillStyle = water;
      ctx.fillRect(POOL.x, POOL.y, POOL.w, POOL.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = POOL.x; x < POOL.x + POOL.w; x += 12) { ctx.moveTo(x, SURFACE); ctx.lineTo(x, POOL.y + POOL.h); }
      for (let y = SURFACE + 10; y < POOL.y + POOL.h; y += 12) { ctx.moveTo(POOL.x, y); ctx.lineTo(POOL.x + POOL.w, y); }
      ctx.stroke();
      ctx.fillStyle = '#1f6fa8';                                             // a dark lane line on the bottom
      ctx.fillRect(POOL.x + 20, BOTTOM + 1, POOL.w - 40, 2.5);
      // the ladder at the left end
      ctx.save();
      ctx.strokeStyle = '#c9d1db'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(POOL.x + 4, POOL.y - 14); ctx.quadraticCurveTo(POOL.x + 4, POOL.y - 18, POOL.x + 8, POOL.y - 14); ctx.lineTo(POOL.x + 8, POOL.y + 40);
      for (let y = POOL.y + 6; y < POOL.y + 40; y += 9) { ctx.moveTo(POOL.x + 2, y); ctx.lineTo(POOL.x + 8, y); }
      ctx.stroke();
      ctx.restore();

      // ----- Things to collect -----
      this.items.forEach((it) => {
        if (it.got) return;
        const p = this.itemPos(it);
        if (it.kind === 'duck') drawDuck(ctx, p.x, p.y, 1);
        else drawRing(ctx, p.x, p.y, it.color, 1);
      });

      // ----- The swimmer -----
      const outfit = Object.assign({}, MP.state.outfit, { costume: 'swimsuit', hat: 'none' });
      const swimming = this.moving;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      MP.drawPerson(ctx, 0, 21 * S, {
        scale: S, outfit, walking: swimming, walkTime: this.swimTime * 1.6,
        armUp: swimming ? 0.5 + 0.5 * Math.sin(this.swimTime * 7) : 0.15,
        flip: this.facing < 0 && Math.abs(this.rot) < 0.3,
        mouth: 'smile', eyes: this.y > SURFACE + 20 ? 'closed' : undefined,
      });
      ctx.restore();

      // ----- The water on top (so the swimmer is under it) -----
      ctx.fillStyle = 'rgba(63,182,240,0.33)';
      ctx.fillRect(POOL.x, SURFACE, POOL.w, POOL.y + POOL.h - SURFACE);
      ctx.save();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.8;
      ctx.beginPath();
      for (let x = POOL.x; x <= POOL.x + POOL.w; x += 3) {
        const y = SURFACE + Math.sin(x * 0.12 + t * 3) * 0.9;
        if (x === POOL.x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // bubbles
      ctx.lineWidth = 0.5;
      for (const b of this.bubbles) {
        ctx.beginPath(); ctx.arc(b.x + Math.sin(t * 5 + b.wob) * 1.2, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
      }
      // a splash when jumping in, and around the swimmer at the surface
      const sp = t - this.splashAt;
      if (sp < 0.8) {
        for (let i = 0; i < 9; i++) {
          const a = Math.PI + (i / 8) * Math.PI, r = sp * 40;
          ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 1 - sp / 0.8;
          ctx.beginPath(); ctx.arc(this.x + Math.cos(a) * r, SURFACE + Math.sin(a) * r * 0.8 + sp * sp * 40, 1.4, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (swimming && this.y < SURFACE + 14) {
        ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
          const k = (t * 3 + i / 4) % 1;
          ctx.beginPath(); ctx.arc(this.x - this.facing * (8 + k * 14), SURFACE - 1 - Math.sin(k * Math.PI) * 4, 1.1, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();

      // ----- The counter: what has been collected -----
      ctx.save();
      ctx.fillStyle = 'rgba(255,247,224,0.9)'; ctx.strokeStyle = MP.COLORS.outline; ctx.lineWidth = 0.8;
      MP.roundRect(ctx, 72, 3, 116, 20, 6); ctx.fill(); ctx.stroke();
      ctx.restore();
      this.items.forEach((it, i) => {
        const s = this.slotPos(i);
        const f = this.flying.find((q) => q.it === it);
        let x = s.x, y = s.y, k = 0.7;
        if (f) {
          const u = MP.clamp(f.t / 0.7, 0, 1), e = u * u * (3 - 2 * u);
          x = MP.lerp(f.from.x, s.x, e); y = MP.lerp(f.from.y, s.y, e) - Math.sin(u * Math.PI) * 20;
          k = MP.lerp(1, 0.7, e);
        } else {
          ctx.save(); ctx.globalAlpha = 0.25;
        }
        if (it.kind === 'duck') drawDuck(ctx, x - 1, y + 3, k);
        else drawRing(ctx, x, y + 1, it.color, k);
        if (!f) ctx.restore();
      });

      // ----- "Pois" button -----
      MP.drawButton(ctx, 'Pois', OUT, { size: 0.85, color: this.done ? '#3cb371' : '#e0559a', shade: this.done ? '#1f7a4a' : '#a8326c' });

      // ----- Speech bubble -----
      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, MP.clamp(this.x, 60, 260), Math.max(40, this.y - 26), { maxWidth: 170 });
    },
  };
})();
