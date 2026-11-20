// engine.js – canvas and scaling, touch/mouse input, game loop, scene switching,
// saving, pixel text, speech bubbles, buttons and sounds.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  // The game is drawn on a small 320×180 canvas that is scaled up.
  const W = 320, H = 180;
  MP.W = W;
  MP.H = H;
  MP.scenes = MP.scenes || {};
  MP.time = 0; // seconds since the game started

  // ---------- Small helpers ----------
  MP.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  MP.lerp = (a, b, t) => a + (b - a) * t;
  MP.hit = (r, x, y) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

  // =========================================================================
  // Canvas and scaling
  // =========================================================================
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  MP.canvas = canvas;
  MP.ctx = ctx;
  MP.pixelScale = 1; // how many screen pixels one game pixel is

  function resize() {
    // Use real device pixels so every game pixel is exactly N×N screen pixels.
    const dpr = window.devicePixelRatio || 1;
    const s = Math.max(1, Math.floor(Math.min(innerWidth * dpr / W, innerHeight * dpr / H)));
    MP.pixelScale = s;
    canvas.style.width = (W * s / dpr) + 'px';
    canvas.style.height = (H * s / dpr) + 'px';
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // =========================================================================
  // Input (Pointer Events = mouse, touch and pen with the same code)
  //
  // Scenes may have these functions (all get game coordinates):
  //   onPointerDown(x, y), onPointerMove(x, y), onPointerUp(x, y), onTap(x, y)
  // A "tap" is a press that moved less than TAP_SLOP game pixels.
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

  function callScene(name, x, y) {
    const s = MP.scene;
    if (!s || !s[name] || fade.active) return; // no input during fades
    try {
      s[name](x, y);
    } catch (err) {
      reportError(err);
    }
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
    callScene('onPointerDown', p.x, p.y);
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
    callScene('onPointerMove', p.x, p.y);
  });

  function endPointer(e, cancelled) {
    if (!active || e.pointerId !== active.id) return;
    const p = toGame(e);
    const wasTap = !cancelled && active.moved < TAP_SLOP;
    active = null;
    MP.pointer.down = false;
    MP.audio.unlock(); // iPad Safari likes sound to be started on "up"
    callScene('onPointerUp', p.x, p.y);
    if (wasTap) callScene('onTap', p.x, p.y);
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
    try {
      if (s && s.update) s.update(dt);
    } catch (err) {
      reportError(err);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    try {
      if (s && s.draw) s.draw(ctx);
    } catch (err) {
      reportError(err);
    }

    const a = fadeAlpha();
    if (a > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
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
    character: null,                               // 'girl' or 'boy'
    outfit: { shirt: null, bottom: null, hat: null },
    quest: 'wake',                                 // where we are in the story
  };

  MP.save = function () {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        character: MP.state.character,
        outfit: MP.state.outfit,
      }));
      return true;
    } catch (_) {
      return false;
    }
  };

  MP.load = function () {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.character === 'girl' || data.character === 'boy') MP.state.character = data.character;
      if (data.outfit && typeof data.outfit === 'object') Object.assign(MP.state.outfit, data.outfit);
      return true;
    } catch (_) {
      return false;
    }
  };

  // =========================================================================
  // Pixel text (letters come from MP.FONT in sprites.js)
  // =========================================================================
  MP.LINE_H = 9; // line height in game pixels (7 for the letter + 2 gap)
  const glyphCache = {};

  function glyphOf(ch) {
    return MP.FONT[ch] ? ch : '?';
  }

  function glyphCanvas(ch, color) {
    const key = ch + '|' + color;
    let c = glyphCache[key];
    if (c) return c;
    const rows = MP.FONT[ch];
    c = document.createElement('canvas');
    c.width = rows[0].length;
    c.height = rows.length;
    const g = c.getContext('2d');
    g.fillStyle = color;
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row[x] !== '.') g.fillRect(x, y, 1, 1);
      }
    });
    glyphCache[key] = c;
    return c;
  }

  MP.measureText = function (str, size) {
    size = size || 1;
    const s = String(str).toUpperCase();
    let w = 0;
    for (const ch of s) w += MP.FONT[glyphOf(ch)][0].length + 1;
    return Math.max(0, w - 1) * size;
  };

  // MP.drawText(ctx, 'Hei!', x, y, { color, size, align: 'left'|'center'|'right', shadow })
  // (x, y) is the top-left corner (or top-center / top-right).
  MP.drawText = function (ctx, str, x, y, opts) {
    opts = opts || {};
    const size = opts.size || 1;
    const color = opts.color || '#fff';
    const s = String(str).toUpperCase();
    const w = MP.measureText(s, size);
    if (opts.align === 'center') x -= w / 2;
    else if (opts.align === 'right') x -= w;
    x = Math.round(x);
    y = Math.round(y);
    if (opts.shadow) {
      drawLetters(ctx, s, x + size, y + size, opts.shadow, size);
    }
    drawLetters(ctx, s, x, y, color, size);
    return w;
  };

  function drawLetters(ctx, s, x, y, color, size) {
    for (const raw of s) {
      const ch = glyphOf(raw);
      const g = glyphCanvas(ch, color);
      ctx.drawImage(g, x, y, g.width * size, g.height * size);
      x += (g.width + 1) * size;
    }
  }

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

  // Speech bubble whose tail tip points at (tipX, tipY).
  MP.drawBubble = function (ctx, text, tipX, tipY, opts) {
    opts = opts || {};
    const size = opts.size || 1;
    const pad = 4;
    const bg = opts.bg || '#ffffff';
    const border = opts.border || '#1a1a2e';
    const color = opts.color || '#1a1a2e';
    const lines = MP.wrapText(text, opts.maxWidth || 150, size);
    const textW = Math.max(...lines.map((l) => MP.measureText(l, size)));
    const w = textW + pad * 2;
    const h = lines.length * MP.LINE_H * size - 2 * size + pad * 2;
    const bx = Math.round(MP.clamp(tipX - w / 2, 2, W - w - 2));
    const by = Math.round(Math.max(2, tipY - 3 - h));
    const tx = Math.round(MP.clamp(tipX, bx + 6, bx + w - 7));
    const ty = by + h; // first row under the box

    // Box with rounded pixel corners
    ctx.fillStyle = border;
    ctx.fillRect(bx + 1, by, w - 2, h);
    ctx.fillRect(bx, by + 1, w, h - 2);
    ctx.fillStyle = bg;
    ctx.fillRect(bx + 1, by + 1, w - 2, h - 2);

    // Tail
    ctx.fillStyle = border;
    for (let i = 0; i < 4; i++) ctx.fillRect(tx - (3 - i), ty + i, 2 * (3 - i) + 1, 1);
    ctx.fillStyle = bg;
    for (let i = 0; i < 3; i++) ctx.fillRect(tx - (2 - i), ty - 1 + i, 2 * (2 - i) + 1, 1);

    lines.forEach((line, i) => {
      MP.drawText(ctx, line, bx + w / 2, by + pad + i * MP.LINE_H * size, { color, size, align: 'center' });
    });
  };

  // A big chunky button. rect = { x, y, w, h }. Looks pressed while held down.
  MP.drawButton = function (ctx, label, rect, opts) {
    opts = opts || {};
    const size = opts.size || 1;
    const disabled = !!opts.disabled;
    const face = disabled ? '#8a8a99' : (opts.color || '#3cb371');
    const dark = disabled ? '#5a5a66' : (opts.shade || '#1f7a4a');
    const pressed = !disabled && MP.pointer.down && MP.hit(rect, MP.pointer.x, MP.pointer.y);
    const dy = pressed ? 2 : 0;
    const { x, y, w, h } = rect;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 1, y, w - 2, h);
    ctx.fillRect(x, y + 1, w, h - 2);
    ctx.fillStyle = dark;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = face;
    ctx.fillRect(x + 1, y + 1 + dy, w - 2, h - 4);
    MP.drawText(ctx, label, x + w / 2, y + 1 + dy + (h - 4 - 7 * size) / 2, {
      color: disabled ? '#d0d0d8' : '#ffffff',
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
