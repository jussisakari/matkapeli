// labyrinth.js – THE LABYRINTH under Ramses II's temple in Egypt (2D, from above).
// Tap the temple door in Egypt to come here. It is dark: your torch lights a
// circle around you. Tap a place near you (or a place you have already been)
// and you walk there. Find the way to TUTANKHAMUN'S TOMB!
// On the way: a mummy that sneezes ("ATSIUU!"), scarab beetles that scurry
// away, a cat statue whose eyes follow you, and "Väärä tie!" signs in dead ends.
// Every time the maze is a bit different. Not scary – just a little exciting.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const COLS = 9, ROWS = 6;
  const CELL = { w: 30, h: 24 };
  const X0 = (MP.W - COLS * CELL.w) / 2, Y0 = 30;
  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const OUT = { x: 236, y: 4, w: 80, h: 22 };
  const TORCH = 46;           // how far the torch shines
  const SPEED = 4.5;          // cells per second
  const cx = (c) => X0 + c * CELL.w + CELL.w / 2;
  const cy = (r) => Y0 + r * CELL.h + CELL.h / 2;

  // A new maze: walls[r][c] = { n, e, s, w } (true = wall)
  function makeMaze() {
    const walls = [];
    for (let r = 0; r < ROWS; r++) { walls.push([]); for (let c = 0; c < COLS; c++) walls[r].push({ n: true, e: true, s: true, w: true }); }
    const seen = new Set();
    const stack = [[0, 0]];
    seen.add('0,0');
    const D = [['n', -1, 0, 's'], ['s', 1, 0, 'n'], ['e', 0, 1, 'w'], ['w', 0, -1, 'e']];
    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const next = D.filter(([, dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        return nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !seen.has(nr + ',' + nc);
      });
      if (!next.length) { stack.pop(); continue; }
      const [side, dr, dc, back] = next[Math.floor(Math.random() * next.length)];
      walls[r][c][side] = false;
      walls[r + dr][c + dc][back] = false;
      seen.add((r + dr) + ',' + (c + dc));
      stack.push([r + dr, c + dc]);
    }
    return walls;
  }

  function neighbours(walls, r, c) {
    const w = walls[r][c], out = [];
    if (!w.n) out.push([r - 1, c]);
    if (!w.s) out.push([r + 1, c]);
    if (!w.e) out.push([r, c + 1]);
    if (!w.w) out.push([r, c - 1]);
    return out;
  }

  // the shortest way from one cell to another (a list of cells)
  function path(walls, from, to) {
    const key = (p) => p[0] + ',' + p[1];
    const prev = { [key(from)]: null };
    const q = [from];
    while (q.length) {
      const cur = q.shift();
      if (cur[0] === to[0] && cur[1] === to[1]) break;
      for (const n of neighbours(walls, cur[0], cur[1])) {
        if (key(n) in prev) continue;
        prev[key(n)] = cur;
        q.push(n);
      }
    }
    if (!(key(to) in prev)) return null;
    const out = [];
    for (let p = to; p; p = prev[key(p)]) out.unshift(p);
    return out;
  }

  MP.scenes.labyrinth = {
    noRestart: true,

    enter() {
      this.walls = makeMaze();
      this.goal = [ROWS - 1, COLS - 1];
      this.me = { r: 0, c: 0, x: cx(0), y: cy(0) };
      this.route = [];
      this.visited = { '0,0': true };
      this.step = 'maze';
      this.bubble = null;
      this.events = {};
      // dead ends (not the start or the goal) get the funny things
      const dead = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if ((r === 0 && c === 0) || (r === this.goal[0] && c === this.goal[1])) continue;
        if (neighbours(this.walls, r, c).length === 1) dead.push([r, c]);
      }
      dead.sort(() => Math.random() - 0.5);
      this.things = {};
      ['mummy', 'cat', 'beetles'].forEach((kind, i) => { if (dead[i]) this.things[dead[i].join(',')] = kind; });
      dead.slice(3).forEach((d) => { this.things[d.join(',')] = 'sign'; });
      // a few more beetles along the way
      for (let i = 0; i < 3; i++) {
        const k = Math.floor(1 + Math.random() * (ROWS - 1)) + ',' + Math.floor(1 + Math.random() * (COLS - 1));
        if (!this.things[k] && k !== this.goal.join(',')) this.things[k] = 'beetles';
      }
      this.beetles = [];
      this.sneezeAt = -9;
      this.say('Ramses II:n temppelin alla on labyrintti! Taskulamppu valaisee. Etsi tie Tutankhamonin haudalle – napauta minne mennään.');
    },

    say(text) {
      this.bubble = { text, from: MP.time, until: Infinity };
    },

    onTap(x, y) {
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.egypt, { from: 'temple' });
        return;
      }
      if (this.step === 'treasure') {
        if (MP.time - this.treasureAt > 1.5 && MP.hit(OUT, x, y)) {
          MP.sfx.bling();
          MP.goTo(MP.scenes.egypt, { from: 'temple' });
        }
        return;
      }
      const c = Math.floor((x - X0) / CELL.w), r = Math.floor((y - Y0) / CELL.h);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
      const near = Math.hypot(cx(c) - this.me.x, cy(r) - this.me.y) < TORCH + 10;
      if (!near && !this.visited[r + ',' + c]) {
        this.say('Liian pimeää! Kävele vähän kerrallaan – napauta lähellä.');
        return;
      }
      const p = path(this.walls, [this.me.r, this.me.c], [r, c]);
      if (p) { this.route = p.slice(1); MP.sfx.tap(); }
    },

    arriveAt(r, c) {
      const k = r + ',' + c;
      this.visited[k] = true;
      if (r === this.goal[0] && c === this.goal[1]) {
        this.step = 'treasure';
        this.treasureAt = MP.time;
        this.route = [];
        const tr = (MP.state.treasures = MP.state.treasures || {});
        const first = !tr.amulet;
        tr.amulet = true;
        MP.save();
        MP.sfx.applause(2.5);
        setTimeout(() => MP.sfx.bling(), 300);
        this.say('Löysit Tutankhamonin haudan! Kultaa kaikkialla!' + (first ? ' Sain kultaisen skarabeus-amuletin matkamuistoksi!' : ''));
        return;
      }
      const thing = this.things[k];
      if (!thing || this.events[k]) return;
      this.events[k] = MP.time;
      if (thing === 'mummy') {
        this.sneezeAt = MP.time;
        this.route = [];
        MP.sfx.boing();
        this.say('ATSIUU! Muumio aivasti – siteet lepattivat! "Anteeksi, täällä on niin pölyistä!"');
      } else if (thing === 'cat') {
        MP.sfx.meow();
        this.say('Kissapatsas! Sen silmät seuraavat minua… hihi.');
      } else if (thing === 'beetles') {
        for (let i = 0; i < 6; i++) this.beetles.push({ x: cx(c), y: cy(r), a: Math.random() * Math.PI * 2, born: MP.time });
        MP.sfx.tap();
        this.say('Skarabeuskuoriaisia! Ne kipittävät pois.');
      } else if (thing === 'sign') {
        this.say('Kyltissä lukee hieroglyfeillä: VÄÄRÄ TIE! Takaisin päin.');
        MP.sfx.tap();
      }
    },

    update(dt) {
      if (this.step !== 'maze') return;
      const me = this.me;
      if (this.route.length) {
        const [r, c] = this.route[0];
        const tx = cx(c), ty = cy(r);
        const d = Math.hypot(tx - me.x, ty - me.y);
        const step = SPEED * CELL.w * dt;
        if (d <= step) {
          me.x = tx; me.y = ty; me.r = r; me.c = c;
          this.route.shift();
          this.arriveAt(r, c);
        } else {
          me.x += (tx - me.x) / d * step;
          me.y += (ty - me.y) / d * step;
          me.facing = tx < me.x ? -1 : tx > me.x ? 1 : me.facing;
        }
        me.walking = true;
        me.walkTime = (me.walkTime || 0) + dt;
      } else {
        me.walking = false;
      }
      this.beetles = this.beetles.filter((b) => MP.time - b.born < 1.5);
    },

    draw(ctx) {
      const t = MP.time;
      if (this.step === 'treasure') return this.drawTreasure(ctx, t);
      const A = MP.pyramidArt;
      // stone floor
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = '#b8935e';
      ctx.fillRect(X0, Y0, COLS * CELL.w, ROWS * CELL.h);
      ctx.strokeStyle = 'rgba(90,60,30,0.25)';
      ctx.lineWidth = 0.5;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) ctx.strokeRect(X0 + c * CELL.w + 2, Y0 + r * CELL.h + 2, CELL.w - 4, CELL.h - 4);
      // the things in the maze
      for (const [k, kind] of Object.entries(this.things)) {
        const [r, c] = k.split(',').map(Number);
        const x = cx(c), y = cy(r);
        if (kind === 'sign') {
          ctx.fillStyle = '#e8d6a8'; ctx.strokeStyle = O(); ctx.lineWidth = 0.6;
          ctx.fillRect(x - 8, y - 6, 16, 9); ctx.strokeRect(x - 8, y - 6, 16, 9);
          ctx.fillStyle = '#c0392b';
          ctx.beginPath(); ctx.moveTo(x - 5, y - 4); ctx.lineTo(x + 5, y + 1); ctx.moveTo(x + 5, y - 4); ctx.lineTo(x - 5, y + 1); ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 1.2; ctx.stroke();
        } else if (kind === 'mummy') {
          const sn = t - this.sneezeAt;
          ctx.save();
          ctx.translate(x, y);
          ctx.fillStyle = '#efe6cf'; ctx.strokeStyle = O(); ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.ellipse(0, 0, 5, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = '#c9bc9a';
          for (let k2 = -6; k2 <= 6; k2 += 3) { ctx.beginPath(); ctx.moveTo(-5, k2); ctx.lineTo(5, k2 + 1.5); ctx.stroke(); }
          if (sn < 1.6) {
            // bandages flutter away
            ctx.strokeStyle = '#efe6cf'; ctx.lineWidth = 1.6;
            for (let k2 = 0; k2 < 3; k2++) { ctx.beginPath(); ctx.moveTo(4, -4 + k2 * 4); ctx.quadraticCurveTo(10 + sn * 8, -6 + k2 * 4 + Math.sin(t * 20 + k2) * 2, 14 + sn * 10, -2 + k2 * 4); ctx.stroke(); }
            MP.drawText(ctx, 'ATSIUU!', 0, -22, { size: 0.7, color: '#ffffff', outline: O(), align: 'center' });
          }
          ctx.fillStyle = '#1b1b2a'; ctx.fillRect(-2.5, -5, 1.4, 1.4); ctx.fillRect(1.1, -5, 1.4, 1.4);
          ctx.restore();
        } else if (kind === 'cat') {
          // a black cat statue; its eyes look at you
          ctx.save();
          ctx.translate(x, y);
          ctx.fillStyle = '#2b2b33';
          ctx.beginPath(); ctx.ellipse(0, 3, 4.5, 6, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(0, -5, 3.8, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(-3.5, -7); ctx.lineTo(-3, -11); ctx.lineTo(-1, -8); ctx.moveTo(3.5, -7); ctx.lineTo(3, -11); ctx.lineTo(1, -8); ctx.fill();
          const a = Math.atan2(this.me.y - y, this.me.x - x);
          ctx.fillStyle = '#ffd23f';
          for (const ex of [-1.6, 1.6]) { ctx.beginPath(); ctx.arc(ex + Math.cos(a) * 0.5, -5.5 + Math.sin(a) * 0.5, 0.9, 0, Math.PI * 2); ctx.fill(); }
          ctx.restore();
        }
      }
      // the tomb door at the goal
      const gx = cx(this.goal[1]), gy = cy(this.goal[0]);
      ctx.fillStyle = '#2b1d10';
      ctx.fillRect(gx - 8, gy - 9, 16, 18);
      ctx.fillStyle = '#ffd23f';
      ctx.fillRect(gx - 9, gy - 11, 18, 3);
      MP.drawText(ctx, '☥', gx, gy - 6, { size: 0.9, color: '#ffd23f', align: 'center' });
      // the walls
      ctx.strokeStyle = '#6b4a2a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const w = this.walls[r][c], x = X0 + c * CELL.w, y = Y0 + r * CELL.h;
        if (w.n) { ctx.moveTo(x, y); ctx.lineTo(x + CELL.w, y); }
        if (w.w && !(r === 0 && c === 0)) { ctx.moveTo(x, y); ctx.lineTo(x, y + CELL.h); }
        if (r === ROWS - 1 && w.s) { ctx.moveTo(x, y + CELL.h); ctx.lineTo(x + CELL.w, y + CELL.h); }
        if (c === COLS - 1 && w.e) { ctx.moveTo(x + CELL.w, y); ctx.lineTo(x + CELL.w, y + CELL.h); }
        if (c < COLS - 1 && w.e) { ctx.moveTo(x + CELL.w, y); ctx.lineTo(x + CELL.w, y + CELL.h); }
        if (r < ROWS - 1 && w.s) { ctx.moveTo(x, y + CELL.h); ctx.lineTo(x + CELL.w, y + CELL.h); }
      }
      ctx.stroke();
      // scurrying beetles
      for (const b of this.beetles) {
        const u = t - b.born;
        const bx = b.x + Math.cos(b.a) * u * 30, by = b.y + Math.sin(b.a) * u * 30;
        if (A && A.scarab) A.scarab(ctx, bx, by, 0.35, b.a + Math.PI / 2);
        else { ctx.fillStyle = '#2b5a3a'; ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.fill(); }
      }
      // me, small, seen from above-ish
      const me = this.me;
      MP.drawPerson(ctx, me.x, me.y + 8, { scale: 0.42, walking: me.walking, walkTime: me.walkTime || 0, flip: me.facing < 0, hero: true });

      // the dark: only the torch light and the places you have been show
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, MP.W, MP.H);
      ctx.arc(me.x, me.y, TORCH, 0, Math.PI * 2, true);
      ctx.fillStyle = 'rgba(10,6,2,0.9)';
      ctx.fill();
      ctx.restore();
      // a soft edge for the light, and a dim memory of visited cells
      const g = ctx.createRadialGradient(me.x, me.y, TORCH * 0.55, me.x, me.y, TORCH);
      g.addColorStop(0, 'rgba(10,6,2,0)'); g.addColorStop(1, 'rgba(10,6,2,0.75)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(me.x, me.y, TORCH, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,200,120,0.08)';
      for (const k of Object.keys(this.visited)) {
        const [r, c] = k.split(',').map(Number);
        if (Math.hypot(cx(c) - me.x, cy(r) - me.y) > TORCH) ctx.fillRect(X0 + c * CELL.w + 3, Y0 + r * CELL.h + 3, CELL.w - 6, CELL.h - 6);
      }
      // warm torch glow
      const glow = ctx.createRadialGradient(me.x, me.y, 2, me.x, me.y, TORCH);
      glow.addColorStop(0, 'rgba(255,190,90,0.25)'); glow.addColorStop(1, 'rgba(255,190,90,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(me.x, me.y, TORCH, 0, Math.PI * 2); ctx.fill();

      MP.drawText(ctx, 'Labyrintti', MP.W / 2, 6, { size: 1.1, color: '#ffd23f', outline: O(), align: 'center' });
      MP.drawButton(ctx, '◀ Ulos', BACK, { size: 0.8 });
      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, me.x, me.y - 12, { maxWidth: 170, size: 0.8 });
    },

    drawTreasure(ctx, t) {
      const u = t - this.treasureAt;
      ctx.fillStyle = '#3a2614';
      ctx.fillRect(0, 0, MP.W, MP.H);
      const g = ctx.createRadialGradient(160, 96, 10, 160, 96, 170);
      g.addColorStop(0, 'rgba(255,215,100,0.85)'); g.addColorStop(1, 'rgba(255,215,100,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
      // piles of gold
      for (let i = 0; i < 40; i++) {
        const x = (i * 37) % MP.W, y = 150 + (i * 13) % 26;
        ctx.fillStyle = i % 3 ? '#f2c14e' : '#ffe08a';
        ctx.beginPath(); ctx.ellipse(x, y, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      }
      const A = MP.pyramidArt;
      if (A && A.tutMask) A.tutMask(ctx, 160, 122 + Math.max(0, 1 - u) * 20, 2.6);
      // sparkles
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2 + t * 0.6, r = 60 + Math.sin(t * 3 + i) * 6;
        const sx = 160 + Math.cos(a) * r, sy = 92 + Math.sin(a) * r * 0.6;
        ctx.fillStyle = '#fffbe0';
        ctx.fillRect(sx - 0.6, sy - 3, 1.2, 6); ctx.fillRect(sx - 3, sy - 0.6, 6, 1.2);
      }
      MP.drawText(ctx, 'Tutankhamonin hauta!', MP.W / 2, 8, { size: 1.4, color: '#ffd23f', outline: O(), align: 'center' });
      if (u < 4) MP.drawConfetti(ctx, u, 40);
      if (u > 1.5) MP.drawButton(ctx, 'Ulos', OUT, { size: 0.9 });
      const b = this.bubble;
      if (b && t >= b.from && u < 6) MP.drawBubble(ctx, b.text, 160, 178, { maxWidth: 220, size: 0.8 });
    },
  };
})();
