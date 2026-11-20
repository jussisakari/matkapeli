// tvshow.js – the funny cartoon on the TV ("HAHA-TV").
// Three short gags take turns, 6 seconds each:
//   0 = a dog chasing its tail, 1 = a jumping duck, 2 = a cat and a banana peel
window.MP = window.MP || {};

(function () {
  const MP = window.MP;

  MP.TV_GAG_LEN = 6;   // seconds per gag
  MP.TV_GAGS = 3;

  MP.tvGag = (t) => Math.floor(t / MP.TV_GAG_LEN) % MP.TV_GAGS;
  MP.tvGagTime = (t) => t % MP.TV_GAG_LEN;

  const O = '#2b2340';

  function ell(c, x, y, rx, ry, rot, fill) {
    c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
    c.fillStyle = fill; c.fill(); c.stroke();
  }

  function stars(c, x, y, t) {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + i * 2.1;
      MP.draw('sparkle', c, x + Math.cos(a) * 9, y + Math.sin(a) * 3, { r: 3, color: '#ffe680' });
    }
  }

  // --- Gag 0: dog chasing its tail ---
  function dog(c, lt) {
    const g = c.createLinearGradient(0, 0, 0, 100);
    g.addColorStop(0, '#8fd3ff'); g.addColorStop(1, '#e0f6ff');
    c.fillStyle = g; c.fillRect(0, 0, 160, 100);
    c.fillStyle = '#7cc56b'; c.fillRect(0, 74, 160, 26);
    c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(140, 16, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.15)';
    c.beginPath(); c.ellipse(80, 76, 22, 4, 0, 0, Math.PI * 2); c.fill();

    const spin = lt < 4.5 ? lt * 7 : 4.5 * 7;   // stops when dizzy
    c.save();
    c.translate(80, 60);
    c.rotate(spin);
    // tail
    c.beginPath(); c.moveTo(-12, -2); c.lineTo(-20, -8 + Math.sin(lt * 30) * 2);
    c.lineWidth = 3; c.strokeStyle = '#a0643c'; c.stroke();
    c.lineWidth = 1; c.strokeStyle = O;
    ell(c, 0, 0, 13, 7.5, 0, '#c98a55');                 // body
    ell(c, -7, 6, 2.2, 3, 0, '#c98a55');                  // legs
    ell(c, 7, 6, 2.2, 3, 0, '#c98a55');
    ell(c, 13, -6, 6.5, 6, 0, '#c98a55');                 // head
    ell(c, 10, -10, 2.5, 4.5, 0.4, '#6e4226');            // ear
    c.fillStyle = O;
    c.beginPath(); c.arc(15, -7, 1, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(19.5, -5, 1.3, 0, Math.PI * 2); c.fill();
    c.restore();

    if (lt > 4.5) {
      stars(c, 92, 44, lt);
      MP.drawText(c, 'Huimaa…', 80, 8, { size: 1.2, color: '#6a3fb5', outline: '#ffffff', align: 'center' });
    } else {
      MP.drawText(c, 'Pyöri, pyöri!', 80, 8, { size: 1.2, color: '#ff5fa2', outline: '#ffffff', align: 'center' });
    }
  }

  // --- Gag 1: jumping duck ---
  function duck(c, lt) {
    c.fillStyle = '#bfe9ff'; c.fillRect(0, 0, 160, 100);
    c.fillStyle = '#4aa3df'; c.fillRect(0, 66, 160, 34);
    c.strokeStyle = '#ffffff'; c.lineWidth = 1;
    c.beginPath();
    for (let x = -10; x < 170; x += 16) {
      const wx = x + (lt * 10) % 16;
      c.moveTo(wx, 74); c.quadraticCurveTo(wx + 4, 71, wx + 8, 74);
    }
    c.stroke();
    c.strokeStyle = O;

    const hop = Math.abs(Math.sin(lt * 4));
    const x = 80 + Math.sin(lt * 1.2) * 34;
    const y = 62 - hop * 20;
    const dir = Math.cos(lt * 1.2) >= 0 ? 1 : -1;
    c.save();
    c.translate(x, y);
    c.scale(dir, 1);
    ell(c, 0, 0, 11, 7.5, 0, '#ffd23f');                  // body
    ell(c, -2, -1, 5, 3, -0.3, '#ffe680');                // wing
    ell(c, 8, -9, 5.5, 5.5, 0, '#ffd23f');                // head
    c.beginPath(); c.moveTo(13, -9); c.lineTo(18, -8); c.lineTo(13, -6.5); c.closePath();
    c.fillStyle = '#ff8c00'; c.fill(); c.stroke();        // beak
    c.fillStyle = O; c.beginPath(); c.arc(9.5, -10.5, 1, 0, Math.PI * 2); c.fill();
    c.restore();

    if (hop > 0.85) {
      MP.drawText(c, 'KVAAK!', x, y - 30, { size: 1.4, color: '#ff8c00', outline: '#ffffff', align: 'center' });
    }
  }

  // --- Gag 2: cat slips on a banana peel ---
  function cat(c, lt) {
    c.fillStyle = '#ffe3f1'; c.fillRect(0, 0, 160, 100);
    c.fillStyle = '#c98a55'; c.fillRect(0, 76, 160, 24);
    MP.draw('banana', c, 98, 73, { scale: 1.1, peeled: true, eaten: 1 });

    let x, y, rot = 0;
    if (lt < 2.5) {                       // walking towards the peel
      x = 18 + lt * 32; y = 70 - Math.abs(Math.sin(lt * 8)) * 1.5;
    } else if (lt < 3.5) {                // whoops!
      const u = lt - 2.5;
      x = 98 + u * 18; y = 70 - Math.sin(u * Math.PI) * 26; rot = -u * Math.PI * 1.25;
    } else {                              // lying on its back
      x = 116; y = 70; rot = -Math.PI * 1.25;
    }
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.beginPath(); c.moveTo(-10, -2); c.quadraticCurveTo(-18, -6, -16, -14);
    c.lineWidth = 2.5; c.strokeStyle = '#7d8399'; c.stroke();
    c.lineWidth = 1; c.strokeStyle = O;
    ell(c, 0, 0, 11, 6.5, 0, '#9aa0b5');                  // body
    ell(c, -6, 5, 2, 3, 0, '#9aa0b5');
    ell(c, 6, 5, 2, 3, 0, '#9aa0b5');
    ell(c, 11, -6, 6, 5.5, 0, '#9aa0b5');                 // head
    for (const ex of [7.5, 14]) {                          // ears
      c.beginPath(); c.moveTo(ex - 2.5, -9.5); c.lineTo(ex, -15); c.lineTo(ex + 2.5, -9.5); c.closePath();
      c.fillStyle = '#9aa0b5'; c.fill(); c.stroke();
    }
    c.fillStyle = O;
    c.beginPath(); c.arc(10, -7, 0.9, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(14, -7, 0.9, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ff8fa3'; c.beginPath(); c.arc(12, -4.8, 0.8, 0, Math.PI * 2); c.fill();
    c.restore();

    if (lt >= 3.5) {
      stars(c, 122, 58, lt);
      MP.drawText(c, 'Oho!', 80, 8, { size: 1.4, color: '#e0559a', outline: '#ffffff', align: 'center' });
    } else if (lt >= 2.5) {
      MP.drawText(c, 'Hups!', 80, 8, { size: 1.4, color: '#e0559a', outline: '#ffffff', align: 'center' });
    }
  }

  // Draws the show into the rectangle (x, y, w, h). t = seconds the TV has been on.
  MP.drawTvShow = function (c, x, y, w, h, t) {
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.translate(x, y);
    c.scale(w / 160, h / 100);
    c.lineWidth = 1; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = O;
    const gag = MP.tvGag(t), lt = MP.tvGagTime(t);
    if (gag === 0) dog(c, lt);
    else if (gag === 1) duck(c, lt);
    else cat(c, lt);
    MP.drawText(c, 'HAHA-TV', 156, 90, { size: 0.6, color: 'rgba(255,255,255,0.9)', outline: O, align: 'right' });
    c.restore();
  };
})();
