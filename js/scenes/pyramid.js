// pyramid.js – INSIDE THE PYRAMID, side view like the house.
// Tap to walk. Three golden scarab beetles are hidden: in the big jar, on the
// picture wall and under the cat statue. The friendly mummy in the sarcophagus
// tells what to do. With all three scarabs the treasure chest opens!
// The bright doorway on the left goes back out to the desert.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  // Colors inside the pyramid (Ella can change these)
  MP.PYRAMID = {
    wall: '#c79a5e',
    wallDark: '#9c7444',
    floor: '#8a6238',
    ceiling: '#5e4226',
    paint: '#5b3a1e',      // hieroglyph lines
    blue: '#3f7fc8',
    gold: '#ffd23f',
    torchLight: 'rgba(255,170,60,0.22)',
  };

  const WORLD_W = 900;
  const FLOOR = 150;
  const POS = { door: 30, vase: 220, wall: 410, cat: 585, coffin: 730, chest: 850 };
  const SPOTS = {
    door:   { x: 8,   y: 84,  w: 46, h: 66, standX: 44 },
    vase:   { x: 204, y: 104, w: 32, h: 46, standX: 244 },
    wall:   { x: 440, y: 58,  w: 22, h: 22, standX: 452 },
    cat:    { x: 566, y: 88,  w: 40, h: 62, standX: 612 },
    coffin: { x: 690, y: 104, w: 82, h: 46, standX: 676 },
    chest:  { x: 828, y: 118, w: 44, h: 32, standX: 812 },
  };
  const SCARAB_FROM = { vase: { x: 220, y: 98 }, wall: { x: 451, y: 69 }, cat: { x: 585, y: 140 } };
  const TORCHES = [110, 300, 500, 660, 800];
  const slot = (i) => ({ x: 16 + i * 17, y: 18.5 });

  // ---------------------------------------------------------------------------
  // Drawings
  // ---------------------------------------------------------------------------
  function scarab(c, x, y, s, rot) {
    c.save();
    c.translate(x, y);
    c.rotate(rot || 0);
    c.scale(s, s);
    c.lineWidth = 0.6;
    c.strokeStyle = O();
    c.fillStyle = '#c8913a';
    for (const k of [-1, 1]) for (const ly of [-2, 0.5, 3]) {
      c.beginPath(); c.moveTo(k * 2.5, ly); c.lineTo(k * 5, ly + (ly < 0 ? -1.5 : 1.5)); c.stroke();
    }
    c.beginPath(); c.ellipse(0, -4.6, 2.2, 1.7, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = MP.PYRAMID.gold;
    c.beginPath(); c.ellipse(0, 0.8, 3.6, 4.8, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(0, -3.6); c.lineTo(0, 5.2); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath(); c.ellipse(-1.5, -0.8, 0.8, 1.6, 0.3, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  function torch(c, x, t) {
    const y = 66;
    c.fillStyle = '#6e4226';
    c.strokeStyle = O();
    c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x + 3, y); c.lineTo(x + 1.5, y + 14); c.lineTo(x - 1.5, y + 14); c.closePath(); c.fill(); c.stroke();
    const f = 1 + Math.sin(t * 13 + x) * 0.12 + Math.sin(t * 7.3 + x * 2) * 0.08;
    c.fillStyle = '#ff8a2a';
    c.beginPath(); c.ellipse(x, y - 4 * f, 3.4, 6 * f, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffd23f';
    c.beginPath(); c.ellipse(x, y - 2.5 * f, 1.8, 3.6 * f, 0, 0, Math.PI * 2); c.fill();
  }

  // Little pictures painted on the wall
  const GLYPHS = {
    ankh(c, x, y) {
      c.beginPath(); c.ellipse(x, y - 5, 2.6, 3.4, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(x, y - 1.6); c.lineTo(x, y + 8); c.moveTo(x - 4, y); c.lineTo(x + 4, y); c.stroke();
    },
    eye(c, x, y) {
      c.beginPath(); c.ellipse(x, y, 5, 2.6, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(x, y, 1.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(x - 1, y + 2.6); c.lineTo(x - 2, y + 7); c.moveTo(x + 2, y + 2.4); c.quadraticCurveTo(x + 4, y + 7, x + 6, y + 5); c.stroke();
    },
    bird(c, x, y) {
      c.beginPath(); c.arc(x + 2, y - 4, 2, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(x + 4, y - 4); c.lineTo(x + 7, y - 3); c.stroke();
      c.beginPath(); c.ellipse(x - 1, y + 1, 4.5, 2.8, -0.4, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(x, y + 3.5); c.lineTo(x, y + 7); c.moveTo(x + 2, y + 3); c.lineTo(x + 2, y + 7); c.stroke();
    },
    water(c, x, y) {
      for (let k = -1; k <= 1; k++) {
        c.beginPath();
        for (let i = 0; i <= 8; i++) c.lineTo(x - 6 + i * 1.5, y + k * 3.5 + (i % 2 ? -1 : 1));
        c.stroke();
      }
    },
    sun(c, x, y) {
      c.beginPath(); c.arc(x, y, 3.8, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(x, y, 1.2, 0, Math.PI * 2); c.fill();
    },
    cat(c, x, y) {
      c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(x - 3.5, y - 2); c.lineTo(x - 3, y - 7); c.lineTo(x - 0.8, y - 3.8);
      c.moveTo(x + 3.5, y - 2); c.lineTo(x + 3, y - 7); c.lineTo(x + 0.8, y - 3.8); c.stroke();
      c.beginPath(); c.arc(x - 1.5, y - 0.5, 0.6, 0, Math.PI * 2); c.arc(x + 1.5, y - 0.5, 0.6, 0, Math.PI * 2); c.fill();
    },
    pyramid(c, x, y) {
      c.beginPath(); c.moveTo(x - 6, y + 4); c.lineTo(x, y - 5); c.lineTo(x + 6, y + 4); c.closePath(); c.stroke();
    },
  };
  const GLYPH_ORDER = ['ankh', 'eye', 'bird', 'water', 'sun', 'cat', 'pyramid'];

  // A painted wall panel from x0 to x1
  function glyphPanel(c, x0, x1, seed) {
    const P = MP.PYRAMID;
    c.fillStyle = '#e6c98f';
    c.strokeStyle = O();
    c.lineWidth = 0.8;
    MP.roundRect(c, x0, 38, x1 - x0, 64, 3);
    c.fill(); c.stroke();
    c.fillStyle = P.blue;
    c.fillRect(x0 + 2, 40, x1 - x0 - 4, 3);
    c.fillRect(x0 + 2, 97, x1 - x0 - 4, 3);
    c.strokeStyle = P.paint;
    c.fillStyle = P.paint;
    c.lineWidth = 0.9;
    let i = seed;
    for (let x = x0 + 12; x < x1 - 8; x += 18) {
      for (const y of [56, 82]) {
        GLYPHS[GLYPH_ORDER[i % GLYPH_ORDER.length]](c, x, y);
        i += 3;
      }
    }
  }

  function vase(c, x, wobble) {
    c.save();
    c.translate(x, FLOOR);
    c.rotate(wobble);
    c.lineWidth = 0.9;
    c.strokeStyle = O();
    c.fillStyle = '#b5562e';
    c.beginPath();
    c.moveTo(-6, -44); c.lineTo(6, -44);
    c.quadraticCurveTo(5, -38, 12, -30);
    c.quadraticCurveTo(18, -14, 8, 0);
    c.lineTo(-8, 0);
    c.quadraticCurveTo(-18, -14, -12, -30);
    c.quadraticCurveTo(-5, -38, -6, -44);
    c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#2b2340';
    c.fillRect(-12, -26, 24, 3);
    c.fillStyle = MP.PYRAMID.blue;
    c.fillRect(-14, -18, 28, 3);
    c.fillStyle = '#ffd23f';
    for (let k = -2; k <= 2; k++) { c.beginPath(); c.arc(k * 4.5, -12, 1.2, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }

  function catStatue(c, x, glow) {
    const P = MP.PYRAMID;
    c.save();
    c.translate(x, FLOOR);
    c.lineWidth = 0.9;
    c.strokeStyle = O();
    c.fillStyle = P.wallDark;
    c.fillRect(-18, -12, 36, 12); c.strokeRect(-18, -12, 36, 12);   // stand
    c.fillStyle = '#2f2f3a';
    c.beginPath(); c.ellipse(0, -28, 11, 17, 0, 0, Math.PI * 2); c.fill(); c.stroke();    // body
    c.beginPath(); c.ellipse(0, -50, 8, 8, 0, 0, Math.PI * 2); c.fill(); c.stroke();      // head
    c.beginPath(); c.moveTo(-7, -54); c.lineTo(-6, -64); c.lineTo(-1, -57); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(7, -54); c.lineTo(6, -64); c.lineTo(1, -57); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(10, -16); c.quadraticCurveTo(22, -16, 16, -30); c.stroke();  // tail
    c.fillStyle = P.gold;
    c.fillRect(-7, -42, 14, 3);                                      // gold collar
    c.beginPath(); c.arc(0, -38, 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = glow ? '#7dffb0' : '#3cb371';
    c.beginPath(); c.ellipse(-3, -51, 1.8, 1.3, 0, 0, Math.PI * 2); c.ellipse(3, -51, 1.8, 1.3, 0, 0, Math.PI * 2); c.fill();
    if (glow) {
      c.fillStyle = 'rgba(125,255,176,0.35)';
      c.beginPath(); c.arc(-3, -51, 4, 0, Math.PI * 2); c.arc(3, -51, 4, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }

  // The sarcophagus, the lid opening (0..1) and the friendly mummy rising (0..1)
  function coffin(c, x, open, rise, t) {
    const P = MP.PYRAMID;
    c.save();
    c.translate(x, FLOOR);
    c.lineWidth = 0.9;
    c.strokeStyle = O();
    c.fillStyle = P.wallDark;
    c.fillRect(-38, -12, 76, 12); c.strokeRect(-38, -12, 76, 12);     // stone stand
    // the mummy (behind the front side of the box)
    if (rise > 0) {
      const my = -26 - rise * 22;
      const wave = Math.sin(t * 7) * 0.5;
      c.fillStyle = '#efe6cf';
      MP.roundRect(c, -24, my + 6, 18, 24, 6); c.fill(); c.stroke();     // body
      c.save();                                                         // waving arm
      c.translate(-8, my + 10);
      c.rotate(-1.9 + wave);
      MP.roundRect(c, -2.5, -1, 5, 15, 2.5); c.fill(); c.stroke();
      c.restore();
      c.beginPath(); c.arc(-15, my, 9, 0, Math.PI * 2); c.fill(); c.stroke();   // head
      c.strokeStyle = 'rgba(120,100,70,0.6)';
      c.lineWidth = 0.6;
      for (const yy of [-6, -2, 5]) { c.beginPath(); c.moveTo(-23, my + yy); c.lineTo(-7, my + yy + 1.5); c.stroke(); }
      for (const yy of [12, 17, 22, 27]) { c.beginPath(); c.moveTo(-24, my + yy); c.lineTo(-6, my + yy - 2); c.stroke(); }
      c.fillStyle = '#ffffff';
      c.strokeStyle = O();
      c.beginPath(); c.arc(-18.5, my + 1, 2.6, 0, Math.PI * 2); c.arc(-11.5, my + 1, 2.6, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2b2340';
      c.beginPath(); c.arc(-18, my + 1.4, 1.2, 0, Math.PI * 2); c.arc(-11, my + 1.4, 1.2, 0, Math.PI * 2); c.fill();
      c.lineWidth = 0.7;
      c.beginPath(); c.arc(-15, my + 4, 2.4, 0.2, Math.PI - 0.2); c.stroke();     // smile
    }
    // the box
    c.lineWidth = 0.9;
    c.strokeStyle = O();
    c.fillStyle = P.gold;
    MP.roundRect(c, -34, -32, 68, 20, 6); c.fill(); c.stroke();
    c.fillStyle = P.blue;
    for (let k = -26; k < 30; k += 9) c.fillRect(k, -30, 3.5, 16);
    // the lid: slides to the right and tips up
    c.save();
    c.translate(open * 38, -32 - open * 6);
    c.rotate(open * 0.25);
    c.fillStyle = P.gold;
    MP.roundRect(c, -36, -8, 72, 9, 4); c.fill(); c.stroke();
    // a sleeping face painted on the lid
    c.fillStyle = '#f2c99a';
    c.beginPath(); c.ellipse(-25, -4, 6, 4.2, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = P.blue;
    c.fillRect(-21, -7, 4, 6.5);
    c.strokeStyle = O();
    c.lineWidth = 0.5;
    c.beginPath(); c.arc(-27, -5, 1, 0, Math.PI); c.arc(-23, -5, 1, 0, Math.PI); c.stroke();
    c.restore();
    c.restore();
  }

  // Tutankhamun's golden mask. (x, y) = bottom middle; about 30 tall at s = 1.
  function tutMask(c, x, y, s) {
    const GOLD = '#f2c14e', BLUE = '#2a4fa0';
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.lineWidth = 0.7;
    c.strokeStyle = O();
    // the striped headcloth (nemes) behind the face
    c.beginPath();
    c.moveTo(-6, -29); c.quadraticCurveTo(0, -32, 6, -29);
    c.lineTo(12.5, -12); c.lineTo(11.5, -3); c.lineTo(-11.5, -3); c.lineTo(-12.5, -12); c.closePath();
    c.save();
    c.fillStyle = GOLD; c.fill();
    c.clip();
    c.fillStyle = BLUE;
    for (let yy = -31; yy < 0; yy += 2.6) c.fillRect(-14, yy, 28, 1.2);
    c.restore();
    c.stroke();
    // the wide collar with bands of colors
    const bands = [BLUE, GOLD, '#c0392b', GOLD, '#2bb3a3', GOLD];
    bands.forEach((col, i) => {
      c.fillStyle = col;
      c.beginPath(); c.ellipse(0, -7, 11 - i * 1.5, 7 - i * 1.05, 0, 0, Math.PI); c.fill();
    });
    c.beginPath(); c.ellipse(0, -7, 11, 7, 0, 0, Math.PI); c.stroke();
    // ears and face
    c.fillStyle = '#e8b03c';
    c.beginPath(); c.ellipse(-6, -16, 1.4, 2.4, 0, 0, Math.PI * 2); c.ellipse(6, -16, 1.4, 2.4, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#ffd766';
    c.beginPath(); c.ellipse(0, -16, 5.4, 7.2, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    // headcloth over the forehead
    c.save();
    c.beginPath(); c.ellipse(0, -18.5, 6.4, 7.5, 0, Math.PI, Math.PI * 2); c.closePath();
    c.fillStyle = GOLD; c.fill();
    c.clip();
    c.fillStyle = BLUE;
    for (let yy = -27; yy < -18; yy += 2.6) c.fillRect(-8, yy, 16, 1.2);
    c.restore();
    c.beginPath(); c.moveTo(-6.4, -18.5); c.lineTo(6.4, -18.5); c.stroke();
    // the cobra and the vulture on the forehead
    c.fillStyle = GOLD;
    c.beginPath(); c.ellipse(0.9, -25, 0.9, 1.8, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = BLUE;
    c.beginPath(); c.arc(-0.9, -24, 0.9, 0, Math.PI * 2); c.fill();
    // eyes with dark lines, blue eyebrows
    for (const k of [-1, 1]) {
      c.fillStyle = '#ffffff';
      c.beginPath(); c.ellipse(k * 2.3, -15.5, 1.6, 0.8, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1b1b2a';
      c.beginPath(); c.arc(k * 2.3, -15.5, 0.55, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#1b1b2a';
      c.lineWidth = 0.5;
      c.beginPath(); c.ellipse(k * 2.3, -15.5, 1.6, 0.8, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(k * 3.9, -15.5); c.lineTo(k * 5, -15.9); c.stroke();
      c.strokeStyle = BLUE;
      c.lineWidth = 0.7;
      c.beginPath(); c.moveTo(k * 0.8, -17.3); c.quadraticCurveTo(k * 2.6, -18.4, k * 4.6, -17.3); c.stroke();
    }
    c.strokeStyle = '#b07a1c';
    c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(0, -15); c.lineTo(-0.5, -12.4); c.lineTo(0.6, -12.2); c.stroke();     // nose
    c.strokeStyle = '#a0522d';
    c.beginPath(); c.moveTo(-1.3, -10.8); c.quadraticCurveTo(0, -10.2, 1.3, -10.8); c.stroke();   // mouth
    // the braided beard
    c.lineWidth = 0.6;
    c.strokeStyle = O();
    c.fillStyle = BLUE;
    MP.roundRect(c, -1.1, -9.2, 2.2, 6.4, 1); c.fill(); c.stroke();
    c.fillStyle = GOLD;
    for (let yy = -8.4; yy < -3; yy += 1.5) c.fillRect(-1, yy, 2, 0.5);
    // shine
    c.fillStyle = 'rgba(255,255,255,0.45)';
    c.beginPath(); c.ellipse(-2.8, -20, 0.8, 2, 0.4, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  function chest(c, x, open, locked) {
    const P = MP.PYRAMID;
    c.save();
    c.translate(x, FLOOR);
    c.lineWidth = 0.9;
    c.strokeStyle = O();
    if (open > 0) {
      // treasure glowing inside
      c.fillStyle = 'rgba(255,220,90,' + (0.35 * open) + ')';
      c.beginPath(); c.arc(0, -24, 26, 0, Math.PI * 2); c.fill();
      c.fillStyle = P.gold;
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.arc(k * 5, -24 - Math.abs(k) * -1, 3, 0, Math.PI * 2); c.fill(); c.stroke(); }
      // Tutankhamun's golden mask rises from the chest
      tutMask(c, 0, -20 - open * 10, 0.8 + open * 0.2);
    }
    c.fillStyle = '#8b4a2b';
    MP.roundRect(c, -18, -24, 36, 24, 3); c.fill(); c.stroke();
    c.fillStyle = P.gold;
    c.fillRect(-18, -14, 36, 3);
    c.fillRect(-12, -24, 3, 24);
    c.fillRect(9, -24, 3, 24);
    // three scarab-shaped holes in the lock
    if (locked) {
      c.fillStyle = '#4a2a14';
      for (let k = -1; k <= 1; k++) { c.beginPath(); c.ellipse(k * 6, -7, 2, 2.6, 0, 0, Math.PI * 2); c.fill(); }
    }
    // the lid
    c.save();
    c.translate(-18, -24);
    c.rotate(-open * 1.9);
    c.fillStyle = '#9c5530';
    MP.roundRect(c, 0, -10, 36, 10, 5); c.fill(); c.stroke();
    c.fillStyle = P.gold;
    c.fillRect(6, -10, 3, 10);
    c.fillRect(27, -10, 3, 10);
    c.restore();
    c.restore();
  }

  // (the Egypt book uses these pictures too; they stand on y = 150)
  MP.pyramidArt = { scarab, coffin, catStatue, vase, tutMask, glyphs: GLYPHS };

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.pyramid = {
    enter() {
      this.player = new MP.Player(POS.door + 30, { minX: 34, maxX: WORLD_W - 16 });
      this.player.place(60, 1);
      this.camX = 0;
      this.busy = false;
      // what has been found stays, if you go out and come back in
      this.found = this.found || {};
      this.chestOpen = this.chestOpen || 0;
      this.flying = [];             // scarabs flying to the corner
      this.wobbleAt = -10;
      this.catAt = -10;
      this.mummy = null;            // { from }
      this.sparkles = [];
      this.mummyBubble = null;
      this.showMask = null;         // the big picture of the golden mask
      if (this.count() === 3) this.say('Takaisin pyramidissa!', 2.5, 0.6);
      else this.say('Onpa hämärää… Kuka tuolla laatikossa asuu? Mennään katsomaan!', 4.5, 0.8);
    },

    count() {
      return Object.keys(this.found).length;
    },

    say(text, seconds, delay) {
      this.bubble = { text, from: MP.time + (delay || 0), until: Infinity };   // stays until the next tap
    },

    // A scarab was found at `where`
    find(where) {
      if (this.found[where]) return false;
      this.found[where] = true;
      const from = SCARAB_FROM[where];
      this.flying.push({ x: from.x, y: from.y, born: MP.time, slot: this.count() - 1 });
      MP.sfx.bling();
      const n = this.count();
      if (n === 3) this.say('Kaikki kolme kovakuoriaista! Nyt aarrearkulle!', 4, 0.6);
      else this.say('Kultainen kovakuoriainen! (' + n + '/3)', 2.5, 0.3);
      return true;
    },

    use(id) {
      const t = MP.time;
      if (id === 'door') {
        this.busy = true;
        MP.goTo(MP.scenes.egypt, { from: 'pyramid' });
      } else if (id === 'vase') {
        this.wobbleAt = t;
        MP.sfx.boing();
        if (!this.find('vase')) this.say('Ruukku on tyhjä.', 2);
      } else if (id === 'wall') {
        if (!this.find('wall')) this.say('Hienoja kuvia! Ne ovat hieroglyfejä – egyptiläisten kirjoitusta.', 4);
      } else if (id === 'cat') {
        this.catAt = t;
        MP.sfx.tune();
        if (!this.find('cat')) this.say('Kissapatsas. Miau!', 2);
      } else if (id === 'coffin') {
        this.mummy = { from: t };
        MP.sfx.boing();
        const o = MP.state.outfit || {};
        const hi = o.costume === 'pharaoh' ? 'Oho, oikea faarao! ' : 'Hei! Olen kiltti muumio. ';
        let text;
        if (this.chestOpen) text = hi + 'Löysit aarteen! Olet mahtava!';
        else if (this.count() === 3) text = hi + 'Sinulla on kaikki kolme! Avaa aarrearkku!';
        else text = hi + 'Etsi kolme kultaista kovakuoriaista, niin aarrearkku aukeaa!';
        this.mummyBubble = { text, from: t + 0.7, until: Infinity };   // stays until the next tap
      } else if (id === 'chest') {
        if (this.chestOpen) {
          this.showMask = { from: t };
        } else if (this.count() < 3) {
          this.say('Arkku on lukossa. Siinä on kolme koloa kovakuoriaisille… (' + this.count() + '/3)', 4);
          MP.sfx.boing();
        } else {
          this.opening = t;
          // the golden mask goes home to the child's room
          MP.state.treasures = Object.assign({}, MP.state.treasures, { tutMask: true });
          MP.save();
          MP.sfx.tune();
          setTimeout(() => MP.sfx.bling(), 350);
          this.say('Löysin faaraon aarteen!', 4, 0.5);
          this.showMask = { from: t + 1.4 };
          for (let i = 0; i < 14; i++) {
            this.sparkles.push({
              x: POS.chest + (Math.random() - 0.5) * 50, y: FLOOR - 20 - Math.random() * 40,
              born: t + i * 0.07, r: 2.5 + Math.random() * 3,
            });
          }
        }
      }
    },

    onTap(x, y) {
      if (this.busy || MP.isFading()) return;
      // the big picture of the mask: a tap closes it
      if (this.showMask) {
        if (MP.time >= this.showMask.from) this.showMask = null;
        return;
      }
      const wx = x + this.camX;
      // a found scarab isn't on the wall any more
      for (const id of ['door', 'vase', 'wall', 'cat', 'coffin', 'chest']) {
        if (id === 'wall' && this.found.wall) continue;
        if (MP.hit(SPOTS[id], wx, y)) {
          MP.sfx.tap();
          this.player.walkTo(SPOTS[id].standX, () => this.use(id));
          return;
        }
      }
      this.player.walkTo(wx);
    },

    update(dt) {
      this.player.update(dt);
      const want = MP.clamp(this.player.x - MP.W / 2, 0, WORLD_W - MP.W);
      this.camX += (want - this.camX) * Math.min(1, dt * 5);
      if (this.opening != null) {
        this.chestOpen = MP.clamp((MP.time - this.opening) / 0.8, 0, 1);
        if (this.chestOpen >= 1) this.opening = null;
      }
      this.sparkles = this.sparkles.filter((s) => MP.time - s.born < 0.9);
      this.flying = this.flying.filter((f) => MP.time - f.born < 1);
    },

    draw(ctx) {
      const P = MP.PYRAMID;
      const t = MP.time;
      const cam = this.camX;

      // ===== Walls, ceiling, floor =====
      ctx.fillStyle = P.wall;
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.save();
      ctx.translate(-cam, 0);
      // stone blocks
      ctx.strokeStyle = 'rgba(90,60,30,0.35)';
      ctx.lineWidth = 0.7;
      for (let r = 0; r < 8; r++) {
        const y = 22 + r * 16;
        ctx.beginPath(); ctx.moveTo(cam, y); ctx.lineTo(cam + MP.W, y); ctx.stroke();
        const off = r % 2 ? 0 : 20;
        for (let x = Math.floor(cam / 40) * 40 - 40 + off; x < cam + MP.W + 40; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 16); ctx.stroke();
        }
      }
      // ceiling
      ctx.fillStyle = P.ceiling;
      ctx.fillRect(cam, 0, MP.W, 20);
      ctx.fillStyle = P.blue;
      ctx.fillRect(cam, 20, MP.W, 3);
      ctx.fillStyle = P.gold;
      for (let x = Math.floor(cam / 12) * 12; x < cam + MP.W; x += 12) {
        ctx.beginPath(); ctx.moveTo(x, 23); ctx.lineTo(x + 6, 23); ctx.lineTo(x + 3, 27); ctx.closePath(); ctx.fill();
      }
      // floor
      ctx.fillStyle = P.floor;
      ctx.fillRect(cam, FLOOR, MP.W, MP.H - FLOOR);
      ctx.strokeStyle = 'rgba(40,25,10,0.35)';
      for (let x = Math.floor(cam / 30) * 30; x < cam + MP.W; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x - 10, MP.H); ctx.stroke();
      }

      // ===== The bright doorway out =====
      ctx.fillStyle = '#ffe9a8';
      MP.roundRect(ctx, 12, 88, 38, 62, 4); ctx.fill();
      ctx.fillStyle = '#8fd3ff';
      ctx.fillRect(14, 90, 34, 34);
      ctx.fillStyle = '#f2d38b';
      ctx.fillRect(14, 124, 34, 26);
      ctx.fillStyle = '#e6bd6e';
      ctx.beginPath(); ctx.moveTo(18, 124); ctx.lineTo(28, 108); ctx.lineTo(38, 124); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = O(); ctx.lineWidth = 1;
      ctx.strokeRect(12, 88, 38, 62);
      ctx.fillStyle = P.wallDark;
      ctx.fillRect(8, 82, 46, 6);
      ctx.strokeRect(8, 82, 46, 6);
      MP.drawText(ctx, 'Ulos', 31, 72, { size: 0.8, color: '#ffffff', outline: O(), align: 'center' });

      // ===== Wall paintings =====
      glyphPanel(ctx, 130, 280, 0);
      glyphPanel(ctx, 330, 480, 2);
      glyphPanel(ctx, 640, 870, 5);
      // the hidden scarab on the wall glints now and then
      if (!this.found.wall) {
        scarab(ctx, SCARAB_FROM.wall.x, SCARAB_FROM.wall.y, 0.9, 0);
        const g = (t % 2.6) / 2.6;
        if (g < 0.25) MP.draw('sparkle', ctx, SCARAB_FROM.wall.x + 4, SCARAB_FROM.wall.y - 4, { r: Math.sin(g / 0.25 * Math.PI) * 3 + 0.01 });
      }

      // ===== Torches and their light =====
      for (const x of TORCHES) torch(ctx, x, t);

      // ===== Things =====
      const wob = t - this.wobbleAt;
      vase(ctx, POS.vase, wob < 0.8 ? Math.sin(wob * 25) * 0.12 * (1 - wob / 0.8) : 0);
      catStatue(ctx, POS.cat, t - this.catAt < 1.5);
      let open = 0, rise = 0;
      if (this.mummy) {
        const a = t - this.mummy.from;
        // the mummy lies down again a moment after its text has been tapped away
        if (this.mummy.downAt == null && a > 1 && !this.mummyBubble) this.mummy.downAt = t + 0.6;
        const d = this.mummy.downAt == null ? -1 : t - this.mummy.downAt;
        open = MP.clamp(a / 0.5, 0, 1) * MP.clamp(1 - (d - 0.4) / 0.5, 0, 1);
        rise = MP.clamp((a - 0.3) / 0.5, 0, 1) * MP.clamp(1 - d / 0.5, 0, 1);
        if (d > 1) this.mummy = null;
      }
      coffin(ctx, POS.coffin, open, rise, t);
      chest(ctx, POS.chest, this.chestOpen, this.chestOpen === 0);

      // ===== The character =====
      this.player.draw(ctx, FLOOR, 0);

      // glows from the torches
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const x of TORCHES) {
        const f = 1 + Math.sin(t * 9 + x) * 0.05;
        const g = ctx.createRadialGradient(x, 60, 2, x, 60, 55 * f);
        g.addColorStop(0, P.torchLight);
        g.addColorStop(1, 'rgba(255,170,60,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - 60, 0, 120, MP.H);
      }
      ctx.restore();

      // sparkles from the chest
      for (const s of this.sparkles) {
        const age = t - s.born;
        if (age < 0) continue;
        MP.draw('sparkle', ctx, s.x, s.y - age * 12, { r: s.r * Math.sin(MP.clamp(age / 0.9, 0, 1) * Math.PI) + 0.01 });
      }

      // arrow to the chest when it can be opened, then to the way out
      let arrowAt = null, arrowY = 0;
      if (this.count() === 3 && !this.chestOpen) { arrowAt = POS.chest; arrowY = FLOOR - 48; }
      else if (this.chestOpen >= 1) { arrowAt = POS.door + 1; arrowY = 60; }   // over the "Ulos" text
      if (arrowAt != null) MP.draw('arrow', ctx, arrowAt, arrowY + Math.sin(t * 6) * 2.5);
      ctx.restore();

      // edge arrow when the chest is off the screen
      if (arrowAt != null) {
        const sx = arrowAt - cam;
        if (sx < 4 || sx > MP.W - 4) {
          const dir = sx > MP.W / 2 ? 1 : -1;
          ctx.save();
          ctx.translate(dir > 0 ? MP.W - 6 + Math.sin(t * 6) * 2.5 : 6 - Math.sin(t * 6) * 2.5, 112);
          ctx.rotate(-dir * Math.PI / 2);
          MP.draw('arrow', ctx, 0, 0);
          ctx.restore();
        }
      }

      // ===== Speech bubbles =====
      const b = this.bubble;
      if (b && t >= b.from && t < b.until) {
        MP.drawBubble(ctx, b.text, this.player.x - cam, FLOOR - 46, { maxWidth: 130 });
      }
      const mb = this.mummyBubble;
      if (mb && t >= mb.from && t < mb.until) {
        MP.drawBubble(ctx, mb.text, POS.coffin - 15 - cam, FLOOR - 62, { maxWidth: 140 });
      }

      // ===== Scarabs found (top-left corner) =====
      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = O();
      ctx.fillStyle = 'rgba(255,250,235,0.92)';
      MP.roundRect(ctx, 3, 8, 3 * 17 + 7, 21, 5);
      ctx.fill(); ctx.stroke();
      ctx.restore();
      const flyingSlots = this.flying.map((f) => f.slot);
      for (let i = 0; i < 3; i++) {
        const s = slot(i);
        if (i < this.count() && !flyingSlots.includes(i)) {
          scarab(ctx, s.x, s.y, 1, 0);
        } else {
          ctx.fillStyle = 'rgba(90,60,30,0.25)';
          ctx.beginPath(); ctx.ellipse(s.x, s.y + 0.5, 3.8, 5, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
      for (const f of this.flying) {
        const u = MP.clamp((t - f.born) / 0.9, 0, 1);
        const e = u * u * (3 - 2 * u);
        const s = slot(f.slot);
        const x = MP.lerp(f.x - cam, s.x, e), y = MP.lerp(f.y, s.y, e) - Math.sin(u * Math.PI) * 30;
        scarab(ctx, x, y, 1 + Math.sin(u * Math.PI) * 1.2, u * Math.PI * 2);
      }

      // ===== The golden mask, big =====
      const sm = this.showMask;
      if (sm && t >= sm.from) {
        const a = MP.clamp((t - sm.from) * 3, 0, 1);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(20,12,4,0.72)';
        ctx.fillRect(0, 0, MP.W, MP.H);
        const g = ctx.createRadialGradient(160, 92, 5, 160, 92, 80);
        g.addColorStop(0, 'rgba(255,215,90,0.55)');
        g.addColorStop(1, 'rgba(255,215,90,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, MP.W, MP.H);
        tutMask(ctx, 160, 150 + (1 - a) * 10, 3.6);
        for (let i = 0; i < 6; i++) {
          const ph = t * 1.3 + i * 1.05;
          MP.draw('sparkle', ctx, 160 + Math.cos(ph) * 70, 92 + Math.sin(ph * 1.3) * 50, { r: 2 + Math.sin(ph * 3) * 1.2 + 1.3 });
        }
        MP.drawText(ctx, 'Tutankhamonin kultainen naamio!', MP.W / 2, 6, { size: 1.3, color: '#ffd23f', outline: O(), align: 'center' });
        MP.drawText(ctx, 'Se on yli 3000 vuotta vanha. Viedään se kotiin omaan huoneeseen!', MP.W / 2, 158, { size: 0.9, color: '#ffffff', outline: O(), align: 'center' });
        MP.drawText(ctx, '(napauta)', MP.W / 2, 170, { size: 0.6, color: '#e6c98f', align: 'center' });
        ctx.restore();
      }
    },
  };
})();
