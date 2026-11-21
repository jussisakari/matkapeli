// thailand.js – THAIMAA (Thailand)! A sunny 3D beach seen from behind the character.
// You arrive from the airport in a tuk-tuk. Things to do:
//   an elephant that sprays water, a golden temple, a long-tail boat,
//   a sandcastle to build, coconut water, crabs that walk sideways,
//   and tall rocky islands out in the sea. Walk into the shallow water too!
// The tuk-tuk takes you back to the airport.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const W3 = MP.w3d;

  // Colors in Thailand (Ella can change these)
  MP.THAI = {
    sky: '#7fd0f5',
    sand: '#f3e0b0',
    wetSand: '#e3c98f',
    shallow: '#5fd8d2',
    sea: '#1f9fc4',
    palmTrunk: '#9b7a4f',
    palmLeaves: '#3d9a46',
    gold: '#f2c14e',
    roof: '#d2462f',
    roofGreen: '#2e8b57',
    white: '#fffaf0',
    elephant: '#8f939e',
    tuktuk: '#2b6fd6',
  };

  const SPEED = 3.4;
  const SHORE_Z = -28;                   // where the water starts
  const BOUNDS = { minX: -42, maxX: 42, minZ: -34, maxZ: 10 };
  const TAXI_AT = { x: 5.5, z: 6.5 };
  const ELEPHANT = { x: 17, z: -10 };
  const TEMPLE = { x: -27, z: -8 };
  const CASTLE = { x: 3, z: -20 };
  const STAND = { x: -9, z: -2 };       // the coconut stand
  const BOAT = { x: 12, z: -33 };
  const PLACES = {
    elephant: { x: ELEPHANT.x - 3, z: ELEPHANT.z + 3, r: 5 },
    temple: { x: TEMPLE.x + 9, z: TEMPLE.z, r: 6 },
    castle: { x: CASTLE.x, z: CASTLE.z + 2, r: 4 },
    stand: { x: STAND.x, z: STAND.z + 2.5, r: 3.5 },
  };
  const CASTLE_STEPS = 3;

  const S = { built: false };
  MP.thai3d = S;                  // (for testing)

  function texture(size, repeatX, repeatY, paint) {
    const T = window.THREE;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    paint(c.getContext('2d'), size);
    const tex = new T.CanvasTexture(c);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    return tex;
  }

  // ---------------------------------------------------------------------------
  // Building the beach
  // ---------------------------------------------------------------------------
  function build() {
    W3.init();
    const T = window.THREE;
    const C = MP.THAI;
    S.scene = new T.Scene();
    S.scene.background = new T.Color(C.sky);
    S.scene.fog = new T.Fog('#d8f1fb', 60, 190);
    S.camera = new T.PerspectiveCamera(55, 16 / 9, 0.1, 320);
    S.scene.add(new T.HemisphereLight(0xffffff, 0xe3c98f, 0.85));
    const sun = new T.DirectionalLight(0xfff4dc, 0.65);
    sun.position.set(20, 50, 30);
    S.scene.add(sun);

    const W = W3.kit(S.scene);
    S.W = W;
    const { box, cyl, ball, flat, block } = W;

    const sandTex = texture(256, 60, 60, (g, n) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, n, n);
      for (let i = 0; i < 800; i++) {
        g.fillStyle = ['rgba(200,170,110,0.3)', 'rgba(255,255,255,0.6)', 'rgba(170,140,90,0.2)'][i % 3];
        g.fillRect(Math.random() * n, Math.random() * n, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
    });
    const sandMat = new T.MeshLambertMaterial({ color: C.sand, map: sandTex });
    const ground = new T.Mesh(new T.PlaneGeometry(500, 500), sandMat);
    ground.rotation.x = -Math.PI / 2;
    W.add(ground);
    flat(300, 5, C.wetSand, 0, SHORE_Z + 1.5, 0.012);            // wet sand by the water

    // --- The sea: shallow turquoise near the beach, deeper blue further out ---
    const shallow = new T.Mesh(new T.PlaneGeometry(300, 14), new T.MeshLambertMaterial({ color: C.shallow, transparent: true, opacity: 0.85 }));
    shallow.rotation.x = -Math.PI / 2;
    shallow.position.set(0, 0.04, SHORE_Z - 7);
    W.add(shallow);
    const deep = new T.Mesh(new T.PlaneGeometry(400, 220), W.mat(C.sea));
    deep.rotation.x = -Math.PI / 2;
    deep.position.set(0, 0.03, SHORE_Z - 124);
    W.add(deep);
    // white foam where the waves come in (it moves back and forth)
    S.foam = flat(300, 0.6, '#ffffff', 0, SHORE_Z, 0.05);
    S.foam.material = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 });

    // --- Tall rocky islands far out in the sea (like in Phang Nga bay) ---
    function island(x, z, s) {
      const g = new T.Group();
      const rock = new T.Mesh(new T.CylinderGeometry(2.2, 3, 10, 9), W.mat('#9a9283'));
      rock.position.y = 5;
      rock.scale.set(1, 1, 0.8);
      g.add(rock);
      const top = ball(2.5, '#3f8a3f', 0, 10, 0, g);
      top.scale.set(1, 0.55, 0.85);
      ball(1.6, '#4d9e48', 1.4, 7, 1.2, g);
      g.scale.setScalar(s);
      g.position.set(x, 0, z);
      W.add(g);
    }
    island(-30, -95, 1.4);
    island(-12, -120, 1.9);
    island(20, -100, 1.2);
    island(45, -130, 2.2);
    island(-55, -140, 2);
    const sunBall = new T.Mesh(new T.SphereGeometry(7, 20, 14), new T.MeshBasicMaterial({ color: '#fff6c8', fog: false }));
    sunBall.position.set(-60, 75, -200);
    W.add(sunBall);
    for (let i = 0; i < 6; i++) {
      const cl = new T.Group();
      for (let k = 0; k < 4; k++) ball(2 + Math.random(), '#ffffff', k * 2.2, Math.random(), 0, cl);
      cl.position.set(-80 + i * 32, 30 + (i % 2) * 6, -120 - (i % 3) * 20);
      W.add(cl);
    }

    // --- Coconut palms leaning over the beach ---
    function palm(x, z, lean, h) {
      h = h || 1;
      const g = new T.Group();
      for (let i = 0; i < 8; i++) {
        cyl(0.2 - i * 0.012, 0.75 * h, C.palmTrunk, lean * i * i * 0.025, i * 0.72 * h, 0, g);
      }
      const top = new T.Group();
      top.position.set(lean * 49 * 0.025, 5.8 * h, 0);
      for (let i = 0; i < 9; i++) {
        const leaf = new T.Mesh(new T.BoxGeometry(3, 0.05, 0.5), W.mat(i % 2 ? C.palmLeaves : '#52b55a'));
        leaf.position.set(1.4, -0.3, 0);
        leaf.rotation.z = -0.3;
        const holder = new T.Group();
        holder.rotation.y = i * Math.PI * 2 / 9;
        holder.rotation.z = -0.2;
        holder.add(leaf);
        top.add(holder);
      }
      for (let k = 0; k < 3; k++) ball(0.22, '#7a5a2a', Math.cos(k * 2) * 0.3, -0.35, Math.sin(k * 2) * 0.3, top);   // coconuts
      g.add(top);
      g.position.set(x, 0, z);
      g.rotation.y = Math.atan2(0, 1);
      W.add(g);
      block(x, z, 0.7, 0.7);
    }
    [[-8, 5, 1], [9, 1, -1], [-16, -14, 1.2], [-4, -24, 0.8], [26, -22, -0.9], [32, -6, -1], [-36, -20, 0.6], [37, 3, -0.5], [-33, 4, 0.7]]
      .forEach(([x, z, l]) => palm(x, z, l, 0.9 + Math.abs(l) * 0.15));

    // --- A golden Thai temple (wat) with layered red roofs ---
    const wat = new T.Group();
    box(9, 1.2, 7, C.white, 0, 0, 0, wat);                     // platform
    box(4, 0.6, 2, C.white, 0, 0, 4.3, wat);                   // steps
    box(7, 3.2, 5, C.white, 0, 1.2, 0, wat);                   // hall
    box(2, 2.4, 0.2, '#7a2a1e', 0, 1.2, 2.55, wat);            // door
    box(7.2, 0.3, 5.2, C.gold, 0, 4.3, 0, wat);                // gold band
    function roof(w, d, h, y, color) {
      const r = new T.Mesh(new T.ConeGeometry(1, 1, 4), W.mat(color));
      r.rotation.y = Math.PI / 4;
      r.scale.set(w / Math.SQRT2, h, d / Math.SQRT2);
      r.position.y = y + h / 2;
      wat.add(r);
    }
    roof(9, 6.6, 2.4, 4.5, C.roof);
    roof(7, 5, 2.8, 5.6, C.roofGreen);
    roof(5, 3.6, 3.2, 6.8, C.roof);
    const spire = new T.Mesh(new T.ConeGeometry(0.25, 2.2, 8), W.mat(C.gold));
    spire.position.y = 10.8;
    wat.add(spire);
    // golden curls at the roof corners
    for (const [cx, cz] of [[-4.4, 3.2], [4.4, 3.2], [-4.4, -3.2], [4.4, -3.2]]) {
      const curl = new T.Mesh(new T.ConeGeometry(0.15, 1, 6), W.mat(C.gold));
      curl.position.set(cx, 5, cz);
      curl.rotation.z = cx > 0 ? -0.6 : 0.6;
      wat.add(curl);
    }
    wat.position.set(TEMPLE.x, 0, TEMPLE.z);
    wat.rotation.y = Math.PI / 2;           // the door faces the beach path (+x)
    W.add(wat);
    block(TEMPLE.x, TEMPLE.z, 7.4, 9.4);
    W.clickable(wat, 'temple');
    // a golden stupa (chedi) next to it
    const chedi = new T.Group();
    cyl(1.8, 0.8, C.white, 0, 0, 0, chedi);
    cyl(1.4, 0.6, C.white, 0, 0.8, 0, chedi);
    const bell = ball(1.25, C.gold, 0, 2.4, 0, chedi); bell.scale.set(1, 1.1, 1);
    const tip = new T.Mesh(new T.ConeGeometry(0.5, 3.4, 12), W.mat(C.gold));
    tip.position.y = 5.1;
    chedi.add(tip);
    chedi.position.set(TEMPLE.x + 2, 0, TEMPLE.z - 9);
    W.add(chedi);
    block(TEMPLE.x + 2, TEMPLE.z - 9, 3.6, 3.6);
    W.clickable(chedi, 'temple');

    // --- The elephant (it sprays water with its trunk) ---
    const el = new T.Group();
    const E = C.elephant;
    const body = ball(1.4, E, 0, 2.2, 0, el); body.scale.set(1.35, 1, 1);
    for (const [lx, lz] of [[-1, 0.6], [-1, -0.6], [1, 0.6], [1, -0.6]]) cyl(0.38, 1.6, E, lx, 0, lz, el);
    const head = ball(0.95, E, -2, 2.8, 0, el);
    for (const k of [-1, 1]) {
      const ear = ball(0.9, '#9fa3ad', -1.7, 2.8, k * 0.95, el);
      ear.scale.set(0.5, 1.1, 0.3);
    }
    ball(0.1, '#1b1b2a', -2.75, 3.15, 0.45, el);
    ball(0.1, '#1b1b2a', -2.75, 3.15, -0.45, el);
    for (const k of [-1, 1]) {
      const tusk = new T.Mesh(new T.ConeGeometry(0.1, 0.8, 8), W.mat('#fffaf0'));
      tusk.position.set(-2.75, 2.2, k * 0.35);
      tusk.rotation.z = 2.2;
      el.add(tusk);
    }
    // the trunk: a chain of pieces that can swing up
    S.trunk = [];
    let parent = el;
    let px = -2.75, py = 2.55;
    for (let i = 0; i < 5; i++) {
      const seg = new T.Group();
      seg.position.set(px, py, 0);
      const piece = cyl(0.26 - i * 0.03, 0.5, E, 0, -0.5, 0, seg);
      piece.position.y = -0.25;
      parent.add(seg);
      S.trunk.push(seg);
      parent = seg;
      px = 0; py = -0.48;
    }
    const tail = cyl(0.05, 0.9, E, 0, 0, 0, el); tail.position.set(1.85, 1.8, 0); tail.rotation.z = 0.4;
    // a colorful blanket
    box(1.6, 0.1, 2.3, '#c0392b', 0, 3.3, 0, el);
    box(1.7, 0.06, 2.4, C.gold, 0, 3.25, 0, el);
    el.position.set(ELEPHANT.x, 0, ELEPHANT.z);
    el.rotation.y = -0.3;
    W.add(el);
    block(ELEPHANT.x, ELEPHANT.z, 5, 3.2);
    W.clickable(el, 'elephant');
    S.elephant = el;
    // water drops for the spray
    S.drops = [];
    for (let i = 0; i < 40; i++) {
      const d = ball(0.09, '#8fe3ff', 0, -5, 0);
      d.material = new T.MeshBasicMaterial({ color: '#3fb6f0' });
      S.drops.push({ m: d, life: 0 });
    }

    // --- A long-tail boat bobbing in the shallow water ---
    const boat = new T.Group();
    box(1.3, 0.6, 6, '#8b5a2b', 0, 0, 0, boat);
    box(1.0, 0.12, 5.4, '#a0703c', 0, 0.5, 0, boat);
    const bow = box(0.5, 1.6, 0.5, '#8b5a2b', 0, 0.3, -3, boat);
    bow.rotation.x = 0.4;
    for (const [i, col] of ['#ff5f8f', '#ffd23f', '#3cb371'].entries()) {   // ribbons on the bow
      const rib = box(0.08, 0.7, 0.04, col, (i - 1) * 0.15, 1.3, -3.25, boat);
      rib.rotation.x = 0.3;
    }
    box(1.4, 0.06, 1.8, '#3f7fc8', 0, 1.6, 0.6, boat);         // sun roof
    for (const [rx, rz] of [[-0.6, -0.2], [0.6, -0.2], [-0.6, 1.4], [0.6, 1.4]]) cyl(0.04, 1.1, '#5a3a1e', rx, 0.5, rz, boat);
    const pole = cyl(0.05, 2.6, '#5a5a73', 0, 0, 0, boat);      // the long tail (engine pole)
    pole.rotation.x = 1.35;
    pole.position.set(0, 0.8, 3.8);
    boat.position.set(BOAT.x, 0, BOAT.z);
    boat.rotation.y = 0.5;
    W.add(boat);
    W.clickable(boat, 'boat');
    S.boat = boat;

    // --- Beach umbrella and a towel ---
    const umb = new T.Group();
    cyl(0.05, 2.4, '#ffffff', 0, 0, 0, umb);
    const canopy = new T.Mesh(new T.ConeGeometry(1.6, 0.6, 12), W.mat('#ff7a59'));
    canopy.position.y = 2.5;
    umb.add(canopy);
    const canopy2 = new T.Mesh(new T.ConeGeometry(1.0, 0.4, 12), W.mat('#ffffff'));
    canopy2.position.y = 2.68;
    umb.add(canopy2);
    umb.position.set(-7, 0, -17);
    W.add(umb);
    block(-7, -17, 0.4, 0.4);
    flat(1.2, 2.2, '#3f7fc8', -5.6, -17.3, 0.02);
    flat(1.2, 0.3, '#ffffff', -5.6, -16.6, 0.025);

    // --- Sandcastle, built step by step ---
    const castle = new T.Group();
    const sc = '#e9cd8f';
    S.castleParts = [[], [], []];
    const part = (step, mesh) => { castle.add(mesh); S.castleParts[step].push(mesh); };
    part(0, box(2, 0.7, 2, sc, 0, 0, 0));
    for (const [tx, tz] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) {
      part(1, cyl(0.35, 1.3, sc, tx, 0, tz));
    }
    part(1, cyl(0.55, 1.6, sc, 0, 0.6, 0));
    part(2, cyl(0.02, 0.8, '#5a3a1e', 0, 2.2, 0));
    part(2, box(0.4, 0.25, 0.03, '#e04848', 0.2, 2.75, 0));
    part(2, ball(0.15, '#ffffff', 1.4, 0.15, 0.6));            // a seashell
    const heap = ball(0.7, sc, 1.6, 0, -0.6, castle); heap.scale.y = 0.45;
    castle.position.set(CASTLE.x, 0, CASTLE.z);
    W.add(castle);
    block(CASTLE.x, CASTLE.z, 2.4, 2.4);
    W.clickable(castle, 'castle');
    // a bucket and spade
    cyl(0.25, 0.4, '#ffd23f', CASTLE.x - 1.8, 0, CASTLE.z + 0.6, null, 0.32);

    // --- Coconut water stand ---
    const st = new T.Group();
    box(2.6, 1, 1.2, '#a0703c', 0, 0, 0, st);
    for (const sx of [-1.2, 1.2]) cyl(0.05, 2.2, '#5a3a1e', sx, 0, 0.5, st);
    const roofSt = box(3, 0.1, 1.8, '#3d9a46', 0, 2.2, 0.3, st);
    roofSt.rotation.x = 0.2;
    for (let i = 0; i < 4; i++) {
      ball(0.24, '#6a8f2a', -0.8 + i * 0.5, 1.2, 0.1, st);
      const straw = cyl(0.02, 0.4, '#ff5f8f', -0.8 + i * 0.5, 1.35, 0.1, st);
      straw.rotation.z = 0.3;
    }
    st.position.set(STAND.x, 0, STAND.z);
    W.add(st);
    block(STAND.x, STAND.z, 2.8, 1.4);
    W.clickable(st, 'stand');

    // --- Crabs scuttling sideways ---
    S.crabs = [];
    for (let i = 0; i < 4; i++) {
      const cr = new T.Group();
      const shell = ball(0.22, '#e0472f', 0, 0.15, 0, cr); shell.scale.set(1.3, 0.55, 1);
      for (const k of [-1, 1]) {
        ball(0.08, '#e0472f', k * 0.32, 0.18, 0.18, cr);                  // claws
        ball(0.04, '#1b1b2a', k * 0.08, 0.3, 0.16, cr);                   // eyes
      }
      cr.position.set(-14 + i * 9, 0, SHORE_Z + 2 + (i % 2) * 2);
      W.add(cr);
      W.clickable(cr, 'crab');
      S.crabs.push({ g: cr, x0: cr.position.x, phase: i * 1.7 });
    }

    // --- The tuk-tuk (a three-wheeled taxi), front toward -x ---
    const tk = new T.Group();
    box(2.2, 0.9, 1.6, C.tuktuk, 0.4, 0.35, 0, tk);              // back seat part
    box(1.2, 0.8, 1.0, C.tuktuk, -1.2, 0.35, 0, tk);             // driver part
    box(3.2, 0.12, 1.8, '#ffd23f', 0, 2.0, 0, tk);               // roof
    for (const [rx, rz] of [[-1.5, 0.8], [-1.5, -0.8], [1.4, 0.8], [1.4, -0.8]]) cyl(0.04, 0.9, '#5a5a73', rx, 1.15, rz, tk);
    box(0.06, 0.7, 0.9, '#bfe6ff', -1.8, 1.15, 0, tk);           // windscreen
    for (const [wx, wz] of [[-1.5, 0], [1.1, 0.75], [1.1, -0.75]]) {
      const w = cyl(0.32, 0.25, '#2b2b33', wx, 0, wz, tk);
      w.rotation.x = Math.PI / 2;
      w.position.y = 0.32;
    }
    tk.position.set(TAXI_AT.x, 0, TAXI_AT.z);
    W.add(tk);
    block(TAXI_AT.x, TAXI_AT.z, 3.6, 2);
    W.clickable(tk, 'taxi');
    S.taxi = tk;

    cyl(0.1, 2.6, C.palmTrunk, -3, 0, 1);
    W.sign('Thaimaa', -3, 2.4, 1, 0, '#fff7e0', '#2b2340', null, 2.6);
    block(-3, 1, 0.4, 0.4);

    S.hotel = W.hotel(22, 1, -Math.PI / 2, { wall: '#fffaf0', trim: '#2e8b57', awning: '#ff8fc0', sign: 'HOTELLI' });
    S.ch = W3.character(S.scene);
    S.built = true;
  }

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.thailand = {
    transparent: true,

    enter(params) {
      if (!S.built) build();
      W3.show();
      this.p = { x: 2.2, z: 4.2, heading: 0 };
      this.camHeading = 0;
      this.camDist = this.camHeight = null;
      this.target = null;
      this.onArrive = null;
      this.walking = false;
      this.walkTime = 0;
      this.seen = {};
      this.leaving = null;
      this.bubble = null;
      this.castleStep = 0;
      this.sprayAt = -10;
      this.inWater = false;
      this.showCastle();
      S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
      this.arrive = { t: 0 };
      S.ch.setVisible(false);
      // waking up in the hotel: out of the door, back to the trip
      if (params && params.from === 'hotel') {
        const d = S.hotel.door;
        this.p = { x: d.x, z: d.z, heading: d.heading + Math.PI };
        this.camHeading = this.p.heading;
        this.arrive = null;
        S.ch.setVisible(true);
        this.say('Hyvää huomenta, Thaimaa! Aurinko paistaa taas.', 3, 0.5);
      }
    },

    exit() {
      W3.hide();
    },

    say(text, seconds, delay) {
      this.bubble = { text, from: MP.time + (delay || 0), until: Infinity };   // stays until the next tap
    },

    walkTo(x, z, onArrive) {
      W3.walkTo(this, BOUNDS, x, z, onArrive);
    },

    showCastle() {
      S.castleParts.forEach((parts, i) => parts.forEach((m) => { m.visible = i < this.castleStep; }));
    },

    stand(spot) {
      if (spot === 'hotel') return S.hotel.door;
      if (spot === 'taxi') return { x: TAXI_AT.x - 1, z: TAXI_AT.z - 1.9 };
      if (spot === 'elephant') return { x: ELEPHANT.x - 4.2, z: ELEPHANT.z + 2.4 };
      if (spot === 'temple') return { x: TEMPLE.x + 6.5, z: TEMPLE.z };
      if (spot === 'castle') return { x: CASTLE.x, z: CASTLE.z + 2.2 };
      if (spot === 'stand') return { x: STAND.x, z: STAND.z + 1.8 };
      if (spot === 'boat') return { x: BOAT.x - 2, z: BOUNDS.minZ + 0.5 };
      if (spot === 'crab') return { x: this.p.x, z: this.p.z };
      return null;
    },

    use(spot) {
      if (spot === 'hotel') {
        // the hotel: sleep one night here
        this.say('Hotelli! Mennään sisään.', 1.5);
        MP.sfx.bling();
        MP.goTo(MP.scenes.hotel, { country: 'thailand' });
        return;
      }
      if (spot === 'taxi') {
        this.leaving = { t: 0 };
        S.ch.setVisible(false);
        this.say('Tuk-tuk, lentokentälle kiitos!', 2.2);
        MP.sfx.bling();
      } else if (spot === 'elephant') {
        this.sprayAt = MP.time;
        this.say('Norsu suihkuttaa vettä kärsällään! Pärsk!', 3);
        MP.sfx.flush();
      } else if (spot === 'temple') {
        this.say('Thaimaalainen temppeli! Katot ovat punaiset ja vihreät, ja kultainen torni kimaltaa auringossa.', 5);
        MP.sfx.tune();
      } else if (spot === 'castle') {
        if (this.castleStep < CASTLE_STEPS) {
          this.castleStep++;
          this.showCastle();
          MP.sfx.boing();
          this.say(['Ensin iso hiekkakeko!', 'Sitten tornit!', 'Lippu ja simpukka! Valmis hiekkalinna!'][this.castleStep - 1], 3);
          if (this.castleStep === CASTLE_STEPS) MP.sfx.bling();
        } else {
          this.say('Hieno hiekkalinna!', 2);
        }
      } else if (spot === 'stand') {
        this.say('Kookosvettä pillillä! Nam, raikasta!', 3);
        MP.sfx.gulp();
      } else if (spot === 'boat') {
        this.say('Pitkähäntävene! Sillä ajetaan saarille. Sen moottori on pitkän kepin päässä.', 4.5);
        MP.sfx.tune();
      } else if (spot === 'crab') {
        this.say('Rapu! Se kävelee sivuttain.', 2.5);
        MP.sfx.boing();
      }
    },

    onTap(x, y) {
      if (this.arrive || this.leaving || MP.isFading()) return;
      if (W3.hitTurn(x, y)) {
        this.target = null;
        this.p.heading += Math.PI;
        MP.sfx.tap();
        return;
      }
      W3.tap(this, x, y, S.camera, S.W, BOUNDS, (spot) => {
        if (spot === 'crab') { this.use('crab'); return true; }
        const st = this.stand(spot);
        if (!st) return false;
        MP.sfx.tap();
        this.walkTo(st.x, st.z, () => this.use(spot));
        return true;
      });
    },

    update(dt) {
      const p = this.p;
      const now = MP.time;

      // --- Tuk-tuk arriving / leaving ---
      if (this.arrive) {
        this.arrive.t += dt;
        const u = MP.clamp(this.arrive.t / 2, 0, 1);
        S.taxi.position.x = TAXI_AT.x + 40 * (1 - u) * (1 - u);
        if (this.arrive.t > 2.3) {
          this.arrive = null;
          S.ch.setVisible(true);
          MP.sfx.bling();
          const poster = MP.collectPoster('thailand') ? ' Sain julisteen omaan huoneeseeni!' : '';
          this.say('Thaimaa! Aurinko paistaa ja meri on lämmin. Mennään rannalle!' + poster, 4.5);
        }
      }
      if (this.leaving) {
        this.leaving.t += dt;
        const t = Math.max(0, this.leaving.t - 0.8);
        S.taxi.position.x = TAXI_AT.x - t * t * 6;
        if (this.leaving.t > 2.6 && !this.leaving.gone) {
          this.leaving.gone = true;
          MP.goTo(MP.scenes.airport, { country: 'thailand' });
        }
      }

      if (!this.arrive && !this.leaving) W3.walkStep(this, dt, SPEED, S.W.obstacles);
      else this.walking = false;

      // --- Waves, boat, crabs ---
      S.foam.position.z = SHORE_Z + Math.sin(now * 0.9) * 0.8;
      S.foam.material.opacity = 0.5 + Math.sin(now * 0.9) * 0.3;
      S.boat.position.y = Math.sin(now * 1.4) * 0.08;
      S.boat.rotation.z = Math.sin(now * 1.1) * 0.05;
      for (const cr of S.crabs) {
        cr.g.position.x = cr.x0 + Math.sin(now * 0.5 + cr.phase) * 2.5;
        cr.g.position.y = Math.abs(Math.sin(now * 8 + cr.phase)) * 0.04;
      }

      // --- The elephant: trunk swings up and sprays ---
      const sp = now - this.sprayAt;
      const lift = sp < 2.6 ? Math.sin(MP.clamp(sp / 2.6, 0, 1) * Math.PI) : 0;
      S.trunk.forEach((seg, i) => { seg.rotation.z = -lift * 0.45 + Math.sin(now * 1.5 + i) * 0.05; });
      if (sp > 0.4 && sp < 2.2) {
        const tipPos = new W3.T.Vector3();
        S.trunk[S.trunk.length - 1].localToWorld(tipPos.set(0, -0.5, 0));
        for (let n = 0; n < 2; n++) {
          const d = S.drops.find((q) => q.life <= 0);
          if (!d) break;
          d.life = 1.1;
          d.m.position.copy(tipPos);
          const dir = new W3.T.Vector3(-1, 0, 0).applyQuaternion(S.elephant.quaternion);
          d.v = { x: dir.x * 4 + (Math.random() - 0.5), y: 4 + Math.random() * 1.5, z: dir.z * 4 + (Math.random() - 0.5) };
        }
      }
      for (const d of S.drops) {
        if (d.life <= 0) { d.m.visible = false; continue; }
        d.life -= dt;
        d.v.y -= 9 * dt;
        d.m.position.x += d.v.x * dt; d.m.position.y += d.v.y * dt; d.m.position.z += d.v.z * dt;
        d.m.visible = d.m.position.y > 0;
      }

      // --- Paddling in the shallow water ---
      const wet = p.z < SHORE_Z;
      if (wet && !this.inWater && !this.arrive) {
        this.say('Pulikoidaan! Vesi on lämmintä!', 2.5);
        MP.sfx.flush();
      }
      this.inWater = wet;

      // --- Arriving at places (said once) ---
      if (!this.arrive) {
        for (const [id, pl] of Object.entries(PLACES)) {
          if (!this.seen[id] && Math.hypot(p.x - pl.x, p.z - pl.z) < pl.r) {
            this.seen[id] = true;
            if (id === 'elephant') this.say('Norsu! Napauta sitä.', 3);
            if (id === 'temple') this.say('Kultainen temppeli! Napauta sitä.', 3);
            if (id === 'castle') this.say('Hiekkaa! Napauta, niin rakennetaan hiekkalinna.', 3.5);
            if (id === 'stand') this.say('Kookoskoju! Napauta sitä.', 3);
          }
        }
      }

      W3.follow(S.camera, this, dt);
      // in the water only the top half shows
      this.headPos = S.ch.draw(p.x, wet ? -0.18 : 0, p.z, { walking: this.walking, walkTime: this.walkTime });
      if (this.leaving || this.arrive) this.headPos = S.taxi.position.clone().setY(2.6);
      W3.render(S.scene, S.camera);
    },

    draw(ctx) {
      W3.drawBubble(ctx, this.bubble, this.headPos, S.camera);
      if (!this.arrive && !this.leaving) W3.drawTurnButton(ctx);
    },
  };
})();
