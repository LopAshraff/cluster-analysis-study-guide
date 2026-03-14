# Snake

Live demo:

- https://lopashraff.github.io/cluster-analysis-study-guide/snake/

Run a local static server from the repo root:

```bash
py -m http.server 8000
```

Open [http://localhost:8000/docs/snake/](http://localhost:8000/docs/snake/).

Controls:

- Desktop: cursor keys to move, `Space` to pause/resume, `R` or Restart to reset
- Mobile: swipe on the board to move, double tap to pause/resume, tap after game over to restart

Manual checks:

- movement works without scrolling the page
- pause and restart work from running, paused, and game-over states
- collisions with walls or the snake body end the round
- food increases score and never spawns on the snake
