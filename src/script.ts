const CELLS_COUNT = 20;
const BORDER_WIDTH = 1;
const CELL_WIDTH = 30;
const CANVAS_WIDTH = CELLS_COUNT * CELL_WIDTH + CELLS_COUNT * BORDER_WIDTH;

enum Key {
  UP = 'w',
  DOWN = 's',
  LEFT = 'a',
  RIGHT = 'd',
}

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

function draw(): void {
  const canvas = document.createElement('canvas');

  canvas.setAttribute('width', String(CANVAS_WIDTH));
  canvas.setAttribute('height', String(CANVAS_WIDTH));

  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    throw new Error('Canvas 2d context is null');
  }

  const snake = new Snake();

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case Key.UP:
        snake.clear(ctx);
        snake.move(Direction.UP);
        snake.draw(ctx);
        break;
      case Key.DOWN:
        snake.clear(ctx);
        snake.move(Direction.DOWN);
        snake.draw(ctx);
        break;
      case Key.LEFT:
        snake.clear(ctx);
        snake.move(Direction.LEFT);
        snake.draw(ctx);
        break;
      case Key.RIGHT:
        snake.clear(ctx);
        snake.move(Direction.RIGHT);
        snake.draw(ctx);
        break;
    }
  });

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

  snake.draw(ctx);

  const root = document.querySelector('#root');

  if (root === null) {
    throw new Error('Unable to find an element with id `root`');
  }

  root.append(canvas);
}

interface Position {
  x: number;
  y: number;
}

class Snake {
  body: Position[];

  constructor() {
    this.body = [{ x: 0, y: 0 }];
  }

  move(direction: Direction): void {
    const head = this.body[0];

    switch (direction) {
      case Direction.UP:
        if (head.y >= CELL_WIDTH) {
          head.y -= CELL_WIDTH + BORDER_WIDTH;
        }
        break;
      case Direction.DOWN:
        if (head.y <= CANVAS_WIDTH - CELL_WIDTH - CELLS_COUNT * BORDER_WIDTH) {
          head.y += CELL_WIDTH + BORDER_WIDTH;
        }
        break;
      case Direction.LEFT:
        if (head.x >= CELL_WIDTH) {
          head.x -= CELL_WIDTH + BORDER_WIDTH;
        }
        break;
      case Direction.RIGHT:
        if (head.x <= CANVAS_WIDTH - CELL_WIDTH - CELLS_COUNT * BORDER_WIDTH) {
          head.x += CELL_WIDTH + BORDER_WIDTH;
        }
        break;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'green';
    ctx.fillRect(this.body[0].x, this.body[0].y, CELL_WIDTH, CELL_WIDTH);
  }

  clear(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.body[0].x, this.body[0].y, CELL_WIDTH, CELL_WIDTH);
  }
}

draw();
