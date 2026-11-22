// australia.js – AUSTRALIA! Red sand, a blue sea and funny animals.
// You arrive in a jeep (and for one second everything is upside down –
// Australia is on the "bottom" of the globe!). Things to do:
//   a kangaroo (hops, a baby peeks out of the pouch, then a friendly boxing match),
//   a sleepy koala in a eucalyptus tree, a laughing kookaburra bird,
//   the white shell-roofed opera house by the harbour, surfing (swimsuit on!),
//   an emu that runs very fast, a barbecue where a seagull steals the sausage,
//   and a boomerang that comes back… and knocks your hat off.
// Made with the country kit (country3d.js).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  // Colors in Australia (Ella can change these)
  const C = {
    sky: '#7cc8f2',
    redSand: '#d9824a',
    beach: '#f1d9a6',
    sea: '#1e8fc9',
    shallow: '#58cfe0',
    rock: '#c2502a',
    gum: '#d8d2c4',          // eucalyptus bark
    gumLeaves: '#7fae8a',
    roo: '#b5764a',
    koala: '#9a9aa5',
    jeep: '#c8a24a',
  };

  const SHORE_Z = -29;
  const ROO = { x: 12, z: -7 };
  const TREE = { x: -13, z: -9 };
  const BIRD_TREE = { x: -21, z: -1 };
  const BBQ = { x: 7, z: -22 };
  const SURF = { x: -5, z: -25 };
  const BOOM = { x: 17, z: -17 };
  const EMU_HOME = { x: 23, z: 1 };

  // ---------------------------------------------------------------------------
  // The landscape picture (airport window, departures card, posters, flight)
  // ---------------------------------------------------------------------------
  MP.LANDSCAPES = MP.LANDSCAPES || {};
  MP.LANDSCAPES.outback = function (c, r, horizon, k, wrap, sx) {
    const g = c.createLinearGradient(0, r.y, 0, horizon);
    g.addColorStop(0, '#5fb8ee'); g.addColorStop(1, '#fde4c4');
    c.fillStyle = g;
    c.fillRect(r.x, r.y, r.w, r.h);
    MP.draw('sun', c, 0, 0, { x: r.x + r.w * 0.82, y: r.y + r.h * 0.18, r: 10 * k + 2 });
    // the big red rock (like Uluru)
    const ux = wrap(r.x + r.w * 0.45 + sx(0.3));
    c.fillStyle = '#c2502a';
    c.beginPath();
    c.moveTo(ux - 44 * k, horizon);
    c.quadraticCurveTo(ux - 40 * k, horizon - 22 * k, ux - 20 * k, horizon - 24 * k);
    c.lineTo(ux + 26 * k, horizon - 23 * k);
    c.quadraticCurveTo(ux + 42 * k, horizon - 20 * k, ux + 46 * k, horizon);
    c.closePath(); c.fill();
    c.fillStyle = '#a63f1f';
    for (let i = 0; i < 5; i++) c.fillRect(ux - 30 * k + i * 13 * k, horizon - 21 * k, 1.5 * k, 18 * k);
    c.fillStyle = '#d9824a';
    c.fillRect(r.x, horizon, r.w, r.y + r.h - horizon);
    // dry bushes
    c.fillStyle = '#8a9a52';
    for (let i = 0; i < 9; i++) {
      const x = wrap(r.x + i * 37 + 10 + sx(0.8));
      c.beginPath(); c.ellipse(x, horizon + 5 * k + (i % 3) * 4 * k, 6 * k, 3 * k, 0, 0, Math.PI * 2); c.fill();
    }
    // a kangaroo
    const kx = wrap(r.x + r.w * 0.22 + sx(1));
    const ky = horizon + 14 * k;
    c.fillStyle = '#8a4f2a';
    c.beginPath(); c.ellipse(kx, ky - 7 * k, 3.4 * k, 6 * k, 0.3, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(kx - 2.2 * k, ky - 14 * k, 2 * k, 1.6 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(kx - 2.8 * k, ky - 17.5 * k, 1 * k, 3 * k);
    c.beginPath(); c.moveTo(kx + 2 * k, ky - 3 * k); c.quadraticCurveTo(kx + 9 * k, ky, kx + 11 * k, ky - 1 * k); c.lineTo(kx + 2 * k, ky - 1 * k); c.fill();
    c.fillRect(kx - 3 * k, ky - 1.5 * k, 6 * k, 1.5 * k);
  };

  MP.makeCountry({
    id: 'australia', name: 'Australia', to: 'Australiaan', city: 'Sydney', time: '06:50',
    land: 'outback',
    // blue flag with a little red-and-white cross in the corner and white stars
    flag(c, x, y, w, h) {
      c.fillStyle = '#012169'; c.fillRect(x, y, w, h);
      c.fillStyle = '#ffffff';
      c.fillRect(x, y + h * 0.2, w * 0.5, h * 0.12); c.fillRect(x + w * 0.2, y, w * 0.1, h * 0.52);
      c.fillStyle = '#c8102e';
      c.fillRect(x, y + h * 0.23, w * 0.5, h * 0.06); c.fillRect(x + w * 0.225, y, w * 0.05, h * 0.52);
      c.fillStyle = '#ffffff';
      for (const [sx, sy, sr] of [[0.25, 0.75, 0.09], [0.75, 0.25, 0.05], [0.65, 0.55, 0.05], [0.85, 0.5, 0.05], [0.75, 0.82, 0.06]]) {
        c.beginPath(); c.arc(x + w * sx, y + h * sy, Math.max(0.4, h * sr), 0, Math.PI * 2); c.fill();
      }
    },
    sky: C.sky,
    ground: C.redSand,
    fog: ['#fde4c4', 70, 200],
    hemiGround: 0xd9824a,
    people: { hello: ["G'day! (Hei!)", 'Hello, mate! (Moi, kaveri!)'] },
    bounds: { minX: -40, maxX: 40, minZ: -36, maxZ: 10 },
    start: { x: 2.2, z: 4.2 },
    car: {
      at: { x: 5.5, z: 6.5 }, name: 'Jeeppi',
      // an open safari jeep (front toward -x)
      build(W) {
        const T = window.THREE;
        const j = new T.Group();
        W.box(3.8, 0.9, 1.9, C.jeep, 0, 0.4, 0, j);
        W.box(1.3, 0.35, 1.9, '#a8843a', -1.2, 1.3, 0, j);           // bonnet
        W.box(0.08, 0.7, 1.7, '#bfe6ff', -0.5, 1.3, 0, j);            // windscreen
        for (const sx of [0.3, 1.5]) W.box(0.5, 0.5, 1.6, '#6b4a2a', sx, 1.3, 0, j);   // seats
        // the roll bar
        for (const z of [-0.85, 0.85]) W.box(0.12, 1.3, 0.12, '#2b2b33', 0.9, 1.3, z, j);
        W.box(0.12, 0.12, 1.82, '#2b2b33', 0.9, 2.6, 0, j);
        // spare wheel on the back and four wheels
        const spare = W.cyl(0.42, 0.3, '#2b2b33', 2.05, 1.1, 0, j);
        spare.rotation.z = Math.PI / 2;
        for (const [wx, wz] of [[-1.2, 0.95], [1.2, 0.95], [-1.2, -0.95], [1.2, -0.95]]) {
          const wheel = W.cyl(0.45, 0.35, '#2b2b33', wx, 0.45, wz, j);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.y = 0.45;
        }
        return j;
      },
    },
    sign: { text: 'Australia', x: -3, z: 1 },
    hotel: {
      x: -27, z: 3, rot: Math.PI / 2,
      look: { wall: '#fbe9d6', trim: '#c8642c', awning: '#3fa7a0', sign: 'HOTELLI' },
      room: {
        name: 'Hotelli Koala', wall: '#f6e3cf', border: '#c8642c', floor: '#b07a4a',
        blanket: '#3fa7a0', rug: '#e0773a',
        hello: 'Hotelli Koala! Ikkunasta näkyy punainen kallio. Napauta sänkyä, niin mennään nukkumaan.',
      },
    },
    airport: { title: 'SYDNEYN LENTOKENTTÄ', hall: '#fbeede', floor: '#dcae84', plant: 'palm' },
    photo: { name: 'Australia', sticker: '🦘' },
    poster: { say: 'Juliste Australiasta! Kenguru ja iso punainen kallio.' },
    stamp: {
      ink: '#c2502a',
      pic(c) {   // a hopping kangaroo
        c.beginPath(); c.ellipse(0, 1, 4, 6, 0.45, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(-4, -6, 2.6, 1.9, -0.2, 0, Math.PI * 2); c.fill();
        c.fillRect(-4.6, -10, 1.1, 3);
        c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(3, 4); c.quadraticCurveTo(9, 7, 11, 4); c.stroke();
        c.beginPath(); c.moveTo(0, 6); c.lineTo(-4, 8); c.stroke();
      },
    },
    welcome: 'Tervetuloa Australiaan! Täällä ollaan maapallon alapuolella – kaikki oli hetken ylösalaisin!',
    morning: 'Hyvää huomenta, Australia! Kookaburra nauraa jo.',

    // -------------------------------------------------------------------------
    build(W, S, T) {
      const { box, cyl, ball, flat, block } = W;

      // --- The beach and the sea in front ---
      flat(300, 12, C.beach, 0, SHORE_Z + 5, 0.015);
      const shallow = new T.Mesh(new T.PlaneGeometry(300, 12), new T.MeshLambertMaterial({ color: C.shallow, transparent: true, opacity: 0.85 }));
      shallow.rotation.x = -Math.PI / 2;
      shallow.position.set(0, 0.04, SHORE_Z - 6);
      W.add(shallow);
      const deep = new T.Mesh(new T.PlaneGeometry(400, 220), W.mat(C.sea));
      deep.rotation.x = -Math.PI / 2;
      deep.position.set(0, 0.03, SHORE_Z - 122);
      W.add(deep);
      // rolling waves (white stripes that come in)
      S.waves = [];
      for (let i = 0; i < 3; i++) {
        const wv = flat(300, 0.5, '#ffffff', 0, SHORE_Z - 4 - i * 4, 0.06);
        wv.material = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 });
        S.waves.push(wv);
      }

      // --- The opera house: white shell roofs by the harbour (far left) ---
      const op = new T.Group();
      box(16, 1.4, 9, '#e9d9c0', 0, 0, 0, op);                     // the base
      const shellGeo = new T.SphereGeometry(3, 16, 10, 0, Math.PI, 0, Math.PI / 2);
      [[-5, 3.4, 1.1], [-1.5, 4.4, 1.25], [2.4, 5.2, 1.4], [5.6, 3.6, 1]].forEach(([sx, h, s]) => {
        const sh = new T.Mesh(shellGeo, new T.MeshLambertMaterial({ color: '#fbfbf6', side: T.DoubleSide }));
        sh.scale.set(0.9 * s, h / 3, 1.3 * s);
        sh.rotation.y = -Math.PI / 2;
        sh.rotation.z = -0.35;
        sh.position.set(sx, 1.4, 0);
        op.add(sh);
      });
      op.position.set(-34, 0, SHORE_Z - 16);
      op.rotation.y = 0.35;
      W.add(op);
      W.clickable(op, 'opera');
      // a big arch bridge far away
      const bridge = new T.Group();
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI * i / 12;
        ball(0.5, '#7a8696', Math.cos(a) * 14, Math.sin(a) * 7, 0, bridge);
      }
      box(30, 0.5, 2, '#7a8696', 0, 3.2, 0, bridge);
      bridge.position.set(-60, 0, SHORE_Z - 55);
      W.add(bridge);

      // --- The big red rock far away (like Uluru) ---
      const ul = new T.Mesh(new T.SphereGeometry(30, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), W.mat(C.rock));
      ul.scale.set(1.6, 0.42, 0.7);
      ul.position.set(95, 0, -120);
      W.add(ul);

      // --- Dry bushes and termite hills ---
      for (let i = 0; i < 26; i++) {
        const x = -38 + (i * 37) % 78, z = 8 - (i * 23) % 30;
        if (Math.hypot(x - 2, z - 4) < 6 || Math.abs(x - ROO.x) < 4 && Math.abs(z - ROO.z) < 4) continue;
        const b = ball(0.5 + (i % 3) * 0.15, i % 2 ? '#8a9a52' : '#a0a65e', x, 0.25, z);
        b.scale.y = 0.6;
      }
      for (const [tx, tz] of [[30, -12], [33, -4], [-35, -6]]) {
        cyl(0.7, 2.4, '#b8643a', tx, 0, tz, null, 0.2);
        block(tx, tz, 1.2, 1.2);
      }

      // --- A eucalyptus tree with a sleepy koala ---
      function gumTree(x, z, h) {
        const g = new T.Group();
        const trunk = cyl(0.35, h, C.gum, 0, 0, 0, g, 0.22);
        trunk.rotation.z = 0.05;
        for (const [bx, by, bz, r] of [[0, h + 0.6, 0, 2], [1.4, h - 0.3, 0.6, 1.4], [-1.3, h - 0.1, -0.4, 1.5], [0.3, h - 0.6, -1.2, 1.2]]) {
          const f = ball(r, C.gumLeaves, bx, by, bz, g);
          f.scale.y = 0.75;
        }
        const branch = cyl(0.12, 2, C.gum, 0.8, h * 0.62, 0, g);
        branch.rotation.z = -1.1;
        g.position.set(x, 0, z);
        W.add(g);
        block(x, z, 0.9, 0.9);
        return g;
      }
      const tree = gumTree(TREE.x, TREE.z, 4.2);
      const koala = new T.Group();
      const kb = ball(0.55, C.koala, 0, 0, 0, koala); kb.scale.set(1, 1.15, 0.9);
      const kh = new T.Group();
      ball(0.45, C.koala, 0, 0, 0, kh);
      for (const ex of [-0.42, 0.42]) {
        ball(0.26, C.koala, ex, 0.25, 0, kh);
        ball(0.15, '#f2e9ef', ex, 0.25, 0.08, kh);
      }
      const nose = ball(0.15, '#2b2b33', 0, -0.05, 0.42, kh); nose.scale.set(1, 1.3, 0.8);
      S.koalaEyes = [];
      for (const ex of [-0.17, 0.17]) S.koalaEyes.push(ball(0.06, '#1b1b2a', ex, 0.1, 0.4, kh));
      S.koalaLeaf = box(0.35, 0.04, 0.18, '#5f9a62', 0.15, -0.25, 0.48, kh);
      S.koalaLeaf.visible = false;
      kh.position.set(0, 0.65, 0.1);
      koala.add(kh);
      S.koalaHead = kh;
      koala.position.set(0.9, 2.55, 0.35);
      tree.add(koala);
      W.clickable(tree, 'koala');
      S.koala = { asleep: true, from: -99 };

      // --- The kookaburra on another tree ---
      const bt = gumTree(BIRD_TREE.x, BIRD_TREE.z, 3.6);
      const bird = new T.Group();
      const bb = ball(0.32, '#8a6a4a', 0, 0, 0, bird); bb.scale.set(1.1, 0.9, 0.9);
      ball(0.25, '#f4efe6', 0, 0.35, 0.05, bird);
      const beak = new T.Mesh(new T.ConeGeometry(0.08, 0.4, 6), W.mat('#3a3a42'));
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 0.32, 0.38);
      bird.add(beak);
      ball(0.05, '#1b1b2a', -0.12, 0.42, 0.2, bird);
      ball(0.05, '#1b1b2a', 0.12, 0.42, 0.2, bird);
      const tail = box(0.18, 0.05, 0.5, '#5a7fb0', 0, -0.1, -0.4, bird);
      tail.rotation.x = 0.5;
      bird.position.set(1.65, 2.55, 0);
      bt.add(bird);
      W.clickable(bt, 'bird');
      S.bird = bird;
      S.laughAt = -99;

      // --- The kangaroo (with a baby in the pouch, and boxing gloves) ---
      const roo = new T.Group();
      const rb = ball(0.75, C.roo, 0, 1.25, 0, roo); rb.scale.set(0.85, 1.25, 0.8);
      const belly = ball(0.5, '#e3b98f', 0, 1.1, 0.35, roo); belly.scale.set(0.9, 1.2, 0.6);
      const rh = ball(0.38, C.roo, 0, 2.35, 0.2, roo); rh.scale.set(0.85, 0.9, 1.25);
      for (const ex of [-0.16, 0.16]) {
        const ear = ball(0.13, C.roo, ex, 2.8, 0.05, roo); ear.scale.set(0.6, 1.9, 0.4);
        ball(0.05, '#1b1b2a', ex, 2.42, 0.58, roo);
      }
      ball(0.07, '#2b2b33', 0, 2.3, 0.68, roo);
      const rtail = cyl(0.2, 1.6, C.roo, 0, 0, -0.6, roo, 0.07);
      rtail.rotation.x = -1.2;
      rtail.position.set(0, 0.4, -0.75);
      for (const lx of [-0.35, 0.35]) {
        const foot = box(0.25, 0.18, 0.95, '#9a6038', lx, 0, 0.15, roo);
        foot.position.y = 0.09;
      }
      S.rooArms = [];
      S.gloves = [];
      for (const ax of [-0.35, 0.35]) {
        const arm = new T.Group();
        const a = cyl(0.08, 0.55, C.roo, 0, -0.55, 0, arm);
        a.position.y = -0.27;
        const glove = ball(0.2, '#e0303a', 0, -0.58, 0, arm);
        glove.visible = false;
        S.gloves.push(glove);
        arm.position.set(ax, 1.7, 0.42);
        arm.rotation.x = -0.6;
        roo.add(arm);
        S.rooArms.push(arm);
      }
      // the joey: a small head that peeks out of the pouch
      const joey = new T.Group();
      ball(0.2, '#c88a5a', 0, 0, 0, joey);
      for (const ex of [-0.09, 0.09]) {
        const e = ball(0.06, '#c88a5a', ex, 0.2, -0.02, joey); e.scale.set(0.6, 1.8, 0.4);
        ball(0.03, '#1b1b2a', ex, 0.04, 0.18, joey);
      }
      joey.position.set(0, 1.2, 0.62);
      roo.add(joey);
      S.joey = joey;
      roo.position.set(ROO.x, 0, ROO.z);
      W.add(roo);
      W.clickable(roo, 'roo');
      S.roo = roo;
      S.rooState = { step: 0, from: -99 };

      // --- The emu ---
      const emu = new T.Group();
      const eb = ball(0.7, '#5a4636', 0, 1.6, 0, emu); eb.scale.set(1, 0.85, 1.3);
      const neck = cyl(0.1, 1.2, '#6a6a7a', 0, 1.9, 0.6, emu);
      neck.rotation.x = 0.25;
      ball(0.2, '#5a5a6a', 0, 3.1, 0.9, emu);
      const eBeak = new T.Mesh(new T.ConeGeometry(0.06, 0.25, 6), W.mat('#3a3a42'));
      eBeak.rotation.x = Math.PI / 2;
      eBeak.position.set(0, 3.08, 1.15);
      emu.add(eBeak);
      S.emuLegs = [];
      for (const lx of [-0.2, 0.2]) {
        const leg = new T.Group();
        const l = cyl(0.06, 1.2, '#8a8a7a', 0, -1.2, 0, leg);
        l.position.y = -0.6;
        leg.position.set(lx, 1.25, 0);
        emu.add(leg);
        S.emuLegs.push(leg);
      }
      emu.position.set(EMU_HOME.x, 0, EMU_HOME.z);
      W.add(emu);
      W.clickable(emu, 'emu');
      S.emu = emu;
      S.emuRun = -99;

      // --- The barbecue on the beach ---
      const bbq = new T.Group();
      box(1.8, 0.9, 0.9, '#3a3a42', 0, 0.6, 0, bbq);
      for (const [lx, lz] of [[-0.8, -0.35], [0.8, -0.35], [-0.8, 0.35], [0.8, 0.35]]) cyl(0.05, 0.6, '#3a3a42', lx, 0, lz, bbq);
      box(1.7, 0.04, 0.8, '#8a8a92', 0, 1.5, 0, bbq);                   // the grill
      S.sausages = [];
      for (let i = 0; i < 3; i++) {
        const s = cyl(0.09, 0.6, '#a0452a', -0.5 + i * 0.5, 1.6, 0, bbq);
        s.rotation.x = Math.PI / 2;
        s.position.y = 1.62;
        S.sausages.push(s);
      }
      bbq.position.set(BBQ.x, 0, BBQ.z);
      W.add(bbq);
      block(BBQ.x, BBQ.z, 2, 1.1);
      W.clickable(bbq, 'bbq');
      // the seagull (waits up in the sky)
      const gull = new T.Group();
      const gb = ball(0.3, '#ffffff', 0, 0, 0, gull); gb.scale.set(1.3, 0.8, 0.8);
      ball(0.18, '#ffffff', 0.4, 0.15, 0, gull);
      const gBeak = new T.Mesh(new T.ConeGeometry(0.05, 0.2, 6), W.mat('#f2a63a'));
      gBeak.rotation.z = -Math.PI / 2;
      gBeak.position.set(0.62, 0.13, 0);
      gull.add(gBeak);
      S.gullWings = [];
      for (const k of [-1, 1]) {
        const wing = new T.Group();
        box(0.4, 0.04, 0.8, '#d8dde6', 0, 0, k * 0.4, wing);
        wing.position.set(0, 0.1, k * 0.1);
        gull.add(wing);
        S.gullWings.push(wing);
      }
      gull.visible = false;
      W.add(gull);
      S.gull = gull;
      S.gullAt = -99;

      // --- The surfboard stuck in the sand ---
      const board = new T.Group();
      const bd = ball(1, '#ff7a59', 0, 0, 0, board); bd.scale.set(0.35, 0.06, 1.3);
      box(0.06, 0.02, 2, '#ffffff', 0, 0.06, 0, board);
      W.add(board);
      W.clickable(board, 'surf');
      S.board = board;
      S.boardStand = () => { board.position.set(SURF.x, 1.25, SURF.z); board.rotation.set(Math.PI / 2 - 0.15, 0, 0); };
      S.boardStand();

      // --- The boomerang on a rock ---
      const rock = ball(0.8, '#b0623a', BOOM.x, 0.3, BOOM.z); rock.scale.set(1.2, 0.55, 1);
      block(BOOM.x, BOOM.z, 1.6, 1.4);
      const boom = new T.Group();
      for (const k of [-1, 1]) {
        const arm = box(0.9, 0.06, 0.2, '#a0642c', k * 0.32, 0, 0, boom);
        arm.rotation.y = k * 0.5;
      }
      W.add(boom);
      W.clickable(boom, 'boomerang');
      W.clickable(rock, 'boomerang');
      S.boom = boom;
      S.boomRest = () => { boom.position.set(BOOM.x, 0.78, BOOM.z); boom.rotation.set(0, 0.3, 0); };
      S.boomRest();
      S.boomAt = -99;
    },

    spots: {
      roo: {
        at: () => ({ x: ROO.x - 2.6, z: ROO.z + 2.8 }),
        use(sc, S) {
          const st = S.rooState;
          st.step = st.step % 3 + 1;
          st.from = MP.time;
          if (st.step === 1) { sc.say('Kenguru hyppii! Boing, boing!', 3); MP.sfx.boing(); }
          if (st.step === 2) { sc.say('Katso! Pussista kurkistaa kengurunpoikanen!', 3.5); MP.sfx.bling(); }
          if (st.step === 3) { sc.say('Kenguru haluaa nyrkkeillä! Pum pum – ihan leikillään. Sitten kätellään.', 4.5); MP.sfx.kick(); }
        },
      },
      koala: {
        at: () => ({ x: TREE.x + 2.5, z: TREE.z + 2.4 }),
        use(sc, S) {
          if (S.koala.asleep) {
            S.koala = { asleep: false, from: MP.time };
            sc.say('Koala heräsi! Se haukottelee ja syö eukalyptuksen lehden… Tervetuloa Austra… zzz. Se nukahti taas!', 6);
            MP.sfx.yawn();
          } else {
            sc.say('Koala nukkuu melkein koko päivän. Zzz…', 3);
          }
        },
      },
      bird: {
        at: () => ({ x: BIRD_TREE.x + 2.6, z: BIRD_TREE.z + 1.8 }),
        use(sc, S) {
          S.laughAt = MP.time;
          sc.say('Kookaburra-lintu nauraa: HAH-HAH-HAA-HAA!', 3.5);
          // the laugh: quick notes going up and down
          [660, 880, 990, 880, 1180, 990, 880, 660].forEach((f, i) => setTimeout(() => MP.sfx.note(f, 0.09, 'square', 0.08), i * 110));
        },
      },
      opera: {
        here: true,
        use(sc) {
          sc.say('Oopperatalo meren rannalla! Sen katot näyttävät isoilta valkoisilta simpukoilta tai purjeilta.', 5);
          MP.sfx.tune();
        },
      },
      emu: {
        here: true,
        use(sc, S) {
          S.emuRun = MP.time;
          sc.say('Emu! Se on iso lintu, joka ei osaa lentää – mutta juoksee tosi lujaa! Hurraa!', 4.5);
          MP.sfx.boing();
        },
      },
      bbq: {
        at: () => ({ x: BBQ.x, z: BBQ.z + 1.9 }),
        use(sc, S) {
          if (MP.time - S.gullAt < 7) { sc.say('Odotetaan, että uudet makkarat paistuvat.', 2.5); return; }
          S.gullAt = MP.time;
          sc.say('Grillimakkaraa rannalla! Tsss… Mmm…', 2.5);
          MP.sfx.note(200, 0.6, 'sawtooth', 0.03);
          setTimeout(() => { if (MP.scene === MP.scenes.australia) { sc.say('HEI! Lokki vei makkaran! Kiikkerä lokki!', 4); MP.sfx.quack(); } }, 2300);
        },
      },
      surf: {
        at: () => ({ x: SURF.x + 1.4, z: SURF.z + 1.2 }),
        use(sc, S) {
          const suit = MP.findItem('costume', MP.state.outfit.costume);
          if (!suit || suit.type !== 'swim') {
            sc.say('Surffilauta! Surffaamaan pääsee vain uimapuku päällä. Uimapuvun saa kotoa vaatekaapista.', 4.5);
            MP.sfx.tap();
            return;
          }
          sc.surf = { t: 0, x0: sc.p.x };
          sc.frozen = true;
          sc.target = null;
          sc.p.heading = 0;
          sc.say('Surffaamaan! Isot aallot tulevat!', 3);
          MP.sfx.flush();
        },
      },
      boomerang: {
        at: () => ({ x: BOOM.x - 1.8, z: BOOM.z + 1.8 }),
        use(sc, S) {
          if (MP.time - S.boomAt < 3) return;
          S.boomAt = MP.time;
          sc.boomStart = { x: sc.p.x, z: sc.p.z, h: sc.p.heading };
          sc.say('Bumerangi! Heitetään se kauas…', 2.4);
          MP.sfx.thwip();
        },
      },
    },

    hints: [
      { x: ROO.x - 2, z: ROO.z + 2, r: 4.5, say: 'Kenguru! Napauta sitä.' },
      { x: TREE.x + 2, z: TREE.z + 2, r: 4, say: 'Puussa nukkuu koala! Napauta puuta.' },
      { x: SURF.x, z: SURF.z + 1, r: 3.5, say: 'Surffilauta! Napauta sitä.' },
      { x: BBQ.x, z: BBQ.z + 2, r: 3.5, say: 'Grilli! Napauta sitä.' },
      { x: BOOM.x - 1, z: BOOM.z + 1, r: 3.2, say: 'Kivellä on bumerangi! Napauta sitä.' },
    ],

    enter(sc, S) {
      sc.surf = null;
      sc.frozen = false;
      sc.pose = null;
      sc.y = 0;
      sc.boomStart = null;
      S.rooState = { step: 0, from: -99 };
      S.koala = { asleep: true, from: -99 };
      S.gullAt = S.boomAt = S.emuRun = S.laughAt = -99;
      S.boardStand();
      S.boomRest();
      S.camera.up.set(0, 1, 0);
    },

    update(sc, S, dt, now) {
      // --- Arriving: upside down for a moment! ---
      const flip = sc.arrive && sc.arrive.t > 0.2 && sc.arrive.t < 1.6;
      S.camera.up.set(0, flip ? -1 : 1, 0);

      // --- Waves rolling in ---
      S.waves.forEach((wv, i) => {
        const u = ((now * 0.25 + i / 3) % 1);
        wv.position.z = SHORE_Z - 12 + u * 11;
        wv.material.opacity = Math.sin(u * Math.PI) * 0.8;
      });

      // --- The kangaroo ---
      const st = S.rooState;
      const since = now - st.from;
      let hop = 0, rx = ROO.x, rz = ROO.z, face = 0;
      if (st.step === 1 && since < 4) {
        // hops in a little circle
        const a = since / 4 * Math.PI * 2;
        rx = ROO.x + Math.sin(a) * 3;
        rz = ROO.z + (1 - Math.cos(a)) * 1.5;
        face = Math.atan2(Math.cos(a) * 3, Math.sin(a) * 1.5);   // the way it is hopping
        hop = Math.abs(Math.sin(since * 7)) * 0.9;
      }
      S.roo.position.set(rx, hop, rz);
      S.roo.rotation.y = st.step === 1 && since < 4 ? face : Math.atan2(sc.p.x - rx, sc.p.z - rz);   // looks at you
      // the joey peeks out (and stays out a while)
      const peek = st.step === 2 ? MP.clamp(since * 2, 0, 1) : 0;
      S.joey.position.y = 1.05 + peek * 0.3;
      S.joey.visible = peek > 0.05;
      // boxing: gloves on, arms punch, then a handshake
      const boxing = st.step === 3 && since < 4.5;
      S.gloves.forEach((g) => { g.visible = boxing; });
      S.rooArms.forEach((arm, i) => {
        arm.rotation.x = boxing ? -1.3 + Math.max(0, Math.sin(since * 9 + i * Math.PI)) * -0.5 : -0.6;
      });
      // the player bounces back a little at every punch
      if (boxing && since < 3.5) sc.y = Math.max(0, Math.sin(since * 9)) * 0.12;
      else if (!sc.surf) sc.y = 0;

      // --- The koala wakes up, eats a leaf and falls asleep again ---
      const kSince = now - S.koala.from;
      const awake = !S.koala.asleep && kSince < 5.5;
      if (!S.koala.asleep && kSince >= 5.5) S.koala.asleep = true;
      S.koalaHead.rotation.x = awake ? -0.25 + Math.sin(kSince * 3) * 0.05 : 0.45 + Math.sin(now * 1.2) * 0.03;
      S.koalaEyes.forEach((e) => { e.scale.y = awake ? 1 : 0.2; });
      S.koalaLeaf.visible = awake && kSince > 1.6 && kSince < 4.2;

      // --- The kookaburra bobs when it laughs ---
      const lSince = now - S.laughAt;
      S.bird.rotation.x = lSince < 1.2 ? Math.sin(lSince * 30) * 0.25 : 0;

      // --- The emu walks around (and runs very fast when tapped) ---
      const run = now - S.emuRun < 4;
      S.emuT = (S.emuT || 0) + dt * (run ? 2.2 : 0.25);
      const ea = S.emuT;
      S.emu.position.set(EMU_HOME.x + Math.sin(ea) * 5, 0, EMU_HOME.z + Math.sin(ea * 2) * 2.5);
      S.emu.rotation.y = Math.atan2(Math.cos(ea) * 5, Math.cos(ea * 2) * 5);
      S.emuLegs.forEach((l, i) => { l.rotation.x = Math.sin(now * (run ? 22 : 6) + i * Math.PI) * (run ? 0.8 : 0.4); });

      // --- The seagull steals a sausage ---
      const gSince = now - S.gullAt;
      const g = S.gull;
      if (gSince > 1.4 && gSince < 5.5) {
        g.visible = true;
        const u = (gSince - 1.4) / 4.1;
        const sx = BBQ.x - 0.5, sy = 1.8, sz = BBQ.z;
        if (u < 0.45) {
          const k = u / 0.45;
          g.position.set(sx + 14 * (1 - k), sy + 9 * (1 - k) * (1 - k), sz - 6 * (1 - k));
        } else {
          const k = (u - 0.45) / 0.55;
          g.position.set(sx - 16 * k, sy + 12 * k, sz - 10 * k);
          S.sausages[0].visible = false;
        }
        g.rotation.y = u < 0.45 ? Math.PI : 0;
        S.gullWings.forEach((wg, i) => { wg.rotation.x = Math.sin(now * 18) * 0.7 * (i ? 1 : -1); });
      } else {
        g.visible = false;
        if (gSince > 7) S.sausages[0].visible = true;
      }

      // --- The boomerang flies far away… and comes back ---
      const bSince = now - S.boomAt;
      if (sc.boomStart && bSince < 2.6) {
        const b0 = sc.boomStart;
        const a = bSince / 2.6 * Math.PI * 2;
        const fx = Math.sin(b0.h), fz = -Math.cos(b0.h);
        const out = Math.sin(a / 2) * 12;
        const side = Math.sin(a) * 4;
        S.boom.position.set(b0.x + fx * out + fz * side, 1.5 + Math.sin(a / 2) * 2.5, b0.z + fz * out - fx * side);
        S.boom.rotation.set(0, now * 18, 0.2);
      } else if (sc.boomStart) {
        sc.boomStart = null;
        S.boomRest();
        const hat = MP.state.outfit.hat;
        if (hat && hat !== 'none') {
          sc.hatOff = { hat, from: now };
          MP.state.outfit.hat = 'none';
          sc.say('Bumerangi tuli takaisin – ja pudotti hatun! Hups! Laitetaan se takaisin.', 4);
          MP.sfx.boing();
        } else {
          sc.say('Vau, bumerangi tuli takaisin! Kopp!', 3);
          MP.sfx.bling();
        }
      }
      if (sc.hatOff && now - sc.hatOff.from > 2.5) {
        MP.state.outfit.hat = sc.hatOff.hat;
        sc.hatOff = null;
      }

      // --- Surfing ---
      const sf = sc.surf;
      if (sf) {
        sf.t += dt;
        const t = sf.t;
        const p = sc.p;
        if (t < 1.6) {                       // paddle out
          p.z = SURF.z + 1 - (t / 1.6) * 11;
        } else if (t < 6) {                  // ride the wave back in, zig-zagging
          const u = (t - 1.6) / 4.4;
          p.z = SURF.z - 10 + u * 8;
          p.x = sf.x0 + Math.sin(u * Math.PI * 3) * 4;
          p.heading = Math.PI + Math.cos(u * Math.PI * 3) * 0.6;
        } else if (t < 7) {
          p.z = SURF.z - 2 + (t - 6) * 3;
        } else {
          sc.surf = null;
          sc.frozen = false;
          sc.pose = null;
          sc.y = 0;
          S.boardStand();
          sc.say('Se oli mahtavaa! Olen oikea surffari!', 3.5);
          MP.sfx.bling();
        }
        if (sc.surf) {
          const bob = t > 1.6 && t < 6 ? 0.25 + Math.sin(t * 5) * 0.08 : 0.05;
          sc.y = bob + 0.08;
          sc.pose = { armUp: t > 1.6 && t < 6 ? 0.55 : 0 };
          S.board.position.set(p.x, bob, p.z);
          S.board.rotation.set(0, p.heading, Math.sin(t * 5) * 0.08);
          sc.camDistWanted = 6;
        }
      } else {
        sc.camDistWanted = null;
      }
    },
  });
})();
