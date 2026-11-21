// newyork.js – NEW YORK! A big-city street in 3D, seen from behind the character.
// You arrive from the airport in a yellow taxi. Things to do:
//   eat pizza at the pizza shop (tap the slice to take bites), watch the spider
//   hero swing between the skyscrapers (tap him!), see the Statue of Liberty
//   across the water, yellow taxis driving by, and big shining billboards.
// The taxi takes you back to the airport.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const W3 = MP.w3d;

  // Colors in New York (Ella can change these)
  MP.NEWYORK = {
    sky: '#9fcff2',
    road: '#55585f',
    sidewalk: '#c9c6c0',
    line: '#ffd23f',
    taxi: '#ffcc00',
    water: '#3d7fa8',
    liberty: '#7fbfa6',
  };

  const SPEED = 3.4;
  const BOUNDS = { minX: -8.5, maxX: 8.5, minZ: -66, maxZ: 10 };
  const TAXI_AT = { x: 5.5, z: 6.5 };
  const PIZZA = { x: -8.6, z: -14 };          // the pizza shop door (left side of the street)
  const HERO = { z: -24, anchorY: 15 };       // where the spider hero swings
  const LIBERTY = { x: 0, z: -110 };
  const PLACES = {
    pizza: { x: PIZZA.x + 3, z: PIZZA.z, r: 5 },
    hero: { x: 0, z: HERO.z + 8, r: 7 },
    water: { x: 0, z: -62, r: 6 },
    grandma: { x: -7, z: -40, r: 4.5 },
    hq: { x: 7, z: -46, r: 4.5 },
  };
  const BITES = 4;

  const S = { built: false };
  MP.newyork3d = S;               // (for testing)

  function texture(w, h, repeatX, repeatY, paint) {
    const T = window.THREE;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    paint(c.getContext('2d'), w, h);
    const tex = new T.CanvasTexture(c);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    return tex;
  }

  // A picture with text, for billboards
  function billboardTexture(text, bg, fg) {
    const T = window.THREE;
    const c = document.createElement('canvas');
    c.width = 256; c.height = 160;
    const g = c.getContext('2d');
    g.fillStyle = bg; g.fillRect(0, 0, 256, 160);
    g.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(30 + i * 45, 130 - (i % 2) * 90, 18, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = fg;
    g.font = 'bold 54px ' + MP.FONT_FAMILY;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 128, 82);
    return new T.CanvasTexture(c);
  }

  // ---------------------------------------------------------------------------
  // Building the city
  // ---------------------------------------------------------------------------
  function build() {
    W3.init();
    const T = window.THREE;
    const C = MP.NEWYORK;
    S.scene = new T.Scene();
    S.scene.background = new T.Color(C.sky);
    S.scene.fog = new T.Fog('#d6e8f5', 60, 180);
    S.camera = new T.PerspectiveCamera(55, 16 / 9, 0.1, 320);
    S.scene.add(new T.HemisphereLight(0xffffff, 0x8a8a90, 0.85));
    const sun = new T.DirectionalLight(0xfff4e0, 0.6);
    sun.position.set(30, 60, 20);
    S.scene.add(sun);

    const W = W3.kit(S.scene);
    S.W = W;
    const { box, cyl, ball, flat, block } = W;

    // --- Streets and sidewalks ---
    const ground = new T.Mesh(new T.PlaneGeometry(500, 500), W.mat('#7d8088'));
    ground.rotation.x = -Math.PI / 2;
    W.add(ground);
    flat(10, 80, C.road, 0, -28, 0.01);                       // the avenue
    flat(4, 80, C.sidewalk, -7, -28, 0.015);
    flat(4, 80, C.sidewalk, 7, -28, 0.015);
    for (let z = 8; z > -66; z -= 4) flat(0.2, 2, C.line, 0, z, 0.02);
    for (let x = -4.4; x <= 4.4; x += 0.9) flat(0.5, 2.2, '#ffffff', x, -38, 0.02);   // zebra crossing
    flat(40, 6, C.road, 0, -42, 0.012);                       // cross street
    // the water at the end, and the Statue of Liberty on her island
    const water = new T.Mesh(new T.PlaneGeometry(400, 200), W.mat(C.water));
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.03, -168);
    W.add(water);
    flat(60, 2, '#6a6d73', 0, -68, 0.025);                    // the quay
    S.waves = [];
    for (let i = 0; i < 20; i++) S.waves.push(flat(1.4, 0.12, '#bfe6ff', -30 + Math.random() * 60, -72 - Math.random() * 60, 0.04));
    // railing by the water
    for (let x = -9; x <= 9; x += 1.5) cyl(0.05, 1, '#2b2b33', x, 0, -66.6);
    box(19, 0.08, 0.08, '#2b2b33', 0, 1, -66.6);

    // --- Skyscrapers with lots of windows ---
    const windowTex = (wall, glass) => texture(64, 64, 1, 1, (g, w, h) => {
      g.fillStyle = wall; g.fillRect(0, 0, w, h);
      for (let y = 4; y < h; y += 16) for (let x = 4; x < w; x += 16) {
        g.fillStyle = Math.random() < 0.15 ? '#fff3b0' : glass;
        g.fillRect(x, y, 9, 10);
      }
    });
    const looks = [['#8c8f99', '#bfe0f5'], ['#b5835a', '#cfe8f7'], ['#6d7a8c', '#a9d3ef'], ['#d6cfc3', '#9fc6e6'], ['#4d5566', '#8fc0e6']];
    function skyscraper(x, z, w, d, h, look, crown) {
      const tex = windowTex(look[0], look[1]);
      tex.repeat.set(Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(h / 3)));
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshLambertMaterial({ map: tex }));
      m.position.set(x, h / 2, z);
      W.add(m);
      if (crown === 'spire') {
        // like the Empire State Building: steps and a needle on top
        box(w * 0.6, 3, d * 0.6, look[0], x, h, z);
        box(w * 0.35, 3, d * 0.35, look[0], x, h + 3, z);
        cyl(0.2, 7, '#d8dde6', x, h + 6, z, null, 0.05);
      } else if (crown === 'top') {
        box(w + 0.4, 0.6, d + 0.4, '#3a3f4a', x, h, z);
      }
      block(x, z, w, d);
    }
    const leftX = -15, rightX = 15;
    let i = 0;
    for (let z = 6; z > -64; z -= 11) {
      const lh = 18 + ((i * 13) % 22), rh = 16 + ((i * 17) % 26);
      if (Math.abs(z - PIZZA.z) > 6) skyscraper(leftX, z, 10, 9, lh, looks[i % 5], i === 2 ? 'spire' : 'top');
      skyscraper(rightX, z, 10, 9, rh, looks[(i + 2) % 5], i === 4 ? 'spire' : 'top');
      i++;
    }
    // buildings further back make it a big city
    for (let k = 0; k < 16; k++) {
      const side = k % 2 ? 1 : -1;
      skyscraper(side * (32 + (k % 3) * 9), 10 - k * 6, 8, 8, 30 + (k * 11) % 40, looks[k % 5], 'top');
    }

    // --- The pizza shop (a low building with a striped awning) ---
    const shop = new T.Group();
    box(10, 7, 9, '#b5583a', 0, 0, 0, shop);                  // brick building
    box(0.2, 3, 4, '#2b2340', 5, 0, 0, shop);                 // dark door / window
    box(0.15, 2.4, 3, '#ffe9b0', 5.05, 0.4, 0, shop);         // warm light inside
    const awning = new T.Group();
    for (let k = 0; k < 6; k++) box(1.6, 0.12, 0.7, k % 2 ? '#ffffff' : '#2e8b57', 0, 0, -1.75 + k * 0.7, awning);
    awning.position.set(5.6, 3.4, 0);
    awning.rotation.z = -0.35;
    shop.add(awning);
    const sign = new T.Mesh(new T.PlaneGeometry(4, 1.3), new T.MeshBasicMaterial({ map: billboardTexture('PIZZA', '#e04848', '#ffffff') }));
    sign.position.set(5.12, 4.6, 0);
    sign.rotation.y = Math.PI / 2;
    shop.add(sign);
    // a giant pizza slice on the roof
    const slice = new T.Mesh(new T.ConeGeometry(1.6, 0.25, 3), W.mat('#f2c14e'));
    slice.position.set(2, 7.6, 0);
    slice.rotation.set(Math.PI / 2, 0, 0);
    shop.add(slice);
    for (let k = 0; k < 3; k++) ball(0.25, '#d33a2a', 2 + (k - 1) * 0.5, 7.8, (k - 1) * 0.4, shop);
    shop.position.set(PIZZA.x - 5, 0, PIZZA.z);
    W.add(shop);
    block(PIZZA.x - 5, PIZZA.z, 10, 9);
    W.clickable(shop, 'pizza');

    // --- Big shining billboards ---
    S.boards = [];
    const ads = [['NEW YORK', '#2f6fb8', '#ffd23f'], ['I ♥ NY', '#ffffff', '#e04848'], ['MATKAPELI', '#c084fc', '#ffffff'], ['PIZZA!', '#ffd23f', '#e04848']];
    ads.forEach(([text, bg, fg], k) => {
      const b = new T.Mesh(new T.PlaneGeometry(6, 3.8), new T.MeshBasicMaterial({ map: billboardTexture(text, bg, fg) }));
      const left = k % 2 === 0;
      b.position.set(left ? leftX + 5.06 : rightX - 5.06, 9 + (k % 2) * 4, -20 - k * 9);
      b.rotation.y = left ? Math.PI / 2 : -Math.PI / 2;
      W.add(b);
      S.boards.push(b);
    });

    // --- Street things: fire hydrant, lamps, a hot dog cart ---
    function lamp(x, z) {
      cyl(0.08, 4, '#2b2b33', x, 0, z);
      const arm = box(1, 0.08, 0.08, '#2b2b33', x + (x < 0 ? 0.5 : -0.5), 4, z);
      arm.position.y = 4;
      ball(0.25, '#fff4c2', x + (x < 0 ? 1 : -1), 3.9, z);
      block(x, z, 0.3, 0.3);
    }
    for (let z = 2; z > -62; z -= 14) { lamp(-5.4, z); lamp(5.4, z - 7); }
    cyl(0.22, 0.6, '#d33a2a', 5.6, 0, -6);                   // fire hydrant
    ball(0.2, '#d33a2a', 5.6, 0.65, -6);
    block(5.6, -6, 0.5, 0.5);
    const cart = new T.Group();
    box(1.6, 1, 1, '#d8dde6', 0, 0.3, 0, cart);
    cyl(0.3, 0.1, '#2b2b33', -0.5, 0, 0.52, cart).rotation.x = Math.PI / 2;
    cyl(0.3, 0.1, '#2b2b33', 0.5, 0, 0.52, cart).rotation.x = Math.PI / 2;
    const umb = new T.Mesh(new T.ConeGeometry(1.2, 0.5, 10), W.mat('#ffd23f'));
    umb.position.y = 2.4;
    cart.add(umb);
    cyl(0.04, 1.2, '#5a5a73', 0, 1.3, 0, cart);
    cart.position.set(6.2, 0, -30);
    W.add(cart);
    block(6.2, -30, 1.8, 1.2);

    // --- The Statue of Liberty across the water ---
    const lib = new T.Group();
    box(6, 4, 6, '#c9b99a', 0, 0, 0, lib);                    // pedestal
    box(4, 3, 4, '#bfae8d', 0, 4, 0, lib);
    const robe = new T.Mesh(new T.CylinderGeometry(0.9, 1.6, 7, 10), W.mat(C.liberty));
    robe.position.y = 10.5;
    lib.add(robe);
    ball(0.8, C.liberty, 0, 14.6, 0, lib);                    // head
    for (let k = 0; k < 7; k++) {                             // crown spikes
      const a = -Math.PI / 2 + (k - 3) * 0.4;
      const sp = new T.Mesh(new T.ConeGeometry(0.12, 0.9, 6), W.mat(C.liberty));
      sp.position.set(Math.cos(a) * 0.8, 15.3, Math.sin(a) * 0.8 + 0.2);
      sp.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8);
      lib.add(sp);
    }
    const arm = cyl(0.25, 3.4, C.liberty, 0.9, 13.4, 0, lib);  // raised arm with the torch
    arm.rotation.z = -0.2;
    cyl(0.3, 0.6, C.liberty, 1.55, 16.9, 0, lib);
    const flame = new T.Mesh(new T.ConeGeometry(0.35, 0.9, 10), new T.MeshBasicMaterial({ color: '#ffcc33' }));
    flame.position.set(1.55, 17.9, 0);
    lib.add(flame);
    box(0.9, 1.2, 0.3, '#6fae95', -0.9, 11, 0.9, lib);       // the book (tablet)
    lib.position.set(LIBERTY.x, 0, LIBERTY.z);
    lib.scale.setScalar(1.4);
    W.add(lib);
    const island = new T.Mesh(new T.CylinderGeometry(9, 10, 0.6, 20), W.mat('#7cc56b'));
    island.position.set(LIBERTY.x, 0.2, LIBERTY.z);
    W.add(island);
    W.clickable(lib, 'liberty');

    // --- Yellow taxis driving up and down the avenue ---
    S.cabs = [];
    for (let k = 0; k < 3; k++) {
      const cab = W.taxi(C.taxi);
      cab.rotation.y = k % 2 ? Math.PI / 2 : -Math.PI / 2;    // nose along the street
      const lane = k % 2 ? 2.3 : -2.3;
      cab.position.set(lane, 0, -10 - k * 20);
      S.cabs.push({ g: cab, dir: k % 2 ? 1 : -1, speed: 5 + k });
    }

    // --- The spider hero swinging on his web between the buildings ---
    const heroCanvas = document.createElement('canvas');
    heroCanvas.width = 96; heroCanvas.height = 150;
    S.heroCanvas = heroCanvas;
    S.heroTex = new T.CanvasTexture(heroCanvas);
    S.hero = new T.Sprite(new T.SpriteMaterial({ map: S.heroTex, transparent: true }));
    S.hero.scale.set(2 * 32 / 42, 2 * 50 / 42, 1);
    S.hero.center.set(0.5, 0.5);
    W.add(S.hero);
    S.hero.userData.spot = 'hero';
    W.clickables.push(S.hero);
    const webGeo = new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]);
    S.web = new T.Line(webGeo, new T.LineBasicMaterial({ color: '#ffffff' }));
    W.add(S.web);
    S.drawHero = (wave) => {
      const c = heroCanvas.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, 96, 150);
      c.setTransform(3, 0, 0, 3, 0, 0);
      MP.drawPerson(c, 16, 48, {
        character: 'boy', armUp: 1, walking: wave, walkTime: MP.time,
        outfit: { shirt: 'red', bottom: 'jeans', hat: 'none', costume: 'spider', shoes: true },
      });
      S.heroTex.needsUpdate = true;
    };

    // --- The yellow taxi from the airport ---
    S.taxi = W.taxi(C.taxi);
    S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
    block(TAXI_AT.x, TAXI_AT.z, 4, 2);
    W.clickable(S.taxi, 'taxi');
    cyl(0.08, 3, '#2b2b33', -5.5, 0, 4);
    W.sign('Broadway', -5.5, 2.8, 4, 0, '#2e8b57', '#ffffff', null, 2.6);
    block(-5.5, 4, 0.3, 0.3);

    // the hotel's entrance on the side of a skyscraper
    S.hotel = W.hotel(10, -5, -Math.PI / 2, { facadeOnly: true, d: 0, h: 0, awning: '#b22234', sign: 'HOTELLI' });
    // Mummi and Ukki live high up in the skyscraper on the left (grandparents.js)
    S.grandma = W.hotel(-10, -40, Math.PI / 2, { facadeOnly: true, d: 0, h: 0, awning: '#3c3b6e', glass: '#ffe9a0', sign: 'MUMMI & UKKI' });
    W.clickable(S.grandma.group, 'grandma');
    // the superheroes' headquarters (hq.js): only heroes may come in
    S.hq = W.hotel(10, -46, -Math.PI / 2, { facadeOnly: true, d: 0, h: 0, awning: '#d62828', glass: '#2b3350', door: '#2b2b33', sign: 'SPIDER HQ' });
    W.clickable(S.hq.group, 'hq');
    // a big spider logo over the door
    const logo = new T.Group();
    W.ball(0.45, '#d62828', 0, 0, 0, logo).scale.set(0.8, 1.2, 0.3);
    for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) {
      const leg = W.box(1, 0.08, 0.08, '#d62828', sd * 0.55, 0.45 - k * 0.3, 0, logo);
      leg.rotation.z = sd * (0.6 - k * 0.4);
    }
    logo.position.set(10 - 0.15, 4.8, -46);
    logo.rotation.y = -Math.PI / 2;
    W.add(logo);
    S.ch = W3.character(S.scene);
    S.built = true;
  }

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.newyork = {
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
      this.heroBubble = null;
      this.pizza = null;            // eating pizza: { bites }
      this.heroWaveAt = -10;
      S.taxi.position.set(TAXI_AT.x, 0, TAXI_AT.z);
      this.arrive = { t: 0 };
      S.ch.setVisible(false);
      // back from the superheroes' headquarters
      if (params && params.from === 'hq') {
        const d = S.hq.door;
        this.p = { x: d.x, z: d.z, heading: d.heading + Math.PI };
        this.camHeading = this.p.heading;
        this.arrive = null;
        S.ch.setVisible(true);
        this.say('Takaisin kadulla. Supersankari on valmiina seikkailuun!', 3, 0.5);
      }
      // back from Mummi and Ukki
      if (params && params.from === 'grandma') {
        const d = S.grandma.door;
        this.p = { x: d.x, z: d.z, heading: d.heading + Math.PI };
        this.camHeading = this.p.heading;
        this.arrive = null;
        S.ch.setVisible(true);
        this.say('Hei hei, Mummi ja Ukki! Olipa kiva kyläillä.', 3, 0.5);
      }
      // waking up in the hotel: out of the door, back to the trip
      if (params && params.from === 'hotel') {
        const d = S.hotel.door;
        this.p = { x: d.x, z: d.z, heading: d.heading + Math.PI };
        this.camHeading = this.p.heading;
        this.arrive = null;
        S.ch.setVisible(true);
        this.say('Hyvää huomenta, New York! Kaupunki on jo hereillä.', 3, 0.5);
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

    stand(spot) {
      if (spot === 'hotel') return S.hotel.door;
      if (spot === 'grandma') return S.grandma.door;
      if (spot === 'hq') return S.hq.door;
      if (spot === 'taxi') return { x: TAXI_AT.x - 1, z: TAXI_AT.z - 1.9 };
      if (spot === 'pizza') return { x: PIZZA.x + 1.6, z: PIZZA.z };
      if (spot === 'liberty') return { x: 0, z: BOUNDS.minZ + 0.5 };
      return null;
    },

    use(spot) {
      if (spot === 'hq') {
        const k = MP.heroKind();
        if (k !== 'spider' && k !== 'iron' && k !== 'panther') {
          this.say('Ovirobotti: Bip! Vain supersankareille! Hae sankariasu kotoa vaatekaapista.', 4);
          MP.sfx.boing();
          return;
        }
        const suit = MP.findItem('costume', MP.state.outfit.costume);
        this.scanAt = MP.time;
        this.say('Ovirobotti skannaa… Tunnistettu: ' + suit.name + '! Tervetuloa päämajaan!', 2.5);
        MP.sfx.bling();
        this.leaving = { t: 0, visit: true };
        setTimeout(() => { if (MP.scene === this) MP.goTo(MP.scenes.hq); }, 1500);
        return;
      }
      if (spot === 'grandma') {
        this.say('Täällä asuvat Mummi ja Ukki! Mennään kylään.', 2);
        MP.sfx.bling();
        this.leaving = { t: 0, visit: true };
        MP.goTo(MP.scenes.grandparents);
        return;
      }
      if (spot === 'hotel') {
        // the hotel: sleep one night here
        this.say('Hotelli! Mennään sisään.', 1.5);
        MP.sfx.bling();
        MP.goTo(MP.scenes.hotel, { country: 'newyork' });
        return;
      }
      if (spot === 'taxi') {
        this.leaving = { t: 0 };
        S.ch.setVisible(false);
        this.say('Taksi, lentokentälle kiitos!', 2.2);
        MP.sfx.bling();
      } else if (spot === 'pizza') {
        this.pizza = { bites: 0, from: MP.time };
        this.bubble = null;
        MP.sfx.bling();
      } else if (spot === 'liberty') {
        this.say('Vapaudenpatsas! Se pitää soihtua korkealla. Se on vihreä, koska kupari on vanhentunut.', 5);
        MP.sfx.tune();
      }
    },

    onTap(x, y) {
      if (this.arrive || this.leaving || MP.isFading()) return;
      // Eating pizza: tap the slice to take a bite
      if (this.pizza) {
        if (this.pizza.bites >= BITES) {
          if (MP.time - this.pizza.doneAt > 0.6) { this.pizza = null; this.say('Nam! Paras pizza ikinä!', 2.5); }
          return;
        }
        if (Math.hypot(x - 160, y - 92) < 60) {
          this.pizza.bites++;
          MP.sfx.nom();
          if (this.pizza.bites >= BITES) { this.pizza.doneAt = MP.time; MP.sfx.bling(); }
        }
        return;
      }
      if (W3.hitTurn(x, y)) {
        this.target = null;
        this.p.heading += Math.PI;
        MP.sfx.tap();
        return;
      }
      W3.tap(this, x, y, S.camera, S.W, BOUNDS, (spot) => {
        if (spot === 'hero') {
          this.heroWaveAt = MP.time;
          this.heroBubble = { text: 'Hei! Olen Spiderman! Tervetuloa New Yorkiin!', from: MP.time, until: Infinity };
          MP.sfx.boing();
          return true;
        }
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

      // --- Taxi arriving / leaving ---
      if (this.arrive) {
        this.arrive.t += dt;
        const u = MP.clamp(this.arrive.t / 2, 0, 1);
        S.taxi.position.x = TAXI_AT.x + 40 * (1 - u) * (1 - u);
        if (this.arrive.t > 2.3) {
          this.arrive = null;
          S.ch.setVisible(true);
          MP.sfx.bling();
          const poster = MP.collectPoster('newyork') ? ' Sain julisteen omaan huoneeseeni!' : '';
          this.say('New York! Valtavia pilvenpiirtäjiä ja keltaisia takseja! Katso ylös – joku heilahtaa talojen välissä!' + poster, 5);
        }
      }
      if (this.leaving && !this.leaving.visit) {
        this.leaving.t += dt;
        const t = Math.max(0, this.leaving.t - 0.8);
        S.taxi.position.x = TAXI_AT.x - t * t * 6;
        if (this.leaving.t > 2.6 && !this.leaving.gone) {
          this.leaving.gone = true;
          MP.goTo(MP.scenes.airport, { country: 'newyork' });
        }
      }

      if (!this.arrive && !this.leaving && !this.pizza) W3.walkStep(this, dt, SPEED, S.W.obstacles);
      else this.walking = false;

      // --- Yellow taxis drive and come back around ---
      for (const cab of S.cabs) {
        cab.g.position.z += cab.dir * cab.speed * dt;
        if (cab.g.position.z < -64) cab.g.position.z = 8;
        if (cab.g.position.z > 8) cab.g.position.z = -64;
      }
      // --- The spider hero swings back and forth across the street ---
      const sw = Math.sin(now * 0.9);
      const anchor = new W3.T.Vector3(0, HERO.anchorY, HERO.z - 4);
      const len = 11;
      const ang = sw * 0.9;
      const hx = anchor.x + Math.sin(ang) * len * 0.55;
      const hy = anchor.y - Math.cos(ang) * len * 0.75;
      const hz = HERO.z + Math.cos(now * 0.45) * 3;
      S.hero.position.set(hx, hy, hz);
      S.web.geometry.setFromPoints([anchor, new W3.T.Vector3(hx, hy + 0.7, hz)]);
      S.drawHero(now - this.heroWaveAt < 2);
      // --- Billboards flash, water glitters ---
      S.boards.forEach((b, k) => { b.material.color.setScalar(0.85 + Math.sin(now * 3 + k) * 0.15); });
      S.waves.forEach((w, k) => { w.scale.x = 0.7 + Math.sin(now * 2 + k) * 0.3; });

      // --- Arriving at places (said once) ---
      if (!this.arrive) {
        for (const [id, pl] of Object.entries(PLACES)) {
          if (!this.seen[id] && Math.hypot(p.x - pl.x, p.z - pl.z) < pl.r) {
            this.seen[id] = true;
            if (id === 'pizza') this.say('Pizzeria! New Yorkissa syödään isoja pizzapaloja. Napauta pizzeriaa!', 4);
            if (id === 'hero') this.say('Spiderman heilahtaa seitillä! Napauta häntä!', 3.5);
            if (id === 'water') this.say('Tuolla on Vapaudenpatsas! Napauta sitä.', 3.5);
            if (id === 'hq') this.say('Supersankarien päämaja! Sisään pääsee vain sankariasussa.', 3.5);
            if (id === 'grandma') this.say('Tässä pilvenpiirtäjässä asuvat Mummi ja Ukki! Napauta ovea.', 3.5);
          }
        }
      }

      W3.follow(S.camera, this, dt);
      this.headPos = S.ch.draw(p.x, 0, p.z, { walking: this.walking, walkTime: this.walkTime });
      if (this.leaving || this.arrive) this.headPos = S.taxi.position.clone().setY(2.6);
      W3.render(S.scene, S.camera);
    },

    drawPizza(ctx) {
      const t = MP.time;
      const z = this.pizza;
      const a = MP.clamp((t - z.from) * 4, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(40,20,10,0.55)';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.translate(160, 92);
      ctx.scale(2.4, 2.4);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = MP.COLORS.outline;
      ctx.lineJoin = 'round';
      const left = 1 - z.bites / BITES;
      // a big slice: crust at the top, tip at the bottom; bites come from the tip
      ctx.save();
      ctx.beginPath();
      const tipY = 26 - (1 - left) * 34;
      ctx.rect(-30, -30, 60, tipY + 30);
      ctx.clip();
      ctx.beginPath(); ctx.moveTo(-20, -20); ctx.lineTo(20, -20); ctx.lineTo(0, 26); ctx.closePath();
      ctx.fillStyle = '#ffd766'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d33a2a';
      for (const [px, py] of [[-8, -12], [6, -10], [-2, -2], [3, 6], [-10, -16], [11, -15], [0, 13]]) {
        ctx.beginPath(); ctx.arc(px, py, 2.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = '#2e8b57';
      for (const [px, py] of [[-4, -15], [9, -4], [-5, 4]]) { ctx.beginPath(); ctx.ellipse(px, py, 1.4, 0.8, 0.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      if (left > 0 && z.bites > 0) {
        // the bite marks
        ctx.fillStyle = 'rgba(40,20,10,0.55)';
        for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.arc(k * 3.2 * left, tipY, 2.2, 0, Math.PI * 2); ctx.fill(); }
      }
      // the crust
      ctx.fillStyle = '#c98a3a';
      MP.roundRect(ctx, -22, -24, 44, 6, 3); ctx.fill(); ctx.stroke();
      ctx.restore();
      const done = z.bites >= BITES;
      MP.drawText(ctx, done ? 'Nam! Pizza syöty!' : 'Napauta pizzaa, niin haukkaat!', MP.W / 2, 8, {
        size: 1.3, color: done ? '#ffe680' : '#ffffff', outline: MP.COLORS.outline, align: 'center',
      });
      if (done) MP.drawText(ctx, '(napauta)', MP.W / 2, 166, { size: 0.7, color: '#ffffff', align: 'center' });
    },

    draw(ctx) {
      if (this.pizza) { this.drawPizza(ctx); return; }
      // the door robot's red scanning laser
      const sc = MP.time - (this.scanAt || -9);
      if (sc < 1.4) {
        const y = 20 + (Math.sin(sc * 6) * 0.5 + 0.5) * 140;
        ctx.save();
        ctx.fillStyle = 'rgba(255,40,40,0.75)';
        ctx.fillRect(0, y, MP.W, 2);
        ctx.fillStyle = 'rgba(255,40,40,0.15)';
        ctx.fillRect(0, y - 6, MP.W, 14);
        ctx.restore();
      }
      W3.drawBubble(ctx, this.bubble, this.headPos, S.camera);
      const hb = this.heroBubble;
      if (hb && MP.time >= hb.from) {
        W3.drawBubble(ctx, hb, S.hero.position.clone().setY(S.hero.position.y + 1.2), S.camera);
      }
      if (!this.arrive && !this.leaving) W3.drawTurnButton(ctx);
    },
  };
})();
