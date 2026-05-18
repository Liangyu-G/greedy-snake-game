const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const gameSpeed = 120;

let snake;
let food;
let direction;
let nextDirection;
let score;
let bestScore = Number(localStorage.getItem('snakeBestScore')) || 0;
let timer = null;
let paused = false;
let gameOver = false;

bestScoreEl.textContent = bestScore;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  paused = false;
  gameOver = false;
  scoreEl.textContent = score;
  pauseBtn.textContent = '暂停';
  placeFood();
  draw();
}

function startGame() {
  clearInterval(timer);
  resetGame();
  timer = setInterval(gameLoop, gameSpeed);
}

function togglePause() {
  if (!timer || gameOver) return;
  paused = !paused;
  pauseBtn.textContent = paused ? '继续' : '暂停';
}

function gameLoop() {
  if (paused || gameOver) return;
  update();
  draw();
}

function update() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (hitWall(head) || hitSelf(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      localStorage.setItem('snakeBestScore', bestScore);
    }
    placeFood();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  ctx.fillStyle = '#ef4444';
  roundRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4, 6);

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? '#22c55e' : '#86efac';
    roundRect(part.x * gridSize + 2, part.y * gridSize + 2, gridSize - 4, gridSize - 4, 5);
  });

  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 12);
    ctx.font = '18px Arial';
    ctx.fillText('点击开始重新挑战', canvas.width / 2, canvas.height / 2 + 24);
  }
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some(part => part.x === food.x && part.y === food.y));
}

function hitWall(position) {
  return position.x < 0 || position.x >= tileCount || position.y < 0 || position.y >= tileCount;
}

function hitSelf(position) {
  return snake.some(part => part.x === position.x && part.y === position.y);
}

function endGame() {
  gameOver = true;
  clearInterval(timer);
  timer = null;
  draw();
}

function changeDirection(newDirection) {
  if (newDirection.x + direction.x === 0 && newDirection.y + direction.y === 0) return;
  nextDirection = newDirection;
}

document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  const directions = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  if (directions[key]) {
    event.preventDefault();
    changeDirection(directions[key]);
  }
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

resetGame();
