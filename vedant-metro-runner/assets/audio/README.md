# Swapping in real audio

All sound effects and the background music are synthesized live with the
Web Audio API in `js/audio.js` — there are no audio files to manage, and
nothing to download. This keeps the game fully self-contained.

If you'd like to use real recorded sound/music instead:

1. Drop your files in this folder (e.g. `jump.mp3`, `coin.mp3`, `music.mp3`).
2. In `js/audio.js`, replace the body of the relevant method (e.g.
   `jump()`, `coin()`, `powerup()`, `crash()`, `click()`, `caught()`,
   `shieldBreak()`, `startMusic()`) with an `Audio` element or a Web Audio
   `AudioBufferSourceNode` that plays your file instead of calling
   `this._tone(...)`.
3. Everywhere else in the codebase already calls these same method names
   (`Audio.jump()`, `Audio.coin()`, etc.), so no other files need to change.
