// belgium.js – BELGIA (Belgium)! Chocolate, waffles and fancy golden houses.
// Things to do:
//   the chocolate factory with a chocolate river: fill a box with chocolates –
//   but some go into your mouth ("Mums!") and you get a chocolate moustache;
//   a waffle tower: stack waffles with strawberries and cream until… SPLAT!;
//   a little fountain statue that squirts water at you; an accordion player;
//   a big comic painted on a house wall; and a market stall with Brussels
//   sprouts ("Yäk!"). Made with the country kit (country3d.js).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const C = {
    sky: '#a9d2f0',
    cobble: '#bdb6a8',
    brick: '#b8643a',
    gold: '#e8b830',
    choco: '#5a3418',
    chocoLight: '#8a5a32',
  };

  const FACTORY = { x: 18, z: -16 };
  const WAFFLE = { x: -9, z: -12 };
  const FOUNTAIN = { x: 4, z: -22 };
  const MUSICIAN = { x: -3, z: -6 };
  const SPROUTS = { x: -16, z: -2 };
  const COMIC = { x: -22, z: -20 };
  const BOX_SIZE = 6;
  const SONG = [392, 523, 494, 523, 587, 523, 494, 440, 392, 440, 494, 392];

  MP.LANDSCAPES = MP.LANDSCAPES || {};
  MP.LANDSCAPES.belgium = function (c, r, horizon, k, wrap, sx) {
    const g = c.createLinearGradient(0, r.y, 0, horizon);
    g.addColorStop(0, '#8fc4ec'); g.addColorStop(1, '#eef4f8');
    c.fillStyle = g;
    c.fillRect(r.x, r.y, r.w, r.h);
    MP.draw('sun', c, 0, 0, { x: r.x + r.w * 0.85, y: r.y + r.h * 0.15, r: 8 * k + 2 });
    // a row of tall houses with stepped gables and gold
    for (let i = 0; i < 9; i++) {
      const x = wrap(r.x + i * 40 + sx(0.5)), w = 30 * k, h = (40 + (i % 3) * 10) * k;
      c.fillStyle = ['#c98a55', '#e8d6a8', '#b8643a', '#d6c8a8'][i % 4];
      c.fillRect(x, horizon - h, w, h);
      for (let s = 0; s < 3; s++) c.fillRect(x + s * 4 * k, horizon - h - (s + 1) * 4 * k, w - s * 8 * k, 4 * k);
      c.fillStyle = '#e8b830';
      c.fillRect(x, horizon - h, w, 2 * k);
      c.fillStyle = '#4a6a8a';
      for (let wy = horizon - h + 6 * k; wy < horizon - 6 * k; wy += 10 * k) { c.fillRect(x + 5 * k, wy, 6 * k, 6 * k); c.fillRect(x + 18 * k, wy, 6 * k, 6 * k); }
    }
    c.fillStyle = '#bdb6a8';
    c.fillRect(r.x, horizon, r.w, r.y + r.h - horizon);
    // a waffle
    const wx = wrap(r.x + r.w * 0.3 + sx(1));
    c.fillStyle = '#e0a84a';
    c.fillRect(wx, horizon + 8 * k, 18 * k, 12 * k);
    c.strokeStyle = '#b87a2a'; c.lineWidth = 1 * k;
    for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(wx + i * 4.5 * k, horizon + 8 * k); c.lineTo(wx + i * 4.5 * k, horizon + 20 * k); c.stroke(); }
    for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(wx, horizon + 8 * k + i * 4 * k); c.lineTo(wx + 18 * k, horizon + 8 * k + i * 4 * k); c.stroke(); }
  };

  function comicTexture() {
    const T = window.THREE;
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#fff7e0'; g.fillRect(0, 0, 256, 256);
    const cols = ['#4cc9f0', '#ff8fc0', '#ffd23f', '#7bd389'];
    for (let i = 0; i < 4; i++) {
      const x = (i % 2) * 128 + 8, y = Math.floor(i / 2) * 128 + 8;
      g.fillStyle = cols[i]; g.fillRect(x, y, 112, 112);
      g.strokeStyle = '#2b2340'; g.lineWidth = 5; g.strokeRect(x, y, 112, 112);
      // a little hero with a quiff and a white dog (our own characters)
      g.fillStyle = '#f6cfa8'; g.beginPath(); g.arc(x + 40, y + 50, 16, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#e8a04a'; g.beginPath(); g.moveTo(x + 36, y + 34); g.lineTo(x + 44, y + 22); g.lineTo(x + 48, y + 36); g.fill();
      g.fillStyle = '#4a78c8'; g.fillRect(x + 28, y + 66, 24, 34); g.strokeRect(x + 28, y + 66, 24, 34);
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x + 84, y + 88, 14, 10, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x + 78, y + 22, 26, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#2b2340'; g.font = 'bold 14px sans-serif'; g.textAlign = 'center';
      g.fillText(['WAU!', 'HEI!', 'HAHA!', 'JEE!'][i], x + 78, y + 27);
    }
    return new T.CanvasTexture(c);
  }

  MP.makeCountry({
    id: 'belgium', name: 'Belgia', to: 'Belgiaan', city: 'Bryssel', time: '08:25',
    land: 'belgium',
    flag(c, x, y, w, h) {
      c.fillStyle = '#000000'; c.fillRect(x, y, w / 3, h);
      c.fillStyle = '#fdda24'; c.fillRect(x + w / 3, y, w / 3 + 0.2, h);
      c.fillStyle = '#ef3340'; c.fillRect(x + w * 2 / 3, y, w / 3, h);
    },
    sky: C.sky,
    ground: C.cobble,
    fog: ['#eef4f8', 60, 180],
    hemiGround: 0xbdb6a8,
    bounds: { minX: -30, maxX: 30, minZ: -34, maxZ: 10 },
    car: { at: { x: 5.5, z: 6.5 }, color: '#2b2b33', name: 'Taksi' },
    sign: { text: 'Belgia', x: -3, z: 1 },
    hotel: {
      x: 26, z: -2, rot: -Math.PI / 2,
      look: { wall: '#e8d6a8', trim: C.gold, awning: '#ef3340', sign: 'HOTELLI' },
      room: {
        name: 'Hotelli Vohveli', wall: '#f6e8d0', border: C.gold, floor: '#8a5a32',
        blanket: '#ef3340', rug: '#fdda24',
        hello: 'Hotelli Vohveli! Ikkunasta näkyy kultaisia taloja. Napauta sänkyä, niin mennään nukkumaan.',
      },
    },
    airport: { title: 'BRYSSELIN LENTOKENTTÄ', hall: '#f2eee6', floor: '#cfc6b6', plant: 'leafy' },
    photo: { name: 'Belgia', sticker: '🧇' },
    poster: { say: 'Juliste Belgiasta! Kultaiset talot ja vohveleita.' },
    stamp: {
      ink: '#8a5a32',
      pic(c) {   // a waffle
        c.strokeRect(-8, -7, 16, 13);
        for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-8 + i * 4, -7); c.lineTo(-8 + i * 4, 6); c.stroke(); }
        for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(-8, -7 + i * 4.3); c.lineTo(8, -7 + i * 4.3); c.stroke(); }
      },
    },
    welcome: 'Tervetuloa Belgiaan! Täällä tuoksuu suklaalta ja vohveleilta!',
    morning: 'Hyvää huomenta, Belgia! Aamupalaksi vohveli?',

    // -------------------------------------------------------------------------
    build(W, S, T) {
      const { box, cyl, ball, flat, block } = W;

      // --- The square: fancy tall houses with stepped gables and gold ---
      function house(x, z, w, h, color, rot) {
        const g = new T.Group();
        box(w, h, 4, color, 0, 0, 0, g);
        for (let s = 0; s < 3; s++) box(w - s * 1.4, 1, 4, color, 0, h + s, 0, g);
        box(w + 0.2, 0.25, 4.1, C.gold, 0, h, 0, g);
        box(0.6, 0.6, 0.6, C.gold, 0, h + 3, 0, g);
        for (let fl = 1; fl * 2.2 < h - 0.5; fl++) for (const wx of [-w / 4, w / 4]) box(0.9, 1.2, 0.1, '#4a6a8a', wx, fl * 2.2 - 0.8, 2.02, g);
        box(1.2, 2, 0.1, '#5a3418', 0, 0, 2.02, g);
        g.position.set(x, 0, z);
        g.rotation.y = rot || 0;
        W.add(g);
        block(x, z, Math.abs(Math.sin(rot || 0)) > 0.5 ? 4 : w, Math.abs(Math.sin(rot || 0)) > 0.5 ? w : 4);
        return g;
      }
      const colors = ['#c98a55', '#e8d6a8', '#b8643a', '#d6c8a8', '#a8724a'];
      for (let i = 0; i < 9; i++) house(-24 + i * 6, -40, 5.6, 7 + (i % 3) * 2, colors[i % 5], 0);
      for (let i = 0; i < 4; i++) house(-34, -30 + i * 7, 6.4, 7 + (i % 2) * 2, colors[(i + 2) % 5], Math.PI / 2);
      // the comic painted on a house wall
      const wall = house(COMIC.x - 4, COMIC.z, 6.4, 8, '#e8d6a8', Math.PI / 2);
      const comic = new T.Mesh(new T.PlaneGeometry(5, 5), new T.MeshBasicMaterial({ map: comicTexture() }));
      comic.position.set(0, 4.2, 2.06);
      wall.add(comic);
      W.clickable(wall, 'comic');

      // --- The chocolate factory and its chocolate river ---
      const fac = new T.Group();
      box(9, 6, 6, C.brick, 0, 0, 0, fac);
      const roof = box(9.4, 0.4, 6.4, C.choco, 0, 6, 0, fac);
      void roof;
      for (const cx of [-2.5, 2.5]) cyl(0.5, 3, '#8a8a92', cx, 6, -1.5, fac);
      box(3, 2.6, 0.1, '#5a3418', 0, 0, 3.02, fac);
      const facSign = W.sign('SUKLAATEHDAS', 0, 4.6, 3.05, 0, '#5a3418', '#ffd23f', null, 5);
      S.scene.remove(facSign);
      fac.add(facSign);
      fac.position.set(FACTORY.x, 0, FACTORY.z);
      W.add(fac);
      block(FACTORY.x, FACTORY.z, 9, 6);
      W.clickable(fac, 'chocolate');
      // the river: a brown stream with bubbles moving along
      flat(2.2, 20, C.choco, FACTORY.x - 6, FACTORY.z + 8, 0.03);
      block(FACTORY.x - 6, FACTORY.z + 8, 2.2, 20);
      S.chocoBubbles = [];
      for (let i = 0; i < 12; i++) {
        const b = ball(0.18, C.chocoLight, FACTORY.x - 6, 0.06, FACTORY.z - 2 + i * 1.7);
        b.scale.y = 0.4;
        S.chocoBubbles.push(b);
      }
      // the conveyor belt with chocolates in front of the factory
      box(6, 0.9, 1, '#5a5a73', FACTORY.x, 0, FACTORY.z + 4.4);
      block(FACTORY.x, FACTORY.z + 4.4, 6, 1);
      S.chocos = [];
      for (let i = 0; i < 8; i++) {
        const ch = box(0.4, 0.2, 0.4, i % 2 ? C.choco : '#f4efe6', 0, 0.9, 0);
        S.chocos.push(ch);
      }
      // the chocolate box being filled
      S.chocoBox = new T.Group();
      box(1.2, 0.4, 0.9, '#ef3340', 0, 0, 0, S.chocoBox);
      S.boxChocos = [];
      for (let i = 0; i < BOX_SIZE; i++) {
        const ch = ball(0.14, C.choco, -0.4 + (i % 3) * 0.4, 0.42, -0.2 + Math.floor(i / 3) * 0.4, S.chocoBox);
        S.boxChocos.push(ch);
      }
      S.chocoBox.position.set(FACTORY.x + 3.6, 0.9, FACTORY.z + 4.4);
      W.add(S.chocoBox);

      // --- The waffle stand and the waffle tower ---
      const ws = new T.Group();
      box(2.6, 1.1, 1.2, '#e8d6a8', 0, 0, 0, ws);
      box(3, 0.1, 1.6, '#ef3340', 0, 2.2, 0, ws);
      for (const sx of [-1.3, 1.3]) cyl(0.05, 2.2, '#8a5a32', sx, 0, 0.6, ws);
      ws.position.set(WAFFLE.x, 0, WAFFLE.z);
      W.add(ws);
      block(WAFFLE.x, WAFFLE.z, 2.8, 1.4);
      W.clickable(ws, 'waffle');
      S.tower = new T.Group();
      S.tower.position.set(WAFFLE.x, 1.1, WAFFLE.z + 0.2);
      W.add(S.tower);
      S.waffleMeshes = [];
      for (let i = 0; i < 10; i++) {
        const lay = new T.Group();
        box(0.9, 0.18, 0.9, '#e0a84a', 0, 0, 0, lay);
        if (i % 2) ball(0.12, '#e8343f', 0.2, 0.22, 0.1, lay);
        else ball(0.16, '#ffffff', -0.1, 0.2, 0, lay);
        lay.position.y = i * 0.24;
        lay.visible = false;
        S.tower.add(lay);
        S.waffleMeshes.push(lay);
      }

      // --- The little fountain statue ---
      const fo = new T.Group();
      cyl(1.4, 0.5, '#a8a296', 0, 0, 0, fo);
      const pool = cyl(1.2, 0.08, '#4a9be0', 0, 0.45, 0, fo);
      void pool;
      cyl(0.35, 1.6, '#a8a296', 0, 0.5, 0, fo);
      // a small bronze boy holding a jug
      ball(0.3, '#8a6a3a', 0, 2.6, 0, fo);
      cyl(0.22, 0.6, '#8a6a3a', 0, 2.05, 0, fo);
      const jug = cyl(0.12, 0.3, '#8a6a3a', 0.25, 2.2, 0.15, fo);
      jug.rotation.z = -0.8;
      fo.position.set(FOUNTAIN.x, 0, FOUNTAIN.z);
      W.add(fo);
      block(FOUNTAIN.x, FOUNTAIN.z, 2.8, 2.8);
      W.clickable(fo, 'fountain');
      S.drops = [];
      for (let i = 0; i < 30; i++) {
        const d = ball(0.07, '#8fe3ff', 0, -5, 0);
        d.material = new T.MeshBasicMaterial({ color: '#3fb6f0' });
        S.drops.push({ m: d, life: 0 });
      }

      // --- The accordion player ---
      const mu = new T.Group();
      cyl(0.3, 1.1, '#2b3f73', 0, 0, 0, mu);
      ball(0.3, '#f6cfa8', 0, 1.4, 0, mu);
      cyl(0.32, 0.18, '#2b2b33', 0, 1.62, 0, mu);
      S.accordion = box(0.9, 0.5, 0.3, '#ef3340', 0, 0.75, 0.35, mu);
      mu.position.set(MUSICIAN.x, 0, MUSICIAN.z);
      W.add(mu);
      block(MUSICIAN.x, MUSICIAN.z, 0.8, 0.8);
      W.clickable(mu, 'musician');
      S.musicAt = -99;

      // --- The market stall with Brussels sprouts ---
      const st = new T.Group();
      box(2.6, 1, 1.2, '#a0703c', 0, 0, 0, st);
      for (let i = 0; i < 9; i++) ball(0.14, '#6a9a3a', -0.9 + (i % 5) * 0.45, 1.1, -0.2 + Math.floor(i / 5) * 0.4, st);
      box(3, 0.1, 1.6, '#3cb371', 0, 2.1, 0, st);
      for (const sx of [-1.3, 1.3]) cyl(0.05, 2.1, '#8a5a32', sx, 0, 0.6, st);
      st.position.set(SPROUTS.x, 0, SPROUTS.z);
      st.rotation.y = Math.PI / 2;
      W.add(st);
      block(SPROUTS.x, SPROUTS.z, 1.4, 2.8);
      W.clickable(st, 'sprouts');
    },

    spots: {
      chocolate: {
        at: () => ({ x: FACTORY.x, z: FACTORY.z + 6 }),
        use(sc, S) {
          S.inBox = (S.inBox || 0);
          S.taps = (S.taps || 0) + 1;
          if (S.taps % 3 === 0) {
            // this one goes into my mouth!
            MP.state.mustacheUntil = MP.time + 10;
            sc.say('Mums! Tämä suklaa meni suuhun… nyt minulla on suklaaviikset!', 3.5);
            MP.sfx.nom();
            return;
          }
          S.inBox++;
          S.boxChocos.forEach((b, i) => { b.visible = i < S.inBox; });
          if (S.inBox >= BOX_SIZE) {
            const tr = MP.state.treasures;
            const first = !tr.chocolates;
            tr.chocolates = true;
            MP.save();
            sc.say('Suklaarasia on täynnä! ' + (first ? 'Saan viedä sen kotiin matkamuistoksi!' : 'Vielä yksi rasia?'), 4);
            MP.sfx.bling();
            S.inBox = 0;
            setTimeout(() => S.boxChocos.forEach((b) => { b.visible = false; }), 1500);
          } else {
            sc.say('Suklaa rasiaan! ' + S.inBox + ' / ' + BOX_SIZE + '. Napauta lisää!', 2.5);
            MP.sfx.tap();
          }
        },
      },
      waffle: {
        at: () => ({ x: WAFFLE.x, z: WAFFLE.z + 2.2 }),
        use(sc, S) {
          if (S.splat) return;
          S.waffles = (S.waffles || 0) + 1;
          S.waffleMeshes.forEach((m, i) => { m.visible = i < S.waffles; });
          S.limit = S.limit || 5 + Math.floor(Math.random() * 4);
          if (S.waffles >= S.limit) {
            S.splat = { at: MP.time };
            sc.say('Vohvelitorni heiluu… heiluu… SPLAT! Kerma joka puolella! Hahaa!', 4);
            MP.sfx.boing();
          } else {
            sc.say(['Vohveli!', 'Mansikoita päälle!', 'Kermaa!', 'Vielä yksi!', 'Torni kasvaa!', 'Ooh, korkea!', 'Varovasti…', 'Huh!'][S.waffles - 1] || 'Lisää!', 2);
            MP.sfx.tap();
          }
        },
      },
      fountain: {
        at: () => ({ x: FOUNTAIN.x + 0.6, z: FOUNTAIN.z + 2.6 }),
        use(sc, S) {
          S.squirtAt = MP.time;
          sc.say('Pieni patsaspoika suihkuttaa vettä… suoraan minun päälleni! Hups, kastuin!', 4);
          MP.sfx.flush();
        },
      },
      musician: {
        at: () => ({ x: MUSICIAN.x + 1.6, z: MUSICIAN.z + 1.6 }),
        use(sc, S) {
          S.musicAt = MP.time;
          sc.say('Haitarinsoittaja soittaa iloisen kappaleen! Tanssitaanko?', 3);
          SONG.forEach((f, i) => setTimeout(() => { if (MP.scene === MP.scenes.belgium) MP.sfx.note(f, 0.3, 'square', 0.06); }, i * 280));
        },
      },
      comic: {
        here: true,
        use(sc) {
          sc.say('Talon seinässä on iso sarjakuva! Belgiassa piirretään paljon sarjakuvia.', 4);
          MP.sfx.tune();
        },
      },
      sprouts: {
        at: () => ({ x: SPROUTS.x + 2, z: SPROUTS.z }),
        use(sc) {
          sc.pose = { mouth: 'flat', eyes: 'closed' };
          sc.poseUntil = MP.time + 2.2;
          sc.say('Ruusukaalia? YÄK! Ei kiitos… otan mieluummin vohvelin.', 3.5);
          MP.sfx.boing();
        },
      },
    },

    hints: [
      { x: FACTORY.x, z: FACTORY.z + 6, r: 4, say: 'Suklaatehdas! Napauta sitä.' },
      { x: WAFFLE.x, z: WAFFLE.z + 2.2, r: 3.2, say: 'Vohvelikoju! Napauta, niin rakennetaan vohvelitorni.' },
      { x: FOUNTAIN.x, z: FOUNTAIN.z + 2.6, r: 3.2, say: 'Pieni patsas suihkulähteessä! Napauta sitä.' },
    ],

    enter(sc, S) {
      S.inBox = 0; S.taps = 0; S.waffles = 0; S.limit = 0; S.splat = null; S.squirtAt = -99; S.musicAt = -99;
      S.boxChocos.forEach((b) => { b.visible = false; });
      S.waffleMeshes.forEach((m) => { m.visible = false; m.position.x = 0; m.rotation.z = 0; });
      sc.pose = null;
    },

    update(sc, S, dt, now) {
      if (sc.pose && now > sc.poseUntil) sc.pose = null;
      // the chocolate river flows, the belt moves
      S.chocoBubbles.forEach((b, i) => {
        b.position.z = FACTORY.z - 2 + ((i * 1.7 + now * 1.2) % 20);
      });
      S.chocos.forEach((ch, i) => {
        const u = ((now * 0.25 + i / 8) % 1);
        ch.position.set(FACTORY.x - 3 + u * 6, 0.9, FACTORY.z + 4.4);
      });
      // the waffle tower wobbles, then falls
      if (S.splat) {
        const u = now - S.splat.at;
        S.waffleMeshes.forEach((m, i) => {
          if (!m.visible) return;
          m.rotation.z = Math.min(1.4, u * 1.2) * (i / 8);
          m.position.x = Math.min(2, u * 2) * (i / 6);
        });
        if (u > 2.2) {
          S.splat = null; S.waffles = 0; S.limit = 0;
          S.waffleMeshes.forEach((m) => { m.visible = false; m.position.x = 0; m.rotation.z = 0; });
        }
      } else if (S.waffles > 3) {
        S.tower.rotation.z = Math.sin(now * 4) * 0.02 * (S.waffles - 3);
      } else {
        S.tower.rotation.z = 0;
      }
      // the fountain squirts at you
      const sq = now - (S.squirtAt || -99);
      const spray = sq < 1.8;
      for (let n = 0; n < (spray ? 2 : 1); n++) {
        const d = S.drops.find((q) => q.life <= 0);
        if (!d) break;
        d.life = spray ? 0.9 : 0.6;
        d.m.position.set(FOUNTAIN.x + 0.35, 2.15, FOUNTAIN.z + 0.2);
        if (spray) {
          const dx = sc.p.x - FOUNTAIN.x, dz = sc.p.z - FOUNTAIN.z, L = Math.hypot(dx, dz) || 1;
          d.v = { x: dx / L * 3.2, y: 2.4, z: dz / L * 3.2 };
        } else {
          d.v = { x: 0.6 + Math.random() * 0.2, y: 0.5, z: (Math.random() - 0.5) * 0.2 };
        }
      }
      for (const d of S.drops) {
        if (d.life <= 0) { d.m.visible = false; continue; }
        d.life -= dt;
        d.v.y -= 9 * dt;
        d.m.position.x += d.v.x * dt; d.m.position.y += d.v.y * dt; d.m.position.z += d.v.z * dt;
        d.m.visible = d.m.position.y > 0;
      }
      // the accordion squeezes while playing
      const play = now - S.musicAt < 3.4;
      S.accordion.scale.x = play ? 1 + Math.sin(now * 9) * 0.3 : 1;
    },
  });
})();
