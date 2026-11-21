// lostthings.js – THE LOST THINGS game at home.
//   Every morning something has gone missing: a sock, the teddy, the TV remote,
//   the toothbrush or a shoe. "Voi ei, missä on minun ___?"
//   It is hidden somewhere in the house (under the bed, in the pet's basket,
//   behind the towel, on top of the lamp, in the fridge, in the cooking pot,
//   on the coat hooks, in the flower pot). Tap a place to look there.
//   After two wrong places (or a while) the pet sniffs and runs to the right
//   place – or to the stairs, if it is on the other floor.
//   Some things are needed for the morning tasks: the sock for dressing, the
//   toothbrush for brushing, the shoe before going out, the remote for the TV.
// The home scene (home.js) uses these helpers.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = () => MP.COLORS.outline;
  const DOWN = 180;     // the downstairs is drawn 180 lower (home.js)

  const ITEMS = {
    sock: { name: 'sukka', found: 'Sukka', needs: 'dress', need: 'Toinen sukka puuttuu! Ei voi pukeutua ennen kuin se löytyy.' },
    teddy: { name: 'nalle', found: 'Nalle', needs: null },
    remote: { name: 'kaukosäädin', found: 'Kaukosäädin', needs: 'tv', need: 'Missä on kaukosäädin? Telkkaria ei voi katsoa ilman sitä!' },
    toothbrush: { name: 'hammasharja', found: 'Hammasharja', needs: 'brush', need: 'Hammasharja on hukassa! Etsitään se ensin.' },
    shoe: { name: 'kenkä', found: 'Kenkä', needs: 'shoes', need: 'Toinen kenkä on hukassa! Ei voi lähteä ulos yhdellä kengällä.' },
  };
  // where things can hide: a rectangle to tap (world), where the thing peeks out, how it is said
  const PLACES = [
    { id: 'bed', floor: 0, x: 48, y: 138, w: 48, h: 14, px: 60, py: 150, where: 'sängyn alla', peek: 0.5 },
    { id: 'basket', floor: 0, x: 210, y: 134, w: 28, h: 18, px: 230, py: 146, where: 'lemmikin korissa', peek: 0.6, pet: true },
    { id: 'towel', floor: 0, x: 548, y: 86, w: 24, h: 30, px: 560, py: 114, where: 'pyyhkeen takana', peek: 0.4 },
    { id: 'lamp', floor: 1, x: 152, y: DOWN + 70, w: 28, h: 26, px: 166, py: DOWN + 80, where: 'lampun päällä', peek: 0.6 },
    { id: 'fridge', floor: 1, x: 340, y: DOWN + 110, w: 30, h: 40, px: 354, py: DOWN + 130, where: 'jääkaapissa', peek: 0 },
    { id: 'pot', floor: 1, x: 430, y: DOWN + 96, w: 20, h: 18, px: 440, py: DOWN + 102, where: 'kattilassa', peek: 0.5 },
    { id: 'hooks', floor: 1, x: 872, y: DOWN + 66, w: 40, h: 34, px: 898, py: DOWN + 86, where: 'naulakossa takin taskussa', peek: 0.5 },
    { id: 'plant', floor: 1, x: 10, y: DOWN + 112, w: 24, h: 40, px: 22, py: DOWN + 138, where: 'kukkaruukussa', peek: 0.5 },
  ];
  MP.LOST_PLACES = PLACES;

  // A new lost thing for this morning
  MP.lostPick = function () {
    const ids = Object.keys(ITEMS);
    const item = ids[Math.floor(Math.random() * ids.length)];
    const places = PLACES.filter((p) => !p.pet || MP.myPet());
    const place = places[Math.floor(Math.random() * places.length)].id;
    MP.state.lost = { item, place, found: false, wrong: 0, from: MP.time };
    return MP.state.lost;
  };
  MP.lostNow = () => (MP.state.lost && !MP.state.lost.found ? MP.state.lost : null);
  MP.lostItem = (id) => ITEMS[id];
  MP.lostPlace = (id) => PLACES.find((p) => p.id === id);
  // Is this task / thing blocked by the lost thing? Returns the text to say, or null.
  MP.lostBlocks = function (taskId) {
    const l = MP.lostNow();
    if (!l || ITEMS[l.item].needs !== taskId) return null;
    return ITEMS[l.item].need;
  };
  // The place at a tapped point on this floor (or null)
  MP.lostPlaceAt = function (wx, wy, floor) {
    if (!MP.lostNow()) return null;
    return PLACES.find((p) => p.floor === floor && (!p.pet || MP.myPet()) && MP.hit(p, wx, wy)) || null;
  };

  // Draws a lost thing (x, y = middle, s = size)
  MP.lostDrawItem = function (c, id, x, y, s) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.lineWidth = 0.7;
    c.strokeStyle = O();
    if (id === 'sock') {
      c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(-2, -5); c.lineTo(2, -5); c.lineTo(2, 1); c.quadraticCurveTo(5, 1, 5, 3.5); c.lineTo(-1, 3.5); c.quadraticCurveTo(-2.5, 3.5, -2, 1); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#e04848'; c.fillRect(-1.9, -4, 3.8, 1.2); c.fillRect(-1.9, -1.8, 3.8, 1.2);
    } else if (id === 'teddy') {
      MP.draw('teddy', c, 0, 5);
    } else if (id === 'remote') {
      c.fillStyle = '#2b2b33';
      MP.roundRect(c, -2.2, -5, 4.4, 10, 1.2); c.fill(); c.stroke();
      c.fillStyle = '#e04848'; c.beginPath(); c.arc(0, -3, 0.8, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#c9d3e6'; for (let i = 0; i < 3; i++) c.fillRect(-1.2, -1 + i * 1.6, 2.4, 0.9);
    } else if (id === 'toothbrush') {
      c.rotate(-0.5);
      c.fillStyle = '#4cc9f0'; MP.roundRect(c, -1, -5, 2, 10, 1); c.fill(); c.stroke();
      c.fillStyle = '#ffffff'; c.fillRect(-1.4, -7.5, 2.8, 2.5); c.strokeRect(-1.4, -7.5, 2.8, 2.5);
    } else if (id === 'shoe') {
      c.fillStyle = '#e04848';
      c.beginPath(); c.moveTo(-5, 2); c.lineTo(-5, -2); c.quadraticCurveTo(-3, -3, -1, -2); c.quadraticCurveTo(3, -1, 5, 1); c.lineTo(5, 2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ffffff'; c.fillRect(-5, 1.6, 10, 1);
    }
    c.restore();
  };

  // In world coordinates (inside the home's camera): the lost thing peeking out of its place
  MP.lostDrawPeek = function (c, t) {
    const l = MP.lostNow();
    if (!l) return;
    const p = MP.lostPlace(l.place);
    if (!p || !p.peek) return;
    c.save();
    c.beginPath();
    // only a bit of it shows
    c.rect(p.px - 8, p.py - 8 * p.peek - (p.id === 'lamp' ? 8 : 0), 16, 8 * p.peek + 2 + (p.id === 'lamp' ? 8 : 0));
    c.clip();
    MP.lostDrawItem(c, l.item, p.px + Math.sin(t * 2) * 0.3, p.py - (p.id === 'lamp' ? 4 : 0), 0.9);
    c.restore();
  };

  // The "what is lost" badge next to the morning checklist (screen coordinates)
  MP.lostDrawBadge = function (c, x, y, t) {
    const l = MP.lostNow();
    if (!l) return;
    c.save();
    c.lineWidth = 0.8; c.strokeStyle = O();
    c.fillStyle = 'rgba(255,250,235,0.92)';
    MP.roundRect(c, x, y, 30, 21, 5); c.fill(); c.stroke();
    c.restore();
    MP.lostDrawItem(c, l.item, x + 10, y + 10.5, l.item === 'teddy' ? 0.7 : 1);
    MP.drawText(c, '?', x + 23, y + 3 + Math.sin(t * 5) * 1, { size: 1, color: '#e0559a', align: 'center' });
  };
})();
