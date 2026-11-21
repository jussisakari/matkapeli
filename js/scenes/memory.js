// memory.js – MUISTIPELI, a memory card game with pictures from the trips.
// The game box is on top of the bookshelf in the living room.
//   Choose: easy (6 pairs) or hard (10 pairs), and alone or against mom/dad.
//   Tap two cards to turn them. A pair stays open; a wrong pair turns back.
//   Pictures come from the countries you have visited (+ things from home).
//   At the end: stars and how many tries it took (or who won).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  // ---------------------------------------------------------------------------
  // The pictures. country = only after visiting it (its poster is at home).
  // draw(c) draws around (0, 0), about 26 units big.
  // ---------------------------------------------------------------------------
  const line = (c) => { c.lineWidth = 0.8; c.strokeStyle = O(); };
  const sprite = (name, s, dy) => (c) => { c.save(); c.translate(0, dy || 0); c.scale(s, s); MP.draw(name, c, 0, 0, {}); c.restore(); };
  MP.MEMORY_PICS = [
    { id: 'pyramid', country: 'egypt', draw(c) {
      line(c);
      c.fillStyle = '#e2c28b'; c.beginPath(); c.moveTo(-12, 9); c.lineTo(0, -10); c.lineTo(12, 9); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#c9a46a'; c.beginPath(); c.moveTo(0, -10); c.lineTo(12, 9); c.lineTo(3, 9); c.closePath(); c.fill();
      MP.draw('sun', c, 0, 0, { x: 9, y: -9, r: 3 });
    } },
    { id: 'camel', country: 'egypt', draw(c) {
      line(c); c.fillStyle = '#c8955a';
      c.beginPath(); c.ellipse(-1, 0, 8, 4.5, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(-3, -4, 3.5, 3, 0, Math.PI, 0); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(6, -1); c.lineTo(9, -9); c.lineTo(12, -9); c.lineTo(12, -7); c.lineTo(10, -7); c.lineTo(8, 1); c.closePath(); c.fill(); c.stroke();
      for (const lx of [-6, -3, 3, 5]) c.fillRect(lx - 0.8, 3, 1.6, 7);
    } },
    { id: 'snowman', country: 'winter', draw(c) {
      line(c); c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(0, 5, 6.5, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.arc(0, -5, 4.5, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#ff8a2a'; c.beginPath(); c.moveTo(0, -5); c.lineTo(5, -4); c.lineTo(0, -3.6); c.closePath(); c.fill();
      c.fillStyle = O(); c.fillRect(-2, -7, 1.2, 1.2); c.fillRect(1, -7, 1.2, 1.2);
      c.fillStyle = '#e04848'; c.fillRect(-5, -1.5, 10, 2);
    } },
    { id: 'penguin', country: 'winter', draw(c) {
      line(c); c.fillStyle = '#1f2230';
      c.beginPath(); c.ellipse(0, 0, 7, 10, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(0, 2, 4.5, 7.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffb02e'; c.beginPath(); c.moveTo(-2, -4); c.lineTo(2, -4); c.lineTo(0, -1.5); c.closePath(); c.fill();
      c.fillRect(-4, 9, 3, 1.5); c.fillRect(1, 9, 3, 1.5);
      c.fillStyle = '#ffffff'; c.fillRect(-3, -7, 1.6, 1.6); c.fillRect(1.4, -7, 1.6, 1.6);
    } },
    { id: 'elephant', country: 'thailand', draw(c) {
      line(c); c.fillStyle = '#8f939e';
      c.beginPath(); c.ellipse(1, 1, 9, 6, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.arc(-7, -3, 4.5, 0, Math.PI * 2); c.fill(); c.stroke();
      c.lineWidth = 2.4; c.strokeStyle = '#8f939e';
      c.beginPath(); c.moveTo(-10, -1); c.quadraticCurveTo(-13, 5, -11, 8); c.stroke();
      c.fillStyle = '#8f939e'; for (const lx of [-4, 0, 4, 7]) c.fillRect(lx - 1.2, 5, 2.4, 5);
      c.fillStyle = '#c0392b'; c.fillRect(-1, -5, 8, 3);
    } },
    { id: 'tuktuk', country: 'thailand', draw(c) {
      line(c); c.fillStyle = '#2b6fd6';
      MP.roundRect(c, -11, -3, 20, 9, 2); c.fill(); c.stroke();
      c.fillStyle = '#ffd23f'; c.fillRect(-12, -9, 22, 2.5); c.strokeRect(-12, -9, 22, 2.5);
      c.fillStyle = '#bfe6ff'; c.fillRect(-10, -6.5, 5, 3.5);
      c.fillStyle = '#2b2b33';
      for (const wx of [-8, 6]) { c.beginPath(); c.arc(wx, 7, 2.8, 0, Math.PI * 2); c.fill(); }
    } },
    { id: 'statue', country: 'newyork', draw(c) {
      line(c); c.fillStyle = '#7fbfa6';
      c.fillRect(-3, -5, 6, 14); c.strokeRect(-3, -5, 6, 14);
      c.beginPath(); c.arc(0, -7, 3, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillRect(2, -16, 1.6, 10);
      c.fillStyle = '#ffcc33'; c.beginPath(); c.arc(2.8, -16.5, 2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#7fbfa6'; for (let i = -2; i <= 2; i++) c.fillRect(i * 1.6 - 0.4, -11.5, 0.8, 2);
      c.fillStyle = '#c9b99a'; c.fillRect(-6, 9, 12, 3);
    } },
    { id: 'taxiNY', country: 'newyork', draw(c) {
      line(c); c.fillStyle = '#ffd23f';
      MP.roundRect(c, -12, -2, 24, 8, 2); c.fill(); c.stroke();
      MP.roundRect(c, -6, -8, 12, 7, 2); c.fill(); c.stroke();
      c.fillStyle = '#bfe6ff'; c.fillRect(-4.5, -6.5, 4, 4.5); c.fillRect(0.5, -6.5, 4, 4.5);
      c.fillStyle = '#2b2b33'; for (const wx of [-7, 7]) { c.beginPath(); c.arc(wx, 6.5, 2.6, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#ffffff'; c.fillRect(-2, -11, 4, 2.5);
    } },
    { id: 'kangaroo', country: 'australia', draw(c) {
      line(c); c.fillStyle = '#b5764a';
      c.beginPath(); c.ellipse(1, 2, 5, 8, 0.3, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(-3, -8, 3, 2.4, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillRect(-4.5, -13, 1.4, 4); c.fillRect(-2.5, -13, 1.4, 4);
      c.beginPath(); c.moveTo(4, 7); c.quadraticCurveTo(12, 10, 13, 6); c.lineTo(5, 9); c.fill();
      c.fillStyle = '#e3b98f'; c.beginPath(); c.ellipse(-1, 3, 2.4, 3.4, 0.3, 0, Math.PI * 2); c.fill();
    } },
    { id: 'koala', country: 'australia', draw(c) {
      line(c); c.fillStyle = '#9a9aa5';
      for (const ex of [-7, 7]) { c.beginPath(); c.arc(ex, -5, 4, 0, Math.PI * 2); c.fill(); c.stroke(); }
      c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#2b2b33'; c.beginPath(); c.ellipse(0, 1.5, 2.4, 3.2, 0, 0, Math.PI * 2); c.fill();
      c.fillRect(-4, -3, 1.6, 1.6); c.fillRect(2.4, -3, 1.6, 1.6);
    } },
    { id: 'torii', country: 'japan', draw(c) {
      c.fillStyle = '#d8342c'; line(c);
      c.fillRect(-12, -10, 24, 3); c.strokeRect(-12, -10, 24, 3);
      c.fillRect(-9, -5, 18, 2);
      c.fillRect(-7, -7, 2.6, 18); c.fillRect(4.4, -7, 2.6, 18);
    } },
    { id: 'sushi', country: 'japan', draw(c) {
      line(c);
      c.fillStyle = '#ffffff'; MP.roundRect(c, -9, -1, 18, 7, 3); c.fill(); c.stroke();
      c.fillStyle = '#ff8a5a'; MP.roundRect(c, -10, -5, 20, 5, 2.5); c.fill(); c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 0.6;
      for (const sx of [-5, 0, 5]) { c.beginPath(); c.moveTo(sx - 1, -4.5); c.lineTo(sx + 1, -0.5); c.stroke(); }
    } },
    { id: 'teddy', draw: sprite('teddy', 1.2, 9) },
    { id: 'panda', draw: sprite('panda', 1.2, 9) },
    { id: 'elephantToy', draw: sprite('elephantToy', 1.2, 9) },
    { id: 'apple', draw: sprite('apple', 1.6) },
    { id: 'banana', draw: sprite('banana', 1.6) },
    { id: 'strawberries', draw: sprite('strawberries', 1.7) },
    { id: 'carrot', draw: sprite('carrot', 1.6) },
    { id: 'sun', draw(c) { MP.draw('sun', c, 0, 0, { x: 0, y: 0, r: 7 }); } },
    { id: 'yoghurt', draw: sprite('yoghurt', 1.6) },
    { id: 'ricepie', draw: sprite('ricepie', 1.6) },
  ];

  const LEVELS = {
    easy: { pairs: 6, cols: 4, rows: 3, w: 56, h: 44 },
    hard: { pairs: 10, cols: 5, rows: 4, w: 50, h: 33 },
  };
  const cardRect = (lv, i) => {
    const L = LEVELS[lv];
    const gx = 6, gy = 5;
    const x0 = (MP.W - (L.cols * L.w + (L.cols - 1) * gx)) / 2;
    const y0 = 28 + (146 - (L.rows * L.h + (L.rows - 1) * gy)) / 2;
    return { x: x0 + (i % L.cols) * (L.w + gx), y: y0 + Math.floor(i / L.cols) * (L.h + gy), w: L.w, h: L.h };
  };
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const BTN = {
    easy: { x: 46, y: 60, w: 104, h: 30 },
    hard: { x: 170, y: 60, w: 104, h: 30 },
    solo: { x: 46, y: 112, w: 104, h: 26 },
    versus: { x: 170, y: 112, w: 104, h: 26 },
  };
  const AGAIN = { x: 120, y: 128, w: 80, h: 22 };

  const visited = (id) => !!(MP.state.treasures && MP.state.treasures.posters && MP.state.treasures.posters[id]);

  MP.scenes.memory = {
    noRestart: true,

    enter() {
      this.step = 'menu';
      this.level = 'easy';
      this.versus = false;
      this.who = MP.state.lastParent === 'dad' ? 'dad' : 'mom';
      this.bubble = null;
    },

    start() {
      const L = LEVELS[this.level];
      // pictures from visited countries first, then things from home
      const trip = MP.MEMORY_PICS.filter((p) => p.country && visited(p.country));
      const home = MP.MEMORY_PICS.filter((p) => !p.country);
      const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
      const pics = shuffle(trip).concat(shuffle(home)).slice(0, L.pairs);
      this.cards = shuffle(pics.concat(pics).map((p) => ({ pic: p, open: false, done: false, by: null })));
      this.open = [];          // the (max 2) cards turned this turn
      this.tries = 0;
      this.turn = 'me';
      this.score = { me: 0, parent: 0 };
      this.seen = {};          // what mom/dad remembers: index → pic id
      this.closeAt = null;
      this.botAt = null;
      this.step = 'play';
      this.endAt = null;
      this.bubble = null;
      MP.sfx.bling();
    },

    flip(i) {
      const c = this.cards[i];
      if (c.open || c.done || this.open.length >= 2) return;
      c.open = true;
      c.flipAt = MP.time;
      this.open.push(i);
      this.seen[i] = c.pic.id;
      MP.sfx.tap();
      if (this.open.length === 2) {
        this.tries += this.turn === 'me' ? 1 : 0;
        const [a, b] = this.open.map((k) => this.cards[k]);
        if (a.pic.id === b.pic.id) {
          a.done = b.done = true;
          a.by = b.by = this.turn;
          this.score[this.turn]++;
          this.open = [];
          MP.sfx.bling();
          if (this.cards.every((k) => k.done)) this.finish();
          else if (this.turn === 'parent') this.botAt = MP.time + 1.1;   // a pair: play again
        } else {
          this.closeAt = MP.time + 1.1;
        }
      }
    },

    finish() {
      this.step = 'end';
      this.endAt = MP.time;
      MP.sfx.applause(2);
      const pairs = LEVELS[this.level].pairs;
      this.stars = this.tries <= pairs * 1.5 ? 3 : this.tries <= pairs * 2.2 ? 2 : 1;
    },

    // mom or dad takes a turn: remembers some of the cards it has seen
    botStep() {
      const free = this.cards.map((c, i) => i).filter((i) => !this.cards[i].done && !this.cards[i].open);
      if (!free.length) return;
      const memory = (i) => (Math.random() < 0.6 ? this.seen[i] : null);
      if (this.open.length === 0) {
        // a known pair?
        for (const i of free) {
          const id = memory(i);
          if (!id) continue;
          const j = free.find((k) => k !== i && this.seen[k] === id);
          if (j != null) { this.flip(i); this.botNext = j; this.botAt = MP.time + 0.8; return; }
        }
        this.flip(free[Math.floor(Math.random() * free.length)]);
        this.botNext = null;
        this.botAt = MP.time + 0.8;
      } else {
        const first = this.cards[this.open[0]];
        let j = this.botNext;
        if (j == null) j = free.find((k) => this.seen[k] === first.pic.id && Math.random() < 0.7);
        if (j == null) j = free[Math.floor(Math.random() * free.length)];
        this.botNext = null;
        this.flip(j);
        if (this.open.length) this.botAt = null;
      }
    },

    onTap(x, y) {
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        if (this.step === 'menu') MP.goTo(MP.scenes.home);
        else this.step = 'menu';
        return;
      }
      if (this.step === 'menu') {
        if (MP.hit(BTN.easy, x, y)) { this.level = 'easy'; this.start(); }
        else if (MP.hit(BTN.hard, x, y)) { this.level = 'hard'; this.start(); }
        else if (MP.hit(BTN.solo, x, y)) { this.versus = false; MP.sfx.tap(); }
        else if (MP.hit(BTN.versus, x, y)) { this.versus = true; MP.sfx.tap(); }
        return;
      }
      if (this.step === 'end') {
        if (MP.time - this.endAt > 0.8 && MP.hit(AGAIN, x, y)) this.start();
        return;
      }
      if (this.turn !== 'me' || this.closeAt) return;
      for (let i = 0; i < this.cards.length; i++) {
        if (MP.hit(cardRect(this.level, i), x, y)) { this.flip(i); return; }
      }
    },

    update() {
      if (this.step !== 'play') return;
      if (this.closeAt && MP.time > this.closeAt) {
        for (const k of this.open) this.cards[k].open = false;
        this.open = [];
        this.closeAt = null;
        if (this.versus) {
          this.turn = this.turn === 'me' ? 'parent' : 'me';
          if (this.turn === 'parent') this.botAt = MP.time + 0.7;
        }
      }
      if (this.versus && this.turn === 'parent' && this.botAt && MP.time > this.botAt && !this.closeAt) this.botStep();
    },

    draw(ctx) {
      const t = MP.time;
      ctx.fillStyle = '#cfe8c8';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let x = 0; x < MP.W; x += 16) ctx.fillRect(x, 0, 7, MP.H);
      MP.drawText(ctx, 'Muistipeli', MP.W / 2, 4, { size: 1.3, color: '#ffffff', outline: O(), align: 'center' });
      MP.drawButton(ctx, this.step === 'menu' ? '◀ Takaisin' : '◀ Valikko', BACK, { size: 0.75 });

      if (this.step === 'menu') {
        MP.drawText(ctx, 'Valitse peli:', MP.W / 2, 40, { size: 1, color: O(), align: 'center' });
        MP.drawButton(ctx, 'Helppo (6 paria)', BTN.easy, { size: 0.75 });
        MP.drawButton(ctx, 'Vaikea (10 paria)', BTN.hard, { size: 0.75, color: '#e07a3a', shade: '#a8552a' });
        const P = MP.PARENTS[this.who];
        MP.drawButton(ctx, (this.versus ? '' : '✓ ') + 'Yksin', BTN.solo, { size: 0.75, color: this.versus ? '#9aa3b5' : '#4a78c8', shade: this.versus ? '#6b7385' : '#2f4a8a' });
        MP.drawButton(ctx, (this.versus ? '✓ ' : '') + P.name + ' vastaan', BTN.versus, { size: 0.75, color: this.versus ? '#4a78c8' : '#9aa3b5', shade: this.versus ? '#2f4a8a' : '#6b7385' });
        const trips = MP.MEMORY_PICS.filter((p) => p.country && visited(p.country)).length;
        MP.drawText(ctx, trips ? 'Kortteja ' + trips + ' matkakuvasta!' : 'Matkusta, niin saat matkakuvia peliin!', MP.W / 2, 150, { size: 0.7, color: '#6b5f80', align: 'center' });
        return;
      }

      // the cards
      this.cards.forEach((c, i) => {
        const r = cardRect(this.level, i);
        // turning: squeeze the card sideways
        const since = c.flipAt != null ? t - c.flipAt : 9;
        const showFace = c.open || c.done;
        const squeeze = since < 0.18 ? Math.abs(Math.cos(since / 0.18 * Math.PI / 2 + Math.PI / 2)) : 1;
        ctx.save();
        ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
        ctx.scale(Math.max(0.05, squeeze), 1);
        ctx.lineWidth = c.done ? 1.6 : 0.9;
        ctx.strokeStyle = c.done ? (c.by === 'parent' ? '#e07a3a' : '#3cb371') : O();
        if (showFace) {
          ctx.fillStyle = '#ffffff';
          MP.roundRect(ctx, -r.w / 2, -r.h / 2, r.w, r.h, 5); ctx.fill(); ctx.stroke();
          ctx.save();
          const s = Math.min(r.w, r.h) / 30;
          ctx.scale(s, s);
          c.pic.draw(ctx);
          ctx.restore();
        } else {
          ctx.fillStyle = '#4a78c8';
          MP.roundRect(ctx, -r.w / 2, -r.h / 2, r.w, r.h, 5); ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.arc(k * 9, 0, 2.4, 0, Math.PI * 2); ctx.fill(); }
          MP.drawText(ctx, '?', 0, -6, { size: 1.2, color: '#ffffff', align: 'center' });
        }
        ctx.restore();
      });

      // whose turn / tries
      if (this.versus) {
        const P = MP.PARENTS[this.who];
        MP.drawText(ctx, 'Minä ' + this.score.me + '   ' + P.name + ' ' + this.score.parent, 312, 8, { size: 0.65, color: O(), align: 'right' });
        if (this.step === 'play') MP.drawText(ctx, this.turn === 'me' ? 'Sinun vuorosi' : P.name + ' miettii…', 312, 17, { size: 0.6, color: this.turn === 'me' ? '#3cb371' : '#e07a3a', align: 'right' });
      } else {
        MP.drawText(ctx, 'Yrityksiä: ' + this.tries, 312, 8, { size: 0.7, color: O(), align: 'right' });
      }

      if (this.step === 'end') {
        ctx.save();
        ctx.fillStyle = 'rgba(13,20,51,0.45)';
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.lineWidth = 1;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#fff7e0';
        MP.roundRect(ctx, 70, 34, 180, 124, 10); ctx.fill(); ctx.stroke();
        ctx.restore();
        const P = MP.PARENTS[this.who];
        let title = 'Hienoa muisti!';
        if (this.versus) title = this.score.me > this.score.parent ? 'Voitit!' : this.score.me < this.score.parent ? P.name + ' voitti!' : 'Tasapeli!';
        MP.drawText(ctx, title, 160, 42, { size: 1.3, color: '#e0559a', align: 'center' });
        if (!this.versus) {
          for (let i = 0; i < 3; i++) {
            const on = i < this.stars && t - this.endAt > 0.3 + i * 0.3;
            ctx.save();
            ctx.translate(126 + i * 34, 82);
            ctx.scale(on ? 1 + Math.max(0, 0.4 - (t - this.endAt - 0.3 - i * 0.3)) : 1, on ? 1 + Math.max(0, 0.4 - (t - this.endAt - 0.3 - i * 0.3)) : 1);
            ctx.fillStyle = on ? '#ffd23f' : '#d8d8e0';
            ctx.strokeStyle = O();
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let k = 0; k < 10; k++) {
              const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 5 : 12;
              ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
            }
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.restore();
          }
          MP.drawText(ctx, this.tries + ' yritystä', 160, 102, { size: 0.9, color: O(), align: 'center' });
        } else {
          MP.drawText(ctx, 'Minä ' + this.score.me + ' paria', 160, 70, { size: 0.9, color: '#3cb371', align: 'center' });
          MP.drawText(ctx, P.name + ' ' + this.score.parent + ' paria', 160, 86, { size: 0.9, color: '#e07a3a', align: 'center' });
          MP.drawText(ctx, 'Kiva peli!', 160, 104, { size: 0.9, color: O(), align: 'center' });
        }
        if (t - this.endAt > 0.8) MP.drawButton(ctx, 'Uudestaan', AGAIN, { size: 0.85 });
        if (t - this.endAt < 4) MP.drawConfetti(ctx, t - this.endAt, 40);
      }
    },
  };
})();
