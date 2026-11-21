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

  // ---------------------------------------------------------------------------
  // In the evening: "Masked Singer Suomi" – singers in big masks take turns.
  // Each one: a title card ("Seuraavaksi: POPCORN!"), then singing with lights.
  // ---------------------------------------------------------------------------
  // Each singer: name, tune (MIDI notes), step (seconds per note), wave,
  // jokes (what Janne Kataja says after the song). More singers come from
  // maskedsinger.js; MP.MASKED_DRAW[id](c, lt, sing) draws each one.
  MP.MASKED = {
    LEN: 15,          // seconds per singer
    TITLE: 1.8,       // the title card at the start
    SING_END: 9.8,    // the song ends: "Bravo!" and then Janne's joke
    PER_EVENING: 3,   // how many different singers in one evening
    singers: [
      { id: 'popcorn', name: 'POPCORN', step: 0.28, wave: 'triangle',
        tune: [67, 69, 71, 72, 74, 72, 71, 69, 67, 64, 67, 72],
        jokes: ['Tuo on niin poksahtava esitys, että mulla meni popcornit väärään kurkkuun!', 'Popcorn! Minä otan ison kupin – ja sinut kaupan päälle!'] },
      { id: 'pharaoh', name: 'FAARAO', step: 0.36, wave: 'square',
        tune: [64, 65, 68, 69, 71, 69, 68, 65, 64, 68, 65, 64],
        jokes: ['Niin kultainen, että mun silmälasit meni huuruun!', 'Faarao! Onko sulla pyramidissa tilaa yhdelle kimaltavalle takille?'] },
    ],
  };
  MP.MASKED_DRAW = {};
  // tonight's singers (a new random set every evening)
  MP.maskedLineup = function () {
    const M = MP.MASKED;
    const st = MP.state || {};
    if (!st.maskedLineup || !st.maskedLineup.every((id) => M.singers.some((s) => s.id === id))) {
      const ids = M.singers.map((s) => s.id).sort(() => Math.random() - 0.5);
      st.maskedLineup = ids.slice(0, Math.min(M.PER_EVENING, ids.length));
    }
    return st.maskedLineup.map((id) => M.singers.find((s) => s.id === id));
  };
  MP.maskedNow = function (t) {
    const M = MP.MASKED;
    const list = MP.maskedLineup();
    const n = Math.floor(t / M.LEN);
    const singer = list[n % list.length];
    const jokes = singer.jokes || ['Upea esitys!'];
    return { singer, lt: t % M.LEN, joke: jokes[Math.floor(n / list.length) % jokes.length] };
  };

  // Popcorn: a striped popcorn box with a fluffy popcorn head and big eyes
  function popcorn(c, lt, sing) {
    // legs
    c.fillStyle = '#ffffff';
    c.fillRect(72, 70, 5, 12); c.strokeRect(72, 70, 5, 12);
    c.fillRect(83, 70, 5, 12); c.strokeRect(83, 70, 5, 12);
    c.fillStyle = '#e04848';
    ell(c, 74.5, 82, 4, 1.8, 0, '#e04848');
    ell(c, 85.5, 82, 4, 1.8, 0, '#e04848');
    // the box
    c.beginPath(); c.moveTo(60, 38); c.lineTo(100, 38); c.lineTo(94, 72); c.lineTo(66, 72); c.closePath();
    c.fillStyle = '#ffffff'; c.fill();
    c.save(); c.clip();
    c.fillStyle = '#e04848';
    for (let x = 58; x < 102; x += 10) c.fillRect(x, 36, 5, 40);
    c.restore();
    c.beginPath(); c.moveTo(60, 38); c.lineTo(100, 38); c.lineTo(94, 72); c.lineTo(66, 72); c.closePath(); c.stroke();
    // popcorn puffs on top
    const puffs = [[62, 36, 6], [70, 31, 7], [80, 28, 8], [90, 31, 7], [98, 36, 6], [66, 26, 5], [76, 21, 6], [86, 22, 6], [94, 27, 5], [81, 15, 5]];
    for (const [px, py, r] of puffs) ell(c, px, py + Math.sin(lt * 6 + px) * 0.6, r, r * 0.85, 0, '#fff3c4');
    // the face on the box: big eyes and a singing mouth
    ell(c, 73, 48, 4.5, 5.5, 0, '#ffffff');
    ell(c, 87, 48, 4.5, 5.5, 0, '#ffffff');
    c.fillStyle = O;
    c.beginPath(); c.arc(74, 49, 2.2, 0, Math.PI * 2); c.arc(86, 49, 2.2, 0, Math.PI * 2); c.fill();
    const open = sing ? 2 + Math.abs(Math.sin(lt * 9)) * 4 : 1;
    ell(c, 80, 60, 5, open, 0, '#7a1418');
    // arms with the microphone
    c.lineWidth = 3; c.strokeStyle = '#ffffff';
    c.beginPath(); c.moveTo(97, 46); c.lineTo(104, 54 - Math.sin(lt * 3) * 3); c.stroke();
    c.beginPath(); c.moveTo(63, 46); c.lineTo(56, 40 + Math.sin(lt * 4) * 6); c.stroke();
    c.lineWidth = 1; c.strokeStyle = O;
    c.fillStyle = '#2b2b33'; c.fillRect(102, 52 - Math.sin(lt * 3) * 3, 3, 7);
    ell(c, 103.5, 51 - Math.sin(lt * 3) * 3, 2.6, 2.6, 0, '#8a93a6');
  }

  // Faarao: a golden mask, a blue-and-gold striped headdress and a golden robe
  function pharaoh(c, lt, sing) {
    // robe
    c.beginPath(); c.moveTo(68, 44); c.lineTo(92, 44); c.lineTo(98, 82); c.lineTo(62, 82); c.closePath();
    c.fillStyle = '#f4efe1'; c.fill(); c.stroke();
    c.fillStyle = '#e0b43a';
    c.beginPath(); c.moveTo(66, 44); c.lineTo(94, 44); c.lineTo(90, 52); c.lineTo(70, 52); c.closePath(); c.fill(); c.stroke();  // gold collar
    for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#2f5fb5' : '#e0b43a'; c.fillRect(71 + i * 0.5, 46 + i * 1.5, 18 - i, 1.2); }
    // headdress (stripes)
    c.beginPath(); c.moveTo(68, 18); c.lineTo(92, 18); c.lineTo(98, 46); c.lineTo(62, 46); c.closePath();
    c.fillStyle = '#e0b43a'; c.fill();
    c.save(); c.clip();
    c.fillStyle = '#2f5fb5';
    for (let y = 18; y < 48; y += 5) c.fillRect(60, y, 40, 2.5);
    c.restore();
    c.beginPath(); c.moveTo(68, 18); c.lineTo(92, 18); c.lineTo(98, 46); c.lineTo(62, 46); c.closePath(); c.stroke();
    // golden face mask
    ell(c, 80, 31, 9, 11, 0, '#f2c230');
    c.fillStyle = O;
    for (const ex of [76, 84]) {
      c.beginPath(); c.ellipse(ex, 29, 2.2, 1.3, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(ex + (ex < 80 ? -2 : 2), 29); c.lineTo(ex + (ex < 80 ? -4.5 : 4.5), 30.5); c.stroke();  // eyeliner
    }
    const open = sing ? 1.2 + Math.abs(Math.sin(lt * 8)) * 2.5 : 0.6;
    ell(c, 80, 37, 3, open, 0, '#7a1418');
    c.fillStyle = '#2f5fb5'; c.fillRect(78.5, 42, 3, 6); c.strokeRect(78.5, 42, 3, 6);   // beard
    // the cobra on the forehead
    ell(c, 80, 19, 1.6, 2.4, 0, '#e0b43a');
    // arms: one holds the mic, one waves like walking in Egypt
    c.lineWidth = 3; c.strokeStyle = '#c8913a';
    c.beginPath(); c.moveTo(92, 52); c.lineTo(99, 44 + Math.sin(lt * 2) * 2); c.stroke();
    c.beginPath(); c.moveTo(68, 52); c.lineTo(58, 52 + Math.sin(lt * 5) * 5); c.lineTo(54, 46 + Math.sin(lt * 5) * 5); c.stroke();
    c.lineWidth = 1; c.strokeStyle = O;
    c.fillStyle = '#2b2b33'; c.fillRect(97.5, 38 + Math.sin(lt * 2) * 2, 3, 7);
    ell(c, 99, 37 + Math.sin(lt * 2) * 2, 2.6, 2.6, 0, '#8a93a6');
  }

  MP.MASKED_DRAW.popcorn = popcorn;
  MP.MASKED_DRAW.pharaoh = pharaoh;

  function maskedSinger(c, t) {
    const M = MP.MASKED;
    const { singer, lt, joke } = MP.maskedNow(t);
    // the studio: dark blue, glittering lights
    const g = c.createLinearGradient(0, 0, 0, 100);
    g.addColorStop(0, '#120b3a'); g.addColorStop(1, '#3a1f6a');
    c.fillStyle = g; c.fillRect(0, 0, 160, 100);
    for (let i = 0; i < 18; i++) {
      c.fillStyle = ['#ff5fd0', '#ffe680', '#5fd4ff'][i % 3];
      c.globalAlpha = 0.4 + 0.4 * Math.sin(t * 4 + i);
      c.beginPath(); c.arc((i * 37) % 160, 8 + (i * 13) % 30, 1.2, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
    if (lt < M.TITLE) {
      // title card
      const k = MP.clamp(lt * 3, 0, 1);
      MP.drawText(c, 'MASKED SINGER', 80, 22, { size: 1.4 * k + 0.01, color: '#ffe680', outline: O, align: 'center' });
      MP.drawText(c, 'SUOMI', 80, 38, { size: 1.1, color: '#ffffff', outline: O, align: 'center' });
      MP.drawText(c, 'Seuraavaksi: ' + singer.name + '!', 80, 60, { size: 0.9, color: '#ff9fe0', outline: O, align: 'center' });
      return;
    }
    // spotlight
    c.save();
    c.globalAlpha = 0.22;
    c.fillStyle = '#fff3c4';
    c.beginPath(); c.moveTo(70, 0); c.lineTo(90, 0); c.lineTo(115, 86); c.lineTo(45, 86); c.closePath(); c.fill();
    c.restore();
    c.fillStyle = '#5a3a8a'; c.fillRect(0, 82, 160, 18);
    c.fillStyle = 'rgba(255,255,255,0.25)';
    c.beginPath(); c.ellipse(80, 84, 30, 4, 0, 0, Math.PI * 2); c.fill();
    // the singer sways to the music
    const sing = lt < M.SING_END;
    const janne = lt > M.SING_END + 0.4;
    c.save();
    if (janne) { c.translate(-30, 0); }
    c.translate(80, 82);
    c.rotate(Math.sin(lt * 3) * 0.06);
    c.translate(-80, -82 - Math.abs(Math.sin(lt * 6)) * 1.5);
    (MP.MASKED_DRAW[singer.id] || popcorn)(c, lt, sing);
    c.restore();
    // after the song Janne Kataja (in the panel) says something funny
    if (janne) {
      const jt = lt - M.SING_END - 0.4;
      const pop = MP.clamp(jt * 4, 0, 1);
      c.save();
      c.translate(132, 98 + (1 - pop) * 30);
      c.scale(0.95, 0.95);
      if (MP.drawJanneSmall) MP.drawJanneSmall(c, 0, 0, t, jt < 1.2);
      c.restore();
      if (pop >= 1) MP.drawBubble(c, joke, 92, 40, { maxWidth: 116, size: 0.55 });
      MP.drawText(c, 'JANNE', 132, 2, { size: 0.5, color: '#ffe680', outline: O, align: 'center' });
    }
    // notes flying out
    if (sing && lt > M.TITLE) {
      for (let i = 0; i < 3; i++) {
        const p = (lt * 0.7 + i / 3) % 1;
        c.save();
        c.globalAlpha = 1 - p;
        MP.drawText(c, '♪', 104 + p * 30, 40 - p * 30 + i * 4, { size: 0.9, color: ['#ff5fd0', '#ffe680', '#5fd4ff'][i], outline: O });
        c.restore();
      }
    } else if (!janne) {
      MP.drawText(c, 'Bravo!', 80, 8, { size: 1.2, color: '#ffe680', outline: O, align: 'center' });
    }
    // the name tag
    c.fillStyle = 'rgba(255,255,255,0.9)';
    MP.roundRect(c, 4, 86, 58, 11, 3); c.fill(); c.stroke();
    MP.drawText(c, singer.name, 33, 87.5, { size: singer.name.length > 10 ? 0.45 : 0.65, color: '#b0208a', align: 'center' });
  }

  // Draws the show into the rectangle (x, y, w, h). t = seconds the TV has been on.
  MP.drawTvShow = function (c, x, y, w, h, t) {
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.translate(x, y);
    c.scale(w / 160, h / 100);
    c.lineWidth = 1; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = O;
    if (MP.state && MP.state.evening) {
      // the evening show
      maskedSinger(c, t);
      MP.drawText(c, 'MASKED SINGER SUOMI', 156, 90, { size: 0.5, color: 'rgba(255,255,255,0.9)', outline: O, align: 'right' });
    } else {
      const gag = MP.tvGag(t), lt = MP.tvGagTime(t);
      if (gag === 0) dog(c, lt);
      else if (gag === 1) duck(c, lt);
      else cat(c, lt);
      MP.drawText(c, 'HAHA-TV', 156, 90, { size: 0.6, color: 'rgba(255,255,255,0.9)', outline: O, align: 'right' });
    }
    c.restore();
  };
})();
