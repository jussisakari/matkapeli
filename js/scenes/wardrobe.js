// wardrobe.js – choosing clothes.
// TEMPORARY: a placeholder until milestone 6 builds the real wardrobe.
window.MP = window.MP || {};

MP.scenes.wardrobe = {
  button: { x: 120, y: 140, w: 80, h: 24 },

  enter() {
    // For now, put on some clothes so the change shows in the home
    Object.assign(MP.state.outfit, { shirt: 'red', bottom: 'jeans', hat: 'cap', costume: 'none' });
    MP.save();
  },

  onTap(x, y) {
    if (MP.hit(this.button, x, y)) {
      MP.sfx.bling();
      MP.goTo(MP.scenes.home, { done: 'dress' });
    }
  },

  draw(ctx) {
    ctx.fillStyle = '#e6f0d8';
    ctx.fillRect(0, 0, MP.W, MP.H);
    MP.draw('wardrobe', ctx, 70, 150, { open: true });
    MP.drawPerson(ctx, 200, 130, { scale: 2 });
    MP.drawText(ctx, 'Vaatekaappi tulee pian!', MP.W / 2, 10, { size: 1.3, color: '#2b2340', align: 'center' });
    MP.drawButton(ctx, 'Valmis', this.button, { size: 1.2 });
  },
};
