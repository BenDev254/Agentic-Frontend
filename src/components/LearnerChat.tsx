import { useState, useEffect, useRef } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

// Define message type
interface Message {
  sender: "user" | "assistant";
  text: string;
}

// Replace these with your agent details and AWS credentials
const AWS_REGION = const awsSecret = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_ACCESS_KEY_ID = const awsSecret = process.env.AWS_ACCESS_KEY_ID || "";

const AWS_SECRET_ACCESS_KEY = const awsSecret = process.env.AWS_SECRET_ACCESS_KEY || "";

const AGENT_ID = const awsSecret = process.env.AGENT_ID || "";
const AGENT_ALIAS_ID = const awsSecret = process.env.AGENT_ALIAS_ID || "";

export default function LearnerChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      text: "👋 Hi there! I’m your Learner Assistant. Ask me to train, infer, create quizzes, or suggest a learning calendar.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const client = new BedrockAgentRuntimeClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Determine action based on user input
      const inputLower = input.toLowerCase();
      let action = "unknown";
      if (inputLower.includes("train")) action = "train_learner";
      else if (inputLower.includes("infer") || inputLower.includes("predict"))
        action = "infer_global_model";
      else if (inputLower.includes("quiz")) action = "create_quiz";
      else if (inputLower.includes("calendar") || inputLower.includes("schedule"))
        action = "suggest_calendar";

      const command = new InvokeAgentCommand({
        agentId: AGENT_ID,
        agentAliasId: AGENT_ALIAS_ID,
        sessionId: "frontend-session",
        inputText: input.trim(),
        // Optional: metadata or parameters
        // parameters: [{ name: "action", value: action }]
      });

      const response = await client.send(command);

      const assistantText =
        response?.outputText ||
        "⚠️ Learner Agent responded but returned no text.";

      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: assistantText },
      ]);
    } catch (err: any) {
      console.error("Agent call failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "⚠️ Sorry, the Learner Agent failed to respond. Try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant-container">
      <div className="assistant-header">
        <Bot size={24} />
        <div>
          <h2>Learner Assistant</h2>
          <p>Your smart study companion 🎓</p>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender === "user" ? "message-user" : "message-assistant"
            }`}
          >
            <div className="message-icon">
              {msg.sender === "user" ? <UserIcon size={20} /> : <Bot size={20} />}
            </div>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-icon">
              <Bot size={20} />
            </div>
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="assistant-input-form">
        <input
          type="text"
          placeholder="Ask me to train, infer, create a quiz, or suggest a calendar..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={!input.trim() || loading} className="btn btn-icon">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
