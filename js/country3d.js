// country3d.js – a kit for making a new 3D country quickly.
// A country file calls MP.makeCountry({...}) with its colors, the things to
// build, and what happens when you tap them. The kit does the rest:
// arriving by car, walking, the camera, speech bubbles, the hotel, the poster,
// the camera (photos), the hotel room, the airport and the passport stamp.
//
// The settings (all optional except id, name, build):
//   id, name            'australia', 'Australia'
//   to                  'Australiaan' (for "Tervetuloa Australiaan!")
//   city, time          on the departures board ('Sydney', '09:05')
//   flag(c, x, y, w, h) draws the flag
//   land                landscape name (register it with MP.LANDSCAPES[land])
//   sky, ground, fog    colors; fog = [color, near, far]
//   bounds              { minX, maxX, minZ, maxZ } where you can walk
//   start               { x, z } where you stand after arriving
//   car                 { at: {x, z}, color, name: 'Jeeppi', build(W) }
//   sign                { text, x, z }
//   hotel               { x, z, rot, look: {...}, room: {...} }  (room = hotel.js look)
//   airport             { title, hall, floor, plant }
//   photo               { name, sticker }
//   poster              { say }
//   stamp               { ink, pic(c) }    the picture in the passport stamp
//   welcome             the first thing you say
//   build(W, S, T)      build everything; tappable things: W.clickable(group, 'spotName')
//   spots               { spotName: { at: {x,z} or (scene) => {x,z}, use(scene, S),
//                         here: true  (use it right away, no walking) } }
//   hints               [{ x, z, r, say }]   said once when you walk near
//   enter(scene, S)     reset things when you arrive
//   update(scene, S, dt, now)
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const W3 = MP.w3d;

  MP.LANDSCAPES = MP.LANDSCAPES || {};

  // A repeating texture painted with canvas
  W3.texture = function (size, repeatX, repeatY, paint) {
    const T = window.THREE;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    paint(c.getContext('2d'), size);
    const tex = new T.CanvasTexture(c);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    return tex;
  };

  MP.makeCountry = function (cfg) {
    const id = cfg.id;
    const SPEED = cfg.speed || 3.4;
    const BOUNDS = cfg.bounds || { minX: -40, maxX: 40, minZ: -36, maxZ: 10 };
    const CAR = Object.assign({ at: { x: 5.5, z: 6.5 }, color: '#ffd23f', name: 'Taksi' }, cfg.car);
    const START = cfg.start || { x: CAR.at.x - 3.3, z: CAR.at.z - 2.3 };
    const S = { built: false, cfg };
    MP[id + '3d'] = S;               // (for testing)

    // ---- Everything around the country: the airport, photos, passport, hotel ----
    if (MP.DESTINATIONS && !MP.findDestination(id)) {
      const home = MP.DESTINATIONS.findIndex((d) => d.id === 'home');
      MP.DESTINATIONS.splice(home < 0 ? MP.DESTINATIONS.length : home, 0, {
        id, name: cfg.name, city: cfg.city || cfg.name, to: cfg.to || cfg.name + 'an',
        time: cfg.time || '12:00', scene: id, land: cfg.land || 'forest',
        flag: cfg.flag || ((c, x, y, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(x, y, w, h); }),
      });
    }
    if (cfg.airport && MP.AIRPORT_LOOKS) MP.AIRPORT_LOOKS[id] = Object.assign({ land: cfg.land, plant: 'leafy' }, cfg.airport);
    if (MP.PHOTO_PLACES) MP.PHOTO_PLACES[id] = cfg.photo || { name: cfg.name, sticker: '⭐' };
    if (cfg.stamp && MP.STAMP_ART) MP.STAMP_ART[id] = cfg.stamp;
    if (cfg.hotel && cfg.hotel.room && MP.HOTEL_LOOKS) MP.HOTEL_LOOKS[id] = Object.assign({ land: cfg.land }, cfg.hotel.room);
    if (cfg.poster && MP.COUNTRY_POSTERS) MP.COUNTRY_POSTERS.push(Object.assign({ id, land: cfg.land }, cfg.poster));

    function build() {
      W3.init();
      const T = window.THREE;
      S.scene = new T.Scene();
      S.scene.background = new T.Color(cfg.sky || '#8fd0f6');
      const fog = cfg.fog || ['#e6f6ff', 60, 190];
      S.scene.fog = new T.Fog(fog[0], fog[1], fog[2]);
      S.camera = new T.PerspectiveCamera(55, 16 / 9, 0.1, 320);
      S.scene.add(new T.HemisphereLight(0xffffff, cfg.hemiGround || 0xcfc09a, 0.85));
      const sun = new T.DirectionalLight(0xfff4dc, 0.65);
      sun.position.set(20, 50, 30);
      S.scene.add(sun);
      const W = W3.kit(S.scene);
      S.W = W;
      // the ground, with little specks so walking feels like moving
      const tex = W3.texture(256, 60, 60, (g, n) => {
        g.fillStyle = '#ffffff'; g.fillRect(0, 0, n, n);
        for (let i = 0; i < 700; i++) {
          g.fillStyle = ['rgba(0,0,0,0.07)', 'rgba(255,255,255,0.5)', 'rgba(0,0,0,0.04)'][i % 3];
          g.fillRect(Math.random() * n, Math.random() * n, 1 + Math.random() * 2, 1 + Math.random() * 2);
        }
      });
      const ground = new T.Mesh(new T.PlaneGeometry(500, 500), new T.MeshLambertMaterial({ color: cfg.ground || '#7cc56b', map: tex }));
      ground.rotation.x = -Math.PI / 2;
      W.add(ground);
      // a few soft clouds far away
      for (let i = 0; i < 6; i++) {
        const cl = new T.Group();
        for (let k = 0; k < 4; k++) W.ball(2 + Math.random(), '#ffffff', k * 2.2, Math.random(), 0, cl);
        cl.position.set(-80 + i * 32, 30 + (i % 2) * 6, -120 - (i % 3) * 20);
        W.add(cl);
      }

      cfg.build(W, S, T);

      // the car that brings you here (front toward -x)
      S.car = CAR.build ? W.add(CAR.build(W)) : W.taxi(CAR.color);
      S.car.position.set(CAR.at.x, 0, CAR.at.z);
      W.block(CAR.at.x, CAR.at.z, 4, 2);
      W.clickable(S.car, 'taxi');
      if (cfg.sign) {
        W.cyl(0.1, 2.6, '#8a6a45', cfg.sign.x, 0, cfg.sign.z);
        W.sign(cfg.sign.text, cfg.sign.x, 2.4, cfg.sign.z, 0, '#fff7e0', '#2b2340', null, 2.6);
        W.block(cfg.sign.x, cfg.sign.z, 0.4, 0.4);
      }
      if (cfg.hotel) S.hotel = W.hotel(cfg.hotel.x, cfg.hotel.z, cfg.hotel.rot || 0, cfg.hotel.look || {});
      S.ch = W3.character(S.scene);
      S.built = true;
    }

    const scene = {
      transparent: true,

      enter(params) {
        if (!S.built) build();
        W3.show();
        this.p = { x: START.x, z: START.z, heading: 0 };
        this.camHeading = 0;
        this.camDist = this.camHeight = null;
        this.target = null;
        this.onArrive = null;
        this.walking = false;
        this.walkTime = 0;
        this.seen = {};
        this.leaving = null;
        this.bubble = null;
        this.y = 0;                     // how high the character stands (e.g. on a surfboard)
        S.car.position.set(CAR.at.x, 0, CAR.at.z);
        this.arrive = { t: 0 };
        S.ch.setVisible(false);
        if (cfg.enter) cfg.enter(this, S);
        // waking up in the hotel: out of the door, back to the trip
        if (params && params.from === 'hotel' && S.hotel) {
          const d = S.hotel.door;
          this.p = { x: d.x, z: d.z, heading: d.heading + Math.PI };
          this.camHeading = this.p.heading;
          this.arrive = null;
          S.ch.setVisible(true);
          this.say(cfg.morning || 'Hyvää huomenta, ' + cfg.name + '!', 3, 0.5);
        }
      },

      exit() {
        W3.hide();
      },

      say(text, seconds, delay) {
        this.bubble = { text, from: MP.time + (delay || 0), until: Infinity };   // stays until the next tap
      },

      walkTo(x, z, onArrive) {
        W3.walkTo(this, BOUNDS, x, z, onArrive);
      },

      stand(spot) {
        if (spot === 'hotel') return S.hotel ? S.hotel.door : null;
        if (spot === 'taxi') return { x: CAR.at.x - 1, z: CAR.at.z - 1.9 };
        const sp = cfg.spots && cfg.spots[spot];
        if (!sp) return null;
        if (sp.here) return { x: this.p.x, z: this.p.z };
        return typeof sp.at === 'function' ? sp.at(this, S) : sp.at;
      },

      use(spot) {
        if (spot === 'hotel') {
          this.say('Hotelli! Mennään sisään.', 1.5);
          MP.sfx.bling();
          MP.goTo(MP.scenes.hotel, { country: id });
          return;
        }
        if (spot === 'taxi') {
          this.leaving = { t: 0 };
          S.ch.setVisible(false);
          this.say(CAR.name + ', lentokentälle kiitos!', 2.2);
          MP.sfx.bling();
          return;
        }
        const sp = cfg.spots && cfg.spots[spot];
        if (sp && sp.use) sp.use(this, S);
      },

      onTap(x, y) {
        if (this.arrive || this.leaving || MP.isFading()) return;
        if (cfg.onTap && cfg.onTap(this, S, x, y)) return;
        if (W3.hitTurn(x, y)) {
          this.target = null;
          this.p.heading += Math.PI;
          MP.sfx.tap();
          return;
        }
        W3.tap(this, x, y, S.camera, S.W, BOUNDS, (spot) => {
          const sp = cfg.spots && cfg.spots[spot];
          if (sp && sp.here) { this.use(spot); return true; }
          const st = this.stand(spot);
          if (!st) return false;
          MP.sfx.tap();
          this.walkTo(st.x, st.z, () => this.use(spot));
          return true;
        });
      },

      update(dt) {
        const p = this.p;
        const now = MP.time;

        // --- The car arriving / leaving ---
        if (this.arrive) {
          this.arrive.t += dt;
          const u = MP.clamp(this.arrive.t / 2, 0, 1);
          S.car.position.x = CAR.at.x + 40 * (1 - u) * (1 - u);
          if (this.arrive.t > 2.3) {
            this.arrive = null;
            S.ch.setVisible(true);
            MP.sfx.bling();
            const poster = MP.collectPoster(id) ? ' Sain julisteen omaan huoneeseeni!' : '';
            this.say((cfg.welcome || 'Tervetuloa ' + (cfg.to || cfg.name) + '!') + poster, 4.5);
          }
        }
        if (this.leaving) {
          this.leaving.t += dt;
          const t = Math.max(0, this.leaving.t - 0.8);
          S.car.position.x = CAR.at.x - t * t * 6;
          if (this.leaving.t > 2.6 && !this.leaving.gone) {
            this.leaving.gone = true;
            MP.goTo(MP.scenes.airport, { country: id });
          }
        }

        if (!this.arrive && !this.leaving && !this.frozen) W3.walkStep(this, dt, SPEED, S.W.obstacles);
        else this.walking = false;

        if (cfg.update) cfg.update(this, S, dt, now);

        // --- Walking near places: said once ---
        if (!this.arrive && cfg.hints) {
          cfg.hints.forEach((h, i) => {
            if (!this.seen[i] && Math.hypot(p.x - h.x, p.z - h.z) < (h.r || 4)) {
              this.seen[i] = true;
              this.say(h.say, 3);
            }
          });
        }

        W3.follow(S.camera, this, dt, this.camDistWanted, this.camHeightWanted);
        this.headPos = S.ch.draw(p.x, this.y || 0, p.z, Object.assign({ walking: this.walking, walkTime: this.walkTime }, this.pose || {}));
        if (this.leaving || this.arrive) this.headPos = S.car.position.clone().setY(2.6);
        W3.render(S.scene, S.camera);
      },

      draw(ctx) {
        if (cfg.draw2d) cfg.draw2d(ctx, this, S);
        W3.drawBubble(ctx, this.bubble, this.headPos, S.camera);
        if (!this.arrive && !this.leaving) W3.drawTurnButton(ctx);
      },
    };
    MP.scenes[id] = scene;
    return scene;
  };
})();
