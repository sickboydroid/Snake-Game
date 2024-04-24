const gameGrid = document.querySelector(".game-grid");
const scoreDiv = document.querySelector(".score-value");
const DEFAULT_CELL_SIZE_PIXELS = 30;
const Direction = { LEFT: [0, -1], RIGHT: [0, 1], UP: [-1, 0], DOWN: [1, 0] };
let ROWS = 0;
let COLS = 0;
let food = null;

class Cell {
  constructor() {
    this.element = null;
    this.r = -1;
    this.c = -1;
  }
  set row(r) {
    this.r = mod(r, ROWS);
    this.element.style["grid-row-start"] = `${this.r + 1}`;
  }
  get row() {
    return this.r;
  }
  set col(c) {
    this.c = mod(c, COLS);
    this.element.style["grid-column-start"] = `${this.c + 1}`;
  }
  get col() {
    return this.c;
  }
}

const snake = {
  cells: [],

  get head() {
    return this.cells[0];
  },
  direction: Direction.RIGHT,
};

resetGameGrid();
nextFrame();

function mod(num, mod) {
  return ((num % mod) + mod) % mod;
}

window.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      setDirection(Direction.LEFT);
      break;
    case "ArrowRight":
      setDirection(Direction.RIGHT);
      break;
    case "ArrowUp":
      setDirection(Direction.UP);
      break;
    case "ArrowDown":
      setDirection(Direction.DOWN);
      break;
  }
});

function setDirection(direction) {
  if (snake.cells.length > 1 && areOppositeDirections(direction, snake.direction)) return;
  snake.direction = direction;
}

function areOppositeDirections(dirA, dirB) {
  return dirA[0] * dirB[0] + dirA[1] * dirB[1] === -1;
}

function resetGameGrid(cellSizePixels = DEFAULT_CELL_SIZE_PIXELS) {
  ROWS = Math.ceil(gameGrid.offsetHeight / cellSizePixels);
  COLS = Math.floor(gameGrid.offsetWidth / cellSizePixels);

  [...gameGrid.children].forEach(child => child.remove());
  gameGrid.style["grid-template-rows"] = `repeat(${ROWS}, ${cellSizePixels}px)`;
  gameGrid.style["grid-template-columns"] = `repeat(${COLS}, ${cellSizePixels}px)`;
  spawnSnake();
  spawnFood();
}

function nextFrame() {
  moveSnake();
  if (isSnakeHead(food.row, food.col)) {
    updateScore();
    growSnake();
    spawnFood();
  } else if (isSnakeEatingItself()) {
    gameOver();
    return;
  }
  setTimeout(nextFrame, getTime());
}

function getTime() {
  return 150 / (snake.cells.length * 0.5);
}

function updateScore() {
  scoreDiv.textContent = `${snake.cells.length}`;
}

function isSnakeEatingItself() {
  for (let i = 1; i < snake.cells.length; i++) {
    if (snake.cells[i].row === snake.head.row && snake.cells[i].col === snake.head.col) return true;
  }
}

function gameOver() {
  console.log("GAME OVER");
}

function moveSnake() {
  let newPosition = [snake.head.row + snake.direction[0], snake.head.col + snake.direction[1]];
  for (let i = 0; i < snake.cells.length; i++) {
    const temp = [snake.cells[i].row, snake.cells[i].col];
    snake.cells[i].row = newPosition[0];
    snake.cells[i].col = newPosition[1];
    newPosition = temp;
  }
}

function generateCell(r, c, classList = ["cell"]) {
  if (!classList.some(e => e === "cell")) classList.push("cells");
  const cellDiv = document.createElement("div");
  cellDiv.style["border"] = "1px solid grey";
  cellDiv.classList.add(...classList);
  gameGrid.appendChild(cellDiv);
  const cell = new Cell();
  cell.element = cellDiv;
  cell.row = r;
  cell.col = c;
  return cell;
}

function growSnake() {
  const [row, col] = [snake.cells.at(-1).row, snake.cells.at(-1).col - 1];
  const bodyCell = generateSnakeBodyCell(row, col);
  snake.cells.push(bodyCell);
}

function spawnSnake() {
  const snakeHeadPosition = generateCellPosition();
  const snakeHeadCell = generateSnakeHead(...snakeHeadPosition);
  [snake.row, snake.col] = snakeHeadPosition;
  snake.cells = [snakeHeadCell];
}

function spawnFood() {
  let foodPosition = generateCellPosition();
  while (isSnakeCell(...foodPosition)) foodPosition = generateCellPosition();
  if (!food) food = generateFoodCell(...foodPosition);
  else [food.row, food.col] = foodPosition;
}

function generateCellPosition() {
  return [Math.round(ROWS * Math.random()), Math.round(COLS * Math.random())];
}

function generateFoodCell(r, c) {
  return generateCell(r, c, ["food-cell"]);
}

function generateSnakeBodyCell(r, c) {
  return generateCell(r, c, ["snake-body-cell"]);
}

function generateSnakeHead(r, c) {
  return generateCell(r, c, ["snake-head-cell"]);
}

function isSnakeCell(r, c) {
  return snake.cells.some(cell => cell.row === r && cell.col === c);
}

function isSnakeHead(r, c) {
  return snake.head.row === r && snake.head.col === c;
}

function isFoodCell(r, c) {
  return food.row === r && food.col === c;
}
