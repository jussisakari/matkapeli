// main.js – starts the game.
window.MP = window.MP || {};

// ---------------------------------------------------------------------------
// TEST SCENE for milestone 2 (replaced by the real start screen in milestone 3).
// Shows every drawing, and the girl and boy in different clothes.
// Tap anywhere to put the next outfit on the big character.
// ---------------------------------------------------------------------------
MP.scenes.gallery = {
  outfitIndex: 0,
  outfits: [],

  enter() {
    const vis = (slot) => MP.CLOTHES[slot].filter((it) => !it.hidden);
    this.outfits = [{ shirt: 'pyjama', bottom: 'pyjama', hat: 'none' }];
    for (const s of vis('shirt')) for (const b of vis('bottom')) for (const h of vis('hat')) {
      this.outfits.push({ shirt: s.id, bottom: b.id, hat: h.id });
    }
    this.outfits.push({ costume: 'spider' });
  },

  onTap() {
    MP.sfx.tap();
    this.outfitIndex = (this.outfitIndex + 1) % this.outfits.length;
  },

  draw(ctx) {
    const t = MP.time;

    // Wall with dots and a wooden floor
    ctx.fillStyle = '#fbe3c8';
    ctx.fillRect(0, 0, MP.W, MP.H);
    ctx.fillStyle = 'rgba(230,170,130,0.35)';
    for (let yy = 8; yy < 150; yy += 14) {
      for (let xx = (yy / 14 % 2) * 7 + 4; xx < MP.W; xx += 14) {
        ctx.beginPath(); ctx.arc(xx, yy, 1.1, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = '#d9a877';
    ctx.fillRect(0, 150, MP.W, 30);
    ctx.strokeStyle = '#2b2340';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(MP.W, 150); ctx.stroke();

    // Furniture
    MP.draw('window', ctx, 8, 30, { t });
    MP.draw('poster', ctx, 182, 8);
    MP.draw('bed', ctx, 32, 150);
    MP.draw('teddy', ctx, 62, 150);
    MP.draw('panda', ctx, 75, 150);
    MP.draw('toilet', ctx, 96, 150);
    MP.draw('mirror', ctx, 124, 100);
    MP.draw('sink', ctx, 124, 150);
    MP.draw('wardrobe', ctx, 156, 150);
    MP.draw('wardrobe', ctx, 205, 150, { open: true });
    MP.draw('door', ctx, 244, 150, { open: Math.floor(t / 2) % 2 === 1 });

    // Night sky box with small things
    ctx.fillStyle = '#0b1030';
    MP.roundRect(ctx, 52, 6, 120, 42, 4);
    ctx.fill();
    MP.draw('window', ctx, 58, 12, { moon: true, stars: true, skyTop: '#0b1030', skyBottom: '#28306b', t });
    MP.draw('moon', ctx, 106, 22, { r: 7 });
    MP.draw('star', ctx, 122, 14, { r: 2.5 + Math.sin(t * 4) * 0.8 });
    MP.draw('sparkle', ctx, 134, 24, { r: 5 });
    MP.draw('sun', ctx, 154, 27, { r: 6, t });
    MP.draw('arrow', ctx, 122, 44 + Math.sin(t * 6) * 2);

    // Small characters along the floor
    const people = [
      { character: 'girl', outfit: {}, walking: true },
      { character: 'girl', outfit: { shirt: 'red', bottom: 'jeans', hat: 'cap' } },
      { character: 'girl', outfit: { shirt: 'yellow', bottom: 'skirtPurple', hat: 'sunhat' }, walking: true, flip: true },
      { character: 'boy', outfit: { shirt: 'green', bottom: 'brown', hat: 'beanie' } },
      { character: 'boy', outfit: { shirt: 'sailor', bottom: 'jeans' }, walking: true },
      { character: 'boy', outfit: { costume: 'spider' }, walking: true },
    ];
    people.forEach((p, i) => {
      MP.drawPerson(ctx, 14 + i * 18, 178, Object.assign({ scale: 0.6, walkTime: t }, p));
    });
    MP.draw('rooster', ctx, 125, 177, { scale: 1.2 });
    MP.draw('hand', ctx, 146, 157);
    MP.draw('toothbrush', ctx, 166, 166, { angle: -0.2 });
    MP.draw('ball', ctx, 210, 178, { r: 5 });

    // Big character: tap to change clothes
    const o = this.outfits[this.outfitIndex];
    MP.drawPerson(ctx, 290, 150, { character: this.outfitIndex % 2 ? 'boy' : 'girl', outfit: o, scale: 2, walking: true, walkTime: t });
    MP.drawText(ctx, (this.outfitIndex + 1) + '/' + this.outfits.length, 290, 154, { align: 'center', color: '#2b2340' });
    MP.drawBubble(ctx, 'Huomenta! Mennään pesemään hampaat.', 290, 60, { maxWidth: 80 });
  },
};

// ---------------------------------------------------------------------------
MP.load();
MP.start(MP.scenes.gallery);
