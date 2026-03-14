# Snake

Run a local static server from the repo root:

```bash
py -m http.server 8000
```

Open [http://localhost:8000/docs/snake/](http://localhost:8000/docs/snake/).

Controls:

- Arrow keys or `WASD` to move
- `Space` to pause/resume
- `R` or the Restart button to reset

Manual checks:

- movement works without scrolling the page
- pause and restart work from running, paused, and game-over states
- collisions with walls or the snake body end the round
- food increases score and never spawns on the snake
