# Dropping in your own art

The game runs entirely on procedurally-drawn canvas shapes (see
`js/sprites.js`), so it needs **zero** image files to work. If you'd like to
replace any character or object with real artwork, just add a PNG (ideally
with a transparent background) to this folder using **exactly** one of the
filenames below. `AssetLoader` (in `js/sprites.js`) probes for these files on
startup and automatically draws your image instead of the placeholder shape
— no other code changes needed.

| Filename                  | Used for                                  |
|----------------------------|--------------------------------------------|
| `vedant.png`               | Vedant, running/idle pose                  |
| `vedant_jump.png`          | Vedant, mid-jump pose                      |
| `vedant_slide.png`         | Vedant, sliding pose                       |
| `police_dad.png`           | The police-officer dad, running pose       |
| `train.png`                | Train-car obstacle                        |
| `barrier.png`              | Barrier obstacle                           |
| `cone.png`                 | Traffic cone obstacle                      |
| `crate.png`                | Crate obstacle                             |
| `bench.png`                | Bench obstacle                             |
| `pole.png`                 | Signal pole obstacle                       |
| `gate.png`                 | Level-crossing gate (slide-under obstacle) |
| `coin.png`                 | Collectible coin                           |
| `powerup_magnet.png`       | Magnet power-up icon                       |
| `powerup_speed.png`        | Speed boost power-up icon                  |
| `powerup_shield.png`       | Shield power-up icon                       |
| `powerup_sneaker.png`      | Sneaker boost power-up icon                |

Any size works — images are scaled to fit the same footprint as the
placeholder shape they replace. If a file is missing or fails to load, the
game silently falls back to the built-in procedural drawing, so you can
replace assets one at a time.
