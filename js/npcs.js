// npcs.js – other people walking around in the 3D places.
// A place calls MP.makeCrowd(scene, W, { area, hello }) once when it is built.
// Every time you come to the place, 2–4 new random people are there: kids and
// grown-ups in different clothes. They walk a little, stop, and walk again.
// Tap one: they stop, wave and say hello in a speech bubble (it stays until tapped).
// world3d.js moves them (W3.render), finds taps on them (W3.tap), and the engine
// draws their speech bubble (MP.crowdDraw).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const W3 = MP.w3d;

  const HELLO = ['Hei!', 'Moi moi!', 'Hyvää päivää!', 'Mukava nähdä!', 'Terve!', 'Heippa!', 'Moikka!',
    'Hei, kiva hattu!', 'Mitä kuuluu?', 'Ihana päivä tänään!'];
  const SKINS = ['#f6cfa8', '#eec09a', '#d9a274', '#b97e52', '#8d5a3b', '#6a4129'];
  const HAIRS = ['#2b1d14', '#4a3020', '#6b3a1e', '#8b4a2b', '#e3b04b', '#c94f2b', '#111111', '#a8a8a8'];
  const SHIRTS = ['red', 'yellow', 'green', 'sailor', 'tshirt'];
  const PANTS = ['jeans', 'brown', 'shorts'];
  const SKIRTS = ['skirtPink', 'skirtPurple', 'jeans', 'shorts', 'shortsPink'];
  const HATS = ['none', 'none', 'none', 'cap', 'sunhat', 'beanie'];

  // The little picture: 32 × 70 drawing units, feet at 66 (room for waving hands)
  const CW = 32, CH = 70, FEET = 66, RES = 2;

  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const rand = (a, b) => a + Math.random() * (b - a);

  // A new random person (how they look)
  function randomLook() {
    const girl = Math.random() < 0.5;
    const grown = Math.random() < 0.6;
    const hat = pick(HATS);
    return {
      character: girl ? 'girl' : 'boy',
      outfit: { shirt: pick(SHIRTS), bottom: pick(girl ? SKIRTS : PANTS), hat: girl && hat === 'none' && Math.random() < 0.4 ? 'ponytail' : hat },
      hair: pick(HAIRS),
      skin: pick(SKINS),
      scale: grown ? rand(1.28, 1.42) : rand(0.92, 1.05),
      glasses: grown && Math.random() < 0.3,
      noBow: grown || Math.random() < 0.5,
    };
  }

  MP.makeCrowd = function (scene3d, W, cfg) {
    const T = W3.T;
    cfg = cfg || {};
    const area = cfg.area;
    const hello = (cfg.hello || []).concat(HELLO);
    const crowd = { people: [], last: -99 };
    W.crowd = crowd;
    scene3d.userData.crowd = crowd;

    // Is this spot free (not inside a house, a tree, the car…)?
    const free = (x, z) => x > area.minX && x < area.maxX && z > area.minZ && z < area.maxZ
      && !W3.blocked(W.obstacles, x, z);

    function makePerson() {
      const p = { canvas: document.createElement('canvas') };
      p.canvas.width = CW * RES;
      p.canvas.height = CH * RES;
      p.tex = new T.CanvasTexture(p.canvas);
      p.sprite = new T.Sprite(new T.SpriteMaterial({ map: p.tex, transparent: true }));
      p.sprite.center.set(0.5, (CH - FEET) / CH);
      p.sprite.userData.person = p;
      p.shadow = new T.Mesh(new T.CircleGeometry(0.4, 16),
        new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 }));
      p.shadow.rotation.x = -Math.PI / 2;
      scene3d.add(p.sprite);
      scene3d.add(p.shadow);
      return p;
    }

    // New people every time you come to the place
    crowd.scatter = function () {
      const n = cfg.count || 2 + Math.floor(Math.random() * 3);
      while (crowd.people.length < n) crowd.people.push(makePerson());
      const me = MP.scene && MP.scene.p;
      const spots = [];
      crowd.people.forEach((p, i) => {
        const on = i < n;
        p.sprite.visible = p.shadow.visible = on;
        if (!on) return;
        p.look = randomLook();
        p.speed = rand(0.8, 1.3);
        p.target = null;
        p.wait = rand(0, 3);
        p.walkTime = 0;
        p.waveUntil = 0;
        p.bubble = null;
        p.flip = Math.random() < 0.5;
        p.key = '';
        // a free spot, not right next to you or another person
        for (let k = 0; k < 40; k++) {
          const x = rand(area.minX, area.maxX), z = rand(area.minZ, area.maxZ);
          const nearMe = me && Math.hypot(x - me.x, z - me.z) < 5;
          const nearOther = spots.some((s) => Math.hypot(x - s.x, z - s.z) < 3);
          if (free(x, z) && ((!nearMe && !nearOther) || k === 39)) { p.x = x; p.z = z; break; }
        }
        if (p.x == null || !free(p.x, p.z)) { p.sprite.visible = p.shadow.visible = false; return; }
        spots.push({ x: p.x, z: p.z });
      });
    };

    // Draws the person's picture again (only when something changed)
    function paint(p, opts) {
      const key = [opts.back, opts.flip, opts.armUp, opts.walking ? Math.floor(p.walkTime * 10) : 'x'].join();
      if (key === p.key) return;
      p.key = key;
      const c = p.canvas.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, p.canvas.width, p.canvas.height);
      c.setTransform(RES, 0, 0, RES, 0, 0);
      // our people have different skin colours: borrow the colour for this drawing
      const oldSkin = MP.COLORS.skin;
      MP.COLORS.skin = p.look.skin;
      try {
        MP.drawPerson(c, CW / 2, FEET, Object.assign({}, p.look, opts));
      } finally {
        MP.COLORS.skin = oldSkin;
      }
      p.tex.needsUpdate = true;
    }

    // Every frame: walk, stop, wave
    crowd.step = function (camera) {
      const now = MP.time;
      if (now - crowd.last > 0.5) crowd.scatter();      // just came here
      const dt = Math.min(0.1, Math.max(0, now - crowd.last));
      crowd.last = now;
      const me = MP.scene && MP.scene.p;
      const look = camera.getWorldDirection(new T.Vector3());   // where the camera looks
      const fx = look.x, fz = look.z;
      crowd.people.forEach((p) => {
        if (!p.sprite.visible) return;
        let walking = false, dx = 0, dz = 0;
        if (p.waveUntil > now) p.target = null;
        else if (p.target) {
          dx = p.target.x - p.x; dz = p.target.z - p.z;
          const d = Math.hypot(dx, dz);
          const step = Math.min(d, p.speed * dt);
          const nx = p.x + dx / d * step, nz = p.z + dz / d * step;
          const tooClose = me && Math.hypot(nx - me.x, nz - me.z) < 1.3;   // don't bump into you
          if (d < 0.1 || tooClose || !free(nx, nz)) {
            p.target = null;
            p.wait = rand(1.5, 4.5);
          } else {
            p.x = nx; p.z = nz;
            walking = true;
            p.walkTime += dt;
          }
        } else {
          p.wait -= dt;
          if (p.wait <= 0) {
            // somewhere new to walk to, a few steps away
            for (let k = 0; k < 8; k++) {
              const a = Math.random() * Math.PI * 2, r = rand(3, 9);
              const x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
              if (free(x, z)) { p.target = { x, z }; break; }
            }
            if (!p.target) p.wait = 1;
          }
        }
        // which way the picture looks: from behind when walking away from the camera
        const opts = { walking, walkTime: p.walkTime, back: false, flip: p.flip };
        if (walking) {
          const d = Math.hypot(dx, dz) || 1;
          opts.back = ((dx / d) * fx + (dz / d) * fz) / (Math.hypot(fx, fz) || 1) > 0.45;
          const a = W3.toScreen(new T.Vector3(p.x, 0.5, p.z), camera);
          const b = W3.toScreen(new T.Vector3(p.x + dx / d, 0.5, p.z + dz / d), camera);
          if (Math.abs(b.x - a.x) > 0.5) p.flip = b.x < a.x;
          opts.flip = p.flip;
        }
        if (p.waveUntil > now) {
          opts.armUp = Math.sin(now * 9) > 0 ? 0.9 : 0.6;
          opts.mouth = 'smile';
        }
        paint(p, opts);
        const m = W3.PERSON_M * p.look.scale;
        p.sprite.scale.set(W3.PERSON_M * CW / 42, W3.PERSON_M * CH / 42, 1);
        p.sprite.position.set(p.x, 0, p.z);
        p.shadow.position.set(p.x, 0.03, p.z);
        p.head = new T.Vector3(p.x, m + 0.2, p.z);
      });
    };

    // A tap: was it on a person (nearer than the other tappable things)?
    crowd.tap = function (raycaster, thingHit) {
      const shown = crowd.people.filter((p) => p.sprite.visible).map((p) => p.sprite);
      const hits = raycaster.intersectObjects(shown, false);
      if (!hits.length || (thingHit && thingHit.distance < hits[0].distance)) return false;
      const p = hits[0].object.userData.person;
      crowd.hush();
      p.target = null;
      p.wait = rand(3, 5);
      p.waveUntil = MP.time + 1.6;
      p.bubble = { text: pick(hello), from: MP.time, until: Infinity };   // stays until tapped
      MP.sfx.note(660, 0.12, 'sine', 0.25);
      setTimeout(() => MP.sfx.note(880, 0.16, 'sine', 0.25), 120);
      return true;
    };

    crowd.hush = function () {
      crowd.people.forEach((p) => { p.bubble = null; });
    };

    crowd.draw = function (ctx, camera) {
      crowd.people.forEach((p) => {
        if (p.bubble && p.sprite.visible && p.head) W3.drawBubble(ctx, p.bubble, p.head, camera);
      });
    };

    return crowd;
  };

  // The engine calls these: close the bubbles on a tap, draw them every frame
  MP.crowdHush = function () {
    if (W3.activeCrowd) W3.activeCrowd.hush();
  };
  MP.crowdDraw = function (ctx, scene) {
    const c = W3.activeCrowd;
    if (!c || !scene || !scene.transparent || !W3.camera || !W3.canvas || W3.canvas.style.display === 'none') return;
    c.draw(ctx, W3.camera);
  };
})();
