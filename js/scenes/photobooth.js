// photobooth.js – THE FUNNY PHOTO BOOTH in the hallway at home.
//   A booth with a curtain, a stool and a camera.
//   1. Choose a funny prop: big glasses, a moustache, a pirate hat, bunny ears
//      or a crown.
//   2. Choose a frame colour and a sticker (a star, a heart or your pet).
//   3. "Kuvaa!": 3-2-1, click – four photos in a strip with a flash each time,
//      and you make a different face in each one (smile, tongue out, surprised,
//      silly).
//   4. The strip goes into the photo album.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  MP.PHOTO_PLACES.booth = { name: 'Valokuvakoppi', sticker: '📸' };

  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const SHOOT = { x: 222, y: 150, w: 92, h: 24 };
  const PROPS = [
    { id: 'none', name: 'Ei mitään' },
    { id: 'glasses', name: 'Lasit' },
    { id: 'mustache', name: 'Viikset' },
    { id: 'pirate', name: 'Merirosvo' },
    { id: 'bunny', name: 'Pupu' },
    { id: 'crown', name: 'Kruunu' },
  ];
  const FRAMES = ['#ff8fc0', '#ffd23f', '#4cc9f0', '#9be08f'];
  const STICKERS = ['star', 'heart', 'pet'];
  const FACES = ['smile', 'tongue', 'wow', 'silly'];
  const FACE_WORDS = { smile: 'Hymy!', tongue: 'Kieli ulos!', wow: 'Vau!', silly: 'Hassu naama!' };
  const propBtn = (i) => ({ x: 196 + (i % 3) * 41, y: 28 + Math.floor(i / 3) * 34, w: 38, h: 30 });
  const frameBtn = (i) => ({ x: 200 + i * 19, y: 114, r: 7 });
  const stickBtn = (i) => ({ x: 280 + i * 16 - (i === 2 ? 24 : 0), y: i === 2 ? 132 : 114, r: 6 });
  const SHOT_EVERY = 1.1;      // seconds between the four photos

  // ---------------------------------------------------------------------------
  // Drawing: the props and the faces on top of drawPerson (feet at x, y; scale s)
  // ---------------------------------------------------------------------------
  function face(c, x, y, s, f) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.lineWidth = 0.5;
    c.strokeStyle = O();
    if (f === 'tongue' || f === 'silly') {
      c.fillStyle = '#ff6f8f';
      c.beginPath(); c.ellipse(0, -25.4, 1.2, 1.7, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    }
    c.restore();
  }

  function prop(c, x, y, s, id) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.lineWidth = 0.5;
    c.strokeStyle = O();
    if (id === 'glasses') {
      c.lineWidth = 0.9; c.strokeStyle = '#e0559a';
      c.fillStyle = 'rgba(160,220,255,0.35)';
      for (const sx of [-3, 3]) { c.beginPath(); c.arc(sx, -30, 2.8, 0, Math.PI * 2); c.fill(); c.stroke(); }
      c.beginPath(); c.moveTo(-0.3, -30.3); c.lineTo(0.3, -30.3); c.stroke();
    } else if (id === 'mustache') {
      c.fillStyle = '#3a2618';
      c.beginPath();
      c.moveTo(0, -29.2);
      c.bezierCurveTo(-2, -30.4, -4.5, -29.6, -5.2, -27.4);
      c.bezierCurveTo(-4, -28.4, -2, -28.2, 0, -28.4);
      c.bezierCurveTo(2, -28.2, 4, -28.4, 5.2, -27.4);
      c.bezierCurveTo(4.5, -29.6, 2, -30.4, 0, -29.2);
      c.fill();
    } else if (id === 'pirate') {
      c.fillStyle = '#26262e';
      c.beginPath(); c.moveTo(-9, -36); c.quadraticCurveTo(0, -48, 9, -36); c.quadraticCurveTo(0, -39, -9, -36); c.fill(); c.stroke();
      c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(0, -41, 1.3, 0, Math.PI * 2); c.fill();
      c.fillRect(-1.6, -39.4, 3.2, 0.6);
      // and an eye patch
      c.fillStyle = '#26262e';
      c.beginPath(); c.ellipse(2.7, -30, 1.8, 1.6, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(-6, -34); c.lineTo(5, -28.5); c.stroke();
    } else if (id === 'bunny') {
      for (const sx of [-1, 1]) {
        c.save();
        c.translate(sx * 3.5, -38);
        c.rotate(sx * 0.2);
        c.fillStyle = '#ffffff';
        c.beginPath(); c.ellipse(0, -6, 2.2, 6.5, 0, 0, Math.PI * 2); c.fill(); c.stroke();
        c.fillStyle = '#ffb7d0';
        c.beginPath(); c.ellipse(0, -6, 1.1, 4.8, 0, 0, Math.PI * 2); c.fill();
        c.restore();
      }
      c.fillStyle = '#ff8fa3';
      c.beginPath(); c.arc(0, -28.9, 0.7, 0, Math.PI * 2); c.fill();     // a pink bunny nose
    }
    c.restore();
  }

  function sticker(c, x, y, id, r) {
    c.save();
    c.translate(x, y);
    c.lineWidth = 0.6;
    c.strokeStyle = O();
    if (id === 'star') {
      c.fillStyle = '#ffd23f';
      c.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      c.closePath(); c.fill(); c.stroke();
    } else if (id === 'heart') {
      c.fillStyle = '#ff5d8f';
      c.beginPath();
      c.moveTo(0, r * 0.8);
      c.bezierCurveTo(-r * 1.4, -r * 0.2, -r * 0.6, -r * 1.2, 0, -r * 0.4);
      c.bezierCurveTo(r * 0.6, -r * 1.2, r * 1.4, -r * 0.2, 0, r * 0.8);
      c.fill(); c.stroke();
    } else if (MP.myPet()) {
      MP.drawPet(c, 0, r * 0.7, { kind: MP.myPet().kind, scale: r / 7, sit: true });
    } else {
      c.fillStyle = '#9be08f'; c.beginPath(); c.arc(0, 0, r * 0.8, 0, Math.PI * 2); c.fill(); c.stroke();
    }
    c.restore();
  }

  // One photo (the frame at x, y with size w × h): me with the prop, a face and a sticker
  function photo(c, x, y, w, h, look, f) {
    c.save();
    c.fillStyle = look.frame;
    c.fillRect(x, y, w, h);
    c.fillStyle = '#ffe9c7';
    c.fillRect(x + 3, y + 3, w - 6, h - 6);
    c.beginPath(); c.rect(x + 3, y + 3, w - 6, h - 6); c.clip();
    // the curtain behind
    c.fillStyle = '#d65a8a';
    for (let i = 0; i < 6; i++) c.fillRect(x + 3 + i * (w / 6), y + 3, w / 12, h);
    const s = (h - 6) / 38;
    const fx = x + w / 2, fy = y + h + 6 * s;          // feet below the picture: head and shoulders show
    drawMe(c, fx, fy, s, look.prop, f);
    c.restore();
    sticker(c, x + w - 7, y + 8, look.sticker, Math.max(4, w / 9));
  }

  function drawMe(c, x, y, s, propId, f) {
    const outfit = Object.assign({}, MP.state.outfit, { hat: propId === 'crown' ? 'crown' : ['pirate', 'bunny'].includes(propId) ? 'none' : MP.state.outfit.hat });
    MP.drawPerson(c, x, y, {
      outfit, scale: s, hero: false,
      eyes: f === 'silly' ? 'closed' : 'open',
      mouth: f === 'wow' || f === 'tongue' || f === 'silly' ? 'yawn' : 'smile',
    });
    face(c, x, y, s, f);
    prop(c, x, y, s, propId);
  }

  // The strip as a picture for the album (the same size as the other photos)
  function stripImage(look) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 144;
    const g = c.getContext('2d');
    g.fillStyle = '#fff7e0';
    g.fillRect(0, 0, 256, 144);
    for (let i = 0; i < 4; i++) photo(g, 8 + i * 61, 8, 57, 108, look, FACES[i]);
    g.fillStyle = MP.COLORS.outline;
    g.font = 'bold 13px ' + MP.FONT_FAMILY;
    g.textAlign = 'center';
    g.fillText('VALOKUVAKOPPI', 128, 134);
    return c.toDataURL('image/jpeg', 0.8);
  }

  MP.scenes.photobooth = {
    noRestart: true,

    enter() {
      this.look = { prop: 'glasses', frame: FRAMES[0], sticker: 'star' };
      this.shoot = null;           // { from }
      this.flashAt = -9;
      this.say('Valokuvakoppi! Valitse hassu juttu, kehys ja tarra. Sitten "Kuvaa!"');
    },

    say(text) { this.bubble = { text, from: MP.time, until: Infinity }; },

    onTap(x, y) {
      if (this.shoot && !this.shoot.done) return;
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.home);
        return;
      }
      if (this.shoot && this.shoot.done) { this.shoot = null; return; }   // back to choosing
      PROPS.forEach((p, i) => { if (MP.hit(propBtn(i), x, y)) { this.look.prop = p.id; MP.sfx.boing(); } });
      FRAMES.forEach((f, i) => { const b = frameBtn(i); if (Math.hypot(x - b.x, y - b.y) < b.r + 2) { this.look.frame = f; MP.sfx.tap(); } });
      STICKERS.forEach((st, i) => { const b = stickBtn(i); if (Math.hypot(x - b.x, y - b.y) < b.r + 2) { this.look.sticker = st; MP.sfx.tap(); } });
      if (MP.hit(SHOOT, x, y)) {
        this.shoot = { from: MP.time, n: 0, done: false };
        this.bubble = null;
        MP.sfx.bling();
      }
    },

    update() {
      const sh = this.shoot;
      if (!sh || sh.done) return;
      const u = MP.time - sh.from - 1.5;                 // 3-2-1 first
      const n = u < 0 ? 0 : Math.floor(u / SHOT_EVERY) + 1;
      if (n > sh.n && n <= 4) {
        sh.n = n;
        this.flashAt = MP.time;
        MP.sfx.shutter();
      }
      if (u > 4 * SHOT_EVERY) {
        sh.done = true;
        try {
          MP.photos.push({ img: stripImage(this.look), place: 'booth', time: Date.now() });
          while (MP.photos.length > 30) MP.photos.shift();
          MP.savePhotos();
          this.say('Kuvat albumiin! Neljä hassua kuvaa. Napauta, niin otetaan lisää.');
        } catch (_) {
          this.say('Kuvat eivät tallentuneet, mutta ne olivat hauskoja!');
        }
        MP.sfx.applause(1);
      }
    },

    draw(ctx) {
      const t = MP.time;
      // inside the booth: the curtain and the stool
      ctx.fillStyle = '#b8406e'; ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = '#d65a8a';
      for (let i = 0; i < 16; i++) ctx.fillRect(i * 20 + Math.sin(t + i) * 0.6, 0, 10, MP.H);
      ctx.fillStyle = '#6e4226'; ctx.fillRect(0, 160, MP.W, 20);
      const sh = this.shoot;

      if (sh && sh.done) {
        // the finished strip, big
        ctx.fillStyle = '#fff7e0'; ctx.strokeStyle = O(); ctx.lineWidth = 1;
        MP.roundRect(ctx, 20, 20, 280, 140, 6); ctx.fill(); ctx.stroke();
        for (let i = 0; i < 4; i++) photo(ctx, 30 + i * 66, 28, 60, 110, this.look, FACES[i]);
        MP.drawText(ctx, 'VALOKUVAKOPPI', 160, 143, { size: 0.9, color: O(), align: 'center' });
      } else {
        // the stool and me, big
        ctx.fillStyle = '#c98a55'; ctx.strokeStyle = O(); ctx.lineWidth = 1;
        ctx.fillRect(66, 132, 56, 6); ctx.strokeRect(66, 132, 56, 6);
        ctx.fillRect(72, 138, 4, 22); ctx.fillRect(112, 138, 4, 22);
        const f = sh ? FACES[Math.max(0, Math.min(3, sh.n - 1))] : 'smile';
        drawMe(ctx, 94, 132 + 52, 2.6, this.look.prop, sh && sh.n ? f : 'smile');
        // the camera on the wall, with its red light
        ctx.fillStyle = '#4a4a58'; MP.roundRect(ctx, 150, 26, 28, 20, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#9fd8ff'; ctx.beginPath(); ctx.arc(164, 36, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = sh && Math.floor(t * 4) % 2 ? '#ff4040' : '#802020';
        ctx.beginPath(); ctx.arc(174, 30, 1.6, 0, Math.PI * 2); ctx.fill();

        if (!sh) {
          // the choices on the right
          ctx.fillStyle = 'rgba(255,247,224,0.92)';
          MP.roundRect(ctx, 190, 4, 126, 142, 6); ctx.fill(); ctx.stroke();
          MP.drawText(ctx, 'Hassu juttu', 253, 8, { size: 0.65, color: O(), align: 'center' });
          PROPS.forEach((p, i) => {
            const r = propBtn(i);
            const on = this.look.prop === p.id;
            ctx.fillStyle = on ? '#ffd23f' : '#ffffff';
            MP.roundRect(ctx, r.x, r.y, r.w, r.h, 4); ctx.fill(); ctx.stroke();
            if (p.id === 'none') MP.drawText(ctx, '–', r.x + r.w / 2, r.y + 6, { size: 1, color: O(), align: 'center' });
            else {
              ctx.save();
              ctx.beginPath(); ctx.rect(r.x + 1, r.y + 1, r.w - 2, r.h - 10); ctx.clip();
              drawMe(ctx, r.x + r.w / 2, r.y + 38 + (p.id === 'bunny' || p.id === 'pirate' || p.id === 'crown' ? 10 : 0), p.id === 'bunny' || p.id === 'pirate' || p.id === 'crown' ? 0.8 : 1.1, p.id, 'smile');
              ctx.restore();
            }
            MP.drawText(ctx, p.name, r.x + r.w / 2, r.y + r.h - 8, { size: 0.42, color: O(), align: 'center' });
          });
          MP.drawText(ctx, 'Kehys ja tarra', 253, 98, { size: 0.55, color: O(), align: 'center' });
          FRAMES.forEach((f2, i) => {
            const b = frameBtn(i);
            ctx.fillStyle = f2; ctx.lineWidth = this.look.frame === f2 ? 2 : 0.8;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          });
          STICKERS.forEach((st, i) => {
            const b = stickBtn(i);
            ctx.fillStyle = this.look.sticker === st ? '#fff3a0' : '#ffffff'; ctx.lineWidth = this.look.sticker === st ? 1.6 : 0.6;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            sticker(ctx, b.x, b.y, st, 5);
          });
          ctx.lineWidth = 1;
          MP.drawButton(ctx, '📸 Kuvaa!', SHOOT, { size: 0.9, color: '#e0559a', shade: '#a8326c' });
        } else {
          // counting down, then the photo number and the face to make
          const u = t - sh.from;
          if (u < 1.5) MP.drawText(ctx, String(3 - Math.floor(u / 0.5)), 240, 70, { size: 4, color: '#ffffff', outline: O(), align: 'center' });
          else if (sh.n >= 1) {
            MP.drawText(ctx, sh.n + ' / 4', 240, 60, { size: 1.6, color: '#ffffff', outline: O(), align: 'center' });
            MP.drawText(ctx, FACE_WORDS[FACES[sh.n - 1]], 240, 88, { size: 1.1, color: '#ffe680', outline: O(), align: 'center' });
          }
        }
      }
      // the flash
      const fl = t - this.flashAt;
      if (fl < 0.3) {
        ctx.save(); ctx.globalAlpha = 1 - fl / 0.3; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, MP.W, MP.H); ctx.restore();
      }
      MP.drawButton(ctx, '◀ Takaisin', BACK, { size: 0.75 });
      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, sh && sh.done ? 160 : 110, sh && sh.done ? 30 : 46, { maxWidth: 170, size: 0.8 });
    },
  };
})();
