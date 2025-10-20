import React, { useState } from "react";

interface CareMember {
  id: number;
  name: string;
  role: string;
  contact: string;
  notes?: string;
}

interface CareCircleModalProps {
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}

const CareCircleModal: React.FC<CareCircleModalProps> = ({
  patientName,
  isOpen,
  onClose,
}) => {
  const [members, setMembers] = useState<CareMember[]>([
    { id: 1, name: "Dr. Jane Mwangi", role: "Primary Doctor", contact: "0722123456" },
    { id: 2, name: "Nurse Peter Otieno", role: "Assigned Nurse", contact: "0712345678" },
    { id: 3, name: "Mary Njeri", role: "Family Member", contact: "0700567890" },
  ]);

  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    contact: "",
  });

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.role.trim()) return;
    const id = members.length + 1;
    setMembers([...members, { id, ...newMember }]);
    setNewMember({ name: "", role: "", contact: "" });
  };

  const handleRemove = (id: number) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            🩺 Care Circle — {patientName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Members List */}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Current Members</h3>
          {members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center border rounded-lg p-3 shadow-sm hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-semibold text-gray-800">{member.name}</p>
                <p className="text-sm text-gray-600">{member.role}</p>
                <p className="text-sm text-blue-600">{member.contact}</p>
                {member.notes && (
                  <p className="text-xs text-gray-500 mt-1">{member.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleRemove(member.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add New Member */}
        <div className="p-4 border-t">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Add Member</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Full Name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="border rounded-lg p-2 flex-1"
            />
            <input
              type="text"
              placeholder="Role"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className="border rounded-lg p-2 flex-1"
            />
            <input
              type="text"
              placeholder="Contact (optional)"
              value={newMember.contact}
              onChange={(e) =>
                setNewMember({ ...newMember, contact: e.target.value })
              }
              className="border rounded-lg p-2 flex-1"
            />
            <button
              onClick={handleAddMember}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Future: AI Assistant Section */}
        <div className="p-4 border-t bg-gray-50">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            🤖 AI Assistant (coming soon)
          </h3>
          <p className="text-sm text-gray-600">
            The assistant will help summarize roles, coordinate communication, and
            analyze care patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareCircleModal;
