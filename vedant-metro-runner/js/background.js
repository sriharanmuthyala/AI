/**
 * background.js
 * Draws the scrolling metro-city backdrop and the perspective track.
 * Two swappable themes: Hyderabad and Melbourne. The active theme
 * crossfades in as `transition` goes 0->1 during a level change.
 */

class BackgroundRenderer {
  constructor() {
    this.scrollX = 0;
    this.themeKey = "hyderabad";
    this.nextThemeKey = "hyderabad";
    this.transition = 1; // 1 = fully on themeKey, 0 = fully on nextThemeKey
    this.skylineSeed = this._buildSkyline();
  }

  _buildSkyline() {
    // Precompute random building layout once so it doesn't jitter every frame.
    const far = [];
    for (let i = 0; i < 14; i++) {
      far.push({ w: Utils.rand(30, 70), h: Utils.rand(60, 170) });
    }
    const near = [];
    for (let i = 0; i < 9; i++) {
      near.push({ w: Utils.rand(50, 110), h: Utils.rand(90, 230) });
    }
    return { far, near };
  }

  setTheme(key) {
    if (key === this.themeKey) return;
    this.nextThemeKey = key;
    this.transition = 0;
  }

  update(dt, speed) {
    this.scrollX += speed * dt * 0.06;
    if (this.transition < 1) {
      this.transition = Math.min(1, this.transition + dt * 0.0009);
      if (this.transition >= 1) this.themeKey = this.nextThemeKey;
    }
  }

  _lerpColor(c1, c2, t) {
    const p1 = this._hexToRgb(c1), p2 = this._hexToRgb(c2);
    const r = Math.round(Utils.lerp(p1[0], p2[0], t));
    const g = Math.round(Utils.lerp(p1[1], p2[1], t));
    const b = Math.round(Utils.lerp(p1[2], p2[2], t));
    return `rgb(${r},${g},${b})`;
  }

  _hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  currentColors() {
    const from = CONFIG.COLORS[this.themeKey];
    const to = CONFIG.COLORS[this.nextThemeKey];
    const t = this.themeKey === this.nextThemeKey ? 1 : this.transition;
    const mix = (k) => this._lerpColor(from[k], to[k], t);
    return {
      sky1: mix("sky1"),
      sky2: mix("sky2"),
      farBuilding: mix("farBuilding"),
      nearBuilding: mix("nearBuilding"),
      track: mix("track"),
      trackEdge: mix("trackEdge"),
      platform: mix("platform"),
      accent: mix("accent"),
      name: t < 0.5 ? from.name : to.name
    };
  }

  draw(ctx) {
    const c = this.currentColors();
    const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, CONFIG.HORIZON_Y + 40);
    sky.addColorStop(0, c.sky1);
    sky.addColorStop(1, c.sky2);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, CONFIG.HORIZON_Y + 40);

    // Sun/haze disc for warmth
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(W * 0.78, CONFIG.HORIZON_Y * 0.5, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Far skyline (slow parallax)
    this._drawSkyline(ctx, this.skylineSeed.far, c.farBuilding, 0.15, CONFIG.HORIZON_Y + 10, 55);
    // Near skyline (faster parallax)
    this._drawSkyline(ctx, this.skylineSeed.near, c.nearBuilding, 0.35, CONFIG.HORIZON_Y + 55, 95);

    // City name banner (theme indicator baked into the world, e.g. metro sign)
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = c.accent;
    roundRect(ctx, W / 2 - 92, CONFIG.HORIZON_Y - 34, 184, 26, 6);
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 14px 'Baloo 2', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(c.name.toUpperCase(), W / 2, CONFIG.HORIZON_Y - 16);
    ctx.restore();

    // Ground beyond track edges
    ctx.fillStyle = c.platform;
    ctx.fillRect(0, CONFIG.HORIZON_Y, W, H - CONFIG.HORIZON_Y);

    this._drawTrack(ctx, c);
    this._drawPlatformDetails(ctx, c);
  }

  _drawSkyline(ctx, buildings, color, parallax, baseY, maxH) {
    ctx.fillStyle = color;
    const W = CONFIG.CANVAS_WIDTH;
    const offset = -((this.scrollX * parallax) % (W + 300));
    let x = offset - 150;
    let i = 0;
    while (x < W + 150) {
      const b = buildings[i % buildings.length];
      const h = Math.min(b.h, maxH);
      ctx.fillRect(x, baseY - h, b.w, h);
      // simple lit windows
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      for (let wy = baseY - h + 10; wy < baseY - 6; wy += 14) {
        for (let wx = x + 6; wx < x + b.w - 6; wx += 12) {
          if ((Math.floor(wx + wy) % 3) === 0) ctx.fillRect(wx, wy, 4, 6);
        }
      }
      ctx.fillStyle = color;
      x += b.w + 14;
      i++;
    }
  }

  _drawTrack(ctx, c) {
    const W = CONFIG.CANVAS_WIDTH;
    const cx = W / 2;

    // Track bed trapezoid
    const topHalf = Utils.lerp(14, 190, 1) * 0 + 40; // top width small
    const topW = 46, botW = 420;
    ctx.fillStyle = c.track;
    ctx.beginPath();
    ctx.moveTo(cx - topW, CONFIG.HORIZON_Y);
    ctx.lineTo(cx + topW, CONFIG.HORIZON_Y);
    ctx.lineTo(cx + botW / 2, CONFIG.GROUND_Y + 60);
    ctx.lineTo(cx - botW / 2, CONFIG.GROUND_Y + 60);
    ctx.closePath();
    ctx.fill();

    // Edge rails (accent colour, gives "metro track" signage feel)
    ctx.strokeStyle = c.trackEdge;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - topW, CONFIG.HORIZON_Y);
    ctx.lineTo(cx - botW / 2, CONFIG.GROUND_Y + 60);
    ctx.moveTo(cx + topW, CONFIG.HORIZON_Y);
    ctx.lineTo(cx + botW / 2, CONFIG.GROUND_Y + 60);
    ctx.stroke();

    // Lane divider ties scrolling toward camera for a sense of speed
    const tieCount = 14;
    const cycle = (this.scrollX * 2.2) % 1;
    for (let i = 0; i < tieCount; i++) {
      const z = (i + cycle) / tieCount;
      const y = Utils.screenYAtZ(z);
      const halfW = Utils.lerp(topW, botW / 2, z * z);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(cx - halfW, y, halfW * 2, Utils.lerp(2, 10, z));
    }
  }

  _drawPlatformDetails(ctx, c) {
    const W = CONFIG.CANVAS_WIDTH;
    // Platform pillars on both sides for metro-station atmosphere
    const cycle = (this.scrollX * 3) % 1;
    for (let i = 0; i < 6; i++) {
      const z = (i + cycle) / 6;
      const y = Utils.screenYAtZ(z);
      const scale = Utils.scaleAtZ(z);
      const pillarW = 14 * scale;
      const pillarH = 90 * scale;
      ctx.fillStyle = c.nearBuilding;
      ctx.fillRect(10, y - pillarH, pillarW, pillarH);
      ctx.fillRect(W - 10 - pillarW, y - pillarH, pillarW, pillarH);
      ctx.fillStyle = c.accent;
      ctx.fillRect(10, y - pillarH, pillarW, 6 * scale);
      ctx.fillRect(W - 10 - pillarW, y - pillarH, pillarW, 6 * scale);
    }
  }
}
