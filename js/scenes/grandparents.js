// grandparents.js – MUMMI JA UKKI live high up in a New York skyscraper (2D).
//   1. The lobby: the doorman says "Good morning!". Tap the elevator.
//   2. The elevator: tap floor 77. On the way up it stops at funny floors by
//      mistake – balloons everywhere, a dog walker with eight dogs, a yoga
//      class – "Ding!" and the doors close again.
//   3. Mummi and Ukki's apartment: hugs! Mummi has just baked pulla (tap to eat –
//      crumbs!), Ukki has binoculars at the big window (tap: see the city, the
//      Statue of Liberty and tiny yellow taxis), a cuckoo clock and a fish tank.
//   "Hei hei!" takes the elevator down and back out to the street.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const FLOOR = 156;
  const HOME_FLOOR = 77;
  const BACK = { x: 4, y: 4, w: 74, h: 18 };
  const LIFT = { x: 238, y: 58, w: 52, h: 98 };
  const BTN77 = { x: 196, y: 96, w: 40, h: 26 };
  const STOPS = [
    { floor: 23, kind: 'balloons', say: 'Ding! Kerros 23… täällä on pelkkiä ilmapalloja! Väärä kerros!' },
    { floor: 41, kind: 'dogs', say: 'Ding! Kerros 41… koiranulkoiluttaja ja kahdeksan koiraa! Hau hau! Väärä kerros!' },
    { floor: 58, kind: 'yoga', say: 'Ding! Kerros 58… joogatunti! Kaikki seisovat yhdellä jalalla. Väärä kerros!' },
  ];
  // the apartment
  const MUMMI_X = 150, UKKI_X = 236;
  const PULLA = { x: 112, y: 128 };
  const WIN = { x: 170, y: 22, w: 120, h: 80 };
  const CLOCK = { x: 60, y: 48 };
  const TANK = { x: 34, y: 120, w: 44, h: 28 };

  const MUMMI = { character: 'girl', hair: '#d8d8e0', noBow: true, glasses: true, scale: 1.25,
    outfit: { shirt: 'green', bottom: 'skirtPurple', hat: 'none', costume: 'none', shoes: false } };
  const UKKI = { character: 'boy', hair: '#c8c8d0', glasses: true, scale: 1.32,
    outfit: { shirt: 'sailor', bottom: 'brown', hat: 'none', costume: 'none', shoes: false } };
  MP.GRANDMA = MUMMI;    // they are in the sleepover too (sleepover.js)
  MP.GRANDPA = UKKI;
  const SLEEP = { x: 236, y: 4, w: 80, h: 18 };   // "Jää yökylään"

  function balloons(c, t) {
    const cols = ['#ff5d8f', '#ffd23f', '#4cc9f0', '#7bd389', '#b388ff'];
    for (let i = 0; i < 22; i++) {
      const x = 20 + (i * 47) % 280, y = 40 + (i * 29) % 100 + Math.sin(t * 2 + i) * 3;
      c.fillStyle = cols[i % cols.length];
      c.beginPath(); c.ellipse(x, y, 9, 11, 0, 0, Math.PI * 2); c.fill();
    }
  }
  function dogs(c, t) {
    MP.drawPerson(c, 90, FLOOR, { character: 'boy', hair: '#2b1d14', outfit: { shirt: 'yellow', bottom: 'jeans', hat: 'cap', costume: 'none' }, armUp: 0.3 });
    for (let i = 0; i < 8; i++) {
      const x = 120 + i * 22, hop = Math.abs(Math.sin(t * 8 + i)) * 3;
      if (MP.drawPet) MP.drawPet(c, x, FLOOR - hop, { kind: 'dog', scale: 0.8 + (i % 3) * 0.15, flip: i % 2 === 0, walking: true, walkTime: t + i });
      c.strokeStyle = '#e04848'; c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(98, FLOOR - 26); c.lineTo(x, FLOOR - 8); c.stroke();
    }
  }
  function yoga(c, t) {
    for (let i = 0; i < 4; i++) {
      const x = 70 + i * 60;
      c.fillStyle = ['#ff8fc0', '#7bd389', '#4cc9f0', '#ffd23f'][i];
      c.fillRect(x - 16, FLOOR - 2, 32, 4);
      c.save();
      c.translate(x, FLOOR);
      c.rotate(Math.sin(t * 2 + i) * 0.05);
      MP.drawPerson(c, 0, 0, { character: i % 2 ? 'boy' : 'girl', outfit: { shirt: 'tshirt', bottom: 'shorts', hat: 'none', costume: 'none' }, armUp: 1, eyes: 'closed' });
      c.restore();
    }
  }

  MP.scenes.grandparents = {
    noRestart: true,

    enter(params) {
      params = params || {};
      this.step = 'lobby';
      this.player = new MP.Player(30, { minX: 20, maxX: 300 });
      this.player.place(30, 1);
      this.bubble = null;
      this.ride = null;
      this.crumbs = [];
      this.bites = 0;
      this.binoculars = false;
      this.cuckooAt = -9;
      this.fishAt = -9;
      this.say('Good morning! sanoo ovimies. Hissi on tuolla – napauta hissiä.', 'doorman');
      if (params.back || params.down) {
        // back from the sleepover (sleepover.js)
        this.step = 'home';
        this.player = new MP.Player(80, { minX: 20, maxX: 300 });
        this.player.place(80, 1);
        this.bubble = null;
        if (params.down) this.goingDown();
      }
    },

    say(text, who) {
      this.bubble = { text, from: MP.time, until: Infinity, who: who || 'me' };
    },

    onTap(x, y) {
      const t = MP.time;
      if (MP.hit(BACK, x, y) && !this.ride) {
        MP.sfx.tap();
        if (this.step === 'home') this.goingDown();
        else MP.goTo(MP.scenes.newyork, { from: 'grandma' });
        return;
      }
      if (this.step === 'lobby') {
        if (MP.hit(LIFT, x, y)) {
          this.player.walkTo(LIFT.x + LIFT.w / 2, () => {
            this.step = 'lift';
            MP.sfx.bling();
            this.say('Mummi ja Ukki asuvat kerroksessa 77. Napauta nappia 77!');
          });
          return;
        }
        this.player.walkTo(x);
        return;
      }
      if (this.step === 'lift') {
        if (!this.ride && MP.hit(BTN77, x, y)) {
          this.ride = { from: t, floor: 1, stop: null, stopsDone: 0, dir: 1 };
          MP.sfx.tap();
          this.say('Ylös mennään! Hissi humisee…');
        }
        return;
      }
      if (this.step === 'home') {
        if (this.binoculars) { this.binoculars = false; MP.sfx.tap(); return; }
        if (MP.hit(SLEEP, x, y)) {
          MP.sfx.bling();
          MP.goTo(MP.scenes.sleepover);
          return;
        }
        if (Math.hypot(x - PULLA.x, y - PULLA.y) < 14) {
          this.bites++;
          for (let i = 0; i < 5; i++) this.crumbs.push({ x: PULLA.x + (Math.random() - 0.5) * 10, y: PULLA.y, vx: (Math.random() - 0.5) * 40, born: t });
          MP.sfx.nom();
          this.say(this.bites % 3 === 1 ? 'Nam! Mummin pulla on maailman parasta! (Murusia joka puolella…)' : 'Nam nam!', this.bites % 3 === 1 ? 'me' : 'me');
          return;
        }
        if (MP.hit(WIN, x, y) || Math.abs(x - UKKI_X) < 14 && y > FLOOR - 60) {
          this.binoculars = true;
          this.binoAt = t;
          MP.sfx.bling();
          this.say('Ukki antaa kiikarit: Katso, tuolla on Vapaudenpatsas! Ja keltaiset taksit näyttävät ihan leluilta!', 'ukki');
          return;
        }
        if (Math.hypot(x - CLOCK.x, y - CLOCK.y) < 16) {
          this.cuckooAt = t;
          MP.sfx.note(784, 0.25, 'sine', 0.2);
          setTimeout(() => MP.sfx.note(622, 0.35, 'sine', 0.2), 300);
          this.say('KUKKUU! KUKKUU! Käkikello!', 'me');
          return;
        }
        if (MP.hit(TANK, x, y)) {
          this.fishAt = t;
          MP.sfx.flush();
          this.say('Kalat uivat ruokaa kohti! Pulputi pulp.', 'me');
          return;
        }
        if (Math.abs(x - MUMMI_X) < 14 && y > FLOOR - 60) {
          this.hugAt = t;
          MP.sfx.bling();
          this.say('Mummi: Voi kun olet kasvanut! Haluatko lisää pullaa?', 'mummi');
          return;
        }
        this.player.walkTo(x);
      }
    },

    goingDown() {
      this.step = 'lift';
      this.ride = { from: MP.time, floor: HOME_FLOOR, stop: null, stopsDone: 99, dir: -1 };
      this.say('Hei hei, Mummi ja Ukki! Hissillä alas.');
      MP.sfx.tap();
    },

    update(dt) {
      this.player.update(dt);
      const r = this.ride;
      if (!r) return;
      const t = MP.time;
      if (r.stop) {
        if (t - r.stop.at > 2.6) r.stop = null;      // the doors close again
        return;
      }
      r.floor += r.dir * dt * (r.dir > 0 ? 14 : 30);
      const next = r.dir > 0 ? STOPS[r.stopsDone] : null;
      if (next && r.floor >= next.floor) {
        r.floor = next.floor;
        r.stop = { kind: next.kind, at: t };
        r.stopsDone++;
        MP.sfx.bling();
        this.say(next.say);
      }
      if (r.dir > 0 && r.floor >= HOME_FLOOR) {
        this.ride = null;
        this.step = 'home';
        this.player = new MP.Player(80, { minX: 20, maxX: 300 });
        this.player.place(80, 1);
        this.hugAt = t;
        MP.sfx.applause(1);
        this.say('Mummi ja Ukki: Kas, kuka sieltä tulee! Halataan!', 'mummi');
      }
      if (r.dir < 0 && r.floor <= 1) {
        this.ride = null;
        MP.goTo(MP.scenes.newyork, { from: 'grandma' });
      }
    },

    draw(ctx) {
      const t = MP.time;
      if (this.step === 'lobby') this.drawLobby(ctx, t);
      else if (this.step === 'lift') this.drawLift(ctx, t);
      else this.drawHome(ctx, t);
      MP.drawButton(ctx, this.step === 'home' ? 'Hei hei!' : '◀ Ulos', BACK, { size: 0.8 });
      if (this.step === 'home' && !this.binoculars) MP.drawButton(ctx, 'Jää yökylään', SLEEP, { size: 0.65, color: '#6b4fb5', shade: '#4a3488' });
      const b = this.bubble;
      if (b && t >= b.from) {
        const tip = b.who === 'doorman' ? [96, 104] : b.who === 'mummi' ? [MUMMI_X, 92] : b.who === 'ukki' ? [UKKI_X, 90]
          : this.step === 'lift' ? [160, 44] : [this.player.x, FLOOR - 46];
        if (!(this.binoculars && b.who !== 'ukki')) MP.drawBubble(ctx, b.text, tip[0], tip[1], { maxWidth: 170, size: 0.8 });
      }
    },

    drawLobby(ctx, t) {
      ctx.fillStyle = '#e6dccb';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = '#c9b28a';
      for (let x = 0; x < MP.W; x += 40) ctx.fillRect(x, 0, 3, FLOOR);
      ctx.fillStyle = '#2b2340';
      ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let x = 0; x < MP.W; x += 20) ctx.fillRect(x, FLOOR, 10, MP.H - FLOOR);
      // a chandelier
      ctx.fillStyle = '#ffd23f';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(140 + i * 10, 22 + (i % 2) * 4, 2.5, 0, Math.PI * 2); ctx.fill(); }
      // the doorman in his red uniform and cap
      MP.drawPerson(ctx, 96, FLOOR, { character: 'boy', hair: '#2b1d14', scale: 1.3, mouth: 'smile', armUp: 0.4,
        outfit: { shirt: 'red', bottom: 'brown', hat: 'cap', costume: 'none' } });
      this.drawLiftDoors(ctx, 0);
      MP.drawText(ctx, 'HISSI', LIFT.x + LIFT.w / 2, LIFT.y - 12, { size: 0.7, color: O(), align: 'center' });
      this.player.draw(ctx, FLOOR, 0);
    },

    drawLiftDoors(ctx, open) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#c8913a';
      ctx.fillRect(LIFT.x - 4, LIFT.y - 4, LIFT.w + 8, LIFT.h + 4);
      ctx.fillStyle = '#d8dde6';
      const half = LIFT.w / 2 * (1 - open);
      ctx.fillRect(LIFT.x, LIFT.y, half, LIFT.h); ctx.strokeRect(LIFT.x, LIFT.y, half, LIFT.h);
      ctx.fillRect(LIFT.x + LIFT.w - half, LIFT.y, half, LIFT.h); ctx.strokeRect(LIFT.x + LIFT.w - half, LIFT.y, half, LIFT.h);
      ctx.restore();
    },

    drawLift(ctx, t) {
      const r = this.ride;
      // inside the elevator: the doors are open when it stops at a floor
      const open = r && r.stop ? MP.clamp(Math.min(t - r.stop.at, 2.6 - (t - r.stop.at)) * 3, 0, 1) : 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, MP.W, MP.H);
      if (open > 0) {
        // what is outside the doors
        ctx.save();
        ctx.beginPath(); ctx.rect(30, 20, 260, FLOOR - 20); ctx.clip();
        ctx.fillStyle = r.stop.kind === 'yoga' ? '#d8f2d0' : r.stop.kind === 'dogs' ? '#fff1c9' : '#fde4f0';
        ctx.fillRect(30, 20, 260, FLOOR - 20);
        if (r.stop.kind === 'balloons') balloons(ctx, t);
        if (r.stop.kind === 'dogs') dogs(ctx, t);
        if (r.stop.kind === 'yoga') yoga(ctx, t);
        ctx.restore();
      }
      // the steel doors sliding
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#b8c0cc';
      const half = 130 * (1 - open);
      ctx.fillRect(30, 20, half, FLOOR - 20); ctx.strokeRect(30, 20, half, FLOOR - 20);
      ctx.fillRect(290 - half, 20, half, FLOOR - 20); ctx.strokeRect(290 - half, 20, half, FLOOR - 20);
      ctx.fillStyle = '#8a93a6';
      ctx.fillRect(0, 0, 30, MP.H); ctx.fillRect(290, 0, 30, MP.H); ctx.fillRect(0, 0, MP.W, 20); ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      ctx.restore();
      // the floor number
      ctx.save();
      ctx.fillStyle = '#1d2233';
      MP.roundRect(ctx, 136, 2, 48, 16, 3); ctx.fill();
      ctx.restore();
      const f = r ? Math.max(1, Math.round(r.floor)) : 1;
      MP.drawText(ctx, (r && r.dir < 0 ? '▼ ' : '▲ ') + f, 160, 5, { size: 0.9, color: '#ff5d3a', align: 'center' });
      // the button panel (only before riding up)
      if (!r) {
        ctx.save();
        ctx.fillStyle = '#d8dde6';
        ctx.strokeStyle = O();
        MP.roundRect(ctx, 186, 40, 60, 96, 4); ctx.fill(); ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 6; i++) {
          const fx = 194 + (i % 2) * 24, fy = 46 + Math.floor(i / 2) * 16;
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(fx + 8, fy + 6, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          MP.drawText(ctx, String([10, 23, 41, 58, 66, 80][i]), fx + 8, fy + 3, { size: 0.42, color: O(), align: 'center' });
        }
        MP.drawButton(ctx, '77', BTN77, { size: 1, color: '#e0559a', shade: '#a8326c' });
        MP.draw('arrow', ctx, BTN77.x + BTN77.w / 2, BTN77.y - 8 + Math.sin(t * 6) * 2.5);
      }
      MP.drawPerson(ctx, 110, FLOOR, { hero: true, mouth: open > 0 ? 'open' : 'smile' });
    },

    drawHome(ctx, t) {
      // a cosy apartment: flowery wallpaper, a rug, the big window
      ctx.fillStyle = '#fdf0dc';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(224,120,150,0.18)';
      for (let x = 10; x < MP.W; x += 22) for (let y = 10; y < FLOOR; y += 22) { ctx.beginPath(); ctx.arc(x + (y % 44 ? 11 : 0), y, 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#a0643c';
      ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.ellipse(180, FLOOR + 10, 90, 7, 0, 0, Math.PI * 2); ctx.fill();
      // the big window high above the city
      ctx.save();
      ctx.beginPath(); ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h); ctx.clip();
      MP.drawLandscape(ctx, 'city', { x: WIN.x - 40, y: WIN.y - 10, w: WIN.w + 80, h: WIN.h + 40 }, t * 3);
      ctx.restore();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f4f4f4';
      ctx.strokeRect(WIN.x, WIN.y, WIN.w, WIN.h);
      ctx.beginPath(); ctx.moveTo(WIN.x + WIN.w / 2, WIN.y); ctx.lineTo(WIN.x + WIN.w / 2, WIN.y + WIN.h); ctx.stroke();
      MP.drawText(ctx, '77', WIN.x + WIN.w - 12, WIN.y + 3, { size: 0.55, color: '#ffffff', outline: O(), align: 'center' });
      // our postcards on the wall (postcard.js)
      if (MP.postcards) MP.postcards().slice(-4).forEach((card, i) => {
        MP.drawPostcard(ctx, card, 94 + (i % 2) * 34, 26 + Math.floor(i / 2) * 24, 30, 20);
      });
      // the cuckoo clock
      const cu = t - this.cuckooAt;
      ctx.save();
      ctx.lineWidth = 0.8; ctx.strokeStyle = O();
      ctx.fillStyle = '#8a4a2a';
      ctx.beginPath(); ctx.moveTo(CLOCK.x - 12, CLOCK.y - 8); ctx.lineTo(CLOCK.x, CLOCK.y - 18); ctx.lineTo(CLOCK.x + 12, CLOCK.y - 8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(CLOCK.x - 10, CLOCK.y - 8, 20, 22); ctx.strokeRect(CLOCK.x - 10, CLOCK.y - 8, 20, 22);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(CLOCK.x, CLOCK.y + 4, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CLOCK.x, CLOCK.y + 4); ctx.lineTo(CLOCK.x + Math.sin(t) * 4, CLOCK.y + 4 - Math.cos(t) * 4); ctx.stroke();
      ctx.strokeStyle = '#c8913a';
      ctx.beginPath(); ctx.moveTo(CLOCK.x, CLOCK.y + 14); ctx.lineTo(CLOCK.x + Math.sin(t * 3) * 4, CLOCK.y + 30); ctx.stroke();
      if (cu < 1.2) {
        const out = Math.sin(MP.clamp(cu / 1.2, 0, 1) * Math.PI) * 9;
        ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = O();
        ctx.beginPath(); ctx.arc(CLOCK.x, CLOCK.y - 8 - out * 0.3 + 2, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.moveTo(CLOCK.x + 2.5, CLOCK.y - 7 - out * 0.3 + 2); ctx.lineTo(CLOCK.x + 6, CLOCK.y - 6 - out * 0.3 + 2); ctx.lineTo(CLOCK.x + 2.5, CLOCK.y - 5 - out * 0.3 + 2); ctx.fill();
      }
      ctx.restore();
      // the fish tank
      ctx.save();
      ctx.lineWidth = 1; ctx.strokeStyle = O();
      ctx.fillStyle = '#8a4a2a'; ctx.fillRect(TANK.x - 4, TANK.y + TANK.h, TANK.w + 8, FLOOR - TANK.y - TANK.h);
      ctx.fillStyle = 'rgba(120,200,240,0.7)'; ctx.fillRect(TANK.x, TANK.y, TANK.w, TANK.h); ctx.strokeRect(TANK.x, TANK.y, TANK.w, TANK.h);
      const fast = t - this.fishAt < 3;
      for (let i = 0; i < 3; i++) {
        const fx = TANK.x + 22 + Math.sin(t * (fast ? 2.4 : 0.8) + i * 2) * 15, fy = TANK.y + 8 + i * 7;
        const dir = Math.cos(t * (fast ? 2.4 : 0.8) + i * 2) > 0 ? 1 : -1;
        ctx.fillStyle = ['#ff8a2a', '#ffd23f', '#ff5d8f'][i];
        ctx.beginPath(); ctx.ellipse(fx, fy, 3.4, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(fx - dir * 3, fy); ctx.lineTo(fx - dir * 6, fy - 2); ctx.lineTo(fx - dir * 6, fy + 2); ctx.fill();
      }
      ctx.restore();
      // the table with Mummi's pulla
      ctx.save();
      ctx.lineWidth = 1; ctx.strokeStyle = O();
      ctx.fillStyle = '#c98a55'; ctx.fillRect(90, 132, 46, 4); ctx.strokeRect(90, 132, 46, 4);
      ctx.fillRect(94, 136, 3, FLOOR - 136); ctx.fillRect(129, 136, 3, FLOOR - 136);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(PULLA.x, PULLA.y + 3, 14, 2.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
      const left = Math.max(0, 5 - this.bites);
      if (MP.scenes.baking) {
        for (let i = 0; i < left; i++) MP.scenes.baking.bun(ctx, PULLA.x - 8 + (i % 3) * 8, PULLA.y + 2 - Math.floor(i / 3) * 4, 0.7, 1, true);
      }
      if (!left) MP.drawText(ctx, '(tyhjä!)', PULLA.x, PULLA.y - 10, { size: 0.5, color: '#6b5f80', align: 'center' });
      for (const c of this.crumbs) {
        const u = t - c.born;
        if (u > 1.2) continue;
        ctx.fillStyle = '#d98e3a';
        ctx.fillRect(c.x + c.vx * u, Math.min(FLOOR + 2, c.y + 40 * u * u), 1.4, 1.4);
      }
      // Mummi and Ukki (a hug when you arrive)
      const hug = t - (this.hugAt || -9) < 2;
      MP.drawPerson(ctx, MUMMI_X, FLOOR, Object.assign({}, MUMMI, { mouth: 'smile', armUp: hug ? 0.7 : 0, flip: true }));
      MP.drawPerson(ctx, UKKI_X, FLOOR, Object.assign({}, UKKI, { mouth: 'smile', armUp: hug ? 0.7 : 0.2, flip: true }));
      // Ukki's binoculars
      ctx.save();
      ctx.fillStyle = '#2b2b33';
      ctx.fillRect(UKKI_X - 14, FLOOR - 34, 5, 7); ctx.fillRect(UKKI_X - 8, FLOOR - 34, 5, 7);
      ctx.restore();
      MP.drawText(ctx, 'Mummi', MUMMI_X, FLOOR + 4, { size: 0.55, color: O(), align: 'center' });
      MP.drawText(ctx, 'Ukki', UKKI_X, FLOOR + 4, { size: 0.55, color: O(), align: 'center' });
      this.player.draw(ctx, FLOOR, 0, { mouth: hug ? 'open' : 'smile', armUp: hug ? 0.7 : 0 });

      // looking through the binoculars
      if (this.binoculars) {
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.beginPath();
        ctx.arc(120, 90, 62, 0, Math.PI * 2);
        ctx.arc(200, 90, 62, 0, Math.PI * 2);
        ctx.clip();
        const sweep = Math.sin((t - this.binoAt) * 0.4) * 60;
        MP.drawLandscape(ctx, 'city', { x: 50 - sweep, y: 10, w: 400, h: 170 }, 0);
        // tiny yellow taxis driving
        for (let i = 0; i < 5; i++) {
          const x = ((t * 30 + i * 70) % 400) - 40;
          ctx.fillStyle = '#ffcc00'; ctx.fillRect(x, 150 + (i % 2) * 6, 8, 3);
        }
        ctx.restore();
        MP.drawText(ctx, '(napauta, niin kiikarit pois)', 160, 168, { size: 0.55, color: '#ffffff', align: 'center' });
      }
    },
  };
})();
