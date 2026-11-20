// home.js – the side-scrolling home (bedroom → bathroom → hallway).
// TEMPORARY: a simple placeholder until milestone 4 builds the real home.
window.MP = window.MP || {};

MP.scenes.home = {
  enter() {
    this.t = 0;
  },

  update(dt) {
    this.t += dt;
  },

  onTap() {
    MP.goTo(MP.scenes.start);
  },

  draw(ctx) {
    ctx.fillStyle = '#fbe3c8';
    ctx.fillRect(0, 0, MP.W, MP.H);
    ctx.fillStyle = '#d9a877';
    ctx.fillRect(0, 150, MP.W, 30);
    MP.draw('window', ctx, 40, 40, { t: MP.time });
    MP.draw('poster', ctx, 230, 30);
    MP.draw('bed', ctx, 90, 150);
    MP.draw('teddy', ctx, 124, 150);
    MP.draw('panda', ctx, 137, 150);
    MP.drawPerson(ctx, 175, 150, {});
    MP.drawBubble(ctx, 'Huomenta! Mennään pesemään hampaat.', 175, 104, { maxWidth: 110 });
    MP.drawText(ctx, '(Koti rakennetaan seuraavaksi – napauta palataksesi alkuun)', MP.W / 2, 165, {
      align: 'center', color: '#6e4226', size: 0.75,
    });
  },
};
