// tvchannels.js – the TV CHANNELS. The remote control has six buttons:
//   1 HAHA-TV          funny short clips (tvshow.js)
//   2 TURPAPOJAT       Sasu and Daniel's own show: songs and silly tricks
//   3 PIKKU KAKKONEN   a children's program: a host, a sock puppet, a cartoon
//                      and the viewers' pictures (your own photos from the album!)
//   4 EUROVIISUT       singers from the game's countries, then "twelve points!"
//   5 LASTEN UUTISET   kids' news made from what you have done in the game
//   6 MASKED SINGER    in the evening (tvshow.js + maskedsinger.js)
// Every channel: draw(c, t) in a 160 × 100 picture, and sounds(prev, now).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = '#2b2340';
  const note = (m, d, w, v) => MP.sfx.note(440 * Math.pow(2, (m - 69) / 12), d, w || 'triangle', v || 0.1);
  const crossed = (a, b, at) => a < at && b >= at;
  const name = () => (MP.PASSPORT_NAME && MP.PASSPORT_NAME[MP.state.character]) || 'Ella';

  // ---------------------------------------------------------------------------
  // 2: TURPAPOJAT – the boys' own TV show
  // ---------------------------------------------------------------------------
  const TURPA_PARTS = [
    { kind: 'song', words: ['Mä löin sua turpaan,', 'sä lensit ojaan!'], tune: [64, 64, 67, 69, 67, 64, 62, 64, 62, 60] },
    { kind: 'trick', say: 'Temppu! Daniel jongleeraa ja Sasu pyörii kitaran kanssa!' },
    { kind: 'song', words: ["Hello, it's me,", 'I am looser'], tune: [57, 60, 64, 62, 60, 57, 55, 57] },
    { kind: 'talk', say: 'Moi kaikki katsojat! Muistakaa harjata hampaat ja syödä aamupala!' },
  ];
  const TURPA_LEN = 8;
  const turpaPart = (t) => ({ part: TURPA_PARTS[Math.floor(t / TURPA_LEN) % TURPA_PARTS.length], lt: t % TURPA_LEN });

  function turpa(c, t) {
    const { part, lt } = turpaPart(t);
    const g = c.createLinearGradient(0, 0, 0, 100);
    g.addColorStop(0, '#1a1040'); g.addColorStop(1, '#5a2a80');
    c.fillStyle = g; c.fillRect(0, 0, 160, 100);
    // swinging stage lights
    for (let i = 0; i < 3; i++) {
      const a = Math.sin(t * 1.5 + i * 2) * 0.4;
      c.save(); c.globalAlpha = 0.18; c.fillStyle = ['#ff5fd0', '#ffe680', '#5fd4ff'][i];
      c.translate(30 + i * 50, 0); c.rotate(a);
      c.beginPath(); c.moveTo(-6, 0); c.lineTo(6, 0); c.lineTo(22, 86); c.lineTo(-22, 86); c.closePath(); c.fill();
      c.restore();
    }
    c.fillStyle = '#8a5a2e'; c.fillRect(0, 84, 160, 16);
    MP.drawText(c, 'TURPAPOJAT-SHOW', 80, 3, { size: 0.9, color: '#ffe680', outline: O, align: 'center' });
    const band = MP.TURPA_BAND || [];
    band.forEach((m, i) => {
      const x = i ? 104 : 56;
      const hop = Math.abs(Math.sin(t * 5 + i)) * 2;
      c.save();
      if (part.kind === 'trick' && m.guitar) { c.translate(x, 60); c.rotate(lt * 6); c.translate(-x, -60); }
      MP.drawPerson(c, x, 84 - hop, {
        character: 'boy', hair: m.hair, outfit: m.outfit, scale: 1,
        mouth: part.kind !== 'trick' && Math.floor(t * 6) % 2 ? 'yawn' : 'smile',
        armUp: part.kind === 'talk' ? 0.7 : part.kind === 'trick' && m.mic ? 1 : 0,
      });
      c.restore();
      MP.drawText(c, m.name, x, 86, { size: 0.5, color: '#ffe680', outline: O, align: 'center' });
    });
    if (part.kind === 'trick') {
      for (let k = 0; k < 3; k++) {
        const a = lt * 5 + k * 2.1;
        c.fillStyle = ['#ff5d8f', '#ffd23f', '#4cc9f0'][k];
        c.beginPath(); c.arc(104 + Math.cos(a) * 10, 34 - Math.abs(Math.sin(a)) * 16, 2.5, 0, Math.PI * 2); c.fill();
      }
    }
    if (part.kind === 'song') {
      // karaoke words: the sung part turns yellow
      const line = part.words[lt < TURPA_LEN / 2 ? 0 : 1];
      MP.drawText(c, '♪ ' + line + ' ♪', 80, 16, { size: 0.8, color: lt % 4 < 2 ? '#ffffff' : '#ffe680', outline: O, align: 'center' });
    } else {
      MP.drawBubble(c, part.say, 80, 40, { maxWidth: 130, size: 0.55 });
    }
  }
  function turpaSounds(prev, now) {
    const a = turpaPart(prev), b = turpaPart(now);
    if (b.part.kind !== 'song') {
      if (Math.floor(prev * 2) !== Math.floor(now * 2)) MP.sfx.kick();
      return;
    }
    const step = TURPA_LEN / b.part.tune.length;
    if (Math.floor(a.lt / step) !== Math.floor(b.lt / step) || b.lt < a.lt) note(b.part.tune[Math.floor(b.lt / step)], step * 0.9, 'square', 0.07);
    if (Math.floor(prev * 2.5) !== Math.floor(now * 2.5)) MP.sfx.kick();
  }

  // ---------------------------------------------------------------------------
  // 3: PIKKU KAKKONEN – a children's program
  // ---------------------------------------------------------------------------
  const PK_LEN = 7;
  const PK_PARTS = ['host', 'cartoon', 'drawings', 'bye'];
  function pikku(c, t) {
    const part = PK_PARTS[Math.floor(t / PK_LEN) % PK_PARTS.length];
    const lt = t % PK_LEN;
    c.fillStyle = '#bfe8ff'; c.fillRect(0, 0, 160, 100);
    c.fillStyle = '#7bd389'; c.fillRect(0, 76, 160, 24);
    // the logo
    c.fillStyle = '#ff8fc0'; MP.roundRect(c, 4, 4, 58, 12, 6); c.fill(); c.stroke();
    MP.drawText(c, 'PIKKU KAKKONEN', 33, 6, { size: 0.45, color: '#ffffff', align: 'center' });
    if (part === 'host' || part === 'bye') {
      // the host and Sukka-Sami, a sock puppet
      MP.drawPerson(c, 56, 92, { character: 'girl', hair: '#c0502a', scale: 1.4, noBow: true,
        outfit: { shirt: 'yellow', bottom: 'skirtPink', hat: 'none', costume: 'none', shoes: true }, mouth: Math.floor(t * 4) % 2 ? 'yawn' : 'smile', armUp: part === 'bye' ? 0.9 : 0.4 });
      const py = 50 + Math.sin(t * 4) * 3;
      c.fillStyle = '#4cc9f0';
      c.beginPath(); c.moveTo(96, 92); c.lineTo(100, py); c.quadraticCurveTo(112, py - 16, 124, py); c.lineTo(122, 92); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(108, py - 6, 3, 0, Math.PI * 2); c.arc(116, py - 6, 3, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = O; c.beginPath(); c.arc(108, py - 5.5, 1.3, 0, Math.PI * 2); c.arc(116, py - 5.5, 1.3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e04848'; c.beginPath(); c.ellipse(118, py + 2, 5, 1.5 + Math.abs(Math.sin(t * 8)) * 2, 0, 0, Math.PI * 2); c.fill();
      const say = part === 'host'
        ? (lt < 3.5 ? 'Huomenta, lapset! Tässä on Sukka-Sami!' : 'Sami: Moi! Minä olen sukka, mutta osaan laulaa!')
        : 'Hei hei! Nähdään taas huomenna!';
      MP.drawBubble(c, say, 80, 30, { maxWidth: 130, size: 0.55 });
    } else if (part === 'cartoon') {
      // a snail race
      MP.drawText(c, 'Piirretty: Etanakisa!', 80, 20, { size: 0.7, color: O, align: 'center' });
      c.fillStyle = '#ffffff'; c.fillRect(140, 50, 3, 34);
      for (let i = 0; i < 2; i++) {
        const x = 14 + lt * (i ? 15 : 17), y = 66 + i * 12;
        c.fillStyle = i ? '#ffd23f' : '#ff8fc0';
        c.beginPath(); c.ellipse(x, y, 8, 3, 0, 0, Math.PI * 2); c.fill(); c.stroke();
        c.fillStyle = i ? '#a0643c' : '#8a5aa8';
        c.beginPath(); c.arc(x - 2, y - 5, 6, 0, Math.PI * 2); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(x + 6, y - 2); c.lineTo(x + 9, y - 9); c.stroke();
      }
      if (lt > 6.4) MP.drawText(c, 'Pinkki etana voitti!', 80, 36, { size: 0.7, color: '#e0559a', outline: '#ffffff', align: 'center' });
    } else {
      // the viewers' pictures: your own photos from the album
      MP.drawText(c, 'Katsojien kuvat', 80, 20, { size: 0.75, color: O, align: 'center' });
      const photos = MP.photos || [];
      if (photos.length && MP.drawPhoto) {
        const ph = photos[Math.floor(t / PK_LEN / PK_PARTS.length) % photos.length];
        MP.drawPhoto(c, ph, { x: 40, y: 32, w: 80, h: 45 });
        MP.drawText(c, 'Kuvan lähetti ' + name() + '!', 80, 82, { size: 0.6, color: O, align: 'center' });
      } else {
        // a child's drawing: a house and a sun
        c.fillStyle = '#ffffff'; c.fillRect(46, 32, 68, 46); c.strokeRect(46, 32, 68, 46);
        c.fillStyle = '#e04848'; c.fillRect(64, 56, 22, 18);
        c.beginPath(); c.moveTo(60, 56); c.lineTo(75, 44); c.lineTo(90, 56); c.closePath(); c.fill();
        c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(104, 42, 6, 0, Math.PI * 2); c.fill();
        MP.drawText(c, 'Ota kuvia matkoilla, niin ne näkyvät täällä!', 80, 82, { size: 0.45, color: O, align: 'center' });
      }
    }
  }
  function pikkuSounds(prev, now) {
    if (Math.floor(prev / PK_LEN) !== Math.floor(now / PK_LEN)) MP.sfx.bling();
    const part = PK_PARTS[Math.floor(now / PK_LEN) % PK_PARTS.length];
    if (part === 'bye' && Math.floor(prev * 3) !== Math.floor(now * 3)) note([72, 76, 79, 76, 72, 74, 77, 74][Math.floor(now * 3) % 8], 0.3, 'sine', 0.08);
  }

  // ---------------------------------------------------------------------------
  // 4: EUROVIISUT – singers from the game's countries, then the points
  // ---------------------------------------------------------------------------
  const EV_SING = 4;
  const evList = () => {
    const d = (MP.DESTINATIONS || []).filter((x) => x.id !== 'home').slice(0, 4);
    const fi = (MP.DESTINATIONS || []).find((x) => x.id === 'home');
    return fi ? d.concat([fi]) : d;
  };
  const OUTFITS = [
    { character: 'girl', hair: '#e3b04b', outfit: { shirt: 'party', bottom: 'skirtPink', hat: 'crown', costume: 'none' } },
    { character: 'boy', hair: '#2b1d14', outfit: { shirt: 'kpop', bottom: 'jeans', hat: 'none', costume: 'none' } },
    { character: 'girl', hair: '#2b1d14', outfit: { shirt: 'tshirt', bottom: 'skirtPurple', hat: 'none', costume: 'none' } },
    { character: 'boy', hair: '#c0502a', outfit: { shirt: 'yellow', bottom: 'brown', hat: 'partyHat', costume: 'none' } },
    { character: 'girl', hair: '#8b4a2b', outfit: { shirt: 'sailor', bottom: 'skirtPink', hat: 'none', costume: 'none' } },
  ];
  function euro(c, t) {
    const list = evList();
    const total = list.length * EV_SING + 6;
    const lt = t % total;
    const i = Math.floor(lt / EV_SING);
    const g = c.createLinearGradient(0, 0, 0, 100);
    g.addColorStop(0, '#0a1a4a'); g.addColorStop(1, '#3a1a6a');
    c.fillStyle = g; c.fillRect(0, 0, 160, 100);
    for (let k = 0; k < 20; k++) {
      c.fillStyle = ['#ff5fd0', '#ffe680', '#5fd4ff'][k % 3];
      c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 5 + k);
      c.fillRect((k * 29) % 160, (k * 17) % 60, 1.4, 1.4);
    }
    c.globalAlpha = 1;
    MP.drawText(c, 'EUROVIISUT', 80, 3, { size: 0.9, color: '#ffe680', outline: O, align: 'center' });
    if (i < list.length) {
      const d = list[i];
      // the country's flag big behind the singer
      c.save(); c.globalAlpha = 0.55; d.flag(c, 30, 18, 100, 64); c.restore();
      const o = OUTFITS[i % OUTFITS.length];
      MP.drawPerson(c, 80, 86 - Math.abs(Math.sin(t * 5)) * 2, Object.assign({ scale: 1.25, mouth: Math.floor(t * 6) % 2 ? 'yawn' : 'smile', armUp: 0.6 + Math.sin(t * 3) * 0.3 }, o));
      for (let k = 0; k < 6; k++) {
        const a = t * 3 + k;
        MP.drawText(c, '✦', 80 + Math.cos(a) * 28, 50 + Math.sin(a) * 18, { size: 0.5, color: '#ffe680', align: 'center' });
      }
      c.fillStyle = 'rgba(255,255,255,0.9)'; MP.roundRect(c, 4, 86, 60, 11, 3); c.fill(); c.stroke();
      MP.drawText(c, d.name, 34, 87.5, { size: 0.6, color: '#2f4a8a', align: 'center' });
    } else {
      // the scoreboard: Finland gets twelve points!
      const u = lt - list.length * EV_SING;
      list.forEach((d, k) => {
        const pts = d.id === 'home' ? Math.min(12, Math.floor(u * 6)) + 30 : 10 + ((k * 7) % 14);
        const y = 20 + k * 12;
        d.flag(c, 20, y, 12, 8); c.strokeRect(20, y, 12, 8);
        MP.drawText(c, d.name, 36, y, { size: 0.5, color: '#ffffff', align: 'left' });
        c.fillStyle = d.id === 'home' ? '#ffd23f' : '#5fd4ff';
        c.fillRect(80, y + 1, pts * 1.5, 6);
        MP.drawText(c, String(pts), 82 + pts * 1.5, y, { size: 0.5, color: '#ffffff', align: 'left' });
      });
      if (u > 1.5) {
        MP.drawText(c, 'Suomi, twelve points!', 80, 82, { size: 0.9, color: '#ffe680', outline: O, align: 'center' });
        for (let k = 0; k < 12; k++) {
          const a = k / 12 * Math.PI * 2, r = (u - 1.5) * 20;
          c.fillStyle = ['#ff5d8f', '#ffd23f', '#4cc9f0'][k % 3];
          c.beginPath(); c.arc(130 + Math.cos(a) * r, 30 + Math.sin(a) * r, 1.4, 0, Math.PI * 2); c.fill();
        }
      }
    }
  }
  function euroSounds(prev, now) {
    const list = evList();
    const total = list.length * EV_SING + 6;
    const a = prev % total, b = now % total;
    if (b < list.length * EV_SING) {
      const tune = [[72, 76, 79, 76], [67, 71, 74, 71], [69, 72, 76, 72], [64, 67, 71, 67], [65, 69, 72, 69]][Math.floor(b / EV_SING) % 5];
      if (Math.floor(a * 3) !== Math.floor(b * 3)) note(tune[Math.floor(b * 3) % 4], 0.3, 'square', 0.06);
    } else if (crossed(a, b, list.length * EV_SING + 1.5)) {
      MP.sfx.applause(2);
      [72, 76, 79, 84].forEach((m, k) => setTimeout(() => note(m, 0.25, 'triangle', 0.12), k * 150));
    }
  }

  // ---------------------------------------------------------------------------
  // 5: LASTEN UUTISET – kids' news from what you have done
  // ---------------------------------------------------------------------------
  const NEWS_LEN = 5;
  function headlines() {
    const st = MP.state;
    const tr = st.treasures || {};
    const out = [];
    // the newest postcard first (postcard.js)
    const cards = tr.postcards || [];
    const last = cards[cards.length - 1];
    const from = last && MP.findDestination && MP.findDestination(last.country);
    if (from) out.push({ text: 'Postikortti (' + from.name + '): "' + last.greeting + '"', card: last });
    const posters = tr.posters ? Object.keys(tr.posters) : [];
    for (const id of posters) {
      const d = MP.findDestination && MP.findDestination(id);
      if (d) out.push({ text: name() + ' matkusti ' + d.to + '!', flag: d });
    }
    const pet = MP.myPet && MP.myPet();
    if (pet) out.push({ text: 'Lemmikki ' + pet.name + ' on maan iloisin ' + (pet.kind === 'cat' ? 'kissa' : 'koira') + '!', pet });
    if (MP.stampCount && MP.stampCount() > 0) out.push({ text: 'Passissa on jo ' + MP.stampCount() + ' leimaa!', icon: '📘' });
    const beds = (st.garden || []).filter((b) => b && b.seed);
    if (beds.length && MP.SEEDS) out.push({ text: 'Kotipihan kasvimaalla kasvaa ' + MP.SEEDS[beds[0].seed].name.toLowerCase() + '!', icon: '🌱' });
    if (tr.schoolStars) out.push({ text: 'Koulussa ansaittiin jo ' + tr.schoolStars + ' kultaista tähteä!', icon: '⭐' });
    if (tr.tutMask) out.push({ text: 'Kultainen naamio löytyi pyramidista!', icon: '🏺' });
    if (st.baked) out.push({ text: 'Kotona leivottiin ' + (st.baked.kind === 'cake' ? 'kakku' : 'pullaa') + '. Mmm!', icon: '🍰' });
    out.push({ text: 'Kenguru hyppäsi ennätyksen: kolme metriä!', icon: '🦘' });
    out.push({ text: 'Pingviinit opettelivat liukumaan mahallaan.', icon: '🐧' });
    out.push({ weather: true, text: MP.isRainDay && MP.isRainDay() ? 'Sää: sadetta! Muista sadetakki ja kumpparit.' : 'Sää: aurinkoista ja lämmintä. Hymyile!' });
    return out;
  }
  function news(c, t) {
    const list = headlines();
    const n = Math.floor(t / NEWS_LEN) % list.length;
    const h = list[n];
    c.fillStyle = '#dfe8f2'; c.fillRect(0, 0, 160, 100);
    c.fillStyle = '#2f4a8a'; c.fillRect(0, 0, 160, 14);
    MP.drawText(c, 'LASTEN UUTISET', 6, 3, { size: 0.7, color: '#ffffff' });
    MP.drawText(c, (n + 1) + ' / ' + list.length, 154, 3, { size: 0.55, color: '#ffffff', align: 'right' });
    if (h.weather) {
      // the weather map of Finland with a smiling sun
      c.fillStyle = '#7bd389';
      c.beginPath(); c.moveTo(70, 20); c.lineTo(92, 18); c.lineTo(96, 40); c.lineTo(102, 64); c.lineTo(90, 82); c.lineTo(66, 84); c.lineTo(60, 60); c.lineTo(74, 40); c.closePath(); c.fill(); c.stroke();
      MP.draw('sun', c, 0, 0, { x: 84, y: 52, r: 10 });
      c.fillStyle = O; c.beginPath(); c.arc(81, 50, 1, 0, Math.PI * 2); c.arc(87, 50, 1, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(84, 53, 3, 0.2, Math.PI - 0.2); c.stroke();
      MP.drawText(c, '+22°', 116, 46, { size: 0.9, color: '#e04848', outline: '#ffffff' });
    } else {
      // the news anchor at the desk
      MP.drawPerson(c, 44, 94, { character: 'boy', hair: '#4a3020', glasses: true, scale: 1.3,
        outfit: { shirt: 'sailor', bottom: 'brown', hat: 'none', costume: 'none' }, mouth: Math.floor(t * 5) % 2 ? 'yawn' : 'smile' });
      c.fillStyle = '#2f4a8a'; c.fillRect(10, 70, 70, 30); c.strokeRect(10, 70, 70, 30);
      // the picture for the news
      c.fillStyle = '#ffffff'; c.fillRect(92, 22, 60, 42); c.strokeRect(92, 22, 60, 42);
      if (h.card && MP.drawPostcard) {
        MP.drawPostcard(c, h.card, 93, 23, 58, 40);
      } else if (h.flag) {
        MP.drawLandscape(c, h.flag.land, { x: 93, y: 23, w: 58, h: 40 }, t * 4);
        h.flag.flag(c, 96, 26, 14, 9); c.strokeRect(96, 26, 14, 9);
      } else if (h.pet && MP.drawPet) {
        MP.drawPet(c, 122, 58, { kind: h.pet.kind, scale: 1.4, happy: true });
      } else {
        MP.drawText(c, h.icon || '📰', 122, 30, { size: 2.2, align: 'center' });
      }
    }
    // the headline at the bottom
    c.fillStyle = 'rgba(255,255,255,0.95)';
    c.fillRect(0, 72, 160, 14);
    c.fillStyle = '#e04848'; c.fillRect(0, 72, 4, 14);
    MP.drawText(c, h.text, 82, 75, { size: h.text.length > 34 ? 0.45 : 0.55, color: O, align: 'center' });
  }
  function newsSounds(prev, now) {
    if (Math.floor(prev / NEWS_LEN) !== Math.floor(now / NEWS_LEN)) {
      [72, 79, 76].forEach((m, k) => setTimeout(() => note(m, 0.18, 'sine', 0.1), k * 120));
    }
  }

  MP.TV_CHANNELS = [
    { n: 1, name: 'HAHA-TV', draw: (c, t) => MP.tvHaha(c, t) },
    { n: 2, name: 'TURPAPOJAT', logo: 'TURPAPOJAT-SHOW', draw: turpa, sounds: turpaSounds },
    { n: 3, name: 'PIKKU KAKKONEN', draw: pikku, sounds: pikkuSounds },
    { n: 4, name: 'EUROVIISUT', draw: euro, sounds: euroSounds },
    { n: 5, name: 'LASTEN UUTISET', draw: news, sounds: newsSounds },
    { n: 6, name: 'MASKED SINGER', logo: 'MASKED SINGER SUOMI', draw: (c, t) => MP.tvMasked(c, t) },
  ];
})();
