import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const hasSetUsername = useRef(false);

  useEffect(() => {
    if (!isUsernameSet && !hasSetUsername.current) {
      const user = prompt("Enter your username:") || "Anonymous";
      setUsername(user);
      setIsUsernameSet(true);
      socket.emit("setUsername", user);
      hasSetUsername.current = true;
    }

    socket.on("messageHistory", (history: { user: string; text: string }[]) => {
      setMessages(history);
    });

    socket.on("message", (data: { user: string; text: string }) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("messageHistory");
      socket.off("message");
    };
  }, [isUsernameSet]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("message", { user: username, text: input });
      setInput("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Real-Time Chat</h1>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll" }}>
        {messages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.user}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        style={{ marginTop: "10px", width: "300px" }}
      />
      <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
        Send
      </button>
    </div>
  );
}

export default App;
