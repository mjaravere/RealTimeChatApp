import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "http://localhost:3000" } });

interface UserData {
  user: string;
  text: string;
}

const messages: UserData[] = [];

io.on("connection", (socket: Socket) => {
  console.log("Kasutaja ühendatud:", socket.id);

  socket.emit("messageHistory", messages);

  let username = "Anonymous";

  socket.on("setUsername", (user: string) => {
    username = (user || "Anonymous").trim();
    if (username.length > 20) {
      username = username.slice(0, 20);
    }
    if (!username) {
      username = "Anonymous";
    }
    console.log(`Kasutaja ${socket.id} nimi: ${username}`);
  });

  socket.on("message", (data: UserData) => {
    const message = { user: username, text: data.text };
    console.log("Sõnum saadetud:", message);
    messages.push(message);
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("Kasutaja lahkunud:", socket.id);
  });
});

httpServer.listen(5000, () => {
  console.log("Server töötab pordil 5000");
});