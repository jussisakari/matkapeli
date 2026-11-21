// egypt.js – EGYPT! A 3D desert seen from behind the character.
// You arrive from the airport by taxi. Tap the ground to walk. Things to find:
//   the Great Pyramid's door (go inside → pyramid.js, a 2D scene like the house),
//   the Great Sphinx, the temple of Ramses II, an obelisk, the Nile river with
//   a sailing boat, and a camel you can ride.
// The taxi takes you back to the airport.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const W3 = MP.w3d;

  // Colors in Egypt (Ella can change these)
  MP.EGYPT = {
    sky: '#9fd0f0',
    haze: '#f1dfb8',
    sand: '#e2c28b',
    dunes: '#d9b47a',
    path: '#cdb184',
    limestone: '#d6b886',   // pyramids
    sphinx: '#c9a46e',
    sandstone: '#cf9a62',   // the temple
    gold: '#f2c14e',
    palmTrunk: '#8a6a45',
    palmLeaves: '#4d8a3a',
    water: '#3d8fb8',
    fields: '#86a94c',
    camel: '#c7955a',
    taxi: '#f4f4f4',
  };

  const SPEED = 3.4;
  const BOUNDS = { minX: -58, maxX: 37, minZ: -100, maxZ: 12 };
  const TAXI_AT = { x: 5.5, z: 6.5 };
  const BIG = { x: 0, z: -50, r: 22, h: 20 };              // the Great Pyramid
  const HALF = BIG.r / Math.SQRT2;                         // half the width of its base
  const DOOR_Z = BIG.z + HALF;                             // its front side
  const CAMEL = { x: -12, z: -10, r: 4.5 };                // the camel walks round this circle
  const TEMPLE = { x: -44, z: -30 };                       // Ramses II's temple, facing the path
  const SPHINX = { x: 20, z: -26 };
  const PLACES = {
    door: { x: 0, z: DOOR_Z + 3, r: 5 },
    sphinx: { x: SPHINX.x, z: SPHINX.z + 6, r: 6 },
    temple: { x: TEMPLE.x + 9, z: TEMPLE.z, r: 8 },
  };

  const S = { built: false };
  MP.egypt3d = S;                 // (for testing)

  // A picture made with code, used as a repeating pattern
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

  // Little color differences, so stone and sand don't look like plastic
  function speckle(g, size, n, colors, rMax) {
    for (let i = 0; i < n; i++) {
      g.fillStyle = colors[i % colors.length];
      g.globalAlpha = 0.15 + Math.random() * 0.25;
      g.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * rMax, 1 + Math.random() * rMax);
    }
    g.globalAlpha = 1;
  }

  // ---------------------------------------------------------------------------
  // Building Egypt
  // ---------------------------------------------------------------------------
  function build() {
    W3.init();
    const T = window.THREE;
    const E = MP.EGYPT;
    S.scene = new T.Scene();
    S.scene.background = new T.Color(E.sky);
    S.scene.fog = new T.Fog(E.haze, 50, 170);
    S.camera = new T.PerspectiveCamera(55, 16 / 9, 0.1, 320);
    S.scene.add(new T.HemisphereLight(0xfff6e6, 0xc9a66a, 0.8));
    const sun = new T.DirectionalLight(0xfff0d0, 0.7);
    sun.position.set(-30, 50, 25);
    S.scene.add(sun);

    const W = W3.kit(S.scene);
    S.W = W;
    const { box, cyl, ball, flat, block } = W;
    const textured = (color, tex) => new T.MeshLambertMaterial({ color, map: tex });

    // --- Textures ---
    const sandTex = texture(256, 70, 70, (g, n) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, n, n);
      speckle(g, n, 900, ['#c9a46e', '#fff3d6', '#b8925c'], 3);
      // ripples made by the wind
      g.strokeStyle = 'rgba(150,110,60,0.18)';
      g.lineWidth = 2;
      for (let y = 8; y < n; y += 22) {
        g.beginPath();
        for (let x = 0; x <= n; x += 16) g.lineTo(x, y + Math.sin(x / 20 + y) * 4);
        g.stroke();
      }
    });
    // pyramid stones: rows of blocks
    const stoneTex = texture(256, 10, 4, (g, n) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, n, n);
      speckle(g, n, 700, ['#b8925c', '#fff6e0', '#a07a48'], 4);
      g.strokeStyle = 'rgba(110,80,40,0.45)';
      g.lineWidth = 2;
      for (let r = 0; r < 8; r++) {
        const y = r * n / 8;
        g.beginPath(); g.moveTo(0, y); g.lineTo(n, y); g.stroke();
        for (let x = (r % 2) * 16; x < n; x += 32) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + n / 8); g.stroke(); }
      }
    });
    const rockTex = texture(128, 3, 3, (g, n) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, n, n);
      speckle(g, n, 400, ['#a07a48', '#fff1d8', '#8c6a3e'], 5);
    });
    const stone = (color) => textured(color, rockTex);

    // --- Sand, path, dunes, sun ---
    const ground = new T.Mesh(new T.PlaneGeometry(600, 600), textured(E.sand, sandTex));
    ground.rotation.x = -Math.PI / 2;
    W.add(ground);
    flat(4, 46, E.path, 0, DOOR_Z + 23, 0.012);               // path to the Great Pyramid
    flat(36, 3, E.path, -18, -30, 0.013);                    // path to the temple
    for (let z = 8; z > DOOR_Z + 2; z -= 2.6) {                // stones along the path
      ball(0.16, '#b8925c', -2.3, 0.04, z);
      ball(0.14, '#b8925c', 2.3, 0.04, z - 1.3);
    }
    [[-150, -90, 45], [150, -60, 50], [0, -230, 70], [-110, -200, 50], [120, -200, 55], [-150, 40, 40]]
      .forEach(([x, z, r]) => {
        const d = new T.Mesh(new T.SphereGeometry(r, 24, 12), textured(E.dunes, sandTex));
        d.position.set(x, -r * 0.72, z);
        d.scale.set(1.8, 1, 1);
        W.add(d);
      });
    const sunBall = new T.Mesh(new T.SphereGeometry(7, 20, 14), new T.MeshBasicMaterial({ color: '#fff6c8', fog: false }));
    sunBall.position.set(-80, 70, -190);
    W.add(sunBall);
    // little stones in the sand
    for (let i = 0; i < 50; i++) {
      const x = -55 + Math.random() * 88, z = 10 - Math.random() * 100;
      if (Math.abs(x) < 4 && z > DOOR_Z) continue;
      const st = ball(0.08 + Math.random() * 0.16, '#b8925c', x, 0.02, z);
      st.scale.y = 0.5;
    }

    // --- The pyramids of Giza (a cone with four sides is a pyramid!) ---
    function pyramid(x, z, r, h, spot, cap) {
      const g = new T.Group();
      const m = new T.Mesh(new T.ConeGeometry(r, h, 4, 1), textured(E.limestone, stoneTex));
      m.rotation.y = Math.PI / 4;
      m.position.y = h / 2;
      g.add(m);
      if (cap) {
        // the smooth white stones still left at the top (like on Khafre's pyramid)
        const c = new T.Mesh(new T.ConeGeometry(r * 0.22, h * 0.22, 4), W.mat('#efe2c4'));
        c.rotation.y = Math.PI / 4;
        c.position.y = h - h * 0.11 + 0.03;
        g.add(c);
      }
      g.position.set(x, 0, z);
      W.add(g);
      const half = r / Math.SQRT2;
      block(x, z, half * 2, half * 2);
      if (spot) W.clickable(g, spot);
      return g;
    }
    pyramid(BIG.x, BIG.z, BIG.r, BIG.h, 'bigPyramid');          // Khufu
    pyramid(-38, -84, 20, 18.5, 'smallPyramid', true);           // Khafre
    pyramid(26, -94, 10, 8.5, 'smallPyramid');                   // Menkaure
    [16, 24, 32].forEach((x) => pyramid(x, -108, 3.2, 2.8, 'smallPyramid'));   // the queens' small pyramids

    // The entrance of the Great Pyramid: an opening with big leaning stones above it
    const door = new T.Group();
    box(4.4, 4.4, 2.6, E.limestone, 0, 0, 0, door).material = stone(E.limestone);
    box(2.2, 3.1, 0.2, '#22170e', 0, 0, 1.25, door);
    for (const k of [-1, 1]) {
      const slab = box(2.9, 0.75, 2.8, E.limestone, k * 0.95, 0, 0, door);
      slab.material = stone('#cdb07c');
      slab.position.y = 5;
      slab.rotation.z = -k * 0.55;
    }
    door.position.set(0, 0, DOOR_Z - 0.7);
    W.add(door);
    block(0, DOOR_Z - 0.7, 4.4, 2.6);
    W.clickable(door, 'door');

    // --- The Great Sphinx: a lion's body and a pharaoh's head, all stone ---
    const sph = new T.Group();
    const sm = stone(E.sphinx);
    const sbox = (w, h, d, x, y, z) => { const b = box(w, h, d, E.sphinx, x, y, z, sph); b.material = sm; return b; };
    sbox(3.8, 2.6, 8, 0, 0, -1);                  // body
    sbox(4, 3.1, 3, 0, 0, -4.2);                  // the back (haunches)
    sbox(3.6, 3.2, 2.6, 0, 0, 2.6);               // chest
    sbox(1.1, 0.8, 5, -1.15, 0, 5.2);             // front paws
    sbox(1.1, 0.8, 5, 1.15, 0, 5.2);
    sbox(4.6, 1, 2.6, 0, 0, -5.8);                // tail side
    // head with the striped headcloth (nemes)
    sbox(3.4, 3, 2.4, 0, 3.0, 2.4);               // headcloth
    sbox(0.7, 2.6, 1.4, -1.7, 1.8, 3.2);          // the cloth hanging down by the face
    sbox(0.7, 2.6, 1.4, 1.7, 1.8, 3.2);
    sbox(2.2, 2.5, 1.2, 0, 3.0, 3.7);             // face
    for (let y = 3.3; y < 6; y += 0.5) box(3.45, 0.12, 2.45, '#b08a55', 0, y, 2.4, sph);
    box(0.45, 0.16, 0.1, '#6e5532', -0.55, 4.6, 4.31, sph);    // eyes
    box(0.45, 0.16, 0.1, '#6e5532', 0.55, 4.6, 4.31, sph);
    box(0.36, 0.5, 0.18, '#b08a55', 0, 3.9, 4.3, sph);         // the nose (it broke long ago)
    box(0.8, 0.1, 0.1, '#6e5532', 0, 3.55, 4.31, sph);         // mouth
    sph.position.set(SPHINX.x, 0, SPHINX.z);
    W.add(sph);
    block(SPHINX.x, SPHINX.z - 0.6, 4.8, 15);
    W.clickable(sph, 'sphinx');

    // --- The temple of Ramses II (like Abu Simbel): four giant statues of the
    // pharaoh sitting in front of a mountain wall. The front faces +z here,
    // then the whole thing is turned to face the path. ---
    const tem = new T.Group();
    const tm = stone(E.sandstone);
    const tbox = (w, h, d, x, y, z, color) => {
      const b = box(w, h, d, color || E.sandstone, x, y, z, tem);
      b.material = color ? stone(color) : tm;
      return b;
    };
    tbox(28, 15, 9, 0, 0, -4.5);                  // the cliff wall
    tbox(30, 3, 10, 0, 0, -5.5);                  // its wide foot
    tbox(24, 1.2, 0.6, 0, 13.4, 0.3, '#c18a52');  // the top edge
    for (let x = -11; x <= 11; x += 1.6) {        // a row of baboon statues on top
      tbox(0.8, 1.1, 0.6, x, 14.6, 0.2, '#c18a52');
      ball(0.32, E.sandstone, x, 15.9, 0.2, tem).material = tm;
    }
    tbox(3, 5.4, 0.4, 0, 0, 0.1, '#1e140c');      // the dark doorway
    tbox(4, 0.6, 0.8, 0, 5.4, 0.3, '#c18a52');
    // the falcon-headed sun god in a niche above the door
    tbox(2.2, 3.4, 0.5, 0, 7.2, 0.05, '#a8743f');
    tbox(0.9, 1.9, 0.6, 0, 7.4, 0.4, '#d8a670');
    ball(0.42, '#d8a670', 0, 9.75, 0.45, tem).material = stone('#d8a670');
    cyl(0.55, 0.12, E.gold, 0, 10.3, 0.45, tem).rotation.x = Math.PI / 2;    // sun disc
    // a seated colossus of Ramses; one of them lost its head in an earthquake!
    function colossus(x, headless) {
      tbox(4.4, 0.8, 5, x, 0, 2.6);               // pedestal
      tbox(4, 5.4, 2.2, x, 0.8, 1.2);             // throne
      tbox(1, 4.2, 1.1, x - 0.8, 0.8, 4.4);       // lower legs
      tbox(1, 4.2, 1.1, x + 0.8, 0.8, 4.4);
      tbox(3, 1.1, 3, x, 5, 3.4);                 // thighs (lap)
      tbox(2.8, 3.8, 1.8, x, 6.1, 1.6);           // body
      tbox(0.7, 0.7, 2.6, x - 1.75, 6.1, 3.1);    // arms resting on the knees
      tbox(0.7, 0.7, 2.6, x + 1.75, 6.1, 3.1);
      tbox(2.6, 2.3, 1.5, x, 9.9, 1.4);           // the headcloth
      const head = new T.Group();
      const face = box(1.7, 2, 1.6, E.sandstone, 0, 0, 0.25, head); face.material = tm;
      const beard = box(0.5, 0.9, 0.5, E.sandstone, 0, -0.85, 0.85, head); beard.material = tm;
      const crown = cyl(0.75, 2.2, '#d8a670', 0, 2, 0, head, 0.35); crown.material = stone('#d8a670');   // the double crown
      box(0.35, 0.12, 0.1, '#6e4a2a', -0.4, 1.15, 1.06, head);
      box(0.35, 0.12, 0.1, '#6e4a2a', 0.4, 1.15, 1.06, head);
      if (headless) {
        // the fallen head lies on the ground in front
        head.position.set(x + 1, 0.8, 7.2);
        head.rotation.set(1.3, 0.4, 0.2);
      } else {
        head.position.set(x, 10, 1.6);
      }
      tem.add(head);
    }
    colossus(-10.5, false);
    colossus(-5.2, true);
    colossus(5.2, false);
    colossus(10.5, false);
    tem.position.set(TEMPLE.x, 0, TEMPLE.z);
    tem.rotation.y = Math.PI / 2;                 // now the front faces the path (+x)
    W.add(tem);
    block(TEMPLE.x - 1.6, TEMPLE.z, 13, 30);
    block(TEMPLE.x + 7.2, TEMPLE.z + 4.2, 2, 2);   // the fallen head
    W.clickable(tem, 'temple');
    cyl(0.1, 2.6, '#8a6a45', TEMPLE.x + 10, 0, TEMPLE.z + 5);
    W.sign('Ramses II', TEMPLE.x + 10, 2.4, TEMPLE.z + 5, Math.PI / 2, '#fff7e0', '#2b2340', null, 2.4);
    block(TEMPLE.x + 10, TEMPLE.z + 5, 0.4, 0.4);

    // --- An obelisk: a tall stone needle with a golden tip ---
    const ob = new T.Group();
    const shaft = new T.Mesh(new T.CylinderGeometry(0.45, 0.75, 9, 4), stone('#d9a873'));
    shaft.rotation.y = Math.PI / 4;
    shaft.position.y = 5;
    ob.add(shaft);
    const tip = new T.Mesh(new T.ConeGeometry(0.64, 1.1, 4), W.mat(E.gold));
    tip.rotation.y = Math.PI / 4;
    tip.position.y = 10.05;
    ob.add(tip);
    box(2, 0.5, 2, '#c18a52', 0, 0, 0, ob).material = stone('#c18a52');
    ob.position.set(8, 0, -14);
    W.add(ob);
    block(8, -14, 2, 2);

    // --- The Nile: a wide river with green fields and palms on its banks ---
    flat(10, 260, E.fields, 37.5, -40, 0.014);
    flat(14, 260, E.water, 49, -40, 0.02);
    flat(30, 260, E.fields, 71, -40, 0.014);
    block(52, -40, 26, 260);
    S.waves = [];
    for (let i = 0; i < 30; i++) {
      const w = flat(1.4, 0.12, '#bfe6ff', 44 + Math.random() * 10, 20 - Math.random() * 150, 0.03);
      S.waves.push(w);
    }
    // papyrus reeds by the water
    for (let z = 15; z > -130; z -= 3 + Math.random() * 3) {
      for (let k = 0; k < 4; k++) {
        const reed = cyl(0.03, 1.2 + Math.random() * 0.6, '#5f8f3a', 41.3 + Math.random() * 0.8, 0, z + Math.random());
        reed.rotation.z = (Math.random() - 0.5) * 0.3;
        ball(0.14, '#7fae4a', reed.position.x, reed.position.y * 2, reed.position.z);
      }
    }
    // a felucca: a sailing boat with a big slanted sail
    const boat = new T.Group();
    const hull = box(1.4, 0.6, 5, '#7a4a25', 0, 0, 0, boat);
    hull.scale.set(1, 1, 1);
    box(1.2, 0.1, 4.4, '#a0643c', 0, 0.55, 0, boat);
    cyl(0.06, 4.2, '#5a3a1e', 0, 0.6, 0.6, boat);
    const sailShape = new T.Shape();
    sailShape.moveTo(0, 0); sailShape.lineTo(0, 5.2); sailShape.lineTo(-3.4, 0.4); sailShape.lineTo(0, 0);
    const sail = new T.Mesh(new T.ShapeGeometry(sailShape), new T.MeshLambertMaterial({ color: '#fbf6ea', side: T.DoubleSide }));
    sail.position.set(0, 0.9, 1);
    sail.rotation.y = -Math.PI / 2;
    boat.add(sail);
    boat.position.set(48, 0.05, -30);
    W.add(boat);
    S.boat = boat;

    // --- Palm trees (date palms) ---
    function palm(x, z, lean, h) {
      h = h || 1;
      const g = new T.Group();
      for (let i = 0; i < 7; i++) {
        const seg = cyl(0.2 - i * 0.012, 0.78 * h, E.palmTrunk, lean * i * 0.1, i * 0.75 * h, 0, g);
        seg.material = stone(E.palmTrunk);
      }
      const top = new T.Group();
      top.position.set(lean * 0.7, 5.25 * h, 0);
      for (let i = 0; i < 9; i++) {
        const leaf = new T.Mesh(new T.BoxGeometry(2.8, 0.05, 0.45), W.mat(i % 2 ? E.palmLeaves : '#5f9a45'));
        leaf.position.set(1.3, -0.35, 0);
        leaf.rotation.z = -0.25;
        const holder = new T.Group();
        holder.rotation.y = i * Math.PI * 2 / 9 + Math.random() * 0.3;
        holder.rotation.z = -0.25 - Math.random() * 0.2;
        holder.add(leaf);
        top.add(holder);
      }
      for (let k = 0; k < 4; k++) ball(0.13, '#a8622a', Math.cos(k * 1.6) * 0.25, -0.35, Math.sin(k * 1.6) * 0.25, top);  // dates
      g.add(top);
      g.position.set(x, 0, z);
      W.add(g);
      block(x, z, 0.7, 0.7);
    }
    [[-8, 4, 0.8], [9, 2, -0.8], [-20, -2, 0.3], [-24, -20, -0.5], [12, -36, 0.4]].forEach(([x, z, l]) => palm(x, z, l));
    for (let z = 18; z > -125; z -= 7 + Math.random() * 5) {
      palm(36 + Math.random() * 3, z, (Math.random() - 0.5) * 1.6, 0.9 + Math.random() * 0.4);
      palm(60 + Math.random() * 6, z - 3, (Math.random() - 0.5) * 1.6, 0.9 + Math.random() * 0.4);
    }

    // --- The camel: a dromedary, it has one hump ---
    const camel = new T.Group();
    const cm = stone(E.camel);
    const part = (mesh) => { mesh.material = cm; return mesh; };
    const body = part(ball(1, E.camel, 0, 2.15, 0, camel)); body.scale.set(1.45, 0.62, 0.62);
    const hump = part(ball(0.62, E.camel, 0.1, 2.62, 0, camel)); hump.scale.set(1.1, 0.85, 0.85);
    for (const [lx, lz] of [[-0.85, 0.32], [-0.85, -0.32], [0.85, 0.32], [0.85, -0.32]]) {
      part(cyl(0.12, 0.95, E.camel, lx, 0, lz, camel, 0.09));             // lower leg
      part(cyl(0.17, 1.0, E.camel, lx, 0.95, lz, camel, 0.13));           // upper leg
      box(0.26, 0.08, 0.3, '#8a6a45', lx, 0, lz, camel);                    // foot
    }
    const neck1 = part(cyl(0.24, 1.3, E.camel, 0, 0, 0, camel, 0.2));
    neck1.position.set(-1.75, 2.15, 0); neck1.rotation.z = 1.05;
    const neck2 = part(cyl(0.2, 1.1, E.camel, 0, 0, 0, camel, 0.17));
    neck2.position.set(-2.3, 2.6, 0); neck2.rotation.z = -0.25;
    S.camelHead = new T.Group();
    S.camelHead.position.set(-2.4, 3.2, 0);
    const head = part(ball(0.3, E.camel, -0.2, 0, 0, S.camelHead)); head.scale.set(1.8, 0.85, 0.8);
    ball(0.06, '#2b2340', -0.25, 0.12, 0.22, S.camelHead);                  // eyes
    ball(0.06, '#2b2340', -0.25, 0.12, -0.22, S.camelHead);
    part(ball(0.09, E.camel, 0.1, 0.25, 0.16, S.camelHead));                // ears
    part(ball(0.09, E.camel, 0.1, 0.25, -0.16, S.camelHead));
    camel.add(S.camelHead);
    const tail = cyl(0.05, 0.9, '#8a6a45', 0, 0, 0, camel); tail.position.set(1.45, 1.8, 0); tail.rotation.z = -0.3;
    // a colorful saddle blanket on the hump
    box(0.9, 0.12, 1.15, '#b8322c', 0.1, 2.98, 0, camel);
    box(0.95, 0.06, 1.2, '#f2c14e', 0.1, 2.93, 0, camel);
    box(0.25, 0.25, 0.25, '#2a4fa0', -0.4, 3.1, 0, camel);
    camel.position.set(CAMEL.x + CAMEL.r, 0, CAMEL.z);
    camel.rotation.y = Math.PI / 2;
    W.add(camel);
    W.clickable(camel, 'camel');
    S.camel = camel;

    // --- The taxi from the airport (in Cairo taxis are white) ---
    S.taxi = W.taxi(E.taxi);
    S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
    block(TAXI_AT.x, TAXI_AT.z, 4, 2);
    W.clickable(S.taxi, 'taxi');

    // A sign by the path
    cyl(0.1, 2.6, '#8a6a45', -3, 0, 1);
    W.sign('Gizan pyramidit', -3, 2.4, 1, 0, '#fff7e0', '#2b2340', null, 3);
    block(-3, 1, 0.4, 0.4);

    S.hotel = W.hotel(-15, 4, Math.PI / 2, { wall: '#e8d3a8', trim: '#c8913a', awning: '#2f5fb5', sign: 'HOTELLI' });
    S.ch = W3.character(S.scene);
    S.built = true;
  }

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.egypt = {
    transparent: true,

    // params.from === 'pyramid': coming out of the pyramid door
    enter(params) {
      if (!S.built) build();
      W3.show();
      const out = params && params.from === 'pyramid';
      this.p = out ? { x: 0, z: DOOR_Z + 2.4, heading: Math.PI } : { x: 2.2, z: 4.2, heading: 0 };
      this.camHeading = this.p.heading;
      this.camDist = this.camHeight = null;
      this.target = null;
      this.onArrive = null;
      this.walking = false;
      this.walkTime = 0;
      this.seen = out ? { door: true } : {};
      this.ride = null;             // riding the camel
      this.leaving = null;          // taxi to the airport
      this.camelAngle = 0;
      this.nodAt = -10;
      this.bubble = null;
      S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
      this.placeCamel();
      if (out) {
        this.arrive = null;
        S.ch.setVisible(true);
        this.say('Ulkona taas! Onpa aurinkoista.', 3, 0.5);
      } else {
        // The taxi from the airport drives in, then we hop out
        this.arrive = { t: 0 };
        S.ch.setVisible(false);
      }
      // waking up in the hotel: out of the door, back to the trip
      if (params && params.from === 'hotel') {
        const d = S.hotel.door;
        this.p = { x: d.x, z: d.z, heading: d.heading + Math.PI };
        this.camHeading = this.p.heading;
        this.arrive = null;
        S.ch.setVisible(true);
        this.say('Hyvää huomenta, Egypti! Pyramidit odottavat.', 3, 0.5);
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

    placeCamel() {
      const a = this.camelAngle;
      S.camel.position.set(CAMEL.x + Math.cos(a) * CAMEL.r, 0, CAMEL.z + Math.sin(a) * CAMEL.r);
      // walks round the circle with its head first
      S.camel.rotation.y = Math.PI / 2 - a;
    },

    // Where to stand to use each thing
    stand(spot) {
      if (spot === 'hotel') return S.hotel.door;
      if (spot === 'door') return { x: 0, z: DOOR_Z + 1.6 };
      if (spot === 'taxi') return { x: TAXI_AT.x - 1, z: TAXI_AT.z - 1.9 };
      if (spot === 'sphinx') return { x: SPHINX.x + 3.4, z: SPHINX.z + 7 };
      if (spot === 'temple') return { x: TEMPLE.x + 8.5, z: TEMPLE.z };
      if (spot === 'camel') {
        const c = S.camel.position;
        const dx = this.p.x - c.x, dz = this.p.z - c.z, d = Math.hypot(dx, dz) || 1;
        return { x: c.x + dx / d * 2.2, z: c.z + dz / d * 2.2 };
      }
      return null;
    },

    use(spot) {
      if (spot === 'hotel') {
        // the hotel: sleep one night here
        this.say('Hotelli! Mennään sisään.', 1.5);
        MP.sfx.bling();
        MP.goTo(MP.scenes.hotel, { country: 'egypt' });
        return;
      }
      if (spot === 'door') {
        this.say('Mennään sisään!', 1.2);
        MP.sfx.bling();
        this.walkTo(0, DOOR_Z + 0.4);
        MP.goTo(MP.scenes.pyramid);
      } else if (spot === 'taxi') {
        this.leaving = { t: 0 };
        S.ch.setVisible(false);
        this.say('Taksi, lentokentälle kiitos!', 2.2);
        MP.sfx.bling();
      } else if (spot === 'sphinx') {
        this.say('Suuri sfinksi! Sillä on leijonan vartalo ja faaraon pää. Sen nenä on lohjennut joskus kauan sitten.', 5);
        MP.sfx.tune();
      } else if (spot === 'temple') {
        this.say('Ramses II:n temppeli! Ramses II oli Egyptin mahtavimpia faaraoita. Kaikki neljä jättipatsasta ovat hän itse. Yhdeltä putosi pää maanjäristyksessä!', 6);
        MP.sfx.tune();
      } else if (spot === 'camel') {
        this.ride = { t: 0 };
        this.nodAt = MP.time;
        this.say('Mrrööh! Kameliratsastus!', 2.5);
        MP.sfx.boing();
      }
    },

    onTap(x, y) {
      if (this.arrive || this.leaving || this.ride || MP.isFading()) return;
      if (W3.hitTurn(x, y)) {
        this.target = null;
        this.p.heading += Math.PI;
        MP.sfx.tap();
        return;
      }
      W3.tap(this, x, y, S.camera, S.W, BOUNDS, (spot) => {
        if (spot === 'smallPyramid') {
          this.say('Tähän pyramidiin ei pääse sisään. Ison pyramidin ovi on auki!', 3.5);
          MP.sfx.boing();
          return true;
        }
        if (spot === 'bigPyramid') spot = 'door';
        const st = this.stand(spot);
        if (!st) return false;
        MP.sfx.tap();
        this.walkTo(st.x, st.z, () => this.use(spot));
        return true;
      });
    },

    update(dt) {
      const p = this.p;

      // --- Taxi arriving ---
      if (this.arrive) {
        this.arrive.t += dt;
        const u = MP.clamp(this.arrive.t / 2, 0, 1);
        const ease = 1 - (1 - u) * (1 - u);
        S.taxi.position.x = TAXI_AT.x + 40 * (1 - ease);
        if (this.arrive.t > 2.3) {
          this.arrive = null;
          S.ch.setVisible(true);
          MP.sfx.bling();
          const poster = MP.collectPoster('egypt') ? ' Sain julisteen omaan huoneeseeni!' : '';
          this.say('Egypti! Tuolla ovat Gizan pyramidit. Mennään suurimpaan pyramidiin!' + poster, 4.5);
        }
      }

      // --- Taxi leaving for the airport ---
      if (this.leaving) {
        this.leaving.t += dt;
        const t = Math.max(0, this.leaving.t - 0.8);
        S.taxi.position.x = TAXI_AT.x - t * t * 6;
        if (this.leaving.t > 2.6 && !this.leaving.gone) {
          this.leaving.gone = true;
          MP.goTo(MP.scenes.airport, { country: 'egypt' });
        }
      }

      if (!this.arrive && !this.leaving && !this.ride) W3.walkStep(this, dt, SPEED, S.W.obstacles);
      else this.walking = false;

      // --- Camel ride: one round of the circle ---
      if (this.ride) {
        this.ride.t += dt;
        this.camelAngle += dt * 0.9;
        if (this.ride.t > 7) {
          this.ride = null;
          const c = S.camel.position;
          p.x = c.x + Math.cos(this.camelAngle) * 2.2;
          p.z = c.z + Math.sin(this.camelAngle) * 2.2;
          this.say('Kiitos, kameli!', 2);
        } else {
          const c = S.camel.position;
          p.x = c.x; p.z = c.z;
          // the camera looks where the camel walks
          p.heading = Math.atan2(-Math.sin(this.camelAngle), -Math.cos(this.camelAngle));
        }
      } else {
        this.camelAngle += dt * 0.06;     // the camel strolls slowly
      }
      this.placeCamel();
      const nod = MP.time - this.nodAt;
      S.camelHead.rotation.z = nod < 1.2 ? Math.sin(nod * 10) * 0.3 : Math.sin(MP.time * 1.5) * 0.08;

      // --- The boat sails slowly up the Nile, the water glitters ---
      S.boat.position.z -= dt * 0.8;
      if (S.boat.position.z < -130) S.boat.position.z = 25;
      S.waves.forEach((w, i) => {
        w.position.z += dt * 0.5;
        if (w.position.z > 22) w.position.z = -130;
        w.material.opacity = 1;
        w.scale.x = 0.8 + Math.sin(MP.time * 2 + i) * 0.3;
      });

      // --- Arriving at places (said once) ---
      if (!this.arrive) {
        for (const [id, pl] of Object.entries(PLACES)) {
          if (!this.seen[id] && Math.hypot(p.x - pl.x, p.z - pl.z) < pl.r) {
            this.seen[id] = true;
            if (id === 'door') this.say('Suuren pyramidin ovi! Napauta ovea, niin mennään sisään.', 3.5);
            if (id === 'sphinx') this.say('Suuri sfinksi! Napauta sitä.', 3);
            if (id === 'temple') this.say('Ramses II:n temppeli! Napauta sitä.', 3);
          }
        }
        if (!this.seen.nile && p.x > 33) {
          this.seen.nile = true;
          this.say('Niili-joki! Se on yksi maailman pisimmistä joista.', 4);
        }
      }

      W3.follow(S.camera, this, dt, this.ride ? 7 : 4.6, this.ride ? 5.2 : 2.3);
      if (this.ride) {
        const c = S.camel.position;
        this.headPos = S.ch.draw(c.x, 3.0, c.z, { sit: true });
      } else {
        this.headPos = S.ch.draw(p.x, 0, p.z, { walking: this.walking, walkTime: this.walkTime });
      }
      if (this.leaving || this.arrive) this.headPos = S.taxi.position.clone().setY(2.6);
      W3.render(S.scene, S.camera);
    },

    draw(ctx) {
      W3.drawBubble(ctx, this.bubble, this.headPos, S.camera);
      if (!this.arrive && !this.leaving) W3.drawTurnButton(ctx);
    },
  };
})();
