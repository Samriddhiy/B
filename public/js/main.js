const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const socket = io();


createUserBtn.addEventListener("click", (e) => {
    if( username.value !== ""){
        const usernameContainer = document.querySelector(".username-input");
        socket.emit("join-user", username.value);
        usernameContainer.style.display ="none";
    }
})