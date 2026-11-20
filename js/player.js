// player.js – the character the player moves: tap-to-walk left and right,
// walking animation and facing direction.
window.MP = window.MP || {};

MP.Player = class {
  constructor(x, opts) {
    opts = opts || {};
    this.x = x;
    this.targetX = x;
    this.speed = opts.speed || 75;   // game units per second
    this.minX = opts.minX != null ? opts.minX : 10;
    this.maxX = opts.maxX != null ? opts.maxX : MP.W - 10;
    this.facing = 1;                 // 1 = right, -1 = left
    this.walking = false;
    this.walkTime = 0;
    this.onArrive = null;
  }

  // Walk to x. onArrive() is called when the character gets there.
  walkTo(x, onArrive) {
    this.targetX = MP.clamp(x, this.minX, this.maxX);
    this.onArrive = onArrive || null;
    if (Math.abs(this.targetX - this.x) < 0.5) {
      this.x = this.targetX;
      this.walking = false;
      this.arrive();
    }
  }

  stop() {
    this.targetX = this.x;
    this.walking = false;
    this.onArrive = null;
  }

  // Jump straight to a place (no walking)
  place(x, facing) {
    this.x = this.targetX = MP.clamp(x, this.minX, this.maxX);
    this.walking = false;
    this.onArrive = null;
    if (facing) this.facing = facing;
  }

  arrive() {
    const cb = this.onArrive;
    this.onArrive = null;
    if (cb) cb();
  }

  update(dt) {
    const d = this.targetX - this.x;
    if (Math.abs(d) < 0.5) return;
    this.walking = true;
    this.facing = d > 0 ? 1 : -1;
    this.walkTime += dt;
    const step = Math.min(Math.abs(d), this.speed * dt);
    this.x += Math.sign(d) * step;
    if (Math.abs(this.targetX - this.x) < 0.5) {
      this.x = this.targetX;
      this.walking = false;
      this.arrive();
    }
  }

  // floorY = where the feet are. camX = how far the camera has scrolled.
  draw(ctx, floorY, camX) {
    MP.drawPerson(ctx, this.x - (camX || 0), floorY, {
      walking: this.walking,
      walkTime: this.walkTime,
      flip: this.facing < 0,
    });
  }
};
