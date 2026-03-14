import { createGameState, queueDirection, tickGame } from "./game.js";

const TICK_MS = 150;
const CELL_SIZE = 20;
const GRID_COLS = 20;
const GRID_ROWS = 20;
const searchParams = new URLSearchParams(window.location.search);

const canvas = document.getElementById("gameBoard");
const context = canvas.getContext("2d");
const scoreValue = document.getElementById("scoreValue");
const statusValue = document.getElementById("statusValue");
const pauseButtons = [...document.querySelectorAll('[data-action="pause"]')];
const restartButtons = [...document.querySelectorAll('[data-action="restart"]')];
const directionButtons = [...document.querySelectorAll("[data-direction]")];

canvas.width = GRID_COLS * CELL_SIZE;
canvas.height = GRID_ROWS * CELL_SIZE;

let state = createGameState({ cols: GRID_COLS, rows: GRID_ROWS });
let accumulatorMs = 0;
let lastFrameTime = performance.now();
let manualTimeMode =
  searchParams.get("manual") === "1" ||
  searchParams.get("manual") === "true";

function restartGame() {
  state = createGameState({ cols: state.cols, rows: state.rows });
  accumulatorMs = 0;
  render();
}

function togglePause() {
  if (state.status === "game-over") {
    return;
  }

  state = {
    ...state,
    status: state.status === "paused" ? "running" : "paused"
  };
  accumulatorMs = 0;
  render();
}

function applyDirection(direction) {
  state = queueDirection(state, direction);
  render();
}

function stepSimulation(ms) {
  if (state.status !== "running") {
    accumulatorMs = 0;
    render();
    return;
  }

  accumulatorMs += ms;

  while (accumulatorMs >= TICK_MS) {
    state = tickGame(state);
    accumulatorMs -= TICK_MS;

    if (state.status !== "running") {
      accumulatorMs = 0;
      break;
    }
  }

  render();
}

function render() {
  drawBoard();
  scoreValue.textContent = String(state.score);
  statusValue.textContent = describeStatus(state.status);
  pauseButtons.forEach(button => {
    button.textContent = state.status === "paused" ? "Resume" : "Pause";
    button.disabled = state.status === "game-over";
  });
}

function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fffaf2";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(217, 205, 189, 0.9)";
  context.lineWidth = 1;
  for (let column = 0; column <= state.cols; column += 1) {
    const x = column * CELL_SIZE;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  for (let row = 0; row <= state.rows; row += 1) {
    const y = row * CELL_SIZE;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  if (state.food) {
    drawCell(state.food, "#c2410c", 5);
  }

  state.snake.forEach((cell, index) => {
    drawCell(cell, index === 0 ? "#164e63" : "#0f766e", 4);
  });
}

function drawCell(cell, fillStyle, inset) {
  context.fillStyle = fillStyle;
  context.fillRect(
    cell.x * CELL_SIZE + inset,
    cell.y * CELL_SIZE + inset,
    CELL_SIZE - inset * 2,
    CELL_SIZE - inset * 2
  );
}

function describeStatus(status) {
  if (status === "paused") {
    return "Paused";
  }

  if (status === "game-over") {
    return "Game over";
  }

  return "Running";
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  const directionByKey = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right"
  };

  if (key in directionByKey) {
    event.preventDefault();
    applyDirection(directionByKey[key]);
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  if (key === "r") {
    event.preventDefault();
    restartGame();
  }
}

function startAnimationLoop(now) {
  const elapsedMs = Math.min(now - lastFrameTime, 500);
  lastFrameTime = now;

  if (!manualTimeMode) {
    stepSimulation(elapsedMs);
  }

  window.requestAnimationFrame(startAnimationLoop);
}

directionButtons.forEach(button => {
  button.addEventListener("click", () => {
    applyDirection(button.dataset.direction);
  });
});

pauseButtons.forEach(button => button.addEventListener("click", togglePause));
restartButtons.forEach(button => button.addEventListener("click", restartGame));
window.addEventListener("keydown", handleKeydown, { passive: false });

window.render_game_to_text = () =>
  JSON.stringify({
    board: { cols: state.cols, rows: state.rows },
    status: state.status,
    score: state.score,
    direction: state.direction,
    snake: state.snake.map(cell => ({ x: cell.x, y: cell.y })),
    food: state.food ? { x: state.food.x, y: state.food.y } : null,
    origin: "top-left; x increases rightward; y increases downward"
  });

window.advanceTime = ms => {
  manualTimeMode = true;
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  stepSimulation(safeMs);
  lastFrameTime = performance.now();
  return window.render_game_to_text();
};

render();
window.requestAnimationFrame(startAnimationLoop);
