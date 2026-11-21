// world3d.js – shared things for the 3D places (the street, Egypt…).
// One WebGL canvas lies under the game canvas; the game canvas on top draws
// speech bubbles and buttons. Each 3D place makes its own THREE.Scene and uses
// these helpers for building, walking, the camera and the character.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const W3 = (MP.w3d = {});

  W3.PERSON_M = 1.25;                          // character height in meters
  W3.TURN_BUTTON = { x: 290, y: 152, r: 15 };

  // ---------------------------------------------------------------------------
  // The shared WebGL canvas
  // ---------------------------------------------------------------------------
  W3.init = function () {
    if (W3.renderer) return;
    const T = window.THREE;
    W3.T = T;
    W3.canvas = document.createElement('canvas');
    W3.canvas.id = 'game3d';
    Object.assign(W3.canvas.style, { position: 'fixed', zIndex: '0', pointerEvents: 'none', display: 'none' });
    document.body.appendChild(W3.canvas);
    W3.renderer = new T.WebGLRenderer({ canvas: W3.canvas, antialias: true, preserveDrawingBuffer: true });
    W3.raycaster = new T.Raycaster();
    W3.groundPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
  };

  W3.show = function () {
    W3.init();
    W3.canvas.style.display = 'block';
    MP.canvas.style.background = 'transparent';
    MP.canvas.style.position = 'relative';
    MP.canvas.style.zIndex = '1';
    W3.placed = null;
  };

  W3.hide = function () {
    if (W3.canvas) W3.canvas.style.display = 'none';
    MP.canvas.style.background = '';
  };

  // Keeps the 3D canvas exactly under the game canvas, then draws
  W3.render = function (scene, camera) {
    const r = MP.canvas.getBoundingClientRect();
    const key = [r.left, r.top, r.width, r.height, window.devicePixelRatio].join(',');
    if (key !== W3.placed) {
      W3.placed = key;
      Object.assign(W3.canvas.style, {
        left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
      });
      W3.renderer.setPixelRatio(window.devicePixelRatio || 1);
      W3.renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
    }
    const aspect = r.width / Math.max(1, r.height);
    if (Math.abs(camera.aspect - aspect) > 1e-4) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
    W3.camera = camera;
    W3.renderer.render(scene, camera);
  };

  // ---------------------------------------------------------------------------
  // Building kit: W.box(), W.cyl()… add things to the scene.
  // W.block() adds an obstacle; things in W.clickables can be tapped.
  // ---------------------------------------------------------------------------
  W3.kit = function (scene) {
    const T = W3.T;
    const mats = {};
    const W = { scene, obstacles: [], clickables: [] };
    W.mat = (color) => mats[color] || (mats[color] = new T.MeshLambertMaterial({ color }));
    W.add = (mesh, parent) => { (parent || scene).add(mesh); return mesh; };
    // A box standing on (x, y, z)
    W.box = (w, h, d, color, x, y, z, parent) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), W.mat(color));
      m.position.set(x, y + h / 2, z);
      return W.add(m, parent);
    };
    W.cyl = (r, h, color, x, y, z, parent, rTop) => {
      const m = new T.Mesh(new T.CylinderGeometry(rTop != null ? rTop : r, r, h, 14), W.mat(color));
      m.position.set(x, y + h / 2, z);
      return W.add(m, parent);
    };
    W.ball = (r, color, x, y, z, parent) => {
      const m = new T.Mesh(new T.SphereGeometry(r, 16, 12), W.mat(color));
      m.position.set(x, y, z);
      return W.add(m, parent);
    };
    // Flat piece lying on the ground
    W.flat = (w, d, color, x, z, y) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, d), W.mat(color));
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, y || 0.01, z);
      return W.add(m);
    };
    W.disc = (r, color, x, z, y) => {
      const m = new T.Mesh(new T.CircleGeometry(r, 28), W.mat(color));
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, y || 0.01, z);
      return W.add(m);
    };
    W.block = (x, z, w, d) => {
      W.obstacles.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
    };
    // Makes a group tappable: tapping it uses the spot called `spot`
    W.clickable = (obj, spot) => {
      obj.traverse((m) => { m.userData.spot = spot; });
      W.clickables.push(obj);
      return obj;
    };
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
    // arrowDir: 'left', 'right' or nothing
    W.sign = (text, x, y, z, rotY, bg, fg, arrowDir, w) => {
      w = w || 3;
      const m = new T.Mesh(new T.PlaneGeometry(w, w / 4),
        new T.MeshBasicMaterial({ map: textTexture(text, bg, fg, arrowDir === 'left'), side: T.DoubleSide }));
      if (arrowDir === 'right') {
        const arrow = new T.Mesh(new T.CircleGeometry(0.16, 3), new T.MeshBasicMaterial({ color: fg }));
        arrow.position.set(w / 2 - 0.3, 0, 0.01);
        m.add(arrow);
      }
      m.position.set(x, y, z);
      m.rotation.y = rotY || 0;
      return W.add(m);
    };
    // The yellow taxi (front points to -x)
    W.taxi = (color) => {
      const taxi = new T.Group();
      W.box(3.8, 0.9, 1.8, color, 0, 0.35, 0, taxi);
      W.box(2.1, 0.75, 1.6, color, -0.2, 1.25, 0, taxi);
      W.box(1.9, 0.6, 1.62, '#bfe6ff', -0.2, 1.3, 0, taxi);        // windows
      W.box(0.7, 0.3, 0.5, '#ffffff', -0.2, 2.0, 0, taxi);          // roof sign
      for (const [wx, wz] of [[-1.2, 0.9], [1.2, 0.9], [-1.2, -0.9], [1.2, -0.9]]) {
        const wheel = W.cyl(0.38, 0.3, '#2b2b33', wx, 0.38, wz, taxi);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.y = 0.38;
      }
      return W.add(taxi);
    };
    // A hotel: the door is on the front (+z before turning by rotY).
    // o = { w, h, d, wall, trim, roof, sign } – tapping it uses the spot 'hotel'.
    W.hotel = (x, z, rotY, o) => {
      o = Object.assign({ w: 9, h: 7, d: 5, wall: '#f4efe1', trim: '#c8913a', glass: '#9fd3ef', door: '#6b3f22', awning: '#d33a3a' }, o);
      const g = new T.Group();
      if (!o.facadeOnly) {
        W.box(o.w, o.h, o.d, o.wall, 0, 0, 0, g);
        W.box(o.w + 0.4, 0.4, o.d + 0.4, o.trim, 0, o.h, 0, g);                      // flat roof edge
      }
      const front = o.d / 2 + 0.04;
      // rows of windows with little balconies
      for (let fl = 1; fl * 2.1 + 1.1 < o.h; fl++) {
        for (let k = -1; k <= 1; k++) {
          if (k === 0 && fl === 0) continue;
          W.box(1.3, 1.1, 0.08, o.glass, k * (o.w / 3), fl * 2.1 + 0.4, front, g);
          W.box(1.6, 0.12, 0.4, o.trim, k * (o.w / 3), fl * 2.1 + 0.35, front + 0.15, g);
        }
      }
      // the entrance: glass doors, an awning and the sign
      W.box(2, 2.2, 0.1, o.door, 0, 0, front, g);
      W.box(1.6, 1.9, 0.12, o.glass, 0, 0.05, front + 0.02, g);
      W.box(0.06, 1.9, 0.14, o.door, 0, 0.05, front + 0.03, g);
      W.box(3.2, 0.15, 1.6, o.awning, 0, 2.5, front + 0.8, g);
      for (const sx of [-1.45, 1.45]) W.cyl(0.06, 2.5, '#d8dde6', sx, 0, front + 1.5, g);
      const sign = W.sign(o.sign || 'HOTELLI', 0, 3.4, front + 0.06, 0, '#2b2340', '#ffd23f', null, 3.4);
      scene.remove(sign); g.add(sign);
      W.box(1.4, 0.03, 1.2, '#d33a3a', 0, 0.01, front + 0.7, g);                  // red carpet
      for (const sx of [-1.9, 1.9]) {                                             // flower pots
        W.cyl(0.3, 0.5, '#a0643c', sx, 0, front + 0.6, g, 0.24);
        W.ball(0.4, '#3d9a46', sx, 0.75, front + 0.6, g);
      }
      g.position.set(x, 0, z);
      g.rotation.y = rotY || 0;
      W.add(g);
      if (!o.facadeOnly) {
        const sideways = Math.abs(Math.sin(rotY || 0)) > 0.5;
        W.block(x, z, sideways ? o.d : o.w, sideways ? o.w : o.d);
      }
      W.clickable(g, 'hotel');
      // where to stand in front of the door (2.6 m in front)
      const fx = Math.sin(rotY || 0), fz = Math.cos(rotY || 0);
      return { group: g, door: { x: x + fx * (front + 2.6), z: z + fz * (front + 2.6), heading: Math.atan2(-fx, fz) } };
    };
    return W;
  };

  // ---------------------------------------------------------------------------
  // The character: a flat picture (our normal drawing from behind) that always
  // faces the camera, with a soft shadow.
  // ---------------------------------------------------------------------------
  W3.character = function (scene) {
    const T = W3.T;
    const ch = {};
    // 80 × 76 drawing units: room for flying up and for a big spider web around
    const CW = 80, CH = 76, FEET = 72;
    ch.canvas = document.createElement('canvas');
    ch.canvas.width = CW * 3;
    ch.canvas.height = CH * 3;
    ch.tex = new T.CanvasTexture(ch.canvas);
    ch.sprite = new T.Sprite(new T.SpriteMaterial({ map: ch.tex, transparent: true }));
    ch.sprite.scale.set(W3.PERSON_M * CW / 42, W3.PERSON_M * CH / 42, 1);
    ch.sprite.center.set(0.5, (CH - FEET) / CH);
    scene.add(ch.sprite);
    ch.shadow = new T.Mesh(new T.CircleGeometry(0.42, 20),
      new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }));
    ch.shadow.rotation.x = -Math.PI / 2;
    scene.add(ch.shadow);
    // Draws the character standing at (x, y, z). Returns the spot over the head.
    ch.draw = function (x, y, z, opts) {
      opts = Object.assign({ back: true, hero: !(opts && opts.sit) }, opts);
      const c = ch.canvas.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, ch.canvas.width, ch.canvas.height);
      c.setTransform(3, 0, 0, 3, 0, 0);
      MP.drawPerson(c, CW / 2, FEET, opts);
      ch.tex.needsUpdate = true;
      ch.sprite.position.set(x, y, z);
      ch.shadow.position.set(x, 0.03, z);
      const lift = opts.hero ? MP.heroLift() * W3.PERSON_M / 42 : 0;
      if (opts.hero && ch.sprite.visible) {
        // where the costume's middle is on the screen (tap it for hero tricks)
        const mid = new T.Vector3(x, y + lift + W3.PERSON_M * 19 / 42, z);
        const top = new T.Vector3(x, y + lift + W3.PERSON_M, z);
        MP.heroSpot = () => {
          if (!W3.camera) return null;
          const a = W3.toScreen(mid, W3.camera), b = W3.toScreen(top, W3.camera);
          const h = Math.abs(a.y - b.y);
          return { x: a.x, y: a.y, rx: Math.max(8, h * 0.45), ry: Math.max(10, h * 0.6) };
        };
      }
      return new T.Vector3(x, y + lift + W3.PERSON_M + 0.15, z);
    };
    ch.setVisible = function (v) {
      ch.sprite.visible = v;
      ch.shadow.visible = v;
    };
    return ch;
  };

  // ---------------------------------------------------------------------------
  // Walking and the camera. `self` is the scene object; it keeps
  // p = { x, z, heading }, target, onArrive, walking, walkTime, camHeading.
  // ---------------------------------------------------------------------------
  W3.angleDiff = function (a, b) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  };

  W3.blocked = function (obstacles, x, z) {
    return obstacles.some((o) => x > o.minX - 0.35 && x < o.maxX + 0.35 && z > o.minZ - 0.35 && z < o.maxZ + 0.35);
  };

  W3.walkTo = function (self, bounds, x, z, onArrive) {
    self.target = { x: MP.clamp(x, bounds.minX, bounds.maxX), z: MP.clamp(z, bounds.minZ, bounds.maxZ) };
    self.onArrive = onArrive || null;
  };

  W3.walkStep = function (self, dt, speed, obstacles) {
    const p = self.p;
    self.walking = false;
    if (!self.target) return;
    const dx = self.target.x - p.x, dz = self.target.z - p.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.08) {
      self.target = null;
      const cb = self.onArrive;
      self.onArrive = null;
      if (cb) cb();
      return;
    }
    const want = Math.atan2(dx, -dz);
    p.heading += W3.angleDiff(p.heading, want) * Math.min(1, dt * 8);
    const step = Math.min(d, speed * (MP.heroPose() === 'fly' ? 1.7 : 1) * dt);
    const nx = p.x + dx / d * step, nz = p.z + dz / d * step;
    const B = (x, z) => W3.blocked(obstacles, x, z);
    if (!B(nx, nz)) { p.x = nx; p.z = nz; }
    else if (!B(nx, p.z)) { p.x = nx; }
    else if (!B(p.x, nz)) { p.z = nz; }
    else { self.target = null; self.onArrive = null; }
    self.walking = true;
    self.walkTime += dt;
  };

  // Camera behind the character, turning smoothly
  W3.follow = function (camera, self, dt, dist, height) {
    const p = self.p;
    dist = dist || 4.6;
    height = height || 2.3;
    self.camDist = self.camDist == null ? dist : self.camDist + (dist - self.camDist) * Math.min(1, dt * 2);
    self.camHeight = self.camHeight == null ? height : self.camHeight + (height - self.camHeight) * Math.min(1, dt * 2);
    self.camHeading += W3.angleDiff(self.camHeading, p.heading) * Math.min(1, dt * 2.5);
    const fx = Math.sin(self.camHeading), fz = -Math.cos(self.camHeading);
    camera.position.set(p.x - fx * self.camDist, self.camHeight, p.z - fz * self.camDist);
    camera.lookAt(p.x + fx * 3, 0.9, p.z + fz * 3);
  };

  // A tap on the 3D view. Tapped thing → calls onThing(spot). Ground → walks there.
  W3.tap = function (self, x, y, camera, W, bounds, onThing) {
    const T = W3.T;
    const ndc = new T.Vector2(x / MP.W * 2 - 1, -(y / MP.H * 2 - 1));
    W3.raycaster.setFromCamera(ndc, camera);
    // hidden things can't be tapped (e.g. the snowman in summer)
    const shown = (o) => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
    const hits = W3.raycaster.intersectObjects(W.clickables, true).filter((h) => shown(h.object));
    if (hits.length && hits[0].object.userData.spot && onThing(hits[0].object.userData.spot, hits[0].object)) return;
    const hit = new T.Vector3();
    if (W3.raycaster.ray.intersectPlane(W3.groundPlane, hit)) {
      // not too far in one go (taps near the horizon)
      const dx = hit.x - self.p.x, dz = hit.z - self.p.z;
      const d = Math.hypot(dx, dz);
      const k = d > 30 ? 30 / d : 1;
      W3.walkTo(self, bounds, self.p.x + dx * k, self.p.z + dz * k);
    }
  };

  // Where a 3D point is on the game screen
  W3.toScreen = function (v3, camera) {
    const v = v3.clone().project(camera);
    return { x: (v.x + 1) / 2 * MP.W, y: (1 - v.y) / 2 * MP.H };
  };

  W3.drawBubble = function (ctx, bubble, headPos, camera) {
    const t = MP.time;
    if (!bubble || t < bubble.from || t >= bubble.until || !headPos) return;
    const s = W3.toScreen(headPos, camera);
    MP.drawBubble(ctx, bubble.text, s.x, s.y, { maxWidth: 150 });
  };

  W3.hitTurn = (x, y) => Math.hypot(x - W3.TURN_BUTTON.x, y - W3.TURN_BUTTON.y) < W3.TURN_BUTTON.r + 3;

  W3.drawTurnButton = function (ctx) {
    const B = W3.TURN_BUTTON;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = MP.COLORS.outline;
    ctx.fillStyle = 'rgba(255,247,224,0.92)';
    ctx.beginPath(); ctx.arc(B.x, B.y, B.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(B.x, B.y + 1, 7, Math.PI * 1.15, Math.PI * 2.6); ctx.stroke();
    ctx.fillStyle = MP.COLORS.outline;
    ctx.beginPath();
    ctx.moveTo(B.x - 9.5, B.y - 5); ctx.lineTo(B.x - 3, B.y - 5.5);
    ctx.lineTo(B.x - 7.5, B.y + 0.5); ctx.closePath(); ctx.fill();
    ctx.restore();
    MP.drawText(ctx, 'Käänny', B.x, B.y + B.r + 1, {
      size: 0.6, color: '#ffffff', outline: MP.COLORS.outline, align: 'center',
    });
  };
})();
