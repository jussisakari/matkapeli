// winter.js – TALVIMAA (Winter Land)! A snowy 3D land seen from behind the character.
// You arrive from the airport. Snow falls. Things to do:
//   build a snowman (tap it again and again), penguins that slide on their
//   bellies, an igloo, sledding down a hill, and the icy sea with icebergs.
// The taxi takes you back to the airport.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const W3 = MP.w3d;

  // Colors in Talvimaa (Ella can change these)
  MP.WINTER = {
    sky: '#bfe0f7',
    snow: '#f4f8ff',
    shadowSnow: '#dce8f6',
    sea: '#2f6f9f',
    ice: '#e3f4ff',
    iceDeep: '#a9d6f0',
    spruce: '#2e6b4a',
    trunk: '#6e4a2e',
    taxi: '#e04848',
  };

  const SPEED = 3.4;
  const BOUNDS = { minX: -45, maxX: 45, minZ: -54, maxZ: 10 };
  const TAXI_AT = { x: 5.5, z: 6.5 };
  const SNOWMAN = { x: -7, z: -14 };
  const IGLOO = { x: -24, z: -28 };
  const HILL = { x: 24, z: -27, r: 7, h: 3.6 };
  const SLED_AT = { x: 24, z: -17.5 };
  const PLACES = {
    snowman: { x: SNOWMAN.x, z: SNOWMAN.z + 3, r: 4.5 },
    igloo: { x: IGLOO.x, z: IGLOO.z + 6, r: 6 },
    hill: { x: SLED_AT.x, z: SLED_AT.z, r: 5 },
    shore: { x: 8, z: -48, r: 9 },
  };
  const SNOWMAN_STEPS = 4;

  const S = { built: false };
  MP.winter3d = S;                // (for testing)

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
  // Building Talvimaa
  // ---------------------------------------------------------------------------
  function build() {
    W3.init();
    const T = window.THREE;
    const C = MP.WINTER;
    S.scene = new T.Scene();
    S.scene.background = new T.Color(C.sky);
    S.scene.fog = new T.Fog('#e6f2fb', 40, 140);
    S.camera = new T.PerspectiveCamera(55, 16 / 9, 0.1, 300);
    S.scene.add(new T.HemisphereLight(0xffffff, 0xb8cce0, 0.85));
    const sun = new T.DirectionalLight(0xfff6e8, 0.55);
    sun.position.set(30, 40, 20);
    S.scene.add(sun);

    const W = W3.kit(S.scene);
    S.W = W;
    const { box, cyl, ball, flat, block } = W;

    // Snow with little sparkles and soft bumps
    const snowTex = texture(256, 60, 60, (g, n) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, n, n);
      for (let i = 0; i < 500; i++) {
        g.fillStyle = i % 5 ? 'rgba(180,205,235,0.25)' : 'rgba(255,255,255,1)';
        g.fillRect(Math.random() * n, Math.random() * n, 1 + Math.random() * 3, 1 + Math.random() * 2);
      }
    });
    const snowMat = new T.MeshLambertMaterial({ color: C.snow, map: snowTex });
    const ground = new T.Mesh(new T.PlaneGeometry(600, 600), snowMat);
    ground.rotation.x = -Math.PI / 2;
    W.add(ground);
    flat(3, 40, C.shadowSnow, 0, -12, 0.012);                // a trodden path
    // snow banks far away
    [[-120, -60, 40], [120, -40, 45], [-140, 40, 40], [140, 50, 40], [0, 90, 50]].forEach(([x, z, r]) => {
      const d = new T.Mesh(new T.SphereGeometry(r, 24, 12), snowMat);
      d.position.set(x, -r * 0.7, z);
      d.scale.set(1.6, 1, 1);
      W.add(d);
    });
    // a low winter sun
    const sunBall = new T.Mesh(new T.SphereGeometry(6, 20, 14), new T.MeshBasicMaterial({ color: '#fff3c4', fog: false }));
    sunBall.position.set(90, 30, -180);
    W.add(sunBall);

    // --- The icy sea with icebergs ---
    const sea = new T.Mesh(new T.PlaneGeometry(400, 200), W.mat(C.sea));
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(0, 0.02, -158);
    W.add(sea);
    flat(400, 3, C.ice, 0, -57.5, 0.03);                      // ice along the shore
    S.bergs = [];
    function iceberg(x, z, s) {
      const g = new T.Group();
      const parts = [[0, 0, 0, 3, 5], [2.2, 0, 1, 2.2, 3.2], [-2, 0, -0.5, 2.4, 3.8], [0.6, 0, -1.6, 1.8, 6.5]];
      for (const [px, py, pz, r, h] of parts) {
        const m = new T.Mesh(new T.ConeGeometry(r, h, 6), W.mat(Math.random() < 0.5 ? C.ice : '#f4fbff'));
        m.position.set(px, py + h / 2 - 0.6, pz);
        m.rotation.y = Math.random() * 3;
        g.add(m);
      }
      const base = new T.Mesh(new T.CylinderGeometry(4.2, 4.6, 1, 8), W.mat(C.iceDeep));
      base.position.y = -0.2;
      g.add(base);
      g.scale.setScalar(s);
      g.position.set(x, 0, z);
      W.add(g);
      S.bergs.push({ g, phase: Math.random() * 6 });
    }
    iceberg(-20, -78, 1.2);
    iceberg(12, -92, 1.8);
    iceberg(42, -75, 1);
    iceberg(-48, -105, 2.2);
    iceberg(55, -120, 2.4);
    iceberg(-5, -130, 2.8);
    // a small ice floe with a seal
    const floe = new T.Mesh(new T.CylinderGeometry(3, 3.3, 0.5, 9), W.mat(C.ice));
    floe.position.set(-6, 0.1, -66);
    W.add(floe);
    const seal = new T.Group();
    const sb = ball(0.7, '#8d97a6', 0, 0.5, 0, seal); sb.scale.set(1.8, 0.6, 0.7);
    ball(0.38, '#8d97a6', 1.25, 0.75, 0, seal);
    ball(0.06, '#1b1b2a', 1.55, 0.85, 0.16, seal);
    ball(0.06, '#1b1b2a', 1.55, 0.85, -0.16, seal);
    seal.position.set(-6, 0.35, -66);
    seal.rotation.y = 0.6;
    W.add(seal);
    S.seal = seal;

    // --- Snowy spruce trees ---
    function spruce(x, z, s) {
      const g = new T.Group();
      cyl(0.18, 0.9, C.trunk, 0, 0, 0, g);
      for (let i = 0; i < 3; i++) {
        const r = (1.5 - i * 0.38) * s, h = 1.7 * s, y = 0.7 + i * 1.05 * s;
        const tier = new T.Mesh(new T.ConeGeometry(r, h, 9), W.mat(C.spruce));
        tier.position.y = y + h / 2;
        g.add(tier);
        const cap = new T.Mesh(new T.ConeGeometry(r * 0.75, h * 0.42, 9), W.mat('#ffffff'));
        cap.position.y = y + h * 0.82;
        g.add(cap);
      }
      g.position.set(x, 0, z);
      W.add(g);
      block(x, z, 1, 1);
    }
    [[-7, 3, 1], [8, 1, 0.9], [-14, -6, 1.2], [13, -8, 1], [-33, -12, 1.3], [34, -6, 1.2], [-38, -40, 1.1],
      [40, -42, 1], [-16, -42, 0.9], [-30, 2, 1], [30, 4, 1.1], [-42, -22, 1.2], [42, -20, 1]]
      .forEach(([x, z, s]) => spruce(x, z, s));

    // --- The snowman, built one step at a time ---
    const sm = new T.Group();
    const smParts = [[], [], [], []];
    const snowBall = (r, y, step) => {
      const m = new T.Mesh(new T.SphereGeometry(r, 18, 14), snowMat);
      m.position.y = y;
      sm.add(m);
      smParts[step].push(m);
    };
    snowBall(1, 0.85, 0);
    snowBall(0.72, 2.2, 1);
    snowBall(0.5, 3.2, 2);
    const extra = (mesh) => { sm.add(mesh); smParts[3].push(mesh); return mesh; };
    extra(ball(0.07, '#1b1b2a', -0.17, 3.32, 0.45));        // eyes
    extra(ball(0.07, '#1b1b2a', 0.17, 3.32, 0.45));
    const nose = new T.Mesh(new T.ConeGeometry(0.08, 0.5, 8), W.mat('#ff8a2a'));
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 3.18, 0.7);
    extra(nose);
    for (let i = 0; i < 3; i++) extra(ball(0.07, '#1b1b2a', 0, 1.95 + i * 0.3, 0.7));   // buttons
    const hat = new T.Group();
    box(1, 0.08, 1, '#2b2b33', 0, 0, 0, hat);
    box(0.62, 0.7, 0.62, '#2b2b33', 0, 0.05, 0, hat);
    box(0.64, 0.12, 0.64, '#e04848', 0, 0.12, 0, hat);
    hat.position.y = 3.6;
    extra(hat);
    const scarf = new T.Mesh(new T.TorusGeometry(0.48, 0.1, 8, 20), W.mat('#e04848'));
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 2.75;
    extra(scarf);
    S.smArms = [];
    for (const k of [-1, 1]) {
      const arm = new T.Group();
      arm.position.set(k * 0.65, 2.3, 0);
      const stick = cyl(0.04, 1.2, C.trunk, 0, 0, 0, arm);
      stick.rotation.z = -k * 1.1;
      stick.position.set(k * 0.5, 0.25, 0);
      extra(arm);
      S.smArms.push(arm);
    }
    sm.position.set(SNOWMAN.x, 0, SNOWMAN.z);
    W.add(sm);
    block(SNOWMAN.x, SNOWMAN.z, 2, 2);
    W.clickable(sm, 'snowman');
    S.snowman = sm;
    S.snowmanParts = smParts;
    // a heap of snow next to it (tap it too)
    const heap = new T.Mesh(new T.SphereGeometry(0.9, 14, 10), snowMat);
    heap.scale.set(1.3, 0.45, 1.1);
    heap.position.set(SNOWMAN.x + 2.2, 0.1, SNOWMAN.z + 0.6);
    W.add(heap);
    W.clickable(heap, 'snowman');

    // --- The igloo: a dome of snow blocks ---
    const iglooTex = texture(128, 6, 3, (g, n) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, n, n);
      g.strokeStyle = 'rgba(120,150,190,0.55)';
      g.lineWidth = 2;
      for (let r = 0; r < 4; r++) {
        const y = r * n / 4;
        g.beginPath(); g.moveTo(0, y); g.lineTo(n, y); g.stroke();
        for (let x = (r % 2) * 16; x < n; x += 32) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + n / 4); g.stroke(); }
      }
    });
    const iglooMat = new T.MeshLambertMaterial({ color: '#f6fbff', map: iglooTex });
    const ig = new T.Group();
    const dome = new T.Mesh(new T.SphereGeometry(3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), iglooMat);
    ig.add(dome);
    const tunnel = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 2.2, 14, 1, false, 0, Math.PI), iglooMat);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.rotation.y = Math.PI / 2;
    tunnel.position.set(0, 0, 3);
    ig.add(tunnel);
    const hole = new T.Mesh(new T.CircleGeometry(0.85, 16, 0, Math.PI), W.mat('#1e2a3a'));
    hole.position.set(0, 0.02, 4.12);
    ig.add(hole);
    ig.position.set(IGLOO.x, 0, IGLOO.z);
    W.add(ig);
    block(IGLOO.x, IGLOO.z + 0.8, 6.2, 7.6);
    W.clickable(ig, 'igloo');

    // --- The sledding hill and a red sled ---
    const hill = new T.Mesh(new T.SphereGeometry(HILL.r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), snowMat);
    hill.scale.y = HILL.h / HILL.r;
    hill.position.set(HILL.x, 0, HILL.z);
    W.add(hill);
    block(HILL.x, HILL.z, HILL.r * 1.6, HILL.r * 1.6);
    S.sled = new T.Group();
    box(0.8, 0.12, 1.5, '#e04848', 0, 0.12, 0, S.sled);
    for (const k of [-1, 1]) {
      const runner = box(0.06, 0.06, 1.7, '#5a5a73', k * 0.35, 0, 0, S.sled);
      runner.position.y = 0.03;
    }
    const rope = cyl(0.02, 0.6, '#f2c14e', 0, 0, 0, S.sled);
    rope.rotation.x = Math.PI / 2.4;
    rope.position.set(0, 0.25, 0.95);
    W.add(S.sled);
    W.clickable(S.sled, 'sled');
    W.clickable(hill, 'sled');

    // --- Penguins by the sea ---
    S.penguins = [];
    function penguin(x, z, s) {
      const g = new T.Group();
      const body = new T.Group();
      const b = ball(0.42, '#1f2230', 0, 0.55, 0, body); b.scale.set(1, 1.35, 0.95);
      const belly = ball(0.34, '#ffffff', 0, 0.52, 0.12, body); belly.scale.set(0.95, 1.25, 0.8);
      ball(0.28, '#1f2230', 0, 1.18, 0, body);                                   // head
      ball(0.1, '#ffffff', -0.11, 1.24, 0.19, body);                             // eye patches
      ball(0.1, '#ffffff', 0.11, 1.24, 0.19, body);
      ball(0.04, '#1b1b2a', -0.11, 1.25, 0.28, body);
      ball(0.04, '#1b1b2a', 0.11, 1.25, 0.28, body);
      const beak = new T.Mesh(new T.ConeGeometry(0.07, 0.22, 8), W.mat('#ff9f2a'));
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 1.13, 0.33);
      body.add(beak);
      for (const k of [-1, 1]) {
        const flipper = box(0.08, 0.5, 0.22, '#1f2230', k * 0.43, 0.4, 0, body);
        flipper.rotation.z = k * 0.25;
        box(0.18, 0.05, 0.25, '#ff9f2a', k * 0.13, 0, 0.12, body);                // feet
      }
      g.add(body);
      g.scale.setScalar(s);
      g.position.set(x, 0, z);
      W.add(g);
      W.clickable(g, 'penguin');
      const p = { g, body, home: { x, z }, phase: Math.random() * 6, slide: null, dir: Math.random() < 0.5 ? 1 : -1 };
      g.userData.penguin = p;
      g.traverse((m) => { m.userData.penguin = p; });
      S.penguins.push(p);
    }
    [[4, -50, 1], [7, -51.5, 0.9], [10, -49.5, 1.05], [13, -52, 0.85], [2, -53, 0.8], [16, -50.5, 0.95], [-12, -52, 1]]
      .forEach(([x, z, s]) => penguin(x, z, s));

    // --- Snowflakes falling all the time ---
    const N = 700;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = Math.random() * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    const flakeTex = texture(32, 1, 1, (g, n) => {
      const gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, n, n);
    });
    S.flakes = new T.Points(geo, new T.PointsMaterial({ size: 0.18, map: flakeTex, transparent: true, depthWrite: false, color: 0xffffff }));
    W.add(S.flakes);

    // --- The taxi from the airport ---
    S.taxi = W.taxi(C.taxi);
    S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
    block(TAXI_AT.x, TAXI_AT.z, 4, 2);
    W.clickable(S.taxi, 'taxi');
    cyl(0.1, 2.6, C.trunk, -3, 0, 1);
    W.sign('Talvimaa', -3, 2.4, 1, 0, '#e3f4ff', '#2b2340', null, 2.6);
    block(-3, 1, 0.4, 0.4);

    S.ch = W3.character(S.scene);
    S.built = true;
  }

  // Height of the hill at a spot (for the sled ride)
  function hillY(x, z) {
    const d = Math.hypot(x - HILL.x, z - HILL.z) / HILL.r;
    return d >= 1 ? 0 : HILL.h * Math.sqrt(1 - d * d);
  }

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.winter = {
    transparent: true,

    enter() {
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
      this.sledRide = null;
      this.leaving = null;
      this.bubble = null;
      this.snowmanStep = 0;
      this.waveAt = -10;
      this.showSnowman();
      S.sled.position.set(SLED_AT.x, 0, SLED_AT.z);
      S.sled.rotation.set(0, 0, 0);
      S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
      // the taxi from the airport drives in, then we hop out
      this.arrive = { t: 0 };
      S.ch.setVisible(false);
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

    showSnowman() {
      S.snowmanParts.forEach((parts, i) => parts.forEach((m) => { m.visible = i < this.snowmanStep || (i === 0 && this.snowmanStep === 0); }));
      // step 0: only a small heap to start from
      const firstBall = S.snowmanParts[0][0];
      firstBall.scale.setScalar(this.snowmanStep === 0 ? 0.45 : 1);
      firstBall.position.y = this.snowmanStep === 0 ? 0.3 : 0.85;
    },

    stand(spot, obj) {
      if (spot === 'taxi') return { x: TAXI_AT.x - 1, z: TAXI_AT.z - 1.9 };
      if (spot === 'snowman') return { x: SNOWMAN.x + 0.6, z: SNOWMAN.z + 2.4 };
      if (spot === 'igloo') return { x: IGLOO.x, z: IGLOO.z + 5.8 };
      if (spot === 'sled') return { x: SLED_AT.x - 1.2, z: SLED_AT.z + 1.2 };
      if (spot === 'penguin' && obj) {
        const g = obj.g.position;
        return { x: g.x, z: Math.min(g.z + 2.2, BOUNDS.maxZ) };
      }
      return null;
    },

    use(spot, obj) {
      if (spot === 'taxi') {
        this.leaving = { t: 0 };
        S.ch.setVisible(false);
        this.say('Taksi, lentokentälle kiitos!', 2.2);
        MP.sfx.bling();
      } else if (spot === 'snowman') {
        if (this.snowmanStep < SNOWMAN_STEPS) {
          this.snowmanStep++;
          this.showSnowman();
          MP.sfx.boing();
          const texts = ['Pyöritellään iso lumipallo!', 'Toinen pallo päälle!', 'Pää paikalleen!', 'Silmät, porkkananenä, hattu ja kaulaliina! Valmis lumiukko!'];
          this.say(texts[this.snowmanStep - 1], 3);
          if (this.snowmanStep === SNOWMAN_STEPS) { MP.sfx.bling(); this.waveAt = MP.time; }
        } else {
          this.waveAt = MP.time;
          this.say('Lumiukko vilkuttaa! Hei hei!', 2.5);
          MP.sfx.tune();
        }
      } else if (spot === 'igloo') {
        this.say('Iglu! Se on rakennettu lumiharkoista. Sisällä on yllättävän lämmin!', 4);
        MP.sfx.tune();
      } else if (spot === 'sled') {
        this.sledRide = { t: 0 };
        this.say('Mäenlaskuun! Wiii!', 2.5);
        MP.sfx.boing();
      } else if (spot === 'penguin' && obj) {
        if (!obj.slide) obj.slide = { t: 0, from: { x: obj.g.position.x, z: obj.g.position.z } };
        this.say('Pingviini liukuu mahallaan! Liuk!', 2.5);
        MP.sfx.quack();
      }
    },

    onTap(x, y) {
      if (this.arrive || this.leaving || this.sledRide || MP.isFading()) return;
      if (W3.hitTurn(x, y)) {
        this.target = null;
        this.p.heading += Math.PI;
        MP.sfx.tap();
        return;
      }
      // which penguin was tapped (penguins are their own thing)
      const T = W3.T;
      W3.raycaster.setFromCamera(new T.Vector2(x / MP.W * 2 - 1, -(y / MP.H * 2 - 1)), S.camera);
      const hit = W3.raycaster.intersectObjects(S.W.clickables, true)[0];
      const pen = hit && hit.object.userData.penguin;
      W3.tap(this, x, y, S.camera, S.W, BOUNDS, (spot) => {
        const obj = spot === 'penguin' ? pen : null;
        const st = this.stand(spot, obj);
        if (!st) return false;
        MP.sfx.tap();
        this.walkTo(st.x, st.z, () => this.use(spot, obj));
        return true;
      });
    },

    update(dt) {
      const p = this.p;
      const now = MP.time;

      // --- Taxi arriving ---
      if (this.arrive) {
        this.arrive.t += dt;
        const u = MP.clamp(this.arrive.t / 2, 0, 1);
        S.taxi.position.x = TAXI_AT.x + 40 * (1 - u) * (1 - u);
        if (this.arrive.t > 2.3) {
          this.arrive = null;
          S.ch.setVisible(true);
          MP.sfx.bling();
          this.say('Talvimaa! Brrr, onpa kylmä! Lunta sataa. Tehdäänkö lumiukko?', 4.5);
        }
      }
      // --- Taxi leaving for the airport ---
      if (this.leaving) {
        this.leaving.t += dt;
        const t = Math.max(0, this.leaving.t - 0.8);
        S.taxi.position.x = TAXI_AT.x - t * t * 6;
        if (this.leaving.t > 2.6 && !this.leaving.gone) {
          this.leaving.gone = true;
          MP.goTo(MP.scenes.airport, { country: 'winter' });
        }
      }

      if (!this.arrive && !this.leaving && !this.sledRide) W3.walkStep(this, dt, SPEED, S.W.obstacles);
      else this.walking = false;

      // --- Sled ride: up the hill, then whoosh down ---
      let rideY = 0;
      if (this.sledRide) {
        const r = this.sledRide;
        r.t += dt;
        const topZ = HILL.z + 0.5, endZ = SLED_AT.z + 6;
        if (r.t < 1) {
          p.x = HILL.x; p.z = MP.lerp(SLED_AT.z, topZ, r.t);
        } else {
          const u = MP.clamp((r.t - 1) / 2, 0, 1);
          p.x = HILL.x; p.z = MP.lerp(topZ, endZ, u * u);
        }
        p.heading = Math.PI;      // looking down the hill, toward the camera side
        rideY = hillY(p.x, p.z);
        S.sled.position.set(p.x, rideY, p.z);
        const ahead = hillY(p.x, p.z + 0.6);
        S.sled.rotation.x = Math.atan2(rideY - ahead, 0.6);
        if (r.t > 3.4) {
          this.sledRide = null;
          S.sled.position.set(SLED_AT.x, 0, SLED_AT.z);
          S.sled.rotation.set(0, 0, 0);
          p.x = SLED_AT.x - 1.2; p.z = SLED_AT.z + 1.2;
          p.heading = 0;
          this.say('Uudestaan! Napauta kelkkaa.', 2.5);
        }
      }

      // --- Penguins waddle; a tapped one slides on its belly and gets up ---
      for (const pg of S.penguins) {
        const g = pg.g;
        if (pg.slide) {
          const s = pg.slide;
          s.t += dt;
          const lie = MP.clamp(s.t / 0.3, 0, 1) * MP.clamp((2.6 - s.t) / 0.4, 0, 1);
          pg.body.rotation.x = lie * (Math.PI / 2 - 0.15);
          pg.body.position.y = lie * 0.35;
          const u = MP.clamp((s.t - 0.2) / 1.8, 0, 1);
          g.position.z = s.from.z - (1 - (1 - u) * (1 - u)) * 4;
          g.rotation.y = Math.PI;      // slides toward the sea
          if (s.t > 2.6) { pg.slide = null; pg.body.rotation.x = 0; pg.body.position.y = 0; }
        } else {
          // waddle slowly back toward home spot, rocking side to side
          pg.phase += dt;
          const tx = pg.home.x + Math.sin(pg.phase * 0.4) * 1.5, tz = pg.home.z;
          const dx = tx - g.position.x, dz = tz - g.position.z, d = Math.hypot(dx, dz);
          if (d > 0.05) {
            g.position.x += dx / d * Math.min(d, dt * 0.7);
            g.position.z += dz / d * Math.min(d, dt * 0.7);
            g.rotation.y = Math.atan2(dx, dz);
          }
          pg.body.rotation.z = Math.sin(pg.phase * 7) * 0.12;
        }
      }
      // --- Icebergs bob, the seal nods, the snowman waves ---
      for (const b of S.bergs) b.g.position.y = Math.sin(now * 0.6 + b.phase) * 0.15;
      S.seal.rotation.z = Math.sin(now * 1.2) * 0.08;
      const wave = now - this.waveAt;
      S.smArms[1].rotation.z = wave < 2 ? Math.sin(wave * 10) * 0.5 + 0.5 : 0;
      // --- Snow falls around the character ---
      const pos = S.flakes.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - dt * 1.3;
        if (y < 0) y += 18;
        pos.setY(i, y);
        pos.setX(i, pos.getX(i) + Math.sin(now + i) * dt * 0.2);
      }
      pos.needsUpdate = true;
      S.flakes.position.set(p.x, 0, p.z);

      // --- Arriving at places (said once) ---
      if (!this.arrive) {
        for (const [id, pl] of Object.entries(PLACES)) {
          if (!this.seen[id] && Math.hypot(p.x - pl.x, p.z - pl.z) < pl.r) {
            this.seen[id] = true;
            if (id === 'snowman') this.say('Lumikasa! Napauta sitä, niin rakennetaan lumiukko.', 3.5);
            if (id === 'igloo') this.say('Iglu! Napauta sitä.', 3);
            if (id === 'hill') this.say('Pulkkamäki! Napauta kelkkaa.', 3);
            if (id === 'shore') this.say('Meri ja jäävuoria! Ja pingviinejä! Napauta pingviiniä.', 4);
          }
        }
      }

      if (this.sledRide) {
        // camera in front of the hill, looking at the rider
        const cx = p.x, cz = p.z + 6;
        S.camera.position.set(cx, rideY + 2.6, cz);
        S.camera.lookAt(p.x, rideY + 0.8, p.z);
        this.camHeading = 0;
      } else {
        W3.follow(S.camera, this, dt);
      }
      this.headPos = S.ch.draw(p.x, rideY + (this.sledRide ? 0.12 : 0), p.z,
        { sit: !!this.sledRide, back: !this.sledRide, walking: this.walking, walkTime: this.walkTime });
      if (this.leaving || this.arrive) this.headPos = S.taxi.position.clone().setY(2.6);
      W3.render(S.scene, S.camera);
    },

    draw(ctx) {
      W3.drawBubble(ctx, this.bubble, this.headPos, S.camera);
      if (!this.arrive && !this.leaving && !this.sledRide) W3.drawTurnButton(ctx);
    },
  };
})();
