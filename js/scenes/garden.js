// garden.js – OUR OWN GARDEN (kasvimaa) in the home yard.
// Three garden boxes next to the house. Tap a box on the street to come here.
//   Empty box: choose seeds – strawberry, carrot or sunflower – and plant them.
//   Water: hold your finger on a box, the watering can pours.
//   Every new morning a watered plant grows: seed → sprout → leaves → flower → ready.
//   Forgot to water? The plant looks droopy (but it never dies).
//   Ready strawberries and carrots: tap to pick – they go to the kitchen
//   (you can choose them at breakfast). Sunflowers stay tall in the yard.
// The garden is saved: MP.state.garden = [{ seed, stage, watered }] × 3
//                      MP.state.pantry = { strawberries, carrot }
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  MP.SEEDS = {
    strawberry: { name: 'Mansikka', plural: 'Mansikat', color: '#e8343f', pick: 'strawberries', amount: 3 },
    carrot: { name: 'Porkkana', plural: 'Porkkanat', color: '#ff8a2a', pick: 'carrot', amount: 2 },
    sunflower: { name: 'Auringonkukka', color: '#ffd23f' },
  };
  const STAGES = ['siemen', 'pieni taimi', 'lehtiä', 'kukkii', 'valmis'];
  const READY = 4;

  MP.gardenBeds = function () {
    if (!Array.isArray(MP.state.garden) || MP.state.garden.length !== 3) {
      MP.state.garden = [0, 1, 2].map(() => ({ seed: null, stage: 0, watered: false }));
    }
    return MP.state.garden;
  };
  // A new morning: watered plants grow one step, and everything needs water again
  MP.gardenMorning = function () {
    if (MP.isSnowy && MP.isSnowy()) return;    // winter: the plants wait under the snow
    for (const b of MP.gardenBeds()) {
      if (!b.seed) continue;
      if (b.watered && b.stage < READY) b.stage++;
      b.watered = b.stage >= READY;          // grown-up plants don't need water any more
    }
    MP.save();
  };
  const droopy = (b) => b.seed && !b.watered && b.stage > 0 && b.stage < READY;

  // ---------------------------------------------------------------------------
  // A plant in 2D (x, y = the middle of the soil). Used here and nowhere else.
  // ---------------------------------------------------------------------------
  function plant(c, b, x, y, t) {
    if (!b.seed) return;
    const lean = droopy(b) ? 0.45 : Math.sin(t * 1.5 + x) * 0.04;
    c.save();
    c.lineWidth = 0.8;
    c.strokeStyle = O();
    if (b.stage === 0) {
      // a little mound with the seed in it
      c.fillStyle = '#6b4a2a';
      c.beginPath(); c.ellipse(x, y - 1, 6, 2.5, 0, Math.PI, 0); c.fill();
      c.fillStyle = MP.SEEDS[b.seed].color;
      c.beginPath(); c.arc(x, y - 2.4, 1, 0, Math.PI * 2); c.fill();
      c.restore();
      return;
    }
    c.translate(x, y);
    c.rotate(lean * 0.4);
    const leaf = (lx, ly, a, s) => {
      c.save(); c.translate(lx, ly); c.rotate(a + (droopy(b) ? 0.6 * Math.sign(a || 1) : 0));
      c.fillStyle = '#4caf50';
      c.beginPath(); c.ellipse(0, -3 * s, 2 * s, 3.4 * s, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.restore();
    };
    if (b.seed === 'sunflower') {
      const h = [0, 8, 22, 40, 56][b.stage];
      c.strokeStyle = '#3d8a3a'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(lean * 10, -h / 2, lean * 18, -h); c.stroke();
      c.lineWidth = 0.8; c.strokeStyle = O();
      if (b.stage >= 2) { leaf(lean * 4, -h * 0.35, -1, 1.2); leaf(lean * 6, -h * 0.55, 1, 1.2); }
      if (b.stage === 1) { leaf(0, -h, -0.6, 0.7); leaf(0, -h, 0.6, 0.7); }
      if (b.stage >= 3) {
        const r = b.stage === 3 ? 4 : 9;
        c.translate(lean * 18, -h);
        c.fillStyle = '#ffd23f';
        for (let i = 0; i < 12; i++) {
          c.save(); c.rotate(i * Math.PI / 6 + t * 0.1);
          c.beginPath(); c.ellipse(0, -r, r * 0.35, r * 0.6, 0, 0, Math.PI * 2); c.fill(); c.stroke();
          c.restore();
        }
        c.fillStyle = '#7a4a2a';
        c.beginPath(); c.arc(0, 0, r * 0.65, 0, Math.PI * 2); c.fill(); c.stroke();
        if (b.stage === READY) {
          // a happy face on the big sunflower
          c.fillStyle = '#2b2340';
          c.beginPath(); c.arc(-2, -1, 0.8, 0, Math.PI * 2); c.arc(2, -1, 0.8, 0, Math.PI * 2); c.fill();
          c.strokeStyle = '#2b2340';
          c.beginPath(); c.arc(0, 0.5, 2.4, 0.2, Math.PI - 0.2); c.stroke();
        }
      }
    } else if (b.seed === 'strawberry') {
      const s = [0, 0.6, 1, 1.15, 1.25][b.stage];
      for (const [lx, a] of [[-4, -0.8], [0, 0], [4, 0.8], [-2, -0.3], [2, 0.3]]) leaf(lx * s, 0, a, s);
      if (b.stage === 3) {
        c.fillStyle = '#ffffff';
        for (const [fx, fy] of [[-5, -7], [3, -9], [6, -5]]) { c.beginPath(); c.arc(fx, fy, 1.6, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(fx, fy, 0.6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffffff'; }
      }
      if (b.stage === READY) {
        for (const [fx, fy] of [[-6, -3], [-1, -6], [4, -4], [7, -1]]) {
          c.fillStyle = '#e8343f';
          c.beginPath(); c.moveTo(fx - 2, fy - 1); c.quadraticCurveTo(fx, fy + 4, fx + 2, fy - 1); c.quadraticCurveTo(fx, fy - 2.4, fx - 2, fy - 1); c.fill(); c.stroke();
        }
      }
    } else if (b.seed === 'carrot') {
      const h = [0, 4, 8, 11, 13][b.stage];
      c.strokeStyle = '#3d8a3a'; c.lineWidth = 1;
      for (const a of [-0.5, -0.2, 0.15, 0.45]) {
        c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(a + lean) * h, -Math.cos(a + lean) * h); c.stroke();
        c.fillStyle = '#4caf50';
        c.beginPath(); c.arc(Math.sin(a + lean) * h, -Math.cos(a + lean) * h, 1.4, 0, Math.PI * 2); c.fill();
      }
      if (b.stage >= 3) {
        // the orange top shows in the soil
        c.fillStyle = '#ff8a2a'; c.strokeStyle = O(); c.lineWidth = 0.7;
        c.beginPath(); c.ellipse(0, 0.5, b.stage === READY ? 3.4 : 2.2, 1.4, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      }
    }
    c.restore();
  }

  // ---------------------------------------------------------------------------
  // The 3D garden boxes on the home street (street.js calls this)
  // ---------------------------------------------------------------------------
  MP.GARDEN_3D = [{ x: -7.4, z: 12.6 }, { x: -7.4, z: 15.4 }, { x: -7.4, z: 18.2 }];
  MP.garden3d = function (W, T) {
    const g = new T.Group();
    MP.GARDEN_3D.forEach((p) => {
      W.box(1.8, 0.45, 2.2, '#a0703c', p.x, 0, p.z, g);
      W.box(1.5, 0.05, 1.9, '#6b4a2a', p.x, 0.42, p.z, g);
      W.block(p.x, p.z, 1.8, 2.2);
    });
    W.add(g);
    W.clickable(g, 'garden');
    const plants = new T.Group();
    W.add(plants);
    // (re)build the plants for how far they have grown
    const update = () => {
      while (plants.children.length) plants.remove(plants.children[0]);
      MP.gardenBeds().forEach((b, i) => {
        if (!b.seed) return;
        const p = MP.GARDEN_3D[i];
        const pg = new T.Group();
        const droop = droopy(b) ? 0.5 : 0;
        if (b.stage === 0) {
          const m = W.ball(0.25, '#5a3a1e', 0, 0.45, 0, pg); m.scale.y = 0.4;
        } else if (b.seed === 'sunflower') {
          const h = [0, 0.3, 0.8, 1.6, 2.3][b.stage];
          const st = W.cyl(0.05, h, '#3d8a3a', 0, 0.45, 0, pg);
          st.rotation.z = droop * 0.6;
          if (b.stage >= 2) for (const k of [-1, 1]) { const lf = W.ball(0.18, '#4caf50', k * 0.18, 0.45 + h * 0.5, 0, pg); lf.scale.set(1.4, 0.4, 0.8); }
          if (b.stage >= 3) {
            const r = b.stage === READY ? 0.45 : 0.2;
            const head = new T.Group();
            const petals = new T.Mesh(new T.CircleGeometry(r, 14), new T.MeshLambertMaterial({ color: '#ffd23f', side: T.DoubleSide }));
            head.add(petals);
            const mid = new T.Mesh(new T.CircleGeometry(r * 0.55, 12), new T.MeshLambertMaterial({ color: '#7a4a2a', side: T.DoubleSide }));
            mid.position.z = 0.01;
            head.add(mid);
            head.position.set(Math.sin(droop * 0.6) * -h, 0.45 + h, 0.05);
            head.rotation.y = Math.PI / 2;           // looks toward the path
            pg.add(head);
          }
        } else {
          const n = b.seed === 'strawberry' ? 5 : 4;
          const s = [0, 0.5, 0.8, 1, 1.1][b.stage];
          for (let k = 0; k < n; k++) {
            const a = k / n * Math.PI * 2;
            const lf = W.ball(0.12 * s, '#4caf50', Math.cos(a) * 0.18 * s, 0.5 + 0.12 * s - droop * 0.08, Math.sin(a) * 0.18 * s, pg);
            lf.scale.set(1, b.seed === 'carrot' ? 2.2 : 0.6, 1);
          }
          if (b.stage === READY) {
            const col = b.seed === 'strawberry' ? '#e8343f' : '#ff8a2a';
            for (let k = 0; k < 3; k++) W.ball(0.08, col, -0.25 + k * 0.25, 0.5, 0.25, pg);
          } else if (b.stage === 3 && b.seed === 'strawberry') {
            for (let k = 0; k < 3; k++) W.ball(0.06, '#ffffff', -0.2 + k * 0.2, 0.62, 0.1, pg);
          }
        }
        pg.position.set(p.x, 0, p.z);
        plants.add(pg);
      });
    };
    update();
    return { update };
  };

  // ---------------------------------------------------------------------------
  // The garden close-up (2D)
  // ---------------------------------------------------------------------------
  const GROUND = 150;
  const BEDS_X = [70, 160, 250];
  const BED = (i) => ({ x: BEDS_X[i] - 36, y: GROUND - 26, w: 72, h: 26 });
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const PANEL = { x: 50, y: 34, w: 220, h: 96 };
  const seedCard = (i) => ({ x: 60 + i * 68, y: 54, w: 62, h: 70 });
  const SEED_IDS = ['strawberry', 'carrot', 'sunflower'];
  const DIG = (i) => ({ x: BEDS_X[i] - 20, y: GROUND + 6, w: 40, h: 16 });
  const WATER_TIME = 1.2;

  MP.scenes.garden = {
    noRestart: true,

    enter() {
      MP.gardenBeds();
      this.choose = null;           // which box is choosing seeds
      this.water = null;            // { bed, from }
      this.bubble = null;
      this.picked = [];             // flying fruit
      this.drops = [];
      this.plantAt = [-9, -9, -9];
      this.player = new MP.Player(30, { minX: 16, maxX: 300 });
      this.player.place(30, 1);
      const anyReady = MP.state.garden.some((b) => b.seed && b.stage >= READY && b.seed !== 'sunflower');
      const thirsty = MP.state.garden.some((b) => b.seed && !b.watered && b.stage < READY);
      if (MP.isRainDay && MP.isRainDay() && MP.state.garden.some((b) => b.seed)) { this.say('Sade kasteli kasvit! Tänään ei tarvitse kastella. Kasvit ovat iloisia.'); return; }
      if (MP.isSnowy && MP.isSnowy()) { this.say('Talvi! Kasvit nukkuvat lumen alla. Ne kasvavat taas, kun tulee kesä.'); return; }
      this.say(anyReady ? 'Jotain on valmista! Napauta, niin poimitaan.'
        : thirsty ? 'Kasvit ovat janoisia. Pidä sormea laatikon päällä, niin kastellaan.'
          : 'Oma kasvimaa! Napauta tyhjää laatikkoa, niin istutetaan siemeniä.');
    },

    say(text) {
      this.bubble = { text, from: MP.time, until: Infinity };
    },

    bedAt(x, y) {
      for (let i = 0; i < 3; i++) {
        const r = BED(i);
        if (x > r.x - 4 && x < r.x + r.w + 4 && y > r.y - 60 && y < r.y + r.h + 4) return i;
      }
      return -1;
    },

    onPointerDown(x, y) {
      if (this.choose != null) return;
      const i = this.bedAt(x, y);
      if (i < 0) return;
      const b = MP.state.garden[i];
      if (b.seed && b.stage < READY) {
        // start watering
        this.water = { bed: i, from: MP.time };
        this.bubble = null;
        this.player.walkTo(BEDS_X[i] - 30);
      }
    },

    onPointerUp() {
      if (this.water && !this.water.done) this.water = null;
    },

    onTap(x, y) {
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.save();
        MP.goTo(MP.scenes.street, { from: 'garden' });
        return;
      }
      if (this.choose != null) {
        SEED_IDS.forEach((id, k) => {
          if (!MP.hit(seedCard(k), x, y)) return;
          const b = MP.state.garden[this.choose];
          Object.assign(b, { seed: id, stage: 0, watered: false });
          this.plantAt[this.choose] = MP.time;
          MP.save();
          MP.sfx.boing();
          this.say(MP.SEEDS[id].name + ' istutettu! Kastele se: pidä sormea laatikon päällä.');
          this.choose = null;
        });
        if (!MP.hit(PANEL, x, y)) this.choose = null;
        return;
      }
      for (let i = 0; i < 3; i++) {
        const b = MP.state.garden[i];
        if (b.seed === 'sunflower' && b.stage >= READY && MP.hit(DIG(i), x, y)) {
          b.seed = null; b.stage = 0; b.watered = false;
          MP.save();
          MP.sfx.boing();
          this.say('Auringonkukka kaivettu pois. Nyt voi istuttaa uutta!');
          return;
        }
      }
      const i = this.bedAt(x, y);
      if (i < 0) { this.player.walkTo(x); return; }
      const b = MP.state.garden[i];
      this.player.walkTo(BEDS_X[i] - 30);
      if (!b.seed) {
        this.choose = i;
        MP.sfx.tap();
        return;
      }
      if (b.stage >= READY) {
        if (b.seed === 'sunflower') {
          this.say('Auringonkukka on jo isompi kuin minä! Se saa jäädä pihalle.');
          MP.sfx.bling();
          return;
        }
        const S = MP.SEEDS[b.seed];
        MP.state.pantry = MP.state.pantry || {};
        MP.state.pantry[S.pick] = (MP.state.pantry[S.pick] || 0) + S.amount;
        for (let k = 0; k < S.amount; k++) this.picked.push({ id: S.pick, x: BEDS_X[i] + (k - 1) * 8, y: GROUND - 30, born: MP.time + k * 0.15 });
        b.seed = null; b.stage = 0; b.watered = false;
        MP.save();
        MP.sfx.bling();
        this.say(S.plural + ' poimittu! Ne viedään keittiöön – aamupalalla voi syödä niitä.');
        return;
      }
      if (this.water && this.water.done) { this.water = null; return; }
      if (!this.water) {
        this.say(b.watered ? STAGES[b.stage].charAt(0).toUpperCase() + STAGES[b.stage].slice(1) + '. Kasvaa huomiseksi!' : 'Pidä sormea laatikon päällä, niin kastellaan.');
      }
    },

    update(dt) {
      this.player.update(dt);
      const w = this.water;
      if (w && !w.done && MP.pointer.down) {
        if (Math.random() < 0.6) this.drops.push({ x: BEDS_X[w.bed] - 14 + Math.random() * 12, y: GROUND - 58, born: MP.time });
        if (MP.time - w.from > WATER_TIME) {
          w.done = true;
          const b = MP.state.garden[w.bed];
          const first = !b.watered;
          b.watered = true;
          MP.save();
          MP.sfx.gulp();
          this.say(first ? 'Kasteltu! Huomisaamuna se on kasvanut.' : 'Jo kasteltu – kasvi kasvaa yön aikana.');
        }
      }
      this.drops = this.drops.filter((d) => MP.time - d.born < 0.6);
      this.picked = this.picked.filter((p) => MP.time - p.born < 1.2);
    },

    draw(ctx) {
      const t = MP.time;
      // sky, the house wall, the fence and the grass
      const g = ctx.createLinearGradient(0, 0, 0, GROUND);
      g.addColorStop(0, '#8fd0f6'); g.addColorStop(1, '#e6f6ff');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      MP.draw('sun', ctx, 0, 0, { x: 280, y: 26, r: 10 });
      ctx.fillStyle = '#f2d7b0';
      ctx.fillRect(0, 30, 110, GROUND - 30);
      ctx.fillStyle = '#c0504d';
      ctx.beginPath(); ctx.moveTo(-6, 34); ctx.lineTo(52, 8); ctx.lineTo(116, 34); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#bfe6ff';
      ctx.fillRect(24, 56, 26, 22); ctx.fillRect(64, 56, 26, 22);
      ctx.fillStyle = '#b07a45';
      for (let x = 112; x < MP.W; x += 9) ctx.fillRect(x, 104, 5, GROUND - 104);
      ctx.fillRect(110, 112, MP.W - 110, 3); ctx.fillRect(110, 132, MP.W - 110, 3);
      ctx.fillStyle = '#7cc56b';
      ctx.fillRect(0, GROUND, MP.W, MP.H - GROUND);

      // the boxes and the plants
      MP.state.garden.forEach((b, i) => {
        const r = BED(i);
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#a0703c';
        ctx.fillRect(r.x, r.y + 6, r.w, r.h - 6); ctx.strokeRect(r.x, r.y + 6, r.w, r.h - 6);
        ctx.fillStyle = b.watered && b.seed ? '#4a2e18' : '#6b4a2a';
        ctx.fillRect(r.x + 3, r.y + 3, r.w - 6, 5);
        ctx.strokeStyle = 'rgba(60,30,10,0.4)';
        ctx.beginPath(); ctx.moveTo(r.x, r.y + 16); ctx.lineTo(r.x + r.w, r.y + 16); ctx.stroke();
        ctx.restore();
        const pop = MP.clamp((t - this.plantAt[i]) * 3, 0, 1);
        ctx.save();
        ctx.translate(BEDS_X[i], r.y + 6);
        ctx.scale(pop, pop);
        plant(ctx, b, 0, 0, t);
        ctx.restore();
        // a little sign: what grows here and how far
        const label = b.seed ? MP.SEEDS[b.seed].name + ': ' + STAGES[b.stage] : 'Tyhjä';
        MP.drawText(ctx, label, BEDS_X[i], GROUND + 2, { size: 0.55, color: '#ffffff', outline: O(), align: 'center' });
        if (droopy(b)) MP.drawText(ctx, 'Janottaa!', BEDS_X[i], r.y - 14, { size: 0.6, color: '#4a78c8', outline: '#ffffff', align: 'center' });
        if (b.seed === 'sunflower' && b.stage >= READY) MP.drawButton(ctx, 'Kaiva', DIG(i), { size: 0.55, color: '#a0703c', shade: '#6b4a2a' });
        if (!b.seed && this.choose == null) MP.drawText(ctx, '+', BEDS_X[i], r.y - 6 + Math.sin(t * 4 + i) * 1.5, { size: 1.4, color: '#3cb371', outline: O(), align: 'center' });
      });

      // a butterfly visits the flowers
      if (MP.state.garden.some((b) => b.seed && b.stage >= 3)) {
        const bx = 160 + Math.sin(t * 0.5) * 110, by = 92 + Math.sin(t * 1.3) * 14;
        const flap = Math.abs(Math.sin(t * 12));
        ctx.save();
        ctx.fillStyle = '#ff8fc0';
        ctx.strokeStyle = O();
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.ellipse(bx - 2.5 * flap, by, 3 * flap + 0.5, 2.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(bx + 2.5 * flap, by, 3 * flap + 0.5, 2.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = O();
        ctx.fillRect(bx - 0.4, by - 2, 0.8, 4);
        ctx.restore();
      }

      // me, with the watering can when watering
      const w = this.water;
      const watering = w && !w.done && MP.pointer.down;
      this.player.draw(ctx, GROUND + 6, 0, watering ? { armUp: 0.5 } : null);
      if (watering) {
        const cx = BEDS_X[w.bed] - 18, cy = GROUND - 62;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(0.5);
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#4cc9f0';
        MP.roundRect(ctx, -7, -5, 12, 10, 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(13, -3); ctx.lineTo(13, -1); ctx.lineTo(5, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(-1, -6, 4, Math.PI, 0); ctx.stroke();
        ctx.restore();
        this.drawProgress(ctx, (MP.time - w.from) / WATER_TIME, BEDS_X[w.bed]);
      }
      ctx.save();
      ctx.fillStyle = '#4cc9f0';
      for (const d of this.drops) ctx.fillRect(d.x + 10, d.y + (MP.time - d.born) * 60, 1.2, 2.4);
      ctx.restore();
      // picked fruit flying to the basket
      for (const p of this.picked) {
        const u = MP.clamp((t - p.born) / 1, 0, 1);
        if (u <= 0) continue;
        MP.draw(p.id, ctx, p.x + (40 - p.x) * u, p.y - Math.sin(u * Math.PI) * 30 + (GROUND - 10 - p.y) * u, { scale: 1.1 });
      }

      // choosing the seeds
      if (this.choose != null) {
        ctx.save();
        ctx.fillStyle = 'rgba(20,20,40,0.4)';
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.lineWidth = 1;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#fff7e0';
        MP.roundRect(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 8); ctx.fill(); ctx.stroke();
        ctx.restore();
        MP.drawText(ctx, 'Mitä istutetaan?', MP.W / 2, PANEL.y + 5, { size: 1, color: '#3cb371', align: 'center' });
        SEED_IDS.forEach((id, k) => {
          const r = seedCard(k);
          ctx.save();
          ctx.lineWidth = 0.9;
          ctx.strokeStyle = O();
          ctx.fillStyle = '#ffffff';
          MP.roundRect(ctx, r.x, r.y, r.w, r.h, 5); ctx.fill(); ctx.stroke();
          // the seed packet shows the grown plant
          plant(ctx, { seed: id, stage: READY, watered: true }, r.x + r.w / 2, r.y + 50, t);
          ctx.restore();
          MP.drawText(ctx, MP.SEEDS[id].name, r.x + r.w / 2, r.y + r.h - 12, { size: 0.6, color: O(), align: 'center' });
        });
      }

      MP.drawButton(ctx, '◀ Ulos', BACK, { size: 0.8 });
      const b = this.bubble;
      if (b && t >= b.from && this.choose == null) MP.drawBubble(ctx, b.text, this.player.x, GROUND - 40, { maxWidth: 160, size: 0.85 });
    },

    drawProgress(ctx, k, x) {
      k = MP.clamp(k, 0, 1);
      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#ffffff';
      MP.roundRect(ctx, x - 20, GROUND - 84, 40, 5, 2.5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4cc9f0';
      if (k > 0) { MP.roundRect(ctx, x - 20, GROUND - 84, 40 * k, 5, 2.5); ctx.fill(); }
      ctx.restore();
    },
  };
})();
