import { useState, useEffect, useRef } from "react";
import { Brain, Send, User as UserIcon } from "lucide-react";
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

interface Message {
  sender: "user" | "assistant";
  text: string;
}

// ✅ AWS Credentials and Agent Info (hard-coded here for multi-agent scenario)
const AWS_REGION = const awsSecret = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_ACCESS_KEY_ID = const awsSecret = process.env.AWS_ACCESS_KEY_ID || "";

const AWS_SECRET_ACCESS_KEY = const awsSecret = process.env.AWS_SECRET_ACCESS_KEY || "";

const AGENT_ID = const awsSecret = process.env.AGENT_ID || "";
const AGENT_ALIAS_ID = const awsSecret = process.env.AGENT_ALIAS_ID || "";

// ✅ Initialize Bedrock client
const client = new BedrockAgentRuntimeClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Unique session ID per browser session
const sessionId = `learner-session-${Math.random().toString(36).substring(2, 10)}`;

export default function LearnerQuiz() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      text: "🧠 Welcome to Quick Quiz! I’m your Learner Assistant. Ask me a question or submit an answer.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const cmd = new InvokeAgentCommand({
        agentId: AGENT_ID,
        agentAliasId: AGENT_ALIAS_ID,
        sessionId,
        inputText: userText,
      });

      const response = await client.send(cmd);
      console.log("🧠 Bedrock raw response:", response);

      let assistantReply = "";

      // Handle streaming text output from Bedrock Agent
      if (response.outputText) {
        assistantReply = response.outputText;
      } else {
        assistantReply = "⚠️ Learner Agent responded but returned no text.";
      }

      setMessages((prev) => [...prev, { sender: "assistant", text: assistantReply }]);
    } catch (err: any) {
      console.error("❌ Error invoking Learner Agent:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "⚠️ Could not reach the Learner Agent. Try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant-container">
      {/* Header */}
      <div className="assistant-header">
        <Brain size={24} />
        <div>
          <h2>Quick Quiz</h2>
          <p>Learn interactively — one question at a time 🎯</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === "user" ? "message-user" : "message-assistant"}`}
          >
            <div className="message-icon">
              {msg.sender === "user" ? <UserIcon size={20} /> : <Brain size={20} />}
            </div>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-icon">
              <Brain size={20} />
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

      {/* Input Form */}
      <form onSubmit={handleSend} className="assistant-input-form">
        <input
          type="text"
          placeholder="Type your answer or ask for a new quiz..."
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
