// main.js – starts the game.
window.MP = window.MP || {};

// ---------------------------------------------------------------------------
// TEST SCENES for milestone 1 (they are replaced by the real start screen in
// milestone 3). They show the pixel font, a speech bubble, where taps land,
// drag trails, sounds and the fade between scenes.
// ---------------------------------------------------------------------------
MP.scenes.test = {
  taps: [],
  trail: [],
  button: { x: 236, y: 152, w: 76, h: 20 },

  enter() {
    this.taps = [];
    this.trail = [];
  },

  onPointerDown(x, y) {
    this.trail = [{ x, y }];
  },

  onPointerMove(x, y) {
    this.trail.push({ x, y });
    MP.sfx.brush();
  },

  onTap(x, y) {
    if (MP.hit(this.button, x, y)) {
      MP.sfx.bling();
      MP.goTo(MP.scenes.test2);
      return;
    }
    MP.sfx.tap();
    this.taps.push({ x, y, t: MP.time });
  },

  update() {
    // Taps disappear after 2 seconds
    this.taps = this.taps.filter((p) => MP.time - p.t < 2);
  },

  draw(ctx) {
    ctx.fillStyle = '#1b2a5a';
    ctx.fillRect(0, 0, MP.W, MP.H);

    MP.drawText(ctx, 'Hei Ella ÄÖ', MP.W / 2, 8, { size: 2, color: '#ffe680', shadow: '#b8860b', align: 'center' });
    MP.drawText(ctx, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ÅÄÖ', MP.W / 2, 32, { align: 'center' });
    MP.drawText(ctx, "0123456789 !?.,:-' …", MP.W / 2, 42, { align: 'center' });

    // A placeholder "character" with a speech bubble
    ctx.fillStyle = '#f2c9a0';
    ctx.fillRect(60, 128, 12, 24);
    MP.drawBubble(ctx, 'Huomenta! Mennään pesemään hampaat.', 66, 124, { maxWidth: 110 });

    MP.drawText(ctx, 'Napauta tai vedä!', 200, 100, { align: 'center', color: '#9fd3ff' });
    MP.drawText(ctx, 'Skaala ' + MP.pixelScale, 4, 170, { color: '#8899cc' });

    // Drag trail
    ctx.fillStyle = '#00e5ff';
    for (const p of this.trail) ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 1);

    // Tap markers: a small cross exactly where the finger was
    for (const p of this.taps) {
      ctx.globalAlpha = 1 - (MP.time - p.t) / 2;
      ctx.fillStyle = '#ffeb3b';
      const x = Math.floor(p.x), y = Math.floor(p.y);
      ctx.fillRect(x - 2, y, 5, 1);
      ctx.fillRect(x, y - 2, 1, 5);
      ctx.globalAlpha = 1;
    }

    MP.drawButton(ctx, 'Vaihda', this.button);
  },
};

MP.scenes.test2 = {
  button: { x: 110, y: 120, w: 100, h: 24 },
  onTap(x, y) {
    if (MP.hit(this.button, x, y)) {
      MP.sfx.tap();
      MP.goTo(MP.scenes.test);
    }
  },
  draw(ctx) {
    ctx.fillStyle = '#ffcf9e';
    ctx.fillRect(0, 0, MP.W, MP.H);
    MP.drawText(ctx, 'Toinen kohtaus', MP.W / 2, 50, { size: 2, color: '#7a3b00', align: 'center' });
    MP.drawButton(ctx, 'Takaisin', this.button, { size: 1, color: '#ff8c42', shade: '#b35400' });
  },
};

// ---------------------------------------------------------------------------
MP.load();
MP.start(MP.scenes.test);
