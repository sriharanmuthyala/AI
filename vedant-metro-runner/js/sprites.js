/**
 * sprites.js
 * All visual drawing lives here. Every character/object is drawn with
 * plain canvas shapes (placeholder "cartoon" art) so the game needs zero
 * image files to run.
 *
 * ---- HOW TO DROP IN YOUR OWN ART LATER ----
 * Put PNGs (transparent background, any size - they're auto-scaled) in
 * assets/images/ using these exact names and AssetLoader will use them
 * automatically instead of the procedural drawing, no other code changes
 * needed:
 *   vedant.png        - Vedant, idle/running pose facing right
 *   vedant_jump.png    - Vedant mid-jump
 *   vedant_slide.png   - Vedant sliding
 *   police_dad.png     - the police-officer dad, running pose
 *   train.png, barrier.png, cone.png, crate.png, bench.png, pole.png
 *   coin.png, powerup_magnet.png, powerup_speed.png, powerup_shield.png,
 *   powerup_sneaker.png
 * See assets/images/README.md for details.
 */

const AssetLoader = {
  images: {},
  NAMES: [
    "vedant", "vedant_jump", "vedant_slide", "police_dad",
    "train", "barrier", "cone", "crate", "bench", "pole", "gate",
    "coin", "powerup_magnet", "powerup_speed", "powerup_shield", "powerup_sneaker"
  ],
  loadAll() {
    this.NAMES.forEach((name) => {
      const img = new Image();
      img.onload = () => (this.images[name].ready = true);
      img.onerror = () => (this.images[name].ready = false);
      img.src = `assets/images/${name}.png`;
      this.images[name] = { img, ready: false };
    });
  },
  get(name) {
    const entry = this.images[name];
    return entry && entry.ready ? entry.img : null;
  }
};

// Draws an optional custom image centered at (x,y) sized to (w,h); returns
// true if it drew something, so callers can skip the procedural fallback.
function drawImageIfAvailable(ctx, name, x, y, w, h) {
  const img = AssetLoader.get(name);
  if (!img) return false;
  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  return true;
}

const Sprites = {
  /* ---------------------------------------------------------------- */
  /* VEDANT - energetic, playful hero. Bright orange tee, spiky hair.  */
  /* ---------------------------------------------------------------- */
  drawVedant(ctx, x, y, scale, state, frameT) {
    const w = 46 * scale, h = 62 * scale;
    const assetName = state === "jump" ? "vedant_jump" : state === "slide" ? "vedant_slide" : "vedant";
    if (drawImageIfAvailable(ctx, assetName, x, y - h / 2, w, h)) return;

    ctx.save();
    ctx.translate(x, y);

    const bob = state === "run" ? Math.sin(frameT * 0.9) * 3 * scale : 0;
    const legSwing = Math.sin(frameT * 0.9);

    if (state === "slide") {
      // Squashed, low silhouette sliding under a bar.
      ctx.save();
      ctx.scale(1, 0.55);
      this._vedantBody(ctx, scale, 0, legSwing, "slide");
      ctx.restore();
    } else if (state === "hit") {
      ctx.rotate(0.35);
      this._vedantBody(ctx, scale, bob, legSwing, "hit");
    } else {
      this._vedantBody(ctx, scale, bob, legSwing, state);
    }
    ctx.restore();
  },

  _vedantBody(ctx, scale, bob, legSwing, state) {
    const s = scale;
    const skin = "#f2b389";
    const hair = "#231b14";
    const shirt = "#ff8a2b";
    const shirtDark = "#e8701a";
    const shorts = "#2e6ddb";
    const shoe = "#ffffff";

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(0, 30 * s, 22 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, -bob - 26 * s);

    // Legs
    const legA = state === "jump" ? -18 : legSwing * 16;
    const legB = state === "jump" ? 18 : -legSwing * 16;
    ctx.strokeStyle = shorts;
    ctx.lineWidth = 9 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-6 * s, 20 * s);
    ctx.lineTo(-6 * s + legA * 0.35 * s, 40 * s);
    ctx.moveTo(6 * s, 20 * s);
    ctx.lineTo(6 * s + legB * 0.35 * s, 40 * s);
    ctx.stroke();
    // Shoes
    ctx.fillStyle = shoe;
    ctx.beginPath();
    ctx.ellipse(-6 * s + legA * 0.35 * s, 41 * s, 7 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(6 * s + legB * 0.35 * s, 41 * s, 7 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    ctx.fillStyle = shirt;
    roundRect(ctx, -14 * s, -4 * s, 28 * s, 30 * s, 10 * s);
    ctx.fill();
    ctx.fillStyle = shirtDark;
    roundRect(ctx, -14 * s, 14 * s, 28 * s, 10 * s, 5 * s);
    ctx.fill();

    // Backpack strap hint (small accent, keeps him recognizable)
    ctx.fillStyle = "#1c9c6b";
    roundRect(ctx, 8 * s, -2 * s, 8 * s, 22 * s, 4 * s);
    ctx.fill();

    // Arms
    const armA = state === "jump" ? -30 : legSwing * -20;
    const armB = state === "jump" ? 30 : legSwing * 20;
    ctx.strokeStyle = skin;
    ctx.lineWidth = 7 * s;
    ctx.beginPath();
    ctx.moveTo(-13 * s, 2 * s);
    ctx.lineTo(-13 * s + armA * 0.4 * s, 20 * s + Math.abs(armA) * 0.1 * s);
    ctx.moveTo(13 * s, 2 * s);
    ctx.lineTo(13 * s + armB * 0.4 * s, 20 * s + Math.abs(armB) * 0.1 * s);
    ctx.stroke();

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -18 * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();

    // Spiky hair - the signature playful look
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-13 * s, -24 * s);
    for (let i = -5; i <= 5; i++) {
      const px = i * 3 * s;
      const py = (Math.abs(i) % 2 === 0 ? -34 : -29) * s;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(13 * s, -24 * s);
    ctx.arc(0, -18 * s, 14 * s, -0.15, Math.PI + 0.15, true);
    ctx.closePath();
    ctx.fill();

    // Confident big smile + eyes
    ctx.fillStyle = "#221";
    ctx.beginPath();
    ctx.arc(-5 * s, -18 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.arc(5 * s, -18 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#a33";
    ctx.lineWidth = 1.6 * s;
    ctx.beginPath();
    ctx.arc(0, -14 * s, 6 * s, 0.15, Math.PI - 0.15);
    ctx.stroke();

    if (state === "hit") {
      // Dizzy stars for the crash animation
      ctx.fillStyle = "#ffd23f";
      for (let i = 0; i < 3; i++) {
        const a = (frameGlobal || 0) * 0.2 + (i * Math.PI * 2) / 3;
        star(ctx, Math.cos(a) * 20 * s, -32 * s + Math.sin(a) * 6 * s, 4 * s);
      }
    }
  },

  /* ---------------------------------------------------------------- */
  /* POLICE DAD - Vedant's dad, comically strict, chasing him.         */
  /* ---------------------------------------------------------------- */
  drawPoliceDad(ctx, x, y, scale, frameT, shouting) {
    const w = 50 * scale, h = 66 * scale;
    if (drawImageIfAvailable(ctx, "police_dad", x, y - h / 2, w, h)) return;

    const s = scale;
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(0, 30 * s, 24 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const legSwing = Math.sin(frameT * 1.05);
    ctx.translate(0, -24 * s);

    const navy = "#1c3d6b";
    const navyDark = "#142c4d";
    const skin = "#e8a672";
    const belt = "#222";

    // Legs
    ctx.strokeStyle = navyDark;
    ctx.lineWidth = 10 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-7 * s, 18 * s);
    ctx.lineTo(-7 * s + legSwing * 14 * s, 38 * s);
    ctx.moveTo(7 * s, 18 * s);
    ctx.lineTo(7 * s - legSwing * 14 * s, 38 * s);
    ctx.stroke();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.ellipse(-7 * s + legSwing * 14 * s, 39 * s, 7 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(7 * s - legSwing * 14 * s, 39 * s, 7 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly + torso (a little belly = affectionate "dad" humor)
    ctx.fillStyle = navy;
    ctx.beginPath();
    ctx.ellipse(0, 6 * s, 20 * s, 22 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = belt;
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.moveTo(-18 * s, 18 * s);
    ctx.lineTo(18 * s, 18 * s);
    ctx.stroke();
    // Badge
    ctx.fillStyle = "#f4c542";
    star(ctx, -8 * s, -2 * s, 5 * s);

    // Arms - waving angrily/comically forward
    const armSwing = Math.sin(frameT * 1.05 + 1);
    ctx.strokeStyle = navy;
    ctx.lineWidth = 8 * s;
    ctx.beginPath();
    ctx.moveTo(-16 * s, -6 * s);
    ctx.lineTo(-16 * s + armSwing * 16 * s, 10 * s - Math.abs(armSwing) * 8 * s);
    ctx.moveTo(16 * s, -6 * s);
    ctx.lineTo(16 * s - armSwing * 16 * s, 10 * s + Math.abs(armSwing) * 8 * s);
    ctx.stroke();
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(-16 * s + armSwing * 16 * s, 10 * s - Math.abs(armSwing) * 8 * s, 5 * s, 0, Math.PI * 2);
    ctx.arc(16 * s - armSwing * 16 * s, 10 * s + Math.abs(armSwing) * 8 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -20 * s, 13 * s, 0, Math.PI * 2);
    ctx.fill();

    // Big comic mustache
    ctx.fillStyle = "#2b2b2b";
    ctx.beginPath();
    ctx.moveTo(-11 * s, -15 * s);
    ctx.quadraticCurveTo(0, -10 * s, 11 * s, -15 * s);
    ctx.quadraticCurveTo(6 * s, -12 * s, 0, -14 * s);
    ctx.quadraticCurveTo(-6 * s, -12 * s, -11 * s, -15 * s);
    ctx.fill();

    // Angry-but-funny eyebrows
    ctx.strokeStyle = "#2b2b2b";
    ctx.lineWidth = 2.4 * s;
    ctx.beginPath();
    ctx.moveTo(-9 * s, -25 * s);
    ctx.lineTo(-2 * s, -22 * s);
    ctx.moveTo(9 * s, -25 * s);
    ctx.lineTo(2 * s, -22 * s);
    ctx.stroke();
    ctx.fillStyle = "#221";
    ctx.beginPath();
    ctx.arc(-4 * s, -20 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.arc(4 * s, -20 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.fill();

    // Police cap
    ctx.fillStyle = "#0e2038";
    roundRect(ctx, -14 * s, -36 * s, 28 * s, 9 * s, 3 * s);
    ctx.fill();
    ctx.fillStyle = "#0a1a2e";
    ctx.beginPath();
    ctx.ellipse(0, -27 * s, 16 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4c542";
    ctx.beginPath();
    ctx.arc(0, -31.5 * s, 2.6 * s, 0, Math.PI * 2);
    ctx.fill();

    if (shouting) {
      ctx.font = `bold ${11 * s}px 'Baloo 2', sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#1c3d6b";
      ctx.lineWidth = 3;
      const txt = "VEDANT!!";
      ctx.textAlign = "center";
      ctx.strokeText(txt, 0, -50 * s);
      ctx.fillText(txt, 0, -50 * s);
    }

    ctx.restore();
  },

  /* ---------------------------------------------------------------- */
  /* OBSTACLES                                                          */
  /* ---------------------------------------------------------------- */
  drawObstacle(ctx, type, x, y, scale) {
    const s = scale;
    if (drawImageIfAvailable(ctx, type, x, y, 60 * s, 70 * s)) return;

    ctx.save();
    ctx.translate(x, y);
    switch (type) {
      case "cone":
        ctx.fillStyle = "#ff6a2f";
        ctx.beginPath();
        ctx.moveTo(0, -30 * s);
        ctx.lineTo(14 * s, 20 * s);
        ctx.lineTo(-14 * s, 20 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillRect(-10 * s, 2 * s, 20 * s, 6 * s);
        ctx.fillStyle = "#c94a1a";
        ctx.fillRect(-16 * s, 18 * s, 32 * s, 6 * s);
        break;
      case "barrier":
        ctx.fillStyle = "#f4c542";
        roundRect(ctx, -30 * s, -6 * s, 60 * s, 14 * s, 3 * s);
        ctx.fill();
        ctx.fillStyle = "#222";
        for (let i = -2; i <= 2; i++) {
          ctx.fillRect(i * 11 * s - 3 * s, -6 * s, 6 * s, 14 * s);
        }
        ctx.fillStyle = "#888";
        ctx.fillRect(-26 * s, 8 * s, 6 * s, 22 * s);
        ctx.fillRect(20 * s, 8 * s, 6 * s, 22 * s);
        break;
      case "crate":
        ctx.fillStyle = "#b97a3d";
        roundRect(ctx, -20 * s, -22 * s, 40 * s, 44 * s, 4 * s);
        ctx.fill();
        ctx.strokeStyle = "#7c4f22";
        ctx.lineWidth = 3 * s;
        ctx.strokeRect(-20 * s, -22 * s, 40 * s, 44 * s);
        ctx.beginPath();
        ctx.moveTo(-20 * s, -22 * s);
        ctx.lineTo(20 * s, 22 * s);
        ctx.moveTo(20 * s, -22 * s);
        ctx.lineTo(-20 * s, 22 * s);
        ctx.stroke();
        break;
      case "bench":
        ctx.fillStyle = "#3d6b4a";
        roundRect(ctx, -32 * s, -8 * s, 64 * s, 10 * s, 3 * s);
        ctx.fill();
        roundRect(ctx, -32 * s, -26 * s, 64 * s, 10 * s, 3 * s);
        ctx.fill();
        ctx.fillStyle = "#294a34";
        ctx.fillRect(-28 * s, 2 * s, 6 * s, 24 * s);
        ctx.fillRect(22 * s, 2 * s, 6 * s, 24 * s);
        break;
      case "pole":
        ctx.fillStyle = "#c7cbd1";
        roundRect(ctx, -6 * s, -60 * s, 12 * s, 84 * s, 4 * s);
        ctx.fill();
        ctx.fillStyle = "#ffcf3f";
        ctx.beginPath();
        ctx.arc(0, -52 * s, 13 * s, 0, Math.PI * 2);
        ctx.fill();
        ["#e33", "#ffcf3f", "#3c3"].forEach((c, i) => {
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(0, -60 * s + i * 9 * s, 4 * s, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      case "gate":
        // Level-crossing style boom gate, lowered - duck/slide underneath it.
        ctx.fillStyle = "#c7cbd1";
        ctx.fillRect(-30 * s, -50 * s, 8 * s, 74 * s);
        ctx.fillRect(22 * s, -50 * s, 8 * s, 74 * s);
        ctx.save();
        ctx.translate(0, -14 * s);
        ctx.rotate(-0.03);
        ctx.fillStyle = "#e33";
        roundRect(ctx, -34 * s, -7 * s, 68 * s, 14 * s, 4 * s);
        ctx.fill();
        ctx.fillStyle = "#fff";
        for (let i = -2; i <= 2; i++) {
          ctx.fillRect(i * 13 * s - 4 * s, -7 * s, 8 * s, 14 * s);
        }
        ctx.restore();
        break;
      case "train":
        ctx.fillStyle = "#2b6fb0";
        roundRect(ctx, -46 * s, -70 * s, 92 * s, 90 * s, 10 * s);
        ctx.fill();
        ctx.fillStyle = "#bfe3f0";
        for (let i = -1; i <= 1; i++) {
          roundRect(ctx, i * 30 * s - 12 * s, -55 * s, 24 * s, 20 * s, 4 * s);
          ctx.fill();
        }
        ctx.fillStyle = "#f4c542";
        ctx.fillRect(-46 * s, -8 * s, 92 * s, 8 * s);
        break;
    }
    ctx.restore();
  },

  /* ---------------------------------------------------------------- */
  /* COLLECTIBLES                                                       */
  /* ---------------------------------------------------------------- */
  drawCoin(ctx, x, y, scale, spin) {
    if (drawImageIfAvailable(ctx, "coin", x, y, 26 * scale, 26 * scale)) return;
    const s = scale;
    const squish = Math.abs(Math.cos(spin));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(Math.max(0.15, squish), 1);
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 13 * s);
    grad.addColorStop(0, "#fff6c8");
    grad.addColorStop(1, "#f4b93f");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 13 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c9861f";
    ctx.lineWidth = 2 * s;
    ctx.stroke();
    ctx.fillStyle = "#c9861f";
    ctx.font = `bold ${14 * s}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("V", 0, 1 * s);
    ctx.restore();
  },

  drawPowerUp(ctx, kind, x, y, scale, bob) {
    const names = {
      magnet: "powerup_magnet",
      speed: "powerup_speed",
      shield: "powerup_shield",
      sneaker: "powerup_sneaker"
    };
    if (drawImageIfAvailable(ctx, names[kind], x, y + bob, 34 * scale, 34 * scale)) return;

    const s = scale;
    ctx.save();
    ctx.translate(x, y + bob);

    // Glowing badge background
    const colors = {
      magnet: "#ff4f6d",
      speed: "#3fd4ff",
      shield: "#4fd47a",
      sneaker: "#ffb63f"
    };
    ctx.fillStyle = colors[kind];
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(0, 0, 20 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 15 * s, 0, Math.PI * 2);
    ctx.fillStyle = colors[kind];
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.4 * s;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.2 * s;
    switch (kind) {
      case "magnet":
        ctx.beginPath();
        ctx.arc(0, 2 * s, 7 * s, Math.PI * 0.15, Math.PI * 0.85, false);
        ctx.stroke();
        ctx.fillRect(-8.5 * s, 1 * s, 4 * s, 6 * s);
        ctx.fillRect(4.5 * s, 1 * s, 4 * s, 6 * s);
        break;
      case "speed":
        ctx.beginPath();
        ctx.moveTo(2 * s, -8 * s);
        ctx.lineTo(-6 * s, 2 * s);
        ctx.lineTo(-1 * s, 2 * s);
        ctx.lineTo(-3 * s, 9 * s);
        ctx.lineTo(6 * s, -1 * s);
        ctx.lineTo(1 * s, -1 * s);
        ctx.closePath();
        ctx.fill();
        break;
      case "shield":
        ctx.beginPath();
        ctx.moveTo(0, -8 * s);
        ctx.quadraticCurveTo(8 * s, -6 * s, 8 * s, 0);
        ctx.quadraticCurveTo(8 * s, 7 * s, 0, 10 * s);
        ctx.quadraticCurveTo(-8 * s, 7 * s, -8 * s, 0);
        ctx.quadraticCurveTo(-8 * s, -6 * s, 0, -8 * s);
        ctx.fill();
        break;
      case "sneaker":
        roundRect(ctx, -8 * s, -3 * s, 16 * s, 7 * s, 3 * s);
        ctx.fill();
        ctx.fillRect(-8 * s, -6 * s, 5 * s, 6 * s);
        break;
    }
    ctx.restore();
  }
};

let frameGlobal = 0;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a2) * r * 0.45, cy + Math.sin(a2) * r * 0.45);
  }
  ctx.closePath();
  ctx.fill();
}
