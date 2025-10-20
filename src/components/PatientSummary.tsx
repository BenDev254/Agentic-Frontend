import React, { useState } from "react";

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  bloodGroup: string;
}

interface VisitRecord {
  id: number;
  date: string;
  reason: string;
  diagnosis: string;
  notes: string;
}

interface Message {
  sender: "user" | "assistant";
  text: string;
}

const PatientSummary: React.FC = () => {
  // --- Dummy patient data ---
  const [patients] = useState<Patient[]>([
    { id: 1, name: "John Mwangi", age: 34, gender: "Male", phone: "0712345678", bloodGroup: "B+" },
    { id: 2, name: "Mary Wambui", age: 29, gender: "Female", phone: "0798765432", bloodGroup: "O-" },
  ]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // --- Dummy visit data ---
  const [visits] = useState<VisitRecord[]>([
    {
      id: 1,
      date: "2025-10-10",
      reason: "Fever and headache",
      diagnosis: "Malaria",
      notes: "Prescribed anti-malarials. Monitor temperature and hydration.",
    },
    {
      id: 2,
      date: "2025-09-20",
      reason: "Routine checkup",
      diagnosis: "Normal",
      notes: "Advised on diet and exercise routine.",
    },
  ]);

  // --- AI Assistant ---
  const [messages, setMessages] = useState<Message[]>([
    { sender: "assistant", text: "Hi 👋, I can help you analyze patient data or summarize records." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const handleSelectPatient = (id: number) => {
    const patient = patients.find((p) => p.id === id) || null;
    setSelectedPatient(patient);
  };

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
        { sender: "assistant", text: "⚠️ Something went wrong, please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fakeLLMResponse = async (query: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (query.toLowerCase().includes("summary")) {
          resolve("This patient’s recent records indicate good recovery and no critical alerts.");
        } else {
          resolve("I'm your medical assistant. I can summarize, analyze, or retrieve patient information.");
        }
      }, 1000);
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Left - Patient Data */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">🧾 Patient Summary</h2>

        {/* Patient Selector */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Select Patient</label>
          <select
            className="border p-2 rounded-lg w-full"
            onChange={(e) => handleSelectPatient(Number(e.target.value))}
            defaultValue=""
          >
            <option value="">-- Choose Patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Patient Details */}
        {selectedPatient ? (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              {selectedPatient.name}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-gray-700">
              <div>Age: {selectedPatient.age}</div>
              <div>Gender: {selectedPatient.gender}</div>
              <div>Phone: {selectedPatient.phone}</div>
              <div>Blood Group: {selectedPatient.bloodGroup}</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mb-6">Select a patient to view their summary.</p>
        )}

        {/* Visit History */}
        {selectedPatient && (
          <div>
            <h4 className="text-lg font-semibold mb-3 text-blue-700">Recent Visits</h4>
            <div className="space-y-3">
              {visits.map((v) => (
                <div key={v.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="font-semibold text-blue-700">
                    {v.date} — {v.reason}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">Diagnosis:</span> {v.diagnosis}
                  </div>
                  <div className="text-gray-700 mt-1">
                    <span className="font-medium">Notes:</span> {v.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right - AI Chat */}
      <div
        className={`w-full md:w-96 border-l bg-white flex flex-col transition-transform duration-300 ${
          showChat ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center bg-blue-700 text-white p-3">
          <h3 className="font-semibold">🤖 Patient Assistant</h3>
          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-blue-600 px-3 py-1 rounded-md text-sm"
          >
            {showChat ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 rounded-2xl max-w-xs ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="p-2 bg-gray-200 text-gray-700 rounded-xl w-fit">
              Thinking...
            </div>
          )}
        </div>

        <div className="p-3 border-t flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask about the patient..."
            className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSummary;
