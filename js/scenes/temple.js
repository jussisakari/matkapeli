// temple.js – INSIDE THE GOLDEN TEMPLE in Thailand (2D).
// At the door the shoes come off (politely) – they fly into a neat pair.
// Inside: golden walls, red pillars, flowers and candles, a row of bells and a
// big gong. Something funny: a cheeky temple monkey steals your hat (or a
// shoe!) and hides. Tap where it is hiding to get it back. The gong goes
// BOOONG and everything wobbles. Temple cats sleep in the sun – tap to wake.
// Going out, the shoes jump back on.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const FLOOR = 156;
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const PILLARS = [118, 234];
  const BELLS = [26, 41, 56, 71, 86];
  const BELL_NOTES = [523, 587, 659, 784, 880];      // a happy five-note scale
  const GONG = { x: 292, y: 96, r: 16 };
  const BASKET = { x: 92, y: FLOOR - 6 };
  const CATS = [{ x: 210, y: FLOOR + 4, color: '#f2c68a' }, { x: 40, y: FLOOR + 4, color: '#9a9aa5' }];
  const RACK_X = 18;
  // where the monkey can hide (x, y = the middle of the spot to tap)
  const HIDES = [
    { id: 'pillar0', x: PILLARS[0], y: 110, w: 26, h: 90, tail: [PILLARS[0] + 10, 150] },
    { id: 'pillar1', x: PILLARS[1], y: 110, w: 26, h: 90, tail: [PILLARS[1] + 10, 150] },
    { id: 'altar', x: 172, y: FLOOR - 18, w: 64, h: 34, tail: [206, FLOOR - 26] },
    { id: 'basket', x: BASKET.x, y: BASKET.y - 6, w: 30, h: 22, tail: [BASKET.x + 12, BASKET.y - 14] },
    { id: 'gong', x: GONG.x, y: GONG.y - 26, w: 30, h: 22, tail: [GONG.x - 8, GONG.y - 30] },
  ];

  // The temple monkey. (x, y) = feet. o = { t, flip, carry: {kind, color}, sit, wave }
  function monkey(c, x, y, o) {
    c.save();
    c.translate(x, y);
    if (o.flip) c.scale(-1, 1);
    c.lineWidth = 0.8;
    c.strokeStyle = O();
    // tail
    c.strokeStyle = '#7a4a2a';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(-4, -6); c.quadraticCurveTo(-14, -4 + Math.sin(o.t * 4) * 3, -12, -18); c.stroke();
    c.lineWidth = 0.8; c.strokeStyle = O();
    c.fillStyle = '#9a6038';
    c.beginPath(); c.ellipse(0, -9, 5.5, 7, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    // legs and arms
    c.fillRect(-4, -3, 3, 3); c.fillRect(1, -3, 3, 3);
    c.save(); c.translate(4, -12); c.rotate(o.wave ? -2.4 + Math.sin(o.t * 12) * 0.3 : -0.4);
    c.fillRect(-1.2, 0, 2.4, 7); c.restore();
    // head
    c.beginPath(); c.arc(1, -19, 5.5, 0, Math.PI * 2); c.fill(); c.stroke();
    for (const ex of [-4.5, 6.5]) { c.beginPath(); c.arc(ex, -19, 2, 0, Math.PI * 2); c.fill(); c.stroke(); }
    c.fillStyle = '#f2c9a0';
    c.beginPath(); c.ellipse(2, -18, 3.6, 3.4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = O();
    c.beginPath(); c.arc(0.6, -19.5, 0.7, 0, Math.PI * 2); c.arc(3.4, -19.5, 0.7, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(2, -17, 1.6, 0.1, Math.PI - 0.1); c.stroke();
    // what it is carrying (on its head!)
    if (o.carry) {
      c.fillStyle = o.carry.color;
      if (o.carry.kind === 'shoe') {
        MP.roundRect(c, -3, -30, 9, 4, 2); c.fill(); c.stroke();
      } else {
        c.beginPath(); c.arc(1, -24, 5, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
        c.fillRect(-5, -24.5, 12, 1.6);
      }
    }
    c.restore();
  }

  function cat(c, x, y, color, awake, t) {
    c.save();
    c.translate(x, y);
    c.lineWidth = 0.8;
    c.strokeStyle = O();
    c.fillStyle = color;
    if (awake) {
      // stretching: bottom up, front paws long
      c.beginPath(); c.ellipse(0, -7, 9, 4, -0.25, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillRect(-9, -5, 6, 2.5);
      c.beginPath(); c.arc(-10, -6, 3.6, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-13, -9); c.lineTo(-12, -12); c.lineTo(-10.5, -9.5); c.moveTo(-9, -9.5); c.lineTo(-7.5, -12); c.lineTo(-7, -8.5); c.fill(); c.stroke();
      c.strokeStyle = color; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(8, -9); c.quadraticCurveTo(13, -18, 9, -20); c.stroke();
    } else {
      // curled up asleep
      c.beginPath(); c.ellipse(0, -4, 8, 4.5, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.arc(-6, -5, 3.4, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-9, -7); c.lineTo(-8.5, -10); c.lineTo(-6.5, -8); c.fill(); c.stroke();
      MP.drawText(c, 'z', -2 + Math.sin(t) * 1, -16 - (t * 6) % 6, { size: 0.6, color: '#4a78c8', align: 'center' });
    }
    c.restore();
  }

  MP.scenes.temple = {
    noRestart: true,

    enter() {
      this.player = new MP.Player(24, { minX: 30, maxX: 300 });
      this.player.place(24, 1);
      this.player.walkTo(64);
      this.shoesAt = MP.time + 0.3;           // the shoes fly off
      this.gongAt = -9;
      this.bellAt = BELLS.map(() => -9);
      this.catAt = CATS.map(() => -9);
      this.monkey = { mode: 'wait', from: MP.time + 3.2, x: 200, y: 20 };
      this.stolen = null;                     // { kind: 'hat' | 'shoe', id, color }
      this.hide = null;                       // where the monkey is hiding
      this.wrongAt = -9;
      this.bubble = null;
      this.say('Kengät pois ennen kuin mennään sisään! Hups – ne lensivät ihan itse telineeseen.');
    },

    exit() {
      // make sure the hat comes back if the monkey still has it
      if (this.stolen && this.stolen.kind === 'hat') MP.state.outfit.hat = this.stolen.id;
      this.stolen = null;
    },

    say(text) {
      this.bubble = { text, from: MP.time, until: Infinity };
    },

    // the monkey steals something and runs to hide
    steal() {
      const hat = MP.state.outfit.hat;
      if (hat && hat !== 'none') {
        const it = MP.findItem('hat', hat);
        this.stolen = { kind: 'hat', id: hat, color: it.color || '#e04848' };
        MP.state.outfit.hat = 'none';
        this.say('Hei, apina vei hatun! Mihin se piiloutui? Napauta piilopaikkaa.');
      } else {
        this.stolen = { kind: 'shoe', id: 'shoe', color: '#4a78c8' };
        this.say('Hei, apina vei kengän telineestä! Mihin se piiloutui? Napauta piilopaikkaa.');
      }
      this.hide = HIDES[Math.floor(Math.random() * HIDES.length)];
      this.monkey = { mode: 'run', from: MP.time, x: this.player.x + 6, y: FLOOR - 40 };
      MP.sfx.boing();
    },

    found() {
      const m = this.monkey;
      m.mode = 'found';
      m.from = MP.time;
      m.x = this.hide.x;
      m.y = this.hide.id === 'gong' ? GONG.y - 16 : this.hide.id === 'altar' ? FLOOR - 33 : FLOOR;
      MP.sfx.bling();
      this.say('Löytyi! Apina antaa ' + (this.stolen.kind === 'hat' ? 'hatun' : 'kengän') + ' takaisin ja kumartaa. Kiitos, apina!');
      if (this.stolen.kind === 'hat') MP.state.outfit.hat = this.stolen.id;
      this.stolen = null;
      this.hide = null;
    },

    onTap(x, y) {
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.thailand, { from: 'temple' });
        return;
      }
      const t = MP.time;
      // looking for the monkey
      if (this.hide) {
        for (const h of HIDES) {
          if (Math.abs(x - h.x) < h.w / 2 + 4 && Math.abs(y - h.y) < h.h / 2 + 4) {
            if (h === this.hide) { this.found(); return; }
            this.wrongAt = t;
            MP.sfx.tap();
            this.say(['Ei täällä! Kuuluu kikatusta jostain muualta…', 'Ei tässäkään! Katso, näkyykö jossain häntä?'][Math.floor(Math.random() * 2)]);
            return;
          }
        }
      }
      // the monkey (sitting on the beam after giving things back): play again
      const m = this.monkey;
      if (m.mode === 'beam' && Math.abs(x - m.x) < 16 && Math.abs(y - (m.y - 10)) < 18) {
        this.steal();
        return;
      }
      // the bells
      for (let i = 0; i < BELLS.length; i++) {
        if (Math.abs(x - BELLS[i]) < 7 && y > 30 && y < 60) {
          this.bellAt[i] = t;
          MP.sfx.note(BELL_NOTES[i], 0.6, 'sine', 0.2);
          return;
        }
      }
      // the gong
      if (Math.hypot(x - GONG.x, y - GONG.y) < GONG.r + 6) {
        this.gongAt = t;
        MP.sfx.note(98, 2.2, 'sine', 0.35);
        MP.sfx.note(147, 1.6, 'triangle', 0.12);
        this.say('BOOONG! Kaikki heiluu!');
        return;
      }
      // the cats
      for (let i = 0; i < CATS.length; i++) {
        if (Math.abs(x - CATS[i].x) < 12 && Math.abs(y - (CATS[i].y - 6)) < 10) {
          this.catAt[i] = t;
          MP.sfx.meow();
          this.say('Temppelikissa venyttelee… ja jatkaa unia auringossa.');
          return;
        }
      }
      this.player.walkTo(x);
    },

    update(dt) {
      this.player.update(dt);
      const m = this.monkey;
      if (m.mode === 'wait' && MP.time > m.from) this.steal();
      if (m.mode === 'run' && MP.time - m.from > 1.4) m.mode = 'hidden';
      if (m.mode === 'found' && MP.time - m.from > 3) { m.mode = 'beam'; m.from = MP.time; m.x = 176; m.y = 30; }
    },

    draw(ctx) {
      const t = MP.time;
      const gong = t - this.gongAt;
      const wob = gong < 1.6 ? Math.sin(gong * 30) * (1.6 - gong) * 0.04 : 0;   // everything wobbles
      const wobble = (x, y, fn) => {
        if (!wob) { fn(); return; }
        ctx.save(); ctx.translate(x, y); ctx.rotate(wob); ctx.translate(-x, -y); fn(); ctx.restore();
      };

      // golden walls, a red-and-gold frieze, the floor
      const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
      g.addColorStop(0, '#f6d77a'); g.addColorStop(1, '#e8b84a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(0, 18, MP.W, 6);
      ctx.fillStyle = '#ffe9a0';
      for (let x = 4; x < MP.W; x += 12) { ctx.beginPath(); ctx.moveTo(x, 24); ctx.lineTo(x + 6, 30); ctx.lineTo(x + 12, 24); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#8a4a2a';
      ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      ctx.fillStyle = 'rgba(255,220,150,0.25)';
      for (let x = 0; x < MP.W; x += 20) ctx.fillRect(x, FLOOR, 10, MP.H - FLOOR);
      // sunbeams from a high window
      ctx.fillStyle = 'rgba(255,255,220,0.25)';
      ctx.beginPath(); ctx.moveTo(196, 30); ctx.lineTo(224, 30); ctx.lineTo(250, FLOOR); ctx.lineTo(176, FLOOR); ctx.closePath(); ctx.fill();

      // the altar with flowers and candles in the middle
      wobble(172, FLOOR, () => {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(140, FLOOR - 30, 64, 30); ctx.strokeRect(140, FLOOR - 30, 64, 30);
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(140, FLOOR - 33, 64, 4); ctx.strokeRect(140, FLOOR - 33, 64, 4);
        for (const fx of [150, 194]) {
          ctx.fillStyle = '#c8913a'; ctx.fillRect(fx - 3, FLOOR - 42, 6, 9);
          for (let k = 0; k < 5; k++) { ctx.fillStyle = ['#ff8fc0', '#ffffff', '#ff9f43'][k % 3]; ctx.beginPath(); ctx.arc(fx - 6 + k * 3, FLOOR - 45 - (k % 2) * 3, 2.4, 0, Math.PI * 2); ctx.fill(); }
        }
        for (const cx of [164, 172, 180]) {
          ctx.fillStyle = '#fffaf0'; ctx.fillRect(cx - 1.5, FLOOR - 44, 3, 11); ctx.strokeRect(cx - 1.5, FLOOR - 44, 3, 11);
          ctx.fillStyle = '#ffb02e'; ctx.beginPath(); ctx.ellipse(cx + Math.sin(t * 8 + cx) * 0.4, FLOOR - 47, 1.5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      });

      // the bells (they swing when rung)
      ctx.save();
      ctx.strokeStyle = '#8a4a2a';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(16, 32); ctx.lineTo(96, 32); ctx.stroke();
      BELLS.forEach((bx, i) => {
        const since = t - this.bellAt[i];
        const sw = since < 1 ? Math.sin(since * 18) * (1 - since) * 0.5 : 0;
        ctx.save();
        ctx.translate(bx, 32);
        ctx.rotate(sw + wob * 3);
        ctx.strokeStyle = '#8a4a2a'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 8); ctx.stroke();
        ctx.fillStyle = '#f2c230'; ctx.strokeStyle = O();
        ctx.beginPath(); ctx.moveTo(-5, 20); ctx.quadraticCurveTo(-5, 8, 0, 8); ctx.quadraticCurveTo(5, 8, 5, 20); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#c8913a'; ctx.beginPath(); ctx.arc(0, 21, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (since < 0.8) MP.drawText(ctx, '♪', bx + 6, 22 - since * 20, { size: 0.8, color: '#c0392b', align: 'center' });
      });
      ctx.restore();

      // the gong on its stand
      wobble(GONG.x, FLOOR, () => {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#8a4a2a';
        ctx.fillRect(GONG.x - 20, GONG.y - 22, 3, FLOOR - GONG.y + 22); ctx.fillRect(GONG.x + 17, GONG.y - 22, 3, FLOOR - GONG.y + 22);
        ctx.fillRect(GONG.x - 22, GONG.y - 24, 44, 4);
        const shake = gong < 1.6 ? Math.sin(gong * 50) * (1.6 - gong) * 1.5 : 0;
        ctx.fillStyle = '#d8a43a';
        ctx.beginPath(); ctx.arc(GONG.x + shake, GONG.y, GONG.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#a87a2a';
        ctx.beginPath(); ctx.arc(GONG.x + shake, GONG.y, GONG.r * 0.6, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffe9a0';
        ctx.beginPath(); ctx.arc(GONG.x + shake, GONG.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      // the flower basket
      wobble(BASKET.x, FLOOR, () => {
        ctx.save();
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#c8955a';
        ctx.beginPath(); ctx.moveTo(BASKET.x - 13, BASKET.y - 14); ctx.lineTo(BASKET.x + 13, BASKET.y - 14); ctx.lineTo(BASKET.x + 10, BASKET.y + 6); ctx.lineTo(BASKET.x - 10, BASKET.y + 6); ctx.closePath(); ctx.fill(); ctx.stroke();
        for (let k = 0; k < 6; k++) { ctx.fillStyle = ['#ff8fc0', '#ffd23f', '#ffffff'][k % 3]; ctx.beginPath(); ctx.arc(BASKET.x - 10 + k * 4, BASKET.y - 16 - (k % 2) * 2, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      });

      // the sleeping cats
      CATS.forEach((c, i) => cat(ctx, c.x, c.y, c.color, t - this.catAt[i] < 2.2, t + i));

      // the shoe rack by the door, and the shoes flying into it
      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#8a4a2a';
      ctx.fillRect(RACK_X - 12, FLOOR - 12, 24, 3); ctx.fillRect(RACK_X - 12, FLOOR - 3, 24, 3);
      const u = MP.clamp((t - this.shoesAt) / 0.9, 0, 1);
      const shoeGone = this.stolen && this.stolen.kind === 'shoe';
      for (let k = 0; k < 2; k++) {
        if (k === 1 && shoeGone) continue;
        const sx = 64 + (RACK_X - 6 + k * 10 - 64) * u, sy = FLOOR - (FLOOR - (FLOOR - 15)) * u - Math.sin(u * Math.PI) * 40;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate((1 - u) * 6 * (k ? -1 : 1));
        ctx.fillStyle = '#4a78c8';
        MP.roundRect(ctx, -4, -2, 9, 4, 2); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // the red pillars (the monkey can hide behind them)
      PILLARS.forEach((px) => wobble(px, FLOOR, () => {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(px - 9, 30, 18, FLOOR - 30); ctx.strokeRect(px - 9, 30, 18, FLOOR - 30);
        ctx.fillStyle = '#f2c230';
        ctx.fillRect(px - 11, 30, 22, 6); ctx.strokeRect(px - 11, 30, 22, 6);
        ctx.fillRect(px - 11, FLOOR - 6, 22, 6); ctx.strokeRect(px - 11, FLOOR - 6, 22, 6);
        for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(px - 9, 52 + k * 24); ctx.lineTo(px + 9, 46 + k * 24); ctx.strokeStyle = '#f2c230'; ctx.stroke(); }
        ctx.restore();
      }));

      // me (in socks – no shoes in the temple)
      const outfit = Object.assign({}, MP.state.outfit, { shoes: false });
      this.player.draw(ctx, FLOOR + 4, 0, { outfit, mouth: this.hide ? 'open' : 'smile' });

      // the monkey
      const m = this.monkey;
      if (m.mode === 'run') {
        const k = MP.clamp((t - m.from) / 1.4, 0, 1);
        const tx = this.hide.x, ty = this.hide.id === 'gong' ? GONG.y - 16 : this.hide.id === 'altar' ? FLOOR - 33 : FLOOR;
        const x = m.x + (tx - m.x) * k, y = m.y + (ty - m.y) * k - Math.sin(k * Math.PI) * 30;
        monkey(ctx, x, y, { t, flip: tx < m.x, carry: this.stolen });
      } else if (m.mode === 'hidden' && this.hide) {
        // only the tail peeks out (wiggling) – and after a wrong guess it giggles
        const [hx, hy] = this.hide.tail;
        ctx.save();
        ctx.strokeStyle = '#7a4a2a';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 6, hy - 4 + Math.sin(t * 5) * 3, hx + 4, hy - 12); ctx.stroke();
        ctx.restore();
        if (t - this.wrongAt < 1) MP.drawText(ctx, 'hihi!', this.hide.x, this.hide.y - this.hide.h / 2 - 8, { size: 0.6, color: '#7a4a2a', align: 'center' });
      } else if (m.mode === 'found') {
        const bow = Math.sin(MP.clamp((t - m.from - 1) / 1.2, 0, 1) * Math.PI) * 0.5;
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(bow);
        monkey(ctx, 0, 0, { t, wave: t - m.from < 1 });
        ctx.restore();
      } else if (m.mode === 'beam') {
        monkey(ctx, m.x, m.y + 4, { t, wave: Math.floor(t / 3) % 3 === 0 });
      }

      MP.drawButton(ctx, '◀ Ulos', BACK, { size: 0.8 });
      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, this.player.x, FLOOR - 46, { maxWidth: 170, size: 0.85 });
    },
  };
})();
