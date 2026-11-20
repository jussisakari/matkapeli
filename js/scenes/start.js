// start.js – the night start screen: choose the girl or the boy, press "Aloita",
// and the night turns into morning.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  const SUNRISE_TIME = 3.2;  // seconds from night to morning
  const ROOSTER_AT = 0.55;   // when the rooster crows (0 = night, 1 = morning)

  // Sky colors: night → dawn → morning
  const SKY = [
    { top: '#0b1030', bottom: '#28306b' },
    { top: '#5b4b8a', bottom: '#ff9e6b' },
    { top: '#6cc0ff', bottom: '#cdeeff' },
  ];

  // Stars at fixed places (the same every time)
  const stars = [];
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 45; i++) {
    stars.push({ x: rnd() * MP.W, y: rnd() * 110, r: 0.5 + rnd() * 0.8, phase: rnd() * 6 });
  }

  const cards = {
    girl: { x: 100, y: 58, w: 56, h: 80 },
    boy:  { x: 164, y: 58, w: 56, h: 80 },
  };
  const startButton = { x: 115, y: 145, w: 90, h: 24 };

  function skyAt(k) {
    const a = k < 0.5 ? SKY[0] : SKY[1];
    const b = k < 0.5 ? SKY[1] : SKY[2];
    const u = k < 0.5 ? k / 0.5 : (k - 0.5) / 0.5;
    return { top: MP.mixColor(a.top, b.top, u), bottom: MP.mixColor(a.bottom, b.bottom, u) };
  }

  MP.scenes.start = {
    enter() {
      this.mode = 'choose';             // 'choose' or 'sunrise'
      this.t = 0;                       // time since the sunrise started
      this.selected = MP.state.character || null;
      this.crowed = false;
      this.leaving = false;
    },

    onTap(x, y) {
      if (this.mode === 'sunrise') {
        // Tapping during the sunrise jumps to the end
        this.t = Math.max(this.t, SUNRISE_TIME);
        return;
      }
      for (const id of ['girl', 'boy']) {
        if (MP.hit(cards[id], x, y)) {
          this.selected = id;
          MP.sfx.tap();
          return;
        }
      }
      if (this.selected && MP.hit(startButton, x, y)) {
        MP.state.character = this.selected;
        MP.state.quest = 'wake';
        // A new morning: start in pyjamas
        MP.state.outfit = { shirt: 'pyjama', bottom: 'pyjama', hat: 'none', costume: 'none', shoes: false };
        MP.save();
        MP.sfx.bling();
        this.mode = 'sunrise';
        this.t = 0;
      }
    },

    update(dt) {
      if (this.mode !== 'sunrise') return;
      this.t += dt;
      const k = this.t / SUNRISE_TIME;
      if (k >= ROOSTER_AT && !this.crowed) {
        this.crowed = true;
        MP.sfx.rooster();
      }
      if (this.t >= SUNRISE_TIME + 1.2 && !this.leaving) {
        this.leaving = true;
        MP.goTo(MP.scenes.home, { quest: 'wake' });
      }
    },

    draw(ctx) {
      const W = MP.W, H = MP.H, time = MP.time;
      const k = this.mode === 'sunrise' ? MP.clamp(this.t / SUNRISE_TIME, 0, 1) : 0;
      const night = 1 - k;

      // --- Sky ---
      const sky = skyAt(k);
      const g = ctx.createLinearGradient(0, 0, 0, 150);
      g.addColorStop(0, sky.top);
      g.addColorStop(1, sky.bottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // --- Twinkling stars (fade away in the morning) ---
      const starAlpha = MP.clamp(1 - k * 2.2, 0, 1);
      if (starAlpha > 0) {
        ctx.fillStyle = '#ffffff';
        for (const s of stars) {
          ctx.globalAlpha = starAlpha * (0.45 + 0.55 * Math.abs(Math.sin(time * 1.6 + s.phase)));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // --- Moon goes down, sun comes up ---
      const moonY = 30 + k * 260;
      if (moonY < 200) {
        ctx.save();
        const glow = ctx.createRadialGradient(288, moonY, 6, 288, moonY, 26);
        glow.addColorStop(0, 'rgba(255,244,194,0.35)');
        glow.addColorStop(1, 'rgba(255,244,194,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(258, moonY - 30, 60, 60);
        ctx.restore();
        MP.draw('moon', ctx, 288, moonY, { r: 11 });
      }
      if (k > 0.25) {
        const u = (k - 0.25) / 0.75;
        const sunY = 175 - (1 - Math.pow(1 - u, 2)) * 130;
        MP.draw('sun', ctx, 228, sunY, { r: 13, t: time });
      }

      // --- Hills, house and garden ---
      ctx.fillStyle = MP.mixColor('#5aa84f', '#1d3b2a', night);
      ctx.beginPath();
      ctx.ellipse(250, 168, 140, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = MP.mixColor('#6cbf5b', '#244a33', night);
      ctx.fillRect(0, 150, W, 30);
      ctx.beginPath();
      ctx.ellipse(60, 155, 110, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      MP.draw('house', ctx, 50, 152, { night, lights: k < 0.5 });

      // --- Title ---
      MP.drawText(ctx, 'Matkapeli', W / 2, 6, { size: 2.7, color: '#ffe680', outline: '#2b2340', align: 'center' });
      MP.drawText(ctx, 'Suunnitellut Ella', W / 2, 32, { size: 1.25, color: '#ffb3d9', outline: '#2b2340', align: 'center' });

      // --- Character cards and the start button (fade out at sunrise) ---
      const uiAlpha = this.mode === 'choose' ? 1 : MP.clamp(1 - this.t * 3, 0, 1);
      if (uiAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = uiAlpha;
        if (!this.selected) {
          MP.drawText(ctx, 'Valitse, kumpi pelaa!', W / 2, 46, { size: 0.9, color: '#cfe3ff', align: 'center' });
        }
        for (const id of ['girl', 'boy']) {
          const r = cards[id];
          const sel = this.selected === id;
          ctx.save();
          ctx.lineWidth = sel ? 2.6 : 0.8;
          ctx.strokeStyle = sel ? '#ffd23f' : '#2b2340';
          ctx.fillStyle = sel ? '#fff7e0' : '#efe4cc';
          MP.roundRect(ctx, r.x, r.y, r.w, r.h, 7);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          const hop = sel ? -Math.abs(Math.sin(time * 5)) * 3 : 0;
          MP.drawPerson(ctx, r.x + r.w / 2, r.y + r.h - 16 + hop, { character: id, outfit: {}, scale: 1.25 });
          MP.drawText(ctx, MP.CHARACTERS[id].name, r.x + r.w / 2, r.y + r.h - 13, {
            size: 1.1, color: '#2b2340', align: 'center',
          });
        }
        MP.drawButton(ctx, 'Aloita', startButton, { size: 1.4, disabled: !this.selected });
        ctx.restore();
      }

      // --- Rooster with "Kukkokiekuu!" ---
      if (k >= ROOSTER_AT - 0.05) {
        const pop = MP.clamp((k - (ROOSTER_AT - 0.05)) * 8, 0, 1);
        MP.draw('rooster', ctx, 150, 156, { scale: 1.8 * pop });
        if (k >= ROOSTER_AT) {
          MP.drawBubble(ctx, 'Kukkokiekuu!', 140, 124, { size: 1.2 });
        }
      }
    },
  };
})();
