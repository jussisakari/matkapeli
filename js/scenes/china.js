// china.js – KIINA (China)! Pandas, the Great Wall and a dancing dragon.
// Things to do:
//   the Great Wall: it goes on and on and on… you get tired, and a big panda
//     gives you a piggyback ride;
//   baby pandas on a bamboo hill: tap and they do a somersault and roll;
//   the dragon dance: a long dragon with many legs – join in at the tail!;
//   a dumpling stand: pick a dumpling with chopsticks (it slips and bounces…);
//   red paper lanterns: let one fly up into the sky; and fireworks!
// Made with the country kit (country3d.js).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const C = {
    sky: '#a6d4f2',
    grass: '#86b45a',
    wall: '#b8a888',
    wallDark: '#9a8a6a',
    red: '#d8342c',
    gold: '#f2c230',
    bamboo: '#6aa84f',
  };

  const WALL_X = -20;                         // the Great Wall runs along here (z from 8 to -40)
  const HILL = { x: 16, z: -16 };
  const DUMPLING = { x: 6, z: -6 };
  const LANTERNS = { x: -8, z: -14 };
  const FIREWORKS = { x: 4, z: -28 };
  const DRAGON_PATH = (u) => ({ x: Math.sin(u) * 8 - 2, z: -20 + Math.cos(u) * 5 });

  MP.LANDSCAPES = MP.LANDSCAPES || {};
  MP.LANDSCAPES.china = function (c, r, horizon, k, wrap, sx) {
    const g = c.createLinearGradient(0, r.y, 0, horizon);
    g.addColorStop(0, '#8fc8ec'); g.addColorStop(1, '#eef6f0');
    c.fillStyle = g;
    c.fillRect(r.x, r.y, r.w, r.h);
    MP.draw('sun', c, 0, 0, { x: r.x + r.w * 0.85, y: r.y + r.h * 0.16, r: 8 * k + 2 });
    // green mountains
    c.fillStyle = '#7aa86a';
    c.beginPath(); c.moveTo(r.x, horizon);
    for (let x = 0; x <= r.w; x += 6) c.lineTo(r.x + x, horizon - 22 * k - Math.abs(Math.sin((x + sx(0.2)) / 30)) * 20 * k);
    c.lineTo(r.x + r.w, horizon); c.closePath(); c.fill();
    // the Great Wall zig-zagging over them
    c.strokeStyle = '#c8b898'; c.lineWidth = 3 * k;
    c.beginPath();
    for (let x = 0; x <= r.w; x += 6) {
      const y = horizon - 14 * k - Math.abs(Math.sin((x + sx(0.2)) / 30)) * 16 * k;
      if (x === 0) c.moveTo(r.x + x, y); else c.lineTo(r.x + x, y);
    }
    c.stroke();
    c.fillStyle = '#86b45a';
    c.fillRect(r.x, horizon, r.w, r.y + r.h - horizon);
    // a panda
    const px = wrap(r.x + r.w * 0.3 + sx(1));
    const py = horizon + 12 * k;
    c.fillStyle = '#ffffff';
    c.beginPath(); c.arc(px, py, 6 * k, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(px, py - 8 * k, 4.5 * k, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1b1b2a';
    c.beginPath(); c.arc(px - 3.5 * k, py - 12 * k, 1.6 * k, 0, Math.PI * 2); c.arc(px + 3.5 * k, py - 12 * k, 1.6 * k, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(px - 1.6 * k, py - 8.5 * k, 1 * k, 1.4 * k, 0, 0, Math.PI * 2); c.ellipse(px + 1.6 * k, py - 8.5 * k, 1 * k, 1.4 * k, 0, 0, Math.PI * 2); c.fill();
    // red lanterns
    for (let i = 0; i < 4; i++) {
      const lx = wrap(r.x + r.w * 0.55 + i * 14 * k + sx(1));
      c.fillStyle = '#d8342c';
      c.beginPath(); c.ellipse(lx, r.y + r.h * 0.2 + (i % 2) * 4 * k, 3.4 * k, 4 * k, 0, 0, Math.PI * 2); c.fill();
    }
  };

  // a panda (3D), standing on four legs, facing +z
  function panda(W, T, s) {
    const g = new T.Group();
    const b = W.ball(0.8, '#ffffff', 0, 0.9, 0, g); b.scale.set(1, 0.85, 1.3);
    for (const [lx, lz] of [[-0.45, 0.6], [0.45, 0.6], [-0.45, -0.6], [0.45, -0.6]]) {
      const leg = W.cyl(0.24, 0.6, '#1b1b2a', lx, 0, lz, g); void leg;
    }
    const band = W.ball(0.82, '#1b1b2a', 0, 1, 0.35, g); band.scale.set(1.02, 0.5, 0.35);
    const head = new T.Group();
    W.ball(0.55, '#ffffff', 0, 0, 0, head);
    for (const k of [-1, 1]) {
      W.ball(0.18, '#1b1b2a', k * 0.38, 0.42, -0.05, head);
      const patch = W.ball(0.12, '#1b1b2a', k * 0.18, 0.05, 0.47, head); patch.scale.set(1, 1.4, 0.5);
      W.ball(0.04, '#ffffff', k * 0.18, 0.08, 0.53, head);
    }
    W.ball(0.08, '#1b1b2a', 0, -0.12, 0.54, head);
    head.position.set(0, 1.45, 0.95);
    g.add(head);
    g.scale.setScalar(s || 1);
    return g;
  }

  MP.makeCountry({
    id: 'china', name: 'Kiina', to: 'Kiinaan', city: 'Peking', time: '13:40',
    land: 'china',
    flag(c, x, y, w, h) {
      c.fillStyle = '#de2910'; c.fillRect(x, y, w, h);
      c.fillStyle = '#ffde00';
      c.beginPath(); c.arc(x + w * 0.18, y + h * 0.3, Math.max(0.6, h * 0.15), 0, Math.PI * 2); c.fill();
      for (const [sx, sy] of [[0.34, 0.12], [0.4, 0.24], [0.4, 0.4], [0.34, 0.52]]) { c.beginPath(); c.arc(x + w * sx, y + h * sy, Math.max(0.3, h * 0.05), 0, Math.PI * 2); c.fill(); }
    },
    sky: C.sky,
    ground: C.grass,
    fog: ['#eef6f0', 60, 190],
    hemiGround: 0x86b45a,
    people: { hello: ['Nǐ hǎo! (Hei!)'] },
    bounds: { minX: -17, maxX: 32, minZ: -36, maxZ: 10 },
    car: { at: { x: 5.5, z: 6.5 }, color: '#d8342c', name: 'Taksi' },
    sign: { text: 'Kiina', x: -3, z: 1 },
    hotel: {
      x: 28, z: 0, rot: -Math.PI / 2,
      look: { wall: '#f6efe2', trim: C.red, awning: C.gold, sign: 'HOTELLI' },
      room: {
        name: 'Hotelli Panda', wall: '#fbeee6', border: C.red, floor: '#8a5a32',
        blanket: C.red, rug: C.gold,
        hello: 'Hotelli Panda! Ikkunasta näkyy Kiinan muuri. Napauta sänkyä, niin mennään nukkumaan.',
      },
    },
    airport: { title: 'PEKINGIN LENTOKENTTÄ', hall: '#f6eee6', floor: '#d6c6b6', plant: 'leafy' },
    photo: { name: 'Kiina', sticker: '🐼' },
    poster: { say: 'Juliste Kiinasta! Pandoja ja Kiinan muuri.' },
    stamp: {
      ink: '#1b1b2a',
      pic(c) {   // a panda face
        c.beginPath(); c.arc(0, 1, 7, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(-5.5, -5, 2.4, 0, Math.PI * 2); c.arc(5.5, -5, 2.4, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(-2.6, 0, 1.6, 2.2, 0.4, 0, Math.PI * 2); c.ellipse(2.6, 0, 1.6, 2.2, -0.4, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(0, 4, 1, 0, Math.PI * 2); c.fill();
      },
    },
    welcome: 'Ni hao! Tervetuloa Kiinaan! Tuolla on Kiinan muuri – ja pandoja!',
    morning: 'Ni hao, hyvää huomenta Kiina!',

    // -------------------------------------------------------------------------
    build(W, S, T) {
      const { box, cyl, ball, block } = W;

      // --- The Great Wall: on and on and on (up a little hill and far away) ---
      const wall = new T.Group();
      for (let i = 0; i < 40; i++) {
        const z = 10 - i * 4;
        const y = Math.max(0, Math.sin(i * 0.25) * 3 + i * 0.1);
        box(3, 3 + y, 4.1, C.wall, 0, 0, z, wall);
        for (const sx of [-1.3, 1.3]) for (let k = 0; k < 2; k++) box(0.4, 0.6, 0.8, C.wallDark, sx, 3 + y, z - 1 + k * 2, wall);
        if (i % 8 === 4) {
          box(4.4, 3, 4.4, C.wallDark, 0, 3 + y, z, wall);       // a watchtower
          const roof = new T.Mesh(new T.ConeGeometry(3.4, 1.6, 4), W.mat(C.red));
          roof.rotation.y = Math.PI / 4;
          roof.position.set(0, 6.8 + y + y * 0 + 0.8, z);
          wall.add(roof);
        }
      }
      wall.position.set(WALL_X, 0, 0);
      W.add(wall);
      block(WALL_X, -70, 3.4, 170);
      W.clickable(wall, 'wall');
      // the big panda that gives a ride (waits by the wall)
      S.bigPanda = panda(W, T, 1.5);
      S.bigPanda.position.set(WALL_X + 3.5, 0, -4);
      W.add(S.bigPanda);
      W.clickable(S.bigPanda, 'wall');

      // --- The bamboo hill with baby pandas ---
      const hill = new T.Mesh(new T.SphereGeometry(7, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), W.mat('#79a84a'));
      hill.scale.y = 0.45;
      hill.position.set(HILL.x, 0, HILL.z);
      W.add(hill);
      block(HILL.x, HILL.z, 8, 8);
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2, r = 7.5 + (i % 3) * 0.6;
        const bx = HILL.x + Math.cos(a) * r, bz = HILL.z + Math.sin(a) * r;
        if (bz > HILL.z + 5) continue;   // keep the front open
        for (let k = 0; k < 3; k++) {
          const st = cyl(0.07, 3 + k * 0.8, C.bamboo, bx + k * 0.3, 0, bz + (k % 2) * 0.3);
          void st;
          const lf = ball(0.3, '#4f8a3a', bx + k * 0.3, 3 + k * 0.8, bz); lf.scale.set(1.5, 0.4, 0.8);
        }
      }
      S.pandas = [];
      for (let i = 0; i < 3; i++) {
        const p = panda(W, T, 0.55);
        p.position.set(HILL.x - 2.5 + i * 2.5, 2.4 - Math.abs(i - 1) * 0.6, HILL.z + 1.5);
        p.rotation.y = 0.3 * (i - 1);
        W.add(p);
        W.clickable(p, 'panda');
        S.pandas.push({ g: p, home: p.position.clone(), rollAt: -99 });
      }

      // --- The dragon dance: a long red-and-gold dragon on many legs ---
      S.dragon = [];
      const head = new T.Group();
      ball(0.7, C.red, 0, 1.6, 0, head);
      ball(0.2, '#ffffff', 0.35, 1.9, 0.5, head);
      ball(0.2, '#ffffff', -0.35, 1.9, 0.5, head);
      ball(0.1, '#1b1b2a', 0.35, 1.9, 0.68, head);
      ball(0.1, '#1b1b2a', -0.35, 1.9, 0.68, head);
      const jaw = box(0.9, 0.2, 0.7, C.gold, 0, 1.15, 0.45, head); void jaw;
      for (const k of [-1, 1]) { const horn = new T.Mesh(new T.ConeGeometry(0.1, 0.6, 6), W.mat(C.gold)); horn.position.set(k * 0.35, 2.4, -0.1); head.add(horn); }
      W.add(head);
      W.clickable(head, 'dragon');
      S.dragon.push(head);
      for (let i = 0; i < 10; i++) {
        const seg = new T.Group();
        const b = ball(0.55, i % 2 ? C.gold : C.red, 0, 1.4, 0, seg); b.scale.set(1, 0.8, 1.2);
        for (const k of [-0.2, 0.2]) cyl(0.07, 1.1, '#2b2340', k, 0, 0, seg);     // the dancers' legs
        W.add(seg);
        W.clickable(seg, 'dragon');
        S.dragon.push(seg);
      }

      // --- The dumpling stand ---
      const ds = new T.Group();
      box(2.6, 1, 1.2, '#a0703c', 0, 0, 0, ds);
      cyl(0.5, 0.35, '#c8a06a', -0.6, 1, 0, ds);              // a steamer basket
      for (let i = 0; i < 3; i++) ball(0.14, '#f6efe2', -0.75 + i * 0.15, 1.38, 0.05 * i, ds);
      box(3, 0.1, 1.6, C.red, 0, 2.1, 0, ds);
      for (const sx of [-1.3, 1.3]) cyl(0.05, 2.1, '#8a5a32', sx, 0, 0.6, ds);
      ds.position.set(DUMPLING.x, 0, DUMPLING.z);
      W.add(ds);
      block(DUMPLING.x, DUMPLING.z, 2.8, 1.4);
      W.clickable(ds, 'dumpling');
      S.dumpling = ball(0.16, '#f6efe2', DUMPLING.x + 0.6, 1.2, DUMPLING.z);
      S.chopsticks = new T.Group();
      for (const k of [-0.05, 0.05]) { const st = box(0.03, 0.03, 0.9, '#8a5a32', k, 0, -0.45, S.chopsticks); void st; }
      W.add(S.chopsticks);
      S.dumplingTry = 0;
      S.dumplingAt = -99;

      // --- Red lanterns on a string, and one that can fly ---
      for (const sx of [-3, 3]) cyl(0.08, 4, '#8a5a32', LANTERNS.x + sx, 0, LANTERNS.z);
      box(6, 0.04, 0.04, '#2b2340', LANTERNS.x, 3.9, LANTERNS.z);
      const lanternGroup = new T.Group();
      for (let i = 0; i < 5; i++) {
        const l = ball(0.32, C.red, LANTERNS.x - 2.4 + i * 1.2, 3.4, LANTERNS.z, lanternGroup); l.scale.y = 1.2;
        box(0.3, 0.08, 0.3, C.gold, LANTERNS.x - 2.4 + i * 1.2, 3.75, LANTERNS.z, lanternGroup);
      }
      W.add(lanternGroup);
      W.clickable(lanternGroup, 'lantern');
      block(LANTERNS.x - 3, LANTERNS.z, 0.3, 0.3);
      block(LANTERNS.x + 3, LANTERNS.z, 0.3, 0.3);
      S.flyLanterns = [];
      for (let i = 0; i < 6; i++) {
        const l = new T.Group();
        const body = ball(0.4, '#ffb86a', 0, 0, 0, l); body.scale.y = 1.3;
        body.material = new T.MeshBasicMaterial({ color: '#ffb86a' });
        l.visible = false;
        W.add(l);
        S.flyLanterns.push({ g: l, at: -99 });
      }

      // --- Fireworks ---
      const fw = new T.Group();
      box(1.2, 0.8, 1.2, C.red, 0, 0, 0, fw);
      for (let i = 0; i < 4; i++) cyl(0.1, 0.8, C.gold, -0.3 + (i % 2) * 0.6, 0.8, -0.3 + Math.floor(i / 2) * 0.6, fw);
      fw.position.set(FIREWORKS.x, 0, FIREWORKS.z);
      W.add(fw);
      block(FIREWORKS.x, FIREWORKS.z, 1.4, 1.4);
      W.clickable(fw, 'fireworks');
      S.sparks = [];
      for (let i = 0; i < 60; i++) {
        const m = new T.Mesh(new T.SphereGeometry(0.16, 6, 4), new T.MeshBasicMaterial({ color: ['#ff5d8f', '#ffd23f', '#4cc9f0', '#7bd389', '#ffffff'][i % 5] }));
        m.visible = false;
        W.add(m);
        S.sparks.push({ m, life: 0 });
      }
    },

    spots: {
      wall: {
        at: () => ({ x: WALL_X + 3.2, z: 2 }),
        use(sc, S) {
          sc.say('Kiinan muuri! Se jatkuu ja jatkuu ja jatkuu… Huh, väsyttää! Hei – iso panda antaa reppuselän!', 4.5);
          sc.pandaRide = { t: 0 };
          sc.frozen = true;
          sc.target = null;
          MP.sfx.boing();
        },
      },
      panda: {
        here: true,
        use(sc, S) {
          S.pandas.forEach((p, i) => { p.rollAt = MP.time + i * 0.3; });
          sc.say('Pandanpoikaset tekevät kuperkeikan ja kierivät mäkeä alas! Hihii!', 3.5);
          MP.sfx.boing();
        },
      },
      dragon: {
        here: true,
        use(sc, S) {
          if (sc.dance) return;
          sc.dance = { t: 0 };
          sc.frozen = true;
          sc.target = null;
          sc.say('Lohikäärmetanssi! Minä pääsen hännäksi! Rummut pum pum!', 4);
          for (let i = 0; i < 12; i++) setTimeout(() => { if (MP.scene === MP.scenes.china) MP.sfx.kick(); }, i * 400);
        },
      },
      dumpling: {
        at: () => ({ x: DUMPLING.x, z: DUMPLING.z + 2 }),
        use(sc, S) {
          S.dumplingTry++;
          S.dumplingAt = MP.time;
          const n = S.dumplingTry % 3;
          if (n === 1) { sc.say('Nyytti puikoilla… voi ei, se liukui pois! Pomppis!', 3); MP.sfx.boing(); }
          else if (n === 2) { sc.say('Uudestaan… se pomppasi taas karkuun!', 3); MP.sfx.boing(); }
          else { sc.say('Sain sen! Nam, ihana nyytti!', 3); MP.sfx.nom(); }
        },
      },
      lantern: {
        at: () => ({ x: LANTERNS.x, z: LANTERNS.z + 2 }),
        use(sc, S) {
          const l = S.flyLanterns.find((q) => MP.time - q.at > 8) || S.flyLanterns[0];
          l.at = MP.time;
          l.g.visible = true;
          sc.say('Lyhty lentää taivaalle! Toivotaan jotain kivaa.', 3.5);
          MP.sfx.bling();
        },
      },
      fireworks: {
        at: () => ({ x: FIREWORKS.x, z: FIREWORKS.z + 2.4 }),
        use(sc, S) {
          let n = 0;
          for (let burst = 0; burst < 3; burst++) {
            const cx = FIREWORKS.x - 6 + burst * 6, cy = 12 + burst * 2, cz = FIREWORKS.z - 10;
            for (let i = 0; i < 20; i++, n++) {
              const s = S.sparks[n];
              const a = i / 20 * Math.PI * 2;
              s.life = 1.6 + burst * 0.4;
              s.delay = burst * 0.4;
              s.m.position.set(cx, cy, cz);
              s.v = { x: Math.cos(a) * 4, y: Math.sin(a) * 4, z: (Math.random() - 0.5) * 2 };
            }
          }
          sc.say('Ilotulitus! Puks! Paks! Pum! Ihanat värit!', 3.5);
          [0, 400, 800].forEach((d) => setTimeout(() => { if (MP.scene === MP.scenes.china) MP.sfx.kick(); }, d));
        },
      },
    },

    hints: [
      { x: WALL_X + 3.2, z: 2, r: 4, say: 'Kiinan muuri! Napauta sitä.' },
      { x: HILL.x - 2, z: HILL.z + 6, r: 4.5, say: 'Pandoja bambumäellä! Napauta pandaa.' },
      { x: DUMPLING.x, z: DUMPLING.z + 2, r: 3, say: 'Nyyttikoju! Otetaan nyytti puikoilla.' },
    ],

    enter(sc, S) {
      sc.pandaRide = null;
      sc.dance = null;
      sc.frozen = false;
      sc.y = 0;
      S.dumplingTry = 0;
      S.bigPanda.position.set(WALL_X + 3.5, 0, -4);
    },

    update(sc, S, dt, now) {
      // --- The dragon dances round and round ---
      S.dragonU = (S.dragonU || 0) + dt * 0.5;
      S.dragon.forEach((seg, i) => {
        const u = S.dragonU - i * 0.13;
        const p = DRAGON_PATH(u), q = DRAGON_PATH(u + 0.05);
        seg.position.set(p.x, Math.abs(Math.sin(now * 5 + i * 0.7)) * 0.35, p.z);
        seg.rotation.y = Math.atan2(q.x - p.x, q.z - p.z);
      });
      // joining the dance at the tail
      if (sc.dance) {
        sc.dance.t += dt;
        const tail = DRAGON_PATH(S.dragonU - 11 * 0.13 - 0.1);
        const ahead = DRAGON_PATH(S.dragonU - 11 * 0.13);
        sc.p.x = tail.x; sc.p.z = tail.z;
        sc.p.heading = Math.atan2(ahead.x - tail.x, -(ahead.z - tail.z));
        sc.y = Math.abs(Math.sin(now * 5)) * 0.25;
        sc.walking = true;
        sc.pose = { armUp: 0.8, mouth: 'open' };
        if (sc.dance.t > 7) {
          sc.dance = null; sc.frozen = false; sc.y = 0; sc.pose = null;
          sc.p.z = Math.min(sc.p.z + 3, 6);
          sc.say('Olipa hauska tanssi! Lohikäärme kiittää.', 3);
          MP.sfx.applause(1.5);
        }
      }

      // --- Piggyback ride on the big panda along the wall ---
      if (sc.pandaRide) {
        const r = sc.pandaRide;
        r.t += dt;
        const u = MP.clamp(r.t / 7, 0, 1);
        const z = 2 - Math.sin(u * Math.PI) * 28;
        S.bigPanda.position.set(WALL_X + 3.5, Math.abs(Math.sin(r.t * 4)) * 0.15, z);
        S.bigPanda.rotation.y = u < 0.5 ? Math.PI : 0;
        sc.p.x = WALL_X + 3.5;
        sc.p.z = z + (u < 0.5 ? 0.6 : -0.6);
        sc.p.heading = u < 0.5 ? 0 : Math.PI;
        sc.y = 1.7;
        sc.pose = { armUp: 0.6, mouth: 'open' };
        if (r.t > 7) {
          sc.pandaRide = null; sc.frozen = false; sc.y = 0; sc.pose = null;
          sc.p.x = WALL_X + 5;
          S.bigPanda.position.set(WALL_X + 3.5, 0, -4);
          S.bigPanda.rotation.y = 0;
          sc.say('Kiitos kyydistä, panda! Muuri on niin pitkä, ettei sen loppua näy.', 3.5);
        }
      }

      // --- Baby pandas: somersault and roll down the hill ---
      for (const p of S.pandas) {
        const u = now - p.rollAt;
        if (u > 0 && u < 2.4) {
          const k = u / 2.4;
          p.g.rotation.x = k * Math.PI * 4;
          p.g.position.set(p.home.x, Math.max(0.3, p.home.y * (1 - k)) + Math.sin(k * Math.PI) * 0.5, p.home.z + k * 4.5);
        } else if (u >= 2.4 && u < 5) {
          p.g.rotation.x = 0;
          p.g.position.set(p.home.x, 0.3, p.home.z + 4.5);
        } else {
          p.g.rotation.x = 0;
          p.g.position.copy(p.home);
        }
      }

      // --- The dumpling slips and bounces ---
      const du = now - S.dumplingAt;
      const slip = S.dumplingTry % 3 !== 0 && du < 1.2;
      S.chopsticks.position.set(DUMPLING.x + 0.6, 1.4 + (du < 0.4 ? 0.2 : 0), DUMPLING.z + 0.6);
      S.chopsticks.rotation.set(0.3, 0, 0);
      S.chopsticks.visible = du < 1.4;
      if (slip) S.dumpling.position.set(DUMPLING.x + 0.6 + du * 0.8, 1.2 + Math.abs(Math.sin(du * 8)) * 0.4 * (1.2 - du), DUMPLING.z);
      else if (du < 1.4 && S.dumplingTry > 0) S.dumpling.position.set(DUMPLING.x + 0.6, 1.6 + du * 0.3, DUMPLING.z + 0.6);
      else S.dumpling.position.set(DUMPLING.x + 0.6, 1.2, DUMPLING.z);

      // --- Flying lanterns ---
      for (const l of S.flyLanterns) {
        const u = now - l.at;
        if (u > 8) { l.g.visible = false; continue; }
        l.g.position.set(LANTERNS.x + Math.sin(u) * 1.5, 3.4 + u * 2.4, LANTERNS.z - u * 1.2);
      }

      // --- Fireworks ---
      for (const s of S.sparks) {
        if (s.life <= 0) { s.m.visible = false; continue; }
        if (s.delay > 0) { s.delay -= dt; s.m.visible = false; continue; }
        s.life -= dt;
        s.v.y -= 2 * dt;
        s.m.visible = true;
        s.m.position.x += s.v.x * dt; s.m.position.y += s.v.y * dt; s.m.position.z += s.v.z * dt;
      }
    },
  });
})();
