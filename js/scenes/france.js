// france.js – RANSKA (France, Paris)! The Eiffel Tower, croissants and a mime.
// Things to do:
//   the Eiffel Tower: ride the lift to the top – it is so windy that your hat
//     flies round and round the tower;
//   the bakery: a croissant as long as your arm, and a baguette sword fight
//     with the baker ("En garde!");
//   a mime in a striped shirt who copies you, then gets stuck in an invisible box;
//   paintings in the park: a portrait that winks, a painted cat that jumps out;
//   a very smelly cheese at the market; a boat trip on the river.
// The first visit gives a beret for the wardrobe. Made with the country kit.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const C = {
    sky: '#a9d4f2',
    plaza: '#d6ccb4',
    iron: '#8a6a4a',
    blue: '#0055a4',
    red: '#ef4135',
    river: '#4a8ab8',
  };

  const EIFFEL = { x: 0, z: -26 };
  const BAKERY = { x: 18, z: -10 };
  const MIME = { x: -6, z: -8 };
  const ART = { x: -18, z: -12 };
  const CHEESE = { x: 12, z: 0 };
  const RIVER_Z = -42;
  const BOAT_AT = { x: -8, z: RIVER_Z };
  const TOP = 18;                    // how high the lift goes

  MP.LANDSCAPES = MP.LANDSCAPES || {};
  MP.LANDSCAPES.france = function (c, r, horizon, k, wrap, sx) {
    const g = c.createLinearGradient(0, r.y, 0, horizon);
    g.addColorStop(0, '#8fc8ec'); g.addColorStop(1, '#f2eef0');
    c.fillStyle = g;
    c.fillRect(r.x, r.y, r.w, r.h);
    MP.draw('sun', c, 0, 0, { x: r.x + r.w * 0.85, y: r.y + r.h * 0.16, r: 8 * k + 2 });
    // pale houses with grey roofs
    for (let i = 0; i < 10; i++) {
      const x = wrap(r.x + i * 36 + sx(0.5)), h = (18 + (i % 3) * 5) * k;
      c.fillStyle = '#efe4cc'; c.fillRect(x, horizon - h, 30 * k, h);
      c.fillStyle = '#7d8696'; c.fillRect(x - 1 * k, horizon - h - 5 * k, 32 * k, 5 * k);
    }
    // the Eiffel Tower
    const ex = wrap(r.x + r.w * 0.5 + sx(0.4));
    c.strokeStyle = '#8a6a4a'; c.lineWidth = 1.6 * k;
    c.beginPath();
    c.moveTo(ex - 14 * k, horizon); c.quadraticCurveTo(ex - 4 * k, horizon - 30 * k, ex, horizon - 62 * k);
    c.moveTo(ex + 14 * k, horizon); c.quadraticCurveTo(ex + 4 * k, horizon - 30 * k, ex, horizon - 62 * k);
    c.moveTo(ex - 9 * k, horizon - 16 * k); c.lineTo(ex + 9 * k, horizon - 16 * k);
    c.moveTo(ex - 5 * k, horizon - 34 * k); c.lineTo(ex + 5 * k, horizon - 34 * k);
    c.stroke();
    c.beginPath(); c.arc(ex, horizon, 8 * k, Math.PI, 0); c.stroke();
    c.fillStyle = '#4a8ab8';
    c.fillRect(r.x, horizon, r.w, 6 * k);
    c.fillStyle = '#d6ccb4';
    c.fillRect(r.x, horizon + 6 * k, r.w, r.y + r.h - horizon);
  };

  function smellTex() {
    const T = window.THREE;
    const c = document.createElement('canvas');
    c.width = 64; c.height = 128;
    const g = c.getContext('2d');
    g.strokeStyle = '#7bd389'; g.lineWidth = 6;
    for (const x0 of [14, 32, 50]) {
      g.beginPath();
      for (let y = 120; y > 4; y -= 4) g.lineTo(x0 + Math.sin(y / 12) * 6, y);
      g.stroke();
    }
    return new T.CanvasTexture(c);
  }

  MP.makeCountry({
    id: 'france', name: 'Ranska', to: 'Ranskaan', city: 'Pariisi', time: '07:35',
    land: 'france',
    flag(c, x, y, w, h) {
      c.fillStyle = '#0055a4'; c.fillRect(x, y, w / 3, h);
      c.fillStyle = '#ffffff'; c.fillRect(x + w / 3, y, w / 3 + 0.2, h);
      c.fillStyle = '#ef4135'; c.fillRect(x + w * 2 / 3, y, w / 3, h);
    },
    sky: C.sky,
    ground: C.plaza,
    fog: ['#f2eef0', 60, 190],
    hemiGround: 0xd6ccb4,
    bounds: { minX: -28, maxX: 28, minZ: -39, maxZ: 10 },
    car: { at: { x: 5.5, z: 6.5 }, color: '#4a78c8', name: 'Taksi' },
    sign: { text: 'Ranska', x: -3, z: 1 },
    hotel: {
      x: 26, z: 4, rot: -Math.PI / 2,
      look: { wall: '#efe4cc', trim: '#7d8696', awning: C.red, sign: 'HOTELLI' },
      room: {
        name: 'Hotelli Croissant', wall: '#f6eef2', border: C.blue, floor: '#a0703c',
        blanket: C.blue, rug: C.red,
        hello: 'Hotelli Croissant! Ikkunasta näkyy Eiffel-torni. Napauta sänkyä, niin mennään nukkumaan.',
      },
    },
    airport: { title: 'PARIISIN LENTOKENTTÄ', hall: '#f4f0ee', floor: '#d6cec6', plant: 'leafy' },
    photo: { name: 'Ranska', sticker: '🥐' },
    poster: { say: 'Juliste Ranskasta! Eiffel-torni ja joki.' },
    stamp: {
      ink: '#0055a4',
      pic(c) {   // the Eiffel Tower
        c.beginPath(); c.moveTo(-7, 8); c.quadraticCurveTo(-2, -2, 0, -10); c.quadraticCurveTo(2, -2, 7, 8); c.stroke();
        c.beginPath(); c.moveTo(-4.5, 2); c.lineTo(4.5, 2); c.moveTo(-2.4, -4); c.lineTo(2.4, -4); c.stroke();
        c.beginPath(); c.arc(0, 8, 3.6, Math.PI, 0); c.stroke();
      },
    },
    welcome: 'Bonjour! Tervetuloa Ranskaan! Tuolla on Eiffel-torni!',
    morning: 'Bonjour! Hyvää huomenta, Pariisi!',
    onArrive() {
      const gifts = (MP.state.treasures.gifts = MP.state.treasures.gifts || {});
      if (gifts.beret) return '';
      gifts.beret = true;
      MP.save();
      return ' Ja sain baskerin! Se on nyt vaatekaapissa.';
    },

    // -------------------------------------------------------------------------
    build(W, S, T) {
      const { box, cyl, ball, flat, block } = W;

      // --- The river at the back, with a little boat ---
      flat(400, 8, C.river, 0, RIVER_Z, 0.03);
      flat(400, 1, '#b8b0a0', 0, RIVER_Z + 4.4, 0.02);
      S.boat = new T.Group();
      box(1.6, 0.6, 4.4, '#ffffff', 0, 0, 0, S.boat);
      box(1.4, 0.7, 2, C.blue, 0, 0.6, 0.4, S.boat);
      box(1.6, 0.12, 4.4, C.red, 0, 0.55, 0, S.boat);
      S.boat.position.set(BOAT_AT.x, 0, BOAT_AT.z);
      S.boat.rotation.y = Math.PI / 2;
      W.add(S.boat);
      W.clickable(S.boat, 'boat');

      // --- The Eiffel Tower ---
      const et = new T.Group();
      const legGeo = new T.CylinderGeometry(0.25, 0.5, 12, 6);
      for (const [lx, lz] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) {
        const leg = new T.Mesh(legGeo, W.mat(C.iron));
        leg.position.set(lx * 0.62, 5.6, lz * 0.62);
        leg.rotation.z = -lx * 0.055;
        leg.rotation.x = lz * 0.055;
        et.add(leg);
      }
      box(7, 0.6, 7, C.iron, 0, 6, 0, et);                       // first floor
      const mid = new T.Mesh(new T.CylinderGeometry(0.9, 2.4, 9, 4), W.mat(C.iron));
      mid.rotation.y = Math.PI / 4;
      mid.position.y = 11;
      et.add(mid);
      box(3.4, 0.5, 3.4, C.iron, 0, 15.2, 0, et);                // second floor
      const top = new T.Mesh(new T.CylinderGeometry(0.2, 0.9, 9, 4), W.mat(C.iron));
      top.rotation.y = Math.PI / 4;
      top.position.y = 20;
      et.add(top);
      cyl(0.06, 3, '#d8dde6', 0, 24.4, 0, et);
      // arches between the legs
      for (let i = 0; i < 4; i++) {
        const arch = new T.Mesh(new T.TorusGeometry(2.6, 0.18, 6, 12, Math.PI), W.mat(C.iron));
        arch.position.set(0, 3.2, 0);
        arch.rotation.y = i * Math.PI / 2;
        arch.translateZ(2.5);
        et.add(arch);
      }
      // the lift (a little red box that goes up and down)
      S.lift = box(1, 1.4, 1, C.red, 2.6, 0, 2.6, et);
      et.position.set(EIFFEL.x, 0, EIFFEL.z);
      W.add(et);
      for (const [lx, lz] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) block(EIFFEL.x + lx, EIFFEL.z + lz, 1.2, 1.2);
      W.clickable(et, 'eiffel');
      // the hat that flies round the tower (shown only then)
      S.flyHat = new T.Group();
      const hatTop = ball(0.35, '#e04848', 0, 0, 0, S.flyHat); hatTop.scale.y = 0.6;
      const brim = cyl(0.55, 0.06, '#a83232', 0, -0.05, 0, S.flyHat); void brim;
      S.flyHat.visible = false;
      W.add(S.flyHat);

      // --- The bakery ---
      const bk = new T.Group();
      box(7, 4.2, 4, '#efe4cc', 0, 0, 0, bk);
      box(7.4, 0.5, 4.4, '#7d8696', 0, 4.2, 0, bk);
      box(4, 1.6, 0.1, '#bfe6ff', 0, 1, 2.02, bk);
      for (let i = 0; i < 5; i++) box(0.9, 0.5, 1.4, i % 2 ? C.blue : '#ffffff', -2.4 + i * 1.2, 2.8, 2.6, bk);   // the striped awning
      const bSign = W.sign('LEIPOMO', 0, 3.6, 2.08, 0, '#ffffff', C.blue, null, 3);
      S.scene.remove(bSign); bk.add(bSign);
      bk.position.set(BAKERY.x, 0, BAKERY.z);
      bk.rotation.y = -Math.PI / 2;
      W.add(bk);
      block(BAKERY.x, BAKERY.z, 4, 7);
      W.clickable(bk, 'bakery');
      // the baker with a baguette (for the sword fight)
      S.baker = new T.Group();
      cyl(0.35, 1.1, '#ffffff', 0, 0, 0, S.baker);
      ball(0.32, '#f6cfa8', 0, 1.4, 0, S.baker);
      cyl(0.32, 0.5, '#ffffff', 0, 1.6, 0, S.baker, 0.4);           // the tall baker's hat
      S.bakerArm = new T.Group();
      const bag = cyl(0.08, 1.4, '#d8a050', 0, 0, 0, S.bakerArm); bag.rotation.z = Math.PI / 2; bag.position.set(0.7, 0, 0);
      S.bakerArm.position.set(0.3, 0.9, 0.2);
      S.baker.add(S.bakerArm);
      S.baker.position.set(BAKERY.x - 3, 0, BAKERY.z + 1.5);
      S.baker.rotation.y = -Math.PI / 2;
      W.add(S.baker);
      block(BAKERY.x - 3, BAKERY.z + 1.5, 0.7, 0.7);
      W.clickable(S.baker, 'bakery');
      // the long croissant (appears in your hands)
      S.croissant = new T.Group();
      const cr = new T.Mesh(new T.TorusGeometry(0.5, 0.16, 8, 12, Math.PI), W.mat('#e0a04a'));
      cr.scale.set(1.6, 1, 1);
      S.croissant.add(cr);
      S.croissant.visible = false;
      W.add(S.croissant);

      // --- The mime ---
      S.mime = new T.Group();
      const body = cyl(0.3, 1.1, '#ffffff', 0, 0, 0, S.mime); void body;
      for (let i = 0; i < 4; i++) cyl(0.31, 0.1, '#1b1b2a', 0, 0.15 + i * 0.25, 0, S.mime);
      ball(0.3, '#ffffff', 0, 1.4, 0, S.mime);
      ball(0.05, '#1b1b2a', -0.1, 1.45, 0.27, S.mime);
      ball(0.05, '#1b1b2a', 0.1, 1.45, 0.27, S.mime);
      ball(0.05, '#e04848', 0, 1.3, 0.29, S.mime);
      const beret = ball(0.28, '#1b1b2a', 0.05, 1.66, 0, S.mime); beret.scale.set(1.1, 0.35, 1.1);
      S.mimeArms = [];
      for (const k of [-1, 1]) {
        const arm = new T.Group();
        const a = cyl(0.07, 0.6, '#ffffff', 0, -0.6, 0, arm); void a;
        ball(0.09, '#ffffff', 0, -0.62, 0, arm);
        arm.position.set(k * 0.35, 1.05, 0);
        S.mime.add(arm);
        S.mimeArms.push(arm);
      }
      S.mime.position.set(MIME.x, 0, MIME.z);
      W.add(S.mime);
      block(MIME.x, MIME.z, 0.7, 0.7);
      W.clickable(S.mime, 'mime');
      S.mimeStep = 0;
      S.mimeAt = -99;

      // --- Paintings in the park (on easels) ---
      S.paintings = [];
      const portraitTex = (() => {
        const c = document.createElement('canvas'); c.width = 128; c.height = 160;
        const g = c.getContext('2d');
        g.fillStyle = '#6b8a5a'; g.fillRect(0, 0, 128, 160);
        g.fillStyle = '#3a2a1a'; g.beginPath(); g.ellipse(64, 70, 34, 44, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#f2d2b0'; g.beginPath(); g.ellipse(64, 74, 24, 30, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#3a2a1a'; g.fillRect(48, 66, 8, 4);
        g.strokeStyle = '#8a3a2a'; g.lineWidth = 3; g.beginPath(); g.arc(64, 88, 9, 0.2, Math.PI - 0.2); g.stroke();
        g.fillStyle = '#4a3a6a'; g.fillRect(28, 112, 72, 48);
        return new T.CanvasTexture(c);
      })();
      const catTex = (() => {
        const c = document.createElement('canvas'); c.width = 128; c.height = 160;
        const g = c.getContext('2d');
        g.fillStyle = '#ffd23f'; g.fillRect(0, 0, 128, 160);
        g.fillStyle = '#ff8fc0'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(20 + i * 18, 140 - (i % 2) * 10, 8, 0, Math.PI * 2); g.fill(); }
        return new T.CanvasTexture(c);
      })();
      [[portraitTex, 'portrait'], [catTex, 'catPic']].forEach(([tex, kind], i) => {
        const g = new T.Group();
        for (const lx of [-0.5, 0.5]) { const leg = cyl(0.05, 2.2, '#8a5a32', lx, 0, -0.2, g); leg.rotation.x = -0.15; }
        box(1.7, 2.1, 0.1, '#c8913a', 0, 1.6, 0, g);
        const pic = new T.Mesh(new T.PlaneGeometry(1.4, 1.8), new T.MeshBasicMaterial({ map: tex }));
        pic.position.set(0, 2.65, 0.06);
        g.add(pic);
        g.position.set(ART.x + i * 3.2, 0, ART.z);
        g.rotation.y = 0.3;
        W.add(g);
        block(ART.x + i * 3.2, ART.z, 1.4, 0.8);
        W.clickable(g, kind);
        S.paintings.push(g);
      });
      // the portrait's eye that winks (a little patch over the right eye)
      S.wink = box(0.18, 0.06, 0.02, '#3a2a1a', 0.14, 2.86, 0.08, S.paintings[0]);
      S.eyeOpen = box(0.1, 0.06, 0.02, '#3a2a1a', 0.14, 2.86, 0.08, S.paintings[0]);
      S.wink.visible = false;
      // the painted cat that jumps out of its frame
      S.paintCat = new T.Group();
      const cb = ball(0.3, '#e07a3a', 0, 0, 0, S.paintCat); cb.scale.set(1.4, 0.8, 0.8);
      ball(0.2, '#e07a3a', 0.4, 0.2, 0, S.paintCat);
      for (const k of [-1, 1]) { const ear = new T.Mesh(new T.ConeGeometry(0.07, 0.15, 4), W.mat('#e07a3a')); ear.position.set(0.42, 0.42, k * 0.1); S.paintCat.add(ear); }
      W.add(S.paintCat);
      S.catAt = -99;
      S.winkAt = -99;

      // --- The cheese stall with a VERY smelly cheese ---
      const ch = new T.Group();
      box(2.6, 1, 1.2, '#a0703c', 0, 0, 0, ch);
      const wheel = cyl(0.5, 0.4, '#f2d26a', -0.5, 1, 0, ch); void wheel;
      const wedge = box(0.5, 0.35, 0.4, '#e8c45a', 0.6, 1, 0, ch); void wedge;
      box(3, 0.1, 1.6, '#ffffff', 0, 2.1, 0, ch);
      for (const sx of [-1.3, 1.3]) cyl(0.05, 2.1, '#8a5a32', sx, 0, 0.6, ch);
      ch.position.set(CHEESE.x, 0, CHEESE.z);
      W.add(ch);
      block(CHEESE.x, CHEESE.z, 2.8, 1.4);
      W.clickable(ch, 'cheese');
      S.smell = new T.Sprite(new T.SpriteMaterial({ map: smellTex(), transparent: true }));
      S.smell.scale.set(1, 2, 1);
      S.smell.position.set(CHEESE.x - 0.4, 2.2, CHEESE.z);
      W.add(S.smell);
      S.smellAt = -99;
    },

    spots: {
      eiffel: {
        at: () => ({ x: EIFFEL.x + 2.6, z: EIFFEL.z + 4.2 }),
        use(sc, S) {
          sc.tower = { t: 0, hat: MP.state.outfit.hat };
          sc.frozen = true;
          sc.target = null;
          sc.p.heading = Math.PI;      // look out over the city
          sc.say('Hissillä Eiffel-tornin huipulle! Ylös, ylös, ylös…', 3);
          MP.sfx.bling();
        },
      },
      bakery: {
        at: () => ({ x: BAKERY.x - 4.6, z: BAKERY.z + 2.6 }),
        use(sc, S) {
          S.bakeryStep = (S.bakeryStep || 0) % 2 + 1;
          S.bakeryAt = MP.time;
          if (S.bakeryStep === 1) {
            sc.say('Croissant! Se on yhtä pitkä kuin minun käteni! Nam, voinen ja rapea.', 4);
            MP.sfx.nom();
          } else {
            sc.say('Leipuri ottaa patongin: "En garde!" Patonkimiekkailu! Kops kops!', 4);
            for (let i = 0; i < 5; i++) setTimeout(() => { if (MP.scene === MP.scenes.france) MP.sfx.tap(); }, i * 350);
          }
        },
      },
      mime: {
        at: () => ({ x: MIME.x + 1.8, z: MIME.z + 1.8 }),
        use(sc, S) {
          S.mimeStep = S.mimeStep % 3 + 1;
          S.mimeAt = MP.time;
          if (S.mimeStep === 1) { sc.say('Pantomiimitaiteilija matkii kaikkea mitä teen! Vilkutan – hän vilkuttaa!', 4); sc.pose = { armUp: 0.9 }; sc.poseUntil = MP.time + 2; }
          if (S.mimeStep === 2) { sc.say('Voi ei, hän on jumissa näkymättömässä laatikossa! Seinät joka puolella!', 4); }
          if (S.mimeStep === 3) { sc.say('Autan hänet ulos laatikosta… Vapaa! Hän kumartaa kiitokseksi.', 4); MP.sfx.bling(); }
        },
      },
      portrait: {
        at: () => ({ x: ART.x + 0.6, z: ART.z + 2.4 }),
        use(sc, S) {
          S.winkAt = MP.time;
          sc.say('Taulun nainen… iski silmää! Näitkö?', 3);
          MP.sfx.tune();
        },
      },
      catPic: {
        at: () => ({ x: ART.x + 3.6, z: ART.z + 2.4 }),
        use(sc, S) {
          S.catAt = MP.time;
          sc.say('Maalattu kissa hyppäsi ulos taulusta! Miau! … ja takaisin sisään.', 4);
          MP.sfx.meow();
        },
      },
      cheese: {
        at: () => ({ x: CHEESE.x, z: CHEESE.z - 1.9 }),
        use(sc, S) {
          S.smellAt = MP.time;
          sc.pose = { eyes: 'closed', mouth: 'flat' };
          sc.poseUntil = MP.time + 2.5;
          sc.say('Ranskalaista juustoa… HUH, mikä haju! Nenästä kiinni!', 3.5);
          MP.sfx.boing();
        },
      },
      boat: {
        at: () => ({ x: BOAT_AT.x + 1, z: RIVER_Z + 4 }),
        use(sc, S) {
          sc.boatRide = { t: 0 };
          sc.frozen = true;
          sc.target = null;
          sc.say('Veneretki joella! Ohi menee siltoja ja vanhoja taloja.', 4);
          MP.sfx.flush();
        },
      },
    },

    hints: [
      { x: EIFFEL.x + 2.6, z: EIFFEL.z + 5, r: 4.5, say: 'Eiffel-torni! Napauta sitä, niin mennään hissillä ylös.' },
      { x: BAKERY.x - 4.6, z: BAKERY.z + 2.6, r: 3.2, say: 'Leipomo! Napauta sitä.' },
      { x: MIME.x + 1.6, z: MIME.z + 1.6, r: 3.2, say: 'Pantomiimitaiteilija! Napauta häntä.' },
      { x: ART.x + 2, z: ART.z + 2.6, r: 3.5, say: 'Tauluja puistossa! Napauta niitä.' },
    ],

    enter(sc, S) {
      sc.tower = null; sc.boatRide = null; sc.frozen = false; sc.y = 0; sc.camLift = 0; sc.pose = null;
      S.mimeStep = 0; S.bakeryStep = 0;
      S.flyHat.visible = false;
      S.boat.position.set(BOAT_AT.x, 0, BOAT_AT.z);
    },

    update(sc, S, dt, now) {
      if (sc.pose && sc.poseUntil && now > sc.poseUntil) { sc.pose = null; sc.poseUntil = 0; }

      // --- Up the Eiffel Tower in the lift ---
      const tw = sc.tower;
      if (tw) {
        tw.t += dt;
        const up = tw.t < 3 ? tw.t / 3 : tw.t < 9 ? 1 : Math.max(0, 1 - (tw.t - 9) / 2.5);
        const h = up * up * (3 - 2 * up) * TOP;
        sc.y = h;
        sc.camLift = h;
        S.lift.position.y = h + 0.7;
        if (tw.t > 3 && !tw.windy) {
          tw.windy = true;
          if (tw.hat && tw.hat !== 'none') {
            MP.state.outfit.hat = 'none';
            S.flyHat.visible = true;
            sc.say('Huipulla tuulee niin kovaa, että hattu lentää tornin ympäri! Hei, odota!', 4);
          } else {
            sc.say('Huipulla tuulee niin kovaa, että tukka hulmuaa! Koko Pariisi näkyy!', 4);
          }
          MP.sfx.thwip();
        }
        if (S.flyHat.visible) {
          const a = (tw.t - 3) * 2;
          S.flyHat.position.set(EIFFEL.x + Math.cos(a) * 4, TOP + 1 + Math.sin(a * 2) * 0.8, EIFFEL.z + Math.sin(a) * 4);
          S.flyHat.rotation.set(a, a * 2, 0);
          if (tw.t > 8.2) {
            S.flyHat.visible = false;
            MP.state.outfit.hat = tw.hat;
            sc.say('Kopp! Sain hatun kiinni. Nyt alas.', 2.5);
            MP.sfx.bling();
          }
        }
        if (tw.t > 11.5) {
          sc.tower = null; sc.frozen = false; sc.y = 0; sc.camLift = 0;
          if (tw.hat) MP.state.outfit.hat = tw.hat;
          S.lift.position.y = 0.7;
        }
      }

      // --- The boat trip ---
      const br = sc.boatRide;
      if (br) {
        br.t += dt;
        const u = MP.clamp(br.t / 8, 0, 1);
        const x = BOAT_AT.x + Math.sin(u * Math.PI) * 24;
        S.boat.position.set(x, Math.sin(now * 2) * 0.05, RIVER_Z);
        sc.p.x = x; sc.p.z = RIVER_Z;
        sc.p.heading = u < 0.5 ? Math.PI / 2 : -Math.PI / 2;
        sc.y = 0.6;
        if (br.t > 8) {
          sc.boatRide = null; sc.frozen = false; sc.y = 0;
          sc.p.z = RIVER_Z + 4.2;
          S.boat.position.set(BOAT_AT.x, 0, BOAT_AT.z);
          sc.say('Kiitos veneretkestä!', 2.5);
        }
      }

      // --- The bakery: the croissant in my hands, the baker's baguette ---
      const bu = now - (S.bakeryAt || -99);
      S.croissant.visible = S.bakeryStep === 1 && bu < 4;
      if (S.croissant.visible) S.croissant.position.set(sc.p.x, 1, sc.p.z + 0.3);
      S.bakerArm.rotation.z = S.bakeryStep === 2 && bu < 2 ? Math.sin(bu * 14) * 0.8 : 0;
      if (S.bakeryStep === 2 && bu < 2) sc.pose = { armUp: 0.5 + Math.abs(Math.sin(bu * 14)) * 0.5 };
      else if (S.bakeryStep === 2 && bu < 2.2) sc.pose = null;

      // --- The mime ---
      const mu = now - S.mimeAt;
      const [l, r] = S.mimeArms;
      if (S.mimeStep === 1 && mu < 3) {
        l.rotation.z = 0; r.rotation.z = -2.5 + Math.sin(mu * 12) * 0.3;          // waving
      } else if (S.mimeStep === 2) {
        // hands flat on the invisible walls
        const push = Math.sin(now * 3) * 0.15;
        l.rotation.set(-1.6 + push, 0, 0.3); r.rotation.set(-1.6 - push, 0, -0.3);
        S.mime.position.x = MIME.x + Math.sin(now * 2) * 0.1;
      } else if (S.mimeStep === 3 && mu < 2) {
        l.rotation.set(0, 0, 0); r.rotation.set(0, 0, 0);
        S.mime.rotation.x = Math.sin(MP.clamp(mu / 1.5, 0, 1) * Math.PI) * 0.5;   // a bow
      } else {
        l.rotation.set(0, 0, 0); r.rotation.set(0, 0, 0);
        S.mime.rotation.x = 0;
        S.mime.position.x = MIME.x;
      }

      // --- The paintings ---
      const wk = now - S.winkAt < 1.2;
      S.wink.visible = wk; S.eyeOpen.visible = !wk;
      const cu = now - S.catAt;
      const p0 = S.paintings[1].position;
      if (cu < 2.4) {
        const k = cu < 1.2 ? cu / 1.2 : (2.4 - cu) / 1.2;
        S.paintCat.visible = true;
        S.paintCat.position.set(p0.x + k * 1.6, 2.6 - k * 2 + Math.sin(k * Math.PI) * 1.2, p0.z + 0.3 + k * 1.2);
      } else {
        S.paintCat.visible = true;
        S.paintCat.position.set(p0.x, 2.6, p0.z + 0.1);
      }

      // --- The cheese smell ---
      const su = now - S.smellAt;
      S.smell.material.opacity = su < 3 ? 1 : 0.35;
      S.smell.scale.set(1 + (su < 3 ? Math.sin(now * 6) * 0.2 : 0), su < 3 ? 2.6 : 1.6, 1);
    },
  });
})();
