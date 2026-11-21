// photos.js – the camera for holiday photos, and the saved photos.
// In the outdoor places a camera button sits in the top-right corner. Tap it:
// "Hymyile!", the character cheers, *klik*, a white flash, and the picture
// flies into the photo album (the album is on the little table in the living room).
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const KEY = 'matkapeli.photos';
  const MAX = 30;                    // the oldest photo goes away after this many
  const PW = 256, PH = 144;          // saved photo size in pixels (small, so the tablet doesn't fill up)
  const CAM = { x: 289, y: 11, r: 8 };
  const POSE_TIME = 0.6;             // "Hymyile!" before the click

  // Where the photo was taken: the name and a little sticker under the photo
  MP.PHOTO_PLACES = {
    street:   { name: 'Kotikatu', sticker: '🏡' },
    swim:     { name: 'Uima-allas', sticker: '🦆' },
    egypt:    { name: 'Egypti', sticker: '🐪' },
    pyramid:  { name: 'Pyramidin sisällä', sticker: '🏺' },
    thailand: { name: 'Thaimaa', sticker: '🐘' },
    newyork:  { name: 'New York', sticker: '🗽' },
    winter:   { name: 'Talvimaa', sticker: '⛄' },
  };

  // ---------- Saving ----------
  MP.photos = [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list)) MP.photos = list.filter((p) => p && typeof p.img === 'string');
  } catch (_) { /* no saved photos */ }

  MP.savePhotos = function () {
    // If the storage is full, let the oldest photos go until it fits
    while (true) {
      try {
        localStorage.setItem(KEY, JSON.stringify(MP.photos));
        return true;
      } catch (_) {
        if (MP.photos.length <= 1) return false;
        MP.photos.shift();
      }
    }
  };

  MP.deletePhoto = function (i) {
    MP.photos.splice(i, 1);
    MP.savePhotos();
  };

  // Ready-made pictures for drawing the photos
  const images = new Map();
  MP.photoImage = function (photo) {
    let im = images.get(photo.img);
    if (!im) {
      im = new Image();
      im.src = photo.img;
      images.set(photo.img, im);
    }
    return im.complete && im.naturalWidth ? im : null;
  };

  // ---------- Taking a photo ----------
  const sceneKey = (s) => Object.keys(MP.scenes).find((k) => MP.scenes[k] === s);
  const placeOf = (s) => MP.PHOTO_PLACES[sceneKey(s)] || null;
  let shot = null;     // { at, scene, done, doneAt, img }
  let shown = false;

  MP.photoHit = (x, y) => shown && Math.hypot(x - CAM.x, y - CAM.y) < CAM.r + 4;

  MP.photoTap = function (x, y) {
    if (!MP.photoHit(x, y)) return false;
    if (!shot) {
      MP.closeBubbles(MP.scene);
      shot = { at: MP.time, scene: MP.scene };
      MP.sfx.tap();
    }
    return true;
  };

  // The character cheers while the photo is taken
  MP.photoPose = () => !!shot && MP.time - shot.at < (shot.done ? shot.doneAt - shot.at + 0.4 : 9);

  function capture(scene) {
    const c = document.createElement('canvas');
    c.width = PW;
    c.height = PH;
    const g = c.getContext('2d');
    g.fillStyle = '#87c8f0';
    g.fillRect(0, 0, PW, PH);
    const W3 = MP.w3d;
    if (scene.transparent && W3 && W3.canvas && W3.canvas.style.display !== 'none') {
      g.drawImage(W3.canvas, 0, 0, PW, PH);
    }
    g.drawImage(MP.canvas, 0, 0, PW, PH);
    return c.toDataURL('image/jpeg', 0.75);
  }

  // Called by the engine every frame, right after the scene is drawn
  MP.photoAfterDraw = function (ctx, scene, fading) {
    const place = placeOf(scene);
    shown = !!place && !fading && !MP.restartAsk;
    if (shot && shot.scene !== scene) shot = null;      // left the place: no photo
    const t = MP.time;

    if (shot && !shot.done && t - shot.at >= POSE_TIME) {
      shot.done = true;
      shot.doneAt = t;
      try {
        const img = capture(scene);
        MP.photos.push({ img, place: sceneKey(scene), time: Date.now() });
        while (MP.photos.length > MAX) MP.photos.shift();
        MP.savePhotos();
        shot.img = new Image();
        shot.img.src = img;
        MP.sfx.shutter();
      } catch (_) {
        shot.failed = true;             // the browser did not allow it
      }
    }

    if (shot && !shot.done) {
      MP.drawText(ctx, 'Hymyile!', MP.W / 2, 22, { size: 1.6, color: '#ffe680', outline: MP.COLORS.outline, align: 'center' });
    }
    if (shot && shot.done) {
      const age = t - shot.doneAt;
      // white flash
      if (age < 0.35) {
        ctx.save();
        ctx.globalAlpha = 1 - age / 0.35;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, MP.W, MP.H);
        ctx.restore();
      }
      // the photo shrinks and flies to the camera button
      if (shot.img && shot.img.complete && age > 0.15 && age < 1.2) {
        const u = MP.clamp((age - 0.35) / 0.8, 0, 1);
        const e = u * u;
        const w = MP.lerp(150, 14, e), h = w * 9 / 16;
        const cx = MP.lerp(MP.W / 2, CAM.x, e), cy = MP.lerp(MP.H / 2 - 6, CAM.y, e);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.06 + e * 0.3);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = MP.COLORS.outline;
        ctx.lineWidth = 0.6;
        ctx.fillRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 10);
        ctx.strokeRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 10);
        ctx.drawImage(shot.img, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
      if (age > 0.3 && age < 2) {
        MP.drawText(ctx, shot.failed ? 'Kuva ei onnistunut.' : 'Kuva albumiin!', MP.W / 2, 22, {
          size: 1, color: '#ffffff', outline: MP.COLORS.outline, align: 'center',
        });
      }
      if (age > 2) shot = null;
    }

    if (shown) drawButton(ctx, t);
  };

  function drawButton(c, t) {
    const { x, y, r } = CAM;
    const busy = shot && !shot.done;
    c.save();
    c.lineWidth = 0.8;
    c.strokeStyle = MP.COLORS.outline;
    c.fillStyle = busy ? '#ffe680' : 'rgba(255,247,224,0.85)';
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.stroke();
    // a little camera
    c.lineWidth = 0.7;
    c.fillStyle = '#4a4a58';
    MP.roundRect(c, x - 5, y - 2.8, 10, 7, 1.4); c.fill(); c.stroke();
    MP.roundRect(c, x - 2, y - 4.4, 4, 2, 0.6); c.fill(); c.stroke();
    c.fillStyle = '#9fd8ff';
    c.beginPath(); c.arc(x, y + 0.7, 2.3, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#ff5f5f';
    c.beginPath(); c.arc(x + 3.6, y - 1.6, 0.6, 0, Math.PI * 2); c.fill();
    c.restore();
    void t;
  }

  // Draws one photo into the rect r (with a white border), or a grey box while it loads
  MP.drawPhoto = function (c, photo, r) {
    c.save();
    c.fillStyle = '#ffffff';
    c.strokeStyle = MP.COLORS.outline;
    c.lineWidth = 0.6;
    c.fillRect(r.x - 2.5, r.y - 2.5, r.w + 5, r.h + 5);
    c.strokeRect(r.x - 2.5, r.y - 2.5, r.w + 5, r.h + 5);
    const im = MP.photoImage(photo);
    if (im) c.drawImage(im, r.x, r.y, r.w, r.h);
    else { c.fillStyle = '#d9dde6'; c.fillRect(r.x, r.y, r.w, r.h); }
    c.restore();
  };
})();
