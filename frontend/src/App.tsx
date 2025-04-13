import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { format } from "date-fns/format";
import { parseISO } from "date-fns/parseISO";

function App() {
  const [messages, setMessages] = useState<{ user: string; text: string; timestamp: string }[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isUsernameSet && socket) {
      socket.on("messageHistory", (history: { user: string; text: string; timestamp: string }[]) => {
        setMessages(history);
      });

      socket.on("message", (data: { user: string; text: string; timestamp: string }) => {
        setMessages((prev) => [...prev, data]);
      });
    }

    return () => {
      if (socket) {
        socket.off("messageHistory");
        socket.off("message");
        
        if (!isUsernameSet) {
          socket.disconnect();
        }
      }
    };
  }, [isUsernameSet, socket]);

  const handleSetUsername = () => {
    const user = usernameInput.trim() || "Anonymous";
    setUsername(user);
    setIsUsernameSet(true);

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    newSocket.emit("setUsername", user);
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
              onKeyDown={(e) => e.key === "Enter" && handleSetUsername()}
              style={{ marginLeft: "10px", padding: "5px" }}
              placeholder="Your username..."
            />
          </label>
          <button
            onClick={handleSetUsername}
            style={{ marginLeft: "10px", padding: "5px 10px" }}
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Real-Time Chat</h1>
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
    </div>
  );
}

export default App;
