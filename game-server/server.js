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
