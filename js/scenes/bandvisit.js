// bandvisit.js – TURPAPOJAT COME TO VISIT!
//   Some evenings (one in three) the doorbell rings at home: Sasu and Daniel
//   are at the door with a guitar and a microphone. Tap the door:
//   1. They walk into the living room: "Moi! Soitetaanko yhdessä?"
//   2. The drum kit is carried down from upstairs.
//   3. A mini concert: they play "Mä löin sua turpaan", the furniture bounces,
//      mom or dad and the pet dance, and you play the drums along – tap the drum
//      that lights up (like "Soita mukana" in drums.js).
//   4. At the end Sasu and Daniel sign the Turpapojat poster in your room
//      (saved: treasures.signedPoster).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const FLOOR = 156;
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const KIT_X = 132;
  // the drums of the small kit (x, y = the middle of the top)
  const DRUMS = [
    { id: 'hat', x: KIT_X - 30, y: 112, rx: 12, ry: 3.5, metal: true },
    { id: 'snare', x: KIT_X - 14, y: 128, rx: 13, ry: 4.5 },
    { id: 'kick', x: KIT_X + 8, y: 136, rx: 17, ry: 17, front: true },
    { id: 'cymbal', x: KIT_X + 34, y: 106, rx: 15, ry: 4, metal: true },
  ];
  const VERSES = 2;
  // the drum to hit on each beat of a verse (16 beats)
  const drumFor = (n) => (n % 16 === 7 || n % 16 === 15 ? 'cymbal' : n % 4 === 2 ? 'snare' : n % 2 === 0 ? 'kick' : 'hat');
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  function hitSound(id) {
    if (id === 'kick') MP.sfx.kick();
    else if (id === 'snare') MP.sfx.hat(true);
    else if (id === 'hat') MP.sfx.hat(false);
    else { MP.sfx.hat(true); MP.sfx.note(2400, 0.4, 'triangle', 0.03); }
  }

  function guitar(c, x, y, rot) {
    c.save();
    c.translate(x, y); c.rotate(rot);
    c.lineWidth = 0.7; c.strokeStyle = O();
    c.fillStyle = '#e04848';
    c.beginPath(); c.ellipse(0, 0, 6, 4.5, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#2b2340'; c.beginPath(); c.arc(0, 0, 1.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#8a5a2e'; c.fillRect(5, -0.8, 14, 1.6); c.strokeRect(5, -0.8, 14, 1.6);
    c.restore();
  }

  MP.scenes.bandvisit = {
    noRestart: true,

    enter() {
      this.step = 'arrive';
      this.from = MP.time;
      this.who = Math.random() < 0.5 ? 'mom' : 'dad';
      this.song = (MP.TURPA_SONGS || [])[0];
      this.score = 0;
      this.hits = {};
      this.hitAt = {};
      this.kitFrom = null;
      this.say('Ding-dong! Ovella ovat… Sasu ja Daniel Turpapojista!', 'me');
      MP.sfx.note(784, 0.35, 'sine', 0.25);
      setTimeout(() => MP.sfx.note(622, 0.5, 'sine', 0.25), 380);
    },

    say(text, who) { this.bubble = { text, from: MP.time, until: Infinity, who: who || 'me' }; },

    beat() { return (MP.time - this.playFrom) / this.song.beat; },

    onTap(x, y) {
      const t = MP.time;
      if (MP.hit(BACK, x, y) && this.step !== 'play') {
        MP.sfx.tap();
        MP.goTo(MP.scenes.home);
        return;
      }
      if (this.step === 'arrive' && t - this.from > 2.4) {
        this.step = 'carry';
        this.kitFrom = t;
        MP.sfx.tap();
        this.say('Daniel: Hei, sulla on rummut! Haetaan ne alas, niin soitetaan yhdessä!', 'band');
        return;
      }
      if (this.step === 'carry' && t - this.kitFrom > 1.8) {
        this.step = 'play';
        this.playFrom = t + 1.2;
        this.lastBeat = -1;
        this.bubble = null;
        MP.sfx.bling();
        return;
      }
      if (this.step === 'play') {
        for (let i = DRUMS.length - 1; i >= 0; i--) {
          const d = DRUMS[i];
          if (((x - d.x) / (d.rx + 5)) ** 2 + ((y - d.y) / (d.ry + (d.front ? 5 : 10))) ** 2 > 1) continue;
          hitSound(d.id);
          this.hitAt[d.id] = t;
          const n = Math.round(this.beat());
          if (n >= 0 && n < VERSES * 16 && drumFor(n) === d.id && !this.hits[n]) {
            this.hits[n] = true;
            this.score++;
          }
          return;
        }
        return;
      }
      if (this.step === 'end' && t - this.endAt > 1.5) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.home);
      }
    },

    update() {
      if (this.step === 'arrive' && !this.greeted && MP.time - this.from > 2.3) {
        this.greeted = true;
        this.say('Sasu ja Daniel: Moi! Me tultiin kylään! Soitetaanko yhdessä? (napauta)', 'band');
      }
      if (this.step !== 'play') return;
      const song = this.song;
      const b = this.beat();
      const end = VERSES * 16 + 2;
      // the music: melody, guitar fills and bass, beat by beat
      const prev = this.lastBeat;
      if (b >= 0) {
        for (const line of song.lines) {
          for (const [at, , midi, len] of line) {
            for (let v = 0; v < VERSES; v++) {
              const nb = at + v * 16;
              if (nb > prev && nb <= b) MP.sfx.note(hz(midi), len * song.beat * 0.9, 'square', 0.06);
            }
          }
        }
        for (const [at, midi, len] of song.fill) for (let v = 0; v < VERSES; v++) { const nb = at + v * 16; if (nb > prev && nb <= b) MP.sfx.note(hz(midi), len * song.beat * 0.8, 'triangle', 0.08); }
        for (const [at, midi] of song.bass) for (let v = 0; v < VERSES; v++) { const nb = at + v * 16; if (nb > prev && nb <= b) MP.sfx.note(hz(midi), song.beat * 1.6, 'sawtooth', 0.04); }
        if (prev < VERSES * 16 && b >= VERSES * 16) MP.sfx.note(hz(song.end), song.beat * 2, 'square', 0.06);
        this.lastBeat = b;
      }
      if (b > end) {
        this.step = 'end';
        this.endAt = MP.time;
        MP.sfx.applause(2.5);
        MP.state.treasures = MP.state.treasures || {};
        const first = !MP.state.treasures.signedPoster;
        MP.state.treasures.signedPoster = true;
        MP.save();
        const n = this.score, all = VERSES * 16;
        this.say((n >= all * 0.6 ? 'Sasu: Olet huippurumpali! ' : 'Sasu: Hyvin soitettu! ') + n + ' / ' + all + ' lyöntiä oikein. '
          + (first ? 'Me kirjoitetaan nimmarit sun julisteeseen!' : 'Nimmarit on jo julisteessa – tullaan pian taas!'), 'band');
      }
    },

    draw(ctx) {
      const t = MP.time;
      const playing = this.step === 'play' && this.beat() >= 0;
      const b = playing ? this.beat() : 0;
      const bounce = playing ? Math.abs(Math.sin(b * Math.PI)) * 2 : 0;    // the furniture bounces to the beat

      // the living room
      ctx.fillStyle = '#e8f2e0'; ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(120,170,110,0.25)';
      for (let x = 0; x < MP.W; x += 14) ctx.fillRect(x, 0, 6, FLOOR);
      ctx.fillStyle = '#c98a55'; ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      ctx.save();
      ctx.lineWidth = 1; ctx.strokeStyle = O();
      // the sofa, a lamp and a picture (they bounce)
      ctx.fillStyle = '#4cb5a5';
      MP.roundRect(ctx, 214, 118 - bounce, 70, 26, 6); ctx.fill(); ctx.stroke();
      MP.roundRect(ctx, 208, 130 - bounce, 82, 22, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(14, 60 - bounce, 24, 16); ctx.strokeRect(14, 60 - bounce, 24, 16);
      ctx.beginPath(); ctx.moveTo(26, 76 - bounce); ctx.lineTo(26, FLOOR); ctx.stroke();
      ctx.fillStyle = '#fff7e0'; ctx.fillRect(240, 40 - bounce * 0.6, 30, 22); ctx.strokeRect(240, 40 - bounce * 0.6, 30, 22);
      ctx.fillStyle = '#4a78c8'; ctx.beginPath(); ctx.moveTo(244, 58); ctx.lineTo(254, 46); ctx.lineTo(266, 58); ctx.closePath(); ctx.fill();
      ctx.restore();
      // disco lights while playing
      if (playing) {
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.globalAlpha = 0.18;
          ctx.fillStyle = ['#ff5d8f', '#ffd23f', '#4cc9f0', '#9be08f'][(i + Math.floor(b)) % 4];
          ctx.beginPath(); ctx.moveTo(60 + i * 70, 0); ctx.lineTo(30 + i * 70, FLOOR); ctx.lineTo(90 + i * 70, FLOOR); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      }

      // mom or dad and the pet dance by the sofa
      const P = MP.PARENTS[this.who];
      MP.drawPerson(ctx, 300, FLOOR - (playing ? Math.abs(Math.sin(b * Math.PI)) * 4 : 0), {
        character: P.character, outfit: P.outfit, hair: P.hair, scale: P.scale, noBow: P.noBow, glasses: P.glasses,
        flip: true, armUp: playing ? (Math.floor(b) % 2 ? 1 : 0.4) : 0, mouth: 'smile',
      });
      const pet = MP.myPet();
      if (pet) MP.drawPet(ctx, 262, FLOOR, { kind: pet.kind, flip: playing ? Math.floor(b / 2) % 2 === 0 : true, happy: playing ? 0.8 : 0.2 });

      // the drum kit (carried in from the stairs on the left)
      let kitDX = -200;
      if (this.kitFrom != null) kitDX = -200 + 200 * MP.clamp((t - this.kitFrom) / 1.4, 0, 1);
      if (kitDX > -199) {
        ctx.save();
        ctx.translate(kitDX, 0);
        // me behind the kit
        MP.drawPerson(ctx, KIT_X, 126, { hero: true, sit: true, mouth: playing ? 'yawn' : 'smile', armUp: playing && Math.floor(b * 2) % 2 ? 0.9 : 0.4 });
        const n = playing ? Math.round(b) : -1;
        const lit = n >= 0 && n < VERSES * 16 ? drumFor(n) : null;
        for (const d of DRUMS) {
          const since = t - (this.hitAt[d.id] || -9);
          const bob = since < 0.2 ? Math.sin(since / 0.2 * Math.PI) * 2 : 0;
          ctx.save();
          ctx.translate(d.x, d.y + bob);
          ctx.lineWidth = 1; ctx.strokeStyle = O();
          if (lit === d.id) { ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 12; }
          if (!d.front) { ctx.strokeStyle = '#8a93a6'; ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, FLOOR - d.y); ctx.stroke(); ctx.strokeStyle = O(); }
          if (d.front) {
            ctx.fillStyle = '#e04848'; ctx.beginPath(); ctx.arc(0, 0, d.rx, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, d.rx - 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            MP.drawText(ctx, 'TURPA', 0, -3.5, { size: 0.45, color: '#e04848', align: 'center' });
          } else if (d.metal) {
            ctx.fillStyle = '#e8c45a'; ctx.beginPath(); ctx.ellipse(0, 0, d.rx, d.ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          } else {
            ctx.fillStyle = '#e04848'; ctx.fillRect(-d.rx, 0, d.rx * 2, 9); ctx.strokeRect(-d.rx, 0, d.rx * 2, 9);
            ctx.fillStyle = '#f4f4f8'; ctx.beginPath(); ctx.ellipse(0, 0, d.rx, d.ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          }
          ctx.restore();
          if (lit === d.id) MP.draw('arrow', ctx, d.x, d.y - (d.front ? d.rx : d.ry) - 10 + Math.sin(t * 10) * 2);
        }
        ctx.restore();
      }

      // Sasu and Daniel (walking in from the door on the right)
      const band = MP.TURPA_BAND || [];
      const walkIn = MP.clamp((t - this.from) / 2.2, 0, 1);
      band.forEach((m, i) => {
        const goal = i ? 236 : 196;
        const x = 340 + (goal - 340) * walkIn;
        const hop = playing ? Math.abs(Math.sin(b * Math.PI + i)) * 3 : 0;
        MP.drawPerson(ctx, x, FLOOR - hop, {
          character: 'boy', hair: m.hair, outfit: m.outfit, flip: true,
          walking: walkIn < 1, walkTime: t, mouth: playing && Math.floor(b * 2) % 2 ? 'yawn' : 'smile',
          armUp: m.mic ? 0.8 : 0.3,
        });
        if (m.guitar) guitar(ctx, x - 2, FLOOR - 20 - hop, -0.5 + (playing ? Math.sin(b * Math.PI) * 0.1 : 0));
        if (m.mic) { ctx.fillStyle = '#2b2b33'; ctx.fillRect(x - 8, FLOOR - 40 - hop, 2.5, 6); ctx.beginPath(); ctx.arc(x - 6.8, FLOOR - 41 - hop, 2, 0, Math.PI * 2); ctx.fill(); }
        MP.drawText(ctx, m.name, x, FLOOR + 4, { size: 0.55, color: O(), align: 'center' });
      });

      // music notes in the air, karaoke words and the score
      if (playing) {
        for (let i = 0; i < 5; i++) {
          const u = (b * 0.5 + i / 5) % 1;
          MP.drawText(ctx, i % 2 ? '♪' : '♫', 180 + i * 18, 100 - u * 60, { size: 0.9, color: ['#ff5d8f', '#4a78c8', '#e0559a'][i % 3] });
        }
        const lines = this.song.lines;
        const inVerse = b % 16;
        const line = lines[inVerse < 8 ? 0 : 1].map((s) => s[1]).join('');
        if (b < VERSES * 16) MP.drawText(ctx, '♪ ' + line + ' ♪', 160, 10, { size: 1, color: '#e0559a', outline: '#ffffff', align: 'center' });
        MP.drawText(ctx, '★ ' + this.score, 300, 10, { size: 0.9, color: '#ffd23f', outline: O(), align: 'center' });
        if (b < 4) MP.drawText(ctx, 'Napauta rumpua, joka syttyy!', 160, 26, { size: 0.8, color: '#ffffff', outline: O(), align: 'center' });
      } else if (this.step === 'play') {
        MP.drawText(ctx, 'Yks, kaks, kol, nel!', 160, 40, { size: 1.4, color: '#ffe680', outline: O(), align: 'center' });
      }
      if (this.step === 'end') {
        // the signatures being written on a little poster
        ctx.save();
        ctx.fillStyle = MP.BAND ? MP.BAND.colorTop : '#6b4fb5';
        ctx.strokeStyle = O(); ctx.lineWidth = 1;
        ctx.fillRect(150, 30, 40, 52); ctx.strokeRect(150, 30, 40, 52);
        MP.drawText(ctx, 'TURPAPOJAT', 170, 33, { size: 0.45, color: '#ffe680', align: 'center' });
        const u = MP.clamp((t - this.endAt) / 1.5, 0, 1);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (let k = 0; k <= 20 * u; k++) { const sx = 154 + k * 1.5, sy = 62 + Math.sin(k * 1.3) * 2.5; k ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); }
        ctx.stroke();
        ctx.beginPath();
        for (let k = 0; k <= 20 * MP.clamp(u * 2 - 1, 0, 1); k++) { const sx = 156 + k * 1.4, sy = 72 + Math.cos(k * 1.1) * 2.5; k ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); }
        ctx.stroke();
        ctx.restore();
      }

      if (this.step !== 'play') MP.drawButton(ctx, '◀ Takaisin', BACK, { size: 0.75 });
      const bb = this.bubble;
      if (bb && t >= bb.from) {
        const tip = bb.who === 'band' ? [216, FLOOR - 50] : this.kitFrom != null ? [KIT_X, 86] : [160, 92];
        MP.drawBubble(ctx, bb.text, tip[0], tip[1], { maxWidth: 190, size: 0.8 });
      }
    },
  };
})();
