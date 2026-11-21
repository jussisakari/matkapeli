// passport.js – the passport and the stamps from every country.
//   MP.addStamp('egypt')     → true the first time (saved in MP.state.treasures.stamps)
//   MP.hasStamp('egypt')
//   MP.drawStamp(ctx, id, x, y, size)      one stamp, like ink on paper
//   MP.drawStampMoment(ctx, id, age, all)  the "TUMP!" after landing (flight.js)
//   MP.drawConfetti(ctx, t)                 falling confetti over the screen
//   MP.drawPassportIcon(ctx, x, y, s)      a small closed passport
// The passport book itself is the scene in js/scenes/passport.js.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  // The name in the passport (the game is Ella's!)
  MP.PASSPORT_NAME = { girl: 'Ella', boy: 'Matkaaja' };

  // Countries that give a stamp: every place you can fly to, except home
  MP.stampPlaces = () => MP.DESTINATIONS.filter((d) => d.id !== 'home');

  MP.hasStamp = (id) => !!(MP.state.treasures && MP.state.treasures.stamps && MP.state.treasures.stamps[id]);

  MP.addStamp = function (id) {
    if (id === 'home' || MP.hasStamp(id)) return false;
    MP.state.treasures = MP.state.treasures || {};
    MP.state.treasures.stamps = MP.state.treasures.stamps || {};
    MP.state.treasures.stamps[id] = true;
    MP.save();
    return true;
  };
  MP.stampCount = () => MP.stampPlaces().filter((d) => MP.hasStamp(d.id)).length;
  MP.allStamps = () => MP.stampCount() === MP.stampPlaces().length;

  // ---------------------------------------------------------------------------
  // The pictures inside the stamps. Drawn around (0, 0), about 14 units big.
  // Everything uses the ink color, like a real rubber stamp.
  // ---------------------------------------------------------------------------
  const STAMPS = {
    egypt: {
      ink: '#b5462a',
      pic(c) {   // a pyramid and the sun
        c.beginPath(); c.moveTo(-9, 6); c.lineTo(0, -6); c.lineTo(9, 6); c.closePath(); c.stroke();
        c.beginPath(); c.moveTo(0, -6); c.lineTo(2, 6); c.stroke();
        c.beginPath(); c.arc(8, -6, 2.4, 0, Math.PI * 2); c.fill();
      },
    },
    winter: {
      ink: '#2f7fc4',
      pic(c) {   // a snowflake
        for (let i = 0; i < 3; i++) {
          c.save(); c.rotate(i * Math.PI / 3);
          c.beginPath(); c.moveTo(0, -8); c.lineTo(0, 8); c.stroke();
          for (const s of [-1, 1]) {
            c.beginPath(); c.moveTo(0, s * 5); c.lineTo(-2.5, s * 7.5); c.moveTo(0, s * 5); c.lineTo(2.5, s * 7.5); c.stroke();
          }
          c.restore();
        }
      },
    },
    thailand: {
      ink: '#8a3fb0',
      pic(c) {   // an elephant with its trunk up
        c.beginPath(); c.ellipse(-1, 1, 7, 4.6, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(6, -2, 3.4, 0, Math.PI * 2); c.fill();
        c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(8.5, -1); c.quadraticCurveTo(12, 0, 11, -6); c.stroke();
        for (const lx of [-6, -2, 2, 5]) c.fillRect(lx - 1, 4, 2, 4);
        c.fillStyle = '#fffaf0';
        c.beginPath(); c.arc(6.6, -3, 0.7, 0, Math.PI * 2); c.fill();
      },
    },
    newyork: {
      ink: '#2e8b57',
      pic(c) {   // skyscrapers
        c.strokeRect(-9, -2, 5, 9);
        c.strokeRect(-3, -9, 6, 16);
        c.beginPath(); c.moveTo(0, -9); c.lineTo(0, -13); c.stroke();
        c.strokeRect(4, -4, 5, 11);
        for (let y = -6; y < 6; y += 3) c.fillRect(-1.5, y, 3, 1);
      },
    },
  };
  // A country without its own picture uses its flag
  const stampOf = (id) => STAMPS[id] || { ink: '#c0392b', flag: true };
  MP.STAMP_ART = STAMPS;   // new countries add their stamp here

  // A little crooked, always the same way for the same country
  const tiltOf = (id) => {
    let h = 0;
    for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
    return ((h % 21) - 10) / 60;
  };

  MP.drawStamp = function (c, id, x, y, size, alpha) {
    const st = stampOf(id);
    const d = MP.findDestination(id);
    const s = (size || 1);
    c.save();
    c.globalAlpha *= alpha == null ? 0.88 : alpha;
    c.translate(x, y);
    c.rotate(tiltOf(id));
    c.scale(s, s);
    c.strokeStyle = st.ink;
    c.fillStyle = st.ink;
    c.lineWidth = 1.4;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    // two rings
    c.beginPath(); c.arc(0, 0, 21, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 0.7;
    c.beginPath(); c.arc(0, 0, 18, 0, Math.PI * 2); c.stroke();
    // little stars on the sides
    for (const sx of [-15.5, 15.5]) { c.beginPath(); c.arc(sx, 0, 1, 0, Math.PI * 2); c.fill(); }
    c.lineWidth = 1.1;
    c.save();
    c.translate(0, -3);
    if (st.flag && d && d.flag) {
      c.globalAlpha *= 0.85;
      d.flag(c, -8, -6, 16, 11);
      c.strokeRect(-8, -6, 16, 11);
    } else if (st.pic) {
      st.pic(c);
    }
    c.restore();
    const name = d ? d.name.toUpperCase() : id.toUpperCase();
    MP.drawText(c, name, 0, 7, { size: name.length > 8 ? 0.42 : 0.52, color: st.ink, align: 'center' });
    c.restore();
  };

  // A small closed passport: dark blue with a gold globe. (x, y) = middle.
  MP.drawPassportIcon = function (c, x, y, s) {
    s = s || 1;
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.lineWidth = 0.6;
    c.strokeStyle = O();
    c.fillStyle = '#24386b';
    MP.roundRect(c, -5, -7, 10, 14, 1.2); c.fill(); c.stroke();
    c.strokeStyle = '#e9c45a';
    c.lineWidth = 0.6;
    c.beginPath(); c.arc(0, -1, 2.6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(-2.6, -1); c.lineTo(2.6, -1); c.moveTo(0, -3.6); c.lineTo(0, 1.6); c.stroke();
    c.fillStyle = '#e9c45a';
    c.fillRect(-3, 3.5, 6, 0.8);
    c.restore();
  };

  // Confetti falling over the whole screen. t = seconds since it started.
  MP.drawConfetti = function (c, t, count) {
    const cols = ['#ff5d8f', '#ffd23f', '#4cc9f0', '#7bd389', '#b388ff', '#ff9f43'];
    c.save();
    for (let i = 0; i < (count || 50); i++) {
      const speed = 40 + (i * 17) % 35;
      const y = -10 + ((t * speed + i * 29) % (MP.H + 20));
      const x = (i * 53) % MP.W + Math.sin(t * 2 + i) * 6;
      c.fillStyle = cols[i % cols.length];
      c.save();
      c.translate(x, y);
      c.rotate(t * 3 + i);
      c.fillRect(-1.6, -0.8, 3.2, 1.6);
      c.restore();
    }
    c.restore();
  };

  // ---------------------------------------------------------------------------
  // The stamp moment after landing: the passport page opens and TUMP!
  //   age = seconds since it started, all = every stamp collected now
  // ---------------------------------------------------------------------------
  MP.STAMP_HIT = 0.7;    // when the stamp hits the page
  MP.drawStampMoment = function (c, id, age, all) {
    const d = MP.findDestination(id);
    const a = MP.clamp(age * 3, 0, 1);
    c.save();
    c.globalAlpha = a;
    c.fillStyle = 'rgba(13,20,51,0.55)';
    c.fillRect(0, 0, MP.W, MP.H);
    // a shake when the stamp hits
    const since = age - MP.STAMP_HIT;
    const shake = since > 0 && since < 0.25 ? Math.sin(since * 80) * 2 * (1 - since / 0.25) : 0;
    c.translate(shake, 0);
    // the open passport page
    const P = { x: 96, y: 22 + (1 - a) * 30, w: 128, h: 120 };
    c.lineWidth = 1;
    c.strokeStyle = O();
    c.fillStyle = '#24386b';
    MP.roundRect(c, P.x - 4, P.y - 4, P.w + 8, P.h + 8, 6); c.fill(); c.stroke();
    c.fillStyle = '#f4f0dc';
    MP.roundRect(c, P.x, P.y, P.w, P.h, 3); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(120,140,170,0.25)';
    c.lineWidth = 0.5;
    for (let ly = P.y + 18; ly < P.y + P.h - 4; ly += 7) { c.beginPath(); c.moveTo(P.x + 6, ly); c.lineTo(P.x + P.w - 6, ly); c.stroke(); }
    MP.drawText(c, 'PASSI', P.x + P.w / 2, P.y + 4, { size: 0.8, color: '#24386b', align: 'center' });
    const cx = P.x + P.w / 2, cy = P.y + 64;
    if (age < MP.STAMP_HIT) {
      // the rubber stamp comes down from above
      const u = MP.clamp(age / MP.STAMP_HIT, 0, 1);
      const hy = cy - 70 * (1 - u * u);
      c.fillStyle = '#8a5a35';
      c.strokeStyle = O();
      c.lineWidth = 0.8;
      MP.roundRect(c, cx - 5, hy - 40, 10, 20, 3); c.fill(); c.stroke();
      c.beginPath(); c.arc(cx, hy - 42, 6, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#3a3a48';
      MP.roundRect(c, cx - 20, hy - 22, 40, 10, 2); c.fill(); c.stroke();
    } else {
      // the new stamp, a bit bigger at first
      const pop = 1 + Math.max(0, 0.35 - since * 1.2);
      MP.drawStamp(c, id, cx, cy, 1.25 * pop, 0.92);
      if (since < 0.9) {
        MP.drawText(c, 'TUMP!', cx + 44, cy - 46 - since * 10, { size: 1.6, color: '#ffd23f', outline: O(), align: 'center' });
      }
    }
    c.restore();
    if (age > MP.STAMP_HIT + 0.3) {
      MP.drawText(c, 'Uusi leima passiin: ' + (d ? d.name : id) + '!', MP.W / 2, 150, { size: 1.05, color: '#ffffff', outline: O(), align: 'center' });
    }
    if (all && age > MP.STAMP_HIT + 0.3) {
      MP.drawConfetti(c, since);
      MP.drawText(c, 'Olet todellinen maailmanmatkaaja!', MP.W / 2, 162, { size: 0.95, color: '#ffd23f', outline: O(), align: 'center' });
    }
  };
})();
