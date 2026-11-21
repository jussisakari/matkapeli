// main.js – starts the game.
//
// SHORTCUTS while developing: add one of these to the end of the address,
// e.g. index.html#ulos
//   #ulos         straight outside (dressed, shoes on)
//   #koti         the house, alarm clock ringing
//   #hampaat      tooth brushing
//   #vaatekaappi  the wardrobe
//   #aamupala     breakfast
//   #egypti       Egypt, the taxi just arrived
//   #pyramidi     inside the pyramid
//   #kirjat       the bookshelf
//   #galleria     all drawings and outfits
window.MP = window.MP || {};

(function () {
  MP.load();
  const hash = location.hash.replace('#', '').toLowerCase();

  // Shortcuts need a character and clothes even if nobody chose them yet
  function ready(dressed) {
    if (!MP.state.character) MP.state.character = 'girl';
    if (dressed) {
      const o = MP.state.outfit;
      if (!o.shirt || o.shirt === 'pyjama') o.shirt = 'red';
      if (!o.bottom || o.bottom === 'pyjama') o.bottom = 'jeans';
      o.hat = o.hat || 'none';
      o.costume = o.costume || 'none';
      o.shoes = true;
    }
  }

  const shortcuts = {
    ulos:        () => { ready(true); return [MP.scenes.street]; },
    koti:        () => { ready(false); MP.state.outfit = { shirt: 'pyjama', bottom: 'pyjama', hat: 'none', costume: 'none', shoes: false }; return [MP.scenes.home, { quest: 'wake' }]; },
    hampaat:     () => { ready(false); return [MP.scenes.brush]; },
    vaatekaappi: () => { ready(false); return [MP.scenes.wardrobe]; },
    aamupala:    () => { ready(false); return [MP.scenes.breakfast]; },
    egypti:      () => { ready(true); return [MP.scenes.egypt]; },
    pyramidi:    () => { ready(true); return [MP.scenes.pyramid]; },
    kirjat:      () => { ready(false); return [MP.scenes.books]; },
    galleria:    () => [MP.scenes.gallery],
  };

  const pick = shortcuts[hash] ? shortcuts[hash]() : [MP.scenes.start];
  MP.start(pick[0], pick[1]);
})();
