// pettricks.js – PET SCHOOL and the PET SHOW.
//   At home, tap the treat jar on the kitchen counter → pet school (a close-up).
//   Choose a trick (Istu, Hyppää, Kieri) and give a treat: the pet tries.
//   It needs a few tries ("Melkein!") before it learns the trick for good.
//   The cat does tricks a bit lazily (it yawns in the middle), the dog much
//   too eagerly (it spins around first).
//   Learned tricks are saved (treasures.petTricks). With at least one trick
//   learned you can hold a PET SHOW in the yard: the party friends sit on
//   chairs, you show the tricks one by one, they clap, and the pet gets a
//   rosette ribbon that hangs by its basket at home.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const TRICKS = [
    { id: 'sit', name: 'Istu', word: 'Istu!' },
    { id: 'jump', name: 'Hyppää', word: 'Hyppää!' },
    { id: 'roll', name: 'Kieri', word: 'Kieri!' },
  ];
  MP.PET_TRICKS = TRICKS;
  const TRIES = 3;              // the third try works
  const TRICK_TIME = 1.6;       // seconds for one trick
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const SHOW_BTN = { x: 226, y: 4, w: 90, h: 18 };
  const trickBtn = (i) => ({ x: 34 + i * 88, y: 150, w: 76, h: 24 });
  const PET_X = 160, PET_Y = 120;

  const learned = () => ((MP.state.treasures || {}).petTricks || {});
  MP.petKnows = () => TRICKS.filter((k) => learned()[k.id]);

  // Draws the pet doing a trick. u = 0..1 how far the trick is.
  //   ok = false: a "melkein" try (it does something a bit wrong)
  MP.drawPetTrick = function (ctx, x, y, opts, trick, u, ok) {
    const kind = opts.kind;
    const lazy = kind === 'cat';
    ctx.save();
    ctx.translate(x, y);
    let o = Object.assign({}, opts);
    // the dog spins first (too eager!), the cat yawns in the middle (lazy)
    if (!lazy && u < 0.25) o.flip = Math.floor(u * 24) % 2 === 0;
    const k = lazy ? MP.clamp((u - 0.15) / 0.85, 0, 1) : MP.clamp((u - 0.25) / 0.75, 0, 1);
    if (trick === 'sit') {
      o.sit = ok !== false || k < 0.5;
      if (ok === false && k >= 0.5) o.happy = 0.6;      // pops back up
    } else if (trick === 'jump') {
      const h = ok === false ? 5 : 22;
      ctx.translate(0, -Math.sin(k * Math.PI) * h * (opts.scale || 1));
      o.happy = 0.5;
    } else if (trick === 'roll') {
      const turn = ok === false ? Math.sin(k * Math.PI) * 1.4 : k * Math.PI * 2;
      const s = opts.scale || 1;
      ctx.translate(0, -6 * s);
      ctx.rotate(opts.flip ? -turn : turn);
      ctx.translate(0, 6 * s);
    }
    MP.drawPet(ctx, 0, 0, o);
    ctx.restore();
    // the lazy cat's yawn
    if (lazy && u > 0.02 && u < 0.2) MP.drawText(ctx, 'Haukotus…', x, y - 34 * (opts.scale || 1) / 2.2, { size: 0.7, color: '#6b4fb5', outline: '#ffffff', align: 'center' });
  };

  // ---------------------------------------------------------------------------
  // Drawing helpers
  // ---------------------------------------------------------------------------
  function treat(ctx, x, y, s) {
    // a little bone-shaped treat
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s || 1, s || 1);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = O();
    ctx.fillStyle = '#e8b878';
    ctx.fillRect(-4, -1.2, 8, 2.4);
    for (const [bx, by] of [[-4, -1.2], [-4, 1.2], [4, -1.2], [4, 1.2]]) { ctx.beginPath(); ctx.arc(bx, by, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.fillRect(-4, -1.2, 8, 2.4);
    ctx.restore();
  }

  function rosette(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = O();
    ctx.fillStyle = '#4a78c8';
    for (const dx of [-3, 3]) {
      ctx.beginPath(); ctx.moveTo(dx - 2, 2); ctx.lineTo(dx - 3, 14); ctx.lineTo(dx, 11); ctx.lineTo(dx + 3, 14); ctx.lineTo(dx + 2, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? 7 : 8.5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e04848';
    ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    MP.drawText(ctx, '1', 0, -3.2, { size: 0.6, color: '#ffffff', align: 'center' });
    ctx.restore();
  }
  MP.drawRosette = rosette;

  // the kitchen (pet school) or the yard (pet show)
  function background(ctx, yard) {
    if (yard) {
      const g = ctx.createLinearGradient(0, 0, 0, 110);
      g.addColorStop(0, '#6cc0ff'); g.addColorStop(1, '#cdeeff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, MP.W, 110);
      ctx.fillStyle = '#ffffff';
      for (const [cx, cy] of [[60, 24], [230, 34]]) { ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 7); ctx.arc(cx + 10, cy - 3, 11, 0, 7); ctx.arc(cx + 22, cy, 8, 0, 7); ctx.fill(); }
      // the fence
      ctx.fillStyle = '#f4f4f8'; ctx.strokeStyle = O(); ctx.lineWidth = 0.6;
      for (let x = 0; x < MP.W; x += 12) { ctx.beginPath(); ctx.moveTo(x + 2, 110); ctx.lineTo(x + 2, 82); ctx.lineTo(x + 6, 78); ctx.lineTo(x + 10, 82); ctx.lineTo(x + 10, 110); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.fillRect(0, 88, MP.W, 3); ctx.fillRect(0, 100, MP.W, 3);
      ctx.fillStyle = '#7cc957'; ctx.fillRect(0, 108, MP.W, 72);
      ctx.fillStyle = '#6ab447';
      for (let i = 0; i < 40; i++) ctx.fillRect((i * 53) % MP.W, 112 + (i * 31) % 60, 3, 1.5);
      // the little stage (a rug) for the pet
      ctx.fillStyle = '#e0559a';
      ctx.beginPath(); ctx.ellipse(PET_X, PET_Y + 2, 46, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // the banner
      ctx.fillStyle = '#fff7e0';
      MP.roundRect(ctx, 100, 28, 120, 20, 5); ctx.fill(); ctx.stroke();
      MP.drawText(ctx, 'LEMMIKKINÄYTTELY', 160, 33, { size: 0.85, color: '#e0559a', align: 'center' });
    } else {
      ctx.fillStyle = '#fff3d6'; ctx.fillRect(0, 0, MP.W, 130);
      ctx.fillStyle = 'rgba(224,85,154,0.15)';
      for (let x = 0; x < MP.W; x += 16) for (let y = 0; y < 130; y += 16) ctx.fillRect(x + 6, y + 6, 4, 4);
      ctx.fillStyle = '#e9d3a8'; ctx.fillRect(0, 130, MP.W, 50);
      ctx.strokeStyle = 'rgba(160,120,60,0.4)'; ctx.lineWidth = 0.6;
      for (let x = 0; x < MP.W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 130); ctx.lineTo(x, 180); ctx.stroke(); }
      ctx.fillStyle = '#c98b4f';
      ctx.beginPath(); ctx.ellipse(PET_X, PET_Y + 2, 54, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff7e0'; ctx.strokeStyle = O();
      MP.roundRect(ctx, 104, 26, 112, 18, 5); ctx.fill(); ctx.stroke();
      MP.drawText(ctx, 'LEMMIKKIKOULU', 160, 30, { size: 0.85, color: '#4a78c8', align: 'center' });
    }
  }

  MP.scenes.pettricks = {
    noRestart: true,

    enter() {
      this.mode = 'school';      // 'school' or 'show'
      this.tries = {};            // tries so far for each trick (this visit)
      this.doing = null;          // { id, from, ok }
      this.shown = {};            // tricks shown in the pet show
      this.clapFrom = -9;
      this.wonFrom = null;
      this.bubble = null;
      const pet = MP.myPet();
      if (!pet) { this.say('Ei lemmikkiä. Ensin pitää valita lemmikki!'); return; }
      this.say(MP.petKnows().length
        ? pet.name + ' osaa jo temppuja! Opetetaanko lisää, vai pidetäänkö näyttely?'
        : 'Herkkuja! Opetetaan ' + pet.name + 'lle temppuja. Valitse temppu alhaalta.');
    },

    say(text) { this.bubble = { text, from: MP.time, until: Infinity }; },

    tryTrick(id) {
      const pet = MP.myPet();
      const known = !!learned()[id];
      const n = (this.tries[id] || 0) + 1;
      this.tries[id] = n;
      const ok = known || n >= TRIES;
      this.doing = { id, from: MP.time, ok };
      this.bubble = null;
      const tr = TRICKS.find((k) => k.id === id);
      this.word = { text: tr.word, from: MP.time };
      MP.sfx.tap();
      setTimeout(() => {
        if (MP.scene !== this || !this.doing || this.doing.id !== id) return;
        this.doing = null;
        if (this.mode === 'show') {
          this.shown[id] = true;
          this.clapFrom = MP.time;
          MP.sfx.applause(1.2);
          MP.petSound();
          if (MP.petKnows().every((k) => this.shown[k.id])) this.win();
          else this.say('Taputusta! Näytä seuraava temppu.');
          return;
        }
        if (ok) {
          MP.sfx.nom();
          MP.petSound();
          if (!known) {
            MP.state.treasures = MP.state.treasures || {};
            MP.state.treasures.petTricks = Object.assign({}, learned(), { [id]: true });
            MP.save();
            MP.sfx.bling();
            this.say('Jee! ' + pet.name + ' oppi tempun "' + tr.name + '"! Herkku palkaksi. Nam!');
          } else {
            this.say('Hienosti! ' + pet.name + ' osaa tämän jo. Nam, herkku!');
          }
        } else {
          this.say(n === 1 ? 'Melkein! Yritetään uudestaan.' : 'Melkein! Vielä kerran, kohta se osaa!');
        }
      }, TRICK_TIME * 1000);
    },

    win() {
      const pet = MP.myPet();
      this.wonFrom = MP.time;
      MP.state.treasures = MP.state.treasures || {};
      const first = !MP.state.treasures.rosette;
      MP.state.treasures.rosette = true;
      MP.save();
      MP.sfx.tune();
      this.say(pet.name + ' voitti näyttelyn! ' + (first ? 'Ruusuke ripustetaan kotona korin viereen.' : 'Taas voitto! Hieno ' + pet.name + '!'));
    },

    onTap(x, y) {
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        if (this.mode === 'show') { this.mode = 'school'; this.say('Takaisin lemmikkikouluun.'); return; }
        MP.goTo(MP.scenes.home);
        return;
      }
      if (!MP.myPet() || this.doing) return;
      if (this.mode === 'school' && MP.petKnows().length && MP.hit(SHOW_BTN, x, y)) {
        this.mode = 'show';
        this.shown = {};
        this.wonFrom = null;
        MP.sfx.bling();
        this.say('Lemmikkinäyttely pihalla! Aino, Leo ja Siiri katsovat. Näytä opitut temput!');
        return;
      }
      const list = this.mode === 'show' ? MP.petKnows() : TRICKS;
      list.forEach((k, i) => {
        if (MP.hit(trickBtn(i), x, y) && !(this.mode === 'show' && this.shown[k.id])) this.tryTrick(k.id);
      });
    },

    update() {},

    draw(ctx) {
      const t = MP.time;
      const show = this.mode === 'show';
      background(ctx, show);
      const pet = MP.myPet();

      // the friends on chairs (pet show)
      if (show) {
        const F = MP.PARTY_FRIENDS || [];
        const clap = t - this.clapFrom < 1.4 || this.wonFrom != null;
        F.forEach((f, i) => {
          const fx = [40, 82, 280][i] || 40 + i * 40;
          ctx.fillStyle = '#c98b4f'; ctx.strokeStyle = O(); ctx.lineWidth = 0.7;
          ctx.fillRect(fx - 9, 128, 18, 4); ctx.strokeRect(fx - 9, 128, 18, 4);
          ctx.fillRect(fx - 8, 132, 2, 14); ctx.fillRect(fx + 6, 132, 2, 14);
          const outfit = Object.assign({}, f.outfit, { hat: 'none' });
          MP.drawPerson(ctx, fx, 134 - (clap ? Math.abs(Math.sin(t * 10 + i)) * 2 : 0), {
            character: f.character, hair: f.hair, outfit, sit: true, flip: fx > PET_X,
            mouth: clap ? 'open' : 'smile', armUp: clap ? (Math.sin(t * 16 + i) > 0 ? 0.9 : 0.5) : 0,
          });
          if (clap && Math.sin(t * 16 + i) > 0.7) MP.drawText(ctx, 'läps!', fx, 84, { size: 0.55, color: '#e0559a', outline: '#ffffff', align: 'center' });
        });
      }

      // me, with a treat in my hand
      MP.drawPerson(ctx, 226, 150, { hero: true, flip: true, armUp: this.doing ? 0.7 : 0.2, mouth: 'smile' });
      if (!show || this.doing) treat(ctx, 214, 118 - (this.doing ? 6 : 0), 1.2);

      // the pet
      if (pet) {
        const S = 2.2;
        const opts = { kind: pet.kind, scale: S, flip: false };
        const d = this.doing;
        if (d) {
          MP.drawPetTrick(ctx, PET_X - 10, PET_Y, opts, d.id, MP.clamp((t - d.from) / TRICK_TIME, 0, 1), d.ok);
        } else {
          MP.drawPet(ctx, PET_X - 10, PET_Y, Object.assign(opts, { sit: !this.wonFrom, happy: this.wonFrom ? 0.7 : 0 }));
        }
        if (show && this.wonFrom != null) rosette(ctx, PET_X - 10, PET_Y - 52, 1.2);
        if (this.word && t - this.word.from < 1) MP.drawText(ctx, this.word.text, 200, 64, { size: 1, color: '#e0559a', outline: '#ffffff', align: 'center' });
      }

      // the trick buttons (with a star for the ones learned / a tick for the ones shown)
      if (pet && !(show && this.wonFrom != null)) {
        const list = show ? MP.petKnows() : TRICKS;
        list.forEach((k, i) => {
          const r = trickBtn(i);
          const done = show && this.shown[k.id];
          const star = !show && learned()[k.id];
          MP.drawButton(ctx, (star ? '★ ' : done ? '✓ ' : '') + k.name, r, {
            size: 0.85, color: done ? '#9aa5b8' : show ? '#4cc9f0' : '#ffb02e', shade: done ? '#6b7486' : show ? '#2a8fb5' : '#c97a10',
          });
          if (!show && !star && this.tries[k.id]) {
            MP.drawText(ctx, '●'.repeat(this.tries[k.id]) + '○'.repeat(Math.max(0, TRIES - this.tries[k.id])), r.x + r.w / 2, r.y - 10, { size: 0.8, color: '#6b4fb5', align: 'center' });
          }
        });
      }

      MP.drawButton(ctx, '◀ Takaisin', BACK, { size: 0.75 });
      if (!show && pet && MP.petKnows().length) MP.drawButton(ctx, 'Näyttely!', SHOW_BTN, { size: 0.8, color: '#e0559a', shade: '#a8326c' });
      const b = this.bubble;
      if (b) MP.drawBubble(ctx, b.text, 226, 92, { maxWidth: 170, size: 0.8 });
    },
  };
})();
