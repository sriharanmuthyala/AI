/**
 * ui.js
 * All DOM/screen management lives here so game.js only deals with game
 * logic. UI is a thin singleton wrapping querySelector calls.
 */

const UI = {
  screens: {},
  achievementTimer: null,

  init() {
    document.querySelectorAll(".screen").forEach((el) => {
      this.screens[el.id] = el;
    });
    this._drawHeroPreview();
    this._wireMuteButtons();
    Storage && (document.getElementById("start-highscore").textContent = Storage.getHighScore());
  },

  show(id) {
    Object.values(this.screens).forEach((el) => el.classList.remove("active"));
    this.screens[id].classList.add("active");
  },

  showOverlay(id) {
    this.screens[id].classList.add("active");
  },
  hideOverlay(id) {
    this.screens[id].classList.remove("active");
  },

  _wireMuteButtons() {
    const sync = () => {
      const icon = Audio.muted ? "🔇" : "🔊";
      document.getElementById("btn-mute-start").textContent = icon;
      document.getElementById("btn-mute-game").textContent = icon;
    };
    ["btn-mute-start", "btn-mute-game"].forEach((id) => {
      document.getElementById(id).addEventListener("click", () => {
        Audio.toggleMute();
        sync();
      });
    });
    sync();
  },

  _drawHeroPreview() {
    const canvas = document.getElementById("hero-canvas");
    const ctx = canvas.getContext("2d");
    let t = 0;
    const loop = () => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(70, 140);
      Sprites.drawVedant(ctx, 0, 0, 1.5, "run", t);
      ctx.restore();
      ctx.save();
      ctx.translate(165, 140);
      Sprites.drawPoliceDad(ctx, 0, 0, 1.15, t, Math.floor(t / 60) % 2 === 0);
      ctx.restore();
      requestAnimationFrame(loop);
    };
    loop();
  },

  updateHUD({ score, coins, distance, theme }) {
    document.getElementById("hud-score").textContent = Math.floor(score);
    document.getElementById("hud-coins").textContent = coins;
    document.getElementById("hud-distance").textContent = Utils.formatDistance(distance);
    document.getElementById("hud-theme").textContent = theme;
  },

  updatePowerupHud(player) {
    const el = document.getElementById("powerup-hud");
    const icons = { magnet: "🧲", speed: "⚡", shield: "🛡️", sneaker: "👟" };
    let html = "";
    Object.entries(player.powerups).forEach(([k, v]) => {
      if (v > 0) {
        html += `<div class="powerup-chip">${icons[k]} ${Math.ceil(v / 1000)}s</div>`;
      }
    });
    el.innerHTML = html;
  },

  showAchievement(title) {
    const el = document.getElementById("achievement-toast");
    el.textContent = `🏅 ${title}!`;
    el.classList.add("show");
    clearTimeout(this.achievementTimer);
    this.achievementTimer = setTimeout(() => el.classList.remove("show"), 2200);
  },

  showGameOver({ caught, distance, coins, score, best, isNewBest }) {
    document.getElementById("gameover-headline").textContent = caught ? "Gotcha!! 👮" : "Ouch! Crashed!";
    document.getElementById("gameover-line").textContent = caught
      ? "Dad finally caught up with you this time!"
      : "Watch out for that next time, champ!";
    document.getElementById("go-distance").textContent = Utils.formatDistance(distance);
    document.getElementById("go-coins").textContent = coins;
    document.getElementById("go-score").textContent = Math.floor(score);
    document.getElementById("go-best").textContent = Math.floor(best);
    document.getElementById("go-newbest").classList.toggle("show", isNewBest);
    this.show("screen-gameover");
  }
};
