// album.js – the photo album on the little table in the living room.
// Two photos per spread, newest first. Arrows (or tapping a page side) turn the
// pages, tapping a photo shows it big, the bin asks before deleting.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const BOOK = { x: 22, y: 20, w: 276, h: 134 };
  const SPINE = BOOK.x + BOOK.w / 2;
  const page = (side) => ({ x: side === 0 ? BOOK.x + 6 : SPINE + 3, y: BOOK.y + 6, w: BOOK.w / 2 - 9, h: BOOK.h - 12 });
  const photoRect = (side) => { const p = page(side); return { x: p.x + 7, y: p.y + 14, w: p.w - 14, h: (p.w - 14) * 9 / 16 }; };
  const binRect = (side) => { const p = page(side); return { x: p.x + p.w - 20, y: p.y + p.h - 20, w: 16, h: 16 }; };
  const BACK = { x: 4, y: 156, w: 74, h: 20 };
  const PREV = { x: 11, y: 87, r: 9 };
  const NEXT = { x: 309, y: 87, r: 9 };
  const ASK = { x: 80, y: 56, w: 160, h: 68 };
  const ASK_YES = { x: 94, y: 94, w: 60, h: 22 };
  const ASK_NO = { x: 166, y: 94, w: 60, h: 22 };

  // index 0 = the newest photo
  const photoAt = (i) => MP.photos[MP.photos.length - 1 - i];

  MP.scenes.album = {
    noRestart: true,

    enter() {
      this.spread = 0;
      this.big = null;       // index of the photo shown big
      this.ask = null;       // index of the photo we ask about deleting
      this.turnFrom = -9;
    },

    spreads() { return Math.max(1, Math.ceil(MP.photos.length / 2)); },

    turn(d) {
      const n = this.spreads();
      const next = MP.clamp(this.spread + d, 0, n - 1);
      if (next !== this.spread) {
        this.spread = next;
        this.turnFrom = MP.time;
        MP.sfx.tap();
      }
    },

    onTap(x, y) {
      if (this.ask != null) {
        if (MP.hit(ASK_YES, x, y)) {
          MP.deletePhoto(MP.photos.length - 1 - this.ask);
          MP.sfx.flush();
          this.ask = null;
          this.spread = Math.min(this.spread, this.spreads() - 1);
        } else if (MP.hit(ASK_NO, x, y) || !MP.hit(ASK, x, y)) {
          MP.sfx.tap();
          this.ask = null;
        }
        return;
      }
      if (this.big != null) {
        this.big = null;
        MP.sfx.tap();
        return;
      }
      if (MP.hit(BACK, x, y)) {
        MP.sfx.tap();
        MP.goTo(MP.scenes.home);
        return;
      }
      if (Math.hypot(x - PREV.x, y - PREV.y) < PREV.r + 5) return this.turn(-1);
      if (Math.hypot(x - NEXT.x, y - NEXT.y) < NEXT.r + 5) return this.turn(1);
      for (const side of [0, 1]) {
        const i = this.spread * 2 + side;
        if (!photoAt(i)) continue;
        if (MP.hit(binRect(side), x, y)) {
          this.ask = i;
          MP.sfx.tap();
          return;
        }
        if (MP.hit(photoRect(side), x, y)) {
          this.big = i;
          MP.sfx.bling();
          return;
        }
      }
      // the edges of the pages turn them too
      if (MP.hit(page(1), x, y)) this.turn(1);
      else if (MP.hit(page(0), x, y)) this.turn(-1);
    },

    draw(ctx) {
      const t = MP.time;
      // a cosy background: the living room wallpaper
      ctx.fillStyle = '#cfe8c8';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let x = 0; x < MP.W; x += 16) ctx.fillRect(x, 0, 7, MP.H);
      MP.drawText(ctx, 'Lomakuvat', MP.W / 2, 3, { size: 1.3, color: '#ffffff', outline: O(), align: 'center' });

      // the open album
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = '#3aa8a0';
      MP.roundRect(ctx, BOOK.x - 4, BOOK.y - 4, BOOK.w + 8, BOOK.h + 8, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fffaf0';
      for (const side of [0, 1]) {
        const p = page(side);
        MP.roundRect(ctx, p.x, p.y, p.w, p.h, 3); ctx.fill(); ctx.stroke();
      }
      ctx.restore();

      if (!MP.photos.length) {
        MP.drawText(ctx, 'Albumi on vielä tyhjä.', page(0).x + page(0).w / 2, 60, { size: 0.9, color: O(), align: 'center' });
        MP.drawText(ctx, 'Ota kuvia kameralla', page(1).x + page(1).w / 2, 54, { size: 0.85, color: O(), align: 'center' });
        MP.drawText(ctx, 'matkoilla! 📷', page(1).x + page(1).w / 2, 66, { size: 0.85, color: O(), align: 'center' });
      }

      for (const side of [0, 1]) {
        const i = this.spread * 2 + side;
        const ph = photoAt(i);
        if (!ph) continue;
        const r = photoRect(side);
        ctx.save();
        // photo corners like a real album, slightly crooked
        ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
        ctx.rotate(side ? 0.025 : -0.025);
        ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
        MP.drawPhoto(ctx, ph, r);
        ctx.fillStyle = '#2b2340';
        for (const [cx, cy, sx, sy] of [[r.x, r.y, 1, 1], [r.x + r.w, r.y, -1, 1], [r.x, r.y + r.h, 1, -1], [r.x + r.w, r.y + r.h, -1, -1]]) {
          ctx.beginPath(); ctx.moveTo(cx - sx * 3, cy - sy * 3); ctx.lineTo(cx + sx * 6, cy - sy * 3); ctx.lineTo(cx - sx * 3, cy + sy * 6); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        const place = MP.PHOTO_PLACES[ph.place] || { name: 'Matkalla', sticker: '⭐' };
        MP.drawText(ctx, place.name + ' ' + place.sticker, r.x + 2, r.y + r.h + 6, { size: 0.85, color: O() });
        // the bin
        const b = binRect(side);
        ctx.save();
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#c9d1db';
        ctx.beginPath(); ctx.moveTo(b.x + 3, b.y + 5); ctx.lineTo(b.x + 13, b.y + 5); ctx.lineTo(b.x + 12, b.y + 15); ctx.lineTo(b.x + 4, b.y + 15); ctx.closePath(); ctx.fill(); ctx.stroke();
        MP.roundRect(ctx, b.x + 2, b.y + 2.5, 12, 2.5, 1); ctx.fill(); ctx.stroke();
        for (const lx of [6, 8, 10]) { ctx.beginPath(); ctx.moveTo(b.x + lx, b.y + 7); ctx.lineTo(b.x + lx, b.y + 13); ctx.stroke(); }
        ctx.restore();
      }

      // page numbers and arrows
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
      void t;

      // one photo big
      if (this.big != null && photoAt(this.big)) {
        ctx.save();
        ctx.fillStyle = 'rgba(13,20,51,0.75)';
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.restore();
        MP.drawPhoto(ctx, photoAt(this.big), { x: 24, y: 12, w: 272, h: 153 });
        const place = MP.PHOTO_PLACES[photoAt(this.big).place];
        if (place) MP.drawText(ctx, place.name + ' ' + place.sticker, MP.W / 2, 168, { size: 0.8, color: '#ffffff', outline: O(), align: 'center' });
      }

      // "delete this photo?"
      if (this.ask != null) {
        ctx.save();
        ctx.fillStyle = 'rgba(13,20,51,0.55)';
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.lineWidth = 1;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#fff7e0';
        MP.roundRect(ctx, ASK.x, ASK.y, ASK.w, ASK.h, 8); ctx.fill(); ctx.stroke();
        ctx.restore();
        MP.drawText(ctx, 'Poistetaanko kuva?', MP.W / 2, ASK.y + 12, { size: 1.1, color: O(), align: 'center' });
        MP.drawButton(ctx, 'Kyllä', ASK_YES, { size: 1 });
        MP.drawButton(ctx, 'Ei', ASK_NO, { size: 1, color: '#e0559a', shade: '#a8326c' });
      }
    },
  };
})();
