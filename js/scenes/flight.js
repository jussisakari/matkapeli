// flight.js – the flight: the plane takes off from one country, flies above
// the clouds and lands in the other one. Then you are there!
// Tap to skip.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const TAKEOFF = 4.6;   // seconds for each part
  const CRUISE = 3.2;
  const LANDING = 4.8;
  const WELCOME = 1.8;
  const GROUND_Y = 143;  // the plane's middle when its wheels are on the runway

  // ---------------------------------------------------------------------------
  // Landscapes (also used on the destination cards at the airport)
  //   land = 'desert' or 'forest', r = { x, y, w, h }, scroll = moves things
  // ---------------------------------------------------------------------------
  MP.drawLandscape = function (c, land, r, scroll) {
    const horizon = r.y + r.h * 0.72;
    const sx = (k) => -(scroll || 0) * k;
    const g = c.createLinearGradient(0, r.y, 0, horizon);
    if (land === 'desert') {
      g.addColorStop(0, '#8fc8ec'); g.addColorStop(1, '#f6e6c4');
    } else {
      g.addColorStop(0, '#8fd0f6'); g.addColorStop(1, '#e6f6ff');
    }
    c.fillStyle = g;
    c.fillRect(r.x, r.y, r.w, r.h);
    const wrap = (x) => r.x + ((((x - r.x) % (r.w + 80)) + r.w + 80) % (r.w + 80)) - 40;
    const k = r.h / 180;   // size compared to the full screen

    if (land === 'desert') {
      MP.draw('sun', c, 0, 0, { x: r.x + r.w * 0.8, y: r.y + r.h * 0.18, r: 10 * k + 2 });
      // far dunes
      c.fillStyle = '#e8cf98';
      c.beginPath(); c.moveTo(r.x, horizon);
      for (let x = 0; x <= r.w; x += 8) c.lineTo(r.x + x, horizon - 10 * k - Math.sin((x + sx(0.2)) / 40) * 6 * k);
      c.lineTo(r.x + r.w, horizon); c.closePath(); c.fill();
      // pyramids far away
      for (const [px, pw, ph] of [[0.25, 46, 32], [0.45, 38, 26], [0.6, 18, 12]]) {
        const x = wrap(r.x + r.w * px + sx(0.3)), base = horizon - 4 * k;
        c.fillStyle = '#d6b886';
        c.beginPath(); c.moveTo(x - pw * k / 2, base); c.lineTo(x, base - ph * k); c.lineTo(x + pw * k / 2, base); c.closePath(); c.fill();
        c.fillStyle = '#bf9d68';
        c.beginPath(); c.moveTo(x, base - ph * k); c.lineTo(x + pw * k / 2, base); c.lineTo(x + pw * k * 0.1, base); c.closePath(); c.fill();
      }
      c.fillStyle = '#e2c28b';
      c.fillRect(r.x, horizon, r.w, r.y + r.h - horizon);
      // palms
      for (let i = 0; i < 5; i++) {
        const x = wrap(r.x + i * 70 + 20 + sx(1));
        const base = horizon + 6 * k;
        c.strokeStyle = '#8a6a45'; c.lineWidth = 2.2 * k;
        c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + 3 * k, base - 14 * k, x + 2 * k, base - 26 * k); c.stroke();
        c.fillStyle = '#4d8a3a';
        for (let j = 0; j < 5; j++) {
          const a = -Math.PI / 2 + (j - 2) * 0.65;
          c.beginPath(); c.ellipse(x + 2 * k + Math.cos(a) * 7 * k, base - 26 * k + Math.sin(a) * 3 * k + 3 * k, 8 * k, 2 * k, a, 0, Math.PI * 2); c.fill();
        }
      }
    } else {
      // far hills and a lake
      c.fillStyle = '#7fb6d8';
      c.beginPath(); c.moveTo(r.x, horizon);
      for (let x = 0; x <= r.w; x += 8) c.lineTo(r.x + x, horizon - 12 * k - Math.sin((x + sx(0.2)) / 50) * 5 * k);
      c.lineTo(r.x + r.w, horizon); c.closePath(); c.fill();
      c.fillStyle = '#5aa84f';
      c.fillRect(r.x, horizon, r.w, r.y + r.h - horizon);
      c.fillStyle = '#4aa3d8';
      c.beginPath(); c.ellipse(wrap(r.x + r.w * 0.6 + sx(0.5)), horizon + 4 * k, 40 * k, 3 * k, 0, 0, Math.PI * 2); c.fill();
      // spruce forest
      for (let i = 0; i < 26; i++) {
        const x = wrap(r.x + i * 15 + sx(0.6));
        const h = (14 + (i * 7) % 9) * k;
        const base = horizon + 1 * k;
        c.fillStyle = i % 3 ? '#2e7d4f' : '#256b42';
        c.beginPath(); c.moveTo(x - h * 0.3, base); c.lineTo(x, base - h); c.lineTo(x + h * 0.3, base); c.closePath(); c.fill();
      }
      // a red cottage
      const hx = wrap(r.x + r.w * 0.2 + sx(0.8));
      c.fillStyle = '#b8322c';
      c.fillRect(hx - 6 * k, horizon - 2 * k, 12 * k, 7 * k);
      c.fillStyle = '#5a3a2a';
      c.beginPath(); c.moveTo(hx - 8 * k, horizon - 2 * k); c.lineTo(hx, horizon - 8 * k); c.lineTo(hx + 8 * k, horizon - 2 * k); c.closePath(); c.fill();
    }
  };

  function runway(c, scroll) {
    c.fillStyle = '#6b6f7a';
    c.fillRect(0, 146, MP.W, 14);
    c.fillStyle = '#ffffff';
    for (let x = -((scroll * 1.2) % 30); x < MP.W; x += 30) c.fillRect(x, 152.5, 15, 1.5);
    c.fillStyle = '#4c5060';
    c.fillRect(0, 160, MP.W, 20);
  }

  function clouds(c, t, y, speed, n, size) {
    c.fillStyle = 'rgba(255,255,255,0.95)';
    for (let i = 0; i < n; i++) {
      const x = ((i * 97 - t * speed) % (MP.W + 120) + MP.W + 120) % (MP.W + 120) - 60;
      const yy = y + (i % 3) * 9;
      const s = size * (0.8 + (i % 4) * 0.15);
      c.beginPath();
      c.arc(x, yy, 9 * s, 0, Math.PI * 2);
      c.arc(x + 11 * s, yy - 5 * s, 11 * s, 0, Math.PI * 2);
      c.arc(x + 24 * s, yy, 9 * s, 0, Math.PI * 2);
      c.fill();
    }
  }

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.flight = {
    // params: { from: 'home', to: 'egypt' }
    enter(params) {
      this.from = MP.findDestination((params && params.from) || 'home');
      this.to = MP.findDestination((params && params.to) || 'egypt');
      this.t = 0;
      this.done = false;
      this.landedSound = false;
      MP.sfx.tap();
    },

    onTap() {
      // skip to the end
      if (this.t > 0.5 && this.t < TAKEOFF + CRUISE + LANDING) this.t = TAKEOFF + CRUISE + LANDING;
    },

    update(dt) {
      this.t += dt;
      const end = TAKEOFF + CRUISE + LANDING;
      if (this.t > TAKEOFF + CRUISE + LANDING * 0.62 && !this.landedSound) {
        this.landedSound = true;
        MP.sfx.boing();
      }
      if (this.t > end && !this.welcomed) {
        this.welcomed = true;
        MP.sfx.bling();
      }
      if (this.t > end + WELCOME && !this.done) {
        this.done = true;
        this.welcomed = false;
        MP.goTo(MP.scenes[this.to.scene], this.to.params);
      }
    },

    draw(ctx) {
      const t = this.t;
      const full = { x: 0, y: 0, w: MP.W, h: MP.H };

      if (t < TAKEOFF) {
        // ===== Taking off =====
        const u = t / TAKEOFF;
        MP.drawLandscape(ctx, this.from.land, full, 0);
        runway(ctx, u * u * 300);
        const x = 40 + 300 * u * u;
        const climb = MP.clamp((u - 0.5) / 0.5, 0, 1);
        const y = GROUND_Y - climb * climb * 170;
        const tilt = -0.28 * MP.clamp((u - 0.42) * 6, 0, 1);
        MP.drawPlane(ctx, x, y, 1.3, tilt, u < 0.8);
        if (u < 0.55) {
          // a little dust behind the wheels
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          for (let i = 0; i < 4; i++) {
            ctx.beginPath(); ctx.arc(x - 30 - i * 8 * u * 3, 156 - i, 2 + i * u * 3, 0, Math.PI * 2); ctx.fill();
          }
        }
        MP.drawText(ctx, 'Nousu!', MP.W / 2, 8, { size: 1.6, color: '#ffffff', outline: O(), align: 'center' });
      } else if (t < TAKEOFF + CRUISE) {
        // ===== Above the clouds =====
        const u = (t - TAKEOFF) / CRUISE;
        const g = ctx.createLinearGradient(0, 0, 0, MP.H);
        g.addColorStop(0, '#3f8fdc'); g.addColorStop(1, '#bfe6ff');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, MP.W, MP.H);
        MP.draw('sun', ctx, 0, 0, { x: 270, y: 34, r: 12 });
        clouds(ctx, t, 40, 30, 4, 0.8);
        MP.drawPlane(ctx, 150, 92 + Math.sin(t * 2) * 3, 1.5, Math.sin(t * 1.3) * 0.03, false);
        clouds(ctx, t, 140, 120, 7, 1.6);
        // where we are flying: a line from one flag to the other
        ctx.save();
        ctx.fillStyle = 'rgba(255,250,235,0.92)';
        ctx.strokeStyle = O();
        ctx.lineWidth = 0.8;
        MP.roundRect(ctx, 50, 6, 220, 26, 6); ctx.fill(); ctx.stroke();
        this.from.flag(ctx, 58, 13, 16, 11); ctx.strokeRect(58, 13, 16, 11);
        this.to.flag(ctx, 246, 13, 16, 11); ctx.strokeRect(246, 13, 16, 11);
        ctx.setLineDash([3, 2]);
        ctx.strokeStyle = '#2f6fb8';
        ctx.beginPath(); ctx.moveTo(80, 18.5); ctx.lineTo(240, 18.5); ctx.stroke();
        ctx.restore();
        MP.drawPlane(ctx, 84 + u * 152, 18.5, 0.22, 0, false);
        MP.drawText(ctx, this.from.name, 66, 25, { size: 0.55, color: O(), align: 'center' });
        MP.drawText(ctx, this.to.name, 254, 25, { size: 0.55, color: O(), align: 'center' });
      } else {
        // ===== Landing =====
        const u = MP.clamp((t - TAKEOFF - CRUISE) / LANDING, 0, 1);
        const TOUCH = 0.62;      // when the wheels touch the runway
        let x, y, tilt;
        if (u < TOUCH) {
          const v = u / TOUCH;
          x = -50 + v * 220;
          y = 20 + (GROUND_Y - 20) * (1 - (1 - v) * (1 - v));
          tilt = MP.lerp(0.12, -0.08, MP.clamp((v - 0.7) / 0.3, 0, 1));
        } else {
          const v = (u - TOUCH) / (1 - TOUCH);
          x = 170 + 70 * (1 - (1 - v) * (1 - v));     // slowing down
          y = GROUND_Y;
          tilt = -0.08 * Math.max(0, 1 - v * 4);
        }
        MP.drawLandscape(ctx, this.to.land, full, 0);
        runway(ctx, u * 200);
        MP.drawPlane(ctx, x, y, 1.3, tilt, u > 0.2);
        if (u > TOUCH && u < TOUCH + 0.12) {
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.beginPath(); ctx.arc(x - 4, 157, 5, 0, Math.PI * 2); ctx.arc(x - 12, 156, 4, 0, Math.PI * 2); ctx.fill();
        }
        const text = t >= TAKEOFF + CRUISE + LANDING
          ? (this.to.id === 'home' ? 'Tervetuloa kotiin!' : 'Tervetuloa ' + this.to.to + '!')
          : 'Lasku: ' + this.to.name;
        MP.drawText(ctx, text, MP.W / 2, 8, { size: 1.6, color: '#ffffff', outline: O(), align: 'center' });
      }
      if (t < TAKEOFF + CRUISE + LANDING && t > 0.5) {
        MP.drawText(ctx, '(napauta ohittaaksesi)', MP.W - 4, 170, { size: 0.55, color: '#ffffff', outline: O(), align: 'right' });
      }
    },
  };
})();
