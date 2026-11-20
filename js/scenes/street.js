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
  const PERSON_M = 1.25;     // character height in meters
  const BOUNDS = { minX: -56, maxX: 56, minZ: -64, maxZ: 9.5 };
  const START = { x: 0, z: 8.5 };
  const PLACES = {
    cross: { x: 0, z: -40, r: 5 },
    taxi: { x: -32, z: -45, r: 7 },
    play: { x: 34, z: -52, r: 9 },
  };
  const TURN_BUTTON = { x: 290, y: 152, r: 15 };

  const S = { built: false };   // everything 3D lives here
  MP.street3d = S;              // (for testing)

  // ---------------------------------------------------------------------------
  // Building the world
  // ---------------------------------------------------------------------------
  function build() {
    const T = window.THREE;
    S.T = T;
    S.canvas = document.createElement('canvas');
    S.canvas.id = 'game3d';
    Object.assign(S.canvas.style, { position: 'fixed', zIndex: '0', pointerEvents: 'none', display: 'none' });
    document.body.appendChild(S.canvas);

    S.renderer = new T.WebGLRenderer({ canvas: S.canvas, antialias: true, preserveDrawingBuffer: true });
    S.scene = new T.Scene();
    S.scene.background = new T.Color(MP.OUTSIDE.sky);
    S.scene.fog = new T.Fog(MP.OUTSIDE.sky, 40, 110);
    S.camera = new T.PerspectiveCamera(55, 16 / 9, 0.1, 250);
    S.scene.add(new T.HemisphereLight(0xffffff, 0x6a9a5a, 0.85));
    const sun = new T.DirectionalLight(0xffffff, 0.55);
    sun.position.set(25, 40, 15);
    S.scene.add(sun);

    S.clickables = [];
    S.obstacles = [];
    const mats = {};
    const mat = (color) => mats[color] || (mats[color] = new T.MeshLambertMaterial({ color }));

    function add(mesh, parent) { (parent || S.scene).add(mesh); return mesh; }
    // A box standing on (x, y, z)
    function box(w, h, d, color, x, y, z, parent) {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat(color));
      m.position.set(x, y + h / 2, z);
      return add(m, parent);
    }
    function cyl(r, h, color, x, y, z, parent, rTop) {
      const m = new T.Mesh(new T.CylinderGeometry(rTop != null ? rTop : r, r, h, 14), mat(color));
      m.position.set(x, y + h / 2, z);
      return add(m, parent);
    }
    function ball(r, color, x, y, z, parent) {
      const m = new T.Mesh(new T.SphereGeometry(r, 16, 12), mat(color));
      m.position.set(x, y, z);
      return add(m, parent);
    }
    // Flat piece lying on the ground
    function flat(w, d, color, x, z, y) {
      const m = new T.Mesh(new T.PlaneGeometry(w, d), mat(color));
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, y || 0.01, z);
      return add(m);
    }
    function block(x, z, w, d) {
      S.obstacles.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
    }
    // A picture with text, for signs
    function textTexture(text, bg, fg, arrow) {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 128;
      const g = c.getContext('2d');
      g.fillStyle = bg; g.fillRect(0, 0, 512, 128);
      g.strokeStyle = '#2b2340'; g.lineWidth = 10; g.strokeRect(5, 5, 502, 118);
      g.fillStyle = fg;
      g.font = 'bold 64px ' + MP.FONT_FAMILY;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(text, arrow ? 290 : 256, 68);
      if (arrow) {
        g.beginPath();
        g.moveTo(30, 64); g.lineTo(90, 24); g.lineTo(90, 104); g.closePath();
        g.fill();
      }
      return new T.CanvasTexture(c);
    }
    function sign(text, x, y, z, rotY, bg, fg, arrowDir, w) {
      const tex = textTexture(text, bg, fg, !!arrowDir);
      if (arrowDir === 'right') { tex.wrapS = T.RepeatWrapping; tex.repeat.x = -1; }
      const m = new T.Mesh(new T.PlaneGeometry(w || 3, (w || 3) / 4), new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide }));
      if (arrowDir === 'right') {
        // flip the picture so the arrow points right, but draw the text again unflipped
        m.material.map = textTexture(text, bg, fg, false);
        const arrow = new T.Mesh(new T.CircleGeometry(0.16, 3), new T.MeshBasicMaterial({ color: fg }));
        arrow.position.set((w || 3) / 2 - 0.3, 0, 0.01);
        m.add(arrow);
      }
      m.position.set(x, y, z);
      m.rotation.y = rotY || 0;
      return add(m);
    }

    // --- Ground, roads, sidewalks ---
    const ground = new T.Mesh(new T.PlaneGeometry(400, 400), mat(MP.OUTSIDE.grass));
    ground.rotation.x = -Math.PI / 2;
    add(ground);
    flat(6, 52, MP.OUTSIDE.road, 0, -17);                 // main street
    flat(104, 6, MP.OUTSIDE.road, 0, -40, 0.012);         // cross street
    flat(1.2, 46, MP.OUTSIDE.sidewalk, -3.6, -14);
    flat(1.2, 46, MP.OUTSIDE.sidewalk, 3.6, -14);
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
    flat(1.6, 6, MP.OUTSIDE.sidewalk, 0, 12, 0.013);   // path from our door to the street
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

    const taxi = new T.Group();
    box(3.8, 0.9, 1.8, MP.OUTSIDE.taxi, 0, 0.35, 0, taxi);
    box(2.1, 0.75, 1.6, MP.OUTSIDE.taxi, -0.2, 1.25, 0, taxi);
    box(1.9, 0.6, 1.62, '#bfe6ff', -0.2, 1.3, 0, taxi);        // windows
    box(0.7, 0.3, 0.5, '#ffffff', -0.2, 2.0, 0, taxi);          // roof sign
    for (const [wx, wz] of [[-1.2, 0.9], [1.2, 0.9], [-1.2, -0.9], [1.2, -0.9]]) {
      const w = cyl(0.38, 0.3, '#2b2b33', wx, 0.38, wz, taxi);
      w.rotation.x = Math.PI / 2;
      w.position.y = 0.38;
    }
    taxi.position.set(-30, 0, -46.5);
    add(taxi);
    block(-30, -46.5, 4, 2);
    taxi.traverse((m) => { m.userData.spot = 'taxi'; });
    S.clickables.push(taxi);

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
      swing: { x: 30.5, z: -49.6 },
      slide: { x: 38.5, z: -48.2 },
      roundabout: { x: 29.5, z: -54.6 },
      sandbox: { x: 38.5, z: -55.2 },
    };

    // --- The character: a flat picture that always faces the camera ---
    S.charCanvas = document.createElement('canvas');
    S.charCanvas.width = 96;
    S.charCanvas.height = 150;
    S.charTex = new T.CanvasTexture(S.charCanvas);
    S.sprite = new T.Sprite(new T.SpriteMaterial({ map: S.charTex, transparent: true }));
    S.sprite.scale.set(PERSON_M * 32 / 42, PERSON_M * 50 / 42, 1);
    S.sprite.center.set(0.5, 2 / 50);
    add(S.sprite);
    const shadow = new T.Mesh(new T.CircleGeometry(0.42, 20),
      new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }));
    shadow.rotation.x = -Math.PI / 2;
    add(shadow);
    S.shadow = shadow;

    S.raycaster = new T.Raycaster();
    S.groundPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
    S.built = true;
  }

  // Keeps the 3D canvas exactly under the game canvas
  function placeCanvas() {
    const r = MP.canvas.getBoundingClientRect();
    const key = [r.left, r.top, r.width, r.height, window.devicePixelRatio].join(',');
    if (key === S.placed) return;
    S.placed = key;
    Object.assign(S.canvas.style, {
      left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
    });
    S.renderer.setPixelRatio(window.devicePixelRatio || 1);
    S.renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
    S.camera.aspect = r.width / Math.max(1, r.height);
    S.camera.updateProjectionMatrix();
  }

  function blocked(x, z) {
    return S.obstacles.some((o) => x > o.minX - 0.35 && x < o.maxX + 0.35 && z > o.minZ - 0.35 && z < o.maxZ + 0.35);
  }

  function angleDiff(a, b) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.street = {
    transparent: true,

    enter() {
      if (!S.built) build();
      S.canvas.style.display = 'block';
      MP.canvas.style.background = 'transparent';
      MP.canvas.style.position = 'relative';
      MP.canvas.style.zIndex = '1';
      S.placed = null;

      this.p = { x: START.x, z: START.z, heading: 0 };   // heading 0 = looking away from home
      this.camHeading = 0;
      this.target = null;
      this.onArrive = null;
      this.walking = false;
      this.walkTime = 0;
      this.play = null;          // riding the swing or the slide
      this.seen = {};            // places already visited
      this.panel = null;
      this.round = { speed: 0 };
      this.swingAt = -10;
      S.castle.visible = false;
      this.say('Ulkona! Kävellään risteykseen.', 4, 0.6);
    },

    exit() {
      S.canvas.style.display = 'none';
      MP.canvas.style.background = '';
    },

    say(text, seconds, delay) {
      this.bubble = { text, from: MP.time + (delay || 0), until: MP.time + (delay || 0) + (seconds || 3) };
    },

    walkTo(x, z, onArrive) {
      this.target = {
        x: MP.clamp(x, BOUNDS.minX, BOUNDS.maxX),
        z: MP.clamp(z, BOUNDS.minZ, BOUNDS.maxZ),
      };
      this.onArrive = onArrive || null;
    },

    // ---- Things to do ----
    use(spot) {
      if (spot === 'taxi') {
        this.panel = { from: MP.time };
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
      if (this.panel) {
        if (MP.time - this.panel.from > 0.5) this.panel = null;
        return;
      }
      if (this.play) return;

      // Turn around
      if (Math.hypot(x - TURN_BUTTON.x, y - TURN_BUTTON.y) < TURN_BUTTON.r + 3) {
        this.target = null;
        this.p.heading += Math.PI;
        MP.sfx.tap();
        return;
      }

      const T = S.T;
      const ndc = new T.Vector2(x / MP.W * 2 - 1, -(y / MP.H * 2 - 1));
      S.raycaster.setFromCamera(ndc, S.camera);

      // Tapped a thing? Walk to it and use it
      const hits = S.raycaster.intersectObjects(S.clickables, true);
      if (hits.length) {
        const spot = hits[0].object.userData.spot;
        const stand = S.spots[spot];
        if (stand) {
          MP.sfx.tap();
          this.walkTo(stand.x, stand.z, () => this.use(spot));
          return;
        }
      }
      // Otherwise walk to the spot on the ground
      const hit = new T.Vector3();
      if (S.raycaster.ray.intersectPlane(S.groundPlane, hit)) {
        // not too far in one go (taps near the horizon)
        const dx = hit.x - this.p.x, dz = hit.z - this.p.z;
        const d = Math.hypot(dx, dz);
        const k = d > 30 ? 30 / d : 1;
        this.walkTo(this.p.x + dx * k, this.p.z + dz * k);
      }
    },

    update(dt) {
      const p = this.p;

      // --- Walking ---
      this.walking = false;
      if (this.target && !this.play) {
        const dx = this.target.x - p.x, dz = this.target.z - p.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.08) {
          this.target = null;
          const cb = this.onArrive;
          this.onArrive = null;
          if (cb) cb();
        } else {
          const want = Math.atan2(dx, -dz);
          p.heading += angleDiff(p.heading, want) * Math.min(1, dt * 8);
          const step = Math.min(d, SPEED * dt);
          const nx = p.x + dx / d * step, nz = p.z + dz / d * step;
          if (!blocked(nx, nz)) { p.x = nx; p.z = nz; }
          else if (!blocked(nx, p.z)) { p.x = nx; }
          else if (!blocked(p.x, nz)) { p.z = nz; }
          else { this.target = null; this.onArrive = null; }
          this.walking = true;
          this.walkTime += dt;
        }
      }

      // --- Arriving at places (said once) ---
      for (const [id, pl] of Object.entries(PLACES)) {
        if (!this.seen[id] && Math.hypot(p.x - pl.x, p.z - pl.z) < pl.r) {
          this.seen[id] = true;
          if (id === 'cross') this.say('Risteys! Kumpaan mennään: taksiasemalle vai leikkipuistoon?', 4.5);
          if (id === 'taxi') this.say('Taksiasema! Napauta taksia.', 3.5);
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

      // --- Clouds drift ---
      for (const c of S.clouds) {
        c.position.x += dt * 0.6;
        if (c.position.x > 80) c.position.x = -80;
      }

      // --- Camera behind the character ---
      this.camHeading += angleDiff(this.camHeading, p.heading) * Math.min(1, dt * 2.5);
      const fx = Math.sin(this.camHeading), fz = -Math.cos(this.camHeading);
      S.camera.position.set(p.x - fx * 4.6, 2.3, p.z - fz * 4.6);
      S.camera.lookAt(p.x + fx * 3, 0.9, p.z + fz * 3);

      // --- Draw the character picture and place it ---
      this.drawCharacter();
      placeCanvas();
      S.renderer.render(S.scene, S.camera);
    },

    endPlay(stand) {
      this.play = null;
      this.p.x = stand.x;
      this.p.z = stand.z;
    },

    drawCharacter() {
      const c = S.charCanvas.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, 96, 150);
      c.setTransform(3, 0, 0, 3, 0, 0);
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
      MP.drawPerson(c, 16, 48, { back: true, sit, walking: this.walking, walkTime: this.walkTime });
      S.charTex.needsUpdate = true;
      S.sprite.position.set(x, y, z);
      S.shadow.position.set(x, 0.03, z);
      this.headPos = new S.T.Vector3(x, y + PERSON_M + 0.15, z);
    },

    draw(ctx) {
      const t = MP.time;
      // Speech bubble over the character's head
      const b = this.bubble;
      if (b && t >= b.from && t < b.until && this.headPos) {
        const v = this.headPos.clone().project(S.camera);
        const sx = (v.x + 1) / 2 * MP.W, sy = (1 - v.y) / 2 * MP.H;
        MP.drawBubble(ctx, b.text, sx, sy, { maxWidth: 150 });
      }

      // Turn-around button
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = MP.COLORS.outline;
      ctx.fillStyle = 'rgba(255,247,224,0.92)';
      ctx.beginPath(); ctx.arc(TURN_BUTTON.x, TURN_BUTTON.y, TURN_BUTTON.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(TURN_BUTTON.x, TURN_BUTTON.y + 1, 7, Math.PI * 1.15, Math.PI * 2.6); ctx.stroke();
      ctx.fillStyle = MP.COLORS.outline;
      ctx.beginPath();
      ctx.moveTo(TURN_BUTTON.x - 9.5, TURN_BUTTON.y - 5); ctx.lineTo(TURN_BUTTON.x - 3, TURN_BUTTON.y - 5.5);
      ctx.lineTo(TURN_BUTTON.x - 7.5, TURN_BUTTON.y + 0.5); ctx.closePath(); ctx.fill();
      ctx.restore();
      MP.drawText(ctx, 'Käänny', TURN_BUTTON.x, TURN_BUTTON.y + TURN_BUTTON.r + 1, {
        size: 0.6, color: '#ffffff', outline: MP.COLORS.outline, align: 'center',
      });

      // "Jatkuu pian…" at the taxi
      if (this.panel) {
        const a = MP.clamp((t - this.panel.from) * 4, 0, 1);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(20,20,40,0.45)';
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.lineWidth = 1;
        ctx.strokeStyle = MP.COLORS.outline;
        ctx.fillStyle = '#fff7e0';
        MP.roundRect(ctx, 60, 45, 200, 90, 10);
        ctx.fill();
        ctx.stroke();
        MP.drawText(ctx, 'Jatkuu pian…', MP.W / 2, 60, { size: 2.2, color: '#e0559a', outline: MP.COLORS.outline, align: 'center' });
        MP.drawText(ctx, 'Seuraavaksi: taksilla Egyptiin!', MP.W / 2, 92, { size: 1, color: MP.COLORS.outline, align: 'center' });
        MP.drawText(ctx, '(napauta)', MP.W / 2, 112, { size: 0.8, color: '#6e4226', align: 'center' });
        ctx.restore();
      }
    },
  };
})();
