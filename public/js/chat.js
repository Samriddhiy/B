const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const chatMessages = document.getElementById("chat-messages");

const socket = io();

socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
});



function sendMessage () {
    const message = messageInput.value.trim();
    console.log("Sending message: ", message);
    if(message) {
        socket.emit("send-message", message);
        messageInput.value = "";
    }
}

function appendMessage(message, sender = "other") {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

socket.on("receive-message", (message) => {
    appendMessage(message, "user");
});


function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", handleKeyPress);
