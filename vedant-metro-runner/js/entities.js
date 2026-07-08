/**
 * entities.js
 * Player, the police-dad Chaser, Obstacles, Coins and PowerUps.
 * Everything moving in the world shares the same depth (z) convention
 * from utils.js: z=0 is at the horizon, z=1 is at the player.
 */

// Which action clears which obstacle type.
const OBSTACLE_RULES = {
  cone: "jump",
  crate: "jump",
  barrier: "jump",
  bench: "jump",
  gate: "slide",
  pole: "dodge",   // full lane block - must be in a different lane
  train: "dodge"
};
const JUMP_OBSTACLES = Object.keys(OBSTACLE_RULES).filter((k) => OBSTACLE_RULES[k] === "jump");
const SLIDE_OBSTACLES = Object.keys(OBSTACLE_RULES).filter((k) => OBSTACLE_RULES[k] === "slide");
const DODGE_OBSTACLES = Object.keys(OBSTACLE_RULES).filter((k) => OBSTACLE_RULES[k] === "dodge");

class Player {
  constructor() {
    this.lane = CONFIG.PLAYER_START_X_LANE;
    this.targetLane = this.lane;
    this.x = Utils.laneXAtZ(this.lane, 1);
    this.y = 0; // jump offset (negative = up)
    this.vy = 0;
    this.state = "run"; // run | jump | slide | hit | dead
    this.slideTimer = 0;
    this.invulnTimer = 0;
    this.animT = 0;
    this.frameGlobalRef = 0;

    // power-up timers (ms remaining)
    this.powerups = { magnet: 0, speed: 0, shield: 0, sneaker: 0 };
  }

  get isSliding() {
    return this.state === "slide";
  }
  get isJumping() {
    return this.state === "jump";
  }
  get isInvulnerable() {
    return this.invulnTimer > 0;
  }

  moveLeft() {
    if (this.state === "dead") return;
    this.targetLane = Utils.clamp(this.targetLane - 1, 0, CONFIG.LANE_COUNT - 1);
  }
  moveRight() {
    if (this.state === "dead") return;
    this.targetLane = Utils.clamp(this.targetLane + 1, 0, CONFIG.LANE_COUNT - 1);
  }
  jump() {
    if (this.state === "dead" || this.isJumping) return;
    if (this.isSliding) this.slideTimer = 0;
    const mult = this.powerups.sneaker > 0 ? CONFIG.SNEAKER_JUMP_MULT : 1;
    this.vy = CONFIG.JUMP_VELOCITY * mult;
    this.state = "jump";
    Audio.jump();
  }
  slide() {
    if (this.state === "dead" || this.isJumping) return;
    this.state = "slide";
    this.slideTimer = CONFIG.SLIDE_DURATION_MS;
    Audio.slide();
  }

  // Returns true if the hit is fatal (game over), false if the player was
  // protected (recent-hit grace period, or a shield charge was consumed).
  hit() {
    if (this.isInvulnerable) return false;
    if (this.powerups.shield > 0) {
      this.powerups.shield = 0; // shield is single-use: gone after one hit
      this.invulnTimer = CONFIG.HIT_INVULN_MS;
      Audio.shieldBreak();
      return false;
    }
    this.state = "hit";
    this.invulnTimer = CONFIG.HIT_INVULN_MS;
    Audio.crash();
    return true;
  }

  addPowerup(kind) {
    const durations = {
      magnet: CONFIG.MAGNET_DURATION,
      speed: CONFIG.SPEED_BOOST_DURATION,
      shield: CONFIG.SHIELD_DURATION,
      sneaker: CONFIG.SNEAKER_DURATION
    };
    this.powerups[kind] = durations[kind];
    Audio.powerup();
  }

  update(dt) {
    this.animT += dt * 0.01;
    this.lane = Utils.lerp(this.lane, this.targetLane, Math.min(1, dt / 90));

    // Jump physics
    if (this.state === "jump") {
      this.vy += CONFIG.GRAVITY * (dt / 16.67);
      this.y += this.vy * (dt / 16.67);
      if (this.y >= 0) {
        this.y = 0;
        this.vy = 0;
        this.state = "run";
      }
    }

    if (this.state === "slide") {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.state = "run";
    }

    if (this.state === "hit") {
      // Brief stumble animation, then resume running (invuln stays on for a bit)
      this.invulnTimer -= dt;
      if (this.invulnTimer <= 600) this.state = "run";
    } else if (this.invulnTimer > 0) {
      this.invulnTimer -= dt;
    }

    Object.keys(this.powerups).forEach((k) => {
      if (this.powerups[k] > 0) this.powerups[k] = Math.max(0, this.powerups[k] - dt);
    });

    this.x = Utils.laneXAtZ(this.lane, 1);
  }

  getHitbox() {
    const w = this.isSliding ? 34 : 26;
    const h = this.isSliding ? 22 : 46;
    const groundY = CONFIG.GROUND_Y + this.y;
    return { x: this.x - w / 2, y: groundY - h, w, h };
  }

  draw(ctx) {
    const flashing = this.invulnTimer > 0 && Math.floor(this.animT * 10) % 2 === 0;
    if (flashing && this.state !== "hit") ctx.globalAlpha = 0.5;
    const groundY = CONFIG.GROUND_Y + this.y;
    Sprites.drawVedant(ctx, this.x, groundY, 1.05, this.state, this.animT * 60);
    ctx.globalAlpha = 1;

    if (this.powerups.shield > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(79,212,122,0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, groundY - 28, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

/** The comedic police-officer dad, always a step behind Vedant. */
class Chaser {
  constructor() {
    this.z = CONFIG.CHASER_BASE_Z;
    this.baseZ = CONFIG.CHASER_BASE_Z; // resting gap - creeps closer the longer the run goes
    this.lane = CONFIG.PLAYER_START_X_LANE;
    this.animT = 0;
    this.shoutTimer = 0;
  }

  reactToNearMiss() {
    // Comic lunge forward when Vedant barely dodges something (or a shield
    // soaks a hit). Capped just shy of 1 so it can still combine with a
    // high baseZ late-run to flirt with an actual catch.
    this.z = Math.min(0.99, this.z + 0.05);
    this.shoutTimer = 700;
  }

  reactToHit() {
    this.z = Math.min(0.99, this.z + 0.09);
    this.shoutTimer = 900;
  }

  update(dt, player, speedMult, elapsedSec) {
    this.animT += dt * 0.01 * speedMult;
    this.lane = Utils.lerp(this.lane, player.lane, Math.min(1, dt / 260));
    // Dad never gives up: the resting gap slowly shrinks the longer the
    // chase goes, so a very long run gets genuinely nerve-wracking even
    // without any near misses.
    this.baseZ = Math.min(0.93, CONFIG.CHASER_BASE_Z + elapsedSec * 0.0009);
    if (this.z > this.baseZ) this.z -= CONFIG.CHASER_LUNGE_RECOVER * (dt / 16.67);
    if (this.shoutTimer > 0) this.shoutTimer -= dt;
  }

  hasCaughtPlayer() {
    return this.z >= CONFIG.CHASER_CATCH_Z;
  }

  draw(ctx) {
    const x = Utils.laneXAtZ(this.lane, this.z);
    const y = Utils.screenYAtZ(this.z);
    const scale = Utils.scaleAtZ(this.z) * 1.05;
    Sprites.drawPoliceDad(ctx, x, y, scale, this.animT * 60, this.shoutTimer > 0);
  }
}

class WorldObject {
  constructor(lane, z) {
    this.lane = lane;
    this.z = z;
    this.dead = false;
  }
  get x() {
    return Utils.laneXAtZ(this.lane, this.z);
  }
  get y() {
    return Utils.screenYAtZ(this.z);
  }
  get scale() {
    return Utils.scaleAtZ(this.z);
  }
  advance(dz) {
    this.z += dz;
    if (this.z > 1.08) this.dead = true;
  }
}

class Obstacle extends WorldObject {
  constructor(lane, z, type) {
    super(lane, z);
    this.type = type;
    this.rule = OBSTACLE_RULES[type];
    this.passed = false;
  }
  getHitbox() {
    const s = this.scale;
    const w = (this.rule === "dodge" ? 46 : 40) * s;
    const h = (this.rule === "slide" ? 30 : this.rule === "dodge" ? 90 : 40) * s;
    const topOffset = this.rule === "slide" ? 34 * s : 0; // gate hangs higher up
    return { x: this.x - w / 2, y: this.y - h - topOffset, w, h };
  }
  draw(ctx) {
    Sprites.drawObstacle(ctx, this.type, this.x, this.y, this.scale);
  }
}

class Coin extends WorldObject {
  constructor(lane, z) {
    super(lane, z);
    this.collected = false;
    this.spin = Utils.rand(0, Math.PI * 2);
    this.magnetPullX = 0;
    this.magnetPullY = 0;
  }
  getHitbox() {
    const s = this.scale;
    const size = 22 * s;
    return { x: this.x - size / 2, y: this.y - size - 14 * s, w: size, h: size };
  }
  draw(ctx) {
    this.spin += 0.15;
    Sprites.drawCoin(ctx, this.x + this.magnetPullX, this.y - 14 * this.scale + this.magnetPullY, this.scale, this.spin);
  }
}

class PowerUp extends WorldObject {
  constructor(lane, z, kind) {
    super(lane, z);
    this.kind = kind; // magnet | speed | shield | sneaker
    this.collected = false;
    this.bobT = Utils.rand(0, Math.PI * 2);
  }
  getHitbox() {
    const s = this.scale;
    const size = 30 * s;
    return { x: this.x - size / 2, y: this.y - size - 16 * s, w: size, h: size };
  }
  draw(ctx) {
    this.bobT += 0.08;
    const bob = Math.sin(this.bobT) * 5 * this.scale;
    Sprites.drawPowerUp(ctx, this.kind, this.x, this.y - 20 * this.scale, this.scale, bob);
  }
}
