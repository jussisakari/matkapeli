// books.js – the bookshelf in the living room.
// First choose a book, then read it: tap the right page (or the arrow) to turn
// forward, the left page to go back. The speaker button reads the page aloud.
//
// ADDING A BOOK: put a new one in MP.BOOKS. Each page has a title, a text and
// a picture: art(c, r, t) draws into the box r = { x, y, w, h }.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const PAPER = '#fffaf0';
  const BOOK = { x: 22, y: 20, w: 276, h: 138 };            // the open book
  const SPINE = BOOK.x + BOOK.w / 2;
  const LEFT_PAGE = { x: BOOK.x + 6, y: BOOK.y + 6, w: BOOK.w / 2 - 9, h: BOOK.h - 12 };
  const RIGHT_PAGE = { x: SPINE + 3, y: BOOK.y + 6, w: BOOK.w / 2 - 9, h: BOOK.h - 12 };
  const CLOSE = { x: 262, y: 2, w: 54, h: 16 };
  const BACK = { x: 4, y: 154, w: 70, h: 22 };
  const SPEAK = { x: 160, y: 170, r: 8 };
  const PREV = { x: 11, y: 89, r: 9 };
  const NEXT = { x: 309, y: 89, r: 9 };
  const cover = (i) => ({ x: 62 + i * 110, y: 30, w: 86, h: 112 });

  // ---------------------------------------------------------------------------
  // Little helpers for the pictures
  // ---------------------------------------------------------------------------
  const hero = (costume) => ({ shirt: 'red', bottom: 'jeans', hat: 'none', costume, shoes: true });
  const person = (c, x, y, costume, s, extra) =>
    MP.drawPerson(c, x, y, Object.assign({ outfit: hero(costume), scale: s || 1.4 }, extra));

  // Draws something made for the pyramid (standing on y = 150) into the box
  function stage(c, r, artX, s, fn) {
    c.save();
    c.translate(r.x + r.w / 2 - artX * s, r.y + r.h - 8 - 150 * s);
    c.scale(s, s);
    fn();
    c.restore();
  }

  function sky(c, r, top, bottom) {
    const g = c.createLinearGradient(0, r.y, 0, r.y + r.h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(r.x, r.y, r.w, r.h);
  }

  function sand(c, r, h) {
    c.fillStyle = '#f2d38b';
    c.fillRect(r.x, r.y + r.h - h, r.w, h);
  }

  function pyramid(c, x, base, w, h) {
    c.lineWidth = 0.8;
    c.strokeStyle = O();
    c.fillStyle = '#e6bd6e';
    c.beginPath(); c.moveTo(x - w / 2, base); c.lineTo(x, base - h); c.lineTo(x + w / 2, base); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#c99c5c';
    c.beginPath(); c.moveTo(x, base - h); c.lineTo(x + w / 2, base); c.lineTo(x + w * 0.12, base); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ffd23f';
    c.beginPath(); c.moveTo(x - w * 0.06, base - h * 0.88); c.lineTo(x, base - h); c.lineTo(x + w * 0.06, base - h * 0.88); c.closePath(); c.fill();
  }

  function palm(c, x, base, s) {
    c.lineWidth = 0.7;
    c.strokeStyle = O();
    c.fillStyle = '#9b6b3b';
    c.beginPath(); c.moveTo(x - 1.5 * s, base); c.quadraticCurveTo(x + 2 * s, base - 14 * s, x + 4 * s, base - 26 * s);
    c.lineTo(x + 6 * s, base - 26 * s); c.quadraticCurveTo(x + 4 * s, base - 14 * s, x + 1.5 * s, base); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#3f9e4a';
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.6;
      c.beginPath();
      c.ellipse(x + 5 * s + Math.cos(a) * 7 * s, base - 26 * s + Math.sin(a) * 4 * s + 3 * s, 8 * s, 2.4 * s, a, 0, Math.PI * 2);
      c.fill(); c.stroke();
    }
  }

  function web(c, x, y, len, t) {
    c.save();
    c.strokeStyle = '#ffffff';
    c.lineWidth = 0.8;
    c.setLineDash([2, 1.5]);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y - len * 0.8); c.stroke();
    c.setLineDash([]);
    c.restore();
  }

  function cityNight(c, r) {
    sky(c, r, '#2c3e78', '#6c7fc4');
    c.fillStyle = '#ffffff';
    for (let i = 0; i < 12; i++) c.fillRect(r.x + (i * 37) % r.w, r.y + (i * 13) % 40, 1, 1);
    const cols = ['#3b3f5c', '#4a4e70', '#33364f'];
    for (let i = 0; i < 6; i++) {
      const w = r.w / 6, h = 30 + ((i * 23) % 35);
      c.fillStyle = cols[i % 3];
      c.fillRect(r.x + i * w, r.y + r.h - h, w - 1, h);
      c.fillStyle = '#ffe27a';
      for (let k = 0; k < 4; k++) c.fillRect(r.x + i * w + 3 + (k % 2) * 8, r.y + r.h - h + 5 + Math.floor(k / 2) * 8, 3, 3);
    }
  }

  // ---------------------------------------------------------------------------
  // The books
  // ---------------------------------------------------------------------------
  MP.BOOKS = [
    {
      title: 'Muinainen Egypti',
      color: '#2f6fb8',
      accent: '#ffd23f',
      coverArt(c, r) {
        sky(c, r, '#8fd3ff', '#ffe9bf');
        MP.draw('sun', c, 0, 0, { x: r.x + r.w - 16, y: r.y + 14, r: 7 });
        sand(c, r, 18);
        pyramid(c, r.x + r.w * 0.38, r.y + r.h - 14, 44, 32);
        pyramid(c, r.x + r.w * 0.72, r.y + r.h - 14, 30, 22);
      },
      pages: [
        {
          title: 'Pyramidit',
          text: 'Egyptissä on valtavia pyramideja. Ne rakennettiin yli 4000 vuotta sitten. Ne olivat faaraoiden hautoja.',
          art(c, r) {
            sky(c, r, '#8fd3ff', '#ffe9bf');
            MP.draw('sun', c, 0, 0, { x: r.x + 20, y: r.y + 18, r: 9 });
            sand(c, r, 24);
            pyramid(c, r.x + r.w * 0.62, r.y + r.h - 20, 76, 58);
            pyramid(c, r.x + r.w * 0.28, r.y + r.h - 18, 46, 34);
          },
        },
        {
          title: 'Faarao',
          text: 'Faarao oli Egyptin kuningas. Hänellä oli raidallinen päähine, kultainen kaulus ja paljon aarteita.',
          art(c, r) {
            sky(c, r, '#f7e3b5', '#e9c97f');
            c.fillStyle = '#c99c5c';
            c.fillRect(r.x, r.y + r.h - 16, r.w, 16);
            person(c, r.x + r.w / 2, r.y + r.h - 10, 'pharaoh', 2.2);
          },
        },
        {
          title: 'Niili-joki',
          text: 'Niili-joki toi vettä keskelle aavikkoa. Joen rannalla kasvoi palmuja, ja joella purjehdittiin veneillä.',
          art(c, r, t) {
            sky(c, r, '#8fd3ff', '#d9f1ff');
            sand(c, r, 44);
            c.fillStyle = '#3fb4e0';
            c.fillRect(r.x, r.y + r.h - 34, r.w, 18);
            // a boat with a sail, rocking
            const bx = r.x + r.w / 2 + Math.sin(t * 0.8) * 10, by = r.y + r.h - 30 + Math.sin(t * 2) * 1;
            c.lineWidth = 0.8; c.strokeStyle = O();
            c.fillStyle = '#a0643c';
            c.beginPath(); c.moveTo(bx - 20, by); c.quadraticCurveTo(bx, by + 10, bx + 20, by); c.closePath(); c.fill(); c.stroke();
            c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by - 30); c.stroke();
            c.fillStyle = '#ffffff';
            c.beginPath(); c.moveTo(bx + 1, by - 28); c.lineTo(bx + 16, by - 6); c.lineTo(bx + 1, by - 4); c.closePath(); c.fill(); c.stroke();
            palm(c, r.x + 14, r.y + r.h - 34, 1.2);
            palm(c, r.x + r.w - 24, r.y + r.h - 36, 1);
          },
        },
        {
          title: 'Hieroglyfit',
          text: 'Egyptiläiset kirjoittivat kuvilla. Kuvakirjoitusta kutsutaan hieroglyfeiksi. Mitä kuvia sinä näet?',
          art(c, r) {
            c.fillStyle = '#e6c98f';
            c.fillRect(r.x, r.y, r.w, r.h);
            const G = MP.pyramidArt.glyphs;
            c.save();
            c.strokeStyle = '#5b3a1e'; c.fillStyle = '#5b3a1e'; c.lineWidth = 1.2;
            const names = ['ankh', 'eye', 'bird', 'water', 'sun', 'cat', 'pyramid', 'ankh', 'bird'];
            names.forEach((n, i) => {
              c.save();
              c.translate(r.x + 22 + (i % 3) * (r.w - 44) / 2, r.y + 22 + Math.floor(i / 3) * 38);
              c.scale(1.6, 1.6);
              G[n](c, 0, 0);
              c.restore();
            });
            c.restore();
          },
        },
        {
          title: 'Muumiot',
          text: 'Faaraot muumioitiin. Heidät käärittiin kankaaseen ja laitettiin kauniiseen kultaiseen arkkuun.',
          art(c, r, t) {
            c.fillStyle = '#c79a5e';
            c.fillRect(r.x, r.y, r.w, r.h);
            c.fillStyle = '#8a6238';
            c.fillRect(r.x, r.y + r.h - 8, r.w, 8);
            stage(c, r, 0, 1.45, () => MP.pyramidArt.coffin(c, 0, 0.9, 1, t));
          },
        },
        {
          title: 'Tutankhamon',
          text: 'Tutankhamon oli poikafaarao. Hänen haudastaan löytyi kultainen naamio ja paljon muita aarteita.',
          art(c, r, t) {
            sky(c, r, '#3a2614', '#7a5530');
            const g = c.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, 4, r.x + r.w / 2, r.y + r.h / 2, r.w / 2);
            g.addColorStop(0, 'rgba(255,215,90,0.5)');
            g.addColorStop(1, 'rgba(255,215,90,0)');
            c.fillStyle = g;
            c.fillRect(r.x, r.y, r.w, r.h);
            MP.pyramidArt.tutMask(c, r.x + r.w / 2, r.y + r.h - 6, 3.4);
            MP.draw('sparkle', c, r.x + 18, r.y + 22, { r: 2.5 + Math.sin(t * 4) * 1 });
          },
        },
        {
          title: 'Kissat ja sfinksi',
          text: 'Egyptiläiset rakastivat kissoja. Suuri sfinksi on patsas, jolla on leijonan vartalo ja ihmisen pää.',
          art(c, r) {
            sky(c, r, '#8fd3ff', '#ffe9bf');
            sand(c, r, 20);
            stage(c, r, 0, 1.5, () => MP.pyramidArt.catStatue(c, 0, true));
          },
        },
        {
          title: 'Skarabee',
          text: 'Skarabee on kovakuoriainen. Egyptissä se toi onnea. Löydätkö pyramidista kolme kultaista skarabeeta?',
          art(c, r, t) {
            c.fillStyle = '#e6c98f';
            c.fillRect(r.x, r.y, r.w, r.h);
            MP.pyramidArt.scarab(c, r.x + r.w / 2, r.y + r.h / 2, 5, Math.sin(t * 2) * 0.15);
            MP.draw('sparkle', c, r.x + r.w / 2 + 22, r.y + r.h / 2 - 24, { r: 3 + Math.sin(t * 4) * 1.5 });
          },
        },
      ],
    },
    {
      title: 'Hämähäkkisankari ja ystävät',
      color: '#d62828',
      accent: '#2b4fa8',
      coverArt(c, r) {
        cityNight(c, r);
        person(c, r.x + r.w / 2, r.y + r.h - 4, 'spider', 1.5, { armUp: true });
      },
      pages: [
        {
          title: 'Hämähäkkisankari',
          text: 'Tässä on Hämähäkkisankari. Hän kiipeää seinillä ja heittää seittiä. Hups, taas katon rajassa!',
          art(c, r, t) {
            cityNight(c, r);
            web(c, r.x + r.w / 2 + 6, r.y + 40, 40, t);
            const y = r.y + r.h - 20 + Math.sin(t * 2) * 6;
            person(c, r.x + r.w / 2, y, 'spider', 1.8, { armUp: true });
          },
        },
        {
          title: 'Musta hämähäkki',
          text: 'Mustassa puvussa on punaiset seitit. Musta hämähäkki on tosi nopea ja osaa hypätä talolta toiselle!',
          art(c, r, t) {
            cityNight(c, r);
            const u = (t * 0.5) % 1;
            const x = r.x + 20 + u * (r.w - 40), y = r.y + r.h - 10 - Math.sin(u * Math.PI) * 22;
            person(c, x, y, 'spiderBlack', 1.4, { walking: true, walkTime: t });
          },
        },
        {
          title: 'Aavehämähäkki',
          text: 'Aavehämähäkillä on valkoinen huppu. Hän tanssii balettia ja soittaa rumpuja. Bum bum!',
          art(c, r, t) {
            sky(c, r, '#ffd6ec', '#c7f2f2');
            c.fillStyle = '#c084fc';
            c.fillRect(r.x, r.y + r.h - 16, r.w, 16);
            const hop = Math.abs(Math.sin(t * 3)) * 8;
            person(c, r.x + r.w / 2, r.y + r.h - 10 - hop, 'spiderGhost', 2, { armUp: Math.sin(t * 3) > 0 });
            MP.draw('star', c, 0, 0, { x: r.x + 20, y: r.y + 20, r: 4 });
            MP.draw('star', c, 0, 0, { x: r.x + r.w - 20, y: r.y + 34, r: 3 });
          },
        },
        {
          title: 'Rautasankari',
          text: 'Rautasankarin puvussa on hehkuva valo rinnassa. Hänen kenkänsä suihkuttavat tulta, ja hän lentää!',
          art(c, r, t) {
            sky(c, r, '#8fd3ff', '#e1f4ff');
            MP.draw('sun', c, 0, 0, { x: r.x + r.w - 18, y: r.y + 16, r: 7 });
            const y = r.y + r.h - 26 + Math.sin(t * 2.5) * 5;
            const x = r.x + r.w / 2;
            // flames
            c.fillStyle = '#ff8a2a';
            c.beginPath(); c.ellipse(x - 3, y + 6, 2.5, 6 + Math.sin(t * 20) * 1.5, 0, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.ellipse(x + 3, y + 6, 2.5, 6 + Math.cos(t * 20) * 1.5, 0, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#ffd23f';
            c.beginPath(); c.ellipse(x - 3, y + 4, 1.2, 3, 0, 0, Math.PI * 2); c.ellipse(x + 3, y + 4, 1.2, 3, 0, 0, Math.PI * 2); c.fill();
            person(c, x, y, 'iron', 1.8, { armUp: true });
          },
        },
        {
          title: 'Pantterisankari',
          text: 'Pantterisankari hiipii hiljaa kuin kissa. Hänellä on kissan korvat ja hopeinen kaulakoru. Miau!',
          art(c, r, t) {
            sky(c, r, '#3a2f6b', '#7a5fb0');
            MP.draw('moon', c, 0, 0, { x: r.x + 22, y: r.y + 20, r: 9 });
            c.fillStyle = '#2f2550';
            c.fillRect(r.x, r.y + r.h - 16, r.w, 16);
            const x = r.x + 30 + ((t * 18) % (r.w - 60));
            person(c, x, r.y + r.h - 10, 'panther', 1.8, { walking: true, walkTime: t * 0.6 });
          },
        },
        {
          title: 'Ystävät yhdessä',
          text: 'Yhdessä ystävät auttavat kaikkia. Paras supervoima on olla kiltti toisille!',
          art(c, r, t) {
            sky(c, r, '#ffe27a', '#ffb3d1');
            c.fillStyle = '#7cc56b';
            c.fillRect(r.x, r.y + r.h - 14, r.w, 14);
            const ids = ['spiderBlack', 'iron', 'spider', 'panther', 'spiderGhost'];
            ids.forEach((id, i) => {
              const hop = Math.max(0, Math.sin(t * 4 + i * 1.2)) * 4;
              person(c, r.x + 14 + i * (r.w - 28) / 4, r.y + r.h - 8 - hop, id, 1.05, { armUp: hop > 2 });
            });
          },
        },
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // The scene
  // ---------------------------------------------------------------------------
  MP.scenes.books = {
    enter() {
      this.book = null;       // the open book
      this.page = 0;          // which pair of pages
      this.turn = null;       // page turning: { from, dir }
      this.leaving = false;
      this.speaking = false;
    },

    exit() {
      this.stopSpeaking();
    },

    canSpeak() {
      return typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
    },

    stopSpeaking() {
      try { if (this.canSpeak()) window.speechSynthesis.cancel(); } catch (_) {}
      this.speaking = false;
    },

    // Reads the page aloud with the device's Finnish voice (if it has one)
    speak() {
      if (!this.canSpeak()) return;
      if (this.speaking) { this.stopSpeaking(); return; }
      const p = this.book.pages[this.page];
      try {
        const u = new SpeechSynthesisUtterance(p ? p.title + '. ' + p.text : 'Loppu!');
        u.lang = 'fi-FI';
        u.rate = 0.9;
        const fi = window.speechSynthesis.getVoices().find((v) => /^fi/i.test(v.lang));
        if (fi) u.voice = fi;
        u.onend = () => { this.speaking = false; };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        this.speaking = true;
      } catch (_) {
        this.speaking = false;
      }
    },

    // The last "page" (after the real ones) says "Loppu"
    lastPage() {
      return this.book.pages.length;
    },

    goPage(dir) {
      const next = this.page + dir;
      if (next < 0 || next > this.lastPage()) return;
      this.stopSpeaking();
      this.page = next;
      this.turn = { from: MP.time, dir };
      MP.sfx.tap();
    },

    onTap(x, y) {
      if (this.leaving) return;
      if (!this.book) {
        MP.BOOKS.forEach((b, i) => {
          if (MP.hit(cover(i), x, y)) {
            this.book = b;
            this.page = 0;
            this.turn = { from: MP.time, dir: 1 };
            MP.sfx.bling();
          }
        });
        if (MP.hit(BACK, x, y)) {
          this.leaving = true;
          MP.sfx.tap();
          MP.goTo(MP.scenes.home);
        }
        return;
      }
      if (MP.hit(CLOSE, x, y)) {
        this.stopSpeaking();
        this.book = null;
        MP.sfx.tap();
        return;
      }
      if (this.canSpeak() && Math.hypot(x - SPEAK.x, y - SPEAK.y) < SPEAK.r + 4) {
        this.speak();
        return;
      }
      if (Math.hypot(x - PREV.x, y - PREV.y) < PREV.r + 4 || MP.hit(LEFT_PAGE, x, y)) this.goPage(-1);
      else if (Math.hypot(x - NEXT.x, y - NEXT.y) < NEXT.r + 4 || MP.hit(RIGHT_PAGE, x, y)) this.goPage(1);
    },

    update() {
      if (this.turn && MP.time - this.turn.from > 0.45) this.turn = null;
    },

    drawBackground(ctx) {
      // the living room wall with a warm lamp light
      ctx.fillStyle = '#f3d9b1';
      ctx.fillRect(0, 0, MP.W, MP.H);
      ctx.fillStyle = 'rgba(160,100,60,0.12)';
      for (let x = 0; x < MP.W; x += 20) ctx.fillRect(x, 0, 10, MP.H);
      const g = ctx.createRadialGradient(160, 80, 10, 160, 80, 200);
      g.addColorStop(0, 'rgba(255,240,200,0.6)');
      g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, MP.W, MP.H);
    },

    drawCover(ctx, b, r, lift) {
      ctx.save();
      ctx.translate(0, -lift);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      MP.roundRect(ctx, r.x + 3, r.y + 4 + lift, r.w, r.h, 5);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = b.color;
      MP.roundRect(ctx, r.x, r.y, r.w, r.h, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(r.x + 4, r.y, 3, r.h);
      // picture
      const pic = { x: r.x + 11, y: r.y + 34, w: r.w - 18, h: r.h - 44 };
      ctx.save();
      MP.roundRect(ctx, pic.x, pic.y, pic.w, pic.h, 3);
      ctx.clip();
      b.coverArt(ctx, pic, MP.time);
      ctx.restore();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = b.accent;
      MP.roundRect(ctx, pic.x, pic.y, pic.w, pic.h, 3);
      ctx.stroke();
      // title
      const lines = MP.wrapText(b.title, r.w - 16, 0.95);
      lines.forEach((ln, i) => {
        MP.drawText(ctx, ln, r.x + r.w / 2 + 2, r.y + 6 + i * 10 + (lines.length === 1 ? 5 : 0), {
          size: 0.95, color: '#ffffff', outline: O(), align: 'center',
        });
      });
      ctx.restore();
    },

    drawPage(ctx, side, r, idx) {
      const t = MP.time;
      const b = this.book;
      const p = b.pages[idx];
      if (idx === b.pages.length) {
        // The end
        if (side === 'left') {
          ctx.save();
          ctx.fillStyle = b.color;
          ctx.globalAlpha = 0.12;
          ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.restore();
          b.coverArt(ctx, { x: r.x + 10, y: r.y + 10, w: r.w - 20, h: r.h - 20 }, t);
        } else {
          MP.drawText(ctx, 'Loppu', r.x + r.w / 2, r.y + 36, { size: 2.4, color: b.color, outline: O(), align: 'center' });
          MP.drawText(ctx, 'Kiitos kun luit!', r.x + r.w / 2, r.y + 70, { size: 1, color: O(), align: 'center' });
          MP.draw('star', ctx, 0, 0, { x: r.x + 24, y: r.y + 30, r: 4 });
          MP.draw('star', ctx, 0, 0, { x: r.x + r.w - 24, y: r.y + 36, r: 3.5 });
        }
        return;
      }
      if (side === 'left') {
        ctx.save();
        MP.roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 4);
        ctx.clip();
        p.art(ctx, { x: r.x + 4, y: r.y + 4, w: r.w - 8, h: r.h - 8 }, t);
        ctx.restore();
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = O();
        MP.roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 4);
        ctx.stroke();
      } else {
        MP.drawText(ctx, p.title, r.x + r.w / 2, r.y + 8, { size: 1.25, color: b.color, align: 'center' });
        const lines = MP.wrapText(p.text, r.w - 16, 0.95);
        lines.forEach((ln, i) => {
          MP.drawText(ctx, ln, r.x + 8, r.y + 30 + i * 11.5, { size: 0.95, color: O() });
        });
        MP.drawText(ctx, String(idx + 1), r.x + r.w - 8, r.y + r.h - 10, { size: 0.7, color: '#9a8a70', align: 'right' });
      }
    },

    draw(ctx) {
      const t = MP.time;
      this.drawBackground(ctx);

      // ===== Choosing a book =====
      if (!this.book) {
        MP.drawText(ctx, 'Valitse kirja', MP.W / 2, 6, { size: 1.6, color: '#ffffff', outline: O(), align: 'center' });
        MP.BOOKS.forEach((b, i) => {
          const r = cover(i);
          const hover = MP.pointer.down && MP.hit(r, MP.pointer.x, MP.pointer.y);
          this.drawCover(ctx, b, r, hover ? 3 : Math.sin(t * 2 + i) * 1.2);
        });
        MP.drawButton(ctx, 'Takaisin', BACK, { size: 0.95, color: '#e0559a', shade: '#a8326c' });
        return;
      }

      // ===== The open book =====
      const b = this.book;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = b.color;                           // the cover behind the pages
      MP.roundRect(ctx, BOOK.x - 4, BOOK.y - 4, BOOK.w + 8, BOOK.h + 8, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = PAPER;
      MP.roundRect(ctx, BOOK.x, BOOK.y, BOOK.w, BOOK.h, 4);
      ctx.fill(); ctx.stroke();
      const g = ctx.createLinearGradient(SPINE - 10, 0, SPINE + 10, 0);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, 'rgba(0,0,0,0.16)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(SPINE - 10, BOOK.y, 20, BOOK.h);
      ctx.beginPath(); ctx.moveTo(SPINE, BOOK.y); ctx.lineTo(SPINE, BOOK.y + BOOK.h); ctx.stroke();
      ctx.restore();

      this.drawPage(ctx, 'left', LEFT_PAGE, this.page);
      this.drawPage(ctx, 'right', RIGHT_PAGE, this.page);

      // a page flipping over the spine
      if (this.turn) {
        const u = MP.clamp((t - this.turn.from) / 0.45, 0, 1);
        const w = (BOOK.w / 2) * Math.abs(Math.cos(u * Math.PI));
        // turning forward: the sheet goes from the right side over to the left
        const onRight = this.turn.dir > 0 ? u < 0.5 : u >= 0.5;
        ctx.save();
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#fff3dc';
        if (onRight) ctx.fillRect(SPINE, BOOK.y, w, BOOK.h);
        else ctx.fillRect(SPINE - w, BOOK.y, w, BOOK.h);
        if (onRight) ctx.strokeRect(SPINE, BOOK.y, w, BOOK.h);
        else ctx.strokeRect(SPINE - w, BOOK.y, w, BOOK.h);
        ctx.restore();
      }

      // arrows
      const arrow = (a, dir, on) => {
        ctx.save();
        ctx.globalAlpha = on ? 1 : 0.3;
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = O();
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = O();
        ctx.beginPath();
        ctx.moveTo(a.x + dir * 4, a.y); ctx.lineTo(a.x - dir * 2.5, a.y - 4.5); ctx.lineTo(a.x - dir * 2.5, a.y + 4.5);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      };
      arrow(PREV, -1, this.page > 0);
      arrow(NEXT, 1, this.page < this.lastPage());

      // speaker button: reads the page aloud
      if (this.canSpeak()) {
        ctx.save();
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = O();
        ctx.fillStyle = this.speaking ? '#3cb371' : '#ffffff';
        ctx.beginPath(); ctx.arc(SPEAK.x, SPEAK.y, SPEAK.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = O();
        ctx.beginPath();
        ctx.moveTo(SPEAK.x - 5, SPEAK.y - 2); ctx.lineTo(SPEAK.x - 2.5, SPEAK.y - 2); ctx.lineTo(SPEAK.x + 1, SPEAK.y - 5);
        ctx.lineTo(SPEAK.x + 1, SPEAK.y + 5); ctx.lineTo(SPEAK.x - 2.5, SPEAK.y + 2); ctx.lineTo(SPEAK.x - 5, SPEAK.y + 2);
        ctx.closePath(); ctx.fill();
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(SPEAK.x + 1.5, SPEAK.y, 3, -0.8, 0.8); ctx.stroke();
        ctx.beginPath(); ctx.arc(SPEAK.x + 1.5, SPEAK.y, 5.2, -0.8, 0.8); ctx.stroke();
        ctx.restore();
        MP.drawText(ctx, 'Lue ääneen', SPEAK.x + 12, SPEAK.y - 4, { size: 0.65, color: O() });
      }

      MP.drawButton(ctx, 'Sulje', CLOSE, { size: 0.85, color: '#e0559a', shade: '#a8326c' });
    },
  };
})();
