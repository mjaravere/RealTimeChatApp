import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Kasutaja ühendatud:", socket.id);

  socket.on("message", (msg: string) => {
    console.log("Sõnum saadud:", msg);
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Kasutaja lahkunud:", socket.id);
  });
});

httpServer.listen(5000, () => {
  console.log("Server töötab pordil 5000");
});