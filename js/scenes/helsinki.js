// helsinki.js – HELSINGIN KESKUSTA by bus 67 (2D).
//   1. The bus ride: houses, trees and trams go past the window, the bus bounces.
//   2. The city centre (scrolls sideways): the white Cathedral on its steps,
//      Senate Square, the Market Square by the sea (buy a doughnut… and a seagull
//      steals it!), the fountain statue, ferries and yellow-green trams.
//   3. Janne Kataja is in the street: tap him – "Moi Janne!" – "No moi!".
//      Then the question game: a big close-up of Janne. He asks a question and
//      you tap one of three answers; every answer gets a funny reaction.
//   4. The bus stop "67": back home.
// Janne Kataja is drawn as a friendly cartoon, the way the family described him:
// big black rectangular glasses, short brown hair, a stubbly beard, a big laugh
// and a sparkly sequin jacket.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const FLOOR = 150;
  const WORLD = 1100;
  const BACK = { x: 4, y: 4, w: 74, h: 18 };
  const SIGHTS = {
    cathedral: 170,
    senate: 330,
    market: 520,
    munkki: 560,
    fountain: 700,
    janne: 860,
    stop: 1040,
  };
  const ANS = (i) => ({ x: 14 + i * 100, y: 146, w: 94, h: 28 });

  const QUESTIONS = [
    { q: 'Mikä on lempiruokasi?', a: [
      ['Pizza', 'Pizza! Hyvä valinta – minä söisin kymmenen palaa!'],
      ['Pulla', 'Pullaa! Mummin pulla on maailman parasta, eikö vain?'],
      ['Ruusukaali', 'RUUSUKAALIA?! Olet rohkein ihminen, jonka tiedän! Hahaa!'],
    ] },
    { q: 'Mihin maahan matkustaisit seuraavaksi?', a: [
      ['Japaniin', 'Japaniin! Siellä on luotijunia ja sushia – ota minut mukaan!'],
      ['Australiaan', 'Australiaan! Varo vain nyrkkeilevää kengurua!'],
      ['Kuuhun', 'KUUHUN?! Mahtavaa! Ota juustoeväät mukaan!'],
    ] },
    { q: 'Kumpi on hauskempi, pingviini vai kenguru?', a: [
      ['Pingviini', 'Pingviini! Kävelee kuin minä aamulla ennen kahvia!'],
      ['Kenguru', 'Kenguru! Pomppii kuin minä, kun kuulen hyvän biisin!'],
      ['Molemmat!', 'Molemmat! Pingviini kengurun pussissa – se olisi jotain!'],
    ] },
    { q: 'Osaatko laulaa Turpapoikien biisin?', a: [
      ['Osaan!', 'Mä löin sua turpaan… Hahaa, sinä osaat sen paremmin kuin minä!'],
      ['En osaa', 'Ei haittaa! Hyräillään vaan: lalalaa, pum pum!'],
      ['Lauletaan!', 'Lauletaan yhdessä! … Voi, minä vedin väärän sävelen. Hahaa!'],
    ] },
    { q: 'Mikä on lempivärisi?', a: [
      ['Pinkki', 'Pinkki! Ihana väri – kuin hattara huvipuistossa!'],
      ['Sininen', 'Sininen! Niin kuin meri ja bussi 67!'],
      ['Kimallus', 'Kimallus! Ihan niin kuin minun takkini! Katso, se välkkyy!'],
    ] },
    { q: 'Kuka on paras supersankari?', a: [
      ['Spiderman', 'Spiderman! Minä yritin kerran kiivetä seinälle… en päässyt.'],
      ['Ironman', 'Ironman! Lentävät saappaat – sellaiset minäkin haluan!'],
      ['Minä itse!', 'Sinä itse! Tietenkin! Paras vastaus ikinä!'],
    ] },
    { q: 'Mikä asu Masked Singeriin pitäisi tehdä seuraavaksi?', a: [
      ['Pulla-asu', 'Pulla-asu! Minä arvaisin heti – siitä tulisi niin hyvä tuoksu!'],
      ['Lohikäärme', 'Lohikäärme! Tulta ja laulua – vau!'],
      ['Kissa', 'Kissa! Miau-miau-laulu… minä nauraisin koko jakson!'],
    ] },
  ];

  // ---------------------------------------------------------------------------
  // Janne (cartoon). (x, y) = feet for the small one; the close-up is the face.
  // ---------------------------------------------------------------------------
  function sequins(c, x, y, w, h, t) {
    const cols = ['#f2c230', '#7bd389', '#d98e3a', '#ffe9a0'];
    for (let i = 0; i < 40; i++) {
      const sx = x + ((i * 37) % 100) / 100 * w, sy = y + ((i * 53) % 100) / 100 * h;
      const on = Math.sin(t * 6 + i * 1.7) > 0.3;
      c.fillStyle = on ? '#ffffff' : cols[i % cols.length];
      c.fillRect(sx, sy, on ? 1.4 : 1, on ? 1.4 : 1);
    }
  }

  function janneSmall(c, x, y, t, wave) {
    c.save();
    c.translate(x, y);
    c.lineWidth = 0.8;
    c.strokeStyle = O();
    // legs
    c.fillStyle = '#1b1b2a';
    c.fillRect(-5, -16, 4, 16); c.fillRect(1, -16, 4, 16);
    // the sparkly jacket
    c.fillStyle = '#26262e';
    MP.roundRect(c, -9, -40, 18, 25, 4); c.fill(); c.stroke();
    sequins(c, -8, -39, 16, 22, t);
    c.fillStyle = '#111116';
    c.beginPath(); c.moveTo(-3, -40); c.lineTo(0, -30); c.lineTo(3, -40); c.closePath(); c.fill();
    // arms out wide ("ta-daa!")
    c.save(); c.translate(-8, -36); c.rotate(wave ? -2.3 + Math.sin(t * 10) * 0.3 : 0.9);
    c.fillStyle = '#26262e'; c.fillRect(-2, 0, 4, 12); c.fillStyle = '#f2c9a0'; c.fillRect(-2, 12, 4, 3); c.restore();
    c.save(); c.translate(8, -36); c.rotate(-0.9);
    c.fillStyle = '#26262e'; c.fillRect(-2, 0, 4, 12); c.fillStyle = '#f2c9a0'; c.fillRect(-2, 12, 4, 3); c.restore();
    // head
    c.fillStyle = '#f2c9a0';
    c.beginPath(); c.arc(0, -48, 8, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#8a5a32';
    c.beginPath(); c.ellipse(0, -54.5, 7.5, 3, 0, Math.PI, 0); c.fill();
    c.fillRect(-7, -55, 14, 3);
    c.fillStyle = 'rgba(120,80,40,0.35)';
    c.beginPath(); c.ellipse(0, -43.5, 6, 3.4, 0, 0, Math.PI); c.fill();
    c.strokeStyle = '#111116'; c.lineWidth = 1;
    c.strokeRect(-6, -50, 5, 3.5); c.strokeRect(1, -50, 5, 3.5);
    c.fillStyle = '#7a2e3a';
    c.beginPath(); c.arc(0, -44.5, 2.6, 0, Math.PI); c.fill();
    c.restore();
  }

  function janneBig(c, t, laughAt) {
    const laugh = t - laughAt < 1.4;
    const bob = laugh ? Math.abs(Math.sin((t - laughAt) * 12)) * 3 : Math.sin(t * 2) * 0.8;
    c.save();
    c.translate(160, 90 + bob * 0.4);
    c.lineWidth = 1.4;
    c.strokeStyle = O();
    // jacket and shirt
    c.fillStyle = '#26262e';
    c.beginPath(); c.moveTo(-90, 100); c.quadraticCurveTo(-80, 34, -30, 30); c.lineTo(30, 30); c.quadraticCurveTo(80, 34, 90, 100); c.closePath(); c.fill(); c.stroke();
    sequins(c, -86, 36, 50, 60, t);
    sequins(c, 36, 36, 50, 60, t + 1);
    c.fillStyle = '#111116';
    c.beginPath(); c.moveTo(-30, 30); c.lineTo(-12, 100); c.lineTo(12, 100); c.lineTo(30, 30); c.closePath(); c.fill();
    c.fillStyle = '#1b1b22';
    c.beginPath(); c.moveTo(-14, 30); c.lineTo(0, 52); c.lineTo(14, 30); c.closePath(); c.fill();
    // the head
    c.fillStyle = '#f2c9a0';
    c.beginPath(); c.ellipse(0, -10, 40, 46, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    // ears
    for (const k of [-1, 1]) { c.beginPath(); c.ellipse(k * 40, -8, 6, 10, 0, 0, Math.PI * 2); c.fill(); c.stroke(); }
    // short brown hair, a bit up at the front
    c.fillStyle = '#8a5a32';
    c.beginPath();
    c.moveTo(-38, -24); c.quadraticCurveTo(-40, -58, -6, -60); c.quadraticCurveTo(10, -66, 22, -58); c.quadraticCurveTo(40, -52, 38, -24);
    c.quadraticCurveTo(30, -42, 0, -44); c.quadraticCurveTo(-28, -42, -38, -24); c.closePath(); c.fill(); c.stroke();
    // stubbly beard (only on the face)
    c.save();
    c.beginPath(); c.ellipse(0, -10, 39, 45, 0, 0, Math.PI * 2); c.clip();
    c.fillStyle = 'rgba(120,80,40,0.28)';
    c.beginPath(); c.ellipse(0, 14, 36, 24, 0, 0, Math.PI); c.fill();
    c.fillStyle = 'rgba(90,60,30,0.35)';
    for (let i = 0; i < 60; i++) c.fillRect(-30 + (i * 29) % 60, 16 + (i * 17) % 20, 1, 1);
    c.restore();
    // eyebrows (up when laughing)
    c.strokeStyle = '#5a3a1e'; c.lineWidth = 2.4;
    for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 8, -28 - (laugh ? 4 : 0)); c.lineTo(k * 26, -30 - (laugh ? 6 : 0)); c.stroke(); }
    // eyes (blue)
    for (const k of [-1, 1]) {
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(k * 16, -16, 6, laugh ? 2 : 5, 0, 0, Math.PI * 2); c.fill();
      if (!laugh) { c.fillStyle = '#4a78c8'; c.beginPath(); c.arc(k * 16, -16, 3, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111116'; c.beginPath(); c.arc(k * 16, -16, 1.4, 0, Math.PI * 2); c.fill(); }
    }
    // the big black rectangular glasses (they bounce up when he laughs)
    const gy = laugh ? -6 : 0;
    c.strokeStyle = '#111116'; c.lineWidth = 3.6;
    c.strokeRect(-30, -24 + gy, 25, 16);
    c.strokeRect(5, -24 + gy, 25, 16);
    c.beginPath(); c.moveTo(-5, -18 + gy); c.lineTo(5, -18 + gy); c.stroke();
    c.beginPath(); c.moveTo(-30, -20 + gy); c.lineTo(-38, -18 + gy); c.moveTo(30, -20 + gy); c.lineTo(38, -18 + gy); c.stroke();
    // nose
    c.strokeStyle = O(); c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(0, -8); c.quadraticCurveTo(-5, 4, 2, 5); c.stroke();
    // the big laugh
    c.fillStyle = '#7a2e3a';
    c.beginPath(); c.moveTo(-18, 12); c.quadraticCurveTo(0, laugh ? 40 : 30, 18, 12); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ffffff';
    c.beginPath(); c.moveTo(-16, 12.5); c.lineTo(16, 12.5); c.lineTo(14, 17); c.lineTo(-14, 17); c.closePath(); c.fill();
    c.restore();
    if (laugh) MP.drawText(c, 'HAHAHA!', 268, 40, { size: 1.2, color: '#ffd23f', outline: O(), align: 'center' });
  }

  // ---------------------------------------------------------------------------
  MP.scenes.helsinki = {
    noRestart: true,

    enter() {
      this.step = 'ride';
      this.rideFrom = MP.time;
      this.back = false;
      this.player = new MP.Player(40, { minX: 20, maxX: WORLD - 20 });
      this.player.place(40, 1);
      this.camX = 0;
      this.munkki = null;         // { state: 'have' | 'stolen', at }
      this.met = false;
      this.bubble = null;
      MP.sfx.bling();
      this.say('Kuljettaja: Moi! Matkakortti – piip! Istutaan ikkunan viereen.');
    },

    say(text, who) {
      this.bubble = { text, from: MP.time, until: Infinity, who: who || 'me' };
    },

    // ----- the question game -----
    startJanne() {
      this.step = 'janne';
      const order = QUESTIONS.slice().sort(() => Math.random() - 0.5).slice(0, 5);
      this.qs = order;
      this.qi = 0;
      this.answered = null;
      this.laughAt = -9;
      this.say('Janne: Hei, minulla on sinulle kysymyksiä! ' + order[0].q, 'janne');
      MP.sfx.bling();
    },

    answer(i) {
      const q = this.qs[this.qi];
      this.answered = { i, at: MP.time };
      this.laughAt = MP.time;
      this.say('Janne: ' + q.a[i][1], 'janne');
      MP.sfx.applause(0.8);
    },

    nextQuestion() {
      this.qi++;
      this.answered = null;
      if (this.qi >= this.qs.length) {
        this.step = 'city';
        this.met = true;
        this.janneBye = MP.time;
        this.say('Janne: Kiva jutella! Hei hei, ja hyvää matkaa!', 'janneSmall');
        MP.sfx.bling();
        return;
      }
      this.say('Janne: ' + this.qs[this.qi].q, 'janne');
    },

    onTap(x, y) {
      const t = MP.time;
      if (this.step === 'ride') {
        if (t - this.rideFrom > 1) this.endRide();
        return;
      }
      if (this.step === 'janne') {
        if (this.answered) {
          if (t - this.answered.at > 0.6) this.nextQuestion();
          return;
        }
        for (let i = 0; i < 3; i++) if (MP.hit(ANS(i), x, y)) { this.answer(i); return; }
        if (MP.hit(BACK, x, y)) { this.step = 'city'; MP.sfx.tap(); }
        return;
      }
      if (MP.hit(BACK, x, y)) {
        // straight back to the bus
        MP.sfx.tap();
        this.goHome();
        return;
      }
      const wx = x + this.camX;
      if (Math.abs(wx - SIGHTS.janne) < 16 && y > FLOOR - 70) {
        this.player.walkTo(SIGHTS.janne - 26, () => {
          this.player.facing = 1;
          this.say('Moi Janne!');
          setTimeout(() => { if (MP.scene === this && this.step === 'city') { this.say('Janne: No moi! Hauska nähdä!', 'janneSmall'); setTimeout(() => { if (MP.scene === this && this.step === 'city') this.startJanne(); }, 1600); } }, 900);
        });
        MP.sfx.tap();
        return;
      }
      if (Math.abs(wx - SIGHTS.munkki) < 18 && y > FLOOR - 50) {
        this.player.walkTo(SIGHTS.munkki - 22, () => {
          if (this.munkki && this.munkki.state === 'have') return;
          this.munkki = { state: 'have', at: MP.time };
          MP.sfx.nom();
          this.say('Munkki Kauppatorilta! Nam…');
        });
        return;
      }
      if (Math.abs(wx - SIGHTS.cathedral) < 50 && y < FLOOR - 20) {
        this.say('Tuomiokirkko! Valkoinen kirkko, vihreät kupolit ja tosi paljon portaita.');
        MP.sfx.tune();
        return;
      }
      if (Math.abs(wx - SIGHTS.fountain) < 20 && y > FLOOR - 60) {
        this.say('Havis Amanda -suihkulähde! Vesi solisee ja lokit istuvat reunalla.');
        MP.sfx.flush();
        return;
      }
      if (Math.abs(wx - SIGHTS.stop) < 22) {
        this.player.walkTo(SIGHTS.stop - 14, () => this.goHome());
        return;
      }
      this.player.walkTo(wx);
    },

    endRide() {
      if (this.back) { MP.goTo(MP.scenes.street, { from: 'bus' }); this.step = 'done'; return; }
      this.step = 'city';
      MP.sfx.bling();
      this.say('Helsingin keskusta! Katsotaan nähtävyyksiä. Napauta, minne kävellään.');
    },

    goHome() {
      if (this.step === 'ride' || this.step === 'done') return;
      this.step = 'ride';
      this.back = true;
      this.rideFrom = MP.time;
      MP.sfx.bling();
      this.say('Bussi 67 kotiin päin! Piip!');
    },

    update(dt) {
      const t = MP.time;
      if (this.step === 'ride' && t - this.rideFrom > 6) this.endRide();
      if (this.step !== 'city') return;
      this.player.update(dt);
      this.camX = MP.clamp(this.player.x - 120, 0, WORLD - MP.W);
      // the seagull comes for the doughnut
      const m = this.munkki;
      if (m && m.state === 'have' && t - m.at > 2.2) {
        m.state = 'stolen';
        m.at = t;
        MP.sfx.quack();
        this.say('HEI! Lokki vei munkin! Kauppatorin lokit ovat tosi ovelia!');
      }
    },

    draw(ctx) {
      const t = MP.time;
      if (this.step === 'ride' || this.step === 'done') this.drawRide(ctx, t);
      else if (this.step === 'janne') this.drawJanne(ctx, t);
      else this.drawCity(ctx, t);
      const b = this.bubble;
      if (b && t >= b.from) {
        let tip;
        if (b.who === 'janne') tip = [160, 140];
        else if (b.who === 'janneSmall') tip = [SIGHTS.janne - this.camX, FLOOR - 62];
        else if (this.step === 'ride') tip = [160, 40];
        else tip = [this.player.x - this.camX, FLOOR - 48];
        if (b.who === 'janne') MP.drawBubble(ctx, b.text, 160, 30, { maxWidth: 220, size: 0.85 });
        else MP.drawBubble(ctx, b.text, tip[0], tip[1], { maxWidth: 180, size: 0.85 });
      }
    },

    drawRide(ctx, t) {
      const u = t - this.rideFrom;
      const bounce = Math.abs(Math.sin(u * 7)) * 1.2;
      // the view out of the window: things go past
      const g = ctx.createLinearGradient(0, 0, 0, 120);
      g.addColorStop(0, '#8fd0f6'); g.addColorStop(1, '#e6f6ff');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      const dir = this.back ? -1 : 1;
      for (let i = 0; i < 12; i++) {
        const x = ((i * 70 - u * 90 * dir) % 840 + 840) % 840 - 100;
        if (i % 3 === 0) {
          // a house
          ctx.fillStyle = ['#f2d7b0', '#bfe3f2', '#ffe0e9', '#e8d6a8'][i % 4];
          ctx.fillRect(x, 60, 50, 60);
          ctx.fillStyle = '#c0504d';
          ctx.beginPath(); ctx.moveTo(x - 4, 60); ctx.lineTo(x + 25, 40); ctx.lineTo(x + 54, 60); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#bfe6ff'; ctx.fillRect(x + 8, 74, 12, 12); ctx.fillRect(x + 30, 74, 12, 12);
        } else if (i % 3 === 1) {
          ctx.fillStyle = '#2e7d4f';
          ctx.beginPath(); ctx.arc(x + 20, 80, 18, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#6b4a3a'; ctx.fillRect(x + 17, 92, 6, 28);
        } else {
          // a yellow-green tram
          ctx.fillStyle = '#9bc43a'; ctx.fillRect(x, 86, 60, 26);
          ctx.fillStyle = '#ffd23f'; ctx.fillRect(x, 86, 60, 6);
          ctx.fillStyle = '#bfe6ff'; for (let k = 0; k < 4; k++) ctx.fillRect(x + 4 + k * 14, 94, 10, 9);
        }
      }
      ctx.fillStyle = '#6b6f7a';
      ctx.fillRect(0, 118, MP.W, 10);
      // the inside of the bus: window frames, seats, the yellow pole
      ctx.save();
      ctx.translate(0, bounce);
      ctx.fillStyle = '#007ac9';
      ctx.fillRect(0, 0, MP.W, 14); ctx.fillRect(0, 124, MP.W, 60);
      for (let x = 0; x <= MP.W; x += 106) ctx.fillRect(x - 5, 0, 10, 130);
      ctx.fillStyle = '#c84a6a';
      for (let i = 0; i < 4; i++) { MP.roundRect(ctx, 20 + i * 80, 126, 50, 30, 6); ctx.fill(); }
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(150, 0, 5, 180);
      ctx.restore();
      MP.drawPerson(ctx, 70, 158 + bounce, { hero: true, sit: true, mouth: 'smile', flip: false });
      MP.drawText(ctx, this.back ? '67 → KOTI' : '67 → KESKUSTA', MP.W - 6, 2, { size: 0.8, color: '#ffd23f', align: 'right' });
      MP.drawText(ctx, '(napauta ohittaaksesi)', MP.W - 4, 170, { size: 0.55, color: '#ffffff', outline: O(), align: 'right' });
    },

    drawCity(ctx, t) {
      const cx = this.camX;
      // sky and the sea on the right side
      const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
      g.addColorStop(0, '#8fc8ec'); g.addColorStop(1, '#e6f2f8');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.save();
      ctx.translate(-cx, 0);
      // --- the Cathedral on its steps ---
      const k = SIGHTS.cathedral;
      ctx.fillStyle = '#f4f4f0'; ctx.strokeStyle = '#b8c0c8'; ctx.lineWidth = 0.8;
      for (let i = 0; i < 6; i++) { ctx.fillRect(k - 70 + i * 5, FLOOR - 6 - i * 4, 140 - i * 10, 4); ctx.strokeRect(k - 70 + i * 5, FLOOR - 6 - i * 4, 140 - i * 10, 4); }
      ctx.fillRect(k - 40, 56, 80, 70); ctx.strokeRect(k - 40, 56, 80, 70);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = '#e8e8e2'; ctx.fillRect(k - 34 + i * 13, 86, 6, 40); }
      ctx.fillStyle = '#f4f4f0'; ctx.beginPath(); ctx.moveTo(k - 44, 56); ctx.lineTo(k, 40); ctx.lineTo(k + 44, 56); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6fae9a';
      ctx.beginPath(); ctx.arc(k, 30, 16, Math.PI, 0); ctx.fill();
      ctx.fillRect(k - 16, 30, 32, 10);
      for (const dx of [-36, 36]) { ctx.beginPath(); ctx.arc(k + dx, 46, 7, Math.PI, 0); ctx.fill(); }
      ctx.fillStyle = '#f2c230'; ctx.fillRect(k - 1, 6, 2, 10); ctx.fillRect(k - 4, 9, 8, 2);
      // --- Senate Square: a statue and yellow buildings ---
      const s = SIGHTS.senate;
      ctx.fillStyle = '#f2d27a'; ctx.fillRect(s - 60, 70, 120, FLOOR - 70);
      ctx.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) ctx.fillRect(s - 52 + i * 20, 80, 8, 12);
      ctx.fillStyle = '#8a8a7a'; ctx.fillRect(s - 8, 110, 16, 40);
      ctx.fillStyle = '#4a6a5a'; ctx.fillRect(s - 4, 92, 8, 18); ctx.beginPath(); ctx.arc(s, 90, 4, 0, Math.PI * 2); ctx.fill();
      // --- the Market Square: tents, the sea, a ferry ---
      const m = SIGHTS.market;
      ctx.fillStyle = '#3d7fa8'; ctx.fillRect(m - 80, 100, 400, FLOOR - 100);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(m + 120, 88, 70, 14);
      ctx.fillStyle = '#e04848'; ctx.fillRect(m + 120, 98, 70, 4);
      ctx.fillStyle = '#2b2340'; ctx.fillRect(m + 150, 78, 8, 10);
      for (let i = 0; i < 4; i++) {
        const tx = m - 60 + i * 34;
        ctx.fillStyle = ['#ff8a2a', '#e04848', '#ffd23f', '#3cb371'][i];
        ctx.beginPath(); ctx.moveTo(tx - 15, 120); ctx.lineTo(tx, 106); ctx.lineTo(tx + 15, 120); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff7e0'; ctx.fillRect(tx - 13, 120, 26, FLOOR - 120);
      }
      // the doughnut stand
      ctx.fillStyle = '#ff8fc0'; ctx.fillRect(SIGHTS.munkki - 14, 116, 28, FLOOR - 116);
      ctx.fillStyle = '#d98e3a'; ctx.beginPath(); ctx.arc(SIGHTS.munkki, 112, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff8fc0'; ctx.beginPath(); ctx.arc(SIGHTS.munkki, 112, 2, 0, Math.PI * 2); ctx.fill();
      MP.drawText(ctx, 'MUNKKI', SIGHTS.munkki, 126, { size: 0.45, color: '#ffffff', align: 'center' });
      // --- the fountain statue ---
      const f = SIGHTS.fountain;
      ctx.fillStyle = '#8a8a7a'; ctx.fillRect(f - 26, FLOOR - 10, 52, 10);
      ctx.fillStyle = '#5a7a6a'; ctx.fillRect(f - 6, FLOOR - 40, 12, 30);
      ctx.beginPath(); ctx.arc(f, FLOOR - 44, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8fe3ff';
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; ctx.fillRect(f + Math.cos(a) * 18, FLOOR - 14 - Math.sin(t * 6 + i) * 3, 1.5, 4); }
      // --- yellow-green trams going past in the back ---
      for (let i = 0; i < 2; i++) {
        const tx = ((t * 40 + i * 600) % (WORLD + 200)) - 100;
        ctx.fillStyle = '#9bc43a'; ctx.fillRect(tx, FLOOR - 38, 70, 26);
        ctx.fillStyle = '#ffd23f'; ctx.fillRect(tx, FLOOR - 38, 70, 5);
        ctx.fillStyle = '#bfe6ff'; for (let k2 = 0; k2 < 5; k2++) ctx.fillRect(tx + 4 + k2 * 13, FLOOR - 31, 9, 8);
      }
      // --- the street ---
      ctx.fillStyle = '#c9c6c0';
      ctx.fillRect(0, FLOOR, WORLD, MP.H - FLOOR);
      // --- Janne ---
      janneSmall(ctx, SIGHTS.janne, FLOOR + 2, t, this.met && t - this.janneBye < 3);
      if (!this.met) MP.draw('arrow', ctx, SIGHTS.janne, FLOOR - 74 + Math.sin(t * 6) * 2.5);
      // --- the bus stop at the end ---
      ctx.fillStyle = '#5a5a6a'; ctx.fillRect(SIGHTS.stop - 1, FLOOR - 46, 2, 46);
      ctx.fillStyle = '#007ac9'; ctx.fillRect(SIGHTS.stop - 9, FLOOR - 56, 18, 12);
      MP.drawText(ctx, '67', SIGHTS.stop, FLOOR - 55, { size: 0.7, color: '#ffffff', align: 'center' });
      // --- me (with the doughnut, or the seagull taking it) ---
      const p = this.player;
      MP.drawPerson(ctx, p.x, FLOOR + 2, { walking: p.walking, walkTime: p.walkTime, flip: p.facing < 0, hero: true, mouth: this.munkki && this.munkki.state === 'stolen' && t - this.munkki.at < 2 ? 'yawn' : 'smile' });
      const mk = this.munkki;
      if (mk && mk.state === 'have') {
        ctx.fillStyle = '#d98e3a'; ctx.beginPath(); ctx.arc(p.x + 8 * p.facing, FLOOR - 18, 3.4, 0, Math.PI * 2); ctx.fill();
      }
      if (mk && mk.state === 'stolen' && t - mk.at < 3) {
        const u = (t - mk.at) / 3;
        const gx = p.x + 8 + u * 160, gy = FLOOR - 18 - u * 120 + Math.sin(u * 10) * 4;
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = O(); ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.ellipse(gx, gy, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const flap = Math.sin(t * 20) * 5;
        ctx.beginPath(); ctx.moveTo(gx - 3, gy); ctx.lineTo(gx - 10, gy - 4 - flap); ctx.lineTo(gx + 2, gy - 1); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffb02e'; ctx.fillRect(gx + 5, gy - 1, 3, 1.4);
        ctx.fillStyle = '#d98e3a'; ctx.beginPath(); ctx.arc(gx + 8, gy + 2, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      MP.drawText(ctx, 'Helsingin keskusta', MP.W / 2, 4, { size: 0.9, color: '#ffffff', outline: O(), align: 'center' });
      MP.drawButton(ctx, '◀ Kotiin', BACK, { size: 0.8 });
    },

    drawJanne(ctx, t) {
      // a TV-studio-like background with lights
      ctx.fillStyle = '#2b2340';
      ctx.fillRect(0, 0, MP.W, MP.H);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = 'rgba(255,215,100,' + (0.15 + 0.1 * Math.sin(t * 3 + i)) + ')';
        ctx.beginPath(); ctx.arc(16 + i * 32, 16, 6, 0, Math.PI * 2); ctx.fill();
      }
      janneBig(ctx, t, this.laughAt);
      MP.drawText(ctx, 'Jannen kysymykset ' + Math.min(this.qi + 1, this.qs.length) + ' / ' + this.qs.length, 312, 168, { size: 0.55, color: '#ffffff', align: 'right' });
      if (!this.answered) {
        this.qs[this.qi].a.forEach((a, i) => MP.drawButton(ctx, a[0], ANS(i), { size: 0.85, color: ['#4a78c8', '#e0559a', '#3cb371'][i], shade: ['#2f4a8a', '#a8326c', '#2a8a52'][i] }));
      } else if (t - this.answered.at > 0.6) {
        MP.drawText(ctx, '(napauta, niin seuraava kysymys)', 160, 160, { size: 0.6, color: '#ffffff', align: 'center' });
      }
    },
  };
})();
