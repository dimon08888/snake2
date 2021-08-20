const CELLS_COUNT = 20;
const BORDER_WIDTH = 1;
const CELL_WIDTH = 30;
const CANVAS_WIDTH = CELLS_COUNT * (CELL_WIDTH + BORDER_WIDTH);
const TICK = 100;

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
  const food = new Food();

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case Key.UP:
        snake.direction = Direction.UP;
        break;
      case Key.DOWN:
        snake.direction = Direction.DOWN;
        break;
      case Key.LEFT:
        snake.direction = Direction.LEFT;
        break;
      case Key.RIGHT:
        snake.direction = Direction.RIGHT;
        break;
    }
  });

  for (let y = 0; y < CELLS_COUNT; y++) {
    for (let x = 0; x < CELLS_COUNT; x++) {
      let xBorder = x * BORDER_WIDTH;
      let yBorder = y * BORDER_WIDTH;
      ctx.fillRect(
        CELL_WIDTH * x + xBorder,
        CELL_WIDTH * y + yBorder,
        CELL_WIDTH,
        CELL_WIDTH,
      );
    }
  }

  setInterval(() => {
    snake.clear(ctx);
    snake.move();
    snake.draw(ctx);

    while (snake.collides(food.position)) {
      food.spawn();
    }

    food.draw(ctx);
  }, TICK);

  const root = document.querySelector('#root');

  if (root === null) {
    throw new Error('Unable to find an element with id `root`');
  }

  if (root instanceof HTMLElement) {
    root.style.background = 'peachpuff';
    root.style.maxWidth = CANVAS_WIDTH + 'px';
    root.style.maxHeight = CANVAS_WIDTH + 'px';
  }

  root.append(canvas);
}

type Position = {
  x: number;
  y: number;
};

class Snake {
  body: Position[];
  direction: Direction;

  constructor() {
    this.body = [{ x: 0, y: 0 }];
    this.direction = Direction.RIGHT;
  }

  move(): void {
    const head = this.body[0];

    switch (this.direction) {
      case Direction.UP:
        if (head.y >= CELL_WIDTH) {
          head.y -= CELL_WIDTH + BORDER_WIDTH;
        } else {
          head.y = CANVAS_WIDTH - CELL_WIDTH - BORDER_WIDTH;
        }
        break;
      case Direction.DOWN:
        if (head.y <= CANVAS_WIDTH - CELL_WIDTH - CELLS_COUNT * BORDER_WIDTH) {
          head.y += CELL_WIDTH + BORDER_WIDTH;
        } else {
          head.y = 0;
        }
        break;
      case Direction.LEFT:
        if (head.x >= CELL_WIDTH) {
          head.x -= CELL_WIDTH + BORDER_WIDTH;
        } else {
          head.x = CANVAS_WIDTH - CELL_WIDTH - BORDER_WIDTH;
        }
        break;
      case Direction.RIGHT:
        if (head.x <= CANVAS_WIDTH - CELL_WIDTH - CELLS_COUNT * BORDER_WIDTH) {
          head.x += CELL_WIDTH + BORDER_WIDTH;
        } else {
          head.x = 0;
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

  collides(position: Position): boolean {
    for (let i = 0; i < this.body.length; i++) {
      if (position.x === this.body[i].x && position.y === this.body[i].y) {
        return true;
      }
    }
    return false;
  }
}

class Food {
  // @ts-ignore
  position: Position;

  constructor() {
    this.spawn();
  }

  spawn(): void {
    const xCell = Math.floor(Math.random() * CELLS_COUNT);
    const yCell = Math.floor(Math.random() * CELLS_COUNT);

    const position = {
      x: (CELL_WIDTH + BORDER_WIDTH) * xCell,
      y: (CELL_WIDTH + BORDER_WIDTH) * yCell,
    };

    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.position.x, this.position.y, CELL_WIDTH, CELL_WIDTH);
  }
}

try {
  draw();
} catch (err) {
  alert(err.stack);
}
