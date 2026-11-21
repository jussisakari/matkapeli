// sleepover.js – A SLEEPOVER at Mummi and Ukki's on floor 77 (New York).
//   In the apartment tap "Jää yökylään":
//   1. Build a PILLOW FORT on the sofa: drag (or just tap) the cushions and the
//      blanket into the dotted places.
//   2. Pyjamas on and teeth brushed (it happens by itself, like in the hotel),
//      and Ukki reads a bedtime story in the fort (tap to go on).
//   3. Lights off: the window shows the city lights glittering and a plane
//      blinking in the sky. Tap for the morning.
//   4. Morning: Mummi makes pancakes – tap the pan to flip them. One flies to
//      the ceiling, sticks there… and later drops on Ukki's head.
//      Then down with the elevator.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const FLOOR = 156;
  const BTN = { x: 236, y: 4, w: 80, h: 18 };
  const SOFA_X = 160;
  const PYJAMA = { shirt: 'pyjama', bottom: 'pyjama', hat: 'none', costume: 'none', shoes: false };
  // where the fort pieces go
  const SLOTS = [
    { id: 'left', kind: 'cushion', x: 116, y: 118, w: 22, h: 30 },
    { id: 'right', kind: 'cushion', x: 204, y: 118, w: 22, h: 30 },
    { id: 'back1', kind: 'cushion', x: 138, y: 100, w: 30, h: 18 },
    { id: 'back2', kind: 'cushion', x: 174, y: 100, w: 30, h: 18 },
    { id: 'roof', kind: 'blanket', x: 112, y: 78, w: 118, h: 26 },
  ];
  const PIECES = [
    { kind: 'cushion', color: '#ff8fc0', x: 30, y: 146 },
    { kind: 'cushion', color: '#8fd3ff', x: 66, y: 152 },
    { kind: 'cushion', color: '#ffd23f', x: 262, y: 150 },
    { kind: 'cushion', color: '#9be08f', x: 296, y: 144 },
    { kind: 'blanket', color: '#b48ff0', x: 280, y: 112 },
  ];
  const STORY = [
    'Ukki: Olipa kerran pieni oravanpoika, joka asui pilvenpiirtäjän katolla.',
    'Ukki: Joka yö se laski kaupungin valoja: yksi, kaksi, kolme… miljoona!',
    'Ukki: Eräänä yönä yksi valo vilkutti takaisin. Se oli lentokone!',
    'Ukki: "Hei lentokone, minne matka?" kysyi orava. "Suomeen!" vastasi kone.',
    'Ukki: Ja orava toivotti: "Sano terveisiä Ellan lemmikille!" Sen pituinen se. Hyvää yötä!',
  ];
  const PAN = { x: 118, y: 120 };
  const sizeOf = (p) => (p.kind === 'blanket' ? { w: 40, h: 18 } : { w: 22, h: 16 });

  function sofa(ctx) {
    ctx.save();
    ctx.lineWidth = 1; ctx.strokeStyle = O();
    ctx.fillStyle = '#4a78c8';
    MP.roundRect(ctx, SOFA_X - 62, 108, 124, 30, 6); ctx.fill(); ctx.stroke();
    MP.roundRect(ctx, SOFA_X - 70, 120, 16, 30, 5); ctx.fill(); ctx.stroke();
    MP.roundRect(ctx, SOFA_X + 54, 120, 16, 30, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5c8ad8';
    MP.roundRect(ctx, SOFA_X - 54, 134, 108, 16, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2b2340';
    ctx.fillRect(SOFA_X - 60, 150, 4, 6); ctx.fillRect(SOFA_X + 56, 150, 4, 6);
    ctx.restore();
  }

  function cushion(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.lineWidth = 0.9; ctx.strokeStyle = O(); ctx.fillStyle = color;
    MP.roundRect(ctx, x - w / 2, y - h / 2, w, h, 5); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(43,35,64,0.3)';
    ctx.beginPath(); ctx.moveTo(x - w / 2 + 3, y - h / 2 + 3); ctx.lineTo(x + w / 2 - 3, y + h / 2 - 3); ctx.stroke();
    ctx.restore();
  }

  function blanket(ctx, x, y, w, h, color, roof) {
    ctx.save();
    ctx.lineWidth = 0.9; ctx.strokeStyle = O(); ctx.fillStyle = color;
    ctx.beginPath();
    if (roof) {
      // draped over the fort, hanging down at the sides
      ctx.moveTo(x - w / 2, y + h / 2 + 22);
      ctx.quadraticCurveTo(x - w / 2 + 4, y - h / 2, x, y - h / 2 - 4);
      ctx.quadraticCurveTo(x + w / 2 - 4, y - h / 2, x + w / 2, y + h / 2 + 22);
      ctx.lineTo(x + w / 2 - 10, y + h / 2 + 16);
      ctx.lineTo(x + w / 2 - 20, y + h / 2 + 22);
      ctx.quadraticCurveTo(x, y + h / 2 - 2, x - w / 2 + 20, y + h / 2 + 22);
      ctx.lineTo(x - w / 2 + 10, y + h / 2 + 16);
      ctx.closePath();
    } else {
      MP.roundRect(ctx, x - w / 2, y - h / 2, w, h, 3);
    }
    ctx.fill(); ctx.stroke();
    // stars on the blanket
    ctx.fillStyle = '#ffe680';
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(x + i * w / 6, y + (i % 2 ? 2 : -2), 1.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  // The big window: the city at night (lights glitter, a plane blinks) or in the morning
  function cityWindow(ctx, t, night) {
    const W = { x: 20, y: 18, w: 82, h: 70 };
    ctx.save();
    ctx.beginPath(); ctx.rect(W.x, W.y, W.w, W.h); ctx.clip();
    if (night) {
      ctx.fillStyle = '#0d1433'; ctx.fillRect(W.x, W.y, W.w, W.h);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 14; i++) ctx.fillRect(W.x + (i * 37) % W.w, W.y + (i * 13) % 30, 1, 1);
      // the moon
      ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(W.x + 66, W.y + 12, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0d1433'; ctx.beginPath(); ctx.arc(W.x + 63, W.y + 10, 6, 0, Math.PI * 2); ctx.fill();
      // skyscrapers with glittering windows
      const B = [[0, 40, 14], [15, 26, 12], [28, 46, 10], [39, 20, 16], [56, 36, 12], [69, 30, 14]];
      for (const [bx, top, bw] of B) {
        ctx.fillStyle = '#1e2448'; ctx.fillRect(W.x + bx, W.y + top, bw, W.h - top);
        for (let wy = top + 3; wy < W.h - 2; wy += 4) for (let wx = 2; wx < bw - 2; wx += 3) {
          const on = Math.sin(bx * 7 + wy * 3 + wx * 11 + Math.floor(t * 1.5 + wx + wy) * 0.9) > 0.1;
          if (on) { ctx.fillStyle = (wx + wy) % 3 ? '#ffd86a' : '#fff3b0'; ctx.fillRect(W.x + bx + wx, W.y + wy, 1.4, 1.6); }
        }
      }
      // the plane blinking across the sky
      const px = W.x + ((t * 8) % (W.w + 20)) - 10;
      if (Math.floor(t * 2.5) % 2 === 0) { ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(px, W.y + 22, 1.4, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#ffffff'; ctx.fillRect(px - 3, W.y + 21.5, 6, 1);
    } else {
      MP.drawLandscape(ctx, 'city', { x: W.x - 40, y: W.y - 10, w: W.w + 80, h: W.h + 40 }, t * 3);
    }
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 2; ctx.strokeStyle = '#f4f4f4';
    ctx.strokeRect(W.x, W.y, W.w, W.h);
    ctx.beginPath(); ctx.moveTo(W.x + W.w / 2, W.y); ctx.lineTo(W.x + W.w / 2, W.y + W.h); ctx.stroke();
    ctx.restore();
  }

  MP.scenes.sleepover = {
    noRestart: true,

    enter() {
      this.step = 'fort';
      this.pieces = PIECES.map((p) => Object.assign({ slot: null }, p));
      this.drag = null;
      this.line = 0;
      this.flips = 0;
      this.pancakes = 0;
      this.flipAt = -9;
      this.ceilingAt = null;       // a pancake stuck to the ceiling
      this.dropAt = null;          // …and when it fell on Ukki
      this.say('Yökylä! Rakennetaan tyynylinna sohvalle. Vedä tyynyt ja peitto paikoilleen – tai napauta niitä.', 'mummi');
    },

    say(text, who) { this.bubble = { text, from: MP.time, until: Infinity, who: who || 'me' }; },

    pieceAt(x, y) {
      for (let i = this.pieces.length - 1; i >= 0; i--) {
        const p = this.pieces[i];
        if (p.slot) continue;
        const s = sizeOf(p);
        if (Math.abs(x - p.x) < s.w / 2 + 4 && Math.abs(y - p.y) < s.h / 2 + 4) return p;
      }
      return null;
    },

    freeSlot(p, x, y) {
      let best = null, bd = Infinity;
      for (const s of SLOTS) {
        if (s.kind !== p.kind || this.pieces.some((q) => q.slot === s.id)) continue;
        const d = x == null ? 0 : Math.hypot(x - (s.x + s.w / 2), y - (s.y + s.h / 2));
        if (d < bd) { bd = d; best = s; }
      }
      return x == null || bd < 40 ? best : null;
    },

    put(p, slot) {
      p.slot = slot.id;
      MP.sfx.boing();
      if (this.pieces.every((q) => q.slot)) {
        MP.sfx.applause(1.2);
        this.step = 'ready';
        this.readyAt = MP.time;
        this.say('Tyynylinna on valmis! Pyjama päälle ja hampaat pestään… (Mummi auttaa.)', 'mummi');
        setTimeout(() => {
          if (MP.scene !== this || this.step !== 'ready') return;
          this.step = 'story';
          this.line = 0;
          this.say(STORY[0], 'ukki');
        }, 2600);
      }
    },

    onPointerDown(x, y) {
      if (this.step !== 'fort') return;
      const p = this.pieceAt(x, y);
      if (p) this.drag = { p, dx: p.x - x, dy: p.y - y, sx: x, sy: y, moved: false };
    },

    onPointerMove(x, y) {
      const d = this.drag;
      if (!d) return;
      if (Math.hypot(x - d.sx, y - d.sy) > 4) d.moved = true;
      d.p.x = x + d.dx; d.p.y = y + d.dy;
    },

    onPointerUp(x, y) {
      const d = this.drag;
      if (!d) return;
      this.drag = null;
      if (!d.moved) { this.tappedPiece = d.p; return; }   // a tap: onTap puts it in place
      const s = this.freeSlot(d.p, d.p.x, d.p.y);
      if (s) this.put(d.p, s);
    },

    onTap(x, y) {
      if (MP.hit(BTN, x, y)) {
        MP.sfx.tap();
        if (this.step === 'morning' && this.pancakes >= 3) MP.goTo(MP.scenes.grandparents, { down: true });
        else MP.goTo(MP.scenes.grandparents, { back: true });
        return;
      }
      if (this.step === 'fort') {
        const p = this.tappedPiece || this.pieceAt(x, y);
        this.tappedPiece = null;
        if (p && !p.slot) {
          const s = this.freeSlot(p);
          if (s) this.put(p, s);
        }
        return;
      }
      if (this.step === 'story') {
        if (this.line < STORY.length - 1) {
          this.line++;
          MP.sfx.tap();
          this.say(STORY[this.line], 'ukki');
        } else {
          this.step = 'night';
          this.nightAt = MP.time;
          this.bubble = null;
          MP.sfx.yawn();
        }
        return;
      }
      if (this.step === 'night') {
        if (MP.time - this.nightAt > 1.5) {
          this.step = 'morning';
          MP.sfx.rooster();
          this.say('Huomenta! Mummi paistaa lettuja. Napauta pannua, niin letut kääntyvät!', 'mummi');
        }
        return;
      }
      if (this.step === 'morning' && Math.hypot(x - PAN.x, y - PAN.y) < 22 && MP.time - this.flipAt > 0.9) {
        this.flipAt = MP.time;
        this.flips++;
        MP.sfx.boing();
        if (this.flips === 2) {
          // too high! it sticks to the ceiling
          this.ceilingAt = MP.time + 0.45;
          this.say('Hups! Lettu lensi kattoon ja jäi sinne kiinni!', 'mummi');
          return;
        }
        this.pancakes++;
        if (this.pancakes === 3) {
          MP.sfx.nom();
          this.say('Nam! Kolme lettua mansikkahillolla. Kiitos Mummi ja Ukki, ihana yökylä! Nyt hissillä alas.', 'me');
        } else this.say(this.pancakes === 1 ? 'Läts! Ensimmäinen lettu lautaselle.' : 'Vielä yksi!', 'me');
      }
    },

    update() {
      if (this.ceilingAt != null && this.dropAt == null && MP.time - this.ceilingAt > 3.5) {
        this.dropAt = MP.time;
        MP.sfx.boing();
        this.say('Ukki: Hei! Kuka laittoi letun minun päähäni? Hohhoo, hyvä hattu!', 'ukki');
      }
    },

    draw(ctx) {
      const t = MP.time;
      const night = this.step === 'night';
      const story = this.step === 'story' || this.step === 'ready';
      // the room (evening: warm; night: dark; morning: bright)
      ctx.fillStyle = '#fdf0dc'; ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(224,120,150,0.18)';
      for (let x = 10; x < MP.W; x += 22) for (let y = 10; y < FLOOR; y += 22) { ctx.beginPath(); ctx.arc(x + (y % 44 ? 11 : 0), y, 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#a0643c'; ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      cityWindow(ctx, t, this.step !== 'morning');

      if (this.step === 'morning') this.drawKitchen(ctx, t);
      else {
        sofa(ctx);
        // the dotted places and the pieces
        for (const s of SLOTS) {
          const p = this.pieces.find((q) => q.slot === s.id);
          if (p) continue;
          ctx.save();
          ctx.setLineDash([3, 2]); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(107,79,181,' + (0.5 + Math.sin(t * 4) * 0.3) + ')';
          MP.roundRect(ctx, s.x, s.y, s.w, s.h, 4); ctx.stroke();
          ctx.restore();
        }
        // me (and Ukki in the story) inside the fort, behind the walls
        if (story || night) {
          MP.drawPerson(ctx, 160, 142, { sit: true, outfit: PYJAMA, eyes: night || (this.step === 'story' && this.line >= STORY.length - 1) ? 'closed' : 'open', mouth: 'smile' });
          if (MP.myPet()) MP.drawPet(ctx, 182, 140, { kind: MP.myPet().kind, sleep: true });
        }
        const back = this.pieces.filter((p) => p.slot === 'back1' || p.slot === 'back2');
        const rest = this.pieces.filter((p) => !(p.slot === 'back1' || p.slot === 'back2'));
        for (const p of back.concat(rest)) {
          const s = p.slot && SLOTS.find((q) => q.id === p.slot);
          if (p.kind === 'blanket') {
            if (s) blanket(ctx, s.x + s.w / 2, s.y + s.h / 2, s.w, s.h, p.color, true);
            else blanket(ctx, p.x, p.y, 40, 18, p.color);
          } else if (s) cushion(ctx, s.x + s.w / 2, s.y + s.h / 2, s.w, s.h, p.color);
          else cushion(ctx, p.x, p.y, 22, 16, p.color);
        }
        if (story) {
          // Ukki reads with a book, a lamp glowing
          MP.drawPerson(ctx, 262, FLOOR, Object.assign({}, MP.GRANDPA, { mouth: 'open', flip: true }));
          ctx.fillStyle = '#6b4fb5'; ctx.fillRect(244, FLOOR - 36, 10, 8);
          ctx.fillStyle = 'rgba(255,220,120,0.25)';
          ctx.beginPath(); ctx.arc(250, 100, 60, 0, Math.PI * 2); ctx.fill();
        }
        if (this.step === 'fort' || this.step === 'ready') MP.drawPerson(ctx, 64, FLOOR, { hero: true, mouth: 'smile' });
      }

      // the night: lights off
      if (night) {
        const k = MP.clamp((t - this.nightAt) / 1.2, 0, 1);
        ctx.save();
        ctx.fillStyle = '#0d1433'; ctx.globalAlpha = 0.6 * k;
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.restore();
        // the window stays bright on top of the dark
        if (k > 0.3) cityWindow(ctx, t, true);
        if (k > 0.6) {
          MP.drawText(ctx, 'Hyvää yötä, Mummi ja Ukki!', 200, 40, { size: 1, color: '#ffe680', outline: O(), align: 'center' });
          MP.drawText(ctx, 'Kaupungin valot tuikkivat…', 200, 56, { size: 0.8, color: '#ffffff', outline: O(), align: 'center' });
          MP.drawText(ctx, '(napauta, niin tulee aamu)', 200, 70, { size: 0.65, color: '#ffffff', outline: O(), align: 'center' });
        }
      }

      const label = this.step === 'morning' && this.pancakes >= 3 ? 'Hissillä alas' : '◀ Takaisin';
      MP.drawButton(ctx, label, BTN, { size: 0.7, color: this.step === 'morning' && this.pancakes >= 3 ? '#e0559a' : undefined, shade: this.step === 'morning' && this.pancakes >= 3 ? '#a8326c' : undefined });
      const b = this.bubble;
      if (b && t >= b.from) {
        const tip = b.who === 'mummi' ? (this.step === 'morning' ? [96, 104] : [160, 70])
          : b.who === 'ukki' ? (this.step === 'morning' ? [274, 98] : [262, 104])
          : this.step === 'morning' ? [238, 104] : [160, 104];
        MP.drawBubble(ctx, b.text, tip[0], tip[1], { maxWidth: 190, size: 0.8 });
      }
    },

    // The morning kitchen corner: Mummi at the stove, the table with pancakes, Ukki
    drawKitchen(ctx, t) {
      ctx.save();
      ctx.lineWidth = 1; ctx.strokeStyle = O();
      // the stove
      ctx.fillStyle = '#f4f4f8'; ctx.fillRect(100, 126, 40, 30); ctx.strokeRect(100, 126, 40, 30);
      ctx.fillStyle = '#2b2340'; ctx.fillRect(104, 134, 32, 16);
      // the table
      ctx.fillStyle = '#c98a55'; ctx.fillRect(180, 130, 70, 4); ctx.strokeRect(180, 130, 70, 4);
      ctx.fillRect(184, 134, 3, FLOOR - 134); ctx.fillRect(243, 134, 3, FLOOR - 134);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(204, 128, 12, 2.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // pancakes on the plate (with red jam)
      for (let i = 0; i < this.pancakes; i++) {
        ctx.fillStyle = '#f0c070'; ctx.beginPath(); ctx.ellipse(204, 126 - i * 2, 10, 2.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      if (this.pancakes) { ctx.fillStyle = '#e04848'; ctx.beginPath(); ctx.arc(204, 125 - this.pancakes * 2, 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      // Mummi at the stove with the pan
      MP.drawPerson(ctx, 86, FLOOR, Object.assign({}, MP.GRANDMA, { mouth: 'smile', armUp: 0.4 }));
      const fu = (t - this.flipAt) / 0.8;
      ctx.save();
      ctx.lineWidth = 1; ctx.strokeStyle = O();
      ctx.fillStyle = '#2b2b33';
      ctx.beginPath(); ctx.ellipse(PAN.x, PAN.y, 14, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillRect(PAN.x - 26, PAN.y - 1, 12, 2.5);
      // the pancake in the pan (flying up and over when flipped)
      let py = PAN.y - 2, rot = 0;
      if (fu < 1) {
        const high = this.flips === 2 ? 0 : 1;
        py = PAN.y - 2 - Math.sin(fu * Math.PI) * (high ? 40 : 120);
        rot = fu * Math.PI * 2;
        if (!high && fu > 0.45) py = -999;     // it went up to the ceiling
      }
      if (py > -100) {
        ctx.fillStyle = '#f0c070';
        ctx.beginPath(); ctx.ellipse(PAN.x, py, 11, 2.8 * Math.abs(Math.cos(rot)) + 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      // the pancake on the ceiling (wobbling), or on Ukki's head
      if (this.ceilingAt != null && MP.time >= this.ceilingAt && this.dropAt == null) {
        ctx.fillStyle = '#f0c070';
        ctx.beginPath(); ctx.ellipse(PAN.x + Math.sin(t * 8) * 0.8, 6, 12, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
      const UKKI_X = 274;
      MP.drawPerson(ctx, UKKI_X, FLOOR, Object.assign({}, MP.GRANDPA, { mouth: this.dropAt != null ? 'open' : 'smile', flip: true }));
      if (this.dropAt != null) {
        const u = MP.clamp((t - this.dropAt) / 0.4, 0, 1);
        const hy = FLOOR - MP.PERSON_H * MP.GRANDPA.scale - 1;
        ctx.save();
        ctx.lineWidth = 1; ctx.strokeStyle = O(); ctx.fillStyle = '#f0c070';
        ctx.beginPath(); ctx.ellipse(UKKI_X, 6 + (hy - 6) * u * u, 11, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      MP.drawPerson(ctx, 238, FLOOR, { outfit: PYJAMA, mouth: this.pancakes ? 'open' : 'smile' });
    },
  };
})();
