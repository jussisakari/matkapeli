// passport.js (scene) – the passport from the nightstand drawer in your room.
// The first page has your picture and name, then one page per country with
// its stamp (or "Vielä matkustamatta" if you have not been there yet).
// Arrows (or tapping a page side) turn the pages.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const BOOK = { x: 22, y: 20, w: 276, h: 134 };
  const SPINE = BOOK.x + BOOK.w / 2;
  const page = (side) => ({ x: side === 0 ? BOOK.x + 6 : SPINE + 3, y: BOOK.y + 6, w: BOOK.w / 2 - 9, h: BOOK.h - 12 });
  const BACK = { x: 4, y: 156, w: 74, h: 20 };
  const PREV = { x: 11, y: 87, r: 9 };
  const NEXT = { x: 309, y: 87, r: 9 };

  // 'id' = the picture page, then one page for each country
  const pages = () => ['id'].concat(MP.stampPlaces().map((d) => d.id));

  function idPage(ctx, p, t) {
    const name = MP.PASSPORT_NAME[MP.state.character] || 'Matkaaja';
    MP.drawText(ctx, 'PASSI – SUOMI', p.x + p.w / 2, p.y + 4, { size: 0.8, color: '#24386b', align: 'center' });
    // the photo: you, from the shoulders up
    const ph = { x: p.x + 8, y: p.y + 18, w: 44, h: 52 };
    ctx.save();
    ctx.fillStyle = '#dfeaf5';
    ctx.fillRect(ph.x, ph.y, ph.w, ph.h);
    ctx.beginPath(); ctx.rect(ph.x, ph.y, ph.w, ph.h); ctx.clip();
    MP.drawPerson(ctx, ph.x + ph.w / 2, ph.y + ph.h + 44, { scale: 2, mouth: 'smile', eyes: 'open' });
    ctx.restore();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = O();
    ctx.strokeRect(ph.x, ph.y, ph.w, ph.h);
    const tx = ph.x + ph.w + 6;
    const line = (label, value, y) => {
      MP.drawText(ctx, label, tx, y, { size: 0.5, color: '#6b5f80' });
      MP.drawText(ctx, value, tx, y + 6, { size: 0.8, color: O() });
    };
    line('Nimi', name, p.y + 18);
    line('Kansalaisuus', 'Suomi', p.y + 38);
    line('Leimoja', MP.stampCount() + ' / ' + MP.stampPlaces().length, p.y + 58);
    // a signature line
    ctx.strokeStyle = '#6b5f80';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(p.x + 8, p.y + 92); ctx.lineTo(p.x + p.w - 8, p.y + 92); ctx.stroke();
    MP.drawText(ctx, name, p.x + 14, p.y + 82, { size: 0.9, color: '#2f4fa8' });
    if (MP.allStamps()) {
      MP.drawText(ctx, 'Olet todellinen', p.x + p.w / 2, p.y + 98, { size: 0.7, color: '#c0392b', align: 'center' });
      MP.drawText(ctx, 'maailmanmatkaaja!', p.x + p.w / 2, p.y + 106, { size: 0.7, color: '#c0392b', align: 'center' });
    }
    void t;
  }

  function countryPage(ctx, p, id) {
    const d = MP.findDestination(id);
    if (!d) return;
    d.flag(ctx, p.x + 8, p.y + 5, 12, 8);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = O();
    ctx.strokeRect(p.x + 8, p.y + 5, 12, 8);
    MP.drawText(ctx, d.name, p.x + 24, p.y + 4, { size: 0.85, color: '#24386b' });
    const cx = p.x + p.w / 2, cy = p.y + 64;
    if (MP.hasStamp(id)) {
      MP.drawStamp(ctx, id, cx, cy, 1.45);
    } else {
      ctx.save();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = 'rgba(107,95,128,0.5)';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      MP.drawText(ctx, 'Vielä', cx, cy - 8, { size: 0.75, color: '#8a8098', align: 'center' });
      MP.drawText(ctx, 'matkustamatta', cx, cy + 1, { size: 0.75, color: '#8a8098', align: 'center' });
    }
  }

  MP.scenes.passport = {
    noRestart: true,

    enter() {
      this.spread = 0;
      this.openedAt = MP.time;
    },

    spreads() { return Math.ceil(pages().length / 2); },

    turn(d) {
      const next = MP.clamp(this.spread + d, 0, this.spreads() - 1);
      if (next !== this.spread) {
        this.spread = next;
        MP.sfx.tap();
      }
    },

    onTap(x, y) {
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.home);
        return;
      }
      if (Math.hypot(x - PREV.x, y - PREV.y) < PREV.r + 5) return this.turn(-1);
      if (Math.hypot(x - NEXT.x, y - NEXT.y) < NEXT.r + 5) return this.turn(1);
      if (MP.hit(page(1), x, y)) this.turn(1);
      else if (MP.hit(page(0), x, y)) this.turn(-1);
    },

    draw(ctx) {
      const t = MP.time;
      // the child's room wallpaper behind
      ctx.fillStyle = '#f6dfe8';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let x = 0; x < MP.W; x += 16) ctx.fillRect(x, 0, 7, MP.H);
      MP.drawText(ctx, 'Passi', MP.W / 2, 3, { size: 1.3, color: '#ffffff', outline: O(), align: 'center' });

      // the open passport
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#24386b';
      MP.roundRect(ctx, BOOK.x - 4, BOOK.y - 4, BOOK.w + 8, BOOK.h + 8, 6); ctx.fill(); ctx.stroke();
      for (const side of [0, 1]) {
        const p = page(side);
        ctx.fillStyle = '#f4f0dc';
        MP.roundRect(ctx, p.x, p.y, p.w, p.h, 3); ctx.fill(); ctx.stroke();
        // faint security lines like a real passport
        ctx.strokeStyle = 'rgba(120,140,170,0.18)';
        ctx.lineWidth = 0.5;
        for (let k = 0; k < 6; k++) {
          ctx.beginPath();
          for (let x = 0; x <= p.w; x += 4) {
            const yy = p.y + 20 + k * 18 + Math.sin(x / 9 + k) * 3;
            if (x === 0) ctx.moveTo(p.x + x, yy); else ctx.lineTo(p.x + x, yy);
          }
          ctx.stroke();
        }
        ctx.strokeStyle = O();
        ctx.lineWidth = 1;
      }
      ctx.restore();

      const list = pages();
      for (const side of [0, 1]) {
        const id = list[this.spread * 2 + side];
        if (!id) continue;
        const p = page(side);
        if (id === 'id') idPage(ctx, p, t);
        else countryPage(ctx, p, id);
      }

      const n = this.spreads();
      MP.drawText(ctx, (this.spread + 1) + ' / ' + n, MP.W / 2, 160, { size: 0.8, color: O(), align: 'center' });
      const arrow = (a, dir, on) => {
        ctx.save();
        ctx.globalAlpha = on ? 1 : 0.3;
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = O();
        ctx.beginPath(); ctx.moveTo(a.x + dir * 4, a.y); ctx.lineTo(a.x - dir * 2.5, a.y - 4); ctx.lineTo(a.x - dir * 2.5, a.y + 4); ctx.closePath(); ctx.fill();
        ctx.restore();
      };
      arrow(PREV, -1, this.spread > 0);
      arrow(NEXT, 1, this.spread < n - 1);
      MP.drawButton(ctx, '◀ Takaisin', BACK, { size: 0.85 });

      // every stamp collected: a little party when the passport opens
      if (MP.allStamps() && t - this.openedAt < 4) MP.drawConfetti(ctx, t - this.openedAt, 40);
    },
  };
})();
