import { useState, useEffect, useRef } from "react";
import { ClipboardList, Send, User as UserIcon, PlusCircle, Loader2 } from "lucide-react";

interface PlanItem {
  date: string;
  time: string;
  subject: string;
  duration: number; // in hours
  endingTime: string;
}

export default function StudyPlanBuilder() {
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "📚 Welcome to Study Plan Builder! Let's create your personalized learning schedule.",
    },
    {
      sender: "assistant",
      text: "What topic would you like to study first?",
    },
  ]);

  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"topic" | "duration">("topic");
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // simulate loading plan from DB
    setTimeout(() => {
      const dummyPlan: PlanItem[] = [
        { date: "2025-10-15", time: "08:00", subject: "Mathematics - Algebra Review", duration: 2, endingTime: "10:00" },
        { date: "2025-10-15", time: "10:30", subject: "Biology - Cell Structure", duration: 1.5, endingTime: "12:00" },
        { date: "2025-10-15", time: "13:00", subject: "Chemistry - Organic Basics", duration: 2, endingTime: "15:00" },
      ];
      setPlan(dummyPlan);
      setLoadingPlan(false);
    }, 1200);
  }, []);

  // Scroll to bottom after 5 seconds whenever messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 5000);

    return () => clearTimeout(timer); // cleanup if messages change before 5s
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;

    const inputText = stage === "topic" ? topic.trim() : duration.trim();
    if (!inputText) return;

    const userMsg = { sender: "user", text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 700));

    if (stage === "topic") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: `Great choice! How many hours do you want to dedicate to "${inputText}"?`,
        },
      ]);
      setStage("duration");
    } else {
      const startTime = "16:00"; // example
      const endHour = Number(startTime.split(":")[0]) + Number(duration);
      const endingTime = `${endHour.toString().padStart(2, "0")}:${startTime.split(":")[1]}`;

      const newItem: PlanItem = {
        date: new Date().toISOString().split("T")[0],
        time: startTime,
        subject: topic,
        duration: Number(duration),
        endingTime,
      };
      setPlan((prev) => [...prev, newItem]);

      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: `✅ Added "${topic}" for ${duration} hours to your plan! Would you like to add another topic?`,
        },
      ]);

      setTimeout(() => {
        setTopic("");
        setDuration("");
        setStage("topic");
      }, 200);
    }

    setLoading(false);
  };

  const handleAddAnother = () => {
    setMessages((prev) => [
      ...prev,
      { sender: "assistant", text: "Okay! What’s the next topic?" },
    ]);
    setStage("topic");
  };

  return (
    <div className="assistant-container">
      {/* Header */}
      <div className="assistant-header">
        <ClipboardList size={24} />
        <div>
          <h2>Study Plan Builder</h2>
          <p>Design your personalized study roadmap ✨</p>
        </div>
      </div>

      {/* Chat Section */}
      <div className="messages-container">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.sender === "user" ? "message-user" : "message-assistant"}`}
          >
            <div className="message-icon">
              {msg.sender === "user" ? <UserIcon size={20} /> : <ClipboardList size={20} />}
            </div>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-icon">
              <ClipboardList size={20} />
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

      {/* Input Field */}
      <form onSubmit={handleSend} className="assistant-input-form">
        <input
          type={stage === "duration" ? "number" : "text"}
          placeholder={stage === "topic" ? "Enter a topic to study..." : "Enter duration (hours)..."}
          value={stage === "topic" ? topic : duration}
          onChange={(e) => (stage === "topic" ? setTopic(e.target.value) : setDuration(e.target.value))}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-icon bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>



    </div>
  );
}
