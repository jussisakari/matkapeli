// main.js – starts the game.
//
// SHORTCUTS while developing: add one of these to the end of the address,
// e.g. index.html#ulos
//   #ulos         straight outside (dressed, shoes on)
//   #koti         the house, alarm clock ringing
//   #hampaat      tooth brushing
//   #hiukset      hair brushing (girl)
//   #vaatekaappi  the wardrobe
//   #aamupala     breakfast
//   #leivonta     baking pulla or a cake
//   #synttarit    the birthday party
//   #muistipeli   the memory card game
//   #lentokentta  the airport (choose where to fly)
//   #lento        the flight animation to Egypt
//   #egypti       Egypt, the taxi just arrived
//   #talvimaa     Talvimaa (Winter Land), the taxi just arrived
//   #iglu         inside the igloo in Talvimaa (and the penguin game)
//   #thaimaa      Thailand's beach, the tuk-tuk just arrived
//   #temppeli     inside the golden temple in Thailand
//   #huvipuisto   the theme park in Thailand
//   #newyork      New York, the taxi just arrived
//   #mummi        visiting Mummi and Ukki in the New York skyscraper
//   #paamaja      the superheroes' headquarters in New York (in the spider suit)
//   #australia    Australia, the jeep just arrived
//   #japani       Japan, the bullet train just arrived
//   #belgia       Belgium, the taxi just arrived
//   #kiina        China, the taxi just arrived
//   #ranska       France, the taxi just arrived
//   #ilta         home in the evening (evening tasks, then bed)
//   #hotelli      a hotel room in Thailand (sleep one night)
//   #uima         swimming in the pool (swimsuit on)
//   #kasvimaa     our own garden (one box ready to pick, one flowering)
//   #helsinki     bus 67 to Helsinki city centre (and Janne Kataja)
//   #koulu        the school and the math lesson
//   #ajelu        a drive in the family car (it turns into a boat)
//   #rauta        outside in the Iron hero suit (tap the suit: fly)
//   #hamahakki    outside in the spider suit (tap the suit: web)
//   #lemmikki     home in the morning with a pet (a kitten if none chosen yet)
//   #albumi       the photo album
//   #passi        the passport (with the Egypt stamp for testing)
//   #konsertti    the Turpapojat concert (a memory from the poster)
//   #iltakatu     back on the home street in the evening (after a trip)
//   #pyramidi     inside the pyramid
//   #labyrintti   the labyrinth under Ramses II's temple
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
    hiukset:     () => { MP.state.character = 'girl'; MP.state.hairMessy = true; return [MP.scenes.hairbrush]; },
    vaatekaappi: () => { ready(false); return [MP.scenes.wardrobe]; },
    aamupala:    () => { ready(false); return [MP.scenes.breakfast]; },
    leivonta:    () => { ready(false); return [MP.scenes.baking]; },
    synttarit:   () => { ready(false); return [MP.scenes.party]; },
    muistipeli:  () => { ready(false); return [MP.scenes.memory]; },
    lentokentta: () => { ready(true); return [MP.scenes.airport, { country: 'home' }]; },
    lento:       () => { ready(true); return [MP.scenes.flight, { from: 'home', to: 'egypt' }]; },
    egypti:      () => { ready(true); return [MP.scenes.egypt]; },
    talvimaa:    () => { ready(true); return [MP.scenes.winter]; },
    iglu:        () => { ready(true); return [MP.scenes.igloo]; },
    thaimaa:     () => { ready(true); return [MP.scenes.thailand]; },
    huvipuisto:  () => { ready(true); MP.state.outfit.hat = 'cap'; return [MP.scenes.themepark]; },
    temppeli:    () => { ready(true); MP.state.outfit.hat = 'sunhat'; return [MP.scenes.temple]; },
    newyork:     () => { ready(true); return [MP.scenes.newyork]; },
    paamaja:     () => { ready(true); MP.state.outfit.costume = 'spider'; return [MP.scenes.hq]; },
    mummi:       () => { ready(true); return [MP.scenes.grandparents]; },
    australia:   () => { ready(true); return [MP.scenes.australia]; },
    japani:      () => { ready(true); return [MP.scenes.japan]; },
    belgia:      () => { ready(true); return [MP.scenes.belgium]; },
    kiina:       () => { ready(true); return [MP.scenes.china]; },
    ranska:      () => { ready(true); return [MP.scenes.france]; },
    ilta:        () => { ready(true); return [MP.scenes.home, { quest: 'evening' }]; },
    hotelli:     () => { ready(true); return [MP.scenes.hotel, { country: 'thailand' }]; },
    uima:        () => { ready(true); MP.state.outfit.costume = 'swimsuit'; return [MP.scenes.swim]; },
    ajelu:       () => { ready(true); return [MP.scenes.drive]; },
    koulu:       () => { ready(true); return [MP.scenes.school]; },
    helsinki:    () => { ready(true); return [MP.scenes.helsinki]; },
    kasvimaa:    () => { ready(true); MP.state.garden = MP.state.garden || [{ seed: 'strawberry', stage: 4, watered: true }, { seed: 'sunflower', stage: 3, watered: false }, { seed: null, stage: 0, watered: false }]; return [MP.scenes.garden]; },
    rauta:       () => { ready(true); MP.state.outfit.costume = 'iron'; return [MP.scenes.street]; },
    hamahakki:   () => { ready(true); MP.state.outfit.costume = 'spider'; return [MP.scenes.street]; },
    lemmikki:    () => { ready(false); MP.state.pet = MP.state.pet || { kind: 'cat', name: 'Mirri' }; return [MP.scenes.home]; },
    albumi:      () => [MP.scenes.album],
    passi:       () => { ready(false); MP.addStamp('egypt'); return [MP.scenes.passport]; },
    iltakatu:    () => { ready(true); MP.state.dusk = true; return [MP.scenes.street, { from: 'taxi' }]; },
    konsertti:   () => { ready(false); return [MP.scenes.concert]; },
    pyramidi:    () => { ready(true); return [MP.scenes.pyramid]; },
    labyrintti:  () => { ready(true); return [MP.scenes.labyrinth]; },
    kirjat:      () => { ready(false); return [MP.scenes.books]; },
    galleria:    () => [MP.scenes.gallery],
  };

  const pick = shortcuts[hash] ? shortcuts[hash]() : [MP.scenes.start];
  MP.start(pick[0], pick[1]);
})();
