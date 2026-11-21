// party.js – BIRTHDAY PARTY at home! It starts from the birthday cake button
// that shows for a few seconds every morning (home.js).
//   1. Decorate the living room: tap the dotted places for balloons,
//      a garland and the "Hyvää syntymäpäivää!" banner.
//   2. Ding-dong! Three friends come in with party hats.
//   3. Mom or dad brings the cake: choose how old you are (7 for Ella!).
//   4. Blow out the candles: tap the flames (or swipe over them).
//   5. Open the presents: tap a present to shake it, tap again to tear the paper.
//      Inside: a crown, a party hat or a party shirt (saved, in the wardrobe).
//   6. Everybody sings "Paljon onnea vaan" and confetti falls.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const FLOOR = 160;
  const BACK = { x: 236, y: 4, w: 80, h: 20 };
  const DECOR = [
    { id: 'garland', x: 160, y: 22, w: 230, h: 18, say: 'Viiri-nauha!' },
    { id: 'banner', x: 160, y: 50, w: 150, h: 22, say: 'Hyvää syntymäpäivää -kyltti!' },
    { id: 'balloons', x: 40, y: 70, w: 50, h: 60, say: 'Ilmapalloja!' },
    { id: 'balloons2', x: 282, y: 70, w: 50, h: 60, say: 'Lisää ilmapalloja!' },
  ];
  const decoRect = (d) => ({ x: d.x - d.w / 2, y: d.y - d.h / 2, w: d.w, h: d.h });
  const FRIENDS = [
    { name: 'Aino', character: 'girl', hair: '#e3b04b', outfit: { shirt: 'yellow', bottom: 'skirtPink', hat: 'partyHat', costume: 'none', shoes: false }, x: 78 },
    { name: 'Leo', character: 'boy', hair: '#2b1d14', outfit: { shirt: 'green', bottom: 'jeans', hat: 'partyHat', costume: 'none', shoes: false }, x: 112 },
    { name: 'Siiri', character: 'girl', hair: '#c0502a', outfit: { shirt: 'tshirt', bottom: 'shorts', hat: 'partyHat', costume: 'none', shoes: false }, x: 236 },
  ];
  MP.PARTY_FRIENDS = FRIENDS;     // they come to the pet show too (pettricks.js)
  const DOOR_X = 16;
  const ME_X = 270;
  const TABLE_X = 170;
  const AGE_MINUS = { x: 112, y: 92, w: 26, h: 26 };
  const AGE_PLUS = { x: 182, y: 92, w: 26, h: 26 };
  const AGE_OK = { x: 124, y: 126, w: 72, h: 22 };
  const BIG_CAKE = { x: 160, y: 150, w: 150, h: 54 };
  const GIFTS = [
    { x: 92, color: '#ff5d8f', ribbon: '#ffd23f' },
    { x: 160, color: '#4cc9f0', ribbon: '#ff5d8f' },
    { x: 228, color: '#7bd389', ribbon: '#b388ff' },
  ];
  const GIFT_Y = 177;
  // what can be inside (each only once – then candy)
  const PRESENTS = [
    { tab: 'hat', id: 'crown', name: 'Kruunu' },
    { tab: 'hat', id: 'partyHat', name: 'Juhlahattu' },
    { tab: 'shirt', id: 'party', name: 'Juhlapaita' },
  ];
  // "Paljon onnea vaan" (Happy Birthday) – note, beats
  const SONG = [
    ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
    ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
    ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
    ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2.5],
  ];
  const BEAT = 0.42;
  const FREQ = { G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784 };

  const gifts = () => {
    MP.state.treasures = MP.state.treasures || {};
    return (MP.state.treasures.gifts = MP.state.treasures.gifts || {});
  };

  MP.scenes.party = {
    noRestart: true,

    enter() {
      this.step = 'decorate';
      this.decor = {};
      this.who = Math.random() < 0.5 ? 'mom' : 'dad';
      this.friendsFrom = null;
      this.age = 7;
      this.candles = [];
      this.giftState = GIFTS.map(() => ({ shake: -9, open: false, at: 0, present: null }));
      this.songFrom = null;
      this.bubble = null;
      this.confettiFrom = null;
      MP.sfx.bling();
      this.say('Hyvää syntymäpäivää minulle! Koristellaan olohuone. Napauta pisteviivoja.');
    },

    say(text, x, y) {
      this.bubble = { text, from: MP.time, until: Infinity, x: x == null ? ME_X : x, y: y == null ? 104 : y };
    },

    candleList(n) {
      const list = [];
      const w = Math.min(120, n * 14);
      for (let i = 0; i < n; i++) {
        const row = n > 8 && i % 2 ? 1 : 0;
        list.push({ x: BIG_CAKE.x - w / 2 + (n === 1 ? w / 2 : i * w / (n - 1)), y: BIG_CAKE.y - BIG_CAKE.h - 2 + row * 6, out: null, color: i % 4 });
      }
      return list;
    },

    blow(c) {
      if (c.out) return;
      c.out = MP.time;
      MP.sfx.tap();
      if (this.candles.every((k) => k.out)) {
        this.step = 'wish';
        this.confettiFrom = MP.time;
        MP.sfx.applause(2.5);
        this.say('Kaikki kynttilät sammuivat! Toivo jotain hienoa…', ME_X, 60);
        setTimeout(() => {
          if (MP.scene !== this) return;
          this.step = 'gifts';
          this.say('Lahjoja! Napauta lahjaa – ja napauta uudestaan, niin paperi repeää!', ME_X, 60);
        }, 3500);
      }
    },

    openGift(i) {
      const g = this.giftState[i];
      if (g.open) return;
      if (MP.time - g.shake > 0.6 && !g.shaken) {
        g.shake = MP.time;
        g.shaken = true;
        MP.sfx.boing();
        return;
      }
      g.open = true;
      g.at = MP.time;
      const own = gifts();
      const p = PRESENTS.find((pr) => !own[pr.id] && !this.giftState.some((o) => o.present === pr));
      g.present = p || { tab: null, id: 'candy', name: 'Karkkipussi' };
      if (p) { own[p.id] = true; MP.save(); }
      MP.sfx.bling();
      this.say(p ? 'Jee, ' + p.name.toLowerCase() + '! Se on nyt vaatekaapissa.' : 'Karkkipussi! Nam nam!', GIFTS[i].x, 104);
      if (this.giftState.every((o) => o.open)) {
        setTimeout(() => {
          if (MP.scene !== this) return;
          this.step = 'song';
          this.songFrom = MP.time + 0.6;
          this.confettiFrom = MP.time;
          this.playSong();
          this.say('Kaikki laulavat!', 160, 70);
        }, 2200);
      }
    },

    playSong() {
      let t = 0;
      SONG.forEach(([n, beats]) => {
        setTimeout(() => { if (MP.scene === this) MP.sfx.note(FREQ[n], beats * BEAT * 0.95, 'triangle', 0.16); }, (0.6 + t) * 1000);
        t += beats * BEAT;
      });
      this.songLen = t + 0.6;
    },

    onTap(x, y) {
      if (MP.hit(BACK, x, y) && (this.step !== 'song' || MP.time - this.songFrom > this.songLen)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.home);
        return;
      }
      if (this.step === 'decorate') {
        for (const d of DECOR) {
          if (!this.decor[d.id] && MP.hit(decoRect(d), x, y)) {
            this.decor[d.id] = MP.time;
            MP.sfx.boing();
            this.say(d.say);
            if (DECOR.every((k) => this.decor[k.id])) {
              setTimeout(() => {
                if (MP.scene !== this) return;
                this.step = 'guests';
                this.friendsFrom = MP.time + 1;
                MP.sfx.note(660, 0.35, 'sine', 0.2);
                setTimeout(() => MP.sfx.note(523, 0.5, 'sine', 0.2), 380);
                this.say('Ding-dong! Ovikello! Vieraat tulevat!');
              }, 900);
            }
            return;
          }
        }
        return;
      }
      if (this.step === 'age') {
        if (MP.hit(AGE_MINUS, x, y)) { this.age = Math.max(1, this.age - 1); MP.sfx.tap(); }
        if (MP.hit(AGE_PLUS, x, y)) { this.age = Math.min(12, this.age + 1); MP.sfx.tap(); }
        if (MP.hit(AGE_OK, x, y)) {
          this.step = 'candles';
          this.candles = this.candleList(this.age);
          MP.sfx.bling();
          this.say('Puhalla kynttilät! Napauta liekkejä – tai pyyhkäise niiden yli.', ME_X, 40);
        }
        return;
      }
      if (this.step === 'candles') {
        for (const c of this.candles) if (Math.abs(x - c.x) < 7 && y > c.y - 26 && y < c.y + 4) this.blow(c);
        return;
      }
      if (this.step === 'gifts') {
        GIFTS.forEach((g, i) => { if (Math.abs(x - g.x) < 22 && y > GIFT_Y - 38 && y < GIFT_Y + 6) this.openGift(i); });
      }
    },

    // swiping over the flames blows them out too
    onPointerMove(x, y) {
      if (this.step !== 'candles' || !MP.pointer.down) return;
      for (const c of this.candles) if (Math.abs(x - c.x) < 5 && y > c.y - 24 && y < c.y) this.blow(c);
    },

    update() {
      if (this.step === 'guests' && this.friendsFrom != null && MP.time - this.friendsFrom > 4.5) {
        this.step = 'cakeIn';
        this.cakeFrom = MP.time;
        this.say('Nyt tulee kakku!', TABLE_X, 70);
      }
      if (this.step === 'cakeIn' && MP.time - this.cakeFrom > 2.6) {
        this.step = 'age';
        this.say('Monesko syntymäpäivä? Valitse ikä.', 160, 44);
      }
    },

    // ---------------------------------------------------------------------------
    draw(ctx) {
      const t = MP.time;
      // the living room: green wallpaper, the floor and the front door
      ctx.fillStyle = '#cfe8c8';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let x = 0; x < MP.W; x += 16) ctx.fillRect(x, 0, 7, FLOOR);
      ctx.fillStyle = '#c98a55';
      ctx.fillRect(0, FLOOR, MP.W, MP.H - FLOOR);
      ctx.strokeStyle = 'rgba(90,50,20,0.25)';
      ctx.lineWidth = 0.6;
      for (let x = 0; x < MP.W; x += 24) { ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x - 10, MP.H); ctx.stroke(); }
      const doorOpen = this.step === 'guests' && t - this.friendsFrom < 3.5 && t > this.friendsFrom - 0.3;
      MP.draw('door', ctx, DOOR_X, FLOOR, { open: doorOpen });

      this.drawDecor(ctx, t);

      // the table
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#c98a55';
      ctx.fillRect(TABLE_X - 40, 124, 80, 5); ctx.strokeRect(TABLE_X - 40, 124, 80, 5);
      ctx.fillStyle = '#a0643c';
      ctx.fillRect(TABLE_X - 36, 129, 3, FLOOR - 129); ctx.fillRect(TABLE_X + 33, 129, 3, FLOOR - 129);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(TABLE_X - 42, 121, 84, 4);
      ctx.restore();
      // the cake on the table (small) once it is brought in
      const cakeHere = ['age', 'candles', 'wish', 'gifts', 'song'].includes(this.step);
      if (cakeHere && MP.scenes.baking) MP.scenes.baking.cakeShape(ctx, TABLE_X, 120, 34, 14, '#ff9ec4');

      // friends walking in from the door
      if (this.friendsFrom != null) {
        FRIENDS.forEach((f, i) => {
          const start = this.friendsFrom + i * 0.9;
          if (t < start) return;
          const u = MP.clamp((t - start) / 2.2, 0, 1);
          const x = DOOR_X + 10 + (f.x - DOOR_X - 10) * u;
          const party = this.step === 'song' || this.step === 'wish';
          const hop = party ? Math.abs(Math.sin(t * 6 + i)) * 3 : 0;
          MP.drawPerson(ctx, x, FLOOR - hop, {
            character: f.character, hair: f.hair, outfit: f.outfit, walking: u < 1, walkTime: t,
            flip: u >= 1 && f.x > ME_X, mouth: party ? 'open' : 'smile', armUp: party ? 0.8 : 0,
          });
          if (u >= 1 && this.step === 'guests' && t - start < 4) {
            MP.drawText(ctx, f.name, x, FLOOR - 52, { size: 0.6, color: '#ffffff', outline: O(), align: 'center' });
          }
        });
      }
      // mom or dad brings the cake
      const P = MP.PARENTS[this.who];
      let px = null;
      if (this.step === 'cakeIn') px = DOOR_X + 10 + (TABLE_X - 22 - DOOR_X - 10) * MP.clamp((t - this.cakeFrom) / 2, 0, 1);
      else if (['age', 'candles', 'wish', 'gifts', 'song'].includes(this.step)) px = TABLE_X - 52;
      if (px != null) {
        MP.drawPerson(ctx, px, FLOOR, {
          character: P.character, hair: P.hair, scale: P.scale, noBow: P.noBow, glasses: P.glasses, outfit: P.outfit,
          mouth: 'smile', walking: this.step === 'cakeIn' && t - this.cakeFrom < 2, walkTime: t,
          armUp: this.step === 'song' ? 0.8 : (this.step === 'cakeIn' ? 0.4 : 0),
        });
        if (this.step === 'cakeIn' && MP.scenes.baking) MP.scenes.baking.cakeShape(ctx, px + 12, FLOOR - 40, 30, 12, '#ff9ec4');
      }
      // me, the birthday child
      const happy = this.step === 'song' || this.step === 'wish';
      MP.drawPerson(ctx, ME_X, FLOOR - (happy ? Math.abs(Math.sin(t * 6)) * 3 : 0), {
        mouth: happy ? 'open' : 'smile', armUp: happy ? 0.9 : 0, flip: true, hero: true,
      });

      if (this.step === 'gifts' || this.step === 'song') this.drawGifts(ctx, t);
      if (this.step === 'age') this.drawAge(ctx);
      if (this.step === 'candles' || this.step === 'wish') this.drawBigCake(ctx, t);
      if (this.step === 'song') this.drawSong(ctx, t);

      if (this.confettiFrom != null && t - this.confettiFrom < (this.step === 'song' ? 99 : 4)) MP.drawConfetti(ctx, t - this.confettiFrom, 60);

      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, b.x, b.y, { maxWidth: 160, size: 0.85 });
      const canLeave = this.step !== 'song' || t - this.songFrom > this.songLen;
      if (canLeave) MP.drawButton(ctx, this.step === 'song' ? 'Takaisin' : '◀ Lopeta', BACK, { size: 0.8, color: this.step === 'song' ? '#3cb371' : '#9aa3b5', shade: this.step === 'song' ? '#2a8a52' : '#6b7385' });
    },

    drawDecor(ctx, t) {
      for (const d of DECOR) {
        const at = this.decor[d.id];
        if (!at) {
          if (this.step !== 'decorate') continue;
          // a dotted place to tap
          const r = decoRect(d);
          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(224,85,154,' + (0.55 + Math.sin(t * 5) * 0.3) + ')';
          MP.roundRect(ctx, r.x, r.y, r.w, r.h, 5); ctx.stroke();
          ctx.restore();
          MP.drawText(ctx, '+', d.x, d.y - 6, { size: 1.2, color: '#e0559a', align: 'center' });
          continue;
        }
        const pop = MP.clamp((t - at) * 4, 0, 1);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.scale(pop, pop);
        ctx.translate(-d.x, -d.y);
        if (d.id === 'garland') {
          const cols = ['#ff5d8f', '#ffd23f', '#4cc9f0', '#7bd389', '#b388ff'];
          ctx.strokeStyle = O();
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(d.x - d.w / 2, d.y - 8); ctx.quadraticCurveTo(d.x, d.y + 4, d.x + d.w / 2, d.y - 8); ctx.stroke();
          for (let i = 0; i < 14; i++) {
            const u = (i + 0.5) / 14;
            const x = d.x - d.w / 2 + u * d.w;
            const y = d.y - 8 + Math.sin(u * Math.PI) * 6;
            ctx.fillStyle = cols[i % cols.length];
            ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 9); ctx.closePath(); ctx.fill(); ctx.stroke();
          }
        } else if (d.id === 'banner') {
          ctx.lineWidth = 1;
          ctx.strokeStyle = O();
          ctx.fillStyle = '#fff7e0';
          MP.roundRect(ctx, d.x - d.w / 2, d.y - d.h / 2, d.w, d.h, 4); ctx.fill(); ctx.stroke();
          MP.drawText(ctx, 'HYVÄÄ SYNTYMÄPÄIVÄÄ!', d.x, d.y - 5, { size: 0.85, color: '#e0559a', align: 'center' });
        } else {
          const cols = d.id === 'balloons' ? ['#ff5d8f', '#ffd23f', '#4cc9f0'] : ['#7bd389', '#b388ff', '#ff9f43'];
          for (let i = 0; i < 3; i++) {
            const bx = d.x - 12 + i * 12, by = d.y - 14 + (i % 2) * 8 + Math.sin(t * 2 + i) * 1.5;
            ctx.strokeStyle = '#6b5f80';
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(bx, by + 9); ctx.quadraticCurveTo(bx + 3, by + 22, d.x, d.y + 26); ctx.stroke();
            ctx.fillStyle = cols[i];
            ctx.strokeStyle = O();
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.ellipse(bx, by, 7, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath(); ctx.ellipse(bx - 2.5, by - 3, 1.6, 2.6, -0.4, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.restore();
      }
    },

    drawAge(ctx) {
      ctx.save();
      ctx.fillStyle = 'rgba(13,20,51,0.45)';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#fff7e0';
      MP.roundRect(ctx, 96, 52, 128, 104, 10); ctx.fill(); ctx.stroke();
      ctx.restore();
      MP.drawText(ctx, 'Monta kynttilää?', 160, 60, { size: 0.9, color: O(), align: 'center' });
      MP.drawButton(ctx, '−', AGE_MINUS, { size: 1.4, color: '#4a78c8', shade: '#2f4a8a' });
      MP.drawButton(ctx, '+', AGE_PLUS, { size: 1.4, color: '#4a78c8', shade: '#2f4a8a' });
      MP.drawText(ctx, String(this.age), 160, 90, { size: 2.6, color: '#e0559a', outline: O(), align: 'center' });
      MP.drawButton(ctx, 'Valmis', AGE_OK, { size: 0.95 });
    },

    drawBigCake(ctx, t) {
      ctx.save();
      ctx.fillStyle = 'rgba(13,20,51,0.35)';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.restore();
      const B = MP.scenes.baking;
      if (B) B.cakeShape(ctx, BIG_CAKE.x, BIG_CAKE.y, BIG_CAKE.w, BIG_CAKE.h, '#ff9ec4');
      MP.drawText(ctx, String(this.age), BIG_CAKE.x, BIG_CAKE.y - 32, { size: 1.6, color: '#ffffff', outline: O(), align: 'center' });
      for (const c of this.candles) {
        ctx.save();
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = O();
        ctx.fillStyle = ['#8fd3ff', '#ff9ec4', '#ffd23f', '#7bd389'][c.color];
        ctx.fillRect(c.x - 2, c.y - 16, 4, 16); ctx.strokeRect(c.x - 2, c.y - 16, 4, 16);
        if (!c.out) {
          ctx.fillStyle = '#ffb02e';
          ctx.beginPath(); ctx.ellipse(c.x + Math.sin(t * 9 + c.x) * 0.6, c.y - 21, 2.4, 4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff3a0';
          ctx.beginPath(); ctx.ellipse(c.x, c.y - 20, 1.1, 2, 0, 0, Math.PI * 2); ctx.fill();
        } else if (t - c.out < 1.5) {
          // a little smoke
          const u = t - c.out;
          ctx.fillStyle = 'rgba(150,150,160,' + (0.6 - u * 0.4) + ')';
          ctx.beginPath(); ctx.arc(c.x + Math.sin(u * 6) * 2, c.y - 20 - u * 14, 2 + u * 2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    },

    drawGifts(ctx, t) {
      GIFTS.forEach((g, i) => {
        const st = this.giftState[i];
        const shake = t - st.shake < 0.5 ? Math.sin((t - st.shake) * 40) * 2 : 0;
        const x = g.x + shake;
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = O();
        if (!st.open) {
          ctx.fillStyle = g.color;
          ctx.fillRect(x - 15, GIFT_Y - 26, 30, 26); ctx.strokeRect(x - 15, GIFT_Y - 26, 30, 26);
          ctx.fillStyle = g.ribbon;
          ctx.fillRect(x - 2.5, GIFT_Y - 26, 5, 26);
          ctx.fillRect(x - 15, GIFT_Y - 15, 30, 5);
          ctx.beginPath(); ctx.ellipse(x - 5, GIFT_Y - 29, 5, 3, -0.4, 0, Math.PI * 2); ctx.ellipse(x + 5, GIFT_Y - 29, 5, 3, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          if (st.shaken) {
            // torn a little after the first tap
            ctx.strokeStyle = '#ffffff';
            ctx.beginPath(); ctx.moveTo(x - 12, GIFT_Y - 6); ctx.lineTo(x - 8, GIFT_Y - 9); ctx.lineTo(x - 5, GIFT_Y - 5); ctx.stroke();
          }
        } else {
          // paper pieces on the floor and the present
          ctx.fillStyle = g.color;
          for (let k = 0; k < 5; k++) {
            ctx.save();
            ctx.translate(x - 20 + k * 10, GIFT_Y - 2 + (k % 2) * 2);
            ctx.rotate(k * 0.9);
            ctx.fillRect(-4, -2, 8, 4);
            ctx.restore();
          }
          const pop = MP.clamp((t - st.at) * 3, 0, 1);
          const p = st.present;
          const y = GIFT_Y - 12 - pop * 10;
          if (p.tab) {
            // the clothes item: shown on a little person-free hanger picture
            const it = MP.findItem(p.tab, p.id);
            ctx.translate(x, y);
            ctx.scale(1.4, 1.4);
            if (p.id === 'crown') {
              // the golden crown
              ctx.fillStyle = it.color;
              ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(-9, -6); ctx.lineTo(-4.5, -1.5); ctx.lineTo(0, -8); ctx.lineTo(4.5, -1.5); ctx.lineTo(9, -6); ctx.lineTo(8, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
              ctx.fillStyle = it.shade; ctx.fillRect(-8, 1, 16, 3); ctx.strokeRect(-8, 1, 16, 3);
              for (const [gx, gc] of [[-5, '#4a78c8'], [0, '#e0303a'], [5, '#3cb371']]) { ctx.fillStyle = gc; ctx.beginPath(); ctx.arc(gx, -1.5, 1.3, 0, Math.PI * 2); ctx.fill(); }
            } else if (p.id === 'partyHat') {
              // the pointy party hat
              ctx.fillStyle = it.color;
              ctx.beginPath(); ctx.moveTo(-7, 6); ctx.lineTo(0, -11); ctx.lineTo(7, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
              ctx.strokeStyle = it.shade; ctx.lineWidth = 1.4;
              ctx.beginPath(); ctx.moveTo(-5, 1); ctx.lineTo(3.5, -2.5); ctx.moveTo(-2.5, -5); ctx.lineTo(1.6, -6.5); ctx.stroke();
              ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = O(); ctx.lineWidth = 1;
              ctx.beginPath(); ctx.arc(0, -12, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else {
              ctx.fillStyle = it.color;
              ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-3, -9); ctx.lineTo(3, -9); ctx.lineTo(8, -6); ctx.lineTo(6, -2); ctx.lineTo(4, -3); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.lineTo(-4, -3); ctx.lineTo(-6, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
              ctx.fillStyle = it.stripe;
              ctx.fillRect(-4, -1, 8, 2); ctx.fillRect(-4, 4, 8, 2);
            }
          } else {
            // a bag of candy
            ctx.fillStyle = '#ff9ec4';
            ctx.beginPath(); ctx.moveTo(x - 8, y + 8); ctx.lineTo(x - 6, y - 6); ctx.lineTo(x + 6, y - 6); ctx.lineTo(x + 8, y + 8); ctx.closePath(); ctx.fill(); ctx.stroke();
            for (let k = 0; k < 5; k++) { ctx.fillStyle = ['#ffd23f', '#4cc9f0', '#7bd389'][k % 3]; ctx.beginPath(); ctx.arc(x - 4 + k * 2, y - 8 - (k % 2) * 2, 1.6, 0, Math.PI * 2); ctx.fill(); }
          }
        }
        ctx.restore();
        if (!st.open && this.step === 'gifts') MP.draw('arrow', ctx, g.x, GIFT_Y - 44 + Math.sin(t * 6 + i) * 2);
      });
    },

    drawSong(ctx, t) {
      const name = MP.PASSPORT_NAME ? MP.PASSPORT_NAME[MP.state.character] || '' : '';
      const lines = ['Paljon onnea vaan,', 'paljon onnea vaan,', 'paljon onnea ' + (name === 'Matkaaja' ? 'sulle' : name) + ',', 'paljon onnea vaan!'];
      const u = (t - this.songFrom) / Math.max(1, this.songLen - 0.6);
      const now = MP.clamp(Math.floor(u * 4), 0, 3);
      ctx.save();
      ctx.fillStyle = 'rgba(255,247,224,0.9)';
      ctx.strokeStyle = O();
      ctx.lineWidth = 1;
      MP.roundRect(ctx, 86, 78, 148, 22, 8); ctx.fill(); ctx.stroke();
      ctx.restore();
      if (u < 1.05) MP.drawText(ctx, '♪ ' + lines[now] + ' ♪', 160, 84, { size: 0.85, color: '#e0559a', align: 'center' });
      else MP.drawText(ctx, 'Hurraa! 🎉', 160, 84, { size: 1, color: '#e0559a', align: 'center' });
    },
  };
})();
