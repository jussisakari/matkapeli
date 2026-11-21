// school.js – THE SCHOOL next to the taxi station: a classroom and a math lesson.
// The teacher writes an easy question on the blackboard; tap one of the three
// big answer buttons.
//   Kinds of questions: adding and taking away (up to 10, later up to 20),
//   counting apples, "which is bigger?" and the missing number (2, 4, 6, ?).
//   A right answer: a star, "Hienoa!", and the class hamster runs faster in its
//   wheel. A wrong answer: "Melkein! Kokeillaan uudestaan" – the same question again.
//   After 5 questions the bell rings: RIIIING! Break time, and a gold star
//   goes into your notebook (saved). The hamster falls asleep.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const FLOOR = 158;
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const BOARD = { x: 70, y: 18, w: 180, h: 82 };
  const ANS = (i) => ({ x: 64 + i * 66, y: 112, w: 58, h: 32 });
  const QUESTIONS = 5;
  const HAMSTER = { x: 288, y: 120 };

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  // a new question: { kind, text, answer, choices[3], apples? }
  function makeQuestion(level, lastKind) {
    const kinds = ['plus', 'minus', 'count', 'bigger', 'missing'].filter((k) => k !== lastKind);
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const max = level > 2 ? 20 : 10;
    let text, answer, apples = 0;
    if (kind === 'plus') {
      const a = rnd(1, max - 2), b = rnd(1, max - a);
      text = a + ' + ' + b + ' = ?'; answer = a + b;
    } else if (kind === 'minus') {
      const a = rnd(3, max), b = rnd(1, a - 1);
      text = a + ' − ' + b + ' = ?'; answer = a - b;
    } else if (kind === 'count') {
      apples = rnd(3, 9);
      text = 'Montako omenaa?'; answer = apples;
    } else if (kind === 'bigger') {
      const a = rnd(1, max);
      let b = rnd(1, max);
      while (b === a) b = rnd(1, max);
      text = 'Kumpi on isompi, ' + a + ' vai ' + b + '?';
      answer = Math.max(a, b);
      return { kind, text, answer, choices: [a, b, Math.min(a, b) === 1 ? Math.max(a, b) + 1 : Math.min(a, b) - 1].sort(() => Math.random() - 0.5), apples };
    } else {
      const step = rnd(1, 3), start = rnd(0, 4);
      const seq = [start, start + step, start + step * 2];
      text = seq.join(', ') + ', ?';
      answer = start + step * 3;
    }
    // two wrong answers close to the right one
    const set = new Set([answer]);
    while (set.size < 3) {
      const w = answer + rnd(-3, 3);
      if (w >= 0 && w !== answer) set.add(w);
    }
    return { kind, text, answer, choices: [...set].sort(() => Math.random() - 0.5), apples };
  }

  MP.scenes.school = {
    noRestart: true,

    enter() {
      this.n = 0;
      this.right = 0;
      this.q = null;
      this.wheel = 0;
      this.speed = 1;
      this.feedback = null;      // { ok, at, i }
      this.bellAt = null;
      this.bubble = null;
      this.startAt = MP.time;
      this.say('Opettaja: Tervetuloa kouluun! Nyt on matikkatunti. Mikä on oikea vastaus?');
      this.next();
    },

    say(text) {
      this.bubble = { text, from: MP.time, until: Infinity };
    },

    next() {
      this.q = makeQuestion(this.right, this.q && this.q.kind);
      this.feedback = null;
    },

    onTap(x, y) {
      const t = MP.time;
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.street, { from: 'school' });
        return;
      }
      if (this.bellAt) return;
      if (this.feedback && this.feedback.ok) return;      // the next question is coming
      for (let i = 0; i < 3; i++) {
        if (!MP.hit(ANS(i), x, y)) continue;
        const ok = this.q.choices[i] === this.q.answer;
        this.feedback = { ok, at: t, i };
        if (ok) {
          this.right++;
          this.speed = 1 + this.right * 1.2;
          MP.sfx.bling();
          this.bubble = null;
          this.feedback.text = ['Hienoa!', 'Oikein!', 'Mahtavaa!', 'Huippua!', 'Hienosti laskettu!'][this.right % 5];
          setTimeout(() => {
            if (MP.scene !== this) return;
            if (this.right >= QUESTIONS) this.ring();
            else this.next();
          }, 1300);
        } else {
          MP.sfx.boing();
          this.bubble = null;
          this.feedback.text = 'Melkein! Kokeillaan uudestaan.';
        }
        return;
      }
    },

    ring() {
      this.bellAt = MP.time;
      const tr = (MP.state.treasures = MP.state.treasures || {});
      tr.schoolStars = (tr.schoolStars || 0) + 1;
      MP.save();
      for (let i = 0; i < 8; i++) setTimeout(() => MP.sfx.note(1400 + (i % 2) * 200, 0.08, 'square', 0.08), i * 90);
      this.say('RIIIING! Välitunti! Sait kultaisen tähden vihkoon – tähtiä on nyt ' + tr.schoolStars + '!');
    },

    update(dt) {
      const sleeping = this.bellAt && MP.time - this.bellAt > 2;
      this.wheel += dt * (sleeping ? 0 : this.speed * 2.5);
    },

    draw(ctx) {
      const t = MP.time;
      // the classroom wall and floor
      ctx.fillStyle = '#e6f0d8';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = '#c8a878';
      ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      // children's drawings on the wall
      const pics = [['#ffd23f', 'sun'], ['#7bd389', 'tree'], ['#ff8fc0', 'cat']];
      pics.forEach(([col, kind], i) => {
        const x = 8 + i * 0, y = 30 + i * 30;
        ctx.save();
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = O(); ctx.lineWidth = 0.6;
        ctx.fillRect(x, y, 26, 22); ctx.strokeRect(x, y, 26, 22);
        ctx.fillStyle = col;
        if (kind === 'sun') { ctx.beginPath(); ctx.arc(x + 13, y + 11, 5, 0, Math.PI * 2); ctx.fill(); }
        if (kind === 'tree') { ctx.fillRect(x + 12, y + 12, 2, 8); ctx.beginPath(); ctx.arc(x + 13, y + 9, 6, 0, Math.PI * 2); ctx.fill(); }
        if (kind === 'cat') { ctx.beginPath(); ctx.arc(x + 13, y + 12, 5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 9, y + 9); ctx.lineTo(x + 9, y + 4); ctx.lineTo(x + 12, y + 8); ctx.moveTo(x + 17, y + 9); ctx.lineTo(x + 17, y + 4); ctx.lineTo(x + 14, y + 8); ctx.fill(); }
        ctx.restore();
      });
      // the clock and the globe
      ctx.save();
      ctx.lineWidth = 0.8; ctx.strokeStyle = O();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(290, 26, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(290, 26); ctx.lineTo(290 + Math.sin(t * 0.3) * 6, 26 - Math.cos(t * 0.3) * 6); ctx.moveTo(290, 26); ctx.lineTo(294, 26); ctx.stroke();
      ctx.fillStyle = '#8a5a32'; ctx.fillRect(262, 84, 6, 10);
      ctx.fillStyle = '#4a9be0'; ctx.beginPath(); ctx.arc(265, 74, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7bd389'; ctx.beginPath(); ctx.ellipse(262 + Math.sin(t) * 3, 72, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // the blackboard with the question
      ctx.save();
      ctx.fillStyle = '#8a5a32';
      ctx.fillRect(BOARD.x - 4, BOARD.y - 4, BOARD.w + 8, BOARD.h + 8);
      ctx.fillStyle = '#2f5a3f';
      ctx.fillRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h);
      ctx.restore();
      const q = this.q;
      if (this.bellAt) {
        MP.drawText(ctx, 'VÄLITUNTI!', 160, 38, { size: 2, color: '#ffffff', align: 'center' });
        MP.drawText(ctx, '★', 160, 64, { size: 2, color: '#ffd23f', align: 'center' });
      } else if (q) {
        MP.drawText(ctx, q.text, 160, q.kind === 'count' ? 22 : 44, { size: q.text.length > 18 ? 1.1 : 1.7, color: '#ffffff', align: 'center' });
        if (q.kind === 'count') {
          for (let i = 0; i < q.apples; i++) {
            const ax = 100 + (i % 5) * 30, ay = 58 + Math.floor(i / 5) * 22;
            MP.draw('apple', ctx, ax, ay, { scale: 1.3 });
          }
        }
      }
      // stars for the right answers
      for (let i = 0; i < QUESTIONS; i++) {
        MP.drawText(ctx, '★', 92 + i * 34, 88, { size: 1, color: i < this.right ? '#ffd23f' : 'rgba(255,255,255,0.25)', align: 'center' });
      }

      // the answer buttons
      if (q && !this.bellAt) {
        q.choices.forEach((c, i) => {
          const fb = this.feedback && this.feedback.i === i ? this.feedback : null;
          const shake = fb && !fb.ok && t - fb.at < 0.4 ? Math.sin((t - fb.at) * 50) * 2 : 0;
          const r = ANS(i);
          MP.drawButton(ctx, String(c), { x: r.x + shake, y: r.y, w: r.w, h: r.h }, {
            size: 1.6,
            color: fb ? (fb.ok ? '#3cb371' : '#e04848') : ['#4a78c8', '#e0559a', '#e07a3a'][i],
            shade: fb ? (fb.ok ? '#2a8a52' : '#a83232') : ['#2f4a8a', '#a8326c', '#a8552a'][i],
          });
        });
      }

      // the teacher's words over the buttons
      const fb = this.feedback;
      if (fb && fb.text && !this.bellAt) MP.drawText(ctx, fb.text, 160, 100 - Math.min(1, (t - fb.at) * 4) * 4, { size: 0.9, color: fb.ok ? '#2a8a52' : '#c0392b', outline: '#ffffff', align: 'center' });

      // the teacher (left) and me at my desk (right)
      MP.drawPerson(ctx, 44, FLOOR, { character: 'girl', hair: '#4a3020', scale: 1.3, noBow: true, glasses: true,
        outfit: { shirt: 'sailor', bottom: 'skirtPurple', hat: 'none', costume: 'none', shoes: false },
        mouth: 'smile', armUp: this.feedback && this.feedback.ok && t - this.feedback.at < 1 ? 0.8 : 0.3 });
      ctx.save();
      ctx.lineWidth = 0.8; ctx.strokeStyle = O();
      ctx.fillStyle = '#c98a55';
      ctx.fillRect(214, 150, 50, 4); ctx.strokeRect(214, 150, 50, 4);
      ctx.fillRect(218, 154, 3, FLOOR - 154 + 14); ctx.fillRect(257, 154, 3, FLOOR - 154 + 14);
      ctx.restore();
      MP.drawPerson(ctx, 240, 168, { hero: true, sit: true, flip: true, mouth: this.feedback && this.feedback.ok ? 'open' : 'smile' });

      // the class hamster in its cage, running in its wheel
      ctx.save();
      const h = HAMSTER;
      ctx.lineWidth = 0.8; ctx.strokeStyle = O();
      ctx.fillStyle = '#f4efe6'; ctx.fillRect(h.x - 26, h.y + 10, 52, 6); ctx.strokeRect(h.x - 26, h.y + 10, 52, 6);
      ctx.strokeStyle = '#8a93a6';
      for (let x = h.x - 24; x <= h.x + 24; x += 4) { ctx.beginPath(); ctx.moveTo(x, h.y - 18); ctx.lineTo(x, h.y + 10); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(h.x - 26, h.y - 18); ctx.lineTo(h.x + 26, h.y - 18); ctx.stroke();
      // the wheel
      ctx.strokeStyle = '#4a78c8'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(h.x - 6, h.y - 2, 11, 0, Math.PI * 2); ctx.stroke();
      for (let k = 0; k < 6; k++) {
        const a = this.wheel + k * Math.PI / 3;
        ctx.beginPath(); ctx.moveTo(h.x - 6, h.y - 2); ctx.lineTo(h.x - 6 + Math.cos(a) * 11, h.y - 2 + Math.sin(a) * 11); ctx.stroke();
      }
      const sleeping = this.bellAt && t - this.bellAt > 2;
      ctx.fillStyle = '#e0a060'; ctx.strokeStyle = O(); ctx.lineWidth = 0.7;
      if (sleeping) {
        ctx.beginPath(); ctx.ellipse(h.x + 14, h.y + 6, 7, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        MP.drawText(ctx, 'z z', h.x + 16, h.y - 12 - (t * 4) % 4, { size: 0.6, color: '#4a78c8', align: 'center' });
      } else {
        const bob = Math.abs(Math.sin(t * this.speed * 6)) * 1.5;
        ctx.beginPath(); ctx.ellipse(h.x - 6, h.y + 5 - bob, 5.5, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(h.x - 3, h.y + 6 - bob, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = O(); ctx.beginPath(); ctx.arc(h.x - 2, h.y + 3 - bob, 0.7, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      MP.drawButton(ctx, '◀ Ulos', BACK, { size: 0.8 });
      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, 50, 100, { maxWidth: 150, size: 0.8 });
      if (this.bellAt && t - this.bellAt < 4) MP.drawConfetti(ctx, t - this.bellAt, 40);
    },
  };
})();
