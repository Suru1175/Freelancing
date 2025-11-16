let socket;
let username = "";
let avatar = "";
let typingTimeout;

function joinChat() {
  username = document.getElementById("username").value.trim();
  avatar = document.getElementById("avatarUrl").value.trim();

  if (!username) return alert("Enter your name!");

  if (!avatar) {
    avatar = "https://api.dicebear.com/7.x/thumbs/svg?seed=" + username;
  }

  document.getElementById("usernameDiv").classList.add("d-none");
  document.getElementById("chatSection").classList.remove("d-none");

  // CONNECT TO SOCKET.IO SERVER
  socket = io("https://YOUR_PUBLIC_URL");

  // Send join info
  socket.emit("join", { username, avatar });

  // Receive messages
  socket.on("chat-message", (data) => {
    displayMessage(data.username, data.text, data.avatar);
  });

  socket.on("typing", (data) => {
    showTyping(data.username);
  });
}

function sendMessage() {
  const msg = document.getElementById("msgInput").value.trim();
  if (!msg) return;

  socket.emit("chat-message", msg);

  displayMessage(username, msg, avatar);

  document.getElementById("msgInput").value = "";
}

// Display message
function displayMessage(user, text, avatarImg) {
  const messages = document.getElementById("messages");

  const wrap = document.createElement("div");
  wrap.classList.add("d-flex");

  const isMe = user === username;

  if (isMe) wrap.classList.add("justify-content-end");

  const avatarEl = document.createElement("img");
  avatarEl.src = avatarImg;
  avatarEl.classList.add("avatar");
  if (isMe) avatarEl.classList.add("me-avatar");

  const bubble = document.createElement("div");
  bubble.classList.add("chat-msg");
  bubble.classList.add(isMe ? "msg-right" : "msg-left");

  bubble.innerHTML = `
        <div class="username">${user}</div>
        ${text}
    `;

  if (isMe) {
    wrap.appendChild(bubble);
    wrap.appendChild(avatarEl);
  } else {
    wrap.appendChild(avatarEl);
    wrap.appendChild(bubble);
  }

  messages.appendChild(wrap);
  messages.scrollTop = messages.scrollHeight;

  clearTyping();
}

// Typing indicator
document.addEventListener("input", () => {
  if (!socket) return;

  socket.emit("typing", { username });
});

function showTyping(user) {
  const div = document.getElementById("typingStatus");
  div.innerText = `${user} is typing...`;

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    div.innerText = "";
  }, 1500);
}

function clearTyping() {
  document.getElementById("typingStatus").innerText = "";
}
