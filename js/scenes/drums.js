// drums.js – THE DRUM KIT upstairs at home (on the landing at the top of the stairs).
// A close-up of the drums: bass drum, snare, two toms, hi-hat and a cymbal.
//   Free play: tap any drum – each has its own sound, and it bounces and sparkles.
//   Soita mukana: the drums light up one by one in a beat – tap the lit one!
//   (Like the Turpapojat concert.)
//   Too loud for too long? Mom or dad shouts from downstairs "Hiljempaa!" and
//   the pet runs to hide. In the evening it is too late for drums.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const MODE = { x: 236, y: 4, w: 80, h: 18 };
  // the drums: x, y = the middle of the top, r = size
  const DRUMS = [
    { id: 'hat', name: 'Hi-hat', x: 58, y: 70, rx: 24, ry: 6, color: '#e8c45a', metal: true },
    { id: 'snare', name: 'Virveli', x: 104, y: 110, rx: 26, ry: 9, color: '#f4f4f8' },
    { id: 'tom1', name: 'Tomi', x: 136, y: 72, rx: 20, ry: 8, color: '#f4f4f8' },
    { id: 'tom2', name: 'Tomi', x: 186, y: 72, rx: 20, ry: 8, color: '#f4f4f8' },
    { id: 'kick', name: 'Bassorumpu', x: 160, y: 128, rx: 34, ry: 34, color: '#e04848', front: true },
    { id: 'cymbal', name: 'Pelti', x: 252, y: 58, rx: 30, ry: 7, color: '#e8c45a', metal: true },
  ];
  const BEAT = 0.55;
  const PATTERN = ['kick', 'hat', 'snare', 'hat', 'kick', 'tom1', 'snare', 'cymbal', 'kick', 'hat', 'snare', 'tom2'];

  function hitDrum(d) {
    if (d.id === 'kick') MP.sfx.kick();
    else if (d.id === 'snare') MP.sfx.hat(true);
    else if (d.id === 'hat') MP.sfx.hat(false);
    else if (d.id === 'tom1') MP.sfx.note(196, 0.25, 'sine', 0.3);
    else if (d.id === 'tom2') MP.sfx.note(147, 0.3, 'sine', 0.3);
    else { MP.sfx.hat(true); MP.sfx.note(2400, 0.4, 'triangle', 0.03); }
  }

  MP.scenes.drums = {
    noRestart: true,

    enter() {
      this.hitAt = {};
      this.hits = [];           // times of the last hits (to see if it is too loud)
      this.mode = 'free';
      this.along = null;
      this.parentAt = -99;
      this.sparks = [];
      this.bubble = null;
      this.late = !!MP.state.evening;
      this.say(this.late ? 'Nyt on liian myöhä rumpuja varten! Soitetaan huomenna. Shh…'
        : 'Rummut! Napauta rumpuja, niin ne soivat. Kokeile myös "Soita mukana".');
    },

    say(text, who) {
      this.bubble = { text, from: MP.time, until: Infinity, who: who || 'me' };
    },

    onTap(x, y) {
      const t = MP.time;
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.home);
        return;
      }
      if (this.late) { this.say('Shh! Kaikki nukkuvat kohta. Rummut huomenna!'); return; }
      if (MP.hit(MODE, x, y)) {
        if (this.mode === 'free') {
          this.mode = 'along';
          this.along = { from: t + 1, score: 0, done: false, hit: {} };
          this.say('Soita mukana! Napauta rumpua, joka syttyy.');
        } else {
          this.mode = 'free';
          this.along = null;
          this.say('Vapaa soitto!');
        }
        MP.sfx.tap();
        return;
      }
      for (let i = DRUMS.length - 1; i >= 0; i--) {
        const d = DRUMS[i];
        const inside = ((x - d.x) / (d.rx + 4)) ** 2 + ((y - d.y) / (d.ry + (d.front ? 4 : 12))) ** 2 <= 1;
        if (!inside) continue;
        hitDrum(d);
        this.hitAt[d.id] = t;
        for (let k = 0; k < 5; k++) this.sparks.push({ x: d.x, y: d.y, a: Math.random() * Math.PI * 2, born: t, c: ['#ffd23f', '#ff5d8f', '#4cc9f0'][k % 3] });
        this.hits.push(t);
        // play along: the lit drum?
        const al = this.along;
        if (al) {
          const n = Math.floor((t - al.from + BEAT / 2) / BEAT);
          if (n >= 0 && n < PATTERN.length && PATTERN[n] === d.id && !al.hit[n]) {
            al.hit[n] = true;
            al.score++;
          }
        }
        return;
      }
    },

    update() {
      const t = MP.time;
      this.hits = this.hits.filter((h) => t - h < 6);
      // too loud for too long: mom or dad shouts from downstairs, the pet hides
      if (this.hits.length > 26 && t - this.parentAt > 12) {
        this.parentAt = t;
        const who = Math.random() < 0.5 ? 'mom' : 'dad';
        this.say((MP.PARENTS[who].name) + ' huutaa alakerrasta: HILJEMPAA! ' + (MP.myPet && MP.myPet() ? MP.myPet().name + ' meni piiloon sängyn alle!' : ''), 'parent');
      }
      this.sparks = this.sparks.filter((s) => t - s.born < 0.6);
      const al = this.along;
      if (al && !al.done && t - al.from > PATTERN.length * BEAT + 0.5) {
        al.done = true;
        MP.sfx.applause(1.5);
        const n = al.score;
        this.say(n >= 10 ? 'Super! ' + n + ' / ' + PATTERN.length + '. Olet oikea rumpali!' : n >= 6 ? 'Hyvä! ' + n + ' / ' + PATTERN.length + '. Vielä kerran?' : n + ' / ' + PATTERN.length + '. Harjoitus tekee mestarin!');
        setTimeout(() => { if (MP.scene === this && this.mode === 'along') { this.mode = 'free'; this.along = null; } }, 2500);
      }
    },

    draw(ctx) {
      const t = MP.time;
      // the landing wall and a rug
      ctx.fillStyle = '#e6ecf6';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(160,180,220,0.25)';
      for (let x = 0; x < MP.W; x += 12) for (let y = 0; y < 150; y += 12) if ((x + y) % 24 === 0) ctx.fillRect(x + 5, y + 5, 2, 2);
      ctx.fillStyle = '#c98a55';
      ctx.fillRect(0, 150, MP.W, 30);
      ctx.fillStyle = '#4a78c8';
      ctx.beginPath(); ctx.ellipse(160, 160, 130, 12, 0, 0, Math.PI * 2); ctx.fill();
      // the drummer (me) behind the kit
      MP.drawPerson(ctx, 160, 100, { hero: true, sit: true, scale: 1.5, armUp: this.hits.length && t - this.hits[this.hits.length - 1] < 0.15 ? 0.9 : 0.4, mouth: 'smile' });
      // the stands
      ctx.save();
      ctx.strokeStyle = '#8a93a6'; ctx.lineWidth = 2;
      for (const d of DRUMS) if (!d.front) { ctx.beginPath(); ctx.moveTo(d.x, d.y + 4); ctx.lineTo(d.x, 150); ctx.stroke(); }
      ctx.restore();
      // the drums (they bounce when hit, and light up in play-along)
      const al = this.along;
      const lit = al && !al.done ? Math.floor((t - al.from + BEAT / 2) / BEAT) : -1;
      for (const d of DRUMS) {
        const since = t - (this.hitAt[d.id] || -9);
        const bounce = since < 0.2 ? Math.sin(since / 0.2 * Math.PI) * 4 : 0;
        const on = lit >= 0 && lit < PATTERN.length && PATTERN[lit] === d.id;
        ctx.save();
        ctx.translate(d.x, d.y + bounce);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = O();
        if (on) { ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 14; }
        if (d.front) {
          // the big bass drum, seen from the front
          ctx.fillStyle = d.color;
          ctx.beginPath(); ctx.arc(0, 0, d.rx, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, d.rx - 6, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          MP.drawText(ctx, 'TURPA', 0, -9, { size: 1, color: '#e04848', align: 'center' });
          MP.drawText(ctx, 'POJAT', 0, 1, { size: 1, color: '#e04848', align: 'center' });
        } else if (d.metal) {
          ctx.rotate(Math.sin(since * 30) * (since < 0.6 ? 0.12 * (1 - since / 0.6) : 0));
          ctx.fillStyle = d.color;
          ctx.beginPath(); ctx.ellipse(0, 0, d.rx, d.ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(160,120,30,0.6)';
          ctx.beginPath(); ctx.ellipse(0, 0, d.rx * 0.6, d.ry * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
        } else {
          ctx.fillStyle = '#e04848';
          ctx.fillRect(-d.rx, 0, d.rx * 2, d.ry * 2 + 6); ctx.strokeRect(-d.rx, 0, d.rx * 2, d.ry * 2 + 6);
          ctx.fillStyle = d.color;
          ctx.beginPath(); ctx.ellipse(0, 0, d.rx, d.ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
        if (on) MP.draw('arrow', ctx, d.x, d.y - (d.front ? d.rx : d.ry) - 14 + Math.sin(t * 10) * 2);
      }
      // sticks and sparkles
      for (const s of this.sparks) {
        const u = (t - s.born) / 0.6;
        ctx.fillStyle = s.c;
        ctx.beginPath(); ctx.arc(s.x + Math.cos(s.a) * u * 22, s.y + Math.sin(s.a) * u * 14 - 6, 2 * (1 - u) + 0.5, 0, Math.PI * 2); ctx.fill();
      }
      if (this.along && !this.along.done) MP.drawText(ctx, '★ ' + this.along.score, 160, 6, { size: 0.9, color: '#ffd23f', outline: O(), align: 'center' });
      MP.drawButton(ctx, '◀ Takaisin', BACK, { size: 0.75 });
      if (!this.late) MP.drawButton(ctx, this.mode === 'free' ? 'Soita mukana' : 'Vapaa soitto', MODE, { size: 0.65, color: '#e0559a', shade: '#a8326c' });
      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, b.who === 'parent' ? 160 : 160, b.who === 'parent' ? 176 : 40, { maxWidth: 200, size: 0.8 });
    },
  };
})();
