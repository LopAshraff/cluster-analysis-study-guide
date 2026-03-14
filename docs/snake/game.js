const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const DEFAULT_DIRECTION = "right";

export function createGameState({ cols = 20, rows = 20, pickFoodCell } = {}) {
  const head = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
  const snake = [
    head,
    { x: head.x - 1, y: head.y },
    { x: head.x - 2, y: head.y }
  ];
  const openCells = getOpenCells(cols, rows, snake);
  const food = selectFoodCell(openCells, pickFoodCell);

  return {
    cols,
    rows,
    snake,
    direction: DEFAULT_DIRECTION,
    queuedDirection: DEFAULT_DIRECTION,
    food,
    score: 0,
    status: food ? "running" : "game-over"
  };
}

export function queueDirection(state, direction) {
  const normalizedDirection = normalizeDirection(direction);

  if (!normalizedDirection || state.status === "game-over") {
    return state;
  }

  const hasPendingTurn =
    state.queuedDirection &&
    state.queuedDirection !== state.direction;

  if (hasPendingTurn) {
    return state;
  }

  if (
    normalizedDirection === state.direction ||
    isOppositeDirection(state.direction, normalizedDirection)
  ) {
    return state;
  }

  return {
    ...state,
    queuedDirection: normalizedDirection
  };
}

export function tickGame(state, { pickFoodCell } = {}) {
  if (state.status !== "running") {
    return state;
  }

  const nextDirection = normalizeDirection(state.queuedDirection) || state.direction;
  const nextHead = moveCell(state.snake[0], nextDirection);
  const isEating = Boolean(state.food) && areCellsEqual(nextHead, state.food);
  const occupiedCells = isEating ? state.snake : state.snake.slice(0, -1);

  if (isOutOfBounds(nextHead, state.cols, state.rows) || cellExists(nextHead, occupiedCells)) {
    return {
      ...state,
      direction: nextDirection,
      queuedDirection: nextDirection,
      status: "game-over"
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  let nextFood = state.food;
  let nextScore = state.score;
  let nextStatus = "running";

  if (isEating) {
    nextScore += 1;
    const openCells = getOpenCells(state.cols, state.rows, nextSnake);

    if (openCells.length === 0) {
      nextFood = null;
      nextStatus = "game-over";
    } else {
      nextFood = selectFoodCell(openCells, pickFoodCell);
    }
  } else {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction: nextDirection,
    queuedDirection: nextDirection,
    food: nextFood,
    score: nextScore,
    status: nextStatus
  };
}

export function pickRandomFoodCell(openCells, rng = Math.random) {
  if (!openCells.length) {
    return null;
  }

  const index = Math.min(
    openCells.length - 1,
    Math.floor(Math.max(0, rng()) * openCells.length)
  );
  const cell = openCells[index];

  return { x: cell.x, y: cell.y };
}

function normalizeDirection(direction) {
  return Object.hasOwn(DIRECTION_VECTORS, direction) ? direction : null;
}

function selectFoodCell(openCells, pickFoodCell) {
  if (!openCells.length) {
    return null;
  }

  if (typeof pickFoodCell === "function") {
    const pickedCell = pickFoodCell(openCells.map(cell => ({ ...cell })));
    if (pickedCell && cellExists(pickedCell, openCells)) {
      return { x: pickedCell.x, y: pickedCell.y };
    }
  }

  return pickRandomFoodCell(openCells);
}

function moveCell(cell, direction) {
  const vector = DIRECTION_VECTORS[direction];
  return {
    x: cell.x + vector.x,
    y: cell.y + vector.y
  };
}

function isOutOfBounds(cell, cols, rows) {
  return cell.x < 0 || cell.x >= cols || cell.y < 0 || cell.y >= rows;
}

function cellExists(targetCell, cells) {
  return cells.some(cell => areCellsEqual(cell, targetCell));
}

function areCellsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function getOpenCells(cols, rows, snake) {
  const occupied = new Set(snake.map(cell => `${cell.x},${cell.y}`));
  const openCells = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        openCells.push({ x, y });
      }
    }
  }

  return openCells;
}

function isOppositeDirection(currentDirection, nextDirection) {
  return (
    (currentDirection === "up" && nextDirection === "down") ||
    (currentDirection === "down" && nextDirection === "up") ||
    (currentDirection === "left" && nextDirection === "right") ||
    (currentDirection === "right" && nextDirection === "left")
  );
}
