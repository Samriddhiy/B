import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io"; 
import { fileURLToPath } from "url";
import { dirname , join } from "path";


dotenv.config({
    path: './.env',
})
import { createServer } from "http";
const app = express ();

const server = createServer(app);
const io = new Server(server);
const allusers= {};


const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static("public"));
app.use(express.static(join(__dirname, "app")));

app.get("/" , (req, res) => {
    console.log("Got Request /");
    res.sendFile(join (__dirname + "/app/index.html"));
})

app.get("/chat", (req, res) => {
    console.log("Got Request /chat");
    res.sendFile(join(__dirname, "app", "chat.html"));
});


io.on("connection", (socket) => {
    console.log(`Someone conneccted to socket server and socket id is ${socket.id}`);
    socket.on("join-user", username => {
        console.log(`${username} joined the socket`);
        allusers[username]={username , id: socket.id};
        io.emit("joined", allusers);
    })

    socket.on("send-message", (message) => {
        console.log("Message received: ", message);
        socket.broadcast.emit("receive-message", message);
    });

    socket.on("offer", ({ from , to, offer }) => {
        console.log({from , to, offer});
        io.to(allusers[to].id).emit("offer", {from, to, offer});
    })

    socket.on("answer", ({from, to, answer}) =>{
        io.to(allusers[from].id).emit("answer", {from, to, answer});
    })

    socket.on("end-call",({from, to}) => {
        io.to(allusers[to].id).emit("end-call", {from, to});
    })

    socket.on("call-ended", (caller) => {
        const [from, to] = caller;
        io.to(allusers[from].id).emit("call-ended", caller);
        io.to(allusers[to].id).emit("call-ended", caller);
        console.log("Call ended by the other party");
    });

    socket.on("icecandidate", candidate => {
        console.log({ candidate});

        socket.broadcast.emit("icecandidate", candidate);
    })

    socket.on("icecandidate", ({ candidate, to }) => {
        if (allusers[to]) {
            io.to(allusers[to].id).emit("icecandidate", candidate);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Socket ID: ${socket.id} disconnected`);
        const disconnectedUser = Object.keys(allusers).find(
            (username) => allusers[username].id === socket.id
        );
        if (disconnectedUser) {
            console.log(`${disconnectedUser} has disconnected`);
            delete allusers[disconnectedUser];
        }
        o.emit("joined", allusers);
    });
})




server.listen(process.env.PORT , () => {
    console.log(`Server is listening on port: ${process.env.PORT}`);
})

