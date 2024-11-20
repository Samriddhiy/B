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
    })
})


server.listen(process.env.PORT , () => {
    console.log(`Server is listening on port: ${process.env.PORT}`);
})