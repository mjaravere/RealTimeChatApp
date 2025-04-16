import { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { format } from "date-fns/format";
import { parseISO } from "date-fns/parseISO";
import styles from "./App.module.css";

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
  const [isLoading, setIsLoading] = useState(false);
  const messageAreaRef = useRef<HTMLDivElement>(null);

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
      setIsLoading(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      setError("Failed to connect to the backend. Please try again.");
      setIsLoading(false);
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

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages]);

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

    setIsLoading(true);
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
        <div className={styles.container}>
          <div className={`${styles.card} ${styles.cardNarrow}`}>
            <h1 className={styles.title}>Welcome to Real-Time Chat</h1>
            <div style={{ marginBottom: "24px" }}>
                <label className={styles.label}>
                    Enter your username:
                    <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
                        className={styles.input}
                        placeholder="Your username..."
                    />
                </label>
            </div>
            <div style={{ marginBottom: "24px" }}>
                <label className={styles.label}>
                    Enter session ID (or leave blank to create a new session):
                    <input
                        type="text"
                        value={sessionIdInput}
                        onChange={(e) => setSessionIdInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
                        className={styles.input}
                        placeholder="Session ID..."
                    />
                </label>
            </div>
            <button onClick={handleJoinSession} className={styles.button} disabled={isLoading}>
              {isLoading ? "Joining..." : "Join Chat"}
            </button>
            {error && <p className={styles.error}>{error}</p>}
            {isLoading && <p className={styles.loading}>Connecting to the backend...</p>}
            </div>
        </div>
    );
  }

  return (
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.cardWide}`}>
          <h1 className={styles.title}>Real-Time Chat</h1>
          <p className={styles.info}><strong>Username:</strong> {username}</p>
          <div className={styles.sessionId}>
            <strong>Session ID:</strong> {sessionId}
            <span>(Share this with friends to join!)</span>
            <button
                onClick={() => navigator.clipboard.writeText(sessionId || "")}
                className={styles.copyButton}
            >
                Copy Session ID
            </button>
          </div>
          <div className={styles.messageArea} ref={messageAreaRef}>
              {messages.map((msg, i) => (
                  <p key={i} className={msg.user === username ? styles.messageCurrentUser : styles.messageOtherUser}>
                      <span className={styles.timestamp}>
                          [{format(parseISO(msg.timestamp), "HH:mm:ss")}]
                      </span>
                      <span className={styles.username}>{msg.user}:</span> {msg.text}
                  </p>
              ))}
          </div>
          <div className={styles.inputWrapper}>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className={styles.messageInput}
                placeholder="Type your message..."
            />
            <button onClick={sendMessage} className={styles.sendButton}>
                Send
            </button>
          </div>
          <button onClick={handleLeaveSession} className={styles.leaveButton}>
              Leave Session
          </button>
          </div>
      </div>
  );
}

export default App;
