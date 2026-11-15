const BLACK = 1;
const WHITE = 2;

const socket = io();

const lobbyEl = document.getElementById("lobby");
const gameEl = document.getElementById("game");
const boardEl = document.getElementById("board");
const blackCountEl = document.getElementById("blackCount");
const whiteCountEl = document.getElementById("whiteCount");
const turnDisplay = document.getElementById("turnDisplay");
const myColorEl = document.getElementById("myColor");
const roomLabel = document.getElementById("roomLabel");
const messageEl = document.getElementById("message");
const lobbyMsg = document.getElementById("lobbyMsg");
const roomInput = document.getElementById("roomInput");

let myColor = null;
let currentState = null;

document.getElementById("createBtn").onclick = () => {
  lobbyMsg.textContent = "部屋を作成中...";
  socket.emit("createRoom");
};

document.getElementById("joinBtn").onclick = () => {
  const code = roomInput.value.trim();
  if (!code) {
    lobbyMsg.textContent = "部屋コードを入力してください";
    return;
  }
  lobbyMsg.textContent = "参加中...";
  socket.emit("joinRoom", code);
};

document.getElementById("leaveBtn").onclick = () => {
  location.reload();
};

socket.on("joined", ({ roomId, color, state }) => {
  myColor = color;
  lobbyEl.classList.add("hidden");
  gameEl.classList.remove("hidden");
  roomLabel.textContent = `部屋: ${roomId}`;
  myColorEl.textContent = color === BLACK ? "あなたは黒" : "あなたは白";
  applyState(state);

  if (!state.players.white) {
    messageEl.textContent = "相手の参加を待っています...";
  }
});

socket.on("state", (state) => {
  applyState(state);
});

socket.on("message", (msg) => {
  messageEl.textContent = msg;
});

socket.on("errorMsg", (msg) => {
  lobbyMsg.textContent = msg;
});

function applyState(state) {
  currentState = state;
  blackCountEl.textContent = state.scores.black;
  whiteCountEl.textContent = state.scores.white;

  if (state.gameOver) {
    turnDisplay.textContent = "終了";
  } else {
    turnDisplay.textContent =
      state.currentPlayer === BLACK ? "黒の番" : "白の番";
  }

  renderBoard(state);
}

function renderBoard(state) {
  boardEl.innerHTML = "";
  const canMove =
    !state.gameOver &&
    state.currentPlayer === myColor &&
    state.players.black &&
    state.players.white;

  const validSet = new Set(
    (state.validMoves || []).map(([r, c]) => `${r},${c}`)
  );

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const isValid = canMove && validSet.has(`${r},${c}`);
      if (isValid) cell.classList.add("valid");

      const v = state.board[r][c];
      if (v === BLACK) {
        const d = document.createElement("div");
        d.className = "disc black";
        cell.appendChild(d);
      } else if (v === WHITE) {
        const d = document.createElement("div");
        d.className = "disc white";
        cell.appendChild(d);
      }

      if (isValid) {
        cell.onclick = () => socket.emit("move", { row: r, col: c });
      }

      boardEl.appendChild(cell);
    }
  }
}
