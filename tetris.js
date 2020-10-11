const canvas = document.getElementById("tetris"),
  context = canvas.getContext("2d");
context.scale(20, 20);

const colors = createColors();
let arena = createMatrix(12, 20);
let player = {
  pos: { x: 1, y: 5 },
  matrix: createPiece(getRandomPiece()),
  score: 0,
};

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;
update();

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "a":
      playerMove(-1);
      break;
    case "d":
      playerMove(+1);
      break;
    case "s":
      playerDrop();
      break;
    case "q":
      playerRotate(-1);
      break;
    case "e":
      playerRotate(+1);
      break;
  }
});

function updateScore() {
  document.getElementById("score").innerText = `Score: ${player.score}`;
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount * 10;
    rowCount *= 2;
    animateCSS('#tetris', 'headShake');
  }
}

function createColors() {
  return [null, "yellow", "blue", "purple", "orange", "cyan", "green", "red"];
}

function getRandomPiece() {
  const letters = ["T", "O", "L", "J", "Z", "S", "I"];
  return letters[Math.floor(Math.random() * letters.length)];
}

function createPiece(letter) {
  switch (letter) {
    case "T":
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
      break;
    case "O":
      return [
        [2, 2],
        [2, 2],
      ];
      break;
    case "L":
      return [
        [0, 0, 0],
        [3, 0, 0],
        [3, 3, 3],
      ];
      break;
    case "J":
      return [
        [0, 0, 0],
        [0, 0, 4],
        [4, 4, 4],
      ];
      break;
    case "Z":
      return [
        [0, 0, 0],
        [5, 5, 0],
        [0, 5, 5],
      ];
      break;
    case "S":
      return [
        [0, 0, 0],
        [0, 6, 6],
        [6, 6, 0],
      ];
      break;
      case "I":
        return [
          [7, 0, 0],
          [7, 0, 0],
          [7, 0, 0],
        ];
        break;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if (dir > 0) {
    matrix.forEach((row) => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerMove(num) {
  player.pos.x += num;
  if (collide(arena, player)) {
    player.pos.x -= num;
  }
}

function playerDrop() {
  let rowCount = 1;
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerReset() {
  player.matrix = createPiece(getRandomPiece());
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

  if (collide(arena, player)) {
    arena.forEach((row) => row.fill(0));
    player.score = 0;
  }
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function createMatrix(w, h) {
  let matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// Draws player position.
function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 }, context);
  drawMatrix(player.matrix, player.pos, context);
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
    dropCounter = 0;
  }
  draw();
  requestAnimationFrame(update);
  updateScore();
}

function drawMatrix(matrix, offset, context) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.querySelector(element);

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd() {
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
  });