// engine.js – canvas and scaling, touch/mouse input, game loop, scene switching,
// saving, text, speech bubbles, buttons and sounds.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  // The game world is always 320×180 "game units". The canvas is drawn at the
  // screen's real resolution and scaled, so all drawings stay smooth and sharp.
  const W = 320, H = 180;
  MP.W = W;
  MP.H = H;
  MP.scenes = MP.scenes || {};
  MP.time = 0; // seconds since the game started

  // ---------- Small helpers ----------
  MP.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  MP.lerp = (a, b, t) => a + (b - a) * t;
  MP.hit = (r, x, y) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

  // Mixes two '#rrggbb' colors: t = 0 gives a, t = 1 gives b.
  MP.mixColor = function (a, b, t) {
    t = MP.clamp(t, 0, 1);
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (p, s) => (p >> s) & 255;
    const mix = (s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t);
    return 'rgb(' + mix(16) + ',' + mix(8) + ',' + mix(0) + ')';
  };

  // =========================================================================
  // Canvas and scaling
  // =========================================================================
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  MP.canvas = canvas;
  MP.ctx = ctx;
  MP.scale = 1; // CSS pixels per game unit

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const s = Math.min(innerWidth / W, innerHeight / H);
    MP.scale = s;
    canvas.style.width = Math.floor(W * s) + 'px';
    canvas.style.height = Math.floor(H * s) + 'px';
    canvas.width = Math.max(1, Math.round(W * s * dpr));
    canvas.height = Math.max(1, Math.round(H * s * dpr));
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // Sets ctx so that drawing uses game units (0..320 × 0..180).
  MP.gameTransform = function (c) {
    const k = canvas.width / W;
    (c || ctx).setTransform(k, 0, 0, k, 0, 0);
  };

  // =========================================================================
  // Input (Pointer Events = mouse, touch and pen with the same code)
  //
  // Scenes may have these functions (all get game coordinates):
  //   onPointerDown(x, y), onPointerMove(x, y), onPointerUp(x, y), onTap(x, y)
  // A "tap" is a press that moved less than TAP_SLOP game units.
  // =========================================================================
  const TAP_SLOP = 4;
  MP.pointer = { x: -100, y: -100, down: false };
  let active = null; // the finger/mouse button we are following

  function toGame(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * W / r.width,
      y: (e.clientY - r.top) * H / r.height,
    };
  }

  // Speech bubbles stay on the screen until the next tap. A tap closes the
  // bubbles that are showing (and still does its normal job too).
  MP.closeBubbles = function (s) {
    if (!s) return;
    for (const k of ['bubble', 'parentBubble', 'mummyBubble']) {
      const b = s[k];
      if (b && MP.time >= (b.from || 0)) s[k] = null;
    }
  };

  function callScene(name, x, y) {
    const s = MP.scene;
    if (!s || !s[name] || fade.active) return; // no input during fades
    try {
      s[name](x, y);
    } catch (err) {
      reportError(err);
    }
  }

  // ---------- The restart button (like the browser's refresh button) ----------
  // Top-right corner. It asks first: "Start from the beginning?"
  const RESTART = { x: 309, y: 11, r: 8 };
  const ASK = { x: 70, y: 52, w: 180, h: 76 };
  const ASK_YES = { x: 86, y: 98, w: 66, h: 22 };
  const ASK_NO = { x: 168, y: 98, w: 66, h: 22 };
  MP.restartAsk = false;
  const restartShown = () => {
    const s = MP.scene;
    return !!s && s !== MP.scenes.start && !s.noRestart && !fade.active;
  };
  const onRestart = (x, y) => restartShown() && Math.hypot(x - RESTART.x, y - RESTART.y) < RESTART.r + 4;

  MP.restartGame = function () {
    // Load the page again without a #shortcut: the game starts from the start screen.
    // (The character, clothes and the souvenirs are saved and stay.)
    try {
      location.replace(location.href.split('#')[0]);
    } catch (_) {
      location.reload();
    }
  };

  // The engine's own taps (restart button, the question, the hero). true = used.
  function engineTap(x, y) {
    if (MP.restartAsk) {
      if (MP.hit(ASK_YES, x, y)) { MP.sfx.tap(); MP.restartGame(); }
      else if (MP.hit(ASK_NO, x, y) || !MP.hit(ASK, x, y)) { MP.sfx.tap(); MP.restartAsk = false; }
      return true;
    }
    if (onRestart(x, y)) {
      MP.sfx.tap();
      MP.restartAsk = true;
      return true;
    }
    if (!fade.active && MP.heroTap && MP.heroTap(x, y)) {
      MP.closeBubbles(MP.scene);
      return true;
    }
    return false;
  }

  function drawRestart(c) {
    if (!restartShown() && !MP.restartAsk) return;
    c.save();
    if (!MP.restartAsk) {
      const { x, y, r } = RESTART;
      c.lineWidth = 0.8;
      c.strokeStyle = '#2b2340';
      c.fillStyle = 'rgba(255,247,224,0.85)';
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.stroke();
      // a circle arrow, like the refresh button
      c.lineWidth = 1.6;
      c.lineCap = 'round';
      c.beginPath(); c.arc(x, y, 4.2, -Math.PI * 0.3, Math.PI * 1.45); c.stroke();
      c.fillStyle = '#2b2340';
      const ax = x + Math.cos(-Math.PI * 0.3) * 4.2, ay = y + Math.sin(-Math.PI * 0.3) * 4.2;
      c.beginPath(); c.moveTo(ax + 2.4, ay + 1.2); c.lineTo(ax - 2.6, ay + 0.4); c.lineTo(ax + 0.6, ay - 3.4); c.closePath(); c.fill();
    } else {
      c.fillStyle = 'rgba(13,20,51,0.55)';
      c.fillRect(0, 0, W, H);
      c.lineWidth = 1;
      c.strokeStyle = '#2b2340';
      c.fillStyle = '#fff7e0';
      MP.roundRect(c, ASK.x, ASK.y, ASK.w, ASK.h, 8); c.fill(); c.stroke();
      MP.drawText(c, 'Aloitetaanko alusta?', W / 2, ASK.y + 12, { size: 1.15, color: '#2b2340', align: 'center' });
      MP.drawText(c, 'Peli alkaa ihan alusta.', W / 2, ASK.y + 28, { size: 0.75, color: '#6b5f80', align: 'center' });
      MP.drawButton(c, 'Kyllä', ASK_YES, { size: 1 });
      MP.drawButton(c, 'Ei', ASK_NO, { size: 1, color: '#e0559a', shade: '#a8326c' });
    }
    c.restore();
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    MP.audio.unlock();
    if (active) return; // ignore a second finger
    const p = toGame(e);
    active = { id: e.pointerId, sx: p.x, sy: p.y, moved: 0 };
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* not important */ }
    MP.pointer.x = p.x;
    MP.pointer.y = p.y;
    MP.pointer.down = true;
    // the restart button and its question are not for the scene
    active.engine = MP.restartAsk || onRestart(p.x, p.y);
    if (!active.engine) callScene('onPointerDown', p.x, p.y);
  });

  canvas.addEventListener('pointermove', (e) => {
    const p = toGame(e);
    if (!active) {
      // Mouse hovering without a button pressed: just remember where it is.
      MP.pointer.x = p.x;
      MP.pointer.y = p.y;
      return;
    }
    if (e.pointerId !== active.id) return;
    active.moved = Math.max(active.moved, Math.hypot(p.x - active.sx, p.y - active.sy));
    MP.pointer.x = p.x;
    MP.pointer.y = p.y;
    if (!active.engine) callScene('onPointerMove', p.x, p.y);
  });

  function endPointer(e, cancelled) {
    if (!active || e.pointerId !== active.id) return;
    const p = toGame(e);
    const wasTap = !cancelled && active.moved < TAP_SLOP;
    const engineOwned = active.engine;
    active = null;
    MP.pointer.down = false;
    MP.audio.unlock(); // iPad Safari likes sound to be started on "up"
    if (engineOwned) {
      if (wasTap) engineTap(p.x, p.y);
      return;
    }
    callScene('onPointerUp', p.x, p.y);
    if (wasTap && engineTap(p.x, p.y)) return;
    if (wasTap) {
      if (!fade.active) MP.closeBubbles(MP.scene);
      callScene('onTap', p.x, p.y);
    }
  }
  canvas.addEventListener('pointerup', (e) => endPointer(e, false));
  canvas.addEventListener('pointercancel', (e) => endPointer(e, true));
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // =========================================================================
  // Scenes and fades
  //
  // A scene is an object with (all optional):
  //   enter(params), exit(), update(dt), draw(ctx) and the input functions.
  // MP.goTo(scene, params) fades to black, switches, and fades back in.
  // =========================================================================
  const FADE_TIME = 0.3;
  const fade = { active: false, phase: null, t: 0, next: null, params: null };
  MP.scene = null;

  function enterScene(scene, params) {
    if (MP.scene && MP.scene.exit) {
      try { MP.scene.exit(); } catch (err) { reportError(err); }
    }
    MP.scene = scene;
    active = null;
    MP.pointer.down = false;
    if (scene.enter) {
      try { scene.enter(params || {}); } catch (err) { reportError(err); }
    }
  }

  MP.goTo = function (scene, params) {
    if (typeof scene === 'string') scene = MP.scenes[scene];
    if (!scene) {
      console.error('MP.goTo: unknown scene');
      return;
    }
    if (!MP.scene) {
      // The very first scene: show it right away and fade in.
      enterScene(scene, params);
      Object.assign(fade, { active: true, phase: 'in', t: 0 });
      return;
    }
    if (fade.active && fade.phase === 'out') return; // already leaving
    // If we were still fading in, continue from the current darkness.
    const startT = fade.active ? FADE_TIME * fadeAlpha() : 0;
    Object.assign(fade, { active: true, phase: 'out', t: startT, next: scene, params: params });
  };

  MP.isFading = () => fade.active;

  function updateFade(dt) {
    if (!fade.active) return;
    fade.t += dt;
    if (fade.phase === 'out' && fade.t >= FADE_TIME) {
      const next = fade.next, params = fade.params;
      Object.assign(fade, { phase: 'in', t: 0, next: null, params: null });
      enterScene(next, params);
    } else if (fade.phase === 'in' && fade.t >= FADE_TIME) {
      Object.assign(fade, { active: false, phase: null, t: 0 });
    }
  }

  function fadeAlpha() {
    if (!fade.active) return 0;
    const k = Math.min(1, fade.t / FADE_TIME);
    return fade.phase === 'out' ? k : 1 - k;
  }

  // =========================================================================
  // Game loop
  // =========================================================================
  let lastErrorText = '';
  function reportError(err) {
    // Show each different error once, but keep the game running.
    const text = String(err && err.stack || err);
    if (text !== lastErrorText) {
      lastErrorText = text;
      console.error(err);
    }
  }

  let lastTime = 0;
  function frame(now) {
    // dt is capped so a tablet waking from sleep doesn't make things jump.
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
    lastTime = now;
    MP.time += dt;

    updateFade(dt);
    const s = MP.scene;
    MP.heroSpot = null;     // the hero's place on screen, set again when it is drawn
    try {
      if (s && s.update && !MP.restartAsk) s.update(dt);
    } catch (err) {
      reportError(err);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    if (s && s.transparent) {
      // A 3D scene is drawn on another canvas below this one
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    MP.gameTransform();
    ctx.imageSmoothingEnabled = true;
    try {
      if (s && s.draw) {
        ctx.save();
        s.draw(ctx);
        ctx.restore();
      }
    } catch (err) {
      reportError(err);
    }

    MP.gameTransform();
    try { drawRestart(ctx); } catch (err) { reportError(err); }

    const a = fadeAlpha();
    if (a > 0) {
      MP.gameTransform();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }

  MP.start = function (scene, params) {
    resize();
    MP.goTo(scene, params);
    requestAnimationFrame(frame);
  };

  // =========================================================================
  // Saving (character and clothes). localStorage can fail, so always try/catch.
  // =========================================================================
  const SAVE_KEY = 'matkapeli.v1';
  MP.state = {
    character: null,                                          // 'girl' or 'boy'
    outfit: { shirt: null, bottom: null, hat: null, costume: null },
    quest: 'wake',                                            // 'wake' = coming from the start screen
    tasks: null,                                              // morning tasks done (set in home.js)
    evening: false,                                           // true after coming back home
    treasures: {},                                            // things found on trips (tutMask)
  };

  MP.save = function () {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        character: MP.state.character,
        outfit: MP.state.outfit,
        treasures: MP.state.treasures,
      }));
      return true;
    } catch (_) {
      return false;
    }
  };

  // A poster from every country you visit goes to your own room.
  // Returns true the first time.
  MP.collectPoster = function (id) {
    MP.state.treasures = MP.state.treasures || {};
    const posters = MP.state.treasures.posters = MP.state.treasures.posters || {};
    if (posters[id]) return false;
    posters[id] = true;
    MP.save();
    return true;
  };

  // ---------- Superhero tricks ----------
  // Tap the middle of your hero costume:
  //   Rautasankari: fly ⇄ walk
  //   spider suits: aim (web-shooting hand) → shoot webs → normal
  MP.heroKind = function () {
    const c = MP.findItem && MP.findItem('costume', MP.state.outfit.costume);
    return c && c.id !== 'none' ? (c.type || c.id) : null;
  };
  MP.heroPose = function () {
    const hp = MP.state.heroPose;
    if (!hp || hp.costume !== MP.state.outfit.costume) return null;
    return hp.pose;
  };
  // How high the flying hero floats (in drawPerson units)
  MP.heroLift = function () {
    return MP.heroPose() === 'fly' ? 13 + Math.sin(MP.time * 3) * 1.2 : 0;
  };
  MP.heroTap = function (x, y) {
    const k = MP.heroKind();
    if (k !== 'iron' && k !== 'spider') return false;
    let spot = MP.heroSpot;
    if (typeof spot === 'function') spot = spot();
    if (!spot || Math.abs(x - spot.x) > spot.rx || Math.abs(y - spot.y) > spot.ry) return false;
    const now = MP.heroPose();
    const order = k === 'iron' ? [null, 'fly'] : [null, 'aim', 'web'];
    const next = order[(order.indexOf(now) + 1) % order.length];
    MP.state.heroPose = next ? { costume: MP.state.outfit.costume, pose: next, from: MP.time } : null;
    if (next === 'fly') MP.sfx.rocket();
    else if (next === 'web') MP.sfx.thwip();
    else MP.sfx.tap();
    return true;
  };

  MP.load = function () {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.character === 'girl' || data.character === 'boy') MP.state.character = data.character;
      if (data.outfit && typeof data.outfit === 'object') Object.assign(MP.state.outfit, data.outfit);
      if (data.treasures && typeof data.treasures === 'object') MP.state.treasures = data.treasures;
      return true;
    } catch (_) {
      return false;
    }
  };

  // =========================================================================
  // Text (a rounded font). size 1 = 8 game units tall letters.
  // =========================================================================
  MP.FONT_FAMILY = '"Comic Sans MS", "Chalkboard SE", "Comic Neue", "Trebuchet MS", sans-serif';
  MP.LINE_H = 10; // line height for size 1

  function setFont(c, size) {
    c.font = 'bold ' + (8 * size) + 'px ' + MP.FONT_FAMILY;
  }

  MP.measureText = function (str, size) {
    size = size || 1;
    ctx.save();
    setFont(ctx, size);
    const w = ctx.measureText(String(str)).width;
    ctx.restore();
    return w;
  };

  // MP.drawText(ctx, 'Hei!', x, y, { color, size, align: 'left'|'center'|'right', shadow, outline })
  // (x, y) is the top-left corner (or top-center / top-right).
  MP.drawText = function (c, str, x, y, opts) {
    opts = opts || {};
    const size = opts.size || 1;
    str = String(str);
    c.save();
    setFont(c, size);
    c.textAlign = opts.align || 'left';
    c.textBaseline = 'top';
    c.lineJoin = 'round';
    if (opts.outline) {
      c.strokeStyle = opts.outline;
      c.lineWidth = 2.2 * size;
      c.strokeText(str, x, y);
    }
    if (opts.shadow) {
      c.fillStyle = opts.shadow;
      c.fillText(str, x + 0.7 * size, y + 0.7 * size);
    }
    c.fillStyle = opts.color || '#fff';
    c.fillText(str, x, y);
    const w = c.measureText(str).width;
    c.restore();
    return w;
  };

  // Splits text into lines that fit into maxWidth.
  MP.wrapText = function (str, maxWidth, size) {
    const words = String(str).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (line && MP.measureText(test, size) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  // Rounded rectangle path
  MP.roundRect = function (c, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  };

  // Speech bubble whose tail tip points at (tipX, tipY).
  MP.drawBubble = function (c, text, tipX, tipY, opts) {
    opts = opts || {};
    const size = opts.size || 1;
    const pad = 5;
    const lines = MP.wrapText(text, opts.maxWidth || 140, size);
    const textW = Math.max(...lines.map((l) => MP.measureText(l, size)));
    const w = textW + pad * 2;
    const h = lines.length * MP.LINE_H * size + pad * 2 - 2 * size;
    const bx = MP.clamp(tipX - w / 2, 2, W - w - 2);
    const by = Math.max(2, tipY - 6 - h);
    const tx = MP.clamp(tipX, bx + 8, bx + w - 8);
    const r = 6;

    c.save();
    c.lineWidth = 0.8;
    c.lineJoin = 'round';
    c.strokeStyle = opts.border || '#2b2340';
    c.fillStyle = opts.bg || '#ffffff';
    c.beginPath();
    c.moveTo(bx + r, by);
    c.arcTo(bx + w, by, bx + w, by + h, r);
    c.arcTo(bx + w, by + h, bx, by + h, r);
    c.lineTo(tx + 4, by + h);
    c.lineTo(tipX, tipY);
    c.lineTo(tx - 4, by + h);
    c.arcTo(bx, by + h, bx, by, r);
    c.arcTo(bx, by, bx + w, by, r);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();

    lines.forEach((line, i) => {
      MP.drawText(c, line, bx + w / 2, by + pad + i * MP.LINE_H * size, {
        color: opts.color || '#2b2340', size, align: 'center',
      });
    });
  };

  // A big round button. rect = { x, y, w, h }. Looks pressed while held down.
  MP.drawButton = function (c, label, rect, opts) {
    opts = opts || {};
    const size = opts.size || 1;
    const disabled = !!opts.disabled;
    const face = disabled ? '#a9a9b8' : (opts.color || '#3cb371');
    const dark = disabled ? '#77778a' : (opts.shade || '#1f7a4a');
    const pressed = !disabled && MP.pointer.down && MP.hit(rect, MP.pointer.x, MP.pointer.y);
    const dy = pressed ? 2 : 0;
    const { x, y, w, h } = rect;
    const r = Math.min(8, h / 2);

    c.save();
    c.lineWidth = 0.8;
    c.strokeStyle = '#2b2340';
    MP.roundRect(c, x, y + 2, w, h - 2, r);
    c.fillStyle = dark;
    c.fill();
    c.stroke();
    MP.roundRect(c, x, y + dy, w, h - 2, r);
    c.fillStyle = face;
    c.fill();
    c.stroke();
    c.restore();
    MP.drawText(c, label, x + w / 2, y + dy + (h - 2 - 8 * size) / 2, {
      color: disabled ? '#e4e4ec' : '#ffffff',
      size,
      align: 'center',
      shadow: disabled ? null : dark,
    });
  };

  // =========================================================================
  // Sounds, made with WebAudio (no sound files).
  // Browsers only allow sound after the first tap, so unlock() is called on taps.
  // =========================================================================
  const audio = { ctx: null, master: null, noise: null, unlocked: false, lastBrush: 0 };
  MP.audio = audio;

  audio.unlock = function () {
    try {
      if (!audio.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audio.ctx = new AC();
        audio.master = audio.ctx.createGain();
        audio.master.gain.value = 0.6;
        audio.master.connect(audio.ctx.destination);
      }
      if (audio.ctx.state === 'suspended') audio.ctx.resume();
      if (!audio.unlocked) {
        // Playing one silent sample wakes up sound on iPads.
        const b = audio.ctx.createBuffer(1, 1, 22050);
        const src = audio.ctx.createBufferSource();
        src.buffer = b;
        src.connect(audio.ctx.destination);
        src.start(0);
        audio.unlocked = true;
      }
    } catch (_) { /* no sound, no problem */ }
  };

  function ready() {
    return audio.ctx && audio.ctx.state !== 'closed';
  }

  function tone(freq, when, dur, type, vol) {
    const ac = audio.ctx;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noiseBuffer() {
    if (!audio.noise) {
      const ac = audio.ctx;
      const len = Math.floor(ac.sampleRate * 0.2);
      const b = ac.createBuffer(1, len, ac.sampleRate);
      const data = b.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      audio.noise = b;
    }
    return audio.noise;
  }

  MP.sfx = {
    // Whoosh of rocket boots
    rocket() {
      if (!ready()) return;
      try {
        const a = audio.ctx, t0 = a.currentTime;
        const src = a.createBufferSource();
        src.buffer = noiseBuffer();
        const f = a.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.setValueAtTime(300, t0);
        f.frequency.exponentialRampToValueAtTime(1800, t0 + 0.6);
        const g = a.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.1);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
        src.connect(f); f.connect(g); g.connect(audio.master);
        src.loop = true; src.start(t0); src.stop(t0 + 0.75);
      } catch (_) {}
    },
    // "Thwip!" – the web shoots out
    thwip() {
      if (!ready()) return;
      try {
        tone(1800, 0, 0.06, 'square', 0.12);
        tone(1200, 0.04, 0.08, 'triangle', 0.2);
        tone(700, 0.1, 0.12, 'triangle', 0.15);
      } catch (_) {}
    },
    // Short click for buttons and choices
    tap() {
      if (!ready()) return;
      try { tone(660, 0, 0.08, 'triangle', 0.3); } catch (_) {}
    },
    // Happy "bling" for success
    bling() {
      if (!ready()) return;
      try {
        tone(880, 0, 0.15, 'triangle', 0.35);
        tone(1320, 0.1, 0.2, 'triangle', 0.35);
        tone(1760, 0.2, 0.35, 'triangle', 0.3);
      } catch (_) {}
    },
    // Duck on TV: "kvaak!"
    quack() {
      if (!ready()) return;
      try {
        tone(380, 0, 0.11, 'sawtooth', 0.12);
        tone(320, 0.12, 0.13, 'sawtooth', 0.12);
      } catch (_) {}
    },
    // TV switching off: a short falling "pew"
    tvOff() {
      if (!ready()) return;
      try {
        const ac = audio.ctx;
        const t0 = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, t0);
        osc.frequency.exponentialRampToValueAtTime(80, t0 + 0.3);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
        osc.connect(gain);
        gain.connect(audio.master);
        osc.start(t0);
        osc.stop(t0 + 0.35);
      } catch (_) {}
    },
    // Alarm clock: "rrring!" (fast beeps for a moment)
    alarm() {
      if (!ready()) return;
      try {
        for (let i = 0; i < 8; i++) tone(i % 2 ? 1250 : 1400, i * 0.09, 0.07, 'square', 0.1);
      } catch (_) {}
    },
    // "Nom nom" when eating
    nom() {
      if (!ready()) return;
      try {
        tone(220, 0, 0.07, 'square', 0.12);
        tone(180, 0.09, 0.08, 'square', 0.12);
      } catch (_) {}
    },
    // "Glub" when drinking
    gulp() {
      if (!ready()) return;
      try {
        const ac = audio.ctx;
        const t0 = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, t0);
        osc.frequency.exponentialRampToValueAtTime(180, t0 + 0.15);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
        osc.connect(gain);
        gain.connect(audio.master);
        osc.start(t0);
        osc.stop(t0 + 0.2);
      } catch (_) {}
    },
    // Toilet flush: rushing water that fades away
    flush() {
      if (!ready()) return;
      try {
        const ac = audio.ctx;
        const t0 = ac.currentTime;
        const src = ac.createBufferSource();
        src.buffer = noiseBuffer();
        src.loop = true;
        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500, t0);
        filter.frequency.exponentialRampToValueAtTime(250, t0 + 1.3);
        const gain = ac.createGain();
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.4, t0 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(audio.master);
        src.start(t0);
        src.stop(t0 + 1.45);
      } catch (_) {}
    },
    // Sleepy yawn: a wobbly sliding-down sound
    yawn() {
      if (!ready()) return;
      try {
        const ac = audio.ctx;
        const t0 = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const lfo = ac.createOscillator();
        const lfoGain = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, t0);
        osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.9);
        lfo.frequency.value = 6;
        lfoGain.gain.value = 12;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.0);
        osc.connect(gain);
        gain.connect(audio.master);
        osc.start(t0);
        lfo.start(t0);
        osc.stop(t0 + 1.05);
        lfo.stop(t0 + 1.05);
      } catch (_) {}
    },
    // A little tune (for the band poster)
    tune() {
      if (!ready()) return;
      try {
        const notes = [523, 659, 784, 659, 880, 784, 1047];
        notes.forEach((f, i) => tone(f, i * 0.14, 0.18, 'square', 0.12));
      } catch (_) {}
    },
    // Funny "boing" for toys
    boing() {
      if (!ready()) return;
      try {
        const ac = audio.ctx;
        const t0 = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t0);
        osc.frequency.exponentialRampToValueAtTime(700, t0 + 0.12);
        osc.frequency.exponentialRampToValueAtTime(400, t0 + 0.25);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
        osc.connect(gain);
        gain.connect(audio.master);
        osc.start(t0);
        osc.stop(t0 + 0.35);
      } catch (_) {}
    },
    // "Kukkokiekuu!" – four notes, the last one long and sliding down
    rooster() {
      if (!ready()) return;
      try {
        const ac = audio.ctx;
        const notes = [[520, 0, 0.12], [620, 0.15, 0.12], [740, 0.31, 0.14], [930, 0.5, 0.55]];
        for (const [f, when, dur] of notes) {
          const t0 = ac.currentTime + when;
          const osc = ac.createOscillator();
          const filter = ac.createBiquadFilter();
          const gain = ac.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, t0);
          if (dur > 0.3) osc.frequency.exponentialRampToValueAtTime(f * 0.72, t0 + dur);
          filter.type = 'lowpass';
          filter.frequency.value = 1800;
          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(audio.master);
          osc.start(t0);
          osc.stop(t0 + dur + 0.05);
        }
      } catch (_) {}
    },
    // "Sh" sound of the toothbrush (plays at most ~12 times a second)
    brush() {
      if (!ready()) return;
      try {
        const ac = audio.ctx;
        if (ac.currentTime - audio.lastBrush < 0.08) return;
        audio.lastBrush = ac.currentTime;
        const t0 = ac.currentTime;
        const src = ac.createBufferSource();
        src.buffer = noiseBuffer();
        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2500 + Math.random() * 1500;
        filter.Q.value = 1;
        const gain = ac.createGain();
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(audio.master);
        src.start(t0);
        src.stop(t0 + 0.15);
      } catch (_) {}
    },
  };
})();
