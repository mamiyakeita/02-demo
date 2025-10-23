const express = require("express");
const http = require("http");
const { Server } = require("socket.io"); // ← ここ！
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server); // ← ここ！

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
  console.log("Socket.IO接続2");
  socket.on("message", msg => {
    console.log("受信2", msg);
    socket.emit("reply", "reply2 " + msg);
  });
});

server.listen(8080, () => {
  console.log("http://localhost:8080 でサーバ起動中！");
});
const express = require("express");
const { Pool } = require("pg");

const port = process.env.PORT || 8080;

// PostgreSQL接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Railwayでは必要！
});

// ルートでDBからデータ取得
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows); // ← JSONで返す！
  } catch (err) {
    console.error("DBエラー:", err);
    res.status(500).send("エラーだよ～！");
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port} でサーバ起動中よ！`);
});
