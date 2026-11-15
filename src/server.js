const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

// roomId -> room
const rooms = new Map();

function createEmptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
}

function initBoard() {
  const board = createEmptyBoard();
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  return board;
}

function isValidMove(board, row, col, player) {
  if (board[row][col] !== EMPTY) return false;
  const opponent = player === BLACK ? WHITE : BLACK;

  for (const [dr, dc] of DIRS) {
    let r = row + dr;
    let c = col + dc;
    let found = false;

    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
      if (board[r][c] === EMPTY) break;
      if (board[r][c] === opponent) {
        found = true;
      } else if (board[r][c] === player) {
        if (found) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return false;
}

function getValidMoves(board, player) {
  const moves = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (isValidMove(board, r, c, player)) moves.push([r, c]);
    }
  }
  return moves;
}

function placeDisc(board, row, col, player) {
  board[row][col] = player;
  const opponent = player === BLACK ? WHITE : BLACK;

  for (const [dr, dc] of DIRS) {
    let r = row + dr;
    let c = col + dc;
    const toFlip = [];

    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
      if (board[r][c] === EMPTY) break;
      if (board[r][c] === opponent) {
        toFlip.push([r, c]);
      } else if (board[r][c] === player) {
        for (const [fr, fc] of toFlip) board[fr][fc] = player;
        break;
      }
      r += dr;
      c += dc;
    }
  }
}

function countDiscs(board) {
  let black = 0, white = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === BLACK) black++;
      if (board[r][c] === WHITE) white++;
    }
  }
  return { black, white };
}

function makeRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function publicState(room) {
  return {
    board: room.board,
    currentPlayer: room.currentPlayer,
    validMoves: getValidMoves(room.board, room.currentPlayer),
    scores: countDiscs(room.board),
    gameOver: room.gameOver,
    winner: room.winner,
    players: {
      black: !!room.players.black,
      white: !!room.players.white
    }
  };
}

function checkGameOver(room) {
  const blackMoves = getValidMoves(room.board, BLACK);
  const whiteMoves = getValidMoves(room.board, WHITE);

  if (blackMoves.length === 0 && whiteMoves.length === 0) {
    room.gameOver = true;
    const { black, white } = countDiscs(room.board);
    if (black > white) room.winner = BLACK;
    else if (white > black) room.winner = WHITE;
    else room.winner = 0; // draw
    return true;
  }
  return false;
}

// 静的ファイル配信（Eleventyの出力先）
app.use(express.static(path.join(__dirname, "../deploy/_site")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../deploy/_site/index.html"));
});

io.on("connection", (socket) => {
  let joinedRoomId = null;
  let myColor = null;

  socket.on("createRoom", () => {
    const roomId = makeRoomId();
    const room = {
      board: initBoard(),
      currentPlayer: BLACK,
      gameOver: false,
      winner: null,
      players: { black: socket.id, white: null }
    };
    rooms.set(roomId, room);
    joinedRoomId = roomId;
    myColor = BLACK;
    socket.join(roomId);

    socket.emit("joined", {
      roomId,
      color: BLACK,
      state: publicState(room)
    });
  });

  socket.on("joinRoom", (roomId) => {
    roomId = String(roomId || "").trim().toUpperCase();
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("errorMsg", "部屋が見つかりません");
      return;
    }
    if (room.players.white) {
      socket.emit("errorMsg", "この部屋は満員です");
      return;
    }

    room.players.white = socket.id;
    joinedRoomId = roomId;
    myColor = WHITE;
    socket.join(roomId);

    socket.emit("joined", {
      roomId,
      color: WHITE,
      state: publicState(room)
    });

    // 両者に対戦開始を通知
    io.to(roomId).emit("state", publicState(room));
    io.to(roomId).emit("message", "対戦開始！黒の番です");
  });

  socket.on("move", ({ row, col }) => {
    const room = rooms.get(joinedRoomId);
    if (!room || room.gameOver) return;
    if (room.currentPlayer !== myColor) return;
    if (!isValidMove(room.board, row, col, myColor)) return;

    placeDisc(room.board, row, col, myColor);

    if (!checkGameOver(room)) {
      // 手番交代（相手に合法手がなければパス）
      let next = myColor === BLACK ? WHITE : BLACK;
      if (getValidMoves(room.board, next).length === 0) {
        // 相手パス → 自分に戻す
        if (getValidMoves(room.board, myColor).length === 0) {
          checkGameOver(room);
        } else {
          // 相手はパス、手番は自分のまま…ではなく、通知して交代扱い
          io.to(joinedRoomId).emit("message", (next === BLACK ? "黒" : "白") + "はパスです");
          next = myColor; // 実際には次の合法手がある側へ
          // シンプルに: パスした側を飛ばす
          next = myColor;
        }
      }
      room.currentPlayer = next === myColor
        ? myColor
        : (myColor === BLACK ? WHITE : BLACK);

      // 正しいパス処理
      room.currentPlayer = myColor === BLACK ? WHITE : BLACK;
      if (getValidMoves(room.board, room.currentPlayer).length === 0) {
        const other = room.currentPlayer === BLACK ? WHITE : BLACK;
        if (getValidMoves(room.board, other).length === 0) {
          checkGameOver(room);
        } else {
          io.to(joinedRoomId).emit(
            "message",
            (room.currentPlayer === BLACK ? "黒" : "白") + "は打てないのでパス"
          );
          room.currentPlayer = other;
        }
      }
    }

    io.to(joinedRoomId).emit("state", publicState(room));

    if (room.gameOver) {
      const { black, white } = countDiscs(room.board);
      let msg = "引き分け";
      if (room.winner === BLACK) msg = `黒の勝ち！ (${black} - ${white})`;
      if (room.winner === WHITE) msg = `白の勝ち！ (${white} - ${black})`;
      io.to(joinedRoomId).emit("message", msg);
    }
  });

  socket.on("disconnect", () => {
    if (!joinedRoomId) return;
    const room = rooms.get(joinedRoomId);
    if (!room) return;

    if (room.players.black === socket.id) room.players.black = null;
    if (room.players.white === socket.id) room.players.white = null;

    io.to(joinedRoomId).emit("message", "相手が切断しました");
    io.to(joinedRoomId).emit("state", publicState(room));

    if (!room.players.black && !room.players.white) {
      rooms.delete(joinedRoomId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
