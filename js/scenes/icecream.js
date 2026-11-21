// icecream.js – THE ICE CREAM TRUCK on the home street.
//   On sunny days the ice cream truck drives along the home street playing a
//   little tune (street.js). Walk to it and tap it:
//   1. Choose a cone (a waffle cone or a cup).
//   2. Tap the flavours to add 1–4 scoops: mansikka, suklaa, vanilja, mustikka.
//   3. Toppings: sprinkles, chocolate sauce, a cherry on top.
//   4. Eat by tapping – but a tower of 4 scoops wobbles more and more… and the
//      top scoop falls on the ground: SPLAT! The pet runs and licks it up.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const BACK = { x: 4, y: 4, w: 66, h: 18 };
  const DONE = { x: 236, y: 152, w: 80, h: 22 };
  const FLAVOURS = [
    { id: 'strawberry', name: 'Mansikka', color: '#ff9ec4' },
    { id: 'chocolate', name: 'Suklaa', color: '#8a5a32' },
    { id: 'vanilla', name: 'Vanilja', color: '#fff3c4' },
    { id: 'blueberry', name: 'Mustikka', color: '#8a7ae0' },
  ];
  const TOPPINGS = [
    { id: 'sprinkles', name: 'Nonparellit' },
    { id: 'sauce', name: 'Kastike' },
    { id: 'cherry', name: 'Kirsikka' },
  ];
  const CONES = [{ id: 'cone', name: 'Vohvelitötterö' }, { id: 'cup', name: 'Kuppi' }];
  const btn = (i, n) => ({ x: 192 + (i % 2) * 62, y: 34 + Math.floor(i / 2) * 36, w: 58, h: 32 });
  const ICE_X = 96, ICE_Y = 150;            // the bottom of the cone (big, held in front)
  const SCOOP_R = 15;

  MP.scenes.icecream = {
    noRestart: true,

    enter() {
      this.step = 'cone';
      this.cone = null;
      this.scoops = [];        // flavour colors, bottom first
      this.tops = {};
      this.licks = 0;
      this.bite = 0;           // how much of the top scoop is eaten (0..1)
      this.fall = null;        // { from, color } the top scoop falling
      this.petLick = null;
      this.say('Jäätelöauto! Jäätelömyyjä: Hei! Valitse ensin tötterö tai kuppi.', 'seller');
    },

    say(text, who) { this.bubble = { text, from: MP.time, until: Infinity, who: who || 'me' }; },

    choices() {
      if (this.step === 'cone') return CONES;
      if (this.step === 'scoops') return FLAVOURS;
      if (this.step === 'tops') return TOPPINGS;
      return [];
    },

    onTap(x, y) {
      const t = MP.time;
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.street, { from: 'icecream' });
        return;
      }
      const list = this.choices();
      for (let i = 0; i < list.length; i++) {
        if (!MP.hit(btn(i, list.length), x, y)) continue;
        const c = list[i];
        if (this.step === 'cone') {
          this.cone = c.id;
          this.step = 'scoops';
          MP.sfx.tap();
          this.say('Mitä makuja? Napauta makua – 1, 2, 3 tai jopa 4 palloa!', 'seller');
        } else if (this.step === 'scoops') {
          if (this.scoops.length >= 4) { this.say('Neljä palloa! Enempää ei mahdu… tai se kaatuu!', 'seller'); return; }
          this.scoops.push(c.color);
          MP.sfx.boing();
          if (this.scoops.length === 4) this.say('Neljän pallon torni! Pidä kiinni tiukasti…', 'seller');
        } else if (this.step === 'tops') {
          this.tops[c.id] = !this.tops[c.id];
          MP.sfx.tap();
        }
        return;
      }
      if (MP.hit(DONE, x, y)) {
        if (this.step === 'scoops' && this.scoops.length) {
          this.step = 'tops';
          MP.sfx.tap();
          this.say('Päälle jotain? Nonparelleja, kastiketta, kirsikka?', 'seller');
        } else if (this.step === 'tops') {
          this.step = 'eat';
          MP.sfx.bling();
          this.say('Ole hyvä! Se maksaa yhden hymyn. Napauta jäätelöä, niin syödään!', 'seller');
        } else if (this.step === 'end') {
          MP.sfx.tap();
          MP.goTo(MP.scenes.street, { from: 'icecream' });
        }
        return;
      }
      if (this.step === 'eat' && Math.abs(x - ICE_X) < 30 && y > 30 && y < ICE_Y + 10 && !(this.fall && t - this.fall.from < 1.2)) {
        this.licks++;
        MP.sfx.nom();
        // a tower of four wobbles… and the top one falls
        if (this.scoops.length === 4 && this.licks === 2) {
          this.fall = { from: t, color: this.scoops.pop(), x: ICE_X };
          MP.sfx.boing();
          setTimeout(() => { if (MP.scene === this) { MP.sfx.flush(); } }, 600);
          const pet = MP.myPet();
          this.say('Voi ei! Ylin pallo putosi maahan – PLÄTS!' + (pet ? ' ' + pet.name + ' tulee nuolemaan sen!' : ''), 'me');
          if (pet) this.petLick = { from: t + 0.8 };
          return;
        }
        this.bite += 0.34;
        if (this.bite >= 1) {
          this.bite = 0;
          this.scoops.pop();
          if (!this.scoops.length) {
            this.step = 'end';
            MP.sfx.applause(1);
            this.say(this.cone === 'cone' ? 'Ja lopuksi rapea tötterö. Nam! Ai, aivojäätyminen! Brrr…' : 'Kuppi tyhjä! Nam! Ai, aivojäätyminen! Brrr…', 'me');
          }
        }
      }
    },

    update() {},

    draw(ctx) {
      const t = MP.time;
      // the sunny street behind, and the truck's side with its window
      ctx.fillStyle = '#9fdcff'; ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = '#7cc56b'; ctx.fillRect(0, 150, MP.W, 30);
      ctx.fillStyle = '#d3d6dc'; ctx.fillRect(0, 150, MP.W, 8);
      ctx.save();
      ctx.lineWidth = 1; ctx.strokeStyle = O();
      ctx.fillStyle = '#ffffff'; MP.roundRect(ctx, 150, 16, 170, 130, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff9ec4'; ctx.fillRect(150, 118, 170, 10);
      for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? '#ff9ec4' : '#fff3c4'; ctx.beginPath(); ctx.moveTo(150 + i * 19, 16); ctx.lineTo(169 + i * 19, 16); ctx.lineTo(159.5 + i * 19, 26); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      MP.drawText(ctx, 'JÄÄTELÖ', 236, 4, { size: 1, color: '#e0559a', outline: '#ffffff', align: 'center' });
      // the seller in the window (when not choosing)
      const list = this.choices();
      if (!list.length) {
        ctx.fillStyle = '#bfe6ff'; ctx.fillRect(180, 34, 110, 70);
        ctx.save();
        ctx.beginPath(); ctx.rect(180, 34, 110, 70); ctx.clip();
        MP.drawPerson(ctx, 236, 132, { character: 'boy', hair: '#c0c0c8', scale: 1.6, outfit: { shirt: 'sailor', bottom: 'brown', hat: 'cap', costume: 'none', shoes: true }, mouth: 'smile', armUp: 0.6, flip: true });
        ctx.restore();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(180, 98, 110, 10); ctx.strokeStyle = O(); ctx.strokeRect(180, 98, 110, 10);
      }
      // the choice buttons
      list.forEach((c, i) => {
        const r = btn(i, list.length);
        const on = this.step === 'tops' && this.tops[c.id];
        ctx.save();
        ctx.lineWidth = on ? 2 : 0.9; ctx.strokeStyle = on ? '#e0559a' : O();
        ctx.fillStyle = on ? '#fff3a0' : '#fff7e0';
        MP.roundRect(ctx, r.x, r.y, r.w, r.h, 5); ctx.fill(); ctx.stroke();
        ctx.restore();
        const cx = r.x + r.w / 2, cy = r.y + 12;
        if (c.color) { ctx.fillStyle = c.color; ctx.strokeStyle = O(); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        else if (c.id === 'cone') this.drawCone(ctx, cx, cy + 9, 0.4, 'cone');
        else if (c.id === 'cup') this.drawCone(ctx, cx, cy + 8, 0.4, 'cup');
        else if (c.id === 'sprinkles') for (let k = 0; k < 8; k++) { ctx.fillStyle = ['#ff5d8f', '#ffd23f', '#4cc9f0', '#9be08f'][k % 4]; ctx.fillRect(cx - 8 + k * 2, cy - 2 + (k % 3) * 2, 2, 1); }
        else if (c.id === 'sauce') { ctx.fillStyle = '#5a3418'; ctx.beginPath(); ctx.ellipse(cx, cy, 7, 4, 0, 0, Math.PI * 2); ctx.fill(); }
        else if (c.id === 'cherry') { ctx.fillStyle = '#e02020'; ctx.beginPath(); ctx.arc(cx, cy + 2, 4, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#2e8b57'; ctx.beginPath(); ctx.moveTo(cx, cy - 2); ctx.quadraticCurveTo(cx + 3, cy - 7, cx + 5, cy - 7); ctx.stroke(); }
        MP.drawText(ctx, c.name, cx, r.y + r.h - 9, { size: 0.45, color: O(), align: 'center' });
      });
      if (this.step === 'scoops' && this.scoops.length) MP.drawButton(ctx, 'Valmis ▶', DONE, { size: 0.8 });
      if (this.step === 'tops') MP.drawButton(ctx, 'Valmis ▶', DONE, { size: 0.8 });
      if (this.step === 'end') MP.drawButton(ctx, 'Kiitos!', DONE, { size: 0.8, color: '#e0559a', shade: '#a8326c' });

      // me, holding the ice cream
      MP.drawPerson(ctx, 60, 176, { hero: true, scale: 1.6, mouth: this.step === 'eat' ? 'yawn' : 'smile', armUp: 0.5 });
      if (this.cone) {
        // the tower wobbles more with more scoops (and a lot with four)
        const wob = this.step === 'eat' && this.scoops.length >= 3 ? Math.sin(t * (this.scoops.length === 4 ? 7 : 3)) * (this.scoops.length === 4 ? 0.12 : 0.04) : 0;
        ctx.save();
        ctx.translate(ICE_X, ICE_Y);
        ctx.rotate(wob);
        this.drawCone(ctx, 0, 0, 1, this.cone);
        const base = this.cone === 'cone' ? -26 : -16;
        this.scoops.forEach((col, i) => {
          const top = i === this.scoops.length - 1;
          const r = SCOOP_R * (top ? 1 - this.bite * 0.6 : 1);
          ctx.fillStyle = col; ctx.strokeStyle = O(); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(0, base - i * 20, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.45)';
          ctx.beginPath(); ctx.arc(-5, base - i * 20 - 5, r * 0.25, 0, Math.PI * 2); ctx.fill();
        });
        const topY = base - (this.scoops.length - 1) * 20;
        if (this.scoops.length) {
          if (this.tops.sauce) { ctx.fillStyle = '#5a3418'; ctx.beginPath(); ctx.ellipse(0, topY - 6, 12, 6, 0, Math.PI, 0); ctx.fill(); for (const dx of [-8, 2, 9]) { ctx.beginPath(); ctx.ellipse(dx, topY - 3, 2, 4, 0, 0, Math.PI * 2); ctx.fill(); } }
          if (this.tops.sprinkles) for (let k = 0; k < 14; k++) { ctx.fillStyle = ['#ff5d8f', '#ffd23f', '#4cc9f0', '#9be08f'][k % 4]; ctx.fillRect(-10 + (k * 37) % 20, topY - 12 + (k * 13) % 10, 2.4, 1.2); }
          if (this.tops.cherry) { ctx.fillStyle = '#e02020'; ctx.strokeStyle = O(); ctx.beginPath(); ctx.arc(0, topY - 17, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#2e8b57'; ctx.beginPath(); ctx.moveTo(0, topY - 21); ctx.quadraticCurveTo(3, topY - 27, 6, topY - 27); ctx.stroke(); }
        }
        ctx.restore();
      }
      // the falling scoop: SPLAT on the ground, and the pet licks it up
      const f = this.fall;
      if (f) {
        const u = MP.clamp((t - f.from) / 0.6, 0, 1);
        const lickU = this.petLick ? MP.clamp((t - this.petLick.from) / 3, 0, 1) : 0;
        const left = 1 - lickU;
        ctx.fillStyle = f.color; ctx.strokeStyle = O(); ctx.lineWidth = 1;
        if (u < 1) { ctx.beginPath(); ctx.arc(f.x + 30 * u, 40 + 120 * u * u, SCOOP_R, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        else if (left > 0) {
          ctx.beginPath(); ctx.ellipse(f.x + 30, 166, 20 * left + 2, 5 * left + 1, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          if (t - f.from < 1.4) MP.drawText(ctx, 'PLÄTS!', f.x + 30, 128, { size: 1.4, color: '#e0559a', outline: '#ffffff', align: 'center' });
        }
        const pet = MP.myPet();
        if (pet && this.petLick && t > this.petLick.from) {
          const px = MP.lerp(-20, f.x + 14, MP.clamp((t - this.petLick.from) / 0.8, 0, 1));
          MP.drawPet(ctx, px, 172, { kind: pet.kind, scale: 1.5, eat: px > f.x, walking: px < f.x + 14, walkTime: t, happy: lickU >= 1 ? 1 : 0 });
          if (lickU >= 1) MP.drawText(ctx, 'Nam!', px, 136, { size: 0.9, color: '#e0559a', outline: '#ffffff', align: 'center' });
        }
      }

      MP.drawButton(ctx, '◀ Kadulle', BACK, { size: 0.75 });
      const b = this.bubble;
      if (b && t >= b.from) MP.drawBubble(ctx, b.text, b.who === 'seller' ? (list.length ? 250 : 236) : 60, b.who === 'seller' ? (list.length ? 30 : 64) : 100, { maxWidth: 170, size: 0.8 });
    },

    drawCone(ctx, x, y, s, kind) {
      ctx.save();
      ctx.translate(x, y); ctx.scale(s, s);
      ctx.lineWidth = 1; ctx.strokeStyle = O();
      if (kind === 'cone') {
        ctx.fillStyle = '#e8b878';
        ctx.beginPath(); ctx.moveTo(-14, -28); ctx.lineTo(14, -28); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(140,90,40,0.6)';
        for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 6 - 4, -28); ctx.lineTo(i * 3 + 6, -6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i * 6 + 4, -28); ctx.lineTo(i * 3 - 6, -6); ctx.stroke(); }
      } else {
        ctx.fillStyle = '#ff9ec4';
        ctx.beginPath(); ctx.moveTo(-15, -18); ctx.lineTo(15, -18); ctx.lineTo(10, 4); ctx.lineTo(-10, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-12, -10, 24, 3);
      }
      ctx.restore();
    },
  };
})();
