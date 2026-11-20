// main.js – starts the game.
window.MP = window.MP || {};

// ---------------------------------------------------------------------------
// TEST SCENE for milestone 2 (replaced by the real start screen in milestone 3).
// Shows every sprite, and the girl and boy in different clothes.
// Tap the big character to try the next outfit.
// ---------------------------------------------------------------------------
MP.scenes.gallery = {
  outfitIndex: 0,
  outfits: [],

  enter() {
    // Every combination of visible clothes (pyjamas first)
    const vis = (slot) => MP.CLOTHES[slot].filter((it) => !it.hidden || slot === 'hat');
    this.outfits = [{ shirt: 'pyjama', bottom: 'pyjama', hat: 'none' }];
    for (const s of vis('shirt')) for (const b of vis('bottom')) for (const h of vis('hat')) {
      this.outfits.push({ shirt: s.id, bottom: b.id, hat: h.id });
    }
  },

  onTap(x, y) {
    MP.sfx.tap();
    this.outfitIndex = (this.outfitIndex + 1) % this.outfits.length;
  },

  draw(ctx) {
    ctx.fillStyle = '#cfe7f5';
    ctx.fillRect(0, 0, MP.W, MP.H);
    ctx.fillStyle = '#e8c9a0';
    ctx.fillRect(0, 150, MP.W, 30);

    const walk = Math.floor(MP.time / 0.15) % 2;

    // Row 1: characters
    MP.drawCharacter(ctx, 12, 34, { character: 'girl', outfit: {} });
    MP.drawCharacter(ctx, 32, 34, { character: 'girl', outfit: {}, frame: walk });
    MP.drawCharacter(ctx, 52, 34, { character: 'girl', outfit: { shirt: 'red', bottom: 'jeans', hat: 'cap' }, flip: true });
    MP.drawCharacter(ctx, 72, 34, { character: 'girl', outfit: { shirt: 'sailor', bottom: 'skirtPink', hat: 'sunhat' } });
    MP.drawCharacter(ctx, 92, 34, { character: 'girl', outfit: { shirt: 'yellow', bottom: 'skirtPurple', hat: 'beanie' }, frame: walk });
    MP.drawCharacter(ctx, 116, 34, { character: 'boy', outfit: {} });
    MP.drawCharacter(ctx, 136, 34, { character: 'boy', outfit: { shirt: 'green', bottom: 'brown', hat: 'beanie' }, frame: walk });
    MP.drawCharacter(ctx, 156, 34, { character: 'boy', outfit: { shirt: 'sailor', bottom: 'jeans', hat: 'cap' }, flip: true });

    // Big character: tap to change clothes
    const o = this.outfits[this.outfitIndex];
    MP.drawCharacter(ctx, 290, 92, { character: 'girl', outfit: o, scale: 3 });
    MP.drawText(ctx, (this.outfitIndex + 1) + '/' + this.outfits.length, 290, 96, { align: 'center', color: '#1a1a2e' });

    // Row 2: furniture standing on the floor (y = 150)
    // Window shows sky + sun behind the see-through glass
    ctx.fillStyle = '#7ec8ff';
    ctx.fillRect(4, 42, 24, 20);
    MP.drawSprite(ctx, 'sun', 14, 45);
    MP.drawSprite(ctx, 'window', 4, 40);
    MP.drawSprite(ctx, 'bed', 4, 150 - 18);
    MP.drawSprite(ctx, 'teddy', 48, 150 - 14);
    MP.drawSprite(ctx, 'ball', 62, 150 - 8);
    MP.drawSprite(ctx, 'toilet', 74, 150 - 19);
    MP.drawSprite(ctx, 'mirror', 94, 92);
    MP.drawSprite(ctx, 'sink', 92, 150 - 23);
    MP.drawSprite(ctx, 'cup', 96, 150 - 23 - 11 + 1);
    MP.drawSprite(ctx, 'wardrobe', 116, 150 - 46);
    MP.drawSprite(ctx, 'door', 148, 150 - 42);

    // Row 3: small things
    ctx.fillStyle = '#0b1030';
    ctx.fillRect(176, 106, 60, 40);
    MP.drawSprite(ctx, 'moon', 180, 110);
    MP.drawSprite(ctx, 'star', 196, 112);
    MP.drawSprite(ctx, 'star', 206, 124);
    MP.drawSprite(ctx, 'sparkle', 222, 112);
    MP.drawSprite(ctx, 'bird', 190, 132);
    MP.drawSprite(ctx, 'arrow', 210, 133 + Math.round(Math.sin(MP.time * 6) * 2));
    MP.drawSprite(ctx, 'hand', 180, 156);
    MP.drawSprite(ctx, 'toothbrush', 200, 160);
    MP.drawSprite(ctx, 'toothbrush', 240, 166, { scale: 2 });
  },
};

// ---------------------------------------------------------------------------
MP.load();
MP.start(MP.scenes.gallery);
