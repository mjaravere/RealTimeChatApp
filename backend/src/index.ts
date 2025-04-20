import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { User } from './entities/user';
import { Message } from './entities/message';
import { Session } from "./entities/session";

function generateSessionId(): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  let sessionId = "";

  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      sessionId += characters[randomIndex];
  }

  return sessionId;
}

function generateUniqueSessionId(sessions: Map<string, Session>): string {
  let sessionId: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
      sessionId = generateSessionId();
      attempts++;
      if (attempts > maxAttempts) {
          throw new Error("Unable to generate a unique session ID after maximum attempts");
      }
  } while (sessions.has(sessionId));

  return sessionId;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "http://localhost:3000" } });

interface UserData {
  user: string;
  text: string;
  timestamp: string;
}

interface JoinSessionData {
  sessionId: string | null;
  username: string;
}

const sessions = new Map<string, Session>();

io.on("connection", (socket: Socket) => {
  let user: User | null = null;
  let session: Session | null = null;
  let sessionId: string | null = null;

  socket.on("joinSession", (data: JoinSessionData) => {

    let username = (data.username || "Anonymous").trim();
    if (username.length > 20) {
      username = username.slice(0, 20);
    }
    if (!username) {
      username = "Anonymous";
    }

    if (data.sessionId) {
      session = sessions.get(data.sessionId) ?? null;
      if (!session) {
          socket.emit("error", "Session not found");
          return;
      }
      sessionId = data.sessionId;
    } else {
      sessionId = generateUniqueSessionId(sessions);
      session = new Session();
      sessions.set(sessionId, session);
      socket.emit("sessionCreated", sessionId);
    }

    user = new User(username);
    session.users.set(username, user);
    session.connectedClients++;
    console.log(`User ${username} joined session ${sessionId}, active clients: ${session.connectedClients}`);

    socket.join(sessionId);

    socket.emit("messageHistory", session.messages.map(msg => ({
      user: msg.user,
      text: msg.text,
      timestamp: msg.timestamp,
  })));
  });

  socket.on("message", (data: UserData) => {
    if (!user || !session || !sessionId) return;

    const message = new Message(user.username, data.text);
    console.log(`Message sent in session ${sessionId}:`, message);

    session.messages.push(message);

    io.to(sessionId).emit("message", {
        user: message.user,
        text: message.text,
        timestamp: message.timestamp,
    });
});

socket.on("disconnect", () => {
  if (!user || !session || !sessionId) return;

  session.connectedClients--;
  console.log(`User ${user.username} left session ${sessionId}, active clients: ${session.connectedClients}`);

  session.users.delete(user.username);

  if (session.connectedClients === 0) {
    console.log(`Session ${sessionId} ended, deleted.`);
    sessions.delete(sessionId);
  }

  socket.leave(sessionId);
});
});
httpServer.listen(5000, () => {
  console.log("Server running on port 5000");
});