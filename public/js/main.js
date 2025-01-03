const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const allusersHtml = document.getElementById("allusers")
const localVideo =document.getElementById("localVideo");
const remoteVideo =document.getElementById("remoteVideo");
const endCallBtn = document.getElementById("end-call-btn");
const socket = io();
let localStream;
let caller = [];

const PeerConnection = (function (){
    let peerconnection;

    const createPeerConnection = () => {
        const config = {
            iceServers: [
                {
                    urls: "stun:stun2.l.google.com:19302"
                }
            ]
        }
        peerconnection = new RTCPeerConnection(config);
        localStream.getTracks().forEach((track) => {
            peerconnection.addTrack(track , localStream);
        })
        peerconnection.ontrack = function (event) {
            remoteVideo.srcObject = event.streams[0];
        }
        peerconnection.onicecandidate = function (event) {
            if(event.candidate) {
            socket.emit("icecandidate", event.candidate);
            }
        }
        return peerconnection;
    }
    return {
        getInstance: () => {
            if(!peerconnection){
                peerconnection = createPeerConnection ();
            }
            return peerconnection;
        }
    }
})();





createUserBtn.addEventListener("click", (e) => {
    if( username.value !== ""){
        const usernameContainer = document.querySelector(".username-input");
        socket.emit("join-user", username.value);
        usernameContainer.style.display ="none";
    }
})
endCallBtn.addEventListener("click", (e) => {
    socket.emit("call-ended", caller);
    endCall();
})

socket.on("joined", allusers =>{
    console.log({allusers});


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

socket.on("offer", async({from ,to, offer}) =>{
    const pc= PeerConnection.getInstance();
    await pc.setRemoteDescription(offer);
    const answer=await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", {from, to, answer: pc.localDescription});
    caller = {from, to};
})
socket.on("answer", async({from , to, answer}) => {
    const pc= PeerConnection.getInstance();
    await pc.setRemoteDescription(answer);
    endCallBtn.style.display = "block";
    socket.emit("end-call", {from, to});
    caller = {from, to};
})

socket.on("icecandidate", async candidate => {
    console.log({ candidate });
    const pc = PeerConnection.getInstance();
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
})

socket.on("end-call", ({from, to})=> {
    endCallBtn.classList.remove("d-none");
})

socket.on("call-ended", ()=> {
    console.log("call ended by other party");
    endCall();
})

const startCall =async(user) => {
    console.log({user})
    const pc = PeerConnection.getInstance();
    const offer = await pc.createOffer();
    console.log({offer});
    await pc.setLocalDescription(offer)
    socket.emit("offer", {from: username.value, to: user, offer : pc.localDescription});
}


const endCall = () => {
    const pc= PeerConnection.getInstance();
    if(pc){
        pc.close();
        peerconnection = null;
    }
    caller =[];
    remoteVideo.srcObject = null;
    endCallBtn.classList.add("d-none");
}

const startMyVideo = async() => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        console.log({stream});
        localStream = stream;
        localVideo.srcObject = stream;
    } catch (error) {
        console.log("error in accessing media devices:", error);
    }
}
startMyVideo ();


    
// const screenShareBtn = document.getElementById('screenShareBtn');
// let isSharingScreen = false;

// screenShareBtn.addEventListener('click', async() => {
//     const peerConnection = PeerConnection.getInstance();
//     if (!isSharingScreen) {
//         await shareScreen(PeerConnection.getInstance(), localStream);
//         screenShareBtn.innerText = "Stop Sharing";
//         isSharingScreen = true;
//     } else {
        
//         screenShareBtn.innerText = "Share Screen";
//         isSharingScreen = false;
//     }
// });

