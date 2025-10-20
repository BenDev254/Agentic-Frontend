import { useState, useEffect, useRef } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

interface Message {
  sender: "user" | "assistant";
  text: string;
}

// ✅ Initialize Bedrock client
const client = new BedrockAgentRuntimeClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Generate a unique session ID for this browser session
const sessionId = `frontend-session-${Math.random().toString(36).substring(2, 10)}`;

export default function ProviderAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      text: "👋 Hello! I'm your Provider Assistant connected to Amazon Bedrock. How can I help you today?",
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
      // ✅ Build the Bedrock Agent command
      const cmd = new InvokeAgentCommand({
        agentId: import.meta.env.VITE_AGENT_ID,
        agentAliasId: import.meta.env.VITE_AGENT_ALIAS_ID,
        sessionId,
        inputText: userText,
      });

      const response = await client.send(cmd);
      console.log("🧠 Bedrock raw response:", response);

      let assistantReply = "";

      // Handle streaming text output from Bedrock Agent
      if (response.completion && typeof response.completion.onMessage === "function") {
        // Newer SDK pattern
        for await (const event of response.completion) {
          if (event.contentBlockDelta?.delta?.text) {
            assistantReply += event.contentBlockDelta.delta.text;
          }
        }
      } else if (response.completion && typeof response.completion[Symbol.asyncIterator] === "function") {
        // Fallback for SmithyMessageDecoderStream
        for await (const chunk of response.completion) {
          if (chunk?.chunk?.bytes) {
            const text = new TextDecoder().decode(chunk.chunk.bytes);
            assistantReply += text;
          }
        }
      } else if (response.outputText) {
        assistantReply = response.outputText;
      } else {
        assistantReply = "⚠️ No readable text received from Bedrock.";
      }

      console.log("💬 Parsed Bedrock reply:", assistantReply);

      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: assistantReply || "⚠️ Empty response." },
      ]);

    } catch (err: any) {
      console.error("❌ Error invoking Bedrock Agent:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text:
            "⚠️ Something went wrong while connecting to Bedrock Agent. Please check the console or verify your alias and region.",
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
        <Bot size={24} />
        <div>
          <h2>Provider Assistant</h2>
          <p>Amazon Bedrock–powered hospital operations assistant 🏥</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === "user"
              ? "message-user"
              : "message-assistant"
              }`}
          >
            <div className="message-icon">
              {message.sender === "user" ? (
                <UserIcon size={20} />
              ) : (
                <Bot size={20} />
              )}
            </div>
            <div className="message-content">{message.text}</div>
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

      {/* Input */}
      <form onSubmit={handleSend} className="assistant-input-form">
        <input
          type="text"
          placeholder="Ask anything about hospital operations..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn btn-icon"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
