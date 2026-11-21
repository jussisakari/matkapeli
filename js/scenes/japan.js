// japan.js – JAPANI (Japan)! Cherry blossoms, a pagoda and a snowy mountain.
// You arrive by a super fast bullet train. Things to do:
//   pink cherry trees (tap: petals fly in the wind), a red torii gate and a
//   pagoda, a pond with koi fish that come to you, a sushi bar with a
//   conveyor belt (tap the plates to eat), a friendly deer that bows back,
//   and the snowy mountain far away. A kimono comes to your wardrobe!
// Made with the country kit (country3d.js).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const C = {
    sky: '#9fd6f5',
    grass: '#8cc66a',
    gravel: '#e8e0cc',
    red: '#d8342c',
    blossom: '#ffb7d0',
    blossom2: '#ffd1e2',
    trunk: '#6b4a3a',
    water: '#3f9fd0',
    train: '#f4f6fa',
    trainBlue: '#2f6fb8',
  };

  const TRAIN = { x: 4, z: 8.6 };
  const TORII = { x: 0, z: -12 };
  const PAGODA = { x: 0, z: -27 };
  const POND = { x: -14, z: -17, r: 4.2 };
  const SUSHI = { x: 17, z: -12 };
  const DEER_HOME = { x: -7, z: -4 };
  const TREES = [[-6, -9], [7, -8], [-20, -6], [-10, -28], [10, -26], [24, -24], [-26, -18], [26, -2]];

  // ---------------------------------------------------------------------------
  // The landscape picture: Mount Fuji, cherry trees and a pagoda
  // ---------------------------------------------------------------------------
  MP.LANDSCAPES = MP.LANDSCAPES || {};
  MP.LANDSCAPES.japan = function (c, r, horizon, k, wrap, sx) {
    const g = c.createLinearGradient(0, r.y, 0, horizon);
    g.addColorStop(0, '#8fcbf0'); g.addColorStop(1, '#f2e8f0');
    c.fillStyle = g;
    c.fillRect(r.x, r.y, r.w, r.h);
    MP.draw('sun', c, 0, 0, { x: r.x + r.w * 0.85, y: r.y + r.h * 0.16, r: 9 * k + 2 });
    // the mountain with snow on top
    const mx = wrap(r.x + r.w * 0.38 + sx(0.2));
    c.fillStyle = '#7d8fb0';
    c.beginPath(); c.moveTo(mx - 70 * k, horizon); c.lineTo(mx - 14 * k, horizon - 46 * k); c.lineTo(mx + 14 * k, horizon - 46 * k); c.lineTo(mx + 70 * k, horizon); c.closePath(); c.fill();
    c.fillStyle = '#ffffff';
    c.beginPath(); c.moveTo(mx - 26 * k, horizon - 30 * k); c.lineTo(mx - 14 * k, horizon - 46 * k); c.lineTo(mx + 14 * k, horizon - 46 * k);
    c.lineTo(mx + 26 * k, horizon - 30 * k); c.lineTo(mx + 14 * k, horizon - 34 * k); c.lineTo(mx + 4 * k, horizon - 28 * k); c.lineTo(mx - 8 * k, horizon - 34 * k); c.closePath(); c.fill();
    c.fillStyle = '#8cc66a';
    c.fillRect(r.x, horizon, r.w, r.y + r.h - horizon);
    // a small pagoda
    const px = wrap(r.x + r.w * 0.72 + sx(0.6));
    for (let i = 0; i < 4; i++) {
      const w = (16 - i * 3) * k, y = horizon + 2 * k - i * 7 * k;
      c.fillStyle = '#f2ead8'; c.fillRect(px - w * 0.3, y - 6 * k, w * 0.6, 6 * k);
      c.fillStyle = '#d8342c';
      c.beginPath(); c.moveTo(px - w / 2, y - 5 * k); c.lineTo(px, y - 9 * k); c.lineTo(px + w / 2, y - 5 * k); c.closePath(); c.fill();
    }
    // cherry trees
    for (let i = 0; i < 7; i++) {
      const x = wrap(r.x + i * 52 + 12 + sx(1));
      const base = horizon + 10 * k + (i % 2) * 4 * k;
      c.fillStyle = '#6b4a3a'; c.fillRect(x - 1 * k, base - 10 * k, 2 * k, 10 * k);
      c.fillStyle = i % 2 ? '#ffb7d0' : '#ffd1e2';
      c.beginPath(); c.arc(x, base - 13 * k, 7 * k, 0, Math.PI * 2); c.arc(x - 5 * k, base - 10 * k, 5 * k, 0, Math.PI * 2); c.arc(x + 5 * k, base - 10 * k, 5 * k, 0, Math.PI * 2); c.fill();
    }
  };

  const SUSHI_NAMES = ['Lohisushi', 'Tonnikalasushi', 'Kurkkurulla', 'Katkarapusushi', 'Munasushi', 'Avokadorulla'];

  MP.makeCountry({
    id: 'japan', name: 'Japani', to: 'Japaniin', city: 'Tokio', time: '11:10',
    land: 'japan',
    flag(c, x, y, w, h) {
      c.fillStyle = '#ffffff'; c.fillRect(x, y, w, h);
      c.fillStyle = '#bc002d';
      c.beginPath(); c.arc(x + w / 2, y + h / 2, h * 0.3, 0, Math.PI * 2); c.fill();
    },
    sky: C.sky,
    ground: C.grass,
    fog: ['#f2e8f0', 70, 200],
    hemiGround: 0x8cc66a,
    bounds: { minX: -38, maxX: 38, minZ: -36, maxZ: 6.5 },
    start: { x: 2.5, z: 5 },
    car: {
      at: TRAIN, name: 'Luotijuna', w: 15, d: 2.4,
      // the bullet train: long, white with a blue stripe and a pointy nose (front toward -x)
      build(W) {
        const T = window.THREE;
        const tr = new T.Group();
        W.box(13, 2.2, 2.2, C.train, 1.5, 0.4, 0, tr);
        W.box(13, 0.3, 2.24, C.trainBlue, 1.5, 1.1, 0, tr);
        const nose = W.ball(1.1, C.train, -5, 1.5, 0, tr);
        nose.scale.set(2.6, 1, 1);
        const noseStripe = W.ball(1.12, C.trainBlue, -5.1, 1.25, 0, tr);
        noseStripe.scale.set(2.5, 0.25, 1.01);
        W.box(1.4, 0.5, 1.6, '#2b3350', -6, 1.9, 0, tr);         // the driver's window
        for (let i = 0; i < 8; i++) W.box(0.8, 0.6, 2.25, '#2b3350', -3.2 + i * 1.5, 1.6, 0, tr);
        return tr;
      },
    },
    sign: { text: 'Japani', x: -3, z: 2 },
    hotel: {
      x: -26, z: 3, rot: Math.PI / 2,
      look: { wall: '#f6efe2', trim: C.red, awning: '#2f6fb8', sign: 'HOTELLI' },
      room: {
        name: 'Hotelli Sakura', wall: '#fbeef2', border: C.red, floor: '#c8a878',
        blanket: '#ffb7d0', rug: '#2f6fb8',
        hello: 'Hotelli Sakura! Ikkunasta näkyy lumihuippuinen vuori. Napauta sänkyä, niin mennään nukkumaan.',
      },
    },
    airport: { title: 'TOKION LENTOKENTTÄ', hall: '#f6f0f4', floor: '#d6ccd6', plant: 'leafy' },
    photo: { name: 'Japani', sticker: '🌸' },
    poster: { say: 'Juliste Japanista! Kirsikankukat ja lumihuippuinen vuori.' },
    stamp: {
      ink: '#d8342c',
      pic(c) {   // the torii gate
        c.lineWidth = 2;
        c.beginPath(); c.moveTo(-9, -7); c.quadraticCurveTo(0, -9.5, 9, -7); c.stroke();
        c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(-6.5, -3.5); c.lineTo(6.5, -3.5); c.stroke();
        c.beginPath(); c.moveTo(-5, -7); c.lineTo(-5.5, 7); c.moveTo(5, -7); c.lineTo(5.5, 7); c.stroke();
      },
    },
    welcome: 'Konnichiwa! Tervetuloa Japaniin! Luotijuna oli tosi nopea!',
    morning: 'Ohayou – hyvää huomenta, Japani!',
    onArrive() {
      const gifts = (MP.state.treasures.gifts = MP.state.treasures.gifts || {});
      if (gifts.kimono) return '';
      gifts.kimono = true;
      MP.save();
      return ' Ja sain kimonon! Se on nyt vaatekaapissa.';
    },

    // -------------------------------------------------------------------------
    build(W, S, T) {
      const { box, cyl, ball, flat, disc, block } = W;

      // --- The railway behind you ---
      flat(400, 2.6, '#9a9283', 0, TRAIN.z, 0.012);
      for (const rz of [-0.7, 0.7]) flat(400, 0.12, '#5a5a6a', 0, TRAIN.z + rz, 0.02);
      for (let x = -60; x < 60; x += 1.5) flat(0.3, 2.2, '#6b4a3a', x, TRAIN.z, 0.015);
      W.block(0, TRAIN.z, 400, 2.6);

      // --- A gravel path from the train to the pagoda ---
      flat(3.4, 34, C.gravel, 0, -12, 0.014);
      flat(40, 3, C.gravel, 6, -9, 0.013);

      // --- The snowy mountain far away ---
      const fuji = new T.Mesh(new T.ConeGeometry(70, 60, 32, 1, true), W.mat('#7d8fb0'));
      fuji.position.set(-50, 28, -200);
      W.add(fuji);
      const snow = new T.Mesh(new T.ConeGeometry(25, 21.5, 32), W.mat('#ffffff'));
      snow.position.set(-50, 47.5, -200);
      W.add(snow);

      // --- The red torii gate ---
      const torii = new T.Group();
      for (const sx of [-2.2, 2.2]) cyl(0.25, 4.6, C.red, sx, 0, 0, torii);
      box(6.4, 0.45, 0.5, '#2b2340', 0, 4.6, 0, torii);
      const top = box(6, 0.3, 0.45, C.red, 0, 4.3, 0, torii);
      top.scale.y = 1;
      box(5.2, 0.3, 0.35, C.red, 0, 3.5, 0, torii);
      torii.position.set(TORII.x, 0, TORII.z);
      W.add(torii);
      block(TORII.x - 2.2, TORII.z, 0.6, 0.6);
      block(TORII.x + 2.2, TORII.z, 0.6, 0.6);
      W.clickable(torii, 'torii');

      // --- The pagoda: five floors with curvy roofs ---
      const pg = new T.Group();
      box(6, 0.6, 6, '#c9c0ad', 0, 0, 0, pg);
      for (let i = 0; i < 5; i++) {
        const w = 4.2 - i * 0.55, y = 0.6 + i * 2;
        box(w, 1.5, w, '#f2ead8', 0, y, 0, pg);
        box(w * 0.4, 1, 0.1, C.red, 0, y, w / 2 + 0.02, pg);
        const roof = new T.Mesh(new T.ConeGeometry(1, 1, 4), W.mat('#3a3a48'));
        roof.rotation.y = Math.PI / 4;
        roof.scale.set((w + 1.8) / Math.SQRT2 * Math.SQRT2, 0.9, (w + 1.8) / Math.SQRT2 * Math.SQRT2);
        roof.position.y = y + 1.9;
        pg.add(roof);
      }
      cyl(0.08, 2.6, '#c8913a', 0, 11, 0, pg);
      pg.position.set(PAGODA.x, 0, PAGODA.z);
      W.add(pg);
      block(PAGODA.x, PAGODA.z, 6, 6);
      W.clickable(pg, 'pagoda');

      // stone lanterns along the path
      for (const [lx, lz] of [[-2.6, -6], [2.6, -6], [-2.6, -19], [2.6, -19]]) {
        const ln = new T.Group();
        cyl(0.25, 0.9, '#a8a296', 0, 0, 0, ln);
        box(0.9, 0.7, 0.9, '#c9c0ad', 0, 0.9, 0, ln);
        box(0.5, 0.35, 0.92, '#fff2b0', 0, 1.05, 0, ln);
        const lr = new T.Mesh(new T.ConeGeometry(0.8, 0.5, 4), W.mat('#a8a296'));
        lr.rotation.y = Math.PI / 4;
        lr.position.y = 1.85;
        ln.add(lr);
        ln.position.set(lx, 0, lz);
        W.add(ln);
        block(lx, lz, 0.9, 0.9);
      }

      // --- The koi pond ---
      disc(POND.r + 0.5, '#a8a296', POND.x, POND.z, 0.015);
      const pond = disc(POND.r, C.water, POND.x, POND.z, 0.03);
      W.clickable(pond, 'koi');
      block(POND.x, POND.z, POND.r * 1.7, POND.r * 1.7);
      S.koi = [];
      for (let i = 0; i < 5; i++) {
        const f = new T.Group();
        const body = ball(0.28, i % 2 ? '#ff8a3a' : '#ffffff', 0, 0, 0, f);
        body.scale.set(0.5, 0.35, 1.3);
        if (i % 2 === 0) { const spot = ball(0.16, '#ff5a2a', 0, 0.06, 0.1, f); spot.scale.set(0.8, 0.5, 1); }
        const tail = new T.Mesh(new T.ConeGeometry(0.16, 0.35, 4), W.mat('#ff8a3a'));
        tail.rotation.x = -Math.PI / 2;
        tail.position.z = -0.45;
        f.add(tail);
        f.position.set(POND.x, 0.06, POND.z);
        W.add(f);
        W.clickable(f, 'koi');
        S.koi.push({ g: f, a: i * 1.3, r: 1.2 + (i % 3) * 0.9, speed: 0.4 + i * 0.07 });
      }
      // a little red bridge over the pond
      const br = new T.Group();
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI * i / 8;
        box(1.4, 0.15, 0.6, C.red, 0, Math.sin(a) * 0.8, -2.4 + i * 0.6, br);
      }
      br.position.set(POND.x + 3.4, 0, POND.z);
      br.rotation.y = Math.PI / 2;
      W.add(br);

      // --- Cherry blossom trees ---
      S.trees = [];
      TREES.forEach(([x, z], i) => {
        const g = new T.Group();
        const tr = cyl(0.25, 2.2, C.trunk, 0, 0, 0, g, 0.16);
        tr.rotation.z = (i % 2 ? 1 : -1) * 0.08;
        for (const [bx, by, bz, r] of [[0, 3, 0, 1.6], [1.2, 2.6, 0.4, 1.1], [-1.1, 2.7, -0.3, 1.2], [0.2, 2.5, 1.1, 1], [-0.3, 3.6, -0.6, 1]]) {
          ball(r, (bx + bz) > 0 ? C.blossom : C.blossom2, bx, by, bz, g);
        }
        g.position.set(x, 0, z);
        W.add(g);
        block(x, z, 0.7, 0.7);
        W.clickable(g, 'tree' + i);
        S.trees.push(g);
      });
      // petals for the wind
      S.petals = [];
      const petalGeo = new T.PlaneGeometry(0.16, 0.12);
      for (let i = 0; i < 60; i++) {
        const m = new T.Mesh(petalGeo, new T.MeshBasicMaterial({ color: i % 2 ? '#ffb7d0' : '#ffe2ec', side: T.DoubleSide }));
        m.visible = false;
        W.add(m);
        S.petals.push({ m, life: 0 });
      }

      // --- The sushi bar with a conveyor belt ---
      const sb = new T.Group();
      box(8, 4, 4, '#f2ead8', 0, 0, -1.5, sb);                      // the little house
      const roof = box(9, 0.4, 5, '#3a3a48', 0, 4, -1.5, sb);
      roof.rotation.x = -0.12;
      for (let i = 0; i < 4; i++) box(1.6, 1.1, 0.06, i % 2 ? '#2f6fb8' : '#f4f6fa', -2.7 + i * 1.8, 2.6, 0.53, sb);   // noren curtains
      box(7.6, 1.1, 1.6, '#a0703c', 0, 0, 1.3, sb);                // the counter
      box(7.6, 0.08, 1.2, '#5a5a73', 0, 1.1, 1.3, sb);              // the belt
      sb.position.set(SUSHI.x, 0, SUSHI.z);
      W.add(sb);
      block(SUSHI.x, SUSHI.z - 0.4, 8.2, 5.4);
      W.clickable(sb, 'sushi');
      const sign = W.sign('SUSHI', SUSHI.x, 4.9, SUSHI.z + 0.6, 0, '#d8342c', '#ffffff', null, 2.4);
      void sign;
      S.plates = [];
      const fishColors = ['#ff8a5a', '#d8342c', '#3cb371', '#ff9f7a', '#ffd23f', '#7bd389'];
      for (let i = 0; i < 6; i++) {
        const pl = new T.Group();
        cyl(0.32, 0.06, i % 2 ? '#e0559a' : '#4a78c8', 0, 0, 0, pl);
        const rice = box(0.38, 0.14, 0.22, '#ffffff', 0, 0.06, 0, pl);
        void rice;
        box(0.42, 0.06, 0.24, fishColors[i], 0, 0.2, 0, pl);
        W.add(pl);
        W.clickable(pl, 'sushi');
        S.plates.push({ g: pl, u: i / 6, eatenAt: -99 });
      }

      // --- The friendly deer ---
      const deer = new T.Group();
      const db = ball(0.6, '#b07a4a', 0, 1.15, 0, deer); db.scale.set(0.8, 0.75, 1.4);
      for (const [lx, lz] of [[-0.25, 0.55], [0.25, 0.55], [-0.25, -0.55], [0.25, -0.55]]) cyl(0.07, 0.9, '#9a6a3a', lx, 0, lz, deer);
      for (const [sx, sz] of [[-0.25, 0.3], [0.2, -0.1], [-0.1, -0.45]]) ball(0.08, '#f4e6d0', sx, 1.5, sz, deer);
      const neck = new T.Group();
      const nk = cyl(0.13, 0.8, '#b07a4a', 0, 0, 0, neck); nk.rotation.x = 0.4;
      const hd = ball(0.25, '#b07a4a', 0, 0.85, 0.35, neck); hd.scale.set(0.8, 0.85, 1.3);
      ball(0.06, '#1b1b2a', 0, 0.82, 0.68, neck);
      for (const k of [-1, 1]) {
        const ear = ball(0.1, '#b07a4a', k * 0.2, 1.05, 0.2, neck); ear.scale.set(1.6, 0.6, 0.5);
        ball(0.04, '#1b1b2a', k * 0.1, 0.92, 0.6, neck);
      }
      neck.position.set(0, 1.4, 0.6);
      deer.add(neck);
      S.deerNeck = neck;
      deer.position.set(DEER_HOME.x, 0, DEER_HOME.z);
      W.add(deer);
      W.clickable(deer, 'deer');
      S.deer = deer;
      S.bowAt = -99;
      S.koiAt = -99;
    },

    spots: (function () {
      const spots = {
        torii: {
          at: () => ({ x: TORII.x, z: TORII.z + 2.5 }),
          use(sc) {
            sc.say('Punainen torii-portti! Sen läpi kävellään temppelin puutarhaan.', 4);
            MP.sfx.tune();
          },
        },
        pagoda: {
          at: () => ({ x: PAGODA.x, z: PAGODA.z + 4.4 }),
          use(sc) {
            sc.say('Pagodi! Siinä on viisi kerrosta ja viisi kattoa päällekkäin.', 4);
            MP.sfx.bling();
          },
        },
        koi: {
          at: () => ({ x: POND.x + 1.5, z: POND.z + POND.r + 1.4 }),
          use(sc, S) {
            S.koiAt = MP.time;
            sc.say('Koi-kalat uivat luokse! Ne ovat oransseja ja valkoisia.', 3.5);
            MP.sfx.flush();
          },
        },
        sushi: {
          at: () => ({ x: SUSHI.x, z: SUSHI.z + 3.6 }),
          use(sc, S) {
            // the plate that is closest to you on the belt
            const now = MP.time;
            let best = null, bd = 1e9;
            for (const p of S.plates) {
              if (now - p.eatenAt < 6) continue;
              const d = Math.hypot(p.g.position.x - sc.p.x, p.g.position.z - sc.p.z);
              if (d < bd) { bd = d; best = p; }
            }
            if (!best) { sc.say('Odotetaan, että uusia lautasia tulee.', 2.5); return; }
            best.eatenAt = now;
            const i = S.plates.indexOf(best);
            sc.say('Nam! ' + SUSHI_NAMES[i % SUSHI_NAMES.length] + '! Napauta lisää lautasia.', 3);
            MP.sfx.nom();
          },
        },
        deer: {
          here: true,
          use(sc, S) {
            S.bowAt = MP.time;
            sc.say('Kumarretaan peuralle… ja peura kumartaa takaisin! Kohtelias peura!', 4);
            MP.sfx.boing();
          },
        },
      };
      TREES.forEach((_, i) => {
        spots['tree' + i] = {
          here: true,
          use(sc, S) {
            const tree = S.trees[i];
            let n = 0;
            for (const p of S.petals) {
              if (p.life > 0 || n >= 24) continue;
              n++;
              p.life = 2.6 + Math.random();
              p.m.position.set(tree.position.x + (Math.random() - 0.5) * 2.4, 2.4 + Math.random() * 1.6, tree.position.z + (Math.random() - 0.5) * 2.4);
              p.v = { x: 1.2 + Math.random(), y: -0.4 - Math.random() * 0.4, z: (Math.random() - 0.5) * 0.8 };
              p.spin = Math.random() * 6;
            }
            sc.say(['Kirsikankukkia tuulessa! Ihanaa!', 'Terälehdet lentävät kuin vaaleanpunainen lumisade!'][i % 2], 3);
            MP.sfx.bling();
          },
        };
      });
      return spots;
    })(),

    hints: [
      { x: TORII.x, z: TORII.z + 2.5, r: 3.5, say: 'Torii-portti! Kävele sen läpi pagodille.' },
      { x: POND.x + 1.5, z: POND.z + POND.r + 1.4, r: 3.2, say: 'Lampi täynnä koi-kaloja! Napauta lampea.' },
      { x: SUSHI.x, z: SUSHI.z + 3.6, r: 3.5, say: 'Sushibaari! Napauta lautasia, kun ne kulkevat ohi.' },
      { x: DEER_HOME.x, z: DEER_HOME.z + 1, r: 3.5, say: 'Peura! Napauta sitä, niin kumarretaan.' },
    ],

    enter(sc, S) {
      S.bowAt = S.koiAt = -99;
      S.plates.forEach((p) => { p.eatenAt = -99; });
      S.petals.forEach((p) => { p.life = 0; p.m.visible = false; });
    },

    update(sc, S, dt, now) {
      // --- The sushi plates go round and round on the belt ---
      for (const p of S.plates) {
        p.u = (p.u + dt * 0.06) % 1;
        const x = SUSHI.x - 3.5 + p.u * 7;
        p.g.position.set(x, 1.2, SUSHI.z + 1.3);
        p.g.visible = now - p.eatenAt > 6;
      }

      // --- Koi swim in circles, or come to you ---
      const come = now - S.koiAt < 4.5;
      for (const k of S.koi) {
        k.a += dt * k.speed * (come ? 0.3 : 1);
        let x = POND.x + Math.cos(k.a) * k.r, z = POND.z + Math.sin(k.a) * k.r;
        if (come) {
          const tx = POND.x + 1.2, tz = POND.z + POND.r - 0.8;
          const u = MP.clamp((now - S.koiAt) * 0.8, 0, 1) * (1 - MP.clamp((now - S.koiAt - 3.5) * 1, 0, 1));
          x += (tx + Math.cos(k.a * 3) * 0.6 - x) * u;
          z += (tz + Math.sin(k.a * 3) * 0.3 - z) * u;
        }
        const prev = k.g.position.clone();
        k.g.position.set(x, 0.06, z);
        const dx = x - prev.x, dz = z - prev.z;
        if (Math.abs(dx) + Math.abs(dz) > 1e-4) k.g.rotation.y = Math.atan2(dx, dz);
      }

      // --- Petals in the wind ---
      for (const p of S.petals) {
        if (p.life <= 0) { p.m.visible = false; continue; }
        p.life -= dt;
        p.m.visible = true;
        p.m.position.x += p.v.x * dt;
        p.m.position.y = Math.max(0.05, p.m.position.y + p.v.y * dt);
        p.m.position.z += p.v.z * dt + Math.sin(now * 3 + p.spin) * 0.01;
        p.m.rotation.set(now * 3 + p.spin, now * 2, 0);
      }

      // --- The deer walks slowly and bows when you bow ---
      const bow = now - S.bowAt;
      const bowing = bow < 2;
      if (!bowing) {
        S.deerT = (S.deerT || 0) + dt * 0.18;
        S.deer.position.set(DEER_HOME.x + Math.sin(S.deerT) * 2, 0, DEER_HOME.z + Math.sin(S.deerT * 2) * 1);
        S.deer.rotation.y = Math.atan2(Math.cos(S.deerT) * 2, Math.cos(S.deerT * 2) * 2);
      } else {
        S.deer.rotation.y += MP.clamp(Math.atan2(sc.p.x - S.deer.position.x, sc.p.z - S.deer.position.z) - S.deer.rotation.y, -dt * 4, dt * 4);
      }
      S.deerNeck.rotation.x = bowing ? Math.sin(MP.clamp(bow / 2, 0, 1) * Math.PI) * 0.9 : Math.sin(now * 0.8) * 0.06;
      // you bow too (a little dip)
      sc.y = bowing && bow < 1.6 ? -Math.sin(MP.clamp(bow / 1.6, 0, 1) * Math.PI) * 0.12 : 0;
    },
  });
})();
