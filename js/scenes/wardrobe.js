// wardrobe.js – choosing clothes.
// Tabs on the left: hat, shirt, pants/skirt, costumes. Tap a card on the right
// to put it on. A costume is one whole outfit; choosing a hat, shirt or pants
// takes the costume off again. "Valmis!" goes back to the house.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;

  const TABS = [
    { id: 'hat',     name: 'Hattu' },
    { id: 'shirt',   name: 'Paita' },
    { id: 'bottom',  name: 'Housut / hame' },
    { id: 'costume', name: 'Asut' },
  ];
  const tabRect = (i) => ({ x: 4, y: 6 + i * 35, w: 76, h: 30 });
  const doneButton = { x: 4, y: 148, w: 76, h: 26 };
  // Cards on the right: 2 columns, or 3 narrower ones when there are many things
  const cardRect = (i, n) => (n > 8
    ? { x: 196 + (i % 3) * 41, y: 5 + Math.floor(i / 3) * 43, w: 39, h: 40 }
    : { x: 200 + (i % 2) * 60, y: 5 + Math.floor(i / 2) * 43, w: 56, h: 40 });
  const ME = { x: 140, y: 172, scale: 2.5 };   // the big character
  const PRAISE = ['Hieno!', 'Tosi siisti!', 'Upea!', 'Näyttää hyvältä!', 'Jee!'];

  // The items in a tab (pyjamas are hidden – they are taken off here)
  // In the evening the pyjamas are in the wardrobe too
  function items(tab) {
    const gifts = (MP.state.treasures && MP.state.treasures.gifts) || {};
    return MP.CLOTHES[tab].filter((it) => (!it.hidden || MP.state.evening) && (!it.gift || gifts[it.id])
      && (!it.season || (MP.isSnowy && MP.isSnowy()))            // the snowsuit only in winter
      && (!it.weather || (MP.isRainDay && MP.isRainDay())));          // the raincoat only on rainy days
  }

  function itemName(tab, it) {
    if (tab === 'costume' && it.id === 'none') return 'Ei asua';
    return it.name;
  }

  MP.scenes.wardrobe = {
    enter() {
      const o = MP.state.outfit;
      if (!o.hat) o.hat = 'none';
      if (!o.costume) o.costume = 'none';
      this.tab = o.costume !== 'none' ? 'costume' : 'shirt';
      this.hopAt = -10;
      this.sparkles = [];
      this.leaving = false;
      if (MP.state.evening) {
        this.tab = 'shirt';
        this.say('Iltapyjama päälle! Valitse pyjamapaita ja pyjamahousut.', 3);
      } else {
        this.say('Valitse vaatteet!', 3);
      }
    },

    say(text, seconds) {
      this.bubble = { text, from: MP.time, until: Infinity };   // stays until the next tap
    },

    // The outfit the character would have with this item on
    preview(tab, id) {
      const o = Object.assign({}, MP.state.outfit);
      if (tab === 'costume') {
        o.costume = id;
      } else {
        o[tab] = id;
        o.costume = 'none';
      }
      return o;
    },

    isWorn(tab, id) {
      const o = MP.state.outfit;
      if (tab === 'costume') return (o.costume || 'none') === id;
      return o.costume === 'none' && (o[tab] || (tab === 'hat' ? 'none' : null)) === id;
    },

    putOn(tab, id) {
      Object.assign(MP.state.outfit, this.preview(tab, id));
      MP.sfx.tap();
      this.hopAt = MP.time;
      this.say(PRAISE[Math.floor(Math.random() * PRAISE.length)], 1.4);
      for (let i = 0; i < 5; i++) {
        this.sparkles.push({
          x: ME.x + (Math.random() - 0.5) * 60, y: 70 + Math.random() * 90,
          born: MP.time + i * 0.06, r: 3 + Math.random() * 3,
        });
      }
    },

    onTap(x, y) {
      if (this.leaving) return;
      TABS.forEach((tb, i) => {
        if (MP.hit(tabRect(i), x, y) && this.tab !== tb.id) {
          this.tab = tb.id;
          MP.sfx.tap();
        }
      });
      const list = items(this.tab);
      list.forEach((it, i) => {
        if (MP.hit(cardRect(i, list.length), x, y)) this.putOn(this.tab, it.id);
      });
      if (MP.hit(doneButton, x, y)) {
        const o = MP.state.outfit;
        const pyjamas = o.costume === 'none' && (o.shirt === 'pyjama' || !o.shirt || o.bottom === 'pyjama' || !o.bottom);
        const inPyjamas = o.costume === 'none' && o.shirt === 'pyjama' && o.bottom === 'pyjama';
        if (MP.state.evening) {
          if (!inPyjamas) {
            this.say('Illalla puetaan pyjama! Valitse pyjamapaita ja pyjamahousut.', 3);
            MP.sfx.boing();
            return;
          }
        } else if (pyjamas) {
          this.say('Pyjama on vielä päällä! Valitse paita ja housut.', 3);
          MP.sfx.boing();
          return;
        }
        MP.save();
        MP.sfx.bling();
        this.say('Valmista!', 1.5);
        this.leaving = true;
        this.leaveAt = MP.time + 0.9;
      }
    },

    update() {
      this.sparkles = this.sparkles.filter((s) => MP.time - s.born < 0.9);
      if (this.leaving && MP.time >= this.leaveAt && !this.left) {
        this.left = true;
        MP.goTo(MP.scenes.home, { done: MP.state.evening ? 'pyjama' : 'dress' });
      }
    },

    exit() {
      this.left = false;
    },

    // Shows one item on a card: zoomed to the part of the body that changes
    drawCard(ctx, tab, it, r) {
      const worn = this.isWorn(tab, it.id);
      ctx.save();
      ctx.lineWidth = worn ? 2.2 : 0.8;
      ctx.strokeStyle = worn ? '#3cb371' : O();
      ctx.fillStyle = worn ? '#effbf2' : '#fffaf0';
      MP.roundRect(ctx, r.x, r.y, r.w, r.h, 5);
      ctx.fill();
      ctx.stroke();
      // picture
      ctx.beginPath();
      ctx.rect(r.x + 1, r.y + 1, r.w - 2, r.h - 10);
      ctx.clip();
      const cx = r.x + r.w / 2, cy = r.y + 15;
      const o = this.preview(tab, it.id);
      const zoom = { hat: [1.5, 46], shirt: [1.5, 27], bottom: [1.5, 12], costume: [0.72, 16] }[tab];
      MP.drawPerson(ctx, cx, cy + zoom[1], { outfit: o, scale: zoom[0] });
      ctx.restore();
      const name = itemName(tab, it);
      MP.drawText(ctx, name, cx, r.y + r.h - 8.5, {
        size: r.w < 50 ? (name.length > 9 ? 0.36 : 0.46) : (name.length > 11 ? 0.46 : 0.58), color: O(), align: 'center',
      });
    },

    draw(ctx) {
      const W = MP.W, H = MP.H, t = MP.time;

      // Inside the child's room: wooden wall, rug
      ctx.fillStyle = '#e9c9a0';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(160,100,60,0.18)';
      for (let x = 0; x < W; x += 16) ctx.fillRect(x, 0, 8, H);
      ctx.fillStyle = '#c084fc';
      ctx.beginPath(); ctx.ellipse(ME.x, ME.y + 2, 46, 6, 0, 0, Math.PI * 2); ctx.fill();

      // Big mirror behind the character
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = O();
      ctx.fillStyle = MP.COLORS.gold;
      ctx.beginPath(); ctx.ellipse(ME.x, 104, 50, 70, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d4efff';
      ctx.beginPath(); ctx.ellipse(ME.x, 104, 45, 65, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(ME.x - 30, 70); ctx.lineTo(ME.x - 18, 52); ctx.stroke();
      ctx.restore();

      // The character (hops a little when something new is put on)
      const u = (t - this.hopAt) / 0.35;
      const hop = u >= 0 && u < 1 ? -Math.sin(u * Math.PI) * 6 : 0;
      MP.drawPerson(ctx, ME.x, ME.y + hop, { scale: ME.scale });

      for (const s of this.sparkles) {
        const age = t - s.born;
        if (age < 0) continue;
        MP.draw('sparkle', ctx, s.x, s.y, { r: s.r * Math.sin(MP.clamp(age / 0.9, 0, 1) * Math.PI) + 0.01 });
      }

      // Tabs
      TABS.forEach((tb, i) => {
        const r = tabRect(i);
        const on = this.tab === tb.id;
        ctx.save();
        ctx.lineWidth = on ? 1.6 : 0.8;
        ctx.strokeStyle = O();
        ctx.fillStyle = on ? '#ffd23f' : '#fff7e0';
        MP.roundRect(ctx, r.x, r.y, r.w, r.h, 6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        MP.drawText(ctx, tb.name, r.x + r.w / 2, r.y + r.h / 2 - 4.5, {
          size: tb.name.length > 8 ? 0.82 : 1.05, color: O(), align: 'center',
        });
      });

      // Cards for the open tab
      const list = items(this.tab);
      list.forEach((it, i) => this.drawCard(ctx, this.tab, it, cardRect(i, list.length)));

      MP.drawButton(ctx, 'Valmis!', doneButton, { size: 1.15 });

      // Speech bubble
      if (this.bubble && t < this.bubble.until) {
        MP.drawBubble(ctx, this.bubble.text, ME.x, 63 + hop, { maxWidth: 100 });
      }
    },
  };
})();
