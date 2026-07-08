/**
 * config.js
 * Central tunables for the whole game. Change numbers here to rebalance
 * difficulty, speed, spawn rates, etc. without touching game logic.
 */

const CONFIG = {
  // ---- Canvas / render ----
  CANVAS_WIDTH: 480,
  CANVAS_HEIGHT: 720,
  HORIZON_Y: 150,        // y of vanishing point (top of track trapezoid)
  GROUND_Y: 640,         // y where the player stands (near camera)
  LANE_COUNT: 3,

  // ---- Player ----
  PLAYER_START_X_LANE: 1, // middle lane (0,1,2)
  LANE_CHANGE_SPEED: 12,  // px/frame-ish lerp speed toward target lane x
  JUMP_VELOCITY: -13.5,
  GRAVITY: 0.72,
  SNEAKER_JUMP_MULT: 1.35, // sneaker boost power-up multiplier
  SLIDE_DURATION_MS: 620,
  HIT_INVULN_MS: 1200,

  // ---- World speed / difficulty ----
  BASE_SPEED: 6.0,        // world scroll speed (z units/frame at depth 1)
  MAX_SPEED: 15,
  SPEED_RAMP_PER_SEC: 0.045, // speed increases this much per second survived
  SPEED_BOOST_MULT: 1.8,
  LEVEL_DISTANCE: 900,     // meters per "level" (theme swap + achievement)

  // ---- Spawning ----
  SPAWN_INTERVAL_MIN: 46,  // frames between spawns (scaled by difficulty)
  SPAWN_INTERVAL_MAX: 78,
  COIN_ROW_CHANCE: 0.55,
  POWERUP_CHANCE: 0.10,

  // ---- Power-up durations (ms) ----
  MAGNET_DURATION: 7000,
  SPEED_BOOST_DURATION: 5000,
  SHIELD_DURATION: 9000, // shield also breaks on hit, whichever first
  SNEAKER_DURATION: 8000,

  // ---- Scoring ----
  SCORE_PER_METER: 1,
  SCORE_PER_COIN: 10,

  // ---- Chaser (police dad) ----
  CHASER_BASE_Z: 0.80,      // depth relative to player (1 = at player)
  CHASER_CATCH_Z: 0.985,    // if chaser reaches this depth uncaught -> caught
  CHASER_LUNGE_RECOVER: 0.015, // per-frame recover speed back to base gap

  // ---- Local storage keys ----
  LS_HIGHSCORE: "vedantMetroRunner.highScore",
  LS_MUTE: "vedantMetroRunner.muted",

  // Colors reused across renderers
  COLORS: {
    hyderabad: {
      sky1: "#ff9a56",
      sky2: "#ffd56b",
      farBuilding: "#e8734a",
      nearBuilding: "#c14e3a",
      track: "#8a8a92",
      trackEdge: "#e0b23a",
      platform: "#d9723c",
      accent: "#f4c542",
      name: "Hyderabad Metro"
    },
    melbourne: {
      sky1: "#6ea8d8",
      sky2: "#bfe3f0",
      farBuilding: "#3f5f7a",
      nearBuilding: "#2c4256",
      track: "#5a5f66",
      trackEdge: "#d4d8dc",
      platform: "#33495c",
      accent: "#e8543f",
      name: "Melbourne Metro"
    }
  }
};

// Achievement thresholds (distance in meters) -> message shown once each run
const ACHIEVEMENTS = [
  { distance: 300, title: "Metro Rookie" },
  { distance: 900, title: "Track Master" },
  { distance: 1800, title: "City Sprinter" },
  { distance: 3000, title: "Unstoppable Vedant" }
];
