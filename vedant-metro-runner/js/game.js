/**
 * game.js
 * The state machine and update/render loop tying every module together.
 * States: "start" | "instructions" | "playing" | "paused" | "gameover"
 */

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.state = "start";

    this.bg = new BackgroundRenderer();
    this.particles = new ParticleSystem();
    this.player = new Player();
    this.chaser = new Chaser();

    this.obstacles = [];
    this.coins = [];
    this.powerups = [];

    this._resetRunState();
    this._resizeCanvas();
    window.addEventListener("resize", () => this._resizeCanvas());
  }

  _resizeCanvas() {
    // Internal resolution stays fixed (CONFIG.CANVAS_WIDTH/HEIGHT) for
    // consistent gameplay math; CSS scales it responsively (see style.css).
    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;
  }

  _resetRunState() {
    this.distance = 0;
    this.score = 0;
    this.coinsCollected = 0;
    this.elapsedSec = 0;
    this.speed = CONFIG.BASE_SPEED;
    this.spawnTimer = 40;
    this.level = 0;
    this.achievementsShown = new Set();
    this.themeOrder = ["hyderabad", "melbourne"];
    this.themeIndex = 0;

    this.obstacles = [];
    this.coins = [];
    this.powerups = [];

    this.player = new Player();
    this.chaser = new Chaser();
    this.bg.themeKey = "hyderabad";
    this.bg.nextThemeKey = "hyderabad";
    this.bg.transition = 1;

    this.caughtSequence = null; // {timer} while the comic catch plays out
  }

  /* ---------------------------------------------------------------- */
  /* State transitions                                                  */
  /* ---------------------------------------------------------------- */
  start() {
    Audio.ensureContext();
    this._resetRunState();
    this.state = "playing";
    UI.show("screen-game");
    Audio.startMusic();
  }

  restart() {
    this.start();
  }

  pause() {
    if (this.state !== "playing") return;
    this.state = "paused";
    UI.showOverlay("screen-pause");
  }

  resume() {
    if (this.state !== "paused") return;
    this.state = "playing";
    UI.hideOverlay("screen-pause");
  }

  goToMenu() {
    this.state = "start";
    UI.hideOverlay("screen-pause");
    UI.show("screen-start");
    document.getElementById("start-highscore").textContent = Storage.getHighScore();
  }

  handleAction(action) {
    if (action === "pause") {
      if (this.state === "playing") this.pause();
      else if (this.state === "paused") this.resume();
      return;
    }
    if (this.state !== "playing") return;
    if (action === "left") this.player.moveLeft();
    else if (action === "right") this.player.moveRight();
    else if (action === "jump") this.player.jump();
    else if (action === "slide") this.player.slide();
  }

  /* ---------------------------------------------------------------- */
  /* Update                                                             */
  /* ---------------------------------------------------------------- */
  update(dt) {
    if (this.state === "playing") this._updatePlaying(dt);
    if (this.caughtSequence) this._updateCaughtSequence(dt);
  }

  _updatePlaying(dt) {
    this.elapsedSec += dt / 1000;
    const speedMult = this.player.powerups.speed > 0 ? CONFIG.SPEED_BOOST_MULT : 1;
    this.speed = Math.min(CONFIG.MAX_SPEED, CONFIG.BASE_SPEED + this.elapsedSec * CONFIG.SPEED_RAMP_PER_SEC) * speedMult;

    const dzBase = this.speed * (dt / 1000) * 0.42; // world-units per frame at z=1
    this.distance += this.speed * (dt / 1000) * 3.6;

    this.bg.update(dt, this.speed);
    this.player.update(dt);
    this.chaser.update(dt, this.player, speedMult, this.elapsedSec);
    this.particles.update(dt);

    this._updateSpawning(dt, dzBase);
    this._updateObstacles(dzBase);
    this._updateCoins(dzBase);
    this._updatePowerups(dzBase);
    this._checkLevelProgress();

    this.score = this.distance * CONFIG.SCORE_PER_METER + this.coinsCollected * CONFIG.SCORE_PER_COIN;

    UI.updateHUD({
      score: this.score,
      coins: this.coinsCollected,
      distance: this.distance,
      theme: this.bg.currentColors().name
    });
    UI.updatePowerupHud(this.player);

    if (this.chaser.hasCaughtPlayer() && !this.caughtSequence) {
      this._triggerGameOver(true);
    }
  }

  /* ---- Spawning ---- */
  _updateSpawning(dt, dz) {
    this.spawnTimer -= dt / 16.67;
    if (this.spawnTimer <= 0) {
      this._spawnWave();
      const difficulty = Utils.clamp(this.elapsedSec / 60, 0, 1); // 0..1 over first minute
      const min = Utils.lerp(CONFIG.SPAWN_INTERVAL_MIN, CONFIG.SPAWN_INTERVAL_MIN * 0.6, difficulty);
      const max = Utils.lerp(CONFIG.SPAWN_INTERVAL_MAX, CONFIG.SPAWN_INTERVAL_MAX * 0.65, difficulty);
      this.spawnTimer = Utils.rand(min, max);
    }
  }

  _spawnWave() {
    const laneCount = CONFIG.LANE_COUNT;
    const blockedCount = Math.random() < 0.35 ? 2 : 1;
    const lanes = [0, 1, 2];
    // shuffle
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = Utils.randInt(0, i);
      [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }
    const blockedLanes = lanes.slice(0, blockedCount);
    const freeLanes = lanes.slice(blockedCount);

    blockedLanes.forEach((lane) => {
      const type = Math.random() < 0.5
        ? Utils.pick(DODGE_OBSTACLES)
        : Utils.pick([...JUMP_OBSTACLES, ...SLIDE_OBSTACLES]);
      this.obstacles.push(new Obstacle(lane, 0, type));
    });
    // A remaining free lane may still get a jump/slide obstacle (never a
    // full lane-block) so the player always has a guaranteed way through.
    if (Math.random() < 0.4) {
      freeLanes.forEach((lane) => {
        if (Math.random() < 0.5) {
          const type = Utils.pick([...JUMP_OBSTACLES, ...SLIDE_OBSTACLES]);
          this.obstacles.push(new Obstacle(lane, 0, type));
        }
      });
    }

    // Coins: place a row in a lane that's clear at spawn time.
    if (Math.random() < CONFIG.COIN_ROW_CHANCE) {
      const lane = Utils.pick(freeLanes.length ? freeLanes : lanes);
      const count = Utils.randInt(3, 6);
      for (let i = 0; i < count; i++) {
        this.coins.push(new Coin(lane, -i * 0.05));
      }
    }

    if (Math.random() < CONFIG.POWERUP_CHANCE) {
      const lane = Utils.pick(freeLanes.length ? freeLanes : lanes);
      const kind = Utils.pick(["magnet", "speed", "shield", "sneaker"]);
      this.powerups.push(new PowerUp(lane, -0.05, kind));
    }
  }

  /* ---- Obstacles ---- */
  _updateObstacles(dz) {
    for (const o of this.obstacles) {
      o.advance(dz);
      if (!o.passed && o.z >= 0.9 && o.z <= 1.05 && o.lane === Math.round(this.player.lane)) {
        this._resolveObstacleCollision(o);
        o.passed = true;
      }
    }
    this.obstacles = this.obstacles.filter((o) => !o.dead);
  }

  _resolveObstacleCollision(o) {
    const rule = o.rule;
    let cleared = false;
    if (rule === "jump" && this.player.isJumping) cleared = true;
    if (rule === "slide" && this.player.isSliding) cleared = true;
    if (rule === "dodge") cleared = false; // being in this lane at all = hit

    if (!cleared) {
      const blocked = !this.player.hit();
      if (!blocked) {
        this.particles.crashBurst(this.player.x, CONFIG.GROUND_Y - 20);
        this.chaser.reactToHit();
        this._triggerGameOver(false);
      } else {
        // Shield absorbed it - still a dramatic moment for the chase.
        this.particles.dust(this.player.x, CONFIG.GROUND_Y);
        this.chaser.reactToNearMiss();
      }
    } else {
      // Clean dodge - small chance the dad comically lunges anyway.
      if (Math.random() < 0.15) this.chaser.reactToNearMiss();
    }
  }

  /* ---- Coins ---- */
  _updateCoins(dz) {
    const magnetActive = this.player.powerups.magnet > 0;
    for (const c of this.coins) {
      c.advance(dz);
      if (magnetActive && c.z > 0.5) {
        const targetLane = this.player.lane;
        c.lane = Utils.lerp(c.lane, targetLane, 0.18);
      }
      if (!c.collected && c.z >= 0.88 && c.z <= 1.05) {
        const laneMatch = magnetActive ? Math.abs(c.lane - this.player.lane) < 0.6 : laneMatches(c.lane, this.player.lane);
        if (laneMatch) {
          c.collected = true;
          c.dead = true;
          this.coinsCollected++;
          this.particles.coinBurst(c.x, c.y);
          Audio.coin();
        }
      }
    }
    this.coins = this.coins.filter((c) => !c.dead);
  }

  /* ---- Power-ups ---- */
  _updatePowerups(dz) {
    for (const p of this.powerups) {
      p.advance(dz);
      if (!p.collected && p.z >= 0.88 && p.z <= 1.05 && p.lane === Math.round(this.player.lane)) {
        p.collected = true;
        p.dead = true;
        this.player.addPowerup(p.kind);
        this.particles.powerupBurst(p.x, p.y, { magnet: "#ff4f6d", speed: "#3fd4ff", shield: "#4fd47a", sneaker: "#ffb63f" }[p.kind]);
      }
    }
    this.powerups = this.powerups.filter((p) => !p.dead);
  }

  /* ---- Level / theme / achievements ---- */
  _checkLevelProgress() {
    const newLevel = Math.floor(this.distance / CONFIG.LEVEL_DISTANCE);
    if (newLevel > this.level) {
      this.level = newLevel;
      this.themeIndex = (this.themeIndex + 1) % this.themeOrder.length;
      this.bg.setTheme(this.themeOrder[this.themeIndex]);
      Audio.levelUp();
    }
    for (const a of ACHIEVEMENTS) {
      if (this.distance >= a.distance && !this.achievementsShown.has(a.title)) {
        this.achievementsShown.add(a.title);
        UI.showAchievement(a.title);
      }
    }
  }

  /* ---- Game over ---- */
  _triggerGameOver(caught) {
    if (this.caughtSequence) return;
    this.caughtSequence = { timer: caught ? 900 : 700, caught };
  }

  _updateCaughtSequence(dt) {
    this.caughtSequence.timer -= dt;
    if (this.caughtSequence.caught) {
      this.chaser.z = Math.min(1.0, this.chaser.z + dt * 0.0006);
    }
    if (this.caughtSequence.timer <= 0) {
      const caught = this.caughtSequence.caught;
      this.caughtSequence = null;
      this.state = "gameover";
      Audio.stopMusic();
      Audio.caught();
      const isNewBest = Storage.setHighScoreIfBetter(this.score);
      UI.showGameOver({
        caught,
        distance: this.distance,
        coins: this.coinsCollected,
        score: this.score,
        best: Storage.getHighScore(),
        isNewBest
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                             */
  /* ---------------------------------------------------------------- */
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    if (this.state === "start" || this.state === "instructions") return;

    this.bg.draw(ctx);

    // Depth-sort everything so nearer objects draw on top.
    const drawables = [
      ...this.obstacles.map((o) => ({ z: o.z, draw: () => o.draw(ctx) })),
      ...this.coins.map((c) => ({ z: c.z, draw: () => c.draw(ctx) })),
      ...this.powerups.map((p) => ({ z: p.z, draw: () => p.draw(ctx) })),
      { z: this.chaser.z, draw: () => this.chaser.draw(ctx) },
      { z: 1.02, draw: () => this.player.draw(ctx) }
    ];
    drawables.sort((a, b) => a.z - b.z);
    drawables.forEach((d) => d.draw());

    this.particles.draw(ctx);
  }
}

// Simple integer-lane equality used for coin pickup when no magnet is active.
function laneMatches(a, b) {
  return Math.round(a) === Math.round(b);
}
