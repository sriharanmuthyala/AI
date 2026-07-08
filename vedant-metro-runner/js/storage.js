/**
 * storage.js
 * Thin wrapper around localStorage for the high score. Kept separate so
 * Game code never touches localStorage directly.
 */

const Storage = {
  getHighScore() {
    return parseInt(localStorage.getItem(CONFIG.LS_HIGHSCORE) || "0", 10);
  },

  setHighScoreIfBetter(score) {
    const current = Storage.getHighScore();
    if (score > current) {
      localStorage.setItem(CONFIG.LS_HIGHSCORE, String(Math.floor(score)));
      return true;
    }
    return false;
  }
};
