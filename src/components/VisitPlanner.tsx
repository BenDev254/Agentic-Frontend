import React, { useState, useEffect } from "react";

interface Visit {
  id: number;
  patientName: string;
  date: string;
  time: string;
  location: string;
  reason: string;
  notes: string;
}

interface Message {
  sender: "user" | "assistant";
  text: string;
}

export default function VisitPlanner() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [form, setForm] = useState<Visit>({
    id: 0,
    patientName: "",
    date: "",
    time: "",
    location: "",
    reason: "",
    notes: "",
  });

  const [messages, setMessages] = useState<Message[]>([
    { sender: "assistant", text: "👋 Hello! I can help you plan or review patient visits." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = "https://agentic-ai-backend-bzagh0fzfdc5g4ae.canadacentral-01.azurewebsites.net/"; // FastAPI backend

  // Load visits from backend on mount
  useEffect(() => {
    fetchVisits();
  }, []);

  async function fetchVisits() {
    try {
      const res = await fetch(`${API_URL}/visits`);
      const data = await res.json();
      // Map backend keys to frontend keys
      const mapped = data.map((v: any) => ({
        id: v.id,
        patientName: v.patient_name,
        date: v.date,
        time: v.time,
        location: v.location || "",
        reason: v.reason || "",
        notes: v.notes || "",
      }));
      setVisits(mapped);
    } catch (err) {
      console.error("Error loading visits:", err);
    }
  }

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!form.patientName || !form.date || !form.time) {
      setMessage("⚠️ Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        patient_name: form.patientName,
        date: form.date,
        time: form.time,
        location: form.location,
        reason: form.reason,
        notes: form.notes,
      };
      const res = await fetch(`${API_URL}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add visit");

      const newVisit = await res.json();
      setVisits([
        {
          id: newVisit.id,
          patientName: newVisit.patient_name,
          date: newVisit.date,
          time: newVisit.time,
          location: newVisit.location || "",
          reason: newVisit.reason || "",
          notes: newVisit.notes || "",
        },
        ...visits,
      ]);

      setForm({
        id: 0,
        patientName: "",
        date: "",
        time: "",
        location: "",
        reason: "",
        notes: "",
      });
      setMessage("✅ Visit added successfully!");
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error adding visit.");
    }
  };

  // Fake AI
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = { sender: "user" as const, text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setLoading(true);

    try {
      const response = await fakeLLMResponse(chatInput);
      setMessages((prev) => [...prev, { sender: "assistant", text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "⚠️ Sorry, I couldn’t process that request." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fakeLLMResponse = async (query: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (query.toLowerCase().includes("suggest")) {
          resolve(
            "Based on recent visits, you might want to schedule follow-up appointments next week."
          );
        } else if (query.toLowerCase().includes("notes")) {
          resolve(
            "You can summarize patient notes by focusing on symptoms, diagnosis, and follow-up."
          );
        } else {
          resolve("I’m your AI Visit Assistant. Ask me to analyze visits or help schedule new ones.");
        }
      }, 1000);
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Left section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="health-form-card">
          <h2>🗓️ Plan a Patient Visit</h2>

          {message && (
            <div className={`alert ${message.includes("⚠️") ? "alert-error" : "alert-success"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="health-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="patientName">Patient Name *</label>
                <input
                  id="patientName"
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="time">Time *</label>
                <input
                  id="time"
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location / Ward</label>
                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Ward or room number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Visit</label>
              <input
                id="reason"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Consultation, Check-up, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any prior notes or remarks"
                rows={4}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Add Visit
            </button>
          </form>
        </div>


        {/* Visit list */}
        {/* Visit list */}
        <div className="health-form-card mt-6">
          <h2>Planned Visits</h2>
          {visits.length === 0 ? (
            <p className="text-gray-500">No visits planned yet.</p>
          ) : (
            <ul className="space-y-3">
              {visits.map((v) => (
                <li key={v.id} className="border p-3 rounded-lg bg-white shadow-sm">
                  {/* Main metrics in one line */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700 font-medium">
                    <div><span className="text-gray-900">Name:</span> {v.patientName}</div>
                    <div><span className="text-gray-900">Date:</span> {v.date}</div>
                    <div><span className="text-gray-900">Time:</span> {v.time}</div>
                    <div><span className="text-gray-900">Location:</span> {v.location || "-"}</div>
                    <div><span className="text-gray-900">Reason:</span> {v.reason || "-"}</div>
                  </div>

                  {/* Notes below, full width */}
                  {v.notes && (
                    <div className="mt-2 text-gray-600 text-sm">
                      <span className="font-medium text-gray-900">Notes:</span> {v.notes}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>


      </div>
    </div>
  );
}
