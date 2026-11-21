// hotel.js – a HOTEL ROOM on a trip (Egypt, Thailand, New York).
// Tap the bed: the evening things happen by themselves (snack, pyjamas,
// teeth, toilet) and you go to sleep. The night stays until you tap.
// Then the morning comes, and the door takes you outside again.
// params: { country: 'egypt' | 'thailand' | 'newyork' }
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const FLOOR = 152;                 // where the feet are
  const DOOR_X = 34;
  const BED_X = 246;                 // the middle of the bed
  const BED_SCALE = 1.5;
  const WIN = { x: 112, y: 30, w: 76, h: 54 };
  const PANEL = { x: 76, y: 26, w: 168, h: 100 };
  const STEP_TIME = 1.0;             // seconds for each evening thing
  const DAWN_TIME = 3.2;
  const PJ = { shirt: 'pyjama', bottom: 'pyjama', hat: 'none', costume: 'none', shoes: false };

  // Every country's hotel looks a bit different
  const LOOK = {
    egypt: {
      name: 'Hotelli Niili', land: 'desert', wall: '#f1dcb0', border: '#2f5fb5', floor: '#c99b62',
      blanket: '#e6b450', rug: '#d33a3a',
      hello: 'Hotelli Niili! Ikkunasta näkyy aavikko. Napauta sänkyä, niin mennään nukkumaan.',
    },
    thailand: {
      name: 'Hotelli Simpukka', land: 'beach', wall: '#d7f0e6', border: '#2e8b57', floor: '#c8a878',
      blanket: '#ff8fc0', rug: '#f2c14e',
      hello: 'Hotelli Simpukka! Ikkunasta näkyy meri. Napauta sänkyä, niin mennään nukkumaan.',
    },
    newyork: {
      name: 'Hotelli Manhattan', land: 'city', wall: '#dfe3ee', border: '#3c3b6e', floor: '#7a5a48',
      blanket: '#4a78c8', rug: '#b22234',
      hello: 'Hotelli Manhattan! Ikkunasta näkyy pilvenpiirtäjiä. Napauta sänkyä, niin mennään nukkumaan.',
    },
  };

  const EVENING = [
    { name: 'Iltapala', icon: 'food' },
    { name: 'Pyjama päälle', icon: 'pyjama' },
    { name: 'Hampaiden pesu', icon: 'brush' },
    { name: 'Vessassa käynti', icon: 'toilet' },
  ];

  function drawIcon(ctx, icon, x, y) {
    ctx.save();
    if (icon === 'food') MP.draw('soup', ctx, x, y, { scale: 0.7 });
    else if (icon === 'pyjama') MP.drawPerson(ctx, x, y + 8, { scale: 0.38, outfit: PJ });
    else if (icon === 'brush') MP.draw('toothbrush', ctx, x, y, { scale: 0.7, angle: -0.7 });
    else if (icon === 'toilet') { ctx.translate(x, y + 7); ctx.scale(0.42, 0.42); MP.draw('toilet', ctx, 0, 0); }
    ctx.restore();
  }

  MP.scenes.hotel = {
    enter(params) {
      this.country = LOOK[params && params.country] ? params.country : 'egypt';
      this.look = LOOK[this.country];
      this.player = new MP.Player(DOOR_X + 22, { minX: 20, maxX: 300 });
      this.player.facing = 1;
      this.phase = 'room';           // room → evening → night → dawn → morning
      this.t = 0;
      this.leaving = false;
      this.bubble = null;
      this.say(this.look.hello, 0.5);
    },

    say(text, delay) {
      this.bubble = { text, from: MP.time + (delay || 0), until: Infinity };
    },

    nearBed: (x, y) => x > BED_X - 40 && x < BED_X + 40 && y > 100 && y < 165,
    nearDoor: (x, y) => x > DOOR_X - 18 && x < DOOR_X + 18 && y > FLOOR - 56 && y < FLOOR + 6,

    onTap(x, y) {
      if (this.leaving) return;
      const p = this.phase;
      if (p === 'evening' || p === 'dawn') return;
      if (p === 'night') {
        // the night stays until a tap: then the morning comes
        if (this.t > 1.2) { this.phase = 'dawn'; this.t = 0; MP.sfx.tap(); }
        return;
      }
      if (this.nearDoor(x, y)) {
        MP.sfx.tap();
        this.player.walkTo(DOOR_X + 4, () => {
          this.leaving = true;
          MP.sfx.bling();
          MP.goTo(MP.scenes[this.country], { from: 'hotel' });
        });
        return;
      }
      if (this.nearBed(x, y)) {
        if (p === 'morning') { this.say('Nyt on jo aamu! Mennään ulos ovesta.'); return; }
        MP.sfx.tap();
        this.player.walkTo(BED_X - 66, () => {
          this.phase = 'evening';
          this.t = 0;
          this.bubble = null;
          this.player.facing = 1;
        });
        return;
      }
      this.player.walkTo(x);
    },

    update(dt) {
      this.t += dt;
      this.player.update(dt);
      if (this.phase === 'evening') {
        const step = Math.floor(this.t / STEP_TIME);
        if (step !== this.lastStep && step < EVENING.length) { this.lastStep = step; MP.sfx.tap(); }
        if (this.t > EVENING.length * STEP_TIME + 0.8) {
          this.phase = 'night';
          this.t = 0;
          this.lastStep = -1;
          MP.sfx.yawn();
        }
      } else if (this.phase === 'dawn' && this.t > DAWN_TIME) {
        this.phase = 'morning';
        this.t = 0;
        MP.sfx.rooster();
        this.player.place(BED_X - 66, 1);
        this.say('Huomenta! Hyvin nukuttu. Mennään ulos!', 0.3);
      }
    },

    // how dark the room is (0 = day, 1 = night)
    darkness() {
      if (this.phase === 'night') return MP.clamp(this.t / 1.5, 0, 1);
      if (this.phase === 'dawn') return 1 - MP.clamp(this.t / DAWN_TIME, 0, 1);
      return 0;
    },

    draw(ctx) {
      const L = this.look, t = MP.time, dark = this.darkness();
      const inBed = this.phase === 'night' || this.phase === 'dawn';

      // ----- Walls and floor -----
      ctx.fillStyle = L.wall;
      ctx.fillRect(0, 0, MP.W, FLOOR - 6);
      ctx.fillStyle = L.border;
      ctx.fillRect(0, 12, MP.W, 3);
      for (let x = 4; x < MP.W; x += 12) { ctx.beginPath(); ctx.arc(x, 13.5, 1.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = L.floor;
      ctx.fillRect(0, FLOOR - 6, MP.W, MP.H - FLOOR + 6);
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let x = 0; x < MP.W; x += 22) ctx.fillRect(x, FLOOR - 6, 1, MP.H);
      ctx.fillStyle = L.rug;
      MP.roundRect(ctx, 110, FLOOR + 6, 90, 14, 6); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      MP.roundRect(ctx, 116, FLOOR + 9, 78, 8, 4); ctx.fill();
      // the room's name on the wall
      MP.drawText(ctx, L.name, MP.W / 2, 1, { size: 0.8, color: L.border, align: 'center' });

      // ----- The window: the country outside, the night sky at night -----
      ctx.save();
      MP.roundRect(ctx, WIN.x, WIN.y, WIN.w, WIN.h, 3); ctx.clip();
      MP.drawLandscape(ctx, L.land, WIN, 0);
      if (this.phase === 'dawn' || this.phase === 'morning' || this.phase === 'room') {
        // the sun climbs up in the morning
        const up = this.phase === 'dawn' ? MP.clamp(this.t / DAWN_TIME, 0, 1) : 1;
        if (this.phase !== 'room') MP.draw('sun', ctx, 0, 0, { x: WIN.x + WIN.w * 0.78, y: WIN.y + WIN.h * (0.75 - 0.5 * up), r: 5, t });
      }
      if (dark > 0) {
        ctx.fillStyle = 'rgba(16,22,60,' + (0.85 * dark) + ')';
        ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
        ctx.globalAlpha = dark;
        ctx.fillStyle = '#ffffff';
        [[0.1, 0.15], [0.3, 0.3], [0.5, 0.1], [0.62, 0.35], [0.9, 0.2], [0.2, 0.45]].forEach(([sx, sy], i) => {
          ctx.globalAlpha = dark * (0.5 + 0.5 * Math.sin(t * 3 + i));
          ctx.beginPath(); ctx.arc(WIN.x + sx * WIN.w, WIN.y + sy * WIN.h, 0.8, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = dark;
        MP.draw('moon', ctx, 0, 0, { x: WIN.x + WIN.w * 0.75, y: WIN.y + WIN.h * 0.25, r: 6 });
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      ctx.save();
      ctx.lineWidth = 3; ctx.strokeStyle = '#fffaf0';
      MP.roundRect(ctx, WIN.x, WIN.y, WIN.w, WIN.h, 3); ctx.stroke();
      ctx.lineWidth = 0.8; ctx.strokeStyle = MP.COLORS.outline;
      MP.roundRect(ctx, WIN.x - 1.5, WIN.y - 1.5, WIN.w + 3, WIN.h + 3, 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(WIN.x + WIN.w / 2, WIN.y); ctx.lineTo(WIN.x + WIN.w / 2, WIN.y + WIN.h);
      ctx.lineWidth = 2; ctx.strokeStyle = '#fffaf0'; ctx.stroke();
      // curtains
      ctx.lineWidth = 0.8; ctx.strokeStyle = MP.COLORS.outline;
      for (const side of [-1, 1]) {
        const cx = side < 0 ? WIN.x - 8 : WIN.x + WIN.w + 1;
        ctx.fillStyle = L.rug;
        ctx.beginPath();
        ctx.moveTo(cx, WIN.y - 6); ctx.lineTo(cx + 7, WIN.y - 6);
        ctx.quadraticCurveTo(cx + 3.5 + side * 2, WIN.y + 30, cx + 7, WIN.y + WIN.h + 10);
        ctx.lineTo(cx, WIN.y + WIN.h + 10); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(WIN.x - 12, WIN.y - 8, WIN.w + 24, 2.5);
      ctx.restore();

      // ----- The door (and an arrow over it in the morning) -----
      MP.draw('door', ctx, DOOR_X, FLOOR);
      MP.drawText(ctx, 'Ulos', DOOR_X, FLOOR - 62, { size: 0.7, color: L.border, align: 'center' });
      if (this.phase === 'morning') {
        MP.draw('arrow', ctx, DOOR_X, FLOOR - 70 + Math.sin(t * 5) * 2, {});
      }

      // ----- A suitcase and a lamp on a little table -----
      ctx.save();
      ctx.lineWidth = 0.8; ctx.strokeStyle = MP.COLORS.outline;
      ctx.fillStyle = '#e0559a';
      MP.roundRect(ctx, 66, FLOOR - 20, 24, 18, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(66, FLOOR - 12, 24, 2.5); ctx.strokeRect(66, FLOOR - 12, 24, 2.5);
      ctx.beginPath(); ctx.moveTo(73, FLOOR - 20); ctx.lineTo(73, FLOOR - 24); ctx.lineTo(83, FLOOR - 24); ctx.lineTo(83, FLOOR - 20);
      ctx.lineWidth = 1.4; ctx.stroke();
      ctx.restore();
      MP.draw('nightstand', ctx, 200, FLOOR);
      ctx.save();
      ctx.lineWidth = 0.8; ctx.strokeStyle = MP.COLORS.outline;
      ctx.fillStyle = '#c8913a'; ctx.fillRect(199, FLOOR - 30, 2, 11); ctx.strokeRect(199, FLOOR - 30, 2, 11);
      ctx.fillStyle = dark > 0.5 ? '#6b5f80' : '#fff2a0';
      ctx.beginPath(); ctx.moveTo(193, FLOOR - 30); ctx.lineTo(207, FLOOR - 30); ctx.lineTo(204, FLOOR - 39); ctx.lineTo(196, FLOOR - 39); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();

      // ----- The big hotel bed (and the child sleeping in it) -----
      ctx.save();
      ctx.translate(BED_X, FLOOR + 1);
      ctx.scale(BED_SCALE, BED_SCALE);
      MP.draw('bed', ctx, 0, 0);
      ctx.restore();
      if (inBed) {
        const awake = this.phase === 'dawn' && this.t > DAWN_TIME - 0.8;
        ctx.save();
        ctx.translate(BED_X + 14, FLOOR - 21);
        ctx.rotate(-Math.PI / 2);
        MP.drawPerson(ctx, 0, 0, { scale: 0.85, outfit: PJ, eyes: awake ? 'sleepy' : 'closed', mouth: 'flat' });
        ctx.restore();
        ctx.save();
        ctx.lineWidth = 0.8; ctx.strokeStyle = MP.COLORS.outline;
        ctx.fillStyle = L.blanket;
        MP.roundRect(ctx, BED_X - 4, FLOOR - 29, 38, 16, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        for (let xx = BED_X + 2; xx < BED_X + 32; xx += 7) { ctx.beginPath(); ctx.arc(xx, FLOOR - 21, 1.2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }

      // ----- The child -----
      if (!inBed && !this.leaving) {
        if (this.phase === 'evening') {
          // getting ready: the pyjamas come on halfway through
          const pj = this.t > STEP_TIME * 1.5;
          MP.drawPerson(ctx, this.player.x, FLOOR, { outfit: pj ? PJ : undefined, mouth: 'smile' });
        } else {
          this.player.draw(ctx, FLOOR, 0);
        }
      }

      // ----- Night: the room gets dark -----
      if (dark > 0) {
        ctx.fillStyle = 'rgba(13,20,51,' + (0.72 * dark) + ')';
        ctx.fillRect(0, 0, MP.W, MP.H);
        if (this.phase === 'night') {
          for (let i = 0; i < 3; i++) {
            const p = (t * 0.7 + i / 3) % 1;
            ctx.save();
            ctx.globalAlpha = (1 - p) * dark;
            MP.drawText(ctx, 'z', BED_X - 14 + p * 12, FLOOR - 40 - p * 22, { size: 0.7 + p * 0.6, color: '#9fc8ff', outline: '#ffffff' });
            ctx.restore();
          }
          if (this.t > 1.5) {
            MP.drawText(ctx, 'Hyvää yötä!', MP.W / 2, 132, { size: 1.2, color: '#ffffff', outline: MP.COLORS.outline, align: 'center' });
            MP.drawText(ctx, 'Napauta, niin tulee aamu', MP.W / 2, 150, { size: 0.75, color: '#ffffff', outline: MP.COLORS.outline, align: 'center' });
          }
        } else if (this.phase === 'dawn') {
          MP.drawText(ctx, 'Aamu koittaa…', MP.W / 2, 140, { size: 1, color: '#ffffff', outline: MP.COLORS.outline, align: 'center' });
        }
      }

      // ----- The evening things, one after another -----
      if (this.phase === 'evening') {
        ctx.save();
        ctx.lineWidth = 1; ctx.strokeStyle = MP.COLORS.outline;
        ctx.fillStyle = 'rgba(255,247,224,0.96)';
        MP.roundRect(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 8); ctx.fill(); ctx.stroke();
        ctx.restore();
        MP.drawText(ctx, 'Iltatoimet', MP.W / 2, PANEL.y + 4, { size: 1, color: '#2b2340', align: 'center' });
        EVENING.forEach((e, i) => {
          const shown = this.t >= i * STEP_TIME;
          if (!shown) return;
          const y = PANEL.y + 24 + i * 18;
          drawIcon(ctx, e.icon, PANEL.x + 22, y + 4);
          MP.drawText(ctx, e.name, PANEL.x + 38, y - 1, { size: 0.85, color: '#2b2340' });
          if (this.t >= i * STEP_TIME + 0.6) {
            ctx.save();
            ctx.strokeStyle = '#3cb371'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(PANEL.x + PANEL.w - 26, y + 3); ctx.lineTo(PANEL.x + PANEL.w - 21, y + 8); ctx.lineTo(PANEL.x + PANEL.w - 12, y - 3);
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      // ----- Speech bubble -----
      const b = this.bubble;
      if (b && MP.time >= b.from && !inBed && !this.leaving) {
        MP.drawBubble(ctx, b.text, this.player.x, FLOOR - 46, { maxWidth: 160 });
      }
    },
  };
})();
