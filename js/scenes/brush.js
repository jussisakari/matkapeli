// brush.js – the tooth brushing mini-game.
// TEMPORARY: a placeholder until milestone 5 builds the real game.
window.MP = window.MP || {};

MP.scenes.brush = {
  button: { x: 120, y: 120, w: 80, h: 24 },

  onTap(x, y) {
    if (MP.hit(this.button, x, y)) {
      MP.sfx.bling();
      MP.goTo(MP.scenes.home, { done: 'brush' });
    }
  },

  draw(ctx) {
    ctx.fillStyle = '#d8f0f5';
    ctx.fillRect(0, 0, MP.W, MP.H);
    MP.draw('toothbrush', ctx, 130, 70, { scale: 2.5, angle: -0.2 });
    MP.drawText(ctx, 'Hampaiden pesu tulee pian!', MP.W / 2, 92, { size: 1.3, color: '#2b2340', align: 'center' });
    MP.drawButton(ctx, 'Valmis', this.button, { size: 1.2 });
  },
};
