const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

let users = {};
// { socketId: { username, avatar } }

// When someone connects
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // When user joins with username + avatar
  socket.on("join", ({ username, avatar }) => {
    users[socket.id] = { username, avatar };

    // Notify others
    socket.broadcast.emit("user-joined", {
      username,
      avatar,
    });

    // Send online users list
    io.emit("online-users", Object.values(users));
  });

  // When user sends a message
  socket.on("chat-message", (msg) => {
    const user = users[socket.id];
    if (!user) return;

    io.emit("chat-message", {
      text: msg,
      username: user.username,
      avatar: user.avatar,
      time: new Date().toLocaleTimeString(),
    });
  });

  // When user disconnects
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      io.emit("user-left", user.username);
      delete users[socket.id];
    }

    // Update online users
    io.emit("online-users", Object.values(users));
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

