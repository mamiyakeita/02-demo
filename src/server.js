const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// 静的ファイル（public フォルダ）
app.use(express.static(path.join(__dirname, "public")));

// DB テスト用
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("DBエラー:", err);
    res.status(500).send("エラーだよ～！");
  }
});

// WebSocket（部屋機能）
io.on("connection", socket => {
  console.log("接続:", socket.id);

  socket.on("joinRoom", roomId => {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (room && room.size >= 2) {
      socket.emit("roomFull");
      return;
    }

    socket.join(roomId);
    socket.roomId = roomId;

    socket.emit("joinedRoom", roomId);
    console.log(`${socket.id} が部屋 ${roomId} に参加`);
  });

  socket.on("playerAction", data => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit("playerAction", data);
  });

  socket.on("disconnect", () => {
    console.log("切断:", socket.id);
  });
});

// Render 用ポート
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
