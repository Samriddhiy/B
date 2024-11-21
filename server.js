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

app.get("/" , (req, res) => {
    console.log("Got Request /");
    res.sendFile(join (__dirname + "/app/index.html"));
})

io.on("connection", (socket) => {
    console.log(`Someone conneccted to socket server and socket id is ${socket.id}`);
    socket.on("join-user", username => {
        console.log(`${username} joined the socket`);
        allusers[username]={username , id: socket.id};
        io.emit("joined", allusers);
    })

    socket.on("offer", ({ from , to, offer }) => {
        console.log({from , to, offer});
        io.to(allusers[to].id).emit("offer", {from, to, offer});
    })

    socket.on("answer", ({from, to, answer}) =>{
        io.to(allusers[from].id).emit("answer", {from, to, answer});
    })

    socket.on("icecandidate", candidate => {
        console.log({ candidate});

        socket.broadcast.emit("icecandidate", candidate);
    })
})


server.listen(process.env.PORT , () => {
    console.log(`Server is listening on port: ${process.env.PORT}`);
})