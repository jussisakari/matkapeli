// postcard.js – POSTCARDS from the trips.
//   At every foreign airport there is a postcard stand by the doors. Tap it:
//   1. Choose a picture card (the country's landscape, its flag with the
//      passport stamp) – or draw your own picture with a finger.
//   2. Choose a sticker and a short greeting ("Terveisiä matkalta!",
//      "Täällä on kuuma!"…).
//   3. Tap the card and it goes into the mailbox.
//   The postcards are saved (treasures.postcards): at home they hang on the
//   fridge door (tap them to look at them), Mummi and Ukki have them on their
//   wall in New York, and the kids' news on TV reads out the latest one.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const MAX_CARDS = 12;
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const NEXT = { x: 236, y: 152, w: 80, h: 22 };
  const PREV_V = { x: 6, y: 80, w: 24, h: 24 };
  const NEXT_V = { x: 290, y: 80, w: 24, h: 24 };
  const DRAW_AREA = { x: 60, y: 30, w: 200, h: 112 };
  const INKS = ['#2b2340', '#e04848', '#4a78c8', '#2e8b57', '#ffb02e', '#e0559a'];
  const inkBtn = (i) => ({ x: 274, y: 34 + i * 18, r: 7 });
  const STICKERS = ['heart', 'star', 'sun', 'pet'];
  const pickCard = (i) => ({ x: 14 + i * 102, y: 40, w: 90, h: 64 });
  const stickBtn = (i) => ({ x: 52 + i * 72, y: 128, r: 16 });
  const greetBtn = (i) => ({ x: 20 + (i % 2) * 144, y: 118 + Math.floor(i / 2) * 26, w: 136, h: 22 });

  function greetings(d) {
    const cold = d && (d.land === 'snow' || d.id === 'winter');
    return ['Terveisiä matkalta!', cold ? 'Täällä on kylmä! Brrr!' : 'Täällä on kuuma!', 'Ikävä teitä!', 'Täällä on ihanaa!'];
  }

  // ---------------------------------------------------------------------------
  // Drawing a postcard's picture side (card = a saved postcard) into x, y, w, h
  // ---------------------------------------------------------------------------
  function stickerDraw(c, id, x, y, r) {
    c.save();
    c.translate(x, y);
    c.lineWidth = 0.6; c.strokeStyle = O();
    if (id === 'heart') {
      c.fillStyle = '#ff5d8f';
      c.beginPath(); c.moveTo(0, r * 0.8);
      c.bezierCurveTo(-r * 1.4, -r * 0.2, -r * 0.6, -r * 1.2, 0, -r * 0.4);
      c.bezierCurveTo(r * 0.6, -r * 1.2, r * 1.4, -r * 0.2, 0, r * 0.8);
      c.fill(); c.stroke();
    } else if (id === 'star') {
      c.fillStyle = '#ffd23f';
      c.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      c.closePath(); c.fill(); c.stroke();
    } else if (id === 'sun') {
      c.fillStyle = '#ffb02e';
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.arc(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85, r * 0.2, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(0, 0, r * 0.6, 0, Math.PI * 2); c.fill(); c.stroke();
    } else if (MP.myPet()) {
      MP.drawPet(c, 0, r * 0.7, { kind: MP.myPet().kind, scale: r / 7, sit: true });
    }
    c.restore();
  }

  MP.drawPostcard = function (c, card, x, y, w, h) {
    const d = MP.findDestination(card.country) || {};
    c.save();
    c.fillStyle = '#ffffff';
    c.fillRect(x, y, w, h);
    c.beginPath(); c.rect(x + 1, y + 1, w - 2, h - 2); c.clip();
    if (card.kind === 'land' && d.land) {
      MP.drawLandscape(c, d.land, { x: x + 1, y: y + 1, w: w - 2, h: h - 2 }, 0);
    } else if (card.kind === 'flag' && d.flag) {
      c.fillStyle = '#fff7e0'; c.fillRect(x, y, w, h);
      d.flag(c, x + w * 0.08, y + h * 0.12, w * 0.4, h * 0.36);
      if (MP.drawStamp) MP.drawStamp(c, card.country, x + w * 0.72, y + h * 0.58, w / 70, 0.9);
    } else if (card.kind === 'draw') {
      c.fillStyle = '#fffdf5'; c.fillRect(x, y, w, h);
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.lineWidth = Math.max(0.6, w / 60);
      for (const st of card.strokes || []) {
        c.strokeStyle = st.c;
        c.beginPath();
        st.p.forEach(([px, py], i) => { const sx = x + px * w, sy = y + py * h; i ? c.lineTo(sx, sy) : c.moveTo(sx, sy); });
        c.stroke();
      }
    }
    c.restore();
    c.save();
    c.strokeStyle = O(); c.lineWidth = 0.6;
    c.strokeRect(x, y, w, h);
    c.restore();
    if (w >= 40) MP.drawText(c, (d.name || '').toUpperCase(), x + w / 2, y + h - Math.max(7, h * 0.16), { size: Math.max(0.35, w / 160), color: '#ffffff', outline: O(), align: 'center' });
    if (card.sticker) stickerDraw(c, card.sticker, x + w - w * 0.12, y + h * 0.18, Math.max(2.2, w * 0.08));
  };
  MP.postcards = () => ((MP.state.treasures || {}).postcards || []);

  MP.scenes.postcard = {
    noRestart: true,

    // params.country: making a card in that country; params.view: looking at the cards at home
    enter(params) {
      params = params || {};
      this.view = !!params.view;
      this.country = params.country || 'egypt';
      this.dest = MP.findDestination(this.country);
      this.card = { country: this.country, kind: null, strokes: [], sticker: null, greeting: null };
      this.step = this.view ? 'view' : 'pick';
      this.at = Math.max(0, MP.postcards().length - 1);
      this.mailFrom = null;
      this.drawing = null;
      this.ink = INKS[0];
      if (this.view) this.say(MP.postcards().length ? 'Postikortit jääkaapin ovessa! Selaa nuolilla.' : 'Ei vielä postikortteja. Lähetä kortti matkalta – lentokentällä on korttiteline!');
      else this.say('Postikortteja! Valitse kuva – tai piirrä oma.');
    },

    say(text) { this.bubble = { text, from: MP.time, until: Infinity }; },

    leave() {
      MP.sfx.tap();
      if (this.view) MP.goTo(MP.scenes.home);
      else MP.goTo(MP.scenes.airport, { country: this.country });
    },

    onPointerDown(x, y) {
      if (this.step === 'draw' && MP.hit(DRAW_AREA, x, y)) {
        this.drawing = { c: this.ink, p: [[(x - DRAW_AREA.x) / DRAW_AREA.w, (y - DRAW_AREA.y) / DRAW_AREA.h]] };
        this.card.strokes.push(this.drawing);
      }
    },
    onPointerMove(x, y) {
      const d = this.drawing;
      if (!d) return;
      const px = MP.clamp((x - DRAW_AREA.x) / DRAW_AREA.w, 0, 1), py = MP.clamp((y - DRAW_AREA.y) / DRAW_AREA.h, 0, 1);
      const last = d.p[d.p.length - 1];
      const total = this.card.strokes.reduce((n, s) => n + s.p.length, 0);
      if (Math.hypot(px - last[0], py - last[1]) > 0.012 && total < 600) d.p.push([Math.round(px * 100) / 100, Math.round(py * 100) / 100]);
    },
    onPointerUp() { this.drawing = null; },

    onTap(x, y) {
      if (MP.hit(BACK, x, y)) { this.leave(); return; }
      const s = this.step;
      if (s === 'view') {
        const n = MP.postcards().length;
        if (MP.hit(PREV_V, x, y) && n) { this.at = (this.at + n - 1) % n; MP.sfx.tap(); }
        if (MP.hit(NEXT_V, x, y) && n) { this.at = (this.at + 1) % n; MP.sfx.tap(); }
        return;
      }
      if (s === 'pick') {
        ['land', 'flag', 'draw'].forEach((k, i) => {
          if (!MP.hit(pickCard(i), x, y)) return;
          this.card.kind = k;
          MP.sfx.tap();
          if (k === 'draw') { this.step = 'draw'; this.say('Piirrä sormella! Valitse väri oikealta. Lopuksi "Valmis".'); }
          else { this.step = 'sticker'; this.say('Valitse tarra kortin kulmaan.'); }
        });
        return;
      }
      if (s === 'draw') {
        INKS.forEach((col, i) => { const b = inkBtn(i); if (Math.hypot(x - b.x, y - b.y) < b.r + 3) { this.ink = col; MP.sfx.tap(); } });
        if (MP.hit(NEXT, x, y) && this.card.strokes.length) { this.step = 'sticker'; MP.sfx.tap(); this.say('Hieno piirros! Valitse tarra.'); }
        return;
      }
      if (s === 'sticker') {
        STICKERS.forEach((st, i) => {
          const b = stickBtn(i);
          if (Math.hypot(x - b.x, y - b.y) < b.r + 3 && (st !== 'pet' || MP.myPet())) {
            this.card.sticker = st; this.step = 'greet'; MP.sfx.boing();
            this.say('Mitä kirjoitetaan?');
          }
        });
        return;
      }
      if (s === 'greet') {
        greetings(this.dest).forEach((g, i) => {
          if (!MP.hit(greetBtn(i), x, y)) return;
          this.card.greeting = g; this.step = 'mail'; MP.sfx.tap();
          this.say('Valmis! Napauta korttia, niin se menee postilaatikkoon.');
        });
        return;
      }
      if (s === 'mail' && this.mailFrom == null && x < 200) {
        this.mailFrom = MP.time;
        MP.sfx.tap();
        setTimeout(() => {
          if (MP.scene !== this) return;
          MP.sfx.bling();
          MP.state.treasures = MP.state.treasures || {};
          const list = MP.state.treasures.postcards = (MP.state.treasures.postcards || []);
          list.push(Object.assign({ time: Date.now() }, this.card));
          while (list.length > MAX_CARDS) list.shift();
          MP.save();
          this.step = 'sent';
          this.say('Postikortti lähti! Se tulee kotiin jääkaapin oveen – ja Mummille ja Ukille seinälle.');
        }, 1100);
      }
      if (s === 'sent' && MP.hit(NEXT, x, y)) this.leave();
    },

    update() {},

    draw(ctx) {
      const t = MP.time;
      ctx.fillStyle = '#fff3d6'; ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(74,120,200,0.12)';
      for (let x = 0; x < MP.W; x += 20) for (let y = 0; y < MP.H; y += 20) ctx.fillRect(x + 8, y + 8, 4, 4);
      const s = this.step;
      const d = this.dest;

      if (s === 'view') {
        const list = MP.postcards();
        const card = list[this.at];
        if (card) {
          MP.drawPostcard(ctx, card, 36, 34, 140, 96);
          // the back side: the greeting and the stamp
          ctx.fillStyle = '#ffffff'; ctx.strokeStyle = O(); ctx.lineWidth = 0.8;
          ctx.fillRect(184, 34, 104, 96); ctx.strokeRect(184, 34, 104, 96);
          ctx.beginPath(); ctx.moveTo(236, 44); ctx.lineTo(236, 122); ctx.stroke();
          // the greeting, a few words per line
          const words = (card.greeting || '').split(' ');
          const lines = [];
          for (const w of words) { if (lines.length && (lines[lines.length - 1] + ' ' + w).length <= 10) lines[lines.length - 1] += ' ' + w; else lines.push(w); }
          lines.forEach((ln, i) => MP.drawText(ctx, ln, 210, 50 + i * 9, { size: 0.55, color: '#4a78c8', align: 'center' }));
          MP.drawText(ctx, 'Terveisin', 210, 96, { size: 0.5, color: '#4a78c8', align: 'center' });
          MP.drawText(ctx, MP.state.character === 'boy' ? 'Matkaaja' : 'Ella', 210, 106, { size: 0.65, color: '#4a78c8', align: 'center' });
          MP.drawText(ctx, 'Koti', 262, 70, { size: 0.5, color: O(), align: 'center' });
          MP.drawText(ctx, 'Suomi', 262, 80, { size: 0.5, color: O(), align: 'center' });
          ctx.fillStyle = '#ffd23f'; ctx.fillRect(266, 40, 16, 18); ctx.strokeRect(266, 40, 16, 18);
          MP.drawText(ctx, (this.at + 1) + ' / ' + list.length, 160, 140, { size: 0.7, color: O(), align: 'center' });
          if (list.length > 1) { MP.drawButton(ctx, '◀', PREV_V, { size: 0.9 }); MP.drawButton(ctx, '▶', NEXT_V, { size: 0.9 }); }
        }
      } else if (s === 'pick') {
        ['land', 'flag', 'draw'].forEach((k, i) => {
          const r = pickCard(i);
          if (k === 'draw') {
            ctx.fillStyle = '#fffdf5'; ctx.strokeStyle = O(); ctx.lineWidth = 0.8;
            ctx.fillRect(r.x, r.y, r.w, r.h); ctx.strokeRect(r.x, r.y, r.w, r.h);
            MP.drawText(ctx, '✏️', r.x + r.w / 2, r.y + 14, { size: 2, align: 'center' });
            MP.drawText(ctx, 'Piirrä itse', r.x + r.w / 2, r.y + r.h - 14, { size: 0.7, color: O(), align: 'center' });
          } else MP.drawPostcard(ctx, { country: this.country, kind: k }, r.x, r.y, r.w, r.h);
        });
      } else if (s === 'draw') {
        ctx.fillStyle = '#fffdf5'; ctx.strokeStyle = O(); ctx.lineWidth = 1;
        ctx.fillRect(DRAW_AREA.x, DRAW_AREA.y, DRAW_AREA.w, DRAW_AREA.h); ctx.strokeRect(DRAW_AREA.x, DRAW_AREA.y, DRAW_AREA.w, DRAW_AREA.h);
        MP.drawPostcard(ctx, this.card, DRAW_AREA.x, DRAW_AREA.y, DRAW_AREA.w, DRAW_AREA.h);
        INKS.forEach((col, i) => {
          const b = inkBtn(i);
          ctx.fillStyle = col; ctx.lineWidth = this.ink === col ? 2 : 0.8; ctx.strokeStyle = O();
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        });
        if (this.card.strokes.length) MP.drawButton(ctx, 'Valmis ▶', NEXT, { size: 0.8 });
      } else {
        // the card so far, big on the left
        const fly = this.mailFrom != null ? MP.clamp((t - this.mailFrom) / 1, 0, 1) : 0;
        if (s !== 'sent') {
          const w = MP.lerp(150, 30, fly), h = w * 0.66;
          const x = MP.lerp(24, 248, fly * fly), y = MP.lerp(s === 'mail' ? 40 : 26, 62, fly);
          MP.drawPostcard(ctx, this.card, x, y, w, h);
          if (this.card.greeting && fly < 0.3) MP.drawText(ctx, '"' + this.card.greeting + '"', 24 + 75, y + h + 6, { size: 0.7, color: '#4a78c8', align: 'center' });
        }
        if (s === 'sticker') {
          STICKERS.forEach((st, i) => {
            const b = stickBtn(i);
            if (st === 'pet' && !MP.myPet()) return;
            ctx.fillStyle = '#ffffff'; ctx.strokeStyle = O(); ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            stickerDraw(ctx, st, b.x, b.y, 10);
          });
        } else if (s === 'greet') {
          greetings(d).forEach((g, i) => MP.drawButton(ctx, g, greetBtn(i), { size: 0.65, color: '#4cc9f0', shade: '#2a8fb5' }));
        }
        if (s === 'mail' || s === 'sent') {
          // the mailbox
          ctx.save();
          ctx.lineWidth = 1; ctx.strokeStyle = O();
          ctx.fillStyle = '#8a93a6'; ctx.fillRect(262, 110, 6, 46);
          ctx.fillStyle = '#ffb02e'; MP.roundRect(ctx, 236, 50, 58, 62, 8); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#2b2340'; ctx.fillRect(246, 62, 38, 5);
          ctx.restore();
          MP.drawText(ctx, 'POSTI', 265, 80, { size: 0.8, color: '#2b2340', align: 'center' });
          if (s === 'sent') {
            MP.drawPostcard(ctx, this.card, 40, 40, 150, 99);
            MP.drawButton(ctx, 'Takaisin ▶', NEXT, { size: 0.8 });
          }
        }
      }

      MP.drawButton(ctx, '◀ Takaisin', BACK, { size: 0.75 });
      if (!this.view && d) MP.drawText(ctx, 'POSTIKORTTI: ' + d.name.toUpperCase(), 200, 9, { size: 0.65, color: '#4a78c8', align: 'center' });
      const b = this.bubble;
      if (b && t >= b.from && s !== 'draw') MP.drawBubble(ctx, b.text, 200, s === 'view' ? 30 : 34, { maxWidth: 190, size: 0.75 });
    },
  };
})();
