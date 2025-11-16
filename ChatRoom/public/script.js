let socket;
let username = "";
let avatar = "";
let typingTimeout;

function joinChat() {
  username = document.getElementById("username").value.trim();
  avatar = document.getElementById("avatarUrl").value.trim();

  if (!username) return alert("Enter your name!");

  // default avatar if blank
  if (!avatar) {
    avatar = "https://api.dicebear.com/7.x/thumbs/svg?seed=" + username;
  }

  document.getElementById("usernameDiv").classList.add("d-none");
  document.getElementById("chatSection").classList.remove("d-none");

  socket = new WebSocket("wss://YOUR_PUBLIC_URL");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "chat") {
      displayMessage(data.user, data.text, data.avatar);
    }

    if (data.type === "typing") {
      showTyping(data.user);
    }
  };
}

function sendMessage() {
  const msg = document.getElementById("msgInput").value.trim();
  if (!msg) return;

  const data = {
    type: "chat",
    user: username,
    avatar: avatar,
    text: msg,
  };

  socket.send(JSON.stringify(data));
  displayMessage(username, msg, avatar);

  document.getElementById("msgInput").value = "";
}

// WhatsApp-style bubble with avatar
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

// typing broadcast
document.addEventListener("input", () => {
  if (!socket) return;

  socket.send(
    JSON.stringify({
      type: "typing",
      user: username,
    })
  );
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
