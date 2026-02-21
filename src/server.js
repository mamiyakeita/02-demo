const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, "../deploy/_site")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../deploy/_site/index.html"));
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
