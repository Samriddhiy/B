const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const allusersHtml = document.getElementById("allusers")

const socket = io();


createUserBtn.addEventListener("click", (e) => {
    if( username.value !== ""){
        const usernameContainer = document.querySelector(".username-input");
        socket.emit("join-user", username.value);
        usernameContainer.style.display ="none";
    }
})

socket.on("joined", allusers =>{
    console.log({allusers});

   // <li>
       //           <span>Samriddhi (You) </span>
        //          <button class="call-btn">
          //          <img width="20" src="/images/phone.png"></img>
          //        </button>
   // </li>



    const createUserHtml = () => {
        allusersHtml.innerHTML= "";
        for(const user in allusers) {
            const li = document.createElement("li");
            li.textContent = `${user} ${ user=== username.value? "(You)" : "" }`;

            if(user!== username.value) {
                const button= document.createElement("button");
                button.classList.add("call-btn");
                button.addEventListener("click", (e) => {
                    startCall(user);
                })
                const img =document.createElement("img");
                img.setAttribute("src", "/images/phone.png");
                img.setAttribute("width", 20);

                button.appendChild(img);

                li.appendChild(button);

            }
            allusersHtml.appendChild(li);
        }
    }
    createUserHtml();
})

