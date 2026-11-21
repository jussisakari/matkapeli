// baking.js – BAKING in the kitchen with mom or dad: pulla or a cake.
// Tap the recipe card on the fridge door at home to come here.
//   1. Choose: pulla (buns) or a cake.
//   2. Put the things into the bowl: drag them over the bowl (or just tap them).
//   3. Stir: move your finger round and round in the bowl.
//   Pulla: 4. knead the dough (tap it), 5. tap to make buns on the tray,
//          6. swipe over the buns to sprinkle pearl sugar.
//   Cake:  4. tap the bowl to pour the batter into the cake tin.
//   Then the oven: mom or dad switches it on, the timer counts down… DING!
//   Cake: choose the frosting color, then tap the cake to put strawberries,
//         sprinkles and candles on it.
//   At the end everybody eats: "Mmm!" – and the buns or the cake are on the
//   kitchen table at home.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const TOP = 128;                       // the counter top
  const BOWL = { x: 104, y: 116, r: 30 };
  const TRAY = { x: 148, y: 112, w: 88, h: 14 };
  const OVEN = { x: 244, y: 62, w: 66, h: 66 };
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const DONE = { x: 236, y: 4, w: 80, h: 20 };
  const STIR_ROUNDS = 4;
  const KNEADS = 8;
  const BUNS = 8;
  const SUGAR_NEEDED = 260;              // how far to swipe over the buns
  const BAKE_TIME = 6;

  const KINDS = [
    { id: 'pulla', name: 'Pullaa', card: { x: 52, y: 52, w: 100, h: 86 } },
    { id: 'cake', name: 'Kakku', card: { x: 168, y: 52, w: 100, h: 86 } },
  ];
  // Things that go into the bowl (cake gets eggs too)
  const THINGS = {
    flour: { name: 'jauhot', color: '#f4efe6' },
    sugar: { name: 'sokeri', color: '#ffffff' },
    milk:  { name: 'maito', color: '#fdfdf8' },
    eggs:  { name: 'kananmunat', color: '#ffe08a' },
  };
  const FROSTINGS = [
    { id: 'pink', name: 'Vaaleanpunainen', color: '#ff9ec4' },
    { id: 'white', name: 'Valkoinen', color: '#fffaf0' },
    { id: 'choco', name: 'Suklaa', color: '#7a4a2a' },
    { id: 'blue', name: 'Sininen', color: '#8fd3ff' },
  ];
  const frostBtn = (i) => ({ x: 22 + i * 72, y: 150, w: 66, h: 22 });
  const TOOLS = [
    { id: 'berry', name: 'Mansikka' },
    { id: 'sprinkle', name: 'Nonparellit' },
    { id: 'candle', name: 'Kynttilä' },
  ];
  const toolBtn = (i) => ({ x: 84 + i * 66, y: 150, w: 62, h: 22 });
  const CAKE = { x: 150, y: 124, w: 96, h: 40 };   // middle of the bottom, width, height

  const thingHome = (i) => ({ x: 164 + i * 24, y: TOP - 2 });

  MP.scenes.baking = {
    noRestart: true,

    enter() {
      this.kind = null;
      this.step = 'choose';
      this.who = MP.state.lastParent === 'mom' ? 'dad' : 'mom';   // take turns helping
      MP.state.lastParent = this.who;
      this.things = [];
      this.drag = null;
      this.stirAngle = null;
      this.stirred = 0;
      this.kneads = 0;
      this.buns = [];
      this.sugar = [];
      this.sugarDone = 0;
      this.bakeFrom = null;
      this.ovenAt = null;
      this.frost = null;
      this.tool = 'berry';
      this.decor = [];
      this.squishAt = -9;
      this.pours = [];
      this.bubble = null;
      this.endAt = null;
      this.say('Mitä leivotaan? Pullaa vai kakku?');
    },

    say(text, who) {
      this.bubble = { text, from: MP.time, until: Infinity, who: who || 'me' };
    },

    start(kind) {
      this.kind = kind;
      const list = kind === 'cake' ? ['flour', 'sugar', 'eggs', 'milk'] : ['flour', 'sugar', 'milk'];
      this.things = list.map((id, i) => ({ id, x: thingHome(i).x, y: thingHome(i).y, in: false, flyFrom: null }));
      this.step = 'add';
      MP.sfx.bling();
      this.say('Laitetaan ainekset kulhoon! Vedä ne kulhon päälle.', 'parent');
    },

    // a thing goes into the bowl
    pour(th) {
      th.in = true;
      th.pourAt = MP.time;
      MP.sfx.gulp();
      for (let i = 0; i < 14; i++) this.pours.push({ x: BOWL.x + (Math.random() - 0.5) * 10, y: BOWL.y - 34 - i * 2, born: MP.time + i * 0.03, color: THINGS[th.id].color });
      if (this.things.every((t) => t.in)) {
        setTimeout(() => {
          if (MP.scene !== this) return;
          this.step = 'stir';
          this.say('Nyt sekoitetaan! Pyöritä sormea kulhossa ympäri ja ympäri.', 'parent');
        }, 700);
      }
    },

    ovenOn() {
      this.step = 'oven';
      this.ovenAt = MP.time;
      MP.sfx.tap();
      this.say('Aikuinen laittaa uunin päälle! Uuni on kuuma, joten minä hoidan sen.', 'parent');
    },

    finish() {
      this.step = 'eat';
      this.endAt = MP.time;
      MP.state.baked = { kind: this.kind, frost: this.frost ? this.frost.color : null };
      MP.sfx.bling();
      this.say(this.kind === 'cake' ? 'Mmm, ihanaa kakkua! Kiitos leipurille!' : 'Mmm, ihanaa pullaa! Kiitos leipurille!', 'parent');
    },

    onPointerDown(x, y) {
      if (this.step === 'add') {
        for (const th of this.things) {
          if (!th.in && !th.flyFrom && Math.abs(x - th.x) < 13 && y > th.y - 30 && y < th.y + 4) {
            this.drag = { th, dx: th.x - x, dy: th.y - y, sx: x, sy: y };
            return;
          }
        }
      }
      if (this.step === 'stir') this.stirAngle = Math.atan2(y - BOWL.y + 8, x - BOWL.x);
    },

    onPointerMove(x, y) {
      if (this.drag) {
        this.drag.th.x = x + this.drag.dx;
        this.drag.th.y = y + this.drag.dy;
        return;
      }
      if (this.step === 'stir' && MP.pointer.down && Math.hypot(x - BOWL.x, y - BOWL.y + 8) < BOWL.r * 1.8) {
        const a = Math.atan2(y - BOWL.y + 8, x - BOWL.x);
        if (this.stirAngle != null) {
          let d = a - this.stirAngle;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          const before = Math.floor(this.stirred / (Math.PI * 2));
          this.stirred += Math.abs(d);
          if (Math.floor(this.stirred / (Math.PI * 2)) > before) MP.sfx.brush && MP.sfx.brush();
        }
        this.stirAngle = a;
        if (this.stirred >= STIR_ROUNDS * Math.PI * 2) {
          this.stirAngle = null;
          MP.sfx.bling();
          if (this.kind === 'cake') {
            this.step = 'tin';
            this.say('Hieno taikina! Napauta kulhoa, niin kaadetaan taikina kakkuvuokaan.', 'parent');
          } else {
            this.step = 'knead';
            this.say('Nyt vaivataan taikinaa! Napauta taikinaa monta kertaa.', 'parent');
          }
        }
      }
      if (this.step === 'sugar' && MP.pointer.down && x > TRAY.x - 6 && x < TRAY.x + TRAY.w + 6 && y > TRAY.y - 30 && y < TRAY.y + 10) {
        const last = this.lastSugar;
        if (last) {
          const d = Math.hypot(x - last.x, y - last.y);
          this.sugarDone += d;
          if (d > 3) {
            for (let i = 0; i < 3; i++) this.sugar.push({ x: x + (Math.random() - 0.5) * 8, y: TRAY.y - 6 + (Math.random() - 0.5) * 6, born: MP.time });
          }
        }
        this.lastSugar = { x, y };
        if (this.sugarDone > SUGAR_NEEDED) {
          this.step = 'toOven';
          MP.sfx.bling();
          this.say('Raesokeria päälle – valmista uuniin! Napauta uunia.', 'parent');
        }
      }
    },

    onPointerUp(x, y) {
      this.lastSugar = null;
      this.stirAngle = null;
      const dr = this.drag;
      this.drag = null;
      if (!dr) return;
      const th = dr.th;
      const moved = Math.hypot(x - dr.sx, y - dr.sy);
      if (moved > 6 && Math.hypot(x - BOWL.x, y - BOWL.y) < BOWL.r + 16) {
        th.x = BOWL.x; th.y = BOWL.y - 24;
        this.pour(th);
      } else if (moved > 6) {
        // not over the bowl: back to its place
        const i = this.things.indexOf(th);
        th.x = thingHome(i).x; th.y = thingHome(i).y;
      }
      th.dragged = moved > 6;
    },

    onTap(x, y) {
      if (MP.hit(BACK, x, y) && this.step !== 'eat') {
        MP.sfx.tap();
        MP.goTo(MP.scenes.home);
        return;
      }
      if (this.step === 'choose') {
        for (const k of KINDS) if (MP.hit(k.card, x, y)) this.start(k.id);
        return;
      }
      if (this.step === 'add') {
        // a plain tap flies the thing into the bowl
        for (const th of this.things) {
          if (!th.in && !th.flyFrom && !th.dragged && Math.abs(x - th.x) < 13 && y > th.y - 30 && y < th.y + 4) {
            th.flyFrom = { x: th.x, y: th.y, at: MP.time };
            MP.sfx.tap();
            return;
          }
          th.dragged = false;
        }
        return;
      }
      if (this.step === 'knead' && Math.hypot(x - BOWL.x, y - (BOWL.y - 8)) < BOWL.r + 8) {
        this.kneads++;
        this.squishAt = MP.time;
        MP.sfx.boing();
        if (this.kneads >= KNEADS) {
          this.step = 'shape';
          this.say('Taikina on sileää! Napauta taikinaa, niin siitä tulee pullia pellille.', 'parent');
        }
        return;
      }
      if (this.step === 'shape' && Math.hypot(x - BOWL.x, y - (BOWL.y - 8)) < BOWL.r + 12) {
        const i = this.buns.length;
        this.buns.push({ x: TRAY.x + 9 + i * 10, born: MP.time });
        this.squishAt = MP.time;
        MP.sfx.tap();
        if (this.buns.length >= BUNS) {
          this.step = 'sugar';
          this.say('Pullat ovat pellillä! Pyyhkäise sormella pullien yli, niin sataa raesokeria.', 'parent');
        }
        return;
      }
      if (this.step === 'tin' && Math.hypot(x - BOWL.x, y - (BOWL.y - 8)) < BOWL.r + 14) {
        this.tinAt = MP.time;
        this.step = 'toOven';
        MP.sfx.gulp();
        this.say('Taikina on vuoassa! Napauta uunia.', 'parent');
        return;
      }
      if (this.step === 'toOven' && (MP.hit(OVEN, x, y) || Math.hypot(x - 280, y - 110) < 40)) {
        this.ovenOn();
        return;
      }
      if (this.step === 'frost') {
        FROSTINGS.forEach((f, i) => {
          if (MP.hit(frostBtn(i), x, y)) {
            this.frost = f;
            this.step = 'decorate';
            MP.sfx.bling();
            this.say('Ihana kuorrute! Valitse koriste ja napauta kakkua.', 'parent');
          }
        });
        return;
      }
      if (this.step === 'decorate') {
        for (let i = 0; i < TOOLS.length; i++) {
          if (MP.hit(toolBtn(i), x, y)) { this.tool = TOOLS[i].id; MP.sfx.tap(); return; }
        }
        if (MP.hit(DONE, x, y)) { this.finish(); return; }
        const top = CAKE.y - CAKE.h;
        if (Math.abs(x - CAKE.x) < CAKE.w / 2 && y > top - 10 && y < CAKE.y) {
          // decorations go on the top of the cake
          const px = MP.clamp(x, CAKE.x - CAKE.w / 2 + 5, CAKE.x + CAKE.w / 2 - 5);
          const py = MP.clamp(y, top - 4, top + 5);
          if (this.tool === 'sprinkle') {
            for (let i = 0; i < 6; i++) this.decor.push({ kind: 'sprinkle', x: px + (Math.random() - 0.5) * 14, y: py + (Math.random() - 0.5) * 5, c: i, a: Math.random() * 3 });
          } else {
            this.decor.push({ kind: this.tool, x: px, y: py, at: MP.time });
          }
          MP.sfx.tap();
        }
        return;
      }
      if (this.step === 'eat' && MP.time - this.endAt > 1 && MP.hit(DONE, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.home);
      }
    },

    update(dt) {
      const t = MP.time;
      // things flying into the bowl after a tap
      for (const th of this.things) {
        if (!th.flyFrom || th.in) continue;
        const u = MP.clamp((t - th.flyFrom.at) / 0.6, 0, 1);
        th.x = th.flyFrom.x + (BOWL.x - th.flyFrom.x) * u;
        th.y = th.flyFrom.y + (BOWL.y - 24 - th.flyFrom.y) * u - Math.sin(u * Math.PI) * 30;
        if (u >= 1) this.pour(th);
      }
      this.pours = this.pours.filter((p) => t - p.born < 0.7);
      // the oven: the adult comes, then the timer
      if (this.step === 'oven') {
        const since = t - this.ovenAt;
        if (since > 2 && this.bakeFrom == null) {
          this.bakeFrom = t;
          MP.sfx.tvOff && MP.sfx.tvOff();
          this.say('Uuni on päällä. Odotetaan… tuoksuu jo hyvältä!', 'me');
        }
        if (this.bakeFrom != null && t - this.bakeFrom > BAKE_TIME) {
          this.step = 'baked';
          this.bakedAt = t;
          MP.sfx.bling();
          setTimeout(() => MP.sfx.bling(), 180);
          this.say('DING! Valmista! Aikuinen ottaa ne uunista.', 'parent');
        }
      }
      if (this.step === 'baked' && t - this.bakedAt > 2.2) {
        if (this.kind === 'cake') {
          this.step = 'frost';
          this.say('Kakku on jäähtynyt. Minkä värisen kuorrutteen laitetaan?', 'parent');
        } else {
          this.finish();
        }
      }
    },

    // ---------------------------------------------------------------------------
    draw(ctx) {
      const t = MP.time;
      // the kitchen: yellow wall, tiles, the counter
      ctx.fillStyle = '#fff1c9';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(240,180,90,0.16)';
      for (let x = 0; x < MP.W; x += 14) for (let y = 70; y < TOP; y += 14) if ((x + y) % 28 === 0) ctx.fillRect(x, y, 14, 14);
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#e9eef2';
      ctx.fillRect(0, TOP, MP.W, 6);
      ctx.strokeRect(-1, TOP, MP.W + 2, 6);
      ctx.fillStyle = '#9fd3c7';
      ctx.fillRect(0, TOP + 6, MP.W, MP.H - TOP - 6);
      for (let x = 20; x < MP.W; x += 70) { ctx.strokeRect(x, TOP + 10, 60, 40); }

      if (this.step === 'choose') return this.drawChoose(ctx, t);

      this.drawOven(ctx, t);
      this.drawParent(ctx, t);

      // the bowl (not when the cake is in the tin or the buns are done)
      if (['add', 'stir', 'knead', 'shape', 'tin'].includes(this.step)) this.drawBowl(ctx, t);

      // things to put into the bowl
      if (this.step === 'add') {
        this.things.forEach((th) => { if (!th.in) this.drawThing(ctx, th.id, th.x, th.y); });
        for (const p of this.pours) {
          const age = t - p.born;
          if (age < 0) continue;
          ctx.fillStyle = p.color;
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.beginPath(); ctx.arc(p.x, p.y + age * 50, 1.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
      }

      // the baking tray with buns
      if (this.kind === 'pulla' && ['shape', 'sugar', 'toOven'].includes(this.step)) this.drawTray(ctx, TRAY.x, TRAY.y, 0, t);
      // the cake tin
      if (this.kind === 'cake' && this.step === 'toOven') this.drawTin(ctx, 150, TOP, t);

      if (this.step === 'frost' || this.step === 'decorate' || (this.step === 'eat' && this.kind === 'cake')) this.drawCake(ctx, t);
      if ((this.step === 'eat' || this.step === 'baked') && this.kind === 'pulla') this.drawTray(ctx, TRAY.x, TRAY.y + 2, 1, t);
      if (this.step === 'baked' && this.kind === 'cake') this.cakeShape(ctx, CAKE.x, CAKE.y, CAKE.w * 0.8, CAKE.h * 0.8, null);

      // the step's helper pictures
      if (this.step === 'stir') {
        const k = MP.clamp(this.stirred / (STIR_ROUNDS * Math.PI * 2), 0, 1);
        this.drawProgress(ctx, k);
        if (!MP.pointer.down) MP.drawText(ctx, '↻', BOWL.x + 40, BOWL.y - 44, { size: 2, color: '#e0559a', outline: O(), align: 'center' });
      }
      if (this.step === 'knead') this.drawProgress(ctx, this.kneads / KNEADS);
      if (this.step === 'shape') this.drawProgress(ctx, this.buns.length / BUNS);
      if (this.step === 'sugar') {
        this.drawProgress(ctx, this.sugarDone / SUGAR_NEEDED);
        if (!MP.pointer.down) MP.draw('arrow', ctx, TRAY.x + TRAY.w / 2 + Math.sin(t * 3) * 30, TRAY.y - 22);
      }
      if (this.step === 'toOven' || this.step === 'tin' || this.step === 'knead' || this.step === 'shape') {
        const ax = this.step === 'toOven' ? OVEN.x + OVEN.w / 2 : BOWL.x;
        const ay = this.step === 'toOven' ? OVEN.y - 8 : BOWL.y - 50;
        MP.draw('arrow', ctx, ax, ay + Math.sin(t * 6) * 2.5);
      }

      if (this.step === 'frost') {
        MP.drawText(ctx, 'Valitse kuorrute:', MP.W / 2, 136, { size: 0.9, color: O(), align: 'center' });
        FROSTINGS.forEach((f, i) => {
          const r = frostBtn(i);
          ctx.fillStyle = f.color;
          ctx.strokeStyle = O();
          MP.roundRect(ctx, r.x, r.y, r.w, r.h, 6); ctx.fill(); ctx.stroke();
          MP.drawText(ctx, f.name, r.x + r.w / 2, r.y + 7, { size: f.name.length > 10 ? 0.48 : 0.6, color: f.id === 'choco' ? '#ffffff' : O(), align: 'center' });
        });
      }
      if (this.step === 'decorate') {
        TOOLS.forEach((tl, i) => {
          const r = toolBtn(i);
          MP.drawButton(ctx, tl.name, r, { size: 0.7, color: this.tool === tl.id ? '#e0559a' : '#9aa3b5', shade: this.tool === tl.id ? '#a8326c' : '#6b7385' });
        });
        MP.drawButton(ctx, 'Valmis!', DONE, { size: 0.85 });
      }
      if (this.step === 'eat' && t - this.endAt > 1) MP.drawButton(ctx, 'Takaisin', DONE, { size: 0.85 });
      if (this.step !== 'eat') MP.drawButton(ctx, '◀ Lopeta', BACK, { size: 0.8, color: '#9aa3b5', shade: '#6b7385' });

      // the bubble
      const b = this.bubble;
      if (b && t >= b.from) {
        if (b.who === 'parent') MP.drawBubble(ctx, b.text, this.parentX || 30, 96, { maxWidth: 150, size: 0.85 });
        else MP.drawBubble(ctx, b.text, this.step === 'eat' ? 288 : 160, this.step === 'eat' ? 108 : 50, { maxWidth: 150, size: 0.85 });
      }
      if (this.step === 'eat' && t - this.endAt < 5) MP.drawConfetti(ctx, t - this.endAt, 30);
    },

    drawChoose(ctx, t) {
      MP.drawText(ctx, 'Mitä leivotaan?', MP.W / 2, 18, { size: 1.5, color: '#e0559a', outline: O(), align: 'center' });
      for (const k of KINDS) {
        const r = k.card;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = O();
        ctx.lineWidth = 1;
        MP.roundRect(ctx, r.x, r.y, r.w, r.h, 8); ctx.fill(); ctx.stroke();
        if (k.id === 'pulla') {
          // three buns at the back, two in front
          for (let i = 0; i < 5; i++) {
            const front = i > 2;
            this.bun(ctx, r.x + (front ? 36 : 22) + (front ? i - 3 : i) * 28, r.y + (front ? 50 : 34), 1.3, 1, true);
          }
        } else {
          this.cakeShape(ctx, r.x + r.w / 2, r.y + 62, 60, 30, '#ff9ec4');
          for (let i = 0; i < 3; i++) this.berry(ctx, r.x + r.w / 2 - 18 + i * 18, r.y + 31);
          this.candle(ctx, r.x + r.w / 2, r.y + 30, t);
        }
        MP.drawText(ctx, k.name, r.x + r.w / 2, r.y + r.h - 14, { size: 1.1, color: O(), align: 'center' });
      }
      MP.drawButton(ctx, '◀ Lopeta', BACK, { size: 0.8, color: '#9aa3b5', shade: '#6b7385' });
    },

    drawProgress(ctx, k) {
      k = MP.clamp(k, 0, 1);
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#ffffff';
      MP.roundRect(ctx, 110, 166, 100, 8, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7bd389';
      if (k > 0) { MP.roundRect(ctx, 110, 166, 100 * k, 8, 4); ctx.fill(); }
      ctx.restore();
    },

    drawThing(ctx, id, x, y) {
      ctx.save();
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = O();
      if (id === 'flour') {
        ctx.fillStyle = '#f4e2c0';
        ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x - 10, y - 22); ctx.lineTo(x - 6, y - 26); ctx.lineTo(x + 6, y - 26); ctx.lineTo(x + 10, y - 22); ctx.lineTo(x + 9, y); ctx.closePath(); ctx.fill(); ctx.stroke();
        MP.drawText(ctx, 'JAUHO', x, y - 16, { size: 0.42, color: '#a0642c', align: 'center' });
      } else if (id === 'sugar') {
        ctx.fillStyle = '#ffffff';
        MP.roundRect(ctx, x - 8, y - 20, 16, 20, 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#4a78c8'; ctx.fillRect(x - 8, y - 15, 16, 5);
        MP.drawText(ctx, 'SOKERI', x, y - 9, { size: 0.36, color: '#4a78c8', align: 'center' });
      } else if (id === 'milk') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x - 7, y - 20); ctx.lineTo(x, y - 26); ctx.lineTo(x + 7, y - 20); ctx.lineTo(x + 7, y); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#4a9be0'; ctx.fillRect(x - 7, y - 13, 14, 6);
        MP.drawText(ctx, 'MAITO', x, y - 12, { size: 0.36, color: '#ffffff', align: 'center' });
      } else if (id === 'eggs') {
        ctx.fillStyle = '#fff6e6';
        for (const [ex, ey] of [[-5, -5], [5, -5], [0, -12]]) { ctx.beginPath(); ctx.ellipse(x + ex, y + ey, 4, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      }
      ctx.restore();
    },

    drawBowl(ctx, t) {
      const { x, y, r } = BOWL;
      const filled = this.things.filter((th) => th.in).length;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      // the dough inside
      if (filled > 0 && this.step !== 'shape' || this.step === 'shape' && this.buns.length < BUNS) {
        const k = this.step === 'stir' ? MP.clamp(this.stirred / (STIR_ROUNDS * Math.PI * 2), 0, 1) : (this.step === 'add' ? 0 : 1);
        const amount = this.step === 'shape' ? 1 - this.buns.length / BUNS : 1;
        const squish = MP.clamp(1 - (t - this.squishAt) * 4, 0, 1);
        const doughY = y - 8 - (this.step === 'knead' || this.step === 'shape' ? 6 : 0);
        ctx.fillStyle = this.kind === 'cake' ? MP.mixColor('#f4efe6', '#ffd98a', k) : MP.mixColor('#f4efe6', '#f3d7a2', k);
        ctx.beginPath();
        if (this.step === 'knead' || this.step === 'shape') {
          // a smooth ball of dough (gets smoother when kneaded)
          const rr = (12 + 8 * amount) * (1 + squish * 0.15);
          ctx.ellipse(x, doughY + squish * 2, rr, rr * 0.62 * (1 - squish * 0.2), 0, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          if (this.step === 'knead') {
            ctx.strokeStyle = 'rgba(160,110,60,0.4)';
            for (let i = 0; i < KNEADS - this.kneads; i++) { ctx.beginPath(); ctx.arc(x - 10 + (i * 7) % 20, doughY - 3 + (i % 3) * 3, 2, 0, Math.PI); ctx.stroke(); }
          }
        } else {
          ctx.ellipse(x, y - 14 + (4 - filled) * 1.5, r - 5, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          // swirl lines while stirring
          if (this.step === 'stir') {
            ctx.strokeStyle = 'rgba(160,110,60,0.45)';
            ctx.beginPath(); ctx.ellipse(x, y - 14, 12 + Math.sin(this.stirred) * 3, 3, this.stirred, 0, Math.PI * 1.5); ctx.stroke();
          }
        }
      }
      ctx.strokeStyle = O();
      // the bowl itself
      ctx.fillStyle = '#e0559a';
      ctx.beginPath();
      ctx.moveTo(x - r, y - 14);
      ctx.quadraticCurveTo(x - r + 2, y + 10, x - 14, y + 12);
      ctx.lineTo(x + 14, y + 12);
      ctx.quadraticCurveTo(x + r - 2, y + 10, x + r, y - 14);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff8fc0';
      ctx.beginPath(); ctx.ellipse(x, y - 14, r, 4, 0, 0, Math.PI); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x - 18 + i * 12, y - 2, 1.4, 0, Math.PI * 2); ctx.fill(); }
      // the wooden spoon follows the finger while stirring
      if (this.step === 'stir') {
        const px = MP.pointer.down ? MP.clamp(MP.pointer.x, x - r + 6, x + r - 6) : x + Math.cos(t * 2) * 12;
        const py = MP.pointer.down ? MP.clamp(MP.pointer.y, y - 22, y - 10) : y - 14 + Math.sin(t * 2) * 3;
        ctx.strokeStyle = '#a0642c';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 10, py - 34); ctx.stroke();
        ctx.fillStyle = '#c8894a';
        ctx.beginPath(); ctx.ellipse(px, py, 3.4, 2.2, 0.3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    },

    bun(ctx, x, y, s, golden, sugar) {
      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = O();
      ctx.fillStyle = MP.mixColor('#f6e3bd', '#d98e3a', golden);
      ctx.beginPath(); ctx.ellipse(x, y - 4 * s, 6 * s, 4.4 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(120,70,30,0.35)';
      ctx.beginPath(); ctx.arc(x - 1 * s, y - 4.5 * s, 2.4 * s, 0.2, Math.PI * 1.6); ctx.stroke();
      if (sugar) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) ctx.fillRect(x - 3.5 * s + (i * 1.7) * s, y - 7 * s + (i % 2) * 2 * s, 1.1, 1.1);
      }
      ctx.restore();
    },

    drawTray(ctx, x, y, golden, t) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#9aa3b5';
      MP.roundRect(ctx, x, y, TRAY.w, 5, 1.5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fffaf0';
      ctx.fillRect(x + 3, y - 1, TRAY.w - 6, 1.5);
      ctx.restore();
      const n = golden ? BUNS : this.buns.length;
      for (let i = 0; i < n; i++) {
        const b = this.buns[i] || { x: TRAY.x + 9 + i * 10, born: 0 };
        const pop = golden ? 1 : MP.clamp((t - b.born) * 5, 0, 1);
        this.bun(ctx, b.x + (x - TRAY.x), y, (0.8 + 0.2 * pop) * (golden ? 1.12 : 1), golden, this.step === 'toOven' || golden);
      }
      // pearl sugar falling
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 0.4;
      for (const s of this.sugar) {
        if (t - s.born > 0.5) continue;
        ctx.fillRect(s.x, s.y - 12 + (t - s.born) * 24, 1.4, 1.4);
      }
      // smell lines when golden
      if (golden) this.smell(ctx, x + TRAY.w / 2, y - 14, t);
    },

    smell(ctx, x, y, t) {
      ctx.save();
      ctx.strokeStyle = 'rgba(160,110,60,0.5)';
      ctx.lineWidth = 1.2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        for (let k = 0; k < 14; k++) {
          const yy = y - k * 1.5, xx = x + i * 14 + Math.sin(k * 0.6 + t * 4 + i) * 2.5;
          if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      }
      ctx.restore();
    },

    drawTin(ctx, x, y, t) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      const fill = MP.clamp((t - (this.tinAt || 0)) * 1.5, 0, 1);
      ctx.fillStyle = '#ffd98a';
      ctx.fillRect(x - 30, y - 2 - 12 * fill, 60, 12 * fill);
      ctx.fillStyle = 'rgba(154,163,181,0.0)';
      ctx.strokeRect(x - 30, y - 16, 60, 16);
      ctx.fillStyle = '#9aa3b5';
      ctx.fillRect(x - 32, y - 2, 64, 2);
      ctx.restore();
    },

    cakeShape(ctx, x, y, w, h, frost) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#e8c48a';
      ctx.fillRect(x - w / 2, y - h, w, h);
      ctx.strokeRect(x - w / 2, y - h, w, h);
      ctx.fillStyle = '#ff6f7f';                           // jam in the middle
      ctx.fillRect(x - w / 2, y - h * 0.55, w, h * 0.1);
      if (frost) {
        ctx.fillStyle = frost;
        ctx.beginPath();
        ctx.moveTo(x - w / 2 - 2, y - h - 3);
        ctx.lineTo(x + w / 2 + 2, y - h - 3);
        ctx.lineTo(x + w / 2 + 2, y - h + 6);
        for (let i = 0; i < 8; i++) {
          const dx = x + w / 2 + 2 - i * (w + 4) / 8;
          ctx.quadraticCurveTo(dx - (w + 4) / 16, y - h + 12 + (i % 2) * 3, dx - (w + 4) / 8, y - h + 6);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // the plate
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(x, y + 1, w / 2 + 10, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    },

    berry(ctx, x, y) {
      ctx.save();
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#e8343f';
      ctx.beginPath(); ctx.moveTo(x - 3.2, y - 3); ctx.quadraticCurveTo(x, y + 4, x + 3.2, y - 3); ctx.quadraticCurveTo(x, y - 5, x - 3.2, y - 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#3d9a46';
      ctx.fillRect(x - 2, y - 5, 4, 1.4);
      ctx.fillStyle = '#ffe08a';
      ctx.fillRect(x - 1, y - 1.5, 0.7, 0.7); ctx.fillRect(x + 0.8, y - 2.2, 0.7, 0.7);
      ctx.restore();
    },

    candle(ctx, x, y, t) {
      ctx.save();
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#8fd3ff';
      ctx.fillRect(x - 1.3, y - 12, 2.6, 12); ctx.strokeRect(x - 1.3, y - 12, 2.6, 12);
      ctx.fillStyle = '#ffffff';
      for (let k = 0; k < 3; k++) ctx.fillRect(x - 1.3, y - 10 + k * 4, 2.6, 1);
      ctx.fillStyle = '#ffb02e';
      ctx.beginPath(); ctx.ellipse(x + Math.sin(t * 9) * 0.4, y - 15, 1.6, 2.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff3a0';
      ctx.beginPath(); ctx.ellipse(x, y - 14.4, 0.7, 1.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    },

    drawCake(ctx, t) {
      this.cakeShape(ctx, CAKE.x, CAKE.y, CAKE.w, CAKE.h, this.frost ? this.frost.color : null);
      const cols = ['#ff5d8f', '#ffd23f', '#4cc9f0', '#7bd389', '#b388ff', '#ff9f43'];
      for (const d of this.decor) {
        if (d.kind === 'sprinkle') {
          ctx.save();
          ctx.fillStyle = cols[d.c % cols.length];
          ctx.translate(d.x, d.y);
          ctx.rotate(d.a);
          ctx.fillRect(-1.4, -0.5, 2.8, 1);
          ctx.restore();
        }
      }
      for (const d of this.decor) {
        if (d.kind === 'berry') this.berry(ctx, d.x, d.y);
        if (d.kind === 'candle') this.candle(ctx, d.x, d.y, t + d.at);
      }
      if (this.step === 'eat') this.smell(ctx, CAKE.x, CAKE.y - CAKE.h - 16, t);
    },

    drawOven(ctx, t) {
      const r = OVEN;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#e9eef2';
      MP.roundRect(ctx, r.x, r.y, r.w, r.h, 3); ctx.fill(); ctx.stroke();
      // knobs and the light
      ctx.fillStyle = '#5a5a73';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(r.x + 12 + i * 10, r.y + 7, 2.5, 0, Math.PI * 2); ctx.fill(); }
      const on = this.step === 'oven' && this.bakeFrom != null;
      ctx.fillStyle = on ? '#ff5d3a' : '#8a8a92';
      ctx.beginPath(); ctx.arc(r.x + r.w - 10, r.y + 7, 2.2, 0, Math.PI * 2); ctx.fill();
      // the window
      const win = { x: r.x + 8, y: r.y + 16, w: r.w - 16, h: r.h - 24 };
      ctx.fillStyle = on ? '#ffb86a' : '#3a3a48';
      MP.roundRect(ctx, win.x, win.y, win.w, win.h, 3); ctx.fill(); ctx.stroke();
      // what is inside, growing and turning golden
      if (this.step === 'oven' && this.ovenAt != null && t - this.ovenAt > 1.2) {
        const k = this.bakeFrom != null ? MP.clamp((t - this.bakeFrom) / BAKE_TIME, 0, 1) : 0;
        ctx.save();
        ctx.beginPath(); ctx.rect(win.x, win.y, win.w, win.h); ctx.clip();
        if (this.kind === 'cake') {
          ctx.fillStyle = MP.mixColor('#ffd98a', '#d99a4a', k);
          ctx.fillRect(win.x + 10, win.y + win.h - 10 - 6 * k, win.w - 20, 8 + 6 * k);
        } else {
          for (let i = 0; i < 4; i++) {
            ctx.fillStyle = MP.mixColor('#f6e3bd', '#d98e3a', k);
            ctx.beginPath(); ctx.ellipse(win.x + 8 + i * 10, win.y + win.h - 8, 3.5 + k * 1.5, 2.6 + k * 1.2, 0, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.restore();
        if (this.bakeFrom != null) {
          const left = Math.max(0, Math.ceil(BAKE_TIME - (t - this.bakeFrom)));
          MP.drawText(ctx, String(left), r.x + r.w / 2, win.y + 4, { size: 1.8, color: '#ffffff', outline: O(), align: 'center' });
          this.smell(ctx, r.x + r.w / 2, r.y - 2, t);
        }
      }
      if (this.step === 'baked') {
        MP.drawText(ctx, 'DING!', r.x + r.w / 2, r.y - 20, { size: 1.6, color: '#ffd23f', outline: O(), align: 'center' });
      }
      ctx.restore();
    },

    drawParent(ctx, t) {
      const P = MP.PARENTS[this.who];
      // mom or dad stands at the left; at the oven step walks to the oven
      let x = 30;
      if (this.step === 'oven') {
        const since = t - this.ovenAt;
        x = since < 1 ? 30 + since * 200 : 230;
      }
      if (this.step === 'baked') x = 230;
      this.parentX = x;
      MP.drawPerson(ctx, x, 160, {
        character: P.character, hair: P.hair, scale: P.scale * 0.95, noBow: P.noBow, glasses: P.glasses,
        outfit: P.outfit, mouth: 'smile', armUp: this.step === 'eat' ? 0.7 : 0,
        walking: this.step === 'oven' && t - this.ovenAt < 1, walkTime: t, flip: false,
      });
      // the player at the right when eating
      if (this.step === 'eat') {
        MP.drawPerson(ctx, 288, 160, { mouth: Math.floor(t * 3) % 2 ? 'smile' : 'open', armUp: 0.5, flip: true });
      }
    },
  };
})();
