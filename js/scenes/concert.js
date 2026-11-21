// concert.js – the Turpapojat concert: a memory that starts from the poster in
// the child's room. A dream bubble opens: "Muistatko?" – and we are on the stage!
// The band plays a happy tune (made with the game's own sounds). Stars fall down
// three lanes on the right; tap a star when it reaches the line. Every good tap
// makes a dance move and the audience cheers. Misses don't stop the song.
// At the end: applause, flowers on the stage and 1–3 stars.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const BEAT = 0.64;             // seconds per beat (an easy tempo)
  const MEMORY = 3.2;            // the dream bubble opening
  const LEAD = 4;                // "1, 2, 3, 4!" before the song
  const FALL = 2.3;              // seconds a star falls before reaching the line
  const HIT_Y = 146;
  const TOP_Y = 26;
  const LANES = [228, 259, 290]; // lane middles
  const LANE_W = 31;
  const GOOD = 0.3, SUPER = 0.13;   // how close in time a tap must be
  const STAGE_Y = 140;           // where feet stand on the stage
  const DONE_BTN = { x: 98, y: 130, w: 124, h: 22 };
  const LANE_COLORS = ['#ff5f8f', '#ffd23f', '#5fd4ff'];

  // The tune: [beat, midi note, length in beats]
  const MELODY = [
    [0, 60, 1], [1, 64, 1], [2, 67, 1], [3, 64, 1], [4, 65, 1], [5, 69, 1], [6, 67, 2],
    [8, 67, 1], [9, 65, 1], [10, 64, 1], [11, 62, 1], [12, 60, 1], [13, 62, 1], [14, 64, 2],
    [16, 60, 1], [17, 64, 1], [18, 67, 1], [19, 64, 1], [20, 65, 1], [21, 69, 1], [22, 67, 2],
    [24, 72, 1], [25, 71, 1], [26, 69, 1], [27, 67, 1], [28, 65, 1], [29, 64, 1], [30, 62, 1], [31, 64, 1], [32, 60, 2],
  ];
  const BASS = [[0, 48], [2, 48], [4, 53], [6, 48], [8, 55], [10, 53], [12, 48], [14, 55],
    [16, 48], [18, 48], [20, 53], [22, 48], [24, 53], [26, 53], [28, 48], [30, 55], [32, 48]];
  const SONG_BEATS = 34;
  // Stars on every other beat; the lane follows the melody (low – middle – high)
  const CHART = MELODY.filter((m) => m[0] % 2 === 0).map((m) => ({
    beat: m[0], lane: m[1] <= 62 ? 0 : m[1] <= 66 ? 1 : 2,
  }));

  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  const songStart = MEMORY + LEAD * BEAT;       // when beat 0 of the song plays
  const timeOf = (beat) => songStart + beat * BEAT;
  const SONG_END = timeOf(SONG_BEATS);

  const MOVES = ['jump', 'spin', 'wave', 'jump', 'clap', 'spin'];

  // The two boys of the band (our own drawings)
  const BAND = [
    { x: 40, hair: '#e8c25a', outfit: { shirt: 'kpop', bottom: 'jeans', hat: 'none', costume: 'none', shoes: true }, guitar: true },
    { x: 86, hair: '#4a3020', outfit: { shirt: 'red', bottom: 'brown', hat: 'cap', costume: 'none', shoes: true }, mic: true },
  ];

  MP.scenes.concert = {
    enter() {
      this.t = 0;
      this.notes = CHART.map((c) => ({ beat: c.beat, lane: c.lane, time: timeOf(c.beat), state: 'fall', at: 0 }));
      this.events = [];
      // the music: drums from the count-in, then melody and bass
      for (let b = -LEAD; b < SONG_BEATS; b++) {
        const tb = timeOf(b);
        this.events.push({ t: tb, fn: () => MP.sfx.kick() });
        if (b >= 0 && ((b % 4) === 1 || (b % 4) === 3)) this.events.push({ t: tb, fn: () => MP.sfx.hat(true) });
        if (b >= 0) this.events.push({ t: tb + BEAT / 2, fn: () => MP.sfx.hat(false) });
        if (b < 0) this.events.push({ t: tb, fn: () => MP.sfx.note(b === -1 ? 1320 : 990, 0.08, 'square', 0.08) });
      }
      for (const [b, m, len] of MELODY) this.events.push({ t: timeOf(b), fn: () => MP.sfx.note(hz(m), len * BEAT * 0.9, 'triangle', 0.2) });
      for (const [b, m] of BASS) this.events.push({ t: timeOf(b), fn: () => MP.sfx.note(hz(m), BEAT * 1.8, 'sine', 0.22) });
      this.events.sort((a, b) => a.t - b.t);
      this.next = 0;

      this.hits = 0;
      this.move = null;            // { kind, from }
      this.moveN = 0;
      this.cheerFrom = -9;
      this.pops = [];              // "Super!" texts and sparkles
      this.flowers = [];
      this.done = null;            // { from, stars }
      this.kpop = MP.state.outfit && MP.state.outfit.shirt === 'kpop' && (!MP.state.outfit.costume || MP.state.outfit.costume === 'none');
    },

    onTap(x, y) {
      if (this.t < MEMORY) {
        // skip the dream bubble
        this.t = MEMORY;
        while (this.next < this.events.length && this.events[this.next].t < this.t) this.next++;
        return;
      }
      if (this.done) {
        if (MP.time - this.done.from > 1.5 && MP.hit(DONE_BTN, x, y)) {
          MP.sfx.tap();
          MP.goTo(MP.scenes.home);
        }
        return;
      }
      // which lane? (generous: the whole column)
      if (x < LANES[0] - LANE_W / 2 - 6) return;
      const lane = MP.clamp(Math.round((x - LANES[0]) / LANE_W), 0, 2);
      let best = null;
      for (const n of this.notes) {
        if (n.state !== 'fall' || n.lane !== lane) continue;
        const d = Math.abs(n.time - this.t);
        if (d <= GOOD && (!best || d < Math.abs(best.time - this.t))) best = n;
      }
      if (!best) return;
      best.state = 'hit';
      best.at = this.t;
      this.hits++;
      const sup = Math.abs(best.time - this.t) <= SUPER;
      this.pops.push({ x: LANES[lane], y: HIT_Y - 14, text: sup ? 'Super!' : 'Hyvä!', from: MP.time });
      MP.sfx.note(sup ? 1760 : 1320, 0.12, 'triangle', 0.12);
      this.move = { kind: MOVES[this.moveN++ % MOVES.length], from: MP.time };
      this.cheerFrom = MP.time;
      if (this.kpop) {
        for (let i = 0; i < 6; i++) this.pops.push({ x: 150 + (Math.random() - 0.5) * 40, y: STAGE_Y - 20 - Math.random() * 30, sparkle: true, from: MP.time + i * 0.05 });
      }
    },

    update(dt) {
      this.t += dt;
      while (this.next < this.events.length && this.events[this.next].t <= this.t) {
        if (this.t - this.events[this.next].t < 0.25) this.events[this.next].fn();   // don't play old sounds after a pause
        this.next++;
      }
      for (const n of this.notes) {
        if (n.state === 'fall' && this.t > n.time + GOOD) { n.state = 'miss'; n.at = this.t; }
      }
      this.pops = this.pops.filter((p) => MP.time - p.from < 1);
      if (!this.done && this.t > SONG_END + 0.6) {
        const ratio = this.hits / this.notes.length;
        this.done = { from: MP.time, stars: ratio >= 0.75 ? 3 : ratio >= 0.4 ? 2 : 1 };
        MP.sfx.applause(3);
        this.cheerFrom = MP.time + 2.5;
        for (let i = 0; i < 9; i++) {
          this.flowers.push({ x0: 20 + Math.random() * 280, x1: 110 + Math.random() * 90, from: MP.time + i * 0.25, col: LANE_COLORS[i % 3] });
        }
      }
      if (this.done && MP.time - this.done.from > 1.2 && !this.done.bling) {
        this.done.bling = true;
        MP.sfx.bling();
      }
    },

    // ---------------------------------------------------------------------------
    draw(ctx) {
      const t = this.t, now = MP.time;
      const beatPhase = t > songStart - LEAD * BEAT ? ((t - songStart) / BEAT) % 1 : 0;
      const bounce = Math.abs(Math.sin((beatPhase < 0 ? beatPhase + 1 : beatPhase) * Math.PI));

      // --- The stage ---
      const g = ctx.createLinearGradient(0, 0, 0, MP.H);
      g.addColorStop(0, '#1b1040');
      g.addColorStop(1, '#4a2a7a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      // light beams swinging
      for (let i = 0; i < 4; i++) {
        const sx = 30 + i * 70, a = Math.sin(now * 0.9 + i * 1.7) * 0.5;
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = LANE_COLORS[i % 3];
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + Math.sin(a) * 160 - 22, STAGE_Y);
        ctx.lineTo(sx + Math.sin(a) * 160 + 22, STAGE_Y);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      // the band's name in shining letters
      ctx.save();
      ctx.shadowColor = '#ff5fd0';
      ctx.shadowBlur = 6 + bounce * 6;
      MP.drawText(ctx, 'TURPAPOJAT', 112, 12, { size: 1.9, color: '#ffe0ff', outline: '#b0208a', align: 'center' });
      ctx.restore();
      // speakers
      for (const sx of [4, 176]) {
        ctx.save();
        ctx.lineWidth = 0.8; ctx.strokeStyle = O(); ctx.fillStyle = '#2b2b33';
        MP.roundRect(ctx, sx, 96, 22, 44, 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#5a5a73';
        for (const [cy, r] of [[108, 6 + bounce], [128, 7 + bounce]]) { ctx.beginPath(); ctx.arc(sx + 11, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      }
      // the stage floor
      ctx.fillStyle = '#8a5a2e';
      ctx.fillRect(0, STAGE_Y, 210, 10);
      ctx.fillStyle = '#6e4226';
      ctx.fillRect(0, STAGE_Y + 10, 210, 4);

      // --- The band ---
      BAND.forEach((m, i) => {
        const bob = bounce * 1.5 * (i ? 1 : -1);
        MP.drawPerson(ctx, m.x, STAGE_Y - Math.max(0, bob), {
          character: 'boy', hair: m.hair, outfit: m.outfit, scale: 1.1,
          armUp: m.mic && this.done ? 0.7 : 0,
        });
        if (m.guitar) {
          ctx.save();
          ctx.translate(m.x + 1, STAGE_Y - 20);
          ctx.rotate(-0.5 + Math.sin(now * 8) * 0.04);
          ctx.lineWidth = 0.7; ctx.strokeStyle = O();
          ctx.fillStyle = '#e04848';
          ctx.beginPath(); ctx.ellipse(-3, 2, 6, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#2b2340'; ctx.beginPath(); ctx.arc(-3, 2, 1.4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#a0643c'; ctx.fillRect(2, 0.8, 15, 2.2); ctx.strokeRect(2, 0.8, 15, 2.2);
          ctx.restore();
        }
        if (m.mic) {
          ctx.save();
          ctx.lineWidth = 1; ctx.strokeStyle = '#c9d1db';
          ctx.beginPath(); ctx.moveTo(m.x + 9, STAGE_Y); ctx.lineTo(m.x + 9, STAGE_Y - 32); ctx.lineTo(m.x + 4, STAGE_Y - 36); ctx.stroke();
          ctx.fillStyle = '#2b2b33'; ctx.beginPath(); ctx.arc(m.x + 3.5, STAGE_Y - 36.5, 2, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      });
      // music notes floating from the band while the song plays
      if (t > songStart && t < SONG_END) {
        for (let i = 0; i < 3; i++) {
          const p = (now * 0.5 + i / 3) % 1;
          ctx.save();
          ctx.globalAlpha = 1 - p;
          MP.drawText(ctx, '♪', 60 + i * 18 + Math.sin(p * 6 + i) * 4, 80 - p * 50, { size: 1, color: LANE_COLORS[i], outline: O() });
          ctx.restore();
        }
      }

      // --- Me, dancing in the middle ---
      this.drawDancer(ctx, 148, STAGE_Y, bounce, now);

      // --- The audience ---
      const cheering = now - this.cheerFrom < 0.6 || (this.done && now - this.done.from < 4);
      for (let i = 0; i < 14; i++) {
        const ax = 8 + i * 15, hop = cheering ? Math.abs(Math.sin(now * 10 + i)) * 3 : 0;
        ctx.save();
        ctx.fillStyle = i % 2 ? '#2a1a4a' : '#352258';
        ctx.beginPath(); ctx.arc(ax, 168 - hop, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(ax - 8, 172 - hop, 16, 12);
        if (cheering) {
          ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(ax - 6, 172 - hop); ctx.lineTo(ax - 9, 160 - hop); ctx.moveTo(ax + 6, 172 - hop); ctx.lineTo(ax + 9, 160 - hop); ctx.stroke();
        }
        ctx.restore();
      }

      // --- The star lanes ---
      if (!this.done) this.drawLanes(ctx, now);

      // "Super!" texts and sparkles
      for (const p of this.pops) {
        const a = now - p.from;
        if (a < 0) continue;
        ctx.save();
        ctx.globalAlpha = MP.clamp(1 - a, 0, 1);
        if (p.sparkle) this.star(ctx, p.x, p.y - a * 10, 2.2, '#ffe680');
        else MP.drawText(ctx, p.text, p.x, p.y - a * 12, { size: 0.8, color: '#ffffff', outline: O(), align: 'center' });
        ctx.restore();
      }

      // count-in: 1, 2, 3, 4!
      if (t >= MEMORY && t < songStart) {
        const n = Math.floor((t - MEMORY) / BEAT) + 1;
        MP.drawText(ctx, n < LEAD ? String(n) : String(n) + '!', 110, 50, { size: 3, color: '#ffe680', outline: O(), align: 'center' });
        if (n === 1) MP.drawText(ctx, 'Napauta tähtiä viivalla!', 110, 84, { size: 0.9, color: '#ffffff', outline: O(), align: 'center' });
      }

      // --- The end: flowers and stars ---
      if (this.done) this.drawEnd(ctx, now);

      // --- It's a memory: a dreamy cloud frame, and the bubble opening ---
      this.drawMemory(ctx, now);
    },

    drawDancer(ctx, x, y, bounce, now) {
      let dy = -bounce * 1.5, sx = 1, armUp = 0, walking = false;
      const mv = this.move;
      const u = mv ? (now - mv.from) / 0.55 : 1;
      if (mv && u < 1) {
        if (mv.kind === 'jump') { dy = -Math.sin(u * Math.PI) * 14; armUp = 0.6; }
        else if (mv.kind === 'spin') { sx = Math.cos(u * Math.PI * 2); }
        else if (mv.kind === 'wave') { armUp = Math.sin(u * Math.PI); walking = true; }
        else if (mv.kind === 'clap') { armUp = 0.45 + Math.sin(u * Math.PI * 4) * 0.25; dy = -Math.abs(Math.sin(u * Math.PI * 2)) * 4; }
      } else if (this.done) {
        armUp = 0.8;                    // bowing… no: cheering at the end!
      }
      ctx.save();
      ctx.translate(x, 0);
      ctx.scale(Math.abs(sx) < 0.15 ? 0.15 * Math.sign(sx || 1) : sx, 1);
      MP.drawPerson(ctx, 0, y + dy, { scale: 1.2, armUp, walking, walkTime: now, mouth: 'smile' });
      ctx.restore();
      // a spotlight circle on the floor
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#ffe680';
      ctx.beginPath(); ctx.ellipse(x, y + 2, 16, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    },

    star(ctx, x, y, r, col) {
      ctx.save();
      ctx.fillStyle = col;
      ctx.strokeStyle = O();
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    },

    drawLanes(ctx, now) {
      const t = this.t;
      ctx.save();
      ctx.fillStyle = 'rgba(10,5,30,0.45)';
      MP.roundRect(ctx, LANES[0] - LANE_W / 2 - 2, TOP_Y - 6, LANE_W * 3 + 4, HIT_Y - TOP_Y + 22, 6);
      ctx.fill();
      ctx.restore();
      LANES.forEach((lx, i) => {
        // the target circles on the line
        const glow = this.notes.some((n) => n.state === 'hit' && n.lane === i && t - n.at < 0.2);
        ctx.save();
        ctx.lineWidth = glow ? 2.2 : 1.2;
        ctx.strokeStyle = LANE_COLORS[i];
        ctx.fillStyle = glow ? LANE_COLORS[i] : 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.arc(lx, HIT_Y, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
      });
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(LANES[0] - LANE_W / 2, HIT_Y); ctx.lineTo(LANES[2] + LANE_W / 2, HIT_Y); ctx.stroke();
      ctx.restore();
      for (const n of this.notes) {
        const left = n.time - t;                 // seconds until it reaches the line
        if (left > FALL) continue;
        let y = HIT_Y - (left / FALL) * (HIT_Y - TOP_Y);
        let a = 1, r = 8;
        if (n.state === 'hit') {
          const k = (t - n.at) / 0.3;
          if (k > 1) continue;
          a = 1 - k; r = 8 + k * 8; y = HIT_Y;
        } else if (n.state === 'miss') {
          const k = (t - n.at) / 0.5;
          if (k > 1) continue;
          a = 0.5 * (1 - k);
        }
        ctx.save();
        ctx.globalAlpha = a;
        this.star(ctx, LANES[n.lane], y, r, n.state === 'miss' ? '#9a9ab0' : LANE_COLORS[n.lane]);
        ctx.restore();
      }
    },

    drawEnd(ctx, now) {
      const d = this.done;
      // flowers thrown onto the stage
      for (const f of this.flowers) {
        const u = MP.clamp((now - f.from) / 0.9, 0, 1);
        if (now < f.from) continue;
        const x = MP.lerp(f.x0, f.x1, u), y = MP.lerp(176, STAGE_Y - 1, u) - Math.sin(u * Math.PI) * 50;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(u * 6);
        ctx.strokeStyle = '#3cb371'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 7); ctx.stroke();
        ctx.fillStyle = f.col;
        for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; ctx.beginPath(); ctx.arc(Math.cos(a) * 2, Math.sin(a) * 2, 1.6, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(0, 0, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      if (now - d.from < 1) return;
      ctx.save();
      ctx.globalAlpha = MP.clamp((now - d.from - 1) * 3, 0, 1);
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#fff7e0';
      MP.roundRect(ctx, 80, 40, 160, 120, 10); ctx.fill(); ctx.stroke();
      MP.drawText(ctx, 'Ihana konsertti!', MP.W / 2, 48, { size: 1.3, color: '#e0559a', align: 'center' });
      for (let i = 0; i < 3; i++) {
        const on = i < d.stars && now - d.from > 1.3 + i * 0.3;
        this.star(ctx, MP.W / 2 - 30 + i * 30, 84, on ? 11 : 9, on ? '#ffd23f' : '#d9d4e6');
      }
      MP.drawText(ctx, 'Osuit ' + this.hits + ' / ' + this.notes.length + ' tähteen', MP.W / 2, 104, { size: 0.85, color: O(), align: 'center' });
      MP.drawText(ctx, 'Yleisö heittää kukkia!', MP.W / 2, 116, { size: 0.75, color: '#6b5f80', align: 'center' });
      if (now - d.from > 1.5) MP.drawButton(ctx, 'Takaisin huoneeseen', DONE_BTN, { size: 0.85 });
      ctx.restore();
    },

    // The memory: everything is seen through a soft cloud frame. At the start the
    // bubble opens from the middle, with "Muistatko?"
    drawMemory(ctx, now) {
      const t = this.t;
      const open = MP.clamp((t - 0.6) / 1.6, 0, 1);
      if (open < 1) {
        // dark around a growing circle
        ctx.save();
        ctx.fillStyle = '#140a2e';
        ctx.beginPath();
        ctx.rect(0, 0, MP.W, MP.H);
        ctx.arc(MP.W / 2, MP.H / 2, 4 + open * open * 200, 0, Math.PI * 2, true);
        ctx.fill('evenodd');
        ctx.restore();
        for (let i = 0; i < 12; i++) {
          const a = i / 12 * Math.PI * 2 + now;
          const r = 10 + open * 120 + Math.sin(now * 4 + i) * 4;
          this.star(ctx, MP.W / 2 + Math.cos(a) * r, MP.H / 2 + Math.sin(a) * r * 0.6, 2.4, '#ffe680');
        }
      }
      if (t < MEMORY) {
        ctx.save();
        ctx.globalAlpha = MP.clamp(t * 3, 0, 1) * MP.clamp((MEMORY - t) * 2, 0, 1);
        MP.drawText(ctx, 'Muistatko?', MP.W / 2, 60, { size: 1.8, color: '#ffffff', outline: O(), align: 'center' });
        MP.drawText(ctx, 'Turpapoikien konsertti!', MP.W / 2, 84, { size: 1.1, color: '#ffe0ff', outline: O(), align: 'center' });
        ctx.restore();
      }
      // the soft white cloud frame of a memory
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffffff';
      const puff = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
      for (let x = 0; x <= MP.W; x += 16) {
        const w = Math.sin(now * 1.5 + x * 0.1) * 1.5;
        puff(x, -3 + w, 9);
        puff(x + 8, MP.H + 3 - w, 9);
      }
      for (let y = 0; y <= MP.H; y += 16) {
        const w = Math.sin(now * 1.5 + y * 0.1) * 1.5;
        puff(-3 + w, y, 9);
        puff(MP.W + 3 - w, y + 8, 9);
      }
      ctx.restore();
    },
  };
})();
