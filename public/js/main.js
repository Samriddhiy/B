const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const allusersHtml = document.getElementById("allusers")
const localVideo =document.getElementById("localVideo");
const remoteVideo =document.getElementById("remoteVideo");
const socket = io();
let localStream;

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
})
socket.on("answer", async({from , to, answer}) => {
    const pc= PeerConnection.getInstance();
    await pc.setRemoteDescription(answer);
})

socket.on("icecandidate", async candidate => {
    console.log({ candidate });
    const pc = PeerConnection.getInstance();
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
})

const startCall =async(user) => {
    console.log({user})
    const pc = PeerConnection.getInstance();
    const offer = await pc.createOffer();
    console.log({offer});
    await pc.setLocalDescription(offer)
    socket.emit("offer", {from: username.value, to: user, offer : pc.localDescription});
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