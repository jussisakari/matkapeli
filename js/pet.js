// pet.js – our own pet: a kitten or a puppy (chosen once, with a name).
// MP.drawPet() draws it from the side. MP.petBuddy() makes a pet that follows
// the character in the 3D places (the home street).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  MP.PET_KINDS = [
    { id: 'cat', name: 'Kissanpentu' },
    { id: 'dog', name: 'Koiranpentu' },
  ];
  MP.PET_NAMES = ['Mirri', 'Nappi', 'Pörrö', 'Nuppu'];

  const LOOK = {
    cat: { fur: '#f4a24c', dark: '#d9792a', light: '#fff1de', nose: '#ff8fa8' },
    dog: { fur: '#c98b4f', dark: '#8a5a2e', light: '#fff4e4', nose: '#2b2340' },
  };

  // The pet that is ours, or null
  MP.myPet = () => (MP.state.pet && LOOK[MP.state.pet.kind] ? MP.state.pet : null);

  // Says the pet's sound: cats purr, dogs bark
  MP.petSound = function (kind) {
    if ((kind || (MP.myPet() || {}).kind) === 'dog') MP.sfx.woof();
    else MP.sfx.meow();
  };

  // Draws the pet standing at (x, y = feet), facing right (flip = left).
  // opts: kind, flip, walking, walkTime, sleep, eat, sit, happy (0..1), scale
  MP.drawPet = function (c, x, y, opts) {
    opts = opts || {};
    const kind = opts.kind || 'cat';
    const L = LOOK[kind] || LOOK.cat;
    const s = opts.scale || 1;
    const t = MP.time;
    const O = MP.COLORS.outline;
    c.save();
    c.translate(x, y);
    c.scale(opts.flip ? -s : s, s);
    c.lineWidth = 0.7;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.strokeStyle = O;
    const blob = (bx, by, rx, ry, col, rot) => {
      c.fillStyle = col;
      c.beginPath(); c.ellipse(bx, by, rx, ry, rot || 0, 0, Math.PI * 2); c.fill(); c.stroke();
    };

    if (opts.sleep) {
      // Curled up in a ball, tail around, eyes shut
      blob(0, -3.6, 7.5, 3.8, L.fur);
      c.strokeStyle = L.dark; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-7, -1.5); c.quadraticCurveTo(-2, 1.4, 4, -0.6); c.stroke();
      c.strokeStyle = O; c.lineWidth = 0.7;
      blob(5, -3, 3.6, 3.1, L.fur);
      if (kind === 'cat') {
        c.fillStyle = L.fur;
        c.beginPath(); c.moveTo(3.4, -5.4); c.lineTo(4.2, -8.4); c.lineTo(5.8, -5.8); c.closePath(); c.fill(); c.stroke();
      } else {
        blob(3.6, -3.2, 1.4, 2.6, L.dark, 0.3);
      }
      c.beginPath(); c.arc(6.2, -3, 0.9, 0.2, Math.PI - 0.2); c.stroke();
      c.restore();
      return;
    }

    const wt = opts.walkTime || 0;
    const step = opts.walking ? Math.sin(wt * 14) : 0;
    const bob = opts.walking ? Math.abs(step) * 0.6 : 0;
    const happy = opts.happy || 0;
    const hop = happy > 0 ? Math.abs(Math.sin(happy * Math.PI * 3)) * 2.5 * happy : 0;
    c.translate(0, -bob - hop);

    // Tail (behind the body)
    c.strokeStyle = O;
    if (kind === 'cat') {
      const sway = Math.sin(t * 2.2) * 0.25 + happy * Math.sin(t * 14) * 0.4;
      c.lineWidth = 2.6;
      c.beginPath(); c.moveTo(-5.5, -6.5);
      c.quadraticCurveTo(-10, -8 + sway * 4, -9 + sway * 3, -14);
      c.stroke();
      c.strokeStyle = L.fur; c.lineWidth = 1.5; c.stroke();
    } else {
      const wag = Math.sin(t * (happy > 0 || opts.walking ? 22 : 5)) * 0.5;
      c.save();
      c.translate(-6, -7);
      c.rotate(-0.9 + wag);
      blob(0, -2.2, 1.1, 2.6, L.fur);
      c.restore();
    }
    c.strokeStyle = O;
    c.lineWidth = 0.7;

    // Legs (back pair darker, they move while walking)
    const leg = (lx, ph, col) => {
      const sw = step * 1.4 * ph;
      c.fillStyle = col;
      c.beginPath(); c.moveTo(lx - 1 + sw * 0.3, -5); c.lineTo(lx - 1.1 + sw, -0.2); c.lineTo(lx + 1.1 + sw, -0.2); c.lineTo(lx + 1 + sw * 0.3, -5); c.closePath();
      c.fill(); c.stroke();
    };
    if (!opts.sit) {
      leg(-4, -1, L.dark); leg(3.2, 1, L.dark);
    }

    // Body
    if (opts.sit) {
      blob(-1.5, -5.5, 5, 5, L.fur, -0.5);
      blob(1.5, -1.2, 2, 1.2, L.light);
    } else {
      blob(0, -6.5, 7, 3.8, L.fur);
      blob(1.5, -4.6, 3.6, 1.6, L.light);
      leg(-2.4, 1, L.fur); leg(4.6, -1, L.fur);
    }
    if (kind === 'cat') {
      // stripes
      c.strokeStyle = L.dark; c.lineWidth = 0.9;
      for (const sx of [-3.5, -1, 1.5]) { c.beginPath(); c.moveTo(sx, -10); c.lineTo(sx + 0.6, -7.5); c.stroke(); }
      c.strokeStyle = O; c.lineWidth = 0.7;
    }

    // Head (lower while eating)
    const hx = opts.sit ? 3 : 6.5, hy = opts.eat ? -5 + Math.abs(Math.sin(t * 9)) * 0.8 : (opts.sit ? -11.5 : -10.5);
    c.save();
    c.translate(hx, hy);
    if (opts.eat) c.rotate(0.5);
    if (kind === 'cat') {
      c.fillStyle = L.fur;
      for (const ex of [-2.4, 1.2]) {
        c.beginPath(); c.moveTo(ex - 1.3, -2.6); c.lineTo(ex, -6.4); c.lineTo(ex + 1.6, -2.4); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = L.nose;
        c.beginPath(); c.moveTo(ex - 0.4, -3); c.lineTo(ex + 0.1, -5); c.lineTo(ex + 0.8, -2.9); c.closePath(); c.fill();
        c.fillStyle = L.fur;
      }
    }
    blob(0, 0, 4.2, 3.8, L.fur);
    if (kind === 'dog') {
      blob(3.4, 1.2, 2.4, 1.7, L.light);               // muzzle
      blob(-2, 0.6, 1.5, 3.2, L.dark, 0.35 + Math.sin(t * 8) * 0.1 * happy);   // floppy ear
    } else {
      blob(2.6, 1.4, 1.8, 1.3, L.light);
    }
    // eye: happy = a smiling arc, else a shiny dot
    if (happy > 0.05 || opts.eat) {
      c.beginPath(); c.arc(1.4, -0.4, 1, Math.PI + 0.3, -0.3); c.stroke();
    } else {
      c.fillStyle = O;
      c.beginPath(); c.arc(1.5, -0.6, 0.9, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(1.8, -0.9, 0.3, 0, Math.PI * 2); c.fill();
    }
    // nose and mouth
    c.fillStyle = L.nose;
    c.beginPath(); c.arc(kind === 'dog' ? 5.6 : 4.3, 0.6, kind === 'dog' ? 0.9 : 0.6, 0, Math.PI * 2); c.fill();
    if (kind === 'cat') {
      // whiskers
      c.lineWidth = 0.35;
      for (const wy of [-0.4, 1.2]) { c.beginPath(); c.moveTo(3.4, 1); c.lineTo(6.6, wy); c.stroke(); }
    }
    if (kind === 'dog' && (happy > 0 || opts.walking)) {
      c.fillStyle = '#ff8fa8';
      c.beginPath(); c.ellipse(4.4, 3.2, 0.8, 1.3, 0.2, 0, Math.PI * 2); c.fill();
    }
    c.restore();
    c.restore();
  };

  // Hearts floating up from (x, y): `age` = seconds since the pet was petted
  MP.drawPetHearts = function (c, x, y, age) {
    if (age < 0 || age > 1.6) return;
    for (let i = 0; i < 3; i++) {
      const a = age - i * 0.2;
      if (a < 0) continue;
      const k = a / 1.4;
      if (k > 1) continue;
      const hx = x + (i - 1) * 6 + Math.sin(a * 6 + i) * 2, hy = y - a * 20;
      const r = 2.2;
      c.save();
      c.globalAlpha = 1 - k;
      c.fillStyle = '#ff5f8f';
      c.strokeStyle = MP.COLORS.outline;
      c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(hx, hy + r * 1.1);
      c.bezierCurveTo(hx - r * 1.8, hy - r * 0.2, hx - r * 0.9, hy - r * 1.6, hx, hy - r * 0.5);
      c.bezierCurveTo(hx + r * 0.9, hy - r * 1.6, hx + r * 1.8, hy - r * 0.2, hx, hy + r * 1.1);
      c.fill(); c.stroke();
      c.restore();
    }
  };

  // The pet's own little word over its head ("Purrr…", "Hau!")
  MP.drawPetWord = function (c, x, y, age, word) {
    if (age < 0 || age > 1.5 || !word) return;
    c.save();
    c.globalAlpha = MP.clamp((1.5 - age) * 2, 0, 1);
    MP.drawText(c, word, x, y - age * 6, { size: 0.75, color: '#ffffff', outline: MP.COLORS.outline, align: 'center' });
    c.restore();
  };

  MP.petWord = () => ((MP.myPet() || {}).kind === 'dog' ? 'Hau hau!' : 'Purrr…');

  // ---------------------------------------------------------------------------
  // The choosing panel: kitten or puppy, then a name. Used in the home.
  // ---------------------------------------------------------------------------
  const kindCard = (i) => ({ x: 70 + i * 96, y: 46, w: 84, h: 84 });
  const nameBtn = (i) => ({ x: 46 + i * 58, y: 104, w: 52, h: 24 });

  MP.petPicker = {
    open() { return { step: 'kind', kind: null, from: MP.time }; },
    // returns true when the choice is finished
    tap(p, x, y) {
      if (MP.time - p.from < 0.3) return false;
      if (p.step === 'kind') {
        MP.PET_KINDS.forEach((k, i) => {
          if (MP.hit(kindCard(i), x, y)) {
            p.kind = k.id;
            p.step = 'name';
            p.from = MP.time;
            MP.petSound(k.id);
          }
        });
        return false;
      }
      for (let i = 0; i < MP.PET_NAMES.length; i++) {
        if (MP.hit(nameBtn(i), x, y)) {
          MP.state.pet = { kind: p.kind, name: MP.PET_NAMES[i] };
          MP.save();
          MP.sfx.bling();
          return true;
        }
      }
      return false;
    },
    draw(c, p) {
      const t = MP.time;
      const O = MP.COLORS.outline;
      c.save();
      c.globalAlpha = MP.clamp((t - p.from) * 5, 0, 1);
      c.fillStyle = 'rgba(13,20,51,0.55)';
      c.fillRect(0, 0, MP.W, MP.H);
      c.globalAlpha = 1;
      c.lineWidth = 1;
      c.strokeStyle = O;
      c.fillStyle = '#fff7e0';
      MP.roundRect(c, 36, 14, 248, 130, 10); c.fill(); c.stroke();
      if (p.step === 'kind') {
        MP.drawText(c, 'Saat oman lemmikin!', MP.W / 2, 22, { size: 1.2, color: '#e0559a', align: 'center' });
        MP.drawText(c, 'Kumman haluat?', MP.W / 2, 35, { size: 0.85, color: O, align: 'center' });
        MP.PET_KINDS.forEach((k, i) => {
          const r = kindCard(i);
          c.lineWidth = 0.9; c.strokeStyle = O; c.fillStyle = '#ffffff';
          MP.roundRect(c, r.x, r.y, r.w, r.h, 6); c.fill(); c.stroke();
          MP.drawPet(c, r.x + r.w / 2 - 2, r.y + 62, { kind: k.id, scale: 3, happy: (Math.sin(t * 2 + i * 2) + 1) / 4 });
          MP.drawText(c, k.name, r.x + r.w / 2, r.y + 68, { size: 0.85, color: O, align: 'center' });
        });
      } else {
        MP.drawText(c, 'Mikä nimi lemmikille?', MP.W / 2, 22, { size: 1.2, color: '#e0559a', align: 'center' });
        MP.drawPet(c, MP.W / 2, 96, { kind: p.kind, scale: 3.2, happy: 0.4 });
        MP.PET_NAMES.forEach((n, i) => {
          MP.drawButton(c, n, nameBtn(i), { size: 0.95, color: ['#4a78c8', '#e0559a', '#3cb371', '#e07a3a'][i] });
        });
      }
      c.restore();
    },
  };

  // ---------------------------------------------------------------------------
  // A pet that follows the character in a 3D place (a flat picture like the character)
  // ---------------------------------------------------------------------------
  MP.petBuddy = function (scene, clickables) {
    const W3 = MP.w3d, T = W3.T;
    const CW = 34, CH = 26, FEET = 23, K = W3.PERSON_M / 42;   // drawing units → meters
    const b = { p: { x: 0, z: 0 }, walking: false, walkTime: 0, flip: false, happyFrom: -9 };
    b.canvas = document.createElement('canvas');
    b.canvas.width = CW * 3;
    b.canvas.height = CH * 3;
    b.tex = new T.CanvasTexture(b.canvas);
    b.sprite = new T.Sprite(new T.SpriteMaterial({ map: b.tex, transparent: true }));
    b.sprite.scale.set(CW * K, CH * K, 1);
    b.sprite.center.set(0.5, (CH - FEET) / CH);
    b.sprite.userData.spot = 'pet';
    scene.add(b.sprite);
    if (clickables) clickables.push(b.sprite);
    b.shadow = new T.Mesh(new T.CircleGeometry(0.26, 16),
      new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 }));
    b.shadow.rotation.x = -Math.PI / 2;
    scene.add(b.shadow);

    b.setVisible = (v) => { b.sprite.visible = v; b.shadow.visible = v; };
    b.place = (x, z) => { b.p.x = x; b.p.z = z; };
    b.pat = () => { b.happyFrom = MP.time; MP.petSound(); };

    // Follows `self` (a 3D scene with p = { x, z, heading }); stays when stay = true
    b.update = function (dt, self, stay) {
      const pet = MP.myPet();
      b.setVisible(!!pet);
      if (!pet) return;
      const p = self.p;
      const tx = p.x - Math.sin(p.heading) * 0.9 + Math.cos(p.heading) * 0.55;
      const tz = p.z + Math.cos(p.heading) * 0.9 + Math.sin(p.heading) * 0.55;
      const dx = tx - b.p.x, dz = tz - b.p.z;
      const d = Math.hypot(dx, dz);
      b.walking = false;
      if (!stay && d > 20) {
        b.place(tx - dx / d * 5, tz - dz / d * 5);            // came running from far away
      } else if (!stay && d > 0.25) {
        const step = Math.min(d, (d > 3 ? 6.5 : 3.6) * dt);
        const ox = b.p.x;
        b.p.x += dx / d * step;
        b.p.z += dz / d * step;
        b.walking = true;
        b.walkTime += dt;
        // which way it looks on the screen
        if (W3.camera) {
          const a = W3.toScreen(new T.Vector3(ox, 0.2, b.p.z - dz / d * step), W3.camera);
          const c2 = W3.toScreen(new T.Vector3(b.p.x, 0.2, b.p.z), W3.camera);
          if (Math.abs(c2.x - a.x) > 0.01) b.flip = c2.x < a.x;
        }
      }
      const c = b.canvas.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, b.canvas.width, b.canvas.height);
      c.setTransform(3, 0, 0, 3, 0, 0);
      const age = MP.time - b.happyFrom;
      MP.drawPet(c, CW / 2, FEET, {
        kind: pet.kind, flip: b.flip, walking: b.walking, walkTime: b.walkTime,
        sit: !b.walking && age > 1.2, happy: age < 1.2 ? 1 - age / 1.2 : 0,
      });
      b.tex.needsUpdate = true;
      b.sprite.position.set(b.p.x, 0, b.p.z);
      b.shadow.position.set(b.p.x, 0.03, b.p.z);
    };

    // Hearts and the word, on the game canvas
    b.draw2d = function (ctx, camera) {
      if (!MP.myPet() || !b.sprite.visible) return;
      const age = MP.time - b.happyFrom;
      if (age > 1.6) return;
      const s = W3.toScreen(new T.Vector3(b.p.x, 0.75, b.p.z), camera);
      MP.drawPetHearts(ctx, s.x, s.y, age);
      MP.drawPetWord(ctx, s.x, s.y - 6, age, MP.petWord());
    };
    return b;
  };
})();
