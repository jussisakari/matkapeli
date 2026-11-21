// street.js – OUTSIDE! A 3D neighbourhood seen from behind the character.
// Tap the ground to walk there; the camera turns to stay behind you.
// Walk to the crossroad: one way goes to the taxi station, the other to the playground.
// Uses Three.js (js/lib/three.min.js). The character is our normal 2D drawing,
// seen from behind, shown as a flat picture standing in the 3D world.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  // Colors outside (Ella can change these)
  MP.OUTSIDE = {
    sky: '#9fdcff',
    grass: '#7cc56b',
    road: '#6b6f7a',
    sidewalk: '#d3d6dc',
    line: '#ffffff',
    trunk: '#8b5a2b',
    leaves: '#4caf50',
    hills: '#5aa84f',
    taxi: '#ffd23f',
    sand: '#f4dc9a',
  };

  const SPEED = 3.4;         // meters per second
  const BOUNDS = { minX: -56, maxX: 56, minZ: -64, maxZ: 11 };
  const START = { x: 0, z: 8.5 };
  const PLACES = {
    cross: { x: 0, z: -40, r: 5 },
    taxi: { x: -32, z: -45, r: 7 },
    play: { x: 34, z: -52, r: 9 },
  };
  const TAXI_AT = { x: -30, z: -46.5 };
  const W3 = MP.w3d;

  const S = { built: false };   // everything 3D lives here
  MP.street3d = S;              // (for testing)

  // ---------------------------------------------------------------------------
  // Building the world
  // ---------------------------------------------------------------------------
  function build() {
    W3.init();
    const T = window.THREE;
    S.T = T;
    S.scene = new T.Scene();
    S.scene.background = new T.Color(MP.OUTSIDE.sky);
    S.scene.fog = new T.Fog(MP.OUTSIDE.sky, 40, 110);
    S.camera = new T.PerspectiveCamera(55, 16 / 9, 0.1, 250);
    S.hemi = new T.HemisphereLight(0xffffff, 0x6a9a5a, 0.85);
    S.scene.add(S.hemi);
    const sun = new T.DirectionalLight(0xffffff, 0.55);
    sun.position.set(25, 40, 15);
    S.scene.add(sun);
    S.sun = sun;

    const W = W3.kit(S.scene);
    S.W = W;
    S.clickables = W.clickables;
    S.obstacles = W.obstacles;
    const { add, box, cyl, ball, flat, block, sign } = W;
    const mat = W.mat;

    // --- Ground, roads, sidewalks ---
    const ground = new T.Mesh(new T.PlaneGeometry(400, 400), mat(MP.OUTSIDE.grass));
    ground.rotation.x = -Math.PI / 2;
    add(ground);
    flat(6, 49, MP.OUTSIDE.road, 0, -18.5);               // main street
    flat(104, 6, MP.OUTSIDE.road, 0, -40, 0.012);         // cross street
    flat(1.2, 43, MP.OUTSIDE.sidewalk, -3.6, -15.5);
    flat(1.2, 43, MP.OUTSIDE.sidewalk, 3.6, -15.5);
    flat(104, 1.2, MP.OUTSIDE.sidewalk, 0, -36.4, 0.011);
    flat(104, 1.2, MP.OUTSIDE.sidewalk, 0, -43.6, 0.011);
    for (let z = 5; z > -35; z -= 3) flat(0.2, 1.3, MP.OUTSIDE.line, 0, z, 0.02);
    for (let x = -50; x < 51; x += 3) if (Math.abs(x) > 4) flat(1.3, 0.2, MP.OUTSIDE.line, x, -40, 0.022);
    // zebra crossing at the crossroad
    for (let x = -2.4; x <= 2.4; x += 0.8) flat(0.45, 2, MP.OUTSIDE.line, x, -35, 0.025);

    // --- Houses ---
    function house(x, z, rotY, wall, roof, door, isHome) {
      const g = new T.Group();
      box(6, 4, 5, wall, 0, 0, 0, g);
      const r = new T.Mesh(new T.ConeGeometry(4.7, 2.6, 4), mat(roof));
      r.rotation.y = Math.PI / 4;
      r.scale.set(1, 1, 0.85);
      r.position.set(0, 5.3, 0);
      g.add(r);
      box(0.6, 1.6, 0.6, '#9c4a3f', 1.6, 4.6, 0.6, g);    // chimney
      box(1.1, 2, 0.1, door, 0, 0, 2.5, g);                 // door
      box(1.1, 1, 0.1, '#bfe6ff', -1.9, 1.6, 2.5, g);       // windows
      box(1.1, 1, 0.1, '#bfe6ff', 1.9, 1.6, 2.5, g);
      if (isHome) {
        // our own house: a flower box and a doormat
        box(1.4, 0.3, 0.3, '#a0643c', -1.9, 1.3, 2.7, g);
        for (let i = 0; i < 4; i++) ball(0.13, ['#ff8fc0', '#ffd23f', '#e04848', '#c084fc'][i], -2.4 + i * 0.33, 1.7, 2.75, g);
      }
      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      add(g);
      const sideways = Math.abs(Math.sin(rotY)) > 0.5;
      block(x, z, sideways ? 5.4 : 6.4, sideways ? 6.4 : 5.4);
      return g;
    }
    S.home = house(0, 17.5, Math.PI, '#f2d7b0', '#c0504d', '#d9534f', true);
    flat(1.6, 9, MP.OUTSIDE.sidewalk, 0, 10.5, 0.013);   // path from our door to the gate
    // Tap our own house to go home (in the evening)
    S.home.traverse((m) => { m.userData.spot = 'home'; });
    S.clickables.push(S.home);

    // --- Our own yard with a wooden picket fence (and a gate by the path) ---
    const YARD = { minX: -10, maxX: 10, minZ: 6, maxZ: 23 };
    const wood = '#b07a45', woodDark = '#8b5a2b';
    function fenceLine(x1, z1, x2, z2) {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const n = Math.round(len / 0.5);
      const along = Math.abs(x2 - x1) > Math.abs(z2 - z1);
      for (let i = 0; i <= n; i++) {
        const x = x1 + (x2 - x1) * i / n, z = z1 + (z2 - z1) * i / n;
        box(along ? 0.3 : 0.08, 0.95, along ? 0.08 : 0.3, wood, x, 0, z);          // a picket
        const tip = new T.Mesh(new T.ConeGeometry(0.2, 0.25, 4), mat(wood));       // pointed top
        tip.position.set(x, 1.07, z);
        tip.rotation.y = Math.PI / 4;
        tip.scale.set(along ? 1 : 0.35, 1, along ? 0.35 : 1);
        add(tip);
      }
      for (const y of [0.3, 0.7]) {                                               // two rails behind
        box(along ? len : 0.06, 0.1, along ? 0.06 : len, woodDark, (x1 + x2) / 2, y, (z1 + z2) / 2 + (along ? 0.07 : 0));
      }
      S.obstacles.push({
        minX: Math.min(x1, x2) - 0.1, maxX: Math.max(x1, x2) + 0.1,
        minZ: Math.min(z1, z2) - 0.1, maxZ: Math.max(z1, z2) + 0.1,
      });
    }
    fenceLine(YARD.minX, YARD.minZ, -1.3, YARD.minZ);          // front, left of the gate
    fenceLine(1.3, YARD.minZ, YARD.maxX, YARD.minZ);           // front, right of the gate
    fenceLine(YARD.minX, YARD.minZ, YARD.minX, YARD.maxZ);     // sides
    fenceLine(YARD.maxX, YARD.minZ, YARD.maxX, YARD.maxZ);
    fenceLine(YARD.minX, YARD.maxZ, YARD.maxX, YARD.maxZ);     // back
    for (const gx of [-1.3, 1.3]) box(0.22, 1.3, 0.22, woodDark, gx, 0, YARD.minZ);   // gate posts
    const gate = new T.Group();                                 // the gate, standing open
    for (let i = 0; i < 4; i++) box(0.3, 0.9, 0.06, wood, 0.25 + i * 0.6, 0, 0, gate);
    box(2.4, 0.1, 0.06, woodDark, 1.2, 0.55, 0.05, gate);
    gate.position.set(1.3, 0, YARD.minZ);
    gate.rotation.y = -1.9;
    add(gate);
    // a mailbox by the gate and a flower bed
    box(0.08, 1.1, 0.08, woodDark, -2.2, 0, YARD.minZ - 0.6);
    box(0.5, 0.35, 0.7, '#3f6fb5', -2.2, 1.1, YARD.minZ - 0.6);
    flat(3, 1.2, '#8b5a2b', -6, 14.5, 0.014);
    for (let i = 0; i < 6; i++) ball(0.16, ['#ff8fc0', '#ffd23f', '#e04848'][i % 3], -7.2 + i * 0.5, 0.2, 14.5);
    // --- A swimming pool in our yard (swimming only with the swimsuit on) ---
    const pool = new T.Group();
    box(5.6, 0.3, 4.2, '#f2f5f8', 0, 0, 0, pool);                     // white tiled edge
    const water = new T.Mesh(new T.PlaneGeometry(4.8, 3.4), new T.MeshLambertMaterial({ color: '#3fb6f0' }));
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.31, 0);
    pool.add(water);
    const lane = new T.Mesh(new T.PlaneGeometry(3.6, 0.12), new T.MeshBasicMaterial({ color: '#8fe0ff' }));
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(0, 0.315, 0);
    pool.add(lane);
    for (const lx of [-0.25, 0.25]) {                                    // the ladder
      const rail = cyl(0.04, 0.8, '#c9d1db', 2.2 + lx, 0.2, -1.95, pool);
      rail.rotation.z = 0;
    }
    box(0.6, 0.05, 0.05, '#c9d1db', 2.2, 0.85, -1.95, pool);
    const ring = new T.Mesh(new T.TorusGeometry(0.42, 0.13, 10, 24), mat('#ff5f8f'));   // a swim ring floating
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(-1.2, 0.36, 0.5);
    pool.add(ring);
    const duck = new T.Group();                                          // a rubber duck
    ball(0.22, '#ffd23f', 0, 0.42, 0, duck).scale.set(1.3, 0.8, 1);
    ball(0.13, '#ffd23f', 0.18, 0.62, 0, duck);
    ball(0.06, '#ff8a2a', 0.32, 0.6, 0, duck);
    duck.position.set(0.9, 0, -0.6);
    pool.add(duck);
    pool.position.set(6.2, 0, 10.4);
    add(pool);
    block(6.2, 10.4, 5.6, 4.2);
    pool.traverse((m) => { m.userData.spot = 'pool'; });
    S.clickables.push(pool);
    S.pool = { ring, duck };
    // a sun lounger next to it
    const lounger = box(1, 0.35, 2.2, '#ffffff', -6.8, 0, 9.4);
    box(1, 0.08, 1.8, '#4a78c8', -6.8, 0.35, 9.4);
    void lounger;
    block(-6.8, 9.4, 1, 2.2);

    house(-12, -4, Math.PI / 2, '#bfe3f2', '#4a78c8', '#ffd23f');
    house(-12, -21, Math.PI / 2, '#ffe0e9', '#9b6bd6', '#4caf50');
    house(12, -10, -Math.PI / 2, '#fff1c9', '#e07a3a', '#4a78c8');
    house(12, -26, -Math.PI / 2, '#d9f2d0', '#8b5a2b', '#e04848');
    house(-14, -57, 0, '#e8dcf7', '#c0504d', '#3cb371');
    house(13, -66, 0, '#f2d7b0', '#4a78c8', '#ff8fc0');

    // --- Trees, lamps, hills, clouds ---
    function tree(x, z, s) {
      s = s || 1;
      cyl(0.22 * s, 1.8 * s, MP.OUTSIDE.trunk, x, 0, z);
      ball(1.3 * s, MP.OUTSIDE.leaves, x, 2.6 * s, z);
      ball(0.9 * s, '#5cbf60', x + 0.6 * s, 3.3 * s, z + 0.3 * s);
      block(x, z, 0.8, 0.8);
    }
    [[-7, 3], [7, -1], [-7, -13], [7, -18], [-7, -29], [7, -32], [-20, -32], [20, -31], [-45, -33],
      [45, -33], [-24, -52], [47, -50], [-48, -52], [-22, -14], [24, -18], [-30, -24], [30, -4], [-8, 21], [8, 20]]
      .forEach(([x, z], i) => tree(x, z, 0.85 + (i % 3) * 0.15));
    function lamp(x, z) {
      cyl(0.08, 3.4, '#5a5a73', x, 0, z);
      ball(0.28, '#fff4c2', x, 3.55, z);
    }
    [[-4.6, -2], [4.6, -14], [-4.6, -26], [4.6, -34], [-16, -44.6], [16, -44.6]].forEach(([x, z]) => lamp(x, z));
    [[-90, -40, 30], [90, -30, 34], [0, -125, 40], [-60, -110, 30], [70, -105, 32], [-95, 20, 28], [95, 25, 28]]
      .forEach(([x, z, r]) => ball(r, MP.OUTSIDE.hills, x, -r * 0.55, z));
    S.clouds = [];
    for (let i = 0; i < 9; i++) {
      const g = new T.Group();
      for (let k = 0; k < 4; k++) ball(1.6 + Math.random(), '#ffffff', k * 1.8, Math.random() * 0.8, Math.random(), g);
      g.position.set(-70 + i * 18, 22 + (i % 3) * 4, -40 - (i % 4) * 25);
      add(g);
      S.clouds.push(g);
    }
    // flowers in the grass
    for (let i = 0; i < 70; i++) {
      const x = (Math.random() - 0.5) * 100, z = 8 - Math.random() * 72;
      if (Math.abs(x) < 5 || Math.abs(z + 40) < 5) continue;
      ball(0.12, ['#ff8fc0', '#ffd23f', '#ffffff', '#c084fc'][i % 4], x, 0.12, z);
    }

    // --- Signpost at the crossroad ---
    cyl(0.1, 3.2, '#a0643c', 4.6, 0, -35.2);
    sign('Taksiasema', 4.6, 2.9, -35.2, 0, '#fff7e0', '#2b2340', 'left', 2.8);
    sign('Leikkipuisto', 4.6, 2.2, -35.2, 0, '#fff7e0', '#2b2340', 'right', 2.8);
    block(4.6, -35.2, 0.5, 0.5);

    // --- Taxi station ---
    const shelter = new T.Group();
    box(0.15, 2.6, 0.15, '#5a5a73', -1.9, 0, -0.9, shelter);
    box(0.15, 2.6, 0.15, '#5a5a73', 1.9, 0, -0.9, shelter);
    box(0.15, 2.6, 0.15, '#5a5a73', -1.9, 0, 0.9, shelter);
    box(0.15, 2.6, 0.15, '#5a5a73', 1.9, 0, 0.9, shelter);
    box(4.3, 0.2, 2.3, '#4a78c8', 0, 2.6, 0, shelter);
    box(3.4, 0.15, 0.7, '#a0643c', 0, 0.55, -0.6, shelter);   // bench
    shelter.position.set(-39, 0, -47);
    add(shelter);
    block(-39, -47, 4.4, 2.4);
    sign('TAKSI', -39, 3.5, -46, 0, '#ffd23f', '#2b2340', null, 2.2);

    S.taxi = W.taxi(MP.OUTSIDE.taxi);
    S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
    block(TAXI_AT.x, TAXI_AT.z, 4, 2);
    W.clickable(S.taxi, 'taxi');

    // --- Playground ---
    flat(17, 15, MP.OUTSIDE.sand, 34, -53, 0.015);
    // low fence
    for (let x = 25.5; x <= 42.5; x += 1) {
      if (x > 32 && x < 36) continue;          // the gate
      box(0.1, 0.7, 0.1, '#ffffff', x, 0, -45.5);
      box(0.1, 0.7, 0.1, '#ffffff', x, 0, -60.5);
    }
    box(7, 0.08, 0.08, '#ffffff', 28.75, 0.55, -45.5);
    box(7, 0.08, 0.08, '#ffffff', 39.25, 0.55, -45.5);
    box(17, 0.08, 0.08, '#ffffff', 34, 0.55, -60.5);

    // Swings
    const swingFrame = new T.Group();
    for (const sx of [-2.2, 2.2]) {
      const a = cyl(0.09, 3.3, '#e04848', sx, 0, -0.5, swingFrame); a.rotation.x = 0.25;
      const b = cyl(0.09, 3.3, '#e04848', sx, 0, 0.5, swingFrame); b.rotation.x = -0.25;
    }
    const bar = cyl(0.09, 4.6, '#e04848', 0, 3.1, 0, swingFrame);
    bar.rotation.z = Math.PI / 2;
    bar.position.y = 3.15;
    S.swings = [];
    for (const sx of [-1, 1]) {
      const pivot = new T.Group();
      pivot.position.set(sx, 3.15, 0);
      box(0.04, 2.4, 0.04, '#5a5a73', -0.32, -2.4, 0, pivot);
      box(0.04, 2.4, 0.04, '#5a5a73', 0.32, -2.4, 0, pivot);
      box(0.8, 0.1, 0.4, '#4a78c8', 0, -2.45, 0, pivot);
      swingFrame.add(pivot);
      S.swings.push(pivot);
    }
    swingFrame.position.set(29.5, 0, -51);
    add(swingFrame);
    swingFrame.traverse((m) => { m.userData.spot = 'swing'; });
    S.clickables.push(swingFrame);
    S.swingFrame = swingFrame;

    // Slide
    const slide = new T.Group();
    box(1.2, 0.12, 1.2, '#ffd23f', 0, 2, -2.6, slide);             // platform
    for (const [px, pz] of [[-0.55, -3.15], [0.55, -3.15], [-0.55, -2.05], [0.55, -2.05]]) {
      cyl(0.06, 2, '#4a78c8', px, 0, pz, slide);
    }
    for (let y = 0.4; y < 2; y += 0.4) box(1.1, 0.06, 0.06, '#4a78c8', 0, y, -3.2, slide);   // ladder
    const chute = box(1, 0.08, 4.8, '#e04848', 0, 0, 0, slide);
    chute.position.set(0, 1.1, 0.1);
    chute.rotation.x = Math.atan2(1.9, 4.4);
    slide.position.set(38.5, 0, -51);
    add(slide);
    block(38.5, -53.5, 1.4, 1.4);
    slide.traverse((m) => { m.userData.spot = 'slide'; });
    S.clickables.push(slide);

    // Roundabout
    const round = new T.Group();
    cyl(1.4, 0.2, '#3cb371', 0, 0.2, 0, round);
    cyl(0.1, 0.9, '#ffd23f', 0, 0.4, 0, round);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      const h = cyl(0.05, 0.7, '#ffd23f', Math.cos(a) * 1.1, 0.4, Math.sin(a) * 1.1, round);
      h.userData.handle = true;
    }
    round.position.set(29.5, 0, -57);
    add(round);
    block(29.5, -57, 2.8, 2.8);
    round.traverse((m) => { m.userData.spot = 'roundabout'; });
    S.clickables.push(round);
    S.roundabout = round;

    // Sandbox
    const sandbox = new T.Group();
    box(3, 0.35, 0.2, '#a0643c', 0, 0, -1.4, sandbox);
    box(3, 0.35, 0.2, '#a0643c', 0, 0, 1.4, sandbox);
    box(0.2, 0.35, 3, '#a0643c', -1.4, 0, 0, sandbox);
    box(0.2, 0.35, 3, '#a0643c', 1.4, 0, 0, sandbox);
    box(2.6, 0.2, 2.6, '#f0cf78', 0, 0, 0, sandbox);
    S.castle = new T.Group();
    cyl(0.5, 0.5, '#e6c06a', 0, 0.2, 0, S.castle);
    cyl(0.3, 0.4, '#e6c06a', 0, 0.7, 0, S.castle);
    const flagPole = cyl(0.02, 0.5, '#5a5a73', 0, 1.1, 0, S.castle);
    box(0.25, 0.15, 0.02, '#e04848', 0.13, 1.45, 0, S.castle);
    flagPole.userData.flag = true;
    S.castle.visible = false;
    sandbox.add(S.castle);
    sandbox.position.set(38.5, 0, -57.5);
    add(sandbox);
    block(38.5, -57.5, 3, 3);
    sandbox.traverse((m) => { m.userData.spot = 'sandbox'; });
    S.clickables.push(sandbox);

    // Where to stand to use each thing
    S.spots = {
      taxi: { x: -30, z: -44.3 },
      home: { x: 0, z: 10.8 },
      pool: { x: 5.6, z: 7.4 },
      swing: { x: 30.5, z: -49.6 },
      slide: { x: 38.5, z: -48.2 },
      roundabout: { x: 29.5, z: -54.6 },
      sandbox: { x: 38.5, z: -55.2 },
    };

    S.ch = W3.character(S.scene);
    S.pet = MP.petBuddy(S.scene, S.clickables);     // our pet follows us outside
    S.built = true;
  }

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  // Day or evening: in the evening (back from a trip) the sky is darker and
  // the street lamps and the windows glow
  function setEvening(on) {
    const T = S.T;
    const sky = on ? '#6a5a9e' : MP.OUTSIDE.sky;
    S.scene.background = new T.Color(sky);
    S.scene.fog.color = new T.Color(sky);
    S.hemi.intensity = on ? 0.5 : 0.85;
    S.sun.intensity = on ? 0.35 : 0.55;
    S.sun.color = new T.Color(on ? '#ffb27a' : '#ffffff');
    for (const col of ['#bfe6ff', '#fff4c2']) {
      S.W.mat(col).emissive = new T.Color(on ? '#ffd27a' : '#000000');
      S.W.mat(col).emissiveIntensity = on ? 0.8 : 0;
    }
  }

  MP.scenes.street = {
    transparent: true,

    // params.from === 'taxi': coming back from a trip, standing by the taxi
    enter(params) {
      if (!S.built) build();
      W3.show();
      const back = params && params.from === 'taxi';
      const swum = params && params.from === 'pool';
      this.p = back ? { x: -30, z: -44.3, heading: Math.PI / 2 }
        : swum ? { x: S.spots.pool.x, z: S.spots.pool.z, heading: 0 } : { x: START.x, z: START.z, heading: 0 };
      this.camHeading = this.p.heading;
      this.target = null;
      this.onArrive = null;
      this.walking = false;
      this.walkTime = 0;
      this.play = null;          // riding the swing or the slide
      this.ride = null;          // driving away in the taxi
      this.seen = back ? { cross: true, taxi: true } : {};   // places already visited
      this.round = { speed: 0 };
      this.swingAt = -10;
      setEvening(!!MP.state.dusk);
      S.castle.visible = false;
      S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
      S.ch.setVisible(true);
      // the pet: waiting by the pool, running from the house to meet us, or coming out with us
      if (swum) S.pet.place(this.p.x + 1.2, this.p.z + 0.6);
      else if (back) { S.pet.place(0, 9); S.pet.happyFrom = MP.time + 0.3; }
      else S.pet.place(this.p.x + 0.8, this.p.z + 1.2);
      if (swum) this.say('Olipa kivaa uida! Nyt kuivataan pyyhkeellä ja lähdetään seikkailemaan.', 4, 0.6);
      else if (back && MP.state.dusk) this.say('Takaisin kotikadulla! On jo ilta – katulamput palavat. Kotiin pääsee napauttamalla kotitalon ovea.', 4.5, 0.6);
      else if (back) this.say('Takaisin kotikadulla! Leikkipuistoon vai kotiin? Kotiin pääsee napauttamalla kotitalon ovea.', 4.5, 0.6);
      else this.say('Ulkona! Kävellään risteykseen.', 4, 0.6);
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

    // ---- Things to do ----
    use(spot) {
      if (spot === 'home') {
        this.say('Kotiin! Nyt on jo ilta.', 2);
        MP.sfx.bling();
        this.ride = { t: 0, home: true };          // stops walking while the screen fades
        MP.goTo(MP.scenes.home, { quest: 'evening' });
        return;
      }
      if (spot === 'pool') {
        if (MP.heroKind() === 'swim') {
          this.say('Uimaan! Polskis!', 1.5);
          MP.sfx.flush();
          this.ride = { t: 0, home: true };          // stops walking while the screen fades
          MP.goTo(MP.scenes.swim);
        } else {
          this.say('Oma uima-allas! Uimaan pääsee vain uimapuku päällä. Uimapuvun saa vaatekaapista.', 4);
          MP.sfx.tap();
        }
        return;
      }
      if (spot === 'taxi') {
        // Hop in, and the taxi drives away to the airport
        this.ride = { t: 0 };
        S.ch.setVisible(false);
        this.say('Taksi, lentokentälle kiitos!', 2.2);
        MP.sfx.bling();
      } else if (spot === 'swing') {
        this.play = { type: 'swing', t: 0 };
        this.swingAt = MP.time;
        this.say('Wiii!', 2);
        MP.sfx.boing();
      } else if (spot === 'slide') {
        this.play = { type: 'slide', t: 0 };
        this.say('Liukumäkeen!', 1.5);
      } else if (spot === 'roundabout') {
        this.round.speed = 6;
        this.say('Karuselli pyörii!', 2);
        MP.sfx.boing();
      } else if (spot === 'sandbox') {
        S.castle.visible = true;
        this.say('Tein hiekkalinnan!', 2.5);
        MP.sfx.bling();
      }
    },

    onTap(x, y) {
      if (this.play || this.ride) return;
      if (W3.hitTurn(x, y)) {
        this.target = null;
        this.p.heading += Math.PI;
        MP.sfx.tap();
        return;
      }
      W3.tap(this, x, y, S.camera, S.W, BOUNDS, (spot) => {
        if (spot === 'pet') {
          S.pet.pat();
          return true;
        }
        const stand = S.spots[spot];
        if (!stand) return false;
        MP.sfx.tap();
        this.walkTo(stand.x, stand.z, () => this.use(spot));
        return true;
      });
    },

    update(dt) {
      const p = this.p;
      if (!this.play && !this.ride) W3.walkStep(this, dt, SPEED, S.obstacles);
      else this.walking = false;

      // --- Arriving at places (said once) ---
      for (const [id, pl] of Object.entries(PLACES)) {
        if (!this.seen[id] && Math.hypot(p.x - pl.x, p.z - pl.z) < pl.r) {
          this.seen[id] = true;
          if (id === 'cross') this.say('Risteys! Kumpaan mennään: taksiasemalle vai leikkipuistoon?', 4.5);
          if (id === 'taxi') this.say('Taksiasema! Napauta taksia, niin mennään lentokentälle!', 3.5);
          if (id === 'play') this.say('Leikkipuisto! Kokeile keinua, liukumäkeä, karusellia ja hiekkalaatikkoa!', 4.5);
        }
      }

      // --- Playground rides ---
      const swingAge = MP.time - this.swingAt;
      const swingAngle = swingAge < 4.5 ? Math.sin(swingAge * 3.2) * 0.65 * (1 - swingAge / 4.5) : 0;
      S.swings.forEach((s, i) => { s.rotation.x = i === 1 ? swingAngle : swingAngle * 0.3; });
      this.round.speed *= Math.pow(0.6, dt);
      S.roundabout.rotation.y += this.round.speed * dt;
      if (this.play) {
        this.play.t += dt;
        if (this.play.type === 'swing' && this.play.t > 4.5) this.endPlay(S.spots.swing);
        else if (this.play.type === 'slide' && this.play.t > 2.2) this.endPlay({ x: 38.5, z: -47.2 });
      }

      // --- Taxi drives away (speeding up), to the airport ---
      if (this.ride && !this.ride.home) {
        this.ride.t += dt;
        const t = Math.max(0, this.ride.t - 0.8);
        S.taxi.position.x = TAXI_AT.x - t * t * 6;
        if (this.ride.t > 2.6 && !this.ride.gone) {
          this.ride.gone = true;
          MP.goTo(MP.scenes.airport, { country: 'home' });
        }
      }

      // --- Toys bobbing in the pool ---
      if (S.pool) {
        S.pool.ring.position.y = 0.36 + Math.sin(MP.time * 1.6) * 0.03;
        S.pool.ring.rotation.z = MP.time * 0.2;
        S.pool.duck.position.y = Math.sin(MP.time * 2 + 1) * 0.03;
        S.pool.duck.rotation.y = Math.sin(MP.time * 0.5) * 0.8;
      }

      // --- Clouds drift ---
      for (const c of S.clouds) {
        c.position.x += dt * 0.6;
        if (c.position.x > 80) c.position.x = -80;
      }

      W3.follow(S.camera, this, dt);
      S.pet.update(dt, this, !!this.ride || !!this.play);
      this.drawCharacter();
      W3.render(S.scene, S.camera);
    },

    endPlay(stand) {
      this.play = null;
      this.p.x = stand.x;
      this.p.z = stand.z;
    },

    drawCharacter() {
      let x = this.p.x, z = this.p.z, y = 0;
      let sit = false;
      if (this.play && this.play.type === 'swing') {
        // sitting on the swing seat, moving with it
        const seat = S.swings[1];
        const a = seat.rotation.x;
        x = S.swingFrame.position.x + seat.position.x;
        z = S.swingFrame.position.z + Math.sin(a) * 2.45;
        y = 3.15 - Math.cos(a) * 2.45 - 0.33;
        sit = true;
      } else if (this.play && this.play.type === 'slide') {
        // climb up, then slide down
        const t = this.play.t;
        if (t < 0.8) { x = 38.5; z = -53.8; y = (t / 0.8) * 2.1; }
        else {
          const u = MP.clamp((t - 0.8) / 1.2, 0, 1);
          x = 38.5; z = MP.lerp(-53, -48.6, u); y = MP.lerp(2.1, 0.25, u) - 0.25;
          sit = true;
        }
      }
      this.headPos = S.ch.draw(x, y, z, { sit, walking: this.walking, walkTime: this.walkTime });
      if (this.ride && !this.ride.home) this.headPos = S.taxi.position.clone().setY(2.6);
    },

    draw(ctx) {
      S.pet.draw2d(ctx, S.camera);
      W3.drawBubble(ctx, this.bubble, this.headPos, S.camera);
      if (!this.ride) W3.drawTurnButton(ctx);
      // the way home: an arrow over our own door once we have been somewhere
      if (this.seen.taxi || this.seen.play) {
        const s2 = W3.toScreen(new S.T.Vector3(0, 3.2, 14.6), S.camera);
        const v = new S.T.Vector3(0, 3.2, 14.6).sub(S.camera.position);
        const dir = new S.T.Vector3();
        S.camera.getWorldDirection(dir);
        if (v.dot(dir) > 0 && s2.x > 0 && s2.x < MP.W && s2.y > 0 && s2.y < MP.H) {
          MP.draw('arrow', ctx, s2.x, s2.y + Math.sin(MP.time * 6) * 2.5);
        }
      }
    },
  };
})();
