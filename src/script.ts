let CELLS_COUNT = 10;
let BORDER_WIDTH = 1;
let CELL_WIDTH = 30;
let CANVAS_WIDTH = CELLS_COUNT * (CELL_WIDTH + BORDER_WIDTH);
let TICK = 150;
let BOARD_COLOR = localStorage.getItem('boardColor') ?? '#000';

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

// gcc- line comment/uncomment.
// gC - block comment/uncomment.

function main(): void {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    throw new Error('Canvas 2d context is null');
  }

  const snake = new Snake();
  const food = new Food();
  food.spawn(snake);

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

  setInterval(() => {
    snake.clear(ctx);
    snake.move();
    snake.draw(ctx);

    if (snake.collides(food)) {
      snake.grow();
      food.spawn(snake);
    }

    food.draw(ctx);
  }, TICK);

  const root = document.querySelector('#root');

  if (root === null || !(root instanceof HTMLDivElement)) {
    throw new Error('Unable to find an element with id `root`');
  }

  drawBoard(canvas, root);
  root.append(canvas);

  // ADD EVENT LISTENERS

  const sizeInput = document.querySelector('#sizeInput');

  if (sizeInput === null || !(sizeInput instanceof HTMLInputElement)) {
    throw new Error('sizeInput not found');
  }

  sizeInput.setAttribute('value', String(CELLS_COUNT));

  sizeInput.addEventListener('change', () => {
    const newCellsCount = Number(sizeInput.value);
    const MIN_COUNT = 5, MAX_COUNT = 20; // prettier-ignore

    if (newCellsCount < MIN_COUNT || newCellsCount > MAX_COUNT) {
      return throwErr(
        new Error(`Board size must be in range from ${MIN_COUNT} to ${MAX_COUNT}.`),
      );
    }

    CELLS_COUNT = newCellsCount;
    CANVAS_WIDTH = CELLS_COUNT * (CELL_WIDTH + BORDER_WIDTH);

    food.spawn(snake);
    drawBoard(canvas, root);
  });

  const colorInput = document.querySelector('#boardColor');

  if (colorInput === null || !(colorInput instanceof HTMLInputElement)) {
    throw new Error('colorBoard not found');
  }

  colorInput.setAttribute('value', BOARD_COLOR);

  colorInput.addEventListener('input', () => {
    BOARD_COLOR = colorInput.value;
    drawBoard(canvas, root);

    localStorage.setItem('boardColor', colorInput.value);
  });
}

function drawBoard(canvas: HTMLCanvasElement, root: HTMLDivElement) {
  canvas.setAttribute('width', String(CANVAS_WIDTH));
  canvas.setAttribute('height', String(CANVAS_WIDTH));

  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('Canvas 2d context is null');

  for (let y = 0; y < CELLS_COUNT; y++) {
    for (let x = 0; x < CELLS_COUNT; x++) {
      let xBorder = x * BORDER_WIDTH;
      let yBorder = y * BORDER_WIDTH;
      ctx.fillStyle = BOARD_COLOR;
      ctx.fillRect(
        CELL_WIDTH * x + xBorder,
        CELL_WIDTH * y + yBorder,
        CELL_WIDTH,
        CELL_WIDTH,
      );
    }
  }

  root.style.background = 'peachpuff';
  root.style.maxWidth = CANVAS_WIDTH + 'px';
  root.style.maxHeight = CANVAS_WIDTH + 'px';
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
        //
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
    for (let i = 0; i < this.body.length; i++) {
      ctx.fillRect(this.body[i].x, this.body[i].y, CELL_WIDTH, CELL_WIDTH);
    }
  }

  clear(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = BOARD_COLOR;
    for (let i = 0; i < this.body.length; i++) {
      ctx.fillRect(this.body[i].x, this.body[i].y, CELL_WIDTH, CELL_WIDTH);
    }
  }

  collides(food: Food): boolean {
    return this.body[0].x === food.position.x && this.body[0].y === food.position.y;
  }

  grow(): void {
    const last = this.body[this.body.length - 1];
    switch (this.direction) {
      case Direction.UP:
        this.body.push({ x: last.x, y: last.y + BORDER_WIDTH + CELL_WIDTH });
        break;
      case Direction.DOWN:
        this.body.push({ x: last.x, y: last.y - BORDER_WIDTH - CELL_WIDTH });
        break;
      case Direction.LEFT:
        this.body.push({ x: last.x + BORDER_WIDTH + CELL_WIDTH, y: last.y });
        break;
      case Direction.RIGHT:
        this.body.push({ x: last.x - BORDER_WIDTH - CELL_WIDTH, y: last.y });
        break;
    }
  }
}

class Food {
  // @ts-ignore
  position: Position;

  // constructor() {
  //   this.spawn();
  // }

  spawn(snake: Snake): void {
    const xCell = Math.floor(Math.random() * CELLS_COUNT);
    const yCell = Math.floor(Math.random() * CELLS_COUNT);

    const position = {
      x: (CELL_WIDTH + BORDER_WIDTH) * xCell,
      y: (CELL_WIDTH + BORDER_WIDTH) * yCell,
    };

    for (let i = 0; i < snake.body.length; i++) {
      if (position.x === snake.body[i].x && position.y === snake.body[i].y) {
        this.spawn(snake);
      }
    }

    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.position.x, this.position.y, CELL_WIDTH, CELL_WIDTH);
  }
}

// Handle errors in callbacks.
function throwErr(error: Error) {
  alert(error.stack);
}

// Handle errors inside main.
try {
  main();
} catch (err) {
  if (err instanceof Error) {
    alert(err.stack);
  }
}
