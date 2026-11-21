// egypt.js – EGYPT! A 3D desert with pyramids, seen from behind the character.
// The taxi brings you here. Tap the ground to walk. Things to find:
//   the big pyramid's door (go inside → pyramid.js, a 2D scene like the house),
//   the sphinx, a camel you can ride, and an oasis with palm trees.
// The taxi takes you back home.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const W3 = MP.w3d;

  // Colors in Egypt (Ella can change these)
  MP.EGYPT = {
    sky: '#8fd3ff',
    sand: '#f2d38b',
    dunes: '#e9c06a',
    path: '#dcb877',
    pyramid: '#e6bd6e',
    gold: '#ffd23f',
    stone: '#c99c5c',
    palmTrunk: '#9b6b3b',
    palmLeaves: '#3f9e4a',
    water: '#3fb4e0',
    camel: '#c98f4f',
  };

  const SPEED = 3.4;
  const BOUNDS = { minX: -58, maxX: 58, minZ: -84, maxZ: 12 };
  const TAXI_AT = { x: -4, z: 9.5 };
  const BIG = { x: 0, z: -45, r: 20, h: 18 };            // the big pyramid
  const HALF = BIG.r / Math.SQRT2;                         // half the width of its base
  const DOOR_Z = BIG.z + HALF;                             // its front side
  const CAMEL = { x: -12, z: -12, r: 4.5 };                // the camel walks round this circle
  const PLACES = {
    door: { x: 0, z: DOOR_Z + 3, r: 5 },
    sphinx: { x: 20, z: -22, r: 6 },
    oasis: { x: -24, z: -26, r: 7 },
  };

  const S = { built: false };
  MP.egypt3d = S;                 // (for testing)

  // ---------------------------------------------------------------------------
  // Building the desert
  // ---------------------------------------------------------------------------
  function build() {
    W3.init();
    const T = window.THREE;
    const E = MP.EGYPT;
    S.scene = new T.Scene();
    S.scene.background = new T.Color(E.sky);
    S.scene.fog = new T.Fog('#ffe9bf', 45, 140);
    S.camera = new T.PerspectiveCamera(55, 16 / 9, 0.1, 300);
    S.scene.add(new T.HemisphereLight(0xffffff, 0xd9b26a, 0.85));
    const sun = new T.DirectionalLight(0xfff1d6, 0.6);
    sun.position.set(-30, 45, 20);
    S.scene.add(sun);

    const W = W3.kit(S.scene);
    S.W = W;
    const { box, cyl, ball, flat, disc, block } = W;

    // --- Sand, path, dunes, sun ---
    const ground = new T.Mesh(new T.PlaneGeometry(500, 500), W.mat(E.sand));
    ground.rotation.x = -Math.PI / 2;
    W.add(ground);
    flat(4, 44, E.path, 0, DOOR_Z + 22, 0.012);                // path to the big pyramid
    for (let z = 8; z > DOOR_Z + 2; z -= 2.2) {                  // stones along the path
      ball(0.18, E.stone, -2.3, 0.05, z);
      ball(0.18, E.stone, 2.3, 0.05, z - 1.1);
    }
    [[-110, -70, 40], [110, -60, 44], [0, -170, 55], [-80, -150, 40], [85, -150, 45], [-120, 30, 35], [120, 40, 35]]
      .forEach(([x, z, r]) => {
        const d = ball(r, E.dunes, x, -r * 0.7, z);
        d.scale.set(1.6, 1, 1);
      });
    const sunBall = new T.Mesh(new T.SphereGeometry(7, 20, 14), new T.MeshBasicMaterial({ color: '#fff3a8', fog: false }));
    sunBall.position.set(-70, 60, -160);
    W.add(sunBall);
    // little sand ripples and stones
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 110, z = 10 - Math.random() * 90;
      if (Math.abs(x) < 4 && z > DOOR_Z) continue;
      ball(0.1 + Math.random() * 0.15, i % 3 ? E.dunes : E.stone, x, 0.03, z);
    }

    // --- Pyramids (a cone with four sides is a pyramid!) ---
    function pyramid(x, z, r, h, spot) {
      const g = new T.Group();
      const m = new T.Mesh(new T.ConeGeometry(r, h, 4), W.mat(E.pyramid));
      m.rotation.y = Math.PI / 4;
      m.position.y = h / 2;
      g.add(m);
      // a golden tip
      const tip = new T.Mesh(new T.ConeGeometry(r * 0.12, h * 0.12, 4), W.mat(E.gold));
      tip.rotation.y = Math.PI / 4;
      tip.position.y = h - h * 0.06 + 0.02;
      g.add(tip);
      // stripes of stone blocks
      for (let k = 1; k < 7; k++) {
        const y = h * k / 8, rr = r * (1 - k / 8) + 0.06;
        const band = new T.Mesh(new T.ConeGeometry(rr, 0.12, 4, 1, true), W.mat(E.stone));
        band.rotation.y = Math.PI / 4;
        band.position.y = y;
        g.add(band);
      }
      g.position.set(x, 0, z);
      W.add(g);
      const half = r / Math.SQRT2;
      block(x, z, half * 2, half * 2);
      if (spot) W.clickable(g, spot);
      return g;
    }
    pyramid(BIG.x, BIG.z, BIG.r, BIG.h, 'bigPyramid');
    pyramid(-36, -66, 14, 12.5, 'smallPyramid');
    pyramid(32, -72, 16, 14.5, 'smallPyramid');

    // The door of the big pyramid: a stone doorway with a dark opening
    const door = new T.Group();
    box(4, 4.2, 2.4, E.stone, 0, 0, 0, door);
    box(4.6, 0.6, 2.6, E.pyramid, 0, 4.2, 0, door);
    box(2.2, 3, 0.2, '#2a1d12', 0, 0, 1.15, door);
    box(0.5, 0.5, 0.15, E.gold, 0, 3.4, 1.22, door);           // golden sun sign over the door
    door.position.set(0, 0, DOOR_Z - 0.6);
    W.add(door);
    block(0, DOOR_Z - 0.6, 4, 2.4);
    W.clickable(door, 'door');
    S.door = door;

    // --- The sphinx: lion body, person's head ---
    const sph = new T.Group();
    box(3.2, 2.2, 7, E.stone, 0, 0, -0.5, sph);                 // body
    box(3.2, 1.2, 2.2, E.stone, 0, 0, 3.4, sph);                // front paws
    box(1, 0.6, 1.2, E.pyramid, -0.9, 0, 4.9, sph);
    box(1, 0.6, 1.2, E.pyramid, 0.9, 0, 4.9, sph);
    box(2.4, 2.6, 2.2, E.pyramid, 0, 2.2, 2.4, sph);            // head
    box(3.4, 2.4, 1.6, '#4a78c8', 0, 2.2, 1.5, sph);            // headdress, blue…
    for (let y = 2.5; y < 4.6; y += 0.6) box(3.45, 0.22, 1.65, E.gold, 0, y, 1.5, sph); // …with gold stripes
    box(0.35, 0.28, 0.1, '#2b2340', -0.55, 3.8, 3.52, sph);    // eyes
    box(0.35, 0.28, 0.1, '#2b2340', 0.55, 3.8, 3.52, sph);
    box(0.3, 0.5, 0.3, E.stone, 0, 3.0, 3.55, sph);             // nose
    box(0.8, 0.12, 0.1, '#9c4a3f', 0, 2.7, 3.52, sph);          // smile
    box(0.5, 1, 0.5, '#4a78c8', 0, 1.3, 3.55, sph);             // beard
    sph.position.set(20, 0, -28);
    W.add(sph);
    block(20, -28.5, 3.4, 9);
    W.clickable(sph, 'sphinx');

    // --- Oasis: a pond with palm trees ---
    disc(5, E.water, -24, -26, 0.02);
    disc(5.6, E.dunes, -24, -26, 0.015);
    block(-24, -26, 8.4, 8.4);
    function palm(x, z, lean) {
      const g = new T.Group();
      for (let i = 0; i < 6; i++) {
        cyl(0.22 - i * 0.015, 0.75, E.palmTrunk, lean * i * 0.12, i * 0.72, 0, g);
      }
      const top = new T.Group();
      top.position.set(lean * 0.72, 4.4, 0);
      for (let i = 0; i < 7; i++) {
        const leaf = new T.Mesh(new T.BoxGeometry(2.6, 0.08, 0.6), W.mat(i % 2 ? E.palmLeaves : '#55b65e'));
        leaf.position.set(1.2, -0.25, 0);
        const holder = new T.Group();
        holder.rotation.y = i * Math.PI * 2 / 7;
        holder.rotation.z = -0.35;
        holder.add(leaf);
        top.add(holder);
      }
      ball(0.22, '#7a4a25', 0.15, -0.3, 0.15, top);              // coconuts
      ball(0.22, '#7a4a25', -0.15, -0.3, -0.1, top);
      g.add(top);
      g.position.set(x, 0, z);
      W.add(g);
      block(x, z, 0.7, 0.7);
    }
    [[-30, -22, 1], [-18, -31, -1], [-29, -31, 0.6], [-19, -20, -0.5], [-8, 4, 0.8], [9, 2, -0.8],
      [14, -50, 0.5], [-16, -50, -0.6], [40, -30, 0.7], [-44, -40, 0.4]]
      .forEach(([x, z, l]) => palm(x, z, l));

    // --- The camel ---
    const camel = new T.Group();
    const body = ball(1, E.camel, 0, 1.75, 0, camel); body.scale.set(1.5, 0.75, 0.8);
    ball(0.5, E.camel, -0.85, 2.3, 0, camel);                   // two humps
    ball(0.45, E.camel, 0.85, 2.25, 0, camel);
    for (const [lx, lz] of [[-0.9, 0.35], [-0.9, -0.35], [0.9, 0.35], [0.9, -0.35]]) {
      cyl(0.13, 1.3, E.camel, lx, 0, lz, camel);
    }
    const neck = cyl(0.22, 1.4, E.camel, -1.6, 1.6, 0, camel); neck.rotation.z = 0.7;
    S.camelHead = new T.Group();
    S.camelHead.position.set(-2.2, 2.75, 0);
    const head = ball(0.36, E.camel, -0.15, 0, 0, S.camelHead); head.scale.set(1.5, 0.9, 0.9);
    ball(0.07, '#2b2340', -0.25, 0.15, 0.28, S.camelHead);       // eyes
    ball(0.07, '#2b2340', -0.25, 0.15, -0.28, S.camelHead);
    ball(0.12, '#a8713a', 0.15, 0.32, 0.22, S.camelHead);        // ears
    ball(0.12, '#a8713a', 0.15, 0.32, -0.22, S.camelHead);
    camel.add(S.camelHead);
    box(0.9, 0.15, 1.3, '#e04848', 0, 2.25, 0, camel);           // a red blanket to sit on
    camel.position.set(CAMEL.x + CAMEL.r, 0, CAMEL.z);
    camel.rotation.y = Math.PI / 2;
    W.add(camel);
    W.clickable(camel, 'camel');
    S.camel = camel;

    // --- The taxi that brought us here ---
    S.taxi = W.taxi(MP.OUTSIDE.taxi);
    S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
    block(TAXI_AT.x, TAXI_AT.z, 4, 2);
    W.clickable(S.taxi, 'taxi');

    // A sign by the path
    cyl(0.1, 2.6, '#a0643c', 3, 0, 3);
    W.sign('Pyramidit', 3, 2.4, 3, 0, '#fff7e0', '#2b2340', null, 2.6);
    block(3, 3, 0.4, 0.4);

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
      this.p = out ? { x: 0, z: DOOR_Z + 2.4, heading: Math.PI } : { x: -1.6, z: 7.6, heading: 0 };
      this.camHeading = this.p.heading;
      this.camDist = this.camHeight = null;
      this.target = null;
      this.onArrive = null;
      this.walking = false;
      this.walkTime = 0;
      this.seen = out ? { door: true } : {};
      this.ride = null;             // riding the camel
      this.leaving = null;          // taxi going home
      this.camelAngle = 0;
      this.nodAt = -10;
      S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
      this.placeCamel();
      if (out) {
        this.arrive = null;
        S.ch.setVisible(true);
        this.say('Ulkona taas! Onpa aurinkoista.', 3, 0.5);
      } else {
        // The taxi drives in, then we hop out
        this.arrive = { t: 0 };
        S.ch.setVisible(false);
      }
    },

    exit() {
      W3.hide();
    },

    say(text, seconds, delay) {
      this.bubble = { text, from: MP.time + (delay || 0), until: MP.time + (delay || 0) + (seconds || 3) };
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
      if (spot === 'door') return { x: 0, z: DOOR_Z + 1.6 };
      if (spot === 'taxi') return { x: TAXI_AT.x, z: TAXI_AT.z - 1.9 };
      if (spot === 'sphinx') return { x: 20, z: -21.4 };
      if (spot === 'camel') {
        const c = S.camel.position;
        const dx = this.p.x - c.x, dz = this.p.z - c.z, d = Math.hypot(dx, dz) || 1;
        return { x: c.x + dx / d * 2.2, z: c.z + dz / d * 2.2 };
      }
      return null;
    },

    use(spot) {
      if (spot === 'door') {
        this.say('Mennään sisään!', 1.2);
        MP.sfx.bling();
        this.walkTo(0, DOOR_Z + 0.4);
        MP.goTo(MP.scenes.pyramid);
      } else if (spot === 'taxi') {
        this.leaving = { t: 0 };
        S.ch.setVisible(false);
        this.say('Taksi, kotiin kiitos!', 2.2);
        MP.sfx.bling();
      } else if (spot === 'sphinx') {
        this.say('Sfinksi! Leijonan vartalo ja ihmisen pää. Se hymyilee!', 4);
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
          this.say('Tämän pyramidin ovi on kiinni. Isoon pyramidiin pääsee sisään!', 3.5);
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
          this.say('Egypti! Katso, pyramidit! Mennään isoon pyramidiin.', 4.5);
        }
      }

      // --- Taxi leaving for home ---
      if (this.leaving) {
        this.leaving.t += dt;
        const t = Math.max(0, this.leaving.t - 0.8);
        S.taxi.position.x = TAXI_AT.x - t * t * 6;
        if (this.leaving.t > 2.6 && !this.leaving.gone) {
          this.leaving.gone = true;
          MP.goTo(MP.scenes.street, { from: 'taxi' });
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

      // --- Arriving at places (said once) ---
      if (!this.arrive) {
        for (const [id, pl] of Object.entries(PLACES)) {
          if (!this.seen[id] && Math.hypot(p.x - pl.x, p.z - pl.z) < pl.r) {
            this.seen[id] = true;
            if (id === 'door') this.say('Pyramidin ovi! Napauta ovea, niin mennään sisään.', 3.5);
            if (id === 'sphinx') this.say('Sfinksi! Napauta sitä.', 3);
            if (id === 'oasis') this.say('Keidas! Täällä on vettä ja palmuja.', 3.5);
          }
        }
      }

      W3.follow(S.camera, this, dt, this.ride ? 6.5 : 4.6, this.ride ? 4.6 : 2.3);
      if (this.ride) {
        const c = S.camel.position;
        this.headPos = S.ch.draw(c.x, 2.45, c.z, { sit: true });
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
