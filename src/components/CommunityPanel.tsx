import { useState } from "react";
import { Users, Plus, Trash2, Bell, BellOff } from "lucide-react";

interface CareCircle {
  id: number;
  hadm_id: number;
  contact_name: string;
  contact_relationship: string;
  contact_email?: string;
  contact_phone?: string;
  notify_on_critical: boolean;
  created_at: string;
}

export default function CommunityPanel() {
  const [hadmIdInput, setHadmIdInput] = useState<number | "">("");
  const [contacts, setContacts] = useState<CareCircle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    contact_relationship: "",
    notify_on_critical: true,
  });

  const API_URL = "https://agentic-ai-backend-bzagh0fzfdc5g4ae.canadacentral-01.azurewebsites.net/care_circle";

  // Search contacts by hadmId
  async function searchContacts(e: React.FormEvent) {
    e.preventDefault();
    if (!hadmIdInput) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${hadmIdInput}`);
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Error loading contacts:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }

  // Add new contact
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hadmIdInput) return alert("Enter a valid HADM ID first");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hadm_id: hadmIdInput, ...formData }),
      });
      if (!res.ok) throw new Error("Failed to add contact");

      // Clear form and reload contacts
      setFormData({
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        contact_relationship: "",
        notify_on_critical: true,
      });
      setShowForm(false);
      searchContacts(new Event("submit") as any);
    } catch (err) {
      console.error("Error adding contact:", err);
    }
  }

  // Delete contact
  async function handleDelete(id: number) {
    if (!confirm("Remove this contact from your care circle?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete contact");
      searchContacts(new Event("submit") as any);
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  }

  // Toggle notifications
  async function toggleNotifications(contact: CareCircle) {
    try {
      const res = await fetch(`${API_URL}/toggle/${contact.id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle notifications");
      searchContacts(new Event("submit") as any);
    } catch (err) {
      console.error("Error updating notifications:", err);
    }
  }

  return (
    <div className="community-panel p-4">
      <div className="panel-header mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="panel-title flex items-center gap-2">
          <Users size={24} />
          <div>
            <h2 className="text-lg font-semibold">Care Circle</h2>
            <p>Search patient contacts by HADM ID</p>
          </div>
        </div>

        {/* Search HADM ID */}
        {/* Search HADM ID */}
        <form
          onSubmit={searchContacts}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px", // space between input and button
            width: "100%",
            maxWidth: "500px",
            marginBottom: "20px",
          }}
        >
          <input
            type="number"
            placeholder="Enter HADM ID"
            value={hadmIdInput}
            onChange={(e) => setHadmIdInput(Number(e.target.value))}
            required
            style={{
              flex: 1,
              padding: "12px 16px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              borderRadius: "8px",
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>


        {/* Toggle Add Contact Form */}
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="contact-form border p-4 rounded mb-4">
          <div className="form-row flex gap-2 mb-2">
            <div className="form-group flex-1">
              <label htmlFor="contact_name">Name *</label>
              <input
                id="contact_name"
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                required
                className="border p-1 rounded w-full"
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="contact_relationship">Relationship *</label>
              <input
                id="contact_relationship"
                type="text"
                value={formData.contact_relationship}
                onChange={(e) => setFormData({ ...formData, contact_relationship: e.target.value })}
                placeholder="e.g., Spouse, Parent, Friend"
                required
                className="border p-1 rounded w-full"
              />
            </div>
          </div>

          <div className="form-row flex gap-2 mb-2">
            <div className="form-group flex-1">
              <label htmlFor="contact_email">Email</label>
              <input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="border p-1 rounded w-full"
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="contact_phone">Phone</label>
              <input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="border p-1 rounded w-full"
              />
            </div>
          </div>

          <div className="form-group mb-2">
            <label className="checkbox-label flex items-center gap-1">
              <input
                type="checkbox"
                checked={formData.notify_on_critical}
                onChange={(e) => setFormData({ ...formData, notify_on_critical: e.target.checked })}
              />
              <span>Send alerts for critical health events</span>
            </label>
          </div>

          <div className="form-actions flex gap-2">
            <button type="submit" className="btn btn-primary">
              Add Contact
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="contacts-list">
        {loading ? (
          <div className="loading-spinner">Loading contacts...</div>
        ) : contacts.length > 0 ? (
          contacts.map((contact) => (
            <div key={contact.id} className="contact-card border p-2 rounded mb-2 flex justify-between items-center">
              <div className="contact-info">
                <h3 className="font-semibold">{contact.contact_name}</h3>
                <p className="contact-relationship">{contact.contact_relationship}</p>
                {contact.contact_email && <p className="contact-detail">{contact.contact_email}</p>}
                {contact.contact_phone && <p className="contact-detail">{contact.contact_phone}</p>}
              </div>
              <div className="contact-actions flex gap-1">
                <button
                  className="btn btn-icon"
                  onClick={() => toggleNotifications(contact)}
                  title={contact.notify_on_critical ? "Notifications enabled" : "Notifications disabled"}
                >
                  {contact.notify_on_critical ? <Bell size={20} /> : <BellOff size={20} />}
                </button>
                <button
                  className="btn btn-icon btn-danger"
                  onClick={() => handleDelete(contact.id)}
                  title="Remove contact"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}
