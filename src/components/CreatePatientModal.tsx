import React, { useState } from 'react';

interface PatientData {
  firstName: string;
  lastName: string;
  age: number | '';
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  allergies: string;
  existingConditions: string;
}

export default function CreatePatientModel() {
  const [patient, setPatient] = useState<PatientData>({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    existingConditions: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPatient({ ...patient, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient.firstName || !patient.lastName || !patient.age || !patient.gender) {
      setMessage('Please fill all required fields.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      // Map frontend fields to backend Pydantic model
      const payload = {
        first_name: patient.firstName,
        last_name: patient.lastName,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone || null,
        email: patient.email || null,
        address: patient.address || null,
        blood_group: patient.bloodGroup || null,
        allergies: patient.allergies || null,
        existing_conditions: patient.existingConditions || null,
      };

      const res = await fetch('https://agentic-ai-backend-bzagh0fzfdc5g4ae.canadacentral-01.azurewebsites.net/patients/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        let errMsg = 'Failed to create patient';

        if (Array.isArray(errData.detail)) {
          // Validation errors from Pydantic
          errMsg = errData.detail.map((d: any) => `${d.loc.join(' → ')}: ${d.msg}`).join(', ');
        } else if (typeof errData.detail === 'string') {
          // Simple string message
          errMsg = errData.detail;
        } else if (errData.message) {
          errMsg = errData.message;
        }

        throw new Error(errMsg);
      }


      const result = await res.json();
      setMessage('✅ Patient record created successfully!');
      console.log('Created patient:', result);

      // Reset form
      setPatient({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        bloodGroup: '',
        allergies: '',
        existingConditions: '',
      });
    } catch (error: any) {
      console.error('Error creating patient:', error);
      setMessage('Error saving record: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="health-form-card">
      <h2>Create New Patient Record</h2>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="health-form">
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={patient.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
            />
          </div>
          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={patient.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Age *</label>
            <input
              type="number"
              name="age"
              value={patient.age}
              onChange={handleChange}
              placeholder="e.g. 45"
            />
          </div>
          <div className="form-group">
            <label>Gender *</label>
            <select name="gender" value={patient.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={patient.phone}
              onChange={handleChange}
              placeholder="e.g. +254712345678"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={patient.email}
              onChange={handleChange}
              placeholder="e.g. example@mail.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Blood Group</label>
            <input
              type="text"
              name="bloodGroup"
              value={patient.bloodGroup}
              onChange={handleChange}
              placeholder="e.g. O+"
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={patient.address}
              onChange={handleChange}
              placeholder="Home or hospital address"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Allergies</label>
          <textarea
            name="allergies"
            value={patient.allergies}
            onChange={handleChange}
            placeholder="Known allergies if any"
          />
        </div>

        <div className="form-group">
          <label>Existing Medical Conditions</label>
          <textarea
            name="existingConditions"
            value={patient.existingConditions}
            onChange={handleChange}
            placeholder="e.g. Diabetes, Hypertension..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              setPatient({
                firstName: '',
                lastName: '',
                age: '',
                gender: '',
                phone: '',
                email: '',
                address: '',
                bloodGroup: '',
                allergies: '',
                existingConditions: '',
              })
            }
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
