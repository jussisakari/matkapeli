// igloo.js – INSIDE THE IGLOO in Talvimaa, and the penguin game.
// Two penguins, Nokka and Räpylä, live in the igloo. Tap a penguin: "Kvaak!".
// "Pingviinit perässä!" starts the game outside behind the igloo:
//   tap where to walk – the penguins waddle after you in a line, and they copy
//   what you do: Hyppää (jump), Liu'u (belly slide), Vilkuta (wave).
//   Walk over the fish 🐟: every fish brings a baby penguin to the line.
//   Too far in one go? The last penguin falls on its bottom (Plumps!) and you wait.
//   At the flag the penguins dance and you get a fish sticker.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const FLOOR = 152;
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const PLAY = { x: 196, y: 30, w: 118, h: 24 };
  const WORLD = 960;            // the snowy yard is this wide
  const FISH_X = [210, 330, 470, 610, 750];
  const FLAG_X = 900;
  const GAP = 24;               // space between the penguins in the line
  const PEN_SPEED = 62;         // penguins are a bit slower than you
  const ACTS = [
    { id: 'jump', name: 'Hyppää', r: { x: 70, y: 156, w: 58, h: 20 } },
    { id: 'slide', name: "Liu'u", r: { x: 132, y: 156, w: 58, h: 20 } },
    { id: 'wave', name: 'Vilkuta', r: { x: 194, y: 156, w: 58, h: 20 } },
  ];
  const ACT_TIME = { jump: 0.6, slide: 0.9, wave: 1.2 };

  // A penguin, side view. (x, y) = feet. o = { s, flip, slide, wave, fallen, t, jump }
  function penguin(c, x, y, o) {
    const s = o.s || 1;
    c.save();
    c.translate(x, y - (o.jump || 0));
    if (o.flip) c.scale(-1, 1);
    c.scale(s, s);
    if (o.fallen) c.rotate(-1.3);
    else if (o.slide) { c.rotate(-1.45); c.translate(0, 2); }
    else c.rotate(Math.sin((o.t || 0) * 10) * 0.08);   // waddle
    c.lineWidth = 0.8;
    c.strokeStyle = O();
    c.fillStyle = '#1f2230';
    c.beginPath(); c.ellipse(0, -9, 6, 9, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#ffffff';
    c.beginPath(); c.ellipse(1.6, -7.5, 3.8, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffb02e';
    c.beginPath(); c.moveTo(4, -14); c.lineTo(8.5, -13); c.lineTo(4, -11.6); c.closePath(); c.fill(); c.stroke();
    c.fillRect(-3, -1, 4, 1.6); c.fillRect(1, -1, 4, 1.6);
    c.fillStyle = '#ffffff';
    c.beginPath(); c.arc(2.6, -14.6, 1.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1f2230';
    c.beginPath(); c.arc(3, -14.6, 0.7, 0, Math.PI * 2); c.fill();
    // the flipper (up when waving)
    c.fillStyle = '#1f2230';
    c.save();
    c.translate(-2, -11);
    c.rotate(o.wave ? -2.2 + Math.sin((o.t || 0) * 14) * 0.4 : 0.25);
    c.beginPath(); c.ellipse(0, 4, 1.6, 4.5, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.restore();
    c.restore();
  }
  MP.drawPenguin2d = penguin;

  MP.scenes.igloo = {
    noRestart: true,

    enter() {
      this.step = 'inside';
      this.bubble = null;
      this.quackAt = [-9, -9];
      this.player = new MP.Player(60, { minX: 20, maxX: 300 });
      this.player.place(60, 1);
      this.say('Iglun sisällä on lämmin! Täällä asuvat pingviinit Nokka ja Räpylä. Napauta "Pingviinit perässä!", niin leikitään.');
    },

    say(text) {
      this.bubble = { text, from: MP.time, until: Infinity };
    },

    // ----- the game outside -----
    startGame() {
      this.step = 'game';
      this.player = new MP.Player(60, { minX: 20, maxX: WORLD - 20 });
      this.player.place(60, 1);
      this.pens = [0, 1].map((i) => ({ x: 60 - GAP * (i + 1), s: 1, fallen: -9, name: i ? 'Räpylä' : 'Nokka' }));
      this.fish = FISH_X.map((x) => ({ x, got: false }));
      this.trail = [];                    // where you have walked (every 2 units)
      for (let x = -60; x <= 60; x += 2) this.trail.push({ x });
      this.history = [];                  // what you did and when (for copying)
      this.act = null;                    // { id, from }
      this.camX = 0;
      this.doneAt = null;
      this.say('Pingviinit tulevat perässä! Napauta minne kävellään. Kokeile myös Hyppää, Liu’u ja Vilkuta!');
      MP.sfx.quack();
    },

    doAct(id) {
      if (this.act && MP.time - this.act.from < ACT_TIME[this.act.id]) return;
      this.act = { id, from: MP.time };
      this.history.push({ id, from: MP.time });
      if (id === 'jump') MP.sfx.boing();
      if (id === 'slide') { MP.sfx.tap(); this.player.walkTo(this.player.x + this.player.facing * 50); }
      if (id === 'wave') MP.sfx.quack();
    },

    // what you were doing at time t: { y (jump height), slide, wave }
    stateAt(t) {
      const a = [...this.history].reverse().find((h) => h.from <= t);
      if (!a) return {};
      const u = (t - a.from) / ACT_TIME[a.id];
      if (u < 0 || u > 1) return {};
      return { jump: a.id === 'jump' ? Math.sin(u * Math.PI) * 16 : 0, slide: a.id === 'slide', wave: a.id === 'wave' };
    },

    onTap(x, y) {
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        if (this.step === 'inside') MP.goTo(MP.scenes.winter, { from: 'igloo' });
        else { this.step = 'inside'; this.enter(); }
        return;
      }
      if (this.step === 'inside') {
        if (MP.hit(PLAY, x, y)) { this.startGame(); return; }
        [210, 250].forEach((px, i) => {
          if (Math.abs(x - px) < 12 && y > FLOOR - 30 && y < FLOOR + 4) {
            this.quackAt[i] = MP.time;
            MP.sfx.quack();
            this.say(i ? 'Räpylä sanoo: Kvaak kvaak!' : 'Nokka sanoo: Kvaak!');
          }
        });
        return;
      }
      if (this.step === 'end') return;
      for (const a of ACTS) if (MP.hit(a.r, x, y)) { this.doAct(a.id); return; }
      if (this.waitUntil && MP.time < this.waitUntil) return;    // a penguin is getting up
      this.player.walkTo(x + this.camX);
    },

    update(dt) {
      if (this.step !== 'game') { this.player.update(dt); return; }
      const t = MP.time;
      const p = this.player;
      const sliding = this.act && this.act.id === 'slide' && t - this.act.from < ACT_TIME.slide;
      p.speed = sliding ? 120 : 75;
      if (!(this.waitUntil && t < this.waitUntil)) p.update(dt);
      // remember the way
      let last = this.trail[this.trail.length - 1].x;
      while (Math.abs(p.x - last) >= 2) {
        last += Math.sign(p.x - last) * 2;
        this.trail.push({ x: last });
      }
      // the penguins walk along the same way, one after the other
      this.pens.forEach((pen, i) => {
        if (t - pen.fallen < 1.4) return;          // sitting in the snow
        const back = Math.round((i + 1) * GAP / 2);
        const target = this.trail[Math.max(0, this.trail.length - 1 - back)].x;
        const d = target - pen.x;
        pen.walking = Math.abs(d) > 0.5;
        if (pen.walking) pen.flip = d < 0;
        pen.x += Math.sign(d) * Math.min(Math.abs(d), PEN_SPEED * (sliding ? 1.6 : 1) * dt);
        // too far behind: plumps!
        if (Math.abs(target - pen.x) > 46 && !this.waitUntil) {
          pen.fallen = t;
          this.waitUntil = t + 1.6;
          p.stop();
          MP.sfx.boing();
          this.say('Plumps! ' + (pen.name || 'Pikkupingviini') + ' kaatui. Odotetaan, ei niin kovaa vauhtia!');
        }
      });
      if (this.waitUntil && t > this.waitUntil) this.waitUntil = null;
      // fish: a baby penguin joins
      for (const f of this.fish) {
        if (!f.got && Math.abs(p.x - f.x) < 10) {
          f.got = true;
          const lastPen = this.pens[this.pens.length - 1];
          this.pens.push({ x: lastPen.x - GAP, s: 0.65, fallen: -9, name: null, born: t });
          MP.sfx.bling();
          this.say('Kala! Pingviinivauva liittyy jonoon! Jonossa on nyt ' + this.pens.length + ' pingviiniä.');
        }
      }
      // the flag: finished!
      if (p.x > FLAG_X - 16 && !this.doneAt) {
        this.doneAt = t;
        this.step = 'end';
        p.stop();
        const own = (MP.state.treasures.stickers = MP.state.treasures.stickers || {});
        const first = !own.fish;
        own.fish = true;
        MP.save();
        MP.sfx.applause(2);
        this.say('Perillä! Pingviinit tanssivat!' + (first ? ' Sain kalatarran!' : ''));
      }
      this.camX = MP.clamp(p.x - 120, 0, WORLD - MP.W);
    },

    draw(ctx) {
      if (this.step === 'inside') this.drawInside(ctx);
      else this.drawGame(ctx);
      const b = this.bubble;
      if (b && MP.time >= b.from) MP.drawBubble(ctx, b.text, this.player.x - (this.step === 'inside' ? 0 : this.camX), FLOOR - 50, { maxWidth: 170, size: 0.85 });
      MP.drawButton(ctx, this.step === 'inside' ? '◀ Ulos' : '◀ Iglu', BACK, { size: 0.8 });
    },

    drawInside(ctx) {
      const t = MP.time;
      // the dome: snow blocks all around
      ctx.fillStyle = '#dceefa';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.strokeStyle = 'rgba(120,160,200,0.45)';
      ctx.lineWidth = 0.8;
      for (let r = 0; r < 8; r++) {
        const y = 10 + r * 18;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MP.W, y); ctx.stroke();
        for (let x = (r % 2) * 20; x < MP.W; x += 40) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 18); ctx.stroke(); }
      }
      // round dome shadow
      const g = ctx.createRadialGradient(160, 150, 40, 160, 150, 220);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(90,130,180,0.45)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      // the floor: snow and a cosy blanket
      ctx.fillStyle = '#f4f9ff';
      ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      ctx.fillStyle = '#e04848';
      ctx.beginPath(); ctx.ellipse(110, FLOOR + 10, 50, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd23f';
      for (let i = 0; i < 6; i++) ctx.fillRect(70 + i * 14, FLOOR + 8, 6, 3);
      // the ice window and the lantern
      ctx.fillStyle = '#bfe6ff';
      ctx.beginPath(); ctx.arc(160, 56, 16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8fbfe0'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 6; i++) ctx.fillRect(150 + (i * 7) % 20, 46 + ((i * 11 + t * 12) % 20), 1.2, 1.2);
      const glow = ctx.createRadialGradient(272, 120, 2, 272, 120, 40);
      glow.addColorStop(0, 'rgba(255,220,140,0.7)'); glow.addColorStop(1, 'rgba(255,220,140,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(220, 70, 110, 100);
      ctx.save();
      ctx.lineWidth = 0.8; ctx.strokeStyle = O();
      ctx.fillStyle = '#5a5a73'; ctx.fillRect(266, 128, 12, 3); ctx.strokeRect(266, 128, 12, 3);
      ctx.fillStyle = '#ffe9a0'; ctx.fillRect(267, 114, 10, 14); ctx.strokeRect(267, 114, 10, 14);
      ctx.fillStyle = '#ffb02e'; ctx.beginPath(); ctx.ellipse(272, 120 + Math.sin(t * 9) * 0.5, 2, 3.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // the two penguins
      [210, 250].forEach((px, i) => {
        const q = t - this.quackAt[i];
        penguin(ctx, px, FLOOR + 2 - (q < 0.4 ? Math.sin(q / 0.4 * Math.PI) * 6 : 0), { s: 1.4, flip: true, t: t + i, wave: q < 1.2 });
        MP.drawText(ctx, i ? 'Räpylä' : 'Nokka', px, FLOOR + 6, { size: 0.55, color: '#2f4a8a', align: 'center' });
      });
      this.player.draw(ctx, FLOOR + 2, 0);
      MP.drawButton(ctx, 'Pingviinit perässä!', PLAY, { size: 0.75, color: '#4a78c8', shade: '#2f4a8a' });
    },

    drawGame(ctx) {
      const t = MP.time;
      const cx = this.camX;
      const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
      g.addColorStop(0, '#a9d2f0'); g.addColorStop(1, '#eef7ff');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      // far ice hills (move slowly)
      ctx.fillStyle = '#e3f4ff';
      for (let i = 0; i < 8; i++) {
        const hx = i * 160 - cx * 0.3;
        ctx.beginPath(); ctx.moveTo(hx - 70, FLOOR); ctx.lineTo(hx, FLOOR - 50 - (i % 3) * 12); ctx.lineTo(hx + 70, FLOOR); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#f4f9ff';
      ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      ctx.save();
      ctx.translate(-cx, 0);
      // the igloo at the start
      ctx.fillStyle = '#f6fbff';
      ctx.strokeStyle = '#9fc4e0';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(20, FLOOR, 34, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#5a7fa8';
      ctx.beginPath(); ctx.arc(40, FLOOR, 10, Math.PI, 0); ctx.fill();
      // snowy little trees
      for (let x = 120; x < WORLD; x += 140) {
        ctx.fillStyle = '#2e6b4a';
        ctx.beginPath(); ctx.moveTo(x - 8, FLOOR - 30); ctx.lineTo(x, FLOOR - 52); ctx.lineTo(x + 8, FLOOR - 30); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(x - 4, FLOOR - 41); ctx.lineTo(x, FLOOR - 52); ctx.lineTo(x + 4, FLOOR - 41); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6b4a3a'; ctx.fillRect(x - 1.5, FLOOR - 30, 3, 30);
      }
      // the fish
      for (const f of this.fish) {
        if (f.got) continue;
        const fy = FLOOR - 6 + Math.sin(t * 4 + f.x) * 1.5;
        ctx.fillStyle = '#4a9be0';
        ctx.strokeStyle = O();
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.ellipse(f.x, fy, 6, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(f.x - 5, fy); ctx.lineTo(f.x - 10, fy - 3); ctx.lineTo(f.x - 10, fy + 3); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(f.x + 3, fy - 0.8, 0.9, 0, Math.PI * 2); ctx.fill();
      }
      // the flag at the end
      ctx.fillStyle = '#6b4a3a'; ctx.fillRect(FLAG_X, FLOOR - 50, 2, 50);
      ctx.fillStyle = '#e04848';
      ctx.beginPath(); ctx.moveTo(FLAG_X + 2, FLOOR - 50); ctx.lineTo(FLAG_X + 22, FLOOR - 44 + Math.sin(t * 5) * 2); ctx.lineTo(FLAG_X + 2, FLOOR - 38); ctx.closePath(); ctx.fill();
      // the penguins (they copy what you did a moment ago)
      const dancing = this.step === 'end';
      this.pens.forEach((pen, i) => {
        const st = this.stateAt(t - (i + 1) * 0.45);
        const fallen = t - pen.fallen < 1.4;
        const hop = dancing ? Math.abs(Math.sin(t * 6 + i)) * 6 : 0;
        penguin(ctx, pen.x, FLOOR + 2, {
          s: pen.s, flip: pen.flip, t: pen.walking ? t + i : 0, fallen,
          jump: (st.jump || 0) + hop, slide: st.slide && !fallen, wave: st.wave || dancing,
        });
        if (fallen) MP.drawText(ctx, 'Plumps!', pen.x, FLOOR - 30, { size: 0.6, color: '#4a78c8', outline: '#ffffff', align: 'center' });
      });
      // me
      const me = this.stateAt(t);
      const p = this.player;
      ctx.save();
      if (me.slide) {
        ctx.translate(p.x, FLOOR + 2);
        ctx.rotate(p.facing * 1.35);
        ctx.translate(-p.x, -(FLOOR + 2));
      }
      MP.drawPerson(ctx, p.x, FLOOR + 2 - (me.jump || 0), {
        walking: p.walking && !me.slide, walkTime: p.walkTime, flip: p.facing < 0, hero: true,
        armUp: me.wave || dancing ? 0.9 : 0, mouth: dancing ? 'open' : 'smile',
      });
      ctx.restore();
      ctx.restore();

      // how many fish
      MP.drawText(ctx, '🐟 ' + this.fish.filter((f) => f.got).length + ' / ' + this.fish.length, 312, 8, { size: 0.8, color: O(), align: 'right' });
      if (this.step === 'game') for (const a of ACTS) MP.drawButton(ctx, a.name, a.r, { size: 0.7, color: '#4a78c8', shade: '#2f4a8a' });
      if (this.step === 'end') {
        MP.drawConfetti(ctx, t - this.doneAt, 40);
        if (MP.state.treasures.stickers && MP.state.treasures.stickers.fish) {
          ctx.save();
          ctx.fillStyle = '#fff7e0';
          ctx.strokeStyle = O();
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(160, 40, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.restore();
          MP.drawText(ctx, '🐟', 160, 30, { size: 1.6, align: 'center' });
          MP.drawText(ctx, 'Kalatarra!', 160, 60, { size: 0.7, color: '#4a78c8', outline: '#ffffff', align: 'center' });
        }
      }
    },
  };
})();
