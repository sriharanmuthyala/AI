/**
 * main.js
 * Bootstraps the game: wires up buttons, starts the render loop, and
 * shows a brief loading screen while placeholder assets initialize.
 */

let game;

function wireButtons() {
  document.querySelectorAll("[data-sfx='click']").forEach((btn) => {
    btn.addEventListener("click", () => Audio.click());
  });

  document.getElementById("btn-start").addEventListener("click", () => game.start());
  document.getElementById("btn-restart").addEventListener("click", () => game.restart());
  document.getElementById("btn-restart-from-pause").addEventListener("click", () => game.restart());
  document.getElementById("btn-menu").addEventListener("click", () => game.goToMenu());
  document.getElementById("btn-quit-to-menu").addEventListener("click", () => game.goToMenu());
  document.getElementById("btn-pause").addEventListener("click", () => game.pause());
  document.getElementById("btn-resume").addEventListener("click", () => game.resume());

  document.getElementById("btn-instructions").addEventListener("click", () => UI.show("screen-instructions"));
  document.getElementById("btn-back-from-instructions").addEventListener("click", () => UI.show("screen-start"));

  Input.onAction = (action) => game.handleAction(action);
}

function loop(ts) {
  if (!loop.last) loop.last = ts;
  let dt = ts - loop.last;
  loop.last = ts;
  dt = Math.min(dt, 50); // clamp big gaps (tab switch, slow devices)

  frameGlobal = ts * 0.01;
  game.update(dt);
  game.render();

  requestAnimationFrame(loop);
}

window.addEventListener("DOMContentLoaded", () => {
  AssetLoader.loadAll();
  UI.init();

  const canvas = document.getElementById("game-canvas");
  game = new Game(canvas);
  wireButtons();

  // Small deliberate delay so the loading screen actually reads as a screen,
  // and so any drop-in image assets get a moment to resolve.
  setTimeout(() => {
    UI.show("screen-start");
    requestAnimationFrame(loop);
  }, 700);
});
