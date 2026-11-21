// airport.js – THE AIRPORT, side view like the house.
// The taxi brings you here. Tap the departures board to choose where to fly,
// then the character walks to the gate and the plane takes off (flight.js).
// The glass doors on the left go back out to the taxi.
//
// ADDING A COUNTRY: add it to MP.DESTINATIONS (and make its scene).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  // Places you can fly to.
  //   to = "to Egypt" in Finnish, scene = where you arrive, land = what the
  //   landing looks like in flight.js ('desert' or 'forest')
  MP.DESTINATIONS = [
    {
      id: 'egypt', name: 'Egypti', city: 'Kairo', to: 'Egyptiin', time: '10:30',
      scene: 'egypt', land: 'desert',
      flag(c, x, y, w, h) {
        c.fillStyle = '#ce1126'; c.fillRect(x, y, w, h / 3);
        c.fillStyle = '#ffffff'; c.fillRect(x, y + h / 3, w, h / 3);
        c.fillStyle = '#000000'; c.fillRect(x, y + h * 2 / 3, w, h / 3);
        c.fillStyle = '#c09300';
        c.beginPath(); c.arc(x + w / 2, y + h / 2, h / 8, 0, Math.PI * 2); c.fill();
      },
    },
    {
      id: 'home', name: 'Suomi', city: 'Koti', to: 'kotiin Suomeen', time: '15:45',
      scene: 'street', params: { from: 'taxi' }, land: 'forest',
      flag(c, x, y, w, h) {
        c.fillStyle = '#ffffff'; c.fillRect(x, y, w, h);
        c.fillStyle = '#003580';
        c.fillRect(x, y + h * 0.4, w, h * 0.2);
        c.fillRect(x + w * 0.28, y, w * 0.14, h);
      },
    },
  ];
  MP.findDestination = (id) => MP.DESTINATIONS.find((d) => d.id === id);

  const FLOOR = 150;
  const POS = { doors: 28, board: 150, gate: 292 };
  const SPOTS = {
    doors: { x: 6, y: 70, w: 46, h: 80, standX: 40 },
    board: { x: 104, y: 28, w: 92, h: 58, standX: 150 },
    desk:  { x: 112, y: 112, w: 76, h: 38, standX: 150 },
    gate:  { x: 268, y: 74, w: 46, h: 76, standX: 286 },
  };
  const PANEL = { x: 30, y: 18, w: 260, h: 146 };
  const CLOSE = { x: 268, y: 22, r: 8 };
  const card = (i) => ({ x: 44 + i * 80, y: 50, w: 72, h: 92 });

  // The places to show: not the country you are in, and two "coming soon" cards
  function choices(country) {
    const list = MP.DESTINATIONS.filter((d) => d.id !== country);
    while (list.length < 3) list.push(null);
    return list;
  }

  // A plane seen from the side, nose to the right. Used in flight.js too.
  // (x, y) = the middle of the body. tilt in radians (nose up = negative).
  MP.drawPlane = function (c, x, y, s, tilt, gearDown) {
    c.save();
    c.translate(x, y);
    c.rotate(tilt || 0);
    c.scale(s, s);
    c.lineWidth = 0.8;
    c.strokeStyle = O();
    c.lineJoin = 'round';
    // tail fin
    c.fillStyle = '#2f6fb8';
    c.beginPath(); c.moveTo(-30, -4); c.lineTo(-36, -18); c.lineTo(-29, -18); c.lineTo(-19, -4); c.closePath(); c.fill(); c.stroke();
    // far wing
    c.fillStyle = '#9aa3b5';
    c.beginPath(); c.moveTo(-2, -2); c.lineTo(-10, -9); c.lineTo(-5, -9); c.lineTo(8, -2); c.closePath(); c.fill(); c.stroke();
    // wheels
    if (gearDown) {
      c.fillStyle = '#2b2b33';
      c.fillRect(-0.6, 5, 1.2, 4); c.fillRect(20.4, 5, 1.2, 4);
      c.beginPath(); c.arc(0, 10, 2.2, 0, Math.PI * 2); c.arc(21, 10, 1.8, 0, Math.PI * 2); c.fill();
    }
    // body
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.moveTo(-36, -4);
    c.lineTo(22, -5.5);
    c.quadraticCurveTo(33, -5, 34, 1);
    c.quadraticCurveTo(32, 6, 22, 6);
    c.lineTo(-26, 6);
    c.quadraticCurveTo(-34, 4, -36, -4);
    c.closePath(); c.fill(); c.stroke();
    // stripe and windows
    c.fillStyle = '#2f6fb8';
    c.fillRect(-28, 2, 52, 1.4);
    c.fillStyle = '#5a6b8c';
    for (let wx = -22; wx < 20; wx += 4) { c.beginPath(); c.arc(wx, -1.5, 0.9, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#2b3550';
    c.beginPath(); c.moveTo(26, -3.8); c.lineTo(30.5, -3.2); c.lineTo(31.6, -0.6); c.lineTo(26, -0.8); c.closePath(); c.fill();
    // near wing and engine
    c.fillStyle = '#c9d0dc';
    c.beginPath(); c.moveTo(-4, 2.5); c.lineTo(-14, 13); c.lineTo(-8, 13); c.lineTo(10, 2.5); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#7d8799';
    MP.roundRect(c, -4, 6, 10, 4.2, 2); c.fill(); c.stroke();
    // little tail wing
    c.fillStyle = '#c9d0dc';
    c.beginPath(); c.moveTo(-30, 0); c.lineTo(-37, 4); c.lineTo(-33, 4); c.lineTo(-24, 0); c.closePath(); c.fill(); c.stroke();
    c.restore();
  };

  // ---------------------------------------------------------------------------
  // Drawings in the terminal
  // ---------------------------------------------------------------------------
  function slidingDoors(c, open) {
    c.lineWidth = 1;
    c.strokeStyle = O();
    c.fillStyle = '#8a93a6';
    c.fillRect(6, 66, 46, 84);
    c.strokeRect(6, 66, 46, 84);
    c.fillStyle = '#cfeeff';
    const o = open * 10;
    c.fillRect(9 - o, 72, 20, 78); c.strokeRect(9 - o, 72, 20, 78);
    c.fillRect(29 + o, 72, 20, 78); c.strokeRect(29 + o, 72, 20, 78);
    c.fillStyle = 'rgba(255,255,255,0.6)';
    c.fillRect(12 - o, 76, 3, 40); c.fillRect(32 + o, 76, 3, 40);
    // sign over the doors
    c.fillStyle = '#2f6fb8';
    MP.roundRect(c, 8, 54, 42, 10, 2); c.fill(); c.stroke();
    MP.drawText(c, 'Taksi', 29, 55.5, { size: 0.75, color: '#ffffff', align: 'center' });
  }

  function seats(c, x) {
    c.lineWidth = 0.8;
    c.strokeStyle = O();
    for (let i = 0; i < 3; i++) {
      c.fillStyle = '#2f6fb8';
      MP.roundRect(c, x + i * 13, 122, 12, 14, 3); c.fill(); c.stroke();
      MP.roundRect(c, x + i * 13, 134, 12, 5, 2); c.fill(); c.stroke();
    }
    c.fillStyle = '#5a6b8c';
    c.fillRect(x + 2, 139, 2, 11); c.fillRect(x + 34, 139, 2, 11);
  }

  function plant(c, x, palm) {
    c.lineWidth = 0.8;
    c.strokeStyle = O();
    c.fillStyle = palm ? '#4d8a3a' : '#3cb371';
    if (palm) {
      c.fillStyle = '#8a6a45';
      c.fillRect(x - 1.2, 112, 2.4, 28);
      c.fillStyle = '#4d8a3a';
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.5;
        c.beginPath(); c.ellipse(x + Math.cos(a) * 9, 112 + Math.sin(a) * 4 + 3, 10, 2.4, a, 0, Math.PI * 2); c.fill(); c.stroke();
      }
    } else {
      for (const [dx, dy, r] of [[-5, -20, 0.5], [5, -21, -0.5], [0, -26, 0], [-7, -13, 0.9], [7, -14, -0.9]]) {
        c.beginPath(); c.ellipse(x + dx, 140 + dy, 3.5, 8, r, 0, Math.PI * 2); c.fill(); c.stroke();
      }
    }
    c.fillStyle = '#e07a3a';
    c.beginPath(); c.moveTo(x - 7, 138); c.lineTo(x + 7, 138); c.lineTo(x + 5, 150); c.lineTo(x - 5, 150); c.closePath(); c.fill(); c.stroke();
  }

  function board(c, country, t) {
    c.lineWidth = 1;
    c.strokeStyle = O();
    c.fillStyle = '#5a6b8c';
    c.fillRect(120, 20, 2, 10); c.fillRect(178, 20, 2, 10);
    c.fillStyle = '#1d2233';
    MP.roundRect(c, 104, 28, 92, 58, 3); c.fill(); c.stroke();
    MP.drawText(c, 'LÄHDÖT', 150, 31, { size: 0.9, color: '#ffd23f', align: 'center' });
    const list = MP.DESTINATIONS.filter((d) => d.id !== country);
    for (let i = 0; i < 4; i++) {
      const y = 44 + i * 10;
      const d = list[i];
      c.fillStyle = '#2b3350';
      c.fillRect(108, y - 1, 84, 9);
      if (d) {
        d.flag(c, 110, y, 9, 6.5);
        MP.drawText(c, d.name.toUpperCase(), 122, y, { size: 0.62, color: '#ffd23f' });
        MP.drawText(c, d.time, 189, y, { size: 0.62, color: '#ffd23f', align: 'right' });
      } else {
        MP.drawText(c, '- - -', 122, y, { size: 0.62, color: '#6c7594' });
      }
    }
    if (Math.floor(t * 2) % 2) {
      c.fillStyle = '#4cd964';
      c.beginPath(); c.arc(190, 33, 1.3, 0, Math.PI * 2); c.fill();
    }
  }

  function desk(c) {
    c.lineWidth = 1;
    c.strokeStyle = O();
    c.fillStyle = '#e9edf3';
    MP.roundRect(c, 112, 118, 76, 32, 3); c.fill(); c.stroke();
    c.fillStyle = '#2f6fb8';
    c.fillRect(112, 124, 76, 4);
    MP.drawText(c, 'Lähtöselvitys', 150, 132, { size: 0.7, color: O(), align: 'center' });
  }

  function gate(c, open) {
    c.lineWidth = 1;
    c.strokeStyle = O();
    c.fillStyle = '#8a93a6';
    c.fillRect(268, 74, 46, 76); c.strokeRect(268, 74, 46, 76);
    c.fillStyle = '#2b3350';
    c.fillRect(272, 80, 38, 70);
    c.fillStyle = '#cfd6e2';
    c.fillRect(272 + open * 30, 80, 38 - open * 30, 70);
    c.strokeRect(272, 80, 38, 70);
    c.fillStyle = '#ffd23f';
    MP.roundRect(c, 270, 60, 42, 12, 2); c.fill(); c.stroke();
    MP.drawText(c, 'Portti 1', 291, 62, { size: 0.75, color: O(), align: 'center' });
  }

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.airport = {
    // params.country: where this airport is ('home' or 'egypt')
    enter(params) {
      this.country = (params && params.country) || 'home';
      this.player = new MP.Player(POS.doors + 14, { minX: 20, maxX: 300 });
      this.player.place(POS.doors + 14, 1);
      this.panel = null;          // the "Minne lennetään?" chooser
      this.chosen = null;
      this.busy = false;
      this.bubble = null;
      this.doorsAt = MP.time;     // the doors were just opened
      this.gateAt = -10;
      const here = this.country === 'home' ? 'Lentokenttä!' : 'Kairon lentokenttä!';
      this.say(here + ' Napauta lähtötaulua ja valitse, minne lennetään.', 5, 0.6);
    },

    say(text, seconds, delay) {
      this.bubble = { text, from: MP.time + (delay || 0), until: Infinity };   // stays until the next tap
    },

    choose(d) {
      this.panel = null;
      this.chosen = d;
      MP.sfx.bling();
      this.say(d.to.charAt(0).toUpperCase() + d.to.slice(1) + '! Mennään portille.', 3, 0.2);
      this.player.walkTo(SPOTS.gate.standX, () => this.board());
    },

    // Into the plane!
    board() {
      this.busy = true;
      this.gateAt = MP.time;
      MP.sfx.tap();
      setTimeout(() => MP.goTo(MP.scenes.flight, { from: this.country, to: this.chosen.id }), 700);
    },

    onTap(x, y) {
      if (this.busy || MP.isFading()) return;
      if (this.panel) {
        if (Math.hypot(x - CLOSE.x, y - CLOSE.y) < CLOSE.r + 4) { this.panel = null; MP.sfx.tap(); return; }
        choices(this.country).forEach((d, i) => {
          if (!MP.hit(card(i), x, y)) return;
          if (d) this.choose(d);
          else { MP.sfx.boing(); this.panel.soon = MP.time; }
        });
        return;
      }
      if (MP.hit(SPOTS.board, x, y) || MP.hit(SPOTS.desk, x, y)) {
        MP.sfx.tap();
        this.player.walkTo(SPOTS.board.standX, () => { this.panel = { from: MP.time }; MP.sfx.tap(); });
        return;
      }
      if (MP.hit(SPOTS.gate, x, y)) {
        MP.sfx.tap();
        this.player.walkTo(SPOTS.gate.standX, () => {
          if (this.chosen) this.board();
          else this.say('Valitse ensin lähtötaulusta, minne lennetään!', 3);
        });
        return;
      }
      if (MP.hit(SPOTS.doors, x, y)) {
        MP.sfx.tap();
        this.player.walkTo(SPOTS.doors.standX, () => {
          this.busy = true;
          this.doorsAt = MP.time;
          // back out by taxi
          if (this.country === 'egypt') MP.goTo(MP.scenes.egypt);
          else MP.goTo(MP.scenes.street, { from: 'taxi' });
        });
        return;
      }
      this.player.walkTo(x);
    },

    update(dt) {
      this.player.update(dt);
    },

    draw(ctx) {
      const t = MP.time;
      const egypt = this.country === 'egypt';

      // ===== The terminal hall =====
      ctx.fillStyle = egypt ? '#f1e2c4' : '#eef1f5';
      ctx.fillRect(0, 0, MP.W, MP.H);
      // big windows to the runway
      ctx.save();
      ctx.beginPath(); ctx.rect(60, 12, 260, 88); ctx.clip();
      ctx.fillStyle = '#9fdcff';
      ctx.fillRect(60, 12, 260, 88);
      ctx.fillStyle = egypt ? '#e2c28b' : '#7cc56b';
      ctx.fillRect(60, 80, 260, 20);
      if (egypt) {
        ctx.fillStyle = '#d6b886';
        ctx.beginPath(); ctx.moveTo(230, 80); ctx.lineTo(250, 62); ctx.lineTo(270, 80); ctx.closePath(); ctx.fill();
      } else {
        ctx.fillStyle = '#2e7d4f';
        for (let x = 64; x < 320; x += 9) {
          ctx.beginPath(); ctx.moveTo(x - 4, 80); ctx.lineTo(x, 66 - (x % 3) * 2); ctx.lineTo(x + 4, 80); ctx.closePath(); ctx.fill();
        }
      }
      ctx.fillStyle = '#6b6f7a';
      ctx.fillRect(60, 88, 260, 9);
      ctx.fillStyle = '#ffffff';
      for (let x = 64; x < 320; x += 14) ctx.fillRect(x, 92, 7, 1);
      MP.drawPlane(ctx, 250, 84, 0.9, 0, true);
      ctx.restore();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#8a93a6';
      for (let x = 60; x <= 320; x += 52) { ctx.beginPath(); ctx.moveTo(x, 12); ctx.lineTo(x, 100); ctx.stroke(); }
      ctx.strokeRect(60, 12, 262, 88);
      // ceiling and floor
      ctx.fillStyle = '#c9d0dc';
      ctx.fillRect(0, 0, MP.W, 12);
      ctx.fillStyle = egypt ? '#d9c39a' : '#d7dbe3';
      ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      ctx.strokeStyle = 'rgba(80,90,110,0.25)';
      ctx.lineWidth = 0.6;
      for (let x = 0; x < MP.W; x += 24) { ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x - 12, MP.H); ctx.stroke(); }
      MP.drawText(ctx, egypt ? 'KAIRON LENTOKENTTÄ' : 'LENTOKENTTÄ', 4, 2, { size: 0.75, color: '#2f6fb8' });

      const doorsOpen = MP.clamp(1 - Math.abs(t - this.doorsAt - 0.6) / 0.6, 0, 1);
      slidingDoors(ctx, doorsOpen);
      board(ctx, this.country, t);
      desk(ctx);
      seats(ctx, 212);
      plant(ctx, 66, egypt);
      plant(ctx, 258, egypt);
      gate(ctx, MP.clamp((t - this.gateAt) / 0.5, 0, 1));

      // arrows: first to the board, then to the gate
      const ax = this.chosen ? POS.gate - 1 : POS.board;
      const ay = this.chosen ? 58 : 26;
      if (!this.panel && !this.busy) MP.draw('arrow', ctx, ax, ay + Math.sin(t * 6) * 2.5);

      // ===== The character =====
      if (!(this.busy && t - this.gateAt > 0.4 && this.gateAt > 0)) this.player.draw(ctx, FLOOR, 0);

      const b = this.bubble;
      if (b && t >= b.from && !this.panel) {
        MP.drawBubble(ctx, b.text, this.player.x, FLOOR - 46, { maxWidth: 140 });
      }

      // ===== "Minne lennetään?" =====
      if (this.panel) {
        const a = MP.clamp((t - this.panel.from) * 4, 0, 1);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(20,20,40,0.45)';
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.lineWidth = 1;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#fff7e0';
        MP.roundRect(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 10);
        ctx.fill(); ctx.stroke();
        MP.drawText(ctx, 'Minne lennetään?', MP.W / 2, 26, { size: 1.5, color: '#2f6fb8', outline: O(), align: 'center' });
        choices(this.country).forEach((d, i) => {
          const r = card(i);
          ctx.lineWidth = 0.9;
          ctx.strokeStyle = O();
          ctx.fillStyle = d ? '#ffffff' : '#e4e4ec';
          MP.roundRect(ctx, r.x, r.y, r.w, r.h, 6); ctx.fill(); ctx.stroke();
          if (d) {
            const pic = { x: r.x + 5, y: r.y + 5, w: r.w - 10, h: 50 };
            ctx.save();
            MP.roundRect(ctx, pic.x, pic.y, pic.w, pic.h, 4); ctx.clip();
            MP.drawLandscape(ctx, d.land, pic, 0);
            ctx.restore();
            ctx.strokeRect(pic.x, pic.y, pic.w, pic.h);
            d.flag(ctx, r.x + 6, r.y + 60, 16, 11);
            ctx.strokeRect(r.x + 6, r.y + 60, 16, 11);
            MP.drawText(ctx, d.name, r.x + 26, r.y + 60, { size: 1, color: O() });
            MP.drawText(ctx, d.city, r.x + 26, r.y + 72, { size: 0.65, color: '#6e4226' });
          } else {
            MP.drawText(ctx, '?', r.x + r.w / 2, r.y + 18, { size: 3, color: '#a9a9b8', align: 'center' });
            const wob = this.panel.soon && t - this.panel.soon < 0.4 ? Math.sin((t - this.panel.soon) * 40) * 2 : 0;
            MP.drawText(ctx, 'Tulossa pian', r.x + r.w / 2 + wob, r.y + 66, { size: 0.75, color: '#77778a', align: 'center' });
          }
        });
        // close button
        ctx.fillStyle = '#e0559a';
        ctx.beginPath(); ctx.arc(CLOSE.x, CLOSE.y, CLOSE.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(CLOSE.x - 3, CLOSE.y - 3); ctx.lineTo(CLOSE.x + 3, CLOSE.y + 3);
        ctx.moveTo(CLOSE.x + 3, CLOSE.y - 3); ctx.lineTo(CLOSE.x - 3, CLOSE.y + 3);
        ctx.stroke();
        ctx.restore();
      }
    },
  };
})();
