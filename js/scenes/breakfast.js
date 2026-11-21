// breakfast.js – breakfast at the kitchen table.
// Tap a food at the top to put it on the plate, and a drink to fill the glass.
// Tap the food on the plate to take bites (3 bites eats it), tap the glass to drink.
// When you have eaten something and drunk your glass, "Valmis!" can be pressed.
window.MP = window.MP || {};

(function () {
  // Breakfast in the morning, the evening meal in the evening
  const menu = () => (window.MP.state.evening ? window.MP.EVENING_FOODS : window.MP.FOODS);
  const MP = window.MP;

  const TABLE_Y = 128;
  const PLATE = { x: 150, y: 138 };
  const SLOTS = [-16, 0, 16];          // up to 3 foods on the plate
  const GLASS = { x: 206, y: 128 };
  const PEELS = { x: 186, y: 139 };    // where banana peels are put
  const BITES = 3;                     // bites to eat one food
  const SIPS = 3;                      // sips to drink the glass
  const doneButton = { x: 236, y: 150, w: 76, h: 24 };

  function cardRect(i) {
    return { x: 6 + i * 44.5, y: 5, w: 41, h: 46 };
  }

  MP.scenes.breakfast = {
    enter() {
      this.plate = [];        // { id, name, bites }
      this.drink = null;      // { id, sips }
      this.eaten = 0;
      this.peels = 0;         // banana peels next to the plate
      this.drank = false;
      this.chewUntil = 0;
      this.leaveAt = 0;
      this.bubble = null;
      this.say(MP.state.evening ? 'Mitä syödään iltaruoaksi?' : 'Mitä otetaan aamupalaksi?', 4);
    },

    say(text, seconds) {
      this.bubble = { text, from: MP.time, until: Infinity };   // stays until the next tap
    },

    ready() {
      return this.eaten >= 1 && this.drank;
    },

    onTap(x, y) {
      if (this.leaveAt) return;

      // Menu cards at the top
      for (let i = 0; i < menu().length; i++) {
        if (MP.hit(cardRect(i), x, y)) {
          this.pick(menu()[i]);
          return;
        }
      }
      // Food on the plate: take a bite
      for (let i = 0; i < this.plate.length; i++) {
        const fx = PLATE.x + SLOTS[i];
        if (Math.abs(x - fx) < 9 && Math.abs(y - (PLATE.y - 4)) < 11) {
          this.bite(i);
          return;
        }
      }
      // Banana peel: we don't eat that!
      if (this.peels && Math.abs(x - PEELS.x) < 10 && Math.abs(y - PEELS.y) < 8) {
        this.say('Kuorta ei syödä!');
        return;
      }
      // Glass: take a sip
      if (this.drink && Math.abs(x - GLASS.x) < 10 && Math.abs(y - GLASS.y) < 13) {
        this.sip();
        return;
      }
      // Done
      if (this.ready() && MP.hit(doneButton, x, y)) {
        MP.sfx.bling();
        this.say('Mmm, olipa hyvää!', 3);
        this.leaveAt = MP.time + 1.4;
      }
    },

    pick(item) {
      MP.sfx.tap();
      if (item.type === 'drink') {
        if (this.drink && this.drink.sips < SIPS) {
          if (this.drink.id === item.id) { this.say('Lasi on jo täynnä!'); return; }
          this.say('Juo ensin lasi tyhjäksi!');
          return;
        }
        this.drink = { id: item.id, sips: 0 };
        this.say('Napauta lasia, niin juot!', 3);
        return;
      }
      if (this.plate.find((f) => f.id === item.id)) {
        this.say(item.name + ' on jo lautasella!');
        return;
      }
      if (this.plate.length >= SLOTS.length) {
        this.say('Lautanen on täynnä! Syö ensin.');
        return;
      }
      this.plate.push({ id: item.id, name: item.name, bites: 0 });
      if (this.eaten === 0) this.say('Napauta ruokaa, niin syöt!', 3);
    },

    bite(i) {
      const f = this.plate[i];
      f.bites++;
      MP.sfx.nom();
      this.chewUntil = MP.time + 0.45;
      if (f.bites >= BITES) {
        this.plate.splice(i, 1);
        this.eaten++;
        if (f.id === 'banana') this.peels++;   // the peel stays next to the plate
        this.afterEating();
      }
    },

    sip() {
      if (this.drink.sips >= SIPS) {
        this.say('Lasi on tyhjä!');
        return;
      }
      this.drink.sips++;
      MP.sfx.gulp();
      this.chewUntil = MP.time + 0.45;
      if (this.drink.sips >= SIPS) {
        this.drank = true;
        this.afterEating();
      }
    },

    afterEating() {
      if (this.ready()) this.say('Maha täynnä! Paina Valmis.', 4);
      else if (this.drank) this.say('Mmm! Syö vielä jotain.', 3);
      else this.say('Mmm! Ota vielä juotavaa: vettä tai maitoa.', 3.5);
    },

    update() {
      if (this.leaveAt && MP.time >= this.leaveAt && !this.left) {
        this.left = true;
        MP.goTo(MP.scenes.home, { done: MP.state.evening ? 'dinner' : 'breakfast' });
      }
    },

    exit() {
      this.left = false;
    },

    draw(ctx) {
      const W = MP.W, t = MP.time;

      // Kitchen wall and window
      ctx.fillStyle = '#fff1c9';
      ctx.fillRect(0, 0, W, MP.H);
      ctx.fillStyle = 'rgba(240,180,90,0.16)';
      for (let yy = 0; yy < TABLE_Y; yy += 10) {
        for (let xx = ((yy / 10) % 2) * 10; xx < W; xx += 20) ctx.fillRect(xx, yy, 10, 10);
      }
      MP.draw('window', ctx, 30, 62, { t });
      MP.draw('window', ctx, 262, 62, { t });

      // The character sitting behind the table (chewing when eating)
      const chewing = t < this.chewUntil;
      MP.drawPerson(ctx, PLATE.x, 141, {
        scale: 1.55,
        mouth: chewing ? (Math.floor(t * 12) % 2 ? 'yawn' : 'flat') : 'smile',
      });

      // Table with a checked tablecloth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, TABLE_Y, W - 28, MP.H - TABLE_Y);
      ctx.fillStyle = 'rgba(224,72,72,0.55)';
      for (let yy = TABLE_Y; yy < MP.H; yy += 8) {
        for (let xx = 14 + ((yy - TABLE_Y) / 8 % 2) * 8; xx < W - 14; xx += 16) {
          ctx.fillRect(xx, yy, 8, 8);
        }
      }
      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = MP.COLORS.outline;
      ctx.beginPath(); ctx.moveTo(14, TABLE_Y); ctx.lineTo(W - 14, TABLE_Y); ctx.stroke();

      // Plate
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(PLATE.x, PLATE.y, 28, 6.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#c9d3e6';
      ctx.beginPath(); ctx.ellipse(PLATE.x, PLATE.y, 21, 4.5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      // Foods on the plate (they get smaller with every bite)
      this.plate.forEach((f, i) => {
        if (f.id === 'banana') {
          // Peeled banana: only the fruit gets shorter, not the peel
          MP.draw('banana', ctx, PLATE.x + SLOTS[i], PLATE.y - 8, { scale: 1.55, peeled: true, eaten: f.bites / BITES });
        } else {
          const s = 1.25 * (1 - f.bites * 0.25);
          MP.draw(f.id, ctx, PLATE.x + SLOTS[i], PLATE.y - 4, { scale: s });
        }
      });
      // Empty banana peels next to the plate
      for (let i = 0; i < this.peels; i++) {
        MP.draw('banana', ctx, PEELS.x + i * 4, PEELS.y - 4 - i, { scale: 1.1, peeled: true, eaten: 1 });
      }

      // Glass
      if (this.drink) {
        MP.draw(this.drink.id, ctx, GLASS.x, GLASS.y, { scale: 1.2, level: 1 - this.drink.sips / SIPS });
      }

      // Menu cards at the top
      menu().forEach((item, i) => {
        const r = cardRect(i);
        const chosen = this.plate.some((f) => f.id === item.id) ||
          (this.drink && this.drink.id === item.id && this.drink.sips < SIPS);
        ctx.save();
        ctx.lineWidth = chosen ? 2 : 0.8;
        ctx.strokeStyle = chosen ? '#3cb371' : MP.COLORS.outline;
        ctx.fillStyle = item.type === 'drink' ? '#e8f6ff' : '#fffaf0';
        MP.roundRect(ctx, r.x, r.y, r.w, r.h, 5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        MP.draw(item.id, ctx, r.x + r.w / 2, r.y + 19, { scale: 1.45 });
        MP.drawText(ctx, item.name, r.x + r.w / 2, r.y + 35, {
          size: item.name.length > 10 ? 0.5 : 0.62, color: MP.COLORS.outline, align: 'center',
        });
      });

      // Done button
      MP.drawButton(ctx, 'Valmis!', doneButton, { size: 1.2, disabled: !this.ready() });

      // Speech bubble
      if (this.bubble && t < this.bubble.until) {
        MP.drawBubble(ctx, this.bubble.text, PLATE.x, 76, { maxWidth: 160 });
      }
    },
  };
})();
