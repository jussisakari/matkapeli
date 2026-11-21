// drive.js – A DRIVE in the family car (2D, side view). The car is parked by
// the street outside our fence; tap it on the home street to come here.
//   Hold the right side of the screen to drive, the left side to brake.
//   Tap the car: TÖÖT! Tap the radio: the Turpapojat song.
//   On the way: hills, puddles that splash, a cow crossing the road (wait for
//   it!), traffic lights, a petrol station and stars to collect.
//   At the lake the car drives right into the water – SPLASH! – the wheels fold
//   up and a propeller and a little sail pop out: "Auto muuttui veneeksi!"
//   Ducks, a jumping fish, a lighthouse. At the ramp it is a car again.
//   No crashing, no game over – at the end the car drives back home.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const ROAD = 140;               // the road's height on flat land
  const END = 3200;
  const WATER = { from: 1700, to: 2500 };
  const COW_X = 900;
  const LIGHT_X = 560;
  const PUDDLES = [380, 1250, 2800];
  const STARS = [250, 470, 760, 1080, 1420, 1900, 2150, 2350, 2700, 3000];
  const MAX = 110;
  const RADIO = { x: 246, y: 4, w: 70, h: 18 };
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const SONG = [64, 64, 67, 69, 67, 64, 62, 64, 62, 60, 64, 67];

  // the land's height at x (hills between the flat bits; flat by the water)
  const FLATS = [[0, 120], [LIGHT_X - 80, LIGHT_X + 80], [COW_X - 120, COW_X + 120], [WATER.from - 120, WATER.to + 120], [END - 60, END + 400]];
  function ground(x) {
    // how far from the nearest flat bit: the hills grow smoothly from there
    let d = 1e9;
    for (const [a, b] of FLATS) d = Math.min(d, x < a ? a - x : x > b ? x - b : 0);
    const k = MP.clamp(d / 60, 0, 1);
    return ROAD - Math.max(0, Math.sin(x / 90)) * 14 * k;
  }
  const inWater = (x) => x > WATER.from && x < WATER.to;

  MP.scenes.drive = {
    noRestart: true,

    enter() {
      this.x = 60;
      this.v = 0;
      this.camX = 0;
      this.honkAt = -9;
      this.splashAt = -9;
      this.boatK = 0;             // 0 = car, 1 = boat
      this.stars = STARS.map((x) => ({ x, got: false }));
      this.got = 0;
      this.cowFrom = null;
      this.radioAt = -99;
      this.radioNote = 0;
      this.bubble = null;
      this.done = false;
      this.said = {};
      this.fishAt = 0;
      this.say('Lähdetään ajelulle! Pidä sormea ruudun oikealla puolella, niin auto ajaa. Vasen puoli jarruttaa.');
    },

    say(text) {
      this.bubble = { text, from: MP.time, until: Infinity };
    },

    carScreen() {
      return { x: this.x - this.camX, y: this.carY() };
    },
    carY() {
      if (this.boatK > 0) {
        const float = ROAD + 4 + Math.sin(MP.time * 3) * 1.5;
        return ground(this.x) + (float - ground(this.x)) * this.boatK;
      }
      return ground(this.x);
    },

    onTap(x, y) {
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.street, { from: 'car' });
        return;
      }
      if (MP.hit(RADIO, x, y)) {
        this.radioAt = MP.time;
        this.radioNote = 0;
        this.say('Radiosta tulee Turpapoikien biisi! Mä löin sua turpaan…');
        MP.sfx.tap();
        return;
      }
      const c = this.carScreen();
      if (Math.abs(x - c.x) < 22 && Math.abs(y - (c.y - 10)) < 16) {
        this.honkAt = MP.time;
        MP.sfx.note(392, 0.18, 'square', 0.12);
        setTimeout(() => MP.sfx.note(392, 0.3, 'square', 0.12), 220);
      }
    },

    update(dt) {
      if (this.done) return;
      const t = MP.time;
      const p = MP.pointer;
      // the cow on the road: wait until it has walked across
      if (this.cowFrom == null && this.x > COW_X - 170) { this.cowFrom = t; this.say('Lehmä tiellä! Odotetaan… Ammuu!'); MP.sfx.boing(); }
      const cowOnRoad = this.cowFrom != null && t - this.cowFrom < 5;
      // the traffic light: red for a moment when you come
      const lightRed = this.x < LIGHT_X - 20 && this.x > LIGHT_X - 200 && Math.floor(t / 3) % 2 === 0;
      let want = 0;
      if (p.down && p.x > MP.W / 2) want = MAX;
      if (p.down && p.x <= MP.W / 2 && !MP.hit(BACK, p.x, p.y) && !MP.hit(RADIO, p.x, p.y)) want = -1;     // brake
      if (cowOnRoad && this.x > COW_X - 70) want = Math.min(want, 0);
      if (lightRed && this.x > LIGHT_X - 70) want = Math.min(want, 0);
      if (want === -1) this.v = Math.max(0, this.v - 160 * dt);
      else if (want > this.v) this.v = Math.min(want, this.v + 60 * dt);
      else this.v = Math.max(0, this.v - 40 * dt);
      if (cowOnRoad && this.x > COW_X - 62) this.v = 0;
      if (lightRed && this.x > LIGHT_X - 62 && this.x < LIGHT_X - 20) this.v = 0;
      this.x = Math.min(END, this.x + this.v * dt);
      this.camX = MP.clamp(this.x - 110, 0, END + 120 - MP.W);

      // water: the car turns into a boat
      const wet = inWater(this.x + 10);
      if (wet && this.boatK === 0 && !this.said.boat) {
        this.said.boat = true;
        this.splashAt = t;
        MP.sfx.flush();
        this.say('PLÄTSKIS! Auto muuttui veneeksi! Pyörät nousivat ylös ja potkuri pyörii!');
      }
      this.boatK = MP.clamp(this.boatK + (wet ? dt * 2 : -dt * 2), 0, 1);
      if (!wet && this.said.boat && !this.said.car && this.x > WATER.to) {
        this.said.car = true;
        this.say('Ramppia ylös – ja taas auto! Brrrum!');
        MP.sfx.boing();
      }
      // puddles splash
      for (const px of PUDDLES) {
        if (Math.abs(this.x - px) < 6 && this.v > 20 && t - this.splashAt > 0.6) { this.splashAt = t; MP.sfx.flush(); }
      }
      // stars
      for (const s of this.stars) {
        if (!s.got && Math.abs(this.x - s.x) < 12) { s.got = true; this.got++; MP.sfx.bling(); }
      }
      // little things to say on the way
      const sayAt = (k, x, text) => { if (!this.said[k] && this.x > x) { this.said[k] = true; this.say(text); } };
      sayAt('light', LIGHT_X - 220, 'Liikennevalot! Punaisella odotetaan, vihreällä mennään.');
      sayAt('gas', 1350, 'Huoltoasema! Tankki on täynnä – jatketaan.');
      sayAt('lake', WATER.from - 200, 'Edessä on järvi… ja tie menee suoraan veteen?!');
      sayAt('home', END - 200, 'Kotitalo näkyy jo! Takaisin kotiin.');
      // the radio plays the song
      if (t - this.radioAt < SONG.length * 0.32 && t - this.radioAt > this.radioNote * 0.32) {
        MP.sfx.note(440 * Math.pow(2, (SONG[this.radioNote] - 69) / 12), 0.28, 'square', 0.06);
        this.radioNote++;
      }
      if (this.x >= END && !this.done) {
        this.done = true;
        MP.sfx.applause(1.5);
        this.say('Kotona! Hieno ajelu! Keräsit ' + this.got + ' tähteä.');
        setTimeout(() => { if (MP.scene === this) MP.goTo(MP.scenes.street, { from: 'car' }); }, 3200);
      }
    },

    draw(ctx) {
      const t = MP.time;
      const cx = this.camX;
      // the sky and far hills (slower)
      const g = ctx.createLinearGradient(0, 0, 0, ROAD);
      g.addColorStop(0, '#8fd0f6'); g.addColorStop(1, '#e6f6ff');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      MP.draw('sun', ctx, 0, 0, { x: 280, y: 30, r: 10 });
      ctx.fillStyle = '#a8d8a0';
      for (let i = 0; i < 12; i++) {
        const hx = i * 140 - cx * 0.3;
        ctx.beginPath(); ctx.ellipse(hx, ROAD, 90, 34 + (i % 3) * 8, 0, Math.PI, 0); ctx.fill();
      }
      ctx.save();
      ctx.translate(-cx, 0);
      // --- the land and the road ---
      ctx.fillStyle = '#7cc56b';
      ctx.beginPath();
      ctx.moveTo(cx - 10, MP.H);
      for (let x = cx - 10; x <= cx + MP.W + 10; x += 6) ctx.lineTo(x, inWater(x) ? MP.H : ground(x) + 6);
      ctx.lineTo(cx + MP.W + 10, MP.H); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#6b6f7a'; ctx.lineWidth = 8;
      ctx.beginPath();
      let pen = false;
      for (let x = cx - 10; x <= cx + MP.W + 10; x += 4) {
        if (inWater(x)) { pen = false; continue; }
        if (!pen) { ctx.moveTo(x, ground(x) + 3); pen = true; } else ctx.lineTo(x, ground(x) + 3);
      }
      ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
      ctx.setLineDash([8, 8]);
      ctx.beginPath(); pen = false;
      for (let x = cx - 10; x <= cx + MP.W + 10; x += 4) {
        if (inWater(x)) { pen = false; continue; }
        if (!pen) { ctx.moveTo(x, ground(x) + 3); pen = true; } else ctx.lineTo(x, ground(x) + 3);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // --- the lake ---
      if (cx + MP.W > WATER.from && cx < WATER.to) {
        ctx.fillStyle = '#3f9fd0';
        ctx.fillRect(WATER.from, ROAD + 2, WATER.to - WATER.from, MP.H - ROAD);
        ctx.strokeStyle = '#bfe6ff'; ctx.lineWidth = 1.2;
        for (let x = WATER.from; x < WATER.to; x += 18) {
          ctx.beginPath(); ctx.arc(x + Math.sin(t * 2 + x) * 3, ROAD + 6 + (x % 3) * 8, 5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        }
        // ramps
        ctx.fillStyle = '#a0703c';
        ctx.beginPath(); ctx.moveTo(WATER.from - 20, ROAD + 6); ctx.lineTo(WATER.from + 30, ROAD + 16); ctx.lineTo(WATER.from - 20, ROAD + 16); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(WATER.to + 20, ROAD + 6); ctx.lineTo(WATER.to - 30, ROAD + 16); ctx.lineTo(WATER.to + 20, ROAD + 16); ctx.closePath(); ctx.fill();
        // the lighthouse on an island and ducks
        ctx.fillStyle = '#8a8a7a'; ctx.beginPath(); ctx.ellipse(2150, ROAD + 4, 40, 8, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(2144, ROAD - 46, 12, 46);
        ctx.fillStyle = '#e04848'; for (let k = 0; k < 3; k++) ctx.fillRect(2144, ROAD - 40 + k * 14, 12, 6);
        ctx.fillStyle = '#ffe9a0'; ctx.fillRect(2142, ROAD - 54, 16, 8);
        for (let k = 0; k < 3; k++) {
          const dx = 1880 + k * 22 + Math.sin(t + k) * 6, dy = ROAD + 8;
          ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(dx, dy, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(dx + 4, dy - 4, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ff8a2a'; ctx.fillRect(dx + 6, dy - 4.5, 2.5, 1.2);
        }
        // a fish jumps over the car-boat
        if (this.boatK > 0.5) {
          const u = (t * 0.6) % 1;
          const fx = this.x - 30 + u * 60, fy = ROAD + 4 - Math.sin(u * Math.PI) * 40;
          ctx.fillStyle = '#4a9be0'; ctx.beginPath(); ctx.ellipse(fx, fy, 5, 2.4, Math.cos(u * Math.PI) * -0.8, 0, Math.PI * 2); ctx.fill();
        }
      }
      // --- puddles ---
      for (const px of PUDDLES) {
        ctx.fillStyle = '#6fa8d0';
        ctx.beginPath(); ctx.ellipse(px, ground(px) + 4, 14, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      }
      // --- the traffic light ---
      ctx.fillStyle = '#5a5a6a'; ctx.fillRect(LIGHT_X, ROAD - 50, 3, 52);
      ctx.fillStyle = '#2b2b33'; MP.roundRect(ctx, LIGHT_X - 4, ROAD - 66, 11, 26, 3); ctx.fill();
      const red = Math.floor(t / 3) % 2 === 0;
      ctx.fillStyle = red ? '#ff3a3a' : '#5a2a2a'; ctx.beginPath(); ctx.arc(LIGHT_X + 1.5, ROAD - 60, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = red ? '#2a5a2a' : '#4cd964'; ctx.beginPath(); ctx.arc(LIGHT_X + 1.5, ROAD - 47, 3.4, 0, Math.PI * 2); ctx.fill();
      // --- the petrol station ---
      ctx.fillStyle = '#ffffff'; ctx.fillRect(1320, ROAD - 40, 70, 40);
      ctx.fillStyle = '#e04848'; ctx.fillRect(1310, ROAD - 48, 90, 8);
      ctx.fillStyle = '#3cb371'; ctx.fillRect(1336, ROAD - 30, 10, 26); ctx.fillRect(1364, ROAD - 30, 10, 26);
      // --- the cow ---
      if (this.cowFrom != null) {
        const u = MP.clamp((t - this.cowFrom) / 5, 0, 1);
        const cowX = COW_X - 30 + u * 70, cowY = ROAD + (u < 1 ? 0 : 12);
        ctx.save();
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = O(); ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.ellipse(cowX, cowY - 14, 14, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2b2b33'; ctx.beginPath(); ctx.ellipse(cowX - 4, cowY - 16, 4, 3, 0, 0, Math.PI * 2); ctx.ellipse(cowX + 6, cowY - 12, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(cowX + 16, cowY - 20, 5, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffb7c0'; ctx.beginPath(); ctx.ellipse(cowX + 20, cowY - 19, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
        for (const lx of [-9, -3, 4, 10]) { ctx.fillStyle = '#ffffff'; ctx.fillRect(cowX + lx, cowY - 7 + Math.sin(t * 8 + lx) * 1, 2.5, 7); }
        if (u < 1) MP.drawText(ctx, 'Ammuu!', cowX + 10, cowY - 36, { size: 0.6, color: O(), align: 'center' });
        ctx.restore();
      }
      // --- stars to collect ---
      for (const s of this.stars) {
        if (s.got) continue;
        MP.drawText(ctx, '★', s.x, (inWater(s.x) ? ROAD - 4 : ground(s.x)) - 30 + Math.sin(t * 3 + s.x) * 2, { size: 1.2, color: '#ffd23f', outline: O(), align: 'center' });
      }
      // --- home at the end ---
      ctx.fillStyle = '#f2d7b0'; ctx.fillRect(END + 20, ROAD - 46, 60, 46);
      ctx.fillStyle = '#c0504d'; ctx.beginPath(); ctx.moveTo(END + 12, ROAD - 46); ctx.lineTo(END + 50, ROAD - 70); ctx.lineTo(END + 88, ROAD - 46); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#b07a45'; for (let x = END - 30; x < END + 10; x += 6) ctx.fillRect(x, ROAD - 12, 3, 12);
      ctx.restore();

      // --- the car (or the car-boat) ---
      const c = this.carScreen();
      const ang = this.boatK > 0.5 ? Math.sin(t * 3) * 0.05 : Math.atan2(ground(this.x + 8) - ground(this.x - 8), 16);
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(ang);
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = O();
      // the sail (pops up on the water)
      if (this.boatK > 0) {
        ctx.save(); ctx.globalAlpha = this.boatK;
        ctx.fillStyle = '#8a5a32'; ctx.fillRect(-2, -42 * this.boatK, 2, 42 * this.boatK);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -40 * this.boatK); ctx.lineTo(16 * this.boatK, -20 * this.boatK); ctx.lineTo(0, -18 * this.boatK); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      // the body
      ctx.fillStyle = '#e04848';
      MP.roundRect(ctx, -22, -16, 44, 12, 4); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-12, -16); ctx.lineTo(-7, -26); ctx.lineTo(9, -26); ctx.lineTo(14, -16); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#bfe6ff';
      ctx.beginPath(); ctx.moveTo(-9, -17); ctx.lineTo(-6, -24); ctx.lineTo(0, -24); ctx.lineTo(0, -17); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(2, -17); ctx.lineTo(2, -24); ctx.lineTo(8, -24); ctx.lineTo(12, -17); ctx.closePath(); ctx.fill();
      // me driving (just the head in the window) and the pet in the back
      ctx.fillStyle = MP.COLORS.skin || '#f6cfa8';
      ctx.beginPath(); ctx.arc(6, -20, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = (MP.CHARACTERS[MP.state.character] || { hair: '#8b4a2b' }).hair;
      ctx.beginPath(); ctx.arc(6, -21.5, 3.2, Math.PI, 0); ctx.fill();
      const pet = MP.myPet && MP.myPet();
      if (pet) {
        ctx.fillStyle = pet.kind === 'cat' ? '#f2a65a' : '#c98a55';
        ctx.beginPath(); ctx.arc(-8, -21 + Math.sin(t * 6) * 0.6, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-10.5, -23); ctx.lineTo(-10, -26); ctx.lineTo(-8, -23.5); ctx.fill();
        ctx.fillStyle = '#ff8fa3'; ctx.fillRect(-13, -20 + Math.sin(t * 10) * 0.6, 2, 1.5);      // the tongue out of the window
      }
      // wheels (fold up in the water) and the propeller
      const fold = this.boatK;
      ctx.fillStyle = '#2b2b33';
      for (const wx of [-13, 13]) {
        ctx.save();
        ctx.translate(wx, -4 - fold * 6);
        ctx.rotate(this.x / 8);
        ctx.beginPath(); ctx.arc(0, 0, 5 * (1 - fold * 0.4), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c9d3e6'; ctx.fillRect(-1, -1, 2, 2); ctx.fillStyle = '#2b2b33';
        ctx.restore();
      }
      if (fold > 0) {
        ctx.save(); ctx.translate(-24, -6); ctx.rotate(t * 20);
        ctx.fillStyle = '#c9d3e6'; ctx.fillRect(-1, -5 * fold, 2, 10 * fold);
        ctx.restore();
      }
      ctx.restore();
      if (t - this.honkAt < 0.6) MP.drawText(ctx, 'TÖÖT!', c.x + 16, c.y - 44, { size: 0.9, color: '#ffd23f', outline: O(), align: 'center' });
      if (t - this.splashAt < 0.8) {
        ctx.fillStyle = '#8fd3ff';
        for (let k = 0; k < 8; k++) {
          const a = Math.PI + k / 7 * Math.PI, r = (t - this.splashAt) * 40;
          ctx.beginPath(); ctx.arc(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r * 0.7, 2, 0, Math.PI * 2); ctx.fill();
        }
      }

      // the buttons and the hints
      MP.drawButton(ctx, '◀ Lopeta', BACK, { size: 0.8, color: '#9aa3b5', shade: '#6b7385' });
      MP.drawButton(ctx, '♪ Radio', RADIO, { size: 0.8, color: '#e0559a', shade: '#a8326c' });
      MP.drawText(ctx, '★ ' + this.got, 160, 6, { size: 0.9, color: '#ffd23f', outline: O(), align: 'center' });
      if (!MP.pointer.down && this.v < 5 && !this.done) {
        MP.drawText(ctx, 'jarru ◀', 40, 166, { size: 0.7, color: '#ffffff', outline: O(), align: 'center' });
        MP.drawText(ctx, '▶ aja', 280, 166, { size: 0.7, color: '#ffffff', outline: O(), align: 'center' });
      }
      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, c.x, c.y - 48, { maxWidth: 180, size: 0.8 });
    },
  };
})();
