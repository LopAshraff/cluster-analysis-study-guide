import assert from "node:assert/strict";
import {
  createGameState,
  pickRandomFoodCell,
  queueDirection,
  tickGame
} from "../docs/snake/game.js";

function pickFirstCell(openCells) {
  return openCells[0];
}

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function assertSnakeDoesNotContainFood(state) {
  const occupied = new Set(state.snake.map(cellKey));
  assert.ok(!occupied.has(cellKey(state.food)));
}

{
  const state = createGameState({ pickFoodCell: pickFirstCell });

  assert.equal(state.snake.length, 3);
  assert.equal(state.direction, "right");
  assert.equal(state.queuedDirection, "right");
  assert.equal(state.status, "running");
  assertSnakeDoesNotContainFood(state);
}

{
  const state = createGameState({ pickFoodCell: openCells => openCells.at(-1) });
  const nextState = tickGame(state);

  assert.deepEqual(nextState.snake, [
    { x: 11, y: 10 },
    { x: 10, y: 10 },
    { x: 9, y: 10 }
  ]);
  assert.equal(nextState.score, 0);
}

{
  const state = createGameState({ pickFoodCell: openCells => openCells.at(-1) });
  const queuedState = queueDirection(state, "up");
  const nextState = tickGame(queuedState);

  assert.equal(nextState.direction, "up");
  assert.deepEqual(nextState.snake[0], { x: 10, y: 9 });
}

{
  const state = createGameState({ pickFoodCell: openCells => openCells.at(-1) });
  const queuedState = queueDirection(state, "left");
  const nextState = tickGame(queuedState);

  assert.equal(nextState.direction, "right");
  assert.deepEqual(nextState.snake[0], { x: 11, y: 10 });
}

{
  const state = createGameState({
    pickFoodCell: () => ({ x: 11, y: 10 })
  });
  const nextState = tickGame(state, {
    pickFoodCell: () => ({ x: 0, y: 0 })
  });

  assert.equal(nextState.snake.length, 4);
  assert.equal(nextState.score, 1);
  assert.deepEqual(nextState.food, { x: 0, y: 0 });
  assertSnakeDoesNotContainFood(nextState);
}

{
  const state = {
    ...createGameState({ cols: 4, rows: 4, pickFoodCell: () => ({ x: 0, y: 0 }) }),
    snake: [
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 2 }
    ],
    direction: "right",
    queuedDirection: "right",
    food: { x: 0, y: 0 }
  };
  const nextState = tickGame(state);

  assert.equal(nextState.status, "game-over");
}

{
  const state = {
    ...createGameState({ cols: 5, rows: 5, pickFoodCell: () => ({ x: 4, y: 4 }) }),
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    direction: "up",
    queuedDirection: "left",
    food: { x: 4, y: 4 }
  };
  const nextState = tickGame(state);

  assert.equal(nextState.status, "game-over");
}

{
  const state = {
    ...createGameState({ pickFoodCell: pickFirstCell }),
    status: "paused"
  };
  const nextState = tickGame(state);

  assert.deepEqual(nextState, state);
}

{
  const picked = pickRandomFoodCell(
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    () => 0.6
  );

  assert.deepEqual(picked, { x: 1, y: 0 });
}

console.log("snake logic tests passed");
