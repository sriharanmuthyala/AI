# Vedant's Metro Runner 🏃‍♂️👮

A bright, teen-friendly 2D endless runner built with plain HTML, CSS and
JavaScript (Canvas 2D — no game engine or build step required). Vedant
dashes through pseudo-3D metro tracks inspired by **Hyderabad** and
**Melbourne**, dodging obstacles and collecting coins while his
comically strict police-officer dad chases him down the platform.

The whole game — art and audio included — is generated in code, so it
runs immediately with nothing to install or download.

## Running it locally

You need a static file server (opening `index.html` directly with
`file://` will block the JS modules in some browsers, so serve it):

```bash
cd vedant-metro-runner
python3 -m http.server 8080
# then open http://localhost:8080 in your browser
```

Any static server works just as well, e.g. `npx serve .` or the VS Code
"Live Server" extension.

## Controls

| Action       | Desktop        | Mobile                          |
|--------------|----------------|----------------------------------|
| Move lanes   | ← / →          | Swipe left/right, or on-screen buttons |
| Jump         | ↑ / Space      | Swipe up, or on-screen button    |
| Slide        | ↓              | Swipe down, or on-screen button  |
| Pause        | P / Esc        | Pause button in the HUD          |

## Folder structure

```
vedant-metro-runner/
├── index.html              All screens (loading/start/instructions/game/pause/game-over)
├── css/
│   └── style.css           Responsive, mobile-first UI styling
├── js/
│   ├── config.js           All tunable numbers (speeds, spawn rates, colors, achievements)
│   ├── utils.js             Perspective/math helpers shared by every renderer
│   ├── storage.js           localStorage high-score wrapper
│   ├── audio.js              Synthesized SFX + music (Web Audio API, no files needed)
│   ├── input.js              Keyboard, swipe, and on-screen button handling
│   ├── sprites.js            All procedural drawing + optional custom-image loader
│   ├── background.js         Parallax metro backdrop, Hyderabad/Melbourne themes
│   ├── particles.js          Coin sparkle / crash burst / dust effects
│   ├── entities.js            Player, Chaser (police dad), Obstacle, Coin, PowerUp
│   ├── ui.js                  Screen switching, HUD, achievement toast, game-over panel
│   ├── game.js                 Core state machine: spawning, collisions, scoring, difficulty
│   └── main.js                  Bootstraps everything and runs the render loop
└── assets/
    ├── images/README.md        How to drop in your own character/obstacle art
    └── audio/README.md         How to swap synthesized audio for real files
```

## Replacing Vedant / the police dad with your own art

Everything visual is drawn with plain canvas shapes in `js/sprites.js` so
the game needs no image assets to run — but it's built so you can swap in
real artwork with zero code changes. See **`assets/images/README.md`** for
the exact filenames to drop in (`vedant.png`, `vedant_jump.png`,
`vedant_slide.png`, `police_dad.png`, plus one per obstacle/coin/power-up).
`AssetLoader` in `sprites.js` automatically prefers a matching image over
the procedural drawing whenever one is present.

Similarly, `assets/audio/README.md` explains how to replace the
synthesized sound effects/music in `js/audio.js` with real audio files.

## Gameplay notes

- **Obstacles**: cones, crates, barriers & benches are jumped over;
  crossing gates are slid under; trains & signal poles block an entire
  lane and must be dodged by switching lanes.
- **Power-ups**: Magnet (pulls in coins), Speed Boost (temporary faster
  run + score multiplier), Shield (blocks exactly one hit), Sneaker Boost
  (higher jumps).
- **Chaser**: the police-dad chaser sits a comic step behind Vedant and
  lunges closer after near misses. He also creeps gradually closer the
  longer a single run goes on — so an extremely long run raises real
  stakes, not just an ever-increasing score.
- **Achievements**: "Metro Rookie" (300m), "Track Master" (900m), "City
  Sprinter" (1800m), "Unstoppable Vedant" (3000m) — shown once per run as
  a toast.
- **High score** persists in `localStorage`.

## Suggested improvements for v2

1. **Real sprite animation frames** — replace the procedural stick-figure
   draw calls with actual sprite-sheet frames (still drop-in compatible
   via `assets/images/`) for a more polished, less "vector" look.
2. **Daily challenges / missions** — e.g. "collect 50 coins" or "survive
   1000m without a shield" for extra replay value beyond chasing a high
   score.
3. **Combo/multiplier system** — reward chained coin pickups or
   consecutive clean dodges with a score multiplier, encouraging skillful
   play rather than just survival time.
4. **More power-ups & obstacle variety** — a "time freeze" that briefly
   slows the dad down, moving obstacles (a train pulling into a platform
   lane), or branching track forks.
5. **Online leaderboard** — swap the local-only high score for a small
   backend (or a service like Firebase) so players can compare runs with
   friends, plus shareable "I ran Xm from Dad!" result cards.
