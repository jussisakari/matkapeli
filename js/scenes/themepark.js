// themepark.js – THE THEME PARK in Thailand (2D). Tap a ride: it plays as a
// little animation, then you are back in the park.
//   Vuoristorata (roller coaster): clack-clack up the hill, whoosh down, a loop –
//     "Iiiiii!", the hat flies off and lands back; afterwards you are dizzy.
//   Maailmanpyörä (big wheel): slowly up, a view over the sea, a bird lands on the seat.
//   Karuselli: elephant and tuk-tuk seats go round with music-box music.
//   Törmäilyautot (bumper cars): bonk, bonk!
//   Hattarakoju: a pink candy floss bigger than your head.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const GROUND = 150;
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const RIDES = [
    { id: 'coaster', name: 'Vuoristorata', x: 52, len: 8 },
    { id: 'wheel', name: 'Maailmanpyörä', x: 128, len: 7 },
    { id: 'carousel', name: 'Karuselli', x: 196, len: 6 },
    { id: 'cars', name: 'Törmäilyautot', x: 254, len: 5.5 },
    { id: 'floss', name: 'Hattara', x: 300, len: 4 },
  ];
  const MUSIC = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1046];

  function seat(c, x, y, color) {
    c.fillStyle = color;
    c.strokeStyle = O();
    c.lineWidth = 0.8;
    MP.roundRect(c, x - 8, y - 4, 16, 9, 2); c.fill(); c.stroke();
  }

  MP.scenes.themepark = {
    noRestart: true,

    enter() {
      this.ride = null;
      this.dizzyUntil = 0;
      this.floss = false;
      this.player = new MP.Player(30, { minX: 20, maxX: 300 });
      this.player.place(30, 1);
      this.bubble = null;
      this.say('Huvipuisto! Napauta laitetta, niin mennään kyytiin.');
    },

    say(text) {
      this.bubble = { text, from: MP.time, until: Infinity };
    },

    startRide(r) {
      this.ride = { id: r.id, from: MP.time, len: r.len, notes: 0, hat: MP.state.outfit.hat };
      this.bubble = null;
      if (r.id === 'floss') {
        this.ride = null;
        this.floss = MP.time;
        MP.sfx.bling();
        this.say('Hattara! Se on isompi kuin minun pääni! Nam, makeaa ja pehmeää!');
        return;
      }
      MP.sfx.bling();
    },

    endRide() {
      const id = this.ride.id;
      MP.state.outfit.hat = this.ride.hat;          // the hat came back
      this.ride = null;
      if (id === 'coaster') {
        this.dizzyUntil = MP.time + 3;
        this.say('Huh huh! Pää pyörii… mutta mennään uudestaan!');
      } else if (id === 'wheel') {
        this.say('Maailmanpyörästä näkyi meri ja temppeli! Ja lintu tuli kyytiin.');
      } else if (id === 'carousel') {
        this.say('Karuselli oli ihana! Minä istuin norsun selässä.');
      } else if (id === 'cars') {
        this.say('Bonk, bonk! Törmäilyautot ovat hauskimpia!');
      }
      MP.sfx.applause(1);
    },

    onTap(x, y) {
      if (this.ride) {
        // a tap during the ride ends it early (after a moment)
        if (MP.time - this.ride.from > 2) this.endRide();
        return;
      }
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.thailand, { from: 'park' });
        return;
      }
      for (const r of RIDES) {
        if (Math.abs(x - r.x) < 26 && y > 40 && y < GROUND + 10) {
          this.player.walkTo(r.x - 4, () => this.startRide(r));
          MP.sfx.tap();
          return;
        }
      }
      this.player.walkTo(x);
    },

    update(dt) {
      this.player.update(dt);
      const r = this.ride;
      if (!r) return;
      const u = MP.time - r.from;
      if (r.id === 'coaster') {
        if (u > 2.6 && u < 3 && MP.state.outfit.hat !== 'none' && r.hat !== 'none') MP.state.outfit.hat = 'none';   // the hat flies off!
        if (!r.screamed && u > 2.6) { r.screamed = true; MP.sfx.note(880, 0.8, 'sawtooth', 0.05); }
      }
      if (r.id === 'carousel' && u > r.notes * 0.32 && r.notes < MUSIC.length * 1.5) {
        MP.sfx.note(MUSIC[r.notes % MUSIC.length], 0.28, 'sine', 0.14);
        r.notes++;
      }
      if (r.id === 'cars' && Math.floor(u * 1.4) > (r.bonks || 0)) { r.bonks = Math.floor(u * 1.4); MP.sfx.boing(); }
      if (u > r.len) this.endRide();
    },

    draw(ctx) {
      const t = MP.time;
      if (this.ride) return this.drawRide(ctx, t);
      // the park: sky, flags, the rides in a row
      const g = ctx.createLinearGradient(0, 0, 0, GROUND);
      g.addColorStop(0, '#5fc2f2'); g.addColorStop(1, '#d8f4ff');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = '#f3e0b0';
      ctx.fillRect(0, GROUND, MP.W, MP.H - GROUND);
      // a string of little flags
      const cols = ['#ff5d8f', '#ffd23f', '#4cc9f0', '#7bd389', '#b388ff'];
      for (let i = 0; i < 22; i++) {
        const x = i * 15 + 4, y = 30 + Math.sin(i / 21 * Math.PI) * 8;
        ctx.fillStyle = cols[i % cols.length];
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10, y); ctx.lineTo(x + 5, y + 7); ctx.closePath(); ctx.fill();
      }
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      // roller coaster: a wavy track
      ctx.strokeStyle = '#e04848';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 20; x <= 86; x += 2) { const y = 70 + Math.sin((x - 20) / 66 * Math.PI * 2) * 18 + (x - 20) * 0.3; if (x === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.strokeStyle = '#8a93a6'; ctx.lineWidth = 1;
      for (let x = 24; x <= 86; x += 10) { ctx.beginPath(); ctx.moveTo(x, 74 + Math.sin((x - 20) / 66 * Math.PI * 2) * 18 + (x - 20) * 0.3); ctx.lineTo(x, GROUND); ctx.stroke(); }
      // big wheel
      ctx.strokeStyle = '#d8dde6'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(128, 82, 34, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2 + t * 0.3;
        ctx.beginPath(); ctx.moveTo(128, 82); ctx.lineTo(128 + Math.cos(a) * 34, 82 + Math.sin(a) * 34); ctx.stroke();
        seat(ctx, 128 + Math.cos(a) * 34, 86 + Math.sin(a) * 34, cols[i % cols.length]);
      }
      ctx.strokeStyle = '#8a93a6'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(110, GROUND); ctx.lineTo(128, 82); ctx.lineTo(146, GROUND); ctx.stroke();
      // carousel
      ctx.lineWidth = 1; ctx.strokeStyle = O();
      ctx.fillStyle = '#ff8fc0';
      ctx.beginPath(); ctx.moveTo(170, 96); ctx.lineTo(196, 78); ctx.lineTo(222, 96); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(172, 96, 48, 4); ctx.strokeRect(172, 96, 48, 4);
      for (let i = 0; i < 3; i++) { const x = 178 + i * 18; ctx.strokeStyle = '#c8913a'; ctx.beginPath(); ctx.moveTo(x, 100); ctx.lineTo(x, 124 + Math.sin(t * 3 + i) * 3); ctx.stroke(); }
      ctx.fillStyle = '#8f939e'; ctx.beginPath(); ctx.ellipse(178, 128 + Math.sin(t * 3) * 3, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2b6fd6'; ctx.fillRect(190, 124 + Math.sin(t * 3 + 1) * 3, 12, 7);
      ctx.fillStyle = '#c8913a'; ctx.fillRect(170, 136, 52, 6);
      // bumper cars area
      ctx.fillStyle = '#5a5a73'; ctx.fillRect(232, 124, 44, 24);
      for (let i = 0; i < 2; i++) seat(ctx, 244 + i * 20 + Math.sin(t * 2 + i * 2) * 4, 138, i ? '#ffd23f' : '#4cc9f0');
      // candy floss stand
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = O();
      ctx.fillRect(288, 108, 26, 40); ctx.strokeRect(288, 108, 26, 40);
      ctx.fillStyle = '#ff8fc0';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(288 + i * 6.5, 100); ctx.lineTo(288 + i * 6.5 + 6.5, 100); ctx.lineTo(288 + i * 6.5 + 3.2, 108); ctx.closePath(); ctx.fill(); }
      ctx.beginPath(); ctx.arc(300, 96, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
      for (const r of RIDES) MP.drawText(ctx, r.name, r.x, GROUND + 5, { size: r.name.length > 10 ? 0.45 : 0.55, color: O(), align: 'center' });

      // me (dizzy after the roller coaster, with candy floss)
      const dizzy = t < this.dizzyUntil;
      const p = this.player;
      MP.drawPerson(ctx, p.x, GROUND + 2, { walking: p.walking, walkTime: p.walkTime, flip: p.facing < 0, hero: true, eyes: dizzy ? 'closed' : 'open', mouth: this.floss ? 'open' : 'smile' });
      if (dizzy) {
        for (let i = 0; i < 4; i++) {
          const a = t * 4 + i * Math.PI / 2;
          MP.drawText(ctx, '★', p.x + Math.cos(a) * 9, GROUND - 50 + Math.sin(a) * 3, { size: 0.6, color: '#ffd23f', align: 'center' });
        }
      }
      if (this.floss && t - this.floss < 20) {
        ctx.save();
        ctx.strokeStyle = '#c8913a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x + 7, GROUND - 14); ctx.lineTo(p.x + 10, GROUND - 34); ctx.stroke();
        ctx.fillStyle = '#ffb7d0';
        for (const [dx, dy, r] of [[10, -46, 10], [3, -42, 7], [17, -41, 7], [10, -55, 7]]) { ctx.beginPath(); ctx.arc(p.x + dx, GROUND + dy, r, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      MP.drawButton(ctx, '◀ Ulos', BACK, { size: 0.8 });
      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, p.x, GROUND - 56, { maxWidth: 170, size: 0.85 });
    },

    // ---------------------------------------------------------------------------
    // The rides, full screen
    // ---------------------------------------------------------------------------
    drawRide(ctx, t) {
      const r = this.ride;
      const u = t - r.from;
      const g = ctx.createLinearGradient(0, 0, 0, MP.H);
      g.addColorStop(0, '#5fc2f2'); g.addColorStop(1, '#d8f4ff');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      const me = (x, y, extra) => MP.drawPerson(ctx, x, y, Object.assign({ hero: true, scale: 0.9 }, extra));

      if (r.id === 'coaster') {
        // the track: up a hill, down, and a loop
        const path = (k) => {
          if (k < 0.3) { const q = k / 0.3; return { x: 20 + q * 100, y: 150 - q * 110 }; }          // up the hill (slowly)
          if (k < 0.5) { const q = (k - 0.3) / 0.2; return { x: 120 + q * 100, y: 40 + q * 110 }; }  // whoosh down
          if (k < 0.8) { const q = (k - 0.5) / 0.3; const a = q * Math.PI * 2; return { x: 220 + Math.sin(a) * 40, y: 110 + Math.cos(a) * 40 }; }   // the loop
          const q = (k - 0.8) / 0.2; return { x: 220 + q * 120, y: 150 };
        };
        ctx.save();
        ctx.strokeStyle = '#e04848'; ctx.lineWidth = 3;
        ctx.beginPath();
        for (let k = 0; k <= 1.001; k += 0.01) { const p = path(k); if (k === 0) ctx.moveTo(p.x, p.y + 8); else ctx.lineTo(p.x, p.y + 8); }
        ctx.stroke();
        ctx.restore();
        // slow up, fast down
        const k = u < 2.4 ? u / 2.4 * 0.3 : MP.clamp(0.3 + (u - 2.4) / (r.len - 2.6) * 0.7, 0, 1);
        const p = path(k), p2 = path(Math.min(1, k + 0.01));
        const ang = Math.atan2(p2.y - p.y, p2.x - p.x);
        ctx.save();
        ctx.translate(p.x, p.y + 6);
        ctx.rotate(ang);
        seat(ctx, 0, 0, '#ffd23f');
        me(0, -2, { mouth: u > 2.4 ? 'open' : 'smile', armUp: u > 2.4 ? 1 : 0 });
        ctx.restore();
        if (u < 2.4) MP.drawText(ctx, 'klik… klak… klik…', 160, 12, { size: 0.9, color: O(), align: 'center' });
        else if (u < 6) MP.drawText(ctx, 'IIIIIIIII!', 160, 12, { size: 1.6, color: '#e04848', outline: '#ffffff', align: 'center' });
        // the hat flies off and comes back
        if (r.hat && r.hat !== 'none' && u > 2.6) {
          const q = MP.clamp((u - 2.6) / 3.5, 0, 1);
          const hx = 140 + q * 120, hy = 30 + Math.sin(q * Math.PI) * -20 + q * 100;
          ctx.save(); ctx.translate(hx, hy); ctx.rotate(u * 6);
          ctx.fillStyle = (MP.findItem('hat', r.hat).color) || '#e04848';
          ctx.beginPath(); ctx.arc(0, 0, 6, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = O(); ctx.stroke();
          ctx.restore();
          if (q < 1) MP.drawText(ctx, 'Hattu lensi!', hx, hy - 16, { size: 0.6, color: '#ffffff', outline: O(), align: 'center' });
        }
      } else if (r.id === 'wheel') {
        // the sea and the temple far below
        ctx.fillStyle = '#1f9fc4'; ctx.fillRect(0, 120, MP.W, 60);
        ctx.fillStyle = '#f3e0b0'; ctx.fillRect(0, 150, MP.W, 30);
        ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.moveTo(40, 150); ctx.lineTo(50, 126); ctx.lineTo(60, 150); ctx.closePath(); ctx.fill();
        const a = -Math.PI / 2 + Math.sin(MP.clamp(u / r.len, 0, 1) * Math.PI) * -Math.PI * 0.95;
        const cx = 200, cy = 100, R = 70;
        ctx.save();
        ctx.strokeStyle = '#d8dde6'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 8; i++) { const b = i / 8 * Math.PI * 2 + a; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(b) * R, cy + Math.sin(b) * R); ctx.stroke(); }
        ctx.restore();
        const sx = cx + Math.cos(a + Math.PI) * R, sy = cy + Math.sin(a + Math.PI) * R;
        me(sx, sy + 2, { mouth: 'smile' });
        seat(ctx, sx, sy + 4, '#ff5f8f');
        if (u > r.len * 0.4) {
          // a little bird lands on the seat
          const q = MP.clamp((u - r.len * 0.4) / 1, 0, 1);
          const bx = sx + 12 + (1 - q) * 60, by = sy - 2 - (1 - q) * 40;
          ctx.fillStyle = '#4a78c8';
          ctx.beginPath(); ctx.ellipse(bx, by, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffb02e'; ctx.fillRect(bx + 3, by - 0.5, 2, 1);
          if (q >= 1) MP.drawText(ctx, 'tsirp!', bx, by - 12, { size: 0.55, color: O(), align: 'center' });
        }
        MP.drawText(ctx, 'Korkealla! Näkyy meri ja temppeli.', 160, 8, { size: 0.8, color: O(), align: 'center' });
      } else if (r.id === 'carousel') {
        ctx.fillStyle = '#f3e0b0'; ctx.fillRect(0, 150, MP.W, 30);
        ctx.save();
        ctx.lineWidth = 1; ctx.strokeStyle = O();
        ctx.fillStyle = '#ff8fc0';
        ctx.beginPath(); ctx.moveTo(40, 50); ctx.lineTo(160, 10); ctx.lineTo(280, 50); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffd23f'; ctx.fillRect(44, 50, 232, 8); ctx.strokeRect(44, 50, 232, 8);
        ctx.fillStyle = '#c8913a'; ctx.fillRect(40, 140, 240, 12); ctx.strokeRect(40, 140, 240, 12);
        ctx.restore();
        // the seats go round: the ones in front are bigger
        const items = [];
        for (let i = 0; i < 6; i++) {
          const a = u * 1.2 + i / 6 * Math.PI * 2;
          items.push({ i, x: 160 + Math.sin(a) * 100, depth: Math.cos(a), bob: Math.sin(u * 4 + i) * 6 });
        }
        items.sort((p, q) => p.depth - q.depth);
        for (const it of items) {
          const s = 0.7 + (it.depth + 1) * 0.2;
          const y = 112 + it.bob;
          ctx.save();
          ctx.strokeStyle = '#c8913a'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(it.x, 58); ctx.lineTo(it.x, y); ctx.stroke();
          ctx.translate(it.x, y);
          ctx.scale(s, s);
          if (it.i % 2 === 0) {
            ctx.fillStyle = '#8f939e'; ctx.strokeStyle = O(); ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.ellipse(0, 4, 14, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(-13, -2, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#c0392b'; ctx.fillRect(-6, -5, 12, 4);
          } else {
            ctx.fillStyle = '#2b6fd6'; ctx.strokeStyle = O(); ctx.lineWidth = 0.8;
            MP.roundRect(ctx, -14, -4, 28, 14, 3); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ffd23f'; ctx.fillRect(-15, -12, 30, 3);
          }
          if (it.i === 0) MP.drawPerson(ctx, 0, -2, { hero: true, scale: 0.9, mouth: 'open', armUp: 0.6 });
          ctx.restore();
        }
        MP.drawText(ctx, '♪ ♫ ♪', 160, 64, { size: 1, color: '#e0559a', align: 'center' });
      } else if (r.id === 'cars') {
        ctx.fillStyle = '#5a5a73'; ctx.fillRect(10, 60, 300, 110);
        ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.strokeRect(10, 60, 300, 110);
        const cars = [
          { c: '#ff5f8f', me: true, x: 160 + Math.sin(u * 1.4) * 110, y: 130 + Math.sin(u * 2.1) * 20 },
          { c: '#4cc9f0', x: 160 + Math.sin(u * 1.4 + Math.PI) * 110, y: 120 + Math.cos(u * 1.7) * 25 },
          { c: '#7bd389', x: 160 + Math.cos(u * 1.1) * 90, y: 100 + Math.sin(u * 2.4) * 20 },
        ];
        for (const c of cars) {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.fillStyle = c.c; ctx.strokeStyle = O(); ctx.lineWidth = 1;
          MP.roundRect(ctx, -18, -8, 36, 16, 6); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#2b2b33'; ctx.fillRect(-20, 4, 40, 4);
          ctx.strokeStyle = '#8a93a6'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -40); ctx.stroke();
          if (c.me) MP.drawPerson(ctx, 0, -2, { hero: true, scale: 0.75, mouth: 'open' });
          else MP.drawPerson(ctx, 0, -2, { character: c.c === '#4cc9f0' ? 'boy' : 'girl', hair: '#2b1d14', scale: 0.75, mouth: 'open', outfit: { shirt: 'yellow', bottom: 'jeans', hat: 'none', costume: 'none' } });
          ctx.restore();
        }
        if (Math.sin(u * 1.4 * 2) > 0.95) MP.drawText(ctx, 'BONK!', 160, 66, { size: 1.4, color: '#ffd23f', outline: O(), align: 'center' });
      }
      MP.drawText(ctx, '(napauta, niin kyyti loppuu)', MP.W - 4, 170, { size: 0.5, color: O(), align: 'right' });
    },
  };
})();
