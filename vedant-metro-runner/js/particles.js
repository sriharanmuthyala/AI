/**
 * particles.js
 * Lightweight particle burst system for juicy feedback: coin sparkles,
 * dust puffs on landing, and a comic crash burst.
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  burst(x, y, opts = {}) {
    const {
      count = 10,
      color = "#ffd23f",
      speed = 3,
      life = 500,
      size = 4,
      gravity = 0.15,
      shape = "circle"
    } = opts;
    for (let i = 0; i < count; i++) {
      const a = Utils.rand(0, Math.PI * 2);
      const sp = Utils.rand(speed * 0.4, speed);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - speed * 0.3,
        gravity,
        life,
        age: 0,
        size: Utils.rand(size * 0.6, size),
        color,
        shape
      });
    }
  }

  crashBurst(x, y) {
    this.burst(x, y, { count: 16, color: "#ffb63f", speed: 6, life: 650, size: 6, shape: "star" });
    this.burst(x, y, { count: 10, color: "#ff5a3c", speed: 4, life: 500, size: 5, shape: "circle" });
  }

  coinBurst(x, y) {
    this.burst(x, y, { count: 8, color: "#fff6c8", speed: 3.2, life: 380, size: 3.5 });
  }

  powerupBurst(x, y, color) {
    this.burst(x, y, { count: 14, color, speed: 4.5, life: 550, size: 5, shape: "star" });
  }

  dust(x, y) {
    this.burst(x, y, { count: 4, color: "rgba(255,255,255,0.6)", speed: 1.6, life: 300, size: 3, gravity: 0 });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      const t = p.age / p.life;
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = p.color;
      if (p.shape === "star") {
        star(ctx, p.x, p.y, p.size * (1 - t * 0.4));
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - t * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
}
