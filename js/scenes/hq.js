// hq.js – THE SUPERHEROES' HEADQUARTERS in New York (2D). Only heroes get in
// (the door robot in newyork.js checks for a hero costume).
//   Big screens with a city map and a blinking "Apua!" call.
//   The gadget wall: tap it – shoot a web to the ceiling and swing across the room!
//   The training wall: climb up and jump down.
//   The pizza fridge, and a sleeping robot helper that wakes up: "Hei sankari!"
//   The garage: the Spiderman car drives up a building wall and swings over the
//   street on a web.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const FLOOR = 156;
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const SCREENS = { x: 96, y: 16, w: 128, h: 58 };
  const GADGETS = { x: 18, y: 40, w: 52, h: 70 };
  const CLIMB = { x: 236, y: 24, w: 30, h: 132 };
  const FRIDGE = { x: 76, y: 102, w: 24, h: 54 };
  const ROBOT = { x: 140, y: 132 };
  const GARAGE = { x: 278, y: 96, w: 40, h: 60 };

  function spiderLogo(c, x, y, s, color) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.fillStyle = color || '#d62828';
    c.strokeStyle = color || '#d62828';
    c.beginPath(); c.ellipse(0, 0, 2.4, 3.6, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(0, -4.4, 1.6, 0, Math.PI * 2); c.fill();
    c.lineWidth = 0.9;
    for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(sd * 2, -1.6 + k * 1.2);
      c.lineTo(sd * 5, -4 + k * 2.4); c.lineTo(sd * 6.4, -2 + k * 3.4); c.stroke();
    }
    c.restore();
  }

  MP.scenes.hq = {
    noRestart: true,

    enter() {
      this.player = new MP.Player(40, { minX: 20, maxX: 300 });
      this.player.place(40, 1);
      this.act = null;               // { kind: 'swing' | 'climb' | 'car', at }
      this.robotAt = -99;
      this.fridgeAt = -99;
      this.bubble = null;
      const suit = MP.findItem('costume', MP.state.outfit.costume);
      this.say('Päämaja! Tervetuloa, ' + (suit && suit.id !== 'none' ? suit.name : 'sankari') + '! Ruuduilla näkyy koko kaupunki.');
    },

    say(text) {
      this.bubble = { text, from: MP.time, until: Infinity };
    },

    onTap(x, y) {
      const t = MP.time;
      if (this.act && t - this.act.at < (this.act.kind === 'car' ? 2 : 1)) return;
      if (this.act && this.act.kind === 'car') { this.act = null; return; }
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.newyork, { from: 'hq' });
        return;
      }
      if (MP.hit(GADGETS, x, y)) {
        this.player.walkTo(GADGETS.x + GADGETS.w + 8, () => {
          this.act = { kind: 'swing', at: MP.time };
          MP.sfx.thwip();
          this.say('Seitti kattoon – ja heilautus huoneen poikki! Wiii!');
        });
        return;
      }
      if (MP.hit(CLIMB, x, y)) {
        this.player.walkTo(CLIMB.x - 8, () => {
          this.act = { kind: 'climb', at: MP.time };
          MP.sfx.boing();
          this.say('Harjoitusseinä! Kiipeän ylös… ja hyppy alas!');
        });
        return;
      }
      if (MP.hit(FRIDGE, x, y)) {
        this.player.walkTo(FRIDGE.x + FRIDGE.w + 8, () => {
          this.fridgeAt = MP.time;
          MP.sfx.nom();
          this.say('Jääkaappi täynnä pizzaa! Sankarit tarvitsevat energiaa. Nam!');
        });
        return;
      }
      if (Math.hypot(x - ROBOT.x, y - ROBOT.y) < 16) {
        this.robotAt = t;
        MP.sfx.bling();
        this.say('Robottiapuri heräsi: Bip bup! Hei sankari! Kaupungissa on kaikki hyvin.');
        return;
      }
      if (MP.hit(SCREENS, x, y)) {
        this.say('Ruudulla vilkkuu: APUA! Kissa on jumissa puussa Broadwaylla. Sankari hoitaa!');
        MP.sfx.tune();
        return;
      }
      if (MP.hit(GARAGE, x, y)) {
        this.player.walkTo(GARAGE.x - 12, () => {
          this.act = { kind: 'car', at: MP.time };
          this.bubble = null;
          MP.sfx.rocket ? MP.sfx.rocket() : MP.sfx.bling();
        });
        return;
      }
      this.player.walkTo(x);
    },

    update(dt) {
      this.player.update(dt);
      const a = this.act;
      if (a && a.kind === 'swing' && MP.time - a.at > 2.2) { this.act = null; this.player.place(GADGETS.x + GADGETS.w + 8 + 150, -1); }
      if (a && a.kind === 'climb' && MP.time - a.at > 2.6) { this.act = null; }
      if (a && a.kind === 'car' && MP.time - a.at > 7) { this.act = null; this.say('Spiderman-auto on taas autotallissa. Mikä kyyti!'); }
    },

    draw(ctx) {
      const t = MP.time;
      const a = this.act;
      if (a && a.kind === 'car') return this.drawCarRide(ctx, t - a.at);
      // the room: dark blue walls with red stripes
      ctx.fillStyle = '#1d2244';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(214,40,40,0.35)';
      ctx.fillRect(0, 84, MP.W, 4);
      ctx.fillStyle = '#2b2b33';
      ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      for (let x = 0; x < MP.W; x += 20) { ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x - 8, MP.H); ctx.stroke(); }
      spiderLogo(ctx, 160, 118, 3, 'rgba(214,40,40,0.4)');
      // the big screens: the city map and a blinking help call
      ctx.save();
      ctx.lineWidth = 1; ctx.strokeStyle = '#5fd4ff';
      ctx.fillStyle = '#0a2a3a';
      ctx.fillRect(SCREENS.x, SCREENS.y, SCREENS.w, SCREENS.h); ctx.strokeRect(SCREENS.x, SCREENS.y, SCREENS.w, SCREENS.h);
      ctx.strokeStyle = 'rgba(95,212,255,0.5)';
      for (let x = SCREENS.x + 8; x < SCREENS.x + SCREENS.w; x += 14) { ctx.beginPath(); ctx.moveTo(x, SCREENS.y); ctx.lineTo(x, SCREENS.y + SCREENS.h); ctx.stroke(); }
      for (let y = SCREENS.y + 8; y < SCREENS.y + SCREENS.h; y += 12) { ctx.beginPath(); ctx.moveTo(SCREENS.x, y); ctx.lineTo(SCREENS.x + SCREENS.w, y); ctx.stroke(); }
      if (Math.floor(t * 2) % 2) {
        ctx.fillStyle = '#ff3a3a'; ctx.beginPath(); ctx.arc(SCREENS.x + 86, SCREENS.y + 30, 4, 0, Math.PI * 2); ctx.fill();
        MP.drawText(ctx, 'APUA!', SCREENS.x + 86, SCREENS.y + 36, { size: 0.6, color: '#ff3a3a', align: 'center' });
      }
      ctx.restore();
      // the gadget wall: web shooters and things
      ctx.save();
      ctx.fillStyle = '#3a3f5a'; ctx.fillRect(GADGETS.x, GADGETS.y, GADGETS.w, GADGETS.h);
      ctx.strokeStyle = O(); ctx.strokeRect(GADGETS.x, GADGETS.y, GADGETS.w, GADGETS.h);
      for (let i = 0; i < 6; i++) {
        const gx = GADGETS.x + 8 + (i % 2) * 24, gy = GADGETS.y + 8 + Math.floor(i / 2) * 22;
        ctx.fillStyle = ['#d62828', '#c9d3e6', '#2f6fb8'][i % 3];
        MP.roundRect(ctx, gx, gy, 14, 10, 3); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
      MP.drawText(ctx, 'Seittiampujat', GADGETS.x + GADGETS.w / 2, GADGETS.y - 9, { size: 0.5, color: '#ffffff', align: 'center' });
      // the training wall with climbing holds
      ctx.save();
      ctx.fillStyle = '#4a5068'; ctx.fillRect(CLIMB.x, CLIMB.y, CLIMB.w, CLIMB.h);
      for (let i = 0; i < 12; i++) { ctx.fillStyle = ['#ffd23f', '#7bd389', '#ff8fc0'][i % 3]; ctx.beginPath(); ctx.arc(CLIMB.x + 6 + (i * 11) % 20, CLIMB.y + 10 + i * 10, 2.4, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      // the pizza fridge
      ctx.save();
      ctx.lineWidth = 1; ctx.strokeStyle = O();
      const open = t - this.fridgeAt < 2.5;
      ctx.fillStyle = '#e8eef6'; ctx.fillRect(FRIDGE.x, FRIDGE.y, FRIDGE.w, FRIDGE.h); ctx.strokeRect(FRIDGE.x, FRIDGE.y, FRIDGE.w, FRIDGE.h);
      if (open) {
        ctx.fillStyle = '#fff3c4'; ctx.fillRect(FRIDGE.x + 2, FRIDGE.y + 2, FRIDGE.w - 4, FRIDGE.h - 4);
        for (let k = 0; k < 3; k++) { ctx.fillStyle = '#ffcf5a'; ctx.beginPath(); ctx.moveTo(FRIDGE.x + 4, FRIDGE.y + 10 + k * 14); ctx.lineTo(FRIDGE.x + 20, FRIDGE.y + 6 + k * 14); ctx.lineTo(FRIDGE.x + 20, FRIDGE.y + 14 + k * 14); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#d33a3a'; ctx.beginPath(); ctx.arc(FRIDGE.x + 15, FRIDGE.y + 10 + k * 14, 1.5, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore();
      MP.drawText(ctx, 'PIZZA', FRIDGE.x + FRIDGE.w / 2, FRIDGE.y - 8, { size: 0.5, color: '#ffffff', align: 'center' });
      // the robot helper (sleeps until tapped)
      const awake = t - this.robotAt < 4;
      ctx.save();
      ctx.lineWidth = 1; ctx.strokeStyle = O();
      ctx.fillStyle = '#c9d3e6';
      MP.roundRect(ctx, ROBOT.x - 10, ROBOT.y - 6, 20, 22, 4); ctx.fill(); ctx.stroke();
      MP.roundRect(ctx, ROBOT.x - 8, ROBOT.y - 20 + (awake ? -2 : 0), 16, 13, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = awake ? '#5fd4ff' : '#2b3350';
      ctx.fillRect(ROBOT.x - 5, ROBOT.y - 16 + (awake ? -2 : 0), 3, awake ? 3 : 1);
      ctx.fillRect(ROBOT.x + 2, ROBOT.y - 16 + (awake ? -2 : 0), 3, awake ? 3 : 1);
      ctx.beginPath(); ctx.moveTo(ROBOT.x, ROBOT.y - 20); ctx.lineTo(ROBOT.x, ROBOT.y - 26); ctx.stroke();
      ctx.fillStyle = awake && Math.floor(t * 4) % 2 ? '#ff3a3a' : '#8a93a6';
      ctx.beginPath(); ctx.arc(ROBOT.x, ROBOT.y - 27, 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (!awake) MP.drawText(ctx, 'z z', ROBOT.x + 14, ROBOT.y - 28 - (t * 4) % 4, { size: 0.6, color: '#5fd4ff', align: 'center' });
      // the garage door with the car behind it
      ctx.save();
      ctx.fillStyle = '#3a3f5a'; ctx.fillRect(GARAGE.x, GARAGE.y, GARAGE.w, GARAGE.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      for (let y = GARAGE.y + 6; y < GARAGE.y + GARAGE.h; y += 6) { ctx.beginPath(); ctx.moveTo(GARAGE.x, y); ctx.lineTo(GARAGE.x + GARAGE.w, y); ctx.stroke(); }
      ctx.restore();
      spiderLogo(ctx, GARAGE.x + GARAGE.w / 2, GARAGE.y + 22, 1.6);
      MP.drawText(ctx, 'AUTOTALLI', GARAGE.x + GARAGE.w / 2, GARAGE.y - 8, { size: 0.45, color: '#ffffff', align: 'center' });

      // me: swinging on a web, climbing, or walking
      const p = this.player;
      if (a && a.kind === 'swing') {
        const u = MP.clamp((t - a.at) / 2.2, 0, 1);
        const ang = -1 + u * 2;
        const ax = 150, ay = 8, L = 120;
        const hx = ax + Math.sin(ang) * L, hy = ay + Math.cos(ang) * L;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(hx, hy - 30); ctx.stroke();
        MP.drawPerson(ctx, hx, hy, { hero: true, armUp: 1, flip: false });
      } else if (a && a.kind === 'climb') {
        const u = (t - a.at) / 2.6;
        const up = u < 0.6 ? u / 0.6 : 1 - (u - 0.6) / 0.4;
        MP.drawPerson(ctx, CLIMB.x - 4 + (u > 0.6 ? (u - 0.6) * 60 : 0), FLOOR - up * 100, { hero: true, armUp: 1, walking: u < 0.6, walkTime: t });
      } else {
        MP.drawPerson(ctx, p.x, FLOOR, { walking: p.walking, walkTime: p.walkTime, flip: p.facing < 0, hero: true });
      }
      MP.drawButton(ctx, '◀ Ulos', BACK, { size: 0.8 });
      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, MP.clamp(p.x, 60, 260), FLOOR - 50, { maxWidth: 170, size: 0.8 });
    },

    // the Spiderman car: up a building wall, a web, and a swing over the street
    drawCarRide(ctx, u) {
      const g = ctx.createLinearGradient(0, 0, 0, MP.H);
      g.addColorStop(0, '#5fa8e0'); g.addColorStop(1, '#bfe6ff');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      // skyscrapers
      for (let i = 0; i < 8; i++) {
        const bx = i * 44 - 10, bh = 90 + (i * 37) % 60;
        ctx.fillStyle = ['#6d7a8c', '#8c8f99', '#4d5566'][i % 3];
        ctx.fillRect(bx, 170 - bh, 38, bh);
        ctx.fillStyle = '#ffe9a0';
        for (let y = 170 - bh + 6; y < 166; y += 10) { ctx.fillRect(bx + 6, y, 5, 5); ctx.fillRect(bx + 22, y, 5, 5); }
      }
      ctx.fillStyle = '#55585f'; ctx.fillRect(0, 166, MP.W, 14);
      // the car's path: along the street, up the wall, a web swing, down again
      let x, y, rot;
      if (u < 1.6) { x = 20 + u * 80; y = 160; rot = 0; }
      else if (u < 3.2) { const k = (u - 1.6) / 1.6; x = 148; y = 160 - k * 100; rot = -Math.PI / 2; }
      else if (u < 5.4) {
        const k = (u - 3.2) / 2.2;
        const a = -1.1 + k * 2.2;
        x = 210 + Math.sin(a) * 70; y = 20 + Math.cos(a) * 70; rot = a * 0.3;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(210, 20); ctx.lineTo(x, y - 6); ctx.stroke();
      } else { const k = (u - 5.4) / 1.6; x = 270 + k * 60; y = 90 + k * 70; rot = 0.4; }
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.lineWidth = 0.9; ctx.strokeStyle = O();
      ctx.fillStyle = '#d62828'; MP.roundRect(ctx, -16, -12, 32, 10, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2b4fa8'; ctx.beginPath(); ctx.moveTo(-9, -12); ctx.lineTo(-5, -20); ctx.lineTo(7, -20); ctx.lineTo(11, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
      spiderLogo(ctx, 0, -6, 0.6, '#1b1b2a');
      ctx.fillStyle = '#2b2b33';
      for (const wx of [-10, 10]) { ctx.beginPath(); ctx.arc(wx, -2, 3.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      MP.drawText(ctx, u < 1.6 ? 'Brrrum!' : u < 3.2 ? 'Seinää pitkin ylös!' : u < 5.4 ? 'Seitti – ja heilautus!' : 'Jee!', 160, 8, { size: 1.2, color: '#ffffff', outline: O(), align: 'center' });
      MP.drawText(ctx, '(napauta, niin kyyti loppuu)', MP.W - 4, 170, { size: 0.5, color: '#ffffff', outline: O(), align: 'right' });
    },
  };
})();
