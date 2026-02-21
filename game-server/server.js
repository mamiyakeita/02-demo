const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// 静的ファイル（ゲーム画面）
app.use(express.static(path.join(__dirname, "public")));

// WebSocket 接続
io.on("connection", socket => {
  console.log("接続:", socket.id);

  // クライアントからの動作を受け取る
  socket.on("playerAction", data => {
    console.log("受信:", data);

    // 他のプレイヤーに送る
    socket.broadcast.emit("playerAction", data);
  });
});

// Render 用ポート
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
io.on("connection", socket => {
  console.log("接続:", socket.id);

  // 部屋に参加
  socket.on("joinRoom", roomId => {
    const room = io.sockets.adapter.rooms.get(roomId);

    // 部屋が存在していて2人以上なら入れない
    if (room && room.size >= 2) {
      socket.emit("roomFull");
      return;
    }

    socket.join(roomId);
    socket.roomId = roomId;

    console.log(`${socket.id} が部屋 ${roomId} に参加`);
    socket.emit("joinedRoom", roomId);
  });

  // プレイヤーの行動を同じ部屋の相手に送る
  socket.on("playerAction", data => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit("playerAction", data);
  });

  // 切断
  socket.on("disconnect", () => {
    console.log("切断:", socket.id);
  });
});
