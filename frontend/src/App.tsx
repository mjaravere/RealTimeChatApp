import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { format } from "date-fns/format";
import { parseISO } from "date-fns/parseISO";

interface Message {
  user: string;
  text: string;
  timestamp: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUsername = sessionStorage.getItem("username");
    const savedSessionId = sessionStorage.getItem("sessionId");
    if (savedUsername && savedSessionId) {
        setUsername(savedUsername);
        setSessionId(savedSessionId);
        setIsUsernameSet(true);
        const newSocket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000", {
          transports: ["websocket"],
        });
        setSocket(newSocket);
        newSocket.emit("joinSession", { sessionId: savedSessionId, username: savedUsername });
    }
}, []);

  useEffect(() => {
    if (!isUsernameSet || !socket) return;

    socket.on("connect", () => {
      console.log("Connected to backend!");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      setError("Failed to connect to the backend. Please try again.");
    });

    socket.on("sessionCreated", (newSessionId: string) => {
      console.log("Session created:", newSessionId);
      setSessionId(newSessionId);
      sessionStorage.setItem("sessionId", newSessionId);
  });

    socket.on("messageHistory", (history: Message[]) => {
      setMessages(history);
    });

    socket.on("message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });
    
    socket.on("error", (errorMessage: string) => {
      setError(errorMessage);
      setIsUsernameSet(false);
      setSessionId(null);
      setMessages([]);
      sessionStorage.removeItem("sessionId");
      socket.disconnect();
      setSocket(null);
    });

    return () => {
      socket.off("sessionCreated");
      socket.off("messageHistory");
      socket.off("message");
      socket.off("error");
    };
  }, [isUsernameSet, socket]);

  const handleJoinSession = () => {
    const user = usernameInput.trim() || "Anonymous";
    const enteredSessionId = sessionIdInput.trim() || null;
    
    setUsername(user);
    setIsUsernameSet(true);
    sessionStorage.setItem("username", user);

    if (enteredSessionId) {
      setSessionId(enteredSessionId);
      sessionStorage.setItem("sessionId", enteredSessionId);
    }

    const newSocket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000", {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    const sessionData = {
        sessionId: sessionIdInput.trim() || null,
        username: user,
    };
    newSocket.emit("joinSession", sessionData);
  };

  const handleLeaveSession = () => {
    socket?.disconnect();
    setSocket(null);
    setIsUsernameSet(false);
    setSessionId(null);
    setMessages([]);
    setError(null);
    setUsernameInput("");
    sessionStorage.removeItem("sessionId");
    sessionStorage.removeItem("username");
  };

  const sendMessage = () => {
    if (input.trim() && socket) {
      socket.emit("message", { user: username, text: input });
      setInput("");
    }
  };

  if (!isUsernameSet) {
    return (
        <div style={{ padding: "20px" }}>
            <h1>Welcome to Real-Time Chat</h1>
            <div style={{ marginTop: "20px" }}>
                <label>
                    Enter your username:
                    <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
                        style={{ marginLeft: "10px", padding: "5px" }}
                        placeholder="Your username..."
                    />
                </label>
            </div>
            <div style={{ marginTop: "10px" }}>
                <label>
                    Enter session ID (or leave blank to create a new session):
                    <input
                        type="text"
                        value={sessionIdInput}
                        onChange={(e) => setSessionIdInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
                        style={{ marginLeft: "10px", padding: "5px" }}
                        placeholder="Session ID..."
                    />
                </label>
            </div>
            <button
                onClick={handleJoinSession}
                style={{ marginTop: "10px", marginLeft: "10px", padding: "5px 10px" }}
            >
                Join Chat
            </button>
            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
    );
  }

  return (
      <div style={{ padding: "20px" }}>
          <h1>Real-Time Chat</h1>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Session ID:</strong> {sessionId} (Share this with friends to join!)
          <button
              onClick={() => navigator.clipboard.writeText(sessionId || "")}
              style={{ marginLeft: "10px", padding: "5px 10px" }}
          >
              Copy Session ID
          </button>
          </p>
          <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll" }}>
              {messages.map((msg, i) => (
                  <p key={i}>
                      <span style={{ color: "gray", marginRight: "10px" }}>
                          [{format(parseISO(msg.timestamp), "HH:mm:ss")}]
                      </span>
                      <strong>{msg.user}:</strong> {msg.text}
                  </p>
              ))}
          </div>
          <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{ marginTop: "10px", width: "300px" }}
              placeholder="Type your message..."
          />
          <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
              Send
          </button>
          <button
              onClick={handleLeaveSession}
              style={{ marginLeft: "10px", marginTop: "10px", padding: "5px 10px" }}
          >
              Leave Session
          </button>
      </div>
  );
}

export default App;
