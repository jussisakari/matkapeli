// seasons.js – THE SEASONS at home: summer, autumn, winter and Christmas.
//   The season follows the real calendar (December = Christmas, January–March =
//   winter, September–November = autumn, otherwise summer), or it can be chosen
//   from the little calendar on the kitchen wall (saved: treasures.seasonPick).
//   - Winter: snow on the home street, a snowman to build by our house, a
//     sledding hill, footprints in the snow, the pool is frozen, a snowsuit
//     in the wardrobe, and the garden sleeps under the snow.
//   - Autumn: the trees turn yellow, orange and red; leaf piles to jump into.
//   - Christmas: snow, a Christmas tree in the living room to decorate, presents
//     under it, and coloured lights on our house.
// Here: the season itself, the falling snow / leaves / rain drawings, the
// Christmas tree, and the 3D things for the home street (street.js calls them).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  MP.SEASONS = [
    { id: 'auto', name: 'Oikea vuodenaika' },
    { id: 'summer', name: 'Kesä' },
    { id: 'autumn', name: 'Syksy' },
    { id: 'winter', name: 'Talvi' },
    { id: 'christmas', name: 'Joulu' },
  ];

  // The season from the real calendar
  function realSeason() {
    const m = new Date().getMonth();          // 0 = January
    if (m === 11) return 'christmas';
    if (m <= 2) return 'winter';
    if (m >= 8) return 'autumn';
    return 'summer';
  }
  MP.seasonPick = () => ((MP.state.treasures || {}).seasonPick || 'auto');
  MP.seasonNow = () => (MP.seasonPick() === 'auto' ? realSeason() : MP.seasonPick());
  MP.isSnowy = () => ['winter', 'christmas'].includes(MP.seasonNow());
  MP.seasonName = (id) => (MP.SEASONS.find((s) => s.id === (id || MP.seasonNow())) || {}).name;

  // ---------------------------------------------------------------------------
  // RAINY DAYS (one morning in four, not in winter): a raincoat and rubber boots,
  // puddles to jump in on the home street, worms on the path, and a rainbow when
  // the rain stops. The garden gets its water from the rain.
  // ---------------------------------------------------------------------------
  MP.pickWeather = function () {
    const rain = !MP.isSnowy() && Math.random() < 0.25;
    MP.state.weather = { rain, stopped: false };
    if (rain && Array.isArray(MP.state.garden)) {
      for (const b of MP.state.garden) if (b && b.seed) b.watered = true;     // the rain waters the garden
      MP.save();
    }
  };
  MP.isRainDay = () => !!(MP.state.weather && MP.state.weather.rain);
  MP.isRainy = () => MP.isRainDay() && !MP.state.weather.stopped && !MP.state.dusk;

  // The calendar on the kitchen wall: each tap goes to the next season
  MP.nextSeason = function () {
    const ids = MP.SEASONS.map((s) => s.id);
    const next = ids[(ids.indexOf(MP.seasonPick()) + 1) % ids.length];
    MP.state.treasures = MP.state.treasures || {};
    MP.state.treasures.seasonPick = next;
    MP.save();
    return next;
  };

  // ---------------------------------------------------------------------------
  // 2D: falling snow, leaves or rain inside a rectangle (a window, or the screen)
  //   kind: 'snow', 'leaves' or 'rain'; n = how many
  // ---------------------------------------------------------------------------
  MP.drawFalling = function (c, kind, x, y, w, h, t, n) {
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    n = n || 12;
    for (let i = 0; i < n; i++) {
      const seed = i * 97.13;
      const speed = kind === 'rain' ? 120 : kind === 'snow' ? 12 + (i % 4) * 3 : 10 + (i % 3) * 4;
      const fy = y + ((seed * 3.1 + t * speed) % (h + 10)) - 5;
      let fx = x + ((seed * 7.7) % w);
      if (kind === 'rain') {
        fx -= (fy - y) * 0.15;
        c.strokeStyle = 'rgba(160,200,255,0.85)'; c.lineWidth = 0.7;
        c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx - 1, fy + 5); c.stroke();
      } else if (kind === 'snow') {
        fx += Math.sin(t * 1.5 + i) * 2;
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(fx, fy, 0.7 + (i % 3) * 0.35, 0, Math.PI * 2); c.fill();
      } else {
        fx += Math.sin(t * 2 + i) * 4;
        c.save();
        c.translate(fx, fy);
        c.rotate(Math.sin(t * 3 + i) * 1.2);
        c.fillStyle = ['#e07a2a', '#ffb02e', '#c0392b', '#d9a12a'][i % 4];
        c.beginPath(); c.ellipse(0, 0, 1.8, 1, 0, 0, Math.PI * 2); c.fill();
        c.restore();
      }
    }
    c.restore();
  };

  // The sky in the home's windows: dark with the moon and stars in the evening
  // (back home after a day out or a trip), otherwise the normal day sky
  MP.windowSky = () => (MP.state.evening || MP.state.dusk
    ? { skyTop: '#0f1838', skyBottom: '#2f3d7c', stars: true, moon: true }
    : {});

  // What falls past the home's windows (the window sprite: x, y = top left)
  MP.windowWeather = function (c, wx, wy, t) {
    const s = MP.seasonNow();
    const rain = MP.isRainy && MP.isRainy();
    if (MP.isSnowy()) {
      c.save();
      c.fillStyle = '#ffffff';
      c.fillRect(wx + 3, wy + 19, 24, 4);         // snow on the ground outside
      c.fillRect(wx - 2, wy + 24, 34, 1.6);       // and on the window sill
      c.restore();
    }
    if (rain) {
      c.save();
      c.fillStyle = 'rgba(90,100,120,0.45)';          // grey rain clouds
      c.fillRect(wx + 3, wy + 3, 24, 20);
      c.restore();
      MP.drawFalling(c, 'rain', wx + 3, wy + 3, 24, 20, t, 10);
    }
    else if (MP.isSnowy()) MP.drawFalling(c, 'snow', wx + 3, wy + 3, 24, 20, t, 8);
    else if (s === 'autumn') MP.drawFalling(c, 'leaves', wx + 3, wy + 3, 24, 20, t, 4);
  };

  // ---------------------------------------------------------------------------
  // The Christmas tree in the living room. (x = middle, y = floor)
  //   balls = how many decorations are on it; after them the star and lights.
  // ---------------------------------------------------------------------------
  const BALL_SPOTS = [[-10, -14], [8, -16], [-4, -26], [6, -30], [-8, -36], [2, -44], [-3, -52], [5, -58], [-14, -6], [12, -8]];
  MP.XMAS_BALLS = BALL_SPOTS.length;
  MP.drawXmasTree = function (c, x, y, balls, t) {
    c.save();
    c.lineWidth = 0.9; c.strokeStyle = O();
    // the pot
    c.fillStyle = '#c0392b';
    c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x - 9, y - 9); c.lineTo(x + 9, y - 9); c.lineTo(x + 7, y); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#6b4a2a'; c.fillRect(x - 2, y - 13, 4, 4);
    // three layers of branches
    c.fillStyle = '#2e8b57';
    for (const [top, bot, half] of [[-40, -10, 22], [-56, -30, 16], [-70, -48, 10]]) {
      c.beginPath(); c.moveTo(x, y + top); c.lineTo(x + half, y + bot); c.lineTo(x - half, y + bot); c.closePath(); c.fill(); c.stroke();
    }
    const full = balls >= BALL_SPOTS.length;
    // the lights (blink when the tree is ready)
    if (full) {
      for (let i = 0; i < 14; i++) {
        const k = i / 14;
        const ly = y - 14 - k * 50, lx = x + Math.sin(i * 2.4) * (20 - k * 16);
        c.fillStyle = Math.floor(t * 3 + i) % 2 ? '#fff3a0' : ['#ff5d8f', '#4cc9f0', '#9be08f'][i % 3];
        c.beginPath(); c.arc(lx, ly, 1, 0, Math.PI * 2); c.fill();
      }
    }
    // the decorations
    for (let i = 0; i < Math.min(balls, BALL_SPOTS.length); i++) {
      const [bx, by] = BALL_SPOTS[i];
      c.fillStyle = ['#e04848', '#ffd23f', '#4a78c8', '#e0559a', '#c0c0d0'][i % 5];
      c.beginPath(); c.arc(x + bx, y + by, 2.4, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.beginPath(); c.arc(x + bx - 0.8, y + by - 0.8, 0.7, 0, Math.PI * 2); c.fill();
    }
    // the star on the top
    if (full) {
      c.fillStyle = '#ffd23f';
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2.6 : 6;
        c.lineTo(x + Math.cos(a) * r, y - 72 + Math.sin(a) * r);
      }
      c.closePath(); c.fill(); c.stroke();
    }
    // presents under the tree
    for (const [px, w, h, col, rib] of [[-20, 12, 9, '#4a78c8', '#ffd23f'], [16, 10, 11, '#e0559a', '#ffffff'], [24, 8, 7, '#9be08f', '#e04848']]) {
      c.fillStyle = col; c.fillRect(x + px - w / 2, y - h, w, h); c.strokeRect(x + px - w / 2, y - h, w, h);
      c.fillStyle = rib; c.fillRect(x + px - 1, y - h, 2, h); c.fillRect(x + px - w / 2, y - h / 2 - 1, w, 2);
    }
    c.restore();
  };

  // ---------------------------------------------------------------------------
  // 3D: the season on the home street. street.js calls these.
  // ---------------------------------------------------------------------------
  const LEAF_COLORS = {
    summer: ['#4caf50', '#5cbf60'],
    autumn: ['#e07a2a', '#ffb02e', '#c0392b', '#d9a12a'],
    winter: ['#2e7d4f', '#ffffff'],
    christmas: ['#2e7d4f', '#ffffff'],
  };
  const SNOW = '#eef4fb';

  // Builds the snowman, the sledding hill, the leaf piles and the Christmas lights.
  // S = street3d, W = the 3D kit
  MP.seasonStreet = function (S, W, T) {
    const { add, ball, box, cyl } = W;
    const R = { snowmanStep: 0 };

    // the snowman by our house (built with taps): bottom, middle, head + face
    R.snowman = new T.Group();
    R.snowParts = [
      ball(0.55, SNOW, 0, 0.45, 0, R.snowman),
      ball(0.4, SNOW, 0, 1.2, 0, R.snowman),
      new T.Group(),
    ];
    const head = R.snowParts[2];
    ball(0.28, SNOW, 0, 1.75, 0, head);
    const nose = new T.Mesh(new T.ConeGeometry(0.06, 0.3, 8), W.mat('#ff8a2a'));
    nose.rotation.x = -Math.PI / 2; nose.position.set(0, 1.75, -0.35);
    head.add(nose);
    ball(0.04, '#2b2340', -0.1, 1.83, -0.25, head);
    ball(0.04, '#2b2340', 0.1, 1.83, -0.25, head);
    cyl(0.2, 0.3, '#2b2340', 0, 1.98, 0, head);                       // a black hat
    cyl(0.3, 0.04, '#2b2340', 0, 1.98, 0, head);
    for (const sx of [-1, 1]) {                                        // stick arms
      const arm = box(0.6, 0.05, 0.05, '#6b4a2a', sx * 0.6, 1.3, 0, R.snowman);
      arm.rotation.z = sx * 0.4;
      R.snowParts.push(arm);
    }
    R.snowman.add(head);
    R.snowman.position.set(-4, 0, 10.5);
    add(R.snowman);
    R.snowman.traverse((m) => { m.userData.spot = 'snowman'; });
    // an invisible "snow pile" to tap before anything is built
    R.snowPile = ball(0.5, SNOW, -4, 0.05, 10.5);
    R.snowPile.scale.set(1.4, 0.35, 1.4);
    R.snowPile.userData.spot = 'snowman';
    S.clickables.push(R.snowman, R.snowPile);

    // the sledding hill outside the fence, and a red sled
    R.hill = ball(4, SNOW, -18, -2.2, 4);
    R.hill.userData.spot = 'sled';
    S.clickables.push(R.hill);
    S.obstacles.push({ minX: -21.5, maxX: -14.5, minZ: 0.5, maxZ: 7.5 });
    R.sled = new T.Group();
    box(1, 0.12, 0.5, '#e04848', 0, 0.12, 0, R.sled);
    for (const sz of [-0.22, 0.22]) box(1.1, 0.05, 0.05, '#c9d1db', 0, 0.02, sz, R.sled);
    add(R.sled);
    R.sled.traverse((m) => { m.userData.spot = 'sled'; });
    S.clickables.push(R.sled);

    // leaf piles to jump into (autumn)
    R.piles = [[6.8, 3.6], [-6, -6.5], [6.8, -12]].map(([x, z]) => {
      const g = new T.Group();
      for (let i = 0; i < 9; i++) {
        const m = ball(0.35, LEAF_COLORS.autumn[i % 4], (i % 3 - 1) * 0.35, 0.12 + Math.floor(i / 3) * 0.08, (Math.floor(i / 3) - 1) * 0.3, g);
        m.scale.set(1, 0.55, 1);
      }
      g.position.set(x, 0, z);
      add(g);
      g.traverse((m) => { m.userData.spot = 'leaves'; m.userData.pile = g; });
      S.clickables.push(g);
      return g;
    });

    // Christmas lights along the front of our roof
    R.lights = [];
    for (let i = 0; i < 13; i++) {
      const l = new T.Mesh(new T.SphereGeometry(0.12, 8, 6), new T.MeshBasicMaterial({ color: ['#ff5d8f', '#ffd23f', '#4cc9f0', '#9be08f'][i % 4] }));
      l.position.set(-3 + i * 0.5, 4.05, 14.85);
      add(l);
      R.lights.push(l);
    }

    // puddles and worms (rainy days)
    R.puddles = [[0, 3.5], [-3.6, -6], [3.6, -14], [-1.2, -22], [3.6, -30], [-14, -40]].map(([x, z], i) => {
      const m = new T.Mesh(new T.CircleGeometry(0.95, 20), new T.MeshLambertMaterial({ color: '#7d8fa8' }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.03 + i * 0.001, z);
      m.scale.set(1.3, 0.8, 1);
      add(m);
      return m;
    });
    R.worms = [[-3.4, -2], [3.8, -9], [-3.8, -18]].map(([x, z]) => {
      const g = new T.Group();
      for (let k = 0; k < 4; k++) ball(0.07, '#e88aa0', k * 0.11, 0.06, 0, g);
      g.position.set(x, 0, z);
      add(g);
      g.traverse((m) => { m.userData.spot = 'worm'; });
      S.clickables.push(g);
      return g;
    });

    // footprints in the snow (a few dark marks that move along with us)
    R.steps = [];
    for (let i = 0; i < 30; i++) {
      const f = new T.Mesh(new T.CircleGeometry(0.13, 10), new T.MeshBasicMaterial({ color: '#c9d6e6' }));
      f.rotation.x = -Math.PI / 2;
      f.scale.set(0.8, 1.3, 1);
      f.visible = false;
      add(f);
      R.steps.push(f);
    }
    R.stepN = 0;
    R.lastStep = null;

    // Puts the right season on the street
    R.apply = function () {
      const s = MP.seasonNow();
      R.season = s;
      const snowy = MP.isSnowy();
      const leaves = LEAF_COLORS[s] || LEAF_COLORS.summer;
      (S.leafBalls || []).forEach((m, i) => { m.material = W.mat(leaves[i % leaves.length]); });
      if (S.ground) S.ground.material = W.mat(snowy ? SNOW : MP.OUTSIDE.grass);
      (S.hills || []).forEach((m) => { m.material = W.mat(snowy ? '#f4f8fc' : MP.OUTSIDE.hills); });
      (S.flowers || []).forEach((m) => { m.visible = s === 'summer'; });
      if (S.poolWater) S.poolWater.material.color = new T.Color(snowy ? '#dff3ff' : '#3fb6f0');
      R.snowman.visible = snowy;
      R.snowPile.visible = snowy;
      R.hill.visible = snowy;
      R.sled.visible = snowy;
      R.piles.forEach((g) => { g.visible = s === 'autumn'; g.scale.set(1, 1, 1); });
      R.lights.forEach((l) => { l.visible = s === 'christmas'; });
      R.steps.forEach((f) => { f.visible = false; });
      const wet = MP.isRainDay() && !MP.state.dusk;
      R.puddles.forEach((m) => { m.visible = wet; });
      R.worms.forEach((g) => { g.visible = wet; });
      R.lastStep = null;
      R.showSnowman();
      R.sled.position.set(-13.4, 0, 5.4);
      R.sled.rotation.set(0, 0, 0);
    };

    R.showSnowman = function () {
      const n = R.snowmanStep;
      R.snowParts[0].visible = n >= 1;
      R.snowParts[1].visible = n >= 2;
      R.snowParts[2].visible = n >= 3;
      R.snowParts[3].visible = R.snowParts[4].visible = n >= 3;
      R.snowPile.visible = MP.isSnowy() && n === 0;
    };

    // A tap on a season thing (after walking there). Returns a text to say.
    R.use = function (spot, scene, hit) {
      if (spot === 'snowman') {
        if (R.snowmanStep < 3) {
          R.snowmanStep++;
          R.showSnowman();
          MP.sfx.boing();
          return ['Pyöritän ison lumipallon! Napauta lisää.', 'Toinen pallo päälle! Vielä pää.', 'Lumiukko on valmis! Porkkananenä ja hattu!'][R.snowmanStep - 1];
        }
        MP.sfx.bling();
        return 'Hei lumiukko! Sinä olet maailman paras lumiukko.';
      }
      if (spot === 'sled') {
        scene.play = { type: 'sled', t: 0 };
        MP.sfx.boing();
        return 'Pulkkamäkeen! Wiiiii!';
      }
      if (spot === 'leaves') {
        const pile = hit && hit.userData.pile;
        if (!pile) return null;
        scene.play = { type: 'leaves', t: 0, pile };
        MP.sfx.boing();
        return 'HYPPY! Lehdet lentää!';
      }
      return null;
    };

    // Each frame: blinking lights, footprints, sledding and leaf jumps
    R.update = function (dt, scene) {
      const t = MP.time;
      if (R.season === 'christmas') R.lights.forEach((l, i) => { l.visible = Math.floor(t * 2 + i) % 3 !== 0; });
      if (MP.isSnowy() && scene.walking && !scene.play) {
        const p = scene.p;
        if (!R.lastStep || Math.hypot(p.x - R.lastStep.x, p.z - R.lastStep.z) > 0.55) {
          const side = (R.stepN % 2 ? 1 : -1) * 0.15;
          const f = R.steps[R.stepN % R.steps.length];
          f.position.set(p.x + Math.cos(p.heading) * side, 0.02, p.z - Math.sin(p.heading) * side);
          f.rotation.z = p.heading;
          f.visible = true;
          R.stepN++;
          R.lastStep = { x: p.x, z: p.z };
        }
      }
      // the worms wriggle
      R.worms.forEach((g, i) => { if (g.visible) g.children.forEach((b, k) => { b.position.z = Math.sin(t * 4 + k + i) * 0.04; }); });
      // the leaf piles grow back slowly
      R.piles.forEach((g) => { if (g.scale.y < 1) g.scale.y = Math.min(1, g.scale.y + dt * 0.25); });
    };

    // Where the character is while playing (null = not a season play)
    R.playPos = function (play) {
      if (play.type === 'sled') {
        const t = play.t;
        if (t < 1) {
          // climbing up the hill
          const u = t / 1;
          const x = MP.lerp(-14.5, -18, u);
          R.sled.position.set(x + 0.5, R.hillY(x), 4.6);
          return { x, y: R.hillY(x), z: 4, sit: false };
        }
        const u = MP.clamp((t - 1) / 1.6, 0, 1);
        const x = MP.lerp(-18, -11.5, u * (2 - u));
        const y = R.hillY(x);
        R.sled.position.set(x, y, 4.6);
        R.sled.rotation.z = -Math.atan2(R.hillY(x + 0.2) - y, 0.2);
        return { x, y: y + 0.15, z: 4.6, sit: true };
      }
      if (play.type === 'leaves') {
        const pile = play.pile;
        const u = MP.clamp(play.t / 1, 0, 1);
        if (u > 0.5) pile.scale.y = Math.max(0.2, 1 - (u - 0.5) * 2);
        return { x: pile.position.x, y: Math.sin(u * Math.PI) * 1.6, z: pile.position.z - 0.6, sit: false };
      }
      return null;
    };
    R.playLength = (play) => (play.type === 'sled' ? 2.8 : play.type === 'leaves' ? 1.3 : 0);
    // Which puddle we are standing in (or -1)
    R.puddleAt = (x, z) => R.puddles.findIndex((m) => m.visible && Math.hypot((x - m.position.x) / 1.2, (z - m.position.z) / 0.75) < 1);
    R.hillY = (x) => Math.max(0, -2.2 + Math.sqrt(Math.max(0, 16 - (x + 18) * (x + 18))));
    R.afterPlay = (play) => (play.type === 'sled' ? { x: -11.5, z: 4.2 } : { x: play.pile.position.x, z: play.pile.position.z - 1.4 });

    return R;
  };
})();
