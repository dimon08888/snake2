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

// <number>gg - go to the first line.
// <number>G - go to the last line.
// <percent>%
// <C-o> - jump to previous position.
// <C-i> - jump to next position.

function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: A) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

function throttle<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  return function (...args: A) {
    let previousCall: number | undefined = (fn as any).lastCall;
    (fn as any).lastCall = Date.now();
    if (previousCall === undefined || (fn as any).lastCall - previousCall > ms) {
      fn(...args);
    }
  };
}

const setDirection = debounce((snake: Snake, direction: Direction) => {
  console.log(Direction[direction]);
  snake.direction = direction;
}, 50);

function main(): void {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    throw new Error('Canvas 2d context is null');
  }

  const snake = new Snake();
  const food = new Food('../apple.png');
  food.spawn(snake);

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case Key.UP:
        if (snake.direction !== Direction.DOWN) {
          setDirection(snake, Direction.UP);
        }
        break;
      case Key.DOWN:
        if (snake.direction !== Direction.UP) {
          setDirection(snake, Direction.DOWN);
        }
        break;
      case Key.LEFT:
        if (snake.direction !== Direction.RIGHT) {
          setDirection(snake, Direction.LEFT);
        }
        break;
      case Key.RIGHT:
        if (snake.direction !== Direction.LEFT) {
          setDirection(snake, Direction.RIGHT);
        }
        break;
    }
  });

  const scoreElement = document.querySelector('#score') as Element;
  let STOP = false;

  const intervalId = setInterval(() => {
    if (STOP) return;
    clearBoard(ctx);

    // console.log('MOVE');
    snake.move();
    snake.draw(ctx);

    if (snake.collides(food)) {
      snake.grow();
      food.spawn(snake);
      scoreElement.textContent = String(snake.body.length - 1);
    }
    //
    else if (snake.collidesSelf()) {
      if (window.confirm('Want to play again?')) {
        snake.body.length = 1;
        scoreElement.textContent = String(0);
      } else {
        // window.alert('Bye Bye');
        // console.log('STOP');
        STOP = true;
        clearInterval(intervalId);
      }
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

  clearBoard(ctx);

  root.style.background = 'peachpuff';
  root.style.maxWidth = CANVAS_WIDTH + 'px';
  root.style.maxHeight = CANVAS_WIDTH + 'px';
}

function clearBoard(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
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

  // ------------------------------------------------------------------------------------------
  // |
  // |
  // |
  // |
  // |
  // |                            [*][*][*][*]
  // |                            [*][*][*]   [*]
  // |                               [*][*][*]
  // |
  // |
  // |
  // |
  // |
  // |
  // |
  // |
  // |
  // |
  // |
  // |
  // |
  // |

  move(): void {
    const newHead = { ...this.body[0] };

    switch (this.direction) {
      case Direction.UP:
        if (newHead.y >= CELL_WIDTH) {
          newHead.y -= CELL_WIDTH + BORDER_WIDTH;
        } else {
          newHead.y = CANVAS_WIDTH - CELL_WIDTH - BORDER_WIDTH;
        }
        break;
      case Direction.DOWN:
        if (newHead.y <= CANVAS_WIDTH - CELL_WIDTH - CELLS_COUNT * BORDER_WIDTH) {
          newHead.y += CELL_WIDTH + BORDER_WIDTH;
        } else {
          newHead.y = 0;
        }
        break;
      case Direction.LEFT:
        if (newHead.x >= CELL_WIDTH) {
          newHead.x -= CELL_WIDTH + BORDER_WIDTH;
        } else {
          newHead.x = CANVAS_WIDTH - CELL_WIDTH - BORDER_WIDTH;
        }
        break;
      case Direction.RIGHT:
        if (newHead.x <= CANVAS_WIDTH - CELL_WIDTH - CELLS_COUNT * BORDER_WIDTH) {
          newHead.x += CELL_WIDTH + BORDER_WIDTH;
        } else {
          newHead.x = 0;
        }
        break;
    }

    this.body = [newHead, ...this.body.slice(0, -1)];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.body.length; i++) {
      ctx.fillStyle = 'green';
      ctx.fillRect(this.body[i].x, this.body[i].y, CELL_WIDTH, CELL_WIDTH);
    }
    const [leftEye, rightEye] = this.getEyesPositions();
    drawCircle(ctx, leftEye.x, leftEye.y, CELL_WIDTH * 0.1, 3, '#fff');
    drawCircle(ctx, rightEye.x, rightEye.y, CELL_WIDTH * 0.1, 3, '#fff');
  }

  private getEyesPositions(): [Position, Position] {
    switch (this.direction) {
      case Direction.UP:
        return [
          { x: this.body[0].x + CELL_WIDTH * 0.25, y: this.body[0].y },
          { x: this.body[0].x + CELL_WIDTH * 0.75, y: this.body[0].y },
        ];
      case Direction.DOWN:
        return [
          { x: this.body[0].x + CELL_WIDTH * 0.25, y: this.body[0].y + CELL_WIDTH },
          { x: this.body[0].x + CELL_WIDTH * 0.75, y: this.body[0].y + CELL_WIDTH },
        ];
      case Direction.LEFT:
        return [
          { x: this.body[0].x, y: this.body[0].y + CELL_WIDTH * 0.25 },
          { x: this.body[0].x, y: this.body[0].y + CELL_WIDTH * 0.75 },
        ];
      case Direction.RIGHT:
        return [
          { x: this.body[0].x + CELL_WIDTH, y: this.body[0].y + CELL_WIDTH * 0.25 },
          { x: this.body[0].x + CELL_WIDTH, y: this.body[0].y + CELL_WIDTH * 0.75 },
        ];
    }
  }

  // clear(ctx: CanvasRenderingContext2D): void {
  //   ctx.fillStyle = BOARD_COLOR;
  //   for (let i = 0; i < this.body.length; i++) {
  //     ctx.fillRect(this.body[i].x, this.body[i].y, CELL_WIDTH, CELL_WIDTH);
  //   }
  // }

  collides(food: Food): boolean {
    return this.body[0].x === food.position.x && this.body[0].y === food.position.y;
  }

  collidesSelf(): boolean {
    return this.body
      .slice(1)
      .some((part) => part.x === this.body[0].x && part.y === this.body[0].y);
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

function getRandomPosition(): Position {
  const xCell = Math.floor(Math.random() * CELLS_COUNT);
  const yCell = Math.floor(Math.random() * CELLS_COUNT);
  return {
    x: (CELL_WIDTH + BORDER_WIDTH) * xCell,
    y: (CELL_WIDTH + BORDER_WIDTH) * yCell,
  };
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  strokeWidth: number,
  strokeStyle: string,
) {
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = strokeStyle;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.stroke();
}

class Food {
  // @ts-ignore
  position: Position;
  image: HTMLImageElement;

  constructor(imagePath: string) {
    // this.spawn();
    this.image = new Image();
    this.image.src = imagePath;
  }

  spawn(snake: Snake): void {
    let position = getRandomPosition();

    while (snake.body.some((part) => part.x === position.x && part.y === position.y)) {
      position = getRandomPosition();
    }

    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // ctx.fillStyle = 'red';
    // ctx.fillRect(this.position.x, this.position.y, CELL_WIDTH, CELL_WIDTH);
    ctx.drawImage(this.image, this.position.x, this.position.y, CELL_WIDTH, CELL_WIDTH);
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
