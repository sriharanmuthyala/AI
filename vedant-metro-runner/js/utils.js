/**
 * utils.js
 * Small math/perspective helpers shared across the game.
 *
 * The whole track is drawn in a cheap pseudo-3D perspective: a trapezoid
 * that is narrow at the horizon (far away, small) and wide at the bottom
 * of the screen (close to the camera, large). Every moving object has a
 * depth value `z` in [0,1] (0 = at the horizon, 1 = right at the player)
 * and we convert that to a screen x/y/scale.
 */

const Utils = {
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  },

  rand(min, max) {
    return min + Math.random() * (max - min);
  },

  randInt(min, max) {
    return Math.floor(Utils.rand(min, max + 1));
  },

  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /** Perspective scale at depth z: small far away, 1.0 right at the camera. */
  scaleAtZ(z) {
    return Utils.lerp(0.18, 1.0, z * z); // ease-in so far objects shrink fast
  },

  /** Screen Y for a given depth z (0=horizon, 1=ground/near). */
  screenYAtZ(z) {
    return Utils.lerp(CONFIG.HORIZON_Y, CONFIG.GROUND_Y, z);
  },

  /** Screen X for a given lane (0..LANE_COUNT-1) at depth z. Lanes fan out
   *  from the vanishing point as z increases. */
  laneXAtZ(lane, z) {
    const center = CONFIG.CANVAS_WIDTH / 2;
    const laneOffset = lane - (CONFIG.LANE_COUNT - 1) / 2; // -1, 0, 1
    const spreadAtZ = Utils.lerp(14, 190, z * z); // narrow far, wide near
    return center + laneOffset * spreadAtZ * 2;
  },

  /** AABB overlap test. */
  rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  },

  formatDistance(meters) {
    return `${Math.floor(meters)}m`;
  }
};
