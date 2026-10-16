const SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

let board = [];
let currentPlayer = BLACK;
let gameOver = false;

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

const boardEl = document.getElementById("board");
const blackCountEl = document.getElementById("blackCount");
const whiteCountEl = document.getElementById("whiteCount");
const turnDisplay = document.getElementById("turnDisplay");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");
const passBtn = document.getElementById("passBtn");

function initBoard() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  // 初期配置
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  currentPlayer = BLACK;
  gameOver = false;
  messageEl.textContent = "";
  passBtn.classList.add("hidden");
  render();
  updateInfo();
}

function isValidMove(row, col, player) {
  if (board[row][col] !== EMPTY) return false;

  const opponent = player === BLACK ? WHITE : BLACK;

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    let foundOpponent = false;

    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
      if (board[r][c] === EMPTY) break;
      if (board[r][c] === opponent) {
        foundOpponent = true;
      } else if (board[r][c] === player) {
        if (foundOpponent) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return false;
}

function getValidMoves(player) {
  const moves = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (isValidMove(r, c, player)) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

function placeDisc(row, col, player) {
  board[row][col] = player;
  const opponent = player === BLACK ? WHITE : BLACK;

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    const toFlip = [];

    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
      if (board[r][c] === EMPTY) break;
      if (board[r][c] === opponent) {
        toFlip.push([r, c]);
      } else if (board[r][c] === player) {
        for (const [fr, fc] of toFlip) {
          board[fr][fc] = player;
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
}

function countDiscs() {
  let black = 0, white = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === BLACK) black++;
      if (board[r][c] === WHITE) white++;
    }
  }
  return { black, white };
}

function updateInfo() {
  const { black, white } = countDiscs();
  blackCountEl.textContent = black;
  whiteCountEl.textContent = white;

  if (gameOver) {
    turnDisplay.textContent = "ゲーム終了";
  } else {
    turnDisplay.textContent = currentPlayer === BLACK ? "黒の番です" : "白の番です";
  }
}

function checkGameOver() {
  const blackMoves = getValidMoves(BLACK);
  const whiteMoves = getValidMoves(WHITE);

  if (blackMoves.length === 0 && whiteMoves.length === 0) {
    gameOver = true;
    const { black, white } = countDiscs();
    if (black > white) {
      messageEl.textContent = `黒の勝ち！ (${black} - ${white})`;
    } else if (white > black) {
      messageEl.textContent = `白の勝ち！ (${white} - ${black})`;
    } else {
      messageEl.textContent = `引き分け！ (${black} - ${white})`;
    }
    passBtn.classList.add("hidden");
    return true;
  }
  return false;
}

function switchTurn() {
  currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;

  const moves = getValidMoves(currentPlayer);
  if (moves.length === 0) {
    // パス可能か確認
    const opponentMoves = getValidMoves(currentPlayer === BLACK ? WHITE : BLACK);
    if (opponentMoves.length === 0) {
      checkGameOver();
    } else {
      messageEl.textContent = (currentPlayer === BLACK ? "黒" : "白") + "は打てる場所がありません。パスしてください。";
      passBtn.classList.remove("hidden");
    }
  } else {
    messageEl.textContent = "";
    passBtn.classList.add("hidden");
  }
  updateInfo();
  render();
}

function handleClick(row, col) {
  if (gameOver) return;
  if (!isValidMove(row, col, currentPlayer)) return;

  placeDisc(row, col, currentPlayer);
  render();
  updateInfo();

  if (!checkGameOver()) {
    switchTurn();
  }
}

function render() {
  boardEl.innerHTML = "";
  const validMoves = gameOver ? [] : getValidMoves(currentPlayer);

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (validMoves.some(([vr, vc]) => vr === r && vc === c)) {
        cell.classList.add("valid");
      }

      if (board[r][c] === BLACK) {
        const disc = document.createElement("div");
        disc.className = "disc black";
        cell.appendChild(disc);
      } else if (board[r][c] === WHITE) {
        const disc = document.createElement("div");
        disc.className = "disc white";
        cell.appendChild(disc);
      }

      cell.addEventListener("click", () => handleClick(r, c));
      boardEl.appendChild(cell);
    }
  }
}

restartBtn.addEventListener("click", initBoard);

passBtn.addEventListener("click", () => {
  if (gameOver) return;
  const moves = getValidMoves(currentPlayer);
  if (moves.length > 0) return; // 打てるのにパスは不可
  messageEl.textContent = "";
  passBtn.classList.add("hidden");
  switchTurn();
});

// 開始
initBoard();
