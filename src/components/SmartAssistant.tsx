import { useState, useEffect, useRef } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function ProviderAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 🔹 Send message to your Amazon Bedrock Agent
      const response = await fetch("https://bedrock-agent-runtime.us-east-1.amazonaws.com/agents/TLNTMJJLCH/aliases/HWKI11FXXR/invoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include authorization header if required
          // "Authorization": `Bearer ${your_token}`
        },
        body: JSON.stringify({
          agentId: "TLNTMJJLCH",
          aliasId: "HWKI11FXXR",
          sessionId: "frontend-session",
          inputText: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent error: ${response.statusText}`);
      }

      const data = await response.json();
      // Depending on Bedrock’s response shape, adapt this:
      const aiText =
        data?.completion || data?.response?.outputText || "I’m sorry, I didn’t get that.";

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiText,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Agent invocation failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "⚠️ I ran into a technical issue contacting the AI agent.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="assistant-container">
      <div className="assistant-header">
        <Bot size={24} />
        <div>
          <h1>Provider Assistant</h1>
          <p>Your AI-powered hospital operations guide.</p>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <Bot size={48} />
            <p>Hello 👋, I’m your AI Provider Assistant.</p>
            <p className="hint">Ask about patients, appointments, or training workflows.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`message ${m.role === "user" ? "message-user" : "message-assistant"}`}
            >
              <div className="message-icon">
                {m.role === "user" ? <UserIcon size={20} /> : <Bot size={20} />}
              </div>
              <div className="message-content">{m.content}</div>
            </div>
          ))
        )}

        {loading && (
          <div className="message message-assistant">
            <div className="message-icon">
              <Bot size={20} />
            </div>
            <div className="message-content typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="assistant-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the assistant..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn btn-icon">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
