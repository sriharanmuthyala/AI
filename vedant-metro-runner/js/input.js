/**
 * input.js
 * Normalizes keyboard arrows, on-screen touch buttons, and swipe gestures
 * into four actions: left, right, jump, slide. The game loop only ever
 * asks InputManager for these actions, so it doesn't care which input
 * device triggered them.
 */

class InputManager {
  constructor() {
    this.onAction = null; // set by Game: (action) => void
    this._bindKeyboard();
    this._bindTouchButtons();
    this._bindSwipe();
  }

  _fire(action) {
    if (this.onAction) this.onAction(action);
  }

  _bindKeyboard() {
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          this._fire("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          this._fire("right");
          break;
        case "ArrowUp":
          e.preventDefault();
          this._fire("jump");
          break;
        case "ArrowDown":
          e.preventDefault();
          this._fire("slide");
          break;
        case " ":
          e.preventDefault();
          this._fire("jump");
          break;
        case "p":
        case "P":
        case "Escape":
          this._fire("pause");
          break;
      }
    });
  }

  _bindTouchButtons() {
    document.querySelectorAll("[data-action]").forEach((btn) => {
      const action = btn.getAttribute("data-action");
      const trigger = (e) => {
        e.preventDefault();
        this._fire(action);
      };
      btn.addEventListener("touchstart", trigger, { passive: false });
      btn.addEventListener("mousedown", trigger);
    });
  }

  // Swipe gestures on the game canvas itself, for a more "native" mobile feel.
  _bindSwipe() {
    const el = document.getElementById("game-canvas");
    let sx = 0, sy = 0, tracking = false;
    const THRESH = 30;

    el.addEventListener(
      "touchstart",
      (e) => {
        const t = e.changedTouches[0];
        sx = t.clientX;
        sy = t.clientY;
        tracking = true;
      },
      { passive: true }
    );

    el.addEventListener(
      "touchend",
      (e) => {
        if (!tracking) return;
        tracking = false;
        const t = e.changedTouches[0];
        const dx = t.clientX - sx;
        const dy = t.clientY - sy;
        if (Math.abs(dx) < THRESH && Math.abs(dy) < THRESH) return; // tap, ignore
        if (Math.abs(dx) > Math.abs(dy)) {
          this._fire(dx > 0 ? "right" : "left");
        } else {
          this._fire(dy > 0 ? "slide" : "jump");
        }
      },
      { passive: true }
    );
  }
}

const Input = new InputManager();
