const CELLS_COUNT = 20;
const BORDER_WIDTH = 1;
const CELL_WIDTH = 30;
const CANVAS_WIDTH = CELLS_COUNT * CELL_WIDTH + CELLS_COUNT * BORDER_WIDTH;

function draw() {
  const canvas = document.creaetElement('canvas');

  canvas.setAttribute('width', CANVAS_WIDTH);
  canvas.setAttribute('height', CANVAS_WIDTH);

  const ctx = canvas.getContext('2d');

  for (let y = 0; y < CELLS_COUNT; y++) {
    for (let x = 0; x < CELLS_COUNT; x++) {
      ctx.fillRect(
        CELL_WIDTH * x + x * BORDER_WIDTH,
        CELL_WIDTH * y + y * BORDER_WIDTH,
        CELL_WIDTH,
        CELL_WIDTH,
      );
    }
  }

  drawSnake(ctx);
  drawFood(ctx);

  const root = document.querySelector('#root');
  root.append(canvas);
}

function drawSnake(ctx) {
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, 30, 30);
}

function drawFood(ctx) {
  ctx.fillStyle = 'red';
  ctx.fillRect(CELL_WIDTH + 1, 0, 30, 30);
}

draw();
